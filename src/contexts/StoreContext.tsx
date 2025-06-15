
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

  useEffect(() => {
    refreshStoreInfo();
    // eslint-disable-next-line
  }, []);

  const refreshStoreInfo = async () => {
    setLoading(true);
    try {
      // Buscar da tabela corretamente, usando snake_case
      const { data, error } = await supabase
        .from('store_info')
        .select('*')
        .eq('id', 1)
        .maybeSingle(); // garante retorno nulo em vez de erro se não encontrar

      if (data) {
        setStoreInfo({
          name: data.name || "",
          description: data.description || "",
          logo: data.logo || "",
          banner: data.banner || "",
          deliveryFee: Number(data.delivery_fee) || 0,
          minOrder: Number(data.min_order) || 0,
          cuisineType: data.cuisine_type || ""
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

  const updateStoreInfo = async (info: Partial<StoreInfo>) => {
    setLoading(true);
    try {
      // Mapear os campos para snake_case antes de enviar para o Supabase
      const mappedInfo: any = {};
      if (info.name !== undefined) mappedInfo.name = info.name;
      if (info.description !== undefined) mappedInfo.description = info.description;
      if (info.logo !== undefined) mappedInfo.logo = info.logo;
      if (info.banner !== undefined) mappedInfo.banner = info.banner;
      if (info.deliveryFee !== undefined) mappedInfo.delivery_fee = info.deliveryFee;
      if (info.minOrder !== undefined) mappedInfo.min_order = info.minOrder;
      if (info.cuisineType !== undefined) mappedInfo.cuisine_type = info.cuisineType;

      const { error } = await supabase
        .from('store_info')
        .update(mappedInfo)
        .eq('id', 1);
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
