# kayıtçılar

İki kişilik bir prodüksiyon ekibinin tek sayfalık tanıtım sitesi. Reklam
setlerinin backstage'ini sinematik çekiyoruz, ayrıca freelance reklam/tanıtım
videosu da yapıyoruz.

Sitenin konsepti bir **kamera vizörü**: ziyaretçi sayfaya bizim kameramızdan
bakıyormuş hissi alıyor — REC göstergesi, akan timecode, klaket (slate)
kartları, sinemaskop letterbox bantları ve film grain efektiyle.

## Klasör yapısı

```
kayitcilar/
├── index.html        # sayfa iskeleti / içerik
├── css/
│   └── styles.css    # tüm görsel tasarım (renk, font, animasyon)
├── js/
│   └── main.js       # timecode, sahne etiketi, reveal, video oynatma
├── assets/           # kapak görselleri ve videolar buraya
└── README.md
```

## Nasıl çalıştırılır

Statik bir site — derleme (build) gerektirmez. İki yol var:

- **VS Code + Live Server:** `index.html`'e sağ tıkla → **Open with Live Server**.
  (Eklenti: "Live Server" by Ritwick Dey.)
- **Terminalden basit sunucu:** proje klasöründe
  ```bash
  python3 -m http.server 8000
  ```
  sonra tarayıcıdan `http://localhost:8000` adresine git.

> Not: `index.html`'i çift tıklayıp doğrudan `file://` ile de açabilirsin,
> ama YouTube embed ve fontlar için canlı sunucu kullanmak daha sağlıklıdır.

## Neyi nereden düzenlerim?

Tüm metin ve linkler `index.html` içinde, ilgili bölümlerin başına yorum
satırı eklendi. Hızlı rehber:

### 1. İletişim maili
`index.html` → "SCENE 05 — İLETİŞİM" bölümü:
```html
<a class="contact-mail" href="mailto:merhaba@kayitcilar.com">merhaba@kayitcilar.com</a>
```
Hem `mailto:` adresini hem de görünen metni değiştir.

### 2. Sosyal medya linkleri
Aynı bölümdeki `.socials` içinde her `href="#"` değerini kendi profil
adresinle değiştir:
```html
<a href="https://instagram.com/kullanici_adin" aria-label="Instagram">instagram</a>
```

### 3. Ekip isimleri
`index.html` → "SCENE 02 — Hakkımızda" bölümü, `.crew-card` içindeki
`<p class="name">Kayıtçı 01</p>` satırlarını isimlerinizle değiştirin.
İsterseniz `.role` (görev) metnini de güncelleyin.

### 4. Video kartları (İşler) — YouTube ekleme
`index.html` → "SCENE 04 — İŞLER" bölümünde her kartın `.frame` butonu var:

```html
<button class="frame f1"
        type="button"
        data-youtube-id="aqz-KE-bpKQ"      <!-- buraya kendi video ID'in -->
        data-cover="assets/kapak1.jpg"     <!-- opsiyonel kapak görseli -->
        aria-label="... — videoyu oynat"></button>
```

- **`data-youtube-id`**: YouTube video ID'si. Örnek: video linki
  `https://youtu.be/AbCdEf12345` ya da
  `https://www.youtube.com/watch?v=AbCdEf12345` ise ID = `AbCdEf12345`.
  Şu an dört kart da örnek bir videoyla (Big Buck Bunny) çalışıyor;
  ID'leri kendi videolarınla değiştir.
- **`data-cover`**: Kart kapağı olarak gösterilecek görsel (örn
  `assets/kapak1.jpg`). **Boş bırakırsan** kartın mevcut renkli gradient'i
  (f1–f4) kapak olarak kalır — yani görsel koymak zorunda değilsin.
- Kart başlığı/açıklaması ve klaket bilgisi (roll / scene / take) hemen
  altındaki `.slatebar` ve `.work-title` içinde; serbestçe düzenle.

**Nasıl çalışır?** Sayfa açılırken video yüklenmez (hızlı açılış / lazy load).
Karta tıklayınca (ya da klavyeyle Enter/Space) o anda YouTube oynatıcısı
gömülür ve otomatik oynar.

### 5. Görsel & video dosyaları
Kapak görsellerini ve diğer medyayı `assets/` klasörüne koy, `index.html`
içinden `assets/dosya-adi.jpg` şeklinde referans ver.

## Tasarım notları

- **Fontlar:** Archivo (başlık/gövde) + IBM Plex Mono (HUD/etiketler),
  Google Fonts üzerinden yükleniyor.
- **Renkler** ve tüm animasyonlar `css/styles.css` en üstündeki `:root`
  değişkenlerinde ve ilgili bölümlerde tanımlı.
- `prefers-reduced-motion` açık kullanıcılarda animasyonlar otomatik kapanır.
