-- CarXpert Database Initialization Script
-- This script creates all necessary tables and initial data

-- Create extension for UUID if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for car status
DO $$ BEGIN
    CREATE TYPE car_status AS ENUM ('available', 'sold', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cars table
CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price INTEGER NOT NULL,
    mileage INTEGER,
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    description TEXT,
    status car_status DEFAULT 'available',
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dealerships table
CREATE TABLE IF NOT EXISTS dealerships (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    location TEXT,
    contact TEXT,
    images TEXT[],
    rating DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_centers table
CREATE TABLE IF NOT EXISTS service_centers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    location TEXT,
    services TEXT[],
    contact TEXT,
    images TEXT[],
    rating DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
    dealership_id INTEGER REFERENCES dealerships(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, car_id)
);

-- Create session table for express-session
CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_make ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_model ON cars(model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_dealerships_location ON dealerships(location);
CREATE INDEX IF NOT EXISTS idx_service_centers_location ON service_centers(location);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_car_id ON favorites(car_id);

-- Insert sample data for testing

-- Sample Users (password is 'password123' hashed with scrypt)
INSERT INTO users (username, email, password, full_name, phone) VALUES
    ('admin', 'admin@carxpert.com', '5e884898da28047d9169e3c53b63cd14bf0e6e8c7f33dc92ef4f0f9a25b9c0c9.1234567890abcdef', 'مدير النظام', '+966500000000'),
    ('ahmed', 'ahmed@example.com', '5e884898da28047d9169e3c53b63cd14bf0e6e8c7f33dc92ef4f0f9a25b9c0c9.1234567890abcdef', 'أحمد محمد', '+966500000001'),
    ('sara', 'sara@example.com', '5e884898da28047d9169e3c53b63cd14bf0e6e8c7f33dc92ef4f0f9a25b9c0c9.1234567890abcdef', 'سارة علي', '+966500000002')
ON CONFLICT (username) DO NOTHING;

-- Sample Cars
INSERT INTO cars (make, model, year, price, mileage, color, fuel_type, description, status, user_id) VALUES
    ('Toyota', 'Camry', 2023, 120000, 15000, 'أبيض', 'بنزين', 'سيارة تويوتا كامري 2023 بحالة ممتازة، صيانة دورية في الوكالة', 'available', 1),
    ('Honda', 'Accord', 2022, 95000, 30000, 'أسود', 'بنزين', 'هوندا أكورد 2022، فتحة سقف، مقاعد جلد', 'available', 1),
    ('Mercedes-Benz', 'E-Class', 2021, 250000, 45000, 'فضي', 'بنزين', 'مرسيدس E-Class 2021، فل أوبشن، ضمان سنتين', 'available', 2),
    ('BMW', '520i', 2023, 280000, 10000, 'أزرق', 'بنزين', 'BMW 520i 2023، سبورت باكج، نظافة 100%', 'available', 2),
    ('Lexus', 'ES350', 2022, 180000, 25000, 'أبيض لؤلؤي', 'بنزين', 'لكزس ES350 2022، وارد أمريكي، صيانة كاملة', 'sold', 1),
    ('Hyundai', 'Sonata', 2023, 75000, 5000, 'رمادي', 'بنزين', 'هيونداي سوناتا 2023، وكالة، ضمان شامل', 'available', 3),
    ('Nissan', 'Altima', 2022, 68000, 20000, 'بني', 'بنزين', 'نيسان ألتيما 2022، اقتصادية في البنزين', 'reserved', 3),
    ('Kia', 'K5', 2023, 85000, 8000, 'أحمر', 'بنزين', 'كيا K5 2023، تصميم رياضي، شاشة كبيرة', 'available', 2),
    ('Chevrolet', 'Malibu', 2021, 55000, 50000, 'أبيض', 'بنزين', 'شيفروليه ماليبو 2021، حالة جيدة، سعر مناسب', 'available', 1),
    ('Ford', 'Taurus', 2020, 65000, 60000, 'أسود', 'بنزين', 'فورد توروس 2020، مقاس كبير، مريحة للعائلة', 'available', 3)
ON CONFLICT DO NOTHING;

-- Sample Dealerships
INSERT INTO dealerships (name, description, address, location, contact, rating) VALUES
    ('معرض الرياض للسيارات', 'أكبر معرض سيارات في الرياض، نوفر جميع الماركات العالمية', 'طريق الملك فهد، الرياض', 'الرياض', '+966112345678', 4.5),
    ('معرض جدة الدولي', 'معرض سيارات فاخرة في جدة، تمويل ميسر', 'شارع التحلية، جدة', 'جدة', '+966126543210', 4.8),
    ('معرض الدمام', 'أفضل الأسعار وأفضل الخدمات في المنطقة الشرقية', 'طريق الملك عبدالعزيز، الدمام', 'الدمام', '+966138765432', 4.2),
    ('معرض النخبة', 'متخصصون في السيارات الفاخرة والرياضية', 'حي الملقا، الرياض', 'الرياض', '+966111234567', 4.9)
ON CONFLICT DO NOTHING;

-- Sample Service Centers
INSERT INTO service_centers (name, description, address, location, services, contact, rating) VALUES
    ('مركز الصيانة الشاملة', 'خدمات صيانة متكاملة لجميع أنواع السيارات', 'حي العليا، الرياض', 'الرياض', ARRAY['صيانة دورية', 'تبديل زيت', 'فحص شامل', 'برمجة كمبيوتر'], '+966112223344', 4.6),
    ('مركز البرمجة والكهرباء', 'متخصصون في كهرباء وبرمجة السيارات', 'حي السلامة، جدة', 'جدة', ARRAY['برمجة مفاتيح', 'إصلاح كهرباء', 'فحص كمبيوتر'], '+966126667788', 4.3),
    ('مركز العناية بالسيارات', 'تلميع وعناية شاملة بسيارتك', 'حي الخبر الشمالية، الخبر', 'الخبر', ARRAY['تلميع', 'عازل حراري', 'نانو سيراميك', 'تنظيف داخلي'], '+966139998877', 4.7),
    ('مركز الإطارات السريع', 'كل ما يخص الإطارات والجنوط', 'طريق خريص، الرياض', 'الرياض', ARRAY['تبديل إطارات', 'ترصيص', 'جنوط', 'ميزان'], '+966114445566', 4.4)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO carxpert;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO carxpert;

COMMIT;
