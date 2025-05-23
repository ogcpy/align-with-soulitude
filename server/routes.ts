import { Express, Request, Response } from 'express';
import { pool, db } from './db';

/**
 * Register API routes for the application
 */
export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      // Check database connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      res.status(200).json({ 
        status: 'ok', 
        message: 'API is healthy',
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'development' ? error : 'Database connection error'
      });
    }
  });

  // Get all services
  app.get('/api/services', async (_req: Request, res: Response) => {
    try {
      const services = await db.query.services.findMany({
        where: (services, { eq }) => eq(services.is_active, true)
      });
      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ 
        message: 'Failed to fetch services',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Get a specific service by ID
  app.get('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [service] = await db.query.services.findMany({
        where: (services, { eq, and }) => and(
          eq(services.id, parseInt(id)),
          eq(services.is_active, true)
        )
      });
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json(service);
    } catch (error) {
      console.error(`Error fetching service ${req.params.id}:`, error);
      res.status(500).json({ 
        message: 'Failed to fetch service',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Get available booking slots
  app.get('/api/available-slots', async (req: Request, res: Response) => {
    try {
      const serviceId = req.query.serviceId ? parseInt(req.query.serviceId as string) : undefined;
      const date = req.query.date as string;
      
      // Build the query
      const query = db.query.available_slots.findMany({
        where: (slots, { eq, and, isNull }) => {
          const conditions = [eq(slots.is_booked, false)];
          
          if (serviceId) {
            conditions.push(eq(slots.service_id, serviceId));
          }
          
          if (date) {
            conditions.push(eq(slots.date, new Date(date)));
          }
          
          return and(...conditions);
        }
      });
      
      const slots = await query;
      res.json(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({ 
        message: 'Failed to fetch available slots',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  return app;
}