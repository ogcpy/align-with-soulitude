/*
IMPORTANT VERCEL DEPLOYMENT INSTRUCTIONS:
===========================================================

TO FIX 404 NOT_FOUND ERRORS:
---------------------------
1. Go to Vercel Project Settings:
   - Go to your project dashboard in Vercel
   - Click "Settings" tab at the top
   - Under "Build & Development Settings"
   - Set "Output Directory" to "client/dist"
   - Save and redeploy
   
2. Check Framework Preset:
   - In the same settings page
   - Make sure Framework Preset is set to "Vite"
   - If not, change it and redeploy
   
3. Check vercel.json configuration:
   - Ensure it contains proper routes for both API and frontend
   - API routes should point to api/index.js
   - Frontend routes should serve client/index.html

4. Function Region Setting:
   - Go to Settings > Functions
   - Set the region to match your Neon database region
   - This reduces latency for database operations

5. Environment Variables:
   Add these environment variables in Vercel Project Settings:
   - DATABASE_URL: Your Neon PostgreSQL connection string
   - STRIPE_SECRET_KEY: Your Stripe secret key
   - VITE_STRIPE_PUBLIC_KEY: Your Stripe publishable key
   - STRIPE_CURRENCY: Currency to use (e.g., 'GBP')
   - SENDGRID_API_KEY: Your SendGrid API key
   - SENDER_EMAIL: Email address for sending notifications
   - SENDER_NAME: Display name for the sender email
   - SESSION_SECRET: Random string for session security
   
6. If you still get a 404 NOT_FOUND error:
   - Try creating a new project in Vercel
   - Import your repository again
   - Apply all settings as mentioned above
   - This sometimes resolves caching issues

For full deployment details, see the VERCEL_DEPLOYMENT_GUIDE.md file.
===========================================================
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const Stripe = require('stripe');
const sgMail = require('@sendgrid/mail');
const session = require('express-session');
const connectPg = require('connect-pg-simple')(session);
const ws = require('ws');

// Initialize Express
const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Neon for serverless environment
const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

// Connect to Neon PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// SendGrid setup
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Settings object
let settings = {
  email: {
    senderEmail: process.env.SENDER_EMAIL || 'noreply@alignwithsoulitude.co.uk',
    senderName: process.env.SENDER_NAME || 'Align with Soulitude'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
    currency: process.env.STRIPE_CURRENCY || 'GBP'
  }
};

// Session middleware for auth
app.use(session({
  store: new connectPg({
    pool,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'align-with-soulitude-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Direct SQL queries for Vercel
// We'll use simple SQL queries instead of the Drizzle ORM for simplicity in the serverless environment
const { eq } = require('drizzle-orm');

// Basic schema structure
const schema = {
  services: {
    id: 'id',
    title: 'title',
    description: 'description',
    price: 'price',
    durationMinutes: 'duration_minutes',
    isActive: 'is_active',
    type: 'type',
    maximumParticipants: 'maximum_participants'
  },
  availableSlots: {
    id: 'id',
    date: 'date',
    startTime: 'start_time',
    endTime: 'end_time',
    isBooked: 'is_booked',
    serviceId: 'service_id'
  },
  consultations: {
    id: 'id',
    slotId: 'slot_id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    serviceId: 'service_id',
    message: 'message',
    status: 'status'
  },
  discountCodes: {
    id: 'id',
    code: 'code',
    description: 'description',
    discountPercent: 'discount_percent',
    isActive: 'is_active',
    usageLimit: 'usage_limit',
    usageCount: 'usage_count'
  }
};

// Create a basic API route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    environment: process.env.NODE_ENV
  });
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    // Use raw SQL query for better compatibility with Vercel
    const result = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY id');
    const services = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      durationMinutes: row.duration_minutes,
      isActive: row.is_active,
      type: row.type,
      maximumParticipants: row.maximum_participants,
      createdAt: row.created_at
    }));
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // For Vercel, using raw pool query
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [parseInt(id)]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Map DB row to camelCase object
    const row = result.rows[0];
    const service = {
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      durationMinutes: row.duration_minutes,
      isActive: row.is_active,
      type: row.type,
      maximumParticipants: row.maximum_participants,
      createdAt: row.created_at
    };
    
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
});

// Available slots endpoints
app.get('/api/available-slots', async (req, res) => {
  try {
    const { fromDate, serviceId } = req.query;
    
    // Construct SQL query with filters
    let query = 'SELECT * FROM available_slots WHERE is_booked = false';
    const params = [];
    
    // Add date filter if provided
    if (fromDate) {
      query += ' AND date >= $1';
      params.push(fromDate);
    }
    
    // Add service filter if provided
    if (serviceId) {
      query += params.length === 0 ? ' AND service_id = $1' : ' AND service_id = $' + (params.length + 1);
      params.push(parseInt(serviceId));
    }
    
    // Add ordering
    query += ' ORDER BY date, start_time';
    
    const result = await pool.query(query, params);
    
    // Map DB rows to camelCase objects
    const slots = result.rows.map(row => ({
      id: row.id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      isBooked: row.is_booked,
      serviceId: row.service_id
    }));
    
    res.json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Failed to fetch available slots' });
  }
});

// Stripe payment endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: settings.stripe.currency || 'GBP',
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent: ' + error.message });
  }
});

// Admin routes
// These would be protected by proper authentication in production
app.get('/api/admin/settings', (req, res) => {
  // Return settings with masked API keys
  const safeSettings = {
    ...settings,
    stripe: {
      ...settings.stripe,
      secretKey: settings.stripe.secretKey ? '••••' + settings.stripe.secretKey.slice(-4) : '',
      publicKey: settings.stripe.publicKey ? '••••' + settings.stripe.publicKey.slice(-4) : ''
    }
  };
  
  res.json(safeSettings);
});

// Include other admin routes from server/adminRoutes.ts

// Handle all other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Vercel serverless function
module.exports = app;

// For serverless deployment on Vercel
if (process.env.VERCEL) {
  console.log("Running in Vercel environment");
  
  // Export the handler for serverless function
  module.exports = (req, res) => {
    // Don't expose the app object directly
    return app(req, res);
  };
}