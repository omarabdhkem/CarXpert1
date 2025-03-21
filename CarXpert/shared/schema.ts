import { pgTable, serial, varchar, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// تعريف الجداول
export const carStatusEnum = pgEnum('car_status', ['available', 'sold', 'reserved']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cars = pgTable('cars', {
  id: serial('id').primaryKey(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  price: integer('price').notNull(),
  mileage: integer('mileage'),
  color: varchar('color', { length: 50 }),
  fuelType: varchar('fuel_type', { length: 50 }),
  description: text('description'),
  status: carStatusEnum('status').default('available'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dealerships = pgTable("dealerships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  location: text("location"),
  contact: text("contact"),
  images: text("images").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceCenters = pgTable("service_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  location: text("location"),
  services: text("services").array(),
  contact: text("contact"),
  images: text("images").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), 
  content: text("content"), 
  carId: integer("car_id").references(() => cars.id),
  dealershipId: integer("dealership_id").references(() => dealerships.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  carId: integer('car_id').notNull().references(() => cars.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// العلاقات
export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  favorites: many(favorites),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
  favorites: many(favorites),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [favorites.carId],
    references: [cars.id],
  }),
}));

// أنواع البيانات للاستخدام
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export type Dealership = typeof dealerships.$inferSelect;
export type InsertDealership = typeof dealerships.$inferInsert;

export type ServiceCenter = typeof serviceCenters.$inferSelect;
export type InsertServiceCenter = typeof serviceCenters.$inferInsert;

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = typeof advertisements.$inferInsert;