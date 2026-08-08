import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

/**
 * Responsive navigation sidebar.
 * Links to Dashboard, Documents, Upload, and Version History pages.
 */
export default function Sidebar({ isCollapsed, isMobileShow, closeMobileSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    closeMobileSidebar();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { path: '/documents', label: 'Documents', icon: 'bi-file-earmark-text-fill' },
    { path: '/upload', label: 'Upload', icon: 'bi-cloud-arrow-up-fill' },
    { path: '/version-history', label: 'Version History', icon: 'bi-clock-history' }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileShow && (
        <div 
          className="modal-backdrop fade show d-lg-none" 
          onClick={closeMobileSidebar}
          style={{ zIndex: 90 }}
        ></div>
      )}

      <aside className={`sidebar-wrapper border-end ${isCollapsed ? 'collapsed' : ''} ${isMobileShow ? 'show-mobile' : ''}`}>
        <div className="d-flex flex-column h-100 py-4 px-3 justify-content-between">
          <div>
            <div className="text-uppercase text-secondary small fw-bold px-3 mb-3" style={{ letterSpacing: '1px', fontSize: '0.7rem', opacity: 0.6 }}>
              Main Menu
            </div>
            
            <ul className="nav nav-pills flex-column">
              {menuItems.map((item) => (
                <li key={item.path} className="nav-item mb-2">
                  <NavLink
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) => 
                      `nav-link d-flex align-items-center py-2.5 px-3 rounded-3 text-decoration-none ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm fw-medium' 
                          : 'text-sidebar hover-bg-sidebar-item'
                      }`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? '#fff' : 'var(--text-sidebar)',
                      transition: 'all 0.2s ease-in-out'
                    })}
                  >
                    <i className={`bi ${item.icon} me-3 fs-5`}></i>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Sidebar Action */}
          <div className="border-top border-secondary border-opacity-25 pt-4 px-2">
            <button 
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center py-2.5 rounded-3 fw-semibold btn-hover-scale"
            >
              <i className="bi bi-box-arrow-left me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Internal hover styles for Sidebar menu items */}
      <style>{`
        .hover-bg-sidebar-item:hover {
          background-color: var(--bg-sidebar-hover);
          color: var(--text-sidebar-active) !important;
        }
      `}</style>
    </>
  );
}
