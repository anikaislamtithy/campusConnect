/**
 * Enhanced download utility with cross-platform compatibility and robust error handling
 */

// Supported file types
const SUPPORTED_FILE_TYPES = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'text/rtf': ['.rtf'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
  'application/vnd.oasis.opendocument.presentation': ['.odp'],
  'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],

  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
  'image/bmp': ['.bmp'],

  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  'application/gzip': ['.gz'],
  'application/x-tar': ['.tar'],

  // Code files (safe ones only)
  'text/html': ['.html', '.htm'],
  'text/css': ['.css'],
  'application/json': ['.json'],
  'text/xml': ['.xml'],
  'application/x-python': ['.py'],
  'text/x-java-source': ['.java'],
  'text/x-c': ['.c'],
  'text/x-c++': ['.cpp', '.cxx'],
  'text/x-csharp': ['.cs'],

  // Video/Audio
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg']
};

// Blocked extensions (always override supported)
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.msi', '.run', '.bin', '.sh', '.ps1'
];

/**
 * Downloads a file with enhanced browser compatibility
 */
export const downloadFile = async (url, filename, { onError, onSuccess } = {}) => {
  try {
    if (!url || !filename) throw new Error('URL and filename are required');

    const { isValid, sanitizedUrl, error } = validateDownloadUrl(url);
    if (!isValid) throw new Error(error);

    const safeName = sanitizeFileName(filename);

    // Try to create an <a> link
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = sanitizedUrl;
    link.download = safeName;
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);

    if (typeof link.click === 'function') {
      link.click();
    } else {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(event);
    }

    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 200);

    if (onSuccess) onSuccess(safeName);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    if (onError) onError(err);
    throw err;
  }
};

/**
 * Download with progress tracking
 */
export const downloadWithProgress = async (url, filename, onProgress) => {
  const { isValid, sanitizedUrl, error } = validateDownloadUrl(url);
  if (!isValid) throw new Error(error);

  const safeName = sanitizeFileName(filename);

  const response = await fetch(sanitizedUrl);
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);

  const total = parseInt(response.headers.get('content-length') || '0', 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress && total) {
      onProgress(Math.round((loaded / total) * 100));
    }
  }

  const blob = new Blob(chunks);
  const blobUrl = URL.createObjectURL(blob);

  // Trigger a one-time download
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
};

/**
 * Validation helpers
 */
export const validateDownload = (fileName, fileType, fileSize, maxSize = 100 * 1024 * 1024) => {
  const ext = getFileExtension(fileName);

  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `File type '${ext}' is blocked` };
  }

  if (fileSize && fileSize > maxSize) {
    return { isValid: false, error: `File size exceeds ${formatFileSize(maxSize)}` };
  }

  // Check if fileType is provided and validate it
  if (fileType) {
    // If fileType looks like an extension (starts with . or is just the extension)
    if (fileType.startsWith('.') || !fileType.includes('/')) {
      // Convert extension to proper format if needed
      const extension = fileType.startsWith('.') ? fileType : `.${fileType}`;
      
      // Check if any MIME type supports this extension
      const isSupportedExtension = Object.values(SUPPORTED_FILE_TYPES).some(extensions => 
        extensions.includes(extension)
      );
      
      if (!isSupportedExtension) {
        return { isValid: false, error: `File type '${extension}' not supported` };
      }
    } else {
      // fileType is a MIME type
      if (!SUPPORTED_FILE_TYPES[fileType]) {
        return { isValid: false, error: `File type '${fileType}' not supported` };
      }
    }
  }

  return { isValid: true };
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts.pop().toLowerCase() : '';
};

export const sanitizeFileName = (name) => {
  return (name || 'download')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.\./g, '.')
    .replace(/^\.|\.$/, '')
    .trim()
    .substring(0, 255) || 'download';
};

export const validateDownloadUrl = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    if (!['http:', 'https:'].includes(u.protocol)) {
      return { isValid: false, error: 'Invalid protocol' };
    }
    return { isValid: true, sanitizedUrl: u.href };
  } catch {
    return { isValid: false, error: 'Malformed URL' };
  }
};
