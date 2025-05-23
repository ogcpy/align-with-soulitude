import { Express, Request, Response } from 'express';
import { db } from './db.js';

// Middleware to check if user is admin
export const requireAdminAuth = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Admin authentication required' });
};

// Register admin routes
export function registerAdminRoutes(app: Express) {
  // Get all services (admin view)
  app.get('/api/admin/services', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const services = await db.query.services.findMany({
        orderBy: (services, { asc }) => [asc(services.title)]
      });
      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });
  
  // Create a new service
  app.post('/api/admin/services', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { title, description, image, price, duration, session_type, max_participants } = req.body;
      
      const [newService] = await db.insert(db.schema.services)
        .values({
          title,
          description,
          image,
          price,
          duration,
          session_type: session_type || 'one-on-one',
          max_participants: max_participants || 1,
          is_active: true,
          created_at: new Date()
        })
        .returning();
      
      res.status(201).json(newService);
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: 'Failed to create service' });
    }
  });
  
  // Update a service
  app.put('/api/admin/services/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, image, price, duration, is_active, session_type, max_participants } = req.body;
      
      const [updatedService] = await db.update(db.schema.services)
        .set({
          title,
          description,
          image,
          price,
          duration,
          is_active,
          session_type,
          max_participants
        })
        .where(({ id: serviceId }) => serviceId.equals(parseInt(id)))
        .returning();
      
      if (!updatedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json(updatedService);
    } catch (error) {
      console.error(`Error updating service ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update service' });
    }
  });
  
  // Delete a service
  app.delete('/api/admin/services/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if service exists
      const [service] = await db.query.services.findMany({
        where: (services, { eq }) => eq(services.id, parseInt(id))
      });
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      // Instead of deleting, mark as inactive
      await db.update(db.schema.services)
        .set({ is_active: false })
        .where(({ id: serviceId }) => serviceId.equals(parseInt(id)));
      
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error(`Error deleting service ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete service' });
    }
  });
  
  // Get all available slots (admin view)
  app.get('/api/admin/slots', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const serviceId = req.query.serviceId ? parseInt(req.query.serviceId as string) : undefined;
      const date = req.query.date as string;
      
      // Build the query
      let query = db.query.available_slots.findMany({
        orderBy: (slots, { asc }) => [asc(slots.date), asc(slots.start_time)]
      });
      
      const slots = await query;
      res.json(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      res.status(500).json({ message: 'Failed to fetch slots' });
    }
  });
  
  // Create a new slot
  app.post('/api/admin/slots', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { date, start_time, end_time, service_id, session_type, max_participants } = req.body;
      
      const [newSlot] = await db.insert(db.schema.available_slots)
        .values({
          date: new Date(date),
          start_time,
          end_time,
          service_id,
          session_type: session_type || 'individual',
          max_participants: max_participants || 1,
          is_booked: false,
          created_at: new Date()
        })
        .returning();
      
      res.status(201).json(newSlot);
    } catch (error) {
      console.error('Error creating slot:', error);
      res.status(500).json({ message: 'Failed to create slot' });
    }
  });
  
  // Update a slot
  app.put('/api/admin/slots/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { date, start_time, end_time, is_booked, service_id, session_type, max_participants } = req.body;
      
      const [updatedSlot] = await db.update(db.schema.available_slots)
        .set({
          date: date ? new Date(date) : undefined,
          start_time,
          end_time,
          is_booked,
          service_id,
          session_type,
          max_participants
        })
        .where(({ id: slotId }) => slotId.equals(parseInt(id)))
        .returning();
      
      if (!updatedSlot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      
      res.json(updatedSlot);
    } catch (error) {
      console.error(`Error updating slot ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update slot' });
    }
  });
  
  // Delete a slot
  app.delete('/api/admin/slots/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if slot exists
      const [slot] = await db.query.available_slots.findMany({
        where: (slots, { eq }) => eq(slots.id, parseInt(id))
      });
      
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      
      // Check if slot is booked
      if (slot.is_booked) {
        return res.status(400).json({ message: 'Cannot delete a booked slot' });
      }
      
      // Delete the slot
      await db.delete(db.schema.available_slots)
        .where(({ id: slotId }) => slotId.equals(parseInt(id)));
      
      res.json({ message: 'Slot deleted successfully' });
    } catch (error) {
      console.error(`Error deleting slot ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete slot' });
    }
  });
  
  // Get all bookings/consultations
  app.get('/api/admin/consultations', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const consultations = await db.query.consultations.findMany({
        orderBy: (consultations, { desc }) => [desc(consultations.created_at)]
      });
      
      res.json(consultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      res.status(500).json({ message: 'Failed to fetch consultations' });
    }
  });
}