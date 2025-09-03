import { useState, useCallback } from 'react';
import { notificationAPI } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Custom hook for notification management that only fetches notifications on demand.
 * This hook provides all notification-related functionality without automatic background fetching.
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState(1);

  // Fetch notifications with optional parameters
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const defaultParams = {
        page: 1,
        limit: 20,
        ...params
      };
      
      const response = await notificationAPI.getNotifications(defaultParams);
      
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
      setTotalNotifications(response.totalNotifications || 0);
      setCurrentPage(response.currentPage || 1);
      setNumOfPages(response.numOfPages || 1);
      
      return response;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
      toast.error('Failed to fetch notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a specific notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          isRead: true, 
          readAt: new Date() 
        }))
      );
      
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
      throw err;
    }
  }, []);

  // Delete a specific notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      const deletedNotification = notifications.find(n => n._id === notificationId);
      
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      
      setTotalNotifications(prev => Math.max(0, prev - 1));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
      throw err;
    }
  }, [notifications]);

  // Get unread count without fetching all notifications
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getNotifications({ 
        page: 1, 
        limit: 1, 
        isRead: false 
      });
      setUnreadCount(response.unreadCount || 0);
      return response.unreadCount || 0;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, []);

  // Clear all local notification data
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setTotalNotifications(0);
    setCurrentPage(1);
    setNumOfPages(1);
    setError(null);
  }, []);

  return {
    // State
    notifications,
    loading,
    error,
    unreadCount,
    totalNotifications,
    currentPage,
    numOfPages,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
    clearNotifications
  };
};

export default useNotifications;