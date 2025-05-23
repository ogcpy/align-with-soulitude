import { Express, Request, Response, NextFunction } from 'express';
import { hashPassword, comparePasswords } from './auth';
import { db } from './db';
import crypto from 'crypto';

// Middleware to check if a customer is authenticated
export const requireCustomerAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.customer) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Generate a random token for email verification or password reset
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Set up customer authentication routes
export function setupCustomerAuth(app: Express) {
  // Customer registration
  app.post('/api/customer/register', async (req: Request, res: Response) => {
    try {
      const { email, name, phone, password } = req.body;
      
      // Check if customer already exists
      const existingCustomer = await db.query.customers.findMany({
        where: (customers, { eq }) => eq(customers.email, email)
      });
      
      if (existingCustomer.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Generate verification token
      const verificationToken = generateToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hour expiry
      
      // Create the customer with hashed password
      const hashedPassword = await hashPassword(password);
      
      const [customer] = await db.insert(db.schema.customers)
        .values({
          email,
          name,
          phone,
          password: hashedPassword,
          verification_token: verificationToken,
          verification_token_expiry: tokenExpiry,
          is_verified: false,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      
      // TODO: Send verification email
      
      // Store customer in session
      req.session.customer = {
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
      
      // Return customer data (without sensitive fields)
      const { password: _, verification_token: __, ...safeCustomer } = customer;
      res.status(201).json(safeCustomer);
    } catch (error) {
      console.error('Customer registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  // Customer login
  app.post('/api/customer/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find customer by email
      const [customer] = await db.query.customers.findMany({
        where: (customers, { eq }) => eq(customers.email, email)
      });
      
      // If customer doesn't exist or password doesn't match
      if (!customer || !(await comparePasswords(password, customer.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Update last login timestamp
      await db.update(db.schema.customers)
        .set({ last_login: new Date() })
        .where(({ id }) => id.equals(customer.id));
      
      // Store customer in session
      req.session.customer = {
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
      
      // Return customer data (without sensitive fields)
      const { password: _, reset_token: __, verification_token: ___, ...safeCustomer } = customer;
      res.json(safeCustomer);
    } catch (error) {
      console.error('Customer login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  // Customer logout
  app.post('/api/customer/logout', (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } else {
      res.json({ message: 'Already logged out' });
    }
  });
  
  // Get customer profile
  app.get('/api/customer/profile', requireCustomerAuth, async (req: Request, res: Response) => {
    try {
      const customerId = req.session.customer.id;
      
      const [customer] = await db.query.customers.findMany({
        where: (customers, { eq }) => eq(customers.id, customerId)
      });
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Return customer data (without sensitive fields)
      const { password: _, reset_token: __, verification_token: ___, ...safeCustomer } = customer;
      res.json(safeCustomer);
    } catch (error) {
      console.error('Get customer profile error:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });
  
  // Update customer profile
  app.put('/api/customer/profile', requireCustomerAuth, async (req: Request, res: Response) => {
    try {
      const customerId = req.session.customer.id;
      const { email, phone } = req.body;
      
      // Update customer data
      const [updatedCustomer] = await db.update(db.schema.customers)
        .set({
          email,
          phone,
          updated_at: new Date()
        })
        .where(({ id }) => id.equals(customerId))
        .returning();
      
      // Return updated customer data (without sensitive fields)
      const { password: _, reset_token: __, verification_token: ___, ...safeCustomer } = updatedCustomer;
      res.json(safeCustomer);
    } catch (error) {
      console.error('Update customer profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });
  
  // Get customer consultations
  app.get('/api/customer/consultations', requireCustomerAuth, async (req: Request, res: Response) => {
    try {
      const customerId = req.session.customer.id;
      
      const consultations = await db.query.consultations.findMany({
        where: (consultations, { eq }) => eq(consultations.customer_id, customerId),
        orderBy: (consultations, { desc }) => [desc(consultations.created_at)]
      });
      
      res.json(consultations);
    } catch (error) {
      console.error('Get customer consultations error:', error);
      res.status(500).json({ message: 'Failed to fetch consultations' });
    }
  });
}