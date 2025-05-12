
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { MENU_CATEGORIES } from '@/pages/Index';
import { toast } from 'sonner';

const AdminCategories = () => {
  const categories = Object.keys(MENU_CATEGORIES);
  
  const handleEditCategory = (category: string) => {
    toast.info(`Editando categoria ${category}`);
  };
  
  const handleDeleteCategory = (category: string) => {
    toast.success(`Categoria ${category} removida`);
  };
  
  const handleMoveCategory = (category: string, direction: 'up' | 'down') => {
    toast.info(`Movendo ${category} para ${direction === 'up' ? 'cima' : 'baixo'}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categorias</h1>
          <p className="text-gray-500">Gerencie as categorias de produtos</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Organizando suas categorias, você melhora a experiência de navegação dos clientes.
          </p>
        </div>
        
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div 
              key={category} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6" 
                    disabled={index === 0}
                    onClick={() => handleMoveCategory(category, 'up')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6" 
                    disabled={index === categories.length - 1}
                    onClick={() => handleMoveCategory(category, 'down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <p className="font-medium">{category}</p>
                  <p className="text-xs text-gray-500">
                    {MENU_CATEGORIES[category].length} produtos
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg flex justify-center">
            <form className="w-full max-w-sm flex gap-2">
              <Input placeholder="Nome da categoria" className="flex-1" />
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminCategories;
