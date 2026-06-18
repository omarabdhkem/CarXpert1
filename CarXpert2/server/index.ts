import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongoDB } from "./db/mongodb";
import { checkDatabaseConnection } from "./db";
import carsRoutes from "./routes/cars";
import dealershipsRoutes from "./routes/dealerships";
import serviceCentersRoutes from "./routes/serviceCenters";
import favoritesRoutes from "./routes/favorites";
import uploadRoutes from "./routes/upload";
import notificationsRoutes from "./routes/notifications";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";
import { securityHeaders, sanitizeBody } from "./middleware/security";
import { simpleCsrf } from "./middleware/csrf";
import { initEmailTransporter } from "./services/notifications";

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(sanitizeBody);

// استخدام إعدادات لكشف المحتوى والعمل على تنسيق JSON URLEncoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تقديم الملفات المرفوعة
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint (before auth)
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'CarXpert API'
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api") && !reqPath.includes('/health')) {
      log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
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

    // تهيئة خدمة البريد الإلكتروني
    initEmailTransporter();

    // إعداد المصادقة
    setupAuth(app);

    // Apply rate limiting to API routes
    app.use('/api', apiLimiter);
    
    // Apply stricter rate limiting to auth routes
    app.use('/api/login', authLimiter);
    app.use('/api/register', authLimiter);
    
    // CSRF protection for API
    app.use('/api', simpleCsrf);

    // إضافة API routes
    app.use('/api/cars', carsRoutes);
    app.use('/api/dealerships', dealershipsRoutes);
    app.use('/api/service-centers', serviceCentersRoutes);
    app.use('/api/favorites', favoritesRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/notifications', notificationsRoutes);

    // معالجة الأخطاء middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "خطأ في الخادم";
      // تسجيل رسالة الخطأ تظهر في console
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
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('فشل بدء تشغيل الخادم:', error);
    process.exit(1);
  }
})();