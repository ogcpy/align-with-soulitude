import { pgTable, text, serial, integer, boolean, timestamp, varchar, date, time, numeric } from "drizzle-orm/pg-core";
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
  sessionType: text("session_type").default("one-on-one"), // one-on-one, group, event
  maxParticipants: integer("max_participants").default(1), // used for group sessions and events
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  title: true,
  description: true,
  image: true,
  price: true,
  duration: true,
  isActive: true,
  sessionType: true,
  maxParticipants: true,
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
  sessionType: text("session_type").default("individual"), // individual, group
  serviceId: integer("service_id"), // null means available for any service
  maxParticipants: integer("max_participants").default(1), // for group sessions
});

export const insertAvailableSlotSchema = createInsertSchema(availableSlots).pick({
  date: true,
  startTime: true,
  endTime: true,
  isBooked: true,
  sessionType: true,
  serviceId: true,
  maxParticipants: true,
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

// Discount codes
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: numeric("discount_value").notNull(), // percentage (0-100) or fixed amount
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  usageLimit: integer("usage_limit"), // maximum number of times it can be used (null for unlimited)
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).pick({
  code: true,
  description: true,
  discountType: true,
  discountValue: true,
  validFrom: true,
  validUntil: true,
  usageLimit: true,
  isActive: true,
});

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;

// Admin users with additional permissions
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("admin"), // admin, staff
  isActive: boolean("is_active").notNull().default(true),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
