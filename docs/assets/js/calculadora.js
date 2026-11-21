/* Motor de cálculo da rescisão trabalhista (estimativa informativa, valores brutos).
   Tudo roda no navegador do visitante: nenhum dado é enviado ou guardado.
   Regras e percentuais: regras-trabalhistas.js. Premissas documentadas: tools/CALCULADORA-PREMISSAS.md
   Testes: tests/calculadora.test.html (rodar sempre que mudar algo). */
(function (root) {
  'use strict';

  function pd(s) { var p = String(s).split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
  function valida(d) { return d instanceof Date && !isNaN(d.getTime()); }
  function addMonths(d, n) {
    var t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
    var ultimo = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
    t.setUTCDate(Math.min(d.getUTCDate(), ultimo));
    return t;
  }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function diasEntre(a, b) { return Math.round((b - a) / 86400000); }
  function ultimoDiaDoMes(d) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); }
  function anosCompletos(a, b) { var n = 0; while (addMonths(a, 12 * (n + 1)) <= b) n++; return n; }
  // meses inteiros + 1 se sobrar 15 dias ou mais (fração superior a 14 dias, art. 146, parágrafo único, da CLT)
  function mesesArredondados(a, b) {
    var m = 0; while (addMonths(a, m + 1) <= b) m++;
    var sobra = diasEntre(addMonths(a, m), b);
    return { inteiros: m, sobra: sobra, arredondado: m + (sobra >= 15 ? 1 : 0) };
  }
  // 13º: conta o mês em que houve 15 dias ou mais de trabalho (Lei 4.090/1962, art. 1º, § 2º)
  function meses13NoAno(inicio, fim) {
    var y = fim.getUTCFullYear(), n = 0;
    for (var m = inicio.getUTCMonth(); m <= fim.getUTCMonth(); m++) {
      var di = (m === inicio.getUTCMonth()) ? inicio.getUTCDate() : 1;
      var dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      var df = (m === fim.getUTCMonth()) ? fim.getUTCDate() : dim;
      if (df - di + 1 >= 15) n++;
    }
    return n;
  }
  function meses13(adm, real, proj) {
    var total = 0;
    for (var y = real.getUTCFullYear(); y <= proj.getUTCFullYear(); y++) {
      var fimAno = (y === proj.getUTCFullYear()) ? proj : new Date(Date.UTC(y, 11, 31));
      var inicio = (adm.getUTCFullYear() === y) ? adm : new Date(Date.UTC(y, 0, 1));
      if (inicio <= fimAno) total += meses13NoAno(inicio, fimAno);
    }
    return total;
  }
  function r2(x) { return Math.round(x * 100) / 100; }

  /* entrada: { salario, admissao:'AAAA-MM-DD', desligamento:'AAAA-MM-DD', tipo,
                aviso: 'indenizado' | 'trabalhado' | 'dispensado' | 'nao_cumprido',
                feriasVencidas: 0|1|2, saldoFgts: número|null }
     saída: { ok:false, erro } ou { ok:true, itens, total, fgts, avisos, avisoDias, resumo } */
  function calcular(inp, R) {
    R = R || root.REGRAS_TRABALHISTAS;
    var t = R.tipos[inp.tipo];
    if (!t) return { ok: false, erro: 'Escolha o tipo de desligamento.' };
    var salario = Number(inp.salario);
    if (!(salario > 0) || salario > 1000000) return { ok: false, erro: 'Informe um salário mensal válido.' };
    var adm = pd(inp.admissao), fim = pd(inp.desligamento);
    if (!inp.admissao || !valida(adm)) return { ok: false, erro: 'Informe a data de admissão.' };
    if (!inp.desligamento || !valida(fim)) return { ok: false, erro: 'Informe a data de desligamento.' };
    if (fim < adm) return { ok: false, erro: 'A data de desligamento não pode ser anterior à admissão.' };

    var itens = [], avisos = [];
    var anos = anosCompletos(adm, fim);
    var aviso = inp.aviso || 'indenizado';
    // compatibilidade: no pedido de demissão, "indenizado" significa aviso não cumprido pelo empregado
    if (t.descontaAvisoNaoCumprido && aviso === 'indenizado') aviso = 'nao_cumprido';
    var indenizado = (aviso === 'indenizado');

    // Saldo de salário: dias trabalhados no mês do desligamento (base de 30 dias).
    // Se a admissão foi no mesmo mês, conta a partir do dia da admissão. Mês completo = 30 dias.
    var mesmoMes = adm.getUTCFullYear() === fim.getUTCFullYear() && adm.getUTCMonth() === fim.getUTCMonth();
    var diasMes = mesmoMes ? (fim.getUTCDate() - adm.getUTCDate() + 1) : fim.getUTCDate();
    var mesCompleto = !mesmoMes && fim.getUTCDate() === ultimoDiaDoMes(fim);
    if (mesCompleto || diasMes > 30) diasMes = 30;
    var saldo = salario / 30 * diasMes;
    itens.push({ nome: 'Saldo de salário', valor: r2(saldo), nota: diasMes + (diasMes === 1 ? ' dia trabalhado' : ' dias trabalhados') + ' no mês do desligamento' });

    // Aviso-prévio (Lei 12.506/2011: 30 dias + 3 por ano completo, até 90)
    var avisoDias = 0, avisoValor = 0;
    if (t.aviso !== 'nenhum') {
      avisoDias = Math.min(R.avisoBaseDias + R.avisoDiasPorAnoCompleto * anos, R.avisoMaximoDias);
      if (indenizado) {
        avisoValor = salario / 30 * avisoDias * (t.aviso === 'metade' ? 0.5 : 1);
        itens.push({ nome: 'Aviso-prévio indenizado', valor: r2(avisoValor), nota: avisoDias + ' dias' + (t.aviso === 'metade' ? ', pago pela metade no acordo (art. 484-A da CLT)' : ' (proporcional ao tempo de serviço)') });
      } else {
        avisos.push('Aviso-prévio trabalhado: o período de ' + avisoDias + ' dias é pago como salário normal, sem verba rescisória adicional.');
      }
    }
    if (t.descontaAvisoNaoCumprido) {
      if (aviso === 'nao_cumprido') {
        itens.push({ nome: 'Desconto do aviso-prévio não cumprido', valor: -r2(salario), nota: 'a empresa pode descontar até 30 dias de salário (art. 487, § 2º, da CLT)', negativo: true });
      } else if (aviso === 'dispensado') {
        avisos.push('Como a empresa dispensou o cumprimento do aviso-prévio, não há desconto.');
      }
    }

    // Data considerada para 13º e férias: o aviso indenizado conta como tempo de serviço (art. 487, § 1º, da CLT)
    var proj = (t.projeta && indenizado) ? addDays(fim, avisoDias) : fim;

    // 13º salário proporcional
    var v13 = 0;
    if (t.decimoTerceiro) {
      var m13 = meses13(adm, fim, proj);
      v13 = salario * m13 / 12;
      itens.push({ nome: '13º salário proporcional', valor: r2(v13), nota: m13 + '/12 avos' });
    }

    // Férias proporcionais + 1/3
    if (t.feriasProporcionais) {
      var inicioPeriodo = addMonths(adm, 12 * anosCompletos(adm, proj));
      var mf = Math.min(mesesArredondados(inicioPeriodo, proj).arredondado, 12);
      itens.push({ nome: 'Férias proporcionais + 1/3', valor: r2(salario * mf / 12 * 4 / 3), nota: mf + '/12 avos, acrescidas de 1/3' });
    }

    // Férias vencidas + 1/3 (informadas pelo usuário)
    var nv = Number(inp.feriasVencidas) || 0;
    if (nv > 0) {
      itens.push({ nome: 'Férias vencidas + 1/3', valor: r2(salario * 4 / 3 * nv), nota: nv + (nv === 1 ? ' período completo' : ' períodos completos') });
      avisos.push('Férias vencidas e não concedidas dentro do prazo legal devem ser pagas em dobro (art. 137 da CLT). Esta estimativa não aplica a dobra.');
    }

    var total = 0;
    itens.forEach(function (i) { total += i.valor; });

    // FGTS (informativo: o valor fica na conta vinculada, não entra no termo de rescisão)
    var mesesContrato = mesesArredondados(adm, fim).arredondado;
    var saldoBase;
    if (inp.saldoFgts !== null && inp.saldoFgts !== undefined && inp.saldoFgts !== '' && Number(inp.saldoFgts) >= 0) {
      saldoBase = Number(inp.saldoFgts);
    } else {
      saldoBase = salario * R.fgtsAliquota * mesesContrato * 13 / 12;
      avisos.push('O saldo do FGTS foi estimado em 8% do salário por mês de contrato, incluindo o 13º. Para mais precisão, informe o saldo que aparece no extrato do FGTS.');
    }
    var fgtsRescisorio = R.fgtsAliquota * (saldo + v13 + avisoValor);
    var multa = (saldoBase + fgtsRescisorio) * t.multaFgts;

    // Observações específicas
    if (inp.tipo === 'termino') avisos.push('Se o contrato por prazo determinado foi encerrado antes do prazo pela empresa, pode haver indenização adicional (art. 479 da CLT), não incluída nesta estimativa.');
    if (inp.tipo === 'acordo') avisos.push('No acordo, a estimativa considera o período integral do aviso-prévio para o cálculo do 13º e das férias. Esse ponto pode variar conforme o caso.');
    if (inp.tipo === 'indireta') avisos.push('A rescisão indireta depende do reconhecimento da falta grave do empregador, geralmente pela Justiça do Trabalho. Os valores só são devidos nessa hipótese.');
    if (inp.tipo === 'justa') avisos.push('Na dispensa por justa causa, em regra, são devidos apenas o saldo de salário e as férias vencidas com 1/3. Não há saque do FGTS nem multa.');

    var tempoMeses = mesesContrato;
    var aa = Math.floor(tempoMeses / 12), mm = tempoMeses % 12;
    var tempo = (aa > 0 ? aa + (aa === 1 ? ' ano' : ' anos') : '') + (mm > 0 ? (aa > 0 ? ' e ' : '') + mm + (mm === 1 ? ' mês' : ' meses') : '');
    if (tempo === '') tempo = 'menos de 1 mês';

    return {
      ok: true, itens: itens, total: r2(total), avisos: avisos, avisoDias: avisoDias,
      fgts: {
        saldoBase: r2(saldoBase), fgtsRescisorio: r2(fgtsRescisorio), multa: r2(multa),
        multaPercentual: Math.round(t.multaFgts * 100), saquePercentual: Math.round(t.saqueFgts * 100)
      },
      resumo: { tipoRotulo: t.rotulo, tempoContrato: tempo, anos: anos }
    };
  }

  root.Rescisao = { calcular: calcular };
})(window);
