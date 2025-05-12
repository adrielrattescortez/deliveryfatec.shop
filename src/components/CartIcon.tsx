
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

const CartIcon = () => {
  const { getItemsCount } = useCart();
  const itemsCount = getItemsCount();

  return (
    <Link to="/cart" className="relative">
      <ShoppingCart className="h-6 w-6" />
      {itemsCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
          {itemsCount}
        </Badge>
      )}
    </Link>
  );
};

export default CartIcon;
