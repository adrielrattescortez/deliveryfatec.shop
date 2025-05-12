
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import CustomerSidebar from './CustomerSidebar';
import Header from './Header';
import { useStore } from '@/contexts/StoreContext';

const CustomerRoute = () => {
  const { currentUser } = useUser();
  const { storeInfo } = useStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header restaurantName={storeInfo.name} showSearch={false} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <CustomerSidebar />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRoute;
