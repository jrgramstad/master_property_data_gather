/**
 * Code.gs
 * Main entry point for Property Master List Web Application
 * Handles web app routing and API endpoints
 */

/**
 * Serves the web app interface
 * @param {Object} e - Event object (optional query parameters)
 * @returns {HtmlOutput} HTML page to display
 */
function doGet(e) {
  // Check if a specific page is requested
  const page = e.parameter.page || 'dashboard';

  if (page === 'wizard') {
    return HtmlService.createTemplateFromFile('Wizard')
      .evaluate()
      .setTitle('Property Data Entry')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Default: show dashboard
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Property Master List')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include HTML files (for modular HTML structure)
 * @param {string} filename - Name of the HTML file to include
 * @returns {string} HTML content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================================
// API ENDPOINTS (Called from frontend JavaScript via google.script.run)
// ============================================================================

/**
 * API: Get all properties with dashboard info
 * @returns {Object} {properties: Array, stats: Object}
 */
function apiGetAllProperties() {
  try {
    const properties = getAllProperties();
    const stats = getDashboardStats();

    return {
      success: true,
      properties: properties,
      stats: stats
    };
  } catch (error) {
    Logger.log('Error in apiGetAllProperties: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Get property by ID
 * @param {string} propertyId
 * @returns {Object}
 */
function apiGetProperty(propertyId) {
  try {
    const property = getPropertyById(propertyId);

    if (!property) {
      return {
        success: false,
        error: 'Property not found'
      };
    }

    return {
      success: true,
      property: property
    };
  } catch (error) {
    Logger.log('Error in apiGetProperty: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Save property data (create or update)
 * @param {Object} propertyData
 * @returns {Object}
 */
function apiSaveProperty(propertyData) {
  try {
    const result = saveProperty(propertyData);
    return result;
  } catch (error) {
    Logger.log('Error in apiSaveProperty: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Get property list for dropdown
 * @returns {Object}
 */
function apiGetPropertyList() {
  try {
    const list = getPropertyList();
    return {
      success: true,
      properties: list
    };
  } catch (error) {
    Logger.log('Error in apiGetPropertyList: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Get all dropdown options
 * @returns {Object}
 */
function apiGetDropdownOptions() {
  try {
    const options = getAllDropdownOptions();
    return {
      success: true,
      options: options
    };
  } catch (error) {
    Logger.log('Error in apiGetDropdownOptions: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Delete property
 * @param {string} propertyId
 * @returns {Object}
 */
function apiDeleteProperty(propertyId) {
  try {
    const result = deleteProperty(propertyId);
    return result;
  } catch (error) {
    Logger.log('Error in apiDeleteProperty: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Get dashboard statistics
 * @returns {Object}
 */
function apiGetDashboardStats() {
  try {
    const stats = getDashboardStats();
    return {
      success: true,
      stats: stats
    };
  } catch (error) {
    Logger.log('Error in apiGetDashboardStats: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Validate step data
 * @param {Object} stepData
 * @param {number} stepNumber
 * @returns {Object}
 */
function apiValidateStep(stepData, stepNumber) {
  try {
    const validation = validateStepData(stepData, stepNumber);
    return {
      success: true,
      validation: validation
    };
  } catch (error) {
    Logger.log('Error in apiValidateStep: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * API: Calculate auto fields for preview
 * @param {Object} propertyData
 * @returns {Object}
 */
function apiCalculateAutoFields(propertyData) {
  try {
    const calculated = calculateAutoFields(propertyData);
    return {
      success: true,
      data: calculated
    };
  } catch (error) {
    Logger.log('Error in apiCalculateAutoFields: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test function to verify setup
 */
function testSetup() {
  Logger.log('Testing Property Master List Setup...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check sheets exist
  const sheets = ['PropertyMasterData', 'PropertyList', 'DropdownOptions'];
  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      Logger.log('✓ ' + sheetName + ' exists');
    } else {
      Logger.log('✗ ' + sheetName + ' NOT FOUND');
    }
  });

  // Test property list
  const properties = getAllProperties();
  Logger.log('Total properties: ' + properties.length);

  // Test dropdown options
  const options = getAllDropdownOptions();
  Logger.log('Dropdown option types: ' + Object.keys(options).length);

  Logger.log('Test complete!');
}

/**
 * Get current user email (for VerifiedBy field)
 * @returns {string}
 */
function getCurrentUserEmail() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (e) {
    return 'Unknown User';
  }
}

/**
 * API: Get current user
 * @returns {Object}
 */
function apiGetCurrentUser() {
  return {
    success: true,
    email: getCurrentUserEmail()
  };
}
