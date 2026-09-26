# Hypnos Creative — Web Sitesi

hypnoscreative.com'un tek sayfalık sitesi (siyah/lime arayüz, Eylül 2026).
Derleme adımı yok; düz HTML + CSS + JS. Cloudflare Workers (`wrangler.jsonc`,
`hypnosweb`) repo kökünü statik olarak yayınlar.

## Dosyalar

```
index.html            Ana sayfa
styles.css            Genel stiller
interactions.css/.js  Hover, menü, brief formu vb. etkileşimler
app.js                Sayfa mantığı (brief formu, SSS, menü)
eye.css/.js           Göz animasyonu
eye-glow.css/.js      Gözün Glow Card ışıkları (ES module)
eye-focus.css/.js     Yumuşak fare odağı
goz-glow.html         Yazısız, bağımsız göz animasyonu
assets/               Logo, favicon, fontlar (+ OFL lisansları), görseller
assets/covers/        Üretim alanı kapakları (sitede .jpg kullanılır)
vendor/glow-card/     Glow Card kütüphanesi (lisansı klasörde)
YAYINA-ALMA.txt       Paketin kurulum notu
```

## Notlar

- Brief formu sunucuya göndermez; kullanıcının e-posta uygulamasında
  `info@hypnoscreative.com` adresine bir taslak açar.
- Blog, AI detay sayfaları ve Gizlilik & KVKK bağlantıları mevcut
  hypnoscreative.com adreslerine gider; bu sayfalar bu repoda yok.
- Glow Card modülü ES module olduğu için siteyi HTTP üzerinden aç
  (dosyaya çift tıklamak efektleri çalıştırmayabilir).

## Yerelde çalıştırma

```bash
python3 -m http.server 8901
```

Sonra `http://localhost:8901` adresini aç.

## Yayına alma

`main`'e gelen her commit'i Cloudflare otomatik deploy eder (1–2 dakika).
Site güncellenmiyorsa: gizli sekmede aç, Cloudflare → Workers & Pages →
hypnosweb → Deployments'ta doğru repoya bağlı olduğunu ve son deploy'un
"Success" olduğunu kontrol et.
