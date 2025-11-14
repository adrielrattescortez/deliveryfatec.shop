# Instruções para Aplicar a Migração do Supabase

## 🎯 Objetivo
Adicionar as colunas `enable_delivery`, `enable_pickup` e `currency` na tabela `store_info` para que as configurações funcionem corretamente no Vercel.

## 📋 SQL para Executar

```sql
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
```

## 🚀 Como Aplicar

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto (ID: `vuijhzphlagczfdamxnx`)
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"**
5. Cole o SQL acima
6. Clique em **"Run"** ou pressione `Ctrl+Enter`
7. Verifique se a mensagem de sucesso aparece

### Opção 2: Via Supabase CLI (se configurado)

```bash
npx supabase db push --project-id vuijhzphlagczfdamxnx
```

## ✅ Verificação

Após executar a migração, verifique se as colunas foram criadas:

```sql
SELECT enable_delivery, enable_pickup, currency 
FROM store_info 
WHERE id = 1;
```

Deve retornar:
- `enable_delivery`: `true`
- `enable_pickup`: `true`
- `currency`: `EUR`

## 📝 Notas

- A migração é idempotente (pode ser executada múltiplas vezes sem problemas)
- Os valores padrão serão aplicados automaticamente
- Após aplicar, faça o deploy no Vercel para que as mudanças no código funcionem

