/* Tela da calculadora de rescisão (o cálculo fica em calculadora.js; as regras em regras-trabalhistas.js).
   Nada do que o visitante digita é enviado ou guardado. */
(function () {
  'use strict';
  var form = document.getElementById('form-calc'), out = document.getElementById('resultado'), erro = document.getElementById('erro');
  if (!form || !out || !window.Rescisao) return;
  var tipo = document.getElementById('tipo'), grupo = document.getElementById('grupo-aviso'), dica = document.getElementById('dica-aviso');
  var fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), ultimo = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Opções de aviso-prévio conforme o tipo de desligamento
  function ajustaAviso() {
    var t = tipo.value, pedido = t === 'pedido', semAviso = (t === 'termino' || t === 'justa');
    grupo.hidden = semAviso;
    grupo.querySelectorAll('label').forEach(function (l) {
      var para = l.getAttribute('data-para');
      l.hidden = (para === 'pedido' && !pedido) || (para === 'empresa' && pedido);
    });
    var marcado = grupo.querySelector('input:checked');
    if (!marcado || marcado.closest('label').hidden) {
      var primeiro = grupo.querySelector('label:not([hidden]) input'); if (primeiro) primeiro.checked = true;
    }
    dica.textContent = pedido
      ? 'No pedido de demissão, se você não cumprir o aviso, a empresa pode descontar até 30 dias de salário. Se ela dispensou o cumprimento, não há desconto.'
      : (t === 'acordo' ? 'No acordo, o aviso indenizado é pago pela metade.' : '');
  }
  tipo.addEventListener('change', ajustaAviso); ajustaAviso();

  function mensagem(incluir) {
    if (!incluir || !ultimo) return 'Olá! Usei a calculadora do site e gostaria de conversar com um advogado sobre a minha rescisão.';
    return 'Olá! Usei a calculadora do site. Tipo de desligamento: ' + ultimo.resumo.tipoRotulo + '; tempo de contrato: ' + ultimo.resumo.tempoContrato + '; estimativa (valor bruto): ' + fmt.format(ultimo.total) + '. Gostaria de conversar com um advogado sobre a minha rescisão.';
  }
  function atualizaLink() {
    var cb = document.getElementById('incluir'), a = document.getElementById('cta-calc');
    if (a) a.href = window.SP_WA ? window.SP_WA(mensagem(cb && cb.checked)) : 'https://wa.me/5511989443124?text=' + encodeURIComponent(mensagem(cb && cb.checked));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var r = window.Rescisao.calcular({
      salario: d.get('salario'), admissao: d.get('admissao'), desligamento: d.get('desligamento'), tipo: d.get('tipo'),
      aviso: grupo.hidden ? 'indenizado' : d.get('aviso'), feriasVencidas: d.get('feriasVencidas'),
      saldoFgts: d.get('saldoFgts') === '' ? null : d.get('saldoFgts')
    });
    if (!r.ok) { erro.textContent = r.erro; return; }
    erro.textContent = ''; ultimo = r;
    var linhas = r.itens.map(function (i) { return '<tr class="' + (i.negativo ? 'neg' : '') + '"><td>' + esc(i.nome) + '<small>' + esc(i.nota) + '</small></td><td>' + fmt.format(i.valor) + '</td></tr>'; }).join('');
    var f = r.fgts;
    var saque = f.saquePercentual === 100 ? 'Saque do saldo do FGTS permitido nesta modalidade.' : (f.saquePercentual > 0 ? 'Saque de até ' + f.saquePercentual + '% do saldo do FGTS nesta modalidade.' : 'Nesta modalidade, em regra, não há saque do FGTS.');
    out.innerHTML = '<span class="chip"><i></i>Estimativa das verbas rescisórias</span>' +
      '<div class="total">' + fmt.format(r.total) + '</div>' +
      '<p class="sub">Valor bruto estimado, sem descontos de INSS e Imposto de Renda · ' + esc(r.resumo.tipoRotulo) + ' · ' + esc(r.resumo.tempoContrato) + ' de contrato</p>' +
      '<table><tbody>' + linhas + '</tbody></table>' +
      '<h4>FGTS (conta vinculada)</h4><table><tbody>' +
      '<tr><td>Saldo considerado<small>depósitos acumulados</small></td><td>' + fmt.format(f.saldoBase) + '</td></tr>' +
      '<tr><td>FGTS sobre as verbas da rescisão<small>8% sobre saldo de salário, 13º e aviso indenizado</small></td><td>' + fmt.format(f.fgtsRescisorio) + '</td></tr>' +
      (f.multaPercentual > 0 ? '<tr><td>Multa de ' + f.multaPercentual + '%<small>depositada na conta vinculada</small></td><td>' + fmt.format(f.multa) + '</td></tr>' : '') +
      '</tbody></table><p class="sub" style="margin-top:8px">' + saque + '</p>' +
      (r.avisos.length ? '<h4>Observações</h4><ul>' + r.avisos.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="convite"><p>Quer compreender melhor os valores da sua rescisão e verificar se todos os seus direitos foram considerados? Nossa equipe pode ajudar você a analisar sua situação.</p>' +
      '<label><input type="checkbox" id="incluir"> Incluir na mensagem o tipo de desligamento, o tempo de contrato e o valor estimado</label>' +
      '<a id="cta-calc" class="btn btn-gold" target="_blank" rel="noopener" data-evento="whatsapp_calculadora" href="#">Quero conversar com um advogado</a></div>' +
      '<p class="nota">Estimativa informativa com base em regras gerais da CLT. Não é cálculo oficial nem garantia de valores. Nenhum dado digitado é enviado ou guardado.</p>';
    document.getElementById('incluir').addEventListener('change', atualizaLink); atualizaLink();
    if (window.innerWidth < 1000) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    out.focus({ preventScroll: true });
  });
})();
