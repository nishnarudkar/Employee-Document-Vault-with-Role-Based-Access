// src/services/auth.js

/**
 * Pre-configured mock users for testing.
 * Username 'admin' gets the 'HR Admin' role (can delete/manage documents).
 * Username 'employee' gets the 'Employee' role (read-only / restricted actions).
 */
export const MOCK_USERS = {
  admin: {
    username: 'admin',
    name: 'Nishant Narudkar',
    role: 'HR Admin',
    email: 'nishant.narudkar@enterprise.com',
    department: 'Human Resources'
  },
  employee: {
    username: 'employee',
    name: 'John Doe',
    role: 'Employee',
    email: 'john.doe@enterprise.com',
    department: 'Engineering'
  }
};

/**
 * Simulates authentication login flow.
 * In a real application, this would integrate with AWS Cognito or an OAuth2 server.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} User object
 */
export const login = async (username, password) => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const normalizedUsername = username.trim().toLowerCase();
  
  if (MOCK_USERS[normalizedUsername]) {
    // Basic password validation: mock check requiring at least 6 characters
    if (password && password.length >= 6) {
      const user = MOCK_USERS[normalizedUsername];
      const token = `mock-jwt-cognito-token-${user.username}-${Math.random().toString(36).substr(2)}`;
      
      localStorage.setItem('vault_token', token);
      localStorage.setItem('vault_user', JSON.stringify(user));
      
      return user;
    } else {
      throw new Error('Password must be at least 6 characters.');
    }
  } else {
    throw new Error('Invalid username. Use "admin" or "employee" for testing.');
  }
};

/**
 * Logs the user out by clearing local session.
 */
export const logout = () => {
  localStorage.removeItem('vault_token');
  localStorage.removeItem('vault_user');
};

/**
 * Retrieves the stored JWT authentication token.
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('vault_token');
};

/**
 * Retrieves the currently logged-in user profile information.
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('vault_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Checks if the current user session is valid.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};
