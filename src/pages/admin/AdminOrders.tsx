
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, PackageOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { OrderDB, OrderStatus, OrderItem } from '@/types/product';
import { format, parseISO } from 'date-fns';

const OrderStatusMap = {
  'pending': { label: 'Pendente', color: 'bg-yellow-500' },
  'processing': { label: 'Em preparação', color: 'bg-amber-500' },
  'delivering': { label: 'Em entrega', color: 'bg-blue-500' },
  'delivered': { label: 'Entregue', color: 'bg-green-500' },
  'cancelled': { label: 'Cancelado', color: 'bg-red-500' },
  'awaiting_payment': { label: 'Aguardando pagamento', color: 'bg-orange-500' }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDB | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles (
            name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }

      const processedOrders: OrderDB[] = (data || []).map(order => {
        const parsedItems = typeof order.items === 'string' 
          ? JSON.parse(order.items) 
          : (Array.isArray(order.items) ? order.items : []);
        
        const parsedAddress = typeof order.address === 'string' 
          ? JSON.parse(order.address) 
          : order.address;
        
        let profilesData = null;
        if (order.profiles && typeof order.profiles === 'object' && !('error' in order.profiles)) {
          profilesData = order.profiles;
        }

        return {
          id: order.id,
          user_id: order.user_id,
          items: parsedItems,
          status: order.status,
          total: order.total,
          delivery_fee: order.delivery_fee,
          address: parsedAddress,
          created_at: order.created_at || '',
          updated_at: order.updated_at || '',
          profiles: profilesData
        } as OrderDB;
      });
      
      setOrders(processedOrders);
    } catch (error: any) {
      toast.error(`Erro ao buscar pedidos: ${error.message}`);
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() } 
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
      
      toast.success('Status do pedido atualizado com sucesso');
    } catch (error: any) {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  };
  
  const viewOrderDetails = (order: OrderDB) => {
    const parsedOrder = {
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      address: typeof order.address === 'string' ? JSON.parse(order.address) : order.address
    };
    
    setSelectedOrder(parsedOrder);
    setIsDetailsOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error parsing date:', error);
      return dateString;
    }
  };
  
  const filteredOrders = orders;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Pedidos</h1>
        <p className="text-gray-500">Gerencie os pedidos da sua loja</p>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar por ID do pedido..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-[200px]">
            <Select 
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="awaiting_payment">Aguardando pagamento</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Em preparação</SelectItem>
                <SelectItem value="delivering">Em entrega</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center">Carregando pedidos...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-600">Nenhum pedido encontrado.</p>
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Tente outros filtros.' : 'Não existem pedidos registrados.'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium text-gray-500">Pedido</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                  <th className="text-left pb-3 font-medium text-gray-500 hidden md:table-cell">Data</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Total</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsArray = Array.isArray(order.items) ? order.items : [];
                  const customerName = order.profiles?.name || 
                    (order.address && typeof order.address === 'object' && 'customer_name' in order.address 
                      ? order.address.customer_name 
                      : 'Cliente não encontrado');
                  
                  return (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-500">{itemsArray.length} itens</p>
                        </div>
                      </td>
                      <td className="py-4">
                        {customerName}
                      </td>
                      <td className="py-4">
                        <Badge 
                          variant="default" 
                          className={`${OrderStatusMap[order.status as OrderStatus]?.color || 'bg-gray-500'} hover:${OrderStatusMap[order.status as OrderStatus]?.color || 'bg-gray-500'}`}
                        >
                          {OrderStatusMap[order.status as OrderStatus]?.label || 'Desconhecido'}
                        </Badge>
                      </td>
                      <td className="py-4 text-gray-600 hidden md:table-cell">
                        {order.created_at ? format(parseISO(order.created_at), 'dd/MM/yyyy HH:mm') : 'Data inválida'}
                      </td>
                      <td className="py-4 font-medium">
                        R$ {order.total.toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden md:inline">Ver detalhes</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      
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
                  className={`${OrderStatusMap[selectedOrder.status as OrderStatus]?.color || 'bg-gray-500'} hover:${OrderStatusMap[selectedOrder.status as OrderStatus]?.color || 'bg-gray-500'}`}
                >
                  {OrderStatusMap[selectedOrder.status as OrderStatus]?.label || 'Desconhecido'}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Cliente</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{selectedOrder.profiles?.name || 'Nome não disponível'}</p>
                  <p>{selectedOrder.profiles?.email || 'Email não disponível'}</p>
                  <p>{selectedOrder.profiles?.phone || 'Telefone não disponível'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Endereço de Entrega</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {typeof selectedOrder.address === 'object' && selectedOrder.address !== null ? (
                    <>
                      <p>{selectedOrder.address.street}, {selectedOrder.address.number}</p>
                      <p>{selectedOrder.address.neighborhood}</p>
                      <p>{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                      <p>{selectedOrder.address.zipCode}</p>
                    </>
                  ) : (
                    <p>Endereço não disponível</p>
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
                        <span>R$ {item.totalPrice.toFixed(2)}</span>
                      </div>
                      {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                        <div className="mt-1 text-sm text-gray-600">
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
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
                  <span>R$ {(selectedOrder.total - selectedOrder.delivery_fee).toFixed(2)}</span>
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
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Atualizar Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm"
                    variant={selectedOrder.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                    disabled={selectedOrder.status === 'pending'}
                  >
                    Pendente
                  </Button>
                  <Button 
                    size="sm"
                    variant={selectedOrder.status === 'processing' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                    disabled={selectedOrder.status === 'processing'}
                  >
                    Em Preparação
                  </Button>
                  <Button 
                    size="sm"
                    variant={selectedOrder.status === 'delivering' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivering')}
                    disabled={selectedOrder.status === 'delivering'}
                  >
                    Em Entrega
                  </Button>
                  <Button 
                    size="sm"
                    variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                  >
                    Entregue
                  </Button>
                  <Button 
                    size="sm"
                    variant={selectedOrder.status === 'cancelled' ? 'default' : 'outline'}
                    className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    disabled={selectedOrder.status === 'cancelled'}
                  >
                    Cancelado
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
