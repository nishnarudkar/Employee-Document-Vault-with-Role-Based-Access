import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFiles, downloadDocument, deleteDocument } from '../services/api';
import SearchBar from '../components/SearchBar';
import FileTable from '../components/FileTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AccessDenied from '../components/AccessDenied';

/**
 * Documents Repository Page.
 * Orchestrates search inputs, sort operations, categorizations, and file deletion/download callbacks.
 */
export default function Documents({ currentUser }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL query parameters (e.g. from Dashboard click)
  const categoryParam = searchParams.get('category') || '';
  const filterParam = searchParams.get('filter') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('newest');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, docId: null, docName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Forbidden / access denied state
  const [accessDenied, setAccessDenied] = useState(false);

  const documentTypes = ['Offer Letters', 'Payslips', 'Contracts', 'Appraisals'];

  // Sync state if URL query parameter changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedType(categoryParam);
    }
  }, [categoryParam]);

  // Load and filter documents
  const loadDocuments = async () => {
    setIsLoading(true);
    setAccessDenied(false);
    try {
      const filters = {
        search: searchQuery,
        type: selectedType,
        sortBy: sortBy
      };

      let fetchedDocs = await getFiles(filters);

      // Handle "recent" URL filter (last 90 days)
      if (filterParam === 'recent') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        fetchedDocs = fetchedDocs.filter(doc => new Date(doc.uploadDate) >= ninetyDaysAgo);
      }

      setDocuments(fetchedDocs);
    } catch (err) {
      console.error(err);
      if (err.code === 'FORBIDDEN') {
        setAccessDenied(true);
      } else {
        showAlert('Unable to load documents. Please try again.', 'danger');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger reload on filter changes
  useEffect(() => {
    loadDocuments();
  }, [searchQuery, selectedType, sortBy, filterParam]);

  // Helper to show visual toast alert
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    // Auto-dismiss alert after 4 seconds
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Clear query parameters
  const clearUrlFilters = () => {
    setSearchParams({});
    setSelectedType('');
  };

  // Download Handler
  const handleDownload = async (fileId) => {
    try {
      const doc = await downloadDocument(fileId);
      showAlert(`Downloading "${doc.name}"...`);
    } catch (err) {
      if (err.code === 'FORBIDDEN') {
        showAlert('Access denied. You do not have permission to download this file.', 'danger');
      } else {
        showAlert('Download failed. Please try again.', 'danger');
      }
    }
  };

  // Open delete confirmation modal
  const handleDelete = (fileId) => {
    const docToDelete = documents.find(d => d.id === fileId);
    if (!docToDelete) return;
    setDeleteModal({ show: true, docId: fileId, docName: docToDelete.name });
  };

  // Execute delete after confirmation
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(deleteModal.docId);
      showAlert(`Successfully deleted "${deleteModal.docName}" from the repository.`, 'success');
      setDeleteModal({ show: false, docId: null, docName: '' });
      loadDocuments();
    } catch (err) {
      if (err.code === 'FORBIDDEN') {
        showAlert('Access denied. You do not have permission to delete this document.', 'danger');
      } else {
        showAlert(err.message || 'Unable to delete this document. Please try again.', 'danger');
      }
      setDeleteModal({ show: false, docId: null, docName: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setDeleteModal({ show: false, docId: null, docName: '' });
    }
  };

  // Show Access Denied page if 403 was received
  if (accessDenied) {
    return <AccessDenied message="You do not have permission to view the document repository." />;
  }

  return (
    <div className="fade-in-page">
      {/* Header section */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Document Registry</h2>
          <p className="text-muted mb-0">
            Access and manage corporate documents. Filter archives by department tags or categories.
          </p>
        </div>

        {/* Banner Alert for URL filters */}
        {(selectedType || filterParam) && (
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
            onClick={clearUrlFilters}
            style={{ borderRadius: '8px' }}
          >
            <i className="bi bi-x-circle me-1"></i>
            Clear Filter ({selectedType || 'Recent Uploads'})
          </button>
        )}
      </div>

      {/* Floating feedback alert */}
      {alert && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm border-0 d-flex align-items-center py-3 px-4 mb-4`}
          role="alert"
          style={{ borderRadius: '12px', zIndex: 1050 }}
        >
          <i className={`bi ${alert.type === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-success'} fs-4 me-3`}></i>
          <div className="fw-medium small">{alert.message}</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlert(null)} style={{ top: '50%', transform: 'translateY(-50%)' }}></button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        documentTypes={documentTypes}
      />

      {/* Responsive Files Table */}
      <FileTable
        documents={documents}
        onDownload={handleDownload}
        onDelete={handleDelete}
        currentUser={currentUser}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={deleteModal.show}
        docName={deleteModal.docName}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
