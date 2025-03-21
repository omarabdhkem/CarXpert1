import { db } from './db';
import { Analytics, SearchHistory } from './db/mongodb';
import { eq } from 'drizzle-orm';
import {
  users,
  cars,
  favorites,
  type User,
  type Car,
  type Favorite,
  type InsertUser,
  type InsertCar,
  type InsertFavorite,
} from '@shared/schema';

// فئة تعريف العمليات الأساسية لقاعدة البيانات
export class Storage {
  // Core PostgreSQL Operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  // Analytics Operations (MongoDB)
  // تسجيل الأحداث الخاصة بالمستخدم للأغراض التحليلية
async logUserEvent(userId: number, event: string, metadata: any = {}) {
    return await Analytics.create({ userId, event, metadata });
  }

  async saveSearchHistory(userId: number, query: string, filters: any = {}) {
    return await SearchHistory.create({ userId, query, filters });
  }

  async getUserSearchHistory(userId: number) {
    return await SearchHistory.find({ userId }).sort({ timestamp: -1 }).limit(10);
  }
  async getFavorites(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [pgFavorite] = await db.insert(favorites).values(favorite).returning();
    return pgFavorite;
  }

  async removeFavorite(userId: number, carId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(eq(favorites.userId, userId))
      .where(eq(favorites.carId, carId));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getCars(filters?: Partial<Car>): Promise<Car[]> {
    let query = db.select().from(cars);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.where(eq(cars[key as keyof typeof cars], value));
        }
      });
    }
    return await query;
  }
  async updateCar(id: number, car: Partial<Car>): Promise<Car> {
    const [updatedCar] = await db
      .update(cars)
      .set(car)
      .where(eq(cars.id, id))
      .returning();
    return updatedCar;
  }
  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }
}

// Export singleton instance
export const storage = new Storage();