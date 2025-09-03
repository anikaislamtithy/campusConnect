import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { resourceRequestAPI, courseAPI } from '../../lib/api';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  ThumbsUp,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    status: '',
    resourceType: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchRequests();
    fetchCourses();
  }, [filters, searchQuery]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 50,
      };
      const response = await resourceRequestAPI.getAllRequests(params);
      setRequests(response.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
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

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      await resourceRequestAPI.deleteRequest(requestId);
      toast.success('Request deleted successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <MessageSquare className='h-4 w-4' />;
      case 'in-progress':
        return <Clock className='h-4 w-4' />;
      case 'fulfilled':
        return <CheckCircle className='h-4 w-4' />;
      case 'closed':
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <MessageSquare className='h-4 w-4' />;
    }
  };

  const RequestCard = ({ request }) => (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {request.title}
            </h3>
            <p className='text-sm text-gray-600 mb-2'>
              {request.course?.name} • {request.course?.code}
            </p>
            <p className='text-sm text-gray-500 line-clamp-2'>
              {request.description}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <Eye className='h-4 w-4' />
            </button>
            <button 
              onClick={() => handleDeleteRequest(request._id)}
              className='p-2 text-gray-400 hover:text-red-500 transition-colors'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='flex items-center space-x-4 mb-4 text-sm text-gray-600'>
          <div className='flex items-center'>
            <Tag className='h-4 w-4 mr-1' />
            <span className='capitalize'>{request.resourceType}</span>
          </div>
          {request.deadline && (
            <div className='flex items-center'>
              <Calendar className='h-4 w-4 mr-1' />
              <span>{new Date(request.deadline).toLocaleDateString()}</span>
            </div>
          )}
          <div className='flex items-center'>
            <User className='h-4 w-4 mr-1' />
            <span>{request.requestedBy?.name}</span>
          </div>
        </div>

        {request.tags && request.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {request.tags.map((tag, index) => (
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
          <div className='flex items-center space-x-2'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className='ml-1 capitalize'>{request.status}</span>
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm'>
              <ThumbsUp className='h-4 w-4' />
              <span>{request.upvotes?.length || 0}</span>
            </div>
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

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Request Management</h1>
          <p className='mt-2 text-gray-600'>
            Monitor and manage resource requests
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
                placeholder='Search requests...'
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
          <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
                <option value='in-progress'>In Progress</option>
                <option value='fulfilled'>Fulfilled</option>
                <option value='closed'>Closed</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Resource Type
              </label>
              <select
                value={filters.resourceType}
                onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
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
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {requests.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))}
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className='text-center py-12'>
          <MessageSquare className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No requests found</h3>
          <p className='text-gray-500'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No requests available at the moment'
            }
          </p>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && requests.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Request Statistics</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {requests.length}
              </div>
              <div className='text-sm text-gray-500'>Total Requests</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {requests.filter(r => r.status === 'open').length}
              </div>
              <div className='text-sm text-gray-500'>Open</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-yellow-600'>
                {requests.filter(r => r.status === 'in-progress').length}
              </div>
              <div className='text-sm text-gray-500'>In Progress</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-purple-600'>
                {requests.filter(r => r.status === 'fulfilled').length}
              </div>
              <div className='text-sm text-gray-500'>Fulfilled</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
