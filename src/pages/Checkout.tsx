import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(8, { message: 'Telefone inválido' }),
  street: z.string().min(3, { message: 'Endereço é obrigatório' }),
  number: z.string().min(1, { message: 'Número é obrigatório' }),
  neighborhood: z.string().min(2, { message: 'Bairro é obrigatório' }),
  city: z.string().min(2, { message: 'Cidade é obrigatória' }),
  state: z.string().min(2, { message: 'Estado é obrigatório' }),
  zipCode: z.string().min(5, { message: 'CEP é obrigatório' }),
  paymentMethod: z.enum(['cash', 'credit_card', 'pix', 'stripe']),
  change: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useUser();
  const { storeInfo } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'pix' | 'stripe'>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [deliveryBlocked, setDeliveryBlocked] = useState<string | null>(null);
  const [isPostCheckout, setIsPostCheckout] = useState(false);

  // Função para chamar a Edge Function ao preencher endereço.
  async function calculateFeeIfReady() {
    const v = form.getValues();
    // Checa se todos os campos necessários estão preenchidos
    if (
      v.street &&
      v.number &&
      v.city &&
      v.state &&
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
            setDeliveryBlocked("Este endereço está fora da área de entrega desta loja (limite de 10 km).");
          } else {
            setDeliveryBlocked("Não foi possível calcular entrega.");
          }
          setCalculatedFee(null);
        } else {
          setDeliveryBlocked(null);
          setCalculatedFee(Number(data.deliveryFee));
        }
      } catch {
        setDeliveryBlocked("Erro ao calcular a taxa de entrega.");
        setCalculatedFee(null);
      }
    } else {
      setDeliveryBlocked(null);
      setCalculatedFee(null);
    }
  }

  // Dispara quando os campos de endereço mudam
  useEffect(() => {
    const sub = form.watch(() => {
      calculateFeeIfReady();
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line
  }, [storeInfo.lat, storeInfo.lng]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  const defaultValues = currentUser ? {
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
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const subtotal = getCartTotal();
  const deliveryFee = calculatedFee !== null ? calculatedFee : storeInfo.deliveryFee;
  const total = subtotal + deliveryFee;
  
  const createStripePaymentIntent = async () => {
    try {
      setIsStripeLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: total,
          currency: 'brl',
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
        toast.success('Redirecionando para a página de pagamento');
      }
      
      return data.paymentIntentId;
      
    } catch (error) {
      console.error('Erro ao criar intenção de pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      return null;
    } finally {
      setIsStripeLoading(false);
    }
  };
  
  const onSubmit = async (data: FormData) => {
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

      if (currentUser?.id) {
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
          console.error("Error updating profile:", error);
          // Não interrompe caso falhe (apenas loga)
        }
      }

      const orderData = {
        user_id: currentUser?.id, // ficará null para convidados (permitido pelo RLS)
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

      // Captura o pedido inserido para usar o ID no fluxo convidado
      const { data: insertedOrders, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .limit(1);

      if (orderError) {
        if (orderError.message.includes('violates row-level security')) {
          throw new Error("Erro de permissão ao salvar pedido. Certifique-se de estar logado!");
        }
        throw new Error(`Erro ao salvar pedido: ${orderError.message}`);
      }

      const createdOrder = insertedOrders?.[0];

      toast.success('Pedido realizado com sucesso!');
      
      // Set post-checkout flag to prevent cart empty redirect
      setIsPostCheckout(true);
      clearCart();

      // Se já está logado, segue o fluxo normal
      if (currentUser) {
        navigate('/customer/orders');
      } else if (createdOrder?.id) {
        // Convidado: redireciona para página de criação de conta
        navigate(`/claim-order?orderId=${createdOrder.id}&email=${encodeURIComponent(data.email)}`);
      } else {
        // Fallback: navega para home se não tiver id (não esperado)
        navigate('/');
      }

    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(error?.message || 'Ocorreu um erro ao finalizar o pedido. Tente novamente.');
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
        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Seus dados</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Endereço de entrega</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
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
                          <FormLabel>Rua</FormLabel>
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
                          <FormLabel>Número</FormLabel>
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
                        <FormLabel>Bairro</FormLabel>
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
                        <FormLabel>Cidade</FormLabel>
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
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Forma de pagamento</h2>
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value: 'cash' | 'credit_card' | 'pix' | 'stripe') => {
                            field.onChange(value);
                            setPaymentMethod(value);
                          }}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pix" id="pix" />
                            <FormLabel htmlFor="pix" className="font-normal cursor-pointer">
                              PIX
                            </FormLabel>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="stripe" id="stripe" />
                            <FormLabel htmlFor="stripe" className="font-normal cursor-pointer">
                              Cartão de crédito/débito online (Stripe)
                            </FormLabel>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="credit_card" id="credit_card" />
                            <FormLabel htmlFor="credit_card" className="font-normal cursor-pointer">
                              Cartão de crédito (na entrega)
                            </FormLabel>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cash" id="cash" />
                            <FormLabel htmlFor="cash" className="font-normal cursor-pointer">
                              Dinheiro (na entrega)
                            </FormLabel>
                          </div>
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
                          <FormLabel>Troco para quanto?</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: R$ 50,00" />
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
                      Ao finalizar o pedido, você será redirecionado para a página segura de pagamento do Stripe.
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'pix' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">
                      Após confirmar o pedido, você receberá o código PIX para pagamento.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Observações</h2>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alguma observação para seu pedido?</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Ex: Sem cebola, entregar na portaria..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="md:hidden bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Resumo do pedido</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de entrega</span>
                    <span>R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading || isStripeLoading}
              >
                {isLoading || isStripeLoading ? 'Processando...' : 'Confirmar pedido'}
              </Button>
            </form>
          </Form>
          
          <div className="hidden md:block h-fit">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Resumo do pedido</h3>
              
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between mb-2 text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              
              <Separator className="my-3" />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
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
