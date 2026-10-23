// Laguna Swim · animaciones de la pantalla de Inicio. Sin dependencias.
(function(){
  var raiz = document.querySelector('.ls-inicio');
  if(!raiz) return;
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Numeros que cuentan hacia arriba (30+, 60+, 4)
  function contar(el){
    var meta = +el.getAttribute('data-cuenta'), suf = el.getAttribute('data-suf') || '';
    if(quieto){ el.textContent = meta + suf; return; }
    var t0 = null, dur = 1400;
    function paso(t){
      if(!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(meta * e) + (k === 1 ? suf : '');
      if(k < 1) requestAnimationFrame(paso);
    }
    el.textContent = '0';
    requestAnimationFrame(paso);
  }

  // Revelado escalonado: cada seccion y las piezas dentro de ella
  raiz.classList.add('ls-js');
  var piezas = [];
  [].forEach.call(raiz.querySelectorAll('.ls-c'), function(sec){
    sec.classList.add('ls-rev'); piezas.push(sec);
    [].forEach.call(sec.querySelectorAll('.ls-sede, .ls-cifras > div, .ls-lista > li, .ls-evento, .ls-foto-marco, .ls-par figure'), function(el, i){
      el.classList.add('ls-rev'); el.style.setProperty('--i', (i % 6) + 1); piezas.push(el);
    });
  });
  var cuentas = [].slice.call(raiz.querySelectorAll('[data-cuenta]'));

  if('IntersectionObserver' in window && !quieto){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        e.target.classList.add('ls-ya');
        if(e.target.hasAttribute('data-cuenta')) contar(e.target);
        io.unobserve(e.target);
      });
    }, {rootMargin:'0px 0px -10% 0px', threshold:.08});
    piezas.forEach(function(el){ io.observe(el); });
    cuentas.forEach(function(el){ io.observe(el); });
  } else {
    piezas.forEach(function(el){ el.classList.add('ls-ya'); });
  }

  // Las cifras de la semana laten cuando llegan datos nuevos de Firebase
  if('MutationObserver' in window){
    ['home-stat-sesiones','home-stat-personas','home-stat-metros'].forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      new MutationObserver(function(){
        el.classList.remove('ls-late'); void el.offsetWidth; el.classList.add('ls-late');
      }).observe(el, {childList:true, characterData:true, subtree:true});
    });
  }

  // La foto de portada se desplaza mas lento que la pagina
  var media = raiz.querySelector('.ls-hero-media');
  if(media && !quieto){
    var pendiente = false;
    window.addEventListener('scroll', function(){
      if(pendiente) return; pendiente = true;
      requestAnimationFrame(function(){
        pendiente = false;
        var y = Math.min(window.scrollY || 0, 900);
        media.style.transform = 'translate3d(0,' + (y * 0.35) + 'px,0)';
      });
    }, {passive:true});
  }
})();
