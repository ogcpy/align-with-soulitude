# Align with Soulitude

A wellness platform offering spiritual alignment services and online booking.

## Project Overview

This project is a React-based wellness platform for "Align with Soulitude" that offers a streamlined, intuitive booking experience with advanced administrative tools and personalized user interactions.

### Features

- Online consultation booking system
- Availability calendar with time slot selection
- Secure payment processing with Stripe
- Admin dashboard for managing appointments
- Email confirmations via SendGrid
- Responsive design for all devices

## Technology Stack

- **Frontend**: React.js with Shadcn UI components
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Form Validation**: Zod
- **Email**: SendGrid
- **Payments**: Stripe
- **Authentication**: Custom admin auth

## Deployment Instructions

### Deploy on Netlify

1. **Connect to GitHub**:
   - Push this repository to GitHub
   - Log in to Netlify and click "New site from Git"
   - Select your GitHub repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   Set the following environment variables in the Netlify dashboard:

   - `DATABASE_URL` - Your Neon PostgreSQL connection URL
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
   - `SENDGRID_API_KEY` - SendGrid API key
   - `SESSION_SECRET` - Random string for session security
   - `SENDER_EMAIL` - Email address for sending notifications
   - `SENDER_NAME` - Name for sending notifications

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your site
   - You can set up a custom domain in the Netlify settings

### Update DNS Settings (for custom domain)

If you're using a custom domain:

1. Add your custom domain in the Netlify site settings
2. Update your domain's DNS settings to point to Netlify's servers
3. Netlify will automatically provision a free SSL certificate

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in a `.env` file
4. Start the development server: `npm run dev`

## Administrator Access

Administrative access is available through the /admin route after deployment. 

For security reasons:
1. Admin credentials must be set up during the first deployment
2. Use a strong, unique password for production
3. Keep your admin credentials secure and never share them

Author: Bhashana Davidson