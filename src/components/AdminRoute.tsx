
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import AdminSidebar from './AdminSidebar';

const AdminRoute = () => {
  const { currentUser, isAdmin, loading } = useUser();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login de admin se não estiver logado
  if (!currentUser) {
    return <Navigate to="/admin-login" replace />;
  }

  // Redirecionar para login de admin se não for admin
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
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
