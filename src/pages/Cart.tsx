
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';

const Cart = () => {
  const navigate = useNavigate();
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
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Adicione itens para continuar comprando</p>
            <Button asChild>
              <Link to="/">Voltar para o cardápio</Link>
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
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-700 font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 border-b last:border-b-0">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      
                      {Object.entries(item.selectedOptions).map(([optionId, variationIds]) => (
                        <div key={optionId} className="text-sm text-gray-500 mb-1">
                          {variationIds.map(variationId => (
                            <span key={variationId} className="mr-2">
                              • {variationId.split('-')[0]}
                            </span>
                          ))}
                        </div>
                      ))}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <div className="px-3 py-1 border-x">
                            {item.quantity}
                          </div>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            R$ {item.totalPrice.toFixed(2)}
                          </span>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={clearCart} 
                className="text-sm"
              >
                Limpar carrinho
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
            <h3 className="text-lg font-semibold mb-4">Resumo do pedido</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de entrega</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handleCheckout}
            >
              Finalizar Pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
