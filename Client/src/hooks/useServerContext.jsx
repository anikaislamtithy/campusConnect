import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  authAPI,
  userAPI,
  courseAPI,
  resourceAPI,
  studyGroupAPI,
  resourceRequestAPI,
  notificationAPI,
  achievementAPI,
  dashboardAPI
} from "../lib/api";
import toast from "react-hot-toast";

const ServerContext = createContext();

export const useServerContext = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error("useServerContext must be used within a ServerContextProvider");
  }
  return context;
};

export const ServerContextProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State for different types of context data
  const [contextData, setContextData] = useState({
    // User context
    currentUser: null,
    userProfile: null,
    
    // Resources context
    resources: [],
    recentResources: [],
    pinnedResources: [],
    userResources: [],
    userBookmarks: [],
    
    // Courses context
    courses: [],
    
    // Study groups context
    studyGroups: [],
    activeStudyGroups: [],
    userStudyGroups: [],
    
    // Resource requests context
    resourceRequests: [],
    activeResourceRequests: [],
    userResourceRequests: [],
    
    // Dashboard context
    dashboardData: null,
    
    // Achievements context
    userAchievements: [],
    
    // Loading states
    loading: {
      user: false,
      resources: false,
      courses: false,
      studyGroups: false,
      resourceRequests: false,
      dashboard: false,
      achievements: false,
    },
    
    // Error states
    errors: {
      user: null,
      resources: null,
      courses: null,
      studyGroups: null,
      resourceRequests: null,
      dashboard: null,
      achievements: null,
    }
  });

  // Helper function to update loading state
  const setLoading = (key, value) => {
    setContextData(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  };

  // Helper function to update error state
  const setError = (key, error) => {
    setContextData(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
  };

  // Helper function to clear error state
  const clearError = (key) => {
    setContextData(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: null }
    }));
  };

  // Fetch current user context
  const fetchCurrentUser = async () => {
    if (!isAuthenticated) return;
    
    setLoading('user', true);
    clearError('user');
    
    try {
      const response = await authAPI.getProfile();
      setContextData(prev => ({
        ...prev,
        currentUser: response.user,
        userProfile: response.user
      }));
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('user', error.message || 'Failed to fetch user data');
      toast.error('Failed to fetch user data');
    } finally {
      setLoading('user', false);
    }
  };

  // Fetch resources context
  const fetchResources = async (filters = {}) => {
    setLoading('resources', true);
    clearError('resources');
    
    try {
      const response = await resourceAPI.getAllResources(filters);
      setContextData(prev => ({
        ...prev,
        resources: response.resources || []
      }));
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('resources', error.message || 'Failed to fetch resources');
      toast.error('Failed to fetch resources');
    } finally {
      setLoading('resources', false);
    }
  };

  // Fetch recent resources
  const fetchRecentResources = async (limit = 10) => {
    try {
      const response = await resourceAPI.getRecentResources(limit);
      setContextData(prev => ({
        ...prev,
        recentResources: response.resources || []
      }));
    } catch (error) {
      console.error('Error fetching recent resources:', error);
    }
  };

  // Fetch pinned resources
  const fetchPinnedResources = async (courseId = null) => {
    try {
      const response = await resourceAPI.getPinnedResources(courseId);
      setContextData(prev => ({
        ...prev,
        pinnedResources: response.resources || []
      }));
    } catch (error) {
      console.error('Error fetching pinned resources:', error);
    }
  };

  // Fetch courses context
  const fetchCourses = async (filters = {}) => {
    setLoading('courses', true);
    clearError('courses');
    
    try {
      const response = await courseAPI.getAllCourses(filters);
      setContextData(prev => ({
        ...prev,
        courses: response.courses || []
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('courses', error.message || 'Failed to fetch courses');
      toast.error('Failed to fetch courses');
    } finally {
      setLoading('courses', false);
    }
  };

  // Fetch study groups context
  const fetchStudyGroups = async (filters = {}) => {
    setLoading('studyGroups', true);
    clearError('studyGroups');
    
    try {
      const response = await studyGroupAPI.getAllStudyGroups(filters);
      setContextData(prev => ({
        ...prev,
        studyGroups: response.studyGroups || []
      }));
    } catch (error) {
      console.error('Error fetching study groups:', error);
      setError('studyGroups', error.message || 'Failed to fetch study groups');
      toast.error('Failed to fetch study groups');
    } finally {
      setLoading('studyGroups', false);
    }
  };

  // Fetch active study groups
  const fetchActiveStudyGroups = async () => {
    try {
      const response = await studyGroupAPI.getAllStudyGroups({ status: 'open' });
      setContextData(prev => ({
        ...prev,
        activeStudyGroups: response.studyGroups || []
      }));
    } catch (error) {
      console.error('Error fetching active study groups:', error);
    }
  };

  // Fetch resource requests context
  const fetchResourceRequests = async (filters = {}) => {
    setLoading('resourceRequests', true);
    clearError('resourceRequests');
    
    try {
      const response = await resourceRequestAPI.getAllRequests(filters);
      setContextData(prev => ({
        ...prev,
        resourceRequests: response.requests || []
      }));
    } catch (error) {
      console.error('Error fetching resource requests:', error);
      setError('resourceRequests', error.message || 'Failed to fetch resource requests');
      toast.error('Failed to fetch resource requests');
    } finally {
      setLoading('resourceRequests', false);
    }
  };

  // Fetch active resource requests
  const fetchActiveResourceRequests = async () => {
    try {
      const response = await resourceRequestAPI.getAllRequests({ status: 'open' });
      setContextData(prev => ({
        ...prev,
        activeResourceRequests: response.requests || []
      }));
    } catch (error) {
      console.error('Error fetching active resource requests:', error);
    }
  };

  // Fetch user-specific data
  const fetchUserData = async () => {
    if (!isAuthenticated || !user?.userId) return;
    
    try {
      const [bookmarks, userStudyGroups, userResourceRequests] = await Promise.all([
        userAPI.getBookmarks().catch(() => ({ bookmarks: [] })),
        studyGroupAPI.getUserStudyGroups().catch(() => ({ studyGroups: [] })),
        resourceRequestAPI.getUserRequests().catch(() => ({ requests: [] }))
      ]);

      setContextData(prev => ({
        ...prev,
        userBookmarks: bookmarks.bookmarks || [],
        userStudyGroups: userStudyGroups.studyGroups || [],
        userResourceRequests: userResourceRequests.requests || []
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    
    setLoading('dashboard', true);
    clearError('dashboard');
    
    try {
      const response = await dashboardAPI.getStats();
      setContextData(prev => ({
        ...prev,
        dashboardData: response
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('dashboard', error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading('dashboard', false);
    }
  };

  // Fetch user achievements
  const fetchUserAchievements = async () => {
    if (!isAuthenticated || !user?.userId) return;
    
    setLoading('achievements', true);
    clearError('achievements');
    
    try {
      const response = await achievementAPI.getUserAchievements();
      setContextData(prev => ({
        ...prev,
        userAchievements: response.achievements || []
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      setError('achievements', error.message || 'Failed to fetch achievements');
    } finally {
      setLoading('achievements', false);
    }
  };



  // Initialize context data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch essential context data (notifications excluded - only fetched on demand)
      fetchCurrentUser();
      fetchRecentResources();
      fetchPinnedResources();
      fetchActiveStudyGroups();
      fetchActiveResourceRequests();
      fetchUserData();
    } else {
      // Clear context data when user is not authenticated
      setContextData(prev => ({
        ...prev,
        currentUser: null,
        userProfile: null,
        userResources: [],
        userBookmarks: [],
        userStudyGroups: [],
        userResourceRequests: [],
        dashboardData: null,
        userAchievements: []
      }));
    }
  }, [isAuthenticated, user]);

  // Refresh all context data (notifications excluded - only fetched on demand)
  const refreshContext = async () => {
    if (!isAuthenticated) return;
    
    await Promise.all([
      fetchCurrentUser(),
      fetchRecentResources(),
      fetchPinnedResources(),
      fetchActiveStudyGroups(),
      fetchActiveResourceRequests(),
      fetchUserData(),
      fetchDashboardData(),
      fetchUserAchievements()
    ]);
  };

  // Refresh specific context data
  const refreshResources = () => fetchResources();
  const refreshCourses = () => fetchCourses();
  const refreshStudyGroups = () => fetchStudyGroups();
  const refreshResourceRequests = () => fetchResourceRequests();
  const refreshDashboard = () => fetchDashboardData();

  const value = {
    // Context data
    ...contextData,
    
    // Fetch functions
    fetchCurrentUser,
    fetchResources,
    fetchRecentResources,
    fetchPinnedResources,
    fetchCourses,
    fetchStudyGroups,
    fetchActiveStudyGroups,
    fetchResourceRequests,
    
    fetchUserData,
    fetchDashboardData,
    fetchUserAchievements,
    
    // Refresh functions
    refreshContext,
    refreshResources,
    refreshCourses,
    refreshStudyGroups,
    refreshResourceRequests,
    refreshDashboard,
    
    // Utility functions
    setLoading,
    setError,
    clearError
  };

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
};
