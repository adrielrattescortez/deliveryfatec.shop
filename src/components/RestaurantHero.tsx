
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
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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

      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 md:-bottom-12">
        <div className="hero-logo w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-white p-1 shadow-xl border-4 border-white">
          <img 
            src={logo} 
            alt="Restaurant logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantHero;
