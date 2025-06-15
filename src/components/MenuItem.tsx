
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import type { FoodItem } from '@/types/product';

type MenuItemProps = {
  item: FoodItem;
  featured?: boolean;
  hideImage?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ item, featured = false, hideImage = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [hasOptions, setHasOptions] = useState(false);
  
  useEffect(() => {
    const checkProductOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('product_options')
          .select('id')
          .eq('product_id', item.id)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setHasOptions(true);
        }
      } catch (error) {
        console.error('Error checking product options:', error);
      }
    };
    
    checkProductOptions();
  }, [item.id]);
  
  const handleClick = () => {
    navigate(`/product/${item.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Se o produto tem opções, redirecionar para página de detalhes
    if (hasOptions) {
      navigate(`/product/${item.id}`);
      return;
    }
    
    addToCart({
      id: `${item.id}-${Date.now()}`,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      selectedOptions: {},
      totalPrice: item.price,
    });
  };
  
  return (
    <div 
      className="flex gap-3 items-center hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1">
        {featured && item.popular && (
          <div className="mb-1">
            <span className="bg-amber-50 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-sm">
              🔥 Mais pedido
            </span>
          </div>
        )}
        
        <h3 className="font-medium">{item.name}</h3>
        {item.description && (
          <p className={`text-sm text-gray-500 mt-1 ${hasOptions ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {item.description}
          </p>
        )}
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            {item.vegetarian && (
              <span className="text-gray-600 mr-2">
                ⚫
              </span>
            )}
            <p className="text-sm">
              {hasOptions ? (
                <span>a partir de R$ {item.price.toFixed(2)}</span>
              ) : (
                <span>R$ {item.price.toFixed(2)}</span>
              )}
            </p>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{hasOptions ? "Ver opções" : "Adicionar"}</span>
          </Button>
        </div>
      </div>
      {/* Só mostra a imagem se não estiver oculto */}
      {!hideImage && (
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default MenuItem;
