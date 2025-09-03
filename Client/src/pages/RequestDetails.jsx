import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceRequestAPI } from '../lib/api';
import {
  MessageSquare,
  ThumbsUp,
  Calendar,
  User,
  Tag,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  FileText,
  Download,
  ExternalLink,
  Flag
} from 'lucide-react';
import toast from 'react-hot-toast';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await resourceRequestAPI.getRequest(id);
      setRequest(response.request);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to load request details');
      navigate('/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      setActionLoading(true);
      await resourceRequestAPI.upvoteRequest(id);
      toast.success('Request upvoted!');
      fetchRequest(); // Refresh data
    } catch (error) {
      console.error('Error upvoting request:', error);
      toast.error(error.response?.data?.msg || 'Failed to upvote request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      setActionLoading(true);
      await resourceRequestAPI.deleteRequest(id);
      toast.success('Request deleted successfully');
      navigate('/requests');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error(error.response?.data?.msg || 'Failed to delete request');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setCommentLoading(true);
      await resourceRequestAPI.addComment(id, { text: commentText });
      toast.success('Comment added successfully!');
      setCommentText('');
      setShowCommentForm(false);
      fetchRequest(); // Refresh data
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.msg || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFulfillRequest = async () => {
    try {
      setActionLoading(true);
      // This would typically open a modal to upload a resource
      // For now, we'll just show a message
      toast.info('Fulfill request functionality would open a resource upload modal');
    } catch (error) {
      console.error('Error fulfilling request:', error);
      toast.error('Failed to fulfill request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'fulfilled':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className='h-4 w-4' />;
      case 'in-progress':
        return <Clock className='h-4 w-4' />;
      case 'fulfilled':
        return <CheckCircle className='h-4 w-4' />;
      case 'closed':
        return <X className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className='text-center py-12'>
        <AlertCircle className='h-16 w-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>Request Not Found</h3>
        <p className='text-gray-500 mb-4'>The request you're looking for doesn't exist or has been removed.</p>
        <Link
          to='/requests'
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Requests
        </Link>
      </div>
    );
  }

  const isCreator = user?.userId === request.requestedBy._id;
  const hasUpvoted = request.upvotes?.some(upvote => upvote._id === user?.userId);
  const canFulfill = !isCreator && request.status === 'open';

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => navigate('/requests')}
          className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='h-5 w-5 mr-2' />
          Back to Requests
        </button>
        
        {isCreator && (
          <div className='flex items-center space-x-2'>
            <Link
              to={`/requests/${id}/edit`}
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
        <div className='px-6 py-8 bg-gradient-to-r from-orange-500 to-red-500 text-white'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold mb-2'>{request.title}</h1>
              <p className='text-orange-100 mb-4'>{request.course.name} • {request.course.code}</p>
              <div className='flex items-center space-x-4 text-sm'>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)} bg-white`}>
                  {getStatusIcon(request.status)}
                  <span className='ml-1 capitalize'>{request.status}</span>
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)} bg-white`}>
                  <Flag className='h-3 w-3 mr-1' />
                  <span className='capitalize'>{request.priority}</span>
                </span>
                <span className='flex items-center'>
                  <ThumbsUp className='h-4 w-4 mr-1' />
                  {request.upvotes?.length || 0} upvotes
                </span>
                <span className='flex items-center'>
                  <MessageSquare className='h-4 w-4 mr-1' />
                  {request.comments?.length || 0} comments
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className='ml-6 flex items-center space-x-2'>
              {!isCreator && (
                <>
                  <button
                    onClick={handleUpvote}
                    disabled={actionLoading}
                    className={`inline-flex items-center px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
                      hasUpvoted 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <ThumbsUp className='h-4 w-4 mr-2' />
                    {hasUpvoted ? 'Upvoted' : 'Upvote'}
                  </button>
                  {canFulfill && (
                    <button
                      onClick={handleFulfillRequest}
                      disabled={actionLoading}
                      className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50'
                    >
                      <FileText className='h-4 w-4 mr-2' />
                      Fulfill Request
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Description */}
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-3'>Request Description</h2>
                <p className='text-gray-700 leading-relaxed'>{request.description}</p>
              </div>

              {/* Tags */}
              {request.tags && request.tags.length > 0 && (
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 mb-3'>Tags</h2>
                  <div className='flex flex-wrap gap-2'>
                    {request.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800'
                      >
                        <Tag className='h-3 w-3 mr-1' />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fulfilled Resource */}
              {request.status === 'fulfilled' && request.fulfilledResource && (
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 mb-3'>Fulfilled Resource</h2>
                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <FileText className='h-8 w-8 text-green-600' />
                        <div>
                          <h3 className='font-medium text-gray-900'>{request.fulfilledResource.title}</h3>
                          <p className='text-sm text-gray-600'>Fulfilled by {request.fulfilledBy?.name}</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <a
                          href={request.fulfilledResource.fileUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'
                        >
                          <Download className='h-4 w-4 mr-2' />
                          Download
                        </a>
                        <Link
                          to={`/resources/${request.fulfilledResource._id}`}
                          className='inline-flex items-center px-3 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors'
                        >
                          <ExternalLink className='h-4 w-4 mr-2' />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Comments ({request.comments?.length || 0})
                  </h2>
                  {user && (
                    <button
                      onClick={() => setShowCommentForm(!showCommentForm)}
                      className='inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                    >
                      <MessageSquare className='h-4 w-4 mr-2' />
                      Add Comment
                    </button>
                  )}
                </div>

                {/* Comment Form */}
                {showCommentForm && (
                  <form onSubmit={handleAddComment} className='mb-6 p-4 bg-gray-50 rounded-lg'>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder='Add your comment...'
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                    <div className='flex justify-end space-x-2 mt-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setShowCommentForm(false);
                          setCommentText('');
                        }}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
                      >
                        Cancel
                      </button>
                      <button
                        type='submit'
                        disabled={commentLoading || !commentText.trim()}
                        className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
                      >
                        <Send className='h-4 w-4 mr-2' />
                        {commentLoading ? 'Adding...' : 'Add Comment'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className='space-y-4'>
                  {request.comments && request.comments.length > 0 ? (
                    request.comments.map((comment) => (
                      <div key={comment._id} className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-start space-x-3'>
                          <div className='h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center'>
                            <User className='h-4 w-4 text-gray-600' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-2 mb-1'>
                              <span className='font-medium text-gray-900'>{comment.user.name}</span>
                              <span className='text-sm text-gray-500'>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className='text-gray-700'>{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      <MessageSquare className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Request Creator */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Requested By</h3>
                <div className='flex items-center space-x-3'>
                  <div className='h-10 w-10 bg-orange-600 rounded-full flex items-center justify-center'>
                    <User className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>{request.requestedBy.name}</div>
                    <div className='text-sm text-gray-600'>{request.requestedBy.email}</div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Request Details</h3>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Resource Type:</span>
                    <span className='text-gray-900 capitalize'>{request.resourceType}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Priority:</span>
                    <span className={`capitalize px-2 py-1 rounded-full text-xs ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Status:</span>
                    <span className={`capitalize px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Created:</span>
                    <span className='text-gray-900'>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  {request.deadline && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Deadline:</span>
                      <span className='text-gray-900 flex items-center'>
                        <Calendar className='h-3 w-3 mr-1' />
                        {new Date(request.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Engagement Stats */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Engagement</h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <ThumbsUp className='h-4 w-4 text-blue-600' />
                      <span className='text-sm text-gray-600'>Upvotes</span>
                    </div>
                    <span className='font-medium text-gray-900'>{request.upvotes?.length || 0}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <MessageSquare className='h-4 w-4 text-green-600' />
                      <span className='text-sm text-gray-600'>Comments</span>
                    </div>
                    <span className='font-medium text-gray-900'>{request.comments?.length || 0}</span>
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
              <h3 className='text-lg font-semibold text-gray-900'>Delete Request</h3>
            </div>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this request? This action cannot be undone and all comments will be lost.
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
                disabled={actionLoading}
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50'
              >
                {actionLoading ? 'Deleting...' : 'Delete Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;