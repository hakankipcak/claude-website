const Iyzipay = require('iyzipay');

// Fiyatlar sadece sunucuda tutulur; istemciden gelen fiyata güvenilmez.
const PLANS = {
  baslangic: { name: 'Başlangıç', price: '799.00' },
  profesyonel: { name: 'Profesyonel', price: '1999.00' },
  ajans: { name: 'Ajans', price: '3999.00' },
};

function client() {
  const { IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL } = process.env;
  if (!IYZICO_API_KEY || !IYZICO_SECRET_KEY) throw new Error('IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değil');
  return new Iyzipay({
    apiKey: IYZICO_API_KEY,
    secretKey: IYZICO_SECRET_KEY,
    uri: IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });
}

const promisify = (fn, req) => new Promise((resolve, reject) => fn(req, (e, r) => (e ? reject(e) : resolve(r))));

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  return `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

module.exports = { PLANS, client, promisify, siteUrl };
