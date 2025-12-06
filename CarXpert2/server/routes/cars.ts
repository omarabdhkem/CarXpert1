import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { InsertCar } from '@shared/schema';

const router = Router();

// الحقول المسموح بها للترتيب
const ALLOWED_SORT_FIELDS = ['make', 'model', 'price', 'year', 'mileage', 'createdAt'];

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

// GET /api/cars - الحصول على جميع السيارات مع إمكانية البحث والفلترة
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      make,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      color,
      fuelType,
      status,
      search,
      sortBy,
      sortOrder,
      page = '1',
      limit = '10'
    } = req.query;

    let cars = await storage.getCars();

    // تطبيق الفلاتر
    if (make) {
      cars = cars.filter(car => car.make.toLowerCase().includes((make as string).toLowerCase()));
    }
    if (model) {
      cars = cars.filter(car => car.model.toLowerCase().includes((model as string).toLowerCase()));
    }
    if (minPrice && isValidNumber(minPrice)) {
      cars = cars.filter(car => car.price >= Number(minPrice));
    }
    if (maxPrice && isValidNumber(maxPrice)) {
      cars = cars.filter(car => car.price <= Number(maxPrice));
    }
    if (minYear && isValidNumber(minYear)) {
      cars = cars.filter(car => car.year >= Number(minYear));
    }
    if (maxYear && isValidNumber(maxYear)) {
      cars = cars.filter(car => car.year <= Number(maxYear));
    }
    if (color) {
      cars = cars.filter(car => car.color?.toLowerCase() === (color as string).toLowerCase());
    }
    if (fuelType) {
      cars = cars.filter(car => car.fuelType?.toLowerCase() === (fuelType as string).toLowerCase());
    }
    if (status) {
      cars = cars.filter(car => car.status === status);
    }

    // البحث العام
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      cars = cars.filter(car =>
        car.make.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.description?.toLowerCase().includes(searchTerm) ||
        car.color?.toLowerCase().includes(searchTerm)
      );
    }

    // الترتيب - مع التحقق من الحقول المسموح بها
    if (sortBy && ALLOWED_SORT_FIELDS.includes(sortBy as string)) {
      const order = sortOrder === 'desc' ? -1 : 1;
      const sortField = sortBy as keyof typeof cars[0];
      cars.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * order;
        }
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
    const paginatedCars = cars.slice(startIndex, endIndex);

    res.json({
      data: paginatedCars,
      pagination: {
        total: cars.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(cars.length / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cars/:id - الحصول على سيارة واحدة
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await storage.getCar(Number(req.params.id));
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    res.json(car);
  } catch (error) {
    next(error);
  }
});

// POST /api/cars - إضافة سيارة جديدة (يتطلب تسجيل الدخول)
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carData: InsertCar = {
      ...req.body,
      userId: req.user!.id
    };
    const newCar = await storage.createCar(carData);
    res.status(201).json(newCar);
  } catch (error) {
    next(error);
  }
});

// PUT /api/cars/:id - تحديث سيارة (يتطلب تسجيل الدخول والملكية)
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await storage.getCar(Number(req.params.id));
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    if (car.userId !== req.user!.id) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه السيارة' });
    }
    const updatedCar = await storage.updateCar(Number(req.params.id), req.body);
    res.json(updatedCar);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cars/:id - حذف سيارة (يتطلب تسجيل الدخول والملكية)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await storage.getCar(Number(req.params.id));
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    if (car.userId !== req.user!.id) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه السيارة' });
    }
    await storage.deleteCar(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
