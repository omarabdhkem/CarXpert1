import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

// الحصول على الإشعارات
async function getNotifications(): Promise<NotificationsResponse> {
  const response = await fetch('/api/notifications', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('فشل في جلب الإشعارات');
  }
  return response.json();
}

// عدد الإشعارات غير المقروءة
async function getUnreadCount(): Promise<{ count: number }> {
  const response = await fetch('/api/notifications/count', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('فشل في جلب عدد الإشعارات');
  }
  return response.json();
}

// تحديد إشعار كمقروء
async function markAsRead(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('فشل في تحديث الإشعار');
  }
}

// تحديد جميع الإشعارات كمقروءة
async function markAllAsRead(): Promise<{ count: number }> {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('فشل في تحديث الإشعارات');
  }
  return response.json();
}

// حذف إشعار
async function deleteNotification(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('فشل في حذف الإشعار');
  }
}

// Hook للإشعارات
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });
}

// Hook لعدد الإشعارات غير المقروءة
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-count'],
    queryFn: getUnreadCount,
    refetchInterval: 15000, // تحديث كل 15 ثانية
  });
}

// Hook لتحديد إشعار كمقروء
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}

// Hook لتحديد الكل كمقروء
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}

// Hook لحذف إشعار
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}
