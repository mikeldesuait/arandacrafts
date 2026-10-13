/* ArandaCrafts — Arranque y lógica de la app
   (versión limpia, sin duplicados)
*/

(function () {
  'use strict';

  var KEY_TEMA = 'arandacrafts:tema';

  // ═══════════════════════════════════════════════════
  // TEMA
  // ═══════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════
  // NAVEGACIÓN
  // ═══════════════════════════════════════════════════

  function mostrarVista(nombre) {
    document.querySelectorAll('.vista').forEach(function (v) { v.classList.remove('activa'); });
    var target = document.getElementById('vista-' + nombre);
    if (target) target.classList.add('activa');

    document.querySelectorAll('.nav-btn').forEach(function (b) {
      b.classList.toggle('activa', b.dataset.vista === nombre);
    });

    location.hash = nombre;
    if (nombre === 'inicio' && typeof renderInicio === 'function') renderInicio();
  }

  function initNav() {
    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        mostrarVista(this.dataset.vista);
        // Cerrar el menú hamburguesa tras elegir en móvil
        document.querySelector('.topbar-nav')?.classList.remove('abierto');
      });
    });

    // Botón hamburguesa
    var btnMenu = document.getElementById('btnMenu');
    if (btnMenu) {
      btnMenu.addEventListener('click', function () {
        document.querySelector('.topbar-nav')?.classList.toggle('abierto');
      });
    }

    var inicial = (location.hash || '#inicio').slice(1);
    mostrarVista(inicial || 'inicio');
  }

  function initTabsCatalogo() {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var grupo = this.parentElement;
        grupo.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('activa'); });
        this.classList.add('activa');

        var cont = grupo.parentElement;
        cont.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('activa'); });
        var panel = document.getElementById('tab-' + this.dataset.tab);
        if (panel) panel.classList.add('activa');
      });
    });
  }

  // ═══════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════

  function escapar(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function eur(n) {
    var v = parseFloat(n) || 0;
    return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function flash(msg) {
    var st = document.getElementById('status-info');
    if (!st) return;
    var previo = st.textContent;
    st.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(function () { st.textContent = previo; }, 2000);
  }

  function toast(msg, tipo) {
    var el = document.getElementById('toast-global');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-global';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'toast' + (tipo === 'error' ? ' error' : '');
    // Forzar reflow para reiniciar la transición si se llama varias veces seguidas
    void el.offsetWidth;
    el.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('visible'); }, 2200);
  }

  // Feedback visual de un botón: "✓ Guardado" durante 1,5 s
  function marcarGuardado(btn, texto) {
    if (!btn) return;
    var original = btn.innerHTML;
    var clases = btn.className;
    btn.classList.add('guardado');
    btn.innerHTML = texto || '✓ Guardado';
    setTimeout(function () {
      btn.className = clases.replace(/\bguardado\b/g, '').trim();
      btn.innerHTML = original;
    }, 1500);
  }

  function hoyISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function opcionesUnidad(actual) {
    var UNIDADES = ['ud', 'metro', 'plancha', 'hoja', 'kg'];
    return UNIDADES.map(function (u) {
      return '<option value="' + u + '"' + (u === actual ? ' selected' : '') + '>' + u + '</option>';
    }).join('');
  }

  // ═══════════════════════════════════════════════════
  // CATÁLOGO — ROPA
  // ═══════════════════════════════════════════════════

  function renderRopa() {
    var tbody = document.getElementById('tbody-ropa');
    if (!tbody || !window.Modelo) return;
    tbody.innerHTML = '';
    window.Modelo.getRopa().forEach(function (p) {
      var tr = document.createElement('tr');
      tr.dataset.id = p.id;
      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" value="' + escapar(p.nombre) + '"></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + (p.precio || 0) + '"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
      tbody.appendChild(tr);
    });
  }

  function initCatalogoRopa() {
    var tbody = document.getElementById('tbody-ropa');
    if (!tbody) return;
    renderRopa();

    document.getElementById('btnNuevaRopa')?.addEventListener('click', function () {
      var tr = document.createElement('tr');
      tr.dataset.id = window.Storage.uuid();
      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" placeholder="Nueva prenda..."></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="0"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
      tbody.appendChild(tr);
      tr.querySelector('.inp-nombre').focus();
    });

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-borrar');
      if (btn) btn.closest('tr').remove();
    });

    document.getElementById('btnGuardarRopa')?.addEventListener('click', function () {
      var lista = [];
      tbody.querySelectorAll('tr').forEach(function (tr) {
        var nombre = tr.querySelector('.inp-nombre').value.trim();
        if (!nombre) return;
        lista.push({
          id: tr.dataset.id || window.Storage.uuid(),
          nombre: nombre,
          unidad: 'ud',
          precio: Math.round((parseFloat(tr.querySelector('.inp-precio').value) || 0) * 100) / 100
        });
      });
      window.Modelo.setRopa(lista);
      renderRopa();
      flash('Ropa guardada ✓');
      toast('Ropa guardada');
      marcarGuardado(document.getElementById('btnGuardarRopa'));
    });
  }

  // ═══════════════════════════════════════════════════
  // CATÁLOGO — MATERIALES (Vinilos / DTF / Sublimación)
  // ═══════════════════════════════════════════════════

  var SUBCATS = [
    { key: 'vinilos',     get: 'getVinilos',     set: 'setVinilos',     tbody: 'tbody-vinilos' },
    { key: 'dtf',         get: 'getDtf',         set: 'setDtf',         tbody: 'tbody-dtf' },
    { key: 'sublimacion', get: 'getSublimacion', set: 'setSublimacion', tbody: 'tbody-sublimacion' }
  ];

  function renderSubcatMaterial(sc) {
    var tbody = document.getElementById(sc.tbody);
    if (!tbody || !window.Modelo) return;
    tbody.innerHTML = '';
    window.Modelo[sc.get]().forEach(function (m) {
      var tr = document.createElement('tr');
      tr.dataset.id = m.id;
      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" value="' + escapar(m.nombre) + '"></td>' +
        '<td><select class="inp-unidad">' + opcionesUnidad(m.unidad || 'ud') + '</select></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + (m.precio || 0) + '"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
      tbody.appendChild(tr);
    });
  }

  function renderMateriales() {
    SUBCATS.forEach(renderSubcatMaterial);
  }

  function initCatalogoMateriales() {
    if (!document.getElementById('tbody-vinilos')) return;
    renderMateriales();

    document.querySelectorAll('[data-add-subcat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sc = SUBCATS.find(function (x) { return x.key === btn.dataset.addSubcat; });
        if (!sc) return;
        var tbody = document.getElementById(sc.tbody);
        var tr = document.createElement('tr');
        tr.dataset.id = window.Storage.uuid();
        tr.innerHTML =
          '<td><input type="text" class="inp-nombre" placeholder="Nuevo material..."></td>' +
          '<td><select class="inp-unidad">' + opcionesUnidad('ud') + '</select></td>' +
          '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="0"></td>' +
          '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
        tbody.appendChild(tr);
        tr.querySelector('.inp-nombre').focus();
      });
    });

    SUBCATS.forEach(function (sc) {
      var tbody = document.getElementById(sc.tbody);
      if (!tbody) return;
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-borrar');
        if (btn) btn.closest('tr').remove();
      });
    });

    document.getElementById('btnGuardarMateriales')?.addEventListener('click', function () {
      SUBCATS.forEach(function (sc) {
        var tbody = document.getElementById(sc.tbody);
        var lista = [];
        tbody.querySelectorAll('tr').forEach(function (tr) {
          var nombre = tr.querySelector('.inp-nombre').value.trim();
          if (!nombre) return;
          lista.push({
            id: tr.dataset.id || window.Storage.uuid(),
            nombre: nombre,
            unidad: tr.querySelector('.inp-unidad').value,
            precio: Math.round((parseFloat(tr.querySelector('.inp-precio').value) || 0) * 100) / 100
          });
        });
        window.Modelo[sc.set](lista);
      });
      renderMateriales();
      flash('Materiales guardados ✓');
      toast('Materiales guardados');
      marcarGuardado(document.getElementById('btnGuardarMateriales'));
    });
  }

  // ═══════════════════════════════════════════════════
  // CATÁLOGO — MANO DE OBRA / EXTRAS
  // ═══════════════════════════════════════════════════

  var TIPOS_MANO = ['hora', 'fijo', 'unidad'];

  function opcionesTipoMano(actual) {
    return TIPOS_MANO.map(function (t) {
      return '<option value="' + t + '"' + (t === actual ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
  }

  function renderMano() {
    var tbody = document.getElementById('tbody-mano');
    if (!tbody || !window.Modelo) return;
    tbody.innerHTML = '';
    window.Modelo.getMano().forEach(function (m) {
      var tr = document.createElement('tr');
      tr.dataset.id = m.id;
      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" value="' + escapar(m.nombre) + '"></td>' +
        '<td><select class="inp-tipo">' + opcionesTipoMano(m.tipo || 'unidad') + '</select></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + (m.precio || 0) + '"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
      tbody.appendChild(tr);
    });
  }

  function initCatalogoMano() {
    var tbody = document.getElementById('tbody-mano');
    if (!tbody) return;
    renderMano();

    document.getElementById('btnNuevaMano')?.addEventListener('click', function () {
      var tr = document.createElement('tr');
      tr.dataset.id = window.Storage.uuid();
      tr.innerHTML =
        '<td><input type="text" class="inp-nombre" placeholder="Nueva mano de obra..."></td>' +
        '<td><select class="inp-tipo">' + opcionesTipoMano('unidad') + '</select></td>' +
        '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="0"></td>' +
        '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar">🗑️</button></td>';
      tbody.appendChild(tr);
      tr.querySelector('.inp-nombre').focus();
    });

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-borrar');
      if (btn) btn.closest('tr').remove();
    });

    document.getElementById('btnGuardarMano')?.addEventListener('click', function () {
      var lista = [];
      tbody.querySelectorAll('tr').forEach(function (tr) {
        var nombre = tr.querySelector('.inp-nombre').value.trim();
        if (!nombre) return;
        lista.push({
          id: tr.dataset.id || window.Storage.uuid(),
          nombre: nombre,
          tipo: tr.querySelector('.inp-tipo').value,
          precio: Math.round((parseFloat(tr.querySelector('.inp-precio').value) || 0) * 100) / 100
        });
      });
      window.Modelo.setMano(lista);
      renderMano();
      flash('Mano de obra guardada ✓');
      toast('Mano de obra guardada');
      marcarGuardado(document.getElementById('btnGuardarMano'));
    });
  }

  // ═══════════════════════════════════════════════════
  // PRESUPUESTOS — Editor + Listado
  // ═══════════════════════════════════════════════════

  var presuActual = null;

  function totalLineas() {
    var t = 0;
    document.querySelectorAll('.tabla-lineas tbody tr').forEach(function (tr) {
      var c = parseFloat(tr.querySelector('.inp-cantidad')?.value) || 0;
      var p = parseFloat(tr.querySelector('.inp-precio')?.value) || 0;
      t += c * p;
    });
    return Math.round(t * 100) / 100;
  }

  function actualizarTotalPresu() {
    var el = document.getElementById('presu-total');
    if (el) el.textContent = eur(totalLineas());
  }

  function recalcularFila(tr) {
    var c = parseFloat(tr.querySelector('.inp-cantidad').value) || 0;
    var p = parseFloat(tr.querySelector('.inp-precio').value) || 0;
    var sub = Math.round(c * p * 100) / 100;
    tr.querySelector('.subtotal').textContent = eur(sub);
  }

  function crearFilaLinea(grupo, datos) {
    datos = datos || {};
    var tr = document.createElement('tr');
    tr.dataset.grupo = grupo;

    var concepto = datos.concepto || '';
    var cantidad = (datos.cantidad != null) ? datos.cantidad : 1;
    var precio   = (datos.precio != null) ? datos.precio : 0;
    var unidad   = datos.unidad || '';
    var tipo     = datos.tipo   || '';

    var html = '';
    html += '<td><input type="text" class="inp-concepto" value="' + escapar(concepto) + '" placeholder="Concepto..."></td>';
    html += '<td><input type="number" step="0.01" min="0" class="inp-cantidad num" value="' + cantidad + '"></td>';

    if (grupo === 'material') {
      html += '<td><input type="text" class="inp-unidad" value="' + escapar(unidad || 'ud') + '"></td>';
    }
    if (grupo === 'mano') {
      html += '<td><input type="text" class="inp-tipo" value="' + escapar(tipo || 'unidad') + '"></td>';
    }

    html += '<td><input type="number" step="0.01" min="0" class="inp-precio num" value="' + precio + '"></td>';
    html += '<td class="derecha subtotal mono">0,00 €</td>';
    html += '<td class="centro"><button class="btn btn-sm btn-peligro btn-borrar-linea">🗑️</button></td>';

    tr.innerHTML = html;
    tr.dataset.idRef = datos.idRef || '';

    tr.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        recalcularFila(tr);
        actualizarTotalPresu();
      });
    });
    tr.querySelector('.btn-borrar-linea').addEventListener('click', function () {
      tr.remove();
      actualizarTotalPresu();
    });

    recalcularFila(tr);
    return tr;
  }

  // ── Modal selector de catálogo ─────────────────────

  var modalCtx = null; // { grupo: 'ropa'|'material'|'mano'|null, cat: 'ropa'|'vinilos'|... }

  function abrirModal(grupo, catInicial) {
    modalCtx = { grupo: grupo, cat: catInicial || 'ropa' };
    var modal = document.getElementById('modal-catalogo');
    if (!modal) return;
    modal.hidden = false;
    document.getElementById('modal-buscar').value = '';
    activarTabModal(modalCtx.cat);
    pintarListaModal();
    setTimeout(function () {
      document.getElementById('modal-buscar').focus();
    }, 50);
  }

  function cerrarModal() {
    var modal = document.getElementById('modal-catalogo');
    if (modal) modal.hidden = true;
    modalCtx = null;
  }

  function activarTabModal(cat) {
    document.querySelectorAll('#modal-tabs .mtab').forEach(function (t) {
      t.classList.toggle('activa', t.dataset.cat === cat);
    });
    if (modalCtx) modalCtx.cat = cat;
  }

  function itemsModal(cat) {
    if (cat === 'ropa')        return window.Modelo.getRopa();
    if (cat === 'vinilos')     return window.Modelo.getVinilos();
    if (cat === 'dtf')         return window.Modelo.getDtf();
    if (cat === 'sublimacion') return window.Modelo.getSublimacion();
    if (cat === 'mano')        return window.Modelo.getMano();
    return [];
  }

  function pintarListaModal() {
    var ul = document.getElementById('modal-lista');
    if (!ul || !modalCtx) return;

    var filtro = (document.getElementById('modal-buscar').value || '').toLowerCase();
    var lista = itemsModal(modalCtx.cat).filter(function (it) {
      return !filtro || (it.nombre || '').toLowerCase().indexOf(filtro) >= 0;
    });

    ul.innerHTML = '';

    if (!lista.length) {
      var li = document.createElement('li');
      li.className = 'vacio';
      li.textContent = 'Sin resultados';
      ul.appendChild(li);
      return;
    }

    lista.forEach(function (it) {
      var li = document.createElement('li');
      var unidad = it.unidad ? '<span class="unidad">' + escapar(it.unidad) + '</span>' : '';
      if (!unidad && it.tipo) unidad = '<span class="unidad">' + escapar(it.tipo) + '</span>';
      li.innerHTML =
        '<span class="nombre">' + escapar(it.nombre) + unidad + '</span>' +
        '<span class="precio">' + eur(it.precio) + '</span>';
      li.addEventListener('click', function () {
        aplicarSeleccion(it);
      });
      ul.appendChild(li);
    });
  }

  function aplicarSeleccion(item) {
    if (!modalCtx) return;
    var cat = modalCtx.cat;

    // Traducir catálogo elegido al grupo del presupuesto:
    // ropa → grupo "ropa"
    // vinilos/dtf/sublimacion → grupo "material" (con su unidad)
    // mano → grupo "mano"
    var grupo;
    if (cat === 'ropa')        grupo = 'ropa';
    else if (cat === 'mano')   grupo = 'mano';
    else                       grupo = 'material';

    var datos = {
      idRef:    item.id,
      concepto: item.nombre,
      cantidad: 1,
      precio:   item.precio
    };
    if (grupo === 'material') datos.unidad = item.unidad || 'ud';
    if (grupo === 'mano')     datos.tipo   = item.tipo   || 'unidad';

    var tbody = document.getElementById('lineas-' + grupo);
    if (!tbody) { cerrarModal(); return; }

    tbody.appendChild(crearFilaLinea(grupo, datos));
    actualizarTotalPresu();

    // Feedback: dejamos el modal abierto para añadir más, así el usuario va rápido.
    // (si prefieres cerrarlo, descomenta la siguiente línea)
    // cerrarModal();
  }

  function initModalCatalogo() {
    document.getElementById('modal-cerrar')?.addEventListener('click', cerrarModal);
    document.getElementById('modal-catalogo')?.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay')) cerrarModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('modal-catalogo')?.hidden) cerrarModal();
    });
    document.querySelectorAll('#modal-tabs .mtab').forEach(function (t) {
      t.addEventListener('click', function () {
        activarTabModal(t.dataset.cat);
        pintarListaModal();
        document.getElementById('modal-buscar').focus();
      });
    });
    document.getElementById('modal-buscar')?.addEventListener('input', pintarListaModal);
  }

  function cargarEnEditor(presu) {
    presuActual = presu;

    document.getElementById('presu-tipo').value        = presu.tipo || 'presupuesto';
    document.getElementById('presu-numero').value      = presu.numero || '';
    document.getElementById('presu-fecha').value       = presu.fecha || hoyISO();
    document.getElementById('presu-cliente').value     = (presu.cliente && presu.cliente.nombre) || '';
    document.getElementById('presu-contacto').value    = (presu.cliente && presu.cliente.contacto) || '';
    document.getElementById('presu-descripcion').value = presu.descripcion || '';
    document.getElementById('presu-notas').value       = presu.notas || '';
    document.getElementById('presu-estado').value      = presu.estado || 'borrador';

    ['ropa', 'material', 'mano'].forEach(function (g) {
      var tb = document.getElementById('lineas-' + g);
      if (tb) tb.innerHTML = '';
    });

    (presu.lineas || []).forEach(function (l) {
      var tb = document.getElementById('lineas-' + l.grupo);
      if (tb) tb.appendChild(crearFilaLinea(l.grupo, l));
    });

    actualizarTotalPresu();
    document.getElementById('presu-listado').style.display = 'none';
    document.getElementById('presu-editor').style.display  = '';
  }

  function volverAlListado() {
    presuActual = null;
    document.getElementById('presu-editor').style.display  = 'none';
    document.getElementById('presu-listado').style.display = '';
    renderListadoPresupuestos();
  }

  function recogerPresupuesto() {
    var tipo   = document.getElementById('presu-tipo').value || 'presupuesto';
    var numero = document.getElementById('presu-numero').value;
    var fecha  = document.getElementById('presu-fecha').value || hoyISO();
    var cliente = {
      nombre:   document.getElementById('presu-cliente').value.trim(),
      contacto: document.getElementById('presu-contacto').value.trim()
    };

    var lineas = [];
    ['ropa', 'material', 'mano'].forEach(function (g) {
      var tb = document.getElementById('lineas-' + g);
      if (!tb) return;
      tb.querySelectorAll('tr').forEach(function (tr) {
        var concepto = tr.querySelector('.inp-concepto').value.trim();
        if (!concepto) return;
        var l = {
          grupo:    g,
          idRef:    tr.dataset.idRef || '',
          concepto: concepto,
          cantidad: parseFloat(tr.querySelector('.inp-cantidad').value) || 0,
          precio:   parseFloat(tr.querySelector('.inp-precio').value) || 0
        };
        if (g === 'material') l.unidad = tr.querySelector('.inp-unidad').value;
        if (g === 'mano')     l.tipo   = tr.querySelector('.inp-tipo').value;
        lineas.push(l);
      });
    });

    return {
      id:          presuActual && presuActual.id ? presuActual.id : window.Storage.uuid(),
      tipo:        tipo,
      numero:      numero,
      fecha:       fecha,
      cliente:     cliente,
      descripcion: document.getElementById('presu-descripcion').value.trim(),
      notas:       document.getElementById('presu-notas').value.trim(),
      estado:      document.getElementById('presu-estado').value,
      lineas:      lineas
    };
  }

  function guardarPresupuesto() {
    var p = recogerPresupuesto();
    if (!p.cliente.nombre) { alert('Pon al menos el nombre del cliente.'); return; }

    var lista = window.Modelo.getPresupuestos();
    var idx = lista.findIndex(function (x) { return x.id === p.id; });
    if (idx >= 0) lista[idx] = p; else lista.push(p);

    window.Modelo.setPresupuestos(lista);
    flash('Presupuesto ' + p.numero + ' guardado ✓');
    toast('Presupuesto ' + p.numero + ' guardado');
    volverAlListado();
  }

  function eliminarPresupuesto() {
    if (!presuActual || !presuActual.id) { volverAlListado(); return; }
    if (!confirm('¿Eliminar el presupuesto ' + presuActual.numero + '?')) return;

    var lista = window.Modelo.getPresupuestos().filter(function (x) { return x.id !== presuActual.id; });
    window.Modelo.setPresupuestos(lista);
    flash('Presupuesto eliminado');
    volverAlListado();
  }

  function renderListadoPresupuestos() {
    var lista = window.Modelo.getPresupuestos();
    var tabla = document.getElementById('presu-tabla');
    var vacio = document.getElementById('presu-vacio');
    var tbody = document.getElementById('tbody-presupuestos');
    if (!tbody) return;

    if (!lista.length) {
      tabla.style.display = 'none';
      vacio.style.display = '';
      return;
    }
    tabla.style.display = '';
    vacio.style.display = 'none';

    tbody.innerHTML = '';
    lista
      .slice()
      .sort(function (a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); })
      .forEach(function (p) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + escapar((p.tipo || 'presupuesto').charAt(0).toUpperCase() + (p.tipo || 'presupuesto').slice(1)) + '</td>' +
          '<td>' + escapar(p.numero) + '</td>' +
          '<td>' + escapar(p.fecha) + '</td>' +
          '<td>' + escapar(p.cliente && p.cliente.nombre || '') + '</td>' +
          '<td class="derecha mono">' + eur(window.Modelo.totalPresupuesto(p)) + '</td>' +
          '<td>' + escapar(p.estado) + '</td>' +
          '<td class="centro">' +
            '<button class="btn btn-sm btn-editar">✏️</button> ' +
            '<button class="btn btn-sm btn-duplicar">📄</button> ' +
            '<button class="btn btn-sm btn-peligro btn-eliminar">🗑️</button>' +
          '</td>';

        tr.querySelector('.btn-editar').addEventListener('click', function () { cargarEnEditor(p); });
        tr.querySelector('.btn-duplicar').addEventListener('click', function () {
          var copia = JSON.parse(JSON.stringify(p));
          copia.id     = window.Storage.uuid();
          copia.numero = window.Modelo.siguienteNumero(copia.tipo || 'presupuesto');
          copia.fecha  = hoyISO();
          copia.estado = 'borrador';
          var l = window.Modelo.getPresupuestos(); l.push(copia);
          window.Modelo.setPresupuestos(l);
          renderListadoPresupuestos();
          flash('Duplicado como ' + copia.numero);
        });
        tr.querySelector('.btn-eliminar').addEventListener('click', function () {
          if (!confirm('¿Eliminar ' + p.numero + '?')) return;
          var l = window.Modelo.getPresupuestos().filter(function (x) { return x.id !== p.id; });
          window.Modelo.setPresupuestos(l);
          renderListadoPresupuestos();
          flash('Presupuesto eliminado');
        });
        tbody.appendChild(tr);
      });
  }

  function nuevoPresupuesto() {
    cargarEnEditor({
      id: null,
      tipo: 'presupuesto',
      numero: window.Modelo.siguienteNumero('presupuesto'),
      fecha: hoyISO(),
      cliente: { nombre: '', contacto: '' },
      descripcion: '', notas: '', estado: 'borrador', lineas: []
    });
    document.getElementById('presu-cliente').focus();
  }

  // ── Impresión / PDF ─────────────────────────────────

  function imprimirPresupuesto() {
    if (!presuActual) {
      alert('Guarda primero el presupuesto.');
      return;
    }
    var p = recogerPresupuesto();
    if (!p.numero) p.numero = presuActual.numero || window.Modelo.siguienteNumero(p.tipo);

    var em = window.Modelo.getEmisor();

    // Agrupar líneas
    var grupos = { ropa: [], material: [], mano: [] };
    p.lineas.forEach(function (l) {
      if (grupos[l.grupo]) grupos[l.grupo].push(l);
    });

    function filasGrupo(titulo, lineas) {
      if (!lineas.length) return '';
      var html = '<tr class="fila-grupo"><td colspan="4">' + titulo + '</td></tr>';
      lineas.forEach(function (l) {
        var extra = '';
        if (l.grupo === 'material' && l.unidad) extra = ' <small>(' + escapar(l.unidad) + ')</small>';
        if (l.grupo === 'mano' && l.tipo)       extra = ' <small>(' + escapar(l.tipo)   + ')</small>';
        html +=
          '<tr>' +
            '<td>' + escapar(l.concepto) + extra + '</td>' +
            '<td class="num">' + (l.cantidad || 0) + '</td>' +
            '<td class="num">' + eur(l.precio) + '</td>' +
            '<td class="num">' + eur((parseFloat(l.cantidad) || 0) * (parseFloat(l.precio) || 0)) + '</td>' +
          '</tr>';
      });
      return html;
    }

    var total = window.Modelo.totalPresupuesto(p);

    // Datos fiscales
    var fiscal = '';
    if (em.nombre || em.nif || em.direccion || em.telefono || em.email) {
      fiscal =
        '<div class="pr-fiscal">' +
          (em.nombre    ? '<span class="pr-titular">' + escapar(em.nombre) + '</span>' : '') +
          (em.nif       ? ' · NIF ' + escapar(em.nif) : '') +
          (em.direccion ? '<br>' + escapar(em.direccion) : '') +
          (em.telefono || em.email ? '<br>' : '') +
          (em.telefono  ? 'Tel: ' + escapar(em.telefono) : '') +
          (em.telefono && em.email ? ' · ' : '') +
          (em.email     ? escapar(em.email) : '') +
          (em.web       ? ' · ' + escapar(em.web) : '') +
          (em.iban      ? '<br>IBAN: ' + escapar(em.iban) : '') +
        '</div>';
    }

    var cuerpo =
      '<div class="pr-cabecera">' +
        '<div class="pr-marca">' +
          '<h1>' + escapar(em.marca || 'Aranda Crafts') + '</h1>' +
          (em.eslogan ? '<div class="pr-eslogan">' + escapar(em.eslogan) + '</div>' : '') +
        '</div>' +
        '<div class="pr-doc">' +
          '<div class="pr-tipo">' + window.Modelo.etiquetaDeTipo(p.tipo) + '</div>' +
          '<div class="pr-num">' + escapar(p.numero) + '</div>' +
          '<div class="pr-fecha">Fecha: ' + escapar(p.fecha) + '</div>' +
        '</div>' +
      '</div>' +
      fiscal +
      '<div class="pr-cliente">' +
        '<strong>Cliente:</strong> ' + escapar(p.cliente.nombre || '') +
        (p.cliente.contacto ? ' · ' + escapar(p.cliente.contacto) : '') +
        (p.descripcion ? '<br><strong>Trabajo:</strong> ' + escapar(p.descripcion) : '') +
      '</div>' +
      '<table class="pr-tabla">' +
        '<thead>' +
          '<tr>' +
            '<th>Concepto</th>' +
            '<th class="num">Cant.</th>' +
            '<th class="num">Precio</th>' +
            '<th class="num">Subtotal</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          filasGrupo('👕 Ropa', grupos.ropa) +
          filasGrupo('📦 Materiales', grupos.material) +
          filasGrupo('🛠️ Mano de obra / Extras', grupos.mano) +
        '</tbody>' +
      '</table>' +
      '<div class="pr-total">TOTAL: ' + eur(total) + '</div>' +
      (p.notas ? '<div class="pr-notas"><strong>Notas:</strong> ' + escapar(p.notas) + '</div>' : '') +
      '<div class="pr-pie">Presupuesto válido 30 días. Los precios no incluyen IVA salvo indicación contraria.</div>';

    var css = `
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        color: #111; font-size: 11pt; line-height: 1.4;
        padding: 1.6cm 1.4cm;
      }
      .pr-cabecera {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 2rem; padding-bottom: .6rem; border-bottom: 3px solid #111;
        margin-bottom: .5rem;
      }
      .pr-marca h1 { margin: 0; font-size: 1.9rem; letter-spacing: -.02em; font-weight: 800; }
      .pr-eslogan { font-size: .85rem; color: #555; margin-top: .15rem; }
      .pr-doc { text-align: right; white-space: nowrap; }
      .pr-tipo { font-size: .8rem; letter-spacing: .15em; color: #333; font-weight: 700; }
      .pr-num { font-size: 1.25rem; font-weight: 700; margin: .15rem 0 .3rem; }
      .pr-fecha { font-size: .9rem; color: #333; }
      .pr-fiscal {
        font-size: .78rem; color: #555; line-height: 1.35;
        padding-bottom: .8rem; margin-bottom: .8rem;
        border-bottom: 1px dashed #bbb;
      }
      .pr-fiscal .pr-titular { color: #222; font-weight: 600; }
      .pr-cliente {
        background: #f4f4f4; padding: .7rem 1rem; border-radius: 6px;
        margin-bottom: 1rem; font-size: .95rem;
      }
      .pr-tabla { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: .95rem; }
      .pr-tabla th, .pr-tabla td {
        padding: .5rem .6rem; border-bottom: 1px solid #ccc;
        text-align: left; vertical-align: top;
      }
      .pr-tabla th {
        background: #222; color: #fff; font-size: .8rem; letter-spacing: .05em;
        border-bottom: none;
      }
      .pr-tabla th.num, .pr-tabla td.num { text-align: right; }
      .pr-tabla tr.fila-grupo td {
        background: #eee; font-weight: 700; font-size: .9rem;
        border-bottom: 1px solid #999;
      }
      .pr-tabla small { font-size: .8rem; color: #666; }
      .pr-total {
        text-align: right; font-size: 1.4rem; font-weight: 700;
        margin: .5rem 0 1.5rem; padding-top: .6rem; border-top: 2px solid #000;
      }
      .pr-notas {
        font-size: .9rem; background: #f9f9f9; padding: .6rem .9rem;
        border-left: 3px solid #999; margin-bottom: 1rem;
      }
      .pr-pie {
        font-size: .75rem; color: #666; text-align: center;
        border-top: 1px solid #ccc; padding-top: .6rem; margin-top: 1.5rem;
      }
      @page { size: A4 portrait; margin: 0; }
      @media print { body { padding: 1.6cm 1.4cm; } }
    `;

    var html =
      '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
      '<title>' + window.Modelo.etiquetaDeTipo(p.tipo) + ' ' + escapar(p.numero) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">' +
      '<style>' + css + '</style>' +
      '</head><body>' + cuerpo +
      '<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script>' +
      '</body></html>';

    var w = window.open('', '_blank');
    if (!w) {
      alert('Permite las ventanas emergentes para poder imprimir.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }



  function initPresupuestos() {
    document.getElementById('btnNuevoPresupuesto')?.addEventListener('click', nuevoPresupuesto);
    document.getElementById('btnGuardarPresupuesto')?.addEventListener('click', guardarPresupuesto);
    document.getElementById('btnImprimirPresupuesto')?.addEventListener('click', imprimirPresupuesto);

    // Al cambiar el tipo, recalcular número (solo si es nuevo)
    document.getElementById('presu-tipo')?.addEventListener('change', function (e) {
      if (presuActual && presuActual.id) return; // no tocar el número de uno guardado
      var tipo = e.target.value;
      document.getElementById('presu-numero').value = window.Modelo.siguienteNumero(tipo);
    });
    document.getElementById('btnEliminarPresupuesto')?.addEventListener('click', eliminarPresupuesto);
    document.getElementById('btnVolverListado')?.addEventListener('click', function () {
      if (presuActual && presuActual.id && !confirm('¿Salir sin guardar los cambios?')) return;
      volverAlListado();
    });

    document.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.dataset.add;            // 'ropa' | 'material' | 'mano'
        var catInicial = (g === 'material') ? 'vinilos' : g;
        abrirModal(g, catInicial);
      });
    });

    renderListadoPresupuestos();
  }

  // ═══════════════════════════════════════════════════
  // AJUSTES
  // ═══════════════════════════════════════════════════

  function cargarAjustesEnForm() {
    var em = window.Modelo.getEmisor();
    document.getElementById('aj-marca').value     = em.marca     || 'Aranda Crafts';
    document.getElementById('aj-eslogan').value   = em.eslogan   || 'Estampación textil · Vinilo · DTF';
    document.getElementById('aj-nombre').value    = em.nombre    || '';
    document.getElementById('aj-nif').value       = em.nif       || '';
    document.getElementById('aj-direccion').value = em.direccion || '';
    document.getElementById('aj-telefono').value  = em.telefono  || '';
    document.getElementById('aj-email').value     = em.email     || '';
    document.getElementById('aj-web').value       = em.web       || '';
    document.getElementById('aj-iban').value      = em.iban      || '';

    var tema = localStorage.getItem(KEY_TEMA) || 'light';
    document.getElementById('aj-tema').value = tema;

    refrescarInfoAjustes();
  }

  function refrescarInfoAjustes() {
    var presu = window.Modelo.getPresupuestos().length;
    var mats  = window.Modelo.getMateriales().length;
    var ropa  = window.Modelo.getRopa().length;
    var mano  = window.Modelo.getMano().length;

    document.getElementById('aj-info-presu').textContent      = presu;
    document.getElementById('aj-info-materiales').textContent = mats;
    document.getElementById('aj-info-ropa').textContent       = ropa;
    document.getElementById('aj-info-mano').textContent       = mano;

    var bytes = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('arandacrafts:') === 0) {
        bytes += (k.length + (localStorage.getItem(k) || '').length) * 2;
      }
    }
    var kb = (bytes / 1024).toFixed(1);
    document.getElementById('aj-info-espacio').textContent = kb + ' KB';

    var ultima = localStorage.getItem('arandacrafts:ultima-export');
    document.getElementById('aj-ultima-export').textContent = ultima || '—';
  }

  function guardarAjustesEmisor() {
    var em = {
      marca:     document.getElementById('aj-marca').value.trim(),
      eslogan:   document.getElementById('aj-eslogan').value.trim(),
      nombre:    document.getElementById('aj-nombre').value.trim(),
      nif:       document.getElementById('aj-nif').value.trim(),
      direccion: document.getElementById('aj-direccion').value.trim(),
      telefono:  document.getElementById('aj-telefono').value.trim(),
      email:     document.getElementById('aj-email').value.trim(),
      web:       document.getElementById('aj-web').value.trim(),
      iban:      document.getElementById('aj-iban').value.trim()
    };
    window.Modelo.setEmisor(em);
    flash('Datos del emisor guardados ✓');
    toast('Datos del emisor guardados');
    marcarGuardado(document.getElementById('aj-guardar-emisor'));
  }

  function exportarBackup() {
    var backup = {
      _meta: {
        app: 'ArandaCrafts',
        version: 1,
        fecha: new Date().toISOString()
      },
      tema: localStorage.getItem(KEY_TEMA) || 'light',
      emisor:       window.Modelo.getEmisor(),
      ropa:         window.Modelo.getRopa(),
      vinilos:      window.Modelo.getVinilos(),
      dtf:          window.Modelo.getDtf(),
      sublimacion:  window.Modelo.getSublimacion(),
      mano:         window.Modelo.getMano(),
      presupuestos: window.Modelo.getPresupuestos(),
      contador:     JSON.parse(localStorage.getItem('arandacrafts:contador') || '{}')
    };

    var json = JSON.stringify(backup, null, 2);
    var blob = new Blob([json], { type: 'application/json' });

    var hoy = new Date();
    var nombre = 'arandacrafts-backup-' +
      hoy.getFullYear() + '-' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoy.getDate()).padStart(2, '0') + '.json';

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);

    var sello = hoy.toLocaleString('es-ES');
    localStorage.setItem('arandacrafts:ultima-export', sello);
    refrescarInfoAjustes();
    flash('Backup exportado ✓');
    toast('Backup exportado');
  }

  function importarBackup(file) {
    if (!file) return;
    if (!confirm('Esto reemplazará TODOS tus datos actuales. ¿Continuar?')) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
      } catch (err) {
        alert('El archivo no es un JSON válido.');
        return;
      }

      // Emisor
      if (data.emisor) window.Modelo.setEmisor(data.emisor);

      // Catálogos
      if (data.ropa)        window.Modelo.setRopa(data.ropa);
      if (data.vinilos)     window.Modelo.setVinilos(data.vinilos);
      if (data.dtf)         window.Modelo.setDtf(data.dtf);
      if (data.sublimacion) window.Modelo.setSublimacion(data.sublimacion);
      if (data.mano)        window.Modelo.setMano(data.mano);

      // Presupuestos y contador
      if (data.presupuestos) window.Modelo.setPresupuestos(data.presupuestos);
      if (data.contador)     localStorage.setItem('arandacrafts:contador', JSON.stringify(data.contador));

      // Tema
      if (data.tema) {
        localStorage.setItem(KEY_TEMA, data.tema);
        aplicarTema(data.tema);
      }

      flash('Backup importado. Recargando...');
      setTimeout(function () { location.reload(); }, 800);
    };
    reader.readAsText(file);
  }

  function borrarTodoDatos() {
    if (!confirm('⚠️ Se borrarán TODOS los datos (catálogos, presupuestos, emisor...). ¿Continuar?')) return;

    var palabra = prompt('Para confirmar, escribe la palabra BORRAR (en mayúsculas):');
    if (palabra !== 'BORRAR') {
      alert('Cancelado.');
      return;
    }

    window.Storage.borrarTodo();
    localStorage.removeItem(KEY_TEMA);
    alert('Todos los datos han sido borrados. La página se recargará.');
    location.reload();
  }

  function initAjustes() {
    // Marcar cambios pendientes en el bloque del emisor
    var camposEmisor = ['aj-marca','aj-eslogan','aj-nombre','aj-nif','aj-direccion','aj-telefono','aj-email','aj-web','aj-iban'];
    var h2Emisor = document.querySelector('#vista-ajustes .card h2');
    camposEmisor.forEach(function (id) {
      document.getElementById(id)?.addEventListener('input', function () {
        if (h2Emisor && !h2Emisor.classList.contains('cambios-pendientes')) {
          h2Emisor.classList.add('cambios-pendientes');
        }
      });
    });

    document.getElementById('aj-guardar-emisor')?.addEventListener('click', function () {
      guardarAjustesEmisor();
      if (h2Emisor) h2Emisor.classList.remove('cambios-pendientes');
    });
    document.getElementById('aj-exportar')?.addEventListener('click', exportarBackup);
    document.getElementById('aj-importar')?.addEventListener('click', function () {
      document.getElementById('aj-file').click();
    });
    document.getElementById('aj-file')?.addEventListener('change', function (e) {
      importarBackup(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('aj-tema')?.addEventListener('change', function (e) {
      aplicarTema(e.target.value);
    });
    document.getElementById('aj-borrar-todo')?.addEventListener('click', borrarTodoDatos);

    cargarAjustesEnForm();
  }

  // ═══════════════════════════════════════════════════
  // ARRANQUE
  // ═══════════════════════════════════════════════════
  // INICIO (dashboard)
  // ═══════════════════════════════════════════════════

  function renderInicio() {
    if (!window.Modelo) return;
    var lista = window.Modelo.getPresupuestos();

    // Resumen del mes actual
    var ahora = new Date();
    var anio = ahora.getFullYear();
    var mes  = String(ahora.getMonth() + 1).padStart(2, '0');
    var prefijo = anio + '-' + mes;

    var totalMes = 0;
    lista.forEach(function (p) {
      if ((p.fecha || '').indexOf(prefijo) === 0) {
        totalMes += window.Modelo.totalPresupuesto(p);
      }
    });

    document.getElementById('inicio-total-mes').textContent = eur(totalMes);
    document.getElementById('inicio-num-presu').textContent  = lista.length;

    // Últimos 5
    var tabla = document.getElementById('inicio-tabla');
    var vacio = document.getElementById('inicio-vacio');
    var tbody = document.getElementById('inicio-tbody');
    if (!tbody) return;

    if (!lista.length) {
      tabla.style.display = 'none';
      vacio.style.display = '';
      return;
    }
    tabla.style.display = '';
    vacio.style.display = 'none';

    var ultimos = lista.slice().sort(function (a, b) {
      return (b.fecha || '').localeCompare(a.fecha || '');
    }).slice(0, 5);

    tbody.innerHTML = '';
    ultimos.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapar((p.tipo || 'presupuesto').charAt(0).toUpperCase() + (p.tipo || 'presupuesto').slice(1)) + '</td>' +
        '<td>' + escapar(p.numero) + '</td>' +
        '<td>' + escapar(p.fecha) + '</td>' +
        '<td>' + escapar(p.cliente && p.cliente.nombre || '') + '</td>' +
        '<td class="derecha mono">' + eur(window.Modelo.totalPresupuesto(p)) + '</td>' +
        '<td>' + escapar(p.estado) + '</td>';
      tr.addEventListener('click', function () { cargarEnEditor(p); mostrarVista('presupuestos'); });
      tbody.appendChild(tr);
    });
  }

  function initInicio() {
    document.getElementById('inicioNuevoPresupuesto')?.addEventListener('click', function () {
      mostrarVista('presupuestos');
      nuevoPresupuesto();
    });
    document.getElementById('inicioIrCatalogo')?.addEventListener('click', function () {
      mostrarVista('catalogo');
    });
    document.getElementById('inicioIrAjustes')?.addEventListener('click', function () {
      mostrarVista('ajustes');
    });
    document.getElementById('inicioVerTodos')?.addEventListener('click', function () {
      mostrarVista('presupuestos');
    });

    renderInicio();
  }

  // ═══════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function () {
    if (window.Modelo) window.Modelo.init();
    initTema();
    initNav();
    initTabsCatalogo();
    initCatalogoRopa();
    initCatalogoMateriales();
    initCatalogoMano();
    initModalCatalogo();
    initPresupuestos();
    initInicio();
    initAjustes();

    var st = document.getElementById('status-info');
    if (st) st.textContent = 'ArandaCrafts · v0.1 · ' + new Date().toLocaleDateString('es-ES');
  });

})();
