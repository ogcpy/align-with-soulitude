import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { emailConfig } from "./config";
import * as sendgrid from "@sendgrid/mail";
const scryptAsync = promisify(scrypt);
// Password hashing function
export async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
// Password verification function
export async function comparePasswords(supplied, stored) {
    try {
        // Check if stored password has the expected format (hash.salt)
        if (!stored || !stored.includes(".")) {
            console.log("Stored password doesn't have the expected format");
            // For simple comparison (not recommended for production)
            return supplied === stored;
        }
        const [hashed, salt] = stored.split(".");
        if (!hashed || !salt) {
            console.log("Missing hash or salt in stored password");
            return false;
        }
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (await scryptAsync(supplied, salt, 64));
        return timingSafeEqual(hashedBuf, suppliedBuf);
    }
    catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
}
// Generate a secure token for password reset
export function generateResetToken() {
    return randomBytes(32).toString("hex");
}
// Send a password reset email
export async function sendPasswordResetEmail(email, resetToken) {
    if (!process.env.SENDGRID_API_KEY) {
        console.error("SENDGRID_API_KEY is not set");
        throw new Error("Email service unavailable");
    }
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    // Set the reset link (should point to your frontend route that handles reset)
    const resetLink = `${process.env.DOMAIN || 'https://alignwithsoulitude.co.uk'}/admin/reset-password?token=${resetToken}`;
    const mailData = {
        to: email,
        from: {
            email: emailConfig.senderEmail,
            name: emailConfig.senderName,
        },
        subject: "Reset Your Password - Align with Soulitude",
        text: `
      Hello,
      
      You've requested to reset your password for your Align with Soulitude admin account.
      
      Please click on the link below to reset your password:
      ${resetLink}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this, please ignore this email and your password will remain unchanged.
      
      Best regards,
      Align with Soulitude Team
    `,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eab69b; border-radius: 5px;">
        <h2 style="color: #eab69b;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You've requested to reset your password for your Align with Soulitude admin account.</p>
        <p>Please click on the button below to reset your password:</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" style="background-color: #eab69b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>Align with Soulitude Team</p>
      </div>
    `,
    };
    try {
        await sendgrid.send(mailData);
        return true;
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
    }
}
// Middleware to check if user is authenticated as admin
export function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - Missing or invalid token format' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const adminDataString = req.headers['admin-data'] || "{}";
        const adminData = typeof adminDataString === 'string' ? JSON.parse(adminDataString) : adminDataString;
        if (!adminData || !adminData.timestamp || adminData.timestamp !== token) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
        console.log('Admin route requested: ' + req.path);
        console.log('User authenticated via Authorization header');
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Unauthorized - Error processing authentication' });
    }
}
