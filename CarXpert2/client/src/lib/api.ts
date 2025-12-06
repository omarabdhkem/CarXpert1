const API_BASE = '/api';

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'حدث خطأ' }));
    throw new Error(error.message || 'حدث خطأ');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (data: { username: string; password: string }) =>
    fetchApi('/login', { method: 'POST', body: JSON.stringify(data) }),
  
  register: (data: { username: string; email: string; password: string }) =>
    fetchApi('/register', { method: 'POST', body: JSON.stringify(data) }),
  
  logout: () => fetchApi('/logout', { method: 'POST' }),
  
  getUser: () => fetchApi('/user'),
};

// Cars API
export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  color?: string;
  fuelType?: string;
  description?: string;
  status?: string;
  userId?: number;
  createdAt?: string;
}

export interface CarFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  color?: string;
  fuelType?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export const carsApi = {
  getAll: (filters?: CarFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return fetchApi<ApiResponse<Car[]>>(`/cars?${params.toString()}`);
  },
  
  getById: (id: number) => fetchApi<Car>(`/cars/${id}`),
  
  create: (data: Omit<Car, 'id' | 'createdAt'>) =>
    fetchApi<Car>('/cars', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: number, data: Partial<Car>) =>
    fetchApi<Car>(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: number) =>
    fetchApi(`/cars/${id}`, { method: 'DELETE' }),
};

// Dealerships API
export interface Dealership {
  id: number;
  name: string;
  description?: string;
  address: string;
  location?: string;
  contact?: string;
  images?: string[];
  rating?: string;
  createdAt?: string;
}

export const dealershipsApi = {
  getAll: (params?: { search?: string; location?: string; minRating?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi<ApiResponse<Dealership[]>>(`/dealerships?${searchParams.toString()}`);
  },
  
  getById: (id: number) => fetchApi<Dealership>(`/dealerships/${id}`),
};

// Service Centers API
export interface ServiceCenter {
  id: number;
  name: string;
  description?: string;
  address: string;
  location?: string;
  services?: string[];
  contact?: string;
  images?: string[];
  rating?: string;
  createdAt?: string;
}

export const serviceCentersApi = {
  getAll: (params?: { search?: string; location?: string; service?: string; minRating?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi<ApiResponse<ServiceCenter[]>>(`/service-centers?${searchParams.toString()}`);
  },
  
  getById: (id: number) => fetchApi<ServiceCenter>(`/service-centers/${id}`),
};

// Favorites API
export interface Favorite {
  id: number;
  userId: number;
  carId: number;
  car?: Car;
  createdAt?: string;
}

export const favoritesApi = {
  getAll: () => fetchApi<Favorite[]>('/favorites'),
  
  add: (carId: number) =>
    fetchApi<Favorite>(`/favorites/${carId}`, { method: 'POST' }),
  
  remove: (carId: number) =>
    fetchApi(`/favorites/${carId}`, { method: 'DELETE' }),
};
