import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Access Denied component.
 * Shown when a user attempts an action they are not authorized to perform,
 * or when the API returns an HTTP 403 Forbidden response.
 */
export default function AccessDenied({
  message = 'You do not have permission to access this resource. Contact your HR Administrator if you believe this is an error.',
  showDashboardLink = true
}) {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="text-center" style={{ maxWidth: '480px' }}>
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle"
          style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #fca5a5'
          }}
        >
          <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '2.8rem' }}></i>
        </div>
        <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 mb-3 px-3 py-2" style={{ fontSize: '0.8rem', borderRadius: '8px' }}>
          403 — Access Forbidden
        </span>
        <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '1.75rem' }}>
          Access Denied
        </h2>
        <p className="text-muted mb-4 lh-lg" style={{ fontSize: '0.95rem' }}>
          {message}
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button
            className="btn btn-light px-4 py-2 fw-semibold d-flex align-items-center"
            onClick={() => navigate(-1)}
            style={{ borderRadius: '10px' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Go Back
          </button>
          {showDashboardLink && (
            <button
              className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center btn-hover-scale"
              onClick={() => navigate('/dashboard')}
              style={{ borderRadius: '10px' }}
            >
              <i className="bi bi-grid-1x2-fill me-2"></i>
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
