# 🚀 Deployment Guide

This guide will walk you through deploying your EduVerse Leaderboard to production using Supabase and Vercel.

## 📋 Prerequisites

- GitHub account
- Supabase account
- Vercel account
- Node.js 18+ installed locally

## 🗄️ Step 1: Set up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `eduverse-leaderboard`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 1.2 Set up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in **Table Editor**

### 1.3 Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 🔗 Step 2: Connect to GitHub

### 2.1 Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository details:
   - **Name**: `eduverse-leaderboard`
   - **Description**: "AI Code Evaluation Leaderboard System"
   - **Visibility**: Public or Private
   - **Initialize**: Don't check any boxes (we already have files)
4. Click "Create repository"

### 2.2 Push Your Code

```bash
# In your project directory
git remote add origin https://github.com/YOUR_USERNAME/eduverse-leaderboard.git
git branch -M main
git push -u origin main
```

## 🚀 Step 3: Deploy to Vercel

### 3.1 Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Click "Import Git Repository"
4. Find and select your `eduverse-leaderboard` repository
5. Click "Import"

### 3.2 Configure Project Settings

1. **Project Name**: `eduverse-leaderboard`
2. **Framework Preset**: Create React App
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: `cd client && npm run build`
5. **Output Directory**: `client/build`
6. Click "Deploy"

### 3.3 Set Environment Variables

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `NODE_ENV` | `development` | Development |

3. Click "Save" for each variable

### 3.4 Redeploy

1. Go to **Deployments** tab
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## 🧪 Step 4: Test Your Deployment

### 4.1 Test Frontend

1. Visit your Vercel URL (e.g., `https://eduverse-leaderboard.vercel.app`)
2. Verify the React app loads correctly
3. Check browser console for any errors

### 4.2 Test API Endpoints

Test the API endpoints using curl or Postman:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Create a challenge
curl -X POST https://your-app.vercel.app/api/challenges \
  -H "Content-Type: application/json" \
  -d '{"challengeId": "test-challenge", "title": "Test Challenge"}'

# Get leaderboard
curl https://your-app.vercel.app/api/challenges/test-challenge/leaderboard
```

### 4.3 Test Database Connection

1. Submit some test scores via the API
2. Check your Supabase dashboard to verify data is being stored
3. Verify the leaderboard updates correctly

## 🔧 Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate to be issued

## 📊 Step 6: Monitor and Maintain

### 6.1 Set up Monitoring

- **Vercel Analytics**: Enable in project settings
- **Supabase Monitoring**: Check database performance in dashboard
- **Error Tracking**: Consider adding Sentry or similar

### 6.2 Regular Maintenance

- Monitor database usage and performance
- Update dependencies regularly
- Review and rotate API keys periodically
- Monitor Vercel usage limits

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

**Database Connection Issues**
- Verify Supabase URL and key are correct
- Check Supabase project is not paused
- Verify RLS policies allow your operations

**API Errors**
- Check server logs in Vercel dashboard
- Verify API routes are correctly configured
- Test endpoints individually

### Getting Help

- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Create an issue in your GitHub repository

## 🎉 Success!

Your EduVerse Leaderboard is now live and ready for production use!

**Next Steps:**
- Share your live URL with users
- Set up monitoring and alerts
- Plan for scaling as usage grows
- Consider adding authentication for user management

---

**Live URL**: `https://your-app.vercel.app`
**GitHub Repository**: `https://github.com/YOUR_USERNAME/eduverse-leaderboard`
**Supabase Dashboard**: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
