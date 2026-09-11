import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProtectedRoutedAdmin = () => {
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch (error) { user = null; }

  if (!token) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    toast.error('Admin access required');
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutedAdmin;
