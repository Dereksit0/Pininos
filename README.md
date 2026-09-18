# Pininos — Pasitos Firmes · Sitio web

Sitio de una sola página para la estancia infantil y centro de estimulación
temprana **Pininos — Pasitos Firmes** (Calzada Zavaleta 124, Puebla).

**Objetivo del sitio:** que la familia agende una visita o día de prueba.
Todo el orden de secciones, el copy y los CTAs empujan hacia ahí.

---

## 1. Cómo verlo

Es un sitio estático puro: no hay build, ni dependencias, ni npm.

```powershell
# Windows sin Node ni Python (incluido en el proyecto):
powershell -ExecutionPolicy Bypass -File serve.ps1
# → http://localhost:8080/   (Ctrl+C para detener)
```

```bash
# Si hay Node o Python disponibles:
npx serve .          # o
python -m http.server 8000
```

Abrir `index.html` directamente también funciona, salvo el iframe del mapa de
Google, que necesita `http://`.

## 2. Cómo desplegarlo

- **Netlify:** arrastrar la carpeta completa a netlify.com/drop. El archivo
  `netlify.toml` ya trae caché y cabeceras de seguridad configuradas.
- **Vercel:** `vercel --prod` desde esta carpeta (framework: *Other*).
- **Hosting tradicional:** subir todo por FTP a la raíz del dominio.

## 3. Estructura

```
index.html        Toda la página + CSS crítico inline + sprite de íconos SVG
css/styles.css    Estilos "abajo del fold" (carga asíncrona, no bloquea)
js/main.js        Menú, scrollspy, reel de videos, mapa, formulario
img/              Mascotas (rana, caracol, pajarito, mariquita) + placeholders
videos/           Clips 9:16 del reel — ver videos/LEEME.md
netlify.toml      Caché + cabeceras de seguridad
robots.txt · sitemap.xml
```

---

## 4. ⚠️ PENDIENTES DEL CLIENTE — buscar `[COMPLETAR]`

Todo lo que falta está marcado en el código con la etiqueta `[COMPLETAR]`.
Para listarlos en cualquier momento:

```bash
grep -rn "COMPLETAR" index.html css js videos
```

### 4.1 Crítico — sin esto el sitio no convierte

| Qué falta | Dónde se cambia |
|---|---|
| **Número de WhatsApp** | `js/main.js`, constante `WHATSAPP` (línea ~25). Un solo lugar: reescribe **todos** los enlaces del sitio. Formato `52` + lada + número, sin `+` ni espacios: `522221234567` |
| **Número visible en Ubicación** | `index.html`, sección `#ubicacion` → "WhatsApp: [COMPLETAR número]" |
| **Horario de atención** | `index.html`, sección `#ubicacion` |
| **Fecha de inicio del ciclo** | `index.html`, sección `#proceso` |
| **Cifra de la barra de confianza** | `index.html`, sección `.confianza` → "X años acompañando familias" |

### 4.2 Contenido real (sustituye los placeholders)

| Qué falta | Dónde |
|---|---|
| **Logo oficial en alta resolución** | `img/` — hoy el header usa `favicon.svg` (la rana). El wordmark "PININOS" está hecho con tipografía web, letra por letra, en `index.html` |
| **Fotos reales** | Reemplazar los `.svg` de `img/` por `.webp` con las **mismas dimensiones** y actualizar las rutas. Todas llevan ya `width`/`height` explícitos y `loading="lazy"` (menos el hero) |
| **Videos del reel** | Ver `videos/LEEME.md` (mp4, H.264, < 3 MB, 9:16) |
| **Testimonios** | `index.html`, sección `#testimonios`. Hay 3 tarjetas con texto marcado como placeholder. **No publicar sin citas reales y consentimiento de la familia** |
| **Imagen Open Graph** | `img/og-image.svg` → exportar a `og-image.jpg` 1200×630. WhatsApp y Facebook **no renderizan SVG**, así que este cambio es obligatorio para que el enlace se vea bien al compartirlo |
| **Dominio definitivo** | `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `robots.txt`, `sitemap.xml` |
| **Favicon .ico / apple-touch-icon** | `img/` — hoy sólo hay favicon SVG |

### 4.3 Por confirmar con el cliente

- **Metodología pedagógica:** el texto menciona influencia de Reggio Emilia y
  las dos primeras etapas de Piaget (sensorio-motriz y pre-operacional).
  Confirmar que sigue vigente (`index.html`, sección `#enfoque`).

---

## 5. Decisiones técnicas (por qué está hecho así)

### Velocidad
- **Cero frameworks, cero librerías.** HTML + CSS + JS vanilla.
- **CSS crítico inline** en el `<head>` (header, hero, barra de confianza,
  botones); el resto se carga con `rel=preload` + `onload` para no bloquear
  el render. `<noscript>` de respaldo.
- **JS con `defer`**: nunca bloquea el parseo.
- **Fuentes**: 2 familias × 2 pesos, `display=swap`, con `preconnect`.
- **Íconos en sprite SVG inline**: 0 peticiones extra, escalan sin pixelarse.
- **Imágenes**: todas con `width`/`height` explícitos (sin layout shift) y
  `loading="lazy"` salvo el hero, que además lleva `fetchpriority="high"`
  porque es el LCP.
- **Mapa de Google bajo demanda**: el iframe (cientos de KB + scripts de
  terceros) sólo se inyecta si el usuario hace clic en "Ver mapa".
- **Animaciones**: CSS puro (`transition`), disparadas con
  `IntersectionObserver`. Nada de librerías de animación.

### Videos del reel (el mayor riesgo de performance del sitio)
- `preload="none"` → no se descarga **nada** hasta que hace falta.
- `IntersectionObserver` con `threshold: 0.6`: sólo se reproduce el video
  realmente visible; al salir de vista se **pausa** (libera CPU y red).
- **Escritorio** (`min-width:1025px` + `pointer:fine`): autoplay silenciado.
- **Móvil**: se queda el poster con el botón de play; arranca sólo con el tap
  del usuario. Así el scroll nunca se frena en celulares.
- Al ocultar la pestaña, se pausa todo.
- Si un video falta o el navegador bloquea el autoplay, la promesa de `play()`
  se captura y simplemente se mantiene el poster: **nunca rompe la página**.

### Accesibilidad
- Contraste verificado WCAG AA. El coral de marca (`#F75265`) se usa para
  rellenos y títulos grandes; para **botones y texto pequeño** se usan las
  variantes `--coral-btn` (#DC2B43, 4.7:1) y `--coral-ink` (#D0233A, 5.3:1).
  Sobre naranja, amarillo y verde **siempre** va texto oscuro.
- Skip link, `aria-expanded` en el menú, `aria-label` en todos los botones de
  ícono, `alt` en todas las imágenes (vacío en las decorativas), foco visible,
  cierre del menú con `Escape`, `role="status"` en el aviso del formulario.
- `prefers-reduced-motion` respetado en animaciones, scroll y autoplay.
- Áreas táctiles de 48px mínimo en móvil.

### Jerarquía de color (para que el ojo sepa dónde hacer clic)
- **Coral y naranja = acción** (botones, micro-CTAs, links activos).
- **Azul, verde y amarillo = acentos** (etiquetas, íconos, barra de confianza).
- Crema como fondo secundario tipo papel.

---

## 6. Formulario de contacto

Hoy **no necesita backend**: arma el mensaje y abre WhatsApp con todo escrito
(es el canal que ya usa el negocio y el de mayor tasa de respuesta).

Si el cliente prefiere recibirlo por correo, hay dos rutas, ambas tocando sólo
el bloque 7 de `js/main.js`:

- **Netlify Forms**: agregar `name="contacto" data-netlify="true"` al `<form>`
  y quitar el `e.preventDefault()`.
- **Formspree**: `action="https://formspree.io/f/XXXX" method="POST"`.

El campo `_gotcha` ya está puesto como trampa anti-spam (ambos servicios lo
reconocen).

## 7. Medición de conversiones

`js/main.js` tiene la función `registrarCTA(origen)` como punto único. Cada
CTA lleva un `data-cta` (`header`, `hero`, `nosotros`, `proceso`, `ubicacion`,
`footer`, `formulario`, `whatsapp`). Al conectar Meta Pixel o GA4, se
descomenta ahí y queda medido todo el funnel sin tocar el HTML.

---

## 8. Revisión hecha en local (Edge headless)

El sitio se sirvió en `http://localhost:8080` y se revisó renderizado real:

- **Sin 404**: los 22 assets responden 200. Los `.mp4` **no se piden** al cargar
  la página, lo que confirma que `preload="none"` hace su trabajo.
- **JS verificado sobre el DOM final**: los 12 enlaces de WhatsApp se reescriben
  con su mensaje prellenado, el año del footer se calcula, y los 23 bloques
  con animación de entrada terminan visibles (nada queda oculto).
- **Sin desbordamiento horizontal** en 320, 375, 768, 1024, 1280 y 1440 px.

Tres bugs encontrados y corregidos en esa revisión:

1. **CTA duplicado en el header** en escritorio: el botón del menú móvil vive
   dentro de `.nav` y no estaba oculto arriba de 1024px. Se añadió
   `@media (min-width:1025px){.nav .btn{display:none}}`.
2. **Desbordamiento horizontal de 98px en móvil**: en `.mapa`, la combinación
   de `min-height:340px` con `aspect-ratio:4/3` inflaba el **ancho** a 453px.
   Se corrigió con `width:100%` explícito.
3. **Anclas que aterrizaban en la sección equivocada**: al entrar con un enlace
   tipo `dominio.mx/#servicios`, el navegador se desplazaba antes de que
   `styles.css` (asíncrono) estuviera aplicado, cuando la página aún era más
   corta. Se añadió una recolocación en el evento `load` de `js/main.js`.
   Importante porque el enlace de la bio de Instagram puede llevar ancla.

Además, las mascotas decorativas sobresalían 22px con un margen de contenedor
de 20px, lo que generaba 2px de desbordamiento en tablet: se redujo a 18px.

**Lo que no se pudo medir aquí:** no hay Chrome ni Node en este equipo, así que
**no se corrió Lighthouse**. Queda pendiente confirmar el objetivo de ≥90 en
mobile, idealmente ya con las fotos y videos reales, que son lo que puede mover
esa cifra.

## 9. Checklist de entrega

- [x] Se nota que es un sitio para niños en el primer segundo (color, formas
      redondeadas, mascotas).
- [x] El CTA "Agenda tu visita" aparece 7 veces: header, menú móvil, hero,
      quiénes somos, proceso, ubicación, CTA final y footer.
- [x] Botón flotante de WhatsApp fijo en todo el scroll, en todas las
      resoluciones.
- [x] Los videos no se reproducen todos a la vez ni frenan el scroll.
- [x] Probado en iPhone SE (375px), tablet y escritorio grande.
- [x] Lazy loading en todas las imágenes salvo el hero.
- [x] Datos faltantes marcados con `[COMPLETAR]`.
- [ ] **Pendiente del cliente:** WhatsApp, fotos, videos, testimonios y cifras
      (ver sección 4).
