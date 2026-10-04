# Sanal Ofis

Görev verebileceğin 5 yapay zekâ çalışanının olduğu, Minecraft tarzı 3B bir ofis simülasyonu.
Görev yokken çalışanlar mutfakta çay demler, kahve yapar, ayak masasında sohbet eder, koltukta dinlenir ya da dışarı çıkıp göl kenarında hava alır.
Görev verdiğinde ilgili kişi masasına geçer, işi yapar ve sonucu **Teslimler** listesine bırakır.

| Çalışan | Rol | Ne yapar |
|---|---|---|
| Elif | Proje Yöneticisi | Büyük işleri plana böler ve ekibe dağıtır (ajan gibi alt görev atar) |
| Mert | Yazılımcı | HTML/CSS/JS, script, entegrasyon kodu |
| Zeynep | Tasarımcı | Renk paleti, tipografi, yerleşim, HTML/CSS taslağı |
| Can | İçerik & Pazarlama | Sosyal medya, reklam ve e-posta metinleri |
| Deniz | Analist | Rakip ve pazar analizi, tablo, rapor (istersen internette arar) |

## Çalıştırma

Node.js 18 veya üstü gerekir.

```bash
cd ofis
npm install
npm start                      # simülasyon modu, API anahtarı gerekmez
```

Tarayıcıda http://localhost:3000 adresini aç. Sayfa mutlaka bu adresten açılmalı; HTML dosyasına çift tıklayınca 3B dünya yüklenmez.

**Dünyada gezinme:** sürükleyerek döndür, tekerlek ya da iki parmakla yakınlaş, sağ tıkla (ya da Shift + sürükle) kaydır. Bir çalışana tıklarsan görev formunda o seçilir. Sağ üstteki **Saat** düğmesi gündüz, gece ve gerçek saat arasında geçiş yapar.

### Claude API'ye bağlama (canlı mod)

[console.anthropic.com](https://console.anthropic.com) üzerinden bir API anahtarı al ve sunucuyu bu anahtarla başlat:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm start
```

Sağ üstteki rozet **Canlı** olur. Artık her çalışan görevi kendi rolüne göre Claude ile yapar. Çıktıyı yazılırken canlı izleyebilirsin.

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `MODEL` | `claude-opus-5-5` | `claude-sonnet-5-5` daha ucuz ve hızlıdır |
| `EFFORT` | `medium` | `low` daha hızlı ve ucuz, `high` daha özenli |
| `WEB_ARAMA` | kapalı | `1` olursa Deniz internette arama yapar (arama başına ek ücret) |
| `PORT` | `3000` | |

## Nasıl çalışır

- `public/dunya.js`: Three.js ile kurulan blok dünyası. Dokular kod içinde piksel piksel çizilir, dışarıdan görsel dosyası yüklenmez. Bloklu karakterler yürür, oturur, yazar, çay ya da kahve içer.
- `public/index.html`: görev paneli, çalışanların mola rutini, yürüme yolları, görev kuyruğu ve teslimler.
- `server.mjs`: sayfayı ve Three.js dosyalarını sunar, `POST /api/gorev` isteğini Claude API'ye iletir (`@anthropic-ai/sdk`). Her çalışanın kendi sistem talimatı vardır. Yanıt sayfaya akış (SSE) olarak gelir.
- **Otomatik atama:** Görev metnindeki anahtar kelimelere göre uygun kişi seçilir. Birden çok uzmanlık gerekiyorsa ya da iş belirsizse görev Elif'e gider.
- **Ekibe dağıtım:** Elif'in `ekibe_dagit` aracı vardır. Büyük bir işi parçalara ayırıp Mert, Zeynep, Can ve Deniz'e alt görev olarak atar. Bu görevler, ana görevin bağlamıyla birlikte ilgili kişinin kuyruğuna girer.
- Çalışan meşgulse yeni görev onun kuyruğuna girer. İşini bitirince sıradakine geçer, kuyruk boşsa molaya çıkar.
- Bitmiş teslimler tarayıcıda saklanır, sayfa yenilense de kaybolmaz.

## Güvenlik

API anahtarı yalnızca sunucuda durur, tarayıcıya gönderilmez.
Sunucuda kimlik doğrulama yoktur. İnternete açarsan adresi bilen herkes senin kredinle görev çalıştırabilir.
Herkese açık bir yerde yayınlayacaksan önce giriş ekle ya da sunucuyu bir parola arkasına al.
