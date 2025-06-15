
-- Habilitar Row Level Security (RLS), se ainda não estiver ativo
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT público em products
CREATE POLICY "Public select products"
  ON public.products
  FOR SELECT
  USING (true);

-- Permitir SELECT público em categories
CREATE POLICY "Public select categories"
  ON public.categories
  FOR SELECT
  USING (true);
