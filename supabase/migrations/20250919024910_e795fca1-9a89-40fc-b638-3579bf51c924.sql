-- Enable RLS on store_info table e adicionar policy
ALTER TABLE public.store_info ENABLE ROW LEVEL SECURITY;

-- Permitir que todos vejam informações da loja (dados públicos)
CREATE POLICY "Store info is viewable by everyone" 
ON public.store_info 
FOR SELECT 
USING (true);

-- Apenas admins podem gerenciar informações da loja
CREATE POLICY "Admins can manage store info" 
ON public.store_info 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));