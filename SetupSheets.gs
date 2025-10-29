/**
 * SetupSheets.gs
 * Initializes the Google Sheets database structure for Property Master List
 * Run setupPropertySheets() once to create all required sheets and columns
 */

/**
 * Main setup function - creates all 3 sheets with proper structure
 * Run this function once when first setting up the spreadsheet
 */
function setupPropertySheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create or clear sheets
  createPropertyMasterDataSheet(ss);
  createPropertyListSheet(ss);
  createDropdownOptionsSheet(ss);

  Logger.log('✅ All sheets created successfully!');
  Logger.log('Sheet names: PropertyMasterData, PropertyList, DropdownOptions');
}

/**
 * Creates PropertyMasterData sheet with all 74 columns
 */
function createPropertyMasterDataSheet(ss) {
  let sheet = ss.getSheetByName('PropertyMasterData');

  // Delete and recreate if exists
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet('PropertyMasterData');

  // Define all 74 column headers
  const headers = [
    // Core Identity (1-5)
    'PropertyID',
    'Address',
    'City',
    'State',
    'ZIP',

    // Location Details (6-6)
    'County',

    // Physical Characteristics (7-13)
    'PropertyType',
    'Bedrooms',
    'Bathrooms',
    'SquareFootage',
    'LotSize',
    'YearBuilt',
    'Stories',

    // Acquisition & Financial (14-23)
    'PurchaseDate',
    'PurchasePrice',
    'AcquisitionMethod',
    'CurrentEstimatedValue',
    'TotalRehabCost',
    'CurrentMonthlyRent',
    'MarketRent',
    'MortgagePayment',
    'PropertyTaxAnnual',
    'InsuranceAnnual',

    // Occupancy & Tenant Info (24-31)
    'OccupancyStatus',
    'CurrentTenantName',
    'TenantMoveInDate',
    'LeaseEndDate',
    'LeaseType',
    'DaysVacant',
    'LastRentPaymentDate',
    'RentPaymentStatus',

    // Property Condition (32-43)
    'LastInspectionDate',
    'LastInspector',
    'OverallConditionRating',
    'LastHVACServiceDate',
    'HVACCondition',
    'LastRoofInspectionDate',
    'RoofCondition',
    'FoundationIssues',
    'PlumbingIssues',
    'ElectricalIssues',
    'PendingMaintenanceRequests',
    'MajorRepairsNeeded',

    // Property Features (44-52)
    'HasGarage',
    'HasDriveway',
    'HasFence',
    'HasPool',
    'AppliancesIncluded',
    'CentralHeatAC',
    'FlooringTypes',
    'RecentUpgrades',

    // Property Management (53-59)
    'PropertyManagerAssigned',
    'ManagedBy',
    'HasHOA',
    'HOAFee',
    'PetFriendly',
    'UtilitiesIncluded',
    'NeighborhoodArea',

    // Historical Performance (60-68)
    'TotalMonthsOwned',
    'TotalMonthsOccupied',
    'OccupancyRatePercent',
    'NumberOfTurnovers',
    'AvgTenantLengthOfStay',
    'TotalMaintenanceCosts',
    'AvgMonthlyMaintenanceCost',
    'EvictionCount',
    'LastEvictionDate',

    // Operational Notes (69-74)
    'ProblemPropertyFlag',
    'PreferredContractor',
    'AccessNotes',
    'NeighborIssues',
    'CityCodeViolations',
    'SpecialNotes',

    // Metadata (75-78)
    'LastVerifiedDate',
    'VerifiedBy',
    'DataCompletenessScore',
    'MissingInformation'
  ];

  // Set headers (row 1)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  Logger.log('✅ PropertyMasterData sheet created with ' + headers.length + ' columns');
}

/**
 * Creates PropertyList sheet for dropdown selection
 */
function createPropertyListSheet(ss) {
  let sheet = ss.getSheetByName('PropertyList');

  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet('PropertyList');

  const headers = ['PropertyID', 'Address'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#34A853');
  headerRange.setFontColor('#FFFFFF');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumn(1);
  sheet.autoResizeColumn(2);

  Logger.log('✅ PropertyList sheet created');
}

/**
 * Creates DropdownOptions sheet and populates with initial values
 */
function createDropdownOptionsSheet(ss) {
  let sheet = ss.getSheetByName('DropdownOptions');

  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet('DropdownOptions');

  const headers = ['OptionType', 'OptionValue'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#FBBC04');
  headerRange.setFontColor('#000000');

  sheet.setFrozenRows(1);

  // Populate with initial dropdown options
  const options = [
    // Property Types
    ['PropertyType', 'Single Family'],
    ['PropertyType', 'Multi-Family'],
    ['PropertyType', 'Duplex'],
    ['PropertyType', 'Triplex'],
    ['PropertyType', 'Fourplex'],
    ['PropertyType', 'Condo'],
    ['PropertyType', 'Townhouse'],
    ['PropertyType', 'Mobile Home'],

    // Occupancy Status
    ['OccupancyStatus', 'Occupied'],
    ['OccupancyStatus', 'Vacant'],
    ['OccupancyStatus', 'Turnover in Progress'],
    ['OccupancyStatus', 'Rehab in Progress'],

    // Lease Types
    ['LeaseType', 'Month-to-Month'],
    ['LeaseType', '6-Month Lease'],
    ['LeaseType', '12-Month Lease'],
    ['LeaseType', '24-Month Lease'],
    ['LeaseType', 'Section 8'],

    // Condition Ratings
    ['ConditionRating', 'Excellent'],
    ['ConditionRating', 'Good'],
    ['ConditionRating', 'Fair'],
    ['ConditionRating', 'Needs Work'],
    ['ConditionRating', 'Poor'],

    // Neighborhood Areas
    ['NeighborhoodArea', 'A - Premium'],
    ['NeighborhoodArea', 'B - Good'],
    ['NeighborhoodArea', 'C - Average'],
    ['NeighborhoodArea', 'D - Needs Improvement'],

    // Acquisition Methods
    ['AcquisitionMethod', 'Purchase'],
    ['AcquisitionMethod', 'Foreclosure'],
    ['AcquisitionMethod', 'Tax Sale'],
    ['AcquisitionMethod', 'Inherited'],
    ['AcquisitionMethod', 'Wholesaler'],
    ['AcquisitionMethod', 'FSBO'],
    ['AcquisitionMethod', 'MLS'],

    // Rent Payment Status
    ['RentPaymentStatus', 'Current'],
    ['RentPaymentStatus', 'Late (1-5 days)'],
    ['RentPaymentStatus', 'Late (6-15 days)'],
    ['RentPaymentStatus', 'Late (16+ days)'],
    ['RentPaymentStatus', 'Partial Payment'],
    ['RentPaymentStatus', 'Non-Payment'],

    // Yes/No Options
    ['YesNo', 'Yes'],
    ['YesNo', 'No'],

    // State (Texas default)
    ['State', 'TX'],
    ['State', 'AL'],
    ['State', 'AR'],
    ['State', 'AZ'],
    ['State', 'CA'],
    ['State', 'CO'],
    ['State', 'FL'],
    ['State', 'GA'],
    ['State', 'LA'],
    ['State', 'MS'],
    ['State', 'NM'],
    ['State', 'OK'],
    ['State', 'TN']
  ];

  // Write all options starting from row 2
  sheet.getRange(2, 1, options.length, 2).setValues(options);

  sheet.autoResizeColumn(1);
  sheet.autoResizeColumn(2);

  Logger.log('✅ DropdownOptions sheet created with ' + options.length + ' options');
}

/**
 * Helper function to add sample property data (optional - for testing)
 */
function addSampleProperty() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName('PropertyMasterData');
  const listSheet = ss.getSheetByName('PropertyList');

  if (!masterSheet || !listSheet) {
    Logger.log('❌ Sheets not found. Run setupPropertySheets() first.');
    return;
  }

  const propertyId = 'PROP-' + Utilities.getUuid().substring(0, 8).toUpperCase();

  const sampleData = [
    propertyId,                          // PropertyID
    '123 Main Street',                   // Address
    'Dallas',                            // City
    'TX',                                // State
    '75201',                             // ZIP
    'Dallas County',                     // County
    'Single Family',                     // PropertyType
    3,                                   // Bedrooms
    2,                                   // Bathrooms
    1500,                                // SquareFootage
    6000,                                // LotSize
    1995,                                // YearBuilt
    1,                                   // Stories
    '2020-01-15',                        // PurchaseDate
    125000,                              // PurchasePrice
    'MLS',                               // AcquisitionMethod
    150000,                              // CurrentEstimatedValue
    15000,                               // TotalRehabCost
    1200,                                // CurrentMonthlyRent
    1250,                                // MarketRent
    850,                                 // MortgagePayment
    2400,                                // PropertyTaxAnnual
    1200,                                // InsuranceAnnual
    'Occupied',                          // OccupancyStatus
    'John Smith',                        // CurrentTenantName
    '2023-06-01',                        // TenantMoveInDate
    '2024-05-31',                        // LeaseEndDate
    '12-Month Lease',                    // LeaseType
    '',                                  // DaysVacant (calculated)
    '2024-10-01',                        // LastRentPaymentDate
    'Current',                           // RentPaymentStatus
    '2024-09-15',                        // LastInspectionDate
    'Kalen',                             // LastInspector
    'Good'                               // OverallConditionRating
    // ... rest would be filled as needed
  ];

  // Add to PropertyMasterData
  masterSheet.appendRow(sampleData);

  // Add to PropertyList
  listSheet.appendRow([propertyId, '123 Main Street']);

  Logger.log('✅ Sample property added: ' + propertyId);
}
