
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
});

type FormData = z.infer<typeof formSchema>;

const AdminRegister = () => {
  const navigate = useNavigate();
  const { signup, loading } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      // Registre o usuário primeiro
      const signupResult = await signup(data.name, data.email, data.password);
      
      // Verifique se temos um ID de usuário do processo de inscrição
      const userId = signupResult?.user?.id;
      
      if (!userId) {
        toast.error("Erro ao obter ID do usuário após cadastro");
        return;
      }
      
      console.log("User registered successfully, ID:", userId);

      // Use a função edge para atribuir a função de administrador
      const { data: functionData, error: functionError } = await supabase.functions.invoke('assign-admin-role', {
        body: { userId },
      });

      if (functionError) {
        console.error("Error calling assign-admin-role function:", functionError);
        toast.error("Erro ao atribuir papel de administrador");
        return;
      }
      
      console.log("Admin role assigned successfully:", functionData);
      toast.success("Cadastro de administrador realizado com sucesso!");
      navigate('/admin-login');
      
    } catch (error: any) {
      console.error("Admin signup error:", error);
      toast.error(error.message || "Falha no cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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
            <Button type="submit" className="w-full" disabled={loading || isSubmitting} size="lg">
              {isSubmitting ? 'Registrando...' : 'Registrar como Administrador'}
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
