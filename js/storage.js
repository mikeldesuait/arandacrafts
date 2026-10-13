/* ArandaCrafts — Capa de persistencia (localStorage) */

window.Storage = (function () {
  'use strict';

  var PREFIX = 'arandacrafts:';

  function clave(k) { return PREFIX + k; }

  function get(k, defecto) {
    try {
      var raw = localStorage.getItem(clave(k));
      if (raw === null) return defecto;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[storage] Error leyendo', k, e);
      return defecto;
    }
  }

  function set(k, valor) {
    try {
      localStorage.setItem(clave(k), JSON.stringify(valor));
      return true;
    } catch (e) {
      console.warn('[storage] Error guardando', k, e);
      return false;
    }
  }

  function del(k) {
    localStorage.removeItem(clave(k));
  }

  function exportarTodo() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var full = localStorage.key(i);
      if (full && full.indexOf(PREFIX) === 0) {
        out[full.slice(PREFIX.length)] = localStorage.getItem(full);
      }
    }
    return out;
  }

  function importarTodo(obj) {
    if (!obj || typeof obj !== 'object') return false;
    Object.keys(obj).forEach(function (k) {
      localStorage.setItem(PREFIX + k, obj[k]);
    });
    return true;
  }

  function borrarTodo() {
    var claves = [];
    for (var i = 0; i < localStorage.length; i++) {
      var full = localStorage.key(i);
      if (full && full.indexOf(PREFIX) === 0) claves.push(full);
    }
    claves.forEach(function (k) { localStorage.removeItem(k); });
  }

  function uuid() {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  return {
    get: get,
    set: set,
    del: del,
    exportarTodo: exportarTodo,
    importarTodo: importarTodo,
    borrarTodo: borrarTodo,
    uuid: uuid
  };
})();
