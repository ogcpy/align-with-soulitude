import { createServer } from "http";
import { storage } from "./storage";
import { insertConsultationSchema, insertAvailableSlotSchema } from "@shared/schema";
import { registerAdminRoutes } from "./adminRoutes";
import Stripe from "stripe";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "./email";
import { format } from "date-fns";
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export async function registerRoutes(app) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request'
            });
        }
    });
    // ========== CONSULTATION BOOKING API ROUTES ==========
    // Get all services
    app.get('/api/services', async (_req, res) => {
        try {
            const services = await storage.getServices();
            res.status(200).json(services);
        }
        catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching services'
            });
        }
    });
    // Get a specific service
    app.get('/api/services/:id', async (req, res) => {
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
        }
        catch (error) {
            console.error('Error fetching service:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the service'
            });
        }
    });
    // Get available slots
    app.get('/api/available-slots', async (req, res) => {
        try {
            // Use today's date if no date parameter is provided
            const fromDate = req.query.fromDate
                ? new Date(req.query.fromDate)
                : new Date();
            // If the date is invalid, use today's date
            if (isNaN(fromDate.getTime())) {
                fromDate.setHours(0, 0, 0, 0);
            }
            // Get service ID if provided
            const serviceId = req.query.serviceId ? parseInt(req.query.serviceId) : null;
            // Get session type if provided
            const sessionType = req.query.sessionType || null;
            const slots = await storage.getAvailableSlots(fromDate);
            // Filter slots based on parameters
            let filteredSlots = slots;
            // Filter by service ID if provided, including slots marked for "any service" (null serviceId)
            if (serviceId) {
                filteredSlots = filteredSlots.filter(slot => slot.serviceId === serviceId || slot.serviceId === null);
            }
            // We're no longer filtering by session type on the server
            // Client-side will handle filtering by session type
            res.status(200).json(filteredSlots);
        }
        catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching available slots'
            });
        }
    });
    // Create a new available slot (admin only in a real application)
    app.post('/api/available-slots', async (req, res) => {
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
        }
        catch (error) {
            console.error('Error creating available slot:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while creating the available slot'
            });
        }
    });
    // Validate discount code
    app.post('/api/discount/validate', async (req, res) => {
        try {
            const { code } = req.body;
            console.log('Validating discount code:', code);
            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount code is required'
                });
            }
            // Convert to uppercase for case-insensitive matching
            const uppercaseCode = code.toUpperCase();
            const discountCode = await storage.getDiscountCodeByCode(uppercaseCode);
            console.log('Found discount code:', discountCode);
            if (!discountCode) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid discount code'
                });
            }
            // Check if code is active
            if (!discountCode.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This discount code is no longer active'
                });
            }
            // Check if code is expired
            const now = new Date();
            if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
                return res.status(400).json({
                    success: false,
                    message: 'This discount code has expired'
                });
            }
            // Check if code has reached usage limit
            if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
                return res.status(400).json({
                    success: false,
                    message: 'This discount code has reached its usage limit'
                });
            }
            // Return discount information
            const response = {
                success: true,
                discount: {
                    id: discountCode.id,
                    code: discountCode.code,
                    type: discountCode.discountType,
                    value: discountCode.discountValue,
                    description: discountCode.description
                }
            };
            console.log('Sending discount response:', response);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error validating discount code:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while validating the discount code'
            });
        }
    });
    // Book a consultation
    app.post('/api/consultations', async (req, res) => {
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
            // Check if discount code is provided and valid
            let discount = null;
            const servicePrice = service.price || 0;
            let finalPrice = servicePrice;
            if (req.body.discountCode) {
                const discountCode = await storage.getDiscountCodeByCode(req.body.discountCode);
                if (discountCode && discountCode.isActive) {
                    // Check if code is expired
                    const now = new Date();
                    const isExpired = discountCode.validUntil && new Date(discountCode.validUntil) < now;
                    // Check if code has reached usage limit
                    const isUsageLimitReached = discountCode.usageLimit &&
                        discountCode.usageCount >= discountCode.usageLimit;
                    if (!isExpired && !isUsageLimitReached) {
                        // Apply discount
                        discount = {
                            id: discountCode.id,
                            code: discountCode.code,
                            type: discountCode.discountType,
                            value: discountCode.discountValue
                        };
                        // Calculate discounted price
                        if (discountCode.discountType === 'percentage') {
                            const discountAmount = (servicePrice * parseFloat(discountCode.discountValue.toString())) / 100;
                            finalPrice = servicePrice - discountAmount;
                        }
                        else {
                            // Fixed amount discount
                            finalPrice = servicePrice - parseFloat(discountCode.discountValue.toString());
                            if (finalPrice < 0)
                                finalPrice = 0;
                        }
                        // Increment usage count for the discount code
                        await storage.incrementDiscountCodeUsage(discountCode.id);
                    }
                }
            }
            // Create the consultation
            const newConsultation = await storage.createConsultation(result.data);
            // Send booking confirmation email
            try {
                // Format the date and time for the email
                const bookingDate = new Date(slot.date);
                const formattedDate = format(bookingDate, 'MMMM d, yyyy');
                const formattedTime = `${slot.startTime} - ${slot.endTime}`;
                await sendBookingConfirmationEmail(result.data.email, {
                    name: result.data.name,
                    service: {
                        title: service.title,
                        price: service.price || 0
                    },
                    date: formattedDate,
                    time: formattedTime,
                    discountApplied: !!discount,
                    finalPrice: finalPrice
                });
                console.log('Booking confirmation email sent successfully');
            }
            catch (emailError) {
                console.error('Error sending booking confirmation email:', emailError);
                // Continue with the response even if email fails
            }
            res.status(201).json({
                success: true,
                message: 'Consultation booked successfully',
                consultation: newConsultation,
                discount: discount,
                finalPrice: finalPrice
            });
        }
        catch (error) {
            console.error('Error booking consultation:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while booking the consultation'
            });
        }
    });
    // Get a specific consultation
    app.get('/api/consultations/:id', async (req, res) => {
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
        }
        catch (error) {
            console.error('Error fetching consultation:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the consultation'
            });
        }
    });
    // Create a payment intent with Stripe
    app.post('/api/create-payment-intent', async (req, res) => {
        try {
            const { amount, consultationId } = req.body;
            if (!amount || isNaN(parseFloat(amount))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid amount is required'
                });
            }
            // Amount should be in cents
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(parseFloat(amount) * 100),
                currency: 'usd',
                metadata: {
                    consultationId: consultationId || 'unknown'
                }
            });
            res.status(200).json({
                success: true,
                clientSecret: paymentIntent.client_secret
            });
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payment intent',
                error: error.message
            });
        }
    });
    // Handle payment success and send email confirmation
    app.post('/api/payment-success', async (req, res) => {
        try {
            const { consultationId, paymentIntentId } = req.body;
            if (!consultationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Consultation ID is required'
                });
            }
            // Get the consultation details
            const consultation = await storage.getConsultation(parseInt(consultationId));
            if (!consultation) {
                return res.status(404).json({
                    success: false,
                    message: 'Consultation not found'
                });
            }
            // Get the service details
            const service = await storage.getService(consultation.serviceId);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }
            // Get the slot details
            const slot = await storage.getAvailableSlot(consultation.slotId);
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    message: 'Time slot not found'
                });
            }
            // Update consultation status to 'paid'
            await storage.updateConsultationStatus(consultation.id, 'paid');
            // Format data for email
            const bookingDate = new Date(slot.date);
            const formattedDate = format(bookingDate, 'MMMM d, yyyy');
            const formattedTime = `${slot.startTime} - ${slot.endTime}`;
            // Send payment confirmation email
            try {
                await sendPaymentConfirmationEmail(consultation.email, {
                    name: consultation.name,
                    service: {
                        title: service.title,
                        price: service.price || 0
                    },
                    date: formattedDate,
                    time: formattedTime,
                    paymentAmount: service.price || 0
                });
                console.log('Payment confirmation email sent successfully');
            }
            catch (emailError) {
                console.error('Error sending payment confirmation email:', emailError);
                // Continue with the response even if email fails
            }
            res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                consultationStatus: 'paid'
            });
        }
        catch (error) {
            console.error('Error processing payment success:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing payment notification',
                error: error.message
            });
        }
    });
    // Register admin routes
    registerAdminRoutes(app);
    const httpServer = createServer(app);
    return httpServer;
}
