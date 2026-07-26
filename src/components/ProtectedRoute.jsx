import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, getRoleDefaultPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verifying Access Security..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectPath = getRoleDefaultPath(role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
