
import React, { useState, useEffect, ChangeEvent } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, Store, Image } from 'lucide-react';

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
  const [logoPreview, setLogoPreview] = useState<string>(storeInfo.logo || "");
  const [bannerPreview, setBannerPreview] = useState<string>(storeInfo.banner || "");
  const [logoChanged, setLogoChanged] = useState(false);
  const [bannerChanged, setBannerChanged] = useState(false);
  
  useEffect(() => {
    // Atualiza previews quando storeInfo mudar
    if (!logoChanged) {
      setLogoPreview(storeInfo.logo || "");
    }
    if (!bannerChanged) {
      setBannerPreview(storeInfo.banner || "");
    }
  }, [storeInfo, logoChanged, bannerChanged]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: storeInfo.name || "",
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType || "",
      deliveryFee: storeInfo.deliveryFee || 0,
      minOrder: storeInfo.minOrder || 0,
    },
  });
  
  // Reset do form quando storeInfo mudar
  useEffect(() => {
    form.reset({
      name: storeInfo.name,
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType,
      deliveryFee: storeInfo.deliveryFee,
      minOrder: storeInfo.minOrder,
    });
  }, [storeInfo, form]);
  
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setLogoChanged(true);
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
      setBannerChanged(true);
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = (data: FormData) => {
    const updatedInfo = {
      ...data,
    };

    // Só atualiza logo e banner se tiverem mudado
    if (logoChanged) {
      updatedInfo.logo = logoPreview;
    }
    
    if (bannerChanged) {
      updatedInfo.banner = bannerPreview;
    }
    
    updateStoreInfo(updatedInfo);
    
    // Reseta os flags de mudança
    setLogoChanged(false);
    setBannerChanged(false);
    
    toast.success('Configurações salvas com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Configurações</h1>
        <p className="text-gray-500">Personalize as informações da sua loja</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>Imagens</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Entrega</span>
          </TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
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
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="images">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Imagens</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <FormLabel>Logo da loja</FormLabel>
                    <div className="mt-4">
                      <div className="h-40 w-40 rounded-lg bg-gray-100 overflow-hidden mb-4 mx-auto">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error("Erro ao carregar logo:", e);
                              e.currentTarget.src = "/placeholder.svg"; 
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <Store className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <label 
                          htmlFor="logo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          <Upload size={18} />
                          <span>Alterar logo</span>
                          <Input 
                            id="logo-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <FormDescription className="mt-2 text-center">
                        Recomendado: 200x200px, formato quadrado
                      </FormDescription>
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel>Banner da loja</FormLabel>
                    <div className="mt-4">
                      <div className="h-40 w-full rounded-lg bg-gray-100 overflow-hidden mb-4">
                        {bannerPreview ? (
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error("Erro ao carregar banner:", e);
                              e.currentTarget.src = "/placeholder.svg"; 
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <Image className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <label 
                          htmlFor="banner-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          <Upload size={18} />
                          <span>Alterar banner</span>
                          <Input 
                            id="banner-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={handleBannerChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <FormDescription className="mt-2 text-center">
                        Recomendado: 1200x400px, formato retangular
                      </FormDescription>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Configurações de entrega</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </TabsContent>
            
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Salvar todas as configurações
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
