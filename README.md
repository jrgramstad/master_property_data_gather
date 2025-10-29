# Property Master List Data Entry System

A comprehensive Google Apps Script web application for managing 75 rental properties with 74 data points per property.

## Project Overview

This system provides:
- Step-by-step wizard interface for property data entry (10 sections)
- Dashboard with progress tracking across all properties
- Auto-save functionality
- Data completeness scoring
- Auto-calculations (Days Vacant, Occupancy Rate, etc.)
- Tablet-friendly responsive design

## File Structure

```
/master_property_data_gather/
├── README.md                    # This file
├── SETUP_INSTRUCTIONS.md        # Deployment guide
├── Code.gs                      # Main entry point & web app routes
├── SheetService.gs              # Google Sheets CRUD operations
├── Calculations.gs              # Auto-calculation functions
├── SetupSheets.gs               # Initial sheets structure setup
├── Index.html                   # Dashboard landing page
├── Wizard.html                  # Multi-step form wizard
├── Styles.html                  # CSS stylesheet
└── JavaScript.html              # Frontend JavaScript logic
```

## Google Sheets Structure

### Sheet 1: PropertyMasterData
Main database with 74 columns per property including:
- Basic Info (Address, Type, Bedrooms, etc.)
- Financial Data (Purchase Price, Rent, Expenses)
- Tenant Information (Current Tenant, Lease Details)
- Property Condition (Inspections, Maintenance)
- Features (Garage, Pool, Appliances)
- Historical Performance (Occupancy Rate, Turnovers)
- Operational Notes (Access Codes, Issues)

### Sheet 2: PropertyList
Simplified list for property selection dropdown: PropertyID, Address

### Sheet 3: DropdownOptions
Form dropdown values: OptionType, OptionValue

## Key Features

### Phase 1 (Implemented)
- ✅ Google Sheets structure setup
- ✅ Dashboard with property list and completion tracking
- ✅ Steps 1-5 of wizard (Basic Info through Condition)
- ✅ Auto-save on each section
- ✅ Auto-calculations (Days Vacant, Months Owned, Completeness Score)
- ✅ Color-coded progress indicators
- ✅ Edit existing properties
- ✅ Tablet-friendly responsive UI

### Phase 2 (Future Enhancement)
- ⏳ Steps 6-10 (Features, Management, Performance, Notes, Review)
- ⏳ Advanced filtering and sorting
- ⏳ Export functionality
- ⏳ Bulk operations

## Auto-Calculations

1. **DaysVacant**: If status = "Vacant", calculates days since LeaseEndDate
2. **TotalMonthsOwned**: Months from PurchaseDate to today
3. **OccupancyRatePercent**: (TotalMonthsOccupied / TotalMonthsOwned) × 100
4. **DataCompletenessScore**: (Filled fields / 74) × 100

## Tech Stack

- **Platform**: Google Apps Script
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Apps Script (JavaScript runtime)
- **Database**: Google Sheets
- **Deployment**: Web App (shareable link)

## Quick Start

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed deployment steps.

## Author

Built for real estate property management - 75 properties, 74 data points per property.

## Version

v1.0.0 - Phase 1 Complete (Dashboard + Steps 1-5)
