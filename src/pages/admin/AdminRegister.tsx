
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  adminCode: z.string().min(6, { message: 'Código de administrador inválido' })
});

type FormData = z.infer<typeof formSchema>;

// In a real application, this should be stored securely and not hardcoded
const ADMIN_ACCESS_CODE = "admin123"; // This is just for demonstration

const AdminRegister = () => {
  const navigate = useNavigate();
  const { signup, loading } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      adminCode: ''
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Verify admin code
      if (data.adminCode !== ADMIN_ACCESS_CODE) {
        toast.error('Código de administrador inválido');
        return;
      }

      // Register the user first
      await signup(data.name, data.email, data.password);
      
      // Then, assign admin role
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData.session?.user.id;
      
      if (!userId) {
        toast.error('Erro ao obter ID do usuário');
        return;
      }

      // Assign admin role to the user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (roleError) {
        console.error("Error assigning admin role:", roleError);
        toast.error('Erro ao atribuir papel de administrador');
        return;
      }

      toast.success('Cadastro de administrador realizado com sucesso!');
      navigate('/admin-login');
    } catch (error: any) {
      toast.error(error.message || 'Falha no cadastro. Tente novamente.');
      console.error("Admin signup error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Cadastro de Administrador</h1>
          <p className="text-gray-600 mt-2">Crie uma conta com privilégios de administrador</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do administrador" {...field} />
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
                    <Input type="email" placeholder="admin@exemplo.com" {...field} />
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
                        placeholder="Senha forte"
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
            <FormField
              control={form.control}
              name="adminCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Administrador</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Código secreto de acesso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Registrando...' : 'Registrar como Administrador'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta de administrador?{' '}
            <Link to="/admin-login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
