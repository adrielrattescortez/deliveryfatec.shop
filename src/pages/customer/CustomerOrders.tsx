import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const CustomerOrders = () => {
  const { currentUser } = useUser();
  const { t } = useTranslation();
  const { storeInfo } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusMap = {
    pending: { label: t('customer.orders.statuses.pending'), color: 'bg-yellow-500' },
    processing: { label: t('customer.orders.statuses.preparing'), color: 'bg-amber-500' },
    delivering: { label: t('customer.orders.statuses.out_for_delivery'), color: 'bg-blue-500' },
    delivered: { label: t('customer.orders.statuses.delivered'), color: 'bg-green-500' },
    cancelled: { label: t('customer.orders.statuses.cancelled'), color: 'bg-red-500' },
    awaiting_payment: { label: t('customer.orders.statuses.awaiting_payment'), color: 'bg-purple-500' }
  };
  
  useEffect(() => {
    if (currentUser?.id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [currentUser]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };
  
  const viewOrderDetails = (order) => {
    // Corrigir: garantir compatibilidade com campos snake_case/camelCase nos itens
    const parsedItems = typeof order.items === 'string'
      ? JSON.parse(order.items)
      : order.items;

    const parsedAddress = typeof order.address === 'string'
      ? JSON.parse(order.address)
      : order.address;

    // Calcular subtotal caso não venha do backend
    let subtotal = 0;
    if (Array.isArray(parsedItems)) {
      subtotal = parsedItems.reduce(
        (sum, i) =>
          sum + (typeof i.total_price === 'number'
            ? i.total_price
            : (i.unit_price || 0) * (i.quantity || 1)),
        0
      );
    }

    setSelectedOrder({
      ...order,
      items: parsedItems,
      address: parsedAddress,
      subtotal,
    });
    setIsDetailsOpen(true);
  };
  
  const checkPaymentStatus = async (paymentIntentId) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { paymentIntentId }
      });
      
      if (error) throw error;
      
      if (data.status !== 'awaiting_payment') {
        fetchOrders(); // Atualizar lista de pedidos
      }
      
      return data.status;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      return null;
    }
  };
  
  const handleCompletePayment = async (order) => {
    if (order.payment_intent_id) {
      const stripeUrl = `https://checkout.stripe.com/pay/${order.payment_intent_id}`;
      window.open(stripeUrl, '_blank');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('customer.orders.title')}</h1>
        <p className="text-gray-500">{t('customer.myOrders')}</p>
      </div>
      
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => {
            const orderItems = typeof order.items === 'string' 
              ? JSON.parse(order.items) 
              : order.items;
            
            const status = order.status || 'pending';
            
            return (
              <Card key={order.id} className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{t('customer.orders.orderNumber')} #{order.id.slice(0, 8)}</h3>
                      <Badge 
                        variant="default" 
                        className={`${statusMap[status]?.color || 'bg-gray-500'} hover:${statusMap[status]?.color || 'bg-gray-500'}`}
                      >
                        {statusMap[status]?.label || t('customer.orders.status')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t('cart.total')}</p>
                    <p className="font-semibold">{formatCurrency(order.total, storeInfo.currency ?? 'EUR')}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-2">{t('customer.orders.orderItems')}</h4>
                  <ul className="space-y-1">
                    {orderItems.slice(0, 3).map((item, index) => (
                      <li key={index} className="text-sm flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                      </li>
                    ))}
                    {orderItems.length > 3 && (
                      <li className="text-sm text-gray-500">
                        {t('customer.orders.andMore', { count: orderItems.length - 3 })}
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                  {order.status === 'awaiting_payment' && (
                    <Button 
                      variant="default"
                      className="w-full sm:w-auto"
                      onClick={() => handleCompletePayment(order)}
                    >
                      {t('customer.orders.completePayment')}
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => viewOrderDetails(order)}
                  >
                    {t('customer.orders.viewDetails')}
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">{t('customer.orders.noOrders')}</p>
          </Card>
        )}
      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6 p-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold">{t('customer.orders.orderNumber')} #{selectedOrder.id.slice(0, 8)}</h2>
                  <p className="text-sm text-gray-500">{t('customer.orders.createdAt')} {formatDate(selectedOrder.created_at)}</p>
                </div>
                <Badge 
                  variant="default" 
                  className={`${statusMap[selectedOrder.status]?.color || 'bg-gray-500'} hover:${statusMap[selectedOrder.status]?.color || 'bg-gray-500'}`}
                >
                  {statusMap[selectedOrder.status]?.label || t('customer.orders.status')}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">{t('customer.orders.deliveryAddress')}</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedOrder.address && (
                    <>
                      <p>{selectedOrder.address.street}, {selectedOrder.address.number}</p>
                      <p>{selectedOrder.address.neighborhood}</p>
                      <p>{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                      <p>{t('checkout.zipCode')}: {selectedOrder.address.zipCode}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">{t('customer.orders.orderItems')}</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        <span>{formatCurrency(item.total_price ? item.total_price : (item.unit_price * item.quantity), storeInfo.currency ?? 'EUR')}</span>
                      </div>
                      {item.selected_options && Object.entries(item.selected_options).length > 0 && (
                        <div className="mt-1 text-sm text-gray-600">
                          {Object.entries(item.selected_options).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatCurrency(selectedOrder.subtotal, storeInfo.currency ?? 'EUR')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>{t('cart.deliveryFee')}</span>
                  <span>{formatCurrency(selectedOrder.delivery_fee, storeInfo.currency ?? 'EUR')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>{formatCurrency(selectedOrder.total, storeInfo.currency ?? 'EUR')}</span>
                </div>
              </div>
              
              {selectedOrder.status === 'awaiting_payment' && (
                <div className="border-t pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleCompletePayment(selectedOrder)}
                  >
                    {t('customer.orders.completePayment')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerOrders;
