// Laguna Swim · paginas de entrada. Sin dependencias.
(function(){
  var barra = document.querySelector('.barra');
  var campos = [].slice.call(document.querySelectorAll('.campo, .llamado'));

  // La barra toma el color del tramo que pasa por debajo
  function pintarBarra(){
    if(!barra) return;
    var y = barra.offsetHeight;
    for(var i=0;i<campos.length;i++){
      var r = campos[i].getBoundingClientRect();
      if(r.top <= y && r.bottom > y){
        var cs = getComputedStyle(campos[i]);
        barra.style.setProperty('--hb', cs.backgroundColor);
        barra.style.setProperty('--hi', cs.color);
        return;
      }
    }
  }
  var pendiente = false;
  window.addEventListener('scroll', function(){
    if(pendiente) return; pendiente = true;
    requestAnimationFrame(function(){ pendiente = false; pintarBarra(); });
  }, {passive:true});
  window.addEventListener('resize', pintarBarra);

  // Grupos / perfiles: elige uno y el agua cambia de profundidad
  [].forEach.call(document.querySelectorAll('[data-pestanas]'), function(sec){
    var lista = sec.querySelector('.grados');
    var botones = [].slice.call(sec.querySelectorAll('.grado'));
    var paneles = [].slice.call(sec.querySelectorAll('.panel'));
    var base = sec.className.replace(/\bf-\S+/g,'').trim();
    lista.hidden = false;
    function elegir(i, foco){
      botones.forEach(function(b, j){
        var si = i === j;
        b.setAttribute('aria-selected', si);
        b.tabIndex = si ? 0 : -1;
        paneles[j].hidden = !si;
      });
      sec.className = base + ' ' + botones[i].dataset.campo;
      if(foco) botones[i].focus();
      pintarBarra();
    }
    botones.forEach(function(b, i){
      b.addEventListener('click', function(){ elegir(i); });
      b.addEventListener('keydown', function(e){
        var k = e.key, n = botones.length;
        if(k === 'ArrowDown' || k === 'ArrowRight'){ e.preventDefault(); elegir((i+1)%n, true); }
        if(k === 'ArrowUp' || k === 'ArrowLeft'){ e.preventDefault(); elegir((i-1+n)%n, true); }
        if(k === 'Home'){ e.preventDefault(); elegir(0, true); }
        if(k === 'End'){ e.preventDefault(); elegir(n-1, true); }
      });
    });
    elegir(0);
  });

  // Entrada por partes: titulo, texto y figura, escalonados
  var partes = [].slice.call(document.querySelectorAll('.sube'));
  partes.forEach(function(el){
    var hermanos = [].slice.call(el.closest('section, footer').querySelectorAll('.sube'));
    el.style.setProperty('--i', hermanos.indexOf(el) % 6);
  });
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('ya'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -8% 0px'});
    partes.forEach(function(el){ io.observe(el); });
  } else {
    partes.forEach(function(el){ el.classList.add('ya'); });
  }

  pintarBarra();
})();
