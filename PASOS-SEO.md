# Pasos para que Google encuentre lagunaswim.net

Todos los archivos ya llevan tu WhatsApp (528713164850). No hay nada que reemplazar.

---

## 1. Reemplazar index.html

El `index.html` que te entregué ya está parchado y listo. Súbelo al repo reemplazando
el actual. El cambio es un solo bloque en el `<head>`; el resto de la app quedó intacta.

(El `seo-patch-index.py` queda como respaldo por si algún día necesitas volver a aplicar
el parche sobre una versión más nueva de tu index. Ya tiene el teléfono configurado.)

## 2. Subir los archivos nuevos a la raíz del repo

- `clases-natacion-torreon.html`
- `natacion-masters-torreon.html`
- `sitemap.xml`
- `robots.txt`
- `logo-laguna-swim.png` — logo nuevo, 1024x1024
- `logo-og.png` — 1200x630, es la imagen que sale en WhatsApp y Facebook
- `logo-256.png` — icono de la app en la pantalla de inicio

Los tres archivos de logo tienen que ir con ese nombre exacto y en la raíz, porque el
index los busca en `lagunaswim.net/logo-laguna-swim.png` y así.

## 3. Enlazar las páginas nuevas desde el inicio

Google le da poco valor a una página a la que nadie enlaza. En la pestaña **Coach**, donde
están "Natación Infantil" y "Natación Master" con botón de WhatsApp, agrega un segundo
enlace de texto a cada página nueva. Con eso basta.

## 4. Google Search Console (10 minutos, gratis)

1. Entra a search.google.com/search-console con tu cuenta checoswim@gmail.com
2. Agrega la propiedad `https://lagunaswim.net`
3. Verifica con la opción de etiqueta HTML — te da un `<meta name="google-site-verification" ...>`
   que pegas en el `<head>` de index.html, justo debajo del `<title>`
4. Menú **Sitemaps** → escribe `sitemap.xml` → Enviar
5. Barra superior → pega la URL de cada página nueva → **Solicitar indexación**

Después de esto, en unos días Search Console te dice con qué búsquedas te está encontrando
la gente. Ahí es donde vas a ver si "natación Torreón" ya te trae visitas.

## 5. Verificar que el marcado quedó bien

Pega la URL en https://search.google.com/test/rich-results
Debe detectar `SportsActivityLocation` en el inicio y `FAQPage` en las dos páginas nuevas.

---

## Lo que falta después de esto

El Perfil de Empresa en Google. Es lo que aparece en el mapa cuando alguien busca
"natación Torreón" desde el celular, y ninguna de estas mejoras lo reemplaza.
Es gratis y se hace aparte, en business.google.com.

## Pendientes menores

- **Código postal**: puse 27000 en el marcado. Cámbialo si la Unidad Deportiva tiene otro.
- **Facebook**: falta la URL de tu página en la lista `sameAs` del index. Agrégala cuando puedas.
- **TikTok**: quedó como `@checoswim_`. Cuando lo muevas a `@checoswim`, cambia el enlace
  en el `sameAs` del index — TikTok no redirige usuarios viejos.
- **Formato del WhatsApp**: verificado. Usé `wa.me/528713164850`, el mismo formato que ya
  usan los 9 enlaces de WhatsApp que tienes en tu index. No hay que tocarlo.
