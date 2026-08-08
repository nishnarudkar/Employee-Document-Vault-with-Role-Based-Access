import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadModal from '../components/UploadModal';

/**
 * Upload Page.
 * Wraps the UploadModal component in inline mode and presents a dual-column corporate tutorial layout.
 */
export default function Upload() {
  const [lastUploaded, setLastUploaded] = useState(null);
  const navigate = useNavigate();

  const handleUploadSuccess = (newDoc) => {
    setLastUploaded(newDoc);
    // Auto clear/dismiss the success summary card after 6 seconds
    setTimeout(() => {
      setLastUploaded(null);
    }, 6000);
  };

  return (
    <div className="fade-in-page">
      <div className="row g-4">
        {/* Left Column: Upload Form */}
        <div className="col-12 col-lg-7">
          <UploadModal 
            inline={true} 
            onUploadSuccess={handleUploadSuccess} 
          />
        </div>

        {/* Right Column: Information, Guidelines & Recent Upload Log */}
        <div className="col-12 col-lg-5">
          {/* Success Banner Card */}
          {lastUploaded && (
            <div className="card card-premium p-4 border-start border-success border-4 mb-4 bg-success bg-opacity-10 text-success fade-in-page">
              <div className="d-flex align-items-start">
                <i className="bi bi-check-circle-fill fs-3 me-3"></i>
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-1">File Uploaded Successfully!</h5>
                  <p className="small mb-2 text-secondary">
                    Your file has been uploaded to S3 and cataloged in the secure vault registry.
                  </p>
                  
                  <div className="bg-white bg-opacity-70 rounded-3 p-3 text-dark small border border-success border-opacity-25 mb-3">
                    <strong>File Name:</strong> {lastUploaded.name}<br/>
                    <strong>Category:</strong> {lastUploaded.type}<br/>
                    <strong>Size:</strong> {lastUploaded.size}<br/>
                    <strong>Uploader:</strong> {lastUploaded.uploader}
                  </div>

                  <button 
                    className="btn btn-sm btn-success text-white fw-bold px-3 py-2 btn-hover-scale"
                    onClick={() => navigate('/documents')}
                    style={{ borderRadius: '8px' }}
                  >
                    View in Directory <i className="bi bi-arrow-right-short"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secure S3 Upload Policy Guidelines */}
          <div className="card card-premium p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-shield-check-fill text-primary me-2"></i>
              Vault Upload Policy
            </h5>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-3 small text-secondary">
              <li className="d-flex align-items-start">
                <i className="bi bi-check2 text-success me-2 mt-0.5 fs-5"></i>
                <span>
                  <strong>Encrypted storage:</strong> All uploads undergo server-side AES-256 encryption once stored in our AWS S3 bucket.
                </span>
              </li>
              <li className="d-flex align-items-start">
                <i className="bi bi-check2 text-success me-2 mt-0.5 fs-5"></i>
                <span>
                  <strong>Presigned S3 URL Architecture:</strong> This form requests a temporary authorization token (presigned URL) from the backend. The file is uploaded directly from the browser to the S3 bucket to optimize memory.
                </span>
              </li>
              <li className="d-flex align-items-start">
                <i className="bi bi-check2 text-success me-2 mt-0.5 fs-5"></i>
                <span>
                  <strong>Version Control:</strong> Uploading a file with an identical filename and category will create a new incremental version (e.g. v2.0) under the same resource, preventing data loss.
                </span>
              </li>
              <li className="d-flex align-items-start">
                <i className="bi bi-check2 text-success me-2 mt-0.5 fs-5"></i>
                <span>
                  <strong>Authorized Formats:</strong> Vault accepts PDF, Microsoft Word (DOC/DOCX), and plaintext files. Maximum file upload limit is 10 MB.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
