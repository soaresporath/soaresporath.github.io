/* Comportamentos comuns das prévias: fotos com espaço reservado, menu mobile, entrada suave, cabeçalho ao rolar. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  // Fotos: se o arquivo não existir, mostra o espaço reservado
  document.querySelectorAll('.foto').forEach(function (f) {
    var img = f.querySelector('img');
    var label = f.getAttribute('data-label') || 'Fotografia profissional';
    function vazio() {
      if (img) img.remove();
      if (!f.querySelector('.foto-vazia')) { var d = document.createElement('div'); d.className = 'foto-vazia'; d.textContent = label; f.appendChild(d); }
    }
    if (!img) return vazio();
    if (img.complete && img.naturalWidth === 0) vazio();
    img.addEventListener('error', vazio);
  });
  // Menu mobile
  var t = document.querySelector('[data-menu-toggle]'), m = document.querySelector('[data-menu]');
  if (t && m) {
    t.addEventListener('click', function () {
      var o = m.classList.toggle('aberto'); t.setAttribute('aria-expanded', o); document.body.classList.toggle('menu-aberto', o);
    });
    m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { m.classList.remove('aberto'); t.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-aberto'); }); });
  }
  // Cabeçalho muda ao rolar
  var h = document.querySelector('[data-header]');
  function onScroll() { if (h) h.classList.toggle('rolado', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // Entrada suave
  var els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(function (e) { e.classList.add('visivel'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  window.addEventListener('beforeprint', function () { els.forEach(function (e) { e.classList.add('visivel'); }); });

  // WhatsApp: todo link sem mensagem recebe uma mensagem automática de acordo com a página.
  // Uma página pode definir a própria mensagem com <body data-wa="...">.
  var PADRAO = 'Olá! Vim pelo site da Soares Porath Advocacia e gostaria de conversar com um advogado do escritório.';
  var POR_PAGINA = {
    '3-visao-valores.html': 'Olá! Conheci a missão, a visão e os valores do escritório pelo site e gostaria de conversar com um advogado.',
    '3-trabalhe-conosco.html': 'Olá! Vim pelo site da Soares Porath Advocacia e gostaria de conversar com o escritório.',
    '3-privacidade.html': 'Olá! Vim pelo site e gostaria de tirar uma dúvida sobre privacidade e proteção dos meus dados.',
    '3-cuidado-com-golpes.html': 'Olá! Recebi um contato em nome do escritório Soares Porath Advocacia e gostaria de confirmar se ele é verdadeiro.'
  };
  function mensagemDaPagina() {
    if (document.body.dataset.wa) return document.body.dataset.wa;
    var arquivo = (location.pathname.split('/').pop() || '').toLowerCase();
    return POR_PAGINA[arquivo] || PADRAO;
  }
  function comMensagem(a) {
    var href = a.getAttribute('href') || '';
    if (href.indexOf('wa.me/') === -1 || /[?&]text=/.test(href)) return;
    a.setAttribute('href', href.split('?')[0] + '?text=' + encodeURIComponent(mensagemDaPagina()));
  }
  function aplicaWhats() { document.querySelectorAll('a[href*="wa.me/"]').forEach(comMensagem); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicaWhats); else aplicaWhats();
  // garantia extra para links criados depois (ex.: painel de temas, resultado da calculadora)
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href*="wa.me/"]'); if (a) comMensagem(a); }, true);
})();
