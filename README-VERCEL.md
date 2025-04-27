# Align with Soulitude - Vercel Deployment Guide

## About This Project

A modern wellness platform for "Align with Soulitude" offering spiritual alignment services, sound healing, oracle readings, and more. The platform includes a streamlined booking experience and administrative tools for managing services, appointments, and client interactions.

## Performance Optimizations

This project has been optimized for deployment on Vercel with several performance enhancements:

1. **Lazy Loading**: Non-critical components and routes are lazy-loaded to improve initial page load time
2. **Dynamic Video Loading**: Hero video is loaded asynchronously with a loading indicator
3. **Image Optimization**: Images use the LazyImage component for efficient loading with placeholders
4. **Resource Preloading**: Critical resources are preloaded in the background
5. **Animations Performance**: Testimonial scrolling uses requestAnimationFrame for smoother performance
6. **API Optimization**: The API has been structured for Vercel serverless functions

## Deployment Instructions

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. Your API keys for:
   - Neon PostgreSQL database (`DATABASE_URL`)
   - Stripe payment processing (`STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`)
   - Twilio SendGrid for email notifications (`SENDGRID_API_KEY`)

### Option 1: Deploy from GitHub

1. Upload this project to a GitHub repository
2. Log in to your Vercel account
3. Click "New Project" and import your repository
4. Configure the build settings:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add all environment variables (see below)
6. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI globally:
   ```
   npm i -g vercel
   ```

2. Navigate to the project directory and run:
   ```
   vercel
   ```

3. Follow the prompts to link to your Vercel account and project

### Required Environment Variables

Make sure to add these environment variables in your Vercel project settings:

```
# Database
DATABASE_URL=your_neon_postgresql_connection_string

# Stripe API Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_CURRENCY=GBP

# SendGrid Email
SENDGRID_API_KEY=your_sendgrid_api_key
SENDER_EMAIL=noreply@alignwithsoulitude.co.uk
SENDER_NAME=Align with Soulitude

# Session Security
SESSION_SECRET=your_random_secret_string

# Node Environment
NODE_ENV=production
```

## Project Structure

- `/api`: Contains Vercel serverless functions
- `/client`: React frontend application
- `/server`: Original Express backend (used for development)
- `/shared`: Shared types and schemas between frontend and backend

## Key Features

- **Booking System**: Calendar integration for service bookings
- **Payment Processing**: Secure payment with Stripe
- **Email Notifications**: Booking confirmations via SendGrid
- **Admin Panel**: Manage services, availability, and bookings
- **Discount Codes**: Support for promotional offers
- **Responsive Design**: Works on mobile, tablet, and desktop

## After Deployment

1. **Verify Services**: Check that all services are displayed correctly
2. **Test Booking Flow**: Complete a test booking to verify the process
3. **Check Admin Access**: Log in to the admin panel and verify functionality
4. **Monitor Logs**: Check Vercel logs for any issues

## Support

If you encounter any issues during deployment, check:

1. Environment variables are correctly set
2. Database connection is working
3. Vercel logs for any API or server errors

## License

This project is private and proprietary to Align with Soulitude.