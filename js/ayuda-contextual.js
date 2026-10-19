document.addEventListener('DOMContentLoaded', function() {
  // 1. Contenidos detallados para cada pestaña
  var ayudas = {
    'inicio': `
      <h3 style="color:var(--primary); margin-top:0;">📊 Panel de Inicio</h3>
      <p>Este es el resumen de tu taller. Aquí ves:</p>
      <ul>
        <li><b>Clientes:</b> Cuántos tienes registrados.</li>
        <li><b>Cobrado / Pendiente:</b> El dinero que has ganado y lo que te deben.</li>
        <li><b>Inversión Stock:</b> El valor de la mercancía en tu almacén (Coste x Stock).</li>
        <li><b>Pedidos en Taller:</b> Los pedidos aceptados con fecha más cercana (los urgentes).</li>
        <li><b>Top 5 Ventas:</b> Los productos que más has vendido.</li>
      </ul>
    `,
    'registro': `
      <h3 style="color:var(--primary); margin-top:0;">📦 Registro de Entrada</h3>
      <p>Usa esta sección para apuntar el material que te trae un cliente (ej: "Peña trae 20 camisetas").</p>
      <p><b>¿Para qué sirve?</b><br>Al crear un presupuesto, podrás vincular este registro para que el material del cliente no se cobre, solo la estampación.</p>
      <div class="manual-ejemplo">💡 <b>Ejemplo:</b> El cliente te da 10 sudaderas. Lo apuntas aquí. Luego, en el presupuesto, solo le cobras los vinilos y las horas de trabajo.</div>
    `,
    'presupuestos': `
      <h3 style="color:var(--primary); margin-top:0;">🧾 Presupuestos y Documentos</h3>
      <p><b>Ciclo de vida del pedido:</b></p>
      <ol>
        <li><b>Borrador:</b> Lo creas, añades productos y trabajos. El stock NO se descuenta.</li>
        <li><b>Aceptado:</b> El cliente dice que sí. Lo pasas a "Aceptado" (ya aparece en el Taller).</li>
        <li><b>En Producción:</b> Te pones a fabricarlo.</li>
        <li><b>Entregado (Albarán):</b> Aquí es donde <b>se descuenta el stock</b> automáticamente.</li>
      </ol>
      <p><b>¿Cómo cobrar?</b><br>Una vez entregado, cámbialo a "Cobrado" si ya te ha pagado. Eso actualizará el Dashboard.</p>
      <div class="manual-alerta">⚠️ Si guardas un Albarán por error, el stock no se recupera solo. Debes reponerlo manualmente en Productos.</div>
    `,
    'taller': `
      <h3 style="color:var(--primary); margin-top:0;">🏭 Tablero de Taller</h3>
      <p>Es tu centro de producción visual.</p>
      <ul>
        <li>Aquí aparecen los presupuestos con estado <b>Aceptado</b> o <b>En Producción</b>.</li>
        <li>Las tarjetas se ordenan por <b>fecha de entrega</b> (los más urgentes primero).</li>
        <li>Los colores te avisan: <b style="color:#c62828">Rojo (retrasado)</b>, <b style="color:#f57c00">Naranja (hoy)</b>, <b style="color:#fbc02d">Amarillo (pocos días)</b>, <b style="color:#2e7d32">Verde (a tiempo)</b>.</li>
        <li>Haz clic en cualquier tarjeta para abrir el presupuesto y cambiar su estado o fecha.</li>
      </ul>
    `,
    'stock': `
      <h3 style="color:var(--primary); margin-top:0;">📦 Productos (Stock)</h3>
      <p>Aquí organizas todo tu catálogo.</p>
      <ol>
        <li><b>Carpetas:</b> Crea bloques como "Ropa" y dentro carpetas como "Camisetas".</li>
        <li><b>Productos:</b> Puedes crearlos de dos formas:
          <ul>
            <li><b>Con variantes:</b> (Ej: Camiseta Roly - Blanco - Talla M). Se descuenta por variante.</li>
            <li><b>Sin variantes:</b> (Ej: Taza mágica). Se descuenta del stock general.</li>
          </ul>
        </li>
      </ol>
      <p><b>Precios:</b> Mete el precio base (sin IVA) y el sistema calcula el final. También puedes meter el coste para calcular tu inversión.</p>
    `,
    'inventario': `
      <h3 style="color:var(--primary); margin-top:0;">📊 Inventario</h3>
      <p>Es una radiografía de tu dinero.</p>
      <ul>
        <li><b>Total Invertido:</b> La suma de (Stock x Coste) de todos tus productos. Esto es el dinero que tienes "dormido" en el almacén.</li>
        <li><b>Unidades:</b> Cuántos productos tienes en total.</li>
      </ul>
      <p>Los productos están ordenados por mayor inversión. Si ves que tienes 500€ en un producto que no se vende, quizá debas bajar su stock.</p>
    `,
    'trabajos': `
      <h3 style="color:var(--primary); margin-top:0;">🛠️ Trabajos (Mano de obra)</h3>
      <p>Define tus tarifas aquí.</p>
      <ul>
        <li><b>Tipo hora:</b> Para diseñar (Ej: 25€/hora).</li>
        <li><b>Tipo fijo:</b> Para envíos (Ej: 5,90€).</li>
        <li><b>Tipo unidad:</b> Para planchado (Ej: 0,80€ por camiseta).</li>
      </ul>
      <p>Luego, al hacer un presupuesto, solo tienes que buscarlos y añadirlos. Puedes vender 1,5 horas de diseño (el sistema acepta decimales).</p>
    `,
    'clientes': `
      <h3 style="color:var(--primary); margin-top:0;">👥 Clientes</h3>
      <p>Tu base de datos.</p>
      <p>Haz clic en un cliente para ver:</p>
      <ul>
        <li>Sus datos fiscales.</li>
        <li><b>Cuánto te debe (Pendiente):</b> Dinero de presupuestos no cobrados.</li>
        <li><b>Cuánto te ha pagado (Cobrado).</b></li>
        <li><b>Historial:</b> Una lista de todos sus presupuestos. Haz clic en cualquiera para abrirlo.</li>
      </ul>
      <div class="manual-ejemplo">💡 <b>Ejemplo:</b> Cuando te llame un cliente, sabrás al instante si te debe dinero o qué le hiciste la última vez.</div>
    `,
    'ajustes': `
      <h3 style="color:var(--primary); margin-top:0;">⚙️ Ajustes y Guía de Inicio</h3>
      <ul>
        <li><b>Datos del emisor:</b> Rellena tus datos aquí para que salgan en los PDFs.</li>
        <li><b>Backup:</b> Exporta un archivo JSON con todos tus datos para no perderlos.</li>
        <li><b>Tema:</b> Claro u oscuro.</li>
      </ul>
      <div class="manual-ejemplo">
        <b>📖 GUÍA RÁPIDA PARA EMPEZAR:</b><br>
        1. Configura tus datos en esta pestaña.<br>
        2. Crea tus productos en "Productos".<br>
        3. Crea un cliente en "Clientes".<br>
        4. Haz un presupuesto: elige cliente, añade productos y guarda.<br>
        5. Gestiónalo: Aceptado → Albarán (baja stock) → Cobrado.
      </div>
    `
  };

  // 2. Creamos el modal (oculto)
  var modal = document.createElement('div');
  modal.id = 'modal-ayuda';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 5000; display: none; align-items: center; justify-content: center; padding: 2rem;';
  
  var contenido = document.createElement('div');
  contenido.className = 'manual-contenido activo';
  contenido.style.cssText = 'background: var(--bg); color: var(--text); max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; border-radius: 12px; padding: 2rem; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);';
  
  contenido.innerHTML = `
    <button id="cerrar-ayuda" style="position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text);">✕</button>
    <div id="ayuda-texto"></div>
  `;
  
  modal.appendChild(contenido);
  document.body.appendChild(modal);

  // 3. Lógica para cerrar
  document.getElementById('cerrar-ayuda').onclick = function() {
    modal.style.display = 'none';
  };
  modal.onclick = function(e) {
    if (e.target === modal) modal.style.display = 'none';
  };

  // 4. Buscamos los botones '?' y les asignamos la acción
  // Nota: Los botones se generan dinámicamente, así que esperamos un momento
  setTimeout(function() {
    document.querySelectorAll('.btn-ayuda-seccion').forEach(function(btn) {
      // Para saber a qué pestaña pertenece, buscamos su contenedor .vista
      var vista = btn.closest('.vista');
      var idVista = vista ? vista.id.replace('vista-', '') : null;
      
      if (idVista && ayudas[idVista]) {
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          document.getElementById('ayuda-texto').innerHTML = ayudas[idVista];
          modal.style.display = 'flex';
        };
      }
    });
  }, 500);

  console.log("✅ Ayuda contextual mejorada con manual detallado.");
});
