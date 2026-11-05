-- ============================================================
-- productos_practica — ARREGLAR la tabla importada desde CSV
-- (no borra ni duplica los productos que ya existen)
-- Pegar completo en Supabase → SQL Editor → Run
-- ============================================================

-- 1) Agregar la columna id (se numera sola: 1, 2, 3...)
alter table public.productos_practica
  add column if not exists id bigint generated always as identity primary key;

-- 2) Convertir categoria de texto "{Ropa,Hombre}" a array text[]
--    (el texto ya tiene formato de array de Postgres, así que el cast funciona)
alter table public.productos_practica
  alter column categoria type text[] using categoria::text[];

-- 3) RLS abierto a anon (SOLO para clase) — para que la página pueda
--    leer, crear, editar y borrar
alter table public.productos_practica enable row level security;

drop policy if exists "anon full access" on public.productos_practica;
create policy "anon full access" on public.productos_practica
  for all to anon using (true) with check (true);

-- 4) Comprobar
select id, nombre, precio, categoria from public.productos_practica order by id;
