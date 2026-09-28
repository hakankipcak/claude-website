// Fiyatlandırma butonlarını iyzico ödemesine bağlar (olay delegasyonu: sayfa dinamik render edilse de çalışır).
(function () {
  var PLANS = { 'Başlangıç': 'baslangic', 'Profesyonel': 'profesyonel', 'Ajans': 'ajans' };
  var FIELDS = [
    ['name', 'Ad', 'given-name'], ['surname', 'Soyad', 'family-name'], ['email', 'E-posta', 'email'],
    ['phone', 'Telefon (+905xxxxxxxxx)', 'tel'], ['identityNumber', 'TC Kimlik No', 'off'],
    ['city', 'Şehir', 'address-level1'], ['address', 'Adres', 'street-address']
  ];

  function planFromClick(e) {
    var path = e.composedPath ? e.composedPath() : [e.target];
    for (var i = 0; i < path.length; i++) {
      var el = path[i];
      if (!el || !el.tagName || el.tagName !== 'A') continue;
      var t = el.textContent || '';
      for (var k in PLANS) if (t.indexOf(k) === 0 && /seç/.test(t)) return PLANS[k];
    }
    return null;
  }

  function openModal(plan) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;font-family:system-ui,sans-serif';
    var f = document.createElement('form');
    f.style.cssText = 'background:#1B1A17;color:#F3EFE7;border:1px solid #33312C;border-radius:16px;padding:28px;width:100%;max-width:420px;display:flex;flex-direction:column;gap:10px';
    f.innerHTML = '<div style="font-size:20px;font-weight:700">Ödeme bilgileri</div>';
    FIELDS.forEach(function (x) {
      var i = document.createElement('input');
      i.name = x[0]; i.placeholder = x[1]; i.required = true; i.autocomplete = x[2];
      i.style.cssText = 'padding:12px;border-radius:8px;border:1px solid #3A3833;background:#121110;color:#F3EFE7;font-size:14px';
      f.appendChild(i);
    });
    var err = document.createElement('div'); err.style.cssText = 'color:#e88;font-size:13px;min-height:16px'; f.appendChild(err);
    var b = document.createElement('button'); b.type = 'submit'; b.textContent = 'Ödemeye geç';
    b.style.cssText = 'padding:14px;border:0;border-radius:999px;background:#C89B5C;color:#121110;font-weight:700;font-size:14px;cursor:pointer';
    var c = document.createElement('button'); c.type = 'button'; c.textContent = 'Vazgeç';
    c.style.cssText = 'padding:10px;border:0;background:none;color:#ABA59A;cursor:pointer'; c.onclick = function () { ov.remove(); };
    f.appendChild(b); f.appendChild(c); ov.appendChild(f); document.body.appendChild(ov);

    f.onsubmit = function (ev) {
      ev.preventDefault(); b.disabled = true; b.textContent = 'Yönlendiriliyor…'; err.textContent = '';
      var body = { plan: plan };
      FIELDS.forEach(function (x) { body[x[0]] = f.elements[x[0]].value; });
      fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Hata'); return j; }); })
        .then(function (j) { location.href = j.paymentPageUrl; })
        .catch(function (e2) { err.textContent = e2.message; b.disabled = false; b.textContent = 'Ödemeye geç'; });
    };
  }

  document.addEventListener('click', function (e) {
    var plan = planFromClick(e);
    if (plan) { e.preventDefault(); openModal(plan); }
  }, true);
})();
