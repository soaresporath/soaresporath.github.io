# Calculadora de rescisão: premissas e auditoria

Última auditoria: **21/11/2026**. Código: `src/assets/js/calculadora.js` (cálculo) e `src/assets/js/regras-trabalhistas.js` (percentuais e regras por modalidade). Testes: `tests/calculadora.test.html` (43 testes, todos aprovados).

A calculadora apresenta **estimativa informativa em valores brutos**. Nada é enviado ou guardado: o cálculo acontece no navegador do visitante.

## Premissas por verba
| Verba | Como é calculada | Base legal |
|---|---|---|
| Saldo de salário | Salário ÷ 30 × dias trabalhados no mês do desligamento. Mês encerrado no último dia (inclusive 28/29 de fevereiro e dia 31) conta como 30 dias. Se a admissão foi no mesmo mês, conta a partir do dia da admissão. | CLT, art. 64 (divisor 30) |
| Aviso-prévio | 30 dias + 3 por ano completo, até 90 dias. Indenizado: salário ÷ 30 × dias. No acordo, metade. | Lei 12.506/2011; CLT art. 487; art. 484-A, I, "a" |
| Projeção do aviso | O aviso indenizado conta como tempo de serviço para 13º e férias. | CLT art. 487, § 1º |
| Pedido de demissão | Sem aviso a receber. Se o empregado não cumpriu o aviso, desconto de até 30 dias de salário; se a empresa dispensou o cumprimento, sem desconto. | CLT art. 487, § 2º |
| 13º proporcional | 1/12 por mês com 15 dias ou mais de trabalho no ano. Não devido na justa causa. | Lei 4.090/1962, art. 1º, § 2º, e art. 3º |
| Férias proporcionais + 1/3 | 1/12 por mês do período aquisitivo em curso (fração superior a 14 dias), + 1/3. Não devidas na justa causa. | CLT art. 146, parágrafo único; art. 147; CF art. 7º, XVII; Súmulas 171 e 261 do TST |
| Férias vencidas + 1/3 | Informadas pelo visitante. Não aplica a dobra do art. 137 (avisado no resultado). | CLT arts. 137 e 146 |
| FGTS da rescisão | 8% sobre saldo de salário, 13º e aviso indenizado. Não incide sobre férias indenizadas. | Lei 8.036/1990; Súmula 305 do TST |
| Saldo de FGTS | Se o visitante não informar, estimado em 8% do salário × meses de contrato × 13/12 (inclui o 13º). | Estimativa |
| Multa do FGTS | 40% (sem justa causa e rescisão indireta), 20% (acordo), 0% (demais). | Lei 8.036/1990, art. 18; CLT art. 484-A, I, "b" |
| Saque do FGTS | 100% (sem justa causa, rescisão indireta, término de contrato), 80% (acordo), 0% (pedido e justa causa). | Lei 8.036/1990, art. 20; CLT art. 484-A, § 1º |

## O que NÃO entra (avisado ao visitante)
Descontos de INSS e Imposto de Renda; horas extras, adicionais, comissões e diferenças salariais; estabilidades; indenização do art. 479 da CLT (término antecipado de contrato por prazo); dobra de férias vencidas; seguro-desemprego; correção do FGTS.

## Correções feitas na auditoria de 21/11/2026
1. Saldo de salário com admissão e desligamento no mesmo mês contava desde o dia 1º (corrigido: conta a partir da admissão).
2. Desligamento no último dia de fevereiro contava 28 dias (corrigido: mês completo = 30 dias).
3. Pedido de demissão com aviso "indenizado" sempre descontava o aviso (corrigido: opção separada para "dispensado pela empresa", sem desconto).
4. Estimativa do saldo de FGTS ignorava os depósitos sobre o 13º (corrigido: fator 13/12).
5. Inclusão de observações para término antecipado de contrato, acordo, rescisão indireta e justa causa.

## Pontos que dependem de entendimento e ficam como premissa
- Projeção do aviso no acordo do art. 484-A: considera o período integral para 13º e férias.
- Conferência final das regras pelos sócios antes do lançamento (`conferidoPelosSociosEm` em `regras-trabalhistas.js`).
