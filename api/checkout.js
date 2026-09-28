const crypto = require('crypto');
const { PLANS, client, promisify, siteUrl } = require('./_iyzico');

const clean = (v, max = 100) => String(v || '').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = req.body || {};
  const plan = PLANS[b.plan];
  if (!plan) return res.status(400).json({ error: 'Geçersiz paket' });

  const name = clean(b.name), surname = clean(b.surname), email = clean(b.email);
  const phone = clean(b.phone, 20), identityNumber = clean(b.identityNumber, 11);
  const address = clean(b.address, 250), city = clean(b.city);
  if (!name || !surname || !/^\S+@\S+\.\S+$/.test(email) || !phone || !/^\d{11}$/.test(identityNumber) || !address || !city) {
    return res.status(400).json({ error: 'Lütfen tüm alanları doğru doldurun' });
  }

  const orderId = crypto.randomUUID();
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '127.0.0.1';
  const addr = { contactName: `${name} ${surname}`, city, country: 'Turkey', address };

  try {
    const iyzi = client();
    const result = await promisify(iyzi.checkoutFormInitialize.create.bind(iyzi.checkoutFormInitialize), {
      locale: 'tr',
      conversationId: orderId,
      price: plan.price,
      paidPrice: plan.price,
      currency: 'TRY',
      basketId: b.plan,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${siteUrl(req)}/api/callback`,
      enabledInstallments: [1],
      buyer: { id: orderId, name, surname, gsmNumber: phone, email, identityNumber, registrationAddress: address, ip, city, country: 'Turkey' },
      shippingAddress: addr,
      billingAddress: addr,
      basketItems: [{ id: b.plan, name: `Sanal Stüdyo ${plan.name} (aylık)`, category1: 'Abonelik', itemType: 'VIRTUAL', price: plan.price }],
    });

    if (result.status !== 'success') {
      console.error('iyzico init hatası:', result.errorCode, result.errorMessage);
      return res.status(502).json({ error: 'Ödeme başlatılamadı, lütfen tekrar deneyin' });
    }
    return res.status(200).json({ paymentPageUrl: result.paymentPageUrl });
  } catch (e) {
    console.error('iyzico init exception:', e.message);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};
