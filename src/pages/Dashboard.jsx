import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFiles } from '../services/api';
import DocumentCard from '../components/DocumentCard';

/**
 * Main Enterprise Dashboard page.
 * Compiles dynamic statistics, recent files log, and redirects filters.
 */
export default function Dashboard({ currentUser }) {
  const [metrics, setMetrics] = useState({
    total: 0,
    recent: 0,
    offerLetters: 0,
    payslips: 0,
    contracts: 0,
    appraisals: 0
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const files = await getFiles({ sortBy: 'newest' });
        
        // Calculate counts
        const categoryCounts = files.reduce((acc, curr) => {
          const type = curr.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        // Compute files in the last 90 days as "recent"
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const recentCount = files.filter(file => new Date(file.uploadDate) >= ninetyDaysAgo).length;

        setMetrics({
          total: files.length,
          recent: recentCount,
          offerLetters: categoryCounts['Offer Letters'] || 0,
          payslips: categoryCounts['Payslips'] || 0,
          contracts: categoryCounts['Contracts'] || 0,
          appraisals: categoryCounts['Appraisals'] || 0
        });

        // Set recent 3 files for the quick view table
        setRecentFiles(files.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/documents?category=${encodeURIComponent(categoryName)}`);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="fade-in-page">
      {/* Welcome Banner Card */}
      <div className="welcome-banner p-4 p-md-5 mb-4 text-white">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <h1 className="fw-bold mb-2">
              {greeting()}, {currentUser?.name}!
            </h1>
            <p className="lead mb-0 text-white-50">
              Welcome back to your secure document space. You have **{currentUser?.role}** permissions.
            </p>
          </div>
          <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
            <button 
              className="btn btn-light btn-lg fw-semibold text-primary px-4 py-2 shadow-sm me-2 btn-hover-scale"
              onClick={() => navigate('/upload')}
              style={{ borderRadius: '10px', fontSize: '0.95rem' }}
            >
              <i className="bi bi-cloud-upload-fill me-2"></i> Upload File
            </button>
            <button 
              className="btn btn-outline-light btn-lg px-4 py-2 btn-hover-scale"
              onClick={() => navigate('/documents')}
              style={{ borderRadius: '10px', fontSize: '0.95rem', borderWidth: '2px' }}
            >
              <i className="bi bi-folder2-open me-2"></i> View Vault
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Counters Row */}
      <h5 className="fw-bold text-dark mb-3">System Metrics</h5>
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <DocumentCard
            title="Total Documents"
            value={isLoading ? '...' : metrics.total}
            icon="bi-files"
            color="primary"
            subtext="Files stored in S3"
            onClick={() => navigate('/documents')}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DocumentCard
            title="Recent Uploads"
            value={isLoading ? '...' : metrics.recent}
            icon="bi-clock-history"
            color="success"
            subtext="In the last 90 days"
            onClick={() => navigate('/documents?filter=recent')}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DocumentCard
            title="Categories"
            value="4"
            icon="bi-tag-fill"
            color="warning"
            subtext="Supported directories"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DocumentCard
            title="Authorized Role"
            value={currentUser?.role === 'HR Admin' ? 'Admin' : 'Read-Only'}
            icon="bi-shield-shaded"
            color="danger"
            subtext={currentUser?.role === 'HR Admin' ? 'Full Edit Access' : 'View & Download'}
          />
        </div>
      </div>

      {/* Document Folders/Categories Grid */}
      <h5 className="fw-bold text-dark mb-3">Folders by Department</h5>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div 
            className="card card-premium p-3 text-center border-top border-primary border-4 btn-hover-scale"
            onClick={() => handleCategoryClick('Offer Letters')}
            style={{ cursor: 'pointer' }}
          >
            <div className="fs-1 text-primary mb-2">
              <i className="bi bi-file-earmark-person"></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">Offer Letters</h6>
            <span className="badge rounded-pill bg-primary-subtle text-primary">
              {isLoading ? '...' : `${metrics.offerLetters} files`}
            </span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div 
            className="card card-premium p-3 text-center border-top border-success border-4 btn-hover-scale"
            onClick={() => handleCategoryClick('Payslips')}
            style={{ cursor: 'pointer' }}
          >
            <div className="fs-1 text-success mb-2">
              <i className="bi bi-wallet2"></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">Payslips</h6>
            <span className="badge rounded-pill bg-success-subtle text-success">
              {isLoading ? '...' : `${metrics.payslips} files`}
            </span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div 
            className="card card-premium p-3 text-center border-top border-purple border-4 btn-hover-scale"
            onClick={() => handleCategoryClick('Contracts')}
            style={{ cursor: 'pointer' }}
          >
            <div className="fs-1 text-purple mb-2">
              <i className="bi bi-file-earmark-check"></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">Contracts</h6>
            <span className="badge rounded-pill bg-purple-subtle text-purple">
              {isLoading ? '...' : `${metrics.contracts} files`}
            </span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div 
            className="card card-premium p-3 text-center border-top border-warning border-4 btn-hover-scale"
            onClick={() => handleCategoryClick('Appraisals')}
            style={{ cursor: 'pointer' }}
          >
            <div className="fs-1 text-warning mb-2">
              <i className="bi bi-award"></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">Appraisals</h6>
            <span className="badge rounded-pill bg-warning-subtle text-warning">
              {isLoading ? '...' : `${metrics.appraisals} files`}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Vault Activity Log */}
      <div className="row">
        <div className="col-12">
          <div className="card card-premium p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Recent Upload Activity</h5>
              <button 
                className="btn btn-sm btn-link text-decoration-none fw-bold"
                onClick={() => navigate('/documents')}
              >
                Go to Repository <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : recentFiles.length === 0 ? (
              <p className="text-muted mb-0 py-2">No documents available.</p>
            ) : (
              <div className="list-group list-group-flush">
                {recentFiles.map(file => (
                  <div 
                    key={file.id} 
                    className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0 border-bottom border-light"
                  >
                    <div className="d-flex align-items-center">
                      <div className="fs-3 text-secondary me-3">
                        <i className={`bi ${file.name.endsWith('.pdf') ? 'bi-file-pdf text-danger' : 'bi-file-text'}`}></i>
                      </div>
                      <div>
                        <h6 className="fw-semibold text-dark mb-1">{file.name}</h6>
                        <span className="text-muted small">
                          Uploaded {new Date(file.uploadDate).toLocaleDateString()} by {file.uploader}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`badge rounded-pill badge-category badge-${file.type.toLowerCase().replace(/\s+/g, '-')}`}>
                        {file.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
