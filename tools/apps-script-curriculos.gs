/**
 * Soares Porath Advocacia: recebimento de currículos do formulário "Trabalhe conosco" do site.
 *
 * Funciona dentro da conta Google do escritório (Google Apps Script, gratuito):
 * o site envia a candidatura para este script, que manda um e-mail para o escritório
 * com os dados em tabela e o currículo em PDF anexado.
 *
 * Como instalar: veja o passo a passo em tools/COMO-INSTALAR-CURRICULOS.md
 */

const DESTINO = 'soaresporath.adv@gmail.com';   // para onde vão as candidaturas
const TAMANHO_MAXIMO = 5 * 1024 * 1024;          // 5 MB
const LIMITE_POR_HORA = 30;                       // proteção contra envios em massa

const CAMPOS = [
  ['nome', 'Nome completo'],
  ['email', 'E-mail'],
  ['telefone', 'Telefone'],
  ['oportunidade', 'Oportunidade de interesse'],
  ['area', 'Área de interesse'],
  ['linkedin', 'LinkedIn'],
  ['apresentacao', 'Apresentação profissional'],
  ['valor', 'Valor com que mais se identifica'],
  ['situacao', 'Situação em que aplicou o valor']
];
const OBRIGATORIOS = ['nome', 'email', 'telefone', 'oportunidade', 'area', 'apresentacao', 'valor', 'situacao'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    // Proteções contra robôs: campo invisível preenchido e envio rápido demais
    if (d.site_url) return resposta({ ok: true });
    if (!d.inicio || Date.now() - Number(d.inicio) < 4000) return resposta({ ok: false, erro: 'Envio muito rápido. Aguarde alguns segundos e tente novamente.' });

    // Limite de envios por hora (protege a cota diária de e-mails do Google)
    const cache = CacheService.getScriptCache();
    const n = Number(cache.get('envios') || 0);
    if (n >= LIMITE_POR_HORA) return resposta({ ok: false, erro: 'Recebemos muitas candidaturas agora. Tente novamente mais tarde.' });

    // Validações
    for (const c of OBRIGATORIOS) {
      if (!String(d[c] || '').trim()) return resposta({ ok: false, erro: 'Preencha todos os campos obrigatórios.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email))) return resposta({ ok: false, erro: 'Informe um e-mail válido.' });
    if (d.consentimento !== true) return resposta({ ok: false, erro: 'É necessário autorizar o tratamento dos dados para enviar a candidatura.' });

    const a = d.arquivo || {};
    if (!a.base64 || !/\.pdf$/i.test(String(a.nome || ''))) return resposta({ ok: false, erro: 'Anexe o currículo em PDF.' });
    const bytes = Utilities.base64Decode(a.base64);
    if (bytes.length > TAMANHO_MAXIMO) return resposta({ ok: false, erro: 'O currículo deve ter até 5 MB.' });
    if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
      return resposta({ ok: false, erro: 'O arquivo enviado não é um PDF válido.' });
    }

    const nomeLimpo = limpa(d.nome).slice(0, 60);
    const pdf = Utilities.newBlob(bytes, 'application/pdf', 'Curriculo - ' + nomeLimpo + '.pdf');

    const quando = Utilities.formatDate(new Date(), 'America/Sao_Paulo', "dd/MM/yyyy 'às' HH:mm");
    const linhas = CAMPOS.map(function (c) {
      return '<tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f6f3ea;font-weight:bold;vertical-align:top;white-space:nowrap">' + c[1] +
        '</td><td style="padding:8px 12px;border:1px solid #ddd;white-space:pre-wrap">' + esc(d[c[0]] || '') + '</td></tr>';
    }).join('');
    const html =
      '<div style="font-family:Arial,sans-serif;font-size:14px;color:#1b2338">' +
      '<h2 style="color:#17223F;margin:0 0 6px">Nova candidatura recebida pelo site</h2>' +
      '<p style="margin:0 0 16px;color:#555">Enviada em ' + quando + '. O currículo está anexado a este e-mail.</p>' +
      '<table style="border-collapse:collapse">' + linhas +
      '<tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f6f3ea;font-weight:bold">Consentimento LGPD</td>' +
      '<td style="padding:8px 12px;border:1px solid #ddd">Autorizou o tratamento dos dados para fins de recrutamento e seleção.</td></tr>' +
      '</table>' +
      '<p style="margin-top:16px;font-size:12px;color:#777">Para responder ao candidato, basta responder a este e-mail.</p></div>';

    MailApp.sendEmail({
      to: DESTINO,
      replyTo: String(d.email),
      subject: 'Nova candidatura: ' + nomeLimpo + ' (' + limpa(d.oportunidade) + ')',
      htmlBody: html,
      attachments: [pdf],
      name: 'Site Soares Porath Advocacia'
    });

    cache.put('envios', String(n + 1), 3600);
    return resposta({ ok: true });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, erro: 'Não foi possível enviar agora. Tente novamente em instantes.' });
  }
}

// Permite conferir no navegador se o script está publicado
function doGet() {
  return resposta({ ok: true, servico: 'curriculos-soares-porath' });
}

// Rode esta função UMA vez no editor para autorizar o envio de e-mails e receber um e-mail de teste
function testarEnvio() {
  MailApp.sendEmail(DESTINO, 'Teste do formulário de currículos do site',
    'Se você recebeu este e-mail, o script está autorizado a enviar as candidaturas do site.');
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}
function limpa(s) {
  return String(s || '').replace(/[\r\n]+/g, ' ').trim();
}
