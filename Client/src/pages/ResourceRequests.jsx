import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceRequestAPI, courseAPI } from '../lib/api';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  X,
  Eye,
  ThumbsUp,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResourceRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    status: 'open',
    resourceType: '',
    priority: '',
    search: '',
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    course: '',
    resourceType: 'notes',
    priority: 'medium',
    deadline: '',
    tags: '',
  });

  useEffect(() => {
    fetchRequests();
    fetchUserRequests();
    fetchCourses();
  }, [filters, searchQuery]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 20,
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

  const fetchUserRequests = async () => {
    try {
      const response = await resourceRequestAPI.getUserRequests();
      setUserRequests(response.requests || []);
    } catch (error) {
      console.error('Error fetching user requests:', error);
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

  const handleUpvote = async (requestId) => {
    try {
      await resourceRequestAPI.upvoteRequest(requestId);
      toast.success('Request upvoted');
      fetchRequests();
    } catch (error) {
      console.error('Error upvoting request:', error);
      toast.error('Failed to upvote request');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        ...createForm,
        deadline: createForm.deadline ? new Date(createForm.deadline).toISOString() : undefined,
      };
      await resourceRequestAPI.createRequest(requestData);
      toast.success('Request created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        course: '',
        resourceType: 'notes',
        priority: 'medium',
        deadline: '',
        tags: '',
      });
      fetchRequests();
      fetchUserRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
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
        return <X className='h-4 w-4' />;
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
            <Link
              to={`/requests/${request._id}`}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
              title='View request details'
            >
              <Eye className='h-4 w-4' />
            </Link>
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
            <button
              onClick={() => handleUpvote(request._id)}
              className='flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm'
            >
              <ThumbsUp className='h-4 w-4' />
              <span>{request.upvotes?.length || 0}</span>
            </button>
            <Link
              to={`/requests/${request._id}`}
              className='inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm'
            >
              View Details
            </Link>
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
          <h1 className='text-3xl font-bold text-gray-900'>Resource Requests</h1>
          <p className='mt-2 text-gray-600'>
            Request specific resources or help fulfill others' requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <Plus className='h-5 w-5 mr-2' />
          Create Request
        </button>
      </div>

      {/* My Requests */}
      {userRequests.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>My Requests</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {userRequests.map((request) => (
              <div key={request._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <h3 className='font-medium text-gray-900 mb-2'>{request.title}</h3>
                <p className='text-sm text-gray-600 mb-2'>{request.course?.name}</p>
                <div className='flex items-center justify-between'>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className='ml-1 capitalize'>{request.status}</span>
                  </span>
                  <Link
                    to={`/requests/${request._id}`}
                    className='text-blue-600 hover:text-blue-500 text-sm'
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <option value='open'>Open</option>
                <option value='in-progress'>In Progress</option>
                <option value='fulfilled'>Fulfilled</option>
                <option value='closed'>Closed</option>
                <option value='all'>All</option>
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
          <p className='text-gray-500 mb-4'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a resource request'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            <Plus className='h-5 w-5 mr-2' />
            Create Request
          </button>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Create Resource Request</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Title *
                  </label>
                  <input
                    type='text'
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='What resource do you need?'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Description *
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Describe what you need in detail'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Course *
                    </label>
                    <select
                      value={createForm.course}
                      onChange={(e) => setCreateForm({ ...createForm, course: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value=''>Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Resource Type *
                    </label>
                    <select
                      value={createForm.resourceType}
                      onChange={(e) => setCreateForm({ ...createForm, resourceType: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      {resourceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Priority
                    </label>
                    <select
                      value={createForm.priority}
                      onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Deadline
                    </label>
                    <input
                      type='date'
                      value={createForm.deadline}
                      onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Tags
                  </label>
                  <input
                    type='text'
                    value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Enter tags separated by commas'
                  />
                </div>

                <div className='flex justify-end space-x-4'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                  >
                    Create Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceRequests;