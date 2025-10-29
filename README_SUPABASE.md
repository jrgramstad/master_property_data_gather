# Property Master List Data Entry System

**Modern Version**: React + Supabase + Netlify

A comprehensive web application for managing 75 rental properties with 74 data points per property.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Styling**: Custom CSS (tablet-friendly responsive design)
- **Routing**: React Router v6

## ✨ Features

### Dashboard View
- 📊 Real-time statistics (Total, Completed, In Progress, Not Started)
- 📋 Property table with color-coded completion status
- 🔍 Filter by completion status (All, Not Started, In Progress, Completed)
- 🔄 Sort by Address, Completeness %, Last Verified Date
- ✏️ Click any row to edit property
- ➕ Add new properties with single click

### 5-Step Data Entry Wizard
1. **Property Selection** - Choose existing or add new
2. **Basic Info** (12 fields) - Address, Type, Bedrooms, etc.
3. **Financial** (10 fields) - Purchase Price, Rent, Expenses
4. **Current Status** (8 fields) - Occupancy, Tenant, Lease Details
5. **Condition** (12 fields) - Inspections, Maintenance, Repairs

### Smart Auto-Calculations
- ✅ **Days Vacant** - Auto-calculated if status = Vacant
- ✅ **Total Months Owned** - From purchase date to today
- ✅ **Occupancy Rate %** - (Months Occupied / Months Owned) × 100
- ✅ **Data Completeness Score** - (Filled fields / 74) × 100
- ✅ **Avg Monthly Maintenance Cost** - Total costs / months owned

### Database Features
- PostgreSQL with 74+ columns per property
- Automatic calculations via database triggers
- Indexed queries for fast performance
- Row-level security ready (optional)
- Real-time subscriptions support

## 📁 Project Structure

```
/master_property_data_gather/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main property list view
│   │   └── Wizard.jsx              # 5-step form wizard
│   ├── lib/
│   │   └── supabase.js             # Supabase client & API functions
│   ├── App.jsx                     # Main app with routing
│   ├── App.css                     # All styles
│   └── main.jsx                    # React entry point
├── supabase/
│   └── schema.sql                  # Database schema (run this first!)
├── netlify.toml                    # Netlify configuration
├── package.json                    # Dependencies
├── vite.config.js                  # Vite build config
├── .env.example                    # Environment variables template
└── index.html                      # HTML entry point
```

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works great)
- Netlify account (optional, for deployment)

### Step 1: Clone and Install

```bash
cd master_property_data_gather
npm install
```

### Step 2: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to be ready (~2 minutes)
3. Go to **SQL Editor**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste and click **Run**
6. Verify 2 tables created: `properties` and `dropdown_options`

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. In Supabase dashboard, go to **Settings** > **API**

3. Copy these values to your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### Step 5: Deploy to Netlify

#### Option A: Connect Git Repository (Recommended)

1. Push code to GitHub/GitLab
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your repository
5. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

#### Option B: Manual Deploy

```bash
npm run build
netlify deploy --prod
```

## 📊 Database Schema

### Properties Table (74+ fields)
- **Core Identity**: Address, City, State, ZIP, County
- **Physical**: Property Type, Bedrooms, Bathrooms, Square Footage, Lot Size, Year Built
- **Financial**: Purchase Price/Date, Current Value, Rent, Mortgage, Taxes, Insurance
- **Occupancy**: Status, Tenant Name, Lease Dates, Payment Status
- **Condition**: Inspections, HVAC, Roof, Foundation, Plumbing, Electrical
- **Features**: Garage, Pool, Fence, Appliances, Central AC
- **Management**: Property Manager, HOA, Pet Policy, Neighborhood Grade
- **Performance**: Months Owned/Occupied, Occupancy Rate, Turnovers, Maintenance Costs
- **Notes**: Problem Flag, Contractors, Access Codes, Special Notes
- **Metadata**: Last Verified, Completeness Score, Missing Info

### Dropdown Options Table
Pre-populated with:
- Property Types (Single Family, Multi-Family, Condo, etc.)
- Occupancy Status (Occupied, Vacant, Turnover, Rehab)
- Lease Types (Month-to-Month, 6/12/24-Month, Section 8)
- Condition Ratings (Excellent, Good, Fair, Needs Work, Poor)
- Neighborhood Areas (A/B/C/D classification)
- And more...

## 🎨 Color-Coded Progress

- **Green** (100%): All fields completed
- **Yellow** (50-99%): Partially completed
- **Red** (<50%): Just started or minimal data
- **Gray** (0%): Not started

## 🔒 Security

- Environment variables for sensitive data
- Supabase Row Level Security (RLS) ready
- HTTPS enforced by Netlify
- XSS protection headers
- No sensitive data in client code

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Adding New Fields

1. Add column to `supabase/schema.sql`
2. Run SQL in Supabase SQL Editor
3. Update `src/components/Wizard.jsx` to add form field
4. Update `src/lib/supabase.js` if needed
5. Test locally

### Customizing Dropdown Options

1. Go to Supabase dashboard
2. Open **Table Editor** > `dropdown_options`
3. Add/edit/delete rows
4. Changes appear immediately in app

## 📈 Performance

- ⚡ Fast: Vite HMR for instant development updates
- 🚀 Optimized: Production builds are minified and tree-shaken
- 📦 Small: Code-split by route for faster loading
- 🔄 Real-time ready: Supabase subscriptions for live updates
- 💾 Indexed: Database queries optimized with indexes

## 🤝 Claude Code Integration

This project is **fully compatible with Claude Code**:
- ✅ Run locally with `npm run dev`
- ✅ Test all features before deploying
- ✅ Edit database schema and re-run migrations
- ✅ Iterate on React components with hot reload
- ✅ Debug with browser DevTools
- ✅ Auto-deploy to Netlify on git push

## 🆚 vs Google Apps Script Version

| Feature | Supabase + Netlify | Google Apps Script |
|---------|-------------------|-------------------|
| **Performance** | Fast (PostgreSQL) | Slower (Sheets API) |
| **Scalability** | Thousands of properties | ~1000 rows max |
| **Local Development** | ✅ Full local testing | ❌ Cloud only |
| **Claude Code Help** | ✅ Full support | ⚠️ Limited |
| **Deployment** | Auto (Git push) | Manual |
| **Cost** | Free tier generous | Free |
| **Real-time Updates** | ✅ Built-in | ❌ No |
| **Modern Features** | ✅ React, routing, etc. | ❌ Basic HTML |
| **Database Flexibility** | ✅ Full SQL | ❌ Sheets only |

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart dev server after changing `.env`

### Database connection fails
- Verify Supabase project is active
- Check API keys in Supabase dashboard (Settings > API)
- Ensure `schema.sql` was run successfully

### Build fails on Netlify
- Check Node version is 18+ (set in `netlify.toml`)
- Verify environment variables are set in Netlify dashboard
- Check build logs for specific errors

### Properties not loading
- Open browser console (F12) and check for errors
- Verify Supabase tables exist (`properties`, `dropdown_options`)
- Check network tab for failed API requests

## 📝 Environment Variables

Required for deployment:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

Get these from: Supabase Dashboard → Settings → API

## 🎓 Next Steps

1. ✅ Deploy to Netlify
2. ✅ Share URL with Kalen (property manager)
3. ✅ Start entering property data
4. 📱 Test on tablet (optimized for touch)
5. 📊 Monitor completeness scores
6. 🔄 Update properties regularly

## 🔮 Future Enhancements (Phase 2)

- [ ] Steps 6-10: Features, Management, Performance, Notes, Review
- [ ] Export to CSV/Excel
- [ ] Bulk operations
- [ ] Property photos upload
- [ ] Analytics dashboard with charts
- [ ] Mobile app (React Native)
- [ ] Email notifications for maintenance
- [ ] Document storage (leases, inspections)
- [ ] Multi-user with authentication

## 📄 License

Proprietary - Built for internal property management use

## 👤 Author

Built with Claude Code for real estate property management.

**Version**: 2.0.0 (Supabase + Netlify)
**Last Updated**: 2025-10-29

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed setup instructions.
