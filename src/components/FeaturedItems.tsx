
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
  category?: string;
};

type FeaturedItemsProps = {
  title: string;
  items: FoodItem[];
};

const FeaturedItems: React.FC<FeaturedItemsProps> = ({ title, items }) => {
  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-5">{title}</h2>
      <div className="featured-grid">
        {items.map(item => (
          <div className="rounded-2xl shadow-md bg-white p-4 flex gap-4 items-center md:items-stretch" key={item.id}>
            <img 
              src={item.image} 
              alt={item.name}
              className="featured-image w-24 h-24 md:w-36 md:h-36"
              loading="lazy"
            />
            <MenuItem item={item} featured />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedItems;
