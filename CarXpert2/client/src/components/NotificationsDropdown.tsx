import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks/useNotifications';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notificationsData, isLoading } = useNotifications();
  const { data: countData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = countData?.count || 0;
  const notifications = notificationsData?.notifications || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return '👋';
      case 'car_sold':
        return '🎉';
      case 'car_reserved':
        return '📋';
      case 'new_favorite':
        return '❤️';
      case 'price_drop':
        return '💰';
      case 'new_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">الإشعارات</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  قراءة الكل
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-72">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead.mutate(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-green-500"
                            title="تحديد كمقروء"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification.mutate(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t bg-gray-50 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-primary-600"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
