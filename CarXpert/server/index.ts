import express, { type Request, Response, NextFunction } from "express";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongoDB } from "./db/mongodb";
import { checkDatabaseConnection } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    // تهيئة قواعد البيانات
    const pgConnected = await checkDatabaseConnection();
    if (!pgConnected) {
      throw new Error('فشل الاتصال بقاعدة البيانات PostgreSQL');
    }
    log('تم الاتصال بنجاح بقاعدة البيانات PostgreSQL');

    // MongoDB اختياري للتحليلات
    const mongoConnected = await connectMongoDB();
    if (mongoConnected) {
      log('تم الاتصال بنجاح بقاعدة البيانات MongoDB');
    }

    // إعداد المصادقة
    setupAuth(app);

    // إضافة API routes هنا
    // app.use('/api/cars', carsRoutes);
    // app.use('/api/users', usersRoutes);

    // معالجة الأخطاء middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "خطأ في الخادم";
      log(`خطأ: ${message}`);
      res.status(status).json({ message });
    });

    // تقديم الملفات الثابتة أو إعداد Vite حسب بيئة التشغيل
    if (process.env.NODE_ENV === "development") {
      try {
        await setupVite(app);
      } catch (e) {
        log('فشل في إعداد Vite، سيتم استخدام الملفات الثابتة');
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }

    // استخدام المنفذ من المتغيرات البيئية أو استخدام 5000 كقيمة افتراضية
    const port = process.env.PORT || 5000;
    app.listen(port, "0.0.0.0", () => {
      log(`الخادم يعمل على المنفذ ${port}`);
    });
  } catch (error) {
    console.error('فشل بدء تشغيل الخادم:', error);
    process.exit(1);
  }
})();