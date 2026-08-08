import React, { useState, useRef } from 'react';
import { uploadDocument } from '../services/api';

/**
 * Reusable Upload component. Can be rendered inline as a card or as a popup modal.
 * Tracks upload progress, file validation, category selection, and tags input.
 */
export default function UploadModal({ onUploadSuccess, onCancel, inline = false }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Offer Letters');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const categories = ['Offer Letters', 'Payslips', 'Contracts', 'Appraisals'];

  // Handle Drag Over / Drag Enter
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  // Handle File Input Selection
  const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // File type and size validation
  const validateAndSetFile = (selectedFile) => {
    const MAX_SIZE_MB = 10;
    const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // Check file size
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds the ${MAX_SIZE_MB} MB limit. Please upload a smaller file.`);
      setFile(null);
      return;
    }

    // Check file type by extension and MIME type
    const fileName = selectedFile.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(selectedFile.type) || selectedFile.type === '';

    if (!hasValidExtension) {
      setError('Unsupported file type. Please upload PDF, DOC, DOCX, XLS, or XLSX files only.');
      setFile(null);
      return;
    }

    if (selectedFile.size === 0) {
      setError('The selected file appears to be empty. Please choose a valid document.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // Trigger File Input Click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Reset State Form
  const resetForm = () => {
    setFile(null);
    setCategory('Offer Letters');
    setTags('');
    setUploadProgress(0);
    setIsUploading(false);
    setError('');
  };

  // Handle Upload Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!category) {
      setError('Please select a document category.');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Call mock api which simulates fetching presigned url and PUT request to S3
      const uploadedDoc = await uploadDocument(
        file,
        category,
        tags,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Simulate a small delay before completing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      resetForm();
      if (onUploadSuccess) {
        onUploadSuccess(uploadedDoc);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload document. Please try again.');
      setIsUploading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      {error && (
        <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-0" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div className="small">{error}</div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div 
        className={`dropzone-container ${dragActive ? 'active' : ''} ${file ? 'border-success' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          onChange={handleFileChange}
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
        
        {file ? (
          <div>
            <i className="bi bi-file-check-fill text-success" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-2 fw-semibold text-dark text-truncate px-3">{file.name}</h5>
            <p className="text-muted small">
              {(file.size / 1024).toFixed(0)} KB • Click to change file
            </p>
          </div>
        ) : (
          <div>
            <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-2 fw-semibold text-dark">Drag and drop file here</h5>
            <p className="text-muted small mb-0">
              or click to browse from local computer
            </p>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Allowed: PDF, DOC, DOCX, XLS, XLSX — max 10 MB
            </p>
          </div>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="form-label fw-semibold small text-secondary">Document Category</label>
        <select
          className="form-select form-select-premium"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tags Input */}
      <div>
        <label className="form-label fw-semibold small text-secondary">Tags</label>
        <input
          type="text"
          className="form-control form-control-premium"
          placeholder="e.g. onboarding, salary, legal, draft"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isUploading}
        />
        <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
          Separate tags with commas.
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mt-2">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Uploading to S3...</span>
            <span className="fw-semibold">{uploadProgress}%</span>
          </div>
          <div className="progress progress-premium">
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated progress-bar-premium" 
              role="progressbar" 
              style={{ width: `${uploadProgress}%` }} 
              aria-valuenow={uploadProgress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-2">
        {onCancel && !isUploading && (
          <button 
            type="button" 
            className="btn btn-light px-4 py-2"
            onClick={onCancel}
            style={{ borderRadius: '10px' }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary px-4 py-2 d-flex align-items-center justify-content-center btn-hover-scale"
          disabled={!file || isUploading}
          style={{ borderRadius: '10px' }}
        >
          {isUploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up-fill me-2"></i>
              Upload Document
            </>
          )}
        </button>
      </div>
    </form>
  );

  if (inline) {
    return (
      <div className="card card-premium p-4">
        <h4 className="fw-bold mb-3 text-dark">Upload Document</h4>
        <p className="text-muted small mb-4">
          Upload official records to the vault. Your documents are uploaded securely and encrypted in an AWS S3 bucket.
        </p>
        {formContent}
      </div>
    );
  }

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-bottom-0 pt-4 px-4 pb-0">
            <h5 className="modal-title fw-bold text-dark fs-4">Upload Document</h5>
            {!isUploading && (
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
            )}
          </div>
          <div className="modal-body p-4">
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
}
