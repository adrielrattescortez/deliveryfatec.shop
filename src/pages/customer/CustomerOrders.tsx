
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const statusMap = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  processing: { label: 'Em preparação', color: 'bg-amber-500' },
  delivering: { label: 'Em entrega', color: 'bg-blue-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
  awaiting_payment: { label: 'Aguardando pagamento', color: 'bg-purple-500' }
};

const CustomerOrders = () => {
  const { currentUser } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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
    const parsedItems = typeof order.items === 'string' 
      ? JSON.parse(order.items) 
      : order.items;
    
    const parsedAddress = typeof order.address === 'string' 
      ? JSON.parse(order.address) 
      : order.address;
    
    setSelectedOrder({
      ...order,
      items: parsedItems,
      address: parsedAddress
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
        <h1 className="text-2xl font-bold mb-1">Meus Pedidos</h1>
        <p className="text-gray-500">Acompanhe seus pedidos e histórico</p>
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
                      <h3 className="font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
                      <Badge 
                        variant="default" 
                        className={`${statusMap[status]?.color || 'bg-gray-500'} hover:${statusMap[status]?.color || 'bg-gray-500'}`}
                      >
                        {statusMap[status]?.label || 'Status desconhecido'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Realizado em {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-2">Itens do pedido:</h4>
                  <ul className="space-y-1">
                    {orderItems.slice(0, 3).map((item, index) => (
                      <li key={index} className="text-sm flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                      </li>
                    ))}
                    {orderItems.length > 3 && (
                      <li className="text-sm text-gray-500">
                        ...e {orderItems.length - 3} mais
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  {order.status === 'awaiting_payment' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleCompletePayment(order)}
                    >
                      Completar Pagamento
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewOrderDetails(order)}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Você ainda não fez nenhum pedido</p>
          </Card>
        )}
      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6 p-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold">Pedido #{selectedOrder.id.slice(0, 8)}</h2>
                  <p className="text-sm text-gray-500">Realizado em {formatDate(selectedOrder.created_at)}</p>
                </div>
                <Badge 
                  variant="default" 
                  className={`${statusMap[selectedOrder.status]?.color || 'bg-gray-500'} hover:${statusMap[selectedOrder.status]?.color || 'bg-gray-500'}`}
                >
                  {statusMap[selectedOrder.status]?.label || 'Status desconhecido'}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Endereço de Entrega</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedOrder.address && (
                    <>
                      <p>{selectedOrder.address.street}, {selectedOrder.address.number}</p>
                      <p>{selectedOrder.address.neighborhood}</p>
                      <p>{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                      <p>{selectedOrder.address.zipCode}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Itens do Pedido</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        <span>R$ {item.total_price ? item.total_price.toFixed(2) : (item.unit_price * item.quantity).toFixed(2)}</span>
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
                  <span>Subtotal</span>
                  <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Taxa de Entrega</span>
                  <span>R$ {selectedOrder.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              
              {selectedOrder.status === 'awaiting_payment' && (
                <div className="border-t pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleCompletePayment(selectedOrder)}
                  >
                    Completar Pagamento
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
