import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.delete('/auth/logout'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/users/showMe'),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  getUserProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateUser: (data) => api.patch('/users/updateUser', data),
  updatePassword: (data) => api.patch('/users/updateUserPassword', data),
  updateProfilePicture: (formData) => api.patch('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addBookmark: (data) => api.post('/users/bookmarks/add', data),
  removeBookmark: (data) => api.delete('/users/bookmarks/remove', { data }),
  getBookmarks: () => api.get('/users/bookmarks'),
};

// Course API
export const courseAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.patch(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollFromCourse: (id) => api.delete(`/courses/${id}/unenroll`),
  getUserCourses: () => api.get('/courses/my-courses'),
  searchCourses: (query) => api.get('/courses/search', { params: { q: query } }),
};

// Resource API
export const resourceAPI = {
  getAllResources: (params) => api.get('/resources', { params }),
  getResource: (id) => api.get(`/resources/${id}`),
  createResource: (formData) => api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateResource: (id, data) => api.patch(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
  likeResource: (id) => api.post(`/resources/${id}/like`),
  addComment: (id, data) => api.post(`/resources/${id}/comment`, data),
  downloadResource: (id) => api.get(`/resources/${id}/download`),
  pinResource: (id) => api.patch(`/resources/${id}/pin`),
  getRecentResources: (limit) => api.get('/resources/recent', { params: { limit } }),
  getPinnedResources: (courseId) => api.get('/resources/pinned', { params: { course: courseId } }),
};

// Study Group API
export const studyGroupAPI = {
  getAllStudyGroups: (params) => api.get('/study-groups', { params }),
  getStudyGroup: (id) => api.get(`/study-groups/${id}`),
  createStudyGroup: (data) => api.post('/study-groups', data),
  updateStudyGroup: (id, data) => api.patch(`/study-groups/${id}`, data),
  deleteStudyGroup: (id) => api.delete(`/study-groups/${id}`),
  joinStudyGroup: (id) => api.post(`/study-groups/${id}/join`),
  leaveStudyGroup: (id) => api.delete(`/study-groups/${id}/leave`),
  getUserStudyGroups: () => api.get('/study-groups/my-groups'),
  searchStudyGroups: (query) => api.get('/study-groups/search', { params: { q: query } }),
};

// Resource Request API
export const resourceRequestAPI = {
  getAllRequests: (params) => api.get('/resource-requests', { params }),
  getRequest: (id) => api.get(`/resource-requests/${id}`),
  createRequest: (data) => api.post('/resource-requests', data),
  updateRequest: (id, data) => api.patch(`/resource-requests/${id}`, data),
  deleteRequest: (id) => api.delete(`/resource-requests/${id}`),
  addComment: (id, data) => api.post(`/resource-requests/${id}/comment`, data),
  upvoteRequest: (id) => api.post(`/resource-requests/${id}/upvote`),
  fulfillRequest: (id, data) => api.post(`/resource-requests/${id}/fulfill`, data),
  getUserRequests: () => api.get('/resource-requests/my-requests'),
  searchRequests: (query) => api.get('/resource-requests/search', { params: { q: query } }),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Achievement API
export const achievementAPI = {
  getAllAchievements: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/my-achievements'),
  getUserAchievementsById: (userId) => api.get(`/achievements/user/${userId}`),
  createAchievement: (data) => api.post('/achievements', data),
  updateAchievement: (id, data) => api.patch(`/achievements/${id}`, data),
  deleteAchievement: (id) => api.delete(`/achievements/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getResourceStats: (params) => api.get('/dashboard/resource-stats', { params }),
  getUserActivity: (userId, params) => api.get(`/dashboard/user-activity/${userId}`, { params }),
};

export default api;
