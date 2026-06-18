import { db } from './db';
import { AIAnalytics, SearchHistory } from './db/mongodb';
import { eq, and } from 'drizzle-orm';
import {
  users,
  cars,
  favorites,
  dealerships,
  serviceCenters,
  type User,
  type Car,
  type Favorite,
  type Dealership,
  type ServiceCenter,
  type InsertUser,
  type InsertCar,
  type InsertFavorite,
  type InsertDealership,
  type InsertServiceCenter,
} from '@shared/schema';

// فئة تعريف العمليات الأساسية لقاعدة البيانات
export class Storage {
  // ==================== User Operations ====================
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  // ==================== Car Operations ====================
  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async getCars(): Promise<Car[]> {
    return await db.select().from(cars);
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

  // ==================== Dealership Operations ====================
  async getDealership(id: number): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, id));
    return dealership;
  }

  async getDealerships(): Promise<Dealership[]> {
    return await db.select().from(dealerships);
  }

  async createDealership(dealership: InsertDealership): Promise<Dealership> {
    const [newDealership] = await db.insert(dealerships).values(dealership).returning();
    return newDealership;
  }

  async updateDealership(id: number, dealership: Partial<Dealership>): Promise<Dealership> {
    const [updatedDealership] = await db
      .update(dealerships)
      .set(dealership)
      .where(eq(dealerships.id, id))
      .returning();
    return updatedDealership;
  }

  async deleteDealership(id: number): Promise<void> {
    await db.delete(dealerships).where(eq(dealerships.id, id));
  }

  // ==================== Service Center Operations ====================
  async getServiceCenter(id: number): Promise<ServiceCenter | undefined> {
    const [serviceCenter] = await db.select().from(serviceCenters).where(eq(serviceCenters.id, id));
    return serviceCenter;
  }

  async getServiceCenters(): Promise<ServiceCenter[]> {
    return await db.select().from(serviceCenters);
  }

  async createServiceCenter(serviceCenter: InsertServiceCenter): Promise<ServiceCenter> {
    const [newServiceCenter] = await db.insert(serviceCenters).values(serviceCenter).returning();
    return newServiceCenter;
  }

  async updateServiceCenter(id: number, serviceCenter: Partial<ServiceCenter>): Promise<ServiceCenter> {
    const [updatedServiceCenter] = await db
      .update(serviceCenters)
      .set(serviceCenter)
      .where(eq(serviceCenters.id, id))
      .returning();
    return updatedServiceCenter;
  }

  async deleteServiceCenter(id: number): Promise<void> {
    await db.delete(serviceCenters).where(eq(serviceCenters.id, id));
  }

  // ==================== Favorites Operations ====================
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
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)));
  }

  // ==================== Analytics Operations (MongoDB) ====================
  async logUserEvent(userId: number, event: string, metadata: any = {}) {
    return await AIAnalytics.create({ userId, event, metadata });
  }

  async saveSearchHistory(userId: number, query: string, filters: any = {}) {
    return await SearchHistory.create({ userId, query, filters });
  }

  async getUserSearchHistory(userId: number) {
    return await SearchHistory.find({ userId }).sort({ timestamp: -1 }).limit(10);
  }
}

// Export singleton instance
export const storage = new Storage();