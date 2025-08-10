
-- Ajusta RLS para admins na tabela orders usando has_role (user_roles)

-- 1) Seleção: admin pode ver todos os pedidos
drop policy if exists "Admins can view all orders" on public.orders;

create policy "Admins can view all orders"
on public.orders
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- 2) Atualização: admin pode atualizar qualquer pedido
drop policy if exists "Admins can update all orders" on public.orders;

create policy "Admins can update all orders"
on public.orders
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Observação: mantemos as políticas já existentes para usuários comuns
-- "Users can view their own orders" / "Users can update their own orders" / "Users can create their own orders"
-- Assim, usuários comuns continuam restritos aos próprios pedidos.
