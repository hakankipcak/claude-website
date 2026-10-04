// Sanal Ofis sunucusu: public/ klasörünü sunar ve çalışanların görevlerini
// Claude API'ye iletir. API anahtarı yoksa sayfa simülasyon modunda çalışır.
//
//   ANTHROPIC_API_KEY=sk-ant-... npm start
//
// İsteğe bağlı ortam değişkenleri:
//   PORT       (varsayılan 3000)
//   MODEL      (varsayılan claude-opus-5-5; daha ucuz seçenek: claude-sonnet-5-5)
//   EFFORT     low | medium | high (varsayılan medium)
//   WEB_ARAMA  1 ise analist Deniz internette arama yapabilir (arama başına ücretlidir)

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(here, "public");
const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.MODEL || "claude-opus-5-5";
const EFFORT = process.env.EFFORT || "medium";
const WEB_ARAMA = process.env.WEB_ARAMA === "1";

let client = null;
if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
  client = new Anthropic();
}

// ---------------------------------------------------------------- ekip

const ORTAK = `Sanal bir ofiste çalışan bir ekip üyesisin. Yöneticin sana görev veriyor.
Görevi doğrudan kullanılabilir bir teslimat olarak hazırla: ön söz ve gereksiz açıklama yapma.
Markdown kullan. Görev başka bir dil istemiyorsa Türkçe yaz.
Bilmediğin bir bilgiyi uydurma; bir varsayımda bulunduysan bunu kısaca belirt.
İstersen teslimatın sonuna en fazla iki maddelik bir "Sonraki adım" notu ekle.`;

const EKIP = {
  elif: `Adın Elif, ekibin proje yöneticisisin. Ekibin:
- Mert: yazılımcı (web, kod, entegrasyon)
- Zeynep: tasarımcı (arayüz, görsel kimlik, renk ve tipografi)
- Can: içerik ve pazarlama (metin, sosyal medya, kampanya)
- Deniz: analist (araştırma, veri, rapor)

Görev birden fazla uzmanlık gerektiriyorsa önce kısa bir plan yaz, sonra ekibe_dagit aracıyla her parçayı doğru kişiye ata.
Her alt görevi, atanan kişi başka bir bağlama ihtiyaç duymadan yapabileceği kadar net yaz.
Görev tek bir uzmanlığa uyuyorsa onu da ilgili kişiye ata.
Görev planlama, koordinasyon, toplantı notu ya da özet gibi senin işinse kendin yap ve aracı kullanma.`,
  mert: `Adın Mert, ekibin yazılımcısısın. Çalışan, temiz ve kısa kod yaz. Kodu tek blokta ver ve nasıl kullanılacağını iki üç cümleyle açıkla.`,
  zeynep: `Adın Zeynep, ekibin tasarımcısısın. Somut tasarım kararları ver: HEX renk kodları, font önerileri, yerleşim ve bileşenler. Görsel dosya üretemiyorsun; tasarımı tarif et, gerekirse HTML/CSS taslağı ver.`,
  can: `Adın Can, ekibin içerik ve pazarlama uzmanısın. Hedef kitleye uygun, akıcı, yayına hazır metinler yaz. Birden çok seçenek isteniyorsa numaralandır.`,
  deniz: WEB_ARAMA
    ? `Adın Deniz, ekibin analistisin. Yapılandırılmış analiz yap: tablo, kıyaslama ve net bir sonuç. Güncel bilgi gerekiyorsa internette ara ve kaynaklarını belirt.`
    : `Adın Deniz, ekibin analistisin. Yapılandırılmış analiz yap: tablo, kıyaslama ve net bir sonuç. İnternete erişimin yok; güncel veri gerektiren noktaları açıkça işaretle ve nasıl doğrulanacağını yaz.`,
};

const DAGIT_ARACI = {
  name: "ekibe_dagit",
  description:
    "Görevi parçalara ayırıp ekip üyelerine alt görev olarak atar. Her alt görev, atanan kişinin başka bir bağlama ihtiyaç duymadan yapabileceği kadar net yazılmalıdır.",
  strict: true,
  eager_input_streaming: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["atamalar"],
    properties: {
      atamalar: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["calisan", "gorev"],
          properties: {
            calisan: { type: "string", enum: ["mert", "zeynep", "can", "deniz"] },
            gorev: { type: "string" },
          },
        },
      },
    },
  },
};

function araclar(calisanId) {
  if (calisanId === "elif") return [DAGIT_ARACI];
  if (calisanId === "deniz" && WEB_ARAMA) {
    return [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }];
  }
  return undefined;
}

// Akış açıkken araç girdisi doğrulanmadan gelir; kırpılmış ya da hatalı
// girdiyi burada eleriz.
function atamalariDogrula(input) {
  if (!input || !Array.isArray(input.atamalar)) return [];
  return input.atamalar
    .filter(
      (a) =>
        a &&
        ["mert", "zeynep", "can", "deniz"].includes(a.calisan) &&
        typeof a.gorev === "string" &&
        a.gorev.trim(),
    )
    .slice(0, 8)
    .map((a) => ({ calisan: a.calisan, gorev: a.gorev.trim() }));
}

// ---------------------------------------------------------------- görev

async function goreviCalistir(req, res) {
  let govde;
  try {
    govde = JSON.parse(await govdeOku(req));
  } catch {
    return json(res, 400, { hata: "Geçersiz JSON" });
  }
  const { calisanId, gorev, baglam } = govde ?? {};
  if (!EKIP[calisanId]) return json(res, 400, { hata: "Bilinmeyen çalışan" });
  if (typeof gorev !== "string" || !gorev.trim() || gorev.length > 8000) {
    return json(res, 400, { hata: "Görev metni boş ya da çok uzun" });
  }
  if (!client) return json(res, 503, { hata: "API anahtarı tanımlı değil" });

  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  const gonder = (olay) => res.write(`data: ${JSON.stringify(olay)}\n\n`);

  const icerik =
    (typeof baglam === "string" && baglam.trim() ? `Bağlam: ${baglam.slice(0, 4000)}\n\n` : "") +
    `Görev: ${gorev}`;
  const messages = [{ role: "user", content: icerik }];
  const tools = araclar(calisanId);

  let aktifAkis = null;
  let kapandi = false;
  res.on("close", () => {
    kapandi = true;
    aktifAkis?.abort();
  });

  try {
    // Sunucu araçları (web araması) uzun sürerse API turu pause_turn ile
    // böler; aynı konuşmayı geri göndererek devam ettiririz.
    for (let tur = 0; tur < 4 && !kapandi; tur++) {
      aktifAkis = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: EFFORT },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: `${ORTAK}\n\n${EKIP[calisanId]}`,
        messages,
        ...(tools && { tools }),
      });

      for await (const olay of aktifAkis) {
        if (olay.type === "content_block_start") {
          const tip = olay.content_block.type;
          if (tip === "thinking") gonder({ tip: "dusunuyor" });
          else if (tip === "server_tool_use") gonder({ tip: "arastiriyor" });
          else if (tip === "tool_use") gonder({ tip: "dagitiyor" });
        } else if (olay.type === "content_block_delta" && olay.delta.type === "text_delta") {
          gonder({ tip: "metin", metin: olay.delta.text });
        }
      }
      const mesaj = await aktifAkis.finalMessage();

      if (mesaj.stop_reason === "refusal") {
        gonder({ tip: "hata", mesaj: "Model bu görevi yapmayı reddetti." });
        break;
      }
      if (mesaj.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: mesaj.content });
        continue;
      }
      if (mesaj.stop_reason === "max_tokens") {
        gonder({ tip: "metin", metin: "\n\n_(Çıktı uzunluk sınırına takıldı ve kesildi.)_" });
      }
      for (const blok of mesaj.content) {
        if (blok.type === "tool_use" && blok.name === "ekibe_dagit") {
          const atamalar = atamalariDogrula(blok.input);
          if (atamalar.length) gonder({ tip: "dagitim", atamalar });
        }
      }
      break;
    }
    gonder({ tip: "bitti" });
  } catch (err) {
    if (!kapandi) gonder({ tip: "hata", mesaj: hataMesaji(err) });
  } finally {
    res.end();
  }
}

function hataMesaji(err) {
  if (err instanceof Anthropic.AuthenticationError) return "API anahtarı geçersiz.";
  if (err instanceof Anthropic.PermissionDeniedError) return "Bu API anahtarının bu işleme izni yok.";
  if (err instanceof Anthropic.RateLimitError) return "Hız sınırına takıldı, biraz sonra tekrar dene.";
  if (err instanceof Anthropic.BadRequestError) return `İstek reddedildi: ${err.message}`;
  if (err instanceof Anthropic.APIError) return `API hatası (${err.status ?? "?"}): ${err.message}`;
  if (err instanceof Anthropic.APIConnectionError) return "Claude API'ye bağlanılamadı.";
  console.error(err);
  return "Beklenmeyen bir hata oluştu.";
}

// ---------------------------------------------------------------- http

const TURLER = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function govdeOku(req) {
  return new Promise((resolve, reject) => {
    let veri = "";
    req.setEncoding("utf8");
    req.on("data", (parca) => {
      veri += parca;
      if (veri.length > 64_000) req.destroy(new Error("Gövde çok büyük"));
    });
    req.on("end", () => resolve(veri));
    req.on("error", reject);
  });
}

function json(res, durum, veri) {
  res.writeHead(durum, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(veri));
}

async function statik(req, res) {
  const yol = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const dosya = path.join(PUBLIC_DIR, yol === "/" ? "index.html" : yol);
  if (!dosya.startsWith(PUBLIC_DIR + path.sep)) return json(res, 403, { hata: "Yasak" });
  try {
    const icerik = await readFile(dosya);
    res.writeHead(200, { "content-type": TURLER[path.extname(dosya)] ?? "application/octet-stream" });
    res.end(icerik);
  } catch {
    json(res, 404, { hata: "Bulunamadı" });
  }
}

const sunucu = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/durum") {
    return json(res, 200, { canli: Boolean(client), model: client ? MODEL : null, webArama: WEB_ARAMA });
  }
  if (req.method === "POST" && req.url === "/api/gorev") {
    return goreviCalistir(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) json(res, 500, { hata: "Sunucu hatası" });
    });
  }
  if (req.method === "GET") return statik(req, res);
  json(res, 405, { hata: "Desteklenmeyen istek" });
});

sunucu.listen(PORT, () => {
  console.log(`Sanal Ofis: http://localhost:${PORT}`);
  console.log(client ? `Canlı mod · model: ${MODEL} · effort: ${EFFORT}` : "Simülasyon modu (ANTHROPIC_API_KEY tanımlı değil)");
});
