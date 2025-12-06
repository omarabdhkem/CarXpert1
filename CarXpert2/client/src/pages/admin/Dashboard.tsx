import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Car,
  Building2,
  Wrench,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { carsApi, dealershipsApi, serviceCentersApi } from '../../lib/api';
import { useUser } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: carsData } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: () => carsApi.getAll({ limit: 100 }),
  });

  const { data: dealershipsData } = useQuery({
    queryKey: ['admin-dealerships'],
    queryFn: () => dealershipsApi.getAll(),
  });

  const { data: serviceCentersData } = useQuery({
    queryKey: ['admin-service-centers'],
    queryFn: () => serviceCentersApi.getAll(),
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <LayoutDashboard className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">سجل دخولك للوصول للوحة التحكم</h1>
        <Link href="/login" className="btn-primary inline-block">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: 'السيارات',
      value: carsData?.pagination?.total || 0,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      label: 'المعارض',
      value: dealershipsData?.pagination?.total || 0,
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      label: 'مراكز الخدمة',
      value: serviceCentersData?.pagination?.total || 0,
      icon: Wrench,
      color: 'bg-orange-500',
    },
    {
      label: 'المستخدمين',
      value: '50+',
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'cars', label: 'السيارات', icon: Car },
    { id: 'dealerships', label: 'المعارض', icon: Building2 },
    { id: 'service-centers', label: 'مراكز الخدمة', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-600">مرحباً {user.username}</p>
          </div>
          <Link href="/add-car" className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            إضافة سيارة
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b">
            <div className="flex gap-4 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                cars={carsData?.data || []}
                dealerships={dealershipsData?.data || []}
                serviceCenters={serviceCentersData?.data || []}
              />
            )}
            {activeTab === 'cars' && <CarsTab cars={carsData?.data || []} />}
            {activeTab === 'dealerships' && <DealershipsTab dealerships={dealershipsData?.data || []} />}
            {activeTab === 'service-centers' && <ServiceCentersTab serviceCenters={serviceCentersData?.data || []} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ cars, dealerships, serviceCenters }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">آخر النشاطات</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cars */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-4">أحدث السيارات</h4>
          <div className="space-y-3">
            {cars.slice(0, 5).map((car: any) => (
              <div key={car.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-medium">{car.make} {car.model}</p>
                  <p className="text-sm text-gray-500">{car.year}</p>
                </div>
                <p className="text-primary-600 font-semibold">
                  {car.price.toLocaleString()} ريال
                </p>
              </div>
            ))}
            {cars.length === 0 && (
              <p className="text-gray-500 text-center py-4">لا توجد سيارات</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-4">إحصائيات سريعة</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-3 rounded-lg">
              <span>السيارات المتاحة</span>
              <span className="font-semibold text-green-600">
                {cars.filter((c: any) => c.status === 'available').length}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg">
              <span>السيارات المباعة</span>
              <span className="font-semibold text-red-600">
                {cars.filter((c: any) => c.status === 'sold').length}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg">
              <span>المعارض النشطة</span>
              <span className="font-semibold text-blue-600">{dealerships.length}</span>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg">
              <span>مراكز الخدمة</span>
              <span className="font-semibold text-orange-600">{serviceCenters.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarsTab({ cars }: { cars: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCars = cars.filter(
    (car) =>
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن سيارة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pr-10"
          />
        </div>
        <Link href="/add-car" className="btn-primary">
          إضافة سيارة
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">السيارة</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">السنة</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">السعر</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{car.make} {car.model}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{car.year}</td>
                <td className="px-4 py-3 text-primary-600 font-medium">
                  {car.price.toLocaleString()} ريال
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    car.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : car.status === 'sold'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}>
                    {car.status === 'available' ? 'متاح' : car.status === 'sold' ? 'مباع' : 'محجوز'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/cars/${car.id}`} className="p-2 text-gray-500 hover:text-primary-600">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-gray-500 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCars.length === 0 && (
          <p className="text-center text-gray-500 py-8">لا توجد سيارات</p>
        )}
      </div>
    </div>
  );
}

function DealershipsTab({ dealerships }: { dealerships: any[] }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المعرض</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">العنوان</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">التقييم</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {dealerships.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-gray-500">{d.address}</td>
                <td className="px-4 py-3 text-yellow-500">⭐ {d.rating || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dealerships.length === 0 && (
          <p className="text-center text-gray-500 py-8">لا توجد معارض</p>
        )}
      </div>
    </div>
  );
}

function ServiceCentersTab({ serviceCenters }: { serviceCenters: any[] }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المركز</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">العنوان</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الخدمات</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {serviceCenters.map((sc) => (
              <tr key={sc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{sc.name}</td>
                <td className="px-4 py-3 text-gray-500">{sc.address}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {sc.services?.slice(0, 2).map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {serviceCenters.length === 0 && (
          <p className="text-center text-gray-500 py-8">لا توجد مراكز خدمة</p>
        )}
      </div>
    </div>
  );
}
