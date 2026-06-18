import { Link } from 'wouter';
import { Heart, Calendar, Gauge, Fuel } from 'lucide-react';
import { Car } from '../lib/api';
import { useUser } from '../hooks/useAuth';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '../hooks/useFavorites';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const { user } = useUser();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorited = favorites?.some((f) => f.carId === car.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (isFavorited) {
      removeFavorite.mutate(car.id);
    } else {
      addFavorite.mutate(car.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/cars/${car.id}`}>
      <div className="card cursor-pointer group">
        {/* Image placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <span className="text-4xl">🚗</span>
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          {car.status && car.status !== 'available' && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              {car.status === 'sold' ? 'مباع' : 'محجوز'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-gray-500">{car.year}</p>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-primary-600">
                {formatPrice(car.price)}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3 pt-3 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{car.year}</span>
            </div>
            {car.mileage && (
              <div className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <span>{car.mileage.toLocaleString()} كم</span>
              </div>
            )}
            {car.fuelType && (
              <div className="flex items-center gap-1">
                <Fuel className="h-4 w-4" />
                <span>{car.fuelType}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
