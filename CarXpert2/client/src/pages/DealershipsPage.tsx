import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, Phone, Building2 } from 'lucide-react';
import { dealershipsApi, Dealership } from '../lib/api';

export default function DealershipsPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dealerships', { search, location }],
    queryFn: () => dealershipsApi.getAll({ search, location }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">معارض السيارات</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن معرض..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="الموقع..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field pr-10"
            />
          </div>
        </div>
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
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">حدث خطأ أثناء تحميل البيانات</p>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((dealership: Dealership) => (
            <DealershipCard key={dealership.id} dealership={dealership} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Building2 className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد معارض
          </h3>
          <p className="text-gray-500">
            جرب تغيير معايير البحث
          </p>
        </div>
      )}
    </div>
  );
}

function DealershipCard({ dealership }: { dealership: Dealership }) {
  return (
    <div className="card">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <Building2 className="h-16 w-16 text-gray-400" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{dealership.name}</h3>
        
        {dealership.rating && (
          <div className="flex items-center gap-1 text-yellow-500 mb-2">
            <Star className="h-4 w-4 fill-current" />
            <span>{dealership.rating}</span>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{dealership.address}</span>
        </div>

        {dealership.contact && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Phone className="h-4 w-4" />
            <span>{dealership.contact}</span>
          </div>
        )}

        {dealership.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{dealership.description}</p>
        )}

        <button className="w-full mt-4 btn-primary">
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}
