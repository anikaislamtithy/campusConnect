import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../lib/api';
import {
  Star,
  Search,
  Filter,
  Download,
  Heart,
  MessageSquare,
  Pin,
  Trash2,
  Grid3X3,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDownload } from '../hooks/useDownload';
import DownloadProgress from '../components/DownloadProgress';

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { downloadResource, cancelDownload, isDownloading, getAllDownloads } = useDownload();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    type: '',
    course: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  useEffect(() => {
    fetchBookmarks();
  }, [filters, searchQuery]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getBookmarks();
      let filteredBookmarks = response.bookmarks || [];

      // Search
      if (searchQuery) {
        filteredBookmarks = filteredBookmarks.filter(bookmark =>
          bookmark.resourceId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bookmark.resourceId.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Type filter
      if (filters.type) {
        filteredBookmarks = filteredBookmarks.filter(bookmark =>
          bookmark.resourceId.type === filters.type
        );
      }

      // Course filter
      if (filters.course) {
        filteredBookmarks = filteredBookmarks.filter(bookmark =>
          bookmark.resourceId.course?._id === filters.course
        );
      }

      // Sorting
      filteredBookmarks.sort((a, b) => {
        const aValue = filters.sortBy === 'createdAt' ? a[filters.sortBy] : a.resourceId[filters.sortBy];
        const bValue = filters.sortBy === 'createdAt' ? b[filters.sortBy] : b.resourceId[filters.sortBy];
        return filters.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
      });

      setBookmarks(filteredBookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (resourceId) => {
    try {
      await userAPI.removeBookmark({ resourceType: 'Resource', resourceId });
      setBookmarks(prev => prev.filter(bookmark => bookmark.resourceId._id !== resourceId));
      toast.success('Resource removed from bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  // Bulk operations
  const toggleBookmarkSelection = (bookmarkId) => {
    const newSelected = new Set(selectedBookmarks);
    if (newSelected.has(bookmarkId)) {
      newSelected.delete(bookmarkId);
    } else {
      newSelected.add(bookmarkId);
    }
    setSelectedBookmarks(newSelected);
  };

  const selectAllBookmarks = () => {
    if (selectedBookmarks.size === bookmarks.length) {
      setSelectedBookmarks(new Set());
    } else {
      setSelectedBookmarks(new Set(bookmarks.map(b => b._id)));
    }
  };

  const handleBulkRemove = async () => {
    if (selectedBookmarks.size === 0) return;
    
    try {
      const promises = Array.from(selectedBookmarks).map(bookmarkId => {
        const bookmark = bookmarks.find(b => b._id === bookmarkId);
        return userAPI.removeBookmark({ resourceType: 'Resource', resourceId: bookmark.resourceId._id });
      });
      
      await Promise.all(promises);
      setBookmarks(bookmarks.filter(b => !selectedBookmarks.has(b._id)));
      setSelectedBookmarks(new Set());
      setBulkMode(false);
      toast.success(`${selectedBookmarks.size} bookmarks removed successfully`);
    } catch (error) {
      console.error('Error removing bookmarks:', error);
      toast.error('Failed to remove some bookmarks');
    }
  };

  const handleBulkDownload = async () => {
    if (selectedBookmarks.size === 0) return;
    
    const selectedBookmarkData = bookmarks.filter(b => selectedBookmarks.has(b._id));
    
    for (const bookmark of selectedBookmarkData) {
      await handleDownload(bookmark.resourceId._id, bookmark.resourceId.title);
      // Add small delay between downloads to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setSelectedBookmarks(new Set());
    setBulkMode(false);
    toast.success(`Started downloading ${selectedBookmarks.size} resources`);
  };

  const handleDownload = async (resourceId, fileName) => {
    await downloadResource(resourceId, {
      showProgress: true,
      showToast: true
    });
  };

  const resourceTypes = [
    { value: 'notes', label: 'Notes' },
    { value: 'slides', label: 'Slides' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'practice', label: 'Practice' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'other', label: 'Other' },
  ];

  const BookmarkCard = ({ bookmark }) => {
    const isSelected = selectedBookmarks.has(bookmark._id);
    
    return (
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden relative ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}>
        <div className='p-6'>
          {bulkMode && (
            <div className='absolute top-4 left-4 z-10'>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={() => toggleBookmarkSelection(bookmark._id)}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
            </div>
          )}
          <div className={`flex items-start justify-between mb-4 ${bulkMode ? 'ml-8' : ''}`}>
            <div className='flex-1'>
              <div className='flex items-center space-x-2 mb-2'>
                <h3 className='text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors'>
                  {bookmark.resourceId.title}
                </h3>
                {bookmark.resourceId.isPinned && <Pin className='h-4 w-4 text-yellow-500' />}
              </div>
              <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                {bookmark.resourceId.description}
              </p>
              <div className='flex items-center space-x-4 text-sm text-gray-500'>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                  {resourceTypes.find(t => t.value === bookmark.resourceId.type)?.label || bookmark.resourceId.type}
                </span>
                <span>{bookmark.resourceId.course?.name}</span>
                <span>by {bookmark.resourceId.uploadedBy?.name}</span>
              </div>
            </div>
            {!bulkMode && (
              <button
                onClick={() => handleRemoveBookmark(bookmark.resourceId._id)}
                className='p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded'
                title='Remove from bookmarks'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            )}
          </div>

        {bookmark.resourceId.tags?.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {bookmark.resourceId.tags.map((tag, index) => (
              <span key={index} className='bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs'>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4 text-sm text-gray-500'>
            <div className='flex items-center space-x-1'>
              <Heart className='h-4 w-4' />
              <span>{bookmark.resourceId.likes?.length || 0}</span>
            </div>
            <div className='flex items-center space-x-1'>
              <MessageSquare className='h-4 w-4' />
              <span>{bookmark.resourceId.comments?.length || 0}</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Download className='h-4 w-4' />
              <span>{bookmark.resourceId.downloadCount || 0}</span>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => handleDownload(bookmark.resourceId._id, bookmark.resourceId.title)}
              disabled={isDownloading(bookmark.resourceId._id)}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isDownloading(bookmark.resourceId._id) ? 'Downloading...' : 'Download'}
            </button>
            <Link
              to={`/resources/${bookmark.resourceId._id}`}
              className='bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm'
            >
              View
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
          <h1 className='text-3xl font-bold text-gray-900'>Bookmarks</h1>
          <p className='mt-2 text-gray-600'>
            {bulkMode && selectedBookmarks.size > 0 
              ? `${selectedBookmarks.size} bookmark${selectedBookmarks.size > 1 ? 's' : ''} selected`
              : 'Your saved resources for easy access'
            }
          </p>
        </div>
        <div className='flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0'>
          {bulkMode ? (
            <>
              <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3'>
                <button
                  onClick={selectAllBookmarks}
                  className='px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[44px] sm:min-h-0'
                >
                  {selectedBookmarks.size === bookmarks.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={selectedBookmarks.size === 0}
                  className='px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0'
                >
                  Download Selected
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={selectedBookmarks.size === 0}
                  className='px-4 py-3 sm:py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0'
                >
                  Remove Selected
                </button>
                <button
                  onClick={() => {
                    setBulkMode(false);
                    setSelectedBookmarks(new Set());
                  }}
                  className='px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[44px] sm:min-h-0'
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setBulkMode(true)}
                disabled={bookmarks.length === 0}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Select Multiple
              </button>
              <div className='flex items-center border border-gray-300 rounded-md'>
                 <button
                   onClick={() => setViewMode('grid')}
                   className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                     viewMode === 'grid'
                       ? 'bg-blue-600 text-white'
                       : 'text-gray-700 hover:bg-gray-50'
                   }`}
                 >
                   <Grid3X3 className='h-4 w-4 mr-1' />
                   Grid
                 </button>
                 <button
                   onClick={() => setViewMode('list')}
                   className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                     viewMode === 'list'
                       ? 'bg-blue-600 text-white'
                       : 'text-gray-700 hover:bg-gray-50'
                   }`}
                 >
                   <List className='h-4 w-4 mr-1' />
                   List
                 </button>
               </div>
            </>
          )}
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
                placeholder='Search bookmarks...'
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
          <div className='mt-6 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm'
              >
                <option value=''>All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm'
              >
                <option value='createdAt'>Date Added</option>
                <option value='title'>Title</option>
                <option value='downloadCount'>Downloads</option>
                <option value='likes'>Likes</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                className='w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm'
              >
                <option value='desc'>Descending</option>
                <option value='asc'>Ascending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks Display */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }`}>
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark._id} bookmark={bookmark} />
          ))}
        </div>
      )}

      {/* Quick Actions Bar */}
      {!loading && bookmarks.length > 0 && !bulkMode && (
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              Showing {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => {
                  const allResourceIds = bookmarks.map(b => b.resourceId._id);
                  allResourceIds.forEach(async (id, index) => {
                    const bookmark = bookmarks[index];
                    await handleDownload(id, bookmark.resourceId.title);
                    await new Promise(resolve => setTimeout(resolve, 500));
                  });
                  toast.success('Started downloading all bookmarks');
                }}
                className='px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors'
              >
                Download All
              </button>
              <Link
                to='/resources'
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors'
              >
                Browse More Resources
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className='text-center py-16 px-6'>
          <div className='max-w-md mx-auto'>
            {!searchQuery && !Object.values(filters).some(f => f) ? (
              <>
                <div className='text-8xl mb-6'>📚</div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                  Start Building Your Collection
                </h3>
                <p className='text-gray-600 mb-8 leading-relaxed'>
                  Bookmark your favorite resources to create a personalized study collection. 
                  Save notes, assignments, and materials for quick access anytime.
                </p>
                <div className='space-y-4'>
                  <Link
                    to='/resources'
                    className='inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg'
                  >
                    Explore Resources
                  </Link>
                  <div className='text-sm text-gray-500'>
                    💡 Tip: Click the bookmark icon on any resource to save it here
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='text-6xl mb-6'>🔍</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  No bookmarks match your criteria
                </h3>
                <p className='text-gray-600 mb-6'>
                  {searchQuery ? `No results found for "${searchQuery}"` : 'Try adjusting your filters to see more bookmarks'}
                </p>
                <div className='space-y-3'>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        type: '',
                        course: '',
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                      });
                    }}
                    className='bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors'
                  >
                    Clear All Filters
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bookmark Statistics Dashboard */}
      {!loading && bookmarks.length > 0 && (
        <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4 text-center'>Your Bookmark Statistics</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>{bookmarks.length}</div>
              <div className='text-sm text-gray-600'>Total Bookmarks</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {bookmarks.filter(b => b.resourceId.type === 'notes').length}
              </div>
              <div className='text-sm text-gray-600'>Notes</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {bookmarks.filter(b => b.resourceId.type === 'slides').length}
              </div>
              <div className='text-sm text-gray-600'>Slides</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {bookmarks.filter(b => b.resourceId.type === 'assignment').length}
              </div>
              <div className='text-sm text-gray-600'>Assignments</div>
            </div>
          </div>
          <div className='mt-4 grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-xl font-bold text-red-600'>
                {bookmarks.filter(b => b.resourceId.type === 'quiz').length}
              </div>
              <div className='text-sm text-gray-600'>Quizzes</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-indigo-600'>
                {bookmarks.filter(b => b.resourceId.type === 'practice').length}
              </div>
              <div className='text-sm text-gray-600'>Practice</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-teal-600'>
                {bookmarks.filter(b => ['syllabus', 'other'].includes(b.resourceId.type)).length}
              </div>
              <div className='text-sm text-gray-600'>Other Resources</div>
            </div>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {getAllDownloads().map((download) => (
        <DownloadProgress
          key={download.id}
          isVisible={true}
          progress={download.progress || 0}
          fileName={download.fileName || 'Unknown file'}
          status={download.status}
          error={download.error}
          onCancel={() => cancelDownload(download.id)}
        />
      ))}
    </div>
  );
};

export default Bookmarks;
