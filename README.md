# Hypnos Creative — Web Sitesi

Tek sayfalık ajans sitesi. Türkçe + İngilizce. Tek dosya, çerçevesiz, harici
bağımlılık yok.

## Dosyalar

```
index.html        Tüm site (HTML + CSS + JS)
assets/logo.svg   Marka logosu — DEĞİŞTİRME
assets/logo.png   Sosyal paylaşım görseli
```

## Tasarım kaynağı

`Hypnos-Creative-Brand-Guide-3-Directions.pptx` — seçilen yön:
**01 Signal System düzeni + 02 Dreamstate Cinema hipnotik imzası**
(rehberin kapanış slaytındaki öneri).

### Renkler
| Token | Hex |
|---|---|
| `--ink` | `#071634` |
| `--cobalt` | `#0143D1` |
| `--violet` | `#6A3ED0` |
| `--coral` | `#EF4759` |
| `--orange` | `#FF8128` |
| `--haze` | `#E9EEF8` |
| `--mist` | `#CBD5E1` |
| `--slate` | `#5F6878` |

> `--slate` rehberdeki `#667085`'ten bir tık koyu. Sebebi: açık mavi zeminde
> `#667085` kontrast oranı 4.28:1'de kalıyor ve WCAG AA sınırının (4.5) altına
> düşüyordu. `#5F6878` gözle ayırt edilemez ama beyazda 5.62, hazede 4.83 verir.

### Logo kuralları (marka rehberinden — bozma)
- Yeniden dizme, harf oranlarını değiştirme, gölge/efekt ekleme
- Renkli "Creative" satırı her zaman korunur
- Minimum dijital genişlik **180 px**
- Boşluk: logodaki "O" harfinin iç boşluğu kadar

---

## İçeriği güncelleme

Tüm metin ve veriler `index.html` içindeki `<script>` bloğunun **en üstünde**,
tek yerde toplandı. Başka hiçbir yeri düzenlemene gerek yok.

### Projeler — `PROJECTS`

Şu an marka rehberindeki örnek film adları duruyor ve kartlarda **ÖRNEK**
etiketi görünüyor. Gerçek projeleri koyarken `sample: true` satırını sil.

```js
{ title: "Proje Adı",
  kind: { tr: "AI Film", en: "AI Film" },   // üretim türü
  year: "2026",
  no:   "01",                                // sıra kodu
  accent: "var(--cobalt)",                   // cobalt / violet / coral / orange / ink
  sample: true }                             // gerçek projede bu satırı SİL
```

Kart sayısı serbest — diziye ekle/çıkar, ızgara kendini ayarlar.

### Diğer bloklar
| Değişken | İçerik |
|---|---|
| `SERVICES` | Hizmet kartları (6 adet) |
| `STEPS` | Süreç adımları (01–04) |
| `FACTS` | Stüdyo künye satırları |
| `NOTE` | İşler bölümünün altındaki not — gerçek projeler eklenince sil |

### Sayfa metinleri
HTML içinde `data-tr` / `data-en` taşıyan her öğe iki dillidir. Satır sonu için
dikey çizgi `|` kullanılır:

```html
<h1 data-tr="Uyku değil.|Yeni bir görme biçimi."
    data-en="Not sleep.|A new way of seeing.">…</h1>
```

**İki dili de güncellemeyi unutma** — biri eksik kalırsa o dilde boş görünür.

### E-posta
`merhaba@hypnoscreative.com` iki yerde geçiyor (bağlantı + görünen metin).
**Bu adresin gerçekten çalıştığını doğrula** ya da kendi adresinle değiştir.

### Sosyal linkler
`.socials` içindeki üç bağlantı şu an placeholder (`instagram.com` vb.).
Gerçek hesap adresleriyle değiştir.

---

## Yerelde çalıştırma

```bash
python3 -m http.server 8901 --directory /Users/mac/Documents/hypnos-site
```

Sonra `http://localhost:8901` adresini aç.

---

## Yayına alma (Cloudflare)

Site GitHub'a yüklenip Cloudflare tarafından otomatik deploy ediliyor.

1. `index.html` ve `assets/` klasörünü repoya yükle
2. Commit et
3. Cloudflare otomatik yeniden deploy eder (1–2 dakika)

### ⚠ Site güncellenmiyorsa
Daha önce "GitHub'da değiştirdim ama sitede eski görünüyor" sorunu yaşandı.
Sırayla kontrol et:

1. **Tarayıcı önbelleği** — gizli sekmede aç veya `Cmd+Shift+R`
2. **Doğru repo mu?** Ortada iki repo var: `HypnosCreative` ve
   `HypnosCreativeWeb`. Cloudflare'nin hangisine bağlı olduğunu
   **Cloudflare → Workers & Pages → hypnosweb → Deployments** sekmesinden
   doğrula. Yanlış repoya yükleme yaparsan site hiç değişmez.
3. **Deployment başarılı mı?** Aynı sekmede son deployment'ın saati ve
   "Success" durumu görünmeli

---

## Erişilebilirlik notu

Site WCAG 2.1 AA seviyesinde doğrulandı — 87 metin öğesinin tamamı geçiyor,
en düşük kontrast 4.83:1.

Yeni renk eklerken dikkat:
- **Turuncu ve mercan metin için kullanılamaz** (beyaz üzerinde 2.5–3.9:1).
  Bunlar yalnız illüstrasyon, çizgi ve dolgu renkleridir.
- Koyu zeminli bölümlerde ikincil metin `--mist` olmalı, `--slate` değil.
- Renkli zemin üzerine yazı gerekiyorsa koyu hap kullan (`.cover-art .badge`
  örneğindeki gibi).

`prefers-reduced-motion` açık kullanıcılarda tüm animasyonlar kapanır.
