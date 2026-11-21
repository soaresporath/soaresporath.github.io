/* Comportamentos comuns do site: menu do celular, cabeçalho ao rolar, entrada suave, fotos com espaço reservado,
   brilho nos cartões de área, painel de temas da página inicial, mapa sob demanda e mensagem automática do WhatsApp.
   Todo o conteúdo existe sem JavaScript; aqui ficam só melhorias. */
(function () {
  'use strict';
  var TEL = '5511989443124';
  var PADRAO = 'Olá! Vim pelo site da Soares Porath Advocacia e gostaria de conversar com um advogado do escritório.';

  // Fotos: se o arquivo não existir, mostra o espaço reservado
  document.querySelectorAll('.foto').forEach(function (f) {
    var img = f.querySelector('img');
    var label = f.getAttribute('data-label') || '';
    function vazio() {
      if (img) img.remove();
      if (label && !f.querySelector('.foto-vazia')) { var d = document.createElement('div'); d.className = 'foto-vazia'; d.textContent = label; f.appendChild(d); }
    }
    if (!img) return vazio();
    if (img.complete && img.naturalWidth === 0) vazio();
    img.addEventListener('error', vazio);
  });

  // Menu do celular
  var t = document.querySelector('[data-menu-toggle]'), m = document.querySelector('[data-menu]');
  function fecha() { m.classList.remove('aberto'); t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-label', 'Abrir menu'); t.textContent = '☰'; }
  if (t && m) {
    t.addEventListener('click', function () {
      var o = m.classList.toggle('aberto');
      t.setAttribute('aria-expanded', o); t.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu'); t.textContent = o ? '✕' : '☰';
    });
    m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fecha); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('aberto')) { fecha(); t.focus(); } });
  }

  // Cabeçalho muda ao rolar
  var h = document.querySelector('[data-header]');
  function onScroll() { if (h) h.classList.toggle('rolado', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Entrada suave (desligada para quem prefere menos movimento)
  var els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(function (e) { e.classList.add('visivel'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  window.addEventListener('beforeprint', function () { els.forEach(function (e) { e.classList.add('visivel'); }); });

  // Brilho que acompanha o mouse nos cartões de área
  document.querySelectorAll('.area').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // WhatsApp: todo link sem mensagem recebe a mensagem automática da página (<body data-wa="...">)
  function mensagemDaPagina() { return (document.body && document.body.dataset.wa) || PADRAO; }
  function comMensagem(a) {
    var href = a.getAttribute('href') || '';
    if (href.indexOf('wa.me/') === -1 || /[?&]text=/.test(href)) return;
    a.setAttribute('href', href.split('?')[0] + '?text=' + encodeURIComponent(mensagemDaPagina()));
  }
  document.querySelectorAll('a[href*="wa.me/"]').forEach(comMensagem);
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href*="wa.me/"]'); if (a) comMensagem(a); }, true);
  window.SP_WA = function (texto) { return 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(texto); };

  // Página inicial: painel "Sobre o que você quer conversar?"
  var painel = document.getElementById('painel');
  if (painel) {
    var TEMAS = {
      familia: { tag: 'Família e Sucessões', t: 'Decisões familiares pedem técnica e sensibilidade.', d: 'Divórcio, guarda, alimentos e sucessões envolvem relações e patrimônio. Cuidamos de cada aspecto com atenção.', i: ['Divórcio, guarda e convivência', 'Pensão alimentícia', 'Inventário e planejamento sucessório'], w: 'Olá! Vim pelo site e gostaria de conversar com o escritório sobre Direito de Família e Sucessões.', l: 'areas/familia-sucessoes.html', lt: 'Conheça a área' },
      prev: { tag: 'Previdenciário', t: 'Aposentadoria começa com uma boa leitura do seu histórico.', d: 'A análise do CNIS e das regras aplicáveis ajuda a compreender o momento e o caminho mais adequados.', i: ['Aposentadorias e planejamento', 'Benefícios por incapacidade e pensão por morte', 'Revisões e análise de CNIS'], w: 'Olá! Vim pelo site e gostaria de conversar com o escritório sobre aposentadoria e previdência.', l: 'areas/previdenciario.html', lt: 'Conheça a área' },
      aviacao: { tag: 'Direito do Aeronauta', t: 'Sua trajetória na aviação merece um planejamento à altura.', d: 'Períodos em empresas nacionais e estrangeiras, regras da atividade e histórico contributivo fazem diferença na vida previdenciária do profissional da aviação.', i: ['Planejamento previdenciário do aeronauta', 'Análise de períodos contributivos', 'Vínculos nacionais e internacionais'], w: 'Olá! Vim pelo site e gostaria de conversar com o escritório sobre Direito do Aeronauta e da Aviação.', l: 'areas/aeronauta-aviacao.html', lt: 'Conheça a área' },
      trab: { tag: 'Trabalhista', t: 'Entenda as verbas da sua rescisão.', d: 'Use a calculadora logo abaixo para uma estimativa e converse com nossa equipe para verificar se todos os seus direitos foram considerados.', i: ['Verbas rescisórias', 'Rescisão indireta', 'Jornada e vínculo de emprego'], w: 'Olá! Vim pelo site e gostaria de conversar com o escritório sobre uma rescisão trabalhista.', l: '#calculadora', lt: 'Calcular agora' },
      consumo: { tag: 'Cível e Consumidor', t: 'Quando um dano exige uma resposta jurídica.', d: 'Atuação em responsabilidade civil, indenizações, erro médico e relações de consumo, com análise atenta de cada situação.', i: ['Indenizações', 'Erro médico', 'Relações de consumo'], w: 'Olá! Vim pelo site e gostaria de conversar com o escritório sobre uma questão cível ou de consumo.', l: 'areas/civel-consumidor.html', lt: 'Conheça a área' },
      educ: { tag: 'Direito Educacional', t: 'A relação com a instituição de ensino também tem regras.', d: 'Contratos, mensalidades, matrícula e financiamento estudantil, para estudantes e famílias.', i: ['Contratos e mensalidades', 'Matrícula e cancelamento', 'Financiamento estudantil'], w: 'Olá! Vim pelo site e gostaria de conversar com o escritório sobre Direito Educacional.', l: 'areas/educacional.html', lt: 'Conheça a área' }
    };
    var mostra = function (k) {
      var x = TEMAS[k]; if (!x) return;
      painel.innerHTML = '<div class="troca" style="display:flex;flex-direction:column;height:100%"><span class="tag">' + x.tag + '</span><h3>' + x.t + '</h3><p>' + x.d + '</p><ul>' +
        x.i.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul><div class="acoes"><a class="btn btn-gold" target="_blank" rel="noopener" data-evento="whatsapp_tema" href="' + window.SP_WA(x.w) + '">Fale com nossos advogados</a><a class="btn btn-ghost" href="' + x.l + '">' + x.lt + '</a></div></div>';
    };
    document.querySelectorAll('.tema').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.tema').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true'); mostra(b.dataset.t);
      });
    });
  }

  // Mapa: só carrega o Google Maps quando o visitante pede (privacidade)
  document.querySelectorAll('[data-mapa]').forEach(function (bt) {
    bt.addEventListener('click', function () {
      var caixa = bt.closest('.mapa'); if (!caixa) return;
      var f = document.createElement('iframe');
      f.src = bt.getAttribute('data-mapa'); f.title = 'Mapa com a localização do escritório'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      caixa.innerHTML = ''; caixa.appendChild(f); caixa.classList.add('carregado');
    });
  });
})();
