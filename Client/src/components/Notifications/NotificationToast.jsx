import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import toast from 'react-hot-toast';
import {
  Bell,
  FileText,
  Users,
  MessageSquare,
  Trophy,
  Calendar,
  Bookmark,
  CheckCircle
} from 'lucide-react';

const NotificationToast = () => {
  const { user, isAuthenticated } = useAuth();
  const { notifications, fetchNotifications } = useNotifications();
  const previousNotificationsRef = useRef([]);
  const isInitialLoadRef = useRef(true);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'resource_uploaded':
        return <FileText className='h-5 w-5 text-blue-500' />;
      case 'bookmark_added':
        return <Bookmark className='h-5 w-5 text-green-500' />;
      case 'request_created':
        return <MessageSquare className='h-5 w-5 text-orange-500' />;
      case 'course_enrolled':
        return <Calendar className='h-5 w-5 text-purple-500' />;
      case 'achievement_earned':
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 'study_group_joined':
        return <Users className='h-5 w-5 text-indigo-500' />;
      case 'resource_liked':
        return <CheckCircle className='h-5 w-5 text-pink-500' />;
      case 'resource_commented':
        return <MessageSquare className='h-5 w-5 text-cyan-500' />;
      case 'request_commented':
        return <MessageSquare className='h-5 w-5 text-teal-500' />;
      case 'request_fulfilled':
        return <CheckCircle className='h-5 w-5 text-emerald-500' />;
      default:
        return <Bell className='h-5 w-5 text-gray-500' />;
    }
  };

  // Get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'resource_uploaded':
        return 'Resource Uploaded';
      case 'bookmark_added':
        return 'Bookmark Added';
      case 'request_created':
        return 'Request Created';
      case 'course_enrolled':
        return 'Course Enrolled';
      case 'achievement_earned':
        return 'Achievement Earned';
      case 'study_group_joined':
        return 'Study Group Joined';
      case 'resource_liked':
        return 'Resource Liked';
      case 'resource_commented':
        return 'New Comment';
      case 'request_commented':
        return 'Request Comment';
      case 'request_fulfilled':
        return 'Request Fulfilled';
      default:
        return 'Notification';
    }
  };

  // Custom toast component for notifications
  const NotificationToastContent = ({ notification }) => (
    <div className='flex items-start space-x-3 p-2'>
      <div className='flex-shrink-0 mt-0.5'>
        {getNotificationIcon(notification.type)}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-gray-900'>
          {getNotificationTitle(notification.type)}
        </div>
        <div className='text-sm text-gray-600 mt-1'>
          {notification.message}
        </div>
      </div>
    </div>
  );

  // Check for new notifications and show toasts
  useEffect(() => {
    if (!isAuthenticated || !notifications || notifications.length === 0) {
      return;
    }

    // Skip showing toasts on initial load to avoid spam
    if (isInitialLoadRef.current) {
      previousNotificationsRef.current = notifications;
      isInitialLoadRef.current = false;
      return;
    }

    // Find new notifications by comparing with previous notifications
    const previousIds = new Set(previousNotificationsRef.current.map(n => n._id));
    const newNotifications = notifications.filter(n => !previousIds.has(n._id));

    // Show toast for each new notification
    newNotifications.forEach(notification => {
      // Only show toast for unread notifications
      if (!notification.isRead) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className='flex-1 w-0 p-4'>
                <NotificationToastContent notification={notification} />
              </div>
              <div className='flex border-l border-gray-200'>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  ×
                </button>
              </div>
            </div>
          ),
          {
            duration: 5000,
            position: 'top-right',
          }
        );
      }
    });

    // Update previous notifications reference
    previousNotificationsRef.current = notifications;
  }, [notifications, isAuthenticated]);

  // Fetch notifications periodically to check for new ones
  useEffect(() => {
    if (!isAuthenticated || !user || !fetchNotifications) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchNotifications]);

  // This component doesn't render anything visible
  return null;
};

export default NotificationToast;