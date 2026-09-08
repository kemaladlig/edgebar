# EdgeBar - Minimalist Web Panels (Arc & Vivaldi Inspired)

Chrome için geliştirilmiş, sayfa içinde yer kaplamayan, gözü yormayan ve dilediğiniz siteleri (Gemini, ChatGPT, X, DevDocs vb.) aktif oturumlarınızla yan panelde açan ultra-hafif Manifest V3 eklentisi.

---

## 🌟 Öne Çıkan Özellikler

1. **3 Aşamalı (3-Tier) Akıllı Tasarım:**
   - **1. Aşama (Kapalı / Tetikleyici Buton):** Sol üst köşede yarı saydam, çok küçük (~32px) zarif bir buton. Sayfa içeriğini kapatmaz, okuma konforunuzu bozmaz.
   - **2. Aşama (Dikey İnce Şerit / Dock):** Butona tıkladığınızda aşağıya doğru pürüzsüzce uzayan ince (~44px) dikey bir dock. Gemini, ChatGPT, X ve kendi eklediğiniz kısayollar burada sıralanır.
   - **3. Aşama (Slide-out Web Drawer):** Bir kısayola tıkladığınızda hemen yanından kayarak açılan bağımsız web paneli.

2. **Genişliği Ayarlanabilir (Resizable):**
   - Panelin sağ kenarından fareyle tutarak istediğiniz genişliğe çekebilirsiniz. Tercihiniz `chrome.storage.local` üzerinde otomatik saklanır.

3. **Özel Kısayol Ekleme & Çıkarma (+):**
   - `+` butonuna basarak dilediğiniz siteyi (örn: `devdocs.io`, `notion.so`, `youtube.com`) ekleyin.
   - Yüksek çözünürlüklü faviconlar otomatik algılanır.
   - Eklediğiniz sitelerin üzerine gelindiğinde çıkan mini kırmızı çarpı (✕) ile tek tıkla silebilirsiniz.

4. **Aktif Tarayıcı Oturumu ile Giriş (Iframe Security Bypass):**
   - Manifest V3 `declarativeNetRequest` kuralları ile `X-Frame-Options` ve `Content-Security-Policy` engelleri `sub_frame` isteklerinde güvenle aşılır.
   - Gemini ve ChatGPT gibi sitelerde halihazırda giriş yapılı olan Google / OpenAI hesabınız doğrudan çalışır.
   - Pano kopyalama (`clipboard`), mikrofon ve ses destekleri açıktır.

5. **%100 CSS İzolasyonu (Shadow DOM):**
   - EdgeBar tamamen izole bir `ShadowRoot` içinde çalışır. Gezdiğiniz hiçbir sitenin (Wikipedia, Twitter, YouTube vb.) CSS stilleri eklentinin görüntüsünü bozamaz.

---

## 🚀 Kurulum (Nasıl Yüklenir?)

1. Google Chrome (veya Brave / Edge / Opera) tarayıcınızı açın.
2. Adres çubuğuna şunu yazıp Enter'a basın:
   ```text
   chrome://extensions
   ```
3. Sağ üst köşedeki **Geliştirici Modu** (Developer mode) anahtarını **Açık** konuma getirin.
4. Sol üstte beliren **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
5. Açılan pencerede şu klasörü seçin:
   ```text
   c:\Users\kemal\Desktop\edgebar
   ```
6. Tebrikler! Eklenti anında aktifleşecektir. Artık herhangi bir web sayfasını açtığınızda sol üst köşede EdgeBar tetikleyici butonunu görebilirsiniz.

---

## ⌨️ Kısayollar ve İpuçları

- **Esc Tuşu:** Açık olan paneli veya modalı anında kapatır.
- **Yeniden Tıklama:** Açık olan kısayol simgesine tekrar tıklamak paneli kapatır.
- **↻ Yenile Butonu:** Sayfayı değil, sadece panel içindeki siteyi yeniler.
- **↗ Dışa Aç Butonu:** Paneldeki siteyi normal bir tarayıcı sekmesinde açar.
