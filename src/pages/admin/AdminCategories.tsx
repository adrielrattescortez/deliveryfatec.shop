
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus, AlertCircle } from 'lucide-react';
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
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type CategoryWithProductCount = Tables<'categories'> & { product_count: number };

const AdminCategories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryWithProductCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  const [editingCategory, setEditingCategory] = useState<Tables<'categories'> | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      toast.error(t('common.error') + ': ' + error.message);
      console.error('Erro ao buscar categorias:', error);
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
      toast.error(t('admin.categories_page.categoryName'));
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
        toast.success(t('common.success'));
        setNewCategoryName('');
        setNewCategoryDescription('');
        fetchCategories(); // Refresh list
      }
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
      console.error('Erro ao adicionar categoria:', error);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Check if category has products
    const category = categories.find(c => c.id === categoryId);
    if (category && category.product_count > 0) {
      toast.error(t('common.error'));
      return;
    }

    if (!window.confirm(t('admin.categories_page.deleteConfirm'))) return;

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
      console.error('Erro ao remover categoria:', error);
    }
  };

  const openEditModal = (category: Tables<'categories'>) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setIsDialogOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) {
      toast.error(t('admin.categories_page.categoryName'));
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
        toast.success(t('common.success'));
        setEditingCategory(null);
        setIsDialogOpen(false);
        fetchCategories(); // Refresh list
      }
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('admin.categories')}</h1>
          <p className="text-gray-500">{t('admin.categories_page.title')}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.categories_page.addCategory')}</CardTitle>
          <CardDescription>{t('admin.categories_page.title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-2">
              <Input 
                placeholder={t('admin.categories_page.categoryName')} 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Textarea
                placeholder={t('common.description')}
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={2}
              />
            </div>
            <Button type="submit" className="gap-2 mt-2 sm:mt-auto">
              <Plus className="h-4 w-4" />
              {t('admin.categories_page.addCategory')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.categories')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <p>{t('common.loading')}</p>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-500 py-4">{t('admin.categories_page.noCategories')}</p>
          ) : (
            categories.map((category) => (
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">{t('common.edit')}</span>
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    disabled={category.product_count > 0}
                    title={category.product_count > 0 ? t('common.error') : t('common.delete')}
                  >
                    <Trash className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">{t('common.delete')}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('common.edit')} {t('common.category')}</DialogTitle>
            <DialogDescription>
              {t('common.edit')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  {t('common.name')}
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
                  {t('common.description')}
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
                <Button type="button" variant="outline">{t('common.cancel')}</Button>
              </DialogClose>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
