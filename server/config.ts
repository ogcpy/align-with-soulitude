// Configuration variables with defaults
interface EmailConfig {
  senderEmail: string;
  senderName: string;
}

export const emailConfig: EmailConfig = {
  senderEmail: process.env.SENDER_EMAIL || 'noreply@alignwithsoulitude.co.uk',
  senderName: process.env.SENDER_NAME || 'Align with Soulitude'
}