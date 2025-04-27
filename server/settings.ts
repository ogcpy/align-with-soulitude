import fs from 'fs';
import path from 'path';
import { emailConfig } from './config';

// Define settings structure
interface Settings {
  email: {
    senderEmail: string;
    senderName: string;
  };
  stripe: {
    secretKey: string;
    publicKey: string;
    currency: string;
  };
}

// Default settings
const defaultSettings: Settings = {
  email: {
    senderEmail: 'noreply@alignwithsoulitude.co.uk',
    senderName: 'Align with Soulitude'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
    currency: 'GBP'
  }
};

// Settings file path in project root
const settingsFilePath = path.join(process.cwd(), 'settings.json');

// Load settings from file
export function loadSettings(): Settings {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const fileContent = fs.readFileSync(settingsFilePath, 'utf8');
      const settings = JSON.parse(fileContent) as Settings;
      
      // Update runtime config with loaded settings
      if (settings.email) {
        emailConfig.senderEmail = settings.email.senderEmail || defaultSettings.email.senderEmail;
        emailConfig.senderName = settings.email.senderName || defaultSettings.email.senderName;
      }
      
      return settings;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // If file doesn't exist or there's an error, return default settings
  return defaultSettings;
}

// Save settings to file
export function saveSettings(settings: Partial<Settings>): Settings {
  try {
    // Load current settings first
    const currentSettings = loadSettings();
    
    // Merge with new settings
    const updatedSettings: Settings = {
      email: {
        ...currentSettings.email,
        ...(settings.email || {})
      },
      stripe: {
        ...currentSettings.stripe,
        ...(settings.stripe || {})
      }
    };
    
    // Update runtime config
    if (settings.email) {
      emailConfig.senderEmail = settings.email.senderEmail || emailConfig.senderEmail;
      emailConfig.senderName = settings.email.senderName || emailConfig.senderName;
    }
    
    // Write to file
    fs.writeFileSync(settingsFilePath, JSON.stringify(updatedSettings, null, 2), 'utf8');
    console.log('Settings saved successfully');
    
    return updatedSettings;
  } catch (error) {
    console.error('Error saving settings:', error);
    return loadSettings(); // Return current settings on error
  }
}

// Initialize settings on server start
export function initializeSettings(): void {
  const settings = loadSettings();
  console.log('Settings initialized:', settings);
}