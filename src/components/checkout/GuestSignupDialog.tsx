
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type GuestSignupDialogProps = {
  open: boolean;
  email: string;
  orderId: string;
  onClose: () => void;
  onClaimed: () => void; // chamado quando o pedido for vinculado e o usuário estiver logado
};

const GuestSignupDialog: React.FC<GuestSignupDialogProps> = ({
  open,
  email,
  orderId,
  onClose,
  onClaimed,
}) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    if (!email || !orderId) {
      toast.error("Informações do pedido não encontradas.");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Cria a conta com o email do pedido
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) {
        toast.error(error.message || "Não foi possível criar a conta.");
        return;
      }

      // Se a sessão já estiver ativa (email de confirmação desativado), já tentamos vincular
      const sessionUserId = data.session?.user?.id;
      if (sessionUserId) {
        const { error: claimError } = await supabase
          .from("orders")
          .update({ user_id: sessionUserId })
          .eq("id", orderId);

        if (claimError) {
          toast.error("Conta criada, mas não foi possível vincular o pedido automaticamente.");
          onClose();
          return;
        }

        toast.success("Conta criada e pedido vinculado com sucesso!");
        onClaimed();
        return;
      }

      // Caso a confirmação de e-mail esteja ativa, não haverá sessão aqui.
      // O pedido poderá ser vinculado assim que a pessoa confirmar o email e fizer login.
      toast.info("Enviamos um email de confirmação. Confirme sua conta para visualizar seus pedidos.");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crie sua conta para acompanhar seu pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Seu pedido foi realizado com o email: <span className="font-medium">{email}</span>.
            Para acompanhar o status e facilitar próximos pedidos, defina uma senha e crie sua conta.
          </div>

          <div>
            <label className="block text-sm mb-1">Senha</label>
            <Input
              type="password"
              placeholder="Digite uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Mínimo de 6 caracteres.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleCreateAccount} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar conta e vincular pedido"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestSignupDialog;
