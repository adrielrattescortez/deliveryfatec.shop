
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreInfo } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

interface StoreContextType {
  storeInfo: StoreInfo;
  updateStoreInfo: (info: Partial<StoreInfo>) => Promise<void>;
  refreshStoreInfo: () => Promise<void>;
  loading: boolean;
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
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);
  const [loading, setLoading] = useState(true);

  // Obtém storeInfo do Supabase ao iniciar
  useEffect(() => {
    refreshStoreInfo();
    // eslint-disable-next-line
  }, []);

  // Função para buscar storeInfo no Supabase
  const refreshStoreInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_info')
        .select('*')
        .limit(1)
        .single();
      if (data) {
        setStoreInfo({
          name: data.name,
          description: data.description,
          logo: data.logo,
          banner: data.banner,
          deliveryFee: Number(data.deliveryFee),
          minOrder: Number(data.minOrder),
          cuisineType: data.cuisineType
        });
      } else if (error) {
        console.error("Erro ao buscar informações da loja:", error);
        setStoreInfo(defaultStoreInfo);
      }
    } catch (err) {
      console.error("Erro ao buscar informações da loja:", err);
      setStoreInfo(defaultStoreInfo);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar no Supabase
  const updateStoreInfo = async (info: Partial<StoreInfo>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('store_info')
        .update(info)
        .eq('id', 1); // supondo apenas 1 registro na tabela
      if (error) throw error;
      await refreshStoreInfo();
    } catch (err) {
      console.error("Erro atualizando informações da loja:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreContext.Provider value={{ 
      storeInfo, 
      updateStoreInfo,
      refreshStoreInfo,
      loading
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
