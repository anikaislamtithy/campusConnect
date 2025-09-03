import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studyGroupAPI, courseAPI } from '../../lib/api';
import {
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  MessageSquare,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStudyGroups = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    status: '',
    meetingType: '',
    search: '',
  });

  useEffect(() => {
    fetchStudyGroups();
    fetchCourses();
  }, [filters, searchQuery]);

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 50,
      };
      const response = await studyGroupAPI.getAllStudyGroups(params);
      setStudyGroups(response.studyGroups || []);
    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error('Failed to fetch study groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDeleteStudyGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this study group? This action cannot be undone.')) {
      return;
    }

    try {
      await studyGroupAPI.deleteStudyGroup(groupId);
      toast.success('Study group deleted successfully');
      fetchStudyGroups();
    } catch (error) {
      console.error('Error deleting study group:', error);
      toast.error('Failed to delete study group');
    }
  };

  const StudyGroupCard = ({ group }) => (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {group.title}
            </h3>
            <p className='text-sm text-gray-600 mb-2'>
              {group.course?.name} • {group.course?.code}
            </p>
            <p className='text-sm text-gray-500 line-clamp-2'>
              {group.description}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <Eye className='h-4 w-4' />
            </button>
            <button 
              onClick={() => handleDeleteStudyGroup(group._id)}
              className='p-2 text-gray-400 hover:text-red-500 transition-colors'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600'>
          <div className='flex items-center'>
            <Users className='h-4 w-4 mr-2' />
            <span>{group.currentMembers?.length || 0}/{group.maxMembers} members</span>
          </div>
          <div className='flex items-center'>
            <MessageSquare className='h-4 w-4 mr-2' />
            <span className='capitalize'>{group.meetingType}</span>
          </div>
          {group.meetingTime && (
            <div className='flex items-center'>
              <Calendar className='h-4 w-4 mr-2' />
              <span>{group.meetingTime}</span>
            </div>
          )}
          {group.location && (
            <div className='flex items-center'>
              <MapPin className='h-4 w-4 mr-2' />
              <span className='truncate'>{group.location}</span>
            </div>
          )}
        </div>

        {group.tags && group.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {group.tags.map((tag, index) => (
              <span
                key={index}
                className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs'
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              group.status === 'open' 
                ? 'bg-green-100 text-green-800'
                : group.status === 'full'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {group.status}
            </span>
            <span className='text-sm text-gray-500'>
              by {group.createdBy?.name}
            </span>
          </div>
          <div className='text-sm text-gray-500'>
            {new Date(group.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Study Group Management</h1>
          <p className='mt-2 text-gray-600'>
            Monitor and manage study groups on the platform
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
          <div className='flex-1 max-w-lg'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search study groups...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            <Filter className='h-5 w-5 mr-2' />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Course
              </label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Statuses</option>
                <option value='open'>Open</option>
                <option value='full'>Full</option>
                <option value='closed'>Closed</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Meeting Type
              </label>
              <select
                value={filters.meetingType}
                onChange={(e) => setFilters({ ...filters, meetingType: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Types</option>
                <option value='online'>Online</option>
                <option value='offline'>Offline</option>
                <option value='hybrid'>Hybrid</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Study Groups Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {studyGroups.map((group) => (
            <StudyGroupCard key={group._id} group={group} />
          ))}
        </div>
      )}

      {!loading && studyGroups.length === 0 && (
        <div className='text-center py-12'>
          <Users className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No study groups found</h3>
          <p className='text-gray-500'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No study groups available at the moment'
            }
          </p>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && studyGroups.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Study Group Statistics</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {studyGroups.length}
              </div>
              <div className='text-sm text-gray-500'>Total Groups</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {studyGroups.filter(g => g.status === 'open').length}
              </div>
              <div className='text-sm text-gray-500'>Open</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-yellow-600'>
                {studyGroups.filter(g => g.status === 'full').length}
              </div>
              <div className='text-sm text-gray-500'>Full</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-gray-600'>
                {studyGroups.filter(g => g.status === 'closed').length}
              </div>
              <div className='text-sm text-gray-500'>Closed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudyGroups;
