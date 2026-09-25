const CLAVE_USUARIOS = "usuarios-juego";

const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const reglas = {
  longitud: /.{6,}/,
  numero: /\d/,
  mayuscula: /[A-Z]/,
  especial: /[^A-Za-z0-9]/,
};

const formLogin = document.getElementById("form-login");
const inputNombre = document.getElementById("nombre");
const inputAlias = document.getElementById("alias");
const inputEmail = document.getElementById("email");
const inputContrasena = document.getElementById("contrasena");
const loginError = document.getElementById("login-error");
const requisitos = document.querySelectorAll("#requisitos li");

// Usuarios registrados desde el navegador (guardados como JSON en localStorage)
function obtenerUsuariosGuardados() {
  const guardado = localStorage.getItem(CLAVE_USUARIOS);

  if (!guardado) return [];

  try {
    return JSON.parse(guardado);
  } catch (error) {
    return [];
  }
}

function guardarUsuario(usuario) {
  const usuarios = obtenerUsuariosGuardados();
  usuarios.push(usuario);
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

// Usuarios iniciales del archivo usuarios.json + los registrados en localStorage
async function obtenerTodosLosUsuarios() {
  let usuariosIniciales = [];

  try {
    const respuesta = await fetch("usuarios.json");
    usuariosIniciales = await respuesta.json();
  } catch (error) {
    console.warn("No se pudo leer usuarios.json. ¿Abriste la página con Live Server?", error);
  }

  return [...usuariosIniciales, ...obtenerUsuariosGuardados()];
}

function mostrarError(mensaje) {
  loginError.textContent = mensaje;
  loginError.hidden = false;
}

function entrarAlJuego(usuario) {
  loginError.hidden = true;
  document.getElementById("seccion-login").hidden = true;
  document.getElementById("saludo").textContent = `Hola, ${usuario.alias}`;
  document.getElementById("seccion-juego").hidden = false;
}

inputContrasena.addEventListener("input", () => {
  requisitos.forEach((item) => {
    const cumple = reglas[item.dataset.regla].test(inputContrasena.value);
    item.classList.toggle("cumple", cumple);
  });
});

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const alias = inputAlias.value.trim();
  const email = inputEmail.value.trim().toLowerCase();
  const contrasena = inputContrasena.value;

  if (!nombre || !alias) {
    mostrarError("Completa el nombre y el alias.");
    return;
  }

  if (!emailRegex.test(email)) {
    mostrarError("Escribe un email válido, por ejemplo nombre@correo.com.");
    return;
  }

  if (!passwordRegex.test(contrasena)) {
    mostrarError("La contraseña no cumple los requisitos.");
    return;
  }

  const usuarios = await obtenerTodosLosUsuarios();
  const usuarioExistente = usuarios.find((usuario) => usuario.email === email);

  if (usuarioExistente) {
    if (usuarioExistente.contrasena === contrasena) {
      entrarAlJuego(usuarioExistente);
    } else {
      mostrarError("Contraseña incorrecta.");
    }
    return;
  }

  const quiereRegistrarse = confirm(`El email ${email} no está registrado. ¿Deseas registrarte?`);

  if (quiereRegistrarse) {
    const nuevoUsuario = { nombre, alias, email, contrasena };
    guardarUsuario(nuevoUsuario);
    entrarAlJuego(nuevoUsuario);
  }
});
