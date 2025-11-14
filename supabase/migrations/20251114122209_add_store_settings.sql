-- Adicionar colunas para configurações de entrega, retirada e moeda
ALTER TABLE public.store_info 
ADD COLUMN IF NOT EXISTS enable_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_pickup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Atualizar o registro existente com valores padrão
UPDATE public.store_info 
SET enable_delivery = true, 
    enable_pickup = true, 
    currency = 'EUR'
WHERE id = 1;

