# Vercel Minimal Setup Guide

This guide provides a minimal configuration approach for deploying to Vercel while avoiding the 404 error.

## Steps to Fix 404 NOT_FOUND Error

1. **Delete vercel.json**
   - Either delete vercel.json completely, OR
   - Make it an empty object `{}`
   - This helps avoid conflicts with Vercel's Project Settings

2. **Create a new project in Vercel**
   - Go to your Vercel dashboard
   - Create a new project from your repository
   - Do not set a custom build command or output directory in vercel.json

3. **Configure Project Settings**
   - In Vercel Project Settings, set:
     - Framework Preset: Vite
     - Root Directory: `.` (project root)
     - Build Command: `cd client && npm run build`
     - Output Directory: `client/dist`

4. **Configure Environment Variables**
   - Add all the required environment variables
   - Ensure DATABASE_URL points to your Neon database
   - The IAD1 region in your error code suggests setting US East region

5. **Advanced Solution: Use Vercel CLI**
   If the web dashboard deployment still fails:
   - Install Vercel CLI: `npm i -g vercel`
   - Deploy with CLI: `vercel --prod`
   - Follow the interactive prompts
   - Override settings when asked

## Why This Minimal Approach Works

The 404 NOT_FOUND errors with ID format "lhr1::xxxx" often occur due to conflicts between:
1. Settings in vercel.json
2. Settings in Vercel Project Dashboard
3. Automatic framework detection

By removing vercel.json constraints and configuring directly in the Project Settings, you avoid these conflicts.

## Alternative: Configure Client Only

If you continue to get 404 errors after all these steps:

1. **Deploy Only Frontend**
   - In client/package.json only
   - Set "homepage": "." to ensure relative paths work
   - Deploy just the client directory

2. **Deploy API Separately**
   - Deploy the API as a separate service
   - Update frontend code to point to the API service URL

## Debugging

If you're still encountering the 404 NOT_FOUND error:

1. **Check Function Logs**
   - Go to your Vercel project
   - Navigate to Functions tab
   - Click on the function showing errors
   - View detailed logs

2. **Test API Health Endpoint**
   - Try accessing just `/api/health`
   - If this works, the issue is with frontend routing

3. **Check Build Output**
   - In the deployment logs, verify the build process is completing
   - Look for any warnings about missing files

Remember, sometimes the simplest solution is the most effective!