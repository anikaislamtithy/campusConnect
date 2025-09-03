import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceAPI, userAPI } from '../lib/api';
import {
  Download,
  Heart,
  MessageSquare,
  Star,
  ArrowLeft,
  Share2,
  Calendar,
  User,
  File,
  Tag,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDownload } from '../hooks/useDownload';
import DownloadProgress from '../components/DownloadProgress';

const ResourceView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const { downloadResource, cancelDownload, isDownloading, getAllDownloads } = useDownload();

  useEffect(() => {
    fetchResource();
    fetchBookmarks();
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getResource(id);
      setResource(response.resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast.error('Failed to fetch resource details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await userAPI.getBookmarks();
      setBookmarks(response.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleLike = async () => {
    try {
      await resourceAPI.likeResource(id);
      fetchResource();
    } catch (error) {
      console.error('Error liking resource:', error);
      toast.error('Failed to like resource');
    }
  };

  const handleDownload = async () => {
    await downloadResource(resource.fileUrl, {
      showProgress: true,
      showToast: true,
      onSuccess: () => {
        // Refresh resource to update download count
        fetchResource();
      }
    });
  };

  const handleBookmark = async () => {
    try {
      const isBookmarked = bookmarks.some(bookmark => bookmark.resourceId._id === id);
      if (isBookmarked) {
        await userAPI.removeBookmark({ resourceType: 'Resource', resourceId: id });
        toast.success('Resource removed from bookmarks');
      } else {
        await userAPI.addBookmark({ resourceType: 'Resource', resourceId: id });
        toast.success('Resource added to bookmarks');
      }
      fetchBookmarks();
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await resourceAPI.addComment(id, { text: commentText });
      setCommentText('');
      fetchResource();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Resource not found</h3>
        <p className="text-gray-500 mb-4">The resource you're looking for doesn't exist or has been removed</p>
        <Link
          to="/resources"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Resources
        </Link>
      </div>
    );
  }

  const isBookmarked = bookmarks.some(bookmark => bookmark.resourceId._id === id);
  const isLiked = resource.likes?.some(like => like._id === user?.userId);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Resources
        </Link>
      </div>

      {/* Resource header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h1>
            <p className="text-gray-600 mb-4">{resource.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {resource.type}
              </span>
              {resource.course && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {resource.course.name}
                </span>
              )}
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(resource.createdAt)}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {resource.uploadedBy?.name || 'Unknown'}
              </div>
              <div className="flex items-center">
                <File className="h-4 w-4 mr-1" />
                {resource.fileName}
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {resource.downloadCount || 0} downloads
              </div>
            </div>
          </div>

          {/* <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading(id)}
               className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center ${
                 isDownloading(id)
                   ? 'bg-gray-400 text-white cursor-not-allowed'
                   : 'bg-blue-600 text-white hover:bg-blue-700'
               }`}
             >
               <Download className="h-5 w-5 mr-2" />
               {isDownloading(id) ? 'Downloading...' : 'Download'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className="h-5 w-5 mr-1" fill={isLiked ? 'currentColor' : 'none'} />
                {resource.likes?.length || 0}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${isBookmarked ? 'bg-yellow-50 text-yellow-500 border-yellow-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              >
                <Star className="h-5 w-5 mr-1" fill={isBookmarked ? 'currentColor' : 'none'} />
                Bookmark
              </button>
              <button
                className="flex-1 flex items-center justify-center px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="Share"
              >
                <Share2 className="h-5 w-5 mr-1" />
                Share
              </button>
            </div>
          </div> */}
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({resource.comments?.length || 0})
        </h2>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                required
              />
            </div>
            <button
              type="submit"
              className="self-end bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Post
            </button>
          </div>
        </form>

        {/* Comments list */}
        <div className="space-y-4">
          {resource.comments && resource.comments.length > 0 ? (
            resource.comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {comment.user?.profilePicture ? (
                      <img 
                        src={comment.user.profilePicture} 
                        alt={comment.user.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white text-lg font-semibold">
                        {comment.user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{comment.user?.name || 'Unknown'}</h4>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
      
      {/* Download Progress Indicators */}
      {getAllDownloads().map((download, index) => (
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

export default ResourceView;