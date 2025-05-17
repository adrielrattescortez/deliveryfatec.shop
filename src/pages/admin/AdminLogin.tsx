
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const { adminLogin, loading, isAdmin, currentUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirecionar se já estiver logado como administrador
  useEffect(() => {
    if (currentUser && isAdmin) {
      console.log("Admin already logged in, redirecting to admin dashboard");
      navigate('/admin');
    }
  }, [currentUser, isAdmin, navigate]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Attempting admin login with:", data.email);
      
      const result = await adminLogin(data.email, data.password);
      
      if (result) {
        toast.success('Login de administrador realizado com sucesso!');
        navigate('/admin');
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || 'Credenciais de administrador inválidas ou falha no login.');
    } finally {
      setIsSubmitting(false);
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
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
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
                <Button type="submit" className="w-full" size="lg" disabled={loading || isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar como Administrador'}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500 text-center">
              Não tem uma conta de administrador?{' '}
              <Link to="/admin-register" className="font-medium text-primary hover:underline">
                Registrar Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
