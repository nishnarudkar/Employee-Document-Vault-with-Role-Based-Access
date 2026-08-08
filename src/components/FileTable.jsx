import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Renders the tabular list of documents in a responsive design.
 * Features inline tag badges, status indicators, and actions for download/delete/version history.
 */
export default function FileTable({
  documents = [],
  onDownload,
  onDelete,
  currentUser,
  isLoading
}) {
  const navigate = useNavigate();

  // Helper to format date strings
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

  // Helper to resolve category badge styling classes
  const getCategoryClass = (type) => {
    const normalized = type.toLowerCase().replace(/\s+/g, '-');
    return `badge-category badge-${normalized}`;
  };

  if (isLoading) {
    return (
      <div className="card card-premium p-5 text-center">
        <div className="spinner-border text-primary my-4" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading documents...</span>
        </div>
        <p className="text-muted">Loading vault archives, please wait...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="card card-premium p-5 text-center">
        <div className="my-4">
          <i className="bi bi-folder-x text-muted" style={{ fontSize: '4.5rem' }}></i>
        </div>
        <h4 className="fw-semibold text-dark">No Documents Found</h4>
        <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
          We couldn't find any documents matching your criteria. Try adjusting your search query, clearing filters, or upload a new file.
        </p>
      </div>
    );
  }

  const isHrAdmin = currentUser?.role === 'HR Admin';

  return (
    <div className="table-premium-container">
      <div className="table-responsive">
        <table className="table table-premium align-middle">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: '220px' }}>File Name</th>
              <th scope="col" style={{ minWidth: '130px' }}>Category</th>
              <th scope="col" style={{ minWidth: '150px' }}>Upload Date</th>
              <th scope="col" style={{ minWidth: '180px' }}>Tags</th>
              <th scope="col" className="text-end" style={{ minWidth: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="fs-3 text-secondary me-3">
                      {doc.name.endsWith('.pdf') ? (
                        <i className="bi bi-file-earmark-pdf text-danger"></i>
                      ) : doc.name.endsWith('.docx') || doc.name.endsWith('.doc') ? (
                        <i className="bi bi-file-earmark-word text-primary"></i>
                      ) : doc.name.endsWith('.xlsx') || doc.name.endsWith('.xls') ? (
                        <i className="bi bi-file-earmark-excel text-success"></i>
                      ) : (
                        <i className="bi bi-file-earmark-text text-secondary"></i>
                      )}
                    </div>
                    <div>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }} title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-muted small d-flex align-items-center gap-2">
                        <span>{doc.size || 'Unknown Size'}</span>
                        <span>•</span>
                        <span className="text-truncate" style={{ maxWidth: '140px' }} title={`Uploaded by ${doc.uploader}`}>
                          by {doc.uploader}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={getCategoryClass(doc.type)}>
                    {doc.type}
                  </span>
                </td>
                <td>
                  <div className="small fw-medium text-secondary">
                    {formatDate(doc.uploadDate)}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-wrap">
                    {doc.tags && doc.tags.length > 0 ? (
                      doc.tags.map((tag, idx) => (
                        <span key={idx} className="tag-badge">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </div>
                </td>
                <td className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    {/* View History Button */}
                    <button
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                      onClick={() => navigate(`/version-history?docId=${doc.id}`)}
                      title="View version history"
                    >
                      <i className="bi bi-clock-history me-1"></i>
                      <span className="d-none d-md-inline">History</span>
                    </button>

                    {/* Download Button */}
                    <button
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                      onClick={() => onDownload(doc.id)}
                      title="Download file"
                    >
                      <i className="bi bi-download me-1"></i>
                      <span className="d-none d-md-inline">Download</span>
                    </button>

                    {/* Delete Button — only visible to HR Admin */}
                    {isHrAdmin && (
                      <button
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                        onClick={() => onDelete(doc.id)}
                        title="Delete file"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
