
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreInfo } from '@/types/product';

interface StoreContextType {
  storeInfo: StoreInfo;
  updateStoreInfo: (info: Partial<StoreInfo>) => void;
}

const defaultStoreInfo: StoreInfo = {
  name: "Casa da Esfiha - Culinária Árabe",
  description: "Os melhores sabores da culinária árabe, com qualidade e tradição",
  logo: "/lovable-uploads/9aa20d70-4f30-4ab3-a534-a41b217aab7a.png",
  banner: "https://source.unsplash.com/featured/?arabian,restaurant",
  deliveryFee: 10.99,
  minOrder: 25.00,
  cuisineType: "Culinária Árabe"
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const savedInfo = localStorage.getItem('storeInfo');
    return savedInfo ? JSON.parse(savedInfo) : defaultStoreInfo;
  });

  // Salvar informações da loja no localStorage sempre que ela mudar
  useEffect(() => {
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
  }, [storeInfo]);

  const updateStoreInfo = (info: Partial<StoreInfo>) => {
    setStoreInfo(prevInfo => ({ ...prevInfo, ...info }));
  };

  return (
    <StoreContext.Provider value={{ 
      storeInfo, 
      updateStoreInfo
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
