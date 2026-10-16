---
name: analizar-sitio-web
description: Analiza un sitio web de referencia (por URL o abierto en el browser panel) y produce siempre 3 entregables juntos - un resumen .md (<300 palabras), la estructura semántica en .xml y una fila para la matriz comparativa CSV. Usar cuando el usuario pida analizar, revisar o comparar un sitio web o landing de referencia.
---

# Analizar sitio web de referencia

Proceso para analizar un sitio web y producir **siempre los tres entregables juntos**, claramente marcados.

## Entrada

- Una URL que da el usuario, **o**
- El sitio que ya está abierto en el browser panel (si no hay URL, usar la pestaña activa).

## Paso 1 — Recolectar información

1. Abrir la URL en el browser panel (`preview_start` con `url`, o `navigate`). Si ya está abierto, usar esa pestaña.
2. Leer el contenido con `get_page_text` y la estructura con `read_page`. Tomar un screenshot para evaluar UI (estilo visual, tipografía, jerarquía).
3. Hacer scroll por toda la home para contar secciones e identificar el hero y cada bloque.
4. Detectar tecnología con `javascript_tool` (solo inspección), por ejemplo:
   - CMS/builder: `meta[name=generator]`, `window.Webflow`, `wp-content`, `Shopify`, `__NEXT_DATA__`, `___gatsby`, `data-framer-*`, `wix`, `squarespace`.
   - Librería frontend: `window.React` / `[data-reactroot]` / `__NEXT_DATA__`, `window.Vue` / `__NUXT__`, `ng-version`, `svelte-*`, `window.jQuery`.
   - Animación: `window.gsap`, `ScrollTrigger`, `window.lottie`, `Lenis`, `locomotive-scroll`, `AOS`, `framer-motion`, `three`/`THREE`, `barba`, `swup`.
   - Tipografía principal: `getComputedStyle(document.body).fontFamily` y la de los `h1`.
5. Navegar a al menos una página interna para evaluar la transición entre páginas (corte normal, fade, transición tipo Barba/Swup, SPA).
6. Abrir el menú (y probar en vista móvil con `resize_window` preset `mobile` si hace falta) para clasificar el patrón de navegación. Restablecer con preset `desktop` al terminar.

Si un dato no se puede determinar, escribir `no_detectado` (no inventar).

## Paso 2 — Nombres de archivo

Derivar un `slug` del dominio (minúsculas, sin `www.`, puntos y caracteres especiales → `-`). Ej: `https://www.apple.com/es` → `apple-com`.

- Resumen: `OUTPUT/analisis_sitios_landing/resumenes/<slug>.md`
- XML: `OUTPUT/analisis_sitios_landing/xml/<slug>.xml`
- Matriz: `OUTPUT/analisis_sitios_landing/matriz_comparativa.csv`

Todas las rutas son relativas a la raíz del proyecto (la carpeta `agente`), para que se vean en Visual Studio Code. Crear las carpetas si no existen. Si ya existe un archivo con ese slug, preguntar antes de sobrescribir.

## Paso 3 — Entregable 1: Resumen (.md)

Menos de **300 palabras** en total. Estructura:

```markdown
# <Nombre del sitio>

**URL:** <url>  
**Fecha de análisis:** <AAAA-MM-DD>

## Contenido
## Enfoque
## Público objetivo
## Estructura
## UX
## UI
```

Verificar el conteo de palabras antes de guardar.

## Paso 4 — Entregable 2: Estructura semántica (.xml)

Usar **exactamente** este esquema. Solo etiquetas semánticas de HTML5 más las definidas aquí (`sitio`, `logo`, `enlace`, `redes`, `contacto`); **no inventar nombres nuevos**.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitio nombre="..." url="...">
  <header>
    <logo>...</logo>
    <nav tipo="fija | hamburguesa | mega-menu | overlay-fullscreen">
      <enlace>...</enlace>
    </nav>
  </header>
  <main>
    <section tipo="hero">...</section>
    <section tipo="...">...</section>
  </main>
  <footer>
    <redes>...</redes>
    <contacto>...</contacto>
  </footer>
</sitio>
```

Reglas:
- `nav@tipo` toma **un solo** valor de: `fija`, `hamburguesa`, `mega-menu`, `overlay-fullscreen`.
- Un `<enlace>` por cada ítem del menú principal, con el texto visible.
- Una `<section>` por cada sección de la home, en orden; la primera es `tipo="hero"`. Para el resto usar un `tipo` descriptivo en minúsculas (ej. `servicios`, `testimonios`, `galeria`, `cta`, `faq`, `clientes`, `equipo`).
- El contenido de cada nodo es un texto breve que describe lo que contiene.
- Si no hay redes o contacto, dejar el nodo vacío (`<redes/>`).
- Escapar `&`, `<`, `>` y comillas. Validar que el XML esté bien formado.

## Paso 5 — Entregable 3: Fila de la matriz comparativa

Exactamente **14 campos, en este orden**, separados por `" ; "` (espacio, punto y coma, espacio):

```
url ; tipo_de_sitio ; cms_o_builder ; libreria_animacion ; libreria_frontend ; patron_navegacion ; num_secciones_home ; transicion_entre_paginas ; tipografia_principal ; estilo_visual ; fortaleza_ux ; oportunidad_mejora ; nombre_archivo_md ; nombre_archivo_xml
```

Reglas:
- Ningún valor puede contener `;` ni saltos de línea (reemplazar por `,`).
- `patron_navegacion` usa el mismo valor que `nav@tipo` del XML.
- `num_secciones_home` es un número entero e igual a la cantidad de `<section>` del XML.
- `nombre_archivo_md` y `nombre_archivo_xml` son solo los nombres de archivo (`<slug>.md`, `<slug>.xml`).
- Datos no determinables: `no_detectado`.

Guardado en `matriz_comparativa.csv`:
- Si el archivo **no existe**, crearlo con la línea de encabezado de arriba como primera línea, y luego la fila.
- Si **ya existe**, **agregar** la fila al final (append) **sin borrar ni modificar** las anteriores ni duplicar el encabezado.
- Si la URL ya aparece en la matriz, avisar al usuario y preguntar antes de agregar otra fila.
- Codificación UTF-8, una fila por línea.

## Paso 6 — Respuesta al usuario

Mostrar siempre los tres entregables juntos, con estos títulos:

1. **📄 Entregable 1 — Resumen** (texto completo + enlace al `.md`)
2. **🧩 Entregable 2 — Estructura semántica XML** (bloque `xml` + enlace al `.xml`)
3. **📊 Entregable 3 — Fila de matriz comparativa** (la fila en un bloque de código + confirmación de que se agregó al CSV)

Nunca entregar uno o dos sin los otros.
