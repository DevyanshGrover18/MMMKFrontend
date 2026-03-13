import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAdminAuthContext } from '../../context/AdminAuthProvider';

const useAuth = () => {
  const { token } = localStorage.getItem('adminAuthToken')
    ? JSON.parse(localStorage.getItem('adminAuthToken'))
    : {};

  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem('adminAuthToken');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
