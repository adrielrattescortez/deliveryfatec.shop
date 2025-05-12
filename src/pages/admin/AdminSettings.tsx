
import React, { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome da loja é obrigatório' }),
  description: z.string().optional(),
  cuisineType: z.string().min(2, { message: 'Tipo de culinária é obrigatório' }),
  deliveryFee: z.coerce.number().min(0, { message: 'Taxa de entrega não pode ser negativa' }),
  minOrder: z.coerce.number().min(0, { message: 'Pedido mínimo não pode ser negativo' }),
});

type FormData = z.infer<typeof formSchema>;

const AdminSettings = () => {
  const { storeInfo, updateStoreInfo } = useStore();
  const [logoPreview, setLogoPreview] = useState(storeInfo.logo);
  const [bannerPreview, setBannerPreview] = useState(storeInfo.banner);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: storeInfo.name,
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType,
      deliveryFee: storeInfo.deliveryFee,
      minOrder: storeInfo.minOrder,
    },
  });
  
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBannerPreview(result);
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = (data: FormData) => {
    updateStoreInfo({
      ...data,
      logo: logoPreview,
      banner: bannerPreview,
    });
    toast.success('Configurações salvas com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Configurações</h1>
        <p className="text-gray-500">Personalize as informações da sua loja</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Imagens</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel>Logo da loja</FormLabel>
                <div className="mt-2">
                  <div className="h-32 w-32 rounded-lg bg-gray-100 overflow-hidden mb-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                  />
                  <FormDescription className="mt-1">
                    Recomendado: 200x200px, formato quadrado
                  </FormDescription>
                </div>
              </div>
              
              <div>
                <FormLabel>Banner da loja</FormLabel>
                <div className="mt-2">
                  <div className="h-32 w-full rounded-lg bg-gray-100 overflow-hidden mb-2">
                    <img 
                      src={bannerPreview} 
                      alt="Banner preview" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleBannerChange}
                  />
                  <FormDescription className="mt-1">
                    Recomendado: 1200x400px, formato retangular
                  </FormDescription>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações da loja</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da loja</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cuisineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de culinária</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Ex: Árabe, Italiana, Japonesa...
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da loja</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Uma breve descrição da sua loja para seus clientes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="deliveryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de entrega (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido mínimo (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Salvar configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminSettings;
