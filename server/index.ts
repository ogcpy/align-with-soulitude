import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { registerAdminRoutes } from "./adminRoutes";
import { initializeSettings } from "./settings";
import session from "express-session";
import { pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

const app = express();
app.use(express.json());
// Test database connection on startup
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));
app.use(express.urlencoded({ extended: false }));

// Setup session middleware with more permissive settings for development
app.use(
  session({
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "session", // Make sure table name is explicit
    }),
    secret: process.env.SESSION_SECRET || "align-with-soulitude-secret",
    resave: true, // Changed to true to ensure session is saved
    saveUninitialized: true, // Changed to true to create session for all requests
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Allow non-HTTPS in development
      httpOnly: false, // Allow JavaScript access for easier debugging
      sameSite: "lax", // Less restrictive SameSite setting
    },
    name: "align.sid", // Custom session name
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize email and WhatsApp settings
  initializeSettings();

  const server = await registerRoutes(app);

  // Create a direct admin login route outside the admin middleware
  app.post("/api/admin-login", async (req, res) => {
    console.log("Admin login attempt with:", req.body.username);
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // For demo purposes - always allow admin/password
    if (username === "admin" && password === "password") {
      // Create admin user info
      const adminUser = {
        id: 1,
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        role: "admin",
        isActive: true,
      };

      // Store admin user in session
      if (req.session) {
        req.session.adminUser = adminUser;
        console.log("Admin session created successfully");
      } else {
        console.log("Session not available");
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: adminUser,
      });
    }

    console.log("Invalid credentials");
    return res.status(401).json({ message: "Invalid credentials" });
  });

  // Register admin routes
  registerAdminRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000;
  server.listen(
    {
      port,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
