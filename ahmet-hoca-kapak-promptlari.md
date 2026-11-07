# Ahmet Hoca – Reels Kapak Promptları (Gemini)

Hakan'ın onayladığı kapak prompt kalıpları. Kullanım: Gemini'ye Hoca'nın fotoğrafını ekle, promptu yapıştır. Görsel dikey 9:16 üretilir.

## Kurallar
- Hoca'nın yüzü, kıyafeti, pozu, duruşu, bakışı ve elleri fotoğraftaki gibi kalır. Eline obje verilmez, kıyafete bir şey eklenmez.
- Arka planda hiç insan yok (hasta yüzü kuralı).
- Başlık, görsel yüksekliğinin %60-%78'i arasında olur (Instagram 3:4 ve 4:5 kırpmasında kesilmesin). Sağ ve solda en az %10 boşluk.
- Başlık: ilk satır büyük parlak sarı, ikinci satır beyaz, ultra kalın dar harfler (Bebas Neue / Anton), yumuşak siyah gölge.
- Türkçe karakterler bozulursa: sonuna "Başlıktaki Ş, İ ve Ç harflerini kontrol et" ekle.
- Poz ya da yüz değişirse: başa "Hiçbir şeyi yeniden çizme, sadece arka planı değiştir." ekle.

## HAP BİLGİ kalıbı (onaylı)

Değiştirilecek yerler: `[ARKA PLAN SAHNESİ]`, `[SARI SATIR]`, `[BEYAZ SATIR]`.

```
<<<img1>>> Referans fotoğrafı olduğu gibi kullan; kişiyi birebir aynı koru: yüzü, sakalı, gözlüğü, saçı, kıyafeti, pozu, duruşu, el ve kol hareketleri, bakışı ve ifadesi hiçbir şekilde değişmesin. Eline hiçbir obje verme, kıyafete hiçbir şey ekleme. Kişiyi net şekilde kes, kadrajın ortasına yerleştir, yumuşak bir kenar ışığı (rim light) ver. Sadece arka planı ve başlığı değiştir. Dikey 9:16 Instagram Reels kapağı (1080x1920). Arka plan: kişi dışında hiç insan olmayan, sinematik, gerçek bir fotoğraf sahnesi, arkada yumuşakça bulanık: [ARKA PLAN SAHNESİ]; doğal ve yumuşak renkler, temiz tıbbi mavi-beyaz tonlar, sinematik ışık, sığ alan derinliği, editoryal belgesel görünümü; neon yok, parlak 3D yok, röntgen filmi yok, başka insan yok. Başlık alanının arkasında koyu, yumuşak bir geçiş (gradient) olsun. Başlık, görselin yüksekliğinin %60 ile %78'i arasındaki dikey bantta (alt-orta bölge, asla alt kenara değmeyecek şekilde), ortalanmış, sağ ve solda en az %10 boş kenar boşluğu bırakılmış, hafifçe yukarı eğimli konumlandırılsın; böylece görsel 3:4 ve 4:5 oranlarında ortadan kırpıldığında başlığın tamamı görünür kalsın. Başlık: dev boyutlu, ultra kalın, dar ve uzun sans-serif harfler (Bebas Neue / Anton tarzı), sıkı harf aralığı, kontur yok, harflerin arkasında güçlü ve yumuşak siyah gölge; ilk satır daha büyük ve parlak sarı: "[SARI SATIR]", ikinci satır beyaz: "[BEYAZ SATIR]". Fotogerçekçi, yazı Türkçe karakterlerle tam olarak yazıldığı gibi yazılsın, başka hiçbir yazı olmasın.
```

## H1 – Şu an boynunuz bir çocuk taşıyor (kullanılan sürüm)
- `[ARKA PLAN SAHNESİ]`: yumuşak pencere ışığıyla aydınlatılmış modern bir ortopedi kliniği muayene odası; uzakta duvarda boyun omurgası ve boyun kaslarının bulanık bir anatomik illüstrasyonunu gösteren bir monitör; boyun bölgesi hafif sıcak bir parıltıyla vurgulanmış; arka planda masanın üstünde duran bir boyun omurgası anatomi modeli
- `[SARI SATIR]`: ŞU AN BOYNUNUZ
- `[BEYAZ SATIR]`: BİR ÇOCUK TAŞIYOR

## Yeni çalışma şekli: yazı Gemini'de değil, ayrı katmanda (7 Kasım 2026)
Gemini yazıyı tutarsız çiziyor (harf aralığı, kalınlık, gölge). Bu yüzden:
1. Gemini'ye **yazısız** arka plan promptu verilir (altta, yüksekliğin %60'ından aşağısı koyu ve boş).
2. Başlık, Anton yazı tipiyle ayrı bir şeffaf PNG katmanı olarak basılır ve görselin üstüne yerleştirilir.
- Şablon: `kapaklar/arac/baslik-sablonu.html` (iki satırın metnini değiştir) ve `kapaklar/arac/render.js` (Playwright ile 1080x1920 şeffaf PNG üretir).
- Her satır kadrajın genişliğine (940 px) sığdırılır, 3 derece yukarı eğimli, sarı #FFC800 ve beyaz, yumuşak siyah gölge.
- Başlık konumu: yüksekliğin %60-78'i arası.
- Başlıklar merak uyandırmalı: kısa rakam ya da soru kancası (eski kapaklardaki "sahaya dönüş ne zaman?" gibi).

### Eski kapaklardaki görsel dil (Hakan'ın beğendiği)
Koyu sinematik zemin, Hoca ortada keskin kesilmiş ve ince kenar ışığıyla, arkada mavi-camgöbeği parlayan yarı saydam anatomi, vurgulanan bölge turuncu ışıltılı.

### H2 – Her dört kemiğinizden biri ayağınızda (kapak onaylı başlık)
- Başlık: **BU 26 KEMİĞİ** (sarı) / **UNUTTUNUZ!** (beyaz)
- Katman: `kapaklar/H2-baslik.png`
- Alternatif (kullanılmadı): ZONKLAYAN AYAK / NE DEMEK İSTİYOR?
- Gemini arka plan promptu (yazısız):

```
<<<img1>>> Referans fotoğrafı olduğu gibi kullan; kişiyi birebir aynı koru: yüzü, sakalı, gözlüğü, saçı, kıyafeti, pozu, duruşu, el ve kol hareketleri, bakışı ve ifadesi hiçbir şekilde değişmesin. Eline hiçbir obje verme, kıyafete hiçbir şey ekleme. Kişiyi net şekilde kes, kadrajın ortasına yerleştir, çevresinde ince, yumuşak bir kenar ışığı (rim light) olsun. Sadece arka planı değiştir. Dikey 9:16 Instagram Reels kapağı (1080x1920). Arka plan: kişi dışında hiç insan olmayan, koyu ve sinematik bir sahne. Solda büyük boyutlu, yarı saydam, mavi-camgöbeği parlayan bir insan ayağı ve ayak bileği kemik yapısı (röntgen benzeri ışıltılı anatomi), ayak tabanındaki ve topuktaki kemikler sıcak turuncu bir parıltıyla vurgulanmış. Sağda koyu tealden siyaha geçen sade, hafif bulanık bir klinik arka plan. Dramatik ışık, derin kontrast, sığ alan derinliği, editoryal belgesel görünümü, fotogerçekçi. Görselin alt üçte biri (yüksekliğin %60'ından aşağısı) koyu, yumuşak bir geçişle kararmış olsun; orada hiçbir nesne ya da yazı olmasın. Görselde hiçbir yazı, harf, logo ya da filigran olmasın.
```

## Diğer Hap bilgi kapakları (önerilen başlıklar ve sahneler)

| Kod | Sarı satır | Beyaz satır | Arka plan sahnesi |
|---|---|---|---|
| H2 | KEMİKLERİNİZİN DÖRTTE BİRİ | AYAĞINIZDA | ortopedi kliniği, masanın üstünde gerçek boyutlu ayak iskeleti modeli, uzakta ayak anatomisi gösteren bulanık monitör |
| H3 | SABAH İLK ADIMDA | TOPUĞUNUZ BATIYOR MU? | ortopedi kliniği, masanın üstünde ayak ve topuk kemiği modeli, uzakta ayak tabanı anatomisi gösteren bulanık monitör |
| H4 | 10 YIL SONRA BU KEMİKLER | SİZİN OLMAYACAK | ortopedi kliniği, masanın üstünde tam boy iskelet modeli, uzakta kemik dokusu illüstrasyonu gösteren bulanık monitör |

Not: H1'in alt satırı "27 KİLO TAŞIYOR" yerine "BİR ÇOCUK TAŞIYOR" seçildi, çünkü 27 kilo rakamını Hoca henüz onaylamadı.
