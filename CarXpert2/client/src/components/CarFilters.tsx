import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CarFilters } from '../lib/api';

interface CarFiltersProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
}

const carMakes = [
  'تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'بي ام دبليو', 'أودي',
  'فورد', 'شيفروليه', 'هيونداي', 'كيا', 'لكزس', 'إنفينيتي'
];

const fuelTypes = ['بنزين', 'ديزل', 'هايبرد', 'كهربائي'];

export default function CarFiltersComponent({ filters, onFilterChange }: CarFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key: keyof CarFilters, value: string | number | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن سيارة..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input-field pr-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-primary-50 border-primary-200 text-primary-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="hidden sm:inline">فلاتر</span>
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              !
            </span>
          )}
        </button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الماركة
              </label>
              <select
                value={filters.make || ''}
                onChange={(e) => handleChange('make', e.target.value)}
                className="input-field"
              >
                <option value="">الكل</option>
                {carMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الموديل
              </label>
              <input
                type="text"
                placeholder="الموديل"
                value={filters.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السعر (من)
              </label>
              <input
                type="number"
                placeholder="الحد الأدنى"
                value={filters.minPrice || ''}
                onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السعر (إلى)
              </label>
              <input
                type="number"
                placeholder="الحد الأقصى"
                value={filters.maxPrice || ''}
                onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السنة (من)
              </label>
              <input
                type="number"
                placeholder="من سنة"
                value={filters.minYear || ''}
                onChange={(e) => handleChange('minYear', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السنة (إلى)
              </label>
              <input
                type="number"
                placeholder="إلى سنة"
                value={filters.maxYear || ''}
                onChange={(e) => handleChange('maxYear', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الوقود
              </label>
              <select
                value={filters.fuelType || ''}
                onChange={(e) => handleChange('fuelType', e.target.value)}
                className="input-field"
              >
                <option value="">الكل</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ترتيب حسب
              </label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="input-field"
              >
                <option value="">الأحدث</option>
                <option value="price">السعر (الأقل)</option>
                <option value="year">السنة (الأحدث)</option>
                <option value="mileage">المسافة (الأقل)</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
