
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus, ArrowUp, ArrowDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type CategoryWithProductCount = Tables<'categories'> & { product_count: number };

const AdminCategories = () => {
  const [categories, setCategories] = useState<CategoryWithProductCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  const [editingCategory, setEditingCategory] = useState<Tables<'categories'> | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      // For each category, fetch product count
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          if (countError) {
            console.warn(`Error fetching product count for category ${category.name}:`, countError);
            return { ...category, product_count: 0 };
          }
          return { ...category, product_count: count ?? 0 };
        })
      );
      setCategories(categoriesWithCounts);
    } catch (error: any) {
      toast.error('Falha ao buscar categorias: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Nome da categoria é obrigatório.');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim(), description: newCategoryDescription.trim() }])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast.success(`Categoria "${data.name}" adicionada!`);
        setNewCategoryName('');
        setNewCategoryDescription('');
        fetchCategories(); // Refresh list
      }
    } catch (error: any) {
      toast.error('Erro ao adicionar categoria: ' + error.message);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Check if category has products
     const category = categories.find(c => c.id === categoryId);
    if (category && category.product_count > 0) {
      toast.error(`Não é possível excluir "${categoryName}". Existem ${category.product_count} produtos associados a esta categoria. Remova ou reatribua os produtos primeiro.`);
      return;
    }

    if (!window.confirm(`Tem certeza que deseja remover a categoria "${categoryName}"?`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      toast.success(`Categoria "${categoryName}" removida.`);
      fetchCategories(); // Refresh list
    } catch (error: any) {
      toast.error('Erro ao remover categoria: ' + error.message);
    }
  };

  const openEditModal = (category: Tables<'categories'>) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) {
      toast.error('Nome da categoria é obrigatório.');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name: editName.trim(), description: editDescription.trim() })
        .eq('id', editingCategory.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast.success(`Categoria "${data.name}" atualizada!`);
        setEditingCategory(null);
        fetchCategories(); // Refresh list
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar categoria: ' + error.message);
    }
  };

  // A funcionalidade de mover categorias (ordem) não foi implementada
  // pois requer uma coluna de ordenação no banco de dados e lógica adicional.
  // const handleMoveCategory = (category: string, direction: 'up' | 'down') => {
  //   toast.info(`Movendo ${category} para ${direction === 'up' ? 'cima' : 'baixo'}`);
  // };

  if (isLoading) {
    return <p>Carregando categorias...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categorias</h1>
          <p className="text-gray-500">Gerencie as categorias de produtos</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nova Categoria</CardTitle>
          <CardDescription>Adicione uma nova categoria para seus produtos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-2">
              <Input 
                placeholder="Nome da categoria" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={2}
              />
            </div>
            <Button type="submit" className="gap-2 mt-2 sm:mt-auto">
              <Plus className="h-4 w-4" />
              Adicionar Categoria
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias Existentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 py-4">Nenhuma categoria cadastrada.</p>
          )}
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-lg">{category.name}</p>
                {category.description && <p className="text-xs text-gray-600">{category.description}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {category.product_count} {category.product_count === 1 ? 'produto' : 'produtos'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Editar</span>
                  </Button>
                </DialogTrigger>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                  disabled={category.product_count > 0}
                  title={category.product_count > 0 ? "Remova os produtos desta categoria primeiro" : "Excluir categoria"}
                >
                  <Trash className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      {editingCategory && (
         <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Faça alterações na categoria "{editingCategory.name}". Clique em salvar quando terminar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminCategories;
