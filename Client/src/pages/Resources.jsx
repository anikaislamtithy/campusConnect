import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceAPI, courseAPI, userAPI } from '../lib/api';
import {
  Plus, Search, Filter, Download, Heart, MessageSquare,
  Star, FileText, Upload, X, MoreVertical, Pin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDownload } from '../hooks/useDownload';
import DownloadProgress from '../components/DownloadProgress';
import { useDebounce } from 'use-debounce';

// ------------------ ResourceCard ------------------
const ResourceCard = ({ resource, user, bookmarks, handleLike, handleBookmark, handlePin, handleDownload, isDownloading }) => {
  const isLiked = resource.likes?.some(like => like._id === user?.userId);
  const isBookmarked = bookmarks?.some(b => b.resourceId._id === resource._id);
  const [isHovered, setIsHovered] = useState(false);

  const getTypeColor = (type) => {
    const colors = {
      'notes': 'bg-blue-100 text-blue-800 border-blue-200',
      'slides': 'bg-green-100 text-green-800 border-green-200',
      'quiz': 'bg-purple-100 text-purple-800 border-purple-200',
      'assignment': 'bg-orange-100 text-orange-800 border-orange-200',
      'video': 'bg-red-100 text-red-800 border-red-200',
      'document': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'notes': '📝',
      'slides': '📊',
      'quiz': '❓',
      'assignment': '📋',
      'video': '🎥',
      'document': '📄'
    };
    return icons[type] || '📄';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{getTypeIcon(resource.type)}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                {resource.isPinned && (
                  <div className="flex items-center mt-1">
                    <Pin className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-600 font-medium">Pinned</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{resource.description}</p>
            
            {/* Resource metadata */}
            <div className="flex items-center flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(resource.type)}`}>
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </span>
              {resource.course?.name && (
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">
                  {resource.course.name}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1 ml-4">
            {user?.role === 'admin' && (
              <button
                onClick={() => handlePin(resource._id)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  resource.isPinned 
                    ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
                title={resource.isPinned ? 'Unpin resource' : 'Pin resource'}
              >
                <Pin className="h-4 w-4" />
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {/* Tags */}
        {Array.isArray(resource.tags) && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="bg-gray-50 text-gray-700 px-2 py-1 rounded-md text-xs hover:bg-gray-100 transition-colors cursor-pointer border">
                #{tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="text-gray-400 text-xs px-2 py-1">+{resource.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* Author info */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
            {resource.uploadedBy?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span>by <span className="font-medium text-gray-700">{resource.uploadedBy?.name}</span></span>
          <span className="mx-2">•</span>
          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLike(resource._id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{resource.likes?.length || 0}</span>
            </button>
            
            <button
              onClick={() => handleBookmark(resource._id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                isBookmarked 
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            
            <div className="flex items-center space-x-1 text-gray-500 px-2 py-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{resource.comments?.length || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500 px-2 py-1">
              <Download className="h-4 w-4" />
              <span className="text-sm">{resource.downloadCount || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:flex-col w-full gap-2">
            <button
              onClick={() => handleDownload(resource.fileUrl)}
              disabled={isDownloading(resource._id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isDownloading(resource._id)
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
              }`}
            >
              {isDownloading(resource._id) ? (
                <div className="flex items-center space-x-2 w-full">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Downloading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </div>
              )}
            </button>
            
            <Link
              to={`/resources/${resource._id}`}
              className=" bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium hover:shadow-md transform hover:-translate-y-0.5"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
      
      {/* Hover overlay effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
};

// ------------------ Main Resources Component ------------------
const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResources: 0,
    hasMore: true,
    limit: 12
  });
  const [filters, setFilters] = useState({
    course: '',
    type: '',
    tags: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'notes',
    course: '',
    tags: '',
    file: null,
  });
  const { downloadResource, cancelDownload, isDownloading, getAllDownloads } = useDownload();

  // Resource types
  const resourceTypes = useMemo(() => [
    { value: 'notes', label: 'Notes' },
    { value: 'slides', label: 'Slides' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'practice', label: 'Practice' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'other', label: 'Other' },
  ], []);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const params = { 
          ...filters, 
          search: debouncedSearch || undefined, 
          page: 1, 
          limit: pagination.limit 
        };
        const response = await resourceAPI.getAllResources(params);
        setResources(response.resources || []);
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: response.totalPages || 1,
          totalResources: response.totalResources || 0,
          hasMore: (response.totalPages || 1) > 1
        }));

      } catch (error) {
        toast.error('Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [filters, debouncedSearch, pagination.limit]);

  // Load more resources for infinite scroll
  const loadMoreResources = async () => {
    if (loadingMore || !pagination.hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = pagination.currentPage + 1;
      const params = {
        ...filters,
        search: debouncedSearch || undefined,
        page: nextPage,
        limit: pagination.limit
      };
      const response = await resourceAPI.getAllResources(params);
      
      setResources(prev => [...prev, ...(response.resources || [])]);
      setPagination(prev => ({
        ...prev,
        currentPage: nextPage,
        hasMore: nextPage < (response.totalPages || 1)
      }));
    } catch (error) {
      toast.error('Failed to load more resources');
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreResources();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, pagination.hasMore, filters, debouncedSearch]);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, bookmarkRes] = await Promise.all([
          courseAPI.getAllCourses(),
          userAPI.getBookmarks(),
        ]);
        setCourses(courseRes.courses || []);
        setBookmarks(bookmarkRes.bookmarks || []);
      } catch {
        toast.error('Failed to fetch courses or bookmarks');
      }
    })();
  }, []);

  // Actions
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file to upload');
    try {
      const formData = new FormData();
      Object.entries(uploadForm).forEach(([key, value]) => {
        if (key === 'tags') formData.append('tags', value.split(',').map(t => t.trim()));
        else if (key === 'file') formData.append('resourceFile', value);
        else if (value) formData.append(key, value);
      });
      await resourceAPI.createResource(formData);
      toast.success('Resource uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', type: 'notes', course: '', tags: '', file: null });
    } catch {
      toast.error('Failed to upload resource');
    }
  };

  const handleLike = async (resourceId) => {
    try {
      await resourceAPI.likeResource(resourceId);
      setResources(prev =>
        prev.map(r =>
          r._id === resourceId
            ? { ...r, likes: [...(r.likes || []), { _id: user.userId }] }
            : r
        )
      );
    } catch {
      toast.error('Failed to like resource');
    }
  };

  const handleBookmark = async (resourceId) => {
    try {
      const isBookmarked = bookmarks.some(b => b.resourceId._id === resourceId);
      if (isBookmarked) {
        await userAPI.removeBookmark({ resourceType: 'Resource', resourceId });
        setBookmarks(prev => prev.filter(b => b.resourceId._id !== resourceId));
        toast.success('Removed from bookmarks');
      } else {
        await userAPI.addBookmark({ resourceType: 'Resource', resourceId });
        setBookmarks(prev => [...prev, { resourceId: { _id: resourceId } }]);
        toast.success('Added to bookmarks');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handlePin = async (resourceId) => {
    try {
      await resourceAPI.pinResource(resourceId);
      toast.success('Resource pinned');
    } catch {
      toast.error('Failed to pin resource');
    }
  };

  const handleDownload = async (resourceId) => {
    await downloadResource(resourceId, {
      showProgress: true,
      showToast: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="mt-2 text-gray-600">
            Discover and share academic resources with your peers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Link
            to="/bookmarks"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Star className="h-5 w-5 mr-2" />
            My Bookmarks
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Resource
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
              >
                <option value="">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags (comma-separated)"
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters({ ...filters, sortBy, sortOrder });
                }}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="downloadCount-desc">Most Downloaded</option>
                <option value="likes-desc">Most Liked</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Resource Statistics Dashboard */}
      {!loading && pagination.totalResources > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pagination.totalResources}</div>
              <div className="text-sm text-gray-600">Total Resources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resources.length}</div>
              <div className="text-sm text-gray-600">Currently Showing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{bookmarks.length}</div>
              <div className="text-sm text-gray-600">Your Bookmarks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pagination.currentPage}/{pagination.totalPages}</div>
              <div className="text-sm text-gray-600">Page Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Count */}
      {!loading && resources.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {resources.length} of {pagination.totalResources} resources
          </div>
          <div className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              user={user}
              bookmarks={bookmarks}
              handleLike={handleLike}
              handleBookmark={handleBookmark}
              handlePin={handlePin}
              handleDownload={handleDownload}
              isDownloading={isDownloading}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && resources.length > 0 && pagination.hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreResources}
            disabled={loadingMore}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              'Load More Resources'
            )}
          </button>
        </div>
      )}

      {/* End of Results Message */}
      {!loading && resources.length > 0 && !pagination.hasMore && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            You've reached the end of the results
          </div>
        </div>
      )}

      {!loading && resources.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'No matching resources found'
                : 'No resources available yet'
              }
            </h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for. You can also contribute by uploading your own resources.'
                : 'This is a great opportunity to be the first to share valuable resources with your peers. Upload notes, assignments, or study materials to get started.'
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Resource
              </button>
              {(searchQuery || Object.values(filters).some(f => f)) && (
                <div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        course: '',
                        type: '',
                        tags: '',
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Resource</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter resource title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your resource"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {resourceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    value={uploadForm.course}
                    onChange={(e) => setUploadForm({ ...uploadForm, course: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Download Progress Indicators */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {getAllDownloads().map((download) => (
          <DownloadProgress
            key={download.id}
            isVisible
            progress={download.progress || 0}
            fileName={download.fileName || 'Unknown file'}
            status={download.status}
            error={download.error}
            onCancel={() => cancelDownload(download.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Resources;
