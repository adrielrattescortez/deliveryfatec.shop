
import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import CartIcon from './CartIcon';

interface HeaderProps {
  restaurantName: string;
  showSearch?: boolean;
  rightContent?: React.ReactNode;
}

const Header = ({ restaurantName, showSearch = false, rightContent }: HeaderProps) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const { currentUser } = useUser();

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            {restaurantName}
          </Link>
          
          <div className="flex items-center gap-4">
            {showSearch && (
              <button onClick={toggleSearch}>
                <Search className="h-5 w-5" />
              </button>
            )}
            
            {rightContent || (
              <div className="flex items-center gap-4">
                <CartIcon />
                
                <Link to={currentUser ? (currentUser.role === 'admin' ? '/admin' : '/customer') : '/login'}>
                  <User className="h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {showSearch && searchVisible && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar produtos..."
                className="pl-10"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
