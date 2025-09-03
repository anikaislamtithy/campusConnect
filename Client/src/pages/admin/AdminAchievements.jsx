import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { achievementAPI } from '../../lib/api';
import {
  Trophy,
  Search,
  Filter,
  Plus,
  X,
  Edit,
  Trash2,
  Star,
  Target,
  Zap,
  Users,
  FileText,
  MessageSquare,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    rarity: '',
    search: '',
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'upload',
    rarity: 'common',
    points: 10,
    criteria: '',
    icon: '',
  });

  useEffect(() => {
    fetchAchievements();
  }, [filters, searchQuery]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 50,
      };
      const response = await achievementAPI.getAllAchievements(params);
      setAchievements(response.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = async (e) => {
    e.preventDefault();
    try {
      await achievementAPI.createAchievement(createForm);
      toast.success('Achievement created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        category: 'upload',
        rarity: 'common',
        points: 10,
        criteria: '',
        icon: '',
      });
      fetchAchievements();
    } catch (error) {
      console.error('Error creating achievement:', error);
      toast.error('Failed to create achievement');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (!window.confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
      return;
    }

    try {
      await achievementAPI.deleteAchievement(achievementId);
      toast.success('Achievement deleted successfully');
      fetchAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  const getAchievementIcon = (category) => {
    switch (category) {
      case 'upload':
        return <FileText className='h-6 w-6' />;
      case 'social':
        return <Users className='h-6 w-6' />;
      case 'request':
        return <MessageSquare className='h-6 w-6' />;
      case 'milestone':
        return <Target className='h-6 w-6' />;
      case 'streak':
        return <Zap className='h-6 w-6' />;
      default:
        return <Trophy className='h-6 w-6' />;
    }
  };

  const getAchievementColor = (category) => {
    switch (category) {
      case 'upload':
        return 'bg-blue-500';
      case 'social':
        return 'bg-green-500';
      case 'request':
        return 'bg-orange-500';
      case 'milestone':
        return 'bg-purple-500';
      case 'streak':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'uncommon':
        return 'border-green-300 bg-green-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const AchievementCard = ({ achievement }) => (
    <div className={`relative rounded-lg border-2 p-6 transition-all duration-200 ${getRarityColor(achievement.rarity)} shadow-md`}>
      <div className='flex items-start space-x-4'>
        <div className={`flex-shrink-0 p-3 rounded-full ${getAchievementColor(achievement.category)} text-white`}>
          {getAchievementIcon(achievement.category)}
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center space-x-2 mb-2'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {achievement.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              achievement.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
              achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
              achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
              achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {achievement.rarity}
            </span>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            {achievement.description}
          </p>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4 text-sm text-gray-500'>
              <div className='flex items-center'>
                <Star className='h-4 w-4 mr-1' />
                <span>{achievement.points} points</span>
              </div>
              {achievement.category && (
                <div className='flex items-center'>
                  <Award className='h-4 w-4 mr-1' />
                  <span className='capitalize'>{achievement.category}</span>
                </div>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <button className='p-2 text-gray-400 hover:text-blue-500 transition-colors'>
                <Edit className='h-4 w-4' />
              </button>
              <button 
                onClick={() => handleDeleteAchievement(achievement._id)}
                className='p-2 text-gray-400 hover:text-red-500 transition-colors'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const categories = [
    { value: 'upload', label: 'Upload' },
    { value: 'social', label: 'Social' },
    { value: 'request', label: 'Request' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'streak', label: 'Streak' },
  ];

  const rarities = [
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Achievement Management</h1>
          <p className='mt-2 text-gray-600'>
            Create and manage achievements for the platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <Plus className='h-5 w-5 mr-2' />
          Create Achievement
        </button>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
          <div className='flex-1 max-w-lg'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search achievements...'
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
          <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Rarity
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Rarities</option>
                {rarities.map((rarity) => (
                  <option key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement._id} achievement={achievement} />
          ))}
        </div>
      )}

      {!loading && achievements.length === 0 && (
        <div className='text-center py-12'>
          <Trophy className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No achievements found</h3>
          <p className='text-gray-500 mb-4'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No achievements available at the moment'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            <Plus className='h-5 w-5 mr-2' />
            Create First Achievement
          </button>
        </div>
      )}

      {/* Create Achievement Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Create New Achievement</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleCreateAchievement} className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Name *
                  </label>
                  <input
                    type='text'
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Achievement name'
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
                    placeholder='Achievement description'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Category *
                    </label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Rarity *
                    </label>
                    <select
                      value={createForm.rarity}
                      onChange={(e) => setCreateForm({ ...createForm, rarity: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      {rarities.map((rarity) => (
                        <option key={rarity.value} value={rarity.value}>
                          {rarity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Points *
                  </label>
                  <input
                    type='number'
                    value={createForm.points}
                    onChange={(e) => setCreateForm({ ...createForm, points: parseInt(e.target.value) })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    min='1'
                    max='1000'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Criteria
                  </label>
                  <textarea
                    value={createForm.criteria}
                    onChange={(e) => setCreateForm({ ...createForm, criteria: e.target.value })}
                    rows={2}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='How to earn this achievement'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Icon
                  </label>
                  <input
                    type='text'
                    value={createForm.icon}
                    onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Icon name or URL'
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
                    Create Achievement
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

export default AdminAchievements;
