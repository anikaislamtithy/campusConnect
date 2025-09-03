import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  downloadFile, 
  downloadWithProgress, 
  validateDownload, 
  sanitizeFileName,
  validateDownloadUrl 
} from '../utils/downloadUtils';

export const useDownload = () => {
  const [downloadStates, setDownloadStates] = useState(new Map());

  const updateDownloadState = useCallback((id, updates) => {
    setDownloadStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(id) || {};
      newMap.set(id, { ...currentState, ...updates });
      return newMap;
    });
  }, []);

  const removeDownloadState = useCallback((id) => {
    setDownloadStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const downloadResource = useCallback(async (resourceIdOrUrl, options = {}) => {
    console.log(resourceIdOrUrl)
    const {
      url, // <-- allow passing a direct URL
      showProgress = true,
      showToast = true,
      onSuccess,
      onError,
      onProgress
    } = options;

    const resourceId = resourceIdOrUrl; // keep compatibility

    // Prevent duplicate downloads
    const currentState = downloadStates.get(resourceId);
    if (currentState?.status === 'downloading' || currentState?.status === 'preparing') {
      if (showToast) {
        toast.error('Download already in progress');
      }
      return false;
    }

    try {
      // Set preparing state
      updateDownloadState(resourceId, {
        status: 'preparing',
        progress: 0,
        fileName: 'Preparing...',
        error: null
      });

      if (showToast) {
        toast.loading('Preparing download...', { id: `download-${resourceId}` });
      }

      // Direct download case
      const downloadUrl = resourceId || resourceId; // if url provided use it, else assume resourceId is the url
      const fileName = sanitizeFileName(downloadUrl.split('/').pop() || 'download');
      const fileType = downloadUrl.split('.').pop() || 'bin';
      const fileSize = null; // Unknown without HEAD request

      // Update state
      updateDownloadState(resourceId, {
        fileName,
        fileType,
        fileSize
      });

      // Validate URL
      const urlValidation = validateDownloadUrl(downloadUrl);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error);
      }

      // Validate filename/type if available
      const validation = validateDownload(fileName, fileType, fileSize);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Set downloading state
      updateDownloadState(resourceId, {
        status: 'downloading',
        progress: 0
      });

      // Attempt progressive download
      if (showProgress && window.fetch && window.ReadableStream) {
        try {
          await downloadWithProgress(
            downloadUrl,
            fileName,
            (progress) => {
              updateDownloadState(resourceId, { progress });
              if (onProgress) onProgress(progress);
            }
          );
        } catch (progressError) {
          console.warn('Progress download failed, fallback:', progressError);
          await downloadFile(downloadUrl, fileName, {
            onSuccess: () => updateDownloadState(resourceId, { status: 'completed', progress: 100 }),
            onError: (error) => {
              updateDownloadState(resourceId, { status: 'error', error: error.message });
              throw error;
            }
          });
        }
      } else {
        // Simple download
        await downloadFile(downloadUrl, fileName, {
          onSuccess: () => updateDownloadState(resourceId, { status: 'completed', progress: 100 }),
          onError: (error) => {
            updateDownloadState(resourceId, { status: 'error', error: error.message });
            throw error;
          }
        });
      }

      // Success
      if (showToast) {
        toast.success(`Download started: ${fileName}`, { id: `download-${resourceId}` });
      }
      if (onSuccess) onSuccess(fileName);

      setTimeout(() => removeDownloadState(resourceId), 5000);

      return true;
    } catch (error) {
      console.error('Download error:', error);

      updateDownloadState(resourceId, { status: 'error', error: error.message || 'Download failed' });

      if (showToast) {
        toast.error(`Download failed: ${error.message}`, { id: `download-${resourceId}` });
      }
      if (onError) onError(error);

      setTimeout(() => removeDownloadState(resourceId), 10000);
      return false;
    }
  }, [downloadStates, updateDownloadState, removeDownloadState]);

  const cancelDownload = useCallback((resourceId) => {
    const currentState = downloadStates.get(resourceId);
    if (currentState && (currentState.status === 'downloading' || currentState.status === 'preparing')) {
      updateDownloadState(resourceId, { status: 'error', error: 'Download cancelled by user' });
      toast.error('Download cancelled', { id: `download-${resourceId}` });
      setTimeout(() => removeDownloadState(resourceId), 2000);
    }
  }, [downloadStates, updateDownloadState, removeDownloadState]);

  const getDownloadState = useCallback((resourceId) => downloadStates.get(resourceId) || null, [downloadStates]);
  const isDownloading = useCallback((resourceId) => {
    const state = downloadStates.get(resourceId);
    return state?.status === 'downloading' || state?.status === 'preparing';
  }, [downloadStates]);
  const getAllDownloads = useCallback(() => Array.from(downloadStates.entries()).map(([id, state]) => ({ id, ...state })), [downloadStates]);

  return {
    downloadResource,
    cancelDownload,
    getDownloadState,
    isDownloading,
    getAllDownloads,
    downloadStates: Array.from(downloadStates.entries())
  };
};

export default useDownload;
