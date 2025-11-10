
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useStore } from '@/contexts/StoreContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Package, 
  ListOrdered, 
  Settings, 
  Layers, 
  LogOut 
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

const AdminSidebar = () => {
  const { logout, currentUser } = useUser();
  const { storeInfo } = useStore();
  const { t } = useTranslation();

  return (
    <div className="w-64 bg-white min-h-screen shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center flex-1">
            <img
              src={storeInfo.logo}
              alt={storeInfo.name}
              className="h-12 w-12 object-contain"
            />
          </div>
          <LanguageSelector />
        </div>
        <h2 className="text-lg font-semibold text-center">{storeInfo.name}</h2>
        <p className="text-sm text-gray-500 text-center mt-1">{t('admin.dashboard')}</p>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Administrador</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          <NavLink 
            to="/admin" 
            end
            className={({isActive}) => 
              `flex items-center gap-3 p-3 rounded-md transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span>{t('admin.dashboard')}</span>
          </NavLink>
          
          <NavLink 
            to="/admin/products" 
            className={({isActive}) => 
              `flex items-center gap-3 p-3 rounded-md transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Package size={18} />
            <span>{t('admin.products')}</span>
          </NavLink>
          
          <NavLink 
            to="/admin/categories" 
            className={({isActive}) => 
              `flex items-center gap-3 p-3 rounded-md transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Layers size={18} />
            <span>{t('admin.categories')}</span>
          </NavLink>
          
          <NavLink 
            to="/admin/orders" 
            className={({isActive}) => 
              `flex items-center gap-3 p-3 rounded-md transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <ListOrdered size={18} />
            <span>{t('admin.orders')}</span>
          </NavLink>
          
          <NavLink 
            to="/admin/settings" 
            className={({isActive}) => 
              `flex items-center gap-3 p-3 rounded-md transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Settings size={18} />
            <span>{t('admin.settings')}</span>
          </NavLink>
          
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-all"
          >
            <LogOut size={18} />
            <span>{t('admin.logout')}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
