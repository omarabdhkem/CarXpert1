import { Router, Request, Response } from 'express';
import { upload, processAndSaveImage, processMultipleImages, deleteImage } from '../services/imageUpload';

const router = Router();

// التحقق من تسجيل الدخول
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'يجب تسجيل الدخول' });
}

// رفع صورة واحدة للسيارة
router.post('/car', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    }
    
    const imagePath = await processAndSaveImage(req.file, 'cars');
    res.json({ 
      message: 'تم رفع الصورة بنجاح',
      url: imagePath 
    });
  } catch (error: any) {
    console.error('خطأ في رفع الصورة:', error);
    res.status(500).json({ message: error.message || 'خطأ في رفع الصورة' });
  }
});

// رفع صور متعددة للسيارة (حتى 10 صور)
router.post('/car/multiple', isAuthenticated, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'لم يتم رفع أي صور' });
    }
    
    const imagePaths = await processMultipleImages(files, 'cars');
    res.json({ 
      message: `تم رفع ${imagePaths.length} صورة بنجاح`,
      urls: imagePaths 
    });
  } catch (error: any) {
    console.error('خطأ في رفع الصور:', error);
    res.status(500).json({ message: error.message || 'خطأ في رفع الصور' });
  }
});

// رفع صورة الملف الشخصي
router.post('/avatar', isAuthenticated, upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    }
    
    const imagePath = await processAndSaveImage(req.file, 'avatars', {
      width: 300,
      height: 300,
    });
    
    res.json({ 
      message: 'تم رفع صورة الملف الشخصي بنجاح',
      url: imagePath 
    });
  } catch (error: any) {
    console.error('خطأ في رفع الصورة:', error);
    res.status(500).json({ message: error.message || 'خطأ في رفع الصورة' });
  }
});

// رفع صور للمعرض
router.post('/dealership', isAuthenticated, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'لم يتم رفع أي صور' });
    }
    
    const imagePaths = await processMultipleImages(files, 'dealerships');
    res.json({ 
      message: `تم رفع ${imagePaths.length} صورة بنجاح`,
      urls: imagePaths 
    });
  } catch (error: any) {
    console.error('خطأ في رفع الصور:', error);
    res.status(500).json({ message: error.message || 'خطأ في رفع الصور' });
  }
});

// رفع صور لمركز الخدمة
router.post('/service-center', isAuthenticated, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'لم يتم رفع أي صور' });
    }
    
    const imagePaths = await processMultipleImages(files, 'service-centers');
    res.json({ 
      message: `تم رفع ${imagePaths.length} صورة بنجاح`,
      urls: imagePaths 
    });
  } catch (error: any) {
    console.error('خطأ في رفع الصور:', error);
    res.status(500).json({ message: error.message || 'خطأ في رفع الصور' });
  }
});

// حذف صورة
router.delete('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    if (!path) {
      return res.status(400).json({ message: 'مسار الصورة مطلوب' });
    }
    
    const deleted = deleteImage(path);
    if (deleted) {
      res.json({ message: 'تم حذف الصورة بنجاح' });
    } else {
      res.status(404).json({ message: 'الصورة غير موجودة' });
    }
  } catch (error: any) {
    console.error('خطأ في حذف الصورة:', error);
    res.status(500).json({ message: error.message || 'خطأ في حذف الصورة' });
  }
});

export default router;
