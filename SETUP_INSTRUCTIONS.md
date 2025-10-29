# Setup Instructions - Property Master List

## Prerequisites

- Google Account
- Access to Google Sheets and Google Apps Script

## Step-by-Step Deployment

### 1. Create New Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Name it: "Property Master List Database"

### 2. Open Apps Script Editor

1. In your new spreadsheet, click **Extensions** > **Apps Script**
2. This opens the Apps Script editor in a new tab
3. Delete the default `myFunction()` code

### 3. Create Script Files

Create the following files in the Apps Script editor:

#### File 1: Code.gs
1. Rename "Code.gs" (should already exist)
2. Copy contents from `Code.gs` in this repository

#### File 2: SheetService.gs
1. Click the **+** icon next to Files
2. Select "Script" and name it `SheetService`
3. Copy contents from `SheetService.gs`

#### File 3: Calculations.gs
1. Click **+** > "Script" and name it `Calculations`
2. Copy contents from `Calculations.gs`

#### File 4: SetupSheets.gs
1. Click **+** > "Script" and name it `SetupSheets`
2. Copy contents from `SetupSheets.gs`

#### File 5: Index.html
1. Click **+** > "HTML" and name it `Index`
2. Copy contents from `Index.html`

#### File 6: Wizard.html
1. Click **+** > "HTML" and name it `Wizard`
2. Copy contents from `Wizard.html`

#### File 7: Styles.html
1. Click **+** > "HTML" and name it `Styles`
2. Copy contents from `Styles.html`

#### File 8: JavaScript.html
1. Click **+** > "HTML" and name it `JavaScript`
2. Copy contents from `JavaScript.html`

### 4. Initialize Database Structure

1. In the Apps Script editor, select `SetupSheets.gs` file
2. In the function dropdown (top toolbar), select `setupPropertySheets`
3. Click the **Run** button (▶️)
4. **Grant Permissions**:
   - A dialog will appear: "Authorization required"
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" > "Go to Property Master List (unsafe)"
   - Click "Allow"
5. Wait for execution to complete (check execution log)
6. Go back to your spreadsheet - you should now see 3 sheets:
   - PropertyMasterData
   - PropertyList
   - DropdownOptions

### 5. Deploy as Web App

1. In Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Configure deployment:
   - **Description**: "Property Master List v1.0"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (or "Anyone with Google account" for slight security)
4. Click **Deploy**
5. **Copy the Web App URL** (it will look like: `https://script.google.com/macros/s/.../exec`)
6. Click "Done"

### 6. Access Your Application

1. Open the Web App URL in your browser
2. You should see the Dashboard (Property List)
3. Click "Add New Property" to start entering data

### 7. Updating the Application

When you make changes to the code:

1. Edit the files in Apps Script editor
2. Click **Deploy** > **Manage deployments**
3. Click the pencil icon ✏️ next to your active deployment
4. Change **Version** to "New version"
5. Click **Deploy**
6. Refresh your web app URL

## Troubleshooting

### Error: "Script function not found: doGet"
- Make sure `Code.gs` contains the `doGet()` function
- Try re-deploying the web app

### Error: "You do not have permission to call..."
- Re-run authorization in Apps Script editor
- Make sure "Execute as" is set to "Me" in deployment settings

### Sheets Not Created
- Run `setupPropertySheets()` function manually from Apps Script editor
- Check execution logs for errors (View > Logs)

### Data Not Saving
- Check browser console for JavaScript errors (F12 > Console)
- Verify sheet names match exactly: "PropertyMasterData", "PropertyList", "DropdownOptions"

### Dropdown Options Not Loading
- Verify "DropdownOptions" sheet has data
- Run `setupPropertySheets()` again to populate sample data

## Sample Data Population (Optional)

To add sample dropdown options manually:

1. Go to "DropdownOptions" sheet
2. Add rows with format: `OptionType | OptionValue`

Example:
```
PropertyType | Single Family
PropertyType | Multi-Family
PropertyType | Condo
OccupancyStatus | Occupied
OccupancyStatus | Vacant
LeaseType | Month-to-Month
LeaseType | 12-Month Lease
```

## Security Considerations

- **Web App Access**: Set to "Anyone with Google account" for internal team use
- **Spreadsheet Access**: Share the underlying spreadsheet only with trusted users
- **Sensitive Data**: This tool has no authentication - use appropriate Google Workspace sharing settings

## Support

For issues or questions, refer to:
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API Reference](https://developers.google.com/sheets/api)

## Next Steps

1. ✅ Complete Phase 1 deployment (Steps 1-5)
2. Enter data for all 75 properties
3. Phase 2: Add Steps 6-10 (if needed)
4. Customize dropdown options in DropdownOptions sheet
5. Add any business-specific fields or calculations
