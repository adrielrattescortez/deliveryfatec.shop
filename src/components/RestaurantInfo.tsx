
import React from 'react';

type RestaurantInfoProps = {
  name: string;
  cuisine: string;
  distance: string;
  minOrder: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: string;
};

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  name,
  cuisine,
  distance,
  minOrder,
  rating,
  reviews,
  deliveryTime,
  deliveryFee,
}) => {
  return (
    <div className="pt-12 pb-4 px-4">
      <h1 className="text-xl font-bold text-center mb-1">{name}</h1>
      <p className="text-sm text-gray-500 text-center mb-3">{cuisine} ({distance})</p>
      <p className="text-sm text-gray-500 text-center">Min R$ {minOrder}</p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-3 py-4 border-b">
          <div className="flex items-center">
            <span className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="font-semibold">{rating}</span>
            </span>
            <span className="text-sm text-gray-500 ml-1">({reviews} avaliações)</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>

        <div className="flex justify-between px-3 py-4">
          <div>
            <p className="text-gray-700">Padrão</p>
            <p className="text-sm text-gray-500">{deliveryTime}</p>
          </div>
          <p className="text-gray-700">R$ {deliveryFee}</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;
