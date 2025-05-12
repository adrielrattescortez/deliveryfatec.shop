
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import AdminSidebar from './AdminSidebar';

const AdminRoute = () => {
  const { currentUser, isAdmin } = useUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminRoute;
