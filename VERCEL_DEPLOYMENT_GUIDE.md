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

4. **Common issues**
   - Database connection: Ensure your Neon PostgreSQL database is accessible from Vercel
   - API keys: Verify all API keys are correctly formatted and have necessary permissions
   - Serverless function timeout: If operations take too long, adjust function timeout in Vercel settings