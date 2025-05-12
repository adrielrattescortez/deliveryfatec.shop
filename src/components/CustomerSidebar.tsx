
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { User, ShoppingBag, LogOut } from 'lucide-react';

const CustomerSidebar = () => {
  const { logout, currentUser } = useUser();

  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
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
          to="/customer" 
          end
          className={({isActive}) => 
            `flex items-center gap-3 p-3 rounded-md transition-all ${
              isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <User size={18} />
          <span>Minha Conta</span>
        </NavLink>
        
        <NavLink 
          to="/customer/orders" 
          className={({isActive}) => 
            `flex items-center gap-3 p-3 rounded-md transition-all ${
              isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <ShoppingBag size={18} />
          <span>Meus Pedidos</span>
        </NavLink>
        
        <NavLink 
          to="/customer/profile" 
          className={({isActive}) => 
            `flex items-center gap-3 p-3 rounded-md transition-all ${
              isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <User size={18} />
          <span>Editar Perfil</span>
        </NavLink>
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-all"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerSidebar;
