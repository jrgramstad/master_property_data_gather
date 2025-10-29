# Quick Start Guide - Property Master List

## What Was Built

A complete Google Apps Script web application for managing 75 rental properties with 74 data points per property.

### Files Created

1. **Backend Scripts (.gs)**
   - `Code.gs` - Main entry point with API endpoints
   - `SetupSheets.gs` - Database initialization script
   - `SheetService.gs` - CRUD operations
   - `Calculations.gs` - Auto-calculation functions

2. **Frontend Files (.html)**
   - `Index.html` - Dashboard with property list
   - `Wizard.html` - 5-step data entry form
   - `Styles.html` - Responsive CSS styling

3. **Documentation**
   - `README.md` - Project overview
   - `SETUP_INSTRUCTIONS.md` - Detailed deployment guide
   - `QUICK_START.md` - This file

## How to Deploy (5 Steps)

### Step 1: Create Google Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: "Property Master List Database"

### Step 2: Open Apps Script Editor
1. In the spreadsheet: **Extensions** > **Apps Script**
2. This opens the script editor

### Step 3: Copy All Code Files
Copy each file from this repository into the Apps Script editor:

**Script Files:**
1. `Code.gs` → Rename default file to "Code"
2. Create new script "SetupSheets" → Copy `SetupSheets.gs`
3. Create new script "SheetService" → Copy `SheetService.gs`
4. Create new script "Calculations" → Copy `Calculations.gs`

**HTML Files:**
1. Create HTML file "Index" → Copy `Index.html`
2. Create HTML file "Wizard" → Copy `Wizard.html`
3. Create HTML file "Styles" → Copy `Styles.html`

### Step 4: Initialize Database
1. In Apps Script editor, select `SetupSheets.gs`
2. Select function: `setupPropertySheets`
3. Click Run ▶️
4. Grant permissions when prompted
5. Check your spreadsheet - you should see 3 new sheets:
   - PropertyMasterData (74 columns)
   - PropertyList (2 columns)
   - DropdownOptions (with sample data)

### Step 5: Deploy Web App
1. Click **Deploy** > **New deployment**
2. Select type: **Web app**
3. Settings:
   - Description: "Property Master List v1.0"
   - Execute as: **Me**
   - Who has access: **Anyone** (or "Anyone with Google account")
4. Click **Deploy**
5. **Copy the Web App URL**
6. Open URL in browser

## Using the Application

### Dashboard (Home Page)
- View all properties with completion status
- Color-coded rows:
  - **Green** = 100% complete
  - **Yellow** = 50-99% complete
  - **Red** = 0-49% complete
- Filter by completion status
- Sort by address, completeness, or date
- Click any row to edit property
- Click "Add New Property" to start wizard

### Data Entry Wizard (5 Steps)
1. **Property Selection** - Choose existing or add new
2. **Basic Info** - Address, type, bedrooms, bathrooms, etc.
3. **Financial** - Purchase price, rent, expenses
4. **Current Status** - Occupancy, tenant info, lease details
5. **Condition** - Inspections, maintenance, repairs

Each step has **Save & Continue** button that:
- Auto-saves data to Google Sheets
- Validates required fields
- Shows success message
- Moves to next step

### Auto-Calculations

The system automatically calculates:
- **Days Vacant** - If status = "Vacant", days since lease ended
- **Total Months Owned** - Months from purchase date to today
- **Occupancy Rate %** - (Months Occupied / Months Owned) × 100
- **Data Completeness Score** - Percentage of filled fields (0-100%)

### Required Fields

**Step 2 (Basic Info):**
- Address, City, State, ZIP
- Property Type, Bedrooms, Bathrooms

**Step 3 (Financial):**
- Purchase Date, Purchase Price

**Step 4 (Status):**
- Occupancy Status

Steps 5 has no required fields but all data is valuable for completeness score.

## Customization

### Add More Dropdown Options
1. Go to "DropdownOptions" sheet
2. Add rows with format: `OptionType | OptionValue`
3. Example: `PropertyType | Ranch Style`

### Modify Property Types
Edit rows in DropdownOptions sheet where OptionType = "PropertyType"

### Change Default Values
Edit `Wizard.html` to set default values in form fields

## Troubleshooting

### "Script function not found: doGet"
- Make sure `Code.gs` exists and contains `doGet()` function
- Re-deploy the web app

### "You do not have permission"
- Run any function manually from script editor first
- Grant permissions when prompted
- Re-deploy with "Execute as: Me"

### Sheets not created
- Run `setupPropertySheets()` manually from SetupSheets.gs
- Check execution logs: View > Logs

### Data not saving
- Open browser console (F12) to check for JavaScript errors
- Verify sheet names match exactly (case-sensitive)
- Make sure web app deployed with correct permissions

## Tips for Your Team

1. **Start with a few properties** - Don't try to enter all 75 at once
2. **Focus on required fields first** - You can always add more details later
3. **Use the completeness score** - Aim for at least 80% on each property
4. **Regular updates** - Update LastVerifiedDate periodically
5. **Tablet use** - The interface is optimized for tablets - great for on-site data entry

## What's Next (Phase 2)

Future enhancements could include:
- **Steps 6-10**: Property features, management details, historical performance, operational notes, review summary
- **Export functionality**: Download property data as CSV/Excel
- **Advanced filters**: Filter by neighborhood, price range, occupancy
- **Analytics dashboard**: Charts showing portfolio performance
- **Bulk operations**: Update multiple properties at once
- **Photo uploads**: Add property photos
- **Document attachments**: Store leases, inspection reports

## Support

For issues or questions:
- Check SETUP_INSTRUCTIONS.md for detailed guidance
- Review browser console for error messages
- Test with a single property first before bulk data entry

## Data Privacy

⚠️ **Important Security Notes:**
- This web app has no authentication by default
- Anyone with the URL can access/edit data
- For internal use only - don't share URL publicly
- Consider setting "Who has access" to "Anyone with Google account" for slight security
- The underlying spreadsheet should have restricted sharing

---

**Built with:** Google Apps Script, HTML5, CSS3, Vanilla JavaScript
**Version:** 1.0.0 (Phase 1 - Steps 1-5)
**Last Updated:** 2025-10-29

Good luck with your property management! 🏡
