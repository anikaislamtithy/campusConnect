import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { studyGroupAPI, courseAPI } from '../lib/api';
import {
  Users,
  Search,
  Filter,
  Plus,
  X,
  Eye,
  UserPlus,
  UserMinus,
  Calendar,
  MapPin,
  MessageSquare,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudyGroups = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState([]);
  const [userStudyGroups, setUserStudyGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    status: 'open',
    meetingType: '',
    search: '',
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    course: '',
    maxMembers: 5,
    meetingType: 'hybrid',
    location: '',
    meetingTime: '',
    tags: '',
    contactInfo: '',
  });

  useEffect(() => {
    fetchStudyGroups();
    fetchUserStudyGroups();
    fetchCourses();
  }, [filters, searchQuery]);

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 20,
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

  const fetchUserStudyGroups = async () => {
    try {
      const response = await studyGroupAPI.getUserStudyGroups();
      setUserStudyGroups(response.studyGroups || []);
    } catch (error) {
      console.error('Error fetching user study groups:', error);
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

  const handleJoin = async (groupId) => {
    try {
      await studyGroupAPI.joinStudyGroup(groupId);
      toast.success('Successfully joined study group');
      fetchStudyGroups();
      fetchUserStudyGroups();
    } catch (error) {
      console.error('Error joining study group:', error);
      toast.error('Failed to join study group');
    }
  };

  const handleLeave = async (groupId) => {
    try {
      await studyGroupAPI.leaveStudyGroup(groupId);
      toast.success('Successfully left study group');
      fetchStudyGroups();
      fetchUserStudyGroups();
    } catch (error) {
      console.error('Error leaving study group:', error);
      toast.error('Failed to leave study group');
    }
  };

  const handleCreateStudyGroup = async (e) => {
    e.preventDefault();
    try {
      await studyGroupAPI.createStudyGroup(createForm);
      toast.success('Study group created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        course: '',
        maxMembers: 5,
        meetingType: 'hybrid',
        location: '',
        meetingTime: '',
        tags: '',
        contactInfo: '',
      });
      fetchStudyGroups();
      fetchUserStudyGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error('Failed to create study group');
    }
  };

  const isMember = (groupId) => {
    return userStudyGroups.some(group => group._id === groupId);
  };

  const isCreator = (group) => {
    return group.createdBy._id === user?.userId;
  };

  const StudyGroupCard = ({ group }) => {
    const member = isMember(group._id);
    const creator = isCreator(group);
    
    return (
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
              <Link
                to={`/study-groups/${group._id}`}
                className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                title='View study group details'
              >
                <Eye className='h-4 w-4' />
              </Link>
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
                <Clock className='h-4 w-4 mr-2' />
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
            <div className='flex items-center space-x-2'>
              {member ? (
                <button
                  onClick={() => handleLeave(group._id)}
                  className='inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm'
                >
                  <UserMinus className='h-4 w-4 mr-1' />
                  Leave
                </button>
              ) : group.status === 'open' ? (
                <button
                  onClick={() => handleJoin(group._id)}
                  className='inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
                >
                  <UserPlus className='h-4 w-4 mr-1' />
                  Join
                </button>
              ) : (
                <span className='text-sm text-gray-500 px-3 py-2'>
                  {group.status === 'full' ? 'Full' : 'Closed'}
                </span>
              )}
              <Link
                to={`/study-groups/${group._id}`}
                className='inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm'
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Study Groups</h1>
          <p className='mt-2 text-gray-600'>
            Join or create study groups to collaborate with your peers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <Plus className='h-5 w-5 mr-2' />
          Create Study Group
        </button>
      </div>

      {/* My Study Groups */}
      {userStudyGroups.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>My Study Groups</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {userStudyGroups.map((group) => (
              <div key={group._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <h3 className='font-medium text-gray-900 mb-2'>{group.title}</h3>
                <p className='text-sm text-gray-600 mb-2'>{group.course?.name}</p>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>
                    {group.currentMembers?.length || 0}/{group.maxMembers} members
                  </span>
                  <Link
                    to={`/study-groups/${group._id}`}
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
                <option value='open'>Open</option>
                <option value='full'>Full</option>
                <option value='closed'>Closed</option>
                <option value='all'>All</option>
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
          <p className='text-gray-500 mb-4'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a study group'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            <Plus className='h-5 w-5 mr-2' />
            Create Study Group
          </button>
        </div>
      )}

      {/* Create Study Group Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Create Study Group</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleCreateStudyGroup} className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Title *
                  </label>
                  <input
                    type='text'
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Enter study group title'
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
                    placeholder='Describe your study group'
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
                      Max Members
                    </label>
                    <input
                      type='number'
                      value={createForm.maxMembers}
                      onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='2'
                      max='20'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Meeting Type
                    </label>
                    <select
                      value={createForm.meetingType}
                      onChange={(e) => setCreateForm({ ...createForm, meetingType: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='online'>Online</option>
                      <option value='offline'>Offline</option>
                      <option value='hybrid'>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Meeting Time
                    </label>
                    <input
                      type='text'
                      value={createForm.meetingTime}
                      onChange={(e) => setCreateForm({ ...createForm, meetingTime: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='e.g., Saturdays 2:00 PM'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Location
                  </label>
                  <input
                    type='text'
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Meeting location or online platform'
                  />
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

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Contact Information
                  </label>
                  <input
                    type='text'
                    value={createForm.contactInfo}
                    onChange={(e) => setCreateForm({ ...createForm, contactInfo: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Email, Discord, or other contact info'
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
                    Create Study Group
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

export default StudyGroups;