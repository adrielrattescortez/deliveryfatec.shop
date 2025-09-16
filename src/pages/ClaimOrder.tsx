import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";

export default function ClaimOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, signup } = useUser();
  
  const orderId = searchParams.get("orderId");
  const email = searchParams.get("email");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderClaimed, setOrderClaimed] = useState(false);

  // Redirect if no order info
  useEffect(() => {
    if (!orderId || !email) {
      navigate("/");
      return;
    }
  }, [orderId, email, navigate]);

  // Auto-claim if user is already logged in
  useEffect(() => {
    if (currentUser && orderId && !orderClaimed) {
      handleClaimOrder();
    }
  }, [currentUser, orderId, orderClaimed]);

  const handleClaimOrder = async () => {
    if (!orderId || !currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Update order to link it to the current user
      const { error } = await supabase
        .from("orders")
        .update({ user_id: currentUser.id })
        .eq("id", orderId)
        .is("user_id", null);

      if (error) throw error;

      setOrderClaimed(true);
      toast({
        title: "Pedido vinculado!",
        description: "Seu pedido foi vinculado à sua conta com sucesso.",
      });

      setTimeout(() => {
        navigate("/customer/orders");
      }, 2000);
    } catch (error) {
      console.error("Error claiming order:", error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create account
      const result = await signup("", email!, password);
      
      if (result?.user) {
        // The useEffect will handle the order claiming once user is set
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada e o pedido será vinculado automaticamente.",
        });
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (orderClaimed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold">Pedido Vinculado!</h2>
              <p className="text-muted-foreground">
                Seu pedido foi vinculado à sua conta com sucesso. 
                Redirecionando para seus pedidos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crie sua Conta</CardTitle>
          <CardDescription>
            Seu pedido foi criado! Para acompanhar o status, crie uma senha para sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>E-mail:</strong> {email}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta e Vincular Pedido
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/claim-order?orderId=${orderId}&email=${email}`)}`)}
              className="w-full"
            >
              Fazer Login
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Continuar sem conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}