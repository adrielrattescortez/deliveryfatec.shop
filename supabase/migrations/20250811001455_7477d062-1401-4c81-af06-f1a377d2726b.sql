
-- 1) Permitir pedidos de convidado (user_id opcional)
alter table public.orders
  alter column user_id drop not null;

-- 2) Política de INSERT para visitantes (anon): só permite quando user_id for null
drop policy if exists "Guests can create guest orders" on public.orders;
create policy "Guests can create guest orders"
on public.orders
for insert
to anon
with check (user_id is null);

-- 3) Política de UPDATE para "reivindicar" pedidos de convidado após cadastro:
--    Usuário autenticado pode atualizar um pedido SEM dono (user_id is null)
--    se o e-mail do pedido (address->>'customer_email') for igual ao e-mail autenticado.
--    E o novo valor deve definir user_id = auth.uid().
drop policy if exists "Authenticated users can claim their guest orders" on public.orders;
create policy "Authenticated users can claim their guest orders"
on public.orders
for update
to authenticated
using (
  user_id is null
  and lower((address->>'customer_email')::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (user_id = auth.uid());

-- 4) Trigger para garantir que, no momento da reivindicação (user_id: null -> not null),
--    nenhuma outra coluna seja alterada.
create or replace function public.prevent_guest_order_side_effects()
returns trigger
language plpgsql
as $$
begin
  -- Só valida quando estamos "reivindicando" (user_id indo de NULL para algum valor)
  if (old.user_id is null and new.user_id is not null) then
    -- Compara o registro antigo e o novo desconsiderando a coluna user_id
    if (to_jsonb(new) - 'user_id') <> (to_jsonb(old) - 'user_id') then
      raise exception 'Only user_id can be changed when claiming a guest order';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_guest_order_side_effects on public.orders;
create trigger trg_prevent_guest_order_side_effects
before update on public.orders
for each row execute function public.prevent_guest_order_side_effects();
