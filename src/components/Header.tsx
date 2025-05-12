
import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';

type HeaderProps = {
  restaurantName?: string;
  showSearch?: boolean;
  showBackButton?: boolean;
};

const Header: React.FC<HeaderProps> = ({ 
  restaurantName, 
  showSearch = true, 
  showBackButton = true 
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button className="p-2 rounded-full bg-gray-100">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
        
        {showSearch ? (
          <div className="flex-1 relative">
            <div className="bg-gray-100 rounded-full flex items-center pl-4 pr-2 py-2">
              <Search size={18} className="text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder={`Buscar em ${restaurantName || 'Restaurantes'}`}
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>
        ) : (
          <h1 className="text-lg font-medium">{restaurantName}</h1>
        )}
      </div>
    </div>
  );
};

export default Header;
