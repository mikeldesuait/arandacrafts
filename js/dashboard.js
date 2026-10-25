/* ArandaCrafts — Dashboard de Inicio (V7 - Sincronizado) */
(function() {
  'use strict';

  window.renderDashboard = function() {
    if (!document.getElementById('db-clientes')) return;

    var clientes = window.Modelo.getClientes() || [];
    var presupuestos = window.Modelo.getPresupuestos() || [];
    var estructura = window.Modelo.getStockEstructura() || [];
    
    var ventas = {}; 
    var totalCobrado = 0, totalPendiente = 0, totalInversionStock = 0;

    estructura.forEach(function(cat) {
      (cat.categorias || []).forEach(function(sub) {
        (sub.productos || []).forEach(function(p) {
          var stockTotalProd = 0;
          if (p.variantes && p.variantes.length > 0) {
            p.variantes.forEach(function(v) { stockTotalProd += (parseFloat(v.cantidad) || 0); });
          } else {
            stockTotalProd = parseFloat(p.stock) || 0;
          }
          totalInversionStock += (stockTotalProd * (parseFloat(p.coste) || 0));
        });
      });
    });

    presupuestos.forEach(function(p) {
      if (p.estado === 'rechazado') return;
      if (p.cobro === 'cobrado') totalCobrado += (p.total || 0);
      else totalPendiente += (p.total || 0);

      (p.lineas || []).forEach(function(l) {
        if (l.tipo === 'producto' && l.idRef) {
          var catNombre = ''; var subNombre = '';
          estructura.forEach(function(cat) {
            (cat.categorias || []).forEach(function(sub) {
              (sub.productos || []).forEach(function(prod) {
                if (prod.id === l.idRef) { catNombre = cat.nombre; subNombre = sub.nombre; }
              });
            });
          });
          if (!ventas[l.idRef]) ventas[l.idRef] = { nombre: l.concepto, cat: catNombre, sub: subNombre, cantidad: 0, total: 0 };
          ventas[l.idRef].cantidad += (parseFloat(l.cantidad) || 0);
          ventas[l.idRef].total += ((parseFloat(l.cantidad) || 0) * (parseFloat(l.precio) || 0));
        }
      });
    });

    var topVentas = Object.values(ventas).sort(function(a, b) { return b.cantidad - a.cantidad; }).slice(0, 5);

    var pedidosTaller = presupuestos.filter(function(p) {
      return p.estado === 'aceptado' || p.estado === 'en_produccion';
    });
    pedidosTaller.sort(function(a, b) {
      if (!a.fecha_entrega) return 1;
      if (!b.fecha_entrega) return -1;
      return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
    });
    var pedidosUrgentes = pedidosTaller.slice(0, 5);

    var elClientes = document.getElementById('db-clientes');
    if (elClientes) elClientes.textContent = clientes.length;
    var elCobrado = document.getElementById('db-cobrado');
    if (elCobrado) elCobrado.textContent = window.eur(totalCobrado);
    var elPendiente = document.getElementById('db-pendiente');
    if (elPendiente) elPendiente.textContent = window.eur(totalPendiente);
    var elInversion = document.getElementById('db-inversion');
    if (elInversion) elInversion.textContent = window.eur(totalInversionStock);

    var listaTaller = document.getElementById('db-taller-lista');
    if (listaTaller) {
      listaTaller.innerHTML = pedidosUrgentes.length === 0 ? '<li style="color:var(--text-soft)">No hay pedidos en producción ahora mismo.</li>' : '';
      pedidosUrgentes.forEach(function(p) {
        var alertaFecha = 'Sin fecha'; var colorFecha = 'var(--text-soft)';
        if (p.fecha_entrega) {
          var hoy = new Date(); hoy.setHours(0,0,0,0);
          var entrega = new Date(p.fecha_entrega);
          var diff = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
          if (diff < 0) { alertaFecha = '🔴 Retrasado'; colorFecha = '#c62828'; }
          else if (diff === 0) { alertaFecha = '🟠 Entrega Hoy'; colorFecha = '#f57c00'; }
          else if (diff <= 3) { alertaFecha = '🟡 Quedan ' + diff + ' días'; colorFecha = '#fbc02d'; }
          else { alertaFecha = '🟢 ' + p.fecha_entrega; colorFecha = '#2e7d32'; }
        }
        var claseEstado = 'tipo-' + (p.estado || 'aceptado');
        listaTaller.innerHTML += `<li>
          <div>
            <div style="font-weight:600; font-size:0.95rem;">${p.numero} <span class="badge-tipo ${claseEstado}">${p.estado}</span></div>
            <div style="font-size:0.8rem; color:var(--text-soft); margin-top:2px;">${p.cliente ? p.cliente.nombre : 'Sin cliente'}</div>
          </div>
          <div style="text-align:right;"><strong style="color:${colorFecha}; font-size:0.85rem;">${alertaFecha}</strong></div>
        </li>`;
      });
    }

    var listaVentas = document.getElementById('db-top-ventas');
    if (listaVentas) {
      listaVentas.innerHTML = topVentas.length === 0 ? '<p style="color:var(--text-soft)">Aún no hay ventas registradas.</p>' : '';
      topVentas.forEach(function(v, index) {
        listaVentas.innerHTML += `<div class="top-venta-item">
          <div class="top-venta-num">${index + 1}</div>
          <div class="top-venta-info">
            <div class="top-venta-titulo">${v.nombre}</div>
            <div class="top-venta-cat">${v.cat} > ${v.sub}</div>
          </div>
          <div class="top-venta-stats">
            <div class="top-venta-cant">${v.cantidad} uds</div>
            <div style="font-size:0.75rem; color:var(--text-soft);">${window.eur(v.total)}</div>
          </div>
        </div>`;
      });
    }

    // ─── NUEVO: PINTAR LISTA DE COBROS PENDIENTES ───
    var listaCobros = document.getElementById('db-cobros-lista');
    if (listaCobros) {
      // Filtramos los presupuestos que no estén cobrados y no sean borradores
      var pendientes = presupuestos.filter(function(p) {
        return p.estado !== 'borrador' && p.estado !== 'rechazado' && p.cobro !== 'cobrado';
      });
      
      // Los ordenamos por fecha (los más antiguos primero, para cobrar antes)
      pendientes.sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });

      if (pendientes.length === 0) {
        listaCobros.innerHTML = '<p style="color:var(--text-soft); text-align: center; margin-top: 1rem;">No hay documentos pendientes de cobro. ¡Todo al día!</p>';
      } else {
        var htmlCobros = '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
        htmlCobros += '<thead><tr style="border-bottom: 2px solid var(--border); color: var(--text-soft); text-align: left;">';
        htmlCobros += '<th style="padding: 0.5rem;">Documento</th><th style="padding: 0.5rem;">Cliente</th><th style="padding: 0.5rem;">Fecha</th><th style="padding: 0.5rem; text-align: right;">Importe</th></tr></thead><tbody>';
        
        pendientes.forEach(function(p) {
          var colorEstado = (p.estado === 'entregado') ? '#2e7d32' : '#f57c00';
          var textEstado = (p.estado === 'entregado') ? 'Albarán' : 'En curso';
          
          htmlCobros += '<tr style="border-bottom: 1px solid var(--border); cursor: pointer;" onclick="window.abrirDocDesdeCliente(\'' + p.id + '\')" onmouseover="this.style.background=\'var(--bg-soft)\'" onmouseout="this.style.background=\'transparent\'">';
          htmlCobros += '<td style="padding: 0.5rem; font-weight: 600; color: var(--primary);">' + p.numero + '<br><small style="color:' + colorEstado + '; font-size:0.7rem;">' + textEstado + '</small></td>';
          htmlCobros += '<td style="padding: 0.5rem;">' + (p.cliente ? p.cliente.nombre : 'Sin cliente') + '</td>';
          htmlCobros += '<td style="padding: 0.5rem; color: var(--text-soft);">' + p.fecha + '</td>';
          htmlCobros += '<td style="padding: 0.5rem; text-align: right; font-weight: bold; color: #c62828;">' + window.eur(p.total || 0) + '</td>';
          htmlCobros += '</tr>';
        });
        htmlCobros += '</tbody></table>';
        listaCobros.innerHTML = htmlCobros;
      }
    }
  };

  // Cargar al entrar a inicio
  document.addEventListener('DOMContentLoaded', function() {
    if (!location.hash || location.hash === '#inicio') {
      setTimeout(window.renderDashboard, 250);
    }
  });
})();

/* PARCHE MAESTRO: DASHBOARD A PRUEBA DE F5 */
(function() {
  var intentos = 0;
  
  function cargarDatosDashboard() {
    var elClientes = document.getElementById('db-clientes');
    if (!elClientes) return; // Si no estamos en el dashboard, no hacemos nada

    // Verificamos si los datos del Modelo están cargados
    if (window.Modelo && window.Modelo.getClientes) {
      var clientes = window.Modelo.getClientes();
      var presupuestos = window.Modelo.getPresupuestos();
      
      // Si el modelo responde, pintamos
      if (window.renderDashboard) {
        window.renderDashboard();
        console.log('✅ Dashboard pintado correctamente en el intento ' + intentos);
      }
    } else {
      // Si no está listo, reintentamos en 200ms (hasta 10 veces)
      intentos++;
      if (intentos < 10) {
        setTimeout(cargarDatosDashboard, 200);
      }
    }
  }

  // Ejecutamos al cargar la página
  window.addEventListener('load', function() {
    // Si estamos en Inicio, lanzamos la carga
    if (!location.hash || location.hash === '#inicio') {
      cargarDatosDashboard();
    }
  });

  // Si el usuario hace clic en el menú de Inicio, también pintamos
  document.addEventListener('DOMContentLoaded', function() {
    var btnInicio = document.querySelector('.nav-btn[data-vista="inicio"]');
    if (btnInicio) {
      btnInicio.addEventListener('click', function() {
        setTimeout(cargarDatosDashboard, 50);
      });
    }
  });
})();
