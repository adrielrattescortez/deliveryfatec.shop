
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Dados fictícios de pedidos para demonstração
const DEMO_ORDERS = [
  {
    id: '1',
    date: '12/05/2025',
    status: 'delivered',
    total: 67.80,
    items: [
      { name: 'Esfiha de Carne', quantity: 4 },
      { name: 'Esfiha de Mussarela', quantity: 2 }
    ]
  },
  {
    id: '2',
    date: '09/05/2025',
    status: 'delivered',
    total: 45.50,
    items: [
      { name: 'Esfiha de Frango', quantity: 2 },
      { name: 'Kit Família', quantity: 1 }
    ]
  },
  {
    id: '3',
    date: '12/05/2025',
    status: 'processing',
    total: 72.90,
    items: [
      { name: 'Combo 2 + Coca 350ml', quantity: 2 }
    ]
  }
];

const statusMap = {
  processing: { label: 'Em preparação', color: 'bg-amber-500' },
  delivering: { label: 'Em entrega', color: 'bg-blue-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' }
};

const CustomerOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Meus Pedidos</h1>
        <p className="text-gray-500">Acompanhe seus pedidos e histórico</p>
      </div>
      
      <div className="space-y-4">
        {DEMO_ORDERS.length > 0 ? (
          DEMO_ORDERS.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Pedido #{order.id}</h3>
                    <Badge 
                      variant="default" 
                      className={`${statusMap[order.status as keyof typeof statusMap].color} hover:${statusMap[order.status as keyof typeof statusMap].color}`}
                    >
                      {statusMap[order.status as keyof typeof statusMap].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Realizado em {order.date}
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
                  {order.items.map((item, index) => (
                    <li key={index} className="text-sm flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  Ver detalhes
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Você ainda não fez nenhum pedido</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
