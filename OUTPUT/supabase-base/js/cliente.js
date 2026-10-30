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
// defecto, ese evento hace que el navegador RECARGUE la página entera —
// comportamiento heredado de cuando los formularios mandaban sus datos a
// otra página de servidor, décadas atrás. Como aquí todo lo manejamos con
// JavaScript (sin recargar nada), hay que apagar ese comportamiento a
// propósito.
document.getElementById('form-registro').addEventListener('submit', async (event) => {

  // event.preventDefault() le dice al navegador "no hagas lo que harías
  // normalmente con este evento" — en este caso, no recargues la página.
  // Sin esta línea, la página se refrescaría apenas se hiciera clic en
  // "Crear cuenta", y perderías cualquier mensaje que fueras a mostrar.
  event.preventDefault();

  // event.target es el elemento que disparó el evento — en un 'submit',
  // siempre es el propio <form>. Lo guardamos en una variable para poder
  // usarlo más abajo (form.reset()) sin tener que volver a buscarlo.
  const form = event.target;

  const cliente = await registrarCliente(
    document.getElementById('registro-nombre').value.trim(),
    document.getElementById('registro-correo').value.trim(),
    document.getElementById('registro-password').value
  );

  if (cliente) {
    document.getElementById('estado-sesion').textContent =
      'Cuenta creada. Ahora inicia sesión con ese correo y contraseña.';
    form.reset(); // vacía los 3 campos del formulario, para la próxima persona
  } else {
    document.getElementById('estado-sesion').textContent =
      'No se pudo crear la cuenta. Revisa la consola.';
  }
});

//iniciar sesión

async function iniciarSesion(correo, contrasena) {

  // db.auth.signInWithPassword() es para alguien que YA se registró antes
  // (sección 4.1) — no crea ningún usuario nuevo, solo verifica que el
  // correo y la contraseña coincidan con uno que ya existe en Auth.
  //
  // Lo importante pasa "por detrás", sin que se vea en este código: si la
  // verificación sale bien, el cliente de Supabase (la variable db, la
  // misma de siempre) GUARDA la sesión internamente — normalmente en el
  // almacenamiento del navegador — y, desde este momento, la adjunta sola
  // a cada petición futura que hagas con db, sea a productos_practica, a
  // clientes_practca o a cualquier otra tabla. No hay que "pasarle" el
  // usuario a mano a ninguna otra función.
  const { data, error } = await db.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    console.log('Error al iniciar sesión:', error);
    return null;
  }

  // Aquí data.user también trae el id real del usuario — el mismo valor
  // que auth.uid() va a devolver dentro de cualquier política de RLS
  // mientras esta sesión siga activa.
  return data.user;
}

// Mismo patrón explicado en el formulario de registro: 'submit' es el
// evento del <form>, y hay que apagar la recarga automática de página.
document.getElementById('form-login').addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que el navegador recargue la página
  const form = event.target; // el propio <form>, guardado para usar después

  const usuario = await iniciarSesion(
    document.getElementById('login-correo').value.trim(),
    document.getElementById('login-password').value
  );

  if (usuario) {
    form.reset();
    mostrarEstadoSesion(); // definida en la sección 5
  } else {
    document.getElementById('estado-sesion').textContent =
      'Correo o contraseña incorrectos.';
  }
});

async function mostrarEstadoSesion() {
  const { data } = await db.auth.getUser();
  const estado = document.getElementById('estado-sesion');
  const haySesion = Boolean(data.user);

  // El atributo hidden esconde un elemento; poner .hidden = true/false es
  // como prenderlo o apagarlo desde JavaScript.
  document.getElementById('auth-forms').hidden = haySesion;
  document.getElementById('form-perfil').hidden = !haySesion;
  document.getElementById('btn-logout').hidden = !haySesion;
  document.getElementById('btn-editar-perfil').hidden = !haySesion;
  if (!haySesion) cerrarSidebar();

  if (haySesion) {
    estado.textContent = `Sesión iniciada como ${data.user.email}`;

    // Primero LEER (SELECT), después mostrar esos datos en el formulario.
    const cliente = await leerCliente(data.user.id);
    if (cliente) {
      llenarFormularioPerfil(cliente);
    } else {
      estado.textContent = 'No se pudo leer tu perfil. Revisa la consola.';
    }
  } else {
    estado.textContent = 'No has iniciado sesión.';
  }
}

// ---------- Perfil: leer (SELECT) y actualizar (UPDATE) ----------

// Columnas que no se muestran (las maneja el sistema, no el cliente) y
// columnas que se muestran pero no se pueden editar.
const COLUMNAS_OCULTAS = ['id', 'rol', 'created_at'];
const COLUMNAS_SOLO_LECTURA = ['correo'];

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

function llenarFormularioPerfil(cliente) {
  const contenedor = document.getElementById('perfil-campos');
  contenedor.innerHTML = ''; // limpia campos de una sesión anterior

  // Object.entries() convierte { nombre: 'Ana', correo: 'a@b.co' } en
  // [ ['nombre', 'Ana'], ['correo', 'a@b.co'] ], para recorrer cada
  // columna con su valor y crear un <label> + <input> por cada una.
  for (const [columna, valor] of Object.entries(cliente)) {
    if (COLUMNAS_OCULTAS.includes(columna)) continue;

    const label = document.createElement('label');
    label.htmlFor = `perfil-${columna}`;
    label.textContent = columna.replace(/_/g, ' ');

    const input = document.createElement('input');
    input.id = `perfil-${columna}`;
    input.name = columna;
    input.value = valor ?? ''; // ?? → si la columna viene en null, deja el campo vacío
    input.readOnly = COLUMNAS_SOLO_LECTURA.includes(columna);

    contenedor.append(label, input);
  }
}

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

  const estado = document.getElementById('estado-sesion');
  const actualizado = await actualizarCliente(data.user.id, cambios);

  if (actualizado) {
    estado.textContent = 'Datos actualizados.';
    llenarFormularioPerfil(actualizado); // muestra lo que quedó guardado de verdad
    cerrarSidebar(); // cierra el panel para que se vea el mensaje en la tarjeta
  } else {
    estado.textContent = 'No se pudieron guardar los cambios. Revisa la consola.';
  }
});

// ---------- Aside del perfil (drawer) ----------

// Abrir y cerrar es solo poner o quitar la clase .open: el CSS se encarga
// de la animación (transform: translateX). El JS no mueve nada a mano.
function abrirSidebar() {
  const sidebar = document.getElementById('sidebar-perfil');
  sidebar.classList.add('open');
  sidebar.inert = false; // ahora sí se puede escribir en los campos
  document.getElementById('sidebar-overlay').classList.add('open');
}

function cerrarSidebar() {
  const sidebar = document.getElementById('sidebar-perfil');
  sidebar.classList.remove('open');
  sidebar.inert = true;
  document.getElementById('sidebar-overlay').classList.remove('open');
}

document.getElementById('btn-editar-perfil').addEventListener('click', abrirSidebar);
document.getElementById('btn-cerrar-sidebar').addEventListener('click', cerrarSidebar);
document.getElementById('sidebar-overlay').addEventListener('click', cerrarSidebar); // clic afuera

// 'keydown' se dispara con cualquier tecla; event.key dice cuál fue.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') cerrarSidebar();
});

// Al cargar la página, revisa si ya había una sesión activa
mostrarEstadoSesion();

document.getElementById('btn-logout').addEventListener('click', async () => {
  await db.auth.signOut();
  mostrarEstadoSesion();
});