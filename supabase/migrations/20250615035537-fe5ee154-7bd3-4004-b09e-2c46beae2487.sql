
-- Criação da tabela pública de informações da loja
CREATE TABLE public.store_info (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,         -- URL ou base64
  banner TEXT,       -- URL ou base64
  delivery_fee NUMERIC NOT NULL DEFAULT 0.00,
  min_order NUMERIC NOT NULL DEFAULT 0.00,
  cuisine_type TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opcional: inserir registro inicial (fixo, para ser sempre o 1º registro do sistema)
INSERT INTO public.store_info (name, description, logo, banner, delivery_fee, min_order, cuisine_type)
VALUES (
  'Casa da Esfiha - Culinária Árabe',
  'Os melhores sabores da culinária árabe, com qualidade e tradição',
  '/lovable-uploads/9aa20d70-4f30-4ab3-a534-a41b217aab7a.png',
  'https://source.unsplash.com/featured/?arabian,restaurant',
  10.99,
  25.00,
  'Culinária Árabe'
);

-- Como é um dado público, **NÃO** habilite RLS para que o frontend sempre consiga ler/escrever.

