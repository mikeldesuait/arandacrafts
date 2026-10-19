/* ArandaCrafts — Listado de Inversión de Stock */
(function() {
  'use strict';

  // 1. Inyectar el botón en el menú
  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.nav') || document.querySelector('nav');
    if (nav && !document.querySelector('.nav-btn[data-vista="inventario"]')) {
      var btnInv = document.createElement('button');
      btnInv.className = 'nav-btn';
      btnInv.setAttribute('data-vista', 'inventario');
      btnInv.innerHTML = '📊 Inventario';
      
      var btnTaller = nav.querySelector('.nav-btn[data-vista="taller"]');
      if (btnTaller) btnTaller.parentNode.insertBefore(btnInv, btnTaller.nextSibling);
      else nav.appendChild(btnInv);

      btnInv.addEventListener('click', function() {
        if (window.mostrarVista) window.mostrarVista('inventario');
        setTimeout(window.renderInventario, 50);
      });
    }
  });

  // 2. Función que pinta la tabla
  window.renderInventario = function() {
    var cont = document.getElementById('inventario-tablero');
    if (!cont) return;

    var estructura = window.Modelo.getStockEstructura() || [];
    var productos = [];
    var totalInversion = 0;
    var totalUnidades = 0;

    // Aplanar la estructura para tener una lista plana de productos
    estructura.forEach(function(cat) {
      (cat.categorias || []).forEach(function(sub) {
        (sub.productos || []).forEach(function(p) {
          var stockTotal = 0;
          if (p.variantes && p.variantes.length > 0) {
            p.variantes.forEach(function(v) { stockTotal += (parseFloat(v.cantidad) || 0); });
          } else {
            stockTotal = parseFloat(p.stock) || 0;
          }
          
          var coste = parseFloat(p.coste) || 0;
          var inversion = stockTotal * coste;
          
          totalInversion += inversion;
          totalUnidades += stockTotal;

          productos.push({
            nombre: p.nombre,
            cat: cat.nombre,
            sub: sub.nombre,
            icono: p.icono || '📦',
            stock: stockTotal,
            coste: coste,
            inversion: inversion
          });
        });
      });
    });

    // Ordenar por inversión (de mayor a menor)
    productos.sort(function(a, b) { return b.inversion - a.inversion; });

    var html = `
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <div style="flex: 1; background: var(--bg-soft); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
          <div style="font-size: 0.8rem; color: var(--text-soft); text-transform: uppercase;">Total Invertido</div>
          <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">${window.eur(totalInversion)}</div>
        </div>
        <div style="flex: 1; background: var(--bg-soft); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
          <div style="font-size: 0.8rem; color: var(--text-soft); text-transform: uppercase;">Unidades en Total</div>
          <div style="font-size: 2rem; font-weight: 800; color: var(--text);">${totalUnidades}</div>
        </div>
      </div>

      <div class="dash-panel" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead style="background: var(--bg-soft); border-bottom: 2px solid var(--border);">
            <tr>
              <th style="padding: 1rem; font-size: 0.85rem; color: var(--text-soft);">Producto</th>
              <th style="padding: 1rem; font-size: 0.85rem; color: var(--text-soft);">Ubicación</th>
              <th style="padding: 1rem; font-size: 0.85rem; color: var(--text-soft); text-align: center;">Stock</th>
              <th style="padding: 1rem; font-size: 0.85rem; color: var(--text-soft); text-align: right;">Coste Ud.</th>
              <th style="padding: 1rem; font-size: 0.85rem; color: var(--text-soft); text-align: right;">Inversión Total</th>
            </tr>
          </thead>
          <tbody>
            ${productos.length === 0 ? '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-soft);">No hay productos en el inventario.</td></tr>' : ''}
            ${productos.map(function(p) {
              // Si no hay coste o el stock es 0, lo mostramos un poco apagado
              var colorInv = p.inversion > 0 ? 'var(--primary)' : 'var(--text-soft)';
              return `<tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem; font-weight: 600;">${p.icono} ${p.nombre}</td>
                <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-soft);">${p.cat} > ${p.sub}</td>
                <td style="padding: 1rem; text-align: center; font-weight: bold; ${p.stock <= 3 ? 'color: #c62828;' : ''}">${p.stock}</td>
                <td style="padding: 1rem; text-align: right; color: var(--text-soft);">${window.eur(p.coste)}</td>
                <td style="padding: 1rem; text-align: right; font-weight: 800; color: ${colorInv};">${window.eur(p.inversion)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    cont.innerHTML = html;
  };

})();
