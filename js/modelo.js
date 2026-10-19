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
    mano:         'catalogo:mano_obra',
    clientes:     'clientes',
    stock_estructura: 'stock:estructura',
    registro_entradas: 'stock:registro',
    cosas_comunes: 'stock:cosas_comunes',
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

  var ROPA_INICIAL = [];

  var VINILOS_INICIAL = [];

  var DTF_INICIAL = [];

  var SUBLIMACION_INICIAL = [];

  var MANO_INICIAL = [
    { nombre: 'Diseño personalizado',    tipo: 'hora',   precio: 25.00 },
    { nombre: 'Preparación de archivos', tipo: 'fijo',   precio: 5.00 },
    { nombre: 'Colocación y planchado',  tipo: 'unidad', precio: 0.80 },
    { nombre: 'Packaging individual',    tipo: 'unidad', precio: 0.50 },
    { nombre: 'Envío península',         tipo: 'fijo',   precio: 5.90 },
    { nombre: 'Envío Baleares',          tipo: 'fijo',   precio: 8.50 }
  ];


  // ── Stock (Estructura de Carpetas) ─────────────────

  var STOCK_INICIAL = [
    {
      id: 's-ropa', nombre: 'Ropa', icono: '👕', categorias: [
        { id: 's-camisetas', nombre: 'Camisetas', icono: '👕' },
        { id: 's-sudaderas', nombre: 'Sudaderas', icono: '🧥' },
        { id: 's-pantalones', nombre: 'Pantalones', icono: '👖' }
      ]
    },
    {
      id: 's-vinilos', nombre: 'Vinilos', icono: '🎨', categorias: [
        { id: 's-vinilo-textil', nombre: 'Textil', icono: '🧵' },
        { id: 's-vinilo-permanente', nombre: 'Permanente', icono: '💎' }
      ]
    },
    {
      id: 's-personalizables', nombre: 'Personalizables', icono: '✨', categorias: [
        { id: 's-botellas', nombre: 'Botellas', icono: '🍶' },
        { id: 's-tazas', nombre: 'Tazas', icono: '☕' },
        { id: 's-llaveros', nombre: 'Llaveros', icono: '🔑' },
        { id: 's-peluches', nombre: 'Peluches', icono: '🧸' }
      ]
    }
  ];

  function getStockEstructura() {
    var datos = window.Storage.get(K.stock_estructura, null);
    if (!datos) {
      datos = STOCK_INICIAL;
      window.Storage.set(K.stock_estructura, datos);
    }
    return datos;
  }

  function setStockEstructura(datos) {
    window.Storage.set(K.stock_estructura, datos);
  }


  // ── Productos (Dentro de Stock) ─────────────────────

  function getProductos(catId, subcatId) {
    var est = getStockEstructura();
    var cat = est.find(function(c){ return c.id === catId; });
    if (!cat || !cat.categorias) return [];
    var sub = cat.categorias.find(function(c){ return c.id === subcatId; });
    if (!sub) return [];
    return sub.productos || [];
  }

  function setProductos(catId, subcatId, lista) {
    var est = getStockEstructura();
    var cat = est.find(function(c){ return c.id === catId; });
    if (!cat || !cat.categorias) return;
    var sub = cat.categorias.find(function(c){ return c.id === subcatId; });
    if (!sub) return;
    
    sub.productos = lista;
    setStockEstructura(est);
  }

  // Obtener TODOS los productos de la app (para el desplegable de presupuestos)
  function getTodosLosProductos() {
    var est = getStockEstructura();
    var todos = [];
    est.forEach(function(cat) {
      if (!cat.categorias) return;
      cat.categorias.forEach(function(sub) {
        if (!sub.productos) return;
        sub.productos.forEach(function(p) {
          todos.push({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            coste: p.coste,
            iva: p.iva !== undefined ? p.iva : 21,
            precio_tipo: p.precio_tipo || 'sin_iva',
            notas: p.notas,
            icono: p.icono || '📦',
            variantes: p.variantes || [],
            tipo: cat.nombre,
            categoria: sub.nombre,
            catId: cat.id,
            subcatId: sub.id
          });
        });
      });
    });
    return todos;
  }


  // ── Registro de ropa de clientes ────────────────────

  function getRopaClientes() {
    return window.Storage.get(K.registro_entradas, []);
  }

  function setRopaClientes(lista) {
    window.Storage.set(K.registro_entradas, lista);
  }

  function addRopaCliente(entrada) {
    var lista = getRopaClientes();
    lista.push(entrada);
    setRopaClientes(lista);
  }


  // ── Cosas Comunes (Botones rápidos personalizables) ──

  var COSAS_COMUNES_INICIALES = [
    { nombre: 'Camisetas', icono: '👕' },
    { nombre: 'Sudaderas', icono: '🧥' },
    { nombre: 'Pantalones cortos', icono: '🩳' },
    { nombre: 'Pantalones largos', icono: '👖' },
    { nombre: 'Tazas', icono: '☕' },
    { nombre: 'Botellas', icono: '🍶' },
    { nombre: 'Llaveros', icono: '🔑' },
    { nombre: 'Peluches', icono: '🧸' }
  ];

  function getCosasComunes() {
    var data = window.Storage.get(K.cosas_comunes, null);
    if (!data) {
      // Primera vez, cargamos las por defecto
      window.Storage.set(K.cosas_comunes, COSAS_COMUNES_INICIALES);
      return COSAS_COMUNES_INICIALES;
    }
    return data;
  }

  function setCosasComunes(lista) {
    window.Storage.set(K.cosas_comunes, lista);
  }


  // ── Mano de Obra (Independiente) ────────────────────

  

  function getManoObra() {
    var data = window.Storage.get(K.mano, null);
    if (!data) {
      data = MANO_INICIAL;
      window.Storage.set(K.mano, data);
    }
    return data;
  }

  function setManoObra(lista) {
    window.Storage.set(K.mano, lista);
  }

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

  function getClientes()      { return window.Storage.get(K.clientes, []); }
  function setClientes(l)     { window.Storage.set(K.clientes, l); }

  function buscarClientePorId(id) {
    if (!id) return null;
    return getClientes().find(function (c) { return c.id === id; }) || null;
  }

  // ── Presupuestos ───────────────────────────────────

  function getPresupuestos()      { return window.Storage.get(K.presupuestos, []); }
  function setPresupuestos(lista) { window.Storage.set(K.presupuestos, lista); }

  function getEmisor() {
    return window.Storage.get(K.emisor, {
      marca:     'Aranda Crafts',
      eslogan:   'Estampación textil · Vinilo · DTF',
      nombre:    '',
      nif:       '',
      direccion: '',
      telefono:  '',
      email:     '',
      web:       '',
      iban:      ''
    });
  }
  function setEmisor(e) { window.Storage.set(K.emisor, e); }

  var PREFIJOS = {
    presupuesto: 'PRE',
    albaran:     'ALB',
    factura:     'FAC',
    orden:       'OT'
  };

  function siguienteNumero(tipo) {
    tipo = tipo || 'presupuesto';
    var prefijo = PREFIJOS[tipo] || 'PRE';
    var año = new Date().getFullYear();
    var clave = tipo + ':' + año;
    var cont = window.Storage.get(K.contador, {});
    cont[clave] = (cont[clave] || 0) + 1;
    window.Storage.set(K.contador, cont);
    return prefijo + '-' + año + '-' + String(cont[clave]).padStart(3, '0');
  }

  function prefijoDeTipo(tipo) {
    return PREFIJOS[tipo] || 'PRE';
  }

  function etiquetaDeTipo(tipo) {
    var e = {
      presupuesto: 'PRESUPUESTO',
      albaran:     'ALBARÁN',
      factura:     'FACTURA',
      orden:       'ORDEN DE TRABAJO'
    };
    return e[tipo] || 'PRESUPUESTO';
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
    var c = getClientes();
    var v = getVinilos(), d = getDtf(), s = getSublimacion(), m = getMano();
    console.log('[ArandaCrafts] Catálogo →',
      c.length + ' clientes, ' + r.length + ' ropa, ' + v.length + ' vinilos, ' + d.length + ' DTF, ' +
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
    getStockEstructura: getStockEstructura, setStockEstructura: setStockEstructura,
    getManoObra: getManoObra, setManoObra: setManoObra,
    getRopaClientes: getRopaClientes, setRopaClientes: setRopaClientes, addRopaCliente: addRopaCliente,
    getCosasComunes: getCosasComunes, setCosasComunes: setCosasComunes,
    getProductos: getProductos, setProductos: setProductos, getTodosLosProductos: getTodosLosProductos,
    getClientes: getClientes,       setClientes: setClientes,
    buscarClientePorId: buscarClientePorId,
    getPresupuestos: getPresupuestos, setPresupuestos: setPresupuestos,
    getEmisor: getEmisor,           setEmisor: setEmisor,
    siguienteNumero: siguienteNumero,
    prefijoDeTipo: prefijoDeTipo,
    etiquetaDeTipo: etiquetaDeTipo,
    subtotalLinea: subtotalLinea,
    totalPresupuesto: totalPresupuesto
  };
})();
