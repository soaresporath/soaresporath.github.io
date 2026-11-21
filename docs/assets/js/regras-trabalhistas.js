/* Regras usadas pela calculadora de rescisão.
   ATUALIZAÇÃO: quando a lei mudar, altere SÓ este arquivo, atualize "vigenciaEm" e rode os testes
   (tests/calculadora.test.html). A lógica da calculadora fica em calculadora.js. */
window.REGRAS_TRABALHISTAS = {
  versao: '1.0',
  versaoData: '2026-11-21',          // data desta versão das regras (auditoria de 21/11/2026)
  // PENDENTE: conferência das regras pelos sócios antes da publicação (anotar a data aqui quando feita)
  conferidoPelosSociosEm: null,
  avisoBaseDias: 30,                 // Lei 12.506/2011: 30 dias...
  avisoDiasPorAnoCompleto: 3,        // ...mais 3 dias por ano completo de serviço...
  avisoMaximoDias: 90,               // ...limitado a 90 dias no total
  fgtsAliquota: 0.08,                // depósito mensal de FGTS
  // Cada tipo de desligamento define o que entra no cálculo.
  // aviso: 'integral' | 'metade' | 'nenhum'; projeta: o aviso indenizado conta como tempo de serviço (13º e férias)
  tipos: {
    sem_justa: { rotulo: 'Dispensa sem justa causa',            aviso: 'integral', decimoTerceiro: true,  feriasProporcionais: true,  multaFgts: 0.40, saqueFgts: 1.0, projeta: true,  descontaAvisoNaoCumprido: false },
    indireta:  { rotulo: 'Rescisão indireta (culpa do empregador)', aviso: 'integral', decimoTerceiro: true,  feriasProporcionais: true,  multaFgts: 0.40, saqueFgts: 1.0, projeta: true,  descontaAvisoNaoCumprido: false },
    acordo:    { rotulo: 'Acordo entre as partes (art. 484-A da CLT)', aviso: 'metade',   decimoTerceiro: true,  feriasProporcionais: true,  multaFgts: 0.20, saqueFgts: 0.8, projeta: true,  descontaAvisoNaoCumprido: false },
    pedido:    { rotulo: 'Pedido de demissão',                     aviso: 'nenhum',   decimoTerceiro: true,  feriasProporcionais: true,  multaFgts: 0,    saqueFgts: 0,   projeta: false, descontaAvisoNaoCumprido: true  },
    termino:   { rotulo: 'Término de contrato por prazo determinado', aviso: 'nenhum',  decimoTerceiro: true,  feriasProporcionais: true,  multaFgts: 0,    saqueFgts: 1.0, projeta: false, descontaAvisoNaoCumprido: false },
    justa:     { rotulo: 'Dispensa por justa causa',               aviso: 'nenhum',   decimoTerceiro: false, feriasProporcionais: false, multaFgts: 0,    saqueFgts: 0,   projeta: false, descontaAvisoNaoCumprido: false }
  }
};
