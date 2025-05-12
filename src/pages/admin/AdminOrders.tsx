
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye } from 'lucide-react';

// Dados fictícios de pedidos para demonstração
const DEMO_ORDERS = [
  {
    id: '1001',
    customer: 'Maria Silva',
    date: '12/05/2025 15:30',
    status: 'processing',
    total: 67.80,
    items: 6
  },
  {
    id: '1002',
    customer: 'João Oliveira',
    date: '12/05/2025 14:15',
    status: 'delivering',
    total: 45.50,
    items: 3
  },
  {
    id: '1003',
    customer: 'Ana Santos',
    date: '12/05/2025 12:45',
    status: 'delivered',
    total: 89.90,
    items: 4
  },
  {
    id: '1004',
    customer: 'Carlos Mendes',
    date: '11/05/2025 19:20',
    status: 'delivered',
    total: 36.70,
    items: 2
  },
  {
    id: '1005',
    customer: 'Paulo Costa',
    date: '11/05/2025 13:10',
    status: 'cancelled',
    total: 72.90,
    items: 5
  }
];

const statusMap = {
  processing: { label: 'Em preparação', color: 'bg-amber-500' },
  delivering: { label: 'Em entrega', color: 'bg-blue-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' }
};

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOrders = DEMO_ORDERS.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.id.includes(searchTerm) || 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });
  
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
              placeholder="Buscar por ID ou cliente..." 
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
                <SelectItem value="processing">Em preparação</SelectItem>
                <SelectItem value="delivering">Em entrega</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-4">
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-xs text-gray-500">{order.items} itens</p>
                    </div>
                  </td>
                  <td className="py-4">
                    {order.customer}
                  </td>
                  <td className="py-4">
                    <Badge 
                      variant="default" 
                      className={`${statusMap[order.status as keyof typeof statusMap].color} hover:${statusMap[order.status as keyof typeof statusMap].color}`}
                    >
                      {statusMap[order.status as keyof typeof statusMap].label}
                    </Badge>
                  </td>
                  <td className="py-4 text-gray-600 hidden md:table-cell">
                    {order.date}
                  </td>
                  <td className="py-4 font-medium">
                    R$ {order.total.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="hidden md:inline">Ver detalhes</span>
                    </Button>
                  </td>
                </tr>
              ))}
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminOrders;
