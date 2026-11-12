// =========================================
// cliente.js — Cuenta del cliente
//
// Estructura del archivo:
//   1. Registro (signUp + insert en clientes_practca)
//   2. Inicio de sesión
//   3. Estado de sesión: decide qué vista se ve (login o app)
//   4. Perfil: leer (SELECT), mostrar y actualizar (UPDATE)
//   5. Navegación de la barra lateral (secciones)
//   6. Productos (SELECT a productos_practica)
//   7. Ajustes (tema, animaciones, contraseña, datos locales)
//   8. Utilidades (avisos, iniciales, escapar texto)
//   9. Inicio
// =========================================


// ---------- 1. REGISTRO ----------

async function registrarCliente(nombre, correo, contrasena) {

  // db.auth.signUp() NO toca ninguna tabla tuya todavía — habla directo con
  // el sistema de autenticación interno de Supabase (algo así como una
  // tabla especial, auth.users, que tú no administras a mano). Le mandas
  // correo y contraseña, y Supabase por detrás: valida el formato del
  // correo, guarda la contraseña de forma segura (nunca en texto plano),
  // y crea un identificador único nuevo (un uuid) para esta persona.
  //
  // El resultado llega en dos partes, igual que en todas las llamadas a
  // Supabase que ya conoces (data / error):
  //   - data.user   → los datos del usuario recién creado. data.user.id
  //                   es el uuid real — EL MISMO que vamos a usar como id
  //                   en clientes_practca, dos líneas más abajo.
  //   - data.session → si tu proyecto exige confirmar el correo antes de
  //                   dejar entrar (ver guía, sección 7), esto llega en
  //                   null: el usuario ya existe, pero todavía no hay
  //                   sesión iniciada hasta que confirme.
  const { data, error } = await db.auth.signUp({
    email: correo,
    password: contrasena,
  });

  // Mismo patrón de "revisar error antes de seguir" que ya usaste en el
  // CRUD de productos — si signUp() falló (correo repetido, contraseña
  // muy corta, etc.), ni siquiera intentamos el segundo paso.
  if (error) {
    console.log('Error al registrar:', error);
    return null;
  }

  // Ahora sí tocamos una tabla tuya: clientes_practca. Este insert() es
  // igual al que ya usaste en agregarProducto() — la única diferencia es
  // que aquí SÍ mandamos el id a mano (data.user.id), en vez de dejar que
  // Supabase lo autogenere, porque este id tiene que coincidir exactamente
  // con el que Auth le acaba de asignar al usuario.
  const { data: cliente, error: errorCliente } = await db
    .from('clientes_practca')
    .insert([{ id: data.user.id, nombre, correo, rol: 'cliente' }])
    .select();

  if (errorCliente) {
    console.log('Error al crear el perfil:', errorCliente);
    return null;
  }

  return cliente[0];
}

// 'submit' es el evento que dispara un <form> cuando alguien hace clic en
// su botón de tipo submit (o presiona Enter dentro de un campo). Por
// defecto, ese evento hace que el navegador RECARGUE la página entera, así
// que lo apagamos con event.preventDefault().
document.getElementById('form-registro').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target; // el propio <form>

  const cliente = await registrarCliente(
    document.getElementById('registro-nombre').value.trim(),
    document.getElementById('registro-correo').value.trim(),
    document.getElementById('registro-password').value
  );

  if (cliente) {
    document.getElementById('estado-sesion').textContent =
      'Cuenta creada. Ahora inicia sesión con ese correo y contraseña.';
    form.reset();
  } else {
    document.getElementById('estado-sesion').textContent =
      'No se pudo crear la cuenta. Revisa la consola.';
  }
});


// ---------- 2. INICIO DE SESIÓN ----------

async function iniciarSesion(correo, contrasena) {

  // db.auth.signInWithPassword() es para alguien que YA se registró antes.
  // Si sale bien, el cliente de Supabase (db) GUARDA la sesión en el
  // navegador y la adjunta sola a cada petición futura, sea a
  // productos_practica, a clientes_practca o a cualquier otra tabla.
  const { data, error } = await db.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    console.log('Error al iniciar sesión:', error);
    return null;
  }

  // data.user.id es el mismo valor que auth.uid() devuelve en las
  // políticas de RLS mientras esta sesión siga activa.
  return data.user;
}

document.getElementById('form-login').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;

  const usuario = await iniciarSesion(
    document.getElementById('login-correo').value.trim(),
    document.getElementById('login-password').value
  );

  if (usuario) {
    form.reset();
    mostrarEstadoSesion();
  } else {
    document.getElementById('estado-sesion').textContent =
      'Correo o contraseña incorrectos.';
  }
});


// ---------- 3. ESTADO DE SESIÓN ----------

// La página tiene DOS vistas: #vista-auth (login/registro) y #vista-app
// (sidebar + secciones). Esta función mira si hay sesión y prende una u otra.
async function mostrarEstadoSesion() {
  const { data } = await db.auth.getUser();
  const haySesion = Boolean(data.user);

  document.getElementById('vista-auth').hidden = haySesion;
  document.getElementById('vista-app').hidden = !haySesion;
  document.body.classList.toggle('con-sesion', haySesion);

  if (!haySesion) {
    document.getElementById('estado-sesion').textContent = 'No has iniciado sesión.';
    return;
  }

  // Abre la sección que diga la URL (#productos, #ajustes…) o "cuenta"
  mostrarSeccion(location.hash.slice(1) || 'cuenta');
  pintarResumenLocal();

  // Primero LEER (SELECT), después mostrar esos datos.
  const cliente = await leerCliente(data.user.id);
  if (cliente) {
    pintarPerfil(cliente);
  } else {
    // Sin fila en clientes_practca igual mostramos el correo de Auth
    pintarPerfil({ correo: data.user.email });
    mostrarAviso('No se pudo leer tu perfil. Revisa la consola.', '⚠️');
  }

  // Los productos se cargan una sola vez por sesión
  if (productos.length === 0) cargarProductos();
}

async function cerrarSesion() {
  await db.auth.signOut();
  history.replaceState(null, '', location.pathname); // limpia el #seccion
  mostrarEstadoSesion();
}

document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
document.getElementById('btn-logout-ajustes').addEventListener('click', cerrarSesion);


// ---------- 4. PERFIL ----------

// Columnas que no se muestran (las maneja el sistema, no el cliente) y
// columnas que se muestran pero no se pueden editar.
const COLUMNAS_OCULTAS = ['id', 'rol', 'created_at'];
const COLUMNAS_SOLO_LECTURA = ['correo'];

let clienteActual = null; // la última fila leída de clientes_practca

async function leerCliente(id) {

  // .eq('id', id) filtra la fila de ESTE usuario, y .single() le dice a
  // Supabase "espero exactamente una fila": en vez de un array [ {...} ],
  // data llega directo como el objeto { nombre, correo, ... }.
  const { data, error } = await db
    .from('clientes_practca')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.log('Error al leer el perfil:', error);
    return null;
  }

  return data;
}

// "nombre_completo" → "Nombre completo"
const etiquetaColumna = (columna) => {
  const texto = columna.replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// Pinta el perfil en TODOS los lugares donde aparece: sidebar, encabezado
// de "Mi cuenta" y la lista de datos. Por eso se usan atributos como
// data-nombre: querySelectorAll los encuentra todos de una vez.
function pintarPerfil(cliente) {
  clienteActual = cliente;
  const nombre = cliente.nombre || cliente.correo || 'Cliente';

  document.querySelectorAll('[data-nombre]').forEach((el) => (el.textContent = nombre));
  document.querySelectorAll('[data-correo]').forEach((el) => (el.textContent = cliente.correo || ''));
  document.querySelectorAll('[data-avatar]').forEach((el) => (el.textContent = iniciales(nombre)));
  document.getElementById('perfil-rol').textContent = cliente.rol || 'cliente';

  // Modo lectura: un <div><dt>columna</dt><dd>valor</dd></div> por columna
  const filas = Object.entries(cliente)
    .filter(([columna]) => !COLUMNAS_OCULTAS.includes(columna))
    .map(([columna, valor]) => {
      const vacio = valor === null || valor === '';
      return `
        <div>
          <dt>${escapar(etiquetaColumna(columna))}</dt>
          <dd class="${vacio ? 'vacio-dato' : ''}">${vacio ? 'Sin completar' : escapar(valor)}</dd>
        </div>`;
    });

  if (cliente.created_at) {
    const fecha = new Date(cliente.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    filas.push(`<div><dt>Miembro desde</dt><dd>${fecha}</dd></div>`);
  }

  document.getElementById('perfil-datos').innerHTML = filas.join('');
}

// Modo edición: crea un <label> + <input> por cada columna
function llenarFormularioPerfil(cliente) {
  const contenedor = document.getElementById('perfil-campos');
  contenedor.innerHTML = '';

  // Object.entries() convierte { nombre: 'Ana', correo: 'a@b.co' } en
  // [ ['nombre', 'Ana'], ['correo', 'a@b.co'] ], para recorrer cada
  // columna con su valor.
  for (const [columna, valor] of Object.entries(cliente)) {
    if (COLUMNAS_OCULTAS.includes(columna)) continue;

    const label = document.createElement('label');
    label.className = 'campo';

    const texto = document.createElement('span');
    texto.textContent = etiquetaColumna(columna);

    const input = document.createElement('input');
    input.name = columna;
    input.value = valor ?? ''; // ?? → si la columna viene en null, deja el campo vacío
    input.readOnly = COLUMNAS_SOLO_LECTURA.includes(columna);

    label.append(texto, input);
    contenedor.append(label);
  }
}

// Cambia entre "ver datos" y "editar datos" dentro del mismo panel
function modoEdicion(activar) {
  document.getElementById('perfil-datos').hidden = activar;
  document.getElementById('form-perfil').hidden = !activar;
  document.getElementById('btn-editar-perfil').hidden = activar;

  if (activar && clienteActual) {
    llenarFormularioPerfil(clienteActual);
    document.querySelector('#perfil-campos input:not([readonly])')?.focus();
  }
}

document.getElementById('btn-editar-perfil').addEventListener('click', () => modoEdicion(true));
document.getElementById('btn-cancelar-perfil').addEventListener('click', () => modoEdicion(false));

async function actualizarCliente(id, cambios) {

  // update() recibe SOLO las columnas que cambian, y .eq('id', id) dice a
  // cuál fila aplicarlas. Sin el .eq(), intentaría actualizar TODAS las filas.
  const { data, error } = await db
    .from('clientes_practca')
    .update(cambios)
    .eq('id', id)
    .select();

  if (error) {
    console.log('Error al actualizar el perfil:', error);
    return null;
  }

  // Si RLS no permite el update, Supabase NO da error: simplemente
  // actualiza 0 filas y devuelve un array vacío.
  if (data.length === 0) {
    console.log('Se actualizaron 0 filas: revisa la política de UPDATE (RLS).');
    return null;
  }

  return data[0];
}

document.getElementById('form-perfil').addEventListener('submit', async (event) => {
  event.preventDefault();

  const { data } = await db.auth.getUser();
  if (!data.user) return;

  // Arma el objeto de cambios solo con los campos editables.
  const cambios = {};
  document.querySelectorAll('#perfil-campos input:not([readonly])').forEach((input) => {
    const valor = input.value.trim();
    cambios[input.name] = valor === '' ? null : valor; // vacío → null en la base de datos
  });

  const actualizado = await actualizarCliente(data.user.id, cambios);

  if (actualizado) {
    pintarPerfil(actualizado); // muestra lo que quedó guardado de verdad
    modoEdicion(false);
    mostrarAviso('Tus datos se guardaron', '✅');
  } else {
    mostrarAviso('No se pudieron guardar los cambios. Revisa la consola.', '⚠️');
  }
});


// ---------- 5. NAVEGACIÓN (barra lateral) ----------

const SECCIONES = ['cuenta', 'productos', 'ajustes'];

// Muestra UNA sección y esconde las demás. aria-current="page" marca el
// botón activo: el CSS lo usa para pintar la barrita de degradado.
function mostrarSeccion(nombre) {
  if (!SECCIONES.includes(nombre)) nombre = 'cuenta';

  document.querySelectorAll('[data-panel]').forEach((seccion) => {
    seccion.hidden = seccion.dataset.panel !== nombre;
  });
  document.querySelectorAll('.nav [data-seccion]').forEach((boton) => {
    if (boton.dataset.seccion === nombre) boton.setAttribute('aria-current', 'page');
    else boton.removeAttribute('aria-current');
  });

  // replaceState cambia el #… de la URL sin recargar: al refrescar la
  // página vuelves a la misma sección.
  history.replaceState(null, '', `#${nombre}`);
  window.scrollTo({ top: 0 });
}

// Delegación de eventos: un solo listener para todo lo que tenga
// data-seccion (botones del menú y la tarjeta "productos en la tienda").
document.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-seccion]');
  if (boton) mostrarSeccion(boton.dataset.seccion);
});


// ---------- 6. PRODUCTOS ----------

let productos = [];
const filtros = { texto: '', categoria: 'Todas' };

// Ahora sí, datos reales: el mismo select() del CRUD de productos.
// La sesión del cliente viaja sola en la petición (ver sección 2).
async function cargarProductos() {
  pintarEsqueletos();

  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .order('id');

  if (error) {
    console.log('Error al cargar productos:', error);
    document.getElementById('galeria').innerHTML = `
      <div class="vacio">
        <span>😕</span>
        <h3>No pudimos cargar los productos</h3>
        <p>Revisa la consola (¿la política de SELECT de productos_practica permite leer?).</p>
      </div>`;
    document.getElementById('texto-resultados').textContent = '';
    return;
  }

  productos = data;
  document.getElementById('stat-productos').textContent = productos.length;
  pintarCategorias();
  pintarProductos();
}

// Mismas utilidades que galeria.js
const formatoPrecio = (n) => '$' + Math.round(n).toLocaleString('es-CO');
const precioFinal = (p) => p.precio * (1 - (Number(p.descuento) || 0));
const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Supabase puede devolver categoria como array o como texto "{Ropa,Hombre}"
function categoriasComoArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor !== 'string') return [];
  return valor.replace(/[{}"]/g, '').split(',').map((c) => c.trim()).filter(Boolean);
}

function productosVisibles() {
  const texto = normalizar(filtros.texto.trim());
  return productos.filter((p) => {
    const cats = categoriasComoArray(p.categoria);
    if (filtros.categoria !== 'Todas' && !cats.includes(filtros.categoria)) return false;
    if (texto && !normalizar([p.nombre, p.descripcion, ...cats].join(' ')).includes(texto)) return false;
    return true;
  });
}

function pintarCategorias() {
  const todas = [...new Set(productos.flatMap((p) => categoriasComoArray(p.categoria)))]
    .sort((a, b) => a.localeCompare(b, 'es'));

  document.getElementById('chips-categorias').innerHTML = ['Todas', ...todas]
    .map((cat) => `
      <button type="button" class="chip-filtro ${cat === filtros.categoria ? 'is-active' : ''}"
              data-cat="${escapar(cat)}" aria-pressed="${cat === filtros.categoria}">
        ${escapar(cat)}
      </button>`)
    .join('');
}

function tarjetaProducto(p, i) {
  const cats = categoriasComoArray(p.categoria);
  const agotado = !p.disponible || p.unidades === 0;
  const fav = favoritosGuardados().includes(p.id);

  const etiquetas = [];
  if (agotado) etiquetas.push('<span class="tag tag-agotado">Agotado</span>');
  else if (p.unidades <= 10) etiquetas.push(`<span class="tag tag-pocas">¡Últimas ${p.unidades}!</span>`);
  if (p.descuento > 0) etiquetas.push(`<span class="tag tag-descuento">-${Math.round(p.descuento * 100)}%</span>`);

  return `
    <article class="card ${agotado ? 'is-agotado' : ''}" style="--i:${i}">
      <div class="card-top">
        <div class="card-media">
          <img src="${p.image || `https://picsum.photos/seed/${p.id}/600`}" alt="" loading="lazy">
          <div class="tags">${etiquetas.join('')}</div>
        </div>
        <button type="button" class="btn-fav ${fav ? 'is-active' : ''}" data-fav="${p.id}"
                aria-pressed="${fav}" aria-label="${fav ? 'Quitar de' : 'Agregar a'} favoritos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 5 6.8 5c2 0 3.4 1.1 4.2 2.4h2C13.8 6.1 15.2 5 17.2 5c3.5 0 5.7 3.3 4.3 6.7C19.5 16.4 12 21 12 21z"/></svg>
        </button>
      </div>
      <div class="card-body">
        <p class="card-cats">${escapar(cats.join(' · '))}</p>
        <h3 class="card-nombre">${escapar(p.nombre)}</h3>
        <p class="card-desc">${escapar(p.descripcion ?? '')}</p>
        <div class="precio">
          <strong>${formatoPrecio(precioFinal(p))}</strong>
          ${p.descuento > 0 ? `<s>${formatoPrecio(p.precio)}</s>` : ''}
        </div>
      </div>
    </article>`;
}

function pintarProductos(animar = true) {
  const galeria = document.getElementById('galeria');
  const lista = productosVisibles();

  document.getElementById('texto-resultados').textContent =
    `Mostrando ${lista.length} de ${productos.length} productos`;
  galeria.classList.toggle('animar', animar);

  galeria.innerHTML = lista.length
    ? lista.map(tarjetaProducto).join('')
    : `<div class="vacio">
         <span>🔍</span>
         <h3>No encontramos productos</h3>
         <p>Prueba con otra búsqueda o categoría.</p>
       </div>`;
}

function pintarEsqueletos(cantidad = 6) {
  document.getElementById('galeria').innerHTML = Array.from({ length: cantidad }, () => `
    <div class="card esqueleto" aria-hidden="true">
      <div class="sk sk-img"></div>
      <div class="card-body">
        <div class="sk sk-linea corta"></div>
        <div class="sk sk-linea"></div>
        <div class="sk sk-linea media"></div>
      </div>
    </div>`).join('');
  document.getElementById('texto-resultados').textContent = 'Cargando productos…';
}

// Favoritos: se guardan en localStorage con la MISMA clave que usa
// galeria.js ('favoritos'), así lo que marques aquí aparece en la tienda.
function favoritosGuardados() {
  try {
    return JSON.parse(localStorage.getItem('favoritos')) ?? [];
  } catch {
    return [];
  }
}

function alternarFavorito(id) {
  const favs = new Set(favoritosGuardados());
  const p = productos.find((x) => x.id === id);
  if (favs.has(id)) {
    favs.delete(id);
    mostrarAviso(`Quitaste <b>${escapar(p.nombre)}</b> de favoritos`, '🤍');
  } else {
    favs.add(id);
    mostrarAviso(`<b>${escapar(p.nombre)}</b> está en tus favoritos`, '💜');
  }
  localStorage.setItem('favoritos', JSON.stringify([...favs]));
  pintarProductos(false);
  pintarResumenLocal();
}

document.getElementById('buscar-producto').addEventListener('input', (event) => {
  filtros.texto = event.target.value;
  pintarProductos();
});

document.getElementById('seccion-productos').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-cat]');
  if (chip) {
    filtros.categoria = chip.dataset.cat;
    pintarCategorias();
    pintarProductos();
    return;
  }
  const fav = event.target.closest('[data-fav]');
  if (fav) alternarFavorito(Number(fav.dataset.fav));
});

// Tarjetas de resumen de "Mi cuenta": favoritos y unidades en el carrito
function pintarResumenLocal() {
  let carrito = {};
  try { carrito = JSON.parse(localStorage.getItem('carrito')) ?? {}; } catch {}
  const unidades = Object.values(carrito).reduce((suma, n) => suma + n, 0);

  document.getElementById('stat-favoritos').textContent = favoritosGuardados().length;
  document.getElementById('stat-carrito').textContent = unidades;
}


// ---------- 7. AJUSTES ----------

const raiz = document.documentElement; // <html>
const ajusteTema = document.getElementById('ajuste-tema');
const ajusteMovimiento = document.getElementById('ajuste-movimiento');

// Modo oscuro: escribe lo mismo que theme.js (data-theme + localStorage 'theme')
ajusteTema.addEventListener('change', () => {
  const tema = ajusteTema.checked ? 'dark' : 'light';
  raiz.dataset.theme = tema;
  localStorage.setItem('theme', tema);
});

// MutationObserver "vigila" un elemento y avisa cuando cambia. Así, si
// usas el interruptor flotante (theme.js), el switch de Ajustes se
// actualiza solo, y viceversa.
function sincronizarTema() {
  ajusteTema.checked = raiz.dataset.theme === 'dark';
}
new MutationObserver(sincronizarTema).observe(raiz, { attributes: true, attributeFilter: ['data-theme'] });
sincronizarTema();

// Reducir animaciones: data-motion="reduce" en <html>; el CSS apaga todo
ajusteMovimiento.checked = raiz.dataset.motion === 'reduce';
ajusteMovimiento.addEventListener('change', () => {
  if (ajusteMovimiento.checked) raiz.dataset.motion = 'reduce';
  else delete raiz.dataset.motion;
  localStorage.setItem('reduce-motion', ajusteMovimiento.checked);
});

// Cambiar contraseña: db.auth.updateUser() modifica al usuario que tiene
// la sesión activa — no hace falta mandar el id.
document.getElementById('form-password').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const nueva = document.getElementById('password-nueva').value;
  const repetir = document.getElementById('password-repetir').value;

  if (nueva !== repetir) {
    mostrarAviso('Las contraseñas no coinciden', '⚠️');
    return;
  }

  const { error } = await db.auth.updateUser({ password: nueva });
  if (error) {
    console.log('Error al cambiar la contraseña:', error);
    mostrarAviso('No se pudo cambiar la contraseña. Revisa la consola.', '⚠️');
    return;
  }

  form.reset();
  mostrarAviso('Contraseña actualizada', '🔒');
});

document.getElementById('btn-vaciar-local').addEventListener('click', () => {
  localStorage.removeItem('favoritos');
  localStorage.removeItem('carrito');
  pintarResumenLocal();
  if (productos.length) pintarProductos(false);
  mostrarAviso('Favoritos y carrito vaciados', '🧹');
});


// ---------- 8. UTILIDADES ----------

// "Ana María Pérez" → "AM"
function iniciales(texto) {
  return texto
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('') || '?';
}

// Convierte < > & " ' en texto seguro antes de meterlo con innerHTML.
// Sin esto, un nombre como "<img onerror=...>" se ejecutaría como HTML.
function escapar(valor) {
  return String(valor).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Aviso flotante (mismo estilo que los toasts de la galería)
function mostrarAviso(mensaje, icono = '✨') {
  const contenedor = document.getElementById('toasts');
  const aviso = document.createElement('div');
  aviso.className = 'toast';
  aviso.innerHTML = `<span class="toast-icono">${icono}</span><p>${mensaje}</p>`;
  contenedor.appendChild(aviso);

  while (contenedor.children.length > 3) contenedor.firstElementChild.remove();

  setTimeout(() => {
    aviso.classList.add('saliendo');
    aviso.addEventListener('animationend', () => aviso.remove());
    setTimeout(() => aviso.remove(), 400); // por si las animaciones están apagadas
  }, 2800);
}


// ---------- 9. INICIO ----------

// Al cargar la página, revisa si ya había una sesión activa
mostrarEstadoSesion();
