# Property Master Data Import Tool

**One-time migration tool** for importing property data from ClickUp CSV into Supabase properties table.

## 📋 Overview

This tool:
- ✅ Parses ClickUp property export CSV
- ✅ Matches CSV addresses to existing database properties
- ✅ Transforms and cleans data
- ✅ Updates existing properties (does NOT create new ones)
- ✅ Provides detailed import report
- ✅ Handles errors gracefully

**Important**: This tool only UPDATES existing properties. Properties not found in the database will be flagged for manual review.

---

## 🚀 Setup Instructions

### Step 1: Run Database Schema

Before using the import tool, you must add the new columns to your `properties` table.

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com/project/gcuunlxfgtnppnqkikaz/sql
   - Click "New query"

2. **Copy and Run Schema**
   - Open `database/schema.sql`
   - Copy the ENTIRE contents
   - Paste into SQL Editor
   - Click "Run" (or Ctrl/Cmd + Enter)

3. **Verify Success**
   - You should see: ✅ "Success. No rows returned"
   - Go to Table Editor → `properties`
   - You should see ~60+ new columns added

**Expected columns added:**
- Address & location fields (full_address, city, state, zip_code, county)
- Physical characteristics (bedrooms, bathrooms, square_footage, etc.)
- Financial data (purchase_price, current_value, mortgage info, etc.)
- Occupancy & tenant info
- Property condition & maintenance
- Features (garage, pool, rooms, utilities)
- Import metadata (import_status, imported_at, data_source)

---

### Step 2: Deploy to Netlify

1. **Go to Netlify**
   - Visit: https://app.netlify.com
   - Sign in (or create free account)

2. **Deploy via Drag & Drop**
   - Click "Sites" → "Add new site" → "Deploy manually"
   - Drag the entire `frontend/` folder to the drop zone
   - Wait for deployment (~30 seconds)

3. **Get Your URL**
   - Netlify will give you a URL like: `https://property-import-abc123.netlify.app`
   - Bookmark this URL

**Alternative**: Deploy via Git
```bash
cd frontend/
netlify deploy --prod
```

---

## 📤 Using the Import Tool

### Step 1: Export from ClickUp

1. Go to your ClickUp property list
2. Click "..." menu → "Export to CSV"
3. Download the CSV file

**Required CSV columns:**
- Task Name (property address)
- Status (occupancy status)
- Bedrooms, Bathrooms, Square Footage
- Year of house, Zillow Value
- Acquisition Cost, Date Acquired, Acquisition Method
- Fair Market Rent, Monthly Payment, Mortgage Balance
- Interest Rate, Department In Charge
- Foundation Type, Garage Spaces
- Gas/Water/Stove Type
- Checkboxes: Deck/Porch, Dining Room, Family Room, Laundry Room, Living Room, Office
- Lockbox Code, TTCU #, Refi Bank

### Step 2: Upload & Import

1. **Open the tool**
   - Navigate to your Netlify URL

2. **Upload CSV**
   - Click "Click to upload CSV file" or drag & drop
   - Tool will parse and show row count

3. **Click "Import Data to Supabase"**
   - Progress bar will show import status
   - Typically takes 30-60 seconds for 75 properties

4. **Review Results**
   - See summary statistics
   - Check unmatched properties
   - Review any errors

### Step 3: Handle Results

**Successfully Imported Properties**
- These are updated in the database ✅
- Status breakdown shows data completeness:
  - **Complete**: 25+ fields populated
  - **Needs Enhancement**: 15-24 fields populated
  - **Sparse**: <15 fields populated

**Unmatched Properties** ⚠️
- These require manual review
- CSV address didn't match any existing database property
- Options:
  1. Update the property name in Supabase to match CSV format
  2. Manually copy data from CSV to database
  3. Create new property in database (not done by tool)

**Errors** ❌
- Any parsing or update errors are listed
- Download detailed log for troubleshooting

### Step 4: Download Import Log

1. Click "📥 Download Detailed Import Log (JSON)"
2. Save for your records
3. Contains:
   - Summary statistics
   - List of unmatched properties
   - All errors with details
   - Complete log of what was imported

---

## 🎯 Property Matching Logic

The tool uses this strategy to match CSV addresses to database properties:

### 1. Exact Match
- Compares "Task Name" from CSV to "name" field in database
- Case-insensitive, ignores special characters

**Example:**
- CSV: "106 Piper Pkwy"
- Database: "106 Piper Pkwy" ✅ Match!

### 2. Fuzzy Match
- Extracts street number and name
- Checks if one contains the other

**Example:**
- CSV: "106 Piper Pkwy"
- Database: "Piper Pkwy" ✅ Match!

### 3. No Match
- If neither strategy works → flagged as "UNMATCHED"
- Listed in results for manual review

---

## 📊 Data Transformations

The tool automatically transforms ClickUp data to match Supabase schema:

### Dates
- **Input**: "Tuesday, December 5th 2023, 8:11:40 am -06:00"
- **Output**: "2023-12-05" (DATE format)

### Currency
- **Input**: "$285,000" or "285000"
- **Output**: 285000.00 (NUMERIC)
- Removes $, commas

### Booleans
- **Input**: "true" (text) or empty
- **Output**: TRUE/FALSE
- Empty or anything except "true" → FALSE

### Status Mapping
| ClickUp Status | Supabase Status |
|---|---|
| "occupied" | "Occupied" |
| "eviction" | "Eviction in Progress" |
| "new property" | "Vacant" |
| "traditional rental" | "Occupied" |
| (empty) | "Unknown" |

---

## 🔍 Troubleshooting

### Problem: "Failed to fetch existing properties"

**Solution:**
- Check Supabase connection
- Verify anon key in `config.js` is correct
- Ensure `properties` table exists

### Problem: All properties showing as "UNMATCHED"

**Solution:**
- Check property names in database
- Ensure "Task Name" in CSV contains addresses
- Try updating database `name` field to match CSV format exactly

### Problem: Import errors on specific rows

**Solution:**
- Download import log (JSON)
- Check error details for specific row
- Likely cause: Invalid date format or malformed currency values
- Fix in CSV and re-import

### Problem: Schema update failed

**Solution:**
- Check if columns already exist (re-running schema is safe)
- Verify you have database permissions
- Try running ALTER TABLE statements one at a time

---

## 🛡️ Safety Features

This tool is designed to be safe:

1. **Never Creates New Properties**
   - Only updates existing records
   - Unmatched properties flagged for review

2. **Never Overwrites Critical Fields**
   - `id`, `name`, `active`, `sort_order`, `created_at` are never modified
   - Only updates property data fields

3. **Detailed Logging**
   - Every action is logged
   - Download complete import log
   - Easy to trace what was changed

4. **Graceful Error Handling**
   - One bad row won't fail entire import
   - Errors are logged, import continues
   - Review errors in results

---

## 📝 Post-Import Steps

After importing:

1. **Review Unmatched Properties**
   - For each unmatched address:
     - Find the property in database
     - Update `name` field to match CSV format
     - Re-run import OR manually copy data

2. **Check "Needs Enhancement" Properties**
   - These have 15-24 fields populated
   - Consider adding missing data manually

3. **Verify Sample Properties**
   - Spot-check a few properties in Supabase
   - Ensure data looks correct
   - Verify dates, currencies formatted properly

4. **Archive Import Log**
   - Save the JSON log file
   - Documents what was imported and when

---

## 📂 File Structure

```
property-import/
├── frontend/
│   ├── index.html       # UI
│   ├── app.js           # Import logic
│   ├── config.js        # Supabase credentials
│   └── styles.css       # Styling
├── database/
│   └── schema.sql       # ALTER TABLE statements
└── README.md            # This file
```

---

## 🔗 Links

- **Supabase Project**: https://app.supabase.com/project/gcuunlxfgtnppnqkikaz
- **Table Editor**: https://app.supabase.com/project/gcuunlxfgtnppnqkikaz/editor
- **SQL Editor**: https://app.supabase.com/project/gcuunlxfgtnppnqkikaz/sql

---

## ⚠️ Important Notes

1. **One-Time Tool**: This is for initial migration. Not for ongoing sync.
2. **Test First**: Import a small subset if possible to verify behavior.
3. **Backup**: Supabase has automatic backups, but consider manual export before import.
4. **Browser**: Works best in Chrome/Firefox. Requires modern JavaScript support.
5. **File Size**: Should handle up to 1000 rows. Larger files may be slow.

---

## 🎓 Example Workflow

1. ✅ Run `schema.sql` in Supabase
2. ✅ Deploy tool to Netlify
3. ✅ Export ClickUp to CSV
4. ✅ Upload CSV to tool
5. ✅ Click "Import Data"
6. ✅ Review results (75 properties processed)
7. ✅ Check unmatched (maybe 5-10 properties)
8. ✅ Download import log
9. ✅ Manually handle unmatched properties
10. ✅ Verify data in Supabase Table Editor

**Total time**: ~15-30 minutes

---

## 💬 Support

If you encounter issues:

1. Check this README thoroughly
2. Review browser console (F12) for errors
3. Download and review import log
4. Check Supabase logs for database errors

---

**Version**: 1.0
**Last Updated**: 2025-11-03
**One-time migration tool for ClickUp → Supabase property data**
