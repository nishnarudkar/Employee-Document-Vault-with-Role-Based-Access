// src/services/api.js
import axios from 'axios';
import { getToken } from './auth';

// Configurable API base URL — read from environment, never hardcoded.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.employeedocvault.internal/v1';

// Create an Axios instance pre-configured with the API base URL.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor
// Attaches the real Cognito access token to every protected API request.
// getToken() is async (reads from the Cognito SDK), so the interceptor
// must await it before the request fires.
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response Interceptor
// Maps HTTP status codes to clean, typed errors for the UI.
// 401 -> clear session and redirect to login.
// 403 -> permission denied message.
// 404 -> not found message.
// 5xx -> generic server error.
// Network errors -> network error message.
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Session expired or invalid: clear auth state and redirect to login.
        // Dynamic import avoids a circular dependency at module load time.
        import('./auth').then(({ logout }) => {
          logout();
          window.location.href = '/';
        });
        const e = new Error('Your session has expired. Please log in again.');
        e.code = 'UNAUTHORIZED';
        return Promise.reject(e);
      }

      if (status === 403) {
        const e = new Error('You do not have permission to perform this action.');
        e.code = 'FORBIDDEN';
        return Promise.reject(e);
      }

      if (status === 404) {
        const e = new Error('The requested resource was not found.');
        e.code = 'NOT_FOUND';
        return Promise.reject(e);
      }

      if (status >= 500) {
        const e = new Error('A server error occurred. Please try again later.');
        e.code = 'SERVER_ERROR';
        return Promise.reject(e);
      }
    } else if (error.request) {
      // Request sent but no response received (network/CORS/timeout)
      const e = new Error('A network error occurred. Please check your connection and try again.');
      e.code = 'NETWORK_ERROR';
      return Promise.reject(e);
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response normalisation
//
// The backend field names may differ from the frontend document model.
// All mapping lives here so no UI component needs to change.
//
// Frontend document model:
//   { id, name, type, uploadDate, tags[], size, uploader, versions[] }
//
// Each version entry:
//   { id, versionId, uploadDate, uploader, size, isLatest }
// ---------------------------------------------------------------------------

/**
 * Converts a raw byte count or pre-formatted string to a human-readable size.
 * If the value is already a non-empty string it is returned unchanged.
 */
function formatSize(raw) {
  if (typeof raw === 'string' && raw.trim() !== '') return raw;
  if (typeof raw === 'number') {
    if (raw >= 1024 * 1024) return `${(raw / (1024 * 1024)).toFixed(1)} MB`;
    if (raw > 0)            return `${(raw / 1024).toFixed(0)} KB`;
  }
  return 'Unknown';
}

/**
 * Normalises a single version entry from the backend.
 *
 * @param {object} v     Raw version object.
 * @param {number} idx   Zero-based index (used for fallback IDs).
 * @param {number} total Total number of versions for this document.
 */
function normalizeVersion(v, idx, total) {
  const num = idx + 1;
  return {
    id:         v.version_id    || v.id         || `v${num}`,
    versionId:  v.version_label || v.versionId  || `v${num}.0`,
    uploadDate: v.uploaded_at   || v.uploadDate || v.upload_date || new Date().toISOString(),
    uploader:   v.uploaded_by   || v.uploader   || 'Unknown',
    size:       formatSize(v.size || v.file_size || 0),
    isLatest:   v.is_latest !== undefined ? Boolean(v.is_latest) : (idx === total - 1),
  };
}

/**
 * Normalises a raw backend document record into the shape the frontend expects.
 * Every field has a safe fallback so the UI never crashes on unexpected shapes.
 *
 * @param {object} doc  Raw backend document.
 * @returns {object}    Normalised document.
 */
function normalizeDocument(doc) {
  const id         = doc.doc_id || doc.document_id || doc.id || doc.file_id || `doc-${Math.random()}`;
  const name       = doc.file_name || doc.name || doc.filename || 'Unnamed File';
  const type       = doc.category  || doc.type || doc.document_type || 'Other';
  const uploadDate = doc.uploaded_at || doc.upload_date || doc.uploadDate || new Date().toISOString();
  const uploader   = doc.uploaded_by || doc.uploader || doc.owner || 'Unknown';
  const size       = formatSize(doc.size || doc.file_size || 0);

  // Tags: backend may send a CSV string or an array.
  let tags = [];
  if (Array.isArray(doc.tags)) {
    tags = doc.tags;
  } else if (typeof doc.tags === 'string' && doc.tags.trim()) {
    tags = doc.tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  // Versions: normalise if provided, otherwise synthesise a single v1.0 entry
  // so VersionHistory always has at least one row.
  let versions;
  if (Array.isArray(doc.versions) && doc.versions.length > 0) {
    versions = doc.versions.map((v, idx) => normalizeVersion(v, idx, doc.versions.length));
  } else {
    versions = [{ id: 'v1', versionId: 'v1.0', uploadDate, uploader, size, isLatest: true }];
  }

  return { id, name, type, uploadDate, tags, size, uploader, versions };
}

// ---------------------------------------------------------------------------
// Exported API functions
// Same signatures as the previous mock so no calling code needs to change.
// ---------------------------------------------------------------------------

/**
 * Fetches all documents from GET /files and applies client-side filtering,
 * search, and sorting.
 *
 * Client-side operations are used to remain compatible with backends that do
 * not accept query parameters for search/filter/sort.
 *
 * @param {{ search?: string, type?: string, sortBy?: string }} [filters]
 * @returns {Promise<object[]>}
 */
export const getFiles = async (filters = {}) => {
  const response = await apiClient.get('/files');

  // The backend may return a bare array or wrap it in an object.
  const raw = response.data;
  let list = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.documents)) {
    list = raw.documents;
  } else if (Array.isArray(raw.files)) {
    list = raw.files;
  } else if (Array.isArray(raw.items)) {
    list = raw.items;
  }

  let docs = list.map(normalizeDocument);

  const { search = '', type = '', sortBy = 'newest' } = filters;

  // Client-side search (name + tags)
  if (search.trim()) {
    const q = search.toLowerCase();
    docs = docs.filter(doc =>
      doc.name.toLowerCase().includes(q) ||
      doc.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Client-side type/category filter
  if (type) {
    docs = docs.filter(doc => doc.type === type);
  }

  // Client-side sort
  if (sortBy === 'newest') {
    docs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  } else if (sortBy === 'oldest') {
    docs.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
  } else if (sortBy === 'type') {
    docs.sort((a, b) => a.type.localeCompare(b.type));
  } else if (sortBy === 'name') {
    docs.sort((a, b) => a.name.localeCompare(b.name));
  }

  return docs;
};

/**
 * Uploads a document using the presigned-URL pattern:
 *   1. POST /upload  -> API Gateway / Lambda returns a presigned S3 PUT URL.
 *   2. PUT <presignedUrl>  -> browser uploads the binary directly to S3.
 *
 * No AWS credentials are ever placed in the frontend.
 *
 * @param {File}     fileObj           Browser File object.
 * @param {string}   type              Document category (e.g. 'Payslips').
 * @param {string}   tags              Comma-separated tags.
 * @param {Function} [progressCallback] Called with percentage (0-100).
 * @returns {Promise<object>}          Normalised document object.
 */
export const uploadDocument = async (fileObj, type, tags, progressCallback) => {
  const parsedTags = tags
    ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
    : [];

  // Step 1: Request a presigned PUT URL from our API
  if (progressCallback) progressCallback(5);

  const metaPayload = {
    file_name:  fileObj.name,
    file_type:  fileObj.type || 'application/octet-stream',
    category:   type,
    tags:       parsedTags,
    file_size:  fileObj.size,
  };

  const metaResponse = await apiClient.post('/upload', metaPayload);
  const responseData  = metaResponse.data;

  const presignedUrl =
    responseData.presigned_url ||
    responseData.upload_url    ||
    responseData.url           ||
    responseData.presignedUrl;

  if (!presignedUrl) {
    throw new Error('The server did not return an upload URL. Please try again.');
  }

  if (progressCallback) progressCallback(15);

  // Step 2: PUT the file binary directly to S3 via the presigned URL.
  // Use a plain axios instance (NOT apiClient) so the Cognito Authorization
  // header is NOT sent to S3 — S3 presigned URLs authenticate via embedded
  // query-string parameters and reject extra auth headers.
  await axios.put(presignedUrl, fileObj, {
    headers: {
      'Content-Type': fileObj.type || 'application/octet-stream',
    },
    onUploadProgress: (evt) => {
      if (evt.total && progressCallback) {
        // Map S3 upload progress to the 15-95 % range
        const pct = Math.round((evt.loaded / evt.total) * 80) + 15;
        progressCallback(Math.min(pct, 95));
      }
    },
  });

  if (progressCallback) progressCallback(100);

  // Step 3: Return a normalised document object.
  // If the backend included the full document record in its response, use it.
  const backendDoc = responseData.document || responseData.file || responseData.item;
  if (backendDoc) {
    return normalizeDocument(backendDoc);
  }

  // Synthesise a minimal document from local knowledge so the Upload page
  // success banner can display useful information.
  const sizeStr = fileObj.size >= 1024 * 1024
    ? `${(fileObj.size / (1024 * 1024)).toFixed(1)} MB`
    : `${(fileObj.size / 1024).toFixed(0)} KB`;

  const docId =
    responseData.doc_id       ||
    responseData.document_id  ||
    responseData.file_id      ||
    responseData.id           ||
    `doc-${Date.now()}`;

  const userStr = localStorage.getItem('vault_user');
  const user    = userStr ? JSON.parse(userStr) : {};

  return {
    id:         docId,
    name:       fileObj.name,
    type,
    uploadDate: new Date().toISOString(),
    tags:       parsedTags,
    size:       sizeStr,
    uploader:   user.name || user.username || 'Unknown',
    versions: [{
      id:        'v1',
      versionId: 'v1.0',
      uploadDate: new Date().toISOString(),
      uploader:   user.name || user.username || 'Unknown',
      size:       sizeStr,
      isLatest:   true,
    }],
  };
};

/**
 * Retrieves a presigned S3 GET URL from GET /download/{doc_id} and triggers
 * a browser file download. The presigned URL is used immediately and never stored.
 *
 * @param {string} fileId  The document primary key.
 * @returns {Promise<{ name: string }>}  Object with name for the caller's success alert.
 */
export const downloadDocument = async (fileId) => {
  const response = await apiClient.get(`/download/${fileId}`);
  const data = response.data;

  const presignedUrl =
    data.presigned_url ||
    data.download_url  ||
    data.url           ||
    data.presignedUrl;

  if (!presignedUrl) {
    throw new Error('The server did not return a download URL. Please try again.');
  }

  const fileName = data.file_name || data.name || data.filename || fileId;

  // Trigger download via a hidden anchor without navigating away.
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href     = presignedUrl;
  a.download = fileName;
  a.target   = '_blank';
  a.rel      = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return { name: fileName };
};

/**
 * Deletes a document via DELETE /files/{doc_id}.
 * The backend handles all persistence-layer deletion logic.
 *
 * @param {string} fileId  The document primary key.
 * @returns {Promise<true>}
 */
export const deleteDocument = async (fileId) => {
  await apiClient.delete(`/files/${fileId}`);
  return true;
};

export default apiClient;
