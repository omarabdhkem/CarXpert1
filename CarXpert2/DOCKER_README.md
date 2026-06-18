# 🐳 CarXpert Docker Deployment Guide

دليل نشر مشروع CarXpert باستخدام Docker

## 📋 المتطلبات الأساسية

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM على الأقل
- 10GB مساحة تخزين

## 🚀 التشغيل السريع

### 1. نسخ ملف البيئة

```bash
cp .env.example .env
```

### 2. تعديل المتغيرات البيئية

```bash
nano .env
```

**تأكد من تغيير:**
- `SESSION_SECRET` - مفتاح سري قوي
- `POSTGRES_PASSWORD` - كلمة مرور قاعدة البيانات
- `MONGO_PASSWORD` - كلمة مرور MongoDB

### 3. بناء وتشغيل التطبيق

```bash
# بناء وتشغيل كل الخدمات
docker-compose up -d --build

# متابعة السجلات
docker-compose logs -f
```

### 4. الوصول للتطبيق

- **التطبيق:** http://localhost:5000
- **PostgreSQL:** localhost:5432
- **MongoDB:** localhost:27017

---

## 🛠 أوامر Docker المفيدة

### إدارة الحاويات

```bash
# عرض حالة الحاويات
docker-compose ps

# إيقاف كل الخدمات
docker-compose down

# إعادة تشغيل خدمة معينة
docker-compose restart app

# عرض سجلات خدمة معينة
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f mongodb
```

### إدارة قاعدة البيانات

```bash
# الاتصال بـ PostgreSQL
docker-compose exec postgres psql -U carxpert -d carxpert

# إنشاء نسخة احتياطية
docker-compose exec postgres pg_dump -U carxpert carxpert > backup.sql

# استعادة نسخة احتياطية
cat backup.sql | docker-compose exec -T postgres psql -U carxpert carxpert

# الاتصال بـ MongoDB
docker-compose exec mongodb mongosh -u carxpert -p carxpert123 --authenticationDatabase admin
```

### تنظيف البيانات

```bash
# حذف كل شيء (تحذير: سيحذف البيانات!)
docker-compose down -v

# حذف الصور غير المستخدمة
docker image prune -a
```

---

## 🔧 التشغيل للتطوير

للتطوير المحلي، استخدم `docker-compose.dev.yml`:

```bash
# تشغيل قواعد البيانات فقط
docker-compose -f docker-compose.dev.yml up -d

# تشغيل مع أدوات الإدارة (pgAdmin, Mongo Express)
docker-compose -f docker-compose.dev.yml --profile tools up -d
```

### الوصول لأدوات الإدارة:
- **pgAdmin:** http://localhost:8080
  - Email: `admin@carxpert.com`
  - Password: `admin123`
- **Mongo Express:** http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

### تشغيل التطبيق محلياً (مع قواعد البيانات في Docker):

```bash
# في مجلد المشروع
export DATABASE_URL="postgresql://carxpert:carxpert123@localhost:5432/carxpert"
export MONGODB_URI="mongodb://carxpert:carxpert123@localhost:27017/carxpert_analytics?authSource=admin"

npm install
npm run dev
```

---

## 🔒 الإنتاج مع Nginx و SSL

### 1. إعداد الشهادة SSL

```bash
mkdir -p docker/ssl
# ضع ملفات الشهادة:
# - docker/ssl/fullchain.pem
# - docker/ssl/privkey.pem
```

### 2. تشغيل مع Nginx

```bash
docker-compose --profile production up -d
```

### 3. إعداد Domain

عدّل `docker/nginx.conf` وغيّر `server_name` إلى الدومين الخاص بك.

---

## 📊 مراقبة الحالة

### فحص صحة الخدمات

```bash
# فحص كل الخدمات
docker-compose ps

# فحص API
curl http://localhost:5000/api/health
```

### استجابة متوقعة من Health Check:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "service": "CarXpert API"
}
```

---

## 🏗 هيكل Docker

```
CarXpert2/
├── Dockerfile              # بناء التطبيق
├── docker-compose.yml      # الإنتاج
├── docker-compose.dev.yml  # التطوير
├── .dockerignore           # ملفات مستثناة
├── .env.example            # قالب المتغيرات
└── docker/
    ├── init-db.sql         # تهيئة قاعدة البيانات
    ├── nginx.conf          # إعدادات Nginx
    └── ssl/                # شهادات SSL
```

---

## 🔧 استكشاف الأخطاء

### التطبيق لا يعمل

```bash
# فحص السجلات
docker-compose logs app

# التأكد من صحة قاعدة البيانات
docker-compose exec postgres pg_isready
```

### خطأ في الاتصال بقاعدة البيانات

```bash
# إعادة تشغيل PostgreSQL
docker-compose restart postgres

# فحص الشبكة
docker network inspect carxpert2_carxpert-network
```

### مشكلة في الذاكرة

```bash
# فحص استخدام الموارد
docker stats

# زيادة الذاكرة في docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

## 📱 البيانات التجريبية

قاعدة البيانات تحتوي على بيانات تجريبية للاختبار:

### المستخدمين:
| Username | Email | Password |
|----------|-------|----------|
| admin | admin@carxpert.com | password123 |
| ahmed | ahmed@example.com | password123 |
| sara | sara@example.com | password123 |

### البيانات المتوفرة:
- 10 سيارات متنوعة
- 4 معارض سيارات
- 4 مراكز خدمة

---

## 🎉 جاهز للإنتاج!

بعد اتباع هذه الخطوات، سيكون لديك:
- ✅ تطبيق CarXpert يعمل بالكامل
- ✅ قاعدة بيانات PostgreSQL
- ✅ قاعدة بيانات MongoDB للتحليلات
- ✅ نظام رفع الصور
- ✅ نظام الإشعارات
- ✅ حماية وأمان متكاملة

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، افتح Issue في GitHub.
