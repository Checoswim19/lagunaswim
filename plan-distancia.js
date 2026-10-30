/* ============================================================
   PLAN A DISTANCIA · botón de compra y cupo
   Se usa en la página de Masters y en el inicio. Busca elementos con:
     [data-plan-obj]     botones de objetivo (data-plan-obj="tecnica" | "competencia" | "aguas")
     [data-plan-cta]     botón "Empezar mi semana por $100"
     [data-plan-cupo]    texto con los lugares disponibles
     [data-plan-barra]   barra de cupo (su primer hijo se llena)
   El cupo sale de planes_cupo/ocupados, un número público que actualiza el coach.
   ============================================================ */
(function () {
  'use strict';
  var C = window.LS_PLAN;
  if (!C) return;
  var objetivo = 'competencia';
  var ocupados = null;

  function nombreObj(id) {
    for (var i = 0; i < C.OBJETIVOS.length; i++) if (C.OBJETIVOS[i].id === id) return C.OBJETIVOS[i].nombre;
    return '';
  }
  function lleno() { return ocupados !== null && ocupados >= C.CUPO; }

  function urlCompra() {
    var obj = nombreObj(objetivo);
    if (lleno()) {
      return 'https://wa.me/' + C.WHATSAPP + '?text=' + encodeURIComponent('Hola Coach Checo, quiero entrar a la lista de espera del plan a distancia (' + obj + ').');
    }
    if (C.PRUEBA_URL) return C.PRUEBA_URL;
    // Sin link de pago todavía: se pide por WhatsApp
    return 'https://wa.me/' + C.WHATSAPP + '?text=' + encodeURIComponent('Hola Coach Checo, quiero mi semana de prueba de $' + C.PRECIO_PRUEBA + ' del plan a distancia (' + obj + ').');
  }

  function pintar() {
    document.querySelectorAll('[data-plan-obj]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-plan-obj') === objetivo ? 'true' : 'false');
    });
    document.querySelectorAll('[data-plan-cta]').forEach(function (a) {
      a.href = urlCompra();
      a.textContent = lleno() ? 'Cupo lleno · Entrar a la lista de espera' : 'Empezar mi semana por $' + C.PRECIO_PRUEBA;
    });
    var libres = ocupados === null ? null : Math.max(0, C.CUPO - ocupados);
    document.querySelectorAll('[data-plan-cupo]').forEach(function (el) {
      el.textContent = libres === null ? 'Cupo de ' + C.CUPO + ' nadadores'
        : (libres === 0 ? 'Cupo lleno: ' + C.CUPO + ' de ' + C.CUPO + ' lugares ocupados'
        : libres + ' de ' + C.CUPO + ' lugares disponibles');
    });
    document.querySelectorAll('[data-plan-barra]').forEach(function (el) {
      var i = el.firstElementChild;
      if (i) i.style.width = (ocupados === null ? 0 : Math.min(100, ocupados / C.CUPO * 100)) + '%';
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-plan-obj]');
    if (!b) return;
    objetivo = b.getAttribute('data-plan-obj');
    try { localStorage.setItem('ls_plan_objetivo', objetivo); } catch (er) {}
    pintar();
  });
  // Recordar el objetivo para el cuestionario después de pagar
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-plan-cta]');
    if (a) { try { localStorage.setItem('ls_plan_objetivo', objetivo); } catch (er) {} }
  });

  pintar();

  // Cupo en vivo (solo un número; los datos de los alumnos nunca se leen aquí)
  try {
    if (window.firebase) {
      if (!firebase.apps.length) firebase.initializeApp(C.FIREBASE);
      firebase.database().ref('planes_cupo/ocupados').on('value', function (s) {
        var v = s.val();
        ocupados = typeof v === 'number' ? v : 0;
        pintar();
      }, function () {});
    }
  } catch (e) {}
})();
