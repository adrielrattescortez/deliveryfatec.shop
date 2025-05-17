
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreInfo } from '@/types/product';

interface StoreContextType {
  storeInfo: StoreInfo;
  updateStoreInfo: (info: Partial<StoreInfo>) => void;
  refreshStoreInfo: () => void;
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
    try {
      const savedInfo = localStorage.getItem('storeInfo');
      return savedInfo ? JSON.parse(savedInfo) : defaultStoreInfo;
    } catch (error) {
      console.error("Erro ao carregar informações da loja do localStorage:", error);
      return defaultStoreInfo;
    }
  });

  // Salvar informações da loja no localStorage sempre que ela mudar
  useEffect(() => {
    try {
      localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    } catch (error) {
      console.error("Erro ao salvar informações da loja no localStorage:", error);
    }
  }, [storeInfo]);

  const updateStoreInfo = (info: Partial<StoreInfo>) => {
    setStoreInfo(prevInfo => {
      const updatedInfo = { ...prevInfo, ...info };
      try {
        localStorage.setItem('storeInfo', JSON.stringify(updatedInfo));
      } catch (error) {
        console.error("Erro ao salvar informações atualizadas da loja:", error);
      }
      return updatedInfo;
    });
  };

  const refreshStoreInfo = () => {
    try {
      const savedInfo = localStorage.getItem('storeInfo');
      if (savedInfo) {
        setStoreInfo(JSON.parse(savedInfo));
      }
    } catch (error) {
      console.error("Erro ao atualizar informações da loja do localStorage:", error);
    }
  };

  return (
    <StoreContext.Provider value={{ 
      storeInfo, 
      updateStoreInfo,
      refreshStoreInfo
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
