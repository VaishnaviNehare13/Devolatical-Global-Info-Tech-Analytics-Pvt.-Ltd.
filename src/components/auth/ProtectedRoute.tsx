import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingLayout } from '../layout/LoadingLayout';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Route guard enforcing authentication and role-based access control.
 * Displays LoadingLayout during auth initialization to eliminate route flicker.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is resolving from storage/refresh token
  if (isLoading) {
    return <LoadingLayout />;
  }

  // Redirect unauthenticated visitors to login page preserving attempted destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verify role requirements if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = hasAnyRole(allowedRoles);
    if (!isAuthorized) {
      return <Navigate to="/404" replace />;
    }
  }

  // Render children or nested router outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
