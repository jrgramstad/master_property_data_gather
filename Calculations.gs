/**
 * Calculations.gs
 * Auto-calculation functions for computed fields
 */

/**
 * Calculates all auto-computed fields for a property record
 * @param {Object} propertyData - The property data object
 * @returns {Object} Updated property data with calculated fields
 */
function calculateAutoFields(propertyData) {
  // 1. Calculate DaysVacant
  propertyData.DaysVacant = calculateDaysVacant(
    propertyData.OccupancyStatus,
    propertyData.LeaseEndDate
  );

  // 2. Calculate TotalMonthsOwned
  propertyData.TotalMonthsOwned = calculateMonthsOwned(propertyData.PurchaseDate);

  // 3. Calculate OccupancyRatePercent
  propertyData.OccupancyRatePercent = calculateOccupancyRate(
    propertyData.TotalMonthsOccupied,
    propertyData.TotalMonthsOwned
  );

  // 4. Calculate AvgMonthlyMaintenanceCost
  if (propertyData.TotalMaintenanceCosts && propertyData.TotalMonthsOwned) {
    propertyData.AvgMonthlyMaintenanceCost = Math.round(
      propertyData.TotalMaintenanceCosts / propertyData.TotalMonthsOwned
    );
  }

  // 5. Calculate DataCompletenessScore
  propertyData.DataCompletenessScore = calculateCompletenessScore(propertyData);

  // 6. Set LastVerifiedDate if not exists
  if (!propertyData.LastVerifiedDate) {
    propertyData.LastVerifiedDate = new Date();
  }

  return propertyData;
}

/**
 * Calculates days vacant if property is vacant
 * @param {string} occupancyStatus
 * @param {Date|string} leaseEndDate
 * @returns {number} Days vacant or empty string
 */
function calculateDaysVacant(occupancyStatus, leaseEndDate) {
  if (occupancyStatus === 'Vacant' && leaseEndDate) {
    const today = new Date();
    const endDate = new Date(leaseEndDate);

    if (!isNaN(endDate.getTime())) {
      const diffTime = Math.abs(today - endDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }
  return '';
}

/**
 * Calculates total months owned from purchase date to today
 * @param {Date|string} purchaseDate
 * @returns {number} Months owned
 */
function calculateMonthsOwned(purchaseDate) {
  if (!purchaseDate) return 0;

  const today = new Date();
  const purchase = new Date(purchaseDate);

  if (isNaN(purchase.getTime())) return 0;

  const months =
    (today.getFullYear() - purchase.getFullYear()) * 12 +
    (today.getMonth() - purchase.getMonth());

  return Math.max(0, months);
}

/**
 * Calculates occupancy rate percentage
 * @param {number} monthsOccupied
 * @param {number} monthsOwned
 * @returns {number} Occupancy rate percentage (0-100)
 */
function calculateOccupancyRate(monthsOccupied, monthsOwned) {
  if (!monthsOwned || monthsOwned === 0) return 0;
  if (!monthsOccupied) return 0;

  const rate = (monthsOccupied / monthsOwned) * 100;
  return Math.round(rate * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculates data completeness score (percentage of filled fields)
 * @param {Object} propertyData
 * @returns {number} Completeness percentage (0-100)
 */
function calculateCompletenessScore(propertyData) {
  // Total fields to check (excluding auto-calculated and metadata fields)
  const totalFields = 74;

  // Fields to exclude from completeness calculation (auto-calculated)
  const excludeFields = [
    'PropertyID',
    'DaysVacant',
    'TotalMonthsOwned',
    'OccupancyRatePercent',
    'AvgMonthlyMaintenanceCost',
    'LastVerifiedDate',
    'VerifiedBy',
    'DataCompletenessScore',
    'MissingInformation'
  ];

  // Count filled fields
  let filledCount = 0;
  let missingFields = [];

  for (let key in propertyData) {
    if (excludeFields.includes(key)) continue;

    const value = propertyData[key];

    // Check if field has meaningful data
    if (value !== null && value !== undefined && value !== '') {
      filledCount++;
    } else {
      missingFields.push(key);
    }
  }

  // Calculate percentage (excluding auto-calculated fields)
  const fieldsToCount = totalFields - excludeFields.length;
  const score = Math.round((filledCount / fieldsToCount) * 100);

  // Update missing information field
  propertyData.MissingInformation = missingFields.join(', ');

  return score;
}

/**
 * Validates required fields for each step
 * @param {Object} stepData - Data from current step
 * @param {number} stepNumber - Step number (1-10)
 * @returns {Object} {isValid: boolean, missingFields: Array}
 */
function validateStepData(stepData, stepNumber) {
  const requiredFieldsByStep = {
    2: ['Address', 'City', 'State', 'ZIP', 'PropertyType', 'Bedrooms', 'Bathrooms'],
    3: ['PurchaseDate', 'PurchasePrice'],
    4: ['OccupancyStatus'],
    5: [], // No required fields in Step 5 (Condition)
    6: [], // Future steps
    7: [],
    8: [],
    9: [],
    10: []
  };

  const requiredFields = requiredFieldsByStep[stepNumber] || [];
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!stepData[field] || stepData[field] === '') {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
}

/**
 * Formats currency values
 * @param {number} value
 * @returns {string} Formatted currency
 */
function formatCurrency(value) {
  if (!value || isNaN(value)) return '$0';
  return '$' + Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Formats date values
 * @param {Date|string} dateValue
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
function formatDate(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Calculates ROI (Return on Investment)
 * @param {Object} propertyData
 * @returns {number} ROI percentage
 */
function calculateROI(propertyData) {
  const totalInvestment =
    (propertyData.PurchasePrice || 0) + (propertyData.TotalRehabCost || 0);

  if (totalInvestment === 0) return 0;

  const annualIncome = (propertyData.CurrentMonthlyRent || 0) * 12;
  const annualExpenses =
    (propertyData.PropertyTaxAnnual || 0) +
    (propertyData.InsuranceAnnual || 0) +
    (propertyData.MortgagePayment || 0) * 12;

  const netAnnualIncome = annualIncome - annualExpenses;
  const roi = (netAnnualIncome / totalInvestment) * 100;

  return Math.round(roi * 100) / 100;
}

/**
 * Calculates Cap Rate (Capitalization Rate)
 * @param {Object} propertyData
 * @returns {number} Cap rate percentage
 */
function calculateCapRate(propertyData) {
  const currentValue = propertyData.CurrentEstimatedValue || 0;
  if (currentValue === 0) return 0;

  const annualIncome = (propertyData.CurrentMonthlyRent || 0) * 12;
  const annualExpenses =
    (propertyData.PropertyTaxAnnual || 0) +
    (propertyData.InsuranceAnnual || 0) +
    ((propertyData.TotalMaintenanceCosts || 0) / (propertyData.TotalMonthsOwned || 1)) * 12;

  const noi = annualIncome - annualExpenses; // Net Operating Income
  const capRate = (noi / currentValue) * 100;

  return Math.round(capRate * 100) / 100;
}

/**
 * Generates a unique PropertyID
 * @returns {string} Unique property ID (format: PROP-XXXXXXXX)
 */
function generatePropertyId() {
  const uuid = Utilities.getUuid();
  return 'PROP-' + uuid.substring(0, 8).toUpperCase();
}
