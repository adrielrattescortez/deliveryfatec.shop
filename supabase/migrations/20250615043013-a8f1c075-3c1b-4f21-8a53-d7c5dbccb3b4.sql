
-- Adicionar campos de endereço e coordenadas na tabela store_info
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
