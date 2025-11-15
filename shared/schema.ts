import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  address: varchar("address", { length: 400 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  email: text("email").notNull().unique(),
  address: varchar("address", { length: 400 }).notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  storeId: integer("store_id").notNull().references(() => stores.id),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ratingsGiven: many(ratings),
  storesOwned: many(stores),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [ratings.storeId],
    references: [stores.id],
  }),
}));

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

const nameSchema = z
  .string()
  .min(20, "Name must be at least 20 characters")
  .max(60, "Name must be at most 60 characters");

const addressSchema = z
  .string()
  .max(400, "Address must be at most 400 characters");

export const insertUserSchema = createInsertSchema(users, {
  name: () => nameSchema,
  email: () => z.string().email("Invalid email format"),
  password: () => passwordSchema,
  address: () => addressSchema,
  role: () => z.enum(["admin", "user", "store_owner"]).default("user"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertStoreSchema = createInsertSchema(stores, {
  name: () => nameSchema,
  email: () => z.string().email("Invalid email format"),
  address: () => addressSchema,
}).omit({
  id: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings, {
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

export type UserWithoutPassword = Omit<User, "password">;

export type StoreWithRating = Store & {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
};

export type RatingWithUser = Rating & {
  user: {
    name: string;
    email: string;
  };
};

export type DashboardStats = {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
};
