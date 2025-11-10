import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { storeInfo } = useStore();
  
  const subtotal = getCartTotal();
  const deliveryFee = storeInfo.deliveryFee;
  const total = subtotal + deliveryFee;
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header restaurantName={storeInfo.name} showSearch={false} />
        <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white mt-6 rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-20 w-20 text-gray-300 mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('cart.empty')}</h2>
            <p className="text-gray-500 mb-8 text-lg">{t('cart.continueShopping')}</p>
            <Button asChild className="big-btn">
              <Link to="/">{t('common.back')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header restaurantName={storeInfo.name} showSearch={false} />
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-7">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-700 font-medium hover:underline">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('common.back')}
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-7">{t('cart.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 md:p-6 border-b last:border-b-0 flex gap-4">
                  <div className="h-24 w-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 text-lg">{item.name}</h3>
                    {Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        <p>Opções selecionadas:</p>
                        {Object.entries(item.selectedOptions).map(([optionId, variationIds]) => (
                          <div key={optionId}>
                            {variationIds.map(variationId => (
                              <span key={variationId} className="mr-2">
                                • {variationId.includes('-') ? variationId.split('-')[1] || variationId : variationId}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-4 py-2 text-gray-600 text-xl"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="px-4 py-2 border-x font-bold text-lg">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-4 py-2 text-gray-600 text-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                          R$ {item.totalPrice.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remover item"
                        >
                          <Trash className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button variant="outline" onClick={clearCart} className="text-base">
                {t('cart.remove')}
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 h-fit">
            <h3 className="text-lg md:text-xl font-semibold mb-5">{t('checkout.orderSummary')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.deliveryFee')}</span>
                <span className="font-medium">R$ {deliveryFee.toFixed(2)}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('cart.total')}</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full big-btn mt-7" 
              size="lg"
              onClick={handleCheckout}
            >
              {t('cart.checkout')}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              {t('checkout.orderSummary')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
