import React from 'react';

/**
 * Bootstrap modal for delete confirmation.
 * Replaces the native window.confirm with a professional enterprise dialog.
 *
 * Props:
 *   show        - boolean: whether to display the modal
 *   docName     - string: document name shown in the confirmation message
 *   onConfirm   - function: called when Delete button is clicked
 *   onCancel    - function: called when Cancel / X is clicked
 *   isDeleting  - boolean: shows spinner while deletion is in progress
 */
export default function DeleteConfirmModal({ show, docName, onConfirm, onCancel, isDeleting }) {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header */}
            <div className="modal-header border-0 pt-4 px-4 pb-0">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '44px', height: '44px', background: '#fee2e2', flexShrink: 0 }}
                >
                  <i className="bi bi-trash-fill text-danger" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '1.1rem' }}>
                  Delete Document?
                </h5>
              </div>
              {!isDeleting && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onCancel}
                />
              )}
            </div>

            {/* Body */}
            <div className="modal-body px-4 pt-3 pb-4">
              <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                Are you sure you want to permanently delete{' '}
                <strong className="text-dark">"{docName}"</strong>?
                <br />
                <span className="small text-danger">
                  This action cannot be undone and will remove all associated version records.
                </span>
              </p>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 pt-0 pb-4 px-4 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 py-2 fw-semibold"
                onClick={onCancel}
                disabled={isDeleting}
                style={{ borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 py-2 fw-semibold d-flex align-items-center"
                onClick={onConfirm}
                disabled={isDeleting}
                style={{ borderRadius: '10px' }}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
