document.getElementById('btn-traer').addEventListener('click', async () => {

  // "async" convierte esta función (el listener del clic) en una función
  // ASÍNCRONA: una función que PUEDE usar "await" adentro para esperar
  // algo que tarda, sin congelar el resto de la página mientras espera.
  //
  // Diferencia clave con localStorage (semana 7): localStorage.getItem()
  // y localStorage.setItem() son operaciones SINCRÓNICAS — ocurren al
  // instante, en tu propio computador, sin viajar a ningún lado. Por eso
  // nunca necesitaste "async"/"await" para leer o escribir en
  // localStorage. Una consulta a Supabase, en cambio, viaja por internet
  // hasta el servidor de Supabase y la respuesta tiene que volver — eso
  // toma un tiempo real (aunque sea poco), y JavaScript necesita una
  // forma explícita de decir "espera aquí a que llegue la respuesta".

  // "await" pausa la ejecución DE ESTA FUNCIÓN (no de toda la página)
  // hasta que la consulta a Supabase responda. Mientras tanto, el resto
  // de tu página sigue funcionando con normalidad — solo esta función
  // en particular se detiene en esta línea hasta tener respuesta real.
  const { data, error } = await db.from('productos_practica').select('*');

  // Sin "await" en la línea de arriba, "data" y "error" NO tendrían el
  // resultado todavía — tendrías una "Promise" (promesa) sin resolver,
  // no los datos reales. Eso es justo lo que "await" evita: te obliga
  // a esperar antes de seguir usando el resultado.
  console.log(data, error);

  if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado. Esta línea SÍ es
  // sincrónica (no necesita await) — ya no estamos esperando nada de
  // Supabase, solo transformando el array "data" que ya llegó.
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);

if (error) {
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }
  else {
    document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
  }
  
  const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';


const descripciones = data.map(producto => producto.descripcion);
  // descripciones es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado3').innerHTML =
    '<ul>' + descripciones.map(d => `<li>${d}</li>`).join('') + '</ul>';

const precios = data.map(producto => producto.precio);
  // precios es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos


  document.getElementById('resultado4').innerHTML =
    '<ul>' + precios.map(p => `<li>${p}</li>`).join('') + '</ul>';

}); // ← aquí se cierra el listener de "btn-traer". Antes faltaba este
    //   cierre y todo el CRUD de abajo quedaba ADENTRO del clic de
    //   "Traer productos" (el botón Agregar no funcionaba hasta hacer
    //   clic en Traer, y el navegador marcaba error de sintaxis).


    //crud

    // productoPrueba es el MOLDE de referencia: el formulario de
    // prueba2.html tiene un campo por cada una de estas propiedades,
    // y construimos un objeto con esta misma forma a partir de lo
    // que escriba el usuario (ver leerFormulario() más abajo).
    const productoPrueba = {
        nombre: '',
        descripcion: 'Este es un producto de prueba',
        precio: 100.000,
        unidades: 10,
        descuento: 0.1,
        disponible: true,
        categoria: ['Categoría de prueba'],
        image: "https://example.com/producto-prueba.jpg",
    };


// AHORA (Supabase):
async function agregarProducto(datos) {

  const { data, error } = await db
    .from('productos_practica')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}

// leerFormulario(): toma los valores que el usuario escribió en el
// formulario y arma un objeto con la MISMA forma que productoPrueba.
// Todo lo que viene de un <input> llega como TEXTO (string), así que
// convertimos cada campo al tipo que espera la base de datos.
function leerFormulario() {
  const form = document.getElementById('form-producto');

  return {
    nombre: form.nombre.value.trim(),            // texto, sin espacios sobrantes
    descripcion: form.descripcion.value.trim(),  // texto
    precio: Number(form.precio.value),           // "100000" → 100000 (número)
    unidades: parseInt(form.unidades.value, 10), // "10" → 10 (entero)
    descuento: Number(form.descuento.value) || 0, // "0.1" → 0.1; vacío → 0
    disponible: form.disponible.checked,         // checkbox → true / false
    // categoria es un ARRAY en productoPrueba: el usuario escribe las
    // categorías separadas por coma ("Ropa, Hombre") y las partimos
    // con split(), quitando espacios y entradas vacías.
    categoria: form.categoria.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== ''),
    image: form.image.value.trim(),              // URL de la imagen
  };
}

// ---- UPDATE ----
// update() recibe un OBJETO (no un array como insert) con los campos
// nuevos, y .eq('id', id) dice CUÁL fila cambiar. ¡Sin el .eq()
// intentaría actualizar TODAS las filas de la tabla!
async function actualizarProducto(id, datos) {
  const { data, error } = await db
    .from('productos_practica')
    .update(datos)
    .eq('id', id)
    .select();         // igual que en insert: devuelve la fila ya cambiada

  if (error) {
    console.log('Error al actualizar:', error);
    return null;
  }
  return data[0];
}

// ---- DELETE ----
// Mismo cuidado que en update: el .eq() es lo que limita el borrado
// a UNA fila.
async function eliminarProducto(id) {
  const { error } = await db
    .from('productos_practica')
    .delete()
    .eq('id', id);

  if (error) {
    console.log('Error al eliminar:', error);
    return false;
  }
  return true;
}

// ---- MODO EDICIÓN ----
// idEditando guarda el id del producto que se está editando.
// null = el formulario está en modo "crear".
let idEditando = null;

// Llena el formulario con un producto (lo contrario de leerFormulario)
function llenarFormulario(p) {
  const form = document.getElementById('form-producto');
  form.nombre.value = p.nombre;
  form.descripcion.value = p.descripcion || '';
  form.precio.value = p.precio;
  form.unidades.value = p.unidades;
  form.descuento.value = p.descuento;
  form.disponible.checked = p.disponible;
  form.categoria.value = (p.categoria || []).join(', ');   // array → "Ropa, Hombre"
  form.image.value = p.image || '';
}

function entrarModoEdicion(producto) {
  idEditando = producto.id;
  llenarFormulario(producto);
  document.getElementById('form-title').textContent = 'Editar producto #' + producto.id;
  document.getElementById('btn-agregar-obj').textContent = 'Guardar cambios';
  document.getElementById('btn-cancelar').hidden = false;
  document.getElementById('form-producto').scrollIntoView({ behavior: 'smooth' });
}

function salirModoEdicion() {
  idEditando = null;
  document.getElementById('form-producto').reset();
  document.getElementById('form-title').textContent = 'Crear producto';
  document.getElementById('btn-agregar-obj').textContent = 'Agregar producto';
  document.getElementById('btn-cancelar').hidden = true;
}

document.getElementById('btn-cancelar').addEventListener('click', salirModoEdicion);

// Escuchamos el evento "submit" del formulario (no el "click" del
// botón): así funciona tanto al hacer clic en "Agregar producto"
// como al presionar Enter, y el navegador valida los campos
// "required" / "min" / "max" ANTES de llegar aquí.
document.getElementById('form-producto').addEventListener('submit', async (evento) => {
    // Por defecto un formulario recarga la página al enviarse;
    // preventDefault() lo evita para que nosotros manejemos el envío.
    evento.preventDefault();

    const datos = leerFormulario();
    const mensaje = document.getElementById('respuesta');

    // El MISMO formulario sirve para crear y para editar:
    // idEditando decide cuál de las dos funciones llamar.
    if (idEditando === null) {
        const creado = await agregarProducto(datos);
        mensaje.innerText = creado
            ? 'Producto agregado con ID: ' + creado.id
            : 'Error al agregar el producto (revisa la consola).';
        if (creado) evento.target.reset();
    } else {
        const actualizado = await actualizarProducto(idEditando, datos);
        mensaje.innerText = actualizado
            ? 'Producto #' + actualizado.id + ' actualizado.'
            : 'Error al actualizar el producto (revisa la consola).';
        if (actualizado) salirModoEdicion();
    }

    mostrarResultados(await traerTodos());   // refrescamos la lista
}); // ← cierre del listener del formulario. Las funciones de búsqueda
    //   van AFUERA: si quedan adentro, solo existen durante el submit.


// ---- BÚSQUEDA ----

async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('productos_practica')   // mismo nombre de tabla que arriba
    .select('*')
    .eq('id', id)      // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .maybeSingle();    // como single(), pero si no existe ese id devuelve
                       // null en vez de error

  if (error) {
    console.log('Error al buscar por id:', error);
    return null;
  }
  return data;
}

// categoria es un ARRAY (["Ropa", "Hombre"]), por eso no sirve .ilike()
// (solo funciona con texto). contains() = p.categoria.includes(texto).
// Ojo: distingue mayúsculas ("ropa" no encuentra "Ropa").
async function buscarProductosPorCategoria(texto) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .contains('categoria', [texto]);

  if (error) {
    console.log('Error al buscar por categoría:', error);
    return [];
  }
  return data;
}

async function traerTodos() {
  const { data, error } = await db.from('productos_practica').select('*');
  if (error) {
    console.log('Error al traer productos:', error);
    return [];
  }
  return data;
}

// Pinta los resultados en la <ul id="search-results">, cada uno con
// sus botones Editar / Eliminar. data-id guarda el id del producto
// en el botón, para saber cuál se clicó (ver listener de abajo).
function mostrarResultados(productos) {
  const lista = document.getElementById('search-results');
  if (productos.length === 0) {
    lista.innerHTML = '<li class="empty">No se encontraron productos.</li>';
    return;
  }
  lista.innerHTML = productos.map(tarjetaProducto).join('');
}

// toLocaleString('es-CO') pone los puntos de miles: 189900 → "189.900"
const formatoPrecio = n => '$' + Number(n).toLocaleString('es-CO');

// Arma el HTML de UNA tarjeta de producto
function tarjetaProducto(p) {
  const descuento = Number(p.descuento) || 0;
  const precioFinal = p.precio * (1 - descuento);   // precio con descuento aplicado
  const hayStock = p.disponible && p.unidades > 0;
  const imagen = p.image || `https://picsum.photos/seed/${p.id}/400/300`;   // imagen de respaldo

  return `
    <li class="product">
      <div class="product-img">
        <img src="${imagen}" alt="${p.nombre}" loading="lazy">
        ${descuento > 0 ? `<span class="badge badge-discount">-${Math.round(descuento * 100)}%</span>` : ''}
        <span class="badge badge-id">#${p.id}</span>
      </div>
      <div class="product-body">
        <h3>${p.nombre}</h3>
        <p class="product-desc">${p.descripcion || ''}</p>
        <div class="price">
          <strong>${formatoPrecio(precioFinal)}</strong>
          ${descuento > 0 ? `<s>${formatoPrecio(p.precio)}</s>` : ''}
        </div>
        <div class="chips">
          ${(p.categoria || []).map(c => `<span class="chip">${c}</span>`).join('')}
        </div>
        <span class="stock ${hayStock ? 'ok' : 'out'}">
          ${hayStock ? `● ${p.unidades} disponibles` : '● Agotado'}
        </span>
        <div class="product-actions">
          <button class="btn btn-soft btn-sm" data-accion="editar" data-id="${p.id}">Editar</button>
          <button class="btn btn-soft-danger btn-sm" data-accion="eliminar" data-id="${p.id}">Eliminar</button>
        </div>
      </div>
    </li>`;
}

// Un SOLO listener en la <ul> para todos los botones ("delegación de
// eventos"): los <li> se borran y se crean de nuevo cada vez que
// pintamos la lista, así que no sirve ponerle un listener a cada botón.
document.getElementById('search-results').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;                       // clic fuera de un botón
  const id = Number(boton.dataset.id);
  const mensaje = document.getElementById('respuesta');

  switch (boton.dataset.accion) {
    case 'editar': {
      const producto = await buscarProductoPorId(id);
      if (producto) entrarModoEdicion(producto);
      break;
    }

    // Primer clic en Eliminar: en vez de borrar, pregunta en la misma fila.
    // (confirm() no siempre funciona, así que lo hacemos con botones)
    case 'eliminar':
      boton.insertAdjacentHTML('afterend', `
        <span class="confirm"> ¿Seguro?
          <button class="btn btn-danger btn-sm" data-accion="confirmar" data-id="${id}">Sí, eliminar</button>
          <button class="btn btn-ghost btn-sm" data-accion="no">No</button>
        </span>`);
      boton.hidden = true;
      break;

    case 'no':
      boton.closest('li').querySelector('[data-accion="eliminar"]').hidden = false;
      boton.closest('.confirm').remove();   // quitamos el "¿Seguro?"
      break;

    case 'confirmar': {
      const ok = await eliminarProducto(id);
      mensaje.innerText = ok
        ? 'Producto #' + id + ' eliminado.'
        : 'Error al eliminar el producto (revisa la consola).';
      if (ok && idEditando === id) salirModoEdicion();   // si lo estabas editando
      mostrarResultados(await traerTodos());
      break;
    }
  }
});

document.getElementById('search-form').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const texto = document.getElementById('input-search').value.trim();

  if (texto === '') {
    mostrarResultados(await traerTodos());
  } else if (/^\d+$/.test(texto)) {   // solo dígitos → es un id
    const producto = await buscarProductoPorId(Number(texto));
    mostrarResultados(producto ? [producto] : []);
  } else {
    mostrarResultados(await buscarProductosPorCategoria(texto));
  }
});

// Al abrir la página cargamos todos los productos (READ)
traerTodos().then(mostrarResultados);
