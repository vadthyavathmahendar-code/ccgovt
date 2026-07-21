import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Public Only Route Guard
 * Prevents logged-in users from viewing Login/Signup pages.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, role, loading, getRoleDefaultPath } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    const defaultPath = getRoleDefaultPath(role);
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
