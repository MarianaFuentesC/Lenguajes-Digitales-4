const CLAVE_DESTINOS = "destinos-viajes";

function obtenerDestinos() {
  const guardado = localStorage.getItem(CLAVE_DESTINOS);

  if (!guardado) return destinos;

  try {
    return JSON.parse(guardado);
  } catch (error) {
    return destinos;
  }
}

function guardarDestinos(lista) {
  localStorage.setItem(CLAVE_DESTINOS, JSON.stringify(lista));
}
