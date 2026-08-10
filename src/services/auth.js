// src/services/auth.js
//
// Real Amazon Cognito authentication service.
// Replaces the previous mock implementation.
// Configuration is read exclusively from environment variables — no hardcoded values.

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

// ---------------------------------------------------------------------------
// Cognito pool / client configuration (sourced from .env via Vite)
// ---------------------------------------------------------------------------
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId:   import.meta.env.VITE_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

// ---------------------------------------------------------------------------
// Group → Role mapping
// Supports exact Cognito group names and common casing variations
// ---------------------------------------------------------------------------
const GROUP_TO_ROLE = {
  HR_Admin: 'HR Admin',
  'HR/Admin': 'HR Admin',
  'HR-Admin': 'HR Admin',
  HRAdmin:  'HR Admin',
  'HR Admin':'HR Admin',
  hr_admin: 'HR Admin',
  hradmin:  'HR Admin',
  Admin:    'HR Admin',
  admin:    'HR Admin',
  HR:       'HR Admin',
  hr:       'HR Admin',

  Manager:  'Manager',
  manager:  'Manager',
  MGR:      'Manager',
  mgr:      'Manager',

  Employee: 'Employee',
  employee: 'Employee',
  EMP:      'Employee',
  emp:      'Employee',
};

/**
 * Decodes the payload of a JWT (Base64url → JSON) without verifying
 * the signature. Signature verification is handled server-side by
 * Cognito / API Gateway; we only need the claims here for UI decisions.
 *
 * @param {string} token  A dot-separated JWT string.
 * @returns {object|null} Decoded payload, or null on failure.
 */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr   = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Derives the application role from the Cognito groups claim embedded in
 * the ID token. The first recognised group wins; falls back to 'Employee'.
 *
 * @param {string} idToken  The raw Cognito ID token JWT.
 * @returns {string} Application role string.
 */
function getRoleFromIdToken(idToken) {
  const payload = decodeJwtPayload(idToken);
  if (!payload) return 'Employee';

  const groups = payload['cognito:groups'] || [];
  for (const group of groups) {
    if (GROUP_TO_ROLE[group]) {
      return GROUP_TO_ROLE[group];
    }
  }
  return 'Employee';
}

/**
 * Extracts a simplified user profile from the Cognito session tokens.
 *
 * @param {import('amazon-cognito-identity-js').CognitoUserSession} session
 * @param {string} username
 * @returns {{ username: string, name: string, email: string, role: string, groups: string[], department: string }}
 */
function buildUserProfile(session, username) {
  const idToken  = session.getIdToken().getJwtToken();
  const payload  = decodeJwtPayload(idToken) || {};
  const groups   = payload['cognito:groups'] || [];
  const role     = getRoleFromIdToken(idToken);

  const profile = {
    username,
    name:       payload.name        || payload['cognito:username'] || username,
    email:      payload.email       || '',
    role,
    groups,
    department: payload['custom:department'] || '',
  };

  // Diagnostic logging (safe: no tokens or passwords logged)
  console.log('[AUTH DIAGNOSTICS] Cognito Token Decoded:', {
    authenticatedUsername: username,
    cognitoUsernameClaim: payload['cognito:username'],
    email: payload.email,
    'cognito:groups': groups,
    calculatedRole: role,
  });

  return profile;
}

// ---------------------------------------------------------------------------
// Exported API — same surface as the previous mock so the rest of the app
// does not need to change.
// ---------------------------------------------------------------------------

/**
 * Authenticates the user against the configured Cognito User Pool.
 *
 * On success the Cognito SDK automatically persists the tokens in
 * localStorage using its own key convention (CognitoIdentityServiceProvider.*).
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>}  User profile object on success.
 * @throws {Error}             With a clean, user-friendly message on failure.
 *                             Throws a special error with code
 *                             'NEW_PASSWORD_REQUIRED' when Cognito requires the
 *                             user to set a new password (first-login flow).
 */
export const login = (username, password) =>
  new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username.trim(),
      Pool:     userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: username.trim(),
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      // -----------------------------------------------------------------------
      // Happy path — authentication succeeded
      // -----------------------------------------------------------------------
      onSuccess(session) {
        const userProfile = buildUserProfile(session, username.trim());
        // Mirror the profile in localStorage so getCurrentUser() and the
        // upload form (which reads vault_user) keep working without changes.
        localStorage.setItem('vault_user', JSON.stringify(userProfile));
        resolve(userProfile);
      },

      // -----------------------------------------------------------------------
      // Cognito requires the user to set a new password before proceeding
      // (e.g. first login after admin-created account).
      // We surface this as a typed error so the Login page can display the
      // change-password form.
      // -----------------------------------------------------------------------
      newPasswordRequired(_userAttributes, _requiredAttributes) {
        const err = new Error(
          'You must set a new password before signing in for the first time. ' +
          'Please enter a new password below.'
        );
        err.code          = 'NEW_PASSWORD_REQUIRED';
        err.cognitoUser   = cognitoUser;   // caller needs this to complete the challenge
        reject(err);
      },

      // -----------------------------------------------------------------------
      // Any authentication error
      // -----------------------------------------------------------------------
      onFailure(err) {
        reject(mapCognitoError(err));
      },
    });
  });

/**
 * Completes the NEW_PASSWORD_REQUIRED challenge after the user has supplied
 * their new password.
 *
 * @param {import('amazon-cognito-identity-js').CognitoUser} cognitoUser
 *        The CognitoUser instance returned in the error object from login().
 * @param {string} newPassword
 * @returns {Promise<object>} User profile on success.
 */
export const completeNewPassword = (cognitoUser, newPassword) =>
  new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess(session) {
        const userProfile = buildUserProfile(session, cognitoUser.getUsername());
        localStorage.setItem('vault_user', JSON.stringify(userProfile));
        resolve(userProfile);
      },
      onFailure(err) {
        reject(mapCognitoError(err));
      },
    });
  });

/**
 * Signs the user out globally from the Cognito session and clears all
 * locally cached auth state.
 */
export const logout = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  localStorage.removeItem('vault_user');
};

/**
 * Checks whether a valid Cognito session currently exists.
 * Relies on the Cognito SDK's own session validation (token expiry check).
 *
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) return false;

  // The Cognito SDK stores the session synchronously in localStorage; we can
  // check the cached session flag without an async round-trip here.
  // A full async refresh is handled by getToken() when needed.
  const storageKey = `CognitoIdentityServiceProvider.${poolData.ClientId}.${cognitoUser.getUsername()}.idToken`;
  const idToken    = localStorage.getItem(storageKey);
  if (!idToken) return false;

  // Quick expiry check on the cached ID token
  const payload = decodeJwtPayload(idToken);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
};

/**
 * Returns the cached Cognito user profile that was saved during login.
 * Also syncs the role from the current ID token so the profile is always
 * accurate after a page refresh.
 *
 * @returns {{ username, name, email, role, groups, department }|null}
 */
export const getCurrentUser = () => {
  const stored = localStorage.getItem('vault_user');
  if (!stored) return null;

  const profile = JSON.parse(stored);

  // Re-derive the role from the live token on every call to stay accurate
  // after page refreshes without needing an async token refresh.
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    const storageKey = `CognitoIdentityServiceProvider.${poolData.ClientId}.${cognitoUser.getUsername()}.idToken`;
    const idToken    = localStorage.getItem(storageKey);
    if (idToken) {
      const payload        = decodeJwtPayload(idToken) || {};
      profile.groups       = payload['cognito:groups'] || profile.groups || [];
      profile.role         = getRoleFromIdToken(idToken);
      profile.email        = payload.email        || profile.email;
      profile.name         = payload.name         || profile.name;
      profile.department   = payload['custom:department'] || profile.department || '';
    }
  }

  return profile;
};

/**
 * Returns the Cognito **access token** (JWT) for use in API Gateway
 * Authorization headers.
 *
 * The SDK will automatically refresh expired tokens when possible.
 * Returns null if the user is not authenticated or the session cannot
 * be refreshed.
 *
 * @returns {Promise<string|null>}
 */
export const getToken = () =>
  new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      // API Gateway Cognito Authorizer requires the ID token JWT
      resolve(session.getIdToken().getJwtToken());
    });
  });

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Translates a raw Cognito SDK error into a clean, user-facing Error.
 *
 * @param {Error} err  The original error from the Cognito SDK.
 * @returns {Error}    A new error with a friendly message.
 */
function mapCognitoError(err) {
  const code = err.code || '';
  const messages = {
    NotAuthorizedException:         'Incorrect username or password. Please try again.',
    UserNotFoundException:           'No account found with that username.',
    UserNotConfirmedException:      'Your account has not been confirmed yet. Please check your email for a verification code.',
    PasswordResetRequiredException: 'A password reset is required. Please reset your password and try again.',
    InvalidParameterException:      'Invalid input. Please check your username and password.',
    TooManyRequestsException:       'Too many login attempts. Please wait a moment and try again.',
    LimitExceededException:         'Too many login attempts. Please wait a moment and try again.',
    NetworkError:                   'A network error occurred. Please check your connection and try again.',
  };

  const friendlyMessage = messages[code] || err.message || 'An unexpected error occurred. Please try again.';
  const mappedErr       = new Error(friendlyMessage);
  mappedErr.code        = code;
  return mappedErr;
}
