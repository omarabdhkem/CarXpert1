import { Link } from 'wouter';
import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useUser } from '../hooks/useAuth';
import CarCard from '../components/CarCard';

export default function FavoritesPage() {
  const { user } = useUser();
  const { data: favorites, isLoading, error } = useFavorites();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">سجل دخولك لعرض المفضلة</h1>
        <Link href="/login" className="btn-primary inline-block">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">المفضلة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">حدث خطأ أثناء تحميل المفضلة</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">المفضلة</h1>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            fav.car && <CarCard key={fav.id} car={fav.car} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد سيارات في المفضلة
          </h3>
          <p className="text-gray-500 mb-6">
            ابدأ بإضافة السيارات التي تعجبك
          </p>
          <Link href="/cars" className="btn-primary inline-block">
            تصفح السيارات
          </Link>
        </div>
      )}
    </div>
  );
}
