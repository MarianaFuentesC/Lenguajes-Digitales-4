// Este archivo se carga en el <head> (no al final del <body>) a propósito:
// así el tema se aplica ANTES de que el navegador pinte la página, y no se
// ve un "parpadeo" oscuro→claro al recargar.

const root = document.documentElement; // la etiqueta <html>

// localStorage guarda texto en el navegador y sobrevive a recargas. Si la
// persona ya eligió un tema antes, lo usamos; si no, le preguntamos al
// sistema operativo qué prefiere con matchMedia('(prefers-color-scheme: ...)').
const savedTheme = localStorage.getItem('theme');
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

root.dataset.theme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

// El botón todavía no existe cuando este script corre en el <head>, así que
// esperamos a que el HTML termine de cargarse para conectarle el clic.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');

  function updateLabel() {
    const isLight = root.dataset.theme === 'light';
    toggle.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  }

  updateLabel();

  toggle.addEventListener('click', () => {
    // root.dataset.theme lee/escribe el atributo data-theme de <html>. El CSS
    // escucha ese atributo con [data-theme="light"] y cambia las variables.
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
    updateLabel();
  });
});
