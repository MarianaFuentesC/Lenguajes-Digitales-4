// =========================================
// galeria.js — Galería de productos (lado cliente)
//
// Estructura del archivo:
//   1. Configuración y estado
//   2. Datos: obtenerProductos()  ← el ÚNICO punto que cambia con Supabase
//   3. Utilidades (precios, categorías, guardar en localStorage)
//   4. Filtros y orden
//   5. Pintar la galería (tarjetas)
//   6. Favoritos
//   7. Cantidades y carrito
//   8. Panel del carrito
//   9. Vista rápida (modal)
//  10. Avisos (toasts)
//  11. Eventos (UN solo listener de clic para toda la página)
//  12. Inicio
// =========================================


// ---------- 1. CONFIGURACIÓN Y ESTADO ----------

const ENVIO_GRATIS_DESDE = 200000;   // compras desde este valor no pagan envío
const COSTO_ENVIO = 12000;

let productos = [];                  // se llena en iniciar()

// Lo que el usuario eligió en la barra de filtros
const filtros = {
  texto: '',
  categoria: 'Todas',
  soloFavoritos: false,
  orden: 'relevancia',
};

// carrito: objeto { idProducto: cantidad }, ej: { 1: 2, 7: 1 }
// Se guarda en localStorage para que sobreviva al recargar la página
// (ver leerGuardado() y guardar() más abajo).
const carrito = leerGuardado('carrito', {});

// favoritos: un Set (conjunto) de ids. Un Set no permite repetidos,
// perfecto para "está o no está". Se guarda como array.
const favoritos = new Set(leerGuardado('favoritos', []));

// Cantidad elegida en cada tarjeta ANTES de agregar al carrito
const cantidades = {};


// ---------- 2. DATOS ----------

// Hoy los productos vienen de productos-demo.js. La función es "async"
// y simula una pequeña espera, igual que una consulta real por internet.
// Para conectar Supabase basta con cambiar el cuerpo por:
//   const { data, error } = await db.from('productos_practica').select('*');
//   if (error) throw error;
//   return data;
async function obtenerProductos() {
  await new Promise(resolver => setTimeout(resolver, 700));   // espera falsa de 0,7 s
  return productosDemo;
}


// ---------- 3. UTILIDADES ----------

// localStorage solo guarda TEXTO: JSON.parse lo convierte de vuelta en
// objeto/array. "?? valorPorDefecto" = si nunca se guardó nada (null).
// (Es una "function" normal, no flecha, para poder usarla arriba en
// la sección 1: las function se pueden llamar antes de su línea.)
function leerGuardado(clave, valorPorDefecto) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto;
  } catch {
    return valorPorDefecto;   // si el texto guardado estaba dañado
  }
}

function guardar() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  localStorage.setItem('favoritos', JSON.stringify([...favoritos]));
}

// 189900 → "$189.900"
const formatoPrecio = n => '$' + Math.round(n).toLocaleString('es-CO');

// Precio con el descuento ya aplicado
const precioFinal = p => p.precio * (1 - (Number(p.descuento) || 0));

// Supabase puede devolver categoria como array o como texto "{Ropa,Hombre}"
// (si la tabla se importó del CSV). Esta función siempre devuelve un array.
function categoriasComoArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor !== 'string') return [];
  return valor.replace(/[{}"]/g, '').split(',').map(c => c.trim()).filter(Boolean);
}

// Quita tildes y pasa a minúsculas: "Lámpara" → "lampara".
// Así buscar "lampara" encuentra "Lámpara".
const normalizar = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const buscarProducto = id => productos.find(p => p.id === id);

// Cuántas unidades MÁS se pueden agregar (stock menos lo que ya está en el carrito)
function disponibleParaAgregar(p) {
  if (!p.disponible) return 0;
  return Math.max(0, p.unidades - (carrito[p.id] || 0));
}


// ---------- 4. FILTROS Y ORDEN ----------

function productosVisibles() {
  const texto = normalizar(filtros.texto.trim());

  const lista = productos.filter(p => {
    const cats = categoriasComoArray(p.categoria);

    // Cada condición que NO se cumpla descarta el producto
    if (filtros.categoria !== 'Todas' && !cats.includes(filtros.categoria)) return false;
    if (filtros.soloFavoritos && !favoritos.has(p.id)) return false;
    if (texto) {
      const dondeBuscar = normalizar([p.nombre, p.descripcion, ...cats].join(' '));
      if (!dondeBuscar.includes(texto)) return false;
    }
    return true;
  });

  // sort() recibe una función que compara dos productos (a, b):
  // si devuelve un número negativo, a va primero; positivo, b va primero.
  const comparadores = {
    'relevancia':  (a, b) => (b.disponible - a.disponible),   // agotados al final
    'precio-asc':  (a, b) => precioFinal(a) - precioFinal(b),
    'precio-desc': (a, b) => precioFinal(b) - precioFinal(a),
    'descuento':   (a, b) => b.descuento - a.descuento,
    'nombre':      (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
  };
  return lista.sort(comparadores[filtros.orden]);
}

// Chips de categorías, generados a partir de los datos (no escritos a mano)
function pintarCategorias() {
  // flatMap junta todos los arrays de categorías en uno; el Set quita repetidos
  const todas = [...new Set(productos.flatMap(p => categoriasComoArray(p.categoria)))]
    .sort((a, b) => a.localeCompare(b, 'es'));

  document.getElementById('chips-categorias').innerHTML = ['Todas', ...todas]
    .map(cat => `
      <button type="button" class="chip-filtro ${cat === filtros.categoria ? 'is-active' : ''}"
              data-accion="categoria" data-cat="${cat}" aria-pressed="${cat === filtros.categoria}">
        ${cat}
      </button>`)
    .join('');
}


// ---------- 5. PINTAR LA GALERÍA ----------

// animar = true cuando cambian los filtros (las tarjetas entran con animación).
// Cuando solo cambia una tarjeta (ej. se agregó al carrito) no animamos.
function pintarGaleria(animar = true) {
  const galeria = document.getElementById('galeria');
  const lista = productosVisibles();

  document.getElementById('texto-resultados').textContent =
    `Mostrando ${lista.length} de ${productos.length} productos` +
    (filtros.soloFavoritos ? ' · solo favoritos ❤️' : '');

  galeria.classList.toggle('animar', animar);

  if (lista.length === 0) {
    galeria.innerHTML = `
      <div class="vacio">
        <span>${filtros.soloFavoritos ? '💜' : '🔍'}</span>
        <h3>${filtros.soloFavoritos ? 'Aún no tienes favoritos aquí' : 'No encontramos productos'}</h3>
        <p>Prueba con otra búsqueda o categoría.</p>
        <button type="button" class="btn btn-ghost" data-accion="limpiar-filtros">Limpiar filtros</button>
      </div>`;
    return;
  }

  // El índice (i) da un pequeño retraso a cada tarjeta: entran en "cascada"
  galeria.innerHTML = lista.map((p, i) => tarjetaHTML(p, i)).join('');
}

// Vuelve a pintar UNA sola tarjeta (más rápido y sin animación)
function actualizarTarjeta(id) {
  const tarjeta = document.querySelector(`.card[data-id="${id}"]`);
  if (tarjeta) tarjeta.outerHTML = tarjetaHTML(buscarProducto(id));
}

// Etiquetas sobre la imagen: descuento, agotado, últimas unidades
function etiquetasHTML(p) {
  const etiquetas = [];
  if (!p.disponible || p.unidades === 0) etiquetas.push('<span class="tag tag-agotado">Agotado</span>');
  else if (p.unidades <= 10) etiquetas.push(`<span class="tag tag-pocas">¡Últimas ${p.unidades}!</span>`);
  if (p.descuento > 0) etiquetas.push(`<span class="tag tag-descuento">-${Math.round(p.descuento * 100)}%</span>`);
  return `<div class="tags">${etiquetas.join('')}</div>`;
}

function precioHTML(p) {
  return `
    <div class="precio">
      <strong>${formatoPrecio(precioFinal(p))}</strong>
      ${p.descuento > 0 ? `<s>${formatoPrecio(p.precio)}</s>` : ''}
    </div>`;
}

function botonFavoritoHTML(p) {
  const activo = favoritos.has(p.id);
  return `
    <button type="button" class="btn-fav ${activo ? 'is-active' : ''}" data-accion="favorito" data-id="${p.id}"
            aria-pressed="${activo}" aria-label="${activo ? 'Quitar de' : 'Agregar a'} favoritos">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 5 6.8 5c2 0 3.4 1.1 4.2 2.4h2C13.8 6.1 15.2 5 17.2 5c3.5 0 5.7 3.3 4.3 6.7C19.5 16.4 12 21 12 21z"/></svg>
    </button>`;
}

// Selector − cantidad + y botón Agregar (se usa en la tarjeta y en la vista rápida)
function comprarHTML(p) {
  const disponible = disponibleParaAgregar(p);
  cantidades[p.id] = Math.min(cantidades[p.id] || 1, Math.max(disponible, 1));

  if (disponible === 0) {
    const texto = p.disponible && p.unidades > 0 ? 'Máximo en tu carrito' : 'Agotado';
    return `<button type="button" class="btn btn-agregar" disabled>${texto}</button>`;
  }

  return `
    <div class="qty" role="group" aria-label="Cantidad">
      <button type="button" data-accion="restar" data-id="${p.id}" aria-label="Quitar uno">−</button>
      <span data-cant="${p.id}">${cantidades[p.id]}</span>
      <button type="button" data-accion="sumar" data-id="${p.id}" aria-label="Agregar uno">+</button>
    </div>
    <button type="button" class="btn btn-primary btn-agregar" data-accion="agregar" data-id="${p.id}">
      Agregar
    </button>`;
}

function tarjetaHTML(p, i = 0) {
  const cats = categoriasComoArray(p.categoria);
  const agotado = !p.disponible || p.unidades === 0;

  return `
    <article class="card ${agotado ? 'is-agotado' : ''}" data-id="${p.id}" style="--i:${i}">
      <div class="card-top">
        <!-- Toda la imagen es un botón: abre la vista rápida -->
        <button type="button" class="card-media" data-accion="ver" data-id="${p.id}" aria-label="Vista rápida de ${p.nombre}">
          <img src="${p.image || `https://picsum.photos/seed/${p.id}/600`}" alt="" loading="lazy">
          ${etiquetasHTML(p)}
          <span class="ver-rapido">👁 Vista rápida</span>
        </button>
        ${botonFavoritoHTML(p)}
      </div>

      <div class="card-body">
        <p class="card-cats">${cats.join(' · ')}</p>
        <h3 class="card-nombre">${p.nombre}</h3>
        <p class="card-desc">${p.descripcion}</p>
        ${precioHTML(p)}
      </div>

      <div class="card-acciones">${comprarHTML(p)}</div>
    </article>`;
}

// Tarjetas "esqueleto" mientras cargan los datos
function pintarEsqueletos(cantidad = 8) {
  document.getElementById('galeria').innerHTML = Array.from({ length: cantidad }, () => `
    <div class="card esqueleto" aria-hidden="true">
      <div class="sk sk-img"></div>
      <div class="card-body">
        <div class="sk sk-linea corta"></div>
        <div class="sk sk-linea"></div>
        <div class="sk sk-linea"></div>
        <div class="sk sk-linea media"></div>
      </div>
    </div>`).join('');
  document.getElementById('texto-resultados').textContent = 'Cargando productos…';
}

// Collage del hero con 4 productos con descuento
function pintarCollage() {
  const destacados = productos.filter(p => p.descuento > 0).slice(0, 4);
  document.getElementById('hero-collage').innerHTML = destacados.map(p => `
    <figure>
      <img src="${p.image}" alt="">
      <figcaption>-${Math.round(p.descuento * 100)}%</figcaption>
    </figure>`).join('');
  document.getElementById('hero-envio').textContent = formatoPrecio(ENVIO_GRATIS_DESDE);
}


// ---------- 6. FAVORITOS ----------

function alternarFavorito(id) {
  const p = buscarProducto(id);
  if (favoritos.has(id)) {
    favoritos.delete(id);
    mostrarAviso(`Quitaste <b>${p.nombre}</b> de favoritos`, '🤍');
  } else {
    favoritos.add(id);
    mostrarAviso(`<b>${p.nombre}</b> está en tus favoritos`, '💜');
  }
  guardar();
  actualizarContadores();

  // Si estamos viendo "solo favoritos", quitar uno cambia la lista completa
  if (filtros.soloFavoritos) pintarGaleria(false);
  else actualizarTarjeta(id);

  refrescarVistaSiAbierta(id);
}


// ---------- 7. CANTIDADES Y CARRITO ----------

function cambiarCantidad(id, cambio) {
  const p = buscarProducto(id);
  const max = disponibleParaAgregar(p);
  const nueva = (cantidades[id] || 1) + cambio;

  if (nueva > max) {
    mostrarAviso(`Solo puedes agregar ${max} unidad${max === 1 ? '' : 'es'} más`, '⚠️');
    return;
  }
  cantidades[id] = Math.max(1, nueva);

  // El número aparece en la tarjeta Y quizá en la vista rápida: actualizamos todos
  document.querySelectorAll(`[data-cant="${id}"]`).forEach(el => el.textContent = cantidades[id]);
}

function agregarAlCarrito(id) {
  const p = buscarProducto(id);
  const cantidad = Math.min(cantidades[id] || 1, disponibleParaAgregar(p));
  if (cantidad <= 0) return;

  carrito[id] = (carrito[id] || 0) + cantidad;
  cantidades[id] = 1;
  guardar();

  actualizarTarjeta(id);
  refrescarVistaSiAbierta(id);
  pintarCarrito();
  actualizarContadores(true);

  // Respuesta visual en el botón recién pintado: "✓ Agregado" por 1,2 s
  document.querySelectorAll(`[data-accion="agregar"][data-id="${id}"]`).forEach(btn => {
    btn.classList.add('is-ok');
    btn.textContent = '✓ Agregado';
    setTimeout(() => { btn.classList.remove('is-ok'); btn.textContent = 'Agregar'; }, 1200);
  });

  mostrarAviso(`<b>${p.nombre}</b> ×${cantidad} agregado al carrito`, `<img src="${p.image}" alt="">`, true);
}

// Cambiar cantidad DENTRO del carrito (+1, -1) o quitar la línea
function cambiarEnCarrito(id, cambio) {
  const p = buscarProducto(id);
  const nueva = (carrito[id] || 0) + cambio;

  if (nueva > p.unidades) {
    mostrarAviso(`No hay más unidades de <b>${p.nombre}</b>`, '⚠️');
    return;
  }
  if (nueva <= 0) delete carrito[id];
  else carrito[id] = nueva;

  guardar();
  pintarCarrito();
  actualizarContadores();
  actualizarTarjeta(id);   // el stock disponible de la tarjeta cambió
}

function quitarDelCarrito(id) {
  const p = buscarProducto(id);
  delete carrito[id];
  guardar();
  pintarCarrito();
  actualizarContadores();
  actualizarTarjeta(id);
  mostrarAviso(`Quitaste <b>${p.nombre}</b> del carrito`, '🗑️');
}

// Totales del carrito: subtotal sin descuento, ahorro, envío y total
function calcularTotales() {
  let unidades = 0, subtotal = 0, conDescuento = 0;

  // Object.entries convierte { 1: 2 } en [["1", 2]]; las claves son texto
  for (const [id, cant] of Object.entries(carrito)) {
    const p = buscarProducto(Number(id));
    if (!p) continue;                  // por si el producto ya no existe
    unidades += cant;
    subtotal += p.precio * cant;
    conDescuento += precioFinal(p) * cant;
  }

  const envio = conDescuento === 0 || conDescuento >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  return { unidades, subtotal, ahorro: subtotal - conDescuento, envio, total: conDescuento + envio, conDescuento };
}

// Contadores del header. "saltar" hace una pequeña animación en el del carrito.
function actualizarContadores(saltar = false) {
  const { unidades } = calcularTotales();
  const cc = document.getElementById('contador-carrito');
  cc.textContent = unidades;
  cc.classList.toggle('vacio', unidades === 0);

  const cf = document.getElementById('contador-favoritos');
  cf.textContent = favoritos.size;
  cf.classList.toggle('vacio', favoritos.size === 0);

  if (saltar) {
    cc.classList.remove('salto');
    void cc.offsetWidth;               // truco: reinicia la animación CSS
    cc.classList.add('salto');
  }
}


// ---------- 8. PANEL DEL CARRITO ----------

function pintarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const footer = document.getElementById('carrito-footer');
  const envioBox = document.getElementById('envio-gratis');
  const t = calcularTotales();

  document.getElementById('carrito-cantidad-titulo').textContent = t.unidades ? `(${t.unidades})` : '';

  if (t.unidades === 0) {
    lista.innerHTML = `
      <div class="carrito-vacio">
        <span>🛒</span>
        <h3>Tu carrito está vacío</h3>
        <p>Explora la tienda y agrega lo que te guste.</p>
        <button type="button" class="btn btn-ghost" data-accion="cerrar-carrito">Seguir comprando</button>
      </div>`;
    footer.innerHTML = '';
    envioBox.hidden = true;
    return;
  }

  // Barra de progreso hacia el envío gratis
  const falta = ENVIO_GRATIS_DESDE - t.conDescuento;
  const porcentaje = Math.min(100, (t.conDescuento / ENVIO_GRATIS_DESDE) * 100);
  envioBox.hidden = false;
  envioBox.innerHTML = `
    <p>${falta > 0
      ? `Te faltan <b>${formatoPrecio(falta)}</b> para el <b>envío gratis</b> 🚚`
      : '🎉 ¡Tienes <b>envío gratis</b>!'}</p>
    <div class="envio-barra"><span style="width:${porcentaje}%"></span></div>`;

  lista.innerHTML = Object.entries(carrito).map(([id, cant]) => {
    const p = buscarProducto(Number(id));
    if (!p) return '';
    return `
      <div class="linea">
        <img src="${p.image}" alt="">
        <div class="linea-info">
          <strong>${p.nombre}</strong>
          <span>${formatoPrecio(precioFinal(p))} c/u</span>
          <div class="qty qty-sm" role="group" aria-label="Cantidad de ${p.nombre}">
            <button type="button" data-accion="carrito-menos" data-id="${p.id}" aria-label="Quitar uno">−</button>
            <span>${cant}</span>
            <button type="button" data-accion="carrito-mas" data-id="${p.id}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <div class="linea-derecha">
          <strong>${formatoPrecio(precioFinal(p) * cant)}</strong>
          <button type="button" class="btn-quitar" data-accion="carrito-quitar" data-id="${p.id}" aria-label="Quitar ${p.nombre}">Quitar</button>
        </div>
      </div>`;
  }).join('');

  footer.innerHTML = `
    <div class="fila"><span>Subtotal</span><span>${formatoPrecio(t.subtotal)}</span></div>
    ${t.ahorro > 0 ? `<div class="fila ahorro"><span>Descuentos</span><span>−${formatoPrecio(t.ahorro)}</span></div>` : ''}
    <div class="fila"><span>Envío</span><span>${t.envio ? formatoPrecio(t.envio) : 'Gratis'}</span></div>
    <div class="fila total"><span>Total</span><span>${formatoPrecio(t.total)}</span></div>
    <button type="button" class="btn btn-primary btn-block btn-lg" data-accion="pagar">Finalizar compra →</button>
    <p class="nota">Compra simulada · aún no se cobra nada</p>`;
}

function abrirCarrito() {
  document.getElementById('panel-carrito').classList.add('abierto');
  document.getElementById('panel-carrito').setAttribute('aria-hidden', 'false');
  document.getElementById('overlay').classList.add('activo');
  document.body.classList.add('sin-scroll');   // la página de atrás no se desplaza
}

function cerrarCarrito() {
  document.getElementById('panel-carrito').classList.remove('abierto');
  document.getElementById('panel-carrito').setAttribute('aria-hidden', 'true');
  document.getElementById('overlay').classList.remove('activo');
  document.body.classList.remove('sin-scroll');
}

// Compra SIMULADA: descontamos el stock en memoria y vaciamos el carrito.
// (Al recargar, el stock vuelve a ser el de productos-demo.js.
//  Con Supabase, aquí iría un insert en una tabla de pedidos.)
function finalizarCompra() {
  const { total } = calcularTotales();
  for (const [id, cant] of Object.entries(carrito)) {
    const p = buscarProducto(Number(id));
    if (p) p.unidades -= cant;
    delete carrito[id];
  }
  guardar();
  actualizarContadores();
  pintarGaleria(false);
  pintarCarrito();

  document.getElementById('lista-carrito').innerHTML = `
    <div class="carrito-vacio exito">
      <span>🎉</span>
      <h3>¡Gracias por tu compra!</h3>
      <p>Tu pedido por <b>${formatoPrecio(total)}</b> fue recibido (simulación).</p>
      <button type="button" class="btn btn-primary" data-accion="cerrar-carrito">Seguir comprando</button>
    </div>`;
}


// ---------- 9. VISTA RÁPIDA (modal) ----------

let idEnVista = null;

function abrirVista(id) {
  idEnVista = id;
  pintarVista();
  document.getElementById('vista-rapida').showModal();
}

function pintarVista() {
  const p = buscarProducto(idEnVista);
  const cats = categoriasComoArray(p.categoria);
  const enCarrito = carrito[p.id] || 0;
  const stock = !p.disponible || p.unidades === 0
    ? '<span class="stock out">● Agotado</span>'
    : `<span class="stock ok">● ${p.unidades} disponibles</span>`;

  document.getElementById('vista-contenido').innerHTML = `
    <button type="button" class="vista-cerrar icon-btn" data-accion="cerrar-vista" aria-label="Cerrar">✕</button>
    <div class="vista-media">
      <img src="${p.image}" alt="${p.nombre}">
      ${etiquetasHTML(p)}
    </div>
    <div class="vista-info">
      <div class="chips">${cats.map(c => `<span class="chip">${c}</span>`).join('')}</div>
      <h2>${p.nombre}</h2>
      <p class="vista-desc">${p.descripcion}</p>
      ${precioHTML(p)}
      ${p.descuento > 0 ? `<p class="vista-ahorro">Ahorras ${formatoPrecio(p.precio - precioFinal(p))}</p>` : ''}
      ${stock}
      ${enCarrito ? `<p class="vista-encarrito">🛒 Ya tienes ${enCarrito} en tu carrito</p>` : ''}
      <div class="vista-comprar">${comprarHTML(p)}</div>
      <div class="vista-extra">
        ${botonFavoritoHTML(p).replace('btn-fav', 'btn-fav btn-fav-inline')}
        <span>🚚 Envío gratis desde ${formatoPrecio(ENVIO_GRATIS_DESDE)}</span>
      </div>
    </div>`;
}

function refrescarVistaSiAbierta(id) {
  if (document.getElementById('vista-rapida').open && idEnVista === id) pintarVista();
}


// ---------- 10. AVISOS (toasts) ----------

// icono puede ser un emoji o una <img>. conBoton agrega "Ver carrito".
function mostrarAviso(mensaje, icono = '✨', conBoton = false) {
  const contenedor = document.getElementById('toasts');
  const aviso = document.createElement('div');
  aviso.className = 'toast';
  aviso.innerHTML = `
    <span class="toast-icono">${icono}</span>
    <p>${mensaje}</p>
    ${conBoton ? '<button type="button" data-accion="abrir-carrito">Ver carrito</button>' : ''}`;
  contenedor.appendChild(aviso);

  // máximo 3 avisos a la vez
  while (contenedor.children.length > 3) contenedor.firstElementChild.remove();

  setTimeout(() => {
    aviso.classList.add('saliendo');
    aviso.addEventListener('animationend', () => aviso.remove());
  }, 2800);
}


// ---------- 11. EVENTOS ----------

// UN solo listener para TODOS los clics de la página ("delegación de
// eventos"). Cada botón dice qué hace con data-accion="..." y, si
// aplica, sobre qué producto con data-id="...". Funciona aunque las
// tarjetas se borren y se vuelvan a crear.
document.addEventListener('click', (evento) => {
  const el = evento.target.closest('[data-accion]');
  if (!el) return;
  const id = Number(el.dataset.id);

  switch (el.dataset.accion) {
    case 'ver':             abrirVista(id); break;
    case 'cerrar-vista':    document.getElementById('vista-rapida').close(); break;
    case 'favorito':        alternarFavorito(id); break;
    case 'sumar':           cambiarCantidad(id, +1); break;
    case 'restar':          cambiarCantidad(id, -1); break;
    case 'agregar':         agregarAlCarrito(id); break;

    case 'abrir-carrito':
      if (document.getElementById('vista-rapida').open) document.getElementById('vista-rapida').close();
      pintarCarrito();
      abrirCarrito();
      break;
    case 'cerrar-carrito':  cerrarCarrito(); break;
    case 'carrito-mas':     cambiarEnCarrito(id, +1); break;
    case 'carrito-menos':   cambiarEnCarrito(id, -1); break;
    case 'carrito-quitar':  quitarDelCarrito(id); break;
    case 'pagar':           finalizarCompra(); break;

    case 'categoria':
      filtros.categoria = el.dataset.cat;
      pintarCategorias();
      pintarGaleria();
      break;
    case 'ver-favoritos':
      filtros.soloFavoritos = !filtros.soloFavoritos;
      el.setAttribute('aria-pressed', filtros.soloFavoritos);
      el.classList.toggle('is-active', filtros.soloFavoritos);
      pintarGaleria();
      document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
      break;
    case 'limpiar-filtros':
      filtros.texto = '';
      filtros.categoria = 'Todas';
      filtros.soloFavoritos = false;
      document.getElementById('input-buscar').value = '';
      document.getElementById('btn-favoritos').setAttribute('aria-pressed', 'false');
      document.getElementById('btn-favoritos').classList.remove('is-active');
      pintarCategorias();
      pintarGaleria();
      break;
  }
});

// Buscador: filtra en cada tecla (evento "input")
document.getElementById('input-buscar').addEventListener('input', (evento) => {
  filtros.texto = evento.target.value;
  pintarGaleria();
});

// Orden
document.getElementById('select-orden').addEventListener('change', (evento) => {
  filtros.orden = evento.target.value;
  pintarGaleria();
});

// Clic en el fondo oscuro del <dialog> (fuera de la tarjeta) = cerrar
document.getElementById('vista-rapida').addEventListener('click', (evento) => {
  if (evento.target.id === 'vista-rapida') evento.target.close();
});

// Esc cierra el carrito (el <dialog> ya se cierra solo con Esc)
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') cerrarCarrito();
});


// ---------- 12. INICIO ----------

async function iniciar() {
  pintarEsqueletos();
  actualizarContadores();

  try {
    productos = await obtenerProductos();
  } catch (error) {
    console.log('Error al cargar productos:', error);
    document.getElementById('galeria').innerHTML =
      '<div class="vacio"><span>😕</span><h3>No pudimos cargar los productos</h3><p>Intenta recargar la página.</p></div>';
    return;
  }

  // Si el carrito guardado tiene productos que ya no existen, los quitamos
  for (const id of Object.keys(carrito)) if (!buscarProducto(Number(id))) delete carrito[id];

  pintarCollage();
  pintarCategorias();
  pintarGaleria();
  pintarCarrito();
  actualizarContadores();
}

iniciar();
