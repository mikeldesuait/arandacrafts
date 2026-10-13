/* ArandaCrafts — Arranque */

(function () {
  'use strict';

  var KEY_TEMA = 'arandacrafts:tema';

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

  function mostrarVista(nombre) {
    var vistas = document.querySelectorAll('.vista');
    for (var i = 0; i < vistas.length; i++) vistas[i].classList.remove('activa');

    var target = document.getElementById('vista-' + nombre);
    if (target) target.classList.add('activa');

    var botones = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < botones.length; j++) {
      botones[j].classList.toggle('activa', botones[j].dataset.vista === nombre);
    }

    location.hash = nombre;
  }

  function initNav() {
    var botones = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < botones.length; i++) {
      botones[i].addEventListener('click', function () {
        mostrarVista(this.dataset.vista);
      });
    }
    var inicial = (location.hash || '#inicio').slice(1);
    mostrarVista(inicial || 'inicio');
  }

  function initTabsCatalogo() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var grupo = this.parentElement;
        var hermanos = grupo.querySelectorAll('.tab');
        for (var j = 0; j < hermanos.length; j++) hermanos[j].classList.remove('activa');
        this.classList.add('activa');

        var cont = grupo.parentElement;
        var paneles = cont.querySelectorAll('.tab-panel');
        for (var k = 0; k < paneles.length; k++) paneles[k].classList.remove('activa');

        var panel = document.getElementById('tab-' + this.dataset.tab);
        if (panel) panel.classList.add('activa');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.Modelo) window.Modelo.init();
    initTema();
    initNav();
    initTabsCatalogo();
    var st = document.getElementById('status-info');
    if (st) st.textContent = 'ArandaCrafts · v0.1 · ' + new Date().toLocaleDateString('es-ES');
  });

})();
