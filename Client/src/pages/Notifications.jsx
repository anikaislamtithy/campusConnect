import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationAPI } from '../lib/api';
import {
  Bell,
  Check,
  Trash2,
  Mail,
  Users,
  FileText,
  MessageSquare,
  Trophy,
  Calendar,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        userId: user?.userId,
        status: filter === 'all' ? undefined : filter,
        page: 1,
        limit: 50,
      };
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'resource_upload':
        return <FileText className='h-5 w-5 text-blue-500' />;
      case 'study_group_invite':
        return <Users className='h-5 w-5 text-green-500' />;
      case 'resource_request':
        return <MessageSquare className='h-5 w-5 text-orange-500' />;
      case 'achievement_earned':
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 'course_enrollment':
        return <Calendar className='h-5 w-5 text-purple-500' />;
      default:
        return <Bell className='h-5 w-5 text-gray-500' />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'resource_upload':
        return 'New Resource Uploaded';
      case 'study_group_invite':
        return 'Study Group Invitation';
      case 'resource_request':
        return 'Resource Request';
      case 'achievement_earned':
        return 'Achievement Earned';
      case 'course_enrollment':
        return 'Course Enrollment';
      default:
        return 'Notification';
    }
  };

  const NotificationCard = ({ notification }) => (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${
      notification.isRead ? 'border-gray-200' : 'border-blue-500'
    } p-4 hover:shadow-md transition-shadow duration-200`}>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0 mt-1'>
          {getNotificationIcon(notification.type)}
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h3 className={`text-sm font-medium ${
              notification.isRead ? 'text-gray-600' : 'text-gray-900'
            }`}>
              {getNotificationTitle(notification.type)}
            </h3>
            <div className='flex items-center space-x-2'>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className='p-1 text-gray-400 hover:text-green-500 transition-colors'
                  title='Mark as read'
                >
                  <Check className='h-4 w-4' />
                </button>
              )}
              <button
                onClick={() => handleDeleteNotification(notification._id)}
                className='p-1 text-gray-400 hover:text-red-500 transition-colors'
                title='Delete notification'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          </div>
          <p className={`text-sm mt-1 ${
            notification.isRead ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          <div className='flex items-center justify-between mt-2'>
            <p className='text-xs text-gray-400'>
              {new Date(notification.createdAt).toLocaleString()}
            </p>
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className='text-xs text-blue-600 hover:text-blue-500'
              >
                View Details
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Notifications</h1>
          <p className='mt-2 text-gray-600'>
            Stay updated with your latest activities and interactions
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            <Check className='h-5 w-5 mr-2' />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8 px-6'>
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'read', label: 'Read', count: notifications.length - unreadCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className='ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs'>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='space-y-4'>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification._id} notification={notification} />
            ))
          ) : (
            <div className='text-center py-12'>
              <Bell className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No notifications</h3>
              <p className='text-gray-500'>
                {filter === 'all' 
                  ? "You're all caught up! No notifications yet."
                  : filter === 'unread'
                  ? "No unread notifications."
                  : "No read notifications."
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notification Settings */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Notification Settings</h2>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>Email Notifications</h3>
              <p className='text-sm text-gray-500'>Receive notifications via email</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input type='checkbox' className='sr-only peer' defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>Study Group Invitations</h3>
              <p className='text-sm text-gray-500'>Get notified when invited to study groups</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input type='checkbox' className='sr-only peer' defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>Resource Updates</h3>
              <p className='text-sm text-gray-500'>Get notified about new resources in your courses</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input type='checkbox' className='sr-only peer' defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>Achievement Notifications</h3>
              <p className='text-sm text-gray-500'>Get notified when you earn achievements</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input type='checkbox' className='sr-only peer' defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
