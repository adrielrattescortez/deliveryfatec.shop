
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CartItem } from '@/types/product';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Salvar carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
      try {
        // Verifica se o item já existe com as mesmas opções selecionadas
        const existingItemIndex = prevItems.findIndex(
          item => item.productId === newItem.productId && 
                JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
        );
        
        if (existingItemIndex >= 0) {
          // Se o item já existe, apenas atualize a quantidade
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          updatedItems[existingItemIndex].totalPrice = 
            updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
          
          toast.success('Item adicionado ao carrinho!');
          return updatedItems;
        } else {
          // Caso contrário, adicione um novo item
          toast.success('Item adicionado ao carrinho!');
          return [...prevItems, { ...newItem, id: `${newItem.productId}-${Date.now()}` }];
        }
      } catch (error) {
        console.error("Error adding item to cart:", error);
        toast.error('Erro ao adicionar item ao carrinho.');
        return prevItems;
      }
    });
  };

  const removeFromCart = (id: string) => {
    try {
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      toast.info('Item removido do carrinho');
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error('Erro ao remover item do carrinho.');
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    try {
      if (quantity < 1) return;
      
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, quantity, totalPrice: item.price * quantity } 
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error('Erro ao atualizar quantidade do item.');
    }
  };

  const clearCart = () => {
    try {
      setCartItems([]);
      toast.info('Carrinho esvaziado');
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error('Erro ao limpar o carrinho.');
    }
  };

  const getCartTotal = (): number => {
    try {
      return cartItems.reduce((total, item) => total + item.totalPrice, 0);
    } catch (error) {
      console.error("Error calculating cart total:", error);
      return 0;
    }
  };

  const getItemsCount = (): number => {
    try {
      return cartItems.reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      console.error("Error calculating items count:", error);
      return 0;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal,
      getItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
