/**
 * SheetService.gs
 * Google Sheets CRUD operations for Property Master List
 */

/**
 * Get all properties from PropertyMasterData
 * @returns {Array} Array of property objects with all data
 */
function getAllProperties() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PropertyMasterData');

  if (!sheet) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const properties = [];

  // Convert rows to objects (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const property = {};

    headers.forEach((header, index) => {
      property[header] = row[index];
    });

    properties.push(property);
  }

  return properties;
}

/**
 * Get property by PropertyID
 * @param {string} propertyId
 * @returns {Object|null} Property object or null if not found
 */
function getPropertyById(propertyId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PropertyMasterData');

  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const propertyIdIndex = headers.indexOf('PropertyID');

  if (propertyIdIndex === -1) return null;

  // Find the row with matching PropertyID
  for (let i = 1; i < data.length; i++) {
    if (data[i][propertyIdIndex] === propertyId) {
      const property = {};
      headers.forEach((header, index) => {
        property[header] = data[i][index];
      });
      return property;
    }
  }

  return null;
}

/**
 * Save property data (create new or update existing)
 * @param {Object} propertyData - Property data object
 * @returns {Object} {success: boolean, propertyId: string, message: string}
 */
function saveProperty(propertyData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const masterSheet = ss.getSheetByName('PropertyMasterData');
    const listSheet = ss.getSheetByName('PropertyList');

    if (!masterSheet) {
      return { success: false, message: 'PropertyMasterData sheet not found' };
    }

    // Get headers
    const headers = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];

    // Generate PropertyID if new property
    if (!propertyData.PropertyID || propertyData.PropertyID === '') {
      propertyData.PropertyID = generatePropertyId();
    }

    // Calculate auto fields
    propertyData = calculateAutoFields(propertyData);

    // Check if property exists
    const existingRow = findPropertyRow(masterSheet, propertyData.PropertyID);

    if (existingRow > 0) {
      // Update existing property
      updatePropertyRow(masterSheet, existingRow, headers, propertyData);
      updatePropertyList(listSheet, propertyData.PropertyID, propertyData.Address);

      return {
        success: true,
        propertyId: propertyData.PropertyID,
        message: 'Property updated successfully'
      };
    } else {
      // Create new property
      appendPropertyRow(masterSheet, headers, propertyData);
      addToPropertyList(listSheet, propertyData.PropertyID, propertyData.Address);

      return {
        success: true,
        propertyId: propertyData.PropertyID,
        message: 'Property created successfully'
      };
    }
  } catch (error) {
    Logger.log('Error in saveProperty: ' + error.toString());
    return {
      success: false,
      message: 'Error saving property: ' + error.toString()
    };
  }
}

/**
 * Find the row number for a property by PropertyID
 * @param {Sheet} sheet
 * @param {string} propertyId
 * @returns {number} Row number (0 if not found)
 */
function findPropertyRow(sheet, propertyId) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const propertyIdIndex = headers.indexOf('PropertyID');

  if (propertyIdIndex === -1) return 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][propertyIdIndex] === propertyId) {
      return i + 1; // Return 1-based row number
    }
  }

  return 0;
}

/**
 * Update an existing property row
 * @param {Sheet} sheet
 * @param {number} rowNum - 1-based row number
 * @param {Array} headers
 * @param {Object} propertyData
 */
function updatePropertyRow(sheet, rowNum, headers, propertyData) {
  const rowData = [];

  headers.forEach(header => {
    const value = propertyData[header];
    rowData.push(value !== undefined ? value : '');
  });

  sheet.getRange(rowNum, 1, 1, headers.length).setValues([rowData]);
}

/**
 * Append new property row
 * @param {Sheet} sheet
 * @param {Array} headers
 * @param {Object} propertyData
 */
function appendPropertyRow(sheet, headers, propertyData) {
  const rowData = [];

  headers.forEach(header => {
    const value = propertyData[header];
    rowData.push(value !== undefined ? value : '');
  });

  sheet.appendRow(rowData);
}

/**
 * Update PropertyList sheet
 * @param {Sheet} listSheet
 * @param {string} propertyId
 * @param {string} address
 */
function updatePropertyList(listSheet, propertyId, address) {
  if (!listSheet) return;

  const data = listSheet.getDataRange().getValues();

  // Find existing entry
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === propertyId) {
      listSheet.getRange(i + 1, 2).setValue(address);
      return;
    }
  }

  // If not found, add new
  addToPropertyList(listSheet, propertyId, address);
}

/**
 * Add to PropertyList sheet
 * @param {Sheet} listSheet
 * @param {string} propertyId
 * @param {string} address
 */
function addToPropertyList(listSheet, propertyId, address) {
  if (!listSheet) return;
  listSheet.appendRow([propertyId, address]);
}

/**
 * Get property list for dropdown (PropertyID and Address)
 * @returns {Array} Array of {id, address} objects
 */
function getPropertyList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PropertyList');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const list = [];

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // If PropertyID exists
      list.push({
        id: data[i][0],
        address: data[i][1] || 'No Address'
      });
    }
  }

  return list;
}

/**
 * Get dropdown options by type
 * @param {string} optionType - Type of options to retrieve
 * @returns {Array} Array of option values
 */
function getDropdownOptions(optionType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DropdownOptions');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const options = [];

  // Skip header row, filter by OptionType
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === optionType && data[i][1]) {
      options.push(data[i][1]);
    }
  }

  return options;
}

/**
 * Get all dropdown options grouped by type
 * @returns {Object} Object with optionType as keys, arrays as values
 */
function getAllDropdownOptions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DropdownOptions');

  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  const optionsMap = {};

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const optionType = data[i][0];
    const optionValue = data[i][1];

    if (optionType && optionValue) {
      if (!optionsMap[optionType]) {
        optionsMap[optionType] = [];
      }
      optionsMap[optionType].push(optionValue);
    }
  }

  return optionsMap;
}

/**
 * Delete property by PropertyID
 * @param {string} propertyId
 * @returns {Object} {success: boolean, message: string}
 */
function deleteProperty(propertyId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const masterSheet = ss.getSheetByName('PropertyMasterData');
    const listSheet = ss.getSheetByName('PropertyList');

    // Delete from PropertyMasterData
    const masterRow = findPropertyRow(masterSheet, propertyId);
    if (masterRow > 0) {
      masterSheet.deleteRow(masterRow);
    }

    // Delete from PropertyList
    if (listSheet) {
      const listData = listSheet.getDataRange().getValues();
      for (let i = 1; i < listData.length; i++) {
        if (listData[i][0] === propertyId) {
          listSheet.deleteRow(i + 1);
          break;
        }
      }
    }

    return {
      success: true,
      message: 'Property deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error deleting property: ' + error.toString()
    };
  }
}

/**
 * Get dashboard statistics
 * @returns {Object} Statistics object
 */
function getDashboardStats() {
  const properties = getAllProperties();

  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;

  properties.forEach(property => {
    const score = property.DataCompletenessScore || 0;
    if (score === 100) {
      completed++;
    } else if (score > 0) {
      inProgress++;
    } else {
      notStarted++;
    }
  });

  return {
    total: properties.length,
    completed: completed,
    inProgress: inProgress,
    notStarted: notStarted,
    completionRate: properties.length > 0
      ? Math.round((completed / properties.length) * 100)
      : 0
  };
}
