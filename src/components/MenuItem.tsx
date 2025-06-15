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

        {/* Destacado: PREÇO "a partir de" */}
        {hasOptions && (
          <div className="mb-2">
            <span className="text-xl font-bold text-green-600 block">
              a partir de R$ {item.price.toFixed(2)}
            </span>
          </div>
        )}

        {item.vegetarian && (
          <div className="mb-1">
            <span className="text-green-700">⚫</span>
          </div>
        )}

        {/* BOTÃO e preço normal */}
        <div className="flex items-end justify-between flex-1 mt-auto">
          {!hasOptions && (
            <p className="text-base font-semibold text-gray-900">R$ {item.price.toFixed(2)}</p>
          )}

          <Button
            size="lg"
            variant={hasOptions ? "default" : "outline"}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-base transition-all duration-150 
              ${hasOptions ? "bg-green-600 text-white hover:bg-green-700" : ""}
              shadow-sm`}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{hasOptions ? "Ver opções" : "Adicionar"}</span>
          </Button>
        </div>
      </div>

      {/* Só mostra a imagem se não estiver oculto */}
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
