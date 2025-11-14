
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Users, ArrowDown, ArrowUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { storeInfo } = useStore();
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const { count: oCount } = await supabase.from('orders').select('id', { count: 'exact', head: true });
      setOrdersCount(typeof oCount === 'number' ? oCount : null);
      const { count: pCount } = await supabase.from('products').select('id', { count: 'exact', head: true });
      setProductsCount(typeof pCount === 'number' ? pCount : null);
      const { data: recent } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(4);
      setRecentOrders(recent || []);
    };
    fetchDashboard();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('admin.dashboard')}</h1>
        <p className="text-gray-500">{t('admin.welcome')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">12%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">{ordersCount ?? '—'}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('admin.totalOrders')}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">4%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">{productsCount ?? '—'}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('admin.products')}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex items-center text-red-500">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">2%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">—</h3>
            <p className="text-sm text-gray-500 mt-1">{t('admin.products')}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">18%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">{formatCurrency(recentOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0), storeInfo.currency ?? 'EUR')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('admin.totalRevenue')}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('admin.recentOrders')}</h3>
          
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center text-gray-500">Nenhum dado disponível</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{t('customer.orders.orderNumber')} #{order.id.slice(0,8)}</p>
                    <p className="text-sm text-gray-500">{format(parseISO(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total != null ? formatCurrency(Number(order.total) || 0, storeInfo.currency ?? 'EUR') : '—'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{t('menu.featured')}</h3>
          <div className="text-center text-gray-500">Nenhum dado disponível</div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
