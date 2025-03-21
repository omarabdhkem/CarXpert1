
# تطبيق السيارات

هذا المشروع هو تطبيق ويب يستخدم Node.js وExpress لإدارة بيانات السيارات.

## متطلبات التشغيل

- Node.js (الإصدار 18 أو أحدث)
- قاعدة بيانات PostgreSQL
- قاعدة بيانات MongoDB (اختيارية للتحليلات)

## طريقة التثبيت

1. استنساخ المستودع:
```
git clone https://github.com/username/car-project.git
cd car-project
```

2. تثبيت التبعيات:
```
npm install
```

3. إعداد المتغيرات البيئية في ملف `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/cardb
MONGODB_URI=mongodb://localhost:27017/cardb
SESSION_SECRET=your-secret-key
```

4. تشغيل التطبيق:
```
npm start
```

الخادم سيعمل على المنفذ 5000 بشكل افتراضي.
