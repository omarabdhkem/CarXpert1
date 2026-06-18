import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { InsertDealership } from '@shared/schema';

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

// GET /api/dealerships - الحصول على جميع المعارض مع إمكانية البحث والفلترة
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      location,
      minRating,
      sortBy,
      sortOrder,
      page = '1',
      limit = '10'
    } = req.query;

    let dealerships = await storage.getDealerships();

    // البحث
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      dealerships = dealerships.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        d.description?.toLowerCase().includes(searchTerm) ||
        d.address.toLowerCase().includes(searchTerm)
      );
    }

    // فلتر الموقع
    if (location) {
      dealerships = dealerships.filter(d =>
        d.location?.toLowerCase().includes((location as string).toLowerCase()) ||
        d.address.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    // فلتر التقييم - مع التحقق من صحة الرقم
    if (minRating && isValidNumber(minRating)) {
      dealerships = dealerships.filter(d =>
        d.rating && Number(d.rating) >= Number(minRating)
      );
    }

    // الترتيب - مع التحقق من الحقول المسموح بها
    if (sortBy && ALLOWED_SORT_FIELDS.includes(sortBy as string)) {
      const order = sortOrder === 'desc' ? -1 : 1;
      const sortField = sortBy as keyof typeof dealerships[0];
      dealerships.sort((a, b) => {
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
    const paginatedDealerships = dealerships.slice(startIndex, endIndex);

    res.json({
      data: paginatedDealerships,
      pagination: {
        total: dealerships.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(dealerships.length / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dealerships/:id - الحصول على معرض واحد
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealership = await storage.getDealership(Number(req.params.id));
    if (!dealership) {
      return res.status(404).json({ message: 'المعرض غير موجود' });
    }
    res.json(dealership);
  } catch (error) {
    next(error);
  }
});

// POST /api/dealerships - إضافة معرض جديد (يتطلب تسجيل الدخول)
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealershipData: InsertDealership = req.body;
    const newDealership = await storage.createDealership(dealershipData);
    res.status(201).json(newDealership);
  } catch (error) {
    next(error);
  }
});

// PUT /api/dealerships/:id - تحديث معرض (يتطلب تسجيل الدخول)
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealership = await storage.getDealership(Number(req.params.id));
    if (!dealership) {
      return res.status(404).json({ message: 'المعرض غير موجود' });
    }
    const updatedDealership = await storage.updateDealership(Number(req.params.id), req.body);
    res.json(updatedDealership);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/dealerships/:id - حذف معرض (يتطلب تسجيل الدخول)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealership = await storage.getDealership(Number(req.params.id));
    if (!dealership) {
      return res.status(404).json({ message: 'المعرض غير موجود' });
    }
    await storage.deleteDealership(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
