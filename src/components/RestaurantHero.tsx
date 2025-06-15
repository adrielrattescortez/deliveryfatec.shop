
import React from 'react';

type RestaurantHeroProps = {
  coverImage: string;
  logo: string;
};

const RestaurantHero: React.FC<RestaurantHeroProps> = ({ coverImage, logo }) => {
  return (
    <div className="relative h-56 md:h-80 bg-gray-300 rounded-b-3xl overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
      </div>
      
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        
        <button className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RestaurantHero;
