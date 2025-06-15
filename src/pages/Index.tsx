import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RestaurantHero from '@/components/RestaurantHero';
import RestaurantInfo from '@/components/RestaurantInfo';
import FeaturedItems from '@/components/FeaturedItems';
import MenuTabs from '@/components/MenuTabs';
import MenuItem from '@/components/MenuItem';
import DeliveryBanner from '@/components/DeliveryBanner';
import type { FoodItem } from '@/components/FeaturedItems';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';

// Export the FOOD_ITEMS array so it can be imported in other files
export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "1",
    name: "Esfiha de Carne",
    description: "Deliciosa esfiha de carne temperada com especiarias árabes",
    price: 7.99,
    image: "https://source.unsplash.com/featured/?esfiha,meat",
    popular: true,
    category: "Esfihas"
  },
  {
    id: "2",
    name: "Esfiha de Queijo",
    description: "Esfiha recheada com queijo especial derretido",
    price: 7.50,
    image: "https://source.unsplash.com/featured/?esfiha,cheese",
    popular: true,
    category: "Esfihas"
  },
  {
    id: "3",
    name: "Kibe Frito",
    description: "Kibe tradicional frito, crocante por fora e suculento por dentro",
    price: 8.99,
    image: "https://source.unsplash.com/featured/?kibe,arabic",
    popular: true,
    category: "Kibes"
  }
];

const Index = () => {
  const { storeInfo } = useStore();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryItems, setCategoryItems] = useState<{[key: string]: FoodItem[]}>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Buscar produtos e categorias do Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        console.log("[Index] Buscando categorias do Supabase...");
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (categoriesError) {
          console.error("[Index] Erro ao buscar categorias:", categoriesError);
          setLoadError("Erro ao carregar categorias: " + categoriesError.message);
          setCategories([]);
          setCategoryItems({});
          setFoodItems([]);
          return;
        }

        if (!categoriesData || categoriesData.length === 0) {
          console.warn("[Index] Nenhuma categoria cadastrada.");
          setCategories([]);
          setCategoryItems({});
          setLoadError("Nenhuma categoria cadastrada no sistema.");
          setFoodItems([]);
          setIsLoading(false);
          return;
        }

        console.log("[Index] Categorias encontradas:", categoriesData);

        // Buscar produtos com nomes de categorias
        console.log("[Index] Buscando produtos do Supabase...");
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (name)
          `)
          .order('name', { ascending: true });

        if (productsError) {
          console.error("[Index] Erro ao buscar produtos:", productsError);
          setLoadError("Erro ao carregar produtos: " + productsError.message);
          setFoodItems([]);
          return;
        }

        if (!productsData || productsData.length === 0) {
          console.warn("[Index] Nenhum produto cadastrado.");
          setFoodItems([]);
          setLoadError("Nenhum produto cadastrado no sistema.");
          setIsLoading(false);
          return;
        }

        console.log("[Index] Produtos encontrados:", productsData);

        // Mapear produtos para o formato FoodItem
        const formattedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          price: Number(product.price),
          image: product.image_url || "https://source.unsplash.com/featured/?food",
          popular: product.popular || false,
          vegetarian: product.vegetarian || false,
          category: product.categories?.name || "Sem categoria"
        }));

        // Filtrar produtos populares para destaques
        const popularProducts = formattedProducts.filter(item => item.popular);
        setFoodItems(popularProducts.length > 0 ? popularProducts : formattedProducts.slice(0, 3));

        // Organizar produtos por categoria
        const categoryNames = categoriesData.map(cat => cat.name);
        const productsByCategory: {[key: string]: FoodItem[]} = {};

        categoryNames.forEach(catName => {
          productsByCategory[catName] = formattedProducts.filter(
            product => product.category === catName
          );
        });

        setCategories(categoryNames);
        setCategoryItems(productsByCategory);

        // Definir a primeira categoria como ativa, se existir
        if (categoryNames.length > 0 && !activeTab) {
          setActiveTab(categoryNames[0]);
        }

      } catch (error: any) {
        console.error("[Index] Erro inesperado ao buscar dados:", error);
        setLoadError("Erro inesperado: " + (typeof error === "string" ? error : error.message));
        setFoodItems([]);
        setCategories([]);
        setCategoryItems({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        restaurantName={storeInfo.name}
        showSearch={true}
      />

      <RestaurantHero 
        coverImage={storeInfo.banner}
        logo={storeInfo.logo}
      />

      <div className="bg-white pt-8">
        {/* Logo redondo posicionado acima do RestaurantInfo */}
        <div className="flex justify-center pb-6">
          <div className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full shadow-xl flex items-center justify-center overflow-hidden">
            <img 
              src={storeInfo.logo} 
              alt="Restaurant logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <RestaurantInfo
          name={storeInfo.name}
          cuisine={storeInfo.cuisineType}
          distance="2,0 km"
          minOrder={storeInfo.minOrder.toFixed(2).replace('.', ',')}
          rating={4.8}
          reviews={1400}
          deliveryTime="55-65 min"
          deliveryFee={storeInfo.deliveryFee.toFixed(2).replace('.', ',')}
        />
      </div>
      
      <div className="h-2 bg-gray-50"></div>
      
      <div className="bg-white">
        {isLoading ? (
          <div className="p-8 text-center">Carregando produtos...</div>
        ) : loadError ? (
          <div className="p-8 text-center text-red-600">
            {loadError}
          </div>
        ) : (
          <FeaturedItems title="Destaques" items={foodItems} />
        )}
      </div>
      
      <div className="h-2 bg-gray-50"></div>
      
      <div className="bg-white">
        {isLoading ? (
          <div className="p-8 text-center">Carregando categorias...</div>
        ) : loadError ? (
          <div className="p-8 text-center text-red-600">
            {loadError}
          </div>
        ) : categories.length > 0 ? (
          <>
            <MenuTabs 
              tabs={categories} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
              <div className="space-y-4">
                {categoryItems[activeTab]?.length > 0 ? (
                  categoryItems[activeTab]?.map(item => (
                    <MenuItem key={item.id} item={item} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum produto encontrado nesta categoria.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nenhuma categoria disponível no momento.
          </div>
        )}
      </div>
      
      <DeliveryBanner threshold={60} />
    </div>
  );
};

export default Index;
