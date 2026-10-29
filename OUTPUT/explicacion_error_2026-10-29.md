# Explicación de error — 2026-10-29

**Error:** `blocked by CORS policy: No 'Access-Control-Allow-Origin' header` + `net::ERR_FAILED 521`
**Archivo:** `supabase-base/prueba2.html` → `js/prueba2.js` (`db.from('products_practica').select('*')`)

## Tipo de error
**Error de red / servidor** (no de sintaxis ni de lógica): el código está bien escrito, pero el servidor al que le pide datos no responde.

## Qué pasó
1. `prueba2.js` le pide los productos a Supabase.
2. El proyecto de Supabase está **apagado (pausado o arrancando)**. Cloudflare, que está delante, contesta con su propia página de error **521 "Web server is down"**.
3. Esa página de error no trae el header `Access-Control-Allow-Origin`, así que el navegador la bloquea y muestra **CORS**.

→ El CORS es un **síntoma**; la causa real es el **521**.

## Concepto: CORS
El navegador solo deja que una página (`127.0.0.1:5500`) lea respuestas de otro dominio (`supabase.co`) si ese servidor responde con el permiso `Access-Control-Allow-Origin`. Supabase lo envía siempre que está encendido; por eso con el proyecto activo este error desaparece solo.

**Pista para el futuro:** si ves CORS + un código 5xx (500, 502, 521…) en la misma línea, el problema está en el servidor, no en tu código.

## Solución
- supabase.com/dashboard → abrir el proyecto → **Restore project** (si dice *Paused*) y esperar a que quede activo.
- Recargar `prueba2.html`. No hay que cambiar código.

```js
// el código ya era correcto:
const { data, error } = await db.from('products_practica').select('*');
```
