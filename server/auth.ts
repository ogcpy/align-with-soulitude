import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db } from './db';

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to compare passwords
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Function to set up authentication
export function setupAuth(app: Express) {
  // Set up passport local strategy for admin authentication
  passport.use(
    'local',
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const [user] = await db.query.admin_users.findMany({
          where: (users, { eq }) => eq(users.username, username)
        });

        // If user doesn't exist or password doesn't match
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Incorrect username or password' });
        }

        // Authentication successful
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.query.admin_users.findMany({
        where: (users, { eq }) => eq(users.id, id)
      });
      
      if (!user) {
        return done(new Error('User not found'));
      }
      
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Admin login endpoint
  app.post('/api/admin/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Update last login timestamp
        db.update(db.schema.admin_users)
          .set({ last_login: new Date() })
          .where(({ id }) => id.equals(user.id))
          .execute()
          .catch(console.error);
        
        // Return user info (excluding password)
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Admin logout endpoint
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Check if user is authenticated
  app.get('/api/admin/check-auth', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      return res.json(userWithoutPassword);
    }
    
    res.status(401).json({ message: 'Not authenticated' });
  });

  // Middleware to require authentication for protected routes
  app.use('/api/admin/*', (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Exclude login and logout routes from authentication check
    if (
      req.path === '/api/admin/login' || 
      req.path === '/api/admin/logout' ||
      req.path === '/api/admin/check-auth'
    ) {
      return next();
    }
    
    res.status(401).json({ message: 'Authentication required' });
  });

  return app;
}