
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = (data: FormData) => {
    // Simulação de autenticação
    // Em uma aplicação real, você faria uma chamada API aqui
    if (data.email === 'admin@example.com' && data.password === 'admin123') {
      login({
        id: '1',
        name: 'Administrador',
        email: data.email,
        role: 'admin',
      });
      navigate('/admin');
      toast.success('Login realizado com sucesso!');
    } else if (data.email === 'cliente@example.com' && data.password === 'cliente123') {
      login({
        id: '2',
        name: 'Cliente',
        email: data.email,
        role: 'customer',
        address: {
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01001-000',
        },
        phone: '11999998888',
      });
      navigate('/customer');
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Email ou senha inválidos');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Entrar</h1>
          <p className="mt-2 text-gray-600">
            Acesse sua conta para continuar
          </p>
        </div>
        
        <div className="bg-white p-8 shadow-sm rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg">
                  Entrar
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              Ainda não tem uma conta?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Registre-se
              </Link>
            </p>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500 text-center">
              Para fins de demonstração:<br />
              Admin: admin@example.com / admin123<br />
              Cliente: cliente@example.com / cliente123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
