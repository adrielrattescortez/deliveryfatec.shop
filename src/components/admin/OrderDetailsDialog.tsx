import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import { OrderDB, OrderStatus } from '@/types/product';
import { format, parseISO } from 'date-fns';

const OrderStatusMap = {
  'pending': { label: 'Pendente', color: 'bg-yellow-500' },
  'processing': { label: 'Em preparação', color: 'bg-amber-500' },
  'delivering': { label: 'Em entrega', color: 'bg-blue-500' },
  'delivered': { label: 'Entregue', color: 'bg-green-500' },
  'cancelled': { label: 'Cancelado', color: 'bg-red-500' },
  'awaiting_payment': { label: 'Aguardando pagamento', color: 'bg-orange-500' }
};

interface OrderDetailsDialogProps {
  order: OrderDB | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error parsing date:', error);
      return dateString;
    }
  };

  const handlePrint = () => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .section h3 { margin-bottom: 5px; color: #333; }
            .item { padding: 8px; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; }
            .status { 
              padding: 4px 8px; 
              border-radius: 4px; 
              background-color: #f0f0f0;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pedido #${order.id.slice(0, 8)}</h1>
            <p>Data: ${formatDate(order.created_at)}</p>
            <span class="status">Status: ${OrderStatusMap[order.status as OrderStatus]?.label || 'Desconhecido'}</span>
          </div>
          
          <div class="section">
            <h3>Cliente</h3>
            <p><strong>Nome:</strong> ${order.profiles?.name || 'Nome não disponível'}</p>
            <p><strong>Email:</strong> ${order.profiles?.email || 'Email não disponível'}</p>
            <p><strong>Telefone:</strong> ${order.profiles?.phone || 'Telefone não disponível'}</p>
          </div>
          
          <div class="section">
            <h3>Endereço de Entrega</h3>
            ${order.address && typeof order.address === 'object' ? `
              <p>${order.address.street || ''}, ${order.address.number || ''}</p>
              <p>${order.address.neighborhood || ''}</p>
              <p>${order.address.city || ''}, ${order.address.state || ''}</p>
              <p>CEP: ${order.address.zipCode || ''}</p>
            ` : '<p>Endereço não disponível</p>'}
          </div>
          
          <div class="section">
            <h3>Itens do Pedido</h3>
            ${Array.isArray(order.items) ? order.items.map(item => `
              <div class="item">
                <strong>${item.quantity}x ${item.name}</strong> - R$ ${item.totalPrice.toFixed(2)}
                ${item.selectedOptions && Object.entries(item.selectedOptions).length > 0 ? `
                  <br><small>${Object.entries(item.selectedOptions).map(([key, value]) => 
                    `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`
                  ).join(', ')}</small>
                ` : ''}
              </div>
            `).join('') : '<p>Nenhum item encontrado</p>'}
          </div>
          
          <div class="section">
            <p>Subtotal: R$ ${(order.total - order.delivery_fee).toFixed(2)}</p>
            <p>Taxa de Entrega: R$ ${order.delivery_fee.toFixed(2)}</p>
            <p class="total">Total: R$ ${order.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Pedido #{order.id.slice(0, 8)}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Realizado em {formatDate(order.created_at)}</p>
              {order.updated_at && order.updated_at !== order.created_at && (
                <p className="text-sm text-gray-500">Atualizado em {formatDate(order.updated_at)}</p>
              )}
            </div>
            <Badge 
              variant="default" 
              className={`${OrderStatusMap[order.status as OrderStatus]?.color || 'bg-gray-500'} hover:${OrderStatusMap[order.status as OrderStatus]?.color || 'bg-gray-500'}`}
            >
              {OrderStatusMap[order.status as OrderStatus]?.label || 'Desconhecido'}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Cliente</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{order.profiles?.name || 'Nome não disponível'}</p>
              <p>{order.profiles?.email || 'Email não disponível'}</p>
              <p>{order.profiles?.phone || 'Telefone não disponível'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Endereço de Entrega</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {order.address && typeof order.address === 'object' ? (
                <>
                  <p>{order.address.street || ''}, {order.address.number || ''}</p>
                  <p>{order.address.neighborhood || ''}</p>
                  <p>{order.address.city || ''}, {order.address.state || ''}</p>
                  <p>CEP: {order.address.zipCode || ''}</p>
                </>
              ) : (
                <p>Endereço não disponível</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Itens do Pedido</h3>
            <div className="space-y-2">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  // Compatibilidade para snake_case e camelCase
                  const total =
                    typeof item.totalPrice !== "undefined"
                      ? item.totalPrice
                      : (typeof item.total_price !== "undefined"
                        ? item.total_price
                        : 0);

                  // O mesmo para quantity, name, selectedOptions/selected_options
                  const quantity =
                    typeof item.quantity !== "undefined"
                      ? item.quantity
                      : (typeof item.quantity === "undefined" && typeof item.qtd !== "undefined" ? item.qtd : 1);
                  const name = item.name || item.product_name || 'Item';

                  // Opções customizadas
                  const selectedOptions =
                    item.selectedOptions ||
                    item.selected_options ||
                    {};

                  return (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {quantity}x {name}
                        </span>
                        <span>
                          R$ {Number(total).toFixed(2)}
                        </span>
                      </div>
                      {selectedOptions &&
                        Object.entries(selectedOptions).length > 0 && (
                          <div className="mt-1 text-sm text-gray-600">
                            {Object.entries(selectedOptions).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{" "}
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">Nenhum item encontrado</p>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>R$ {(order.total - order.delivery_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Taxa de Entrega</span>
              <span>R$ {order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Atualizar Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                variant={order.status === 'pending' ? 'default' : 'outline'}
                onClick={() => onUpdateStatus(order.id, 'pending')}
                disabled={order.status === 'pending'}
              >
                Pendente
              </Button>
              <Button 
                size="sm"
                variant={order.status === 'processing' ? 'default' : 'outline'}
                onClick={() => onUpdateStatus(order.id, 'processing')}
                disabled={order.status === 'processing'}
              >
                Em Preparação
              </Button>
              <Button 
                size="sm"
                variant={order.status === 'delivering' ? 'default' : 'outline'}
                onClick={() => onUpdateStatus(order.id, 'delivering')}
                disabled={order.status === 'delivering'}
              >
                Em Entrega
              </Button>
              <Button 
                size="sm"
                variant={order.status === 'delivered' ? 'default' : 'outline'}
                onClick={() => onUpdateStatus(order.id, 'delivered')}
                disabled={order.status === 'delivered'}
              >
                Entregue
              </Button>
              <Button 
                size="sm"
                variant={order.status === 'cancelled' ? 'default' : 'outline'}
                className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                disabled={order.status === 'cancelled'}
              >
                Cancelado
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
