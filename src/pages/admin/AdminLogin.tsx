
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = (data: FormData) => {
    // Verificar se é um administrador
    if (data.email === 'admin@example.com' && data.password === 'admin123') {
      login({
        id: '1',
        name: 'Administrador',
        email: data.email,
        role: 'admin',
      });
      navigate('/admin');
      toast.success('Login de administrador realizado com sucesso!');
    } else {
      toast.error('Credenciais de administrador inválidas');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Área do Administrador</h1>
          <p className="mt-2 text-gray-600">
            Acesse o painel de controle
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
                    <FormLabel>Email de Administrador</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="admin@exemplo.com" 
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
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="******" 
                          {...field} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg">
                  Entrar como Administrador
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500 text-center">
              Para fins de demonstração:<br />
              Admin: admin@example.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
