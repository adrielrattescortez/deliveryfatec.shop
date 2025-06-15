
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
      className="flex gap-3 items-center hover:bg-gray-50 p-3 rounded-2xl transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1 flex flex-col justify-between min-h-[135px]">
        {featured && item.popular && (
          <div className="mb-1">
            <span className="bg-amber-50 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-sm">
              🔥 Mais pedido
            </span>
          </div>
        )}

        <h3 className="font-medium text-lg">{item.name}</h3>

        {item.description && (
          <p className={`text-sm text-gray-500 mt-1 mb-2 ${hasOptions ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {item.description}
          </p>
        )}

        {/* PREÇO bem destacado */}
        <div className="mb-2 flex flex-col items-start w-full">
          {hasOptions ? (
            <span className="text-xl font-bold text-green-600 mb-1 block">
              a partir de R$ {item.price.toFixed(2)}
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-900 mb-1 block">
              R$ {item.price.toFixed(2)}
            </span>
          )}

          {/* BOTÃO destacado vermelho, grande, sempre abaixo do preço */}
          <Button
            size="lg"
            variant="default"
            className={`flex items-center gap-2 rounded-xl w-full mt-2 font-bold text-base justify-center
              bg-primary text-white hover:bg-primary/90 shadow-sm py-3
              transition-all duration-150
            `}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{hasOptions ? "Ver opções" : "Adicionar"}</span>
          </Button>
        </div>

        {item.vegetarian && (
          <div className="mb-1">
            <span className="text-green-700">⚫</span>
          </div>
        )}
      </div>

      {!hideImage && (
        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100">
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

