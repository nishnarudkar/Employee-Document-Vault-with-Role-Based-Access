// src/services/api.js
import axios from 'axios';
import { getToken } from './auth';

// Configurable API base URL, falling back to environment variable or placeholder
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.employeedocvault.internal/v1';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor: Attach bearer token to API requests (Cognito/JWT)
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Classify HTTP error status codes for frontend handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        const e = new Error('You do not have permission to perform this action.');
        e.code = 'FORBIDDEN';
        return Promise.reject(e);
      } else if (status === 404) {
        const e = new Error('The requested resource was not found.');
        e.code = 'NOT_FOUND';
        return Promise.reject(e);
      } else if (status >= 500) {
        const e = new Error('A server error occurred. Please try again later.');
        e.code = 'SERVER_ERROR';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// Initial Seed Data for Mock Document Vault
const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Offer_Letter_John_Doe.pdf',
    type: 'Offer Letters',
    uploadDate: '2025-01-15T09:30:00Z',
    tags: ['offer', 'onboarding', 'engineering'],
    size: '1.2 MB',
    uploader: 'HR Admin (Nishant Narudkar)',
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: '2025-01-15T09:30:00Z', uploader: 'Nishant Narudkar', size: '1.2 MB', isLatest: true }
    ]
  },
  {
    id: 'doc-2',
    name: 'Employment_Contract_Final.pdf',
    type: 'Contracts',
    uploadDate: '2025-01-20T14:15:00Z',
    tags: ['contract', 'legal', 'employment'],
    size: '2.4 MB',
    uploader: 'Legal Team',
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: '2025-01-18T11:00:00Z', uploader: 'System', size: '2.3 MB', isLatest: false },
      { id: 'v2', versionId: 'v2.0', uploadDate: '2025-01-20T14:15:00Z', uploader: 'Nishant Narudkar', size: '2.4 MB', isLatest: true }
    ]
  },
  {
    id: 'doc-3',
    name: 'Payslip_June_2026.pdf',
    type: 'Payslips',
    uploadDate: '2026-06-30T17:00:00Z',
    tags: ['payslip', 'finance', 'salary'],
    size: '340 KB',
    uploader: 'Finance Bot',
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: '2026-06-30T17:00:00Z', uploader: 'Finance Bot', size: '340 KB', isLatest: true }
    ]
  },
  {
    id: 'doc-4',
    name: 'Payslip_July_2026.pdf',
    type: 'Payslips',
    uploadDate: '2026-07-31T18:00:00Z',
    tags: ['payslip', 'finance', 'salary'],
    size: '342 KB',
    uploader: 'Finance Bot',
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: '2026-07-31T18:00:00Z', uploader: 'Finance Bot', size: '342 KB', isLatest: true }
    ]
  },
  {
    id: 'doc-5',
    name: 'Performance_Evaluation_2025.pdf',
    type: 'Appraisals',
    uploadDate: '2025-12-15T10:00:00Z',
    tags: ['appraisal', 'review', 'annual'],
    size: '1.8 MB',
    uploader: 'HR Admin (Nishant Narudkar)',
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: '2025-12-01T08:30:00Z', uploader: 'John Doe', size: '1.7 MB', isLatest: false },
      { id: 'v2', versionId: 'v2.0', uploadDate: '2025-12-15T10:00:00Z', uploader: 'Nishant Narudkar', size: '1.8 MB', isLatest: true }
    ]
  },
  {
    id: 'doc-6',
    name: 'Standard_NDA_v3.pdf',
    type: 'Contracts',
    uploadDate: '2025-02-10T11:45:00Z',
    tags: ['nda', 'legal', 'confidentiality'],
    size: '950 KB',
    uploader: 'Legal Team',
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: '2025-02-05T09:00:00Z', uploader: 'System', size: '920 KB', isLatest: false },
      { id: 'v2', versionId: 'v2.0', uploadDate: '2025-02-08T10:15:00Z', uploader: 'System', size: '940 KB', isLatest: false },
      { id: 'v3', versionId: 'v3.0', uploadDate: '2025-02-10T11:45:00Z', uploader: 'Nishant Narudkar', size: '950 KB', isLatest: true }
    ]
  }
];

// Helper to interact with Simulated DB (localStorage)
const getStoredDocs = () => {
  const docs = localStorage.getItem('vault_documents');
  if (!docs) {
    localStorage.setItem('vault_documents', JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  return JSON.parse(docs);
};

const saveStoredDocs = (docs) => {
  localStorage.setItem('vault_documents', JSON.stringify(docs));
};

/**
 * Placeholder API Service Methods
 */

/**
 * Placeholder for authenticating the login credentials.
 * Utilizes the endpoint configuration to demonstrate HTTP setup.
 */
export const login = async (username, password) => {
  // Demo API Call (will fail because backend is not implemented, caught to fall back to mock)
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  } catch (err) {
    console.warn('Axios Mock Login Fallback (No backend active)');
    // Return standard Axios-like response format structure if needed, or bubble up
    throw err; 
  }
};

/**
 * Retrieves the documents from the repository.
 * Supports searching by name, filtering by type, and sorting.
 */
export const getFiles = async (filters = {}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  let docs = getStoredDocs();
  const { search = '', type = '', sortBy = 'newest' } = filters;

  // Filter by search term
  if (search.trim()) {
    const query = search.toLowerCase();
    docs = docs.filter(doc => doc.name.toLowerCase().includes(query) || doc.tags.some(tag => tag.toLowerCase().includes(query)));
  }

  // Filter by document type
  if (type) {
    docs = docs.filter(doc => doc.type === type);
  }

  // Sort documents
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
 * Simulates uploading a document.
 * Demonstrates the production workflow of getting a pre-signed S3 upload URL.
 */
export const uploadDocument = async (fileObj, type, tags, progressCallback) => {
  // 1. Simulating fetching S3 Pre-signed URL from API
  console.log(`[API Client] Requesting S3 presigned URL for file: ${fileObj.name}, Content-type: ${fileObj.type}`);
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  const simulatedPresignedUrl = `https://employee-doc-vault-bucket.s3.amazonaws.com/uploads/${Date.now()}_${fileObj.name}`;
  console.log(`[API Client] Received S3 Presigned URL: ${simulatedPresignedUrl}`);

  // 2. Simulating direct upload to S3 with progress monitoring
  console.log(`[API Client] PUT upload request to S3...`);
  for (let pct = 0; pct <= 100; pct += 10) {
    if (progressCallback) progressCallback(pct);
    await new Promise((resolve) => setTimeout(resolve, 120)); // Slow upload progress simulation
  }

  // 3. Registering the successfully uploaded S3 file reference inside our document DB
  const newId = `doc-${Date.now()}`;
  const userStr = localStorage.getItem('vault_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Anonymous User' };
  
  const parsedTags = tags
    ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
    : [];

  const sizeStr = fileObj.size > 1024 * 1024
    ? `${(fileObj.size / (1024 * 1024)).toFixed(1)} MB`
    : `${(fileObj.size / 1024).toFixed(0)} KB`;

  const newDoc = {
    id: newId,
    name: fileObj.name,
    type: type,
    uploadDate: new Date().toISOString(),
    tags: parsedTags,
    size: sizeStr,
    uploader: user.name,
    s3Url: simulatedPresignedUrl,
    versions: [
      { id: 'v1', versionId: 'v1.0', uploadDate: new Date().toISOString(), uploader: user.name, size: sizeStr, isLatest: true }
    ]
  };

  const docs = getStoredDocs();
  
  // Check if a file with this name already exists. If yes, add a new version instead!
  const existingDocIndex = docs.findIndex(d => d.name === fileObj.name && d.type === type);
  if (existingDocIndex !== -1) {
    const existing = docs[existingDocIndex];
    // Update existing document versions
    const nextVerNum = existing.versions.length + 1;
    const newVer = {
      id: `v${nextVerNum}`,
      versionId: `v${nextVerNum}.0`,
      uploadDate: new Date().toISOString(),
      uploader: user.name,
      size: sizeStr,
      isLatest: true
    };
    
    // Mark previous versions as false
    existing.versions = existing.versions.map(v => ({ ...v, isLatest: false })).concat(newVer);
    existing.uploadDate = new Date().toISOString();
    existing.uploader = user.name;
    existing.size = sizeStr;
    existing.tags = [...new Set([...existing.tags, ...parsedTags])];
    
    docs[existingDocIndex] = existing;
  } else {
    docs.unshift(newDoc);
  }

  saveStoredDocs(docs);
  return existingDocIndex !== -1 ? docs[existingDocIndex] : newDoc;
};

/**
 * Simulates downloading a document by opening/simulating file retrieval.
 */
export const downloadDocument = async (fileId) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const docs = getStoredDocs();
  const doc = docs.find(d => d.id === fileId);
  if (!doc) throw new Error('File not found');

  // Trigger browser download by creating a fake text file representing the vault download
  const blob = new Blob([`Employee Document Vault\nDocument Name: ${doc.name}\nType: ${doc.type}\nUploaded By: ${doc.uploader}\nDate: ${doc.uploadDate}`], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  return doc;
};

/**
 * Simulates deleting a document from the vault.
 */
export const deleteDocument = async (fileId) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const docs = getStoredDocs();
  const filtered = docs.filter(d => d.id !== fileId);
  if (docs.length === filtered.length) {
    throw new Error('File not found');
  }
  saveStoredDocs(filtered);
  return true;
};

export default apiClient;
