
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
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Salvar carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
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
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.info('Item removido do carrinho');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity, totalPrice: item.price * quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Carrinho esvaziado');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
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
