# Deployment Guide - Property Master List

Complete step-by-step guide to deploy your Property Master List application using **Supabase + Netlify**.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- [ ] Git installed (for version control)
- [ ] GitHub account (free)
- [ ] Supabase account (free tier: [supabase.com](https://supabase.com))
- [ ] Netlify account (free tier: [netlify.com](https://netlify.com))

## Part 1: Set Up Supabase Database

### Step 1.1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in details:
   - **Name**: `property-master-list`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free
4. Click "Create new project"
5. Wait 2-3 minutes for database to initialize

### Step 1.2: Run Database Schema

1. In your Supabase project, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Open `supabase/schema.sql` from your project folder
4. Copy the ENTIRE file contents
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

### Step 1.3: Verify Database Tables

1. Click **Table Editor** (left sidebar)
2. You should see 2 tables:
   - `properties` (74+ columns)
   - `dropdown_options` (with pre-populated data)
3. Click `dropdown_options` - verify it has ~50+ rows of data

### Step 1.4: Get API Credentials

1. Click **Settings** (left sidebar, bottom)
2. Click **API** section
3. Copy these values (you'll need them soon):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

✅ **Supabase is ready!**

---

## Part 2: Set Up Local Development

### Step 2.1: Clone Project (if from GitHub)

```bash
cd ~/projects
git clone https://github.com/YOUR_USERNAME/master_property_data_gather.git
cd master_property_data_gather
```

Or if you already have the files locally, just navigate to the folder:

```bash
cd master_property_data_gather
```

### Step 2.2: Install Dependencies

```bash
npm install
```

This installs React, Supabase client, and all other dependencies (~2-3 minutes).

### Step 2.3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

⚠️ **Important**: Never commit `.env` to Git (it's already in `.gitignore`)

### Step 2.4: Test Locally

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### Step 2.5: Verify Everything Works

1. Dashboard loads with 0 properties
2. Click "Add New Property"
3. Fill in Step 2 (Basic Info) with test data:
   - Address: `123 Test St`
   - City: `Dallas`
   - State: `TX`
   - ZIP: `75201`
   - Property Type: `Single Family`
   - Bedrooms: `3`
   - Bathrooms: `2`
4. Click "Save & Continue"
5. You should see "Saved successfully!"
6. Continue through all 5 steps
7. Return to Dashboard - your property should appear!

✅ **Local development working!**

---

## Part 3: Deploy to Netlify

### Option A: Deploy via Git (Recommended)

#### Step 3A.1: Push to GitHub

1. Create a new GitHub repository:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: `property-master-list`
   - Set to Private (recommended)
   - Don't initialize with README
   - Click "Create repository"

2. Push your code:
   ```bash
   git add .
   git commit -m "Initial commit - Supabase + Netlify version"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/property-master-list.git
   git push -u origin main
   ```

#### Step 3A.2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" > "Import an existing project"
3. Click "GitHub" (or your Git provider)
4. Authorize Netlify to access your repositories
5. Select `property-master-list` repository
6. Configure build settings:
   - **Branch**: `main`
   - **Build command**: `npm run build` (auto-detected)
   - **Publish directory**: `dist` (auto-detected)
7. Click "Show advanced" > "New variable"
8. Add environment variables:
   - Variable 1:
     - Key: `VITE_SUPABASE_URL`
     - Value: `https://xxxxx.supabase.co` (your Supabase URL)
   - Variable 2:
     - Key: `VITE_SUPABASE_ANON_KEY`
     - Value: `eyJhbGc...` (your Supabase anon key)
9. Click "Deploy site"

#### Step 3A.3: Wait for Build

- Watch the deploy log (usually 2-3 minutes)
- Build should succeed with "Site is live ✓"
- Copy your Netlify URL: `https://your-site-name.netlify.app`

#### Step 3A.4: Test Production Site

1. Open your Netlify URL
2. Dashboard should load (empty at first)
3. Add a property through the wizard
4. Verify it saves and appears in the dashboard

✅ **Deployed to Netlify via Git!**

**Future Updates**: Just `git push` - Netlify auto-deploys!

---

### Option B: Manual Deploy (Alternative)

If you don't want to use Git:

```bash
# Build production version
npm run build

# Install Netlify CLI (first time only)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Follow prompts:
# - Create & configure new site: Yes
# - Publish directory: dist
```

Then manually add environment variables in Netlify dashboard:
1. Go to your site settings
2. Build & deploy > Environment
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Part 4: Post-Deployment

### Step 4.1: Custom Domain (Optional)

1. In Netlify, go to **Domain settings**
2. Click "Add custom domain"
3. Follow DNS setup instructions
4. Example: `properties.yourdomain.com`

### Step 4.2: Share with Team

1. Copy your production URL
2. Share with Kalen (property manager)
3. No login required - just access the URL
4. Bookmark on tablet for easy access

### Step 4.3: Monitor Usage

- Supabase dashboard shows database size and API calls
- Free tier limits:
  - 500 MB database
  - 2 GB bandwidth/month
  - 50,000 monthly active users
- Should be more than enough for 75 properties!

---

## Part 5: Making Updates

### Method 1: Update via Git (if using Git deployment)

```bash
# Make changes to code
# ... edit files ...

# Commit and push
git add .
git commit -m "Add new feature or fix bug"
git push

# Netlify auto-deploys in ~2 minutes
```

### Method 2: Manual Update

```bash
npm run build
netlify deploy --prod
```

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**:
- Check `.env` file exists with correct values
- Restart dev server: `Ctrl+C` then `npm run dev`
- On Netlify: Add environment variables in site settings

### Issue: "Failed to fetch properties"

**Solution**:
- Verify Supabase project is active
- Check API keys in Supabase Settings > API
- Ensure `schema.sql` was run successfully
- Open browser console (F12) for detailed error

### Issue: Build fails on Netlify

**Solution**:
- Check build logs for specific error
- Verify `package.json` has all dependencies
- Ensure Node version is 18+ (set in `netlify.toml`)
- Check environment variables are set correctly

### Issue: Properties not saving

**Solution**:
- Check browser console (F12) for errors
- Verify internet connection
- Check Supabase dashboard for any service issues
- Ensure required fields are filled (marked with *)

### Issue: Slow performance

**Solution**:
- Supabase free tier has geographic limitations
- Consider upgrading to Pro ($25/month) for better performance
- Alternatively, use Netlify Edge Functions for caching

---

## 📊 Monitoring & Maintenance

### Weekly Tasks
- Check data completeness scores
- Verify backups (Supabase does this automatically)
- Review any error logs in Netlify

### Monthly Tasks
- Update dropdown options if needed
- Review Supabase usage in dashboard
- Check for any security updates: `npm outdated`

### Database Backups

Supabase automatically backs up your database daily. To manually backup:

1. Supabase Dashboard > Settings > Database
2. Click "Download backup"
3. Save the SQL file to a safe location

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` to Git
2. **API Keys**: Keep Supabase keys secret
3. **Updates**: Run `npm audit` monthly for security patches
4. **Access Control**: Consider enabling Supabase RLS (Row Level Security)
5. **HTTPS**: Always use HTTPS (Netlify provides this free)

---

## 💰 Cost Breakdown

### Free Tier (Plenty for 75 properties)
- **Netlify**: 100 GB bandwidth/month, 300 build minutes/month
- **Supabase**: 500 MB database, 2 GB bandwidth/month
- **Total**: $0/month

### If You Outgrow Free Tier
- **Netlify Pro**: $19/month (1 TB bandwidth)
- **Supabase Pro**: $25/month (8 GB database, better performance)
- **Total**: $44/month (unlikely needed for 75 properties)

---

## 🎓 Next Steps

After successful deployment:

1. ✅ Test thoroughly with 2-3 properties
2. ✅ Train Kalen on how to use the system
3. ✅ Start entering data for all 75 properties
4. ✅ Set up regular backup schedule (monthly download)
5. ✅ Bookmark the site on all tablets
6. ✅ Add to home screen on mobile devices

---

## 📞 Support Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **React Docs**: [react.dev](https://react.dev)

---

## ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] API credentials copied
- [ ] Local `.env` file configured
- [ ] `npm install` completed
- [ ] Local development tested (`npm run dev`)
- [ ] Test property created and saved
- [ ] Code pushed to GitHub
- [ ] Netlify site created
- [ ] Environment variables added to Netlify
- [ ] Production build successful
- [ ] Production site tested
- [ ] Team members notified of URL
- [ ] Tablet testing completed

---

**Congratulations!** 🎉 Your Property Master List is now live and ready to use!
