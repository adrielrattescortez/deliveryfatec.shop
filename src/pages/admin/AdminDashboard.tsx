
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Users, ArrowDown, ArrowUp, Package } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  
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
            <h3 className="text-2xl font-bold">149</h3>
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
            <h3 className="text-2xl font-bold">57</h3>
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
            <h3 className="text-2xl font-bold">21</h3>
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
            <h3 className="text-2xl font-bold">R$ 7.890</h3>
            <p className="text-sm text-gray-500 mt-1">{t('admin.totalRevenue')}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{t('admin.recentOrders')}</h3>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{t('customer.orders.orderNumber')} #{1000 + index}</p>
                  <p className="text-sm text-gray-500">{t('admin.orders_page.customer')} {index === 1 ? 'novo' : 'recorrente'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ {(Math.random() * 100 + 20).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">há {index} hora{index > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{t('menu.featured')}</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-gray-100"></div>
                <p className="font-medium">Esfiha de Carne</p>
              </div>
              <p>243 vendas</p>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-gray-100"></div>
                <p className="font-medium">X- Carne com coalhada</p>
              </div>
              <p>187 vendas</p>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-gray-100"></div>
                <p className="font-medium">Kit Família</p>
              </div>
              <p>129 vendas</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-gray-100"></div>
                <p className="font-medium">Esfiha de Mussarela</p>
              </div>
              <p>98 vendas</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
