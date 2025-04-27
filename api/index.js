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

// For Vercel, we need to include the schema directly
// In production, you would properly import this from shared/schema.ts
const { eq } = require('drizzle-orm');
// Define schema here for Vercel (simplified version)
// The actual schema would come from shared/schema.ts
const services = {
  id: { name: 'id' }
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
    const services = await db.query.services.findMany();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // For Vercel, using a simplified query approach
    const [service] = await db.execute(`SELECT * FROM services WHERE id = $1`, [parseInt(id)]);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
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
    
    // Here we would use the actual query with filters
    const slots = await db.query.availableSlots.findMany();
    
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

// Export for Vercel serverless function
module.exports = app;