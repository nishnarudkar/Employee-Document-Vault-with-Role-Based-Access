import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFiles, downloadDocument } from '../services/api';

/**
 * Version History Page.
 * Visualizes the edit and revision timelines of vault archives.
 */
export default function VersionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const docIdParam = searchParams.get('docId') || '';

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Load all documents
  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      try {
        const files = await getFiles({ sortBy: 'name' });
        setDocuments(files);

        if (files.length > 0) {
          // If docId is specified in URL, use it; otherwise, select the first document
          const matchedDoc = files.find(f => f.id === docIdParam);
          if (matchedDoc) {
            setSelectedDocId(docIdParam);
            setSelectedDoc(matchedDoc);
          } else {
            setSelectedDocId(files[0].id);
            setSelectedDoc(files[0]);
          }
        }
      } catch (err) {
        console.error(err);
        setAlert({ message: 'Unable to load documents. Please try again.', type: 'danger' });
      } finally {
        setIsLoading(false);
      }
    }
    loadDocuments();
  }, [docIdParam]);

  // Handle document swap from select menu
  const handleDocChange = (e) => {
    const id = e.target.value;
    setSelectedDocId(id);
    const matched = documents.find(f => f.id === id);
    setSelectedDoc(matched || null);
    
    // Update URL parameter without resetting other params
    setSearchParams({ docId: id });
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle historical download
  const handleDownloadVersion = async (ver) => {
    if (!selectedDoc) return;
    try {
      setAlert({ message: `Downloading version ${ver.versionId} of "${selectedDoc.name}"...`, type: 'success' });
      
      // Simulate historical blob download
      const blob = new Blob([
        `Employee Document Vault - ARCHIVED VERSION\n` +
        `Document Name: ${selectedDoc.name}\n` +
        `Version ID: ${ver.versionId}\n` +
        `Upload Date: ${ver.uploadDate}\n` +
        `Uploaded By: ${ver.uploader}\n` +
        `Status: ${ver.isLatest ? 'LATEST ACTIVE VERSION' : 'ARCHIVED RECORD'}`
      ], { type: 'text/plain' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${ver.versionId}_${selectedDoc.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setAlert(null);
      }, 4000);
    } catch (err) {
      setAlert({ message: 'Failed to download historical version.', type: 'danger' });
    }
  };

  return (
    <div className="fade-in-page">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Version History</h2>
        <p className="text-muted mb-0">
          Review revision logs, download archived versions, and audit administrative actions.
        </p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show border-0 py-3 px-4 mb-4`} role="alert" style={{ borderRadius: '12px' }}>
          <div className="small fw-medium">{alert.message}</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {isLoading ? (
        <div className="card card-premium p-5 text-center">
          <div className="spinner-border text-primary my-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Fetching file revision trees...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="card card-premium p-5 text-center">
          <div className="my-4">
            <i className="bi bi-clock text-muted" style={{ fontSize: '4.5rem' }}></i>
          </div>
          <h4 className="fw-semibold text-dark">No Files in Vault</h4>
          <p className="text-muted">You must upload files to view revision histories.</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Column: Selector Panel */}
          <div className="col-12 col-lg-4">
            <div className="card card-premium p-4">
              <h5 className="fw-bold text-dark mb-3">Select Document</h5>
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Target File</label>
                <select
                  className="form-select form-select-premium"
                  value={selectedDocId}
                  onChange={handleDocChange}
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.type})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoc && (
                <div className="border-top pt-4">
                  <h6 className="fw-bold text-dark mb-3">Current Active File Details</h6>
                  <div className="d-flex flex-column gap-2 small">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Document Name:</span>
                      <span className="fw-semibold text-dark text-truncate text-end ms-2" style={{ maxWidth: '160px' }}>{selectedDoc.name}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Category:</span>
                      <span className="fw-medium text-dark">{selectedDoc.type}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Current Size:</span>
                      <span className="fw-medium text-dark">{selectedDoc.size}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Revisions:</span>
                      <span className="badge rounded-pill bg-primary text-white fw-bold">{selectedDoc.versions?.length || 1} version(s)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Version History Log Timeline */}
          <div className="col-12 col-lg-8">
            <div className="card card-premium p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Version Timeline</h5>
                  {selectedDoc && (
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-text text-muted small"></i>
                      <span className="text-muted small fw-medium text-truncate" style={{ maxWidth: '320px' }} title={selectedDoc.name}>
                        {selectedDoc.name}
                      </span>
                      <span className="badge rounded-pill bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                        {selectedDoc.versions?.length || 1} version(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDoc && selectedDoc.versions && selectedDoc.versions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th scope="col" className="text-muted small border-bottom-0 pb-3" style={{ width: '100px' }}>Version</th>
                        <th scope="col" className="text-muted small border-bottom-0 pb-3" style={{ minWidth: '160px' }}>Upload Date</th>
                        <th scope="col" className="text-muted small border-bottom-0 pb-3">Modified By</th>
                        <th scope="col" className="text-muted small border-bottom-0 pb-3">Size</th>
                        <th scope="col" className="text-muted small border-bottom-0 pb-3 text-end">Status</th>
                        <th scope="col" className="text-muted small border-bottom-0 pb-3 text-end" style={{ width: '60px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sort versions descending so latest is at the top */}
                      {[...selectedDoc.versions].reverse().map((ver) => (
                        <tr key={ver.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td>
                            <span className="fw-bold text-dark">{ver.versionId}</span>
                          </td>
                          <td className="small text-secondary">
                            {formatDate(ver.uploadDate)}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-person-circle text-muted me-2 small"></i>
                              <span className="small fw-semibold">{ver.uploader}</span>
                            </div>
                          </td>
                          <td className="small text-secondary">
                            {ver.size || '—'}
                          </td>
                          <td className="text-end">
                            {ver.isLatest ? (
                              <span className="badge bg-success-subtle text-success border border-success border-opacity-25" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                                <i className="bi bi-patch-check-fill me-1"></i> Active
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                                Archived
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary border-0 p-1 rounded-circle"
                              onClick={() => handleDownloadVersion(ver)}
                              title={`Download version ${ver.versionId}`}
                              style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <i className="bi bi-download"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-clock text-muted mb-3" style={{ fontSize: '2.5rem' }}></i>
                  <p className="text-muted mb-0">No version history available for this document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
