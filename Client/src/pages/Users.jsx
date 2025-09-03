import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../lib/api';
import {
  Search,
  Filter,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Users as UsersIcon,
  FileText,
  MessageSquare,
  Trophy,
  Eye,
} from 'lucide-react';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    university: '',
    major: '',
    year: '',
    role: '',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 20,
      };
      const response = await userAPI.getAllUsers(params);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const UserCard = ({ userData }) => (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      <div className='p-6'>
        <div className='flex items-start space-x-4'>
          <div className='flex-shrink-0'>
            <div className='h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt={userData.name}
                  className='h-16 w-16 rounded-full object-cover'
                />
              ) : (
                <User className='h-8 w-8 text-gray-400' />
              )}
            </div>
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-lg font-semibold text-gray-900 truncate'>
                {userData.name}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userData.role === 'admin' 
                  ? 'bg-red-100 text-red-800'
                  : userData.role === 'moderator'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {userData.role}
              </span>
            </div>
            
            <div className='space-y-1 text-sm text-gray-600'>
              <div className='flex items-center'>
                <Mail className='h-4 w-4 mr-2' />
                <span className='truncate'>{userData.email}</span>
              </div>
              {userData.university && (
                <div className='flex items-center'>
                  <GraduationCap className='h-4 w-4 mr-2' />
                  <span className='truncate'>{userData.university}</span>
                </div>
              )}
              {userData.major && (
                <div className='flex items-center'>
                  <BookOpen className='h-4 w-4 mr-2' />
                  <span className='truncate'>{userData.major}</span>
                </div>
              )}
              {userData.year && (
                <div className='flex items-center'>
                  <UsersIcon className='h-4 w-4 mr-2' />
                  <span className='truncate'>{userData.year} Year</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className='mt-4 grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-lg font-semibold text-gray-900'>
                  {userData.uploadedResources?.length || 0}
                </div>
                <div className='text-xs text-gray-500'>Resources</div>
              </div>
              <div>
                <div className='text-lg font-semibold text-gray-900'>
                  {userData.joinedStudyGroups?.length || 0}
                </div>
                <div className='text-xs text-gray-500'>Study Groups</div>
              </div>
              <div>
                <div className='text-lg font-semibold text-gray-900'>
                  {userData.achievements?.length || 0}
                </div>
                <div className='text-xs text-gray-500'>Achievements</div>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-4 flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                {userData.achievements && userData.achievements.length > 0 && (
                  <div className='flex items-center text-yellow-500'>
                    <Trophy className='h-4 w-4' />
                    <span className='ml-1 text-sm'>{userData.achievements.length}</span>
                  </div>
                )}
              </div>
              <Link
                to={`/profile/${userData._id}`}
                className='inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm'
              >
                <Eye className='h-4 w-4 mr-1' />
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const years = ['1st', '2nd', '3rd', '4th', 'Graduate', 'PhD'];
  const roles = ['student', 'moderator', 'admin'];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Users</h1>
          <p className='mt-2 text-gray-600'>
            Connect with students and faculty from your university
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
                placeholder='Search users...'
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
                University
              </label>
              <input
                type='text'
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Filter by university'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Major
              </label>
              <input
                type='text'
                value={filters.major}
                onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Filter by major'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {users.map((userData) => (
            <UserCard key={userData._id} userData={userData} />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className='text-center py-12'>
          <User className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No users found</h3>
          <p className='text-gray-500'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No users available at the moment'
            }
          </p>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && users.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Community Stats</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {users.length}
              </div>
              <div className='text-sm text-gray-500'>Total Users</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {users.filter(u => u.role === 'student').length}
              </div>
              <div className='text-sm text-gray-500'>Students</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-purple-600'>
                {users.filter(u => u.role === 'moderator').length}
              </div>
              <div className='text-sm text-gray-500'>Moderators</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-red-600'>
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className='text-sm text-gray-500'>Admins</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;