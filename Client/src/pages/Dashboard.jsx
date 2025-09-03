import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, resourceAPI, studyGroupAPI, resourceRequestAPI } from '../lib/api';
import {
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Download,
  Heart,
  Plus,
  ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentResources, setRecentResources] = useState([]);
  const [recentStudyGroups, setRecentStudyGroups] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, resourcesData, studyGroupsData, bookmarksData] = await Promise.all([
          dashboardAPI.getStats(),
          resourceAPI.getRecentResources(5),
          studyGroupAPI.getUserStudyGroups(),
          user?.role === 'admin' ? Promise.resolve({ bookmarks: [] }) : resourceAPI.getRecentResources(3),
        ]);

        setStats(statsData);
        setRecentResources(resourcesData.resources || []);
        setRecentStudyGroups(studyGroupsData.studyGroups || []);
        setBookmarks(bookmarksData.resources || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
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
            </dl>
          </div>
        </div>
      </div>
    </Link>
  );

  const QuickActionCard = ({ title, description, icon: Icon, link, color }) => (
    <Link
      to={link}
      className='bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 group'
    >
      <div className='flex items-center'>
        <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className='h-6 w-6 text-white' />
        </div>
        <div className='ml-4 flex-1'>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
          <p className='text-sm text-gray-500'>{description}</p>
        </div>
        <ArrowRight className='h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200' />
      </div>
    </Link>
  );

  return (
    <div className='space-y-8'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className='mt-2 text-blue-100'>
              Ready to continue your academic journey? Let's explore what's new.
            </p>
          </div>
          <div className='hidden md:block'>
            <div className='h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
              <BookOpen className='h-10 w-10 text-white' />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Enrolled Courses'
          value={stats?.stats?.enrolledCourses || 0}
          icon={BookOpen}
          color='bg-blue-500'
          link='/courses'
        />
        <StatCard
          title='Uploaded Resources'
          value={stats?.stats?.uploadedResources || 0}
          icon={FileText}
          color='bg-green-500'
          link='/resources'
        />
        <StatCard
          title='Study Groups'
          value={stats?.stats?.joinedStudyGroups || 0}
          icon={Users}
          color='bg-purple-500'
          link='/study-groups'
        />
        <StatCard
          title='Resource Requests'
          value={stats?.stats?.createdRequests || 0}
          icon={MessageSquare}
          color='bg-orange-500'
          link='/requests'
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>Quick Actions</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <QuickActionCard
            title='Upload Resource'
            description='Share your study materials with the community'
            icon={Plus}
            link='/resources'
            color='bg-green-500'
          />
          <QuickActionCard
            title='Create Study Group'
            description='Start a collaborative study session'
            icon={Users}
            link='/study-groups'
            color='bg-purple-500'
          />
          <QuickActionCard
            title='Request Resource'
            description='Ask for specific study materials'
            icon={MessageSquare}
            link='/requests'
            color='bg-orange-500'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Recent Resources */}
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Recent Resources</h3>
              <Link
                to='/resources'
                className='text-sm text-blue-600 hover:text-blue-500 flex items-center'
              >
                View all
                <ArrowRight className='h-4 w-4 ml-1' />
              </Link>
            </div>
          </div>
          <div className='p-6'>
            {recentResources.length > 0 ? (
              <div className='space-y-4'>
                {recentResources.map((resource) => (
                  <div key={resource._id} className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <div className='h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <FileText className='h-5 w-5 text-blue-600' />
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {resource.title}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {resource.course?.name} • {resource.type}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2 text-sm text-gray-500'>
                      <div className='flex items-center'>
                        <Heart className='h-4 w-4 mr-1' />
                        {resource.likes?.length || 0}
                      </div>
                      <div className='flex items-center'>
                        <Download className='h-4 w-4 mr-1' />
                        {resource.downloadCount || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No resources uploaded yet</p>
                <Link
                  to='/resources'
                  className='mt-2 inline-flex items-center text-blue-600 hover:text-blue-500'
                >
                  Upload your first resource
                  <ArrowRight className='h-4 w-4 ml-1' />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Study Groups */}
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>My Study Groups</h3>
              <Link
                to='/study-groups'
                className='text-sm text-blue-600 hover:text-blue-500 flex items-center'
              >
                View all
                <ArrowRight className='h-4 w-4 ml-1' />
              </Link>
            </div>
          </div>
          <div className='p-6'>
            {recentStudyGroups.length > 0 ? (
              <div className='space-y-4'>
                {recentStudyGroups.slice(0, 3).map((group) => (
                  <div key={group._id} className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <div className='h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                        <Users className='h-5 w-5 text-purple-600' />
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {group.title}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {group.course?.name} • {group.currentMembers?.length || 0}/{group.maxMembers} members
                      </p>
                    </div>
                    <div className='flex items-center'>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.status === 'open' 
                          ? 'bg-green-100 text-green-800'
                          : group.status === 'full'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No study groups joined yet</p>
                <Link
                  to='/study-groups'
                  className='mt-2 inline-flex items-center text-blue-600 hover:text-blue-500'
                >
                  Join or create a study group
                  <ArrowRight className='h-4 w-4 ml-1' />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Bookmarked Resources</h3>
              <Link
                to='/profile'
                className='text-sm text-blue-600 hover:text-blue-500 flex items-center'
              >
                View all
                <ArrowRight className='h-4 w-4 ml-1' />
              </Link>
            </div>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {bookmarks.slice(0, 3).map((bookmark) => (
                <div key={bookmark._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <Star className='h-4 w-4 text-blue-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {bookmark.title}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {bookmark.course?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
