
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

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
});

type FormData = z.infer<typeof formSchema>;

const CustomerProfile = () => {
  const { currentUser, login } = useUser();
  
  const defaultValues = {
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    street: currentUser?.address?.street || '',
    number: currentUser?.address?.number || '',
    neighborhood: currentUser?.address?.neighborhood || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
    zipCode: currentUser?.address?.zipCode || '',
  };
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = (data: FormData) => {
    if (!currentUser) return;
    
    // Atualizar dados do usuário
    const updatedUser = {
      ...currentUser,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    };
    
    login(updatedUser);
    toast.success('Perfil atualizado com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Editar Perfil</h1>
        <p className="text-gray-500">Atualize seus dados pessoais e de entrega</p>
      </div>
      
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
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
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Endereço</h3>
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
                
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
            
            <div className="flex justify-end">
              <Button type="submit">
                Salvar alterações
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CustomerProfile;
