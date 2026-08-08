import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

/**
 * Top navigation bar representing the header of the vault.
 * Renders the application logo, logged-in user profile, and user role.
 */
export default function Navbar({ currentUser, toggleSidebar, isSidebarCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3 py-2 sticky-top shadow-sm">
      <div className="container-fluid px-0">
        {/* Mobile Toggle Button */}
        <button 
          className="btn btn-light d-lg-none me-2" 
          type="button" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="bi bi-list fs-4"></i>
        </button>
        
        {/* Desktop Toggle Button */}
        <button 
          className="btn btn-light d-none d-lg-inline-block me-3 border-0" 
          type="button" 
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i className={`bi ${isSidebarCollapsed ? 'bi-indent' : 'bi-dedent'} fs-5`}></i>
        </button>

        {/* Branding Logo */}
        <div className="navbar-brand d-flex align-items-center fw-bold text-primary fs-5 cursor-pointer" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3 me-2" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <span className="d-none d-sm-inline" style={{ letterSpacing: '-0.3px' }}>Employee Document Vault</span>
          <span className="d-sm-none">DocVault</span>
        </div>

        {/* User Profile dropdown */}
        <div className="ms-auto d-flex align-items-center">
          <div className="text-end me-3 d-none d-md-block">
            <div className="fw-bold text-dark mb-0 lh-1">{currentUser.name}</div>
            <div className="text-muted small" style={{ fontSize: '0.75rem', marginTop: '3px' }}>{currentUser.email}</div>
          </div>
          
          <div className="dropdown">
            <button 
              className="btn btn-light rounded-circle p-1 border-0" 
              type="button" 
              id="userProfileDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <div 
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                style={{ width: '40px', height: '40px', fontSize: '0.95rem' }}
              >
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2" aria-labelledby="userProfileDropdown" style={{ borderRadius: '12px', minWidth: '220px' }}>
              <li className="px-3 py-2 border-bottom d-md-none">
                <div className="fw-bold">{currentUser.name}</div>
                <div className="text-muted small" style={{ fontSize: '0.8rem' }}>{currentUser.email}</div>
              </li>
              <li className="px-3 py-2">
                <span className="text-muted small d-block">Role Privilege</span>
                <span className={`badge mt-1 ${currentUser.role === 'HR Admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                  {currentUser.role}
                </span>
              </li>
              <li className="px-3 pb-2">
                <span className="text-muted small d-block">Department</span>
                <span className="fw-medium text-dark small">{currentUser.department || 'N/A'}</span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger d-flex align-items-center py-2" onClick={handleLogout} style={{ borderRadius: '8px' }}>
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
