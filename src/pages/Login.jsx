import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/auth';

/**
 * Enterprise Login Page.
 * Authenticates user credentials using mock authentication services.
 */
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // If already logged in, skip Login page and redirect to Dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
      // Successful login -> Redirect
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to prefill details for rapid demo assessment
  const prefillCredentials = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (userType === 'employee') {
      setUsername('employee');
      setPassword('employee123');
    }
    // Clear validation errors on prefill
    setValidationErrors({});
    setError('');
  };

  return (
    <div className="login-bg">
      <div className="card login-card border-0">
        <div className="card-body p-4 p-sm-5">
          {/* Logo Brand Header */}
          <div className="d-flex flex-column align-items-center mb-4">
            <div className="logo-icon-container mb-3">
              <i className="bi bi-shield-lock-fill text-white fs-3"></i>
            </div>
            <h3 className="fw-bold text-dark mb-1 text-center">Document Vault</h3>
            <p className="text-muted text-center small mb-0">
              Enterprise HR Document Management System
            </p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center py-2.5 px-3 mb-4" role="alert" style={{ borderRadius: '10px' }}>
              <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
              <div className="small fw-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Username Field */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Username / Email</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted pe-1">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className={`form-control form-control-premium border-start-0 ps-2 ${
                    validationErrors.username ? 'is-invalid' : ''
                  }`}
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
                {validationErrors.username && (
                  <div className="invalid-feedback ps-2">{validationErrors.username}</div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <label className="form-label fw-semibold text-secondary small mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted pe-1">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className={`form-control form-control-premium border-start-0 ps-2 ${
                    validationErrors.password ? 'is-invalid' : ''
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                {validationErrors.password && (
                  <div className="invalid-feedback ps-2">{validationErrors.password}</div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 fw-bold btn-hover-scale d-flex align-items-center justify-content-center shadow-sm"
              disabled={isLoading}
              style={{ borderRadius: '12px', fontSize: '1rem' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verifying Session...
                </>
              ) : (
                'Secure Log In'
              )}
            </button>
          </form>

          {/* Quick Demo Assist Panel */}
          <div className="mt-4 border-top pt-4">
            <span className="text-secondary small fw-semibold d-block text-center mb-3">
              Developer Demo Accounts:
            </span>
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary w-100 py-2 text-truncate"
                  onClick={() => prefillCredentials('admin')}
                  disabled={isLoading}
                  style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                >
                  <i className="bi bi-shield-check me-1 text-danger"></i> HR Admin
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary w-100 py-2 text-truncate"
                  onClick={() => prefillCredentials('employee')}
                  disabled={isLoading}
                  style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                >
                  <i className="bi bi-person-check me-1 text-primary"></i> Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
