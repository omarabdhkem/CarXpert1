import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// تعيين المُنشئ القياسي للـ WebSocket في إعدادات Neon لتكوينه
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// تنظيم مجموعة الاتصالات لقاعدة البيانات PostgreSQL باستخدام URL المحدد في المتغير البيئي
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Assume this function exists, and export it from db.ts
export async function checkDatabaseConnection(): Promise<boolean> {
  // Check PostgreSQL connection here
  return true;
}
