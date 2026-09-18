/* =====================================================================
   Pininos — Pasitos Firmes · JavaScript del sitio
   Vanilla JS, sin dependencias. Se carga con `defer`, así que el DOM ya
   está parseado cuando se ejecuta.

   Bloques:
     1. Configuración (WhatsApp)
     2. Menú móvil
     3. Header sticky + navegación activa
     4. Animaciones de entrada
     5. Reel de videos 9:16
     6. Formulario → WhatsApp
     7. Año del footer y tracking de CTAs
   ===================================================================== */
(function () {
  'use strict';

  /* ==================================================================
     1. CONFIGURACIÓN
     ------------------------------------------------------------------
     [COMPLETAR] ÚNICO lugar donde se define el número de WhatsApp.
     Formato: código de país + lada + número, sin +, espacios ni guiones.
     Ejemplo para Puebla: '522221234567'
     ================================================================== */
  var WHATSAPP = '52XXXXXXXXXX';

  /** Reescribe todos los enlaces de WhatsApp con el número y el mensaje
   *  prellenado que cada uno declara en `data-wa-msg`. */
  function prepararEnlacesWhatsApp() {
    var enlaces = document.querySelectorAll('a[href*="wa.me"]');
    for (var i = 0; i < enlaces.length; i++) {
      var a = enlaces[i];
      var msg = a.getAttribute('data-wa-msg') || '';
      a.href = 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : '');
      a.target = '_blank';
      a.rel = 'noopener';
    }
  }
  prepararEnlacesWhatsApp();

  /* ------------------------------------------------------------------
     Reposicionar el ancla al terminar de cargar.
     css/styles.css se carga de forma asíncrona, así que si se entra al
     sitio con un ancla (ej. desde la bio de Instagram: dominio.mx/#servicios)
     el navegador puede desplazarse cuando la página todavía es más corta
     y aterrizar en la sección equivocada. Al completar la carga (hojas de
     estilo e imágenes ya aplicadas) se recoloca sobre el destino real.
     ------------------------------------------------------------------ */
  if (window.location.hash) {
    window.addEventListener('load', function () {
      var destino = document.getElementById(window.location.hash.slice(1));
      // 'auto' y no 'smooth': es una corrección, no una animación.
      if (destino) destino.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }

  /* ==================================================================
     2. MENÚ MÓVIL
     ================================================================== */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function cerrarMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('abierto');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.removeProperty('overflow');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierto');
      burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      // Evita el scroll del fondo mientras el menú está abierto
      document.body.style.overflow = abierto ? 'hidden' : '';
    });

    // Cerrar al elegir una sección
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) cerrarMenu();
    });

    // Cerrar con Escape (navegación por teclado)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('abierto')) {
        cerrarMenu();
        burger.focus();
      }
    });

    // Si se pasa a escritorio con el menú abierto, restablecer el estado
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && nav.classList.contains('abierto')) cerrarMenu();
    });
  }

  /* ==================================================================
     3. HEADER STICKY + ENLACE ACTIVO
     ------------------------------------------------------------------
     Se usa IntersectionObserver en lugar de escuchar `scroll`: no
     dispara en cada píxel y no bloquea el hilo principal.
     ================================================================== */
  var header = document.getElementById('header');
  var soportaIO = 'IntersectionObserver' in window;

  if (header && soportaIO) {
    // Centinela invisible en el tope del documento
    var centinela = document.createElement('div');
    centinela.setAttribute('aria-hidden', 'true');
    centinela.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.insertBefore(centinela, document.body.firstChild);

    new IntersectionObserver(function (entradas) {
      header.classList.toggle('is-fijo', !entradas[0].isIntersecting);
    }).observe(centinela);
  }

  if (soportaIO) {
    var secciones = document.querySelectorAll('main section[id]');
    var enlacesNav = {};
    var linksNav = document.querySelectorAll('.nav a[href^="#"]');
    for (var j = 0; j < linksNav.length; j++) {
      enlacesNav[linksNav[j].getAttribute('href').slice(1)] = linksNav[j];
    }

    var observadorSecciones = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var link = enlacesNav[entrada.target.id];
        if (!link) return;
        if (entrada.isIntersecting) {
          for (var k = 0; k < linksNav.length; k++) linksNav[k].classList.remove('activo');
          link.classList.add('activo');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    for (var s = 0; s < secciones.length; s++) observadorSecciones.observe(secciones[s]);
  }

  /* ==================================================================
     4. ANIMACIONES DE ENTRADA
     ------------------------------------------------------------------
     Sólo añade una clase; la animación la hace CSS. Se respeta la
     preferencia del sistema de movimiento reducido.
     ================================================================== */
  var reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var aRevelar = document.querySelectorAll('.revelar');

  if (!soportaIO || reduceMovimiento) {
    for (var r = 0; r < aRevelar.length; r++) aRevelar[r].classList.add('visible');
  } else {
    var observadorRevelar = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visible');
        obs.unobserve(entrada.target); // una sola vez
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var v = 0; v < aRevelar.length; v++) observadorRevelar.observe(aRevelar[v]);
  }

  /* ==================================================================
     5. REEL DE VIDEOS 9:16
     ------------------------------------------------------------------
     Los 4 videos van siempre en cuadrícula (nada de carrusel) y se
     reproducen los 4 a la vez, silenciados (así lo exige cualquier
     navegador para autoplay). El botón de bocina de cada tarjeta activa
     el audio de ESE video y apaga el de los demás, para que nunca se
     empalmen 4 audios distintos. Sólo se pausan los 4 cuando la sección
     sale completamente de la pantalla (o se oculta la pestaña), para no
     gastar batería/CPU de más sin necesidad.
     ================================================================== */
  var reelSeccion = document.getElementById('reel');
  var pista = document.getElementById('reel-pista');

  if (pista && reelSeccion) {
    var videos = pista.querySelectorAll('video');

    function reproducirTodos() {
      for (var i = 0; i < videos.length; i++) {
        var promesa = videos[i].play();
        if (promesa && typeof promesa.catch === 'function') promesa.catch(function () {});
      }
    }

    function pausarTodos() {
      for (var i = 0; i < videos.length; i++) {
        if (!videos[i].paused) videos[i].pause();
      }
    }

    // ---- Botón de bocina: sólo un video suena a la vez -------------
    var botones = pista.querySelectorAll('[data-video-sonido]');
    for (var b = 0; b < botones.length; b++) {
      (function (boton) {
        var video = boton.parentElement.querySelector('video');
        if (!video) return;

        function pintar(activo) {
          boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
          boton.querySelector('use').setAttribute('href', activo ? '#i-sonido' : '#i-silencio');
        }

        boton.addEventListener('click', function () {
          var activar = video.muted;
          // Apaga el sonido de todas las demás tarjetas primero.
          for (var j = 0; j < botones.length; j++) {
            var otroVideo = botones[j].parentElement.querySelector('video');
            if (otroVideo && otroVideo !== video) {
              otroVideo.muted = true;
              botones[j].setAttribute('aria-pressed', 'false');
              botones[j].querySelector('use').setAttribute('href', '#i-silencio');
            }
          }
          video.muted = !activar;
          pintar(activar);
        });
      })(botones[b]);
    }

    // Si el navegador bloquea el autoplay hasta que haya interacción,
    // lo reintentamos apenas el usuario toque cualquier parte del sitio.
    reproducirTodos();
    document.addEventListener('pointerdown', reproducirTodos, { once: true, passive: true });

    // Pausa/retoma los 4 juntos según si la sección está en pantalla.
    var enVista = true;
    if (soportaIO && !reduceMovimiento) {
      var observadorReel = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          enVista = entrada.isIntersecting;
          if (enVista) reproducirTodos();
          else pausarTodos();
        });
      }, { threshold: 0 });
      observadorReel.observe(reelSeccion);
    }

    // Al ocultar la pestaña, pausar todo; al volver, retomar sólo si
    // la sección seguía en pantalla.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pausarTodos();
      else if (enVista) reproducirTodos();
    });
  }

  /* ==================================================================
     6. FORMULARIO → WHATSAPP
     ------------------------------------------------------------------
     Sin backend: arma el mensaje y abre WhatsApp con todo escrito.
     [COMPLETAR] Si el cliente prefiere recibirlo por correo, ver README
     (Formspree / Netlify Forms) — sólo hay que cambiar este bloque.
     ================================================================== */
  var formulario = document.getElementById('formulario');
  var aviso = document.getElementById('formulario-aviso');

  if (formulario && aviso) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();

      // Trampa anti-spam: si está llena, es un bot. Se finge el envío.
      if (formulario.elements._gotcha && formulario.elements._gotcha.value) return;

      var nombre = formulario.elements.nombre.value.trim();
      var telefono = formulario.elements.telefono.value.trim();
      var programa = formulario.elements.programa.value;
      var mensaje = formulario.elements.mensaje.value.trim();

      // Validación mínima y accesible
      var errores = [];
      formulario.elements.nombre.removeAttribute('aria-invalid');
      formulario.elements.telefono.removeAttribute('aria-invalid');

      if (nombre.length < 2) {
        errores.push('tu nombre');
        formulario.elements.nombre.setAttribute('aria-invalid', 'true');
      }
      if (telefono.replace(/\D/g, '').length < 10) {
        errores.push('un teléfono de 10 dígitos');
        formulario.elements.telefono.setAttribute('aria-invalid', 'true');
      }

      if (errores.length) {
        aviso.className = 'formulario__aviso error';
        aviso.textContent = 'Por favor escribe ' + errores.join(' y ') + '.';
        formulario.querySelector('[aria-invalid="true"]').focus();
        return;
      }

      var texto =
        '¡Hola Pininos! Soy ' + nombre + '.\n' +
        'Me interesa: ' + programa + '.\n' +
        'Mi teléfono/WhatsApp: ' + telefono + '.' +
        (mensaje ? '\n' + mensaje : '');

      aviso.className = 'formulario__aviso ok';
      aviso.textContent = 'Abriendo WhatsApp con tu mensaje…';

      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      registrarCTA('formulario');
    });
  }

  /* ==================================================================
     7. AÑO DEL FOOTER + TRACKING DE CTAs
     ================================================================== */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /** Punto único para medir conversiones.
   *  [COMPLETAR] Conectar con Meta Pixel / GA4 cuando el cliente los tenga:
   *    if (window.fbq) fbq('track', 'Lead', { origen: origen });
   *    if (window.gtag) gtag('event', 'generate_lead', { origen: origen }); */
  function registrarCTA(origen) {
    if (window.dataLayer) window.dataLayer.push({ event: 'cta_click', origen: origen });
  }

  document.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-cta], a[href*="wa.me"]');
    if (!cta) return;
    registrarCTA(cta.getAttribute('data-cta') || 'whatsapp');
  });
})();
