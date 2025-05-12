
import React from 'react';
import MenuItem from './MenuItem';

export type FoodItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  popular?: boolean;
  vegetarian?: boolean;
};

type FeaturedItemsProps = {
  title: string;
  items: FoodItem[];
};

const FeaturedItems: React.FC<FeaturedItemsProps> = ({ title, items }) => {
  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <div className="grid gap-4">
        {items.map(item => (
          <MenuItem key={item.id} item={item} featured />
        ))}
      </div>
    </div>
  );
};

export default FeaturedItems;
