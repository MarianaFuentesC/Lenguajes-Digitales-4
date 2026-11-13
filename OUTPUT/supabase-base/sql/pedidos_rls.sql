-- ============================================================
-- RLS + column permissions for pedidos, detalles_pedidos,
-- historial_estados_pedido. Run AFTER pedidos_schema.sql.
-- Safe to re-run.
-- Pending (next steps of the guide): trigger for precio_unitario,
-- confirmar_pedido(), history trigger, view pedidos_con_total.
-- ============================================================

-- 1) RLS on the 3 new tables
alter table public.pedidos                  enable row level security;
alter table public.detalles_pedidos         enable row level security;
alter table public.historial_estados_pedido enable row level security;

-- 2) COLUMN-level permissions. Supabase grants everything to anon/authenticated by default:
--    revoke it all and grant only what is needed.
--    (pedidos_con_total is left out: the view doesn't exist yet)
revoke all on public.pedidos, public.detalles_pedidos, public.historial_estados_pedido
  from anon, authenticated;

grant select, delete         on public.pedidos to authenticated;
grant insert (cliente_id)    on public.pedidos to authenticated;
grant update (estado)        on public.pedidos to authenticated;   -- admin only (see policies)

grant select, delete                              on public.detalles_pedidos to authenticated;
grant insert (pedido_id, producto_id, cantidad)   on public.detalles_pedidos to authenticated;
grant update (cantidad)                           on public.detalles_pedidos to authenticated;

grant select on public.historial_estados_pedido to authenticated;

-- 3) pedidos policies. The client has NO update policy: confirms via confirmar_pedido().
drop policy if exists "ver_pedidos"            on public.pedidos;
drop policy if exists "crear_carrito"          on public.pedidos;
drop policy if exists "vaciar_carrito"         on public.pedidos;
drop policy if exists "admin_actualiza_estado" on public.pedidos;

create policy "ver_pedidos" on public.pedidos
for select to authenticated
using (
  (select auth.uid()) = cliente_id
  or exists (select 1 from public.admins_practica where id = (select auth.uid()))
);

create policy "crear_carrito" on public.pedidos
for insert to authenticated
with check ( (select auth.uid()) = cliente_id );

create policy "vaciar_carrito" on public.pedidos
for delete to authenticated
using ( (select auth.uid()) = cliente_id and estado = 'carrito' );

create policy "admin_actualiza_estado" on public.pedidos
for update to authenticated
using      ( exists (select 1 from public.admins_practica where id = (select auth.uid())) )
with check ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

-- 4) detalles_pedidos policies: depend on the parent order.
--    The subquery on pedidos also goes through ITS policies: it only "sees" own orders (or all, if admin).
drop policy if exists "ver_detalles"     on public.detalles_pedidos;
drop policy if exists "agregar_detalle"  on public.detalles_pedidos;
drop policy if exists "cambiar_cantidad" on public.detalles_pedidos;
drop policy if exists "quitar_detalle"   on public.detalles_pedidos;

create policy "ver_detalles" on public.detalles_pedidos
for select to authenticated
using ( exists (select 1 from public.pedidos p where p.id = detalles_pedidos.pedido_id) );

create policy "agregar_detalle" on public.detalles_pedidos
for insert to authenticated
with check (
  exists (select 1 from public.pedidos p
           where p.id = detalles_pedidos.pedido_id
             and p.cliente_id = (select auth.uid())
             and p.estado = 'carrito')
);

create policy "cambiar_cantidad" on public.detalles_pedidos
for update to authenticated
using (
  exists (select 1 from public.pedidos p
           where p.id = detalles_pedidos.pedido_id
             and p.cliente_id = (select auth.uid())
             and p.estado = 'carrito')
)
with check (
  exists (select 1 from public.pedidos p
           where p.id = detalles_pedidos.pedido_id
             and p.cliente_id = (select auth.uid())
             and p.estado = 'carrito')
);

create policy "quitar_detalle" on public.detalles_pedidos
for delete to authenticated
using (
  exists (select 1 from public.pedidos p
           where p.id = detalles_pedidos.pedido_id
             and p.cliente_id = (select auth.uid())
             and p.estado = 'carrito')
);

-- 5) History policy: only an admin can read it.
drop policy if exists "ver_historial_admin" on public.historial_estados_pedido;

create policy "ver_historial_admin" on public.historial_estados_pedido
for select to authenticated
using ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

-- 6) Check: expect 9 policies (4 + 4 + 1)
select tablename, policyname, cmd
from pg_policies
where tablename in ('pedidos', 'detalles_pedidos', 'historial_estados_pedido')
order by tablename, cmd;
