# Vercel 404 Error Fix

This guide provides a step-by-step solution for the specific 404 NOT_FOUND error with ID format "lhr1::xxxx" that you're experiencing on Vercel.

## Complete Checklist to Fix the Error

1. **Project Structure**
   - Ensure your project structure has the frontend code in the `/client` directory 
   - Make sure the API code is in the `/api` directory

2. **vercel.json Configuration**
   - Replace your vercel.json with this new version that doesn't use the "builds" section:
   ```json
   {
     "framework": "vite",
     "installCommand": "npm install",
     "buildCommand": "cd client && npm run build",
     "outputDirectory": "client/dist",
     "rewrites": [
       { "source": "/api/:path*", "destination": "/api/index.js" }
     ],
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           { "key": "Access-Control-Allow-Credentials", "value": "true" },
           { "key": "Access-Control-Allow-Origin", "value": "*" },
           { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
           { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
         ]
       }
     ]
   }
   ```

   > **IMPORTANT**: Your build log shows a warning about the "builds" section in vercel.json that conflicts with Project Settings. This new configuration removes that conflict.

3. **Update api/package.json**
   - Create or update your api/package.json file with necessary dependencies:
   ```json
   {
     "name": "api",
     "version": "1.0.0",
     "description": "API for Align with Soulitude",
     "main": "index.js",
     "dependencies": {
       "@neondatabase/serverless": "^0.10.4",
       "@sendgrid/mail": "^8.1.0",
       "body-parser": "^1.20.2",
       "connect-pg-simple": "^9.0.1",
       "cors": "^2.8.5",
       "drizzle-orm": "^0.30.3",
       "express": "^4.18.3",
       "express-session": "^1.18.0",
       "stripe": "^14.20.0",
       "ws": "^8.17.1"
     }
   }
   ```

4. **Create .vercelignore file**
   - Create a `.vercelignore` file in your project root with:
   ```
   README.md
   .git
   node_modules
   ```

5. **Delete any existing Vercel project**
   - Go to your Vercel dashboard
   - Delete your existing project (this clears any cached configurations)
   - Create a new project by importing your repository again

6. **Environment Variables**
   - Add all environment variables in Vercel Project Settings:
     - DATABASE_URL: Your Neon PostgreSQL connection string
     - STRIPE_SECRET_KEY: Your Stripe secret key
     - VITE_STRIPE_PUBLIC_KEY: Your Stripe publishable key
     - STRIPE_CURRENCY: Currency to use (e.g., 'GBP')
     - SENDGRID_API_KEY: Your SendGrid API key
     - SENDER_EMAIL: Email address for sending notifications
     - SENDER_NAME: Display name for the sender email
     - SESSION_SECRET: Random string for session security

7. **Function Region**
   - In Vercel settings, set the Function Region to the same region as your Neon database
   - For EU databases, use "fra1"
   - For US databases, use "iad1"

8. **Deployment Settings**
   - Ensure the Framework Preset is set to "Other"
   - Set Root Directory to `.` (the project root)

9. **Redeploy with fresh settings**
   - Trigger a new deployment after all these changes

## Debugging Steps If Error Persists

If you still encounter the 404 error after following all steps above:

1. **Check API Route First**
   - Try accessing `your-domain.vercel.app/api/health`
   - If this works but the frontend doesn't, the problem is with frontend routes

2. **Inspect Deployment Function Logs**
   - Go to your Vercel dashboard
   - Click on your project > Deployments > Latest deployment
   - Check the Function Logs for any errors

3. **Examine Build Output**
   - In the same deployment view, check the Build Logs
   - Verify that both API and frontend built successfully

4. **Simplify Frontend Temporarily**
   - Create a simple index.html in the client directory to test routing

5. **Contact Vercel Support**
   - If all else fails, contact Vercel support with your deployment URL and error details