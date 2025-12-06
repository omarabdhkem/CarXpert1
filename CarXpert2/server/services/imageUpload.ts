import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// إنشاء مجلد التخزين إذا لم يكن موجوداً
const uploadDir = path.join(process.cwd(), 'uploads');
const carsDir = path.join(uploadDir, 'cars');
const avatarsDir = path.join(uploadDir, 'avatars');
const dealershipsDir = path.join(uploadDir, 'dealerships');
const serviceCentersDir = path.join(uploadDir, 'service-centers');

// إنشاء المجلدات
[uploadDir, carsDir, avatarsDir, dealershipsDir, serviceCentersDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// تهيئة التخزين
const storage = multer.memoryStorage();

// فلتر الملفات - قبول الصور فقط
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP'));
  }
};

// إعدادات Multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // حد أقصى 10 صور
  },
});

// معالجة وحفظ الصورة
export async function processAndSaveImage(
  file: Express.Multer.File,
  category: 'cars' | 'avatars' | 'dealerships' | 'service-centers',
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<string> {
  const { width = 800, height = 600, quality = 80 } = options;
  
  const filename = `${uuidv4()}.webp`;
  let targetDir: string;
  
  switch (category) {
    case 'cars':
      targetDir = carsDir;
      break;
    case 'avatars':
      targetDir = avatarsDir;
      break;
    case 'dealerships':
      targetDir = dealershipsDir;
      break;
    case 'service-centers':
      targetDir = serviceCentersDir;
      break;
    default:
      targetDir = uploadDir;
  }
  
  const filepath = path.join(targetDir, filename);
  
  // معالجة الصورة بـ Sharp
  await sharp(file.buffer)
    .resize(width, height, {
      fit: 'cover',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(filepath);
  
  // إرجاع المسار النسبي للصورة
  return `/uploads/${category}/${filename}`;
}

// معالجة صور متعددة
export async function processMultipleImages(
  files: Express.Multer.File[],
  category: 'cars' | 'avatars' | 'dealerships' | 'service-centers',
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<string[]> {
  const results: string[] = [];
  
  for (const file of files) {
    const imagePath = await processAndSaveImage(file, category, options);
    results.push(imagePath);
  }
  
  return results;
}

// حذف صورة
export function deleteImage(imagePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في حذف الصورة:', error);
    return false;
  }
}

// إنشاء thumbnail
export async function createThumbnail(
  file: Express.Multer.File,
  category: 'cars' | 'avatars' | 'dealerships' | 'service-centers'
): Promise<string> {
  return processAndSaveImage(file, category, {
    width: 200,
    height: 150,
    quality: 70,
  });
}
