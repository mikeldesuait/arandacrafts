/* ArandaCrafts — Arranque */

(function () {
  'use strict';

  var KEY_TEMA = 'arandacrafts:tema';

  function aplicarTema(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('btnTema');
    if (btn) btn.textContent = (t === 'dark') ? '☀️' : '🌙';
    localStorage.setItem(KEY_TEMA, t);
  }

  function initTema() {
    var guardado = localStorage.getItem(KEY_TEMA) || 'light';
    aplicarTema(guardado);
    var btn = document.getElementById('btnTema');
    if (btn) {
      btn.addEventListener('click', function () {
        var actual = document.documentElement.getAttribute('data-theme');
        aplicarTema(actual === 'dark' ? 'light' : 'dark');
      });
    }
  }

  function mostrarVista(nombre) {
    var vistas = document.querySelectorAll('.vista');
    for (var i = 0; i < vistas.length; i++) vistas[i].classList.remove('activa');

    var target = document.getElementById('vista-' + nombre);
    if (target) target.classList.add('activa');

    var botones = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < botones.length; j++) {
      botones[j].classList.toggle('activa', botones[j].dataset.vista === nombre);
    }

    location.hash = nombre;
  }

  function initNav() {
    var botones = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < botones.length; i++) {
      botones[i].addEventListener('click', function () {
        mostrarVista(this.dataset.vista);
      });
    }
    var inicial = (location.hash || '#inicio').slice(1);
    mostrarVista(inicial || 'inicio');
  }

  function initTabsCatalogo() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var grupo = this.parentElement;
        var hermanos = grupo.querySelectorAll('.tab');
        for (var j = 0; j < hermanos.length; j++) hermanos[j].classList.remove('activa');
        this.classList.add('activa');

        var cont = grupo.parentElement;
        var paneles = cont.querySelectorAll('.tab-panel');
        for (var k = 0; k < paneles.length; k++) paneles[k].classList.remove('activa');

        var panel = document.getElementById('tab-' + this.dataset.tab);
        if (panel) panel.classList.add('activa');
      });
    }
  }

  // ── Catálogo: Mano de obra / Extras ─────────────────

  var TIPOS_MANO = ['hora', 'fijo', 'unidad'];

  function opcionesTipoMano(actual) {
    return TIPOS_MANO.map(function (t) {
      var sel = (t === actual) ? ' selected' : '';
      return '<option value="' + t + '"' + sel + '>' + t + '</option>';
    }).join('');
  }

  function renderMano() {
    var tbody = document.getElementById('tbody-mano');
    if (!tbody || !window.Modelo) return;

    var lista = window.Modelo.getMano();
    tbody.innerHTML = '';

    lista.forEach(function (m) {
      var tr = document.createElement('tr');
      tr.dataset.id = m.id;

      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" value="' + escapar(m.nombre) + '"></td>' +
        '<td><select class="inp-tipo">' + opcionesTipoMano(m.tipo || 'unidad') + '</select></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + (m.precio || 0) + '"></td>' +
        '<td class="centro"><div class="acciones-fila">' +
          '<button class="btn btn-sm btn-peligro btn-borrar" title="Eliminar">🗑️</button>' +
        '</div></td>';

      tbody.appendChild(tr);
    });
  }

  function initCatalogoMano() {
    var btnNueva   = document.getElementById('btnNuevaMano');
    var btnGuardar = document.getElementById('btnGuardarMano');
    var tbody      = document.getElementById('tbody-mano');
    if (!tbody) return;

    renderMano();

    if (btnNueva) {
      btnNueva.addEventListener('click', function () {
        var tr = document.createElement('tr');
        tr.dataset.id = window.Storage.uuid();
        tr.dataset.nueva = '1';
        tr.innerHTML =
          '<td><input type="text" class="inp-nombre" placeholder="Nueva mano de obra / extra..."></td>' +
          '<td><select class="inp-tipo">' + opcionesTipoMano('unidad') + '</select></td>' +
          '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="0"></td>' +
          '<td class="centro"><div class="acciones-fila">' +
            '<button class="btn btn-sm btn-peligro btn-borrar" title="Eliminar">🗑️</button>' +
          '</div></td>';
        tbody.appendChild(tr);
        tr.querySelector('.inp-nombre').focus();
      });
    }

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-borrar');
      if (!btn) return;
      var tr = btn.closest('tr');
      if (tr) tr.remove();
    });

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function () {
        var filas = tbody.querySelectorAll('tr');
        var lista = [];
        filas.forEach(function (tr) {
          var nombre = tr.querySelector('.inp-nombre').value.trim();
          if (!nombre) return;
          var tipo = tr.querySelector('.inp-tipo').value;
          var precio = parseFloat(tr.querySelector('.inp-precio').value) || 0;
          lista.push({
            id: tr.dataset.id || window.Storage.uuid(),
            nombre: nombre,
            tipo: tipo,
            precio: Math.round(precio * 100) / 100
          });
        });

        window.Modelo.setMano(lista);
        renderMano();
        flash('Mano de obra guardada ✓');
      });
    }
  }

  // ── Catálogo: Estampación ───────────────────────────

  var UNIDADES = ['metro', 'plancha', 'ud'];

  function opcionesUnidad(actual) {
    return UNIDADES.map(function (u) {
      var sel = (u === actual) ? ' selected' : '';
      return '<option value="' + u + '"' + sel + '>' + u + '</option>';
    }).join('');
  }

  function renderEstampacion() {
    var tbody = document.getElementById('tbody-estampacion');
    if (!tbody || !window.Modelo) return;

    var lista = window.Modelo.getEstampacion();
    tbody.innerHTML = '';

    lista.forEach(function (e) {
      var tr = document.createElement('tr');
      tr.dataset.id = e.id;
      tr.dataset.grupo = e.grupo || '';

      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" value="' + escapar(e.nombre) + '"></td>' +
        '<td><select class="inp-unidad">' + opcionesUnidad(e.unidad || 'ud') + '</select></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + (e.precio || 0) + '"></td>' +
        '<td class="centro"><div class="acciones-fila">' +
          '<button class="btn btn-sm btn-peligro btn-borrar" title="Eliminar">🗑️</button>' +
        '</div></td>';

      tbody.appendChild(tr);
    });
  }

  function initCatalogoEstampacion() {
    var btnNueva   = document.getElementById('btnNuevaEstampa');
    var btnGuardar = document.getElementById('btnGuardarEstampa');
    var tbody      = document.getElementById('tbody-estampacion');
    if (!tbody) return;

    renderEstampacion();

    if (btnNueva) {
      btnNueva.addEventListener('click', function () {
        var tr = document.createElement('tr');
        tr.dataset.id = window.Storage.uuid();
        tr.dataset.nueva = '1';
        tr.innerHTML =
          '<td><input type="text" class="inp-nombre" placeholder="Nueva estampación..."></td>' +
          '<td><select class="inp-unidad">' + opcionesUnidad('ud') + '</select></td>' +
          '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="0"></td>' +
          '<td class="centro"><div class="acciones-fila">' +
            '<button class="btn btn-sm btn-peligro btn-borrar" title="Eliminar">🗑️</button>' +
          '</div></td>';
        tbody.appendChild(tr);
        tr.querySelector('.inp-nombre').focus();
      });
    }

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-borrar');
      if (!btn) return;
      var tr = btn.closest('tr');
      if (tr) tr.remove();
    });

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function () {
        var filas = tbody.querySelectorAll('tr');
        var lista = [];
        filas.forEach(function (tr) {
          var nombre = tr.querySelector('.inp-nombre').value.trim();
          if (!nombre) return;
          var unidad = tr.querySelector('.inp-unidad').value;
          var precio = parseFloat(tr.querySelector('.inp-precio').value) || 0;
          lista.push({
            id: tr.dataset.id || window.Storage.uuid(),
            nombre: nombre,
            unidad: unidad,
            precio: Math.round(precio * 100) / 100,
            grupo: tr.dataset.grupo || ''
          });
        });

        window.Modelo.setEstampacion(lista);
        renderEstampacion();
        flash('Estampación guardada ✓');
      });
    }
  }

  // ── Catálogo: Prendas ───────────────────────────────

  function renderPrendas() {
    var tbody = document.getElementById('tbody-prendas');
    if (!tbody || !window.Modelo) return;

    var prendas = window.Modelo.getPrendas();
    tbody.innerHTML = '';

    prendas.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.dataset.id = p.id;

      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" value="' + escapar(p.nombre) + '"></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + (p.precio || 0) + '"></td>' +
        '<td class="centro"><div class="acciones-fila">' +
          '<button class="btn btn-sm btn-peligro btn-borrar" title="Eliminar">🗑️</button>' +
        '</div></td>';

      tbody.appendChild(tr);
    });
  }

  function escapar(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function initCatalogoPrendas() {
    var btnNueva   = document.getElementById('btnNuevaPrenda');
    var btnGuardar = document.getElementById('btnGuardarPrendas');
    var tbody      = document.getElementById('tbody-prendas');
    if (!tbody) return;

    renderPrendas();

    if (btnNueva) {
      btnNueva.addEventListener('click', function () {
        var tr = document.createElement('tr');
        tr.dataset.id = window.Storage.uuid();
        tr.dataset.nueva = '1';
        tr.innerHTML =
          '<td><input type="text" class="inp-nombre" placeholder="Nueva prenda..."></td>' +
          '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="0"></td>' +
          '<td class="centro"><div class="acciones-fila">' +
            '<button class="btn btn-sm btn-peligro btn-borrar" title="Eliminar">🗑️</button>' +
          '</div></td>';
        tbody.appendChild(tr);
        tr.querySelector('.inp-nombre').focus();
      });
    }

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-borrar');
      if (!btn) return;
      var tr = btn.closest('tr');
      if (tr) tr.remove();
    });

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function () {
        var filas = tbody.querySelectorAll('tr');
        var lista = [];
        filas.forEach(function (tr) {
          var nombre = tr.querySelector('.inp-nombre').value.trim();
          var precio = parseFloat(tr.querySelector('.inp-precio').value) || 0;
          if (!nombre) return;
          lista.push({
            id: tr.dataset.id || window.Storage.uuid(),
            nombre: nombre,
            precio: Math.round(precio * 100) / 100
          });
        });

        window.Modelo.setPrendas(lista);
        renderPrendas();
        flash('Prendas guardadas ✓');
      });
    }
  }

  function flash(msg) {
    var st = document.getElementById('status-info');
    if (!st) return;
    var previo = st.textContent;
    st.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(function () { st.textContent = previo; }, 2000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.Modelo) window.Modelo.init();
    initTema();
    initNav();
    initTabsCatalogo();
    initCatalogoPrendas();
    initCatalogoEstampacion();
    initCatalogoMano();
    var st = document.getElementById('status-info');
    if (st) st.textContent = 'ArandaCrafts · v0.1 · ' + new Date().toLocaleDateString('es-ES');
  });

})();
