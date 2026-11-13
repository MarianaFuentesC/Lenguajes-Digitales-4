-- ============================================================
-- clientes_practca: secure with RLS
-- Paste in Supabase -> SQL Editor -> Run (safe to re-run)
-- ============================================================

-- 1) Turn on RLS (with no policies, everything is denied by default)
alter table public.clientes_practca enable row level security;

-- 2) Remove old policies if they exist
drop policy if exists "cliente_ve_su_perfil"    on public.clientes_practca;
drop policy if exists "cliente_crea_su_perfil"  on public.clientes_practca;
drop policy if exists "cliente_edita_su_perfil" on public.clientes_practca;
drop policy if exists "admin_ve_clientes"       on public.clientes_practca;

-- 3) SELECT: each client sees ONLY their own row
create policy "cliente_ve_su_perfil"
on public.clientes_practca for select
to authenticated
using ( (select auth.uid()) = id );

-- 4) SELECT: admins see all clients (to manage orders)
create policy "admin_ve_clientes"
on public.clientes_practca for select
to authenticated
using ( exists (
  select 1 from public.admins_practica
  where admins_practica.id = (select auth.uid())
));

-- 5) INSERT: only YOUR profile, always as 'cliente', with your signup email
create policy "cliente_crea_su_perfil"
on public.clientes_practca for insert
to authenticated
with check (
  (select auth.uid()) = id
  and rol = 'cliente'
  and correo = (select auth.jwt() ->> 'email')
);

-- 6) UPDATE: only your own row
create policy "cliente_edita_su_perfil"
on public.clientes_practca for update
to authenticated
using      ( (select auth.uid()) = id )
with check ( (select auth.uid()) = id );

-- 7) Columns: the client can ONLY edit nombre, telefono, direccion
--    (RLS controls ROWS; GRANT/REVOKE controls COLUMNS)
revoke update on public.clientes_practca from authenticated, anon;
grant  update (nombre, telefono, direccion) on public.clientes_practca to authenticated;

-- 8) anon (not logged in) gets nothing at all
revoke all on public.clientes_practca from anon;

-- 9) Check
select policyname, cmd, roles from pg_policies where tablename = 'clientes_practca';
