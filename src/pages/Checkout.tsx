import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

const Checkout = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useUser();
  const { storeInfo } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'pix' | 'stripe'>('pix');
  // Determinar método de entrega inicial baseado nas configurações
  const getInitialDeliveryMethod = (): 'delivery' | 'pickup' => {
    if (storeInfo.enableDelivery === true && storeInfo.enablePickup === true) {
      return 'delivery'; // Se ambos estão habilitados, padrão é delivery
    }
    if (storeInfo.enableDelivery === true) {
      return 'delivery';
    }
    if (storeInfo.enablePickup === true) {
      return 'pickup';
    }
    return 'pickup'; // Fallback
  };
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>(getInitialDeliveryMethod());
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [deliveryBlocked, setDeliveryBlocked] = useState<string | null>(null);
  const [isPostCheckout, setIsPostCheckout] = useState(false);

  // Recriar formSchema quando o idioma mudar
  const formSchema = useMemo(() => z.object({
    deliveryMethod: z.enum(['delivery','pickup']).default(
      storeInfo.enableDelivery === true ? 'delivery' : 'pickup'
    ),
    name: z.string().min(2, { message: t('checkout.name') }),
    email: z.string().email({ message: t('checkout.email') }),
    phone: z.string().min(9, { message: t('checkout.phone') }).max(13),
    street: z.string().optional(),
    number: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'pix', 'stripe']),
    change: z.string().optional(),
    notes: z.string().optional(),
  }).superRefine((vals, ctx) => {
    if (vals.deliveryMethod === 'delivery') {
      const requiredFields: (keyof typeof vals)[] = ['street','number','neighborhood','city','zipCode'];
      requiredFields.forEach((f) => {
        if (!vals[f] || String(vals[f]).trim().length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f], message: t('checkout.fillAllFields') });
        }
      });
    }
  }), [t, i18n.language, storeInfo.enableDelivery]);

  type CheckoutFormData = z.infer<typeof formSchema>;
  
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  const defaultValues = currentUser ? {
    deliveryMethod,
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    street: currentUser.address?.street || '',
    number: currentUser.address?.number || '',
    neighborhood: currentUser.address?.neighborhood || '',
    city: currentUser.address?.city || '',
    state: currentUser.address?.state || '',
    zipCode: currentUser.address?.zipCode || '',
    paymentMethod: 'pix' as const,
    change: '',
    notes: '',
  } : {
    deliveryMethod,
    name: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'pix' as const,
    change: '',
    notes: '',
  };
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Função para chamar a Edge Function ao preencher endereço.
  const calculateFeeIfReady = React.useCallback(async () => {
    const v = form.getValues();
    // Checa se todos os campos necessários estão preenchidos
    if (
      deliveryMethod === 'delivery' &&
      v.street &&
      v.number &&
      v.city &&
      v.neighborhood &&
      v.zipCode &&
      storeInfo.lat != null &&
      storeInfo.lng != null
    ) {
      try {
        const addressStr = `${v.street}, ${v.number}, ${v.neighborhood}, ${v.city}, ${v.state}, ${v.zipCode}`;
        const { data, error } = await supabase.functions.invoke("calculate-delivery-fee", {
          body: {
            storeLat: storeInfo.lat,
            storeLng: storeInfo.lng,
            customerAddress: addressStr,
          },
        });
        if (error || data?.error) {
          if (data?.error === "Fora da área") {
            setDeliveryBlocked(t('checkout.deliveryBlocked'));
          } else {
            setDeliveryBlocked(t('checkout.deliveryCalculationError'));
          }
          setCalculatedFee(null);
        } else {
          setDeliveryBlocked(null);
          setCalculatedFee(Number(data.deliveryFee));
        }
      } catch {
        setDeliveryBlocked(t('checkout.deliveryFeeError'));
        setCalculatedFee(null);
      }
    } else {
      setDeliveryBlocked(null);
      setCalculatedFee(deliveryMethod === 'pickup' ? 0 : null);
    }
  }, [deliveryMethod, form, storeInfo.lat, storeInfo.lng, t]);

  // Dispara quando os campos de endereço mudam
  useEffect(() => {
    const sub = form.watch(() => {
      calculateFeeIfReady();
    });
    return () => sub.unsubscribe();
  }, [form, calculateFeeIfReady]);
  
  // Sincronizar deliveryMethod com o form e atualizar quando as configurações mudarem
  useEffect(() => {
    // Recalcular o método inicial quando as configurações mudarem
    const newMethod = (() => {
      if (storeInfo.enableDelivery === true && storeInfo.enablePickup === true) {
        return 'delivery';
      }
      if (storeInfo.enableDelivery === true) {
        return 'delivery';
      }
      if (storeInfo.enablePickup === true) {
        return 'pickup';
      }
      return 'pickup';
    })();
    
    // Se o método atual não está disponível, mudar para o disponível
    if (newMethod !== deliveryMethod) {
      // Verificar se o método atual ainda está disponível
      if (deliveryMethod === 'delivery' && storeInfo.enableDelivery !== true) {
        setDeliveryMethod(newMethod);
        form.setValue('deliveryMethod', newMethod);
      } else if (deliveryMethod === 'pickup' && storeInfo.enablePickup !== true) {
        setDeliveryMethod(newMethod);
        form.setValue('deliveryMethod', newMethod);
      } else {
        // Sincronizar com o form mesmo se não mudou
        form.setValue('deliveryMethod', deliveryMethod);
      }
    } else {
      form.setValue('deliveryMethod', deliveryMethod);
    }
  }, [deliveryMethod, form, storeInfo.enableDelivery, storeInfo.enablePickup]);
  
  // Ajustar método de pagamento padrão quando mudar entre delivery e pickup
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setPaymentMethod('cash');
      form.setValue('paymentMethod', 'cash');
    } else {
      setPaymentMethod('pix');
      form.setValue('paymentMethod', 'pix');
    }
  }, [deliveryMethod, form]);
  
  const subtotal = getCartTotal();
  const deliveryFee = calculatedFee !== null ? calculatedFee : storeInfo.deliveryFee;
  const total = subtotal + deliveryFee;
  
  const createStripePaymentIntent = async () => {
    try {
      setIsStripeLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: total,
          currency: (storeInfo.currency ?? 'EUR').toLowerCase(),
          metadata: {
            customer_name: form.getValues('name'),
            customer_email: form.getValues('email')
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setClientSecret(data.clientSecret);
      
      if (data.clientSecret) {
        const stripeUrl = `https://checkout.stripe.com/pay/${data.clientSecret}`;
        window.open(stripeUrl, '_blank');
        toast.success(t('checkout.redirectingPayment'));
      }
      
      return data.paymentIntentId;
      
    } catch (error) {
      console.error('Erro ao criar intenção de pagamento:', error);
      toast.error(t('checkout.orderError'));
      return null;
    } finally {
      setIsStripeLoading(false);
    }
  };
  
  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  const generateSubstituteEmail = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `guest-${timestamp}-${random}@checkout.internal`;
  };

  const createUserAlways = async (data: CheckoutFormData) => {
    const tempPassword = generateTempPassword();
    let userCreated = null;
    let emailWasCorrected = false;
    let originalEmail = data.email;

    // Primeira tentativa: usar email original
    try {
      console.log('Tentando criar usuário com email original:', data.email);
      const signupResult = await supabase.auth.signUp({
        email: data.email,
        password: tempPassword,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (signupResult.error) {
        throw signupResult.error;
      }

      userCreated = signupResult.data.user;
      console.log('Usuário criado com sucesso com email original');
      
    } catch (error: any) {
      console.log('Falha com email original, tentando com email substituto:', error.message);
      
      // Plano B: gerar email substituto
      const substituteEmail = generateSubstituteEmail();
      emailWasCorrected = true;
      
      try {
        const signupResult = await supabase.auth.signUp({
          email: substituteEmail,
          password: tempPassword,
          options: {
            data: {
              name: data.name,
            },
          },
        });

        if (signupResult.error) {
          throw signupResult.error;
        }

        userCreated = signupResult.data.user;
        console.log('Usuário criado com sucesso com email substituto:', substituteEmail);
        
      } catch (fallbackError: any) {
        console.error('Falha ao criar usuário mesmo com email substituto:', fallbackError);
        throw new Error('Não foi possível processar seu pedido. Tente novamente.');
      }
    }

    if (!userCreated) {
      throw new Error('Falha ao criar usuário para o pedido');
    }

    // Criar/atualizar perfil com todos os dados, incluindo email original
    const profileData = {
      id: userCreated.id,
      name: data.name,
      email: emailWasCorrected ? originalEmail : data.email, // email que o cliente digitou
      phone: data.phone,
      address: {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
      // Adicionar metadados para o admin saber quando email foi corrigido
      ...(emailWasCorrected ? {
        technical_email: userCreated.email, // email técnico gerado
        email_was_corrected: true
      } : {})
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData);

    if (profileError) {
      console.error('Erro ao criar/atualizar perfil:', profileError);
      // Não interrompe o fluxo, pois o usuário já foi criado
    }

    return userCreated;
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (deliveryBlocked) {
      toast.error(deliveryBlocked);
      return;
    }
    
    try {
      setIsLoading(true);

      let paymentIntentId = null;
      if (data.paymentMethod === 'stripe') {
        paymentIntentId = await createStripePaymentIntent();
        if (!paymentIntentId) {
          setIsLoading(false);
          return;
        }
      }

      let effectiveUserId = currentUser?.id;

      // Se não está logado, sempre criar um usuário
      if (!currentUser) {
        console.log('Usuário não logado, criando automaticamente...');
        const createdUser = await createUserAlways(data);
        effectiveUserId = createdUser.id;
        console.log('Usuário criado com ID:', effectiveUserId);
      } else {
        // Se já está logado, apenas atualizar perfil
        const { error } = await supabase
          .from('profiles')
          .update({
            name: data.name,
            phone: data.phone,
            address: {
              street: data.street,
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
              zipCode: data.zipCode,
            }
          })
          .eq('id', currentUser.id);

        if (error) {
          console.error("Erro ao atualizar perfil:", error);
        }
      }

      const orderData = {
        user_id: effectiveUserId, // sempre terá um ID válido
        items: cartItems.map(item => ({
          product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.totalPrice,
          selected_options: item.selectedOptions,
        })),
        address: {
          street: data.street,
          number: data.number,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone,
        },
        total: total,
        delivery_fee: deliveryFee,
        status: data.paymentMethod === 'stripe' ? 'awaiting_payment' : 'pending',
        ...(paymentIntentId ? { payment_intent_id: paymentIntentId } : {}),
      };

      const { data: insertedOrders, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .limit(1);

      if (orderError) {
        console.error('Erro ao salvar pedido:', orderError);
        throw new Error(`Erro ao salvar pedido: ${orderError.message}`);
      }

      toast.success(t('checkout.orderSuccess'));
      
      setIsPostCheckout(true);
      clearCart();

      // Sempre redirecionar para área do cliente (usuário sempre está logado agora)
      navigate('/customer/orders');

    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(error?.message || t('checkout.orderError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (cartItems.length === 0 && !isPostCheckout) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header restaurantName={storeInfo.name} showSearch={false} />
      
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{t('checkout.finalizeOrder')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.yourData')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.phone')}</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={13} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.deliveryInfo')}</h2>

                <div className="mb-4">
                  <RadioGroup 
                    value={deliveryMethod} 
                    onValueChange={(v: 'delivery'|'pickup') => {
                      setDeliveryMethod(v);
                      form.setValue('deliveryMethod', v);
                    }} 
                    className="flex gap-6"
                  >
                    {storeInfo.enableDelivery === true && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <FormLabel htmlFor="delivery" className="font-normal cursor-pointer">{t('checkout.delivery')}</FormLabel>
                      </div>
                    )}
                    {storeInfo.enablePickup === true && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <FormLabel htmlFor="pickup" className="font-normal cursor-pointer">{t('checkout.pickup')}</FormLabel>
                      </div>
                    )}
                  </RadioGroup>
                </div>
                
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={() => (
                    <FormItem className="hidden">
                      <FormControl>
                        <input type="hidden" value={deliveryMethod} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {deliveryMethod === 'delivery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.zipCode')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-4">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>{t('checkout.address')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>{t('checkout.address')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.address')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.city')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.state')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.payment')}</h2>
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'stripe') => {
                            field.onChange(value);
                            setPaymentMethod(value as 'cash' | 'credit_card' | 'pix' | 'stripe');
                          }}
                          value={field.value}
                          className="space-y-3"
                        >
                          {deliveryMethod === 'delivery' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pix" id="pix" />
                                <FormLabel htmlFor="pix" className="font-normal cursor-pointer">
                                  {t('checkout.pix')}
                                </FormLabel>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="stripe" id="stripe" />
                                <FormLabel htmlFor="stripe" className="font-normal cursor-pointer">
                                  {t('checkout.stripe')}
                                </FormLabel>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <FormLabel htmlFor="credit_card" className="font-normal cursor-pointer">
                                  {t('checkout.creditCardOnDelivery')}
                                </FormLabel>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash" />
                                <FormLabel htmlFor="cash" className="font-normal cursor-pointer">
                                  {t('checkout.cashOnDelivery')}
                                </FormLabel>
                              </div>
                            </>
                          )}
                          {deliveryMethod === 'pickup' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash_pickup" />
                                <FormLabel htmlFor="cash_pickup" className="font-normal cursor-pointer">
                                  {t('checkout.cashOnDelivery')}
                                </FormLabel>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debit_card" id="debit_card_pickup" />
                                <FormLabel htmlFor="debit_card_pickup" className="font-normal cursor-pointer">
                                  {t('checkout.debitCardOnDelivery')}
                                </FormLabel>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit_card" id="credit_card_pickup" />
                                <FormLabel htmlFor="credit_card_pickup" className="font-normal cursor-pointer">
                                  {t('checkout.creditCardOnDelivery')}
                                </FormLabel>
                              </div>
                            </>
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {paymentMethod === 'cash' && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="change"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.changeForHowMuch')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={formatCurrency(50, storeInfo.currency ?? 'EUR')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {paymentMethod === 'stripe' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      {t('checkout.stripeRedirect')}
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'pix' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">
                      {t('checkout.pixInfo')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('checkout.notes')}</h2>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('checkout.orderNotes')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder={t('checkout.orderNotesPlaceholder')}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="md:hidden bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">{t('checkout.orderSummary')}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('checkout.subtotal')}</span>
                    <span>{formatCurrency(subtotal, storeInfo.currency ?? 'EUR')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('checkout.deliveryFee')}</span>
                    <span>{formatCurrency(deliveryFee, storeInfo.currency ?? 'EUR')}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between font-semibold">
                    <span>{t('cart.total')}</span>
                    <span>{formatCurrency(total, storeInfo.currency ?? 'EUR')}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading || isStripeLoading}
              >
                {isLoading || isStripeLoading ? t('checkout.processing') : t('checkout.confirmOrder')}
              </Button>
            </form>
          </Form>
          
          <div className="hidden md:block h-fit">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">{t('checkout.orderSummary')}</h3>
              
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between mb-2 text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatCurrency(item.totalPrice, storeInfo.currency ?? 'EUR')}</span>
                </div>
              ))}
              
              <Separator className="my-3" />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.subtotal')}</span>
                  <span>{formatCurrency(subtotal, storeInfo.currency ?? 'EUR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.deliveryFee')}</span>
                  <span>{formatCurrency(deliveryFee, storeInfo.currency ?? 'EUR')}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between font-semibold">
                  <span>{t('cart.total')}</span>
                  <span>{formatCurrency(total, storeInfo.currency ?? 'EUR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {deliveryBlocked && (
        <div className="bg-red-100 text-red-700 px-4 py-2 my-4 rounded">{deliveryBlocked}</div>
      )}
    </div>
  );
};

export default Checkout;
