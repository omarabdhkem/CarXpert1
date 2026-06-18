import { useState } from 'react';
import { Car } from 'lucide-react';
import { useCars } from '../hooks/useCars';
import CarCard from '../components/CarCard';
import CarFilters from '../components/CarFilters';
import { CarFilters as CarFiltersType } from '../lib/api';

export default function CarsPage() {
  const [filters, setFilters] = useState<CarFiltersType>({});
  const { data, isLoading, error } = useCars(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">تصفح السيارات</h1>
      
      <CarFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">حدث خطأ أثناء تحميل البيانات</p>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              {data.pagination?.total} سيارة متاحة
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          
          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(data.pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={`px-4 py-2 rounded-lg ${
                    (filters.page || 1) === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Car className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد سيارات
          </h3>
          <p className="text-gray-500">
            جرب تغيير معايير البحث أو أضف سيارتك الأولى
          </p>
        </div>
      )}
    </div>
  );
}
