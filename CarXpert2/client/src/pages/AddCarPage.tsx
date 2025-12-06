import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Car, ArrowRight } from 'lucide-react';
import { useCreateCar } from '../hooks/useCars';
import { useUser } from '../hooks/useAuth';

const carMakes = [
  'تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي ام دبليو', 'أودي',
  'فورد', 'شيفروليه', 'هيونداي', 'كيا', 'لكزس', 'إنفينيتي'
];

const fuelTypes = ['بنزين', 'ديزل', 'هايبرد', 'كهربائي'];

const colors = ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'أخضر', 'بني', 'ذهبي'];

export default function AddCarPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const createCar = useCreateCar();
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    color: '',
    fuelType: '',
    description: '',
  });
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Car className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">سجل دخولك لإضافة سيارة</h1>
        <Link href="/login" className="btn-primary inline-block">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.make || !formData.model || !formData.year || !formData.price) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await createCar.mutateAsync(formData);
      setLocation('/cars');
    } catch (err: any) {
      setError(err.message || 'فشل إضافة السيارة');
    }
  };

  const handleChange = (key: string, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cars" className="hover:text-primary-600">السيارات</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900">إضافة سيارة</span>
      </nav>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">إضافة سيارة جديدة</h1>

        <div className="card p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Make */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الماركة <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.make}
                  onChange={(e) => handleChange('make', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">اختر الماركة</option>
                  {carMakes.map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الموديل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="input-field"
                  placeholder="مثال: كامري"
                  required
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سنة الصنع <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value))}
                  className="input-field"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السعر (ريال) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              {/* Mileage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الممشى (كم)
                </label>
                <input
                  type="number"
                  value={formData.mileage || ''}
                  onChange={(e) => handleChange('mileage', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اللون
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="input-field"
                >
                  <option value="">اختر اللون</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع الوقود
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleChange('fuelType', e.target.value)}
                  className="input-field"
                >
                  <option value="">اختر نوع الوقود</option>
                  {fuelTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input-field h-32 resize-none"
                placeholder="أضف وصفاً تفصيلياً للسيارة..."
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createCar.isPending}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCar.isPending ? 'جاري الإضافة...' : 'إضافة السيارة'}
              </button>
              <Link
                href="/cars"
                className="btn-secondary py-3 px-6"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
