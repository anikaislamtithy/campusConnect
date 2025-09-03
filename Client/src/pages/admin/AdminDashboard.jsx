import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardAPI, userAPI, resourceAPI, studyGroupAPI, resourceRequestAPI } from '../../lib/api';
import {
  Users,
  FileText,
  MessageSquare,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Heart,
  Calendar,
  BarChart3,
  Activity,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, resourcesData, studyGroupsData, requestsData] = await Promise.all([
        dashboardAPI.getStats(),
        userAPI.getAllUsers({ limit: 5 }),
        resourceAPI.getAllResources({ limit: 5 }),
        studyGroupAPI.getAllStudyGroups({ limit: 5 }),
        resourceRequestAPI.getAllRequests({ limit: 5 }),
      ]);

      setStats(statsData);
      setRecentActivity([
        ...(usersData.users || []).map(user => ({ ...user, type: 'user', action: 'registered' })),
        ...(resourcesData.resources || []).map(resource => ({ ...resource, type: 'resource', action: 'uploaded' })),
        ...(studyGroupsData.studyGroups || []).map(group => ({ ...group, type: 'study_group', action: 'created' })),
        ...(requestsData.requests || []).map(request => ({ ...request, type: 'request', action: 'created' })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType, link }) => (
    <Link
      to={link}
      className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ${
        link ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className='p-5'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <div className={`p-3 rounded-md ${color}`}>
              <Icon className='h-6 w-6 text-white' />
            </div>
          </div>
          <div className='ml-5 w-0 flex-1'>
            <dl>
              <dt className='text-sm font-medium text-gray-500 truncate'>{title}</dt>
              <dd className='text-lg font-medium text-gray-900'>{value}</dd>
              {change !== undefined && (
                <dd className='flex items-center text-sm'>
                  {changeType === 'increase' ? (
                    <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
                  )}
                  <span className={changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {change}%
                  </span>
                  <span className='text-gray-500 ml-1'>from last month</span>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </Link>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'user':
          return <Users className='h-4 w-4 text-blue-500' />;
        case 'resource':
          return <FileText className='h-4 w-4 text-green-500' />;
        case 'study_group':
          return <MessageSquare className='h-4 w-4 text-purple-500' />;
        case 'request':
          return <MessageSquare className='h-4 w-4 text-orange-500' />;
        default:
          return <Activity className='h-4 w-4 text-gray-500' />;
      }
    };

    const getActivityText = (activity) => {
      switch (activity.type) {
        case 'user':
          return `${activity.name} registered`;
        case 'resource':
          return `${activity.title} was uploaded`;
        case 'study_group':
          return `${activity.title} study group was created`;
        case 'request':
          return `${activity.title} request was created`;
        default:
          return 'Activity occurred';
      }
    };

    return (
      <div className='flex items-center space-x-3 py-2'>
        <div className='flex-shrink-0'>
          {getActivityIcon(activity.type)}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm text-gray-900 truncate'>
            {getActivityText(activity)}
          </p>
          <p className='text-xs text-gray-500'>
            {new Date(activity.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>
              Admin Dashboard
            </h1>
            <p className='mt-2 text-blue-100'>
              Welcome back, {user?.name?.split(' ')[0]}! Here's what's happening on CampusConnect.
            </p>
          </div>
          <div className='hidden md:block'>
            <div className='h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
              <BarChart3 className='h-10 w-10 text-white' />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Users'
          value={stats?.stats?.totalUsers || 0}
          icon={Users}
          color='bg-blue-500'
          change={12}
          changeType='increase'
          link='/admin/users'
        />
        <StatCard
          title='Total Resources'
          value={stats?.stats?.totalResources || 0}
          icon={FileText}
          color='bg-green-500'
          change={8}
          changeType='increase'
          link='/admin/resources'
        />
        <StatCard
          title='Study Groups'
          value={stats?.stats?.totalStudyGroups || 0}
          icon={MessageSquare}
          color='bg-purple-500'
          change={15}
          changeType='increase'
          link='/admin/study-groups'
        />
        <StatCard
          title='Resource Requests'
          value={stats?.stats?.totalRequests || 0}
          icon={MessageSquare}
          color='bg-orange-500'
          change={-3}
          changeType='decrease'
          link='/admin/requests'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Recent Activity */}
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>Recent Activity</h3>
          </div>
          <div className='p-6'>
            {recentActivity.length > 0 ? (
              <div className='space-y-1'>
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={`${activity.type}-${activity._id}-${index}`} activity={activity} />
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Activity className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>Quick Actions</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 gap-4'>
              <Link
                to='/admin/users'
                className='flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Users className='h-8 w-8 text-blue-500 mr-4' />
                <div>
                  <h4 className='font-medium text-gray-900'>Manage Users</h4>
                  <p className='text-sm text-gray-500'>View and manage user accounts</p>
                </div>
              </Link>
              <Link
                to='/admin/courses'
                className='flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <BookOpen className='h-8 w-8 text-green-500 mr-4' />
                <div>
                  <h4 className='font-medium text-gray-900'>Manage Courses</h4>
                  <p className='text-sm text-gray-500'>Create and manage courses</p>
                </div>
              </Link>
              <Link
                to='/admin/resources'
                className='flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <FileText className='h-8 w-8 text-purple-500 mr-4' />
                <div>
                  <h4 className='font-medium text-gray-900'>Manage Resources</h4>
                  <p className='text-sm text-gray-500'>Review and moderate resources</p>
                </div>
              </Link>
              <Link
                to='/admin/achievements'
                className='flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <BarChart3 className='h-8 w-8 text-yellow-500 mr-4' />
                <div>
                  <h4 className='font-medium text-gray-900'>Manage Achievements</h4>
                  <p className='text-sm text-gray-500'>Create and manage achievements</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className='bg-white shadow rounded-lg'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>System Health</h3>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>99.9%</div>
              <div className='text-sm text-gray-500'>Uptime</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>2.3s</div>
              <div className='text-sm text-gray-500'>Avg Response Time</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>1.2GB</div>
              <div className='text-sm text-gray-500'>Storage Used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
