import { pgTable, text, serial, integer, boolean, timestamp, varchar, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Services offered by "Align with Soulitude"
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  price: integer("price"),
  duration: integer("duration"), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  title: true,
  description: true,
  image: true,
  price: true,
  duration: true,
  isActive: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Available time slots for consultations
export const availableSlots = pgTable("available_slots", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isBooked: boolean("is_booked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAvailableSlotSchema = createInsertSchema(availableSlots).pick({
  date: true,
  startTime: true,
  endTime: true,
  isBooked: true,
});

export type InsertAvailableSlot = z.infer<typeof insertAvailableSlotSchema>;
export type AvailableSlot = typeof availableSlots.$inferSelect;

// Consultation bookings
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceId: integer("service_id").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConsultationSchema = createInsertSchema(consultations).pick({
  slotId: true,
  name: true,
  email: true,
  phone: true,
  serviceId: true,
  message: true,
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;

// Testimonials from clients
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  image: text("image").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  quote: true,
  name: true,
  title: true,
  image: true,
  isActive: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isResolved: boolean("is_resolved").default(false),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
