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
  const { data, error } = await db.from('products_practica').select('*');

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
    .from('products_practica')  // la tabla
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

// Escuchamos el evento "submit" del formulario (no el "click" del
// botón): así funciona tanto al hacer clic en "Agregar producto"
// como al presionar Enter, y el navegador valida los campos
// "required" / "min" / "max" ANTES de llegar aquí.
document.getElementById('form-producto').addEventListener('submit', async (evento) => {
    // Por defecto un formulario recarga la página al enviarse;
    // preventDefault() lo evita para que nosotros manejemos el envío.
    evento.preventDefault();

    const nuevoProducto = leerFormulario();
    console.log('Enviando a Supabase:', nuevoProducto);

    const respuesta = await agregarProducto(nuevoProducto);
    if (respuesta) {
        document.getElementById('respuesta').innerText = 'Producto agregado con ID: ' + respuesta.id;
        evento.target.reset();   // limpiamos el formulario para el siguiente producto
    } else {
        document.getElementById('respuesta').innerText = 'Error al agregar el producto (revisa la consola).';
    }

// AHORA:
async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .eq('id', id)    // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .single();         // single() = "espero exactamente una fila, dámela
                        // como objeto, no como array de un elemento"

  if (error) return null;
  return data;
}

async function buscarProductosPorNombre(texto) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .ilike('nombre', `%${texto}%`);
    // ilike = "like" insensible a mayúsculas/minúsculas.
    // los símbolos % significan "cualquier texto antes/después" —
    // equivalente a .toLowerCase().includes(texto)

  if (error) return [];
  return data;
}




});
