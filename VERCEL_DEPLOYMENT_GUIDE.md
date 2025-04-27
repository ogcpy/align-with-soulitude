# Deploying Align with Soulitude to Vercel

This guide walks you through deploying the Align with Soulitude application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Git](https://git-scm.com/) installed locally (optional, for GitHub deployment)
3. Your API keys and credentials for:
   - Neon PostgreSQL database
   - Stripe payment processing
   - SendGrid email service

## Deployment Steps

### Option 1: Deploy from GitHub Repository

1. **Push your code to GitHub**
   - Create a new GitHub repository
   - Push your code to the repository

2. **Import your repository to Vercel**
   - Login to Vercel
   - Click "Add New..." -> "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure project settings**
   - Leave the default settings as they are (Vercel will detect the project type)
   - Click "Deploy"

### Option 2: Deploy from Local Directory

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy your project**
   ```bash
   # Login to Vercel
   vercel login

   # Deploy from the project directory
   vercel
   ```

3. **Follow the prompts to complete deployment**

## Environment Variables Setup

After deployment, add all required environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" -> "Environment Variables"
3. Add the following variables:

### Database Connection
- `DATABASE_URL`: Your Neon PostgreSQL connection string
  Example: `postgresql://username:password@hostname:port/database`

### Stripe API Keys
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with "sk_")
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key (starts with "pk_")
- `STRIPE_CURRENCY`: Set this to "GBP" for British Pounds

### SendGrid Email
- `SENDGRID_API_KEY`: Your SendGrid API key (starts with "SG.")
- `SENDER_EMAIL`: Email address for sending notifications (e.g., noreply@alignwithsoulitude.co.uk)
- `SENDER_NAME`: Name for sending notifications (e.g., Align with Soulitude)

### Session Security
- `SESSION_SECRET`: A random string used for encrypting sessions (make it long and complex)

### Node Environment
- `NODE_ENV`: Set to "production" for production deployment

## After Deployment

1. **Verify your deployment**
   - Visit your deployed application at the provided Vercel URL
   - Test key functionalities like:
     - Browsing services
     - Booking consultations
     - Payment processing
     - Admin functionality

2. **Set up a custom domain (optional)**
   - In the Vercel dashboard, go to your project
   - Navigate to "Settings" -> "Domains"
   - Add your custom domain and follow the instructions

## Troubleshooting

If you encounter issues with the deployment:

### Fixing 404 NOT_FOUND Errors

If you see a 404 NOT_FOUND error after deployment (especially with error code like "404: NOT_FOUND Code: NOT_FOUND ID: lhr1::xxxxxx"), try these solutions in order:

**IMPORTANT:** This specific error indicates a problem with how Vercel is handling the routes and build output. Follow these steps carefully to fix it.

1. **Update Project Settings**:
   - Go to your project in the Vercel dashboard
   - Navigate to "Settings" > "Build & Development Settings"
   - Set the "Framework Preset" to "Vite"
   - Set the "Output Directory" to `client/dist`
   - Make sure "Install Command" is set to `npm install`
   - Make sure "Build Command" is set to `npm run build` 
   - Click "Save"
   - Go to the "Deployments" tab and click "Redeploy" on your latest deployment

2. **Check Function Region**:
   - Go to "Settings" > "Functions"
   - Set the region to be the same as your Neon database region (e.g., "iad1" for US East, "fra1" for Europe)
   - Redeploy your project

3. **Verify API Routes**:
   - Test a simple API endpoint like `/api/health` to see if the API is accessible
   - If API routes work but the frontend doesn't, check the `vercel.json` routing configuration

4. **Inspect Deployment**:
   - Go to "Deployments" and click on your latest deployment
   - Select "Functions" to see your serverless functions
   - Check if the `/api/index.js` function is listed and has no errors

5. **Try a Fresh Deployment**:
   - Create a new Vercel project
   - Import your repository again
   - Apply all settings as mentioned above
   - This often resolves caching or configuration issues

6. **Fix for "404: NOT_FOUND Code: NOT_FOUND ID: lhr1::xxxxxx" Error**:
   If you see this specific error format:
   - The issue is usually related to the `vercel.json` configuration
   - Try updating `vercel.json` with this configuration:
     ```json
     {
       "version": 2,
       "builds": [
         { "src": "api/index.js", "use": "@vercel/node" },
         { 
           "src": "package.json", 
           "use": "@vercel/static-build", 
           "config": { 
             "distDir": "client/dist"
           }
         }
       ],
       "routes": [
         {
           "src": "/api/(.*)",
           "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
           "headers": {
             "Access-Control-Allow-Origin": "*",
             "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
             "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Authorization"
           },
           "dest": "/api/index.js"
         },
         { "src": "/assets/(.*)", "dest": "/client/dist/assets/$1" },
         { "src": "/videos/(.*)", "dest": "/client/dist/videos/$1" },
         { "src": "/images/(.*)", "dest": "/client/dist/images/$1" },
         { "src": "/favicon.ico", "dest": "/client/dist/favicon.ico" },
         { "src": "/(.*)\\.js", "dest": "/client/dist/$1.js" },
         { "src": "/(.*)\\.css", "dest": "/client/dist/$1.css" },
         { "handle": "filesystem" },
         { "src": "/(.*)", "dest": "/client/dist/index.html" }
       ]
     }
     ```
   - Make sure the `distDir` value matches your project's output directory

7. **Modify the Build Process (Advanced)**:
   If all other solutions fail:
   - Try modifying your package.json build script:
     ```json
     "build": "vite build && cp -r client/dist dist"
     ```
   - This creates a duplicate of the dist folder at the root level
   - Then in your Vercel project settings, set the Output Directory to just `dist`

### Other Common Issues

1. **Check environment variables**
   - Ensure all required environment variables are correctly set
   - Verify API keys are valid and correctly formatted

2. **Check deployment logs**
   - In the Vercel dashboard, go to your project
   - Navigate to "Deployments" and select the latest deployment
   - Check the build and function logs for any errors

3. **Test API endpoints**
   - Use a tool like Postman to test API endpoints directly
   - Check for any CORS issues

4. **Database connection issues**
   - Ensure your Neon PostgreSQL database is accessible from Vercel
   - Verify the database URL format is correct
   - Check if your database requires SSL connection
   
5. **API keys issues**
   - Verify all API keys are correctly formatted and have necessary permissions
   - For Stripe, ensure both secret and publishable keys are set

6. **Performance issues**
   - If operations take too long, adjust function timeout in Vercel settings
   - Consider optimizing database queries and API responses