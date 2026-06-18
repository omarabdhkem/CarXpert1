import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NotificationTemplates,
} from '../services/notifications';

describe('Notification Service', () => {
  const testUserId = 1;

  describe('createNotification', () => {
    it('should create a notification with correct properties', () => {
      const notification = createNotification(
        testUserId,
        'welcome',
        'Test Title',
        'Test Message',
        { extra: 'data' }
      );

      expect(notification).toBeDefined();
      expect(notification.id).toMatch(/^notif_/);
      expect(notification.userId).toBe(testUserId);
      expect(notification.type).toBe('welcome');
      expect(notification.title).toBe('Test Title');
      expect(notification.message).toBe('Test Message');
      expect(notification.read).toBe(false);
      expect(notification.data).toEqual({ extra: 'data' });
      expect(notification.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getUserNotifications', () => {
    it('should return notifications for a user', () => {
      createNotification(testUserId, 'welcome', 'Title 1', 'Message 1');
      createNotification(testUserId, 'car_sold', 'Title 2', 'Message 2');

      const notifications = getUserNotifications(testUserId);

      expect(notifications.length).toBeGreaterThanOrEqual(2);
      expect(notifications[0].type).toBe('car_sold'); // Most recent first
    });

    it('should respect limit parameter', () => {
      const notifications = getUserNotifications(testUserId, 1);
      expect(notifications.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return only unread notifications', () => {
      const notification = createNotification(testUserId, 'new_message', 'New', 'Message');
      markAsRead(notification.id);

      const anotherNotification = createNotification(testUserId, 'price_drop', 'Price', 'Drop');

      const unread = getUnreadNotifications(testUserId);
      const unreadIds = unread.map(n => n.id);

      expect(unreadIds).toContain(anotherNotification.id);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', () => {
      const notification1 = createNotification(testUserId, 'welcome', 'T1', 'M1');
      createNotification(testUserId, 'car_sold', 'T2', 'M2');
      markAsRead(notification1.id);

      const count = getUnreadCount(testUserId);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = createNotification(testUserId, 'welcome', 'Test', 'Test');
      expect(notification.read).toBe(false);

      const result = markAsRead(notification.id);
      expect(result).toBe(true);

      const notifications = getUserNotifications(testUserId);
      const updated = notifications.find(n => n.id === notification.id);
      expect(updated?.read).toBe(true);
    });

    it('should return false for non-existent notification', () => {
      const result = markAsRead('non_existent_id');
      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', () => {
      createNotification(testUserId, 'welcome', 'T1', 'M1');
      createNotification(testUserId, 'car_sold', 'T2', 'M2');

      const count = markAllAsRead(testUserId);
      expect(count).toBeGreaterThanOrEqual(0);

      const unreadCount = getUnreadCount(testUserId);
      expect(unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', () => {
      const notification = createNotification(testUserId, 'welcome', 'ToDelete', 'Message');
      
      const result = deleteNotification(notification.id);
      expect(result).toBe(true);

      const notifications = getUserNotifications(testUserId);
      const found = notifications.find(n => n.id === notification.id);
      expect(found).toBeUndefined();
    });

    it('should return false for non-existent notification', () => {
      const result = deleteNotification('non_existent_id');
      expect(result).toBe(false);
    });
  });

  describe('NotificationTemplates', () => {
    it('should generate welcome notification template', () => {
      const template = NotificationTemplates.welcome('TestUser');
      
      expect(template.type).toBe('welcome');
      expect(template.title).toContain('CarXpert');
      expect(template.message).toContain('TestUser');
    });

    it('should generate carSold notification template', () => {
      const template = NotificationTemplates.carSold('BMW X5');
      
      expect(template.type).toBe('car_sold');
      expect(template.message).toContain('BMW X5');
    });

    it('should generate priceDrop notification template', () => {
      const template = NotificationTemplates.priceDrop('Toyota Camry', 100000, 90000);
      
      expect(template.type).toBe('price_drop');
      expect(template.message).toContain('Toyota Camry');
      expect(template.message).toContain('100,000');
      expect(template.message).toContain('90,000');
    });
  });
});
