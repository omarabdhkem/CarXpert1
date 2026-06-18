import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export function useUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.getUser() as Promise<User>,
    retry: false,
    staleTime: Infinity,
  });

  return {
    user: error ? null : user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
