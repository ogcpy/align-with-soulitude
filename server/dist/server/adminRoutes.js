import { storage } from "./storage";
import { insertAvailableSlotSchema, insertAdminUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import "express-session";
import "./types";
import { loadSettings, saveSettings } from "./settings";
import { generateResetToken, hashPassword, sendPasswordResetEmail } from "./auth";
// Simple middleware to secure admin routes
const requireAdminAuth = (req, res, next) => {
    console.log('Admin route requested:', req.path);
    // Skip authentication for login, auth-check, and password reset endpoints
    if (req.path === '/login' || req.path === '/check-auth' ||
        req.path === '/forgot-password' || req.path === '/reset-password') {
        console.log('Skipping auth for:', req.path);
        return next();
    }
    // First check for session authentication
    if (req.session && req.session.adminUser) {
        console.log('User authenticated via session');
        return next();
    }
    // Then check for Auth header (client-side localStorage auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // In a real application, you would validate the token properly
        // For demo purposes, we'll accept any bearer token
        console.log('User authenticated via Authorization header');
        return next();
    }
    console.log('Authentication failed');
    return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
};
// Function to ensure an admin user exists
async function ensureAdminUserExists() {
    try {
        console.log('Checking if admin user exists...');
        const { pool } = await import('./db');
        // Check if admin_users table exists
        try {
            console.log('Checking admin_users table...');
            const tableCheckResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_users'
        );
      `);
            const tableExists = tableCheckResult.rows[0].exists;
            console.log('admin_users table exists:', tableExists);
            if (!tableExists) {
                console.log('Creating admin_users table...');
                // Create the admin_users table if it doesn't exist
                await pool.query(`
          CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            role VARCHAR(50) NOT NULL DEFAULT 'admin',
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            reset_token VARCHAR(255),
            reset_token_expiry TIMESTAMP,
            last_login TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
                console.log('admin_users table created successfully');
            }
        }
        catch (tableError) {
            console.error('Error checking/creating admin_users table:', tableError);
        }
        // Check if any admin users exist
        console.log('Counting admin users...');
        const countResult = await pool.query('SELECT COUNT(*) FROM admin_users');
        const count = parseInt(countResult.rows[0].count);
        console.log(`Found ${count} admin users`);
        if (count === 0) {
            console.log('No admin users found, creating default admin user');
            // Create a default admin user with a simple password
            const hashedPassword = await hashPassword('password');
            console.log('Password hashed successfully');
            // Insert the default admin user
            console.log('Inserting admin user into database...');
            const insertResult = await pool.query('INSERT INTO admin_users (username, password, email, first_name, last_name, role, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', ['admin', hashedPassword, 'admin@alignwithsoulitude.co.uk', 'Admin', 'User', 'admin', true, new Date()]);
            console.log('Admin user insert result:', insertResult.rows);
            console.log('Default admin user created with username: admin, password: password');
            // Verify the user was created
            const checkResult = await pool.query('SELECT COUNT(*) FROM admin_users');
            console.log(`After insert: ${checkResult.rows[0].count} admin users found`);
        }
        else {
            console.log(`Found ${count} existing admin users, no need to create default`);
        }
    }
    catch (error) {
        console.error('Error ensuring admin user exists:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    }
}
export function registerAdminRoutes(app) {
    // Ensure an admin user exists when the application starts
    ensureAdminUserExists().catch(err => {
        console.error('Failed to create default admin user:', err);
    });
    // Apply admin auth middleware to all admin routes
    app.use('/api/admin', requireAdminAuth);
    // Endpoint to manually resend confirmation email
    app.post('/api/admin/resend-confirmation-email', async (req, res) => {
        try {
            const { email, name, service, date, time, finalPrice } = req.body;
            if (!email || !name || !service || !date || !time) {
                return res.status(400).json({ message: 'Missing required fields for sending email' });
            }
            // Import email functions dynamically to avoid circular dependencies
            const { sendBookingConfirmationEmail } = await import('./email');
            // Send the confirmation email
            const emailSent = await sendBookingConfirmationEmail(email, {
                name,
                service,
                date,
                time,
                finalPrice
            });
            if (!emailSent) {
                return res.status(500).json({ message: 'Failed to send confirmation email' });
            }
            res.status(200).json({ message: 'Confirmation email sent successfully' });
        }
        catch (error) {
            console.error('Error resending confirmation email:', error);
            res.status(500).json({ message: 'Error resending confirmation email' });
        }
    });
    // Check if admin is authenticated
    app.get('/api/admin/check-auth', (req, res) => {
        // First check session-based auth
        if (req.session && req.session.adminUser) {
            // Return the admin user info without sensitive data
            const { password, ...userInfo } = req.session.adminUser;
            return res.status(200).json(userInfo);
        }
        // Then check token-based auth (from localStorage)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // In a real app, you would validate the token
            // For demo purposes, we'll create a default admin user
            console.log('Created admin user from token');
            return res.status(200).json({
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                role: 'admin'
            });
        }
        return res.status(401).json({ message: 'Not authenticated' });
    });
    // ========== ADMIN SERVICES ROUTES ==========
    // Get all services (including inactive)
    app.get('/api/admin/services', async (_req, res) => {
        try {
            const services = await storage.getServices();
            res.status(200).json(services);
        }
        catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({ message: 'Error fetching services' });
        }
    });
    // Create a service
    app.post('/api/admin/services', async (req, res) => {
        try {
            const service = await storage.createService(req.body);
            res.status(201).json(service);
        }
        catch (error) {
            console.error('Error creating service:', error);
            res.status(500).json({ message: 'Error creating service' });
        }
    });
    // Update a service
    app.put('/api/admin/services/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const updatedService = await storage.updateService(id, req.body);
            if (!updatedService) {
                return res.status(404).json({ message: 'Service not found' });
            }
            res.status(200).json(updatedService);
        }
        catch (error) {
            console.error('Error updating service:', error);
            res.status(500).json({ message: 'Error updating service' });
        }
    });
    // Delete a service
    app.delete('/api/admin/services/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage.deleteService(id);
            if (!success) {
                return res.status(404).json({ message: 'Service not found or could not be deleted' });
            }
            res.status(200).json({ message: 'Service deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting service:', error);
            res.status(500).json({ message: 'Error deleting service' });
        }
    });
    // ========== ADMIN AVAILABLE SLOTS ROUTES ==========
    // Get all available slots
    app.get('/api/admin/slots', async (req, res) => {
        try {
            // Use current date if no date parameter is provided
            const fromDate = req.query.fromDate
                ? new Date(req.query.fromDate)
                : new Date();
            // If the date is invalid, use current date
            if (isNaN(fromDate.getTime())) {
                fromDate.setHours(0, 0, 0, 0);
            }
            const slots = await storage.getAvailableSlots(fromDate);
            res.status(200).json(slots);
        }
        catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(500).json({ message: 'Error fetching available slots' });
        }
    });
    // Create a single available slot
    app.post('/api/admin/slots', async (req, res) => {
        try {
            const result = insertAvailableSlotSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: 'Invalid slot data',
                    errors: result.error.errors
                });
            }
            const newSlot = await storage.createAvailableSlot(result.data);
            res.status(201).json(newSlot);
        }
        catch (error) {
            console.error('Error creating available slot:', error);
            res.status(500).json({ message: 'Error creating available slot' });
        }
    });
    // Create multiple available slots at once
    app.post('/api/admin/slots/bulk', async (req, res) => {
        try {
            const { slots } = req.body;
            if (!Array.isArray(slots) || slots.length === 0) {
                return res.status(400).json({ message: 'No slots provided' });
            }
            // Validate each slot
            const validSlots = [];
            const invalidSlots = [];
            for (const slot of slots) {
                const result = insertAvailableSlotSchema.safeParse(slot);
                if (result.success) {
                    validSlots.push(result.data);
                }
                else {
                    invalidSlots.push({
                        slot,
                        errors: result.error.errors
                    });
                }
            }
            if (validSlots.length === 0) {
                return res.status(400).json({
                    message: 'No valid slots provided',
                    invalidSlots
                });
            }
            const newSlots = await storage.createMultipleSlots(validSlots);
            res.status(201).json({
                message: `${newSlots.length} slots created successfully`,
                createdSlots: newSlots,
                invalidSlots: invalidSlots.length > 0 ? invalidSlots : undefined
            });
        }
        catch (error) {
            console.error('Error creating multiple slots:', error);
            res.status(500).json({ message: 'Error creating multiple slots' });
        }
    });
    // Update an available slot
    app.put('/api/admin/slots/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const updatedSlot = await storage.updateAvailableSlot(id, req.body);
            if (!updatedSlot) {
                return res.status(404).json({ message: 'Slot not found' });
            }
            res.status(200).json(updatedSlot);
        }
        catch (error) {
            console.error('Error updating slot:', error);
            res.status(500).json({ message: 'Error updating slot' });
        }
    });
    // Delete an available slot
    app.delete('/api/admin/slots/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage.deleteAvailableSlot(id);
            if (!success) {
                return res.status(404).json({ message: 'Slot not found or could not be deleted' });
            }
            res.status(200).json({ message: 'Slot deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting slot:', error);
            res.status(500).json({ message: 'Error deleting slot' });
        }
    });
    // ========== ADMIN CONSULTATIONS ROUTES ==========
    // Get all consultations
    app.get('/api/admin/consultations', async (_req, res) => {
        try {
            const consultations = await storage.getConsultations();
            res.status(200).json(consultations);
        }
        catch (error) {
            console.error('Error fetching consultations:', error);
            res.status(500).json({ message: 'Error fetching consultations' });
        }
    });
    // Update consultation status
    app.put('/api/admin/consultations/:id/status', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            const updatedConsultation = await storage.updateConsultationStatus(id, status);
            if (!updatedConsultation) {
                return res.status(404).json({ message: 'Consultation not found' });
            }
            res.status(200).json(updatedConsultation);
        }
        catch (error) {
            console.error('Error updating consultation status:', error);
            res.status(500).json({ message: 'Error updating consultation status' });
        }
    });
    // ========== ADMIN DISCOUNT CODES ROUTES ==========
    // Get all discount codes
    app.get('/api/admin/discount-codes', async (_req, res) => {
        try {
            const discountCodes = await storage.getDiscountCodes();
            res.status(200).json(discountCodes);
        }
        catch (error) {
            console.error('Error fetching discount codes:', error);
            res.status(500).json({ message: 'Error fetching discount codes' });
        }
    });
    // Create a discount code
    app.post('/api/admin/discount-codes', async (req, res) => {
        try {
            console.log('Received discount code data:', req.body);
            // Manual validation and conversion
            const { code, description, discountType, discountValue, isActive = true } = req.body;
            if (!code || !description || !discountType || !discountValue) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            // Create the discount code with the correct types
            const discountCodeData = {
                code,
                description,
                discountType,
                discountValue: String(discountValue), // Force to string
                validFrom: new Date(), // Current date
                isActive: Boolean(isActive),
            };
            console.log('Processed discount code data:', discountCodeData);
            const newDiscountCode = await storage.createDiscountCode(discountCodeData);
            res.status(201).json(newDiscountCode);
        }
        catch (error) {
            console.error('Error creating discount code:', error);
            res.status(500).json({ message: 'Error creating discount code' });
        }
    });
    // Simplified endpoint for adding discount codes
    app.post('/api/admin/discount-codes-simple', async (req, res) => {
        try {
            console.log('Received simplified discount code data:', req.body);
            const { code, description, discountType, discountValue } = req.body;
            if (!code || !description || !discountType || !discountValue) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            // Create a basic discount code
            const discountCode = await storage.createDiscountCode({
                code,
                description,
                discountType,
                discountValue: String(discountValue),
                validFrom: new Date(),
                isActive: true
            });
            res.status(201).json(discountCode);
        }
        catch (error) {
            console.error('Error creating discount code:', error);
            res.status(500).json({ message: 'Error creating discount code' });
        }
    });
    // Update a discount code
    app.put('/api/admin/discount-codes/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const updatedDiscountCode = await storage.updateDiscountCode(id, req.body);
            if (!updatedDiscountCode) {
                return res.status(404).json({ message: 'Discount code not found' });
            }
            res.status(200).json(updatedDiscountCode);
        }
        catch (error) {
            console.error('Error updating discount code:', error);
            res.status(500).json({ message: 'Error updating discount code' });
        }
    });
    // Delete a discount code
    app.delete('/api/admin/discount-codes/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage.deleteDiscountCode(id);
            if (!success) {
                return res.status(404).json({ message: 'Discount code not found or could not be deleted' });
            }
            res.status(200).json({ message: 'Discount code deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting discount code:', error);
            res.status(500).json({ message: 'Error deleting discount code' });
        }
    });
    // ========== ADMIN USER MANAGEMENT ROUTES ==========
    // Get all admin users
    app.get('/api/admin/users', async (_req, res) => {
        try {
            const adminUsers = await storage.getAdminUsers();
            // Don't send password hashes to the client
            const sanitizedUsers = adminUsers.map(user => {
                const { password, ...sanitizedUser } = user;
                return sanitizedUser;
            });
            res.status(200).json(sanitizedUsers);
        }
        catch (error) {
            console.error('Error fetching admin users:', error);
            res.status(500).json({ message: 'Error fetching admin users' });
        }
    });
    // Create an admin user
    app.post('/api/admin/users', async (req, res) => {
        try {
            // Validate request body
            const result = insertAdminUserSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: 'Invalid admin user data',
                    errors: result.error.errors
                });
            }
            // Hash the password before storing
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const adminData = {
                ...req.body,
                password: hashedPassword
            };
            const newAdminUser = await storage.createAdminUser(adminData);
            // Don't send password hash back to the client
            const { password, ...sanitizedUser } = newAdminUser;
            res.status(201).json(sanitizedUser);
        }
        catch (error) {
            console.error('Error creating admin user:', error);
            res.status(500).json({ message: 'Error creating admin user' });
        }
    });
    // Update an admin user
    app.put('/api/admin/users/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const updateData = { ...req.body };
            // If password is being updated, hash it
            if (updateData.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(updateData.password, salt);
            }
            const updatedAdminUser = await storage.updateAdminUser(id, updateData);
            if (!updatedAdminUser) {
                return res.status(404).json({ message: 'Admin user not found' });
            }
            // Don't send password hash back to the client
            const { password, ...sanitizedUser } = updatedAdminUser;
            res.status(200).json(sanitizedUser);
        }
        catch (error) {
            console.error('Error updating admin user:', error);
            res.status(500).json({ message: 'Error updating admin user' });
        }
    });
    // Delete an admin user
    app.delete('/api/admin/users/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage.deleteAdminUser(id);
            if (!success) {
                return res.status(404).json({ message: 'Admin user not found or could not be deleted' });
            }
            res.status(200).json({ message: 'Admin user deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting admin user:', error);
            res.status(500).json({ message: 'Error deleting admin user' });
        }
    });
    // Admin login
    app.post('/api/admin/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log('Admin login attempt with:', username);
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }
            // Import pool to directly access database for reliability
            const { pool } = await import('./db');
            console.log("Connected to database for admin login");
            // Get user data from database
            const userResult = await pool.query('SELECT id, username, password, first_name, last_name, email, role, is_active FROM admin_users WHERE username = $1', [username]);
            if (!userResult.rows || userResult.rows.length === 0) {
                console.log('Admin user not found');
                // Special case - if this is the default admin user, create it
                if (username === 'admin' && password === 'password') {
                    // Create admin user
                    try {
                        console.log('Creating default admin user');
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash('password', salt);
                        // First check if admin_users table exists
                        const tableCheck = await pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'admin_users'
              );
            `);
                        const tableExists = tableCheck.rows[0].exists;
                        console.log(`admin_users table exists: ${tableExists}`);
                        if (!tableExists) {
                            console.log("Admin users table doesn't exist yet");
                            return res.status(500).json({ message: 'Database not properly initialized' });
                        }
                        const newUserResult = await pool.query('INSERT INTO admin_users (username, password, first_name, last_name, email, role, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, first_name, last_name, email, role, is_active', ['admin', hashedPassword, 'Admin', 'User', 'admin@example.com', 'admin', true, new Date()]);
                        if (newUserResult.rows && newUserResult.rows.length > 0) {
                            const adminUser = {
                                id: newUserResult.rows[0].id,
                                username: newUserResult.rows[0].username,
                                firstName: newUserResult.rows[0].first_name,
                                lastName: newUserResult.rows[0].last_name,
                                email: newUserResult.rows[0].email,
                                role: newUserResult.rows[0].role,
                                isActive: newUserResult.rows[0].is_active
                            };
                            // Store user in session
                            req.session.adminUser = adminUser;
                            console.log('Admin session created successfully');
                            return res.status(200).json({
                                success: true,
                                message: 'Login successful',
                                user: adminUser
                            });
                        }
                    }
                    catch (createError) {
                        console.error('Error creating admin user:', createError);
                        return res.status(500).json({ message: 'Failed to create admin user' });
                    }
                }
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const dbUser = userResult.rows[0];
            console.log(`Found admin user with ID: ${dbUser.id}`);
            // Check if the user is active
            if (!dbUser.is_active) {
                console.log('Admin account is inactive');
                return res.status(401).json({ message: 'Account is inactive' });
            }
            // First try with the actual password
            let isPasswordValid = false;
            try {
                console.log('Verifying password with bcrypt...');
                isPasswordValid = await bcrypt.compare(password, dbUser.password);
                console.log(`Password verification result: ${isPasswordValid}`);
            }
            catch (bcryptError) {
                console.error('bcrypt error:', bcryptError);
                // Don't fail here, we'll check fallback below
            }
            // Special case for dev/testing - allow login with 'password' for 'admin' user
            if (!isPasswordValid && username === 'admin' && password === 'password') {
                console.log('Using development password fallback for admin user');
                isPasswordValid = true;
            }
            if (!isPasswordValid) {
                console.log('Invalid password');
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // Create user object from database row
            const userObj = {
                id: dbUser.id,
                username: dbUser.username,
                firstName: dbUser.first_name,
                lastName: dbUser.last_name,
                email: dbUser.email,
                role: dbUser.role,
                isActive: dbUser.is_active
            };
            // Update last login time - skip if it fails
            try {
                const timestamp = new Date();
                await pool.query('UPDATE admin_users SET last_login = $1 WHERE id = $2', [timestamp, dbUser.id]);
                console.log('Updated last login timestamp');
            }
            catch (loginTimeError) {
                console.error('Error updating login time:', loginTimeError);
            }
            // Store admin user in session
            req.session.adminUser = userObj;
            console.log('Admin login successful, session created');
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userObj
            });
        }
        catch (error) {
            console.error('Error during admin login:', error);
            res.status(500).json({ message: 'Error during login' });
        }
    });
    // ========== ADMIN SETTINGS ROUTES ==========
    // Get all settings
    app.get('/api/admin/settings', async (_req, res) => {
        try {
            const settings = loadSettings();
            res.status(200).json(settings);
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ message: 'Error fetching settings' });
        }
    });
    // Update email settings
    app.post('/api/admin/settings/email', async (req, res) => {
        try {
            const { senderEmail, senderName } = req.body;
            if (!senderEmail) {
                return res.status(400).json({ message: 'Sender email is required' });
            }
            // Save settings
            const settings = saveSettings({
                email: {
                    senderEmail,
                    senderName: senderName || 'Align with Soulitude'
                }
            });
            res.status(200).json({
                message: 'Email settings updated successfully',
                settings: settings.email
            });
        }
        catch (error) {
            console.error('Error updating email settings:', error);
            res.status(500).json({ message: 'Error updating email settings' });
        }
    });
    // Endpoint to save Stripe settings
    app.post('/api/admin/settings/stripe', async (req, res) => {
        try {
            const { secretKey, publicKey, currency } = req.body;
            if (!secretKey || !publicKey) {
                return res.status(400).json({ message: 'API keys are required' });
            }
            // Validate keys format (basic validation)
            if (!secretKey.startsWith('sk_') || !publicKey.startsWith('pk_')) {
                return res.status(400).json({
                    message: 'Invalid API keys. Secret key should start with "sk_" and public key with "pk_"'
                });
            }
            // Save settings
            const settings = saveSettings({
                stripe: {
                    secretKey,
                    publicKey,
                    currency: currency || 'GBP'
                }
            });
            // For security reasons, don't return the actual keys in the response
            const safeSettings = {
                stripe: {
                    ...settings.stripe,
                    secretKey: secretKey ? '••••' + secretKey.slice(-4) : '',
                    publicKey: publicKey ? '••••' + publicKey.slice(-4) : ''
                }
            };
            res.status(200).json({
                message: 'Stripe settings updated successfully',
                settings: safeSettings.stripe
            });
        }
        catch (error) {
            console.error('Error updating Stripe settings:', error);
            res.status(500).json({ message: 'Error updating Stripe settings' });
        }
    });
    // Removed WhatsApp settings endpoint
    // ========== PASSWORD RESET ROUTES ==========
    // Request a password reset - this doesn't require auth
    app.post('/api/admin/forgot-password', async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            // Find admin by email
            const admin = await storage.getAdminUserByEmail(email);
            if (!admin) {
                // Don't reveal if the email exists or not for security reasons
                return res.status(200).json({
                    message: 'If the email exists in our system, a password reset link has been sent.'
                });
            }
            // Generate reset token and set expiry (1 hour)
            const resetToken = generateResetToken();
            const resetTokenExpiry = new Date();
            resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
            // Save token to the database
            await storage.setPasswordResetToken(email, resetToken, resetTokenExpiry);
            // Send password reset email
            await sendPasswordResetEmail(email, resetToken);
            res.status(200).json({
                message: 'If the email exists in our system, a password reset link has been sent.'
            });
        }
        catch (error) {
            console.error('Error requesting password reset:', error);
            res.status(500).json({ message: 'Failed to process password reset request' });
        }
    });
    // Reset password using token - this doesn't require auth
    app.post('/api/admin/reset-password', async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required' });
            }
            // Find admin by reset token
            const admin = await storage.getAdminUserByResetToken(token);
            if (!admin) {
                return res.status(400).json({ message: 'Invalid or expired password reset token' });
            }
            // Hash the new password
            const hashedPassword = await hashPassword(newPassword);
            // Update admin's password and clear reset token
            await storage.updatePassword(admin.id, hashedPassword);
            res.status(200).json({ message: 'Password has been reset successfully' });
        }
        catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Failed to reset password' });
        }
    });
    // Password change functionality has been removed
}
