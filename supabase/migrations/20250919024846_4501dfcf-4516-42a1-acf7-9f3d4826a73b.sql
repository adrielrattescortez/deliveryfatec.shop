-- Adicionar colunas para suportar a lógica "Sempre Criar Usuário"
ALTER TABLE public.profiles 
ADD COLUMN technical_email text,
ADD COLUMN email_was_corrected boolean DEFAULT false;