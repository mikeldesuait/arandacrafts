document.addEventListener('DOMContentLoaded', function() {
  var vistaAjustes = document.getElementById('vista-ajustes');
  if (!vistaAjustes) return;

  // Estilos para el acordeón
  if (!document.getElementById('estilos-manual')) {
    var style = document.createElement('style');
    style.id = 'estilos-manual';
    style.innerHTML = `
      .manual-acordeon { border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1rem; overflow: hidden; }
      .manual-cabecera { background: var(--bg-soft); padding: 1rem; cursor: pointer; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
      .manual-cabecera:hover { background: var(--border); }
      .manual-contenido { padding: 1rem; display: none; border-top: 1px solid var(--border); background: var(--bg); }
      .manual-contenido.activo { display: block; }
      .manual-contenido h4 { margin-top: 1rem; color: var(--primary); }
      .manual-contenido ul, .manual-contenido ol { margin-bottom: 1rem; padding-left: 1.5rem; }
      .manual-contenido li { margin-bottom: 0.5rem; line-height: 1.5; }
      .manual-ejemplo { background: #e3f2fd; border-left: 4px solid #1565c0; padding: 0.8rem; margin: 1rem 0; font-style: italic; }
      .manual-alerta { background: #ffebee; border-left: 4px solid #c62828; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; }
    `;
    document.head.appendChild(style);
  }

  // Contenedor del manual
  var manualDiv = document.createElement('div');
  manualDiv.className = 'card';
  manualDiv.style.cssText = 'margin-top: 2rem; border-left: 4px solid var(--primary);';
  
  manualDiv.innerHTML = `
    <h2 style="color: var(--primary); margin-top: 0;">📖 Manual de Uso Completo</h2>
    <p class="hint" style="margin-bottom: 1.5rem;">Guía detallada para gestionar tu taller. Haz clic en cada sección para desplegarla.</p>

    <div class="manual-alerta">
      <h3 style="margin-top: 0; color: #c62828;">⚠️ ADVERTENCIA CRÍTICA: El Stock</h3>
      <p><b>El stock NO se descuenta al crear un presupuesto.</b> Solo baja cuando el documento se guarda como <b>Albarán</b> (Entregado).</p>
      <p><b>Si te equivocas y guardas un Albarán por error:</b> El stock no se recupera solo. Debes ir a <b>Productos</b>, editar el producto y sumar las unidades a mano.</p>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>⚙️ 1. Configuración Inicial (Ajustes)</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>Antes de empezar, configura los datos de tu empresa para que salgan en los PDFs.</p>
        <ol>
          <li>Ve a <b>Ajustes → Datos del emisor</b>.</li>
          <li>Rellena tu <b>Nombre comercial</b>, <b>Nombre fiscal</b>, <b>NIF</b>, <b>Dirección</b>, <b>Teléfono</b> y <b>Email</b>.</li>
          <li>Pulsa "Guardar datos".</li>
        </ol>
        <p><b>Backup:</b> En esta misma pestaña, pulsa "Exportar backup" de vez en cuando. Se descargará un archivo JSON con todos tus datos.</p>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>📦 2. Crear Productos y Stock</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>El Stock es tu almacén. Se organiza en carpetas.</p>
        <ol>
          <li>Ve a <b>Productos</b>.</li>
          <li>Entra en una carpeta (ej: Ropa → Camisetas) o crea una nueva.</li>
          <li>Pulsa <b>"Nuevo producto"</b>.</li>
          <li>Rellena el <b>Nombre</b>, el <b>Coste</b> y el <b>Precio Base</b> (sin IVA).</li>
          <li>En <b>Variantes</b>, elige "Con variantes" (ropa) o "Sin variantes" (tazas).</li>
          <li>Pulsa "Guardar producto".</li>
        </ol>
        <div class="manual-ejemplo">💡 <b>Ejemplo:</b> Tienes 10 camisetas Roly Blancas talla M. Creas el producto, añades una variante "Blanco - M - 10" y guardas.</div>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>👥 3. Gestionar Clientes</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>Tu base de datos de clientes.</p>
        <ol>
          <li>Ve a <b>Clientes</b> y pulsa <b>"+ Nuevo cliente"</b>.</li>
          <li>Elige el tipo (Particular, Autónomo, Empresa).</li>
          <li>Rellena los datos. El NIF y la dirección son importantes para las facturas.</li>
          <li>Guarda.</li>
        </ol>
        <p><b>Historial:</b> Si haces clic en un cliente de la lista, verás un resumen de cuánto te debe, cuánto te ha pagado, y una tabla con todos sus presupuestos.</p>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>📄 4. El Ciclo del Presupuesto (Paso a Paso)</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>Este es el flujo diario. ¡Síguelo para no descuadrar el stock!</p>
        <ol>
          <li><b>Crear Presupuesto:</b> Ve a <b>Presupuestos</b> → <b>+ Nuevo</b>. Elige al cliente, añade productos y trabajos. Pulsa <b>Guardar</b>. El estado por defecto es "Borrador". <i>(Stock no baja)</i>.</li>
          <li><b>Aceptado:</b> El cliente da el OK. Abre el presupuesto, cambia el estado a <b>"Aceptado"</b> y ponle una <b>Fecha de entrega</b>. <i>(Stock no baja). Ya aparece en el Taller.</i></li>
          <li><b>En Producción:</b> Cuando empieces a fabricarlo, cámbialo a "En Producción".</li>
          <li><b>Entregado (Albarán):</b> Cuando se lo des al cliente, cámbialo a <b>"Entregado"</b>. Al guardar, <b>el stock baja automáticamente</b>.</li>
          <li><b>Cobrado:</b> Si te ha pagado, cambia el campo "Estado de cobro" a "Cobrado".</li>
        </ol>
        <div class="manual-ejemplo">💡 <b>Ejemplo completo:</b> Haces un presupuesto de 10 camisetas. El cliente lo acepta. Lo pones en producción. Cuando lo entregas, lo pasas a Albarán. En ese momento, el stock de esas 10 camisetas baja.</div>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>🏭 5. El Tablero de Taller</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>Es tu centro de operaciones visual.</p>
        <ul>
          <li>Muestra los pedidos con estado "Aceptado" o "En Producción".</li>
          <li>Los ordena por fecha de entrega (los más urgentes primero).</li>
          <li><b>Colores:</b> 🔴 Rojo (Retrasado), 🟠 Naranja (Hoy), 🟡 Amarillo (Pocos días), 🟢 Verde (A tiempo).</li>
          <li>Haz clic en una tarjeta para abrir el presupuesto y cambiar su estado.</li>
        </ul>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>🛠️ 6. Mano de Obra (Trabajos)</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>Define tus tarifas fijas aquí.</p>
        <ol>
          <li>Ve a <b>Trabajos</b>.</li>
          <li>Añade tus servicios: Ej. "Diseño" (Tipo: hora, Precio: 25€), "Planchado" (Tipo: unidad, Precio: 0,80€).</li>
          <li>Guarda.</li>
        </ol>
        <p>Al crear un presupuesto, podrás buscarlos y añadirlos. El sistema acepta decimales (ej: 1,5 horas).</p>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>📊 7. Resumen Financiero</span><span>▼</span></div>
      <div class="manual-contenido">
        <ul>
          <li><b>Inicio (Dashboard):</b> Muestra el total cobrado, el pendiente, la inversión en stock y los pedidos urgentes.</li>
          <li><b>Inventario:</b> Una tabla con el valor de todo lo que tienes en el almacén (Stock x Coste). Ordenado por mayor inversión.</li>
        </ul>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>🖨️ 8. Imprimir / Generar PDF</span><span>▼</span></div>
      <div class="manual-contenido">
        <ol>
          <li>Abre un presupuesto.</li>
          <li>Pulsa el botón <b>"🖨️ Imprimir / PDF"</b>.</li>
          <li>Se abrirá una nueva pestaña con el documento formateado. Desde ahí, puedes imprimirlo o guardarlo como PDF.</li>
          <li>Si el cliente te ha dejado material, aparecerá reflejado en una caja amarilla para que no lo cobres.</li>
        </ol>
      </div>
    </div>

    <div class="manual-acordeon">
      <div class="manual-cabecera" onclick="this.nextElementSibling.classList.toggle('activo')"><span>💾 9. Backup (Copia de Seguridad)</span><span>▼</span></div>
      <div class="manual-contenido">
        <p>Es importante hacer copias de seguridad.</p>
        <ol>
          <li>Ve a <b>Ajustes</b>.</li>
          <li>Pulsa <b>"📤 Exportar backup"</b>. Se descargará un archivo JSON con todos tus datos.</li>
          <li>Si algún día algo va mal, pulsa <b>"📥 Importar backup"</b> y selecciona ese archivo para restaurar todo.</li>
        </ol>
        <p class="manual-alerta" style="margin-top:1rem;">⚠️ <b>Haz backup regularmente</b>, sobre todo antes de hacer cambios grandes.</p>
      </div>
    </div>
  `;

  vistaAjustes.appendChild(manualDiv);
  console.log("✅ Manual de uso completo añadido a Ajustes.");
});
