import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { InsertServiceCenter } from '@shared/schema';

const router = Router();

// الحقول المسموح بها للترتيب
const ALLOWED_SORT_FIELDS = ['name', 'rating', 'createdAt'];

// دالة للتحقق من صحة الأرقام
function isValidNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

// Middleware للتحقق من المصادقة
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
  }
  next();
}

// GET /api/service-centers - الحصول على جميع مراكز الخدمة مع إمكانية البحث والفلترة
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      location,
      service,
      minRating,
      sortBy,
      sortOrder,
      page = '1',
      limit = '10'
    } = req.query;

    let serviceCenters = await storage.getServiceCenters();

    // البحث
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      serviceCenters = serviceCenters.filter(sc =>
        sc.name.toLowerCase().includes(searchTerm) ||
        sc.description?.toLowerCase().includes(searchTerm) ||
        sc.address.toLowerCase().includes(searchTerm)
      );
    }

    // فلتر الموقع
    if (location) {
      serviceCenters = serviceCenters.filter(sc =>
        sc.location?.toLowerCase().includes((location as string).toLowerCase()) ||
        sc.address.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    // فلتر الخدمة
    if (service) {
      serviceCenters = serviceCenters.filter(sc =>
        sc.services?.some((s: string) => s.toLowerCase().includes((service as string).toLowerCase()))
      );
    }

    // فلتر التقييم - مع التحقق من صحة الرقم
    if (minRating && isValidNumber(minRating)) {
      serviceCenters = serviceCenters.filter(sc =>
        sc.rating && Number(sc.rating) >= Number(minRating)
      );
    }

    // الترتيب - مع التحقق من الحقول المسموح بها
    if (sortBy && ALLOWED_SORT_FIELDS.includes(sortBy as string)) {
      const order = sortOrder === 'desc' ? -1 : 1;
      const sortField = sortBy as keyof typeof serviceCenters[0];
      serviceCenters.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        return 0;
      });
    }

    // Pagination
    const pageNum = isValidNumber(page) ? Number(page) : 1;
    const limitNum = isValidNumber(limit) ? Number(limit) : 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedServiceCenters = serviceCenters.slice(startIndex, endIndex);

    res.json({
      data: paginatedServiceCenters,
      pagination: {
        total: serviceCenters.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(serviceCenters.length / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/service-centers/:id - الحصول على مركز خدمة واحد
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceCenter = await storage.getServiceCenter(Number(req.params.id));
    if (!serviceCenter) {
      return res.status(404).json({ message: 'مركز الخدمة غير موجود' });
    }
    res.json(serviceCenter);
  } catch (error) {
    next(error);
  }
});

// POST /api/service-centers - إضافة مركز خدمة جديد (يتطلب تسجيل الدخول)
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceCenterData: InsertServiceCenter = req.body;
    const newServiceCenter = await storage.createServiceCenter(serviceCenterData);
    res.status(201).json(newServiceCenter);
  } catch (error) {
    next(error);
  }
});

// PUT /api/service-centers/:id - تحديث مركز خدمة (يتطلب تسجيل الدخول)
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceCenter = await storage.getServiceCenter(Number(req.params.id));
    if (!serviceCenter) {
      return res.status(404).json({ message: 'مركز الخدمة غير موجود' });
    }
    const updatedServiceCenter = await storage.updateServiceCenter(Number(req.params.id), req.body);
    res.json(updatedServiceCenter);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/service-centers/:id - حذف مركز خدمة (يتطلب تسجيل الدخول)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceCenter = await storage.getServiceCenter(Number(req.params.id));
    if (!serviceCenter) {
      return res.status(404).json({ message: 'مركز الخدمة غير موجود' });
    }
    await storage.deleteServiceCenter(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
