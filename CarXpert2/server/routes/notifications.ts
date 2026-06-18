import { Router, Request, Response } from 'express';
import {
  getUserNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  NotificationTemplates,
} from '../services/notifications';

const router = Router();

// التحقق من تسجيل الدخول
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'يجب تسجيل الدخول' });
}

// الحصول على جميع إشعارات المستخدم
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const notifications = getUserNotifications(userId, limit);
    const unreadCount = getUnreadCount(userId);
    
    res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error: any) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في جلب الإشعارات' });
  }
});

// الحصول على الإشعارات غير المقروءة فقط
router.get('/unread', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    const notifications = getUnreadNotifications(userId);
    
    res.json({
      notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في جلب الإشعارات' });
  }
});

// عدد الإشعارات غير المقروءة
router.get('/count', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const count = getUnreadCount(userId);
    
    res.json({ count });
  } catch (error: any) {
    console.error('خطأ في حساب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في حساب الإشعارات' });
  }
});

// تحديد إشعار كمقروء
router.patch('/:id/read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = markAsRead(id);
    if (success) {
      res.json({ message: 'تم تحديد الإشعار كمقروء' });
    } else {
      res.status(404).json({ message: 'الإشعار غير موجود' });
    }
  } catch (error: any) {
    console.error('خطأ في تحديث الإشعار:', error);
    res.status(500).json({ message: 'خطأ في تحديث الإشعار' });
  }
});

// تحديد جميع الإشعارات كمقروءة
router.patch('/read-all', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    const count = markAllAsRead(userId);
    res.json({ 
      message: `تم تحديد ${count} إشعار كمقروء`,
      count,
    });
  } catch (error: any) {
    console.error('خطأ في تحديث الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في تحديث الإشعارات' });
  }
});

// حذف إشعار
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = deleteNotification(id);
    if (success) {
      res.json({ message: 'تم حذف الإشعار' });
    } else {
      res.status(404).json({ message: 'الإشعار غير موجود' });
    }
  } catch (error: any) {
    console.error('خطأ في حذف الإشعار:', error);
    res.status(500).json({ message: 'خطأ في حذف الإشعار' });
  }
});

// إنشاء إشعار (للاختبار فقط - يُفضل استخدام الـ service مباشرة)
router.post('/test', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const username = (req.user as any).username;
    
    // إنشاء إشعار ترحيبي للاختبار
    const template = NotificationTemplates.welcome(username);
    const notification = createNotification(
      userId,
      template.type,
      template.title,
      template.message
    );
    
    res.json({
      message: 'تم إنشاء إشعار اختباري',
      notification,
    });
  } catch (error: any) {
    console.error('خطأ في إنشاء الإشعار:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الإشعار' });
  }
});

export default router;
