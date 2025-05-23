# Align with Soulitude

A wellness platform offering holistic services including Sound Healing, Inner Dance & Kundalini, and Vedic Astrology Reading.

## Project Structure

This project is structured for deployment on Render with separate client and server applications:

- `/client` - React frontend
- `/server` - Node.js/Express backend API

## Local Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The client will be available at http://localhost:5173

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the environment variables in the `.env` file:
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Configure email settings (`SENDER_EMAIL`, `MAILCHIMP_TRANSACTIONAL_KEY`, etc.)
   - Set `STRIPE_SECRET_KEY` for payment processing

5. Start the development server:
   ```
   npm run dev
   ```

6. The API will be available at http://localhost:3001

## Deployment on Render

### Frontend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Select the `/client` directory as the root directory
4. Use the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview -- --port $PORT`
   - Environment Variables: Add `VITE_API_URL` pointing to your backend URL

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Select the `/server` directory as the root directory
4. Use the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: Set up all variables from `.env.example`, especially:
     - `DATABASE_URL` (Use a Render PostgreSQL instance)
     - `FRONTEND_URL` (Your frontend Render URL)
     - `SESSION_SECRET`
     - `STRIPE_SECRET_KEY`
     - `MAILCHIMP_TRANSACTIONAL_KEY` or `SENDGRID_API_KEY`

## API Documentation

The API provides the following endpoints:

- **User Authentication**
  - `/api/customer/login` - Customer login
  - `/api/customer/register` - Customer registration
  - `/api/customer/profile` - Get/update customer profile

- **Services & Bookings**
  - `/api/services` - Get available services
  - `/api/available-slots` - Get available booking slots
  - `/api/consultations` - Book a consultation
  
- **Admin Routes**
  - `/api/admin/login` - Admin login
  - `/api/admin/services` - Manage services
  - `/api/admin/slots` - Manage available slots
  - `/api/admin/consultations` - View and manage consultations

## Contact

For any questions or support, please contact the development team.