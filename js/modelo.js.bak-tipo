/* ArandaCrafts — Modelo de datos y catálogo
   Catálogos: ropa, vinilos, dtf, sublimacion, mano de obra
*/

window.Modelo = (function () {
  'use strict';

  var K = {
    ropa:         'catalogo:ropa',
    vinilos:      'catalogo:materiales:vinilos',
    dtf:          'catalogo:materiales:dtf',
    sublimacion:  'catalogo:materiales:sublimacion',
    mano:         'catalogo:mano',
    presupuestos: 'presupuestos',
    emisor:       'emisor',
    contador:     'contador'
  };

  var K_OLD = {
    materiales:  'catalogo:materiales',
    prendas:     'catalogo:prendas',
    estampacion: 'catalogo:estampacion'
  };

  // ── Catálogos iniciales ────────────────────────────

  var ROPA_INICIAL = [
    { nombre: 'Camiseta algodón Roly',           unidad: 'ud', precio: 3.50 },
    { nombre: 'Camiseta poliéster técnica Roly', unidad: 'ud', precio: 4.20 },
    { nombre: 'Pantalón largo laboral Roly',     unidad: 'ud', precio: 15.00 },
    { nombre: 'Pantalón corto deportivo Roly',   unidad: 'ud', precio: 6.50 },
    { nombre: 'Sudadera con capucha Roly',       unidad: 'ud', precio: 14.00 },
    { nombre: 'Sudadera sin capucha Roly',       unidad: 'ud', precio: 12.00 }
  ];

  var VINILOS_INICIAL = [
    { nombre: 'Vinilo Flex PU (poliuretano)', unidad: 'metro', precio: 6.00 },
    { nombre: 'Vinilo Flex PU mate',          unidad: 'metro', precio: 6.50 },
    { nombre: 'Vinilo Flex PU brillo',        unidad: 'metro', precio: 6.50 },
    { nombre: 'Vinilo Glitter',               unidad: 'metro', precio: 9.00 },
    { nombre: 'Vinilo Metalizado',            unidad: 'metro', precio: 10.00 },
    { nombre: 'Vinilo Reflectante',           unidad: 'metro', precio: 12.00 },
    { nombre: 'Vinilo Holográfico',           unidad: 'metro', precio: 11.00 },
    { nombre: 'Vinilo Flock (terciopelo)',    unidad: 'metro', precio: 8.50 },
    { nombre: 'Vinilo Fluorescente',          unidad: 'metro', precio: 9.50 },
    { nombre: 'Vinilo Puff (relieve)',        unidad: 'metro', precio: 7.50 },
    { nombre: 'Vinilo Luminiscente (glow)',   unidad: 'metro', precio: 13.00 }
  ];

  var DTF_INICIAL = [
    { nombre: 'Plancha DTF A5',             unidad: 'plancha', precio: 1.50 },
    { nombre: 'Plancha DTF A4',             unidad: 'plancha', precio: 2.20 },
    { nombre: 'Plancha DTF A3',             unidad: 'plancha', precio: 3.80 },
    { nombre: 'Plancha DTF A2',             unidad: 'plancha', precio: 6.50 },
    { nombre: 'Film DTF (rollo 30cm)',      unidad: 'metro',    precio: 2.00 },
    { nombre: 'Poliamida (polvo adhesivo)', unidad: 'kg',       precio: 25.00 }
  ];

  var SUBLIMACION_INICIAL = [
    { nombre: 'Papel sublimación A4',                 unidad: 'hoja', precio: 0.15 },
    { nombre: 'Papel sublimación A3',                 unidad: 'hoja', precio: 0.30 },
    { nombre: 'Tinta sublimación (set 4 colores)',    unidad: 'ud',   precio: 45.00 },
    { nombre: 'Plancha sublimación taza',             unidad: 'ud',   precio: 1.50 },
    { nombre: 'Plancha sublimación textil poliéster', unidad: 'ud',   precio: 2.00 }
  ];

  var MANO_INICIAL = [
    { nombre: 'Diseño personalizado',    tipo: 'hora',   precio: 25.00 },
    { nombre: 'Preparación de archivos', tipo: 'fijo',   precio: 5.00 },
    { nombre: 'Colocación y planchado',  tipo: 'unidad', precio: 0.80 },
    { nombre: 'Packaging individual',    tipo: 'unidad', precio: 0.50 },
    { nombre: 'Envío península',         tipo: 'fijo',   precio: 5.90 },
    { nombre: 'Envío Baleares',          tipo: 'fijo',   precio: 8.50 }
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

  // ── Migración desde esquemas antiguos ──────────────

  function migrarSiHaceFalta() {
    if (window.Storage.get(K.vinilos, null)) return;

    var materiales = window.Storage.get(K_OLD.materiales, null);
    if (materiales) {
      var vinilos = [], dtf = [], subli = [];
      materiales.forEach(function (m) {
        var n = (m.nombre || '').toLowerCase();
        if (n.indexOf('vinilo') >= 0) { vinilos.push(m); return; }
        if (n.indexOf('dtf') >= 0 || n.indexOf('poliamida') >= 0) { dtf.push(m); return; }
        if (n.indexOf('sublim') >= 0) { subli.push(m); return; }
      });
      window.Storage.set(K.vinilos,     vinilos.length ? vinilos : conId(VINILOS_INICIAL));
      window.Storage.set(K.dtf,         dtf.length     ? dtf     : conId(DTF_INICIAL));
      window.Storage.set(K.sublimacion, subli.length   ? subli   : conId(SUBLIMACION_INICIAL));
      window.Storage.del(K_OLD.materiales);
      window.Storage.del(K_OLD.prendas);
      window.Storage.del(K_OLD.estampacion);
      console.log('[ArandaCrafts] Migración completada.');
    }
  }

  // ── API catálogos ──────────────────────────────────

  function getRopa()        { return cargarLista(K.ropa,        ROPA_INICIAL); }
  function setRopa(l)       { window.Storage.set(K.ropa, l); }

  function getVinilos()     { return cargarLista(K.vinilos,     VINILOS_INICIAL); }
  function setVinilos(l)    { window.Storage.set(K.vinilos, l); }

  function getDtf()         { return cargarLista(K.dtf,         DTF_INICIAL); }
  function setDtf(l)        { window.Storage.set(K.dtf, l); }

  function getSublimacion() { return cargarLista(K.sublimacion, SUBLIMACION_INICIAL); }
  function setSublimacion(l){ window.Storage.set(K.sublimacion, l); }

  function getMano()        { return cargarLista(K.mano,        MANO_INICIAL); }
  function setMano(l)       { window.Storage.set(K.mano, l); }

  function getMateriales() {
    return [].concat(getVinilos(), getDtf(), getSublimacion());
  }

  // ── Presupuestos ───────────────────────────────────

  function getPresupuestos()      { return window.Storage.get(K.presupuestos, []); }
  function setPresupuestos(lista) { window.Storage.set(K.presupuestos, lista); }

  function getEmisor() {
    return window.Storage.get(K.emisor, {
      nombre: 'ArandaCrafts', nif: '', direccion: '', telefono: '', email: ''
    });
  }
  function setEmisor(e) { window.Storage.set(K.emisor, e); }

  function siguienteNumero() {
    var año = new Date().getFullYear();
    var cont = window.Storage.get(K.contador, {});
    cont[año] = (cont[año] || 0) + 1;
    window.Storage.set(K.contador, cont);
    return año + '-' + String(cont[año]).padStart(3, '0');
  }

  function subtotalLinea(linea) {
    var c = parseFloat(linea.cantidad) || 0;
    var p = parseFloat(linea.precio) || 0;
    return Math.round(c * p * 100) / 100;
  }

  function totalPresupuesto(p) {
    if (!p || !p.lineas) return 0;
    var t = p.lineas.reduce(function (acc, l) { return acc + subtotalLinea(l); }, 0);
    return Math.round(t * 100) / 100;
  }

  function init() {
    migrarSiHaceFalta();
    var r = getRopa();
    var v = getVinilos(), d = getDtf(), s = getSublimacion(), m = getMano();
    console.log('[ArandaCrafts] Catálogo →',
      r.length + ' ropa, ' + v.length + ' vinilos, ' + d.length + ' DTF, ' +
      s.length + ' sublimación, ' + m.length + ' mano de obra.');
  }

  return {
    init: init,
    getRopa: getRopa,               setRopa: setRopa,
    getVinilos: getVinilos,         setVinilos: setVinilos,
    getDtf: getDtf,                 setDtf: setDtf,
    getSublimacion: getSublimacion, setSublimacion: setSublimacion,
    getMateriales: getMateriales,
    getMano: getMano,               setMano: setMano,
    getPresupuestos: getPresupuestos, setPresupuestos: setPresupuestos,
    getEmisor: getEmisor,           setEmisor: setEmisor,
    siguienteNumero: siguienteNumero,
    subtotalLinea: subtotalLinea,
    totalPresupuesto: totalPresupuesto
  };
})();
