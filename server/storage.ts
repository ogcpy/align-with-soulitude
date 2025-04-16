import { 
  users, 
  type User, 
  type InsertUser,
  services,
  type Service,
  type InsertService,
  availableSlots,
  type AvailableSlot,
  type InsertAvailableSlot,
  consultations,
  type Consultation,
  type InsertConsultation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Available slot methods
  getAvailableSlots(fromDate: Date): Promise<AvailableSlot[]>;
  getAvailableSlot(id: number): Promise<AvailableSlot | undefined>;
  createAvailableSlot(slot: InsertAvailableSlot): Promise<AvailableSlot>;
  markSlotAsBooked(id: number): Promise<AvailableSlot | undefined>;
  
  // Consultation methods
  getConsultations(): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultationStatus(id: number, status: string): Promise<Consultation | undefined>;
}

// Memory storage implementation (kept for reference)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // These methods would need to be implemented for a full Memory Storage solution
  async getServices(): Promise<Service[]> {
    throw new Error("Method not implemented.");
  }
  
  async getService(id: number): Promise<Service | undefined> {
    throw new Error("Method not implemented.");
  }
  
  async createService(service: InsertService): Promise<Service> {
    throw new Error("Method not implemented.");
  }
  
  async getAvailableSlots(fromDate: Date): Promise<AvailableSlot[]> {
    throw new Error("Method not implemented.");
  }
  
  async getAvailableSlot(id: number): Promise<AvailableSlot | undefined> {
    throw new Error("Method not implemented.");
  }
  
  async createAvailableSlot(slot: InsertAvailableSlot): Promise<AvailableSlot> {
    throw new Error("Method not implemented.");
  }
  
  async markSlotAsBooked(id: number): Promise<AvailableSlot | undefined> {
    throw new Error("Method not implemented.");
  }
  
  async getConsultations(): Promise<Consultation[]> {
    throw new Error("Method not implemented.");
  }
  
  async getConsultation(id: number): Promise<Consultation | undefined> {
    throw new Error("Method not implemented.");
  }
  
  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    throw new Error("Method not implemented.");
  }
  
  async updateConsultationStatus(id: number, status: string): Promise<Consultation | undefined> {
    throw new Error("Method not implemented.");
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Service methods
  async getServices(): Promise<Service[]> {
    return db.select().from(services).where(eq(services.isActive, true));
  }
  
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }
  
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }
  
  // Available slot methods
  async getAvailableSlots(fromDate: Date): Promise<AvailableSlot[]> {
    // Convert Date to YYYY-MM-DD format for comparison
    const formattedDate = fromDate.toISOString().split('T')[0];
    
    return db
      .select()
      .from(availableSlots)
      .where(
        and(
          eq(availableSlots.isBooked, false),
          sql`${availableSlots.date} >= ${formattedDate}`
        )
      )
      .orderBy(availableSlots.date, availableSlots.startTime);
  }
  
  async getAvailableSlot(id: number): Promise<AvailableSlot | undefined> {
    const [slot] = await db.select().from(availableSlots).where(eq(availableSlots.id, id));
    return slot || undefined;
  }
  
  async createAvailableSlot(slot: InsertAvailableSlot): Promise<AvailableSlot> {
    const [newSlot] = await db
      .insert(availableSlots)
      .values(slot)
      .returning();
    return newSlot;
  }
  
  async markSlotAsBooked(id: number): Promise<AvailableSlot | undefined> {
    const [updatedSlot] = await db
      .update(availableSlots)
      .set({ isBooked: true })
      .where(eq(availableSlots.id, id))
      .returning();
    return updatedSlot;
  }
  
  // Consultation methods
  async getConsultations(): Promise<Consultation[]> {
    return db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.createdAt));
  }
  
  async getConsultation(id: number): Promise<Consultation | undefined> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation || undefined;
  }
  
  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db
      .insert(consultations)
      .values(consultation)
      .returning();
    
    // Mark the slot as booked
    await this.markSlotAsBooked(consultation.slotId);
    
    return newConsultation;
  }
  
  async updateConsultationStatus(id: number, status: string): Promise<Consultation | undefined> {
    const [updatedConsultation] = await db
      .update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();
    return updatedConsultation;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
