import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const router = Router();

// Middleware للتحقق من المصادقة
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
  }
  next();
}

// GET /api/favorites - الحصول على المفضلة للمستخدم الحالي
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await storage.getFavorites(req.user!.id);
    
    // الحصول على تفاصيل السيارات المفضلة
    const favoritesWithCars = await Promise.all(
      favorites.map(async (fav) => {
        const car = await storage.getCar(fav.carId);
        return {
          ...fav,
          car
        };
      })
    );
    
    res.json(favoritesWithCars);
  } catch (error) {
    next(error);
  }
});

// POST /api/favorites/:carId - إضافة سيارة للمفضلة
router.post('/:carId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carId = Number(req.params.carId);
    const userId = req.user!.id;

    // التحقق من وجود السيارة
    const car = await storage.getCar(carId);
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    // التحقق من عدم وجود السيارة في المفضلة مسبقاً
    const existingFavorites = await storage.getFavorites(userId);
    const alreadyFavorited = existingFavorites.some(f => f.carId === carId);
    if (alreadyFavorited) {
      return res.status(400).json({ message: 'السيارة موجودة في المفضلة مسبقاً' });
    }

    const favorite = await storage.addFavorite({ userId, carId });
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/favorites/:carId - إزالة سيارة من المفضلة
router.delete('/:carId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carId = Number(req.params.carId);
    const userId = req.user!.id;

    await storage.removeFavorite(userId, carId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
