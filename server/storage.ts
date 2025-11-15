import { users, stores, ratings, type User, type InsertUser, type Store, type InsertStore, type Rating, type InsertRating, type UserWithoutPassword, type StoreWithRating, type RatingWithUser, type DashboardStats } from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc } from "drizzle-orm";

export interface IStorage {
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  getAllUsers(): Promise<UserWithoutPassword[]>;
  getStoreOwners(): Promise<UserWithoutPassword[]>;
  
  createStore(store: InsertStore): Promise<Store>;
  getAllStores(): Promise<StoreWithRating[]>;
  getStoresWithUserRatings(userId: number): Promise<StoreWithRating[]>;
  getStoreByOwnerId(ownerId: number): Promise<Store | undefined>;
  
  createOrUpdateRating(rating: InsertRating): Promise<Rating>;
  getRatingsByStoreId(storeId: number): Promise<RatingWithUser[]>;
  getUserRatingForStore(userId: number, storeId: number): Promise<Rating | undefined>;
  
  getDashboardStats(): Promise<DashboardStats>;
  getOwnerDashboard(ownerId: number): Promise<{ averageRating: number; totalRatings: number; ratings: RatingWithUser[] }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);
    return allUsers;
  }

  async getStoreOwners(): Promise<UserWithoutPassword[]> {
    const owners = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "store_owner"));
    return owners;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db
      .insert(stores)
      .values(insertStore)
      .returning();
    return store;
  }

  async getAllStores(): Promise<StoreWithRating[]> {
    const storesWithRatings = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        ownerId: stores.ownerId,
        createdAt: stores.createdAt,
        averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
        totalRatings: sql<number>`COUNT(${ratings.id})`,
      })
      .from(stores)
      .leftJoin(ratings, eq(stores.id, ratings.storeId))
      .groupBy(stores.id);

    return storesWithRatings.map(store => ({
      ...store,
      averageRating: Number(store.averageRating),
      totalRatings: Number(store.totalRatings),
    }));
  }

  async getStoresWithUserRatings(userId: number): Promise<StoreWithRating[]> {
    const storesWithRatings = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        ownerId: stores.ownerId,
        createdAt: stores.createdAt,
        averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
        totalRatings: sql<number>`COUNT(DISTINCT ${ratings.id})`,
        userRating: sql<number>`MAX(CASE WHEN ${ratings.userId} = ${userId} THEN ${ratings.rating} END)`,
      })
      .from(stores)
      .leftJoin(ratings, eq(stores.id, ratings.storeId))
      .groupBy(stores.id);

    return storesWithRatings.map(store => ({
      ...store,
      averageRating: Number(store.averageRating),
      totalRatings: Number(store.totalRatings),
      userRating: store.userRating ? Number(store.userRating) : undefined,
    }));
  }

  async getStoreByOwnerId(ownerId: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.ownerId, ownerId));
    return store || undefined;
  }

  async createOrUpdateRating(insertRating: InsertRating): Promise<Rating> {
    const existing = await this.getUserRatingForStore(insertRating.userId, insertRating.storeId);

    if (existing) {
      const [updated] = await db
        .update(ratings)
        .set({
          rating: insertRating.rating,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(ratings)
      .values(insertRating)
      .returning();
    return created;
  }

  async getRatingsByStoreId(storeId: number): Promise<RatingWithUser[]> {
    const storeRatings = await db
      .select({
        id: ratings.id,
        userId: ratings.userId,
        storeId: ratings.storeId,
        rating: ratings.rating,
        createdAt: ratings.createdAt,
        updatedAt: ratings.updatedAt,
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.storeId, storeId))
      .orderBy(desc(ratings.createdAt));

    return storeRatings;
  }

  async getUserRatingForStore(userId: number, storeId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.storeId, storeId)));
    return rating || undefined;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [storeCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(stores);
    const [ratingCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(ratings);

    return {
      totalUsers: Number(userCount.count),
      totalStores: Number(storeCount.count),
      totalRatings: Number(ratingCount.count),
    };
  }

  async getOwnerDashboard(ownerId: number): Promise<{ averageRating: number; totalRatings: number; ratings: RatingWithUser[] }> {
    const store = await this.getStoreByOwnerId(ownerId);
    
    if (!store) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratings: [],
      };
    }

    const [stats] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
        totalRatings: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.storeId, store.id));

    const storeRatings = await this.getRatingsByStoreId(store.id);

    return {
      averageRating: Number(stats.averageRating),
      totalRatings: Number(stats.totalRatings),
      ratings: storeRatings,
    };
  }
}

export const storage = new DatabaseStorage();
