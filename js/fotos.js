/* ═══════════════════════════════════════════════════
   ArandaCrafts — Fotos + Handlers de Guardado
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BASE_URL = (function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + 'imagenes/';
    }
    return 'https://mikeldesuait.github.io/arandacrafts/imagenes/';
  })();

  // ─────────────────────────────────────────────
  // 1. RELLENAR CAMPOS AL ABRIR LOS MODALES
  // ─────────────────────────────────────────────
  function envolverAbrirProducto() {
    var orig = window.abrirModalProducto;
    if (!orig) { setTimeout(envolverAbrirProducto, 100); return; }

    window.abrirModalProducto = function (prod) {
      orig.apply(this, arguments);
      var inpFoto = document.getElementById('mp-foto-nombre');
      if (inpFoto) inpFoto.value = (prod && prod.foto) ? prod.foto : '';
      var inpCustom = document.getElementById('mp-icono-custom');
      if (inpCustom) inpCustom.value = '';
    };
  }

  function envolverAbrirCarpeta() {
    var orig = window.abrirModalCarpeta;
    if (!orig) { setTimeout(envolverAbrirCarpeta, 100); return; }

    window.abrirModalCarpeta = function (titulo, datos, cb) {
      orig.apply(this, arguments);
      var inp = document.getElementById('mc-foto-nombre');
      if (inp) inp.value = (datos && datos.foto) ? datos.foto : '';
    };
  }

  // ─────────────────────────────────────────────
  // 2. HANDLER ÚNICO DE GUARDADO DEL PRODUCTO
  // ─────────────────────────────────────────────
  function leerVariantesDeTabla() {
    var variantes = [];
    var tbody = document.getElementById('mp-lista-variantes');
    if (!tbody) return variantes;

    tbody.querySelectorAll('tr').forEach(function (tr) {
      var selC = tr.querySelector('.var-color-select');
      var inpC = tr.querySelector('.var-color-custom');
      var selT = tr.querySelector('.var-talla-select');
      var inpT = tr.querySelector('.var-talla-custom');
      var inpN = tr.querySelector('.var-cant');
      if (!inpN) return;

      var color = '';
      if (selC && selC.value && selC.value !== '__otro__' && selC.value !== '') color = selC.value;
      else if (inpC && inpC.value.trim()) color = inpC.value.trim();

      var talla = '';
      if (selT && selT.value && selT.value !== '__otro__' && selT.value !== '') talla = selT.value;
      else if (inpT && inpT.value.trim()) talla = inpT.value.trim();

      var cant = parseFloat((inpN.value || '0').replace(',', '.')) || 0;
      if (color && talla) variantes.push({ color: color, talla: talla, cantidad: cant });
    });
    return variantes;
  }

  function instalarHandlerGuardarProducto() {
    var btn = document.getElementById('mp-guardar');
    if (!btn) { setTimeout(instalarHandlerGuardarProducto, 100); return; }

    var btnNuevo = btn.cloneNode(true);
    btn.parentNode.replaceChild(btnNuevo, btn);

    btnNuevo.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();

      var nombre = document.getElementById('mp-nombre').value.trim();
      if (!nombre) { document.getElementById('mp-nombre').focus(); return; }

      var variantes = leerVariantesDeTabla();
      var stockInput = parseFloat((document.getElementById('mp-stock').value || '0').replace(',', '.')) || 0;
      var stockFinal = variantes.length > 0 ? variantes.reduce(function (a, v) { return a + v.cantidad; }, 0) : stockInput;

      var customIcono = document.getElementById('mp-icono-custom');
      var iconoFinal = document.getElementById('mp-icono').value || '📦';
      if (customIcono && customIcono.value.trim()) iconoFinal = customIcono.value.trim();

      var fotoInput = document.getElementById('mp-foto-nombre');
      var foto = fotoInput ? fotoInput.value.trim() : '';

      var nuevoProd = {
        id: window._prodEditandoId || window.Storage.uuid(),
        nombre: nombre,
        precio: parseFloat(document.getElementById('mp-precio-base').value) || 0,
        iva: parseFloat(document.getElementById('mp-iva').value) || 21,
        coste: parseFloat(document.getElementById('mp-coste').value) || 0,
        stock: stockFinal,
        icono: iconoFinal,
        notas: document.getElementById('mp-notas').value.trim(),
        variantes: variantes
      };
      if (foto) nuevoProd.foto = foto;

      var catId = window._catIdActual;
      var subcatId = window._subcatIdActual;
      if (!catId || !subcatId) { alert('Error: Vuelve a entrar en la carpeta antes de guardar.'); return; }

      var estructura = window.Modelo.getStockEstructura();
      var cat = estructura.find(function (c) { return c.id === catId; });
      if (!cat) { alert('Error: no se encontró la categoría.'); return; }
      var sub = cat.categorias.find(function (c) { return c.id === subcatId; });
      if (!sub) { alert('Error: no se encontró la subcategoría.'); return; }

      if (!sub.productos) sub.productos = [];
      var idx = sub.productos.findIndex(function (p) { return p.id === nuevoProd.id; });
      if (idx >= 0) sub.productos[idx] = nuevoProd;
      else sub.productos.push(nuevoProd);

      window.Modelo.setStockEstructura(estructura);
      document.getElementById('modal-producto').hidden = true;
      
      if (window.renderStock) window.renderStock();
      if (window.toast) window.toast('Producto guardado');
      console.log('✅ PRODUCTO GUARDADO:', nuevoProd);
    });
  }

  // ─────────────────────────────────────────────
  // 3. HANDLER ÚNICO DE GUARDADO DE BLOQUES/CARPETAS
  // ─────────────────────────────────────────────
  function instalarHandlerGuardarCarpeta() {
    var btn = document.getElementById('mc-guardar');
    if (!btn) { setTimeout(instalarHandlerGuardarCarpeta, 200); return; }

    // Clonamos el botón para eliminar TODOS los eventos viejos
    var btnNuevo = btn.cloneNode(true);
    btn.parentNode.replaceChild(btnNuevo, btn);

    btnNuevo.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();

      var nombre = document.getElementById('mc-nombre').value.trim();
      if (!nombre) { document.getElementById('mc-nombre').focus(); return; }

      var customIcono = document.getElementById('mc-icono-custom');
      var iconoFinal = document.getElementById('mc-icono').value || '📦';
      if (customIcono && customIcono.value.trim()) iconoFinal = customIcono.value.trim();

      var fotoInput = document.getElementById('mc-foto-nombre');
      var foto = fotoInput ? fotoInput.value.trim() : '';

      // ¿Qué estamos editando? Leemos el título del modal
      var titulo = document.getElementById('mc-titulo').textContent;
      var esEdicion = titulo.includes('Editar');
      
      var estructura = window.Modelo.getStockEstructura();
      var encontrado = false;

      // Buscamos si existe un bloque o carpeta con ese nombre
      estructura.forEach(function (cat) {
        if (cat.nombre === nombre) {
          cat.icono = iconoFinal;
          if (foto) cat.foto = foto; else delete cat.foto;
          encontrado = true;
        }
        (cat.categorias || []).forEach(function (sub) {
          if (sub.nombre === nombre) {
            sub.icono = iconoFinal;
            if (foto) sub.foto = foto; else delete sub.foto;
            encontrado = true;
          }
        });
      });

      // Si no existe y estamos en modo "Nuevo", lo creamos
      if (!encontrado && !esEdicion) {
        // ¿Dónde va? Depende de la función callback original, que ya se perdió
        // Lo metemos en el último bloque como nueva subcarpeta, o como nuevo bloque
        // Como el flujo original usaba callback, aquí hacemos un fallback
        var catPadreId = window._catIdActual;
        var catPadre = catPadreId ? estructura.find(function(c){ return c.id === catPadreId; }) : null;
        
        if (catPadre) {
          catPadre.categorias = catPadre.categorias || [];
          catPadre.categorias.push({
            id: 's-' + window.Storage.uuid(),
            nombre: nombre,
            icono: iconoFinal,
            foto: foto,
            productos: []
          });
        } else {
          estructura.push({
            id: 's-' + window.Storage.uuid(),
            nombre: nombre,
            icono: iconoFinal,
            foto: foto,
            categorias: []
          });
        }
      }

      window.Modelo.setStockEstructura(estructura);
      document.getElementById('modal-nueva-carpeta').hidden = true;
      
      if (window.renderStock) window.renderStock();
      if (window.toast) window.toast('Guardado correctamente');
      console.log('✅ CARPETA/BLOQUE GUARDADO:', { nombre, iconoFinal, foto });
    });
  }

  // ─────────────────────────────────────────────
  // 4. PINTAR FOTOS EN TARJETAS
  // ─────────────────────────────────────────────
  function configurarObservadorFotos() {
    var cont = document.getElementById('stock-nivel1');
    if (!cont) { setTimeout(configurarObservadorFotos, 100); return; }

    function ponerFotos() {
      var estructura = window.Modelo.getStockEstructura() || [];
      var mapa = {};
      estructura.forEach(function(cat) {
        if (cat.foto) mapa[cat.nombre] = cat.foto;
        (cat.categorias || []).forEach(function(sub) {
          if (sub.foto) mapa[sub.nombre] = sub.foto;
          (sub.productos || []).forEach(function(p) {
            if (p.foto) mapa[p.nombre] = p.foto;
          });
        });
      });

      document.querySelectorAll('.tarjeta-stock').forEach(function(t) {
        var titulo = t.querySelector('.tarjeta-titulo');
        var icono = t.querySelector('.tarjeta-icono');
        if (!titulo || !icono) return;
        if (icono.querySelector('img')) return;

        var nombre = titulo.textContent.trim();
        var foto = mapa[nombre];
        if (foto) {
          var url = BASE_URL + foto;
          var emojiBackup = icono.textContent.trim() || '📦';
          icono.innerHTML = '<img src="' + url + '" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.parentNode.textContent=\'' + emojiBackup + '\'; this.remove();">';
        }
      });
    }

    if (window._vigilanteFotos) window._vigilanteFotos.disconnect();
    window._vigilanteFotos = new MutationObserver(function() { setTimeout(ponerFotos, 50); });
    window._vigilanteFotos.observe(cont, { childList: true, subtree: true });
    ponerFotos();
  }

  // ─────────────────────────────────────────────
  // 5. ARRANCAR Y RE-ENGANCHAR EN CADA APERTURA
  // ─────────────────────────────────────────────
  window.addEventListener('load', function () {
    envolverAbrirProducto();
    envolverAbrirCarpeta();
    instalarHandlerGuardarProducto();
    configurarObservadorFotos();
    console.log('✅ Módulo de fotos cargado');
  });

  // Como el modal se puede abrir varias veces, nos aseguramos de enganchar el botón de carpeta
  // cada vez que se abre un modal (por si el original lo vuelve a clonar)
  var observerModal = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.attributeName === 'hidden') {
        var modalCarpeta = document.getElementById('modal-nueva-carpeta');
        if (modalCarpeta && !modalCarpeta.hidden) {
          setTimeout(instalarHandlerGuardarCarpeta, 50);
        }
      }
    });
  });
  
  window.addEventListener('load', function() {
    var modalCarpeta = document.getElementById('modal-nueva-carpeta');
    if (modalCarpeta) {
      observerModal.observe(modalCarpeta, { attributes: true });
    }
  });

})();
