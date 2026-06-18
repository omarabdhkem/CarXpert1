import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi, CarFilters, Car } from '../lib/api';

export function useCars(filters?: CarFilters) {
  return useQuery({
    queryKey: ['cars', filters],
    queryFn: () => carsApi.getAll(filters),
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Car, 'id' | 'createdAt'>) => carsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Car> }) =>
      carsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', id] });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}
