
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Plus, Search } from 'lucide-react';
import { FOOD_ITEMS, MENU_CATEGORIES } from '@/pages/Index';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Combinar todos os produtos
  const allProducts = [
    ...FOOD_ITEMS,
    ...(Object.values(MENU_CATEGORIES).flat())
  ];
  
  // Filtrar produtos
  const filteredProducts = allProducts.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditProduct = (id: string) => {
    // Aqui seria a integração com um modal de edição
    toast.info(`Editando produto ${id}`);
  };
  
  const handleDeleteProduct = (id: string) => {
    // Aqui seria a integração com confirmação de exclusão
    toast.success(`Produto ${id} removido`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Produtos</h1>
          <p className="text-gray-500">Gerencie os produtos da sua loja</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar produtos..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 font-medium text-gray-500 w-8">
                  <Checkbox />
                </th>
                <th className="text-left pb-3 font-medium text-gray-500">Produto</th>
                <th className="text-left pb-3 font-medium text-gray-500 hidden md:table-cell">Descrição</th>
                <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                <th className="text-left pb-3 font-medium text-gray-500">Preço</th>
                <th className="text-right pb-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="py-4">
                    <Checkbox />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600 hidden md:table-cell max-w-[200px] truncate">
                    {product.description || 'Sem descrição'}
                  </td>
                  <td className="py-4">
                    {product.popular ? (
                      <Badge variant="default">Popular</Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </td>
                  <td className="py-4 font-medium">
                    R$ {product.price.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum produto encontrado
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

export default AdminProducts;
