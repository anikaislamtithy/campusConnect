import React from 'react';
import { Download, CheckCircle, AlertCircle, X } from 'lucide-react';

const DownloadProgress = ({ 
  isVisible, 
  progress, 
  fileName, 
  status, // 'preparing', 'downloading', 'completed', 'error'
  onCancel,
  error 
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'preparing':
        return <Download className="h-4 w-4 animate-pulse" />;
      case 'downloading':
        return <Download className="h-4 w-4 animate-bounce" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing download...';
      case 'downloading':
        return `Downloading... ${progress}%`;
      case 'completed':
        return 'Download completed!';
      case 'error':
        return error || 'Download failed';
      default:
        return 'Download';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'preparing':
        return 'bg-blue-50 border-blue-200';
      case 'downloading':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border-2 ${getStatusColor()} z-50 transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                {getStatusText()}
              </p>
            </div>
          </div>
          
          {onCancel && status !== 'completed' && (
            <button
              onClick={onCancel}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        {(status === 'downloading' || status === 'preparing') && (
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  status === 'preparing' ? 'bg-blue-400 animate-pulse' : 'bg-blue-500'
                }`}
                style={{ 
                  width: status === 'preparing' ? '100%' : `${progress}%` 
                }}
              />
            </div>
            {status === 'downloading' && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{progress}%</span>
                <span>Downloading...</span>
              </div>
            )}
          </div>
        )}
        
        {/* Error details */}
        {status === 'error' && error && (
          <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadProgress;