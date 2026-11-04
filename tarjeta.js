// =====================================================================
// TARJETA "MI ACUMULADO DEL MES" — imagen compartible para redes
// Todo se genera en el dispositivo (canvas). Nada se sube a ningún servidor:
// la foto que elige el nadador solo vive en memoria mientras la tarjeta está abierta.
// API: tarjetaMetrosCalc(entries, nadador)  ·  abrirTarjetaMetros()
// =====================================================================
(function () {
  'use strict';

  var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var FONT = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';
  var IMG = {
    lsiBlanco: 'img/tarjeta-lsi-blanco.webp',
    lsiColor: 'img/tarjeta-lsi-color.webp',
    netBlanco: 'img/tarjeta-net-blanco.webp',
    netColor: 'img/tarjeta-net-color.webp',
    emblema: 'img/tarjeta-emblema.webp'
  };
  var MAX_FOTO_BYTES = 25 * 1024 * 1024; // 25 MB
  var MAX_FOTO_LADO = 1600;              // se reduce para cuidar la memoria del teléfono
  var FOTO_TIPOS = /^image\/(jpeg|png|webp|heic|heif)$/i;

  var cache = {};
  var st = null; // estado de la tarjeta abierta

  // ---------- DATOS ----------
  // Metros y sesiones del MES CALENDARIO en curso (coincide con el nombre del mes que muestra la tarjeta).
  window.tarjetaMetrosCalc = function (entries, nadador) {
    var now = new Date();
    var ini = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    var metros = 0, ses = 0;
    (entries || []).forEach(function (e) {
      var ts = e.timestamp || (e.fecha ? new Date(e.fecha + 'T12:00:00').getTime() : 0);
      if (ts >= ini) { metros += Number(e.metros) || 0; ses++; }
    });
    return {
      nombre: (nadador && nadador.nombre) || '',
      fotoUrl: (nadador && nadador.fotoUrl) || '',
      metros: Math.max(0, Math.round(metros)),
      sesiones: ses,
      mes: now.getMonth(),
      anio: now.getFullYear()
    };
  };

  // ---------- IMÁGENES ----------
  function loadImg(src, cors) {
    var key = src + (cors ? '|cors' : '');
    if (cache[key]) return cache[key];
    cache[key] = new Promise(function (resolve, reject) {
      var im = new Image();
      if (cors) im.crossOrigin = 'anonymous';
      im.onload = function () { resolve(im); };
      im.onerror = function () { delete cache[key]; reject(new Error('img')); };
      im.src = src;
    });
    return cache[key];
  }

  function imgFromFile(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var im = new Image();
      im.onload = function () { URL.revokeObjectURL(url); resolve(im); };
      im.onerror = function () { URL.revokeObjectURL(url); reject(new Error('img')); };
      im.src = url;
    });
  }

  // Lee la foto elegida, respeta la orientación del teléfono y la reduce de tamaño.
  function prepararFoto(file) {
    var p;
    if (window.createImageBitmap) {
      p = createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return imgFromFile(file); });
    } else {
      p = imgFromFile(file);
    }
    return p.then(function (src) {
      var w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
      if (!w || !h) throw new Error('img');
      var s = Math.min(1, MAX_FOTO_LADO / Math.max(w, h));
      var c = document.createElement('canvas');
      c.width = Math.round(w * s); c.height = Math.round(h * s);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
      if (src.close) src.close();
      return c;
    });
  }

  // ---------- DIBUJO ----------
  function rrect(x, px, py, w, h, r) {
    x.beginPath();
    x.moveTo(px + r, py);
    x.arcTo(px + w, py, px + w, py + h, r);
    x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r);
    x.arcTo(px, py, px + w, py, r);
    x.closePath();
  }

  function spaced(x, txt, cx, y, sp) {
    var ws = [], total = 0, i;
    for (i = 0; i < txt.length; i++) { ws[i] = x.measureText(txt.charAt(i)).width; total += ws[i] + (i < txt.length - 1 ? sp : 0); }
    var px = cx - total / 2, prev = x.textAlign;
    x.textAlign = 'left';
    for (i = 0; i < txt.length; i++) { x.fillText(txt.charAt(i), px, y); px += ws[i] + sp; }
    x.textAlign = prev;
  }

  function fit(x, txt, maxW) {
    if (x.measureText(txt).width <= maxW) return txt;
    while (txt.length > 1 && x.measureText(txt + '…').width > maxW) txt = txt.slice(0, -1);
    return txt + '…';
  }

  function cover(x, im, W, H) {
    var iw = im.width || im.naturalWidth, ih = im.height || im.naturalHeight;
    var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    x.drawImage(im, (W - dw) / 2, (H - dh) * 0.35, dw, dh); // sesgo hacia arriba: ahí suelen estar las caras
  }

  function logoBox(x, im, px, py, h, chip) {
    var w = im.naturalWidth * h / im.naturalHeight;
    if (chip) {
      var pad = 22;
      x.fillStyle = '#ffffff';
      rrect(x, px, py, w + pad * 2, h + pad * 2, 30);
      x.fill();
      x.drawImage(im, px + pad, py + pad, w, h);
      return { w: w + pad * 2, h: h + pad * 2 };
    }
    x.drawImage(im, px, py, w, h);
    return { w: w, h: h };
  }

  function dibujar(o, imgs) {
    var d = o.datos, story = o.formato === 'historia';
    var W = 1080, H = story ? 1920 : 1350, P = 72;
    var topY = story ? 230 : P, botY = H - (story ? 300 : P + 8);
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var bg = o.fondo === 'foto' ? o.fotoLocal : (o.fondo === 'perfil' ? o.fotoPerfil : null);
    var chip = o.logos === 'color';

    // ----- fondo -----
    if (bg) {
      x.fillStyle = '#071e38'; x.fillRect(0, 0, W, H);
      cover(x, bg, W, H);
      var sh = x.createLinearGradient(0, 0, 0, H);
      sh.addColorStop(0, 'rgba(5,15,28,0.88)');
      sh.addColorStop(0.24, 'rgba(5,15,28,0.48)');
      sh.addColorStop(0.55, 'rgba(10,41,86,0.22)');
      sh.addColorStop(0.78, 'rgba(5,15,28,0.70)');
      sh.addColorStop(1, 'rgba(5,15,28,0.95)');
      x.fillStyle = sh; x.fillRect(0, 0, W, H);
    } else {
      // Degradado de la plataforma: #0a2956 → #1e5a9e → azul claro (#6bb8e8 solo como brillo)
      var g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#071e38'); g.addColorStop(0.5, '#0a2956'); g.addColorStop(0.85, '#1e5a9e'); g.addColorStop(1, '#2f78bd');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      var rg = x.createRadialGradient(W * 0.88, H * 1.02, 0, W * 0.88, H * 1.02, W * 0.95);
      rg.addColorStop(0, 'rgba(107,184,232,0.55)'); rg.addColorStop(1, 'rgba(107,184,232,0)');
      x.fillStyle = rg; x.fillRect(0, 0, W, H);
      // líneas de carril
      x.strokeStyle = 'rgba(255,255,255,0.07)'; x.lineWidth = 2;
      for (var l = 0; l < 4; l++) {
        x.beginPath();
        var ly = H * 0.30 + l * 80;
        x.moveTo(0, ly);
        for (var px = 0; px <= W; px += 20) x.lineTo(px, ly + Math.sin(px / 150 + l) * 14);
        x.stroke();
      }
      // olas al pie
      for (var w = 0; w < 4; w++) {
        x.beginPath();
        var base = H - 330 + w * 70;
        x.moveTo(0, base);
        for (var qx = 0; qx <= W; qx += 20) x.lineTo(qx, base + Math.sin(qx / 90 + w * 1.3) * 16);
        x.lineTo(W, H); x.lineTo(0, H); x.closePath();
        x.fillStyle = 'rgba(107,184,232,' + (0.05 + w * 0.03) + ')';
        x.fill();
      }
    }

    // ----- fila superior: logo equipo · mes · logo plataforma -----
    var lh = chip ? 130 : 170;
    var lsi = chip ? imgs.lsiColor : imgs.lsiBlanco, net = chip ? imgs.netColor : imgs.netBlanco;
    var rowH = lh + (chip ? 44 : 0);
    if (lsi) logoBox(x, lsi, P, topY, lh, chip);
    if (net) {
      var nw = net.naturalWidth * lh / net.naturalHeight + (chip ? 44 : 0);
      logoBox(x, net, W - P - nw, topY, lh, chip);
    }
    x.fillStyle = 'rgba(255,255,255,0.88)';
    x.textAlign = 'center';
    x.font = '600 38px ' + FONT;
    spaced(x, MESES[d.mes].toUpperCase(), W / 2, topY + rowH / 2 - 6, 7);
    x.font = '500 34px ' + FONT;
    x.fillStyle = 'rgba(255,255,255,0.7)';
    spaced(x, String(d.anio), W / 2, topY + rowH / 2 + 40, 7);

    // ----- bloque inferior: nombre, metros, etiqueta, sesiones -----
    var tieneInfo = d.sesiones > 0;
    var yInfo = botY;
    var yRule = tieneInfo ? yInfo - 78 : yInfo - 10;
    var yLabel = yRule - 50;
    var maxNum = W - P * 2 - 110;
    var numTxt = d.metros.toLocaleString('es-MX');
    var size = 320;
    x.font = '700 ' + size + 'px ' + FONT;
    while (x.measureText(numTxt).width > maxNum && size > 120) { size -= 8; x.font = '700 ' + size + 'px ' + FONT; }
    var yNum = yLabel - (Math.round(size * 0.2) + 40); // aire para la coma, que baja de la línea base
    var yName = yNum - size * 0.78 - 34;

    // marca de agua (solo en degradado), centrada entre la fila superior y el nombre
    if (!bg && imgs.emblema) {
      var zoneTop = topY + rowH + 30, zoneBot = yName - 90;
      var ew = Math.min(640, Math.max(0, (zoneBot - zoneTop)) * imgs.emblema.naturalWidth / imgs.emblema.naturalHeight);
      if (ew > 200) {
        var eh = ew * imgs.emblema.naturalHeight / imgs.emblema.naturalWidth;
        x.globalAlpha = 0.07;
        x.drawImage(imgs.emblema, (W - ew) / 2, zoneTop + (zoneBot - zoneTop - eh) / 2, ew, eh);
        x.globalAlpha = 1;
      }
    }

    x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 24;
    x.textAlign = 'center';

    var nombre = (o.nombre || '').replace(/\s+/g, ' ').trim();
    if (nombre) {
      x.fillStyle = '#ffffff';
      x.font = '600 54px ' + FONT;
      x.fillText(fit(x, nombre, W - P * 2), W / 2, yName);
    }

    // número + unidad centrados como un solo bloque
    x.font = '700 ' + size + 'px ' + FONT;
    var nW = x.measureText(numTxt).width;
    var uSize = Math.round(size * 0.3);
    x.font = '600 ' + uSize + 'px ' + FONT;
    var uW = x.measureText('m').width, gap = Math.round(size * 0.07);
    var sx = (W - (nW + gap + uW)) / 2;
    x.textAlign = 'left';
    x.font = '700 ' + size + 'px ' + FONT;
    x.fillStyle = '#ffffff';
    x.fillText(numTxt, sx, yNum);
    x.font = '600 ' + uSize + 'px ' + FONT;
    x.fillStyle = '#7dd3fc';
    x.fillText('m', sx + nW + gap, yNum);
    x.textAlign = 'center';

    x.fillStyle = 'rgba(255,255,255,0.82)';
    x.font = '600 34px ' + FONT;
    spaced(x, 'ACUMULADO DEL MES', W / 2, yLabel, 6);

    x.shadowBlur = 0; x.shadowColor = 'transparent';
    x.fillStyle = 'rgba(255,255,255,0.22)';
    x.fillRect(P, yRule, W - P * 2, 2);

    if (tieneInfo) {
      var prom = Math.round(d.metros / d.sesiones);
      var txt = d.sesiones + (d.sesiones === 1 ? ' sesión' : ' sesiones') + '   ·   ' + prom.toLocaleString('es-MX') + ' m por sesión';
      x.fillStyle = 'rgba(255,255,255,0.85)';
      x.font = '600 38px ' + FONT;
      x.fillText(txt, W / 2, yInfo);
    }
    return c;
  }

  // ---------- INTERFAZ ----------
  function injectCss() {
    if (document.getElementById('tm-css')) return;
    var s = document.createElement('style'); s.id = 'tm-css';
    s.textContent =
      '.tm-ov{position:fixed;inset:0;z-index:99998;background:rgba(3,10,20,.94);display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:max(.8rem,env(safe-area-inset-top)) .9rem max(1rem,env(safe-area-inset-bottom))}' +
      '.tm-box{width:100%;max-width:420px;display:flex;flex-direction:column;gap:.7rem;color:#fff}' +
      '.tm-head{display:flex;align-items:center;justify-content:space-between}' +
      '.tm-head h3{font-size:1rem;font-weight:800;margin:0}' +
      '.tm-x{background:rgba(255,255,255,.1);border:0;color:#fff;width:38px;height:38px;border-radius:50%;font-size:1.1rem;cursor:pointer;touch-action:manipulation}' +
      '.tm-prev{display:flex;justify-content:center;min-height:120px;align-items:center}' +
      '.tm-prev canvas{max-width:100%;max-height:44vh;width:auto;height:auto;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.45)}' +
      '.tm-row{display:flex;align-items:center;gap:.5rem}' +
      '.tm-lab{font-size:.68rem;letter-spacing:1px;text-transform:uppercase;color:#7ab8e8;min-width:58px}' +
      '.tm-chips{display:flex;flex-wrap:wrap;gap:.4rem;flex:1}' +
      '.tm-chip{font:inherit;font-size:.78rem;font-weight:700;padding:.45rem .75rem;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;cursor:pointer;touch-action:manipulation;-webkit-appearance:none}' +
      '.tm-chip.on{background:#38bdf8;color:#04203a;border-color:transparent}' +
      '.tm-chip input{display:none}' +
      '.tm-in{flex:1;min-width:0;font:inherit;font-size:.85rem;padding:.55rem .7rem;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff}' +
      '.tm-msg{font-size:.78rem;min-height:1.1em;color:#fca5a5;margin:0}' +
      '.tm-note{font-size:.7rem;color:rgba(255,255,255,.55);margin:0;text-align:center}' +
      '.tm-box .btn{margin-bottom:0}' +
      '.tm-visor{position:fixed;inset:0;z-index:100000;background:rgba(3,10,20,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.2rem;gap:.8rem}' +
      '.tm-visor img{max-width:100%;max-height:72vh;border-radius:14px}' +
      '.tm-visor p{color:#fff;font-size:.85rem;text-align:center;margin:0}' +
      '.tm-visor button{max-width:320px}';
    document.head.appendChild(s);
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function chipGroup(label, items, current, onPick) {
    var row = el('div', 'tm-row');
    row.appendChild(el('span', 'tm-lab', label));
    var box = el('div', 'tm-chips');
    var nodes = {};
    items.forEach(function (it) {
      var b = el('button', 'tm-chip' + (it.v === current ? ' on' : ''), it.t);
      b.type = 'button';
      b.onclick = function () { onPick(it.v); };
      nodes[it.v] = b;
      box.appendChild(b);
    });
    row.appendChild(box);
    return { row: row, nodes: nodes, box: box };
  }

  function setOn(group, val) {
    Object.keys(group.nodes).forEach(function (k) { group.nodes[k].classList.toggle('on', k === val); });
  }

  function msg(t) { if (st) st.msgEl.textContent = t || ''; }

  function nombreArchivo() {
    var d = st.datos;
    return 'laguna-swim-acumulado-' + MESES[d.mes].toLowerCase() + '-' + d.anio + (st.opts.formato === 'historia' ? '-historia' : '') + '.png';
  }

  function fileSync() {
    // Respaldo síncrono (mismo método que la frase de la semana) por si el toque llega antes de que termine toBlob
    var url = st.canvas.toDataURL('image/png');
    var bin = atob(url.split(',')[1]), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return { file: new File([arr], nombreArchivo(), { type: 'image/png' }), url: url };
  }

  function render() {
    var tok = ++st.tok;
    st.file = null;
    var o = st.opts;
    var keys = o.logos === 'color' ? ['lsiColor', 'netColor'] : ['lsiBlanco', 'netBlanco'];
    if (o.fondo === 'gradiente' || !((o.fondo === 'foto' && o.fotoLocal) || (o.fondo === 'perfil' && o.fotoPerfil))) keys.push('emblema');
    Promise.all(keys.map(function (k) { return loadImg(IMG[k]).then(function (im) { return [k, im]; }, function () { return [k, null]; }); }))
      .then(function (pairs) {
        if (!st || tok !== st.tok) return;
        var imgs = {};
        pairs.forEach(function (p) { imgs[p[0]] = p[1]; });
        if (pairs.some(function (p) { return !p[1] && p[0] !== 'emblema'; })) msg('No se pudieron cargar los logos. Revisa tu conexión.');
        var c = dibujar({ datos: st.datos, formato: o.formato, logos: o.logos, fondo: o.fondo, nombre: o.nombre, fotoLocal: o.fotoLocal, fotoPerfil: o.fotoPerfil }, imgs);
        st.canvas = c;
        st.prevEl.innerHTML = '';
        st.prevEl.appendChild(c);
        c.setAttribute('role', 'img');
        c.setAttribute('aria-label', 'Tarjeta con ' + st.datos.metros + ' metros acumulados en ' + MESES[st.datos.mes]);
        try {
          c.toBlob(function (b) {
            if (b && st && tok === st.tok) st.file = new File([b], nombreArchivo(), { type: 'image/png' });
          }, 'image/png');
        } catch (e) { /* se usa el respaldo síncrono al compartir */ }
      });
  }

  function compartir() {
    if (!st || !st.canvas) return;
    var file = st.file, url = null;
    if (!file) { try { var r = fileSync(); file = r.file; url = r.url; } catch (e) { msg('No se pudo crear la imagen.'); return; } }
    if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(function (err) {
        if (err && err.name !== 'AbortError') { descargar(file, url); }
      });
    } else {
      descargar(file, url);
    }
  }

  function descargar(file, url) {
    if (!st || !st.canvas) return;
    if (!file) { try { var r = fileSync(); file = r.file; url = r.url; } catch (e) { msg('No se pudo crear la imagen.'); return; } }
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) { visor(url || st.canvas.toDataURL('image/png')); return; }
    var obj = URL.createObjectURL(file);
    var a = document.createElement('a');
    a.href = obj; a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(obj); }, 5000);
  }

  function visor(dataUrl) {
    var v = el('div', 'tm-visor');
    var im = new Image(); im.alt = 'Mi acumulado del mes'; im.src = dataUrl;
    v.appendChild(im);
    v.appendChild(el('p', '', 'Mantén presionada la imagen para guardarla o compartirla.'));
    var b = el('button', 'btn btn-gray', 'Cerrar'); b.type = 'button';
    b.onclick = function () { v.remove(); };
    v.appendChild(b);
    document.body.appendChild(v);
  }

  function cerrar() {
    if (!st) return;
    document.removeEventListener('keydown', st.onKey);
    document.body.style.overflow = st.prevOverflow;
    st.root.remove();
    st = null; // suelta la foto y el canvas de la memoria
  }

  window.abrirTarjetaMetros = function () {
    var d = window.premios && window.premios.tarjetaMetros;
    if (!d) { alert('Todavía no se cargan tus datos. Intenta de nuevo en un momento.'); return; }
    if (st) cerrar();
    injectCss();

    var opts = { formato: 'post', logos: 'blanco', fondo: 'gradiente', nombre: d.nombre, fotoLocal: null, fotoPerfil: null };
    var root = el('div', 'tm-ov');
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Mi acumulado del mes');
    var box = el('div', 'tm-box');
    root.appendChild(box);

    var head = el('div', 'tm-head');
    head.appendChild(el('h3', '', 'Mi acumulado de ' + MESES[d.mes]));
    var x = el('button', 'tm-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Cerrar'); x.onclick = cerrar;
    head.appendChild(x);
    box.appendChild(head);

    var prev = el('div', 'tm-prev'); box.appendChild(prev);
    var msgEl = el('p', 'tm-msg'); msgEl.setAttribute('role', 'status'); msgEl.setAttribute('aria-live', 'polite');

    st = { datos: d, opts: opts, root: root, prevEl: prev, msgEl: msgEl, tok: 0, file: null, canvas: null,
           prevOverflow: document.body.style.overflow };
    st.onKey = function (e) { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', st.onKey);

    if (d.metros <= 0) {
      prev.appendChild(el('p', 'tm-note', 'Todavía no hay metros registrados en ' + MESES[d.mes] + '. Registra un entrenamiento y vuelve para compartir tu acumulado.'));
      box.appendChild(msgEl);
      document.body.appendChild(root);
      document.body.style.overflow = 'hidden';
      return;
    }

    var gFormato = chipGroup('Formato', [{ v: 'post', t: 'Publicación' }, { v: 'historia', t: 'Historia' }], opts.formato, function (v) { opts.formato = v; setOn(gFormato, v); render(); });
    var gLogos = chipGroup('Logos', [{ v: 'blanco', t: 'Blancos' }, { v: 'color', t: 'A color' }], opts.logos, function (v) { opts.logos = v; setOn(gLogos, v); render(); });

    var fondos = [{ v: 'gradiente', t: 'Degradado' }];
    var gFondo = chipGroup('Fondo', fondos, opts.fondo, function (v) { elegirFondo(v); });
    // "Mi foto": etiqueta con input de archivo (abre galería o cámara)
    var lab = el('label', 'tm-chip'); lab.appendChild(document.createTextNode('Mi foto'));
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    lab.appendChild(inp);
    gFondo.box.appendChild(lab); gFondo.nodes.foto = lab;
    // Foto de perfil solo si existe y viene de Cloudinary (no se carga una URL cualquiera)
    var perfilOk = /^https:\/\/res\.cloudinary\.com\//.test(d.fotoUrl || '');
    if (perfilOk) {
      var bp = el('button', 'tm-chip', 'Foto de perfil'); bp.type = 'button'; bp.onclick = function () { elegirFondo('perfil'); };
      gFondo.box.appendChild(bp); gFondo.nodes.perfil = bp;
    }

    function elegirFondo(v) {
      msg('');
      if (v === 'perfil' && !opts.fotoPerfil) {
        loadImg(d.fotoUrl, true).then(function (im) {
          if (!st) return;
          opts.fotoPerfil = im; opts.fondo = 'perfil'; setOn(gFondo, 'perfil'); render();
        }, function () { if (st) msg('No se pudo usar la foto de perfil. Elige otra desde tu galería.'); });
        return;
      }
      opts.fondo = v; setOn(gFondo, v); render();
    }

    inp.addEventListener('change', function () {
      msg('');
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (!f) return;
      if (!FOTO_TIPOS.test(f.type)) { msg('Elige una foto (JPG, PNG o WebP).'); return; }
      if (f.size > MAX_FOTO_BYTES) { msg('La foto es muy pesada (máximo 25 MB).'); return; }
      prepararFoto(f).then(function (c) {
        if (!st) return;
        opts.fotoLocal = c; opts.fondo = 'foto'; setOn(gFondo, 'foto'); render();
      }, function () { if (st) msg('No se pudo leer esa foto. Prueba con otra.'); });
    });

    var nameRow = el('div', 'tm-row');
    nameRow.appendChild(el('span', 'tm-lab', 'Nombre'));
    var nin = document.createElement('input'); nin.type = 'text'; nin.className = 'tm-in'; nin.maxLength = 28; nin.value = d.nombre;
    nin.placeholder = 'Nombre en la tarjeta (opcional)'; nin.setAttribute('aria-label', 'Nombre en la tarjeta');
    var tmr = null;
    nin.addEventListener('input', function () { opts.nombre = nin.value; clearTimeout(tmr); tmr = setTimeout(function () { if (st) render(); }, 180); });
    nameRow.appendChild(nin);

    box.appendChild(gFormato.row); box.appendChild(gLogos.row); box.appendChild(gFondo.row); box.appendChild(nameRow);
    box.appendChild(msgEl);

    var bs = el('button', 'btn btn-gold', 'Compartir'); bs.type = 'button'; bs.onclick = compartir;
    var bd = el('button', 'btn btn-gray', 'Descargar imagen'); bd.type = 'button'; bd.onclick = function () { descargar(st && st.file, null); };
    box.appendChild(bs); box.appendChild(bd);
    box.appendChild(el('p', 'tm-note', 'La imagen se crea en tu teléfono. Tu foto no se sube a ningún servidor.'));

    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';
    render();
  };
})();
