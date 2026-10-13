/* ArandaCrafts — Modelo de datos y catálogo inicial */

window.Modelo = (function () {
  'use strict';

  // ── Claves de almacenamiento ───────────────────────
  var K = {
    prendas:      'catalogo:prendas',
    estampacion:  'catalogo:estampacion',
    mano:         'catalogo:mano',
    presupuestos: 'presupuestos',
    emisor:       'emisor',
    contador:     'contador'   // { "2025": 3 }
  };

  // ── Catálogo inicial (precios de ejemplo, se editan luego) ──

  var PRENDAS_INICIALES = [
    { nombre: 'Camiseta básica (algodón 150g)',  precio: 3.50 },
    { nombre: 'Camiseta premium (algodón 190g)', precio: 5.20 },
    { nombre: 'Camiseta manga larga',            precio: 7.50 },
    { nombre: 'Sudadera con capucha',            precio: 14.00 },
    { nombre: 'Sudadera sin capucha',            precio: 12.00 },
    { nombre: 'Polo',                            precio: 8.50 },
    { nombre: 'Bolsa tote',                      precio: 2.80 },
    { nombre: 'Taza blanca',                     precio: 2.50 },
    { nombre: 'Gorra',                           precio: 4.00 },
    { nombre: 'Babero',                          precio: 2.20 }
  ];

  var ESTAMPACION_INICIAL = [
    // Vinilo textil (por metro lineal)
    { nombre: 'Vinilo textil color',       unidad: 'metro',    precio: 6.00,  grupo: 'vinilo' },
    { nombre: 'Vinilo textil reflectante', unidad: 'metro',    precio: 12.00, grupo: 'vinilo' },
    { nombre: 'Vinilo textil purpurina',   unidad: 'metro',    precio: 9.00,  grupo: 'vinilo' },
    { nombre: 'Vinilo textil flock',       unidad: 'metro',    precio: 8.50,  grupo: 'vinilo' },
    // DTF (por plancha)
    { nombre: 'Plancha DTF A5',            unidad: 'plancha',  precio: 1.50,  grupo: 'dtf' },
    { nombre: 'Plancha DTF A4',            unidad: 'plancha',  precio: 2.20,  grupo: 'dtf' },
    { nombre: 'Plancha DTF A3',            unidad: 'plancha',  precio: 3.80,  grupo: 'dtf' },
    // Otras técnicas (por unidad)
    { nombre: 'Serigrafía 1 color 1 cara', unidad: 'ud',       precio: 1.20,  grupo: 'otras' },
    { nombre: 'Serigrafía 2 colores',      unidad: 'ud',       precio: 1.80,  grupo: 'otras' },
    { nombre: 'Sublimación taza',          unidad: 'ud',       precio: 1.50,  grupo: 'otras' }
  ];

  var MANO_INICIAL = [
    { nombre: 'Diseño personalizado',         tipo: 'hora',   precio: 25.00 },
    { nombre: 'Preparación de archivos',      tipo: 'fijo',   precio: 5.00 },
    { nombre: 'Colocación y planchado',       tipo: 'unidad', precio: 0.80 },
    { nombre: 'Packaging individual',         tipo: 'unidad', precio: 0.50 },
    { nombre: 'Envío península',              tipo: 'fijo',   precio: 5.90 },
    { nombre: 'Envío Baleares',               tipo: 'fijo',   precio: 8.50 }
  ];

  // ── Utilidades ─────────────────────────────────────

  function conId(lista) {
    return lista.map(function (item) {
      return Object.assign({ id: window.Storage.uuid() }, item);
    });
  }

  function cargarLista(clave, defectoInicial) {
    var datos = window.Storage.get(clave, null);
    if (!datos) {
      datos = conId(defectoInicial);
      window.Storage.set(clave, datos);
    }
    return datos;
  }

  // ── API pública ────────────────────────────────────

  function getPrendas()     { return cargarLista(K.prendas,     PRENDAS_INICIALES); }
  function getEstampacion() { return cargarLista(K.estampacion, ESTAMPACION_INICIAL); }
  function getMano()        { return cargarLista(K.mano,        MANO_INICIAL); }

  function setPrendas(l)     { window.Storage.set(K.prendas, l); }
  function setEstampacion(l) { window.Storage.set(K.estampacion, l); }
  function setMano(l)        { window.Storage.set(K.mano, l); }

  function getPresupuestos()      { return window.Storage.get(K.presupuestos, []); }
  function setPresupuestos(lista) { window.Storage.set(K.presupuestos, lista); }

  function getEmisor() {
    return window.Storage.get(K.emisor, {
      nombre: 'ArandaCrafts',
      nif: '',
      direccion: '',
      telefono: '',
      email: ''
    });
  }
  function setEmisor(e) { window.Storage.set(K.emisor, e); }

  // ── Numeración correlativa por año ─────────────────
  // Formato: 2025-001, 2025-002... y reinicia cada año.

  function siguienteNumero() {
    var año = new Date().getFullYear();
    var cont = window.Storage.get(K.contador, {});
    var actual = cont[año] || 0;
    var siguiente = actual + 1;
    cont[año] = siguiente;
    window.Storage.set(K.contador, cont);
    return año + '-' + String(siguiente).padStart(3, '0');
  }

  // ── Cálculos ───────────────────────────────────────

  function subtotalLinea(linea) {
    var c = parseFloat(linea.cantidad) || 0;
    var p = parseFloat(linea.precio) || 0;
    return Math.round(c * p * 100) / 100;
  }

  function totalPresupuesto(presupuesto) {
    if (!presupuesto || !presupuesto.lineas) return 0;
    var t = presupuesto.lineas.reduce(function (acc, l) {
      return acc + subtotalLinea(l);
    }, 0);
    return Math.round(t * 100) / 100;
  }

  // ── Inicialización ─────────────────────────────────

  function init() {
    // Fuerza la creación del catálogo si no existe
    var p = getPrendas();
    var e = getEstampacion();
    var m = getMano();
    console.log('[ArandaCrafts] Catálogo listo →',
      p.length + ' prendas, ' +
      e.length + ' estampaciones, ' +
      m.length + ' extras/mano de obra.');
  }

  return {
    init: init,
    getPrendas: getPrendas,     setPrendas: setPrendas,
    getEstampacion: getEstampacion, setEstampacion: setEstampacion,
    getMano: getMano,           setMano: setMano,
    getPresupuestos: getPresupuestos, setPresupuestos: setPresupuestos,
    getEmisor: getEmisor,       setEmisor: setEmisor,
    siguienteNumero: siguienteNumero,
    subtotalLinea: subtotalLinea,
    totalPresupuesto: totalPresupuesto
  };
})();
