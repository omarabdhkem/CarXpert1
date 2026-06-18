import { useRoute, Link } from 'wouter';
import { ArrowRight, Calendar, Gauge, Fuel, Palette, Heart, Share2, Phone } from 'lucide-react';
import { useCar } from '../hooks/useCars';
import { useUser } from '../hooks/useAuth';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '../hooks/useFavorites';

export default function CarDetailsPage() {
  const [, params] = useRoute('/cars/:id');
  const carId = params?.id ? parseInt(params.id) : 0;
  
  const { data: car, isLoading, error } = useCar(carId);
  const { user } = useUser();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorited = favorites?.some((f) => f.carId === carId);

  const handleFavoriteClick = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (isFavorited) {
      removeFavorite.mutate(carId);
    } else {
      addFavorite.mutate(carId);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">السيارة غير موجودة</h1>
        <Link href="/cars" className="text-primary-600 hover:text-primary-700">
          العودة للسيارات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cars" className="hover:text-primary-600">السيارات</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900">{car.make} {car.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl h-96 flex items-center justify-center mb-6">
            <span className="text-8xl">🚗</span>
          </div>

          {/* Details */}
          <div className="card p-6">
            <h1 className="text-3xl font-bold mb-2">{car.make} {car.model}</h1>
            <p className="text-2xl font-bold text-primary-600 mb-6">
              {formatPrice(car.price)}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Calendar className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">سنة الصنع</p>
                <p className="font-semibold">{car.year}</p>
              </div>
              {car.mileage && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Gauge className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">الممشى</p>
                  <p className="font-semibold">{car.mileage.toLocaleString()} كم</p>
                </div>
              )}
              {car.fuelType && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Fuel className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">نوع الوقود</p>
                  <p className="font-semibold">{car.fuelType}</p>
                </div>
              )}
              {car.color && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Palette className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">اللون</p>
                  <p className="font-semibold">{car.color}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {car.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">الوصف</h2>
                <p className="text-gray-600 leading-relaxed">{car.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card p-6 sticky top-24">
            {/* Status Badge */}
            {car.status && (
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                car.status === 'available' 
                  ? 'bg-green-100 text-green-700'
                  : car.status === 'sold'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
              }`}>
                {car.status === 'available' ? 'متاح' : car.status === 'sold' ? 'مباع' : 'محجوز'}
              </div>
            )}

            <div className="text-3xl font-bold text-primary-600 mb-6">
              {formatPrice(car.price)}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                <Phone className="h-5 w-5" />
                اتصل بالبائع
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleFavoriteClick}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                    isFavorited
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'إزالة' : 'حفظ'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Share2 className="h-5 w-5" />
                  مشاركة
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">نصائح الأمان</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• قم بفحص السيارة قبل الشراء</li>
                <li>• تأكد من الأوراق والملكية</li>
                <li>• قابل البائع في مكان عام</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
