import React, { useState } from 'react';
import Header from '@/components/Header';
import RestaurantHero from '@/components/RestaurantHero';
import RestaurantInfo from '@/components/RestaurantInfo';
import FeaturedItems from '@/components/FeaturedItems';
import MenuTabs from '@/components/MenuTabs';
import MenuItem from '@/components/MenuItem';
import DeliveryBanner from '@/components/DeliveryBanner';
import type { FoodItem } from '@/components/FeaturedItems';

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: 'Esfiha de Carne',
    price: 7.95,
    image: 'https://source.unsplash.com/featured/?arabian,meat,food',
    popular: true,
  },
  {
    id: '2',
    name: 'Esfiha de Mussarela',
    description: 'Esfiha especial recheada com queijo mussarela de alta qualidade',
    price: 10.75,
    image: 'https://source.unsplash.com/featured/?cheese,food',
  },
  {
    id: '3',
    name: 'Esfiha de Frango',
    price: 10.75,
    image: 'https://source.unsplash.com/featured/?chicken,food',
  }
];

export const MENU_CATEGORIES: { [key: string]: FoodItem[] } = {
  "Combos": [
    {
      id: '4',
      name: 'Combo 2 + Coca 350ml',
      description: '1 Esfiha de Carne 1 Esfiha de Mussarela',
      price: 35.90,
      image: 'https://source.unsplash.com/featured/?combo,food',
    },
    {
      id: '5',
      name: 'Combo 3 + Coca 350ml',
      description: '1 Esfiha Aberta de Carne 1 Esfiha de Mussarela',
      price: 35.90,
      image: 'https://source.unsplash.com/featured/?meal,food',
    },
    {
      id: '6',
      name: 'Kit Familia + Laranja 1L',
      description: 'Delicie-se com o nosso Kit Família, uma seleção especial',
      price: 90.90,
      image: 'https://source.unsplash.com/featured/?family,meal',
    },
    {
      id: '7',
      name: 'Combo 2 Plus + Coca 600ml',
      description: '2 esfihas de carne 2 esfihas de mussarela',
      price: 66.70,
      image: 'https://source.unsplash.com/featured/?combo,meal',
    }
  ],
  "Esfihas Especiais": [
    {
      id: '8',
      name: 'X- Carne com coalhada',
      price: 14.20,
      image: 'https://source.unsplash.com/featured/?arabian,food',
    },
    {
      id: '9',
      name: 'X- Milho',
      description: 'Deliciosa esfiha com Catupiry de alta qualidade, de sabor e textura',
      price: 12.40,
      image: 'https://source.unsplash.com/featured/?corn,food',
    },
    {
      id: '10',
      name: 'Abobrinha c/ mussarela e zaatar',
      description: 'Vegetariano 110g',
      price: 14.90,
      image: 'https://source.unsplash.com/featured/?vegetarian,food',
      vegetarian: true,
    },
    {
      id: '11',
      name: 'Rúcula c/Tomate Seco',
      description: 'A Esfiha de Rúcula, um item exuberante de nossa categoria (aprox.110g)',
      price: 15.90,
      image: 'https://source.unsplash.com/featured/?arugula,food',
      vegetarian: true,
    }
  ],
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("Combos");
  const menuTabs = Object.keys(MENU_CATEGORIES);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        restaurantName="Casa da Esfiha - Culinária Árabe"
        showSearch={true}
      />
      
      <RestaurantHero 
        coverImage="https://source.unsplash.com/featured/?arabian,restaurant"
        logo="/lovable-uploads/9aa20d70-4f30-4ab3-a534-a41b217aab7a.png"
      />
      
      <div className="bg-white">
        <RestaurantInfo
          name="Casa da Esfiha - Culinária Árabe"
          cuisine="Culinária Árabe"
          distance="2,0 km"
          minOrder="25,00"
          rating={4.8}
          reviews={1400}
          deliveryTime="55-65 min"
          deliveryFee="10,99"
        />
      </div>
      
      <div className="h-2 bg-gray-50"></div>
      
      <div className="bg-white">
        <FeaturedItems title="Destaques" items={FOOD_ITEMS} />
      </div>
      
      <div className="h-2 bg-gray-50"></div>
      
      <div className="bg-white">
        <MenuTabs 
          tabs={menuTabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
          <div className="space-y-4">
            {MENU_CATEGORIES[activeTab].map(item => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
      
      <DeliveryBanner threshold={60} />
    </div>
  );
};

export default Index;
