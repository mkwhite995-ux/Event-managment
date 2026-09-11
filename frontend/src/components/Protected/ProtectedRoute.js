import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch (error) { user = null; }
  const location = useLocation();

  if (!token || !user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    toast.error('You are not authorized to access this page');
    return <Navigate to="/events" replace />;
  }

  // Allow access to protected routes
  return <Outlet />;
};

export default ProtectedRoute;
