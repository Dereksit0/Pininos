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
     6. Mapa bajo demanda
     7. Formulario → WhatsApp
     8. Año del footer y tracking de CTAs
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
     Reglas de performance:
       · preload="none" en el HTML → nada se descarga hasta que hace falta.
       · Sólo se reproduce el video visible; al salir de vista se pausa.
       · Escritorio: autoplay silenciado al entrar en vista.
       · Móvil: se queda el poster y sólo arranca con el tap del usuario.
     ================================================================== */
  var pista = document.getElementById('reel-pista');

  if (pista) {
    var items = pista.querySelectorAll('.reel__item');
    var esEscritorio = window.matchMedia('(min-width: 1025px) and (pointer: fine)').matches;

    // ---- Flechas del carrusel -------------------------------------
    function desplazar(direccion) {
      var item = pista.querySelector('.reel__item');
      if (!item) return;
      var paso = item.getBoundingClientRect().width + 18; // ancho + gap
      pista.scrollBy({ left: paso * direccion, behavior: reduceMovimiento ? 'auto' : 'smooth' });
    }

    var btnPrev = document.querySelector('[data-reel-prev]');
    var btnNext = document.querySelector('[data-reel-next]');
    if (btnPrev) btnPrev.addEventListener('click', function () { desplazar(-1); });
    if (btnNext) btnNext.addEventListener('click', function () { desplazar(1); });

    function actualizarFlechas() {
      if (!btnPrev || !btnNext) return;
      var max = pista.scrollWidth - pista.clientWidth - 4;
      btnPrev.disabled = pista.scrollLeft <= 4;
      btnNext.disabled = pista.scrollLeft >= max;
    }
    pista.addEventListener('scroll', function () {
      // Throttle simple con requestAnimationFrame
      if (pista.dataset.tick) return;
      pista.dataset.tick = '1';
      requestAnimationFrame(function () {
        actualizarFlechas();
        delete pista.dataset.tick;
      });
    }, { passive: true });
    actualizarFlechas();

    // ---- Reproducir / pausar --------------------------------------
    function reproducir(video) {
      var contenedor = video.parentElement;
      var promesa = video.play();
      if (promesa && typeof promesa.catch === 'function') {
        // Si el navegador bloquea el autoplay (o aún no hay archivo de
        // video), se deja el poster visible sin romper nada.
        promesa.then(function () {
          contenedor.classList.add('reproduciendo');
        }).catch(function () {
          contenedor.classList.remove('reproduciendo');
        });
      } else {
        contenedor.classList.add('reproduciendo');
      }
    }

    function pausar(video) {
      if (!video.paused) video.pause();
      video.parentElement.classList.remove('reproduciendo');
    }

    // Botón de play sobre cada tarjeta (imprescindible en móvil)
    for (var b = 0; b < items.length; b++) {
      (function (item) {
        var video = item.querySelector('video');
        var boton = item.querySelector('.reel__play');
        if (!video || !boton) return;

        boton.addEventListener('click', function () {
          if (video.paused) {
            video.preload = 'auto';
            reproducir(video);
          } else {
            pausar(video);
          }
        });

        video.addEventListener('pause', function () {
          item.querySelector('.reel__video').classList.remove('reproduciendo');
        });
      })(items[b]);
    }

    // Observa qué videos están realmente en pantalla
    if (soportaIO) {
      var observadorVideos = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          var video = entrada.target;
          if (entrada.isIntersecting) {
            // Sólo en escritorio se arranca solo (silenciado)
            if (esEscritorio && !reduceMovimiento) {
              video.preload = 'auto';
              reproducir(video);
            }
          } else {
            pausar(video); // fuera de vista = nunca consume CPU/red
          }
        });
      }, { threshold: 0.6 });

      var videos = pista.querySelectorAll('video');
      for (var vi = 0; vi < videos.length; vi++) observadorVideos.observe(videos[vi]);
    }

    // Al ocultar la pestaña, pausar todo
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        var vids = pista.querySelectorAll('video');
        for (var p = 0; p < vids.length; p++) pausar(vids[p]);
      }
    });
  }

  /* ==================================================================
     6. MAPA BAJO DEMANDA
     ------------------------------------------------------------------
     El iframe de Google Maps pesa cientos de KB y carga scripts de
     terceros: sólo se inyecta cuando el usuario lo pide.
     ================================================================== */
  var mapa = document.getElementById('mapa');
  var mapaBoton = document.getElementById('mapa-boton');

  if (mapa && mapaBoton) {
    mapaBoton.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = mapa.getAttribute('data-src');
      iframe.title = 'Mapa de ubicación de Pininos en Calzada Zavaleta 124, Puebla';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      mapa.innerHTML = '';
      mapa.appendChild(iframe);
    });
  }

  /* ==================================================================
     7. FORMULARIO → WHATSAPP
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
     8. AÑO DEL FOOTER + TRACKING DE CTAs
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
