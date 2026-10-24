/* ═══════════════════════════════════════════════════
   ArandaCrafts — Soporte de fotos por nombre de archivo
   Módulo aislado. Se carga DESPUÉS de app.js.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BASE_URL = 'https://mikeldesuait.github.io/arandacrafts/imagenes/';

  // ─────────────────────────────────────────────
  // 1. RELLENAR EL CAMPO AL ABRIR EL MODAL
  // ─────────────────────────────────────────────
  function envolverAbrirProducto() {
    var orig = window.abrirModalProducto;
    if (!orig) { setTimeout(envolverAbrirProducto, 100); return; }

    window.abrirModalProducto = function (prod) {
      orig.apply(this, arguments);
      var inp = document.getElementById('mp-foto-nombre');
      if (inp) inp.value = (prod && prod.foto) ? prod.foto : '';
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
  // 2. CAPTURAR EL VALOR DE FOTO AL GUARDAR
  //    (SIN tocar los handlers existentes)
  // ─────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'mp-guardar') {
      var inp = document.getElementById('mp-foto-nombre');
      window._fotoProductoPendiente = inp ? inp.value.trim() : '';
    }
    if (e.target && e.target.id === 'mc-guardar') {
      var inp2 = document.getElementById('mc-foto-nombre');
      window._fotoCarpetaPendiente = inp2 ? inp2.value.trim() : '';
    }
  }, true);

  // ─────────────────────────────────────────────
  // 3. PERSISTIR LA FOTO TRAS EL GUARDADO
  //    (escuchamos DESPUÉS del handler original)
  // ─────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'mp-guardar') {
      // Esperamos a que termine el guardado original (mismo tick + margen)
      setTimeout(function () {
        var foto = window._fotoProductoPendiente;
        var prodId = window._prodEditandoId;
        if (foto === undefined) return;
        if (!prodId) return;

        var estructura = window.Modelo.getStockEstructura() || [];
        var encontrado = false;

        estructura.forEach(function (cat) {
          (cat.categorias || []).forEach(function (sub) {
            (sub.productos || []).forEach(function (p) {
              if (p.id === prodId) {
                if (foto) { p.foto = foto; } else { delete p.foto; }
                encontrado = true;
              }
            });
          });
        });

        if (encontrado) {
          window.Modelo.setStockEstructura(estructura);
          if (window.renderStock) window.renderStock();
          console.log('✅ Foto de producto persistida:', foto || '(vacía)');
        }
      }, 200);
    }

    if (e.target && e.target.id === 'mc-guardar') {
      setTimeout(function () {
        var foto = window._fotoCarpetaPendiente;
        if (foto === undefined) return;
        var nombre = (document.getElementById('mc-nombre') || {}).value || '';
        nombre = nombre.trim();
        if (!nombre) return;

        var estructura = window.Modelo.getStockEstructura() || [];
        var encontrado = false;

        estructura.forEach(function (cat) {
          if (cat.nombre === nombre) {
            if (foto) { cat.foto = foto; } else { delete cat.foto; }
            encontrado = true;
          }
          (cat.categorias || []).forEach(function (sub) {
            if (sub.nombre === nombre) {
              if (foto) { sub.foto = foto; } else { delete sub.foto; }
              encontrado = true;
            }
          });
        });

        if (encontrado) {
          window.Modelo.setStockEstructura(estructura);
          if (window.renderStock) window.renderStock();
          console.log('✅ Foto de carpeta persistida:', foto || '(vacía)');
        }
      }, 200);
    }
  }, false);

  // ─────────────────────────────────────────────
  // 4. PINTAR LAS FOTOS EN LAS TARJETAS
  // ─────────────────────────────────────────────
  function pintarFotosEnTarjetas() {
    var estructura = window.Modelo.getStockEstructura() || [];
    var mapaFotos = {};  // clave: nombre → valor: foto

    estructura.forEach(function (cat) {
      if (cat.foto) mapaFotos[cat.nombre] = cat.foto;
      (cat.categorias || []).forEach(function (sub) {
        if (sub.foto) mapaFotos[sub.nombre] = sub.foto;
        (sub.productos || []).forEach(function (p) {
          if (p.foto) mapaFotos[p.nombre] = p.foto;
        });
      });
    });

    document.querySelectorAll('.tarjeta-stock').forEach(function (t) {
      var tituloEl = t.querySelector('.tarjeta-titulo');
      var iconoEl  = t.querySelector('.tarjeta-icono');
      if (!tituloEl || !iconoEl) return;

      var nombre = tituloEl.textContent.trim();
      var foto = mapaFotos[nombre];
      if (!foto) return;

      var url = BASE_URL + foto;
      var emojiBackup = iconoEl.textContent.trim();

      iconoEl.innerHTML = '<img src="' + url + '" alt="" ' +
        'style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;" ' +
        'onerror="this.parentNode.textContent=\'' + emojiBackup.replace(/'/g, "\\'") + '\';">';
    });
  }

  // Envolver renderStock (una sola vez)
  function envolverRenderStock() {
    var orig = window.renderStock;
    if (!orig) { setTimeout(envolverRenderStock, 100); return; }

    window.renderStock = function () {
      orig.apply(this, arguments);
      // Esperar a que el DOM esté pintado
      setTimeout(pintarFotosEnTarjetas, 0);
    };
  }

  // ─────────────────────────────────────────────
  // 5. ARRANCAR
  // ─────────────────────────────────────────────
  window.addEventListener('load', function () {
    envolverAbrirProducto();
    envolverAbrirCarpeta();
    envolverRenderStock();

    // Repintar por si acaso
    setTimeout(function () {
      if (window.renderStock) window.renderStock();
    }, 300);

    console.log('✅ Módulo de fotos cargado');
  });

})();
