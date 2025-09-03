import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { resourceAPI, courseAPI } from '../../lib/api';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  Pin,
  Download,
  Heart,
  User,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    type: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchResources();
    fetchCourses();
  }, [filters, searchQuery]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 50,
      };
      const response = await resourceAPI.getAllResources(params);
      setResources(response.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
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

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await resourceAPI.deleteResource(resourceId);
      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handlePinResource = async (resourceId) => {
    try {
      await resourceAPI.pinResource(resourceId);
      toast.success('Resource pinned successfully');
      fetchResources();
    } catch (error) {
      console.error('Error pinning resource:', error);
      toast.error('Failed to pin resource');
    }
  };

  const ResourceCard = ({ resource }) => (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <div className='flex items-center space-x-2 mb-2'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                {resource.title}
              </h3>
              {resource.isPinned && (
                <Pin className='h-4 w-4 text-yellow-500' />
              )}
            </div>
            <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
              {resource.description}
            </p>
            <div className='flex items-center space-x-4 text-sm text-gray-500'>
              <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'>
                {resource.type}
              </span>
              <span>{resource.course?.name}</span>
              <span>by {resource.uploadedBy?.name}</span>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => handlePinResource(resource._id)}
              className='p-2 text-gray-400 hover:text-yellow-500 transition-colors'
              title='Pin resource'
            >
              <Pin className='h-4 w-4' />
            </button>
            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <Eye className='h-4 w-4' />
            </button>
            <button 
              onClick={() => handleDeleteResource(resource._id)}
              className='p-2 text-gray-400 hover:text-red-500 transition-colors'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {resource.tags.map((tag, index) => (
              <span
                key={index}
                className='bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs'
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4 text-sm text-gray-500'>
            <div className='flex items-center'>
              <Heart className='h-4 w-4 mr-1' />
              {resource.likes?.length || 0}
            </div>
            <div className='flex items-center'>
              <Download className='h-4 w-4 mr-1' />
              {resource.downloadCount || 0}
            </div>
            <div className='flex items-center'>
              <Calendar className='h-4 w-4 mr-1' />
              {new Date(resource.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              resource.status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : resource.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {resource.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const resourceTypes = [
    { value: 'notes', label: 'Notes' },
    { value: 'slides', label: 'Slides' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'practice', label: 'Practice' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Resource Management</h1>
          <p className='mt-2 text-gray-600'>
            Review and manage uploaded resources
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
                placeholder='Search resources...'
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
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
                <option value='approved'>Approved</option>
                <option value='pending'>Pending</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}

      {!loading && resources.length === 0 && (
        <div className='text-center py-12'>
          <FileText className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No resources found</h3>
          <p className='text-gray-500'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No resources available at the moment'
            }
          </p>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && resources.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Resource Statistics</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {resources.length}
              </div>
              <div className='text-sm text-gray-500'>Total Resources</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {resources.filter(r => r.status === 'approved').length}
              </div>
              <div className='text-sm text-gray-500'>Approved</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-yellow-600'>
                {resources.filter(r => r.status === 'pending').length}
              </div>
              <div className='text-sm text-gray-500'>Pending</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-red-600'>
                {resources.filter(r => r.status === 'rejected').length}
              </div>
              <div className='text-sm text-gray-500'>Rejected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
