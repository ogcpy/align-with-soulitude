import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();
const { Pool } = pg;

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function createTestUser() {
  console.log('Creating test user account...');
  
  try {
    // Connection to the Replit PostgreSQL database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('Connecting to database...');
    const pool = new Pool({ connectionString });
    
    // Check if test user already exists
    const checkResult = await pool.query(
      'SELECT * FROM customers WHERE email = $1',
      ['test@example.com']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Test user already exists, updating password...');
      
      // Update the existing user's password and set it as verified
      const hashedPassword = await hashPassword('password123');
      await pool.query(
        'UPDATE customers SET password = $1, is_verified = true, name = $2, phone = $3 WHERE email = $4',
        [hashedPassword, 'Test User', '1234567890', 'test@example.com']
      );
      
      console.log('Test user updated successfully!');
      console.log('Login details:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.log('Creating new test user...');
      
      // Create verification token (just for completeness)
      const verificationToken = Buffer.from(Math.random().toString()).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);
      
      // Create a new test user
      const hashedPassword = await hashPassword('password123');
      await pool.query(
        'INSERT INTO customers (email, name, phone, password, is_verified, verification_token, verification_token_expiry, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          'test@example.com',
          'Test User',
          '1234567890',
          hashedPassword,
          true, // Set as already verified
          verificationToken,
          tokenExpiry,
          new Date(),
          new Date()
        ]
      );
      
      console.log('Test user created successfully!');
      console.log('Login details:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
    
    // Close the database connection
    await pool.end();
    
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// Execute the function
createTestUser().catch(console.error);