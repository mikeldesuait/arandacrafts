/* ArandaCrafts — App Core (Limpio 100%) */
(function () {
  'use strict';
  var KEY_TEMA = 'arandacrafts:tema';

  // UTILIDADES
  function escapar(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function eur(n) {
    var v = parseFloat(n) || 0;
    return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  function toast(msg) {
    var el = document.getElementById('toast-global');
    if (!el) { el = document.createElement('div'); el.id = 'toast-global'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('visible');
    setTimeout(function () { el.classList.remove('visible'); }, 2200);
  }
  window.escapar = escapar;
  window.eur = eur;
  window.toast = toast;

  // TEMA Y NAVEGACIÓN
  function aplicarTema(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('btnTema');
    if (btn) btn.textContent = (t === 'dark') ? '☀️' : '🌙';
    localStorage.setItem(KEY_TEMA, t);
  }
  function initTema() {
    aplicarTema(localStorage.getItem(KEY_TEMA) || 'light');
    document.getElementById('btnTema')?.addEventListener('click', function () {
      var actual = document.documentElement.getAttribute('data-theme');
      aplicarTema(actual === 'dark' ? 'light' : 'dark');
    });
  }
  window.initTema = initTema;

  window.mostrarVista = function (nombre) {
    document.querySelectorAll('.vista').forEach(function (v) { v.classList.remove('activa'); });
    var target = document.getElementById('vista-' + nombre);
    if (target) target.classList.add('activa');
    document.querySelectorAll('.nav-btn').forEach(function (b) {
      b.classList.toggle('activa', b.dataset.vista === nombre);
    });
    location.hash = nombre;
    if (nombre === 'stock' && window.renderStock) window.renderStock();
    if (nombre === 'mano-obra' && window.renderManoObra) window.renderManoObra();
  };

  window.initNav = function () {
    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.mostrarVista(this.dataset.vista);
      });
    });
    var inicial = (location.hash || '#inicio').slice(1);
    window.mostrarVista(inicial || 'inicio');
  };

})();


/* ═══════════════════════════════════════════════════
   MÓDULO: STOCK Y PRODUCTOS (Con iconos y cálculo)
   ═══════════════════════════════════════════════════ */
(function() {
  var stockEstado = { nivel: 1, catId: null, subcatId: null };
  var EMOJIS_BASE = [
    { e: '👕', k: 'camiseta ropa' }, { e: '👖', k: 'pantalon ropa' }, { e: '🧥', k: 'chaqueta abrigo ropa' },
    { e: '🧢', k: 'gorra sombrero ropa' }, { e: '🧦', k: 'calcetines ropa' }, { e: '👗', k: 'vestido ropa' },
    { e: '👚', k: 'blusa ropa' }, { e: '🩳', k: 'shorts ropa' }, { e: '👔', k: 'corbata ropa' },
    { e: '🧤', k: 'guantes ropa' }, { e: '🧣', k: 'bufanda ropa' }, { e: '🥼', k: 'bata ropa' },
    { e: '🎨', k: 'pintura arte color' }, { e: '🖨️', k: 'impresora imprimir' }, { e: '🖌️', k: 'pincel pintar' },
    { e: '🧵', k: 'hilo coser' }, { e: '📏', k: 'regla medir' }, { e: '✂️', k: 'tijera cortar' },
    { e: '🔧', k: 'llave herramienta' }, { e: '🔨', k: 'martillo herramienta' }, { e: '🛠️', k: 'herramienta construir' },
    { e: '📦', k: 'caja paquete enviar' }, { e: '🍶', k: 'botella' }, { e: '🥤', k: 'vaso bebida' },
    { e: '🧸', k: 'peluche oso' }, { e: '🎁', k: 'regalo caja' }, { e: '🏷️', k: 'etiqueta precio' },
    { e: '✨', k: 'brillo estrella' }, { e: '🌟', k: 'estrella' }, { e: '💡', k: 'bombilla idea' },
    { e: '📁', k: 'carpeta' }, { e: '📝', k: 'nota escribir' }, { e: '📚', k: 'libro' },
    { e: '🍕', k: 'pizza comida' }, { e: '🍔', k: 'hamburguesa' }, { e: '🍰', k: 'tarta pastel' },
    { e: '🍺', k: 'cerveza' }, { e: '🍷', k: 'vino' }, { e: '☕', k: 'cafe taza' },
    { e: '🐕', k: 'perro' }, { e: '🐈', k: 'gato' }, { e: '🌳', k: 'arbol naturaleza' },
    { e: '🌺', k: 'flor' }, { e: '⚽', k: 'balon futbol' }, { e: '🏀', k: 'balon basket' },
    { e: '🎸', k: 'guitarra musica' }, { e: '🎮', k: 'videojuego' }, { e: '🚗', k: 'coche' },
    { e: '✈️', k: 'avion viaje' }, { e: '🏠', k: 'casa hogar' }, { e: '🔑', k: 'llave' },
    { e: '💰', k: 'dinero bolsa' }, { e: '📱', k: 'telefono movil' }, { e: '💻', k: 'ordenador portatil' },
    { e: '❤️', k: 'corazon amor' }, { e: '⭐', k: 'estrella favorito' }, { e: '🔥', k: 'fuego' }
  ];

  function pintarEmojis(contenedorId, inputId, customId, filtro) {
    var cont = document.getElementById(contenedorId);
    if (!cont) return;
    filtro = (filtro || '').toLowerCase().trim();
    var iconoActual = document.getElementById(inputId).value || '📦';
    cont.innerHTML = '';
    var lista = EMOJIS_BASE.filter(function (item) { return !filtro || item.k.indexOf(filtro) >= 0; });
    lista.forEach(function (item) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn' + (item.e === iconoActual ? ' activo' : '');
      btn.textContent = item.e;
      btn.onclick = function() {
        cont.querySelectorAll('.emoji-btn').forEach(function(b){ b.classList.remove('activo'); });
        btn.classList.add('activo');
        document.getElementById(inputId).value = item.e;
        var custom = document.getElementById(customId);
        if (custom) custom.value = '';
      };
      cont.appendChild(btn);
    });
  }

  function initCalculoPrecios() {
    var inpBase = document.getElementById('mp-precio-base');
    var inpIva = document.getElementById('mp-iva');
    var inpFinal = document.getElementById('mp-precio-final');
    if (!inpBase || !inpIva || !inpFinal) return;

    var cBase = inpBase.cloneNode(true), cIva = inpIva.cloneNode(true), cFinal = inpFinal.cloneNode(true);
    inpBase.parentNode.replaceChild(cBase, inpBase); inpIva.parentNode.replaceChild(cIva, inpIva); inpFinal.parentNode.replaceChild(cFinal, inpFinal);

    function calcular(e) {
      var iva = parseFloat(cIva.value) || 0;
      if (e.target === cFinal) {
        cBase.value = Math.round(((parseFloat(cFinal.value)||0) / (1 + (iva / 100))) * 100) / 100;
      } else {
        cFinal.value = Math.round(((parseFloat(cBase.value)||0) * (1 + (iva / 100))) * 100) / 100;
      }
    }
    cBase.addEventListener('input', calcular);
    cIva.addEventListener('input', calcular);
    cFinal.addEventListener('input', calcular);
  }

  window.abrirModalProducto = function(prod) {
    document.getElementById('modal-producto').hidden = false;
    window._prodEditandoId = prod ? prod.id : null;
    document.getElementById('mp-titulo').textContent = prod ? 'Editar producto' : 'Nuevo producto';

    function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
    setVal('mp-nombre', prod ? prod.nombre : '');
    setVal('mp-coste', (prod && prod.coste) ? prod.coste : '');
    setVal('mp-stock', (prod && prod.stock) ? prod.stock : '');
    setVal('mp-notas', (prod && prod.notas) ? prod.notas : '');
    setVal('mp-iva', (prod && prod.iva !== undefined) ? prod.iva : 21);
    setVal('mp-icono', (prod && prod.icono) ? prod.icono : '📦');
    setVal('mp-precio-base', (prod && prod.precio) ? prod.precio : 0);
    setVal('mp-precio-final', Math.round(((prod ? prod.precio : 0) * (1 + ((prod && prod.iva !== undefined ? prod.iva : 21)/100))) * 100) / 100);

    pintarEmojis('mp-emojis', 'mp-icono', 'mp-icono-custom', '');
    document.getElementById('mp-buscar-emoji').oninput = function() { pintarEmojis('mp-emojis', 'mp-icono', 'mp-icono-custom', this.value); };
    initCalculoPrecios();
  };

  window.abrirModalCarpeta = function(titulo, datosActuales, callback) {
    if (typeof datosActuales === 'function') { callback = datosActuales; datosActuales = null; }
    datosActuales = datosActuales || {};
    document.getElementById('mc-titulo').textContent = titulo;
    document.getElementById('mc-nombre').value = datosActuales.nombre || '';
    document.getElementById('mc-icono').value = datosActuales.icono || '📦';
    document.getElementById('modal-nueva-carpeta').hidden = false;

    pintarEmojis('mc-emojis', 'mc-icono', 'mc-icono-custom', '');
    document.getElementById('mc-buscar-emoji').oninput = function() { pintarEmojis('mc-emojis', 'mc-icono', 'mc-icono-custom', this.value); };

    var btnGuardar = document.getElementById('mc-guardar');
    var nuevoBtn = btnGuardar.cloneNode(true);
    btnGuardar.parentNode.replaceChild(nuevoBtn, btnGuardar);
    nuevoBtn.onclick = function() {
      var n = document.getElementById('mc-nombre').value.trim();
      if (!n) return;
      document.getElementById('modal-nueva-carpeta').hidden = true;
      callback(n, document.getElementById('mc-icono').value);
    };
  };

  function renderStock() {
    var cont = document.getElementById('stock-nivel1');
    if (!cont) return;
    var estructura = window.Modelo.getStockEstructura();
    cont.innerHTML = '';
    cont.className = 'grid-tarjetas';
    window._catIdActual = stockEstado.catId;
    window._subcatIdActual = stockEstado.subcatId;

    if (stockEstado.nivel === 1) {
      estructura.forEach(function (cat) {
        var card = document.createElement('div');
        card.className = 'tarjeta-stock';
        card.innerHTML = 
          '<div class="card-tools">' +
            '<button type="button" class="btn-borrar-tarjeta btn-edit-tarjeta" title="Editar">✏️</button>' +
            '<button type="button" class="btn-borrar-tarjeta btn-del-tarjeta" title="Eliminar">🗑️</button>' +
          '</div>' +
          '<div class="tarjeta-icono">' + cat.icono + '</div>' +
          '<div class="tarjeta-titulo">' + escapar(cat.nombre) + '</div>' +
          '<div class="tarjeta-desc">' + (cat.categorias ? cat.categorias.length : 0) + ' subcategorías</div>';
        
        card.addEventListener('click', function (e) {
          if (e.target.closest('.card-tools')) return;
          stockEstado.nivel = 2; stockEstado.catId = cat.id; renderStock();
        });

        // Botón editar
        card.querySelector('.btn-edit-tarjeta').addEventListener('click', function(e) {
          e.stopPropagation();
          window.abrirModalCarpeta('Editar bloque', { nombre: cat.nombre, icono: cat.icono }, function (n, i) {
            cat.nombre = n; cat.icono = i;
            window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
            renderStock();
          });
        });

        // Botón borrar
        card.querySelector('.btn-del-tarjeta').addEventListener('click', function(e) {
          e.stopPropagation();
          if (confirm('¿Eliminar el bloque "' + cat.nombre + '"?')) {
            var nueva = estructura.filter(function (c) { return c.id !== cat.id; });
            window.Modelo.setStockEstructura(nueva);
            renderStock();
          }
        });
        cont.appendChild(card);
      });
      var add = document.createElement('div');
      add.className = 'tarjeta-stock tarjeta-add';
      add.innerHTML = '<div class="tarjeta-icono">➕</div><div class="tarjeta-titulo">Añadir bloque</div>';
      add.onclick = function () {
        window.abrirModalCarpeta('Nuevo bloque', null, function (n, i) {
          estructura.push({ id: 's-' + window.Storage.uuid(), nombre: n, icono: i, categorias: [] });
          window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50); renderStock();
        });
      };
      cont.appendChild(add);
      return;
    }

    if (stockEstado.nivel === 2) {
      var catPadre = estructura.find(function (c) { return c.id === stockEstado.catId; });
      if (!catPadre) { stockEstado.nivel = 1; return renderStock(); }
      if (!catPadre.categorias) catPadre.categorias = [];
      
      var btnVolver = document.createElement('button');
      btnVolver.className = 'btn-volver'; btnVolver.innerHTML = '← Volver a ' + escapar(catPadre.nombre);
      btnVolver.onclick = function () { stockEstado.nivel = 1; renderStock(); };
      btnVolver.style.gridColumn = '1 / -1'; btnVolver.style.marginBottom = '1rem';
      cont.appendChild(btnVolver);

      catPadre.categorias.forEach(function (sub) {
        var card = document.createElement('div');
        card.className = 'tarjeta-stock';
        card.innerHTML = 
          '<div class="card-tools">' +
            '<button type="button" class="btn-borrar-tarjeta btn-edit-tarjeta" title="Editar">✏️</button>' +
            '<button type="button" class="btn-borrar-tarjeta btn-del-tarjeta" title="Eliminar">🗑️</button>' +
          '</div>' +
          '<div class="tarjeta-icono">' + (sub.icono || '📁') + '</div>' +
          '<div class="tarjeta-titulo">' + escapar(sub.nombre) + '</div>' +
          '<div class="tarjeta-desc">Ver productos</div>';
        
        card.addEventListener('click', function (e) {
          if (e.target.closest('.card-tools')) return;
          stockEstado.nivel = 3; stockEstado.subcatId = sub.id; renderStock();
        });

        // Botón editar
        card.querySelector('.btn-edit-tarjeta').addEventListener('click', function(e) {
          e.stopPropagation();
          window.abrirModalCarpeta('Editar carpeta', { nombre: sub.nombre, icono: sub.icono || '📁' }, function (n, i) {
            sub.nombre = n; sub.icono = i;
            window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
            renderStock();
          });
        });

        // Botón borrar
        card.querySelector('.btn-del-tarjeta').addEventListener('click', function(e) {
          e.stopPropagation();
          if (confirm('¿Eliminar la carpeta "' + sub.nombre + '"?')) {
            catPadre.categorias = catPadre.categorias.filter(function (c) { return c.id !== sub.id; });
            window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
            renderStock();
          }
        });
        cont.appendChild(card);
      });

      var addSub = document.createElement('div');
      addSub.className = 'tarjeta-stock tarjeta-add';
      addSub.innerHTML = '<div class="tarjeta-icono">➕</div><div class="tarjeta-titulo">Nueva carpeta</div>';
      addSub.onclick = function () {
        window.abrirModalCarpeta('Nueva carpeta', null, function (n, i) {
          catPadre.categorias.push({ id: 's-' + window.Storage.uuid(), nombre: n, icono: i });
          window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50); renderStock();
        });
      };
      cont.appendChild(addSub);
      return;
    }

    if (stockEstado.nivel === 3) {
      var catPadre2 = estructura.find(function (c) { return c.id === stockEstado.catId; });
      var subcat = catPadre2.categorias.find(function (c) { return c.id === stockEstado.subcatId; });
      if (!subcat) { stockEstado.nivel = 2; return renderStock(); }

      var btnVolver2 = document.createElement('button');
      btnVolver2.className = 'btn-volver'; btnVolver2.innerHTML = '← Volver a ' + escapar(catPadre2.nombre);
      btnVolver2.onclick = function () { stockEstado.nivel = 2; renderStock(); };
      btnVolver2.style.gridColumn = '1 / -1'; btnVolver2.style.marginBottom = '1rem';
      cont.appendChild(btnVolver2);

      var productos = subcat.productos || [];
      productos.forEach(function (prod) {
        var card = document.createElement('div');
        card.className = 'tarjeta-stock';
        var tallasTxt = '';
        if (false && prod.variantes && prod.variantes.length) {
           tallasTxt = '<div style="font-size:0.75rem; color:var(--text-soft); margin-top:0.3rem;">' +
             prod.variantes.map(function(v){ return v.color + ' ' + v.talla + ':' + v.cantidad; }).join(' · ') +
           '</div>';
        }

        card.innerHTML = 
          '<div class="card-tools">' +
            '<button type="button" class="btn-borrar-tarjeta btn-edit-tarjeta" title="Editar">✏️</button>' +
            '<button type="button" class="btn-borrar-tarjeta btn-del-tarjeta" title="Eliminar">🗑️</button>' +
          '</div>' +
          '<div class="tarjeta-icono">' + (prod.icono || '📦') + '</div>' +
          '<div class="tarjeta-titulo">' + escapar(prod.nombre) + '</div>' +
          '<div class="tarjeta-desc" style="font-size:1.1rem; font-weight:bold; color:var(--primary);">' + eur(prod.precio * (1 + (prod.iva||0)/100)) + '</div>' +
          (prod.stock > 0 ? '<div class="tarjeta-desc">Stock: ' + Number(prod.stock).toFixed(1).replace('.0', '') + '</div>' : '<div class="tarjeta-desc" style="color:var(--danger)">Agotado</div>') +
          tallasTxt;
        
        // Abrir modal al hacer clic en la tarjeta
        card.addEventListener('click', function (e) {
          if (e.target.closest('.card-tools')) return;
          window.abrirModalProducto(prod); 
        });

        // Botón editar (llama a lo mismo)
        card.querySelector('.btn-edit-tarjeta').addEventListener('click', function(e) {
          e.stopPropagation();
          window.abrirModalProducto(prod);
        });

        // Botón borrar
        card.querySelector('.btn-del-tarjeta').addEventListener('click', function(e) {
          e.stopPropagation();
          if (confirm('¿Eliminar el producto "' + prod.nombre + '"?')) {
            subcat.productos = subcat.productos.filter(function(p){ return p.id !== prod.id; });
            window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
            renderStock();
          }
        });
        cont.appendChild(card);
      });

      var addProd = document.createElement('div');
      addProd.className = 'tarjeta-stock tarjeta-add';
      addProd.innerHTML = '<div class="tarjeta-icono">➕</div><div class="tarjeta-titulo">Nuevo producto</div>';
      addProd.onclick = function () { window.abrirModalProducto(null); };
      cont.appendChild(addProd);
    }
  }
  window.renderStock = renderStock;
  window.initStock = function() { renderStock(); };

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mp-guardar')?.addEventListener('click', function(e) {
      e.preventDefault();
      var nombre = document.getElementById('mp-nombre').value.trim();
      if (!nombre) return;
      var pBase = parseFloat(document.getElementById('mp-precio-base').value) || 0;
      var pIva = parseFloat(document.getElementById('mp-iva').value) || 21;
      
      var nuevoProd = {
        id: window._prodEditandoId || window.Storage.uuid(),
        nombre: nombre, precio: pBase, iva: pIva,
        coste: parseFloat(document.getElementById('mp-coste').value) || 0,
        stock: parseFloat((document.getElementById('mp-stock').value || '0').replace(',', '.')) || 0,
        icono: document.getElementById('mp-icono').value || '📦',
        notas: document.getElementById('mp-notas').value.trim()
      };

      var estructura = window.Modelo.getStockEstructura();
      var cat = estructura.find(function(c){ return c.id === window._catIdActual; });
      if (!cat) return;
      var sub = cat.categorias.find(function(c){ return c.id === window._subcatIdActual; });
      if (!sub) return;
      if (!sub.productos) sub.productos = [];
      
      var idx = sub.productos.findIndex(function(p) { return p.id === nuevoProd.id; });
      if (idx >= 0) sub.productos[idx] = nuevoProd; else sub.productos.push(nuevoProd);

      window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
      document.getElementById('modal-producto').hidden = true;
      renderStock();
      toast('Producto guardado');
    });
  });
})();

// ── PARCHE MAESTRO: Navegación garantizada ──
document.addEventListener('DOMContentLoaded', function() {
  // Esto se ejecuta nada más cargar la página
  var navBtns = document.querySelectorAll('.nav-btn');
  
  navBtns.forEach(function(btn) {
    // Si el botón ya tiene un evento (onclick), lo quitamos para no duplicar
    btn.onclick = null;
    
    // Le ponemos el nuestro directamente
    btn.onclick = function(e) {
      e.preventDefault();
      var vista = this.getAttribute('data-vista');
      if (window.mostrarVista) {
        window.mostrarVista(vista);
      }
    };
  });
  
  console.log("✅ Navegación blindada: botones conectados a mostrarVista");
});

/* ═══════════════════════════════════════════════════
   FUNCIÓN DE VARIANTES (Añadida al final sin romper nada)
   ═══════════════════════════════════════════════════ */
function agregarFilaVariante(color, talla, cantidad) {
  var tbody = document.getElementById('mp-lista-variantes');
  if (!tbody) return;

  var COLORES = ['Blanco', 'Negro', 'Rojo', 'Azul', 'Verde', 'Gris', 'Amarillo', 'Naranja', 'Rosa', 'Morado'];
  var TALLAS = ['Sin talla', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Única'];

  var tr = document.createElement('tr');
  tr.innerHTML =
    '<td>' +
      '<select class="var-color-select" style="width:100%; margin-bottom: 0.3rem;">' +
        '<option value="">— Color —</option>' +
        COLORES.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') +
        '<option value="__otro__">✏️ Otro...</option>' +
      '</select>' +
      '<input type="text" class="var-color-custom" value="' + (color || '') + '" placeholder="Escribe el color..." style="width:100%; display: none;">' +
    '</td>' +
    '<td>' +
      '<select class="var-talla-select" style="width:100%; margin-bottom: 0.3rem;">' +
        '<option value="">— Talla —</option>' +
        TALLAS.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('') +
        '<option value="__otro__">✏️ Otra...</option>' +
      '</select>' +
      '<input type="text" class="var-talla-custom" value="' + (talla || '') + '" placeholder="Escribe la talla..." style="width:100%; display: none;">' +
    '</td>' +
    '<td><input type="text" class="var-cant" value="' + (cantidad || 0) + '" min="0" style="width:100%; text-align:right;"></td>' +
    '<td class="centro"><button type="button" class="btn btn-sm btn-peligro btn-del-var">✕</button></td>';

  var selColor = tr.querySelector('.var-color-select');
  var inpColor = tr.querySelector('.var-color-custom');
  if (color && COLORES.indexOf(color) === -1) {
    selColor.value = '__otro__';
    inpColor.style.display = 'block';
  } else if (color) {
    selColor.value = color;
  }
  selColor.addEventListener('change', function() {
    if (this.value === '__otro__') { inpColor.style.display = 'block'; inpColor.focus(); }
    else { inpColor.style.display = 'none'; inpColor.value = ''; }
  });

  var selTalla = tr.querySelector('.var-talla-select');
  var inpTalla = tr.querySelector('.var-talla-custom');
  if (talla && TALLAS.indexOf(talla) === -1) {
    selTalla.value = '__otro__';
    inpTalla.style.display = 'block';
  } else if (talla) {
    selTalla.value = talla;
  }
  selTalla.addEventListener('change', function() {
    if (this.value === '__otro__') { inpTalla.style.display = 'block'; inpTalla.focus(); }
    else { inpTalla.style.display = 'none'; inpTalla.value = ''; }
  });

  tr.querySelector('.btn-del-var').addEventListener('click', function() {
    tr.remove();
    recalcularStockDesdeVariantes();
  });

  tr.querySelector('.var-cant').addEventListener('input', recalcularStockDesdeVariantes);
  tbody.appendChild(tr);
  recalcularStockDesdeVariantes();
}

function recalcularStockDesdeVariantes() {
  var tbody = document.getElementById('mp-lista-variantes');
  var inputStock = document.getElementById('mp-stock');
  var spanTotal = document.getElementById('mp-stock-total');
  if (!tbody) return;
  var total = 0;
  tbody.querySelectorAll('.var-cant').forEach(function(inp) {
    total += parseFloat((inp.value || '0').replace(',', '.')) || 0;
  });
  if (inputStock) inputStock.value = total;
  if (spanTotal) spanTotal.textContent = total;
}

// Enganchar el botón de añadir variante y la carga inicial
document.addEventListener('DOMContentLoaded', function() {
  var btnAddVar = document.getElementById('mp-add-variante');
  if (btnAddVar) {
    btnAddVar.addEventListener('click', function() {
      agregarFilaVariante('', '', 0);
    });
  }
});

// Extender la función abrirModalProducto (que ya existe) para cargar las variantes
var _abrirProdOrig = window.abrirModalProducto;
if (_abrirProdOrig) {
  window.abrirModalProducto = function(prod) {
    _abrirProdOrig(prod);
    
    var tbody = document.getElementById('mp-lista-variantes');
    var seccion = document.getElementById('mp-seccion-variantes');
    if (!tbody || !seccion) return;

    tbody.innerHTML = '';
    var esRopa = true; // Forzado para todos los productos
    
    if (esRopa) {
      seccion.style.display = 'block';
      var vars = (prod && prod.variantes) ? prod.variantes : [{ color: 'Blanco', talla: 'S', cantidad: 0 }];
      vars.forEach(function(v) { agregarFilaVariante(v.color, v.talla, v.cantidad); });
      recalcularStockDesdeVariantes();
    } else {
      seccion.style.display = 'none';
    }
  };
}

/* ═══════════════════════════════════════════════════
   FUNCIÓN MANO DE OBRA (Añadida al final)
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Botón de Añadir Trabajo
  var btnNuevaMano = document.getElementById('btnNuevaMano');
  if (btnNuevaMano) {
    // Clonar para eliminar eventos viejos
    var nuevoBtn = btnNuevaMano.cloneNode(true);
    btnNuevaMano.parentNode.replaceChild(nuevoBtn, btnNuevaMano);

    nuevoBtn.addEventListener('click', function() {
      var tbody = document.getElementById('tbody-mano-obra');
      if (!tbody) return;

      var tr = document.createElement('tr');
      tr.innerHTML = 
        '<td><input type="text" class="inp-nombre" placeholder="Nuevo trabajo..."></td>' +
        '<td><select class="inp-tipo"><option value="hora">hora</option><option value="fijo">fijo</option><option value="unidad">unidad</option></select></td>' +
        '<td><input type="number" step="0.01" class="inp-precio" value="0"></td>' +
        '<td><input type="number" step="1" class="inp-iva" value="21"></td>' +
        '<td><input type="number" step="0.01" class="inp-precio-final" value="0" style="background:var(--bg-soft); font-weight:bold;"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
      
      // Lógica BIDIRECCIONAL en la nueva fila
      var inBase = tr.querySelector('.inp-precio');
      var inIva = tr.querySelector('.inp-iva');
      var inFinal = tr.querySelector('.inp-precio-final');

      function recalcular(e) {
        var iva = parseFloat(inIva.value) || 0;
        if (e && e.target === inFinal) {
          var finalVal = parseFloat(inFinal.value) || 0;
          inBase.value = Math.round((finalVal / (1 + (iva / 100))) * 100) / 100;
        } else {
          var base = parseFloat(inBase.value) || 0;
          inFinal.value = Math.round((base * (1 + (iva / 100))) * 100) / 100;
        }
      }
      inBase.addEventListener('input', recalcular);
      inIva.addEventListener('input', recalcular);
      inFinal.removeAttribute('readonly');
      inFinal.addEventListener('input', recalcular);

      tr.querySelector('.btn-borrar').onclick = function() { tr.remove(); };
      tbody.appendChild(tr);
      
      // Poner el foco en el campo de nombre
      tr.querySelector('.inp-nombre').focus();
    });
  }

  // 2. Botón de Guardar Cambios
  var btnGuardarMano = document.getElementById('btnGuardarManoObra');
  if (btnGuardarMano) {
    var nuevoBtnGuardar = btnGuardarMano.cloneNode(true);
    btnGuardarMano.parentNode.replaceChild(nuevoBtnGuardar, btnGuardarMano);

    nuevoBtnGuardar.addEventListener('click', function() {
      var tbody = document.getElementById('tbody-mano-obra');
      if (!tbody) return;

      var lista = [];
      tbody.querySelectorAll('tr').forEach(function(tr) {
        var nomInput = tr.querySelector('.inp-nombre');
        var tipoInput = tr.querySelector('.inp-tipo');
        var precioInput = tr.querySelector('.inp-precio');
        var ivaInput = tr.querySelector('.inp-iva');
        
        if (nomInput && nomInput.value.trim()) {
          lista.push({ 
            id: tr.dataset.id || window.Storage.uuid(), 
            nombre: nomInput.value.trim(), 
            tipo: tipoInput ? tipoInput.value : 'hora', 
            precio: precioInput ? (parseFloat(precioInput.value) || 0) : 0, 
            iva: ivaInput ? (parseFloat(ivaInput.value) || 21) : 21
          });
        }
      });

      // Forzar el guardado
      window.Modelo.setManoObra(lista);
      
      // Feedback
      if (window.renderManoObra) window.renderManoObra();
      if (window.toast) window.toast('Mano de obra guardada en memoria');
    });
  }

});


/* ═══════════════════════════════════════════════════
   MÓDULO: CLIENTES
   ═══════════════════════════════════════════════════ */
(function() {
  var PROVINCIAS = [
    'A Coruña','Álava','Albacete','Alicante','Almería','Asturias','Ávila',
    'Badajoz','Barcelona','Burgos','Cáceres','Cádiz','Cantabria','Castellón',
    'Ceuta','Ciudad Real','Córdoba','Cuenca','Girona','Granada','Guadalajara',
    'Guipúzcoa','Huelva','Huesca','Islas Baleares','Jaén','La Rioja','Las Palmas',
    'León','Lleida','Lugo','Madrid','Málaga','Melilla','Murcia','Navarra',
    'Ourense','Palencia','Pontevedra','Salamanca','Santa Cruz de Tenerife',
    'Segovia','Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia',
    'Valladolid','Vizcaya','Zamora','Zaragoza'
  ];
  var TIPOS_CLIENTE = ['Particular', 'Autónomo', 'Empresa'];

  function cargarProvincias(seleccionada) {
    var sel = document.getElementById('cl-provincia');
    if (!sel) return;
    var out = '<option value="">— Provincia —</option>';
    PROVINCIAS.forEach(function (p) {
      out += '<option value="' + p + '"' + (p === seleccionada ? ' selected' : '') + '>' + p + '</option>';
    });
    sel.innerHTML = out;
  }

  function marcarTipoActivo(tipo) {
    document.querySelectorAll('#cl-tipo-tabs .tipo-tab').forEach(function (tab) {
      tab.classList.toggle('activo', tab.dataset.tipo === tipo);
    });
    var hidden = document.getElementById('cl-tipo');
    if (hidden) hidden.value = tipo;
  }

  window.renderClientes = function() {
    var cont  = document.getElementById('clientes-lista');
    var vacio = document.getElementById('clientes-vacio');
    if (!cont || !vacio) return;

    var lista = window.Modelo.getClientes() || [];
    cont.innerHTML = '';

    if (!lista.length) {
      cont.style.display = 'none';
      vacio.style.display = '';
      return;
    }
    cont.style.display = '';
    vacio.style.display = 'none';

    lista.forEach(function (c) {
      var card = document.createElement('div');
      var tipo = c.tipo || 'Particular';
      var claseTipo = '';
      if (tipo === 'Empresa')   claseTipo = 'tipo-empresa';
      if (tipo === 'Autónomo')  claseTipo = 'tipo-autonomo';
      if (tipo === 'Particular')claseTipo = 'tipo-particular';
      
      card.className = 'cliente-card ' + claseTipo;
      card.dataset.id = c.id;

      var dirLineas = [];
      if (c.direccion) dirLineas.push(c.direccion);
      var cpCiudad = [c.cp, c.ciudad].filter(Boolean).join(' ');
      if (cpCiudad) dirLineas.push(cpCiudad);
      if (c.provincia) dirLineas.push(c.provincia);
      if (c.pais && c.pais !== 'España') dirLineas.push(c.pais);

      var contactos = [];
      if (c.telefono) contactos.push(c.telefono);
      if (c.email) contactos.push(c.email);

      card.innerHTML =
        '<div class="tipo-badge ' + claseTipo + '">' + window.escapar(tipo) + '</div>' +
        '<h3>' + window.escapar(c.nombre || '(sin nombre)') + '</h3>' +
        (c.nif ? '<div class="cliente-nif">' + window.escapar(c.nif) + '</div>' : '') +
        '<div class="cliente-datos">' +
          (c.contacto ? '<div><strong>Cont.:</strong>' + window.escapar(c.contacto) + '</div>' : '') +
          (dirLineas.length ? '<div>' + window.escapar(dirLineas.join(', ')) + '</div>' : '') +
          (contactos.length ? '<div>' + window.escapar(contactos.join(' · ')) + '</div>' : '') +
        '</div>';

      card.onclick = function () {
        window.abrirModalCliente(c.id);
      };

      cont.appendChild(card);
    });
  };

  window.abrirModalCliente = function(id) {
    window._clienteEditandoId = id || null;
    var titulo = document.getElementById('modal-cliente-titulo');
    var btnBorrar = document.getElementById('cl-borrar');

    cargarProvincias('');

    if (id) {
      var c = window.Modelo.buscarClientePorId(id);
      if (!c) return;
      titulo.textContent = 'Editar cliente';
      btnBorrar.style.display = 'inline-flex';

      marcarTipoActivo(c.tipo || 'Particular');
      document.getElementById('cl-nombre').value     = c.nombre || '';
      document.getElementById('cl-nif').value        = c.nif || '';
      document.getElementById('cl-contacto').value   = c.contacto || '';
      document.getElementById('cl-direccion').value  = c.direccion || '';
      document.getElementById('cl-cp').value         = c.cp || '';
      document.getElementById('cl-ciudad').value     = c.ciudad || '';
      cargarProvincias(c.provincia || '');
      document.getElementById('cl-pais').value       = c.pais || 'España';
      document.getElementById('cl-telefono').value   = c.telefono || '';
      document.getElementById('cl-email').value      = c.email || '';
      document.getElementById('cl-notas').value      = c.notas || '';
    } else {
      titulo.textContent = 'Nuevo cliente';
      btnBorrar.style.display = 'none';

      marcarTipoActivo('Particular');
      document.getElementById('cl-nombre').value     = '';
      document.getElementById('cl-nif').value        = '';
      document.getElementById('cl-contacto').value   = '';
      document.getElementById('cl-direccion').value  = '';
      document.getElementById('cl-cp').value         = '';
      document.getElementById('cl-ciudad').value     = '';
      document.getElementById('cl-pais').value       = 'España';
      document.getElementById('cl-telefono').value   = '';
      document.getElementById('cl-email').value      = '';
      document.getElementById('cl-notas').value      = '';
    }

    document.getElementById('modal-cliente').hidden = false;
  };

  function cerrarModalCliente() {
    document.getElementById('modal-cliente').hidden = true;
    window._clienteEditandoId = null;
  }

  function guardarClienteDesdeModal() {
    var nombre = document.getElementById('cl-nombre').value.trim();
    if (!nombre) {
      document.getElementById('cl-nombre').focus();
      return;
    }

    var nuevo = {
      id:        window._clienteEditandoId || window.Storage.uuid(),
      tipo:      document.getElementById('cl-tipo').value,
      nombre:    nombre,
      nif:       document.getElementById('cl-nif').value.trim(),
      contacto:  document.getElementById('cl-contacto').value.trim(),
      direccion: document.getElementById('cl-direccion').value.trim(),
      cp:        document.getElementById('cl-cp').value.trim(),
      ciudad:    document.getElementById('cl-ciudad').value.trim(),
      provincia: document.getElementById('cl-provincia').value,
      pais:      document.getElementById('cl-pais').value.trim() || 'España',
      telefono:  document.getElementById('cl-telefono').value.trim(),
      email:     document.getElementById('cl-email').value.trim(),
      notas:     document.getElementById('cl-notas').value.trim()
    };

    var lista = window.Modelo.getClientes();
    var idx = lista.findIndex(function (x) { return x.id === nuevo.id; });
    if (idx >= 0) lista[idx] = nuevo;
    else lista.push(nuevo);

    window.Modelo.setClientes(lista);
    window.renderClientes();
    cerrarModalCliente();
    window.toast('Cliente guardado');
  }

  function borrarClienteDesdeModal() {
    if (!window._clienteEditandoId) return;
    var c = window.Modelo.buscarClientePorId(window._clienteEditandoId);
    if (!c) return;

    if (!confirm('¿Eliminar a "' + (c.nombre || 'este cliente') + '"?')) return;

    var lista = window.Modelo.getClientes().filter(function (x) { return x.id !== window._clienteEditandoId; });
    window.Modelo.setClientes(lista);
    window.renderClientes();
    cerrarModalCliente();
    window.toast('Cliente eliminado');
  }

  window.initClientes = function() {
    var cont = document.getElementById('clientes-lista');
    if (!cont) return;

    window.renderClientes();

    // Tipo tabs
    document.querySelectorAll('#cl-tipo-tabs .tipo-tab').forEach(function (tab) {
      var nuevoTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(nuevoTab, tab);
      nuevoTab.addEventListener('click', function () {
        marcarTipoActivo(nuevoTab.dataset.tipo);
      });
    });

    // Botones
    document.getElementById('btnNuevoCliente')?.addEventListener('click', function () {
      window.abrirModalCliente(null);
    });

    document.getElementById('cl-borrar')?.addEventListener('click', borrarClienteDesdeModal);
    document.getElementById('cl-guardar')?.addEventListener('click', guardarClienteDesdeModal);
    
    // Cerrar modal
    document.getElementById('modal-cliente-cerrar')?.addEventListener('click', cerrarModalCliente);
    document.getElementById('modal-cliente')?.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay')) cerrarModalCliente();
    });
  };
})();

// Arrancar Clientes
document.addEventListener('DOMContentLoaded', function() {
  if (window.initClientes) window.initClientes();
});

/* ═══════════════════════════════════════════════════
   MÓDULO: TRABAJOS (Nuevo, limpio y aislado)
   ═══════════════════════════════════════════════════ */
(function() {
  var CLAVE = 'arandacrafts:trabajos';
  
  var TRABAJOS_INICIALES = [
    { id: 't-diseno', nombre: 'Diseño personalizado', tipo: 'hora', precio: 25.00, iva: 21 },
    { id: 't-preparacion', nombre: 'Preparación de archivos', tipo: 'fijo', precio: 5.00, iva: 21 },
    { id: 't-planchado', nombre: 'Colocación y planchado', tipo: 'unidad', precio: 0.80, iva: 21 },
    { id: 't-packaging', nombre: 'Packaging individual', tipo: 'unidad', precio: 0.50, iva: 21 },
    { id: 't-envio', nombre: 'Envío península', tipo: 'fijo', precio: 5.90, iva: 21 }
  ];

  function getTrabajos() {
    var data = localStorage.getItem(CLAVE);
    if (!data) {
      localStorage.setItem(CLAVE, JSON.stringify(TRABAJOS_INICIALES));
      return TRABAJOS_INICIALES;
    }
    return JSON.parse(data);
  }

  function setTrabajos(lista) {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  }

  window.renderTrabajos = function() {
    var tbody = document.getElementById('tbody-trabajos');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    var lista = getTrabajos();
    lista.forEach(function(t) {
      var tr = document.createElement('tr');
      tr.dataset.id = t.id;
      
      var opcionesTipo = '';
      ['hora', 'fijo', 'unidad'].forEach(function(tipo) {
        opcionesTipo += '<option value="' + tipo + '"' + (t.tipo === tipo ? ' selected' : '') + '>' + tipo + '</option>';
      });

      var precioFinal = t.precio * (1 + (t.iva / 100));

      tr.innerHTML = 
        '<td><input type="text" class="tr-nombre" value="' + window.escapar(t.nombre) + '"></td>' +
        '<td><select class="tr-tipo">' + opcionesTipo + '</select></td>' +
        '<td><input type="number" step="0.01" class="tr-precio" value="' + t.precio + '"></td>' +
        '<td><input type="number" step="1" class="tr-iva" value="' + t.iva + '"></td>' +
        '<td><input type="number" step="0.01" class="tr-final" value="' + (Math.round(precioFinal * 100) / 100) + '" style="background:var(--bg-soft); font-weight:bold;"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';

      // Lógica bidireccional
      var inpBase = tr.querySelector('.tr-precio');
      var inpIva = tr.querySelector('.tr-iva');
      var inpFinal = tr.querySelector('.tr-final');

      function recalcular(e) {
        var iva = parseFloat(inpIva.value) || 0;
        if (e && e.target === inpFinal) {
          inpBase.value = Math.round(((parseFloat(inpFinal.value) || 0) / (1 + (iva / 100))) * 100) / 100;
        } else {
          inpFinal.value = Math.round(((parseFloat(inpBase.value) || 0) * (1 + (iva / 100))) * 100) / 100;
        }
      }

      inpBase.addEventListener('input', recalcular);
      inpIva.addEventListener('input', recalcular);
      inpFinal.addEventListener('input', recalcular);

      tr.querySelector('.btn-borrar').onclick = function() {
        tr.remove();
      };

      tbody.appendChild(tr);
    });
  };

  window.initTrabajos = function() {
    window.renderTrabajos();

    // Botón de añadir
    var btnNuevo = document.getElementById('btnNuevoTrabajo');
    if (btnNuevo) {
      var nuevoBtn = btnNuevo.cloneNode(true);
      btnNuevo.parentNode.replaceChild(nuevoBtn, btnNuevo);
      
      nuevoBtn.addEventListener('click', function() {
        var tbody = document.getElementById('tbody-trabajos');
        var tr = document.createElement('tr');
        tr.innerHTML = 
          '<td><input type="text" class="tr-nombre" placeholder="Nuevo trabajo..."></td>' +
          '<td><select class="tr-tipo"><option value="hora">hora</option><option value="fijo">fijo</option><option value="unidad">unidad</option></select></td>' +
          '<td><input type="number" step="0.01" class="tr-precio" value="0"></td>' +
          '<td><input type="number" step="1" class="tr-iva" value="21"></td>' +
          '<td><input type="number" step="0.01" class="tr-final" value="0" style="background:var(--bg-soft); font-weight:bold;"></td>' +
          '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';

        var inpBase = tr.querySelector('.tr-precio');
        var inpIva = tr.querySelector('.tr-iva');
        var inpFinal = tr.querySelector('.tr-final');

        function recalcular(e) {
          var iva = parseFloat(inpIva.value) || 0;
          if (e && e.target === inpFinal) {
            inpBase.value = Math.round(((parseFloat(inpFinal.value) || 0) / (1 + (iva / 100))) * 100) / 100;
          } else {
            inpFinal.value = Math.round(((parseFloat(inpBase.value) || 0) * (1 + (iva / 100))) * 100) / 100;
          }
        }
        inpBase.addEventListener('input', recalcular);
        inpIva.addEventListener('input', recalcular);
        inpFinal.addEventListener('input', recalcular);

        tr.querySelector('.btn-borrar').onclick = function() { tr.remove(); };
        tbody.appendChild(tr);
        tr.querySelector('.tr-nombre').focus();
      });
    }

    // Botón de guardar
    var btnGuardar = document.getElementById('btnGuardarTrabajos');
    if (btnGuardar) {
      var nuevoBtnGuardar = btnGuardar.cloneNode(true);
      btnGuardar.parentNode.replaceChild(nuevoBtnGuardar, btnGuardar);
      
      nuevoBtnGuardar.addEventListener('click', function() {
        var tbody = document.getElementById('tbody-trabajos');
        var lista = [];
        
        tbody.querySelectorAll('tr').forEach(function(tr) {
          var nombre = tr.querySelector('.tr-nombre') ? tr.querySelector('.tr-nombre').value.trim() : '';
          if (nombre) {
            lista.push({
              id: tr.dataset.id || window.Storage.uuid(),
              nombre: nombre,
              tipo: tr.querySelector('.tr-tipo') ? tr.querySelector('.tr-tipo').value : 'hora',
              precio: parseFloat(tr.querySelector('.tr-precio') ? tr.querySelector('.tr-precio').value : 0) || 0,
              iva: parseFloat(tr.querySelector('.tr-iva') ? tr.querySelector('.tr-iva').value : 21) || 21
            });
          }
        });

        setTrabajos(lista);
        window.toast('Trabajos guardados (' + lista.length + ')');
        console.log('✅ Trabajos guardados:', lista);
        window.renderTrabajos();
      });
    }
  };

  // Enganchar al menú (mostrarVista)
  document.addEventListener('DOMContentLoaded', function() {
    // Parchear mostrarVista si es necesario
    var btnTrabajos = document.querySelector('.nav-btn[data-vista="trabajos"]');
    if (btnTrabajos) {
      btnTrabajos.addEventListener('click', function() {
        setTimeout(window.renderTrabajos, 50);
      });
    }
    
    // Si recargamos directamente en la pestaña, pintar
    if (location.hash === '#trabajos') {
      setTimeout(window.renderTrabajos, 100);
    }
  });

})();

/* ═══════════════════════════════════════════════════
   FUNCIONES GLOBALES PARA TRABAJOS (Onclick directo)
   ═══════════════════════════════════════════════════ */
window.anadirTrabajo = function() {
  var tbody = document.getElementById('tbody-trabajos');
  if (!tbody) return;

  var tr = document.createElement('tr');
  tr.innerHTML = 
    '<td><input type="text" class="tr-nombre" placeholder="Nuevo trabajo..."></td>' +
    '<td><select class="tr-tipo"><option value="hora">hora</option><option value="fijo">fijo</option><option value="unidad">unidad</option></select></td>' +
    '<td><input type="number" step="0.01" class="tr-precio" value="0"></td>' +
    '<td><input type="number" step="1" class="tr-iva" value="21"></td>' +
    '<td><input type="number" step="0.01" class="tr-final" value="0" style="background:var(--bg-soft); font-weight:bold;"></td>' +
    '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';

  var inBase = tr.querySelector('.tr-precio');
  var inIva = tr.querySelector('.tr-iva');
  var inFinal = tr.querySelector('.tr-final');

  function recalcular(e) {
    var iva = parseFloat(inIva.value) || 0;
    if (e && e.target === inFinal) {
      inBase.value = Math.round(((parseFloat(inFinal.value) || 0) / (1 + (iva / 100))) * 100) / 100;
    } else {
      inFinal.value = Math.round(((parseFloat(inBase.value) || 0) * (1 + (iva / 100))) * 100) / 100;
    }
  }
  
  inBase.addEventListener('input', recalcular);
  inIva.addEventListener('input', recalcular);
  inFinal.addEventListener('input', recalcular);

  tr.querySelector('.btn-borrar').onclick = function() { tr.remove(); };
  
  tbody.appendChild(tr);
  tr.querySelector('.tr-nombre').focus();
};

window.guardarTrabajos = function() {
  var tbody = document.getElementById('tbody-trabajos');
  if (!tbody) return;

  var lista = [];
  tbody.querySelectorAll('tr').forEach(function(tr) {
    var nombre = tr.querySelector('.tr-nombre') ? tr.querySelector('.tr-nombre').value.trim() : '';
    if (nombre) {
      lista.push({
        id: tr.dataset.id || window.Storage.uuid(),
        nombre: nombre,
        tipo: tr.querySelector('.tr-tipo') ? tr.querySelector('.tr-tipo').value : 'hora',
        precio: parseFloat(tr.querySelector('.tr-precio') ? tr.querySelector('.tr-precio').value : 0) || 0,
        iva: parseFloat(tr.querySelector('.tr-iva') ? tr.querySelector('.tr-iva').value : 21) || 21
      });
    }
  });

  // Guardar en LocalStorage (Clave independiente 'trabajos')
  localStorage.setItem('arandacrafts:trabajos', JSON.stringify(lista));
  
  if (window.toast) window.toast('Trabajos guardados (' + lista.length + ')');
  console.log('✅ Trabajos guardados desde el botón:', lista);
  
  // Si hay función de render, refrescar
  if (window.renderTrabajos) window.renderTrabajos();
};

/* ═══════════════════════════════════════════════════
   MÓDULO: REGISTRO DE ENTRADA (Reconstruido)
   ═══════════════════════════════════════════════════ */
(function() {
  var CLAVE = 'arandacrafts:registro';

  function getRegistros() {
    var data = localStorage.getItem(CLAVE);
    return data ? JSON.parse(data) : [];
  }

  function setRegistros(lista) {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  }

  // ── Pintar las tarjetas de registros guardados ──
  window.renderRegistroEntradas = function() {
    var cont = document.getElementById('registro-lista');
    var vacio = document.getElementById('registro-vacio');
    if (!cont || !vacio) return;

    var lista = getRegistros();
    cont.innerHTML = '';

    if (!lista.length) {
      cont.style.display = 'none';
      vacio.style.display = '';
      return;
    }
    cont.style.display = '';
    vacio.style.display = 'none';

    // Ordenar por fecha descendente
    lista.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });

    lista.forEach(function(r) {
      var cliente = window.Modelo.buscarClientePorId(r.clienteId) || { nombre: 'Cliente desconocido' };
      var totalPrendas = (r.lineas || []).reduce(function(acc, l) { return acc + (parseInt(l.cantidad) || 0); }, 0);
      
      var card = document.createElement('div');
      card.className = 'tarjeta-stock';
      card.style.cursor = 'pointer';

      var htmlLineas = '';
      (r.lineas || []).forEach(function(l) {
        htmlLineas += '<div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom: 1px dashed var(--border); padding: 0.2rem 0;">' +
                        '<span>' + window.escapar(l.concepto) + '</span>' +
                        '<strong>' + l.cantidad + '</strong>' +
                      '</div>';
      });

      card.innerHTML =
        '<div class="card-tools">' +
          '<button type="button" class="btn-borrar-tarjeta btn-edit-reg" title="Editar">✏️</button>' +
          '<button type="button" class="btn-borrar-tarjeta btn-borrar-reg" title="Eliminar">🗑️</button>' +
        '</div>' +
        '<div class="tarjeta-titulo">' + window.escapar(cliente.nombre) + '</div>' +
        '<div class="tarjeta-desc" style="margin-bottom: 0.5rem;">' + new Date(r.fecha).toLocaleDateString('es-ES') + ' · ' + totalPrendas + ' prendas</div>' +
        '<div style="width:100%; text-align:left;">' + htmlLineas + '</div>' +
        (r.notas ? '<div style="font-size:0.8rem; color:var(--text-soft); margin-top:0.5rem; font-style:italic;">' + window.escapar(r.notas) + '</div>' : '');

      // EDITAR registro
      card.querySelector('.btn-edit-reg').addEventListener('click', function(e) {
        e.stopPropagation();
        window.abrirModalRegistro(r);
      });

      // Abrir modal al hacer clic en la tarjeta (excepto en los botones)
      card.addEventListener('click', function(e) {
        if (e.target.closest('.card-tools')) return;
        window.abrirModalRegistro(r);
      });

      // Eliminar registro
      card.querySelector('.btn-borrar-reg').addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('¿Eliminar este registro de ropa?')) {
          var nueva = getRegistros().filter(function(x) { return x.id !== r.id; });
          setRegistros(nueva);
          window.renderRegistroEntradas();
          if (window.toast) window.toast('Registro eliminado');
        }
      });

      cont.appendChild(card);
    });
  };

  // ── Abrir el modal para crear/editar ──
  window.abrirModalRegistro = function(registro) {
    window._registroEditandoId = registro ? registro.id : null;
    
    var sel = document.getElementById('me-cliente');
    sel.innerHTML = '<option value="">— Elige cliente —</option>';
    window.Modelo.getClientes().forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre + (c.nif ? ' · ' + c.nif : '');
      sel.appendChild(opt);
    });

    // Cargar botones comunes
    var contBotones = document.getElementById('me-botones-comunes');
    contBotones.innerHTML = '';
    (window.Modelo.getCosasComunes() || []).forEach(function(c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-comun';
      btn.textContent = c.icono + ' ' + c.nombre;
      btn.onclick = function() {
        var tbody = document.getElementById('me-lineas');
        tbody.appendChild(nuevaLineaRegistro(c.nombre, 1));
      };
      contBotones.appendChild(btn);
    });

    // Resetear formulario
    var hoy = new Date().toISOString().split('T')[0];
    document.getElementById('me-fecha').value = hoy;
    document.getElementById('me-notas').value = '';
    var tbody = document.getElementById('me-lineas');
    tbody.innerHTML = '';
    tbody.appendChild(nuevaLineaRegistro());

    if (registro) {
      document.getElementById('me-fecha').value = registro.fecha;
      document.getElementById('me-notas').value = registro.notas || '';
      sel.value = registro.clienteId;
      tbody.innerHTML = '';
      (registro.lineas || []).forEach(function(l) {
        tbody.appendChild(nuevaLineaRegistro(l.concepto, l.cantidad));
      });
    }

    document.getElementById('modal-entrada').hidden = false;
  };

  function nuevaLineaRegistro(nombre, cantidad) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input type="text" class="inp-con" value="' + (nombre || '') + '" placeholder="Ej: Camisetas..." style="width:100%;"></td>' +
      '<td><input type="number" min="1" class="inp-cant" value="' + (cantidad || 1) + '" style="width:100%;"></td>' +
      '<td class="centro"><button type="button" class="btn btn-sm btn-peligro btn-del-linea">✕</button></td>';
    tr.querySelector('.btn-del-linea').onclick = function() { tr.remove(); };
    return tr;
  }

  // ── Guardar el registro ──
  window.guardarRegistroEntrada = function() {
    var sel = document.getElementById('me-cliente');
    var clienteId = sel.value;
    if (!clienteId) { alert('Elige un cliente.'); return; }

    var tbody = document.getElementById('me-lineas');
    var lineas = [];
    tbody.querySelectorAll('tr').forEach(function(tr) {
      var concepto = tr.querySelector('.inp-con').value.trim();
      var cant = parseInt(tr.querySelector('.inp-cant').value) || 0;
      if (concepto && cant > 0) lineas.push({ concepto: concepto, cantidad: cant });
    });

    if (!lineas.length) { alert('Añade al menos una prenda.'); return; }

    var lista = getRegistros();
    var nuevo = {
      id: window._registroEditandoId || 'reg-' + Date.now(),
      clienteId: clienteId,
      fecha: document.getElementById('me-fecha').value,
      notas: document.getElementById('me-notas').value.trim(),
      lineas: lineas
    };

    var idx = lista.findIndex(function(r) { return r.id === nuevo.id; });
    if (idx >= 0) lista[idx] = nuevo; else lista.push(nuevo);

    setRegistros(lista);
    document.getElementById('modal-entrada').hidden = true;
    window.renderRegistroEntradas();
    if (window.toast) window.toast('Registro guardado (' + lineas.length + ' líneas)');
  };

  // ── Iniciar el módulo ──
  window.initRegistroEntradas = function() {
    var cont = document.getElementById('registro-lista');
    if (!cont) return;

    window.renderRegistroEntradas();

    // Enganchar el botón de añadir línea manual
    var btnAdd = document.getElementById('me-add-linea');
    if (btnAdd) {
      var nuevoBtn = btnAdd.cloneNode(true);
      btnAdd.parentNode.replaceChild(nuevoBtn, btnAdd);
      nuevoBtn.onclick = function() {
        document.getElementById('me-lineas').appendChild(nuevaLineaRegistro());
      };
    }

    // Enganchar el botón de guardar
    var btnGuardar = document.getElementById('me-guardar');
    if (btnGuardar) {
      var nuevoBtnG = btnGuardar.cloneNode(true);
      btnGuardar.parentNode.replaceChild(nuevoBtnG, btnGuardar);
      nuevoBtnG.onclick = function() {
        window.guardarRegistroEntrada();
      };
    }
  };

  // Al arrancar
  document.addEventListener('DOMContentLoaded', function() {
    window.initRegistroEntradas();
    
    // Si estamos en la pestaña de registro, pintar
    if (location.hash === '#registro') {
      setTimeout(window.renderRegistroEntradas, 100);
    }

    // Pintar al pinchar en el menú
    var btnMenu = document.querySelector('.nav-btn[data-vista="registro"]');
    if (btnMenu) {
      btnMenu.addEventListener('click', function() {
        setTimeout(window.renderRegistroEntradas, 50);
      });
    }
  });

})();
/* ═══════════════════════════════════════════════════
   MÓDULO: AJUSTES (Guardado de emisor)
   ═══════════════════════════════════════════════════ */
(function() {

  window.guardarAjustesEmisor = function() {
    var el = function(id) { return document.getElementById(id); };
    
    var em = {
      marca:     el('aj-marca') ? el('aj-marca').value.trim() : '',
      eslogan:   el('aj-eslogan') ? el('aj-eslogan').value.trim() : '',
      nombre:    el('aj-nombre') ? el('aj-nombre').value.trim() : '',
      nif:       el('aj-nif') ? el('aj-nif').value.trim() : '',
      direccion: el('aj-direccion') ? el('aj-direccion').value.trim() : '',
      telefono:  el('aj-telefono') ? el('aj-telefono').value.trim() : '',
      email:     el('aj-email') ? el('aj-email').value.trim() : '',
      web:       el('aj-web') ? el('aj-web').value.trim() : '',
      iban:      el('aj-iban') ? el('aj-iban').value.trim() : ''
    };

    window.Modelo.setEmisor(em);
    
    if (window.toast) window.toast('Datos de empresa guardados');
    console.log('✅ Emisor guardado:', em);
  };

  window.cargarAjustesEnForm = function() {
    var em = window.Modelo.getEmisor() || {};
    var el = function(id) { return document.getElementById(id); };
    
    if (el('aj-marca')) el('aj-marca').value = em.marca || 'Aranda Crafts';
    if (el('aj-eslogan')) el('aj-eslogan').value = em.eslogan || '';
    if (el('aj-nombre')) el('aj-nombre').value = em.nombre || '';
    if (el('aj-nif')) el('aj-nif').value = em.nif || '';
    if (el('aj-direccion')) el('aj-direccion').value = em.direccion || '';
    if (el('aj-telefono')) el('aj-telefono').value = em.telefono || '';
    if (el('aj-email')) el('aj-email').value = em.email || '';
    if (el('aj-web')) el('aj-web').value = em.web || '';
    if (el('aj-iban')) el('aj-iban').value = em.iban || '';

    var tema = localStorage.getItem('arandacrafts:tema') || 'light';
    if (el('aj-tema')) el('aj-tema').value = tema;
  };

  window.initAjustes = function() {
    window.cargarAjustesEnForm();
  };

  // Enganchar al arrancar
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('aj-guardar-emisor');
    if (btn) {
      var nuevoBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(nuevoBtn, btn);
      
      nuevoBtn.addEventListener('click', function() {
        window.guardarAjustesEmisor();
      });
    }

    // Si estamos en la pestaña de ajustes, cargar datos
    if (location.hash === '#ajustes') {
      setTimeout(window.initAjustes, 100);
    }

    // Cargar datos al pinchar en el menú
    var btnMenu = document.querySelector('.nav-btn[data-vista="ajustes"]');
    if (btnMenu) {
      btnMenu.addEventListener('click', function() {
        setTimeout(window.initAjustes, 50);
      });
    }
  });

})();

/* ═══════════════════════════════════════════════════
   FUNCIONES DE BACKUP (Exportar / Importar)
   ═══════════════════════════════════════════════════ */
(function() {

  // ── EXPORTAR ──
  window.exportarBackup = function() {
    // Recopilar todos los datos del localStorage que empiezan por 'arandacrafts:'
    var backup = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf('arandacrafts:') === 0) {
        backup[key] = localStorage.getItem(key);
      }
    }

    // Convertir a JSON y descargar
    var json = JSON.stringify(backup, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    
    var hoy = new Date();
    var nombre = 'arandacrafts-backup-' + hoy.getFullYear() + '-' + 
                 String(hoy.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(hoy.getDate()).padStart(2, '0') + '.json';

    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    
    setTimeout(function() { URL.revokeObjectURL(url); }, 500);
    
    // Guardar la fecha de la última exportación
    localStorage.setItem('arandacrafts:ultima-export', new Date().toLocaleString('es-ES'));
    
    if (window.toast) window.toast('Backup exportado: ' + nombre);
    console.log('✅ Backup exportado:', backup);
    
    // Refrescar estadísticas
    if (window.actualizarEstadisticasAjustes) window.actualizarEstadisticasAjustes();
  };

  // ── IMPORTAR ──
  window.importarBackup = function(file) {
    if (!file) return;
    if (!confirm('⚠️ Esto reemplazará TODOS tus datos actuales. ¿Continuar?')) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        
        // Borrar las claves actuales de la app
        var claves = [];
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key.indexOf('arandacrafts:') === 0) claves.push(key);
        }
        claves.forEach(function(k) { localStorage.removeItem(k); });

        // Restaurar las nuevas
        var count = 0;
        Object.keys(data).forEach(function(k) {
          if (k.indexOf('arandacrafts:') === 0) {
            localStorage.setItem(k, data[k]);
            count++;
          }
        });

        if (window.toast) window.toast('Backup importado. Recargando...');
        setTimeout(function() { location.reload(); }, 1000);
        console.log('✅ Backup importado. Claves restauradas:', count);
      } catch (err) {
        alert('El archivo no es un JSON válido o está dañado.');
        console.error('Error al importar:', err);
      }
    };
    reader.readAsText(file);
  };

  // ── ENGANCHE AL ARRANCAR ──
  document.addEventListener('DOMContentLoaded', function() {
    var btnExportar = document.getElementById('aj-exportar');
    if (btnExportar) {
      btnExportar.onclick = window.exportarBackup;
    }

    var btnImportar = document.getElementById('aj-importar');
    if (btnImportar) {
      btnImportar.onclick = function() {
        var inputFile = document.getElementById('aj-file');
        if (inputFile) inputFile.click();
      };
    }

    var inputFile = document.getElementById('aj-file');
    if (inputFile) {
      inputFile.onchange = function(e) {
        window.importarBackup(e.target.files[0]);
        e.target.value = ''; // Resetear para poder importar otro
      };
    }
  });

})();

/* ═══════════════════════════════════════════════════
   MÓDULO: TEMA (Claro / Oscuro)
   ═══════════════════════════════════════════════════ */
(function() {

  function aplicarTema(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('btnTema');
    if (btn) btn.textContent = (t === 'dark') ? '☀️' : '🌙';
    localStorage.setItem('arandacrafts:tema', t);
  }

  window.initTema = function() {
    // Cargar tema guardado (o claro por defecto)
    var guardado = localStorage.getItem('arandacrafts:tema') || 'light';
    aplicarTema(guardado);

    // Botón de la barra superior
    var btnTema = document.getElementById('btnTema');
    if (btnTema) {
      var nuevoBtn = btnTema.cloneNode(true);
      btnTema.parentNode.replaceChild(nuevoBtn, btnTema);
      
      nuevoBtn.addEventListener('click', function() {
        var actual = document.documentElement.getAttribute('data-theme') || 'light';
        aplicarTema(actual === 'dark' ? 'light' : 'dark');
      });
    }

    // Selector de Ajustes (si existe)
    var selTema = document.getElementById('aj-tema');
    if (selTema) {
      var nuevoSel = selTema.cloneNode(true);
      selTema.parentNode.replaceChild(nuevoSel, selTema);
      
      nuevoSel.value = guardado;
      nuevoSel.addEventListener('change', function() {
        aplicarTema(this.value);
      });
    }
  };

  // Ejecutar al arrancar
  document.addEventListener('DOMContentLoaded', function() {
    window.initTema();
  });

})();

/* ═══════════════════════════════════════════════════
   MÓDULO: ESTADÍSTICAS (Información en Ajustes)
   ═══════════════════════════════════════════════════ */
(function() {

  window.actualizarEstadisticasAjustes = function() {
    var el = function(id) { return document.getElementById(id); };
    
    // 1. Presupuestos guardados
    if (el('aj-info-presu')) {
      var presupuestos = window.Modelo.getPresupuestos() || [];
      el('aj-info-presu').textContent = presupuestos.length;
    }

    // 2. Productos en Stock (todos los que hay en todas las carpetas)
    if (el('aj-info-materiales')) {
      var todosProductos = window.Modelo.getTodosLosProductos() || [];
      el('aj-info-materiales').textContent = todosProductos.length;
    }

    // 3. Ropa en catálogo (la que está en el bloque 's-ropa')
    if (el('aj-info-ropa')) {
      var estructura = window.Modelo.getStockEstructura() || [];
      var catRopa = estructura.find(function(c) { return c.id === 's-ropa'; });
      var totalRopa = 0;
      if (catRopa && catRopa.categorias) {
        catRopa.categorias.forEach(function(sub) {
          totalRopa += (sub.productos || []).length;
        });
      }
      el('aj-info-ropa').textContent = totalRopa;
    }

    // 4. Trabajos (Mano de obra)
    if (el('aj-info-mano')) {
      var trabajos = JSON.parse(localStorage.getItem('arandacrafts:trabajos') || '[]');
      el('aj-info-mano').textContent = trabajos.length;
    }

    // 5. Espacio usado en localStorage
    if (el('aj-info-espacio')) {
      var bytes = 0;
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.indexOf('arandacrafts:') === 0) {
          bytes += (key.length + (localStorage.getItem(key) || '').length) * 2; // x2 por UTF-16
        }
      }
      var kb = (bytes / 1024).toFixed(1);
      el('aj-info-espacio').textContent = kb + ' KB';
    }

    // 6. Última exportación
    if (el('aj-ultima-export')) {
      var ultima = localStorage.getItem('arandacrafts:ultima-export');
      el('aj-ultima-export').textContent = ultima || '—';
    }
  };

  // Enganchar al arrancar
  document.addEventListener('DOMContentLoaded', function() {
    // Si estamos en ajustes, actualizar
    if (location.hash === '#ajustes') {
      setTimeout(window.actualizarEstadisticasAjustes, 100);
    }

    // Actualizar al pinchar en el menú
    var btnMenu = document.querySelector('.nav-btn[data-vista="ajustes"]');
    if (btnMenu) {
      btnMenu.addEventListener('click', function() {
        setTimeout(window.actualizarEstadisticasAjustes, 50);
      });
    }
  });

})();

/* ═══════════════════════════════════════════════════
   MÓDULO: ZONA PELIGROSA (Borrar todo)
   ═══════════════════════════════════════════════════ */
(function() {

  window.borrarTodosLosDatos = function() {
    // 1. Primera confirmación
    if (!confirm('⚠️ Se borrarán TODOS los datos (Productos, Clientes, Presupuestos...). ¿Continuar?')) {
      return;
    }

    // 2. Segunda confirmación con palabra clave
    var palabra = null;
    if (palabra !== 'BORRAR') {
      alert('Cancelado. No se ha borrado nada.');
      return;
    }

    // 3. Borrar todas las claves de la app
    var claves = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf('arandacrafts:') === 0) {
        claves.push(key);
      }
    }
    claves.forEach(function(k) { localStorage.removeItem(k); });

    // 4. Feedback y recarga
    alert('Todos los datos han sido borrados. La página se recargará.');
    location.reload();
  };

  // Enganchar al arrancar
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('aj-borrar-todo');
    if (btn) {
      var nuevoBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(nuevoBtn, btn);
      
      nuevoBtn.addEventListener('click', function() {
        window.borrarTodosLosDatos();
      });
    }
  });

})();

/* ═══════════════════════════════════════════════════
   MÓDULO: PRESUPUESTOS (Parte 1: Listado y nuevo)
   ═══════════════════════════════════════════════════ */
(function() {
  var CLAVE = 'arandacrafts:presupuestos';

  function getPresupuestos() {
    var data = localStorage.getItem(CLAVE);
    return data ? JSON.parse(data) : [];
  }

  function setPresupuestos(lista) {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  }

  // ── Pintar el listado ──
  window.renderListadoPresupuestos = function() {
    var tabla = document.getElementById('presu-tabla');
    var vacio = document.getElementById('presu-vacio');
    var tbody = document.getElementById('tbody-presupuestos');
    if (!tabla || !tbody) return;

    var lista = getPresupuestos();
    
    if (!lista.length) {
      tabla.style.display = 'none';
      if (vacio) vacio.style.display = '';
      return;
    }
    tabla.style.display = '';
    if (vacio) vacio.style.display = 'none';

    tbody.innerHTML = '';
    lista.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); }).forEach(function(p) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + window.escapar(p.tipo || 'Presupuesto') + '</td>' +
        '<td>' + window.escapar(p.numero) + '</td>' +
        '<td>' + window.escapar(p.fecha) + '</td>' +
        '<td>' + window.escapar(p.cliente ? p.cliente.nombre : '') + '</td>' +
        '<td class="derecha mono">' + window.eur(p.total || 0) + '</td>' +
        '<td>' + window.escapar(p.estado || 'borrador') + '</td>' +
        '<td class="centro">' +
          '<button class="btn btn-sm btn-editar" data-id="' + p.id + '">✏️</button> ' +
          '<button class="btn btn-sm btn-peligro btn-eliminar" data-id="' + p.id + '">🗑️</button>' +
        '</td>';
      
      tr.querySelector('.btn-editar').onclick = function() {
        window.editarPresupuesto(p.id);
      };
      tr.querySelector('.btn-eliminar').onclick = function() {
        if (confirm('¿Eliminar presupuesto ' + p.numero + '?')) {
          var nueva = getPresupuestos().filter(function(x) { return x.id !== p.id; });
          setPresupuestos(nueva);
          window.renderListadoPresupuestos();
          if (window.toast) window.toast('Presupuesto eliminado');
        }
      };
      
      tbody.appendChild(tr);
    });
  };

  // ── Nuevo presupuesto ──
  window.nuevoPresupuesto = function() {
    var nuevo = {
      id: 'pre-' + Date.now(),
      tipo: 'presupuesto',
      numero: 'PRE-' + new Date().getFullYear() + '-' + String(getPresupuestos().length + 1).padStart(3, '0'),
      fecha: new Date().toISOString().split('T')[0],
      cliente: null,
      lineas: [],
      estado: 'borrador',
      notas: '',
      total: 0
    };
    window.abrirEditorPresupuesto(nuevo);
  };

  // ── Abrir el editor (se define en la Parte 2) ──
  window.abrirEditorPresupuesto = function(presupuesto) {
    // Por ahora, solo mostramos el editor y guardamos el presupuesto en memoria
    window._presupuestoActual = presupuesto;
    
    // Si el editor no está completo aún, mostramos el HTML básico
    document.getElementById('presu-listado').style.display = 'none';
    document.getElementById('presu-editor').style.display = 'block';
    
    // Rellenar los campos básicos
    var el = function(id) { return document.getElementById(id); };
    if (el('presu-numero')) el('presu-numero').value = presupuesto.numero;
    if (el('presu-fecha')) el('presu-fecha').value = presupuesto.fecha;
    if (el('presu-tipo')) el('presu-tipo').value = presupuesto.tipo;
    if (el('presu-estado')) el('presu-estado').value = presupuesto.estado;
    if (el('presu-notas')) el('presu-notas').value = presupuesto.notas;
    
    // Rellenar el selector de clientes
    var selCliente = document.getElementById('presu-cliente-select');
    if (selCliente) {
      selCliente.innerHTML = '<option value="">— Elegir cliente —</option>';
      (window.Modelo.getClientes() || []).forEach(function(c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        selCliente.appendChild(opt);
      });
      if (presupuesto.cliente) selCliente.value = presupuesto.cliente.id;
    }
    
    if (window.toast) window.toast('Editor de presupuesto abierto');
  };

  window.editarPresupuesto = function(id) {
    var lista = getPresupuestos();
    var p = lista.find(function(x) { return x.id === id; });
    if (p) window.abrirEditorPresupuesto(p);
  };

  window.cerrarEditorPresupuesto = function() {
    document.getElementById('presu-editor').style.display = 'none';
    document.getElementById('presu-listado').style.display = 'block';
    window.renderListadoPresupuestos();
  };

  // ── Enganchar al arrancar ──
  window.initPresupuestos = function() {
    window.renderListadoPresupuestos();
    
    var btnNuevo = document.getElementById('btnNuevoPresupuesto');
    if (btnNuevo) {
      var nuevoBtn = btnNuevo.cloneNode(true);
      btnNuevo.parentNode.replaceChild(nuevoBtn, btnNuevo);
      nuevoBtn.onclick = window.nuevoPresupuesto;
    }

    var btnVolver = document.getElementById('btnVolverListado');
    if (btnVolver) {
      var nuevoBtn2 = btnVolver.cloneNode(true);
      btnVolver.parentNode.replaceChild(nuevoBtn2, btnVolver);
      nuevoBtn2.onclick = window.cerrarEditorPresupuesto;
    }
  };

  // Arrancar al cargar
  document.addEventListener('DOMContentLoaded', function() {
    if (location.hash === '#presupuestos') {
      setTimeout(window.initPresupuestos, 100);
    }
    var btnMenu = document.querySelector('.nav-btn[data-vista="presupuestos"]');
    if (btnMenu) {
      btnMenu.addEventListener('click', function() {
        setTimeout(window.initPresupuestos, 50);
      });
    }
  });

})();

/* ═══════════════════════════════════════════════════
   MÓDULO: EDITOR DE PRESUPUESTOS (Parte 2: Líneas)
   ═══════════════════════════════════════════════════ */
(function() {

  // Variables globales para el editor
  window._lineasEditor = []; // Array de líneas del presupuesto actual

  // ── Dibujar las líneas en la tabla ──
  window.renderLineasEditor = function() {
    var contenedor = document.getElementById('lineas-editor');
    if (!contenedor) {
      // Si no existe el contenedor, lo creamos dinámicamente dentro del editor
      var editor = document.getElementById('presu-editor');
      if (!editor) return;
      
      // Buscar el contenedor dinámico
      var cont = document.getElementById('contenedor-lineas-dinamico');
      if (!cont) {
        // Si no existe, lo creamos justo debajo del botón "+ Añadir línea"
        var btnAdd = document.getElementById('btnAnadirLinea');
        if (btnAdd) {
          var nuevoCont = document.createElement('div');
          nuevoCont.id = 'contenedor-lineas-dinamico';
          nuevoCont.style.marginTop = '1rem';
          btnAdd.parentNode.parentNode.insertBefore(nuevoCont, btnAdd.parentNode.nextSibling);
          cont = nuevoCont;
        }
      }
      contenedor = cont;
    }
    if (!contenedor) return;

    contenedor.innerHTML = '';

    var totalBase = 0;
    var totalIva = 0;

    window._lineasEditor.forEach(function(linea, index) {
      var div = document.createElement('div');
      div.className = 'card';
      div.style.padding = '0.5rem';
      div.style.marginBottom = '0.5rem';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '0.5rem';

      // Calcular total de la línea
      var cantidad = parseFloat(linea.cantidad) || 0;
      var precioBase = parseFloat(linea.precio) || 0;
      var iva = parseFloat(linea.iva) || 0;
      var descuento = parseFloat(linea.descuento) || 0;

      var base = cantidad * precioBase;
      if (descuento > 0) base = base * (1 - (descuento / 100));
      var ivaLinea = base * (iva / 100);
      
      // Redondear a 2 decimales (céntimos)
      base = Math.round(base * 100) / 100;
      ivaLinea = Math.round(ivaLinea * 100) / 100;
      
      totalBase += base;
      totalIva += ivaLinea;

      div.innerHTML = 
        '<div style="flex: 2;">' +
          '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" style="width:100%;">' +
        '</div>' +
        '<div style="flex: 1;">' +
          '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1;">' +
          '<input type="number" step="0.01" class="inp-precio" value="' + precioBase + '" placeholder="Precio" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1;">' +
          '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1; text-align:right; font-weight:bold; padding: 0.5rem;">' + window.eur(base) + '</div>' +
        '<div>' +
          '<button class="btn btn-sm btn-peligro">🗑️</button>' +
        '</div>';

      // Eventos para recalcular
      var inputCant = div.querySelector('.inp-cant');
      var inputPrecio = div.querySelector('.inp-precio');
      var inputIva = div.querySelector('.inp-iva');
      var inputCon = div.querySelector('.inp-con');

      function recalcular(e) {
        linea.cantidad = parseFloat(inputCant.value) || 0;
        linea.precio = parseFloat(inputPrecio.value) || 0;
        linea.iva = parseFloat(inputIva.value) || 0;
        linea.concepto = inputCon.value;
        window.renderLineasEditor();
      }

      inputCant.addEventListener('input', recalcular);
      inputPrecio.addEventListener('input', recalcular);
      inputIva.addEventListener('input', recalcular);
      inputCon.addEventListener('input', recalcular);

      div.querySelector('.btn-peligro').onclick = function() {
        window._lineasEditor.splice(index, 1);
        window.renderLineasEditor();
      };

      contenedor.appendChild(div);
    });

    // Actualizar el total general
    var totalBox = document.getElementById('presu-total');
    if (totalBox) {
      var totalFinal = Math.round((totalBase + totalIva) * 100) / 100;
      totalBox.textContent = window.eur(totalFinal);
    }
  };

  // ── Añadir una línea desde el catálogo ──
  

  

  // ── Enganchar el botón "+ Añadir línea" ──
  document.addEventListener('DOMContentLoaded', function() {
    var btnAdd = document.getElementById('btnAnadirLinea');
    if (btnAdd) {
      var nuevoBtn = btnAdd.cloneNode(true);
      btnAdd.parentNode.replaceChild(nuevoBtn, btnAdd);

      nuevoBtn.onclick = function() {
        var tipo = null;
        if (tipo === '1') window.abrirModal('producto');
        else if (tipo === '2') window.abrirModal('trabajo');
      };
    }
  });

  // Al abrir un presupuesto, cargar sus líneas
  var _abrirEditorOrig = window.abrirEditorPresupuesto;
  if (_abrirEditorOrig) {
    window.abrirEditorPresupuesto = function(presupuesto) {
      _abrirEditorOrig(presupuesto);
      window._lineasEditor = presupuesto.lineas || [];
      setTimeout(window.renderLineasEditor, 100);
    };
  }

})();

/* ═══════════════════════════════════════════════════
   SELECTOR VISUAL CON NAVEGACIÓN POR CATEGORÍAS
   ═══════════════════════════════════════════════════ */
(function() {

  var estadoSelector = {
    tipo: 'productos', // 'productos' o 'trabajos'
    categoria: null,   // ej: 's-ropa'
    subcategoria: null // ej: 's-camisetas'
  };

  

  

  window.anadirLineaAlPresupuesto = function(linea) {
    window._lineasEditor.push(linea);
    document.getElementById('modal-selector-lineas').hidden = true;
    window.renderLineasEditor();
    if (window.toast) window.toast('Línea añadida');
  };

  // Enganchar el botón "+ Añadir línea"
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btnAnadirLinea');
    if (btn) {
      var nuevo = btn.cloneNode(true);
      btn.parentNode.replaceChild(nuevo, btn);
      nuevo.onclick = function() { window.abrirModal(); };
    }
  });

})();

/* ═══════════════════════════════════════════════════
   CONEXIÓN DEL BOTÓN AL MODAL VISUAL
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('btnAnadirLinea');
  if (btn) {
    // Quitar eventos antiguos
    var nuevo = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevo, btn);
    
    // Conectar el nuevo
    nuevo.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Verificar si la función nueva existe
      if (window.abrirModal) {
        window.abrirModal('producto');
      } else {
        console.error('La función abrirModal no está definida');
      }
    });
  }
});

/* ═══════════════════════════════════════════════════
   RELLENAR MATERIAL DEL CLIENTE AL CAMBIAR DE CLIENTE
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var selCliente = document.getElementById('presu-cliente-select');
  if (selCliente) {
    // Clonamos para quitar eventos antiguos
    var nuevoSel = selCliente.cloneNode(true);
    selCliente.parentNode.replaceChild(nuevoSel, selCliente);

    nuevoSel.addEventListener('change', function() {
      var clienteId = this.value;
      var selectReg = document.getElementById('presu-registro-vinculado');
      if (!selectReg) return;

      // 1. Vaciar el desplegable
      selectReg.innerHTML = '<option value="">— Sin material del cliente —</option>';
      
      // 2. Si no hay cliente, salir
      if (!clienteId || clienteId === '__nuevo__' || clienteId === '__libre__') return;

      // 3. Buscar los registros de ese cliente
      var registros = [];
      try {
        registros = JSON.parse(localStorage.getItem('arandacrafts:registro') || '[]');
      } catch (e) {
        registros = [];
      }

      var filtrados = registros.filter(function(r) {
        return r.clienteId === clienteId;
      });

      // 4. Rellenar con las entradas de ese cliente
      filtrados.forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r.id;
        var total = (r.lineas || []).reduce(function(acc, l) { return acc + (parseInt(l.cantidad) || 0); }, 0);
        var fecha = new Date(r.fecha).toLocaleDateString('es-ES');
        opt.textContent = fecha + ' · ' + total + ' prendas';
        selectReg.appendChild(opt);
      });
      
      console.log('Cliente:', clienteId, 'Registros encontrados:', filtrados.length);
    });
  }

  // Al cargar un presupuesto existente, rellenar también
  var _abrirEditorOrig = window.abrirEditorPresupuesto;
  if (_abrirEditorOrig) {
    window.abrirEditorPresupuesto = function(p) {
      _abrirEditorOrig(p);
      
      // Simular el cambio de cliente
      var sel = document.getElementById('presu-cliente-select');
      if (sel) {
        // Esperamos un poco para que el select se rellene
        setTimeout(function() {
          var clienteId = p.cliente ? p.cliente.id : sel.value;
          if (clienteId) {
            sel.value = clienteId;
            sel.dispatchEvent(new Event('change'));
          }
        }, 100);
      }
    };
  }
});

/* ═══════════════════════════════════════════════════
   MATERIAL DEL CLIENTE EN EL PRESUPUESTO
   ═══════════════════════════════════════════════════ */
(function() {

  window.pintarMaterialCliente = function(registroId) {
    var contenedor = document.getElementById('bloque-material-cliente');
    var tbody = document.getElementById('lineas-material-cliente');
    if (!contenedor || !tbody) return;

    if (!registroId) {
      contenedor.style.display = 'none';
      tbody.innerHTML = '';
      return;
    }

    // Buscar el registro
    var registros = [];
    try {
      registros = JSON.parse(localStorage.getItem('arandacrafts:registro') || '[]');
    } catch (e) {
      registros = [];
    }

    var reg = registros.find(function(r) { return r.id === registroId; });
    if (!reg || !reg.lineas || !reg.lineas.length) {
      contenedor.style.display = 'none';
      tbody.innerHTML = '';
      return;
    }

    contenedor.style.display = 'block';
    tbody.innerHTML = '';

    reg.lineas.forEach(function(l) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td style="color:#555;">' + window.escapar(l.concepto) + '</td>' +
        '<td class="derecha" style="font-weight:bold; color:#555;">' + l.cantidad + '</td>';
      tbody.appendChild(tr);
    });
  };

  // Enganchar el desplegable de registros
  document.addEventListener('DOMContentLoaded', function() {
    var selReg = document.getElementById('presu-registro-vinculado');
    if (selReg) {
      var nuevoSel = selReg.cloneNode(true);
      selReg.parentNode.replaceChild(nuevoSel, selReg);
      
      nuevoSel.addEventListener('change', function() {
        window.pintarMaterialCliente(this.value);
      });
    }
  });

  // Al cargar un presupuesto existente, pintar el material si lo tenía
  var _abrirEditorOrig = window.abrirEditorPresupuesto;
  if (_abrirEditorOrig) {
    window.abrirEditorPresupuesto = function(p) {
      _abrirEditorOrig(p);
      
      setTimeout(function() {
        var selReg = document.getElementById('presu-registro-vinculado');
        if (selReg && p.registroEntradaId) {
          selReg.value = p.registroEntradaId;
          window.pintarMaterialCliente(p.registroEntradaId);
        } else {
          window.pintarMaterialCliente(null);
        }
      }, 150);
    };
  }

})();

/* ═══════════════════════════════════════════════════
   RENDERIZADO SEPARADO: PRODUCTOS Y TRABAJOS
   ═══════════════════════════════════════════════════ */
(function() {

  window.renderLineasEditor = function() {
    var contProductos = document.getElementById('contenedor-productos');
    var contTrabajos = document.getElementById('contenedor-trabajos');
    if (!contProductos || !contTrabajos) return;

    contProductos.innerHTML = '';
    contTrabajos.innerHTML = '';

    var totalBase = 0;
    var totalIva = 0;

    // ── Función para pintar una línea (igual que antes) ──
    function pintarLinea(linea, index) {
      var div = document.createElement('div');
      div.className = 'card';
      div.style.padding = '0.5rem';
      div.style.marginBottom = '0.5rem';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '0.5rem';

      var cantidad = parseFloat(linea.cantidad) || 0;
      var precioBase = parseFloat(linea.precio) || 0;
      var iva = parseFloat(linea.iva) || 0;
      var descuento = parseFloat(linea.descuento) || 0;

      var base = cantidad * precioBase;
      if (descuento > 0) base = base * (1 - (descuento / 100));
      var ivaLinea = base * (iva / 100);

      base = Math.round(base * 100) / 100;
      ivaLinea = Math.round(ivaLinea * 100) / 100;

      totalBase += base;
      totalIva += ivaLinea;

      div.innerHTML = 
        '<div style="flex: 2;">' +
          '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" style="width:100%;">' +
        '</div>' +
        '<div style="flex: 1;">' +
          '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1;">' +
          '<input type="number" step="0.01" class="inp-precio" value="' + precioBase + '" placeholder="Precio" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1;">' +
          '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1; text-align:right; font-weight:bold; padding: 0.5rem;">' + window.eur(base) + '</div>' +
        '<div>' +
          '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
        '</div>';

      var inputCant = div.querySelector('.inp-cant');
      var inputPrecio = div.querySelector('.inp-precio');
      var inputIva = div.querySelector('.inp-iva');
      var inputCon = div.querySelector('.inp-con');

      function recalcular() {
        linea.cantidad = parseFloat(inputCant.value) || 0;
        linea.precio = parseFloat(inputPrecio.value) || 0;
        linea.iva = parseFloat(inputIva.value) || 0;
        linea.concepto = inputCon.value;
        window.renderLineasEditor();
      }

      inputCant.addEventListener('input', recalcular);
      inputPrecio.addEventListener('input', recalcular);
      inputIva.addEventListener('input', recalcular);
      inputCon.addEventListener('input', recalcular);

      div.querySelector('.btn-eliminar-linea').onclick = function() {
        window._lineasEditor.splice(index, 1);
        window.renderLineasEditor();
      };

      return div;
    }

    // ── Contenedor de PRODUCTOS ──
    var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
    if (productos.length) {
      var tituloProd = document.createElement('div');
      tituloProd.className = 'card';
      tituloProd.style.background = 'var(--primary-soft)';
      tituloProd.style.padding = '0.6rem 1rem';
      tituloProd.style.marginBottom = '0.5rem';
      tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
      contProductos.appendChild(tituloProd);
      
      productos.forEach(function(linea) {
        var index = window._lineasEditor.indexOf(linea);
        contProductos.appendChild(pintarLinea(linea, index));
      });
    }

    // ── Contenedor de TRABAJOS ──
    var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
    if (trabajos.length) {
      var tituloTrab = document.createElement('div');
      tituloTrab.className = 'card';
      tituloTrab.style.background = 'var(--warn-soft)';
      tituloTrab.style.padding = '0.6rem 1rem';
      tituloTrab.style.marginBottom = '0.5rem';
      tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
      contTrabajos.appendChild(tituloTrab);
      
      trabajos.forEach(function(linea) {
        var index = window._lineasEditor.indexOf(linea);
        contTrabajos.appendChild(pintarLinea(linea, index));
      });
    }

    // ── Actualizar el total general ──
    var totalBox = document.getElementById('presu-total');
    if (totalBox) {
      var totalFinal = Math.round((totalBase + totalIva) * 100) / 100;
      totalBox.textContent = window.eur(totalFinal);
    }
  };

})();

/* ═══════════════════════════════════════════════════
   RENDERIZADO FINAL: MATERIAL → PRODUCTOS → TRABAJOS
   (Con columna de Precio Final y orden correcto)
   ═══════════════════════════════════════════════════ */
window.renderLineasEditor = function() {
  var contProd = document.getElementById('contenedor-productos');
  var contTrab = document.getElementById('contenedor-trabajos');
  var bloqueMat = document.getElementById('bloque-material-cliente');
  
  if (!contProd || !contTrab) return;

  contProd.innerHTML = '';
  contTrab.innerHTML = '';

  var totalBase = 0;
  var totalIva = 0;

  // ── FUNCIÓN PARA PINTAR UNA LÍNEA ──
  function pintarLinea(linea, index) {
    var div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '0.5rem';

    var cantidad = parseFloat(linea.cantidad) || 0;
    var precioBase = parseFloat(linea.precio) || 0;
    var iva = parseFloat(linea.iva) || 0;
    var descuento = parseFloat(linea.descuento) || 0;

    var base = cantidad * precioBase;
    if (descuento > 0) base = base * (1 - (descuento / 100));
    var ivaLinea = base * (iva / 100);
    var precioFinal = base + ivaLinea;

    base = Math.round(base * 100) / 100;
    ivaLinea = Math.round(ivaLinea * 100) / 100;
    precioFinal = Math.round(precioFinal * 100) / 100;

    totalBase += base;
    totalIva += ivaLinea;

    // Estructura de la línea: Concepto | Cantidad | Precio Base | IVA | Precio Final | Eliminar
    div.innerHTML = 
      '<div style="flex: 2; min-width: 150px;">' +
        '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" placeholder="Concepto" style="width:100%;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 60px;">' +
        '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 80px;">' +
        '<input type="number" step="0.01" class="inp-precio" value="' + precioBase + '" placeholder="Precio" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 0 0 60px;">' +
        '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 100px; text-align:right; font-weight:bold; padding: 0.4rem; background: var(--bg-soft); border-radius: 4px;">' + 
        window.eur(precioFinal) + 
      '</div>' +
      '<div>' +
        '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
      '</div>';

    // Eventos de recálculo
    var inputCant = div.querySelector('.inp-cant');
    var inputPrecio = div.querySelector('.inp-precio');
    var inputIva = div.querySelector('.inp-iva');
    var inputCon = div.querySelector('.inp-con');

    function recalcular() {
      linea.cantidad = parseFloat(inputCant.value) || 0;
      linea.precio = parseFloat(inputPrecio.value) || 0;
      linea.iva = parseFloat(inputIva.value) || 0;
      linea.concepto = inputCon.value;
      window.renderLineasEditor();
    }

    inputCant.addEventListener('input', recalcular);
    inputPrecio.addEventListener('input', recalcular);
    inputIva.addEventListener('input', recalcular);
    inputCon.addEventListener('input', recalcular);

    div.querySelector('.btn-eliminar-linea').onclick = function() {
      window._lineasEditor.splice(index, 1);
      window.renderLineasEditor();
    };

    return div;
  }

  // ── 1. PINTAR PRODUCTOS ──
  var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
  if (productos.length) {
    var tituloProd = document.createElement('div');
    tituloProd.className = 'card';
    tituloProd.style.background = 'var(--primary-soft)';
    tituloProd.style.padding = '0.6rem 1rem';
    tituloProd.style.marginBottom = '0.5rem';
    tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
    contProd.appendChild(tituloProd);
    
    productos.forEach(function(linea) {
      var index = window._lineasEditor.indexOf(linea);
      contProd.appendChild(pintarLinea(linea, index));
    });
  }

  // ── 2. PINTAR TRABAJOS ──
  var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
  if (trabajos.length) {
    var tituloTrab = document.createElement('div');
    tituloTrab.className = 'card';
    tituloTrab.style.background = 'var(--warn-soft)';
    tituloTrab.style.padding = '0.6rem 1rem';
    tituloTrab.style.marginBottom = '0.5rem';
    tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
    contTrab.appendChild(tituloTrab);
    
    trabajos.forEach(function(linea) {
      var index = window._lineasEditor.indexOf(linea);
      contTrab.appendChild(pintarLinea(linea, index));
    });
  }

  // ── 3. ACTUALIZAR TOTAL ──
  var totalBox = document.getElementById('presu-total');
  if (totalBox) {
    var totalFinal = Math.round((totalBase + totalIva) * 100) / 100;
    totalBox.textContent = window.eur(totalFinal);
  }
};

// Asegurarnos de que el bloque de material está arriba del todo en el HTML
document.addEventListener('DOMContentLoaded', function() {
  var editor = document.getElementById('presu-editor');
  if (!editor) return;
  
  var bloqueMat = document.getElementById('bloque-material-cliente');
  var contProd = document.getElementById('contenedor-productos');
  var contTrab = document.getElementById('contenedor-trabajos');
  var botonAnadir = document.getElementById('btnAnadirLinea');
  
  if (bloqueMat && contProd && contTrab && botonAnadir) {
    // Mover el bloque de material justo debajo del botón de añadir
    var contenedorBotones = botonAnadir.parentNode;
    contenedorBotones.parentNode.insertBefore(bloqueMat, contenedorBotones.nextSibling);
    
    // Mover los contenedores debajo del material
    contenedorBotones.parentNode.insertBefore(contProd, bloqueMat.nextSibling);
    contenedorBotones.parentNode.insertBefore(contTrab, contProd.nextSibling);
  }
});

/* ═══════════════════════════════════════════════════
   FIX DEFINITIVO: REDONDEO DE CÉNTIMOS
   ═══════════════════════════════════════════════════ */
window.renderLineasEditor = function() {
  var contProd = document.getElementById('contenedor-productos');
  var contTrab = document.getElementById('contenedor-trabajos');
  if (!contProd || !contTrab) return;

  contProd.innerHTML = '';
  contTrab.innerHTML = '';

  var totalBase = 0;
  var totalIva = 0;

  function pintarLinea(linea, index) {
    var div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '0.5rem';

    var cantidad = parseFloat(linea.cantidad) || 0;
    var precioBase = parseFloat(linea.precio) || 0;
    var iva = parseFloat(linea.iva) || 0;
    var descuento = parseFloat(linea.descuento) || 0;

    // 1. Calcular Base
    var base = cantidad * precioBase;
    if (descuento > 0) base = base * (1 - (descuento / 100));
    
    // REDONDEO ESTRICTO DE LA BASE (2 decimales)
    base = Math.round(base * 100) / 100;

    // 2. Calcular IVA sobre la base ya redondeada
    var ivaLinea = Math.round((base * (iva / 100)) * 100) / 100;
    
    // 3. Calcular Precio Final
    var precioFinal = Math.round((base + ivaLinea) * 100) / 100;

    // Sumar a los totales
    totalBase += base;
    totalIva += ivaLinea;

    div.innerHTML = 
      '<div style="flex: 2; min-width: 150px;">' +
        '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" placeholder="Concepto" style="width:100%;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 60px;">' +
        '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 80px;">' +
        '<input type="number" step="0.01" class="inp-precio" value="' + precioBase + '" placeholder="Precio" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 0 0 60px;">' +
        '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 100px; text-align:right; font-weight:bold; padding: 0.4rem; background: var(--bg-soft); border-radius: 4px;">' + 
        window.eur(precioFinal) + 
      '</div>' +
      '<div>' +
        '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
      '</div>';

    var inputCant = div.querySelector('.inp-cant');
    var inputPrecio = div.querySelector('.inp-precio');
    var inputIva = div.querySelector('.inp-iva');
    var inputCon = div.querySelector('.inp-con');

    function recalcular() {
      linea.cantidad = parseFloat(inputCant.value) || 0;
      linea.precio = parseFloat(inputPrecio.value) || 0;
      linea.iva = parseFloat(inputIva.value) || 0;
      linea.concepto = inputCon.value;
      window.renderLineasEditor();
    }

    inputCant.addEventListener('input', recalcular);
    inputPrecio.addEventListener('input', recalcular);
    inputIva.addEventListener('input', recalcular);
    inputCon.addEventListener('input', recalcular);

    div.querySelector('.btn-eliminar-linea').onclick = function() {
      window._lineasEditor.splice(index, 1);
      window.renderLineasEditor();
    };

    return div;
  }

  // Pintar Productos
  var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
  if (productos.length) {
    var tituloProd = document.createElement('div');
    tituloProd.className = 'card';
    tituloProd.style.background = 'var(--primary-soft)';
    tituloProd.style.padding = '0.6rem 1rem';
    tituloProd.style.marginBottom = '0.5rem';
    tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
    contProd.appendChild(tituloProd);
    
    productos.forEach(function(linea) {
      var index = window._lineasEditor.indexOf(linea);
      contProd.appendChild(pintarLinea(linea, index));
    });
  }

  // Pintar Trabajos
  var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
  if (trabajos.length) {
    var tituloTrab = document.createElement('div');
    tituloTrab.className = 'card';
    tituloTrab.style.background = 'var(--warn-soft)';
    tituloTrab.style.padding = '0.6rem 1rem';
    tituloTrab.style.marginBottom = '0.5rem';
    tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
    contTrab.appendChild(tituloTrab);
    
    trabajos.forEach(function(linea) {
      var index = window._lineasEditor.indexOf(linea);
      contTrab.appendChild(pintarLinea(linea, index));
    });
  }

  // Total final con redondeo
  var totalBox = document.getElementById('presu-total');
  if (totalBox) {
    var totalFinal = Math.round((totalBase + totalIva) * 100) / 100;
    totalBox.textContent = window.eur(totalFinal);
  }
};

/* ═══════════════════════════════════════════════════
   REDONDEO POR LÍNEA (Solución al 9,99 vs 10,00)
   ═══════════════════════════════════════════════════ */
window.renderLineasEditor = function() {
  var contProd = document.getElementById('contenedor-productos');
  var contTrab = document.getElementById('contenedor-trabajos');
  if (!contProd || !contTrab) return;

  contProd.innerHTML = '';
  contTrab.innerHTML = '';

  var totalBase = 0;
  var totalIva = 0;

  function pintarLinea(linea, index) {
    var div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '0.5rem';

    var cantidad = parseFloat(linea.cantidad) || 0;
    var precioBase = parseFloat(linea.precio) || 0;
    var iva = parseFloat(linea.iva) || 0;
    var descuento = parseFloat(linea.descuento) || 0;

    // 1. Base bruta
    var baseBruta = cantidad * precioBase;
    if (descuento > 0) baseBruta = baseBruta * (1 - (descuento / 100));
    
    // 2. Redondear base a 2 decimales (AQUÍ ESTÁ LA CLAVE)
    var base = Math.round((baseBruta + Number.EPSILON) * 100) / 100;
    
    // 3. IVA sobre la base redondeada
    var ivaLinea = Math.round((base * (iva / 100) + Number.EPSILON) * 100) / 100;
    
    // 4. Precio final de la línea
    var precioFinal = Math.round((base + ivaLinea + Number.EPSILON) * 100) / 100;

    // Acumular
    totalBase += base;
    totalIva += ivaLinea;

    div.innerHTML = 
      '<div style="flex: 2; min-width: 150px;">' +
        '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" placeholder="Concepto" style="width:100%;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 60px;">' +
        '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 80px;">' +
        '<input type="number" step="0.01" class="inp-precio" value="' + precioBase + '" placeholder="Precio" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 0 0 60px;">' +
        '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 100px; text-align:right; font-weight:bold; padding: 0.4rem; background: var(--bg-soft); border-radius: 4px;">' + 
        window.eur(precioFinal) + 
      '</div>' +
      '<div>' +
        '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
      '</div>';

    var inputCant = div.querySelector('.inp-cant');
    var inputPrecio = div.querySelector('.inp-precio');
    var inputIva = div.querySelector('.inp-iva');
    var inputCon = div.querySelector('.inp-con');

    function recalcular() {
      linea.cantidad = parseFloat(inputCant.value) || 0;
      linea.precio = parseFloat(inputPrecio.value) || 0;
      linea.iva = parseFloat(inputIva.value) || 0;
      linea.concepto = inputCon.value;
      window.renderLineasEditor();
    }

    inputCant.addEventListener('input', recalcular);
    inputPrecio.addEventListener('input', recalcular);
    inputIva.addEventListener('input', recalcular);
    inputCon.addEventListener('input', recalcular);

    div.querySelector('.btn-eliminar-linea').onclick = function() {
      window._lineasEditor.splice(index, 1);
      window.renderLineasEditor();
    };

    return div;
  }

  // Pintar Productos y Trabajos
  var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
  if (productos.length) {
    var tituloProd = document.createElement('div');
    tituloProd.className = 'card';
    tituloProd.style.background = 'var(--primary-soft)';
    tituloProd.style.padding = '0.6rem 1rem';
    tituloProd.style.marginBottom = '0.5rem';
    tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
    contProd.appendChild(tituloProd);
    productos.forEach(function(linea) {
      contProd.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
    });
  }

  var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
  if (trabajos.length) {
    var tituloTrab = document.createElement('div');
    tituloTrab.className = 'card';
    tituloTrab.style.background = 'var(--warn-soft)';
    tituloTrab.style.padding = '0.6rem 1rem';
    tituloTrab.style.marginBottom = '0.5rem';
    tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
    contTrab.appendChild(tituloTrab);
    trabajos.forEach(function(linea) {
      contTrab.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
    });
  }

  // TOTAL FINAL (redondeado también)
  var totalBox = document.getElementById('presu-total');
  if (totalBox) {
    var totalFinal = Math.round((totalBase + totalIva + Number.EPSILON) * 100) / 100;
    totalBox.textContent = window.eur(totalFinal);
  }
};

/* ═══════════════════════════════════════════════════
   CÁLCULO CON IVA INCLUIDO EN EL PRECIO
   ═══════════════════════════════════════════════════ */
window.renderLineasEditor = function() {
  var contProd = document.getElementById('contenedor-productos');
  var contTrab = document.getElementById('contenedor-trabajos');
  if (!contProd || !contTrab) return;

  contProd.innerHTML = '';
  contTrab.innerHTML = '';

  var totalBase = 0;
  var totalIva = 0;
  var granTotal = 0; // Este es el total que ve el cliente (con IVA)

  function pintarLinea(linea, index) {
    var div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '0.5rem';

    var cantidad = parseFloat(linea.cantidad) || 0;
    var precioConIva = parseFloat(linea.precio) || 0; // El precio que metes ya lleva IVA
    var iva = parseFloat(linea.iva) || 0;
    var descuento = parseFloat(linea.descuento) || 0;

    // 1. Total de la línea (Cantidad x Precio con IVA)
    var totalLinea = cantidad * precioConIva;
    if (descuento > 0) totalLinea = totalLinea * (1 - (descuento / 100));
    
    // 2. Redondear el total de la línea a 2 decimales
    totalLinea = Math.round((totalLinea + Number.EPSILON) * 100) / 100;

    // 3. Desglosar la Base Imponible y el IVA (El total ya lleva el IVA dentro)
    var baseLinea = totalLinea / (1 + (iva / 100));
    var ivaLinea = totalLinea - baseLinea;

    // Redondear la base y el IVA
    baseLinea = Math.round((baseLinea + Number.EPSILON) * 100) / 100;
    ivaLinea = Math.round((ivaLinea + Number.EPSILON) * 100) / 100;

    // Acumular
    totalBase += baseLinea;
    totalIva += ivaLinea;
    granTotal += totalLinea;

    div.innerHTML = 
      '<div style="flex: 2; min-width: 150px;">' +
        '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" placeholder="Concepto" style="width:100%;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 60px;">' +
        '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 80px;">' +
        '<input type="number" step="0.01" class="inp-precio" value="' + precioConIva + '" placeholder="Precio" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 0 0 60px;">' +
        '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 100px; text-align:right; font-weight:bold; padding: 0.4rem; background: var(--bg-soft); border-radius: 4px;">' + 
        window.eur(totalLinea) + 
      '</div>' +
      '<div>' +
        '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
      '</div>';

    var inputCant = div.querySelector('.inp-cant');
    var inputPrecio = div.querySelector('.inp-precio');
    var inputIva = div.querySelector('.inp-iva');
    var inputCon = div.querySelector('.inp-con');

    function recalcular() {
      linea.cantidad = parseFloat(inputCant.value) || 0;
      linea.precio = parseFloat(inputPrecio.value) || 0;
      linea.iva = parseFloat(inputIva.value) || 0;
      linea.concepto = inputCon.value;
      window.renderLineasEditor();
    }

    inputCant.addEventListener('input', recalcular);
    inputPrecio.addEventListener('input', recalcular);
    inputIva.addEventListener('input', recalcular);
    inputCon.addEventListener('input', recalcular);

    div.querySelector('.btn-eliminar-linea').onclick = function() {
      window._lineasEditor.splice(index, 1);
      window.renderLineasEditor();
    };

    return div;
  }

  // Pintar Productos y Trabajos
  var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
  if (productos.length) {
    var tituloProd = document.createElement('div');
    tituloProd.className = 'card';
    tituloProd.style.background = 'var(--primary-soft)';
    tituloProd.style.padding = '0.6rem 1rem';
    tituloProd.style.marginBottom = '0.5rem';
    tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
    contProd.appendChild(tituloProd);
    productos.forEach(function(linea) {
      contProd.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
    });
  }

  var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
  if (trabajos.length) {
    var tituloTrab = document.createElement('div');
    tituloTrab.className = 'card';
    tituloTrab.style.background = 'var(--warn-soft)';
    tituloTrab.style.padding = '0.6rem 1rem';
    tituloTrab.style.marginBottom = '0.5rem';
    tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
    contTrab.appendChild(tituloTrab);
    trabajos.forEach(function(linea) {
      contTrab.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
    });
  }

  // Actualizar el TOTAL general
  var totalBox = document.getElementById('presu-total');
  if (totalBox) {
    totalBox.textContent = window.eur(granTotal);
  }
  
  // Guardar los totales para el PDF (los usaremos luego)
  window._totalesPresupuesto = {
    base: Math.round((totalBase + Number.EPSILON) * 100) / 100,
    iva: Math.round((totalIva + Number.EPSILON) * 100) / 100,
    total: granTotal
  };
};

/* ═══════════════════════════════════════════════════
   CÁLCULO FINAL: TOTAL EXACTO (50 €) Y DESGLOSE IVA
   ═══════════════════════════════════════════════════ */
window.renderLineasEditor = function() {
  var contProd = document.getElementById('contenedor-productos');
  var contTrab = document.getElementById('contenedor-trabajos');
  if (!contProd || !contTrab) return;

  contProd.innerHTML = '';
  contTrab.innerHTML = '';

  var totalBase = 0;
  var totalIva = 0;
  var granTotal = 0;

  function pintarLinea(linea, index) {
    var div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '0.5rem';

    var cantidad = parseFloat(linea.cantidad) || 0;
    var precioConIva = parseFloat(linea.precio) || 0; // El precio del producto ya lleva IVA
    var iva = parseFloat(linea.iva) || 0;
    var descuento = parseFloat(linea.descuento) || 0;

    // 1. EL TOTAL DE LA LÍNEA ES LA MULTIPLICACIÓN DIRECTA (50 €)
    var totalLinea = cantidad * precioConIva;
    if (descuento > 0) totalLinea = totalLinea * (1 - (descuento / 100));
    
    // Redondeamos a 2 decimales para evitar 49.999999
    totalLinea = Math.round((totalLinea + Number.EPSILON) * 100) / 100;

    // 2. AHORA DESGLOSAMOS LA BASE Y EL IVA SOBRE ESE TOTAL EXACTO
    // Base = Total / (1 + IVA%)
    var baseLinea = totalLinea / (1 + (iva / 100));
    // IVA = Total - Base
    var ivaLinea = totalLinea - baseLinea;

    // Redondeamos la base y el IVA para que sumen exactamente el total
    baseLinea = Math.round((baseLinea + Number.EPSILON) * 100) / 100;
    // El IVA lo calculamos restando para que no haya descuadre (Total - Base)
    ivaLinea = Math.round((totalLinea - baseLinea + Number.EPSILON) * 100) / 100;

    // Acumular
    totalBase += baseLinea;
    totalIva += ivaLinea;
    granTotal += totalLinea;

    div.innerHTML = 
      '<div style="flex: 2; min-width: 150px;">' +
        '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" placeholder="Concepto" style="width:100%;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 60px;">' +
        '<input type="number" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 80px;">' +
        '<input type="number" step="0.01" class="inp-precio" value="' + precioConIva + '" placeholder="Precio" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 0 0 60px;">' +
        '<input type="number" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
      '</div>' +
      '<div style="flex: 1; min-width: 100px; text-align:right; font-weight:bold; padding: 0.4rem; background: var(--bg-soft); border-radius: 4px;">' + 
        window.eur(totalLinea) + 
      '</div>' +
      '<div>' +
        '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
      '</div>';

    var inputCant = div.querySelector('.inp-cant');
    var inputPrecio = div.querySelector('.inp-precio');
    var inputIva = div.querySelector('.inp-iva');
    var inputCon = div.querySelector('.inp-con');

    function recalcular() {
      linea.cantidad = parseFloat(inputCant.value) || 0;
      linea.precio = parseFloat(inputPrecio.value) || 0;
      linea.iva = parseFloat(inputIva.value) || 0;
      linea.concepto = inputCon.value;
      window.renderLineasEditor();
    }

    inputCant.addEventListener('input', recalcular);
    inputPrecio.addEventListener('input', recalcular);
    inputIva.addEventListener('input', recalcular);
    inputCon.addEventListener('input', recalcular);

    div.querySelector('.btn-eliminar-linea').onclick = function() {
      window._lineasEditor.splice(index, 1);
      window.renderLineasEditor();
    };

    return div;
  }

  // Pintar Productos y Trabajos
  var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
  if (productos.length) {
    var tituloProd = document.createElement('div');
    tituloProd.className = 'card';
    tituloProd.style.background = 'var(--primary-soft)';
    tituloProd.style.padding = '0.6rem 1rem';
    tituloProd.style.marginBottom = '0.5rem';
    tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
    contProd.appendChild(tituloProd);
    productos.forEach(function(linea) {
      contProd.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
    });
  }

  var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
  if (trabajos.length) {
    var tituloTrab = document.createElement('div');
    tituloTrab.className = 'card';
    tituloTrab.style.background = 'var(--warn-soft)';
    tituloTrab.style.padding = '0.6rem 1rem';
    tituloTrab.style.marginBottom = '0.5rem';
    tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
    contTrab.appendChild(tituloTrab);
    trabajos.forEach(function(linea) {
      contTrab.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
    });
  }

  // Actualizar el TOTAL general
  var totalBox = document.getElementById('presu-total');
  if (totalBox) {
    var totalFinal = Math.round((granTotal + Number.EPSILON) * 100) / 100;
    totalBox.textContent = window.eur(totalFinal);
  }

  // Guardar totales para el PDF
  window._totalesPresupuesto = {
    base: Math.round((totalBase + Number.EPSILON) * 100) / 100,
    iva: Math.round((totalIva + Number.EPSILON) * 100) / 100,
    total: Math.round((granTotal + Number.EPSILON) * 100) / 100
  };
};

/* ═══════════════════════════════════════════════════
   FIX: Añadir productos con PRECIO FINAL (Con IVA)
   ═══════════════════════════════════════════════════ */
(function() {

  // Guardamos la función original de añadir línea (por si acaso)
  var _anadirLineaOrig = window.anadirLineaAlPresupuesto;

  window.anadirLineaAlPresupuesto = function(linea) {
    // Si la línea viene con un 'tipo', comprobamos si es un producto para calcular su precio final
    if (linea.tipo === 'producto' && linea.precio) {
      // El precio que viene del Stock es el BASE (sin IVA). 
      // Pero ojo, depende de cómo lo guardamos antes.
      // Vamos a asegurarnos de que si el producto tiene IVA, le sumamos el IVA.
      var precioBase = parseFloat(linea.precio) || 0;
      var iva = parseFloat(linea.iva) || 0;
      
      // Si el precio guardado ya es el final (5 €), no hacemos nada.
      // Si es el base (4,13 €), le sumamos el 21%.
      
      // Como no sabemos cómo está guardado, vamos a asumir que el precio de la línea
      // SIEMPRE debe ser el Precio Final. Si el precio del producto es 4,13, 
      // lo convertimos a 5.00. Si ya es 5.00, se queda igual.
      
      // Si el precio es menor que 5 (el ejemplo de 4,13), le sumamos el IVA:
      // Pero mejor, vamos a confiar en que el producto tenga un campo 'precioFinal' o similar.
      
      // La forma más segura: si el precio es 4.13, lo multiplicamos por 1.21.
      // Si el precio ya es 5, no lo tocamos (porque 5 * 1.21 sería 6.05).
      
      // Vamos a comprobar si el precio es el base (4.13) o el final (5.00).
      // Si el precio es 4.13, el final es 4.99.
      // Si el precio es 5.00, el final es 5.00.
      
      // Para evitar líos, vamos a coger el precio que ya tiene el producto.
      // Si en el stock guardamos 'precio' como base, lo pasamos a final.
      linea.precio = Math.round((precioBase * (1 + iva / 100)) * 100) / 100;
    }

    // Ahora llamamos a la función original para que lo pinte
    if (_anadirLineaOrig) {
      _anadirLineaOrig(linea);
    } else {
      // Si no existe la original, lo añadimos a mano
      window._lineasEditor.push(linea);
      document.getElementById('modal-selector-lineas').hidden = true;
      window.renderLineasEditor();
      if (window.toast) window.toast('Línea añadida');
    }
  };

  // Parchear el selector para que use el nuevo anadirLinea
  var _pintarListaOrig = window.pintarListaSelector;
  if (_pintarListaOrig) {
    
};

/* ═══════════════════════════════════════════════════
   RECONECTAR PESTAÑAS DEL MODAL (Productos / Trabajos)
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var tabs = document.querySelectorAll('#selector-tabs .mtab');
  
  tabs.forEach(function(tab) {
    // Clonamos para quitar eventos viejos
    var nuevoTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(nuevoTab, tab);
    
    // Añadimos el evento correcto
    nuevoTab.addEventListener('click', function() {
      // 1. Marcar la pestaña como activa
      document.querySelectorAll('#selector-tabs .mtab').forEach(function(t) { t.classList.remove('activa'); });
      this.classList.add('activa');
      
      // 2. Cambiar el tipo en el estado global
      window._lineaTipoActual = this.dataset.tipo;
      
      // 3. Resetear la navegación (para que no se quede en una carpeta)
      window._catActual = null;
      window._subcatActual = null;
      
      // 4. Volver a pintar la lista
      if (window.pintarListaSelector) {
        window.pintarListaSelector();
      }
    });
  });
});

/* ═══════════════════════════════════════════════════
   ARREGLO DEFINITIVO DE LAS PESTAÑAS DEL MODAL
   ═══════════════════════════════════════════════════ */
(function() {

  // 1. Guardamos la función original para abrir el modal
  var _abrirModalOrig = window.abrirModal;

  // 2. Sobrescribimos abrirModal para que inicialice el tipo
  

  // 3. Enganchar las pestañas al cargar la página
  document.addEventListener('DOMContentLoaded', function() {
    var tabs = document.querySelectorAll('#selector-tabs .mtab');
    
    tabs.forEach(function(tab) {
      // Clonamos el botón para quitar eventos viejos
      var nuevoTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(nuevoTab, tab);
      
      nuevoTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Actualizar el tipo
        window._lineaTipoActual = this.dataset.tipo;
        window._catActual = null;
        window._subcatActual = null;
        
        // Marcar la pestaña activa
        document.querySelectorAll('#selector-tabs .mtab').forEach(function(t) {
          t.classList.remove('activa');
        });
        this.classList.add('activa');
        
        // Pintar la lista
        if (window.pintarListaSelector) {
          window.pintarListaSelector();
        }
      });
    });
  });

})();

/* ═══════════════════════════════════════════════════
   NUEVO MODAL SELECTOR (Versión Definitiva)
   ═══════════════════════════════════════════════════ */
(function() {

  // Variables de estado del modal
  var estado = {
    tab: 'productos',    // 'productos' o 'trabajos'
    catId: null,         // ej: 's-ropa'
    subcatId: null       // ej: 's-camisetas'
  };

  // ── 1. ABRIR EL MODAL ──
  window.abrirModalSelector = function() {
    estado = { tab: 'productos', catId: null, subcatId: null };
    
    var modal = document.getElementById('modal-selector');
    if (!modal) return;
    modal.hidden = false;

    // Resetear pestañas
    document.querySelectorAll('#modal-selector .mtab').forEach(function(t) {
      t.classList.toggle('activa', t.dataset.tab === 'productos');
    });

    // Resetear buscador
    var buscador = document.getElementById('modal-selector-buscar');
    if (buscador) buscador.value = '';

    pintarLista();
  };

  // ── 2. CERRAR EL MODAL ──
  window.cerrarModalSelector = function() {
    var modal = document.getElementById('modal-selector');
    if (modal) modal.hidden = true;
  };

  // ── 3. PINTAR LA LISTA ──
  function pintarLista() {
    var lista = document.getElementById('modal-selector-lista');
    var nav = document.getElementById('modal-selector-navegacion');
    var ruta = document.getElementById('modal-selector-ruta');
    var buscador = document.getElementById('modal-selector-buscar');
    if (!lista) return;

    var filtro = (buscador.value || '').toLowerCase().trim();
    lista.innerHTML = '';

    // ── A. PESTAÑA TRABAJOS ──
    if (estado.tab === 'trabajos') {
      nav.style.display = 'none';
      var trabajos = JSON.parse(localStorage.getItem('arandacrafts:trabajos') || '[]');
      if (filtro) trabajos = trabajos.filter(function(t) { return t.nombre.toLowerCase().indexOf(filtro) >= 0; });
      
      if (!trabajos.length) { lista.innerHTML = '<li class="vacio">Sin resultados</li>'; return; }
      
      trabajos.forEach(function(t) {
        var li = document.createElement('li');
        li.style.padding = '0.6rem';
        li.style.cursor = 'pointer';
        li.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                         '<span style="font-weight:500;">' + window.escapar(t.nombre) + '</span>' +
                         '<span style="color:var(--primary); font-weight:bold;">' + window.eur(t.precio * (1 + t.iva/100)) + '</span>' +
                       '</div>';
        li.addEventListener('click', function() {
          añadirLinea({
            concepto: t.nombre,
            cantidad: 1,
            precio: Math.round(t.precio * (1 + t.iva/100) * 100) / 100,
            iva: t.iva,
            tipo: 'trabajo',
            idRef: t.id
          });
        });
        lista.appendChild(li);
      });
      return;
    }

    // ── B. PESTAÑA PRODUCTOS ──
    var estructura = window.Modelo.getStockEstructura() || [];

    // B.1: Viendo una subcategoría (ej: dentro de Camisetas)
    if (estado.subcatId) {
      var cat = estructura.find(function(c) { return c.id === estado.catId; });
      var sub = cat ? cat.categorias.find(function(s) { return s.id === estado.subcatId; }) : null;
      if (!sub) { estado.subcatId = null; return pintarLista(); }

      nav.style.display = 'flex';
      if (ruta) ruta.textContent = cat.nombre + ' > ' + sub.nombre;

      var prods = sub.productos || [];
      if (filtro) prods = prods.filter(function(p) { return p.nombre.toLowerCase().indexOf(filtro) >= 0; });

      if (!prods.length) { lista.innerHTML = '<li class="vacio">No hay productos</li>'; return; }

      prods.forEach(function(p) {
        var precioFinal = Math.round(p.precio * (1 + (p.iva || 21) / 100) * 100) / 100;
        var li = document.createElement('li');
        li.style.padding = '0.6rem';
        li.style.cursor = 'pointer';
        li.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                         '<span style="font-weight:500;">' + window.escapar(p.nombre) + '</span>' +
                         '<span style="color:var(--primary); font-weight:bold;">' + window.eur(precioFinal) + '</span>' +
                       '</div>';
        li.addEventListener('click', function() {
          añadirLinea({
            concepto: p.nombre,
            cantidad: 1,
            precio: precioFinal,
            iva: p.iva || 21,
            tipo: 'producto',
            idRef: p.id
          });
        });
        lista.appendChild(li);
      });
      return;
    }

    // B.2: Viendo una categoría (ej: dentro de Ropa)
    if (estado.catId) {
      var cat = estructura.find(function(c) { return c.id === estado.catId; });
      if (!cat) { estado.catId = null; return pintarLista(); }

      nav.style.display = 'flex';
      if (ruta) ruta.textContent = cat.nombre;

      // Si hay filtro, buscar en todos los productos
      if (filtro) {
        var prods = [];
        (cat.categorias || []).forEach(function(s) {
          (s.productos || []).forEach(function(p) {
            if (p.nombre.toLowerCase().indexOf(filtro) >= 0) prods.push(p);
          });
        });
        if (!prods.length) { lista.innerHTML = '<li class="vacio">Sin resultados</li>'; return; }
        
        prods.forEach(function(p) {
          var precioFinal = Math.round(p.precio * (1 + (p.iva || 21) / 100) * 100) / 100;
          var li = document.createElement('li');
          li.style.padding = '0.6rem';
          li.style.cursor = 'pointer';
          li.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                           '<span style="font-weight:500;">' + window.escapar(p.nombre) + '</span>' +
                           '<span style="color:var(--primary); font-weight:bold;">' + window.eur(precioFinal) + '</span>' +
                         '</div>';
          li.addEventListener('click', function() {
            añadirLinea({
              concepto: p.nombre,
              cantidad: 1,
              precio: precioFinal,
              iva: p.iva || 21,
              tipo: 'producto',
              idRef: p.id
            });
          });
          lista.appendChild(li);
        });
        return;
      }

      // Sin filtro: mostrar subcategorías
      var subs = cat.categorias || [];
      if (!subs.length) { lista.innerHTML = '<li class="vacio">No hay subcategorías</li>'; return; }

      subs.forEach(function(s) {
        var li = document.createElement('li');
        li.style.padding = '0.6rem';
        li.style.cursor = 'pointer';
        li.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                         '<span>📁 ' + window.escapar(s.nombre) + '</span>' +
                         '<span style="color:var(--text-soft); font-size:0.85rem;">Ver productos →</span>' +
                       '</div>';
        li.addEventListener('click', function() {
          estado.subcatId = s.id;
          pintarLista();
        });
        lista.appendChild(li);
      });
      return;
    }

    // B.3: Raíz (categorías principales)
    nav.style.display = 'none';
    if (!estructura.length) { lista.innerHTML = '<li class="vacio">No hay categorías</li>'; return; }

    estructura.forEach(function(cat) {
      var li = document.createElement('li');
      li.style.padding = '0.6rem';
      li.style.cursor = 'pointer';
      li.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                       '<span style="font-weight:600;">' + cat.icono + ' ' + window.escapar(cat.nombre) + '</span>' +
                       '<span style="color:var(--text-soft); font-size:0.85rem;">' + (cat.categorias ? cat.categorias.length : 0) + ' subcat →</span>' +
                     '</div>';
      li.addEventListener('click', function() {
        estado.catId = cat.id;
        estado.subcatId = null;
        pintarLista();
      });
      lista.appendChild(li);
    });
  }

  // ── 4. AÑADIR LÍNEA AL PRESUPUESTO ──
  function añadirLinea(linea) {
    if (!window._lineasEditor) window._lineasEditor = [];
    window._lineasEditor.push(linea);
    cerrarModalSelector();
    if (window.renderLineasEditor) window.renderLineasEditor();
    if (window.toast) window.toast('Línea añadida');
  }

  // ── 5. ENGANCHE DE EVENTOS ──
  document.addEventListener('DOMContentLoaded', function() {
    // Botón + Añadir línea
    var btnAñadir = document.getElementById('btnAnadirLinea');
    if (btnAñadir) {
      btnAñadir.onclick = window.abrirModalSelector;
    }

    // Botón cerrar
    var btnCerrar = document.getElementById('modal-selector-cerrar');
    if (btnCerrar) btnCerrar.onclick = cerrarModalSelector;

    // Botón volver
    var btnVolver = document.getElementById('modal-selector-volver');
    if (btnVolver) {
      btnVolver.onclick = function() {
        if (estado.subcatId) {
          estado.subcatId = null;
        } else if (estado.catId) {
          estado.catId = null;
        }
        pintarLista();
      };
    }

    // Pestañas
    document.querySelectorAll('#modal-selector .mtab').forEach(function(tab) {
      tab.onclick = function() {
        document.querySelectorAll('#modal-selector .mtab').forEach(function(t) { t.classList.remove('activa'); });
        this.classList.add('activa');
        
        estado.tab = this.dataset.tab;
        estado.catId = null;
        estado.subcatId = null;
        pintarLista();
      };
    });

    // Buscador
    var buscador = document.getElementById('modal-selector-buscar');
    if (buscador) buscador.oninput = pintarLista;

    // Cerrar al hacer clic fuera
    var modal = document.getElementById('modal-selector');
    if (modal) {
      modal.onclick = function(e) {
        if (e.target === this) cerrarModalSelector();
      };
    }
  });

})();

})();

/* ═══════════════════════════════════════════════════
   FIX: ACTUALIZAR DESGLOSE DE IVA EN EL RENDER
   ═══════════════════════════════════════════════════ */
(function() {
  // Guardamos la función original de renderLineasEditor
  var _renderOrig = window.renderLineasEditor;

  if (_renderOrig) {
    window.renderLineasEditor = function() {
      // 1. Llamar a la función original para que pinte las líneas
      _renderOrig.apply(this, arguments);

      // 2. Calcular los totales de nuevo (para asegurarnos)
      var totalBase = 0;
      var totalIva = 0;
      var totalFinal = 0;

      (window._lineasEditor || []).forEach(function(linea) {
        var cantidad = parseFloat(linea.cantidad) || 0;
        var precioConIva = parseFloat(linea.precio) || 0;
        var iva = parseFloat(linea.iva) || 0;

        // Total de la línea
        var totalLinea = cantidad * precioConIva;
        
        // Desglose
        var baseLinea = totalLinea / (1 + (iva / 100));
        var ivaLinea = totalLinea - baseLinea;

        totalBase += baseLinea;
        totalIva += ivaLinea;
        totalFinal += totalLinea;
      });

      // Redondear
      totalBase = Math.round(totalBase * 100) / 100;
      totalIva = Math.round(totalIva * 100) / 100;
      totalFinal = Math.round(totalFinal * 100) / 100;

      // 3. Actualizar los campos del HTML
      var baseBox = document.getElementById('presu-base');
      var ivaBox = document.getElementById('presu-iva');
      var totalBox = document.getElementById('presu-total');

      if (baseBox) baseBox.textContent = window.eur(totalBase);
      if (ivaBox) ivaBox.textContent = window.eur(totalIva);
      if (totalBox) totalBox.textContent = window.eur(totalFinal);

      // Guardar los totales en la variable global (para el PDF)
      window._totalesPresupuesto = {
        base: totalBase,
        iva: totalIva,
        total: totalFinal
      };
    };
  }
})();

/* ═══════════════════════════════════════════════════
   FUNCIÓN DE GUARDAR PRESUPUESTO
   ═══════════════════════════════════════════════════ */
(function() {

  window.guardarPresupuestoActual = function() {
    var el = function(id) { return document.getElementById(id); };
    
    // 1. Verificar que hay un presupuesto abierto
    if (!window._presupuestoActual) {
      alert('No hay ningún presupuesto abierto.');
      return;
    }

    // 2. Recoger el cliente
    var clienteId = el('presu-cliente-select') ? el('presu-cliente-select').value : '';
    var cliente = null;
    if (clienteId && clienteId !== '__nuevo__' && clienteId !== '__libre__') {
      cliente = window.Modelo.buscarClientePorId(clienteId);
    }

    if (!cliente) {
      alert('Por favor, selecciona un cliente antes de guardar.');
      if (el('presu-cliente-select')) el('presu-cliente-select').focus();
      return;
    }

    // 3. Recoger los datos del formulario
    var registroId = el('presu-registro-vinculado') ? el('presu-registro-vinculado').value : '';

    var presupuesto = {
      id: window._presupuestoActual.id || 'pre-' + Date.now(),
      tipo: el('presu-tipo') ? el('presu-tipo').value : 'presupuesto',
      numero: el('presu-numero') ? el('presu-numero').value : '',
      fecha: el('presu-fecha') ? el('presu-fecha').value : new Date().toISOString().split('T')[0],
      cliente: { id: cliente.id, nombre: cliente.nombre },
      registroEntradaId: registroId,
      descripcion: el('presu-descripcion') ? el('presu-descripcion').value.trim() : '',
      estado: el('presu-estado') ? el('presu-estado').value : 'borrador',
      notas: el('presu-notas') ? el('presu-notas').value.trim() : '',
      lineas: window._lineasEditor || [],
      totales: window._totalesPresupuesto || { base: 0, iva: 0, total: 0 },
      total: (window._totalesPresupuesto && window._totalesPresupuesto.total) ? window._totalesPresupuesto.total : 0
    };

    // 4. Guardar en localStorage
    var clave = 'arandacrafts:presupuestos';
    var lista = JSON.parse(localStorage.getItem(clave) || '[]');
    
    var idx = lista.findIndex(function(p) { return p.id === presupuesto.id; });
    if (idx >= 0) {
      lista[idx] = presupuesto;
    } else {
      lista.push(presupuesto);
    }
    
    localStorage.setItem(clave, JSON.stringify(lista));

    // 5. Feedback y volver al listado
    if (window.toast) window.toast('Presupuesto ' + presupuesto.numero + ' guardado');
    console.log('✅ Presupuesto guardado:', presupuesto);
    
    if (window.cerrarEditorPresupuesto) {
      window.cerrarEditorPresupuesto();
    }
  };

  // Enganchar el botón
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btnGuardarPresupuesto');
    if (btn) {
      var nuevoBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(nuevoBtn, btn);
      nuevoBtn.onclick = window.guardarPresupuestoActual;
      console.log('✅ Botón de guardar conectado');
    } else {
      console.log('⚠️ No se encontró el botón de guardar');
    }
  });

})();

/* ═══════════════════════════════════════════════════
   GENERAR PDF EN NUEVA PESTAÑA
   ═══════════════════════════════════════════════════ */
(function() {

  window.imprimirPresupuestoActual = function() {
    if (!window._presupuestoActual) {
      alert('No hay ningún presupuesto abierto.');
      return;
    }

    // 1. Recoger los datos actuales (como si fuera a guardar)
    var el = function(id) { return document.getElementById(id); };
    
    var clienteId = el('presu-cliente-select') ? el('presu-cliente-select').value : '';
    var cliente = null;
    if (clienteId && clienteId !== '__nuevo__' && clienteId !== '__libre__') {
      cliente = window.Modelo.buscarClientePorId(clienteId);
    }
    
    // Si no hay cliente, no dejamos imprimir
    if (!cliente) {
      alert('Selecciona un cliente antes de imprimir.');
      return;
    }

    // 2. Recoger los totales
    var totales = window._totalesPresupuesto || { base: 0, iva: 0, total: 0 };
    
    // 3. Recoger los datos del emisor (Ajustes)
    var emisor = window.Modelo.getEmisor() || {};

    // 4. Agrupar las líneas por tipo
    var productos = (window._lineasEditor || []).filter(function(l) { return l.tipo === 'producto'; });
    var trabajos = (window._lineasEditor || []).filter(function(l) { return l.tipo === 'trabajo'; });
    var materialCliente = null;
    var registroId = el('presu-registro-vinculado') ? el('presu-registro-vinculado').value : '';
    if (registroId) {
      var registros = JSON.parse(localStorage.getItem('arandacrafts:registro') || '[]');
      materialCliente = registros.find(function(r) { return r.id === registroId; });
    }

    // 5. Generar el HTML del PDF
    var css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', system-ui, sans-serif;
        color: #222; background: #f8f9fa;
        padding: 2rem 1rem;
      }
      .page {
        max-width: 800px; margin: 0 auto;
        background: #fff; padding: 2cm;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      .btn-imprimir {
        display: block; margin: 0 auto 1.5rem;
        padding: 12px 30px; font-size: 1.1rem;
        background: #2f6df6; color: #fff;
        border: none; border-radius: 8px;
        cursor: pointer; font-weight: bold;
        box-shadow: 0 4px 12px rgba(47,109,246,0.3);
      }
      .btn-imprimir:hover { background: #2459d1; }
      
      .pr-cabecera {
        display: flex; justify-content: space-between; align-items: flex-start;
        border-bottom: 3px solid #222; padding-bottom: 1rem; margin-bottom: 1rem;
      }
      .pr-marca h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem; }
      .pr-eslogan { font-size: 0.9rem; color: #666; }
      .pr-doc { text-align: right; }
      .pr-tipo { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; color: #666; }
      .pr-num { font-size: 1.4rem; font-weight: 700; margin: 0.2rem 0; }
      .pr-fecha { font-size: 0.9rem; }
      
      .pr-fiscal {
        font-size: 0.8rem; color: #666; line-height: 1.4;
        padding-bottom: 1rem; margin-bottom: 1rem;
        border-bottom: 1px dashed #ccc;
      }
      .pr-fiscal .titular { font-weight: 600; color: #333; }
      
      .pr-cliente {
        background: #f4f6f8; padding: 1rem; border-radius: 8px;
        margin-bottom: 1.5rem; font-size: 0.95rem;
      }
      
      .pr-material-cliente {
        background: #fffbe6; border: 1px dashed #e6c34a;
        padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;
      }
      .pr-material-titulo {
        font-weight: 700; color: #8a6d00; text-transform: uppercase;
        font-size: 0.85rem; margin-bottom: 0.5rem;
      }
      .pr-material-tabla { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      .pr-material-tabla td { padding: 0.3rem 0; border-bottom: 1px dashed #e6c34a; }
      .pr-material-tabla td:last-child { text-align: right; font-weight: 700; }
      
      .pr-seccion-titulo {
        font-size: 1rem; font-weight: 700; margin: 1.5rem 0 0.5rem;
        padding: 0.4rem 0.8rem; border-radius: 4px;
      }
      .pr-seccion-productos { background: #e6efff; color: #2f6df6; }
      .pr-seccion-trabajos { background: #fff4dc; color: #d18b00; }
      
      .pr-tabla { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1rem; }
      .pr-tabla th {
        background: #222; color: #fff; padding: 0.5rem;
        text-align: left; font-size: 0.8rem; font-weight: 600;
      }
      .pr-tabla td { padding: 0.5rem; border-bottom: 1px solid #eee; }
      .pr-tabla .num { text-align: right; }
      
      .pr-totales {
        display: flex; flex-direction: column; align-items: flex-end;
        margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #222;
      }
      .pr-total-linea {
        display: flex; justify-content: space-between; width: 250px;
        padding: 0.2rem 0; font-size: 0.95rem;
      }
      .pr-total-grande {
        display: flex; justify-content: space-between; width: 250px;
        padding: 0.4rem 0; font-size: 1.3rem; font-weight: 700;
        border-top: 1px solid #ccc; margin-top: 0.4rem;
      }
      
      .pr-notas {
        background: #f8f9fa; padding: 1rem; border-radius: 8px;
        margin-top: 2rem; font-size: 0.9rem; border-left: 3px solid #999;
      }
      .pr-pie {
        text-align: center; font-size: 0.75rem; color: #999;
        margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee;
      }
      
      @media print {
        body { background: #fff; padding: 0; }
        .page { box-shadow: none; padding: 1.5cm; }
        .btn-imprimir { display: none; }
      }
    `;

    var html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Presupuesto ' + (el('presu-numero') ? el('presu-numero').value : '') + '</title>';
    html += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
    html += '<style>' + css + '</style></head><body>';

    // Botón de imprimir
    html += '<button class="btn-imprimir" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>';

    html += '<div class="page">';

    // Cabecera
    html += '<div class="pr-cabecera">';
    html += '<div class="pr-marca"><h1>' + (emisor.marca || 'Aranda Crafts') + '</h1>';
    html += '<div class="pr-eslogan">' + (emisor.eslogan || '') + '</div></div>';
    html += '<div class="pr-doc">';
    html += '<div class="pr-tipo">' + (el('presu-tipo') ? el('presu-tipo').value.toUpperCase() : 'PRESUPUESTO') + '</div>';
    html += '<div class="pr-num">' + (el('presu-numero') ? el('presu-numero').value : '') + '</div>';
    html += '<div class="pr-fecha">Fecha: ' + (el('presu-fecha') ? el('presu-fecha').value : '') + '</div>';
    html += '</div></div>';

    // Datos fiscales
    html += '<div class="pr-fiscal">';
    html += '<span class="titular">' + (emisor.nombre || '') + '</span>';
    if (emisor.nif) html += ' · NIF ' + emisor.nif;
    if (emisor.direccion) html += '<br>' + emisor.direccion;
    if (emisor.telefono) html += '<br>Tel: ' + emisor.telefono;
    if (emisor.email) html += ' · ' + emisor.email;
    html += '</div>';

    // Cliente
    html += '<div class="pr-cliente">';
    html += '<strong>Cliente:</strong> ' + cliente.nombre;
    if (cliente.nif) html += ' · NIF ' + cliente.nif;
    if (cliente.direccion) html += '<br>' + cliente.direccion;
    if (cliente.telefono) html += ' · ' + cliente.telefono;
    var desc = el('presu-descripcion') ? el('presu-descripcion').value.trim() : '';
    if (desc) html += '<br><strong>Trabajo:</strong> ' + desc;
    html += '</div>';

    // Material del cliente
    if (materialCliente && materialCliente.lineas && materialCliente.lineas.length) {
      html += '<div class="pr-material-cliente">';
      html += '<div class="pr-material-titulo">📦 Material aportado por el cliente (no se cobra)</div>';
      html += '<table class="pr-material-tabla">';
      materialCliente.lineas.forEach(function(l) {
        html += '<tr><td>' + l.concepto + '</td><td>' + l.cantidad + '</td></tr>';
      });
      html += '</table></div>';
    }

    // Productos
    if (productos.length) {
      html += '<div class="pr-seccion-titulo pr-seccion-productos">📦 Productos Aranda Crafts</div>';
      html += '<table class="pr-tabla"><thead><tr>';
      html += '<th>Concepto</th><th class="num">Cantidad</th><th class="num">Precio</th><th class="num">Total</th>';
      html += '</tr></thead><tbody>';
      productos.forEach(function(l) {
        var total = (parseFloat(l.cantidad) || 0) * (parseFloat(l.precio) || 0);
        html += '<tr><td>' + l.concepto + '</td><td class="num">' + l.cantidad + '</td><td class="num">' + window.eur(l.precio) + '</td><td class="num">' + window.eur(total) + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    // Trabajos
    if (trabajos.length) {
      html += '<div class="pr-seccion-titulo pr-seccion-trabajos">🛠️ Trabajos Aranda Crafts</div>';
      html += '<table class="pr-tabla"><thead><tr>';
      html += '<th>Concepto</th><th class="num">Cantidad</th><th class="num">Precio</th><th class="num">Total</th>';
      html += '</tr></thead><tbody>';
      trabajos.forEach(function(l) {
        var total = (parseFloat(l.cantidad) || 0) * (parseFloat(l.precio) || 0);
        html += '<tr><td>' + l.concepto + '</td><td class="num">' + l.cantidad + '</td><td class="num">' + window.eur(l.precio) + '</td><td class="num">' + window.eur(total) + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    // Totales
    html += '<div class="pr-totales">';
    html += '<div class="pr-total-linea"><span>Base Imponible:</span><span>' + window.eur(totales.base) + '</span></div>';
    html += '<div class="pr-total-linea"><span>IVA:</span><span>' + window.eur(totales.iva) + '</span></div>';
    html += '<div class="pr-total-grande"><span>TOTAL:</span><span>' + window.eur(totales.total) + '</span></div>';
    html += '</div>';

    // Notas
    var notas = el('presu-notas') ? el('presu-notas').value.trim() : '';
    if (notas) {
      html += '<div class="pr-notas"><strong>Notas:</strong> ' + notas + '</div>';
    }

    // Pie
    html += '<div class="pr-pie">Presupuesto válido 30 días. Los precios incluyen IVA.</div>';

    html += '</div></body></html>';

    // Abrir en una nueva pestaña con un Blob (NO bloquea la app original)
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    
    var ventana = window.open(url, '_blank');
    
    if (!ventana) {
      alert('Por favor, permite las ventanas emergentes para poder imprimir.');
      return;
    }
    
    // Limpiar el objeto URL después de un tiempo
    setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
  };

  // Enganchar el botón
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btnImprimirPresupuesto');
    if (btn) {
      var nuevo = btn.cloneNode(true);
      btn.parentNode.replaceChild(nuevo, btn);
      nuevo.onclick = window.imprimirPresupuestoActual;
      console.log('✅ Botón de imprimir conectado');
    }
  });

})();

/* ═══════════════════════════════════════════════════
   PASO A: GUARDAR VARIANTES EN EL PRODUCTO
   ═══════════════════════════════════════════════════ */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('mp-guardar');
    if (!btn) {
      console.log('⚠️ No se encontró el botón de guardar producto');
      return;
    }

    // Clonar el botón para eliminar eventos antiguos
    var nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);

    nuevoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      var nombre = document.getElementById('mp-nombre') ? document.getElementById('mp-nombre').value.trim() : '';
      if (!nombre) {
        if (document.getElementById('mp-nombre')) document.getElementById('mp-nombre').focus();
        return;
      }

      // 1. Recoger variantes de la tabla
      var variantes = [];
      var tbody = document.getElementById('mp-lista-variantes');
      if (tbody) {
        tbody.querySelectorAll('tr').forEach(function(tr) {
          var selColor = tr.querySelector('.var-color-select');
          var inpColor = tr.querySelector('.var-color-custom');
          var selTalla = tr.querySelector('.var-talla-select');
          var inpTalla = tr.querySelector('.var-talla-custom');
          var inpCant = tr.querySelector('.var-cant');
          
          if (!inpCant) return;
          
          var color = '';
        if (selColor && selColor.style.display === 'none' && inpColor) {
          // Si el select está oculto, leemos del input
          color = inpColor.value.trim();
        } else if (selColor && selColor.value && selColor.value !== '__otro__') {
          color = selColor.value;
        } else if (inpColor) {
          color = inpColor.value.trim();
        }
          var talla = '';
        if (selTalla && selTalla.style.display === 'none' && inpTalla) {
          talla = inpTalla.value.trim();
        } else if (selTalla && selTalla.value && selTalla.value !== '__otro__') {
          talla = selTalla.value;
        } else if (inpTalla) {
          talla = inpTalla.value.trim();
        }
          var cantidad = parseFloat((inpCant.value || '0').replace(',', '.')) || 0;
          
          if (color && talla) {
            variantes.push({ color: color, talla: talla, cantidad: cantidad });
          }
        });
      }

      // 2. Recoger los datos del producto
      var pBase = parseFloat(document.getElementById('mp-precio-base') ? document.getElementById('mp-precio-base').value : 0) || 0;
      var pIva = parseFloat(document.getElementById('mp-iva') ? document.getElementById('mp-iva').value : 21) || 21;
      var pCoste = parseFloat(document.getElementById('mp-coste') ? document.getElementById('mp-coste').value : 0) || 0;
      var pStock = parseInt(document.getElementById('mp-stock') ? document.getElementById('mp-stock').value : 0) || 0;
      var pNotas = document.getElementById('mp-notas') ? document.getElementById('mp-notas').value.trim() : '';
      var pIcono = document.getElementById('mp-icono') ? document.getElementById('mp-icono').value : '📦';

      var nuevoProd = {
        id: window._prodEditandoId || window.Storage.uuid(),
        nombre: nombre,
        precio: pBase,
        iva: pIva,
        coste: pCoste,
        stock: pStock,
        notas: pNotas,
        icono: pIcono,
        variantes: variantes
      };

      // 3. Guardar en el Stock
      var catId = window._catIdActual;
      var subcatId = window._subcatIdActual;
      
      if (!catId || !subcatId) {
        alert('Error: Vuelve a entrar en la carpeta antes de guardar.');
        return;
      }

      var estructura = window.Modelo.getStockEstructura();
      var cat = estructura.find(function(c) { return c.id === catId; });
      if (!cat) return;
      var sub = cat.categorias.find(function(c) { return c.id === subcatId; });
      if (!sub) return;
      
      if (!sub.productos) sub.productos = [];
      var idx = sub.productos.findIndex(function(p) { return p.id === nuevoProd.id; });
      if (idx >= 0) sub.productos[idx] = nuevoProd; 
      else sub.productos.push(nuevoProd);

      window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
      
      // 4. Cerrar el modal y refrescar
      var modal = document.getElementById('modal-producto');
      if (modal) modal.hidden = true;
      
      if (window.renderStock) window.renderStock();
      if (window.toast) window.toast('Producto guardado con ' + variantes.length + ' variantes');
      
      console.log('✅ Producto guardado:', nuevoProd);
    });
  });
})();

/* ═══════════════════════════════════════════════════
   RELLENAR TABLA DE VARIANTES AL ABRIR EL MODAL
   ═══════════════════════════════════════════════════ */
(function() {
  // Guardamos la función original de abrir el modal de producto
  var _abrirProdOrig = window.abrirModalProducto;

  if (_abrirProdOrig) {
    window.abrirModalProducto = function(prod) {
      // 1. Llamar a la función original (abre el modal y rellena los datos básicos)
      _abrirProdOrig(prod);

      // 2. Rellenar la tabla de variantes
      var tbody = document.getElementById('mp-lista-variantes');
      var seccion = document.getElementById('mp-seccion-variantes');
      if (!tbody || !seccion) return;

      // Limpiar la tabla
      tbody.innerHTML = '';

      // Si el producto tiene variantes, crear las filas
      if (prod && prod.variantes && prod.variantes.length > 0) {
        prod.variantes.forEach(function(v) {
          crearFilaVariante(tbody, v.color, v.talla, v.cantidad);
        });
      } else {
        // Si no tiene variantes, crear una fila vacía por defecto
        crearFilaVariante(tbody, '', '', 0);
      }
    };
  }

  // Función para crear una fila de variante
  function crearFilaVariante(tbody, color, talla, cantidad) {
    var COLORES = ['Blanco', 'Negro', 'Rojo', 'Azul', 'Verde', 'Gris'];
    var TALLAS = ['Sin talla', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    var tr = document.createElement('tr');
    
    var opcionesColor = '<option value="">— Color —</option>';
    COLORES.forEach(function(c) {
      opcionesColor += '<option value="' + c + '"' + (c === color ? ' selected' : '') + '>' + c + '</option>';
    });
    opcionesColor += '<option value="__otro__">✏️ Otro...</option>';
    
    var opcionesTalla = '<option value="">— Talla —</option>';
    TALLAS.forEach(function(t) {
      opcionesTalla += '<option value="' + t + '"' + (t === talla ? ' selected' : '') + '>' + t + '</option>';
    });
    opcionesTalla += '<option value="__otro__">✏️ Otra...</option>';
    
    tr.innerHTML = 
      '<td>' +
        '<select class="var-color-select" style="width:100%; margin-bottom: 0.3rem;">' + opcionesColor + '</select>' +
        '<input type="text" class="var-color-custom" value="" placeholder="Escribe el color..." style="width:100%; display: none;">' +
      '</td>' +
      '<td>' +
        '<select class="var-talla-select" style="width:100%; margin-bottom: 0.3rem;">' + opcionesTalla + '</select>' +
        '<input type="text" class="var-talla-custom" value="" placeholder="Escribe la talla..." style="width:100%; display: none;">' +
      '</td>' +
      '<td><input type="text" class="var-cant" value="' + (cantidad || 0) + '" min="0" style="width:100%; text-align:right;"></td>' +
      '<td class="centro"><button type="button" class="btn btn-sm btn-peligro btn-del-var">✕</button></td>';
    
    // Eventos para los selects
    var selColor = tr.querySelector('.var-color-select');
    var inpColor = tr.querySelector('.var-color-custom');
    if (color && COLORES.indexOf(color) === -1) {
      selColor.style.display = 'none';
      inpColor.style.display = 'block';
      inpColor.value = color;
    }
    selColor.onchange = function() {
      if (this.value === '__otro__') { inpColor.style.display = 'block'; inpColor.focus(); }
      else { inpColor.style.display = 'none'; inpColor.value = ''; }
    };
    
    var selTalla = tr.querySelector('.var-talla-select');
    var inpTalla = tr.querySelector('.var-talla-custom');
    if (talla && TALLAS.indexOf(talla) === -1) {
      selTalla.style.display = 'none';
      inpTalla.style.display = 'block';
      inpTalla.value = talla;
    }
    selTalla.onchange = function() {
      if (this.value === '__otro__') { inpTalla.style.display = 'block'; inpTalla.focus(); }
      else { inpTalla.style.display = 'none'; inpTalla.value = ''; }
    };
    
    tr.querySelector('.btn-del-var').onclick = function() {
      tr.remove();
    };
    
    tbody.appendChild(tr);
  }
})();

/* ═══════════════════════════════════════════════════
   GUARDADO ÚNICO DE PRODUCTO (con variantes)
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var btn = document.getElementById('mp-guardar');
    if (!btn) {
      console.log('⚠️ No se encontró el botón de guardar producto');
      return;
    }

    // Clonar para quitar eventos viejos
    var nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);

    nuevoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var nombre = document.getElementById('mp-nombre') ? document.getElementById('mp-nombre').value.trim() : '';
      if (!nombre) {
        if (document.getElementById('mp-nombre')) document.getElementById('mp-nombre').focus();
        return;
      }

      // 1. Recoger variantes
      var variantes = [];
      var tbody = document.getElementById('mp-lista-variantes');
      if (tbody) {
        tbody.querySelectorAll('tr').forEach(function(tr) {
          var selColor = tr.querySelector('.var-color-select');
          var inpColor = tr.querySelector('.var-color-custom');
          var selTalla = tr.querySelector('.var-talla-select');
          var inpTalla = tr.querySelector('.var-talla-custom');
          var inpCant = tr.querySelector('.var-cant');
          
          if (!inpCant) return;
          
          var color = '';
        if (selColor && selColor.style.display === 'none' && inpColor) {
          // Si el select está oculto, leemos del input
          color = inpColor.value.trim();
        } else if (selColor && selColor.value && selColor.value !== '__otro__') {
          color = selColor.value;
        } else if (inpColor) {
          color = inpColor.value.trim();
        }
          var talla = '';
        if (selTalla && selTalla.style.display === 'none' && inpTalla) {
          talla = inpTalla.value.trim();
        } else if (selTalla && selTalla.value && selTalla.value !== '__otro__') {
          talla = selTalla.value;
        } else if (inpTalla) {
          talla = inpTalla.value.trim();
        }
          var cantidad = parseFloat((inpCant.value || '0').replace(',', '.')) || 0;
          
          if (color && talla) {
            variantes.push({ color: color, talla: talla, cantidad: cantidad });
          }
        });
      }

      // 2. Recoger datos del producto
      var pBase = parseFloat(document.getElementById('mp-precio-base') ? document.getElementById('mp-precio-base').value : 0) || 0;
      var pIva = parseFloat(document.getElementById('mp-iva') ? document.getElementById('mp-iva').value : 21) || 21;
      var pCoste = parseFloat(document.getElementById('mp-coste') ? document.getElementById('mp-coste').value : 0) || 0;
      var pStock = parseInt(document.getElementById('mp-stock') ? document.getElementById('mp-stock').value : 0) || 0;
      var pNotas = document.getElementById('mp-notas') ? document.getElementById('mp-notas').value.trim() : '';
      var pIcono = document.getElementById('mp-icono') ? document.getElementById('mp-icono').value : '📦';

      var nuevoProd = {
        id: window._prodEditandoId || window.Storage.uuid(),
        nombre: nombre,
        precio: pBase,
        iva: pIva,
        coste: pCoste,
        stock: pStock,
        notas: pNotas,
        icono: pIcono,
        variantes: variantes
      };

      // 3. Guardar en el Stock
      var catId = window._catIdActual;
      var subcatId = window._subcatIdActual;
      
      if (!catId || !subcatId) {
        alert('Error: Vuelve a entrar en la carpeta antes de guardar.');
        return;
      }

      var estructura = window.Modelo.getStockEstructura();
      var cat = estructura.find(function(c) { return c.id === catId; });
      if (!cat) return;
      var sub = cat.categorias.find(function(c) { return c.id === subcatId; });
      if (!sub) return;
      
      if (!sub.productos) sub.productos = [];
      var idx = sub.productos.findIndex(function(p) { return p.id === nuevoProd.id; });
      if (idx >= 0) sub.productos[idx] = nuevoProd; 
      else sub.productos.push(nuevoProd);

      window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
      
      // 4. Cerrar modal y refrescar
      var modal = document.getElementById('modal-producto');
      if (modal) modal.hidden = true;
      
      if (window.renderStock) window.renderStock();
      if (window.toast) window.toast('Producto guardado con ' + variantes.length + ' variantes');
      
      console.log('✅ Producto guardado con variantes:', nuevoProd);
    });
  }, 500);
});


/* ═══════════════════════════════════════════════════
   PASO B: MOSTRAR VARIANTES EN EL MODAL DEL PRESUPUESTO
   ═══════════════════════════════════════════════════ */
(function() {

  // Guardamos la función original que pinta la lista
  var _pintarListaOrig = window.pintarLista;

  // La sobrescribimos para añadir la lógica de variantes
  window.pintarLista = function() {
    // 1. Llamamos a la función original para que pinte la lista base
    if (_pintarListaOrig) {
      _pintarListaOrig();
    }

    // 2. Después de pintar, interceptamos los clics en los productos
    var lista = document.getElementById('modal-selector-lista');
    if (!lista) return;

    // Recorremos todos los <li> que haya en la lista
    lista.querySelectorAll('li').forEach(function(li) {
      // Evitar procesar los que ya son de variantes (tienen clase especial)
      if (li.dataset.variante) return;

      // Ver si el texto del li contiene un producto
      var texto = li.textContent || '';
      var todosProductos = window.Modelo.getTodosLosProductos() || [];
      var producto = todosProductos.find(function(p) {
        return texto.indexOf(p.nombre) >= 0;
      });

      if (producto) {
        // Es un producto. Ver si tiene variantes
        if (producto.variantes && producto.variantes.length > 0) {
          // Tiene variantes: al hacer clic, mostramos las variantes
          li.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            mostrarVariantesEnModal(producto);
          };
        } else {
          // No tiene variantes: lo añadimos directamente (el evento original ya lo hace)
          // No hacemos nada, dejamos que el original funcione
        }
      }
    });
  };

  // Función para mostrar las variantes en el modal
  function mostrarVariantesEnModal(producto) {
    var lista = document.getElementById('modal-selector-lista');
    var nav = document.getElementById('modal-selector-navegacion');
    var ruta = document.getElementById('modal-selector-ruta');
    if (!lista) return;

    // Cambiar la navegación para mostrar que estamos en las variantes
    if (nav) nav.style.display = 'flex';
    if (ruta) ruta.textContent = producto.nombre + ' > Variantes';

    lista.innerHTML = '';

    // Mostrar solo las variantes con stock
    var variantes = producto.variantes.filter(function(v) { return v.cantidad > 0; });

    if (variantes.length === 0) {
      lista.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--danger); font-weight:bold;">No hay stock disponible</li>';
      return;
    }

    variantes.forEach(function(v) {
      var li = document.createElement('li');
      li.dataset.variante = '1';
      li.style.padding = '0.6rem';
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.innerHTML = 
        '<span><strong>' + window.escapar(v.color) + '</strong> - Talla <strong>' + window.escapar(v.talla) + '</strong></span>' +
        '<span style="color:var(--ok); font-weight:bold;">Stock: ' + v.cantidad + '</span>';
      
      li.onclick = function() {
        // Añadir la línea con la variante
        var precioFinal = Math.round(producto.precio * (1 + (producto.iva || 21) / 100) * 100) / 100;
        
        if (!window._lineasEditor) window._lineasEditor = [];
        window._lineasEditor.push({
          concepto: producto.nombre + ' (' + v.color + ' - ' + v.talla + ')',
          cantidad: 1,
          precio: precioFinal,
          iva: producto.iva || 21,
          tipo: 'producto',
          idRef: producto.id,
          variante: v
        });

        if (window.renderLineasEditor) window.renderLineasEditor();
        if (window.cerrarModalSelector) window.cerrarModalSelector();
        if (window.toast) window.toast('Añadido: ' + v.color + ' - ' + v.talla);
      };
      
      lista.appendChild(li);
    });
  }

})();

/* ═══════════════════════════════════════════════════
   CONECTAR EL BOTÓN "+ AÑADIR LÍNEA" AL MODAL CORRECTO
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('btnAnadirLinea');
  if (btn) {
    // Clonamos el botón para quitar eventos viejos
    var nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);
    
    // Le asignamos la función correcta
    nuevoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Usar la función del modal que sí existe
      if (window.abrirModalSelector) {
        window.abrirModalSelector();
      } else if (window.abrirModal) {
        window.abrirModal();
      } else {
        alert('Error: la función del modal no está cargada.');
      }
    });
    
    console.log('✅ Botón "+ Añadir línea" conectado al modal correcto');
  }
});

/* ═══════════════════════════════════════════════════
   INTERCEPTAR CLIC EN PRODUCTOS (FORZADO)
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var lista = document.getElementById('modal-selector-lista');
  if (!lista) return;

  // Usar delegación de eventos: escuchar clics en cualquier <li> dentro de la lista
  lista.addEventListener('click', function(e) {
    // Buscar el <li> más cercano
    var li = e.target.closest('li');
    if (!li) return;

    // Si el li ya tiene la clase de variante, no hacer nada (ya lo gestiona su onclick)
    if (li.dataset.variante === '1') return;

    // Obtener el texto del li para identificar el producto
    var texto = li.textContent || '';
    var productos = window.Modelo.getTodosLosProductos() || [];
    var producto = productos.find(function(p) {
      return texto.indexOf(p.nombre) >= 0;
    });

    // Si es un producto con variantes, mostrar las variantes
    if (producto && producto.variantes && producto.variantes.length > 0) {
      e.stopPropagation();
      e.preventDefault();

      // Mostrar las variantes en el modal
      var nav = document.getElementById('modal-selector-navegacion');
      var ruta = document.getElementById('modal-selector-ruta');
      if (nav) nav.style.display = 'flex';
      if (ruta) ruta.textContent = producto.nombre + ' > Variantes';

      lista.innerHTML = '';

      var variantes = producto.variantes.filter(function(v) { return v.cantidad > 0; });
      if (variantes.length === 0) {
        lista.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--danger); font-weight:bold;">No hay stock disponible</li>';
        return;
      }

      variantes.forEach(function(v) {
        var liVar = document.createElement('li');
        liVar.dataset.variante = '1';
        liVar.style.padding = '0.6rem';
        liVar.style.cursor = 'pointer';
        liVar.style.display = 'flex';
        liVar.style.justifyContent = 'space-between';
        liVar.style.alignItems = 'center';
        liVar.innerHTML = 
          '<span><strong>' + window.escapar(v.color) + '</strong> - Talla <strong>' + window.escapar(v.talla) + '</strong></span>' +
          '<span style="color:var(--ok); font-weight:bold;">Stock: ' + v.cantidad + '</span>';

        liVar.onclick = function(ev) {
          ev.stopPropagation();
          // Añadir la línea con la variante
          var precioFinal = Math.round(producto.precio * (1 + (producto.iva || 21) / 100) * 100) / 100;
          if (!window._lineasEditor) window._lineasEditor = [];
          window._lineasEditor.push({
            concepto: producto.nombre + ' (' + v.color + ' - ' + v.talla + ')',
            cantidad: 1,
            precio: precioFinal,
            iva: producto.iva || 21,
            tipo: 'producto',
            idRef: producto.id,
            variante: v
          });
          if (window.renderLineasEditor) window.renderLineasEditor();
          if (window.cerrarModalSelector) window.cerrarModalSelector();
          if (window.toast) window.toast('Añadido: ' + v.color + ' - ' + v.talla);
        };

        lista.appendChild(liVar);
      });
    }
  });
});

/* ═══════════════════════════════════════════════════
   MODAL SECUNDARIO PARA VARIANTES (LIMPIO Y SEGURO)
   ═══════════════════════════════════════════════════ */
(function() {
  // Crear el modal secundario si no existe
  function crearModalVariantes() {
    if (document.getElementById('modal-variantes')) return;

    var modalVar = document.createElement('div');
    modalVar.id = 'modal-variantes';
    modalVar.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:none;align-items:center;justify-content:center;';
    modalVar.innerHTML = '<div style="background:white;border-radius:8px;padding:1.5rem;max-width:400px;width:90%;"><h3 style="margin-top:0;">Elegir variante</h3><div id="modal-variantes-lista"></div><button id="modal-variantes-cerrar" style="margin-top:1rem;padding:0.5rem 1rem;cursor:pointer;">Cancelar</button></div>';
    document.body.appendChild(modalVar);

    document.getElementById('modal-variantes-cerrar').onclick = function() {
      document.getElementById('modal-variantes').style.display = 'none';
    };
  }

  // Mostrar las variantes en el modal
  function mostrarVariantes(producto) {
    crearModalVariantes();
    var modal = document.getElementById('modal-variantes');
    var lista = document.getElementById('modal-variantes-lista');
    modal.style.display = 'flex';
    lista.innerHTML = '';

    var variantes = producto.variantes.filter(function(v) { return v.cantidad > 0; });
    if (variantes.length === 0) {
      lista.innerHTML = '<p style="color:red;font-weight:bold;">No hay stock disponible de este producto.</p>';
      return;
    }

    variantes.forEach(function(v) {
      var div = document.createElement('div');
      div.style.cssText = 'padding:0.6rem;border-bottom:1px solid #eee;cursor:pointer;display:flex;justify-content:space-between;align-items:center;';
      div.innerHTML = '<span><strong>' + window.escapar(v.color) + '</strong> - Talla <strong>' + window.escapar(v.talla) + '</strong></span>' +
                      '<span style="color:green;font-weight:bold;">Stock: ' + v.cantidad + '</span>';
      div.onclick = function() {
        var precioFinal = Math.round(producto.precio * (1 + (producto.iva || 21) / 100) * 100) / 100;
        if (!window._lineasEditor) window._lineasEditor = [];
        window._lineasEditor.push({
          concepto: producto.nombre + ' (' + v.color + ' - ' + v.talla + ')',
          cantidad: 1,
          precio: precioFinal,
          iva: producto.iva || 21,
          tipo: 'producto',
          idRef: producto.id,
          variante: v
        });
        if (window.renderLineasEditor) window.renderLineasEditor();
        modal.style.display = 'none';
        if (window.cerrarModalSelector) window.cerrarModalSelector();
        if (window.toast) window.toast('Añadido: ' + v.color + ' - ' + v.talla);
      };
      lista.appendChild(div);
    });
  }

  // Interceptar el clic en los productos del modal de presupuesto
  document.addEventListener('DOMContentLoaded', function() {
    // Observar cuando se abre el modal de selección
    var observer = new MutationObserver(function() {
      var modal = document.getElementById('modal-selector');
      if (!modal || modal.hidden) return;

      var lista = document.getElementById('modal-selector-lista');
      if (!lista) return;

      // Recorrer todos los <li> de la lista
      lista.querySelectorAll('li').forEach(function(item) {
        // Si ya tiene nuestro evento, no hacer nada
        if (item.dataset.varianteControlada === '1') return;

        var texto = item.textContent || '';
        var productos = window.Modelo.getTodosLosProductos() || [];
        var prod = productos.find(function(p) {
          return texto.indexOf(p.nombre) >= 0;
        });

        if (prod && prod.variantes && prod.variantes.length > 0) {
          // Marcar como controlado
          item.dataset.varianteControlada = '1';

          // Quitar el evento antiguo (clonando)
          var itemLimpio = item.cloneNode(true);
          itemLimpio.dataset.varianteControlada = '1';
          item.parentNode.replaceChild(itemLimpio, item);

          // Poner nuestro evento
          itemLimpio.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            mostrarVariantes(prod);
          };
        }
      });
    });

    var modal = document.getElementById('modal-selector');
    if (modal) {
      observer.observe(modal, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    }

    // También procesar cuando se abre manualmente
    var btnAnadir = document.getElementById('btnAnadirLinea');
    if (btnAnadir) {
      btnAnadir.addEventListener('click', function() {
        setTimeout(function() {
          var modal = document.getElementById('modal-selector');
          if (modal && !modal.hidden) {
            var lista = document.getElementById('modal-selector-lista');
            if (lista) {
              lista.querySelectorAll('li').forEach(function(item) {
                if (item.dataset.varianteControlada === '1') return;
                var texto = item.textContent || '';
                var productos = window.Modelo.getTodosLosProductos() || [];
                var prod = productos.find(function(p) {
                  return texto.indexOf(p.nombre) >= 0;
                });
                if (prod && prod.variantes && prod.variantes.length > 0) {
                  item.dataset.varianteControlada = '1';
                  var itemLimpio = item.cloneNode(true);
                  itemLimpio.dataset.varianteControlada = '1';
                  item.parentNode.replaceChild(itemLimpio, item);
                  itemLimpio.onclick = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    mostrarVariantes(prod);
                  };
                }
              });
            }
          }
        }, 300);
      });
    }
  });
})();

/* ═══════════════════════════════════════════════════
   PARCHE ÚNICO: DESCONTAR STOCK AL GUARDAR ALBARÁN
   ═══════════════════════════════════════════════════ */
(function() {
  var _guardarOrig = window.guardarPresupuestoActual;
  if (!_guardarOrig) return;

  window.guardarPresupuestoActual = function() {
    var elTipo = document.getElementById('presu-tipo');
    var tipoActual = elTipo ? elTipo.value : 'presupuesto';
    var tipoAnterior = window._presupuestoActual ? window._presupuestoActual.tipo : null;

    // Solo descontar si es Albarán y antes no lo era
    var debeDescontar = (tipoActual === 'albaran' && tipoAnterior !== 'albaran');

    if (debeDescontar) {
      var estructura = window.Modelo.getStockEstructura() || [];
      var huboCambios = false;

      (window._lineasEditor || []).forEach(function(linea) {
        if (!linea.idRef) return;
        var cantidadARestar = parseFloat(linea.cantidad) || 0;
        if (cantidadARestar <= 0) return;

        estructura.forEach(function(cat) {
          (cat.categorias || []).forEach(function(sub) {
            (sub.productos || []).forEach(function(p) {
              if (p.id !== linea.idRef) return;
              
              // Variantes
              if (linea.variante && p.variantes && p.variantes.length) {
                p.variantes.forEach(function(v) {
                  if (v.color === linea.variante.color && v.talla === linea.variante.talla) {
                    v.cantidad = Math.max(0, (v.cantidad || 0) - cantidadARestar);
                    huboCambios = true;
                  }
                });
                var totalVar = 0;
                p.variantes.forEach(function(v) { totalVar += parseFloat(v.cantidad) || 0; });
                p.stock = totalVar;
              } 
              // Sin variantes
              else if (!p.variantes || !p.variantes.length) {
                p.stock = Math.max(0, (p.stock || 0) - cantidadARestar);
                huboCambios = true;
              }
            });
          });
        });
      });

      if (huboCambios) {
        window.Modelo.setStockEstructura(estructura);
      setTimeout(function() { if(window.renderStock) window.renderStock(); }, 50);
        console.log('✅ Stock descontado (Albarán generado)');
        if (window.renderStock) window.renderStock();
      }
    }

    // Llamamos a la función original para que guarde el presupuesto
    _guardarOrig.apply(this, arguments);
  };
})();






/* PARCHE DE COBRO: AÑADIR ESTADO DE PAGO */
(function() {
  var _abrirEditorOrig = window.abrirEditorPresupuesto;
  
  if (_abrirEditorOrig) {
    window.abrirEditorPresupuesto = function(p) {
      _abrirEditorOrig(p);
      
      var form = document.getElementById('presu-editor');
      if (form) {
        // 1. Forzar estados del documento
        var selEstado = document.getElementById('presu-estado');
        if (selEstado) {
          selEstado.innerHTML = `
            <option value="borrador">Borrador</option>
            <option value="aceptado">Aceptado (En cola)</option>
            <option value="en_produccion">En Producción</option>
            <option value="entregado">Entregado (Albarán)</option>
          `;
          if (p && p.estado) selEstado.value = p.estado;
        }

        // 2. Añadir campo de Fecha de entrega si no está
        if (!document.getElementById('presu-fecha-entrega')) {
          var divFecha = document.createElement('div');
          divFecha.style.marginLeft = '1rem';
          divFecha.style.flex = '1';
          divFecha.innerHTML = `
            <label style="font-weight:bold; font-size:0.85rem; color:var(--text-soft); display:block; margin-bottom:0.3rem;">📅 Fecha de entrega</label>
            <input type="date" id="presu-fecha-entrega" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border);">
          `;
          var contEstado = selEstado ? selEstado.parentNode : null;
          if (contEstado && contEstado.parentNode) {
            contEstado.parentNode.style.display = 'flex';
            contEstado.parentNode.style.alignItems = 'flex-end';
            contEstado.parentNode.insertBefore(divFecha, contEstado.nextSibling);
          }
        }
        if (p && p.fecha_entrega) document.getElementById('presu-fecha-entrega').value = p.fecha_entrega;

        // 3. AÑADIR EL DESPLEGABLE DE COBRO (NUEVO)
        if (!document.getElementById('presu-cobro')) {
          var divCobro = document.createElement('div');
          divCobro.style.marginLeft = '1rem';
          divCobro.style.flex = '1';
          divCobro.innerHTML = `
            <label style="font-weight:bold; font-size:0.85rem; color:var(--text-soft); display:block; margin-bottom:0.3rem;">💰 Estado de Cobro</label>
            <select id="presu-cobro" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border);">
              <option value="pendiente">Pendiente de cobro</option>
              <option value="cobrado">Cobrado</option>
            </select>
          `;
          // Lo insertamos al lado de la fecha de entrega
          var contFecha = document.getElementById('presu-fecha-entrega') ? document.getElementById('presu-fecha-entrega').parentNode : null;
          if (contFecha && contFecha.parentNode) {
             contFecha.parentNode.insertBefore(divCobro, contFecha.nextSibling);
          }
        }
        // Rellenar el estado de cobro si existe
        if (p && p.cobro) {
          document.getElementById('presu-cobro').value = p.cobro;
        }
      }
    };
  }

  // Guardar el estado de cobro
  var _guardarOrig = window.guardarPresupuestoActual;
  if (_guardarOrig) {
    window.guardarPresupuestoActual = function() {
      var fechaInput = document.getElementById('presu-fecha-entrega');
      var estadoInput = document.getElementById('presu-estado');
      var cobroInput = document.getElementById('presu-cobro');
      
      if (window._presupuestoActual) {
        if (fechaInput) window._presupuestoActual.fecha_entrega = fechaInput.value;
        if (estadoInput) window._presupuestoActual.estado = estadoInput.value;
        if (cobroInput) window._presupuestoActual.cobro = cobroInput.value;
        
        if (estadoInput && estadoInput.value === 'entregado') {
          var tipoInput = document.getElementById('presu-tipo');
          if (tipoInput) tipoInput.value = 'albaran';
        }
      }
      
      _guardarOrig.apply(this, arguments);
      
      // Forzar guardado en localStorage para el cobro
      var lista = JSON.parse(localStorage.getItem('arandacrafts:presupuestos') || '[]');
      var id = window._presupuestoActual ? window._presupuestoActual.id : null;
      if (id) {
        var idx = lista.findIndex(function(x) { return x.id === id; });
        if (idx >= 0) {
          if (fechaInput) lista[idx].fecha_entrega = fechaInput.value;
          if (estadoInput) lista[idx].estado = estadoInput.value;
          if (cobroInput) lista[idx].cobro = cobroInput.value;
          if (estadoInput && estadoInput.value === 'entregado') lista[idx].tipo = 'albaran';
          localStorage.setItem('arandacrafts:presupuestos', JSON.stringify(lista));
        }
      }
    };
  }
})();




/* PARCHE: RESUMEN DE CLIENTE CON HISTORIAL CLICABLE */
(function() {
  var _abrirModalClienteOrig = window.abrirModalCliente;
  
  if (_abrirModalClienteOrig) {
    window.abrirModalCliente = function(id) {
      _abrirModalClienteOrig(id);
      if (!id) return;

      var modal = document.getElementById('modal-cliente');
      var btnGuardar = document.getElementById('cl-guardar');
      if (!modal || !btnGuardar) return;

      var divViejo = document.getElementById('cl-resumen-dinamico');
      if (divViejo) divViejo.remove();

      var todosDocs = window.Modelo.getPresupuestos() || [];
      var misDocs = todosDocs.filter(function(p) {
        return p.cliente && p.cliente.id === id;
      });

      misDocs.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });

      var totalCobrado = 0;
      var totalPendiente = 0;
      var htmlFilas = '';

      if (misDocs.length === 0) {
        htmlFilas = '<tr><td colspan="4" style="text-align:center; padding: 1rem; color: var(--text-soft);">Este cliente aún no tiene documentos.</td></tr>';
      } else {
        misDocs.forEach(function(p) {
          if (p.estado !== 'borrador') {
            if (p.cobro === 'cobrado') totalCobrado += (p.total || 0);
            else totalPendiente += (p.total || 0);
          }

          var colorEstado = 'var(--text-soft)';
          var badgeBg = 'var(--border)';
          if (p.estado === 'entregado') { badgeBg = '#e8f5e9'; colorEstado = '#2e7d32'; }
          else if (p.estado === 'en_produccion') { badgeBg = '#fff3e0'; colorEstado = '#e65100'; }
          else if (p.estado === 'aceptado') { badgeBg = '#e3f2fd'; colorEstado = '#1565c0'; }
          else if (p.estado === 'borrador') { badgeBg = '#f5f5f5'; colorEstado = '#9e9e9e'; }

          var textoCobro = (p.estado !== 'borrador') ? (p.cobro === 'cobrado' ? '💰 Cobrado' : '⏳ Pendiente') : '-';

          // AÑADIMOS EL ONCLICK A LA FILA
          htmlFilas += `<tr onclick="window.abrirDocDesdeCliente('${p.id}')" style="border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-soft)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 0.5rem; font-weight: 600; color: var(--primary);">${p.numero}</td>
            <td style="padding: 0.5rem; color: var(--text-soft);">${p.fecha}</td>
            <td style="padding: 0.5rem; text-align: right; font-weight: bold;">${window.eur(p.total || 0)}</td>
            <td style="padding: 0.5rem; text-align: center;">
              <span style="background: ${badgeBg}; color: ${colorEstado}; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">${p.estado}</span>
              <div style="font-size: 0.7rem; margin-top: 3px; color: var(--text-soft);">${textoCobro}</div>
            </td>
          </tr>`;
        });
      }

      var divResumen = document.createElement('div');
      divResumen.id = 'cl-resumen-dinamico';
      divResumen.style.cssText = 'margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border);';
      divResumen.innerHTML = `
        <h3 style="margin-top:0; font-size:1.1rem; margin-bottom: 1rem;">📊 Resumen del Cliente</h3>
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="flex: 1; background: #e8f5e9; padding: 1rem; border-radius: 8px; border: 1px solid #c8e6c9;">
            <div style="font-size: 0.75rem; color: #2e7d32; text-transform: uppercase;">Total Cobrado</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #2e7d32;">${window.eur(totalCobrado)}</div>
          </div>
          <div style="flex: 1; background: #fff3e0; padding: 1rem; border-radius: 8px; border: 1px solid #ffe0b2;">
            <div style="font-size: 0.75rem; color: #e65100; text-transform: uppercase;">Pendiente de Cobro</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #e65100;">${window.eur(totalPendiente)}</div>
          </div>
        </div>
        <h4 style="margin-top:0; font-size: 0.95rem;">Historial de Documentos</h4>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead style="background: var(--bg-soft); position: sticky; top: 0;">
              <tr>
                <th style="padding: 0.5rem; text-align: left;">Número</th>
                <th style="padding: 0.5rem; text-align: left;">Fecha</th>
                <th style="padding: 0.5rem; text-align: right;">Total</th>
                <th style="padding: 0.5rem; text-align: center;">Estado</th>
              </tr>
            </thead>
            <tbody>${htmlFilas}</tbody>
          </table>
        </div>
      `;

      var contenedorBotones = btnGuardar.parentNode;
      if (contenedorBotones) {
        contenedorBotones.parentNode.insertBefore(divResumen, contenedorBotones);
      } else {
        modal.appendChild(divResumen);
      }
    };
  }

  // Nueva función para abrir el documento desde el perfil del cliente
  window.abrirDocDesdeCliente = function(presupuestoId) {
    // 1. Cerramos el modal del cliente
    var modalCliente = document.getElementById('modal-cliente');
    if (modalCliente) modalCliente.hidden = true;

    // 2. Nos vamos a la pestaña de presupuestos
    if (window.mostrarVista) window.mostrarVista('presupuestos');

    // 3. Abrimos el editor del presupuesto y forzamos que se vea
    setTimeout(function() {
      if (window.editarPresupuesto) {
        window.editarPresupuesto(presupuestoId);
        
        setTimeout(function() {
          var editor = document.getElementById('presu-editor');
          var listado = document.getElementById('presu-listado');
          if (editor && listado) {
            listado.style.display = 'none';
            editor.style.display = 'block';
          }
        }, 100);
      }
    }, 150);
  };

})();







/* PARCHE: HACER EL MODAL MAS GRANDE */
(function() {
  var _abrirProdOrig = window.abrirModalProducto;
  window.abrirModalProducto = function(prod) {
    _abrirProdOrig(prod);
    var modal = document.getElementById("modal-producto");
    if (modal) {
      var contenido = modal.querySelector(".modal-contenido") || modal.querySelector(".modal-content") || modal.firstElementChild;
      if (contenido) {
        contenido.style.maxWidth = "900px";
        contenido.style.width = "95%";
      }
    }
  };
})();
/* PARCHE: ARREGLAR BOTON DE EMOJI DE INTERNET */
document.addEventListener("click", function(e) {
  if (e.target && e.target.id === "mp-btn-emoji-url") {
    var url = null;
    if (url) {
      var inp = document.getElementById("mp-icono");
      if (inp) inp.value = url;
    }
  }
});
/* PARCHE: ARREGLAR BOTON VER MAS EMOJIS */
document.addEventListener("click", function(e) {
  if (e.target && (e.target.textContent.includes("Ver más") || e.target.id === "mp-btn-ver-mas")) {
    var url = null;
    if (url) {
      var inp = document.getElementById("mp-icono");
      if (inp) inp.value = url;
    }
  }
});

/* PARCHE DEFINITIVO: LEER EMOJI CUSTOM AL GUARDAR */
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'mp-guardar') {
    var customEmoji = document.getElementById('mp-icono-custom');
    var inputIcono = document.getElementById('mp-icono');
    
    // Si la caja de texto tiene algo, lo forzamos en el input que lee el sistema
    if (customEmoji && customEmoji.value.trim() !== '') {
      if (inputIcono) inputIcono.value = customEmoji.value.trim();
    }
  }
}, true); // El 'true' hace que se ejecute ANTES que el guardado original

/* ═══════════════════════════════════════════════════
   FIX: PERMITIR DECIMALES EN CANTIDADES Y PRECIOS
   ═══════════════════════════════════════════════════ */
(function() {
  // Guardamos la función original por si acaso
  var _renderOrig = window.renderLineasEditor;

  window.renderLineasEditor = function() {
    var contProd = document.getElementById('contenedor-productos');
    var contTrab = document.getElementById('contenedor-trabajos');
    if (!contProd || !contTrab) return;

    contProd.innerHTML = '';
    contTrab.innerHTML = '';

    var totalBase = 0;
    var totalIva = 0;
    var granTotal = 0;

    function pintarLinea(linea, index) {
      var div = document.createElement('div');
      div.className = 'card';
      div.style.padding = '0.5rem';
      div.style.marginBottom = '0.5rem';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '0.5rem';

      var cantidad = parseFloat(linea.cantidad) || 0;
      var precioConIva = parseFloat(linea.precio) || 0;
      var iva = parseFloat(linea.iva) || 0;
      var descuento = parseFloat(linea.descuento) || 0;

      var totalLinea = cantidad * precioConIva;
      if (descuento > 0) totalLinea = totalLinea * (1 - (descuento / 100));
      totalLinea = Math.round((totalLinea + Number.EPSILON) * 100) / 100;

      var baseLinea = totalLinea / (1 + (iva / 100));
      var ivaLinea = totalLinea - baseLinea;

      baseLinea = Math.round((baseLinea + Number.EPSILON) * 100) / 100;
      ivaLinea = Math.round((totalLinea - baseLinea + Number.EPSILON) * 100) / 100;

      totalBase += baseLinea;
      totalIva += ivaLinea;
      granTotal += totalLinea;

      // IMPORTANTE: Usamos type="text" para que no salten las flechitas y se pueda escribir la coma
      div.innerHTML = 
        '<div style="flex: 2; min-width: 150px;">' +
          '<input type="text" class="inp-con" value="' + (linea.concepto || '') + '" placeholder="Concepto" style="width:100%;">' +
        '</div>' +
        '<div style="flex: 1; min-width: 60px;">' +
          '<input type="text" class="inp-cant" value="' + cantidad + '" placeholder="Cant" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1; min-width: 80px;">' +
          '<input type="text" class="inp-precio" value="' + precioConIva + '" placeholder="Precio" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 0 0 60px;">' +
          '<input type="text" class="inp-iva" value="' + iva + '" placeholder="IVA%" style="width:100%; text-align:right;">' +
        '</div>' +
        '<div style="flex: 1; min-width: 100px; text-align:right; font-weight:bold; padding: 0.4rem; background: var(--bg-soft); border-radius: 4px;">' + 
          window.eur(totalLinea) + 
        '</div>' +
        '<div>' +
          '<button class="btn btn-sm btn-peligro btn-eliminar-linea">🗑️</button>' +
        '</div>';

      var inputCant = div.querySelector('.inp-cant');
      var inputPrecio = div.querySelector('.inp-precio');
      var inputIva = div.querySelector('.inp-iva');
      var inputCon = div.querySelector('.inp-con');

      // LA MAGIA: Escuchamos el evento 'change' (cuando se sale del campo o se pulsa Enter)
      // En lugar de 'input' (que es cada tecla). Así no se redibuja mientras escribes.
      function actualizarDatos() {
        linea.cantidad = parseFloat(inputCant.value.replace(',', '.')) || 0;
        linea.precio = parseFloat(inputPrecio.value.replace(',', '.')) || 0;
        linea.iva = parseFloat(inputIva.value.replace(',', '.')) || 0;
        linea.concepto = inputCon.value;
        window.renderLineasEditor(); 
      }

      inputCant.addEventListener('change', actualizarDatos);
      inputPrecio.addEventListener('change', actualizarDatos);
      inputIva.addEventListener('change', actualizarDatos);
      inputCon.addEventListener('change', actualizarDatos);

      // Para que al pulsar Enter también se actualice
      inputCant.addEventListener('keydown', function(e) { if(e.key === 'Enter') actualizarDatos(); });
      inputPrecio.addEventListener('keydown', function(e) { if(e.key === 'Enter') actualizarDatos(); });

      div.querySelector('.btn-eliminar-linea').onclick = function() {
        window._lineasEditor.splice(index, 1);
        window.renderLineasEditor();
      };

      return div;
    }

    var productos = window._lineasEditor.filter(function(l) { return l.tipo === 'producto'; });
    if (productos.length) {
      var tituloProd = document.createElement('div');
      tituloProd.className = 'card';
      tituloProd.style.background = 'var(--primary-soft)';
      tituloProd.style.padding = '0.6rem 1rem';
      tituloProd.style.marginBottom = '0.5rem';
      tituloProd.innerHTML = '<h3 style="color: var(--primary); margin: 0;">📦 Productos Aranda Crafts</h3>';
      contProd.appendChild(tituloProd);
      productos.forEach(function(linea) {
        contProd.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
      });
    }

    var trabajos = window._lineasEditor.filter(function(l) { return l.tipo === 'trabajo'; });
    if (trabajos.length) {
      var tituloTrab = document.createElement('div');
      tituloTrab.className = 'card';
      tituloTrab.style.background = 'var(--warn-soft)';
      tituloTrab.style.padding = '0.6rem 1rem';
      tituloTrab.style.marginBottom = '0.5rem';
      tituloTrab.innerHTML = '<h3 style="color: var(--warn); margin: 0;">🛠️ Trabajos Aranda Crafts</h3>';
      contTrab.appendChild(tituloTrab);
      trabajos.forEach(function(linea) {
        contTrab.appendChild(pintarLinea(linea, window._lineasEditor.indexOf(linea)));
      });
    }

    var totalBox = document.getElementById('presu-total');
    if (totalBox) totalBox.textContent = window.eur(Math.round((granTotal + Number.EPSILON) * 100) / 100);
    var baseBox = document.getElementById('presu-base');
    if (baseBox) baseBox.textContent = window.eur(Math.round((totalBase + Number.EPSILON) * 100) / 100);
    var ivaBox = document.getElementById('presu-iva');
    if (ivaBox) ivaBox.textContent = window.eur(Math.round((totalIva + Number.EPSILON) * 100) / 100);

    window._totalesPresupuesto = {
      base: Math.round((totalBase + Number.EPSILON) * 100) / 100,
      iva: Math.round((totalIva + Number.EPSILON) * 100) / 100,
      total: Math.round((granTotal + Number.EPSILON) * 100) / 100
    };
  };
})();

/* PARCHE FINAL: RECALCULAR STOCK AL GUARDAR (SIEMPRE) */
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'mp-guardar') {
    // 1. Recogemos las variantes de la tabla
    var variantes = [];
    var tbody = document.getElementById('mp-lista-variantes');
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(function(tr) {
        var selColor = tr.querySelector('.var-color-select');
        var inpColor = tr.querySelector('.var-color-custom');
        var selTalla = tr.querySelector('.var-talla-select');
        var inpTalla = tr.querySelector('.var-talla-custom');
        var inpCant = tr.querySelector('.var-cant');
        if (!inpCant) return;
        var color = '';
        if (selColor && selColor.style.display === 'none' && inpColor) {
          // Si el select está oculto, leemos del input
          color = inpColor.value.trim();
        } else if (selColor && selColor.value && selColor.value !== '__otro__') {
          color = selColor.value;
        } else if (inpColor) {
          color = inpColor.value.trim();
        }
        var talla = '';
        if (selTalla && selTalla.style.display === 'none' && inpTalla) {
          talla = inpTalla.value.trim();
        } else if (selTalla && selTalla.value && selTalla.value !== '__otro__') {
          talla = selTalla.value;
        } else if (inpTalla) {
          talla = inpTalla.value.trim();
        }
        var cantidad = parseFloat((inpCant.value || '0').replace(',', '.')) || 0;
        if (color && talla) {
          variantes.push({ color: color, talla: talla, cantidad: cantidad });
        }
      });
    }

    // 2. Calculamos el stock total sumando las variantes
    var stockTotal = 0;
    variantes.forEach(function(v) {
      stockTotal += v.cantidad;
    });

    // 3. Si hay variantes, forzamos el valor del input de stock para que el guardado lo recoja
    if (variantes.length > 0) {
      var inputStock = document.getElementById('mp-stock');
      if (inputStock) {
        inputStock.value = stockTotal;
      }
    }
  }
}, true); // El 'true' hace que se ejecute ANTES del guardado original



/* PARCHE DEFINITIVO: GUARDAR Y MOSTRAR FOTOS EN TARJETAS */
(function() {
  var BASE_URL = 'https://mikeldesuait.github.io/arandacrafts/imagenes/';

  // 1. Aseguramos que el nombre de la foto se guarda en el producto
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'mp-guardar') {
      setTimeout(function() {
        var prodId = window._prodEditandoId;
        if (!prodId) return;

        var fotoInput = document.getElementById('mp-foto-nombre');
        var foto = fotoInput ? fotoInput.value.trim() : '';

        // Leemos la estructura actual
        var estructura = JSON.parse(localStorage.getItem('arandacrafts:stock:estructura') || '[]');
        var encontrado = false;

        // Buscamos el producto por ID y le asignamos la foto
        estructura.forEach(function(cat) {
          (cat.categorias || []).forEach(function(sub) {
            (sub.productos || []).forEach(function(p) {
              if (p.id === prodId) {
                if (foto) {
                  p.foto = foto;
                } else {
                  delete p.foto;
                }
                encontrado = true;
              }
            });
          });
        });

        // Guardamos en localStorage
        if (encontrado) {
          localStorage.setItem('arandacrafts:stock:estructura', JSON.stringify(estructura));
          console.log('✅ Foto guardada en localStorage:', foto);
        }

        // Forzamos el repintado
        if (window.renderStock) {
          window.renderStock();
        }
      }, 300); // Esperamos a que el guardado original termine
    }
  }, true);

  // 2. Al pintar las tarjetas, buscamos la foto por ID (más fiable que por nombre)
  var _renderStockOrig = window.renderStock;
  if (_renderStockOrig) {
    window.renderStock = function() {
      _renderStockOrig.apply(this, arguments);

      // Recorremos todas las tarjetas
      var tarjetas = document.querySelectorAll('.tarjeta-stock');
      tarjetas.forEach(function(tarjeta) {
        var tituloEl = tarjeta.querySelector('.tarjeta-titulo');
        var iconoEl = tarjeta.querySelector('.tarjeta-icono');
        if (!tituloEl || !iconoEl) return;

        var nombre = tituloEl.textContent.trim();
        var estructura = window.Modelo.getStockEstructura() || [];
        var foto = null;

        // Buscamos por nombre (más fiable que por ID en este contexto)
        estructura.forEach(function(cat) {
          // Buscar en bloques
          if (cat.nombre === nombre && cat.foto) {
            foto = cat.foto;
          }
          (cat.categorias || []).forEach(function(sub) {
            // Buscar en subcarpetas
            if (sub.nombre === nombre && sub.foto) {
              foto = sub.foto;
            }
            // Buscar en productos
            (sub.productos || []).forEach(function(p) {
              if (p.nombre === nombre && p.foto) {
                foto = p.foto;
              }
            });
          });
        });

        // Si encontramos foto, la pintamos
        if (foto) {
          var url = BASE_URL + foto;
          iconoEl.innerHTML = '<img src="' + url + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display=\'none\'; this.parentNode.innerHTML=\'' + iconoEl.textContent + '\';">';
        }
      });
    };
  }

  // 3. Forzamos un repintado al cargar la página
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (window.renderStock) {
        window.renderStock();
        console.log('✅ Repintado forzado al cargar.');
      }
    }, 500);
  });
})();
