/* ArandaCrafts — Tablero de Producción (Taller) V5 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.nav') || document.querySelector('nav');
    if (nav && !document.querySelector('.nav-btn[data-vista="taller"]')) {
      var btnTaller = document.createElement('button');
      btnTaller.className = 'nav-btn';
      btnTaller.setAttribute('data-vista', 'taller');
      btnTaller.innerHTML = '🏭 Taller';
      
      var btnPresu = nav.querySelector('.nav-btn[data-vista="presupuestos"]');
      if (btnPresu) btnPresu.parentNode.insertBefore(btnTaller, btnPresu.nextSibling);
      else nav.appendChild(btnTaller);

      // Al hacer clic en el menú, refrescar siempre
      btnTaller.addEventListener('click', function() {
        if (window.mostrarVista) window.mostrarVista('taller');
        setTimeout(window.renderTaller, 50);
      });
    }
  });

  window.abrirDesdeTaller = function(id) {
    if (window.mostrarVista) window.mostrarVista('presupuestos');
    setTimeout(function() {
      if (window.editarPresupuesto) {
        window.editarPresupuesto(id);
        setTimeout(function() {
          var editor = document.getElementById('presu-editor');
          var listado = document.getElementById('presu-listado');
          if (editor && listado) {
            listado.style.display = 'none';
            editor.style.display = 'block';
            
            var p = window.Modelo.getPresupuestos().find(function(x) { return x.id === id; });
            if (p) {
              var selEstado = document.getElementById('presu-estado');
              if (selEstado) selEstado.value = p.estado || 'borrador';
              var fechaInput = document.getElementById('presu-fecha-entrega');
              if (fechaInput && p.fecha_entrega) fechaInput.value = p.fecha_entrega;
            }
          }
        }, 100);
      }
    }, 150);
  };

  window.renderTaller = function() {
    var cont = document.getElementById('taller-tablero');
    if (!cont) return;

    // IMPORTANTE: Leemos siempre de la memoria (localStorage) para tener los datos frescos
    var presupuestos = window.Modelo.getPresupuestos() || [];
    
    var pedidos = presupuestos.filter(function(p) {
      return p.estado === 'aceptado' || p.estado === 'en_produccion' || p.estado === 'entregado';
    });

    pedidos.sort(function(a, b) {
      if (!a.fecha_entrega) return 1;
      if (!b.fecha_entrega) return -1;
      return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
    });

    var columnas = [
      { id: 'aceptado', titulo: '📥 Aceptados (En cola)' },
      { id: 'en_produccion', titulo: '🛠️ En Producción' },
      { id: 'entregado', titulo: '✅ Entregados (Albarán)' }
    ];

    var html = '';

    columnas.forEach(function(col) {
      var pedidosCol = pedidos.filter(function(p) { return p.estado === col.id; });
      
      html += `<div style="background: var(--bg-soft); border-radius: 12px; padding: 1rem; border: 1px solid var(--border); min-height: 550px;">`;
      html += `<h3 style="margin-top:0; font-size:1rem; color:var(--text-soft); border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">${col.titulo} <span style="float:right; background:var(--border); padding:0.1rem 0.5rem; border-radius:10px; font-size:0.8rem;">${pedidosCol.length}</span></h3>`;

      if (pedidosCol.length === 0) {
        html += `<p style="text-align:center; color:var(--text-soft); font-size:0.9rem; margin-top:2rem;">No hay pedidos</p>`;
      }

      pedidosCol.forEach(function(p) {
        var alertaFecha = '';
        var colorFecha = 'var(--text-soft)';
        
        if (p.fecha_entrega) {
          var hoy = new Date();
          hoy.setHours(0,0,0,0);
          var entrega = new Date(p.fecha_entrega);
          var diff = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
          
          if (diff < 0) { alertaFecha = '🔴 ¡RETRASADO!'; colorFecha = '#c62828'; }
          else if (diff === 0) { alertaFecha = '🟠 ¡ENTREGA HOY!'; colorFecha = '#f57c00'; }
          else if (diff <= 3) { alertaFecha = '🟡 Quedan ' + diff + ' días'; colorFecha = '#fbc02d'; }
          else { alertaFecha = '🟢 ' + p.fecha_entrega; colorFecha = '#2e7d32'; }
        } else {
          alertaFecha = '⚪ Sin fecha';
        }

        var cliente = p.cliente ? p.cliente.nombre : 'Sin cliente';
        var totalLineas = (p.lineas || []).length;

        html += `<div onclick="window.abrirDesdeTaller('${p.id}')" style="background: var(--bg); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border); box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
            <strong style="font-size:1.05rem; color:var(--primary);">${p.numero}</strong>
            <span style="background:var(--border); color:var(--text); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.7rem; text-transform:uppercase;">${p.tipo}</span>
          </div>
          
          <div style="font-size:0.9rem; font-weight:600; margin-bottom: 0.2rem;">${cliente}</div>
          <div style="font-size:0.8rem; color:var(--text-soft); margin-bottom: 1rem;">${totalLineas} líneas · ${window.eur(p.total || 0)}</div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-soft); padding: 0.5rem; border-radius: 6px; font-size:0.85rem;">
            <span>📅 Entrega:</span>
            <strong style="color:${colorFecha};">${alertaFecha}</strong>
          </div>

        </div>`;
      });

      html += `</div>`;
    });

    cont.innerHTML = html;
  };

})();
