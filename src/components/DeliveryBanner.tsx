
import React from 'react';
import { useTranslation } from 'react-i18next';

type DeliveryBannerProps = {
  threshold: number;
};

const DeliveryBanner: React.FC<DeliveryBannerProps> = ({ threshold }) => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
      <div className="flex items-center px-2 py-3 bg-emerald-50 rounded-full text-emerald-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        <span className="text-sm font-medium">{t('menu.freeDeliveryAbove')}</span>
        <span className="text-sm ml-1">R$ {threshold.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default DeliveryBanner;
