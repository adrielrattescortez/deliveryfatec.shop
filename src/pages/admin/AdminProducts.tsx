import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Plus, Search } from 'lucide-react';
import { FOOD_ITEMS, MENU_CATEGORIES } from '@/pages/Index';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm from '@/components/admin/ProductForm';
import { FoodItem } from '@/components/FeaturedItems';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize products with categories
  const initialProducts: FoodItem[] = [
    ...FOOD_ITEMS, // FOOD_ITEMS now have a category field
    ...Object.entries(MENU_CATEGORIES).flatMap(([category, items]) => 
      items.map(item => ({ ...item, category }))
    )
  ];
  const [products, setProducts] = useState<FoodItem[]>(initialProducts);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<FoodItem | null>(null);
  
  // Extrair todas as categorias
  const categories = [...new Set(initialProducts.map(p => p.category).filter(Boolean) as string[])];
  if (!categories.includes('Destaques')) {
    categories.unshift('Destaques'); // Ensure 'Destaques' is an option if not present
  }
  
  // Filtrar produtos
  const filteredProducts = products.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddProduct = (data: FoodItem) => { // Changed type to FoodItem
    const newProduct: FoodItem = { // Ensure newProduct conforms to FoodItem
      ...data,
      id: `product-${Date.now()}`,
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    setIsAddProductOpen(false);
    toast.success('Produto adicionado com sucesso!');
  };
  
  const handleEditProduct = (product: FoodItem) => {
    setCurrentProduct(product);
    setIsEditProductOpen(true);
  };
  
  const handleUpdateProduct = (data: FoodItem) => { // Changed type to FoodItem
    if (!currentProduct) return;
    
    const updatedProducts = products.map(item => 
      item.id === currentProduct.id ? { ...item, ...data } : item
    );
    
    console.log("Updating product:", currentProduct.id);
    console.log("New data:", data);
    console.log("Updated product:", updatedProducts.find(p => p.id === currentProduct.id));
    
    setProducts(updatedProducts);
    setIsEditProductOpen(false);
    setCurrentProduct(null);
    toast.success('Produto atualizado com sucesso!');
  };
  
  const handleDeleteClick = (product: FoodItem) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteProduct = () => {
    if (!currentProduct) return;
    
    const updatedProducts = products.filter(item => item.id !== currentProduct.id);
    setProducts(updatedProducts);
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
    toast.success('Produto removido com sucesso!');
  };
  
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Produtos</h1>
          <p className="text-gray-500">Gerencie os produtos da sua loja</p>
        </div>
        
        <Button className="gap-2" onClick={() => setIsAddProductOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
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
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium text-gray-500 w-8">
                    {/* <Checkbox /> Keep if you plan to implement bulk actions */}
                  </th>
                  <th className="text-left pb-3 font-medium text-gray-500">Produto</th>
                  <th className="text-left pb-3 font-medium text-gray-500 hidden md:table-cell">Categoria</th>
                  <th className="text-left pb-3 font-medium text-gray-500 hidden lg:table-cell">Descrição</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Preço</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-4">
                      {/* <Checkbox /> Keep if you plan to implement bulk actions */}
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
                    <td className="py-4 text-gray-600 hidden md:table-cell">
                      {product.category || 'N/A'}
                    </td>
                    <td className="py-4 text-gray-600 hidden lg:table-cell max-w-[200px] truncate">
                      {product.description || 'Sem descrição'}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        {product.popular && (
                          <Badge variant="default" className="text-xs">Popular</Badge>
                        )}
                        {product.vegetarian && (
                           <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Vegetariano</Badge>
                        )}
                        {(!product.popular && !product.vegetarian) && (
                           <Badge variant="outline" className="text-xs">Normal</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 font-medium">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          title="Remover produto"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de adição de produto */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha as informações para adicionar um novo produto ao cardápio
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            onSubmit={handleAddProduct}
            categories={categories}
            onCancel={() => setIsAddProductOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modal de edição de produto */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          
          {currentProduct && (
            <ProductForm 
              product={currentProduct}
              onSubmit={handleUpdateProduct}
              categories={categories}
              onCancel={() => setIsEditProductOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto
              "{currentProduct?.name}" do seu cardápio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
