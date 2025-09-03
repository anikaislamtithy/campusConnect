import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { studyGroupAPI } from '../lib/api';
import {
  Users,
  Calendar,
  MapPin,
  Globe,
  Monitor,
  User,
  Mail,
  Tag,
  Clock,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudyGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studyGroup, setStudyGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchStudyGroup();
  }, [id]);

  const fetchStudyGroup = async () => {
    try {
      setLoading(true);
      const response = await studyGroupAPI.getStudyGroup(id);
      setStudyGroup(response.studyGroup);
    } catch (error) {
      console.error('Error fetching study group:', error);
      toast.error('Failed to load study group details');
      navigate('/study-groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      setActionLoading(true);
      await studyGroupAPI.joinStudyGroup(id);
      toast.success('Successfully joined the study group!');
      fetchStudyGroup(); // Refresh data
    } catch (error) {
      console.error('Error joining study group:', error);
      toast.error(error.response?.data?.msg || 'Failed to join study group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setActionLoading(true);
      await studyGroupAPI.leaveStudyGroup(id);
      toast.success('Successfully left the study group');
      fetchStudyGroup(); // Refresh data
    } catch (error) {
      console.error('Error leaving study group:', error);
      toast.error(error.response?.data?.msg || 'Failed to leave study group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setActionLoading(true);
      await studyGroupAPI.deleteStudyGroup(id);
      toast.success('Study group deleted successfully');
      navigate('/study-groups');
    } catch (error) {
      console.error('Error deleting study group:', error);
      toast.error(error.response?.data?.msg || 'Failed to delete study group');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className='h-4 w-4' />;
      case 'full':
        return <Users className='h-4 w-4' />;
      case 'closed':
        return <X className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'online':
        return <Monitor className='h-5 w-5' />;
      case 'offline':
        return <MapPin className='h-5 w-5' />;
      case 'hybrid':
        return <Globe className='h-5 w-5' />;
      default:
        return <Globe className='h-5 w-5' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!studyGroup) {
    return (
      <div className='text-center py-12'>
        <AlertCircle className='h-16 w-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>Study Group Not Found</h3>
        <p className='text-gray-500 mb-4'>The study group you're looking for doesn't exist or has been removed.</p>
        <Link
          to='/study-groups'
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Study Groups
        </Link>
      </div>
    );
  }

  const isCreator = user?.userId === studyGroup.createdBy._id;
  const isMember = studyGroup.currentMembers.some(member => member.user._id === user?.userId);
  const canJoin = !isMember && studyGroup.status === 'open' && studyGroup.currentMembers.length < studyGroup.maxMembers;

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => navigate('/study-groups')}
          className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='h-5 w-5 mr-2' />
          Back to Study Groups
        </button>
        
        {isCreator && (
          <div className='flex items-center space-x-2'>
            <Link
              to={`/study-groups/${id}/edit`}
              className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
            >
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className='inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Header Section */}
        <div className='px-6 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold mb-2'>{studyGroup.title}</h1>
              <p className='text-blue-100 mb-4'>{studyGroup.course.name} • {studyGroup.course.code}</p>
              <div className='flex items-center space-x-4 text-sm'>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(studyGroup.status)} bg-white`}>
                  {getStatusIcon(studyGroup.status)}
                  <span className='ml-1 capitalize'>{studyGroup.status}</span>
                </span>
                <span className='flex items-center'>
                  <Users className='h-4 w-4 mr-1' />
                  {studyGroup.currentMembers.length}/{studyGroup.maxMembers} members
                </span>
                <span className='flex items-center'>
                  {getMeetingTypeIcon(studyGroup.meetingType)}
                  <span className='ml-1 capitalize'>{studyGroup.meetingType}</span>
                </span>
              </div>
            </div>
            
            {/* Action Button */}
            {!isCreator && (
              <div className='ml-6'>
                {isMember ? (
                  <button
                    onClick={handleLeaveGroup}
                    disabled={actionLoading}
                    className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50'
                  >
                    <UserMinus className='h-4 w-4 mr-2' />
                    {actionLoading ? 'Leaving...' : 'Leave Group'}
                  </button>
                ) : canJoin ? (
                  <button
                    onClick={handleJoinGroup}
                    disabled={actionLoading}
                    className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50'
                  >
                    <UserPlus className='h-4 w-4 mr-2' />
                    {actionLoading ? 'Joining...' : 'Join Group'}
                  </button>
                ) : (
                  <div className='text-center'>
                    <div className='text-sm text-blue-100 mb-1'>
                      {studyGroup.status === 'full' ? 'Group is full' : 
                       studyGroup.status === 'closed' ? 'Group is closed' : 'Cannot join'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Description */}
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-3'>About This Group</h2>
                <p className='text-gray-700 leading-relaxed'>{studyGroup.description}</p>
              </div>

              {/* Meeting Details */}
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>Meeting Information</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {studyGroup.meetingTime && (
                    <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                      <Clock className='h-5 w-5 text-gray-600' />
                      <div>
                        <div className='text-sm font-medium text-gray-900'>Meeting Time</div>
                        <div className='text-sm text-gray-600'>{studyGroup.meetingTime}</div>
                      </div>
                    </div>
                  )}
                  
                  {studyGroup.location && (
                    <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                      <MapPin className='h-5 w-5 text-gray-600' />
                      <div>
                        <div className='text-sm font-medium text-gray-900'>Location</div>
                        <div className='text-sm text-gray-600'>{studyGroup.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {studyGroup.tags && studyGroup.tags.length > 0 && (
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 mb-3'>Tags</h2>
                  <div className='flex flex-wrap gap-2'>
                    {studyGroup.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800'
                      >
                        <Tag className='h-3 w-3 mr-1' />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {studyGroup.contactInfo && (
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 mb-3'>Contact Information</h2>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <p className='text-gray-700'>{studyGroup.contactInfo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Group Creator */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Group Creator</h3>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center'>
                    <User className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>{studyGroup.createdBy.name}</div>
                    <div className='text-sm text-gray-600 flex items-center'>
                      <Mail className='h-3 w-3 mr-1' />
                      {studyGroup.createdBy.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Members ({studyGroup.currentMembers.length}/{studyGroup.maxMembers})
                </h3>
                <div className='space-y-3'>
                  {studyGroup.currentMembers.map((member) => (
                    <div key={member.user._id} className='flex items-center space-x-3'>
                      <div className='h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center'>
                        <User className='h-4 w-4 text-gray-600' />
                      </div>
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-gray-900'>{member.user.name}</div>
                        <div className='text-xs text-gray-500'>
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {member.user._id === studyGroup.createdBy._id && (
                        <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>Creator</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Stats */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Group Information</h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Created:</span>
                    <span className='text-gray-900'>{new Date(studyGroup.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Meeting Type:</span>
                    <span className='text-gray-900 capitalize'>{studyGroup.meetingType}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Status:</span>
                    <span className={`capitalize px-2 py-1 rounded-full text-xs ${getStatusColor(studyGroup.status)}`}>
                      {studyGroup.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full p-6'>
            <div className='flex items-center mb-4'>
              <AlertCircle className='h-6 w-6 text-red-600 mr-3' />
              <h3 className='text-lg font-semibold text-gray-900'>Delete Study Group</h3>
            </div>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this study group? This action cannot be undone and all members will be removed.
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={actionLoading}
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50'
              >
                {actionLoading ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetails;