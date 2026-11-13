-- ============================================================
-- New order model: pedidos (header) + detalles_pedidos (lines)
-- + historial_estados_pedido (status log)
-- Paste in Supabase -> SQL Editor -> Run
-- ============================================================

-- One row per purchase: data that belongs to the whole order is stored ONCE.
create table public.pedidos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  cliente_id uuid not null references public.clientes_practca (id) on delete restrict,
  estado text not null default 'carrito'
    check (estado in ('carrito', 'confirmado', 'enviado', 'entregado', 'cancelado')),
  envio boolean not null default false,
  direccion text,
  telefono text,
  observacion text,
  confirmado_en timestamptz
);

-- One row per product inside an order.
create table public.detalles_pedidos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  pedido_id bigint not null references public.pedidos (id) on delete cascade,
  producto_id bigint not null references public.productos_practica (id) on delete restrict,
  cantidad bigint not null check (cantidad > 0),
  precio_unitario bigint not null check (precio_unitario >= 0),
  unique (pedido_id, producto_id)
);

-- Log of every status change of an order (filled automatically by a trigger).
create table public.historial_estados_pedido (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references public.pedidos (id) on delete cascade,
  estado_anterior text,
  estado_nuevo text not null,
  cambiado_por uuid,
  cambiado_en timestamptz not null default now()
);

-- Lock the 3 tables right away (no policies = no API access)
alter table public.pedidos                  enable row level security;
alter table public.detalles_pedidos         enable row level security;
alter table public.historial_estados_pedido enable row level security;

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

-- A client can only have ONE open cart (partial unique index).
create unique index pedidos_un_carrito_por_cliente
  on public.pedidos (cliente_id) where estado = 'carrito';

-- Postgres does NOT automatically index foreign key columns.
-- (detalles_pedidos.pedido_id is already indexed by unique (pedido_id, producto_id)).
create index pedidos_cliente_id_idx                 on public.pedidos (cliente_id);
create index detalles_pedidos_producto_id_idx       on public.detalles_pedidos (producto_id);
create index historial_estados_pedido_pedido_id_idx on public.historial_estados_pedido (pedido_id);
