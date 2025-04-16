import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConsultationSchema, insertAvailableSlotSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // In a real application, you would save this to a database
      // or send an email notification
      
      res.status(200).json({ 
        success: true,
        message: 'Message received successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while processing your request' 
      });
    }
  });

  // API route for newsletter subscription
  app.post('/api/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate email
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // In a real application, you would add this to a mailing list
      
      res.status(200).json({ 
        success: true,
        message: 'Subscription successful' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while processing your request' 
      });
    }
  });
  
  // ========== CONSULTATION BOOKING API ROUTES ==========
  
  // Get all services
  app.get('/api/services', async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.status(200).json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching services' 
      });
    }
  });
  
  // Get a specific service
  app.get('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid service ID' });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.status(200).json(service);
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching the service' 
      });
    }
  });
  
  // Get available slots
  app.get('/api/available-slots', async (req: Request, res: Response) => {
    try {
      // Use today's date if no date parameter is provided
      const fromDate = req.query.fromDate 
        ? new Date(req.query.fromDate as string) 
        : new Date();
      
      // If the date is invalid, use today's date
      if (isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
      }
      
      const slots = await storage.getAvailableSlots(fromDate);
      res.status(200).json(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching available slots' 
      });
    }
  });
  
  // Create a new available slot (admin only in a real application)
  app.post('/api/available-slots', async (req: Request, res: Response) => {
    try {
      // Validate slot data
      const result = insertAvailableSlotSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid slot data',
          errors: result.error.errors
        });
      }
      
      const newSlot = await storage.createAvailableSlot(result.data);
      res.status(201).json(newSlot);
    } catch (error) {
      console.error('Error creating available slot:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while creating the available slot' 
      });
    }
  });
  
  // Book a consultation
  app.post('/api/consultations', async (req: Request, res: Response) => {
    try {
      // Validate consultation data
      const result = insertConsultationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid consultation data',
          errors: result.error.errors
        });
      }
      
      // Check if the slot exists and is available
      const slot = await storage.getAvailableSlot(result.data.slotId);
      if (!slot) {
        return res.status(404).json({ 
          success: false,
          message: 'The selected time slot does not exist' 
        });
      }
      
      if (slot.isBooked) {
        return res.status(400).json({ 
          success: false,
          message: 'This time slot is already booked' 
        });
      }
      
      // Check if the service exists
      const service = await storage.getService(result.data.serviceId);
      if (!service) {
        return res.status(404).json({ 
          success: false,
          message: 'The selected service does not exist' 
        });
      }
      
      // Create the consultation
      const newConsultation = await storage.createConsultation(result.data);
      res.status(201).json({
        success: true,
        message: 'Consultation booked successfully',
        consultation: newConsultation
      });
    } catch (error) {
      console.error('Error booking consultation:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while booking the consultation' 
      });
    }
  });
  
  // Get a specific consultation
  app.get('/api/consultations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid consultation ID' });
      }
      
      const consultation = await storage.getConsultation(id);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }
      
      res.status(200).json(consultation);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching the consultation' 
      });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
