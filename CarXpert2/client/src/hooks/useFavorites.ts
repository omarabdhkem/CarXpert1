import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../lib/api';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getAll,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carId: number) => favoritesApi.add(carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carId: number) => favoritesApi.remove(carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
