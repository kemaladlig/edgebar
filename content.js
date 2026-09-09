// ============================================================================
// EdgeBar - Content Script (Linear / Raycast / Arc Inspired)
// Self-contained, High-Performance Side Dock & Slide-Out Web Panels
// ============================================================================

(function () {
  'use strict';

  if (window.top !== window || window.__edgebar_initialized) {
    return;
  }
  window.__edgebar_initialized = true;

  // ==========================================================================
  // CONSTANTS & ICONS
  // ==========================================================================
  const ICONS = {
    back: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12.5 15-5-5 5-5"/></svg>`,
    sidebarClosed: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><circle cx="12" cy="10" r="1.3" fill="currentColor"/></svg>`,
    sidebarOpen: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><path d="m13.5 8-2 2 2 2"/></svg>`,
    trigger: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><circle cx="12" cy="10" r="1.3" fill="currentColor"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`,
    plus: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v12M4 10h12"/></svg>`,
    reload: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6L2 18"/><path d="M2 13.5V18h4.5"/></svg>`,
    external: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 11v5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16V7.5A1.5 1.5 0 0 1 4.5 6H9.5"/><path d="M11.5 3.5h5v5M8 12 16.5 3.5"/></svg>`,
    close: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-10 10M5 5l10 10"/></svg>`,
    gemini: `<svg viewBox="0 0 24 24" fill="currentColor" color="#f4f4f5"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"/></svg>`,
    chatgpt: `<svg viewBox="0 0 24 24" fill="currentColor" color="#10a37f"><path d="M22.28 10.74c-.16-1.52-.89-2.92-2.07-3.92a7.35 7.35 0 0 0-4.08-1.55c-.4-.95-1.07-1.78-1.92-2.39a6.6 6.6 0 0 0-4.9-.76 6.8 6.8 0 0 0-4.07 2.62 7.2 7.2 0 0 0-2.38 4.49 7.33 7.33 0 0 0-1.14 4.31c.25 1.54 1.05 2.94 2.29 3.96a7.22 7.22 0 0 0 4.23 1.53c.4.95 1.07 1.78 1.93 2.39a6.65 6.65 0 0 0 4.88.75 6.82 6.82 0 0 0 4.08-2.62 7.23 7.23 0 0 0 2.38-4.49 7.34 7.34 0 0 0 1.15-4.32c-.17-1.54-.92-2.97-2.17-4.02l-.5-.48.5-.49Zm-9.17 11.23c-1.1 0-2.18-.3-3.13-.88l.15-.09 3.93-2.27c.2-.12.33-.33.35-.57v-5.55l1.67.96v4.61c0 2.09-1.7 3.79-3.79 3.79l-.18-.01v.01Zm-8.4-4.5c-.7-.95-1.09-2.1-1.09-3.3 0-1.05.3-2.07.87-2.95l.15.26 2.27 3.93c.12.2.33.33.57.35h5.55v1.93H7.5c-2.09 0-3.79-1.7-3.79-3.79v-.43Zm-1.03-9.5c.38-1.12 1.13-2.08 2.12-2.73a5.55 5.55 0 0 1 3.42-.58l-.16.27-2.27 3.93a.62.62 0 0 0 0 .66l2.77 4.8-1.67.96-4-6.93a3.78 3.78 0 0 1-.21-.38Zm14.28 4.58-2.77-4.8 1.67-.96 4 6.93c.3.5.47 1.07.5 1.66.08 1.18-.32 2.34-1.1 3.23a5.55 5.55 0 0 1-3.41 1.91l.15-.26 2.27-3.93a.62.62 0 0 0 0-.66l-1.31-2.12Zm3.12-2.58c0 1.05-.3 2.07-.87 2.95l-.15-.26-2.27-3.93a.62.62 0 0 0-.57-.35h-5.55v-1.93h5.45c2.09 0 3.79 1.7 3.79 3.79l.17.33Zm-10.37-4.4a3.79 3.79 0 0 1 3.79 3.79v5.55l-1.67-.96V7.07c0-2.09-1.7-3.79-3.79-3.79-.4 0-.8.06-1.19.19l.27.15 2.59 1.45Z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor" color="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  };

  const DEFAULT_SHORTCUTS = [
    { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', svgKey: 'gemini' }
  ];

  // ==========================================================================
  // TEMPLATES
  // ==========================================================================
  const TEMPLATES = {
    getDrawerHtml: (icons) => `
      <div class="eb-resizer-top" title="Yüksekliği ayarlamak için yukarı/aşağı sürükleyin"></div>
      <div class="eb-dock-rail">
        <div class="eb-dock-top">
          <button type="button" class="eb-dock-new-tab-btn" title="Yeni Sekme">${icons.plus}</button>
          <div class="eb-open-tabs-list"></div>
          <div class="eb-tabs-divider" style="display:none;"></div>
          <button type="button" class="eb-settings-btn" title="Ayarlar">${icons.settings}</button>
        </div>
        <div class="eb-dock-bottom">
          <div class="eb-dock-drag-handle" title="Yukarı/aşağı taşımak için sürükleyin">
            <span class="eb-drag-grip-line"></span>
          </div>
          <div class="eb-items-list"></div>
          <button type="button" class="eb-toggle-btn" title="Paneli Daralt (Esc)">
            ${icons.sidebarOpen}
          </button>
        </div>
      </div>
      <div class="eb-panel-main">
        <div class="eb-drawer-header">
          <button type="button" class="eb-action-btn eb-header-back" title="Geri">${icons.back}</button>
          <button type="button" class="eb-action-btn eb-header-new-tab" title="Yeni Sekme">${icons.plus}</button>
          <div class="eb-url-bar-wrap">
            <img class="eb-drawer-favicon" src="" alt="" style="display:none;" />
            <input class="eb-url-input" type="text" placeholder="URL girin veya Google'da arayın..." spellcheck="false" autocomplete="off" />
          </div>
          <div class="eb-drawer-actions">
            <div class="eb-zoom-group">
              <button class="eb-zoom-btn eb-zoom-out" title="Uzaklaştır (−)">−</button>
              <span class="eb-zoom-label" title="Sıfırla (%100)">100%</span>
              <button class="eb-zoom-btn eb-zoom-in" title="Yakınlaştır (+)">+</button>
            </div>
            <button class="eb-action-btn eb-reload" title="Yenile">${icons.reload}</button>
            <button class="eb-action-btn eb-external" title="Yeni Sekmede Aç">${icons.external}</button>
            <button class="eb-action-btn eb-close" title="Kapat (Esc)">${icons.close}</button>
          </div>
        </div>
        <div class="eb-drawer-body">
          <div class="eb-loader-overlay eb-hidden">
            <div class="eb-spinner"></div>
            <span>Yükleniyor...</span>
          </div>
          <div class="eb-blank-page eb-hidden">
            <div class="eb-blank-card">
              <div class="eb-google-brand">
                <span class="eb-g-blue">G</span><span class="eb-g-red">o</span><span class="eb-g-yellow">o</span><span class="eb-g-blue">g</span><span class="eb-g-green">l</span><span class="eb-g-red">e</span>
              </div>
              <form class="eb-blank-search-form" onsubmit="return false;">
                <div class="eb-blank-search-box">
                  <svg class="eb-blank-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" class="eb-blank-search-input" placeholder="Google'da arayın veya URL yazın..." spellcheck="false" autocomplete="off" />
                </div>
                <div class="eb-suggestions-dropdown eb-hidden"></div>
              </form>
              <div class="eb-blank-chips">
                <button type="button" class="eb-blank-chip" data-url="https://www.google.com">🔍 Google</button>
                <button type="button" class="eb-blank-chip" data-url="https://gemini.google.com">✨ Gemini</button>
                <button type="button" class="eb-blank-chip" data-url="https://chatgpt.com">🤖 ChatGPT</button>
                <button type="button" class="eb-blank-chip" data-url="https://github.com">🐙 GitHub</button>
                <button type="button" class="eb-blank-chip" data-url="https://youtube.com">▶ YouTube</button>
              </div>
            </div>
          </div>
          <div class="eb-settings-view eb-hidden">
            <div class="eb-settings-container">
              <div class="eb-settings-hero">
                <div class="eb-settings-hero-title">
                  <div class="eb-settings-hero-icon">${icons.settings}</div>
                  <h2>EdgeBar Tercihleri</h2>
                  <span class="eb-settings-badge">v1.2</span>
                </div>
                <p class="eb-settings-hero-desc">Çalışma alanınızı, dikey sekmeleri ve kısayol davranışlarını kişiselleştirin.</p>
              </div>

              <!-- Section 1: Kısayol & Uygulama Yönetimi (Öncelikli) -->
              <div class="eb-settings-card">
                <div class="eb-settings-card-header">
                  <span class="eb-settings-card-title">Kayıtlı Uygulamalar & Kısayollar</span>
                </div>
                <div class="eb-settings-card-body">
                  <div class="eb-quick-add-row">
                    <input class="eb-quick-add-input" type="text" placeholder="Yeni site ekleyin (örn: notion.so, figma.com)..." spellcheck="false" autocomplete="off" />
                    <button type="button" class="eb-quick-add-btn" title="Kısayolu Ekle">
                      ${icons.plus} <span>Ekle</span>
                    </button>
                  </div>
                  <div class="eb-manage-list"></div>
                  <div class="eb-settings-card-footer">
                    <button type="button" class="eb-btn-link eb-reset-defaults">Varsayılan Kısayollara Sıfırla (Gemini)</button>
                  </div>
                </div>
              </div>

              <!-- Section 2: Görünüm & Panel -->
              <div class="eb-settings-card">
                <div class="eb-settings-card-header">
                  <span class="eb-settings-card-title">Görünüm & Panel</span>
                </div>
                <div class="eb-settings-card-body">
                  <div class="eb-setting-item">
                    <div class="eb-setting-info">
                      <span class="eb-setting-name">Panel Yüksekliği</span>
                      <span class="eb-setting-desc">Panelin dikey yerleşim ve görünüm modu</span>
                    </div>
                    <div class="eb-segmented-control eb-height-segmented">
                      <button type="button" class="eb-segmented-btn eb-h-full" data-height="full">Tam Boy</button>
                      <button type="button" class="eb-segmented-btn eb-h-floating" data-height="floating">Ada Modu</button>
                      <button type="button" class="eb-segmented-btn eb-h-custom" data-height="custom">Serbest</button>
                    </div>
                  </div>

                  <div class="eb-setting-item">
                    <div class="eb-setting-info">
                      <span class="eb-setting-name">İkon Boyutu</span>
                      <span class="eb-setting-desc">Dock üzerindeki butonların ölçeği</span>
                    </div>
                    <div class="eb-segmented-control eb-size-segmented">
                      <button type="button" class="eb-segmented-btn eb-size-small" data-size="small">Küçük (S)</button>
                      <button type="button" class="eb-segmented-btn eb-size-medium" data-size="medium">Normal (M)</button>
                      <button type="button" class="eb-segmented-btn eb-size-large" data-size="large">Büyük (L)</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Çalışma & Davranış -->
              <div class="eb-settings-card">
                <div class="eb-settings-card-header">
                  <span class="eb-settings-card-title">Çalışma & Davranış</span>
                </div>
                <div class="eb-settings-card-body">
                  <div class="eb-setting-item">
                    <div class="eb-setting-info">
                      <span class="eb-setting-name">Dışarı Tıklayınca</span>
                      <span class="eb-setting-desc">Web sayfasına tıklandığında paneli otomatik kapat</span>
                    </div>
                    <div class="eb-segmented-control eb-clickout-segmented">
                      <button type="button" class="eb-segmented-btn eb-co-close" data-clickout="true">Kapat</button>
                      <button type="button" class="eb-segmented-btn eb-co-stay" data-clickout="false">Açık Kalsın</button>
                    </div>
                  </div>

                  <div class="eb-setting-item">
                    <div class="eb-setting-info">
                      <span class="eb-setting-name">Cihaz Emülasyonu</span>
                      <span class="eb-setting-desc">Sitelerin mobil veya masaüstü sürümünü yükle</span>
                    </div>
                    <div class="eb-segmented-control eb-mode-segmented">
                      <button type="button" class="eb-segmented-btn eb-segment-desktop" data-mode="desktop">Masaüstü</button>
                      <button type="button" class="eb-segmented-btn eb-segment-mobile" data-mode="mobile">Mobil</button>
                    </div>
                  </div>

                  <div class="eb-setting-item">
                    <div class="eb-setting-info">
                      <span class="eb-setting-name">Klavye Kısayolu</span>
                      <span class="eb-setting-desc">Paneli her yerden açıp kapatmak için</span>
                    </div>
                    <div class="eb-kbd-badge">
                      <kbd>Alt</kbd> + <kbd>S</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="eb-iframe-container"></div>
          <div class="eb-resizer" title="Genişletmek için sürükleyin"></div>
        </div>
      </div>
    `,
    getContextMenuHtml: () => `
      <div class="eb-context-item eb-ctx-open">Yeni Sekmede Aç</div>
      <div class="eb-context-item eb-ctx-copy">URL'yi Kopyala</div>
      <div class="eb-context-item eb-danger eb-ctx-delete">Kısayolu Kaldır</div>
    `
  };

  // ==========================================================================
  // SETTINGS VIEW FACTORY (IN-PANEL VIEW)
  // ==========================================================================
  function createSettingsView(options) {
    const {
      drawer, icons, defaultShortcuts,
      getShortcuts, setShortcuts,
      getViewMode, setViewMode,
      getIconSize, setIconSize,
      getHeightMode, setHeightMode,
      getCollapsedStyle, setCollapsedStyle,
      getClickOutsideClose, setClickOutsideClose,
      onOpenShortcut
    } = options;

    const settingsView = drawer.querySelector('.eb-settings-view');
    const quickAddInput = settingsView.querySelector('.eb-quick-add-input');
    const quickAddBtn = settingsView.querySelector('.eb-quick-add-btn');
    const resetDefaultsBtn = settingsView.querySelector('.eb-reset-defaults');
    const manageList = settingsView.querySelector('.eb-manage-list');
    const segMobile = settingsView.querySelector('.eb-segment-mobile');
    const segDesktop = settingsView.querySelector('.eb-segment-desktop');
    const sizeBtns = settingsView.querySelectorAll('.eb-size-segmented .eb-segmented-btn');
    const heightBtns = settingsView.querySelectorAll('.eb-height-segmented .eb-segmented-btn');
    const clickoutBtns = settingsView.querySelectorAll('.eb-clickout-segmented .eb-segmented-btn');

    function syncUI() {
      const currentMode = getViewMode();
      segMobile.classList.toggle('eb-active-segment', currentMode === 'mobile');
      segDesktop.classList.toggle('eb-active-segment', currentMode === 'desktop');
      sizeBtns.forEach((btn) => btn.classList.toggle('eb-active-segment', btn.dataset.size === getIconSize()));
      heightBtns.forEach((btn) => btn.classList.toggle('eb-active-segment', btn.dataset.height === getHeightMode()));
      const coVal = String(getClickOutsideClose());
      clickoutBtns.forEach((btn) => btn.classList.toggle('eb-active-segment', btn.dataset.clickout === coVal));
      renderManageList();
    }

    function renderManageList() {
      manageList.innerHTML = '';
      const list = getShortcuts();
      if (list.length === 0) {
        manageList.innerHTML = `<div class="eb-manage-empty">Henüz site eklenmedi.</div>`;
        return;
      }
      list.forEach((sc) => {
        const item = document.createElement('div');
        item.className = 'eb-manage-item';
        let iconHtml = '';
        if (sc.svgKey && icons[sc.svgKey]) {
          iconHtml = `<div class="eb-manage-item-icon">${icons[sc.svgKey]}</div>`;
        } else if (sc.favicon) {
          iconHtml = `<div class="eb-manage-item-icon"><img src="${sc.favicon}" alt="" onerror="this.parentElement.innerHTML='${sc.name.charAt(0)}'" /></div>`;
        } else {
          iconHtml = `<div class="eb-manage-item-icon">${sc.name.charAt(0)}</div>`;
        }
        item.innerHTML = `
          <div class="eb-manage-item-left">
            ${iconHtml}
            <div class="eb-manage-item-text">
              <span class="eb-manage-item-name" title="${sc.name}">${sc.name}</span>
              <span class="eb-manage-item-url" title="${sc.url}">${sc.url}</span>
            </div>
          </div>
          <button type="button" class="eb-manage-item-del" title="Kaldır">${icons.close}</button>
        `;
        item.querySelector('.eb-manage-item-del').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteShortcutFromView(sc.id);
        });
        item.addEventListener('click', () => {
          if (onOpenShortcut) onOpenShortcut(sc);
        });
        manageList.appendChild(item);
      });
    }

    function deleteShortcutFromView(id) {
      const remaining = getShortcuts().filter((s) => s.id !== id);
      setShortcuts(remaining);
      syncUI();
    }

    function show() {
      syncUI();
      settingsView.classList.remove('eb-hidden');
      const scroller = settingsView.querySelector('.eb-settings-container');
      if (scroller) scroller.scrollTop = 0;
    }

    function hide() {
      settingsView.classList.add('eb-hidden');
    }

    function isVisible() {
      return !settingsView.classList.contains('eb-hidden');
    }

    [segMobile, segDesktop].forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.mode === getViewMode()) return;
        setViewMode(btn.dataset.mode);
        syncUI();
      });
    });
    sizeBtns.forEach((btn) => btn.addEventListener('click', () => { setIconSize(btn.dataset.size); syncUI(); }));
    heightBtns.forEach((btn) => btn.addEventListener('click', () => { setHeightMode(btn.dataset.height); syncUI(); }));
    clickoutBtns.forEach((btn) => btn.addEventListener('click', () => { setClickOutsideClose(btn.dataset.clickout === 'true'); syncUI(); }));

    function handleSaveCustomShortcut() {
      let raw = quickAddInput.value.trim();
      if (!raw) { quickAddInput.focus(); return; }
      let name = '', url = '';
      if (raw.includes(' ') && (raw.includes('http') || raw.includes('.'))) {
        const parts = raw.split(/\s+/);
        const urlPart = parts.find((p) => p.includes('.') || p.startsWith('http'));
        if (urlPart) { url = urlPart; name = parts.filter((p) => p !== urlPart).join(' '); }
      }
      if (!url) url = raw;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      try {
        const parsedUrl = new URL(url);
        if (!name) { const base = parsedUrl.hostname.replace(/^www\./, '').split('.')[0]; name = base.charAt(0).toUpperCase() + base.slice(1); }
        const newShortcut = { id: 'custom_' + Date.now(), name, url, favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64` };
        setShortcuts([...getShortcuts(), newShortcut]);
        quickAddInput.value = '';
        syncUI();
        if (onOpenShortcut) onOpenShortcut(newShortcut);
      } catch (_) { alert('Geçerli bir web adresi giriniz.'); quickAddInput.focus(); }
    }

    quickAddBtn.addEventListener('click', handleSaveCustomShortcut);
    quickAddInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSaveCustomShortcut(); });
    resetDefaultsBtn.addEventListener('click', () => {
      setShortcuts([...defaultShortcuts]);
      setCollapsedStyle('strip');
      setIconSize('medium');
      syncUI();
      if (onOpenShortcut) onOpenShortcut(defaultShortcuts[0]);
    });

    return { show, hide, isVisible, syncUI };
  }

  // ==========================================================================
  // STATE VARIABLES
  // ==========================================================================
  let shortcuts = [];
  let activeShortcutId = null;
  let openTabs = [];
  let activeTabId = null;
  let drawerWidth = 486;
  let drawerHeight = 600;
  let currentActiveUrl = '';
  let navHistory = [];
  let viewMode = 'mobile';
  let heightMode = 'full';
  let collapsedStyle = 'strip';
  let clickOutsideClose = false;
  let iconSize = 'medium';
  let zoomLevel = 1.0;

  // --- Drag State (unified single-axis Y positioning) ---
  let panelY = null;        // null = CSS default (bottom:24px), number = custom top in px
  let isDragging = false;
  let dragStartMouseY = 0;
  let dragStartElY = 0;
  let dragMoved = false;
  let preventNextClick = false;

  // Clean host page styles
  try {
    if (document.documentElement) {
      document.documentElement.style.removeProperty('margin-left');
      document.documentElement.style.removeProperty('width');
      document.documentElement.style.removeProperty('box-sizing');
      document.documentElement.style.removeProperty('transition');
    }
    if (document.body) {
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('box-sizing');
      document.body.style.removeProperty('transition');
    }
  } catch (_) {}

  const iframePool = new Map();

  // ==========================================================================
  // SHADOW DOM SETUP
  // ==========================================================================
  const host = document.createElement('div');
  host.id = 'v-edgebar-host';
  const shadow = host.attachShadow({ mode: 'open' });

  // Critical inline CSS: Prevents any FOUC (flash of unstyled content) or transition flicker
  const inlineCriticalStyle = document.createElement('style');
  inlineCriticalStyle.textContent = `
    :host { all: initial; }
    .eb-container { opacity: 0 !important; pointer-events: none !important; }
    .eb-container.eb-ready { opacity: 1 !important; pointer-events: auto !important; }
    .eb-preload, .eb-preload * { transition: none !important; animation: none !important; }
  `;
  shadow.appendChild(inlineCriticalStyle);

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('style.css');
  shadow.appendChild(styleLink);

  const container = document.createElement('div');
  container.className = 'eb-container eb-preload';
  shadow.appendChild(container);
  (document.body || document.documentElement).appendChild(host);

  let isCssReady = false;
  let isStateReady = false;

  function markReadyIfComplete() {
    if (!isCssReady || !isStateReady) return;
    requestAnimationFrame(() => {
      container.classList.add('eb-ready');
      setTimeout(() => {
        container.classList.remove('eb-preload');
      }, 50);
    });
  }

  styleLink.onload = () => {
    isCssReady = true;
    markReadyIfComplete();
  };
  setTimeout(() => {
    isCssReady = true;
    markReadyIfComplete();
  }, 100);

  // --- Tooltip ---
  const tooltip = document.createElement('div');
  tooltip.className = 'eb-tooltip';
  container.appendChild(tooltip);
  function showTooltip(text, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    tooltip.textContent = text;
    tooltip.style.top = `${rect.top + (rect.height / 2) - 13}px`;
    tooltip.classList.add('eb-tooltip-show');
  }
  function hideTooltip() { tooltip.classList.remove('eb-tooltip-show'); }

  // --- Trigger Pill ---
  const triggerPill = document.createElement('button');
  triggerPill.className = 'eb-trigger-pill';
  triggerPill.title = 'EdgeBar Aç';
  triggerPill.innerHTML = ICONS.sidebarClosed;
  container.appendChild(triggerPill);

  // --- Drawer ---
  const drawer = document.createElement('div');
  drawer.className = 'eb-drawer eb-height-full';
  drawer.innerHTML = TEMPLATES.getDrawerHtml(ICONS);
  container.appendChild(drawer);

  const itemsList = drawer.querySelector('.eb-items-list');
  const toggleBtn = drawer.querySelector('.eb-toggle-btn');
  const settingsBtn = drawer.querySelector('.eb-settings-btn');
  const dockNewTabBtn = drawer.querySelector('.eb-dock-new-tab-btn');
  const openTabsList = drawer.querySelector('.eb-open-tabs-list');
  const tabsDivider = drawer.querySelector('.eb-tabs-divider');
  const dockDragHandle = drawer.querySelector('.eb-dock-drag-handle');
  const headerBackBtn = drawer.querySelector('.eb-header-back');
  const headerNewTabBtn = drawer.querySelector('.eb-header-new-tab');
  const urlBarWrap = drawer.querySelector('.eb-url-bar-wrap');
  const urlInput = drawer.querySelector('.eb-url-input');
  const drawerFavicon = drawer.querySelector('.eb-drawer-favicon');
  const drawerHeader = drawer.querySelector('.eb-drawer-header');
  const reloadBtn = drawer.querySelector('.eb-reload');
  const externalBtn = drawer.querySelector('.eb-external');
  const closeBtn = drawer.querySelector('.eb-close');
  const iframeContainer = drawer.querySelector('.eb-iframe-container');
  const loader = drawer.querySelector('.eb-loader-overlay');
  const blankPage = drawer.querySelector('.eb-blank-page');
  const blankSearchInput = drawer.querySelector('.eb-blank-search-input');
  const suggestionsDropdown = drawer.querySelector('.eb-suggestions-dropdown');
  const resizer = drawer.querySelector('.eb-resizer');
  const resizerTop = drawer.querySelector('.eb-resizer-top');
  const zoomInBtn = drawer.querySelector('.eb-zoom-in');
  const zoomOutBtn = drawer.querySelector('.eb-zoom-out');
  const zoomLabel = drawer.querySelector('.eb-zoom-label');

  // --- Drag Overlay ---
  const dragOverlay = document.createElement('div');
  dragOverlay.className = 'eb-drag-overlay';
  container.appendChild(dragOverlay);

  // --- Context Menu ---
  const contextMenu = document.createElement('div');
  contextMenu.className = 'eb-context-menu';
  contextMenu.innerHTML = TEMPLATES.getContextMenuHtml();
  container.appendChild(contextMenu);
  let contextTargetShortcut = null;
  function showContextMenu(e, sc) {
    e.preventDefault();
    contextTargetShortcut = sc;
    contextMenu.style.top = `${Math.min(e.clientY - 20, window.innerHeight - 110)}px`;
    contextMenu.classList.add('eb-show');
  }
  function hideContextMenu() { contextMenu.classList.remove('eb-show'); contextTargetShortcut = null; }
  window.addEventListener('click', hideContextMenu);
  contextMenu.querySelector('.eb-ctx-open').addEventListener('click', () => {
    if (contextTargetShortcut) { window.open(contextTargetShortcut.url, '_blank'); hideContextMenu(); }
  });
  contextMenu.querySelector('.eb-ctx-copy').addEventListener('click', () => {
    if (contextTargetShortcut) { navigator.clipboard.writeText(contextTargetShortcut.url); hideContextMenu(); }
  });
  contextMenu.querySelector('.eb-ctx-delete').addEventListener('click', () => {
    if (contextTargetShortcut) { deleteShortcut(contextTargetShortcut.id); hideContextMenu(); }
  });

  // ==========================================================================
  // SETTINGS VIEW INSTANCE & IN-PANEL NAVIGATION
  // ==========================================================================
  let isSettingsViewActive = false;
  let prevActiveState = null;

  const settingsView = createSettingsView({
    drawer,
    icons: ICONS,
    defaultShortcuts: DEFAULT_SHORTCUTS,
    getShortcuts: () => shortcuts,
    setShortcuts: (updated) => {
      shortcuts = updated;
      saveShortcuts();
      renderShortcuts();
      if (activeShortcutId && !shortcuts.some((s) => s.id === activeShortcutId)) {
        shortcuts.length > 0 ? openDrawer(shortcuts[0]) : closeDrawer();
      }
    },
    getViewMode: () => viewMode,
    setViewMode: (newMode) => {
      chrome.runtime.sendMessage({ type: 'SET_VIEW_MODE', mode: newMode }, () => {
        viewMode = newMode;
        if (activeShortcutId && iframePool.has(activeShortcutId)) {
          loader.classList.remove('eb-hidden');
          const f = iframePool.get(activeShortcutId);
          f.src = f.src;
        }
      });
    },
    getHeightMode: () => heightMode,
    setHeightMode: (mode) => { applyHeightMode(mode); chrome.storage.local.set({ edgebar_height_mode: mode }); },
    getIconSize: () => iconSize,
    setIconSize: (size) => applyIconSize(size),
    getCollapsedStyle: () => collapsedStyle,
    setCollapsedStyle: (style) => { applyCollapsedStyle(style); chrome.storage.local.set({ edgebar_collapsed_style: style }); },
    getClickOutsideClose: () => clickOutsideClose,
    setClickOutsideClose: (val) => { clickOutsideClose = val; chrome.storage.local.set({ edgebar_click_outside_close: val }); },
    onOpenShortcut: (sc) => {
      closeSettingsView(false);
      openDrawer(sc);
    }
  });

  function openSettingsView() {
    if (isSettingsViewActive && drawer.classList.contains('eb-open')) {
      closeSettingsView();
      return;
    }

    if (!isSettingsViewActive) {
      if (activeTabId) {
        prevActiveState = { type: 'tab', id: activeTabId };
      } else if (activeShortcutId) {
        prevActiveState = { type: 'shortcut', id: activeShortcutId };
      } else {
        prevActiveState = { type: 'blank' };
      }
    }

    isSettingsViewActive = true;

    // Open drawer if closed
    if (!drawer.classList.contains('eb-open')) {
      triggerPill.classList.add('eb-hidden');
      drawer.classList.remove('eb-strip-only');
      drawer.classList.add('eb-open');
      drawer.style.width = `${drawerWidth}px`;
      if (heightMode === 'custom') drawer.style.height = `${drawerHeight}px`;
      applyPosition();
      toggleBtn.innerHTML = ICONS.sidebarOpen;
      toggleBtn.title = 'Paneli Daralt (Esc)';
      itemsList.querySelectorAll('.eb-item-btn').forEach((b) => { b.draggable = true; });
      chrome.storage.local.set({ edgebar_drawer_open: true });
    }

    // Visual active indicators
    drawer.querySelectorAll('.eb-item-btn').forEach((b) => b.classList.remove('eb-active'));
    drawer.querySelectorAll('.eb-tab-btn').forEach((b) => b.classList.remove('eb-active'));
    dockNewTabBtn.classList.remove('eb-active-dock-tab');
    settingsBtn.classList.add('eb-active-dock-tab');

    // Hide active content
    blankPage.classList.add('eb-hidden');
    loader.classList.add('eb-hidden');
    iframePool.forEach((frame) => frame.classList.remove('eb-active-frame'));

    // URL bar in settings mode
    drawerHeader.classList.add('eb-settings-mode');
    urlInput.value = 'edgebar://settings';
    urlInput.dataset.fullUrl = 'edgebar://settings';
    drawerFavicon.style.display = 'none';

    settingsView.show();
    updateBackButtonState();
  }

  function closeSettingsView(restorePrevious = true) {
    if (!isSettingsViewActive) return;
    isSettingsViewActive = false;
    settingsBtn.classList.remove('eb-active-dock-tab');
    drawerHeader.classList.remove('eb-settings-mode');
    settingsView.hide();

    if (!restorePrevious) return;

    if (prevActiveState) {
      if (prevActiveState.type === 'tab' && openTabs.some((t) => t.id === prevActiveState.id)) {
        switchToTab(prevActiveState.id);
        return;
      }
      if (prevActiveState.type === 'shortcut' && shortcuts.some((s) => s.id === prevActiveState.id)) {
        const sc = shortcuts.find((s) => s.id === prevActiveState.id);
        openDrawer(sc);
        return;
      }
    }

    if (openTabs.length > 0) {
      switchToTab(openTabs[0].id);
    } else if (shortcuts.length > 0) {
      openDrawer(shortcuts[0]);
    } else {
      createOpenTab();
    }
  }

  settingsBtn.addEventListener('click', () => {
    if (preventNextClick) return;
    openSettingsView();
  });

  function deleteShortcut(id) {
    shortcuts = shortcuts.filter((s) => s.id !== id);
    if (activeShortcutId === id) {
      shortcuts.length > 0 ? openDrawer(shortcuts[0]) : closeDrawer();
    }
    if (iframePool.has(id)) { iframePool.get(id).remove(); iframePool.delete(id); }
    saveShortcuts();
    renderShortcuts();
    settingsView.syncUI();
  }

  // ==========================================================================
  // ZOOM
  // ==========================================================================
  function applyZoom(newZoom) {
    zoomLevel = Math.round(Math.max(0.7, Math.min(newZoom, 1.5)) * 10) / 10;
    iframePool.forEach((frame) => { frame.style.zoom = `${zoomLevel}`; });
    zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
    chrome.storage.local.set({ edgebar_zoom: zoomLevel });
  }
  zoomInBtn.addEventListener('click', () => applyZoom(zoomLevel + 0.1));
  zoomOutBtn.addEventListener('click', () => applyZoom(zoomLevel - 0.1));
  zoomLabel.addEventListener('click', () => applyZoom(1.0));

  // ==========================================================================
  // HEIGHT MODE & COLLAPSED STYLE
  // ==========================================================================
  function applyHeightMode(mode) {
    heightMode = mode;
    drawer.classList.remove('eb-height-full', 'eb-height-floating', 'eb-height-custom');
    drawer.classList.add(`eb-height-${mode}`);
    if (drawer.classList.contains('eb-open')) {
      // Re-apply sizing for current mode
      drawer.style.removeProperty('height');
      if (mode === 'custom') {
        drawer.style.height = `${drawerHeight}px`;
      }
    }
    settingsView.syncUI();
  }

  function applyCollapsedStyle(style) {
    collapsedStyle = style;
    if (!drawer.classList.contains('eb-open')) {
      closeDrawer(false);
    }
    settingsView.syncUI();
  }

  function applyIconSize(size) {
    iconSize = size || 'medium';
    drawer.classList.remove('eb-size-small', 'eb-size-medium', 'eb-size-large');
    drawer.classList.add(`eb-size-${iconSize}`);
    if (!drawer.classList.contains('eb-open') && collapsedStyle === 'strip') {
      const railWidths = { small: 38, medium: 46, large: 54 };
      drawer.style.width = `${railWidths[iconSize] || 46}px`;
    }
    chrome.storage.local.set({ edgebar_icon_size: iconSize });
    settingsView.syncUI();
  }

  // ==========================================================================
  // POSITION SYSTEM (CLEAN, SINGLE VALUE)
  //
  // panelY = null  → CSS default position (bottom: 24px for strip/pill)
  // panelY = <num> → custom top position in px
  //
  // Key insight: when setting JS `top`, we MUST also set `bottom: auto`
  // to override CSS `bottom: 24px`, otherwise the element stretches.
  // ==========================================================================
  function getMaxY(el) {
    // Calculate max Y so the element stays fully visible
    const h = el.offsetHeight || 60;
    return Math.max(8, window.innerHeight - h - 8);
  }

  function applyPosition() {
    // 1. Clear all JS position overrides — let CSS defaults take effect
    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    triggerPill.style.removeProperty('top');
    triggerPill.style.removeProperty('bottom');

    // 2. If no custom position, CSS defaults apply (bottom: 24px)
    if (panelY === null) return;

    const isOpen = drawer.classList.contains('eb-open');

    // 3. In full-height open mode, panel fills viewport — custom Y is irrelevant
    if (isOpen && heightMode === 'full') return;
    // 4. In floating open mode, CSS handles positioning (top:14px, bottom:14px)
    if (isOpen && heightMode === 'floating') return;

    // 5. Clamp to safe viewport bounds based on actual element height
    let el, maxY;
    if (!isOpen && collapsedStyle === 'pill') {
      el = triggerPill;
    } else {
      el = drawer;
    }
    maxY = getMaxY(el);
    const y = Math.max(8, Math.min(panelY, maxY));

    // 6. Apply position — always override CSS bottom to prevent stretching
    el.style.top = `${y}px`;
    el.style.bottom = 'auto';
  }

  // ==========================================================================
  // DRAG-TO-MOVE (CLEAN IMPLEMENTATION)
  //
  // Works on: drag handle (strip), header title area (open), trigger pill
  // Behavior: mousedown → mousemove with 3px deadzone → mouseup saves
  // ==========================================================================
  let dragElHeight = 60; // cached at drag start for accurate clamping

  function onDragStart(e) {
    if (e.button !== 0) return;
    // Don't intercept clicks on buttons/interactive elements
    if (e.target.closest('.eb-action-btn, .eb-zoom-group, .eb-zoom-btn, .eb-item-btn, .eb-toggle-btn, .eb-settings-btn, .eb-dock-new-tab-btn, .eb-header-new-tab, .eb-url-bar-wrap, .eb-url-input, .eb-drawer-actions')) return;

    e.preventDefault(); // Prevent default browser drag/selection behavior

    isDragging = true;
    dragMoved = false;
    dragStartMouseY = e.clientY;

    // Which element are we dragging?
    const isOpen = drawer.classList.contains('eb-open');
    const el = (!isOpen && collapsedStyle === 'pill') ? triggerPill : drawer;
    const rect = el.getBoundingClientRect();
    dragStartElY = rect.top;
    dragElHeight = rect.height || 60;
  }

  // Attach drag to: drag handle, trigger pill, drawer header
  if (dockDragHandle) dockDragHandle.addEventListener('mousedown', onDragStart);
  triggerPill.addEventListener('mousedown', onDragStart);
  drawerHeader.addEventListener('mousedown', (e) => {
    if (e.target.closest('.eb-drawer-actions, .eb-action-btn, .eb-zoom-group, .eb-zoom-btn, .eb-header-new-tab, .eb-url-bar-wrap, .eb-url-input')) return;
    onDragStart(e);
  });

  // ==========================================================================
  // SHORTCUTS & DRAG-AND-DROP REORDERING
  // ==========================================================================
  let draggedItemIndex = null;

  function renderShortcuts() {
    itemsList.innerHTML = '';
    shortcuts.forEach((sc, index) => {
      const btn = document.createElement('button');
      btn.className = 'eb-item-btn';
      if (sc.id === activeShortcutId) btn.classList.add('eb-active');
      btn.dataset.id = sc.id;
      btn.dataset.index = index;
      btn.draggable = drawer.classList.contains('eb-open');

      const iconWrap = document.createElement('div');
      iconWrap.className = 'eb-item-icon';
      if (sc.svgKey && ICONS[sc.svgKey]) {
        iconWrap.innerHTML = ICONS[sc.svgKey];
      } else if (sc.favicon) {
        const img = document.createElement('img');
        img.src = sc.favicon; img.alt = sc.name;
        img.onerror = () => { iconWrap.innerHTML = `<div class="eb-letter-avatar">${sc.name.charAt(0)}</div>`; };
        iconWrap.appendChild(img);
      } else {
        iconWrap.innerHTML = `<div class="eb-letter-avatar">${sc.name.charAt(0)}</div>`;
      }
      btn.appendChild(iconWrap);

      btn.addEventListener('mouseenter', () => showTooltip(sc.name, btn));
      btn.addEventListener('mouseleave', hideTooltip);
      btn.addEventListener('click', () => {
        if (preventNextClick) return;
        if (activeShortcutId === sc.id && drawer.classList.contains('eb-open')) {
          if (currentActiveUrl !== sc.url) {
            openDrawer(sc);
          } else {
            closeDrawer();
          }
        } else {
          openDrawer(sc);
        }
      });
      btn.addEventListener('contextmenu', (e) => showContextMenu(e, sc));

      // Drag-and-drop reordering (different from position drag)
      btn.addEventListener('dragstart', (e) => {
        if (!drawer.classList.contains('eb-open')) { e.preventDefault(); return; }
        draggedItemIndex = index; btn.classList.add('eb-dragging'); hideTooltip();
        e.dataTransfer.effectAllowed = 'move';
      });
      btn.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; btn.classList.add('eb-drag-over'); });
      btn.addEventListener('dragleave', () => btn.classList.remove('eb-drag-over'));
      btn.addEventListener('drop', (e) => {
        e.preventDefault(); btn.classList.remove('eb-drag-over');
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
          const moved = shortcuts.splice(draggedItemIndex, 1)[0];
          shortcuts.splice(index, 0, moved);
          saveShortcuts(); renderShortcuts(); settingsView.syncUI();
        }
      });
      btn.addEventListener('dragend', () => { btn.classList.remove('eb-dragging', 'eb-drag-over'); draggedItemIndex = null; });
      itemsList.appendChild(btn);
    });
  }

  // ==========================================================================
  // OPEN TABS (ARC / EDGE STYLE CLOSABLE TABS)
  // ==========================================================================
  function renderOpenTabs() {
    openTabsList.innerHTML = '';
    if (openTabs.length === 0) {
      tabsDivider.style.display = 'none';
      return;
    }
    tabsDivider.style.display = 'block';

    openTabs.forEach((tab) => {
      const btn = document.createElement('div');
      btn.className = `eb-tab-btn ${activeTabId === tab.id ? 'eb-active' : ''}`;
      btn.dataset.tabId = tab.id;

      let iconContent = '';
      if (tab.favicon) {
        iconContent = `<img src="${tab.favicon}" alt="" onerror="this.parentElement.innerHTML='🌐'" />`;
      } else {
        iconContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
      }

      btn.innerHTML = `
        <div class="eb-tab-icon">${iconContent}</div>
        <button type="button" class="eb-tab-close-btn" aria-label="Sekmeyi Kapat">${ICONS.close}</button>
      `;

      btn.addEventListener('mouseenter', () => showTooltip(tab.title || tab.url || 'Yeni Sekme', btn));
      btn.addEventListener('mouseleave', hideTooltip);

      btn.addEventListener('click', () => {
        if (preventNextClick) return;
        switchToTab(tab.id);
      });

      const closeBtn = btn.querySelector('.eb-tab-close-btn');
      closeBtn.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        showTooltip('Sekmeyi Kapat', closeBtn);
      });
      closeBtn.addEventListener('mouseleave', hideTooltip);
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideTooltip();
        closeOpenTab(tab.id);
      });

      openTabsList.appendChild(btn);
    });
  }

  function createOpenTab(url = '', title = '', favicon = '') {
    const tabId = 'tab_' + Date.now();
    let tabTitle = title;
    let tabFavicon = favicon;

    if (url && !tabTitle) {
      try {
        const p = new URL(url);
        const host = p.hostname.replace(/^www\./, '');
        tabTitle = host.split('.')[0];
        tabTitle = tabTitle.charAt(0).toUpperCase() + tabTitle.slice(1);
        tabFavicon = `https://www.google.com/s2/favicons?domain=${p.hostname}&sz=64`;
      } catch (_) {
        tabTitle = url;
      }
    }

    const newTab = {
      id: tabId,
      title: tabTitle || 'Yeni Sekme',
      url: url || '',
      favicon: tabFavicon || '',
      history: []
    };

    openTabs.push(newTab);
    switchToTab(tabId);
  }

  function switchToTab(tabId) {
    const tab = openTabs.find((t) => t.id === tabId);
    if (!tab) return;

    if (isSettingsViewActive) {
      isSettingsViewActive = false;
      settingsBtn.classList.remove('eb-active-dock-tab');
      drawerHeader.classList.remove('eb-settings-mode');
      settingsView.hide();
    }

    activeTabId = tabId;
    activeShortcutId = null;
    currentActiveUrl = tab.url;
    navHistory = tab.history || [];

    drawer.querySelectorAll('.eb-item-btn').forEach((b) => b.classList.remove('eb-active'));
    dockNewTabBtn.classList.remove('eb-active-dock-tab');
    renderOpenTabs();
    updateBackButtonState();

    if (tab.url) {
      blankPage.classList.add('eb-hidden');
      try {
        const u = new URL(tab.url);
        urlInput.value = u.hostname.replace(/^www\./, '');
        urlInput.dataset.fullUrl = tab.url;
      } catch (_) {
        urlInput.value = tab.title || tab.url;
        urlInput.dataset.fullUrl = tab.url;
      }
      drawerFavicon.style.display = tab.favicon ? 'block' : 'none';
      if (tab.favicon) drawerFavicon.src = tab.favicon;

      iframePool.forEach((frame) => frame.classList.remove('eb-active-frame'));
      let activeFrame = iframePool.get(tab.id);
      if (!activeFrame) {
        loader.classList.remove('eb-hidden');
        activeFrame = document.createElement('iframe');
        activeFrame.className = 'eb-iframe eb-active-frame';
        activeFrame.allow = 'clipboard-read; clipboard-write; camera; microphone; geolocation; encrypted-media';
        activeFrame.style.zoom = `${zoomLevel}`;
        activeFrame.src = tab.url;
        activeFrame.addEventListener('load', () => loader.classList.add('eb-hidden'));
        iframeContainer.appendChild(activeFrame);
        iframePool.set(tab.id, activeFrame);
      } else {
        activeFrame.classList.add('eb-active-frame');
        activeFrame.style.zoom = `${zoomLevel}`;
        loader.classList.add('eb-hidden');
      }
    } else {
      // Blank tab view
      iframePool.forEach((frame) => frame.classList.remove('eb-active-frame'));
      loader.classList.add('eb-hidden');
      blankPage.classList.remove('eb-hidden');
      urlInput.value = '';
      urlInput.dataset.fullUrl = '';
      urlInput.placeholder = "URL girin veya Google'da arayın...";
      drawerFavicon.style.display = 'none';
      if (blankSearchInput) blankSearchInput.value = '';
      setTimeout(() => {
        if (blankSearchInput) {
          blankSearchInput.focus();
        } else {
          urlInput.focus();
        }
      }, 60);
    }

    if (!drawer.classList.contains('eb-open')) {
      triggerPill.classList.add('eb-hidden');
      drawer.classList.remove('eb-strip-only');
      drawer.classList.add('eb-open');
      drawer.style.width = `${drawerWidth}px`;
      if (heightMode === 'custom') drawer.style.height = `${drawerHeight}px`;
      applyPosition();
      toggleBtn.innerHTML = ICONS.sidebarOpen;
      toggleBtn.title = 'Paneli Daralt (Esc)';
      itemsList.querySelectorAll('.eb-item-btn').forEach((b) => { b.draggable = true; });
      chrome.storage.local.set({ edgebar_drawer_open: true });
    }
  }

  function closeOpenTab(tabId) {
    const index = openTabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    if (iframePool.has(tabId)) {
      iframePool.get(tabId).remove();
      iframePool.delete(tabId);
    }

    openTabs.splice(index, 1);

    if (activeTabId === tabId) {
      if (openTabs.length > 0) {
        const nextTab = openTabs[Math.max(0, index - 1)];
        switchToTab(nextTab.id);
      } else if (shortcuts.length > 0) {
        openDrawer(shortcuts[0]);
      } else {
        createOpenTab();
      }
    } else {
      renderOpenTabs();
    }
  }

  // ==========================================================================
  // STATE LOADING & PERSISTENCE
  // ==========================================================================
  function loadState() {
    chrome.storage.local.get([
      'edgebar_shortcuts', 'edgebar_drawer_width', 'edgebar_drawer_height',
      'edgebar_height_mode', 'edgebar_collapsed_style', 'edgebar_panel_y',
      'edgebar_last_active', 'edgebar_drawer_open', 'edgebar_view_mode', 'edgebar_zoom',
      'edgebar_click_outside_close', 'edgebar_icon_size'
    ], (result) => {
      // Shortcuts
      const isOldDefault = result.edgebar_shortcuts && Array.isArray(result.edgebar_shortcuts) &&
        result.edgebar_shortcuts.length === 3 && result.edgebar_shortcuts[0].id === 'gemini' &&
        result.edgebar_shortcuts[1].id === 'chatgpt' && result.edgebar_shortcuts[2].id === 'x';
      if (!result.edgebar_shortcuts || !Array.isArray(result.edgebar_shortcuts) || result.edgebar_shortcuts.length === 0 || isOldDefault) {
        shortcuts = [...DEFAULT_SHORTCUTS];
        chrome.storage.local.set({ edgebar_shortcuts: shortcuts });
      } else {
        shortcuts = result.edgebar_shortcuts;
      }

      // Dimensions
      if (result.edgebar_drawer_width) {
        drawerWidth = Math.max(360, Math.min(result.edgebar_drawer_width, window.innerWidth * 0.85));
      }
      if (result.edgebar_drawer_height) {
        drawerHeight = Math.max(300, Math.min(result.edgebar_drawer_height, window.innerHeight - 20));
      }
      if (result.edgebar_zoom) {
        zoomLevel = result.edgebar_zoom;
        zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
      }
      if (result.edgebar_view_mode) viewMode = result.edgebar_view_mode;

      // Position
      panelY = (result.edgebar_panel_y !== undefined && result.edgebar_panel_y !== null) ? result.edgebar_panel_y : null;

      // Height mode
      if (result.edgebar_height_mode) heightMode = result.edgebar_height_mode;
      applyHeightMode(heightMode);

      // Collapsed style & Icon size
      collapsedStyle = result.edgebar_collapsed_style || 'strip';
      clickOutsideClose = result.edgebar_click_outside_close === true;
      iconSize = result.edgebar_icon_size || 'medium';
      applyIconSize(iconSize);

      renderShortcuts();
      renderOpenTabs();
      settingsView.syncUI();

      // Restore open/closed state (default to closed / strip mode on fresh page load)
      if (result.edgebar_drawer_open === true) {
        openDrawer(shortcuts.find((s) => s.id === result.edgebar_last_active) || shortcuts[0]);
      } else {
        closeDrawer(false);
      }

      isStateReady = true;
      markReadyIfComplete();
    });
  }

  function saveShortcuts() {
    chrome.storage.local.set({ edgebar_shortcuts: shortcuts });
  }

  // ==========================================================================
  // DRAWER OPEN / CLOSE
  // ==========================================================================
  function openDrawer(sc) {
    if (!sc) sc = shortcuts[0] || DEFAULT_SHORTCUTS[0];

    if (isSettingsViewActive) {
      isSettingsViewActive = false;
      settingsBtn.classList.remove('eb-active-dock-tab');
      drawerHeader.classList.remove('eb-settings-mode');
      settingsView.hide();
    }

    activeShortcutId = sc.id;
    activeTabId = null;
    currentActiveUrl = sc.url;
    navHistory = [];

    drawer.querySelectorAll('.eb-item-btn').forEach((b) => b.classList.toggle('eb-active', b.dataset.id === sc.id));
    dockNewTabBtn.classList.remove('eb-active-dock-tab');
    renderOpenTabs();
    blankPage.classList.add('eb-hidden');
    updateBackButtonState();

    try {
      const u = new URL(sc.url);
      urlInput.value = u.hostname.replace(/^www\./, '');
      urlInput.dataset.fullUrl = sc.url;
    } catch (_) {
      urlInput.value = sc.name || sc.url;
      urlInput.dataset.fullUrl = sc.url;
    }
    drawerFavicon.style.display = sc.favicon ? 'block' : 'none';
    if (sc.favicon) drawerFavicon.src = sc.favicon;

    // Iframe management
    let activeFrame = iframePool.get(sc.id);
    iframePool.forEach((frame) => frame.classList.remove('eb-active-frame'));

    if (!activeFrame) {
      loader.classList.remove('eb-hidden');
      activeFrame = document.createElement('iframe');
      activeFrame.className = 'eb-iframe eb-active-frame';
      activeFrame.allow = 'clipboard-read; clipboard-write; camera; microphone; geolocation; encrypted-media';
      activeFrame.style.zoom = `${zoomLevel}`;
      activeFrame.src = sc.url;
      activeFrame.addEventListener('load', () => loader.classList.add('eb-hidden'));
      iframeContainer.appendChild(activeFrame);
      iframePool.set(sc.id, activeFrame);
    } else {
      activeFrame.classList.add('eb-active-frame');
      activeFrame.style.zoom = `${zoomLevel}`;
      loader.classList.add('eb-hidden');
    }

    // Reset inline styles, then apply open state
    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    drawer.style.removeProperty('height');
    drawer.style.removeProperty('width');

    triggerPill.classList.add('eb-hidden');
    drawer.classList.remove('eb-strip-only');
    drawer.classList.add('eb-open');
    drawer.style.width = `${drawerWidth}px`;
    if (heightMode === 'custom') drawer.style.height = `${drawerHeight}px`;

    applyPosition();

    toggleBtn.innerHTML = ICONS.sidebarOpen;
    toggleBtn.title = 'Paneli Daralt (Esc)';
    itemsList.querySelectorAll('.eb-item-btn').forEach((b) => { b.draggable = true; });

    chrome.storage.local.set({ edgebar_drawer_open: true, edgebar_last_active: sc.id });
  }

  function closeDrawer(saveState = true) {
    if (isSettingsViewActive) {
      isSettingsViewActive = false;
      settingsBtn.classList.remove('eb-active-dock-tab');
      drawerHeader.classList.remove('eb-settings-mode');
      settingsView.hide();
    }

    drawer.classList.remove('eb-open');
    dockNewTabBtn.classList.remove('eb-active-dock-tab');
    toggleBtn.innerHTML = ICONS.sidebarClosed;
    toggleBtn.title = 'Paneli Genişlet';

    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    drawer.style.removeProperty('height');
    drawer.style.removeProperty('width');

    if (collapsedStyle === 'strip') {
      drawer.classList.add('eb-strip-only');
      const railWidths = { small: 38, medium: 46, large: 54 };
      drawer.style.width = `${railWidths[iconSize] || 46}px`;
      triggerPill.classList.add('eb-hidden');
    } else {
      drawer.classList.remove('eb-strip-only');
      triggerPill.classList.remove('eb-hidden');
    }

    applyPosition();

    itemsList.querySelectorAll('.eb-item-btn').forEach((b) => { b.draggable = false; });
    hideTooltip();
    hideContextMenu();
    if (saveState) chrome.storage.local.set({ edgebar_drawer_open: false });
  }

  // ==========================================================================
  // CLICK HANDLERS
  // ==========================================================================
  triggerPill.addEventListener('click', () => {
    if (preventNextClick) return;
    openDrawer(shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0]);
  });
  toggleBtn.addEventListener('click', () => {
    if (preventNextClick) return;
    drawer.classList.contains('eb-open') ? closeDrawer() : openDrawer(shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0]);
  });
  closeBtn.addEventListener('click', () => closeDrawer());
  reloadBtn.addEventListener('click', () => {
    if (activeShortcutId && iframePool.has(activeShortcutId)) {
      loader.classList.remove('eb-hidden');
      const f = iframePool.get(activeShortcutId); f.src = f.src;
    }
  });
  externalBtn.addEventListener('click', () => { if (currentActiveUrl) window.open(currentActiveUrl, '_blank'); });

  // ==========================================================================
  // NAVIGATION & HISTORY
  // ==========================================================================
  function updateBackButtonState() {
    if (isSettingsViewActive) {
      headerBackBtn.style.opacity = '1';
      headerBackBtn.style.pointerEvents = 'auto';
      headerBackBtn.title = 'Geri (Çalışma Alanına Dön)';
      return;
    }

    let hasHistory = false;
    if (activeTabId) {
      const currentTab = openTabs.find((t) => t.id === activeTabId);
      hasHistory = currentTab && currentTab.history && currentTab.history.length > 0;
    } else {
      hasHistory = navHistory && navHistory.length > 0;
    }

    if (hasHistory) {
      headerBackBtn.style.opacity = '1';
      headerBackBtn.style.pointerEvents = 'auto';
      headerBackBtn.title = 'Geri';
    } else {
      headerBackBtn.style.opacity = '0.35';
      headerBackBtn.style.pointerEvents = 'none';
      headerBackBtn.title = 'Geri (Geçmiş yok)';
    }
  }

  function handleBack() {
    if (isSettingsViewActive) {
      closeSettingsView();
      return;
    }

    if (activeTabId) {
      const currentTab = openTabs.find((t) => t.id === activeTabId);
      if (!currentTab || !currentTab.history || currentTab.history.length === 0) return;

      const prevUrl = currentTab.history.pop();
      updateBackButtonState();

      if (prevUrl === '__blank__') {
        currentTab.url = '';
        currentTab.title = 'Yeni Sekme';
        currentTab.favicon = '';
        currentActiveUrl = '';
        switchToTab(currentTab.id);
        return;
      }
      navigateTo(prevUrl, false);
    } else {
      if (navHistory.length === 0) return;
      const prevUrl = navHistory.pop();
      updateBackButtonState();
      navigateTo(prevUrl, false);
    }
  }

  headerBackBtn.addEventListener('click', handleBack);

  dockNewTabBtn.addEventListener('click', (e) => {
    if (preventNextClick) return;
    createOpenTab();
  });
  headerNewTabBtn.addEventListener('click', () => createOpenTab());

  // Quick launch chips on blank page
  blankPage.querySelectorAll('.eb-blank-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const targetUrl = chip.dataset.url;
      if (targetUrl) {
        handleNavigateUrl(targetUrl);
      }
    });
  });

  let suggestDebounceTimer = null;
  let activeSuggestionIndex = -1;
  let currentSuggestions = [];

  function hideSuggestions() {
    if (suggestionsDropdown) {
      suggestionsDropdown.classList.add('eb-hidden');
      suggestionsDropdown.innerHTML = '';
      currentSuggestions = [];
      activeSuggestionIndex = -1;
    }
  }

  function renderSuggestions(list) {
    if (!suggestionsDropdown) return;
    currentSuggestions = list;
    activeSuggestionIndex = -1;
    suggestionsDropdown.innerHTML = '';

    if (!list || list.length === 0) {
      hideSuggestions();
      return;
    }

    list.forEach((itemText, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'eb-suggestion-item';
      itemEl.dataset.index = idx;
      itemEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>${itemText}</span>
      `;

      itemEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        blankSearchInput.value = itemText;
        urlInput.value = itemText;
        hideSuggestions();
        handleNavigateUrl(itemText);
      });

      suggestionsDropdown.appendChild(itemEl);
    });

    suggestionsDropdown.classList.remove('eb-hidden');
  }

  function updateActiveSuggestionUI() {
    if (!suggestionsDropdown) return;
    const items = suggestionsDropdown.querySelectorAll('.eb-suggestion-item');
    items.forEach((it, idx) => {
      it.classList.toggle('eb-sug-active', idx === activeSuggestionIndex);
    });
    if (activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]) {
      blankSearchInput.value = currentSuggestions[activeSuggestionIndex];
      urlInput.value = currentSuggestions[activeSuggestionIndex];
    }
  }

  function fetchSuggestions(query) {
    clearTimeout(suggestDebounceTimer);
    const q = (query || '').trim();
    if (!q || q.length < 2) {
      hideSuggestions();
      return;
    }

    suggestDebounceTimer = setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'GET_SEARCH_SUGGESTIONS', query: q }, (res) => {
        if (chrome.runtime.lastError || !res || !res.suggestions) {
          hideSuggestions();
          return;
        }
        renderSuggestions(res.suggestions);
      });
    }, 120);
  }

  if (blankSearchInput) {
    blankSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentSuggestions.length > 0) {
          activeSuggestionIndex = (activeSuggestionIndex + 1) % currentSuggestions.length;
          updateActiveSuggestionUI();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentSuggestions.length > 0) {
          activeSuggestionIndex = (activeSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
          updateActiveSuggestionUI();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]
          ? currentSuggestions[activeSuggestionIndex]
          : blankSearchInput.value;
        hideSuggestions();
        handleNavigateUrl(selected);
        blankSearchInput.blur();
      } else if (e.key === 'Escape') {
        hideSuggestions();
        blankSearchInput.blur();
      }
    });

    blankSearchInput.addEventListener('input', () => {
      urlInput.value = blankSearchInput.value;
      fetchSuggestions(blankSearchInput.value);
    });

    blankSearchInput.addEventListener('blur', () => {
      setTimeout(hideSuggestions, 180);
    });

    urlInput.addEventListener('input', () => {
      if (!blankPage.classList.contains('eb-hidden')) {
        blankSearchInput.value = urlInput.value;
        fetchSuggestions(urlInput.value);
      }
    });
  }

  urlInput.addEventListener('focus', () => {
    if (urlInput.dataset.fullUrl) {
      urlInput.value = urlInput.dataset.fullUrl;
    }
    urlInput.select();
  });

  urlInput.addEventListener('blur', () => {
    if (urlInput.dataset.fullUrl) {
      try {
        const parsed = new URL(urlInput.dataset.fullUrl);
        urlInput.value = parsed.hostname.replace(/^www\./, '');
      } catch (_) {
        urlInput.value = urlInput.dataset.fullUrl;
      }
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNavigateUrl(urlInput.value);
      urlInput.blur();
    } else if (e.key === 'Escape') {
      urlInput.blur();
    }
  });

  function navigateTo(finalUrl, pushToHistory = true) {
    let currentTab = openTabs.find((t) => t.id === activeTabId);

    // If currently on a pinned shortcut and navigating, open in a new tab to preserve shortcut
    if (!currentTab) {
      createOpenTab(finalUrl);
      return;
    }

    if (pushToHistory) {
      if (currentActiveUrl) {
        currentTab.history.push(currentActiveUrl);
      } else {
        currentTab.history.push('__blank__');
      }
    }
    updateBackButtonState();

    blankPage.classList.add('eb-hidden');

    try {
      const parsed = new URL(finalUrl);
      const hostName = parsed.hostname.replace(/^www\./, '');
      let tabName = hostName.split('.')[0];
      tabName = tabName.charAt(0).toUpperCase() + tabName.slice(1);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;

      currentTab.url = finalUrl;
      currentTab.title = tabName;
      currentTab.favicon = faviconUrl;
      currentActiveUrl = finalUrl;

      urlInput.dataset.fullUrl = finalUrl;
      urlInput.value = hostName;
      drawerFavicon.src = faviconUrl;
      drawerFavicon.style.display = 'block';

      renderOpenTabs();

      const frameKey = currentTab.id;
      loader.classList.remove('eb-hidden');
      iframePool.forEach((frame) => frame.classList.remove('eb-active-frame'));

      let activeFrame = iframePool.get(frameKey);
      if (activeFrame) {
        activeFrame.classList.add('eb-active-frame');
        activeFrame.src = finalUrl;
      } else {
        activeFrame = document.createElement('iframe');
        activeFrame.className = 'eb-iframe eb-active-frame';
        activeFrame.allow = 'clipboard-read; clipboard-write; camera; microphone; geolocation; encrypted-media';
        activeFrame.style.zoom = `${zoomLevel}`;
        activeFrame.src = finalUrl;
        activeFrame.addEventListener('load', () => loader.classList.add('eb-hidden'));
        iframeContainer.appendChild(activeFrame);
        iframePool.set(frameKey, activeFrame);
      }
    } catch (err) {
      console.error('URL navigation error:', err);
    }
  }

  function handleNavigateUrl(rawText) {
    let query = (rawText || '').trim();
    if (!query) return;

    let finalUrl = query;
    if (!/^https?:\/\//i.test(query)) {
      if (query.includes('.') && !query.includes(' ')) {
        finalUrl = 'https://' + query;
      } else {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
      }
    }

    navigateTo(finalUrl, true);
  }

  // ==========================================================================
  // RESIZERS (WIDTH & HEIGHT)
  // ==========================================================================
  let isResizing = false;
  let isResizingHeight = false;
  let startX = 0, startY = 0, startWidth = 0, startHeight = 0;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true; startX = e.clientX; startWidth = drawer.getBoundingClientRect().width;
    resizer.classList.add('eb-resizing'); dragOverlay.classList.add('eb-active'); dragOverlay.style.cursor = 'col-resize';
    e.preventDefault();
  });
  resizerTop.addEventListener('mousedown', (e) => {
    if (heightMode !== 'custom') return;
    isResizingHeight = true; startY = e.clientY; startHeight = drawer.getBoundingClientRect().height;
    resizerTop.classList.add('eb-resizing'); dragOverlay.classList.add('eb-active'); dragOverlay.style.cursor = 'ns-resize';
    e.preventDefault();
  });

  // ==========================================================================
  // GLOBAL MOUSE HANDLERS (drag, resize)
  // ==========================================================================
  window.addEventListener('mousemove', (e) => {
    // --- Position drag ---
    if (isDragging) {
      const dy = e.clientY - dragStartMouseY;
      if (!dragMoved && Math.abs(dy) > 3) {
        dragMoved = true;
        dragOverlay.classList.add('eb-active');
        dragOverlay.style.cursor = 'grabbing';
      }
      if (dragMoved) {
        const newY = dragStartElY + dy;
        // Clamp using cached element height so panel never goes off-screen
        const maxY = Math.max(8, window.innerHeight - dragElHeight - 8);
        panelY = Math.max(8, Math.min(newY, maxY));
        // Directly update position during drag for instant feedback
        const isOpen = drawer.classList.contains('eb-open');
        if (!isOpen && collapsedStyle === 'pill') {
          triggerPill.style.top = `${panelY}px`;
          triggerPill.style.bottom = 'auto';
        } else if (!(isOpen && (heightMode === 'full' || heightMode === 'floating'))) {
          drawer.style.top = `${panelY}px`;
          drawer.style.bottom = 'auto';
        }
      }
      return;
    }
    // --- Height resize ---
    if (isResizingHeight) {
      drawerHeight = Math.max(300, Math.min(startHeight + (startY - e.clientY), window.innerHeight - 20));
      drawer.style.height = `${drawerHeight}px`;
      return;
    }
    // --- Width resize ---
    if (isResizing) {
      drawerWidth = Math.max(360, Math.min(startWidth + (e.clientX - startX), window.innerWidth * 0.85));
      drawer.style.width = `${drawerWidth}px`;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dragOverlay.classList.remove('eb-active');
      dragOverlay.style.cursor = '';
      if (dragMoved) {
        preventNextClick = true;
        setTimeout(() => { preventNextClick = false; }, 100);
        chrome.storage.local.set({ edgebar_panel_y: panelY });
      }
    }
    if (isResizingHeight) {
      isResizingHeight = false;
      resizerTop.classList.remove('eb-resizing');
      dragOverlay.classList.remove('eb-active');
      dragOverlay.style.cursor = '';
      chrome.storage.local.set({ edgebar_drawer_height: drawerHeight });
    }
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('eb-resizing');
      dragOverlay.classList.remove('eb-active');
      dragOverlay.style.cursor = '';
      chrome.storage.local.set({ edgebar_drawer_width: drawerWidth });
    }
  });

  // Keep position valid on viewport resize
  window.addEventListener('resize', () => {
    if (panelY !== null) {
      panelY = Math.max(8, Math.min(panelY, window.innerHeight - 60));
      applyPosition();
    }
  });

  // ==========================================================================
  // KEYBOARD & CHROME RUNTIME
  // ==========================================================================
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (contextMenu.classList.contains('eb-show')) hideContextMenu();
      else if (isSettingsViewActive) closeSettingsView();
      else if (drawer.classList.contains('eb-open')) closeDrawer();
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_DRAWER') {
      drawer.classList.contains('eb-open') ? closeDrawer() : openDrawer(shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0]);
    }
  });

  // --- Click Outside to Close ---
  window.addEventListener('mousedown', (e) => {
    if (!clickOutsideClose) return;
    if (!drawer.classList.contains('eb-open')) return;
    // Check if click is inside our shadow host
    if (host.contains(e.target) || e.target === host) return;
    closeDrawer();
  }, true);

  loadState();
})();
