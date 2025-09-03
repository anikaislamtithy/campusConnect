import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI, resourceAPI, studyGroupAPI, achievementAPI } from '../lib/api';
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  Edit,
  Camera,
  FileText,
  MessageSquare,
  Trophy,
  Star,
  Download,
  Heart,
  Settings,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userResources, setUserResources] = useState([]);
  const [userStudyGroups, setUserStudyGroups] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    university: '',
    major: '',
    year: '',
    bio: '',
  });

  const isOwnProfile = !userId || userId === currentUser?.userId;

  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      fetchOwnData();
    } else {
      fetchUserProfile();
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [userData, resourcesData, studyGroupsData, achievementsData] = await Promise.all([
        userAPI.getUser(userId),
        userAPI.getUser(userId).then(() => resourceAPI.getAllResources({ uploadedBy: userId })),
        userAPI.getUser(userId).then(() => studyGroupAPI.getUserStudyGroups()),
        userAPI.getUser(userId).then(() => achievementAPI.getUserAchievementsById(userId)),
      ]);

      setProfileUser(userData.user);
      setUserResources(resourcesData.resources || []);
      setUserStudyGroups(studyGroupsData.studyGroups || []);
      setUserAchievements(achievementsData.achievements || []);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnData = async () => {
    try {
      setLoading(true);
      const [resourcesData, studyGroupsData, achievementsData] = await Promise.all([
        resourceAPI.getAllResources({ uploadedBy: currentUser?.userId }),
        studyGroupAPI.getUserStudyGroups(),
        achievementAPI.getUserAchievements(),
      ]);

      setUserResources(resourcesData.resources || []);
      setUserStudyGroups(studyGroupsData.studyGroups || []);
      setUserAchievements(achievementsData.achievements || []);
    } catch (error) {
      console.error('Error fetching own data:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUser(editForm);
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      if (isOwnProfile) {
        // Update current user context
        window.location.reload();
      } else {
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      await userAPI.updateProfilePicture(formData);
      toast.success('Profile picture updated successfully');
      if (isOwnProfile) {
        window.location.reload();
      } else {
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture');
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: profileUser?.name || '',
      university: profileUser?.university || '',
      major: profileUser?.major || '',
      year: profileUser?.year || '',
      bio: profileUser?.bio || '',
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className='text-center py-12'>
        <User className='h-16 w-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>User not found</h3>
        <p className='text-gray-500'>The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'resources', label: 'Resources', icon: FileText, count: userResources.length },
    { id: 'study-groups', label: 'Study Groups', icon: Users, count: userStudyGroups.length },
    { id: 'achievements', label: 'Achievements', icon: Trophy, count: userAchievements.length },
  ];

  return (
    <div className='space-y-6'>
      {/* Profile Header */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 h-32'></div>
        <div className='px-6 pb-6'>
          <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16'>
            <div className='flex items-end space-x-4'>
              <div className='relative'>
                <div className='h-32 w-32 rounded-full bg-white p-1 shadow-lg'>
                  <div className='h-full w-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                    {profileUser.profilePicture ? (
                      <img
                        src={profileUser.profilePicture}
                        alt={profileUser.name}
                        className='h-full w-full rounded-full object-cover'
                      />
                    ) : (
                      <User className='h-16 w-16 text-gray-400' />
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <label className='absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors'>
                    <Camera className='h-4 w-4' />
                    <input
                      type='file'
                      className='hidden'
                      accept='image/*'
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                )}
              </div>
              <div className='pb-4'>
                <h1 className='text-2xl font-bold text-gray-900'>{profileUser.name}</h1>
                <p className='text-gray-600'>{profileUser.email}</p>
                <div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
                  {profileUser.university && (
                    <div className='flex items-center'>
                      <GraduationCap className='h-4 w-4 mr-1' />
                      <span>{profileUser.university}</span>
                    </div>
                  )}
                  {profileUser.major && (
                    <div className='flex items-center'>
                      <BookOpen className='h-4 w-4 mr-1' />
                      <span>{profileUser.major}</span>
                    </div>
                  )}
                  {profileUser.year && (
                    <div className='flex items-center'>
                      <Users className='h-4 w-4 mr-1' />
                      <span>{profileUser.year} Year</span>
                    </div>
                  )}
                </div>
                {profileUser.bio && (
                  <p className='mt-2 text-gray-600'>{profileUser.bio}</p>
                )}
              </div>
            </div>
            <div className='flex items-center space-x-2 mt-4 sm:mt-0'>
              {isOwnProfile ? (
                <>
                  <button
                    onClick={openEditModal}
                    className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
                  >
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Profile
                  </button>
                  <Link
                    to='/settings'
                    className='inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
                  >
                    <Settings className='h-4 w-4 mr-2' />
                    Settings
                  </Link>
                </>
              ) : (
                <button className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
                  <Mail className='h-4 w-4 mr-2' />
                  Send Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-blue-600'>{userResources.length}</div>
          <div className='text-sm text-gray-500'>Resources Uploaded</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-green-600'>{userStudyGroups.length}</div>
          <div className='text-sm text-gray-500'>Study Groups</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-yellow-600'>{userAchievements.length}</div>
          <div className='text-sm text-gray-500'>Achievements</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-purple-600'>
            {userResources.reduce((total, resource) => total + (resource.downloadCount || 0), 0)}
          </div>
          <div className='text-sm text-gray-500'>Total Downloads</div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8 px-6'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='h-4 w-4 mr-2' />
                  {tab.label}
                  <span className='ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs'>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className='p-6'>
          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              {userResources.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {userResources.map((resource) => (
                    <div key={resource._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                      <h3 className='font-medium text-gray-900 mb-2 line-clamp-2'>{resource.title}</h3>
                      <p className='text-sm text-gray-600 mb-2'>{resource.course?.name}</p>
                      <div className='flex items-center justify-between text-sm text-gray-500'>
                        <div className='flex items-center space-x-3'>
                          <div className='flex items-center'>
                            <Heart className='h-4 w-4 mr-1' />
                            {resource.likes?.length || 0}
                          </div>
                          <div className='flex items-center'>
                            <Download className='h-4 w-4 mr-1' />
                            {resource.downloadCount || 0}
                          </div>
                        </div>
                        <Link
                          to={`/resources/${resource._id}`}
                          className='text-blue-600 hover:text-blue-500'
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No resources uploaded yet</p>
                  {isOwnProfile && (
                    <Link
                      to='/resources'
                      className='mt-2 inline-flex items-center text-blue-600 hover:text-blue-500'
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Upload your first resource
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Study Groups Tab */}
          {activeTab === 'study-groups' && (
            <div>
              {userStudyGroups.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {userStudyGroups.map((group) => (
                    <div key={group._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                      <h3 className='font-medium text-gray-900 mb-2'>{group.title}</h3>
                      <p className='text-sm text-gray-600 mb-2'>{group.course?.name}</p>
                      <div className='flex items-center justify-between text-sm text-gray-500'>
                        <div className='flex items-center'>
                          <Users className='h-4 w-4 mr-1' />
                          {group.currentMembers?.length || 0}/{group.maxMembers}
                        </div>
                        <Link
                          to={`/study-groups/${group._id}`}
                          className='text-blue-600 hover:text-blue-500'
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No study groups joined yet</p>
                  {isOwnProfile && (
                    <Link
                      to='/study-groups'
                      className='mt-2 inline-flex items-center text-blue-600 hover:text-blue-500'
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Join or create a study group
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              {userAchievements.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {userAchievements.map((achievement) => (
                    <div key={achievement._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                      <div className='flex items-center space-x-3'>
                        <div className='h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center'>
                          <Trophy className='h-6 w-6 text-yellow-600' />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900'>{achievement.name}</h3>
                          <p className='text-sm text-gray-600'>{achievement.description}</p>
                        </div>
                      </div>
                      <div className='mt-3 text-sm text-gray-500'>
                        Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <Trophy className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No achievements earned yet</p>
                  <p className='text-sm text-gray-400 mt-1'>
                    Keep contributing to earn achievements!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Name *
                  </label>
                  <input
                    type='text'
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      University
                    </label>
                    <input
                      type='text'
                      value={editForm.university}
                      onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Major
                    </label>
                    <input
                      type='text'
                      value={editForm.major}
                      onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Academic Year
                  </label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Select year</option>
                    <option value='1st'>1st Year</option>
                    <option value='2nd'>2nd Year</option>
                    <option value='3rd'>3rd Year</option>
                    <option value='4th'>4th Year</option>
                    <option value='Graduate'>Graduate</option>
                    <option value='PhD'>PhD</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Tell us about yourself'
                  />
                </div>

                <div className='flex justify-end space-x-4'>
                  <button
                    type='button'
                    onClick={() => setShowEditModal(false)}
                    className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                  >
                    Save Changes
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

export default Profile;
