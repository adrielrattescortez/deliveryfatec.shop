
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Search, PackageOpen, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types'; // Ajuste o caminho se necessário
import SupabaseProductForm from '@/components/admin/SupabaseProductForm'; // Novo formulário
import { Dialog, DialogContent } from '@/components/ui/dialog';

type ProductWithCategoryName = Tables<'products'> & {
  categories: { name: string } | null; // Para buscar o nome da categoria
};

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductWithCategoryName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<'products'> | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories ( name )
        `)
        .order('name', { ascending: true });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setProducts(data as ProductWithCategoryName[] || []); // Cast aqui
    } catch (error: any) {
      toast.error('Falha ao buscar produtos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]); // Refetch when searchTerm changes

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Tables<'products'>) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o produto "${productName}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success(`Produto "${productName}" removido.`);
      fetchProducts(); // Refresh list
    } catch (error: any) {
      toast.error('Erro ao remover produto: ' + error.message);
    }
  };

  const onFormSuccess = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh product list
  };
  
  const onFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
          <p className="text-gray-500">Adicione, edite ou remova produtos do seu cardápio.</p>
        </div>
        <Button onClick={handleAddProduct} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Visualize e gerencie todos os produtos cadastrados.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar produto por nome..." 
              className="pl-9 w-full sm:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando produtos...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-600">Nenhum produto encontrado.</p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Tente um termo de busca diferente.' : 'Comece adicionando novos produtos.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        {product.image_url ? (
                           <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="h-12 w-12 object-cover rounded" 
                           onError={(e) => (e.currentTarget.style.display = 'none')} // Hide on error
                          />
                        ) : (
                          <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                            <ImageOff size={24} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categories?.name || <span className="text-gray-400 italic">Sem categoria</span>}</TableCell>
                      <TableCell className="text-right">R$ {Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.popular && <Badge variant="outline" className="mr-1 border-green-500 text-green-600">Popular</Badge>}
                        {product.vegetarian && <Badge variant="outline" className="border-blue-500 text-blue-600">Vegetariano</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id, product.name)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-y-auto max-h-[90vh]">
          {/* O SupabaseProductForm agora controla seu próprio Card e padding */}
          <SupabaseProductForm 
            product={editingProduct}
            onSuccess={onFormSuccess}
            onCancel={onFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
