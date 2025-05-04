import { MailService } from '@sendgrid/mail';
import { emailConfig } from './config';
// Initialize SendGrid if API key is available
let mailService = null;
try {
    if (process.env.SENDGRID_API_KEY) {
        const apiKey = process.env.SENDGRID_API_KEY.trim();
        // Initialize SendGrid with the provided API key from Twilio SendGrid
        // Note: API key format varies and doesn't need to start with any specific prefix
        mailService = new MailService();
        mailService.setApiKey(apiKey);
        console.log('SendGrid email service initialized successfully');
        console.log(`Using sender email: ${emailConfig.senderEmail}`);
    }
    else {
        console.warn('SENDGRID_API_KEY environment variable is not set. Email functionality will be disabled.');
    }
}
catch (error) {
    console.error('Error initializing SendGrid:', error);
    mailService = null;
}
// Send a booking confirmation email
export async function sendBookingConfirmationEmail(userEmail, bookingDetails) {
    // If SendGrid is not initialized, log the email details and return
    if (!mailService) {
        console.log('Email service not available. Would have sent booking confirmation to:', userEmail);
        console.log('Booking details:', JSON.stringify(bookingDetails, null, 2));
        return true; // Return true to not disrupt the booking flow
    }
    try {
        const emailData = {
            to: userEmail,
            from: {
                email: emailConfig.senderEmail,
                name: emailConfig.senderName
            },
            subject: 'Your Consultation Booking Confirmation',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h1 style="color: #EAB69B; margin: 0;">Align with Soulitude</h1>
            <p style="color: #777; font-size: 16px;">Your journey to inner transformation</p>
          </div>
          
          <div style="padding: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Booking Confirmation</h2>
            <p>Dear <strong>${bookingDetails.name}</strong>,</p>
            <p>Thank you for scheduling a consultation with Align with Soulitude. We're excited to accompany you on your journey!</p>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #EAB69B; margin-top: 0;">Booking Details</h3>
              <p><strong>Service:</strong> ${bookingDetails.service.title}</p>
              <p><strong>Date:</strong> ${bookingDetails.date}</p>
              <p><strong>Time:</strong> ${bookingDetails.time}</p>
              <p><strong>Original Price:</strong> $${bookingDetails.service.price}</p>
              ${bookingDetails.discountApplied ? '<p><strong>Discount Applied!</strong></p>' : ''}
              <p><strong>Final Price:</strong> $${bookingDetails.finalPrice}</p>
            </div>
            
            <p>Please make note of your appointment time. If you need to reschedule or have any questions, please contact us via email.</p>
            
            <p>We recommend arriving 5-10 minutes before your scheduled time to ensure a smooth experience.</p>
          </div>
          
          <div style="background-color: #EAB69B; color: white; padding: 15px; text-align: center; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px;">We look forward to guiding you on your journey of spiritual awakening.</p>
          </div>
          
          <div style="padding-top: 20px; text-align: center; font-size: 14px; color: #777;">
            <p>Align with Soulitude</p>
            <p>This email was sent to ${userEmail}</p>
          </div>
        </div>
      `,
        };
        if (mailService) {
            await mailService.send(emailData);
            console.log(`Booking confirmation email sent to ${userEmail}`);
        }
        return true;
    }
    catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return false;
    }
}
// Send a payment confirmation email
export async function sendPaymentConfirmationEmail(userEmail, bookingDetails) {
    // If SendGrid is not initialized, log the email details and return
    if (!mailService) {
        console.log('Email service not available. Would have sent payment confirmation to:', userEmail);
        console.log('Payment details:', JSON.stringify(bookingDetails, null, 2));
        return true; // Return true to not disrupt the payment flow
    }
    try {
        const emailData = {
            to: userEmail,
            from: {
                email: emailConfig.senderEmail,
                name: emailConfig.senderName
            },
            subject: 'Payment Confirmation for Your Consultation',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h1 style="color: #EAB69B; margin: 0;">Align with Soulitude</h1>
            <p style="color: #777; font-size: 16px;">Your journey to inner transformation</p>
          </div>
          
          <div style="padding: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Payment Confirmation</h2>
            <p>Dear <strong>${bookingDetails.name}</strong>,</p>
            <p>Thank you for your payment. Your consultation booking is now confirmed.</p>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #EAB69B; margin-top: 0;">Payment Details</h3>
              <p><strong>Service:</strong> ${bookingDetails.service.title}</p>
              <p><strong>Date:</strong> ${bookingDetails.date}</p>
              <p><strong>Time:</strong> ${bookingDetails.time}</p>
              <p><strong>Amount Paid:</strong> $${bookingDetails.paymentAmount}</p>
              <p><strong>Payment Status:</strong> <span style="color: green; font-weight: bold;">Successful</span></p>
            </div>
            
            <p>If you have any questions about your booking, please don't hesitate to contact us via email.</p>
          </div>
          
          <div style="background-color: #EAB69B; color: white; padding: 15px; text-align: center; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px;">We look forward to guiding you on your journey of spiritual awakening.</p>
          </div>
          
          <div style="padding-top: 20px; text-align: center; font-size: 14px; color: #777;">
            <p>Align with Soulitude</p>
            <p>This email was sent to ${userEmail}</p>
          </div>
        </div>
      `,
        };
        if (mailService) {
            await mailService.send(emailData);
            console.log(`Payment confirmation email sent to ${userEmail}`);
        }
        return true;
    }
    catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return false;
    }
}
