/**
 * Property Master Data Import Tool
 * ClickUp to Supabase Migration - UPDATE ONLY
 */

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);

// Global state
let parsedCSV = null;
let importResults = {
  total: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  updatedProperties: [],
  skippedProperties: [],
  errorDetails: [],
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
      console.log('CSV columns:', results.meta.fields);
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
  updateProgress(0, 'Fetching existing properties from database...');
  const existingProperties = await fetchExistingProperties();
  if (!existingProperties) {
    alert('Failed to fetch existing properties from database');
    document.getElementById('importBtn').disabled = false;
    return;
  }

  console.log(`Found ${existingProperties.length} existing properties in database`);

  // Process each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const progress = Math.round(((i + 1) / data.length) * 100);

    updateProgress(progress, `Processing ${i + 1} of ${data.length}...`);

    try {
      await processProperty(row, existingProperties);
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
      .select('id, address');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return null;
  }
}

async function processProperty(row, existingProperties) {
  // Extract address from "Task Name"
  const taskName = row['Task Name'] || '';
  if (!taskName.trim()) {
    importResults.errors++;
    importResults.errorDetails.push({
      address: 'Empty Task Name',
      error: 'Missing address in Task Name column'
    });
    return;
  }

  // Try to match to existing property by address
  const matchedProperty = findMatchingProperty(taskName, existingProperties);

  if (!matchedProperty) {
    // No match found - SKIP (don't create new)
    importResults.skipped++;
    importResults.skippedProperties.push(taskName);
    importResults.detailedLog.push({
      csv_address: taskName,
      status: 'SKIPPED',
      reason: 'No matching property found in database'
    });
    console.log(`Skipped (no match): ${taskName}`);
    return;
  }

  // Match found - UPDATE existing property
  const transformedData = transformRowData(row);

  try {
    const { error } = await supabaseClient
      .from('properties')
      .update(transformedData)
      .eq('id', matchedProperty.id);

    if (error) throw error;

    importResults.updated++;
    importResults.updatedProperties.push({
      csv_address: taskName,
      db_address: matchedProperty.address
    });
    importResults.detailedLog.push({
      csv_address: taskName,
      matched_to: matchedProperty.address,
      property_id: matchedProperty.id,
      status: 'UPDATED',
      fields_updated: Object.keys(transformedData).length
    });

    console.log(`Updated: ${taskName} -> ${matchedProperty.address}`);
  } catch (error) {
    importResults.errors++;
    importResults.errorDetails.push({
      address: taskName,
      error: error.message
    });
    console.error(`Failed to update: ${taskName}`, error);
  }
}

// ============================================================================
// PROPERTY MATCHING LOGIC
// ============================================================================

function findMatchingProperty(csvAddress, existingProperties) {
  const normalizedCSV = normalizeAddress(csvAddress);

  // Try exact match first
  let match = existingProperties.find(prop =>
    normalizeAddress(prop.address) === normalizedCSV
  );

  if (match) return match;

  // Try fuzzy match - extract street number and name
  match = existingProperties.find(prop => {
    const propNormalized = normalizeAddress(prop.address);
    return fuzzyMatch(normalizedCSV, propNormalized);
  });

  return match || null;
}

function normalizeAddress(address) {
  if (!address) return '';
  return address
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

function fuzzyMatch(str1, str2) {
  // Extract street number and first word of street name
  const extractKey = (str) => {
    const match = str.match(/^(\d+)\s+(\w+)/);
    return match ? `${match[1]} ${match[2]}` : str;
  };

  const key1 = extractKey(str1);
  const key2 = extractKey(str2);

  return key1 === key2;
}

// ============================================================================
// DATA TRANSFORMATION - ClickUp to Supabase field mapping
// ============================================================================

function transformRowData(row) {
  const data = {};

  // Status -> occupancy_status
  if (row['Status']) {
    data.occupancy_status = transformStatus(row['Status']);
  }

  // Bedrooms
  const bedrooms = parseInteger(row['1 Bedrooms (number)']);
  if (bedrooms !== null) data.bedrooms = bedrooms;

  // Bathrooms
  const bathrooms = parseDecimal(row['1 Bathrooms (number)']);
  if (bathrooms !== null) data.bathrooms = bathrooms;

  // Square Footage
  const sqft = parseInteger(row['1 Square Footage (number)']);
  if (sqft !== null) data.square_footage = sqft;

  // Purchase Price (Acquisition Cost)
  const purchasePrice = parseCurrency(row['2 Acquisition Cost (currency)']);
  if (purchasePrice !== null) data.purchase_price = purchasePrice;

  // Purchase Date (Date Acquired)
  const purchaseDate = parseDate(row['2 Date Acquired (date)']);
  if (purchaseDate !== null) data.purchase_date = purchaseDate;

  // Market Rent (Fair Market Rent)
  const marketRent = parseCurrency(row['3 Fair Market Rent (currency)']);
  if (marketRent !== null) data.market_rent = marketRent;

  // Mortgage Balance
  const mortgageBalance = parseCurrency(row['4 Mortgage (currency)']);
  if (mortgageBalance !== null) data.mortgage_balance = mortgageBalance;

  // Additional useful fields if present
  const yearBuilt = row['1 Year of house (short text)'];
  if (yearBuilt) data.year_built = parseInt(yearBuilt) || null;

  const currentValue = parseCurrency(row['1 Zillow Value (currency)']);
  if (currentValue !== null) data.current_estimated_value = currentValue;

  const mortgagePayment = parseCurrency(row['4 Monthly Pmt (currency)']);
  if (mortgagePayment !== null) data.mortgage_payment = mortgagePayment;

  const interestRate = parseDecimal(row['4 Interest Rate for Loan (number)']);
  if (interestRate !== null) data.interest_rate = interestRate;

  const acquisitionMethod = row['2 Acquisition Method (drop down)'];
  if (acquisitionMethod) data.acquisition_method = acquisitionMethod;

  // Update timestamp
  data.updated_at = new Date().toISOString();

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

function parseDate(value) {
  if (!value) return null;

  try {
    // Input format: "Tuesday, December 5th 2023, 8:11:40 am -06:00"
    const match = value.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?\s+(\d{4})/);
    if (match) {
      const [, month, day, year] = match;
      const date = new Date(`${month} ${day}, ${year}`);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    }

    // Try simple date format
    const simpleDate = new Date(value);
    if (!isNaN(simpleDate.getTime())) {
      return simpleDate.toISOString().split('T')[0];
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
    'traditional rental': 'Occupied',
    'vacant': 'Vacant',
    'section 8': 'Occupied'
  };

  return statusMap[status.toLowerCase()] || status;
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
  document.getElementById('statUpdated').textContent = importResults.updated;
  document.getElementById('statSkipped').textContent = importResults.skipped;
  document.getElementById('statErrors').textContent = importResults.errors;

  // Updated properties
  if (importResults.updatedProperties.length > 0) {
    document.getElementById('updatedSection').style.display = 'block';
    const updatedList = document.getElementById('updatedList');
    updatedList.innerHTML = importResults.updatedProperties
      .map(item => `
        <div class="result-item success">
          <strong>${escapeHtml(item.csv_address)}</strong>
          <small>Matched: ${escapeHtml(item.db_address)}</small>
        </div>
      `)
      .join('');
  }

  // Skipped properties (no match)
  if (importResults.skippedProperties.length > 0) {
    document.getElementById('skippedSection').style.display = 'block';
    const skippedList = document.getElementById('skippedList');
    skippedList.innerHTML = importResults.skippedProperties
      .map(addr => `
        <div class="result-item skipped">
          <strong>${escapeHtml(addr)}</strong>
          <small>No matching property in database</small>
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
        <div class="result-item error">
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
      updated: importResults.updated,
      skipped: importResults.skipped,
      errors: importResults.errors
    },
    updatedProperties: importResults.updatedProperties,
    skippedProperties: importResults.skippedProperties,
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
    updated: 0,
    skipped: 0,
    errors: 0,
    updatedProperties: [],
    skippedProperties: [],
    errorDetails: [],
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
