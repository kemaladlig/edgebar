# EdgeBar ⚡ (Arc & Vivaldi Inspired Web Panels)

Chrome için geliştirilmiş; sayfa içinde yer kaplamayan, gözü yormayan ve dilediğiniz siteleri (Gemini, ChatGPT, X, DevDocs vb.) aktif oturumlarınızla yan panelde açan ultra-hafif Manifest V3 eklentisi.

---

## 🌟 Öne Çıkan Özellikler

1. **Sola Tam Yapışık Birleşik Panel (Zero Gap):**
   - Panel açıldığında sol kenara `0px` boşlukla kusursuz oturur; aradan web sayfası sızmaz.
   - **Sol Sütun (44px):** Gemini, ChatGPT, X ve özel kısayollarınızın yer aldığı modern koyu dock.
   - **Sağ Alan:** Geniş web paneli, başlık kontrolleri ve boyutlandırma tutamacı.

2. **Gözü Yormayan Minimalist Tetikleyici (Sol Alt):**
   - Kapalıyken sol alt köşede çok küçük (~32px) yarı saydam bir kapsül olarak bekler.
   - Koyu ve açık temalı tüm web sitelerinde Apple fasetli cam efekti ve ince parlak kenarlığıyla net görünür, dikkatinizi dağıtmaz.

3. **Kalıcı Oturum Havuzu (Arc Stili Multi-Iframe Pool):**
   - Paneli kapattığınızda veya sekmeler arasında gezindiğinizde **Gemini / ChatGPT sohbetiniz ve taslaklarınız asla kaybolmaz**.
   - Her site arka planda canlı tutulur, paneli açtığınız anda kaldığınız yerden devam edersiniz.

4. **Güvenli Kısayol Yönetimi (Kazaen Silme Koruması):**
   - İkon üstünde kazaen silmeye yol açan çarpı butonları kaldırılmıştır.
   - Kısayollara **sağ tıklayarak** menüden güvenle kaldırabilir, URL'sini kopyalayabilir veya yeni sekmede açabilirsiniz.
   - `+` butonuna basarak yeni site ekleyebilir, mevcut siteleri liste üzerinden yönetebilirsiniz.

5. **Aktif Tarayıcı Oturumu ile Giriş (Iframe Security Bypass):**
   - Manifest V3 `declarativeNetRequest` kuralları ile `X-Frame-Options` ve `Content-Security-Policy` engelleri `sub_frame` isteklerinde güvenle aşılır.
   - Halihazırda giriş yapılı olan Google ve OpenAI hesaplarınız doğrudan çalışır.
   - Pano kopyalama (`clipboard`), mikrofon ve ses destekleri açıktır.

6. **%100 CSS İzolasyonu (Shadow DOM):**
   - EdgeBar tamamen izole bir `ShadowRoot` içinde çalışır. Gezdiğiniz hiçbir sitenin (YouTube, Wikipedia, Twitter vb.) CSS stilleri eklentinin görüntüsünü bozamaz.

---

## 🚀 Kurulum (Nasıl Yüklenir?)

1. Bu depoyu klonlayın veya ZIP olarak indirip bir klasöre çıkarın:
   ```bash
   git clone https://github.com/kemaladlig/edgebar.git
   ```
2. Google Chrome (veya Brave / Edge / Opera) tarayıcınızı açın.
3. Adres çubuğuna şunu yazıp Enter'a basın:
   ```text
   chrome://extensions
   ```
4. Sağ üst köşedeki **Geliştirici Modu** (Developer mode) anahtarını **Açık** konuma getirin.
5. Sol üstte beliren **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
6. İndirdiğiniz / klonladığınız **`edgebar`** klasörünü seçin.
7. Tebrikler! Eklenti anında aktifleşecektir. Herhangi bir web sayfasını açtığınızda sol alt köşede EdgeBar simgesini görebilirsiniz.

---

## ⌨️ Kısayollar ve İpuçları

- **Esc Tuşu:** Açık olan paneli veya modalı anında kapatır.
- **Sağ Tık:** Kısayolları kaldırmak veya URL'yi kopyalamak için ikona sağ tıklayın.
- **↻ Yenile Butonu:** Sayfayı değil, sadece panel içindeki siteyi yeniler.
- **↗ Dışa Aç Butonu:** Paneldeki siteyi normal bir tarayıcı sekmesinde açar.
- **Kenardan Boyutlandırma:** Panelin sağ kenarından fareyle tutarak genişliğini ayarlayabilirsiniz; tercihiniz otomatik kaydedilir.
