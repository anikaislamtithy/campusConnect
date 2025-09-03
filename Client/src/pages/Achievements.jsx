import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { achievementAPI } from '../lib/api';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Award,
  Lock,
  CheckCircle,
} from 'lucide-react';

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, earned, available

  useEffect(() => {
    fetchAchievements();
  }, [filter]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [allAchievements, userAchievementsData] = await Promise.all([
        achievementAPI.getAllAchievements(),
        achievementAPI.getUserAchievements(),
      ]);

      setAchievements(allAchievements.achievements || []);
      setUserAchievements(userAchievementsData.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
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

  const isAchievementEarned = (achievementId) => {
    return userAchievements.some(achievement => achievement.achievementId === achievementId);
  };

  const getEarnedAchievement = (achievementId) => {
    return userAchievements.find(achievement => achievement.achievementId === achievementId);
  };

  const AchievementCard = ({ achievement }) => {
    const earned = isAchievementEarned(achievement._id);
    const earnedData = earned ? getEarnedAchievement(achievement._id) : null;

    return (
      <div className={`relative rounded-lg border-2 p-6 transition-all duration-200 ${
        earned 
          ? `${getRarityColor(achievement.rarity)} shadow-md` 
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}>
        {earned && (
          <div className='absolute top-2 right-2'>
            <CheckCircle className='h-6 w-6 text-green-500' />
          </div>
        )}
        
        <div className='flex items-start space-x-4'>
          <div className={`flex-shrink-0 p-3 rounded-full ${getAchievementColor(achievement.category)} text-white`}>
            {getAchievementIcon(achievement.category)}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center space-x-2 mb-2'>
              <h3 className={`text-lg font-semibold ${
                earned ? 'text-gray-900' : 'text-gray-500'
              }`}>
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
            <p className={`text-sm mb-3 ${
              earned ? 'text-gray-600' : 'text-gray-400'
            }`}>
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
              {earned && earnedData && (
                <div className='text-sm text-gray-500'>
                  <div className='flex items-center'>
                    <Calendar className='h-4 w-4 mr-1' />
                    <span>Earned {new Date(earnedData.earnedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const earnedAchievements = achievements.filter(achievement => isAchievementEarned(achievement._id));
  const availableAchievements = achievements.filter(achievement => !isAchievementEarned(achievement._id));

  const totalPoints = userAchievements.reduce((total, achievement) => {
    const achievementData = achievements.find(a => a._id === achievement.achievementId);
    return total + (achievementData?.points || 0);
  }, 0);

  const getRank = (points) => {
    if (points >= 1000) return { name: 'Legend', color: 'text-yellow-600' };
    if (points >= 500) return { name: 'Expert', color: 'text-purple-600' };
    if (points >= 200) return { name: 'Advanced', color: 'text-blue-600' };
    if (points >= 50) return { name: 'Intermediate', color: 'text-green-600' };
    return { name: 'Beginner', color: 'text-gray-600' };
  };

  const currentRank = getRank(totalPoints);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Achievements</h1>
          <p className='mt-2 text-gray-600'>
            Track your progress and unlock new achievements
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-yellow-600'>{totalPoints}</div>
          <div className='text-sm text-gray-500'>Total Points</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className={`text-3xl font-bold ${currentRank.color}`}>{currentRank.name}</div>
          <div className='text-sm text-gray-500'>Current Rank</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-green-600'>{earnedAchievements.length}</div>
          <div className='text-sm text-gray-500'>Achievements Earned</div>
        </div>
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <div className='text-3xl font-bold text-blue-600'>{availableAchievements.length}</div>
          <div className='text-sm text-gray-500'>Available</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Progress to Next Rank</h2>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-gray-600'>
            <span>{currentRank.name} ({totalPoints} points)</span>
            <span>
              {currentRank.name === 'Legend' 
                ? 'Max Rank' 
                : `${currentRank.name === 'Expert' ? 1000 : currentRank.name === 'Advanced' ? 500 : currentRank.name === 'Intermediate' ? 200 : 50} points`
              }
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div 
              className={`h-2 rounded-full ${currentRank.color.replace('text-', 'bg-')}`}
              style={{
                width: currentRank.name === 'Legend' 
                  ? '100%' 
                  : `${Math.min(100, (totalPoints / (currentRank.name === 'Expert' ? 1000 : currentRank.name === 'Advanced' ? 500 : currentRank.name === 'Intermediate' ? 200 : 50)) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8 px-6'>
            {[
              { id: 'all', label: 'All Achievements', count: achievements.length },
              { id: 'earned', label: 'Earned', count: earnedAchievements.length },
              { id: 'available', label: 'Available', count: availableAchievements.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className='ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs'>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {(filter === 'all' ? achievements : 
            filter === 'earned' ? earnedAchievements : 
            availableAchievements).map((achievement) => (
            <AchievementCard key={achievement._id} achievement={achievement} />
          ))}
        </div>
      )}

      {!loading && (filter === 'all' ? achievements : 
        filter === 'earned' ? earnedAchievements : 
        availableAchievements).length === 0 && (
        <div className='text-center py-12'>
          <Trophy className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No achievements found</h3>
          <p className='text-gray-500'>
            {filter === 'earned' 
              ? "You haven't earned any achievements yet. Keep contributing to unlock them!"
              : filter === 'available'
              ? "No available achievements at the moment."
              : "No achievements available."
            }
          </p>
        </div>
      )}

      {/* Achievement Categories */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Achievement Categories</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[
            { category: 'upload', name: 'Resource Uploader', description: 'Upload study materials and resources' },
            { category: 'social', name: 'Social Contributor', description: 'Engage with study groups and community' },
            { category: 'request', name: 'Helper', description: 'Help fulfill resource requests' },
            { category: 'milestone', name: 'Milestone Achiever', description: 'Reach important milestones' },
            { category: 'streak', name: 'Consistent Contributor', description: 'Maintain consistent activity' },
          ].map((category) => {
            const categoryAchievements = achievements.filter(a => a.category === category.category);
            const earnedInCategory = categoryAchievements.filter(a => isAchievementEarned(a._id));
            
            return (
              <div key={category.category} className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center space-x-3 mb-2'>
                  <div className={`p-2 rounded-full ${getAchievementColor(category.category)} text-white`}>
                    {getAchievementIcon(category.category)}
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900'>{category.name}</h3>
                    <p className='text-sm text-gray-500'>{category.description}</p>
                  </div>
                </div>
                <div className='text-sm text-gray-600'>
                  {earnedInCategory.length}/{categoryAchievements.length} earned
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                  <div 
                    className={`h-2 rounded-full ${getAchievementColor(category.category)}`}
                    style={{ width: `${(earnedInCategory.length / categoryAchievements.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
