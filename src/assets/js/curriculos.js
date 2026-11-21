/* Formulário "Trabalhe conosco": valida os campos e envia a candidatura (com o currículo em PDF) para o
   Google Apps Script instalado na conta do escritório (tools/apps-script-curriculos.gs), que encaminha tudo por e-mail.
   O site não guarda nenhum dado. */
(function () {
  'use strict';
  var f = document.getElementById('form-cv');
  if (!f) return;
  // URL do "App da Web" (Implantar > Gerenciar implantações). Ao publicar nova versão, a URL continua a mesma.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwVz97jemp8mvycjqu8zWFw63bxZm-Q3jGVKL8u3Subzsogw-DlSSsT0AXCrgbMILUJHQ/exec';
  var MAX = 5 * 1024 * 1024, INICIO = Date.now();
  var cv = document.getElementById('cv'), nomeCv = document.getElementById('cv-nome'), st = document.getElementById('status'), btn = document.getElementById('enviar');

  function marca(el, ok) { var c = el.closest('.campo'); if (c) c.classList.toggle('invalido', !ok); el.setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; }
  function validaArquivo() {
    var a = cv.files && cv.files[0], msg = document.getElementById('cv-msg');
    if (!a) { msg.textContent = 'Anexe o currículo em PDF com até 5 MB.'; return marca(cv, false); }
    var pdf = /\.pdf$/i.test(a.name) && (a.type === '' || a.type === 'application/pdf');
    if (!pdf) { msg.textContent = 'O arquivo precisa estar em PDF.'; return marca(cv, false); }
    if (a.size > MAX) { msg.textContent = 'O arquivo tem ' + (a.size / 1048576).toFixed(1).replace('.', ',') + ' MB. O limite é 5 MB.'; return marca(cv, false); }
    return marca(cv, true);
  }
  cv.addEventListener('change', function () { var a = cv.files[0]; nomeCv.textContent = a ? a.name : 'Clique para anexar seu currículo'; validaArquivo(); });
  function valida() {
    var ok = true;
    f.querySelectorAll('input[required]:not([type=file]):not([type=checkbox]),select[required],textarea[required]').forEach(function (el) {
      var v = el.value.trim(), bom = v.length > 0;
      if (el.type === 'email') bom = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (el.type === 'tel') bom = v.replace(/\D/g, '').length >= 10;
      if (el.minLength > 0) bom = bom && v.length >= el.minLength;
      if (!marca(el, bom)) ok = false;
    });
    var li = document.getElementById('linkedin');
    if (li.value.trim() && !/^https?:\/\/\S+$/i.test(li.value.trim())) { marca(li, false); ok = false; } else marca(li, true);
    if (!validaArquivo()) ok = false;
    var c = document.getElementById('consent'); if (!marca(c, c.checked)) ok = false;
    return ok;
  }
  f.querySelectorAll('input,select,textarea').forEach(function (el) { el.addEventListener('blur', function () { if (el.closest('.campo.invalido')) valida(); }); });
  function base64(arquivo) { return new Promise(function (ok, falha) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1]); }; r.onerror = falha; r.readAsDataURL(arquivo); }); }
  function v(id) { return document.getElementById(id).value.trim(); }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valida()) { st.textContent = 'Revise os campos destacados.'; var p = f.querySelector('.invalido input, .invalido select, .invalido textarea'); if (p) { p.scrollIntoView({ behavior: 'smooth', block: 'center' }); p.focus({ preventScroll: true }); } return; }
    btn.disabled = true; st.textContent = 'Enviando sua candidatura…';
    var arq = cv.files[0];
    base64(arq).then(function (b64) {
      var dados = { nome: v('nome'), email: v('email'), telefone: v('tel'), oportunidade: v('vaga'), area: v('area'), linkedin: v('linkedin'), apresentacao: v('apres'), valor: v('valor'), situacao: v('porque'), consentimento: document.getElementById('consent').checked, site_url: v('site_url'), inicio: INICIO, arquivo: { nome: arq.name, base64: b64 } };
      return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(dados) });
    }).then(function (r) { return r.json(); }).then(function (r) {
      if (r && r.ok) { location.href = f.getAttribute('data-obrigado') || 'obrigado.html'; return; }
      st.textContent = (r && r.erro) || 'Não foi possível enviar agora. Tente novamente em instantes.'; btn.disabled = false;
    }).catch(function () { st.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.'; btn.disabled = false; });
  });
})();
