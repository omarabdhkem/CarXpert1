import nodemailer from 'nodemailer';

// أنواع الإشعارات
export type NotificationType = 
  | 'welcome'
  | 'car_sold'
  | 'car_reserved'
  | 'new_favorite'
  | 'price_drop'
  | 'new_message'
  | 'password_reset';

// واجهة الإشعار
export interface Notification {
  id: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

// مخزن الإشعارات في الذاكرة (يمكن استبداله بقاعدة بيانات)
const notifications: Map<string, Notification> = new Map();
const userNotifications: Map<number, string[]> = new Map();

// إنشاء معرف فريد
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// إنشاء إشعار جديد
export function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Notification {
  const notification: Notification = {
    id: generateId(),
    userId,
    type,
    title,
    message,
    read: false,
    data,
    createdAt: new Date(),
  };
  
  notifications.set(notification.id, notification);
  
  // إضافة للمستخدم
  const userNotifs = userNotifications.get(userId) || [];
  userNotifs.push(notification.id);
  userNotifications.set(userId, userNotifs);
  
  return notification;
}

// الحصول على إشعارات المستخدم
export function getUserNotifications(userId: number, limit = 50): Notification[] {
  const userNotifIds = userNotifications.get(userId) || [];
  return userNotifIds
    .slice(-limit)
    .reverse()
    .map(id => notifications.get(id)!)
    .filter(Boolean);
}

// الحصول على الإشعارات غير المقروءة
export function getUnreadNotifications(userId: number): Notification[] {
  return getUserNotifications(userId).filter(n => !n.read);
}

// عدد الإشعارات غير المقروءة
export function getUnreadCount(userId: number): number {
  return getUnreadNotifications(userId).length;
}

// تحديد إشعار كمقروء
export function markAsRead(notificationId: string): boolean {
  const notification = notifications.get(notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
}

// تحديد جميع إشعارات المستخدم كمقروءة
export function markAllAsRead(userId: number): number {
  const userNotifIds = userNotifications.get(userId) || [];
  let count = 0;
  userNotifIds.forEach(id => {
    const notification = notifications.get(id);
    if (notification && !notification.read) {
      notification.read = true;
      count++;
    }
  });
  return count;
}

// حذف إشعار
export function deleteNotification(notificationId: string): boolean {
  const notification = notifications.get(notificationId);
  if (notification) {
    notifications.delete(notificationId);
    const userNotifIds = userNotifications.get(notification.userId) || [];
    userNotifications.set(
      notification.userId,
      userNotifIds.filter(id => id !== notificationId)
    );
    return true;
  }
  return false;
}

// إشعارات مُعدة مسبقاً
export const NotificationTemplates = {
  welcome: (username: string) => ({
    type: 'welcome' as NotificationType,
    title: 'مرحباً بك في CarXpert!',
    message: `أهلاً ${username}! يسعدنا انضمامك إلى منصتنا. ابدأ باستكشاف السيارات المتاحة.`,
  }),
  
  carSold: (carName: string) => ({
    type: 'car_sold' as NotificationType,
    title: 'تم بيع سيارتك!',
    message: `تهانينا! تم بيع سيارتك ${carName} بنجاح.`,
  }),
  
  carReserved: (carName: string) => ({
    type: 'car_reserved' as NotificationType,
    title: 'تم حجز سيارتك',
    message: `تم حجز سيارتك ${carName}. سيتم التواصل معك قريباً.`,
  }),
  
  newFavorite: (carName: string) => ({
    type: 'new_favorite' as NotificationType,
    title: 'إضافة إلى المفضلة',
    message: `شخص ما أضاف سيارتك ${carName} إلى المفضلة لديه.`,
  }),
  
  priceDrop: (carName: string, oldPrice: number, newPrice: number) => ({
    type: 'price_drop' as NotificationType,
    title: 'انخفاض في السعر!',
    message: `انخفض سعر ${carName} من ${oldPrice.toLocaleString()} إلى ${newPrice.toLocaleString()} ريال.`,
  }),
  
  newMessage: (senderName: string) => ({
    type: 'new_message' as NotificationType,
    title: 'رسالة جديدة',
    message: `لديك رسالة جديدة من ${senderName}.`,
  }),
  
  passwordReset: () => ({
    type: 'password_reset' as NotificationType,
    title: 'إعادة تعيين كلمة المرور',
    message: 'تم طلب إعادة تعيين كلمة المرور لحسابك.',
  }),
};

// إعداد Email transporter (يحتاج متغيرات بيئية)
let emailTransporter: nodemailer.Transporter | null = null;

export function initEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('تم تهيئة خدمة البريد الإلكتروني');
    return true;
  }
  console.log('لم يتم إعداد خدمة البريد الإلكتروني (متغيرات SMTP غير موجودة)');
  return false;
}

// إرسال بريد إلكتروني
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!emailTransporter) {
    console.log('خدمة البريد الإلكتروني غير متاحة');
    return false;
  }
  
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'CarXpert <noreply@carxpert.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    return false;
  }
}

// قوالب البريد الإلكتروني
export const EmailTemplates = {
  welcome: (username: string) => ({
    subject: 'مرحباً بك في CarXpert!',
    html: `
      <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563eb;">مرحباً ${username}!</h1>
        <p>يسعدنا انضمامك إلى CarXpert - أفضل منصة للسيارات.</p>
        <p>يمكنك الآن:</p>
        <ul>
          <li>تصفح آلاف السيارات</li>
          <li>إضافة سياراتك للبيع</li>
          <li>التواصل مع المعارض</li>
          <li>حفظ سياراتك المفضلة</li>
        </ul>
        <a href="${process.env.APP_URL || 'http://localhost:5000'}/cars" 
           style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          ابدأ التصفح
        </a>
      </div>
    `,
  }),
  
  passwordReset: (resetLink: string) => ({
    subject: 'إعادة تعيين كلمة المرور - CarXpert',
    html: `
      <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563eb;">إعادة تعيين كلمة المرور</h1>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.</p>
        <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
        <a href="${resetLink}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          إعادة تعيين كلمة المرور
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
        </p>
      </div>
    `,
  }),
};
