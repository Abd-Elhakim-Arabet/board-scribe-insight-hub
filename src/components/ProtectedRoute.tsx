import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/erasers" replace />;
  }

  return <>{children}</>;
};