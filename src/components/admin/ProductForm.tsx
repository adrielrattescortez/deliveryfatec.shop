import React, { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FoodItem } from '@/components/FeaturedItems';
import { Image, Upload } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome do produto é obrigatório' }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Preço não pode ser negativo' }),
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  popular: z.boolean().default(false),
  vegetarian: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: FoodItem;
  onSubmit: (data: FormData & { image: string }) => void;
  categories: string[];
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  categories,
  onCancel
}) => {
  const [imagePreview, setImagePreview] = useState<string>(product?.image || 'https://via.placeholder.com/150');
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || categories[0] || 'Principais',
      popular: product?.popular || false,
      vegetarian: product?.vegetarian || false,
    },
  });
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmitForm = (data: FormData) => {
    // Make sure to preserve the original ID if editing
    const updatedData = {
      ...data,
      image: imagePreview,
      id: product?.id // Preserve the ID if editing
    };
    
    // Log the data being submitted for debugging
    console.log("Form submitting data:", updatedData);
    
    onSubmit(updatedData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormLabel>Imagem do produto</FormLabel>
            <div className="mt-2">
              <div className="h-48 w-full rounded-lg bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Prévia do produto" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-center">
                <label 
                  htmlFor="product-image"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <Upload size={18} />
                  <span>Enviar imagem</span>
                  <Input 
                    id="product-image"
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <FormDescription className="mt-1 text-center">
                <span className="font-medium text-sm text-gray-700">Tamanho ideal: 500x500px (quadrado)</span>
              </FormDescription>
            </div>
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do produto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Esfiha de Carne" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Descreva os ingredientes e detalhes do produto"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="popular"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Produto popular
                  </FormLabel>
                  <FormDescription>
                    Marcar como um dos produtos mais pedidos
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="vegetarian"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Vegetariano
                  </FormLabel>
                  <FormDescription>
                    Este produto é adequado para vegetarianos
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {product ? 'Atualizar' : 'Adicionar'} Produto
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
