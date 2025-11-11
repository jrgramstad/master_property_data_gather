/**
 * Property Master Data Import Tool
 * ClickUp to Supabase Migration
 */

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);

// Global state
let parsedCSV = null;
let importResults = {
  total: 0,
  successful: 0,
  created: 0,
  updated: 0,
  errors: 0,
  createdProperties: [],
  errorDetails: [],
  statusBreakdown: {
    complete: 0,
    needsEnhancement: 0,
    sparse: 0
  },
  detailedLog: []
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
});

function initializeEventListeners() {
  const csvFileInput = document.getElementById('csvFile');
  const importBtn = document.getElementById('importBtn');
  const downloadLogBtn = document.getElementById('downloadLogBtn');
  const resetBtn = document.getElementById('resetBtn');
  const uploadArea = document.getElementById('uploadArea');

  // File upload
  csvFileInput.addEventListener('change', handleFileSelect);

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      csvFileInput.files = files;
      handleFileSelect({ target: csvFileInput });
    }
  });

  // Import button
  importBtn.addEventListener('click', handleImport);

  // Download log
  downloadLogBtn.addEventListener('click', downloadLog);

  // Reset
  resetBtn.addEventListener('click', resetTool);
}

// ============================================================================
// FILE HANDLING
// ============================================================================

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.name.endsWith('.csv')) {
    alert('Please upload a CSV file');
    return;
  }

  // Show file info
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  document.getElementById('fileInfo').style.display = 'block';

  // Parse CSV
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      parsedCSV = results;
      document.getElementById('rowCount').textContent = results.data.length;
      document.getElementById('importBtn').disabled = false;
      console.log('CSV parsed successfully:', results.data.length, 'rows');
    },
    error: (error) => {
      alert('Error parsing CSV: ' + error.message);
      console.error('CSV parse error:', error);
    }
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================================================
// IMPORT PROCESS
// ============================================================================

async function handleImport() {
  if (!parsedCSV || parsedCSV.data.length === 0) {
    alert('No data to import');
    return;
  }

  // Reset results
  resetResults();

  // Show progress
  document.getElementById('progressSection').style.display = 'block';
  document.getElementById('importBtn').disabled = true;

  const data = parsedCSV.data;
  importResults.total = data.length;

  // Get existing properties from database
  const existingProperties = await fetchExistingProperties();
  if (!existingProperties) {
    alert('Failed to fetch existing properties from database');
    return;
  }

  console.log(`Found ${existingProperties.length} existing properties in database`);

  // Get max sort_order for new properties
  const maxSortOrder = await fetchMaxSortOrder();
  let nextSortOrder = maxSortOrder + 1;

  // Process each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const progress = Math.round(((i + 1) / data.length) * 100);

    updateProgress(progress, `Processing ${i + 1} of ${data.length}...`);

    try {
      const created = await processProperty(row, existingProperties, nextSortOrder);
      if (created) {
        nextSortOrder++;
      }
    } catch (error) {
      console.error('Error processing row:', row, error);
      importResults.errors++;
      importResults.errorDetails.push({
        address: row['Task Name'] || 'Unknown',
        error: error.message
      });
    }

    // Small delay to prevent overwhelming the API
    if (i % 10 === 0) {
      await sleep(100);
    }
  }

  // Show results
  displayResults();
}

async function fetchExistingProperties() {
  try {
    const { data, error } = await supabaseClient
      .from('properties')
      .select('id, name, full_address');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return null;
  }
}

async function fetchMaxSortOrder() {
  try {
    const { data, error } = await supabaseClient
      .from('properties')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0].sort_order : 0;
  } catch (error) {
    console.error('Error fetching max sort_order:', error);
    return 0;
  }
}

async function processProperty(row, existingProperties, sortOrder) {
  // Extract address from "Task Name"
  const address = row['Task Name'] || '';
  if (!address.trim()) {
    importResults.errors++;
    importResults.errorDetails.push({
      address: 'Empty Task Name',
      error: 'Missing address in Task Name column'
    });
    return false;
  }

  // Try to match to existing property
  const matchedProperty = findMatchingProperty(address, existingProperties);

  // Transform CSV data to database format
  const transformedData = transformRowData(row);

  // Calculate import status based on field completeness
  const importStatus = calculateImportStatus(transformedData);
  transformedData.import_status = importStatus;
  transformedData.imported_at = new Date().toISOString();

  // Update status breakdown
  if (importStatus.includes('Complete')) {
    importResults.statusBreakdown.complete++;
  } else if (importStatus.includes('Enhancement')) {
    importResults.statusBreakdown.needsEnhancement++;
  } else {
    importResults.statusBreakdown.sparse++;
  }

  if (!matchedProperty) {
    // No match found - INSERT as new property
    try {
      // Extract property name from address
      const propertyName = extractPropertyName(address);

      // Add required fields for new property
      transformedData.name = propertyName;
      transformedData.active = true;
      transformedData.sort_order = sortOrder;

      const { error } = await supabaseClient
        .from('properties')
        .insert([transformedData]);

      if (error) throw error;

      importResults.successful++;
      importResults.created++;
      importResults.createdProperties.push(address);
      importResults.detailedLog.push({
        address,
        property_name: propertyName,
        status: 'CREATED',
        import_status: importStatus,
        fields_inserted: Object.keys(transformedData).length
      });

      console.log(`✓ Created: ${address} → ${propertyName}`);
      return true; // Indicate a new property was created
    } catch (error) {
      importResults.errors++;
      importResults.errorDetails.push({
        address,
        error: error.message
      });
      console.error(`✗ Failed to create: ${address}`, error);
      return false;
    }
  } else {
    // Match found - UPDATE existing property
    try {
      const { error } = await supabaseClient
        .from('properties')
        .update(transformedData)
        .eq('id', matchedProperty.id);

      if (error) throw error;

      importResults.successful++;
      importResults.updated++;
      importResults.detailedLog.push({
        address,
        matched_to: matchedProperty.name,
        status: 'UPDATED',
        import_status: importStatus,
        fields_updated: Object.keys(transformedData).length
      });

      console.log(`✓ Updated: ${address} → ${matchedProperty.name}`);
      return false; // No new property created
    } catch (error) {
      importResults.errors++;
      importResults.errorDetails.push({
        address,
        error: error.message
      });
      console.error(`✗ Failed to update: ${address}`, error);
      return false;
    }
  }
}

// ============================================================================
// PROPERTY MATCHING LOGIC
// ============================================================================

function findMatchingProperty(csvAddress, existingProperties) {
  const normalizedCSV = normalizeAddress(csvAddress);

  // Try exact match on name first
  let match = existingProperties.find(prop =>
    normalizeAddress(prop.name) === normalizedCSV
  );

  if (match) return match;

  // Try fuzzy match on street name
  match = existingProperties.find(prop => {
    const propNormalized = normalizeAddress(prop.name);
    return fuzzyMatch(normalizedCSV, propNormalized);
  });

  return match || null;
}

function normalizeAddress(address) {
  return address
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

function extractPropertyName(fullAddress) {
  // Extract street name from full address
  // Example: "3405 Chatham Ct, Forest Hill, TX 76140, USA" → "Chatham Ct"

  // Try to extract street name (after street number, before comma)
  const match = fullAddress.match(/^\d+\s+(.+?)(?:,|$)/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: use first part before comma
  const parts = fullAddress.split(',');
  if (parts.length > 0) {
    return parts[0].trim();
  }

  // Last resort: use full address
  return fullAddress.trim();
}

function fuzzyMatch(str1, str2) {
  // Extract street names/numbers and compare
  const extractStreetInfo = (str) => {
    const match = str.match(/(\d+)\s+(\w+)/);
    return match ? match[0] : str;
  };

  const street1 = extractStreetInfo(str1);
  const street2 = extractStreetInfo(str2);

  // Check if one contains the other
  return street1.includes(street2) || street2.includes(street1);
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function transformRowData(row) {
  const data = {};

  // Address & Location
  data.full_address = row['Task Name'] || null;
  // Note: City, State, Zip are not in ClickUp CSV - left as null

  // Physical Characteristics
  data.bedrooms = parseInteger(row['1 Bedrooms (number)']);
  data.bathrooms = parseDecimal(row['1 Bathrooms (number)']);
  data.square_footage = parseInteger(row['1 Square Footage (number)']);
  data.year_built = row['1 Year of house (short text)'] || null;
  // Stories not in CSV

  // Financial - Current Value & Equity
  data.current_value = parseCurrency(row['1 Zillow Value (currency)']);
  data.equity = parseCurrency(row['2 Equity (formula)']);

  // Financial - Acquisition
  data.purchase_price = parseCurrency(row['2 Acquisition Cost (currency)']);
  data.acquisition_method = row['2 Acquisition Method (drop down)'] || null;
  data.purchase_date = parseDate(row['2 Date Acquired (date)']);

  // Financial - Rental Income
  data.market_rent = parseCurrency(row['3 Fair Market Rent (currency)']);

  // Financial - Mortgage
  data.mortgage_payment = parseCurrency(row['4 Monthly Pmt (currency)']);
  data.mortgage_balance = parseCurrency(row['4 Mortgage (currency)']);
  data.interest_rate = parseDecimal(row['4 Interest Rate for Loan (number)']);
  data.mortgage_lender = row['Refi Bank (drop down)'] || null;
  data.loan_number = row['TTCU # (number)'] || null;

  // Occupancy Status
  data.occupancy_status = transformStatus(row['Status']);

  // Management
  data.property_manager = row['Department In Charge (drop down)'] || null;

  // Property Features
  data.foundation_type = row['Foundation Type (drop down)'] || null;
  data.garage_spaces = row['Garage Spaces (drop down)'] || null;
  data.gas_service = row['Gas At Property? (drop down)'] || null;
  data.water_service = row['Water Type (drop down)'] || null;
  data.stove_type = row['Stove Type (drop down)'] || null;

  // Boolean Features (checkboxes)
  data.has_deck_porch = parseBoolean(row['Deck/Porch (checkbox)']);
  data.has_dining_room = parseBoolean(row['Dining Room (checkbox)']);
  data.has_family_room = parseBoolean(row['Family Room (checkbox)']);
  data.has_laundry_room = parseBoolean(row['Laundry Room (checkbox)']);
  data.has_living_room = parseBoolean(row['Living Room (checkbox)']);
  data.has_office = parseBoolean(row['Office / Study (checkbox)']);

  // Access
  data.lockbox_code = row['Lockbox Code (number)'] || null;

  // Metadata
  data.data_source = 'ClickUp Migration';

  return data;
}

// ============================================================================
// PARSING UTILITIES
// ============================================================================

function parseCurrency(value) {
  if (!value) return null;
  const cleaned = value.toString().replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function parseInteger(value) {
  if (!value) return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

function parseDecimal(value) {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function parseBoolean(value) {
  if (!value) return false;
  return value.toString().toLowerCase() === 'true';
}

function parseDate(value) {
  if (!value) return null;

  try {
    // Input format: "Tuesday, December 5th 2023, 8:11:40 am -06:00"
    // Extract date parts
    const match = value.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?\s+(\d{4})/);
    if (match) {
      const [, month, day, year] = match;
      const date = new Date(`${month} ${day}, ${year}`);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    }
  } catch (error) {
    console.warn('Date parse error:', value, error);
  }

  return null;
}

function transformStatus(status) {
  if (!status) return 'Unknown';

  const statusMap = {
    'occupied': 'Occupied',
    'eviction': 'Eviction in Progress',
    'new property': 'Vacant',
    'traditional rental': 'Occupied'
  };

  return statusMap[status.toLowerCase()] || status;
}

// ============================================================================
// IMPORT STATUS CALCULATION
// ============================================================================

function calculateImportStatus(data) {
  // Count non-null fields (excluding metadata)
  const excludeFields = ['import_status', 'imported_at', 'data_source', 'updated_at'];
  const filledFields = Object.entries(data)
    .filter(([key, value]) =>
      !excludeFields.includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== ''
    )
    .length;

  if (filledFields >= 25) return 'Complete';
  if (filledFields >= 15) return 'Needs Enhancement';
  return 'Sparse';
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateProgress(percent, text) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  progressFill.style.width = percent + '%';
  progressText.textContent = text;
}

function displayResults() {
  // Hide progress, show results
  document.getElementById('progressSection').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'block';

  // Update stats
  document.getElementById('statTotal').textContent = importResults.total;
  document.getElementById('statSuccess').textContent = importResults.successful;
  document.getElementById('statCreated').textContent = importResults.created;
  document.getElementById('statUpdated').textContent = importResults.updated;
  document.getElementById('statErrors').textContent = importResults.errors;

  // Status breakdown
  if (importResults.successful > 0) {
    document.getElementById('statusBreakdown').style.display = 'block';
    document.getElementById('statusComplete').textContent = importResults.statusBreakdown.complete;
    document.getElementById('statusNeedsEnhancement').textContent = importResults.statusBreakdown.needsEnhancement;
    document.getElementById('statusSparse').textContent = importResults.statusBreakdown.sparse;
  }

  // Created properties
  if (importResults.createdProperties.length > 0) {
    document.getElementById('createdSection').style.display = 'block';
    const createdList = document.getElementById('createdList');
    createdList.innerHTML = importResults.createdProperties
      .map(addr => `
        <div class="created-item">
          <strong>${escapeHtml(addr)}</strong>
          <small>New property created in database</small>
        </div>
      `)
      .join('');
  }

  // Errors
  if (importResults.errorDetails.length > 0) {
    document.getElementById('errorsSection').style.display = 'block';
    const errorsList = document.getElementById('errorsList');
    errorsList.innerHTML = importResults.errorDetails
      .map(err => `
        <div class="error-item">
          <strong>${escapeHtml(err.address)}</strong>
          <small>${escapeHtml(err.error)}</small>
        </div>
      `)
      .join('');
  }

  console.log('Import complete:', importResults);
}

function downloadLog() {
  const logData = {
    summary: {
      total: importResults.total,
      successful: importResults.successful,
      unmatched: importResults.unmatched,
      errors: importResults.errors,
      statusBreakdown: importResults.statusBreakdown
    },
    unmatchedProperties: importResults.unmatchedProperties,
    errors: importResults.errorDetails,
    detailedLog: importResults.detailedLog,
    timestamp: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `property-import-log-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetTool() {
  location.reload();
}

function resetResults() {
  importResults = {
    total: 0,
    successful: 0,
    unmatched: 0,
    errors: 0,
    unmatchedProperties: [],
    errorDetails: [],
    statusBreakdown: {
      complete: 0,
      needsEnhancement: 0,
      sparse: 0
    },
    detailedLog: []
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Log startup
console.log('Property Import Tool loaded');
console.log('Supabase URL:', config.supabase.url);
