import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, Store, Image } from 'lucide-react';
import StoreAddressForm from "@/components/admin/StoreAddressForm";

const AdminSettings = () => {
  const { storeInfo, updateStoreInfo } = useStore();
  const { t } = useTranslation();
  const [logoPreview, setLogoPreview] = useState<string>(storeInfo.logo || "");
  const [bannerPreview, setBannerPreview] = useState<string>(storeInfo.banner || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formSchema = z.object({
    name: z.string().min(2, { message: t('admin.settings_page.storeName') }),
    description: z.string().optional(),
    cuisineType: z.string().min(2, { message: t('common.category') }),
    deliveryFee: z.coerce.number().min(0, { message: t('admin.settings_page.deliveryFee') }),
    minOrder: z.coerce.number().min(0, { message: t('checkout.orderSummary') }),
    enableDelivery: z.boolean().default(true),
    enablePickup: z.boolean().default(true),
    currency: z.enum(['EUR']).default('EUR'),
  });
  
  type FormData = z.infer<typeof formSchema>;
  
  console.log("Current store info:", storeInfo);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: storeInfo.name || "",
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType || "",
      deliveryFee: storeInfo.deliveryFee || 0,
      minOrder: storeInfo.minOrder || 0,
      enableDelivery: storeInfo.enableDelivery ?? true,
      enablePickup: storeInfo.enablePickup ?? true,
      currency: storeInfo.currency ?? 'EUR',
    },
  });
  
  // Reset the form when storeInfo changes
  useEffect(() => {
    console.log("Resetting form with store info:", storeInfo);
    form.reset({
      name: storeInfo.name || "",
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType || "",
      deliveryFee: storeInfo.deliveryFee || 0,
      minOrder: storeInfo.minOrder || 0,
      enableDelivery: storeInfo.enableDelivery ?? true,
      enablePickup: storeInfo.enablePickup ?? true,
      currency: storeInfo.currency ?? 'EUR',
    });
    setLogoPreview(storeInfo.logo || "");
    setBannerPreview(storeInfo.banner || "");
  }, [storeInfo, form]);
  
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("Logo file selected:", file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log("Logo preview generated");
      setLogoPreview(result);
      
      // Atualizar imediatamente o store com a nova imagem
      updateStoreInfo({ logo: result });
    };
    reader.readAsDataURL(file);
  };
  
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("Banner file selected:", file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log("Banner preview generated");
      setBannerPreview(result);
      
      // Atualizar imediatamente o store com a nova imagem
      updateStoreInfo({ banner: result });
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting form data:", data);
      console.log("Logo preview:", logoPreview);
      console.log("Banner preview:", bannerPreview);
      
      // Prepare the updated store info
      const updatedInfo = {
        name: data.name,
        description: data.description || "",
        cuisineType: data.cuisineType,
        deliveryFee: Number(data.deliveryFee),
        minOrder: Number(data.minOrder),
        logo: logoPreview,
        banner: bannerPreview,
        enableDelivery: data.enableDelivery,
        enablePickup: data.enablePickup,
        currency: data.currency,
      };
      
      console.log("Updating store info with:", updatedInfo);
      
      // Update the store info
      updateStoreInfo(updatedInfo);
      
      toast.success(t('admin.settings_page.settingsSaved'));
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t('admin.settings_page.settingsError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('admin.settings_page.title')}</h1>
        <p className="text-gray-500">{t('admin.settings_page.storeInfoDescription')}</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>{t('admin.settings_page.general')}</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>{t('admin.settings_page.images')}</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>{t('admin.settings_page.delivery')}</span>
          </TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.storeInfo')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.storeName')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('admin.settings_page.storeNamePlaceholder')} />
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
                        <FormLabel>{t('admin.settings_page.cuisineType')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('admin.settings_page.cuisineTypePlaceholder')} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.cuisineTypeDescription')}
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
                          <FormLabel>{t('admin.settings_page.storeDescription')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="min-h-[100px]"
                              placeholder={t('admin.settings_page.storeDescriptionPlaceholder')}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('admin.settings_page.storeDescriptionDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.currency')}</FormLabel>
                        <FormControl>
                          <select className="border rounded h-10 px-3" value="EUR" disabled>
                            <option value="EUR">EUR</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.currencyFixed')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableDelivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.enableDelivery')}</FormLabel>
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.enableDeliveryDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enablePickup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.enablePickup')}</FormLabel>
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.enablePickupDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="images">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.images')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <FormLabel>{t('admin.settings_page.storeLogo')}</FormLabel>
                    <div className="mt-4">
                      <div className="h-40 w-40 rounded-lg bg-gray-100 overflow-hidden mb-4 mx-auto border-2 border-dashed border-gray-300">
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
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <Upload size={18} />
                          <span>{logoPreview ? t('admin.settings_page.changeLogo') : t('admin.settings_page.addLogo')}</span>
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
                        {t('admin.settings_page.logoRecommendation')}
                      </FormDescription>
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel>{t('admin.settings_page.storeBanner')}</FormLabel>
                    <div className="mt-4">
                      <div className="h-40 w-full rounded-lg bg-gray-100 overflow-hidden mb-4 border-2 border-dashed border-gray-300">
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
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <Upload size={18} />
                          <span>{bannerPreview ? t('admin.settings_page.changeBanner') : t('admin.settings_page.addBanner')}</span>
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
                        {t('admin.settings_page.bannerRecommendation')}
                      </FormDescription>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.deliverySettings')}</h2>
                
                <div className="mb-6">
                  <StoreAddressForm />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.deliveryFee')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0,00"
                            {...field} 
                          />
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
                        <FormLabel>{t('admin.settings_page.minOrder')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0,00"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? t('admin.settings_page.saving') : t('admin.settings_page.saveAllSettings')}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
