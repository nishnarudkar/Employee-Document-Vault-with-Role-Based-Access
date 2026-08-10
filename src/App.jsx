import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from './services/auth';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import VersionHistory from './pages/VersionHistory';

// Import Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

/**
 * Route protection wrapper. Redirects unauthenticated sessions back to the Login screen.
 * Resolves responsiveness, layout bounds, and coordinates header/sidebar states.
 */
function ProtectedLayout({ children, currentUser, onReloadUser }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileShow, setIsMobileShow] = useState(false);

  // Sync current user state whenever ProtectedLayout mounts or onReloadUser changes
  useEffect(() => {
    if (isAuthenticated()) {
      onReloadUser();
    }
  }, [onReloadUser]);

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsMobileShow(!isMobileShow);
  };

  const closeMobileSidebar = () => {
    setIsMobileShow(false);
  };

  return (
    <div className="app-layout">
      {/* Navigation Sidebar Drawer */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileShow={isMobileShow} 
        closeMobileSidebar={closeMobileSidebar}
      />
      
      <div className="main-content-wrapper">
        {/* Top Navbar */}
        <Navbar 
          currentUser={currentUser} 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isCollapsed}
        />
        
        {/* Page Container */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleReloadUser = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log('[APP DIAGNOSTICS] Current User State Synced:', user);
  };

  // Sync user state on startup
  useEffect(() => {
    if (isAuthenticated()) {
      handleReloadUser();
    }
  }, []);

  // Monitor storage events to coordinate multiple open tabs
  useEffect(() => {
    const handleStorageEvent = () => {
      handleReloadUser();
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Authentication Endpoint */}
        <Route path="/" element={<Login onLoginSuccess={handleReloadUser} />} />

        {/* Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedLayout currentUser={currentUser} onReloadUser={handleReloadUser}>
              <Dashboard currentUser={currentUser} />
            </ProtectedLayout>
          } 
        />

        {/* Protected Document list */}
        <Route 
          path="/documents" 
          element={
            <ProtectedLayout currentUser={currentUser} onReloadUser={handleReloadUser}>
              <Documents currentUser={currentUser} />
            </ProtectedLayout>
          } 
        />

        {/* Protected Upload Form */}
        <Route 
          path="/upload" 
          element={
            <ProtectedLayout currentUser={currentUser} onReloadUser={handleReloadUser}>
              <Upload />
            </ProtectedLayout>
          } 
        />

        {/* Protected Version Timeline */}
        <Route 
          path="/version-history" 
          element={
            <ProtectedLayout currentUser={currentUser} onReloadUser={handleReloadUser}>
              <VersionHistory />
            </ProtectedLayout>
          } 
        />

        {/* Route mismatch fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
