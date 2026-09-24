const CLAVE_DESTINOS = "destinos-viajes";

function obtenerDestinos() {
  const guardado = localStorage.getItem(CLAVE_DESTINOS);

  if (!guardado) return destinosIniciales();

  try {
    return JSON.parse(guardado);
  } catch (error) {
    return destinosIniciales();
  }
}
