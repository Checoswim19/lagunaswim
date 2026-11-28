# Laguna Swim International — lagunaswim.net

Sitio estático (GitHub Pages, dominio en `CNAME`). Se publica al unir cambios a `main`.
Idioma del sitio y de las respuestas: español (México).

## Estructura
- `index.html`: la app principal (~12k líneas, HTML + CSS + JS en un solo archivo).
  No reestructurar en varios archivos salvo que se pida.
- Páginas sueltas: `aguas-abiertas.html`, `copa.html` / `copa-admin.html`, `entreno.html`,
  `nazas.html`, `waterpolo-laguna.html`, `alvarez.html`, `patrocinadores.html`, landings SEO.
- Datos en vivo: Firebase Realtime Database (compat 9.23 desde cdnjs) + Firebase Auth (Google).
- Fotos: Cloudinary (`CONFIG.cloudName`, preset sin firma `CONFIG.uploadPreset`).
- Coach/admin = `CONFIG.coach`; los botones de admin solo se muestran a esa cuenta.

## Convenciones
- JS vanilla con `var`/funciones globales (llamadas desde `onclick`). Mantener ese estilo.
- Fotos de eventos: nodo `fotos_internacionales` con `eventoId`. Galerías fijas usan
  `foto-grid-<eventoId>`; tarjetas desplegables usan `gal-<eventoId>`.
- Si Firebase no carga, `index.html` usa stubs de `db`/`auth`: al usar un método nuevo, agregarlo al stub.

## Verificar antes de commit
- Servir con `python3 -m http.server` y abrir las páginas en Playwright: sin errores JS,
  sin enlaces locales rotos. Probar flujos de coach simulando `state.user = {email: CONFIG.coach}`.
- No hay pruebas automáticas ni build.
