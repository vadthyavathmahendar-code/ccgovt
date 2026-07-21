import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable Protected Route Guard
 * Controls access to routes based on authentication status and user roles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, getRoleDefaultPath } = useAuth();
  const location = useLocation();

  // 1. Loading Screen while verifying session & database role
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Verifying Access Security...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 2. Unauthenticated User -> Redirect to Login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but Unauthorized Role -> Redirect to appropriate role dashboard or /unauthorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectPath = getRoleDefaultPath(role);
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Authorized -> Render Protected Page Component
  return children;
};

const styles = {
  loadingContainer: {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc',
  },
  spinner: {
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '15px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.95rem',
  },
};

export default ProtectedRoute;
