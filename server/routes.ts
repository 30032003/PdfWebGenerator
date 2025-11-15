import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStoreSchema, insertRatingSchema, loginSchema, updatePasswordSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const PgStore = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      store: new PgStore({
        pool: pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "store-rating-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireRole = (roles: string[]) => {
    return async (req: any, res: any, next: any) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUserById(req.session.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    };
  };

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.omit({ role: true }).parse(req.body);
      
      const existing = await storage.getUserByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: "user",
      });

      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const validatedData = updatePasswordSchema.parse(req.body);
      
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValid = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update password" });
    }
  });

  app.get("/api/admin/stats", requireRole(["admin"]), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireRole(["admin"]), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  app.get("/api/admin/store-owners", requireRole(["admin"]), async (req, res) => {
    try {
      const owners = await storage.getStoreOwners();
      res.json(owners);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch store owners" });
    }
  });

  app.get("/api/admin/stores", requireRole(["admin"]), async (req, res) => {
    try {
      const stores = await storage.getAllStores();
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stores" });
    }
  });

  app.post("/api/admin/stores", requireRole(["admin"]), async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body);
      
      const existingStore = await storage.getStoreByOwnerId(validatedData.ownerId);
      if (existingStore) {
        return res.status(400).json({ message: "This owner already has a store" });
      }

      const store = await storage.createStore(validatedData);
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create store" });
    }
  });

  app.get("/api/stores", requireRole(["user"]), async (req, res) => {
    try {
      const stores = await storage.getStoresWithUserRatings(req.session.userId!);
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stores" });
    }
  });

  app.post("/api/ratings", requireRole(["user"]), async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });

      const rating = await storage.createOrUpdateRating(validatedData);
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to submit rating" });
    }
  });

  app.get("/api/owner/dashboard", requireRole(["store_owner"]), async (req, res) => {
    try {
      const dashboard = await storage.getOwnerDashboard(req.session.userId!);
      res.json(dashboard);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
