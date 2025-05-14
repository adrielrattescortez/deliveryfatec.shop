
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { X } from 'lucide-react';

// Esquema Zod para validação do formulário de produto
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Nome do produto deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
    z.number().min(0.01, { message: "Preço deve ser maior que zero." })
  ),
  category_id: z.string().uuid({ message: "Selecione uma categoria válida." }),
  image_url: z.string().url({ message: "URL da imagem inválida." }).optional().or(z.literal('')),
  popular: z.boolean().default(false),
  vegetarian: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface SupabaseProductFormProps {
  product?: Tables<'products'> | null; // Produto existente para edição
  onSuccess: () => void; // Callback após sucesso
  onCancel: () => void; // Callback para cancelar
}

const SupabaseProductForm: React.FC<SupabaseProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ? Number(product.price) : 0,
      category_id: product?.category_id || '',
      image_url: product?.image_url || '',
      popular: product?.popular || false,
      vegetarian: product?.vegetarian || false,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) {
        toast.error("Erro ao buscar categorias.");
        console.error(error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset form if product prop changes (e.g., closing edit and opening new)
    form.reset({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ? Number(product.price) : 0,
      category_id: product?.category_id || '',
      image_url: product?.image_url || '',
      popular: product?.popular || false,
      vegetarian: product?.vegetarian || false,
    });
  }, [product, form]);

  const onSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (product && product.id) { // Edição
        const { error } = await supabase
          .from('products')
          .update({
            ...formData,
            price: formData.price // Enviar como número
          })
          .eq('id', product.id);
        if (error) throw error;
        toast.success(`Produto "${formData.name}" atualizado com sucesso!`);
      } else { // Criação
        const { error } = await supabase
          .from('products')
          .insert([{
            ...formData,
            price: formData.price // Enviar como número
          }]);
        if (error) throw error;
        toast.success(`Produto "${formData.name}" criado com sucesso!`);
      }
      onSuccess(); // Chama callback de sucesso (ex: fechar modal, atualizar lista)
    } catch (error: any) {
      toast.error(`Erro ao salvar produto: ${error.message}`);
      console.error("Product form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Fechar formulário">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription>
          {product ? 'Modifique os detalhes do produto abaixo.' : 'Preencha os detalhes do novo produto.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Esfiha de Carne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes sobre o produto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="9.99" {...field} 
                       onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
                <FormField
                control={form.control}
                name="popular"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Produto Popular?</FormLabel>
                        <FormDescription>
                        Marque se este produto deve ser destacado como popular.
                        </FormDescription>
                    </div>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="vegetarian"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Vegetariano?</FormLabel>
                        <FormDescription>
                        Marque se este produto é vegetariano.
                        </FormDescription>
                    </div>
                    </FormItem>
                )}
                />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (product ? 'Salvando...' : 'Criando...') : (product ? 'Salvar Alterações' : 'Criar Produto')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupabaseProductForm;
