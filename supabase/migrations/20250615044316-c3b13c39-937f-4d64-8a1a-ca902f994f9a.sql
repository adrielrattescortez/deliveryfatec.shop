
-- Permitir que usuários autenticados criem seus próprios pedidos
create policy "Usuário pode inserir seu próprio pedido"
on public.orders
for insert
with check (auth.uid() = user_id);

-- Permitir que usuários autenticados vejam apenas seus próprios pedidos
create policy "Usuário pode ver seus próprios pedidos"
on public.orders
for select
using (auth.uid() = user_id);
