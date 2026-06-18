import { Link } from 'wouter';
import { Search, Car, Building2, Wrench, ArrowLeft } from 'lucide-react';
import { useCars } from '../hooks/useCars';
import CarCard from '../components/CarCard';

export default function HomePage() {
  const { data: carsData, isLoading } = useCars({ limit: 6 });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ابحث عن سيارتك المثالية
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              أكبر منصة لبيع وشراء السيارات في المنطقة
            </p>
            
            {/* Search Box */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن ماركة أو موديل..."
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>
                <Link href="/cars" className="btn-primary py-3 px-8 text-center">
                  بحث
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">استكشف خدماتنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/cars">
              <div className="card p-8 text-center hover:border-primary-200 border-2 border-transparent">
                <Car className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">السيارات</h3>
                <p className="text-gray-600">
                  تصفح آلاف السيارات المعروضة للبيع
                </p>
              </div>
            </Link>
            
            <Link href="/dealerships">
              <div className="card p-8 text-center hover:border-primary-200 border-2 border-transparent">
                <Building2 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">المعارض</h3>
                <p className="text-gray-600">
                  اكتشف أفضل معارض السيارات القريبة منك
                </p>
              </div>
            </Link>
            
            <Link href="/service-centers">
              <div className="card p-8 text-center hover:border-primary-200 border-2 border-transparent">
                <Wrench className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">مراكز الخدمة</h3>
                <p className="text-gray-600">
                  أفضل مراكز صيانة وخدمة السيارات
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">أحدث السيارات</h2>
            <Link
              href="/cars"
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
            >
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : carsData?.data && carsData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carsData.data.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد سيارات متاحة حالياً</p>
              <Link href="/add-car" className="btn-primary mt-4 inline-block">
                أضف سيارتك الأولى
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">هل تريد بيع سيارتك؟</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            أضف إعلان سيارتك مجاناً ووصل إلى آلاف المشترين المحتملين
          </p>
          <Link
            href="/add-car"
            className="inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            أضف سيارتك الآن
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">1000+</div>
              <div className="text-gray-400">سيارة معروضة</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">500+</div>
              <div className="text-gray-400">معرض معتمد</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">200+</div>
              <div className="text-gray-400">مركز خدمة</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">50K+</div>
              <div className="text-gray-400">مستخدم نشط</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
