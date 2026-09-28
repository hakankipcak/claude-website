const { PLANS, client, promisify, siteUrl } = require('./_iyzico');

// iyzico ödeme sonrası kullanıcıyı buraya POST (token) ile yönlendirir.
// Sonuç her zaman iyzico'dan sunucu tarafında doğrulanır.
module.exports = async (req, res) => {
  const base = siteUrl(req);
  const back = (q) => res.redirect(303, `${base}/odeme-sonuc.html?${q}`);

  const token = req.body && req.body.token;
  if (!token) return back('durum=hata');

  try {
    const iyzi = client();
    const r = await promisify(iyzi.checkoutForm.retrieve.bind(iyzi.checkoutForm), { locale: 'tr', token });
    const plan = PLANS[r.basketId];
    const ok = r.status === 'success' && r.paymentStatus === 'SUCCESS' && plan && Number(r.paidPrice) === Number(plan.price);

    if (!ok) {
      console.warn('Ödeme başarısız:', r.errorCode, r.errorMessage, r.paymentStatus);
      return back('durum=basarisiz');
    }

    // TODO: siparişi kaydet / krediyi kullanıcı hesabına tanımla (r.paymentId ile idempotent).
    console.log('Ödeme alındı:', { paymentId: r.paymentId, plan: r.basketId, tutar: r.paidPrice });
    return back(`durum=basarili&paket=${encodeURIComponent(plan.name)}`);
  } catch (e) {
    console.error('iyzico callback exception:', e.message);
    return back('durum=hata');
  }
};
