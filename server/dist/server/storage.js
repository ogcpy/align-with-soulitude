import { users, services, availableSlots, consultations, discountCodes, adminUsers } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
// Database implementation for persistent storage
// Using Neon PostgreSQL database with Drizzle ORM
export class DatabaseStorage {
    // User methods
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db
            .insert(users)
            .values(insertUser)
            .returning();
        return user;
    }
    // Service methods
    async getServices() {
        return db.select().from(services).where(eq(services.isActive, true));
    }
    async getService(id) {
        const [service] = await db.select().from(services).where(eq(services.id, id));
        return service || undefined;
    }
    async createService(service) {
        const [newService] = await db
            .insert(services)
            .values(service)
            .returning();
        return newService;
    }
    async updateService(id, service) {
        const [updatedService] = await db
            .update(services)
            .set(service)
            .where(eq(services.id, id))
            .returning();
        return updatedService;
    }
    async deleteService(id) {
        try {
            const result = await db
                .delete(services)
                .where(eq(services.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting service:', error);
            return false;
        }
    }
    // Available slot methods
    async getAvailableSlots(fromDate) {
        // Convert Date to YYYY-MM-DD format for comparison
        const formattedDate = fromDate.toISOString().split('T')[0];
        return db
            .select()
            .from(availableSlots)
            .where(and(eq(availableSlots.isBooked, false), sql `${availableSlots.date} >= ${formattedDate}`))
            .orderBy(availableSlots.date, availableSlots.startTime);
    }
    async getAvailableSlot(id) {
        const [slot] = await db.select().from(availableSlots).where(eq(availableSlots.id, id));
        return slot || undefined;
    }
    async createAvailableSlot(slot) {
        const [newSlot] = await db
            .insert(availableSlots)
            .values(slot)
            .returning();
        return newSlot;
    }
    async createMultipleSlots(slots) {
        if (slots.length === 0) {
            return [];
        }
        const newSlots = await db
            .insert(availableSlots)
            .values(slots)
            .returning();
        return newSlots;
    }
    async updateAvailableSlot(id, slot) {
        const [updatedSlot] = await db
            .update(availableSlots)
            .set(slot)
            .where(eq(availableSlots.id, id))
            .returning();
        return updatedSlot;
    }
    async deleteAvailableSlot(id) {
        try {
            await db
                .delete(availableSlots)
                .where(eq(availableSlots.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting available slot:', error);
            return false;
        }
    }
    async markSlotAsBooked(id) {
        const [updatedSlot] = await db
            .update(availableSlots)
            .set({ isBooked: true })
            .where(eq(availableSlots.id, id))
            .returning();
        return updatedSlot;
    }
    // Consultation methods
    async getConsultations() {
        // Join with available slots to get date/time information
        const results = await db
            .select({
            consultation: consultations,
            slot: availableSlots
        })
            .from(consultations)
            .leftJoin(availableSlots, eq(consultations.slotId, availableSlots.id))
            .orderBy(desc(consultations.createdAt));
        // Format the results to have the slot as a nested object
        return results.map(result => ({
            ...result.consultation,
            slot: result.slot ? {
                id: result.slot.id,
                date: result.slot.date,
                startTime: result.slot.startTime,
                endTime: result.slot.endTime,
                isBooked: result.slot.isBooked
            } : null
        }));
    }
    async getConsultation(id) {
        const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
        return consultation || undefined;
    }
    async createConsultation(consultation) {
        const [newConsultation] = await db
            .insert(consultations)
            .values(consultation)
            .returning();
        // Mark the slot as booked
        await this.markSlotAsBooked(consultation.slotId);
        return newConsultation;
    }
    async updateConsultationStatus(id, status) {
        const [updatedConsultation] = await db
            .update(consultations)
            .set({ status })
            .where(eq(consultations.id, id))
            .returning();
        return updatedConsultation;
    }
    // Discount code methods
    async getDiscountCodes() {
        return db
            .select()
            .from(discountCodes)
            .orderBy(desc(discountCodes.createdAt));
    }
    async getDiscountCode(id) {
        const [code] = await db
            .select()
            .from(discountCodes)
            .where(eq(discountCodes.id, id));
        return code || undefined;
    }
    async getDiscountCodeByCode(code) {
        // Always store and compare discount codes in uppercase
        const uppercaseCode = code.toUpperCase();
        const [discountCode] = await db
            .select()
            .from(discountCodes)
            .where(eq(discountCodes.code, uppercaseCode));
        return discountCode || undefined;
    }
    async createDiscountCode(discountCode) {
        // Always store discount codes in uppercase
        const codeWithUppercase = {
            ...discountCode,
            code: discountCode.code.toUpperCase()
        };
        const [newDiscountCode] = await db
            .insert(discountCodes)
            .values(codeWithUppercase)
            .returning();
        return newDiscountCode;
    }
    async updateDiscountCode(id, discountCode) {
        // If code is being updated, ensure it's uppercase
        const updatedData = { ...discountCode };
        if (updatedData.code) {
            updatedData.code = updatedData.code.toUpperCase();
        }
        const [updatedDiscountCode] = await db
            .update(discountCodes)
            .set(updatedData)
            .where(eq(discountCodes.id, id))
            .returning();
        return updatedDiscountCode;
    }
    async deleteDiscountCode(id) {
        try {
            await db
                .delete(discountCodes)
                .where(eq(discountCodes.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting discount code:', error);
            return false;
        }
    }
    async incrementDiscountCodeUsage(id) {
        const [updatedDiscountCode] = await db
            .update(discountCodes)
            .set({
            usageCount: sql `${discountCodes.usageCount} + 1`
        })
            .where(eq(discountCodes.id, id))
            .returning();
        return updatedDiscountCode;
    }
    // Admin user methods
    async getAdminUsers() {
        return db
            .select()
            .from(adminUsers)
            .orderBy(adminUsers.username);
    }
    async getAdminUser(id) {
        const [admin] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.id, id));
        return admin || undefined;
    }
    async getAdminUserByUsername(username) {
        try {
            // Import pool dynamically to avoid circular dependencies
            const { pool } = await import('./db');
            console.log("Looking up admin user in DB:", username);
            const result = await pool.query('SELECT id, username, password, first_name, last_name, email, role, is_active, last_login, created_at FROM admin_users WHERE username = $1 LIMIT 1', [username]);
            // Make sure we have rows
            if (result && result.rows && result.rows.length > 0) {
                console.log("Admin user found in database");
                // Convert snake_case from DB to camelCase for our app
                const dbUser = result.rows[0];
                return {
                    id: Number(dbUser.id),
                    username: String(dbUser.username),
                    password: String(dbUser.password),
                    firstName: String(dbUser.first_name),
                    lastName: String(dbUser.last_name),
                    email: String(dbUser.email),
                    role: String(dbUser.role),
                    isActive: Boolean(dbUser.is_active),
                    lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : null,
                    createdAt: dbUser.created_at ? new Date(dbUser.created_at) : null,
                    // These fields don't exist in the DB but are required by the type
                    resetToken: null,
                    resetTokenExpiry: null
                };
            }
            console.log("Admin user not found in database");
            return undefined;
        }
        catch (error) {
            console.error("Error getting admin by username:", error);
            return undefined;
        }
    }
    async getAdminUserByEmail(email) {
        try {
            // Use db directly for this operation
            // We'll use a raw SQL query here for compatibility 
            const result = await db.execute('SELECT id, username, password, first_name, last_name, email, role, is_active, last_login, created_at FROM admin_users WHERE email = $1 LIMIT 1', [email]);
            if (result && 'rows' in result && result.rows.length > 0) {
                const dbUser = result.rows[0];
                return {
                    id: Number(dbUser.id),
                    username: String(dbUser.username),
                    password: String(dbUser.password),
                    firstName: String(dbUser.first_name),
                    lastName: String(dbUser.last_name),
                    email: String(dbUser.email),
                    role: String(dbUser.role),
                    isActive: Boolean(dbUser.is_active),
                    lastLogin: dbUser.last_login ? new Date(String(dbUser.last_login)) : null,
                    createdAt: dbUser.created_at ? new Date(String(dbUser.created_at)) : null,
                    resetToken: null,
                    resetTokenExpiry: null
                };
            }
            return undefined;
        }
        catch (error) {
            console.error("Error getting admin by email:", error);
            return undefined;
        }
    }
    // Since the reset token columns don't exist in the database, we'll need to
    // modify these methods to work with what we have or disable them
    async getAdminUserByResetToken(token) {
        console.log("Reset token functionality is not implemented in the database schema");
        return undefined;
    }
    async setPasswordResetToken(email, token, expiry) {
        console.log("Reset token functionality is not implemented in the database schema");
        return false;
    }
    async updatePassword(id, newPassword) {
        try {
            console.log(`Updating password for user ID: ${id}`);
            // Use direct pool connection for more reliable execution
            // Import pool dynamically to avoid circular dependencies
            const { pool } = await import('./db');
            const result = await pool.query('UPDATE admin_users SET password = $1 WHERE id = $2 RETURNING id', [newPassword, id]);
            console.log('Password update result:', result);
            return result && result.rowCount ? result.rowCount > 0 : false;
        }
        catch (error) {
            console.error('Error updating password:', error);
            return false;
        }
    }
    async createAdminUser(adminUser) {
        const [newAdminUser] = await db
            .insert(adminUsers)
            .values(adminUser)
            .returning();
        return newAdminUser;
    }
    async updateAdminUser(id, adminUser) {
        const [updatedAdminUser] = await db
            .update(adminUsers)
            .set(adminUser)
            .where(eq(adminUsers.id, id))
            .returning();
        return updatedAdminUser;
    }
    async deleteAdminUser(id) {
        try {
            await db
                .delete(adminUsers)
                .where(eq(adminUsers.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting admin user:', error);
            return false;
        }
    }
    async updateAdminUserLastLogin(id) {
        const [updatedAdminUser] = await db
            .update(adminUsers)
            .set({
            lastLogin: new Date()
        })
            .where(eq(adminUsers.id, id))
            .returning();
        return updatedAdminUser;
    }
}
// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
