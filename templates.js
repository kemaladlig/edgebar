// ============================================================================
// EdgeBar - DOM Template Builders (Linear / Raycast Aesthetic)
// ============================================================================

window.__EDGEBAR_TEMPLATES = (function () {
  'use strict';

  function getDrawerHtml(ICONS) {
    return `
    <!-- Top Resizer for Custom Height Mode -->
    <div class="eb-resizer-top" title="Yüksekliği ayarlamak için yukarı/aşağı sürükleyin"></div>

    <!-- Left Rail: Integrated Dock Icons -->
    <div class="eb-dock-rail">
      <div class="eb-dock-top">
        <button type="button" class="eb-settings-btn" title="Ayarlar">
          ${ICONS.settings}
        </button>
      </div>
      <div class="eb-dock-bottom">
        <div class="eb-dock-drag-handle" title="Yukarı/aşağı taşımak için sürükleyin">
          <span class="eb-drag-grip-line"></span>
        </div>
        <div class="eb-items-list"></div>
        <button type="button" class="eb-toggle-btn" title="Paneli Daralt (Esc)">
          ${ICONS.sidebarOpen}
        </button>
      </div>
    </div>

    <!-- Right Area: Header, Web Content & Resizers -->
    <div class="eb-panel-main">
      <div class="eb-drawer-header">
        <div class="eb-drawer-title-area">
          <img class="eb-drawer-favicon" src="" alt="" style="display:none;" />
          <span class="eb-drawer-title">Web Panel</span>
        </div>
        <div class="eb-drawer-actions">
          <!-- Zoom Controls -->
          <div class="eb-zoom-group">
            <button class="eb-zoom-btn eb-zoom-out" title="Uzaklaştır (−)">−</button>
            <span class="eb-zoom-label" title="Sıfırla (%100)">100%</span>
            <button class="eb-zoom-btn eb-zoom-in" title="Yakınlaştır (+)">+</button>
          </div>

          <button class="eb-action-btn eb-reload" title="Yenile">
            ${ICONS.reload}
          </button>
          <button class="eb-action-btn eb-external" title="Yeni Sekmede Aç">
            ${ICONS.external}
          </button>
          <button class="eb-action-btn eb-close" title="Kapat (Esc)">
            ${ICONS.close}
          </button>
        </div>
      </div>
      <div class="eb-drawer-body">
        <div class="eb-loader-overlay eb-hidden">
          <div class="eb-spinner"></div>
          <span>Yükleniyor...</span>
        </div>
        <div class="eb-iframe-container"></div>
        <div class="eb-resizer" title="Genişletmek için sürükleyin"></div>
      </div>
    </div>
    `;
  }

  function getModalHtml(ICONS) {
    return `
    <div class="eb-modal-card">
      <div class="eb-modal-header">
        <span class="eb-modal-title">Ayarlar</span>
        <button type="button" class="eb-modal-close" title="Kapat">
          ${ICONS.close}
        </button>
      </div>

      <!-- Segment 1: Görünüm Modu -->
      <div class="eb-setting-row">
        <div class="eb-setting-label">Görünüm</div>
        <div class="eb-segmented-control eb-mode-segmented">
          <button type="button" class="eb-segmented-btn eb-segment-mobile" data-mode="mobile">📱 Mobil</button>
          <button type="button" class="eb-segmented-btn eb-segment-desktop" data-mode="desktop">💻 Masaüstü</button>
        </div>
      </div>

      <!-- Segment 2: Yükseklik -->
      <div class="eb-setting-row">
        <div class="eb-setting-label">Yükseklik</div>
        <div class="eb-segmented-control eb-height-segmented">
          <button type="button" class="eb-segmented-btn eb-h-full" data-height="full">↕ Tam</button>
          <button type="button" class="eb-segmented-btn eb-h-floating" data-height="floating">🏝 Ada</button>
          <button type="button" class="eb-segmented-btn eb-h-custom" data-height="custom">🎛 Serbest</button>
        </div>
      </div>

      <!-- Segment 3: Kapalı Hal -->
      <div class="eb-setting-row">
        <div class="eb-setting-label">Kapalıyken</div>
        <div class="eb-segmented-control eb-collapsed-segmented">
          <button type="button" class="eb-segmented-btn eb-c-strip" data-collapsed="strip">📑 Kısayollar</button>
          <button type="button" class="eb-segmented-btn eb-c-pill" data-collapsed="pill">✦ İkon</button>
        </div>
      </div>

      <!-- Quick Add Row -->
      <div class="eb-setting-row" style="margin-top: 10px;">
        <div class="eb-setting-label">Site Ekle</div>
        <div class="eb-quick-add-row">
          <input class="eb-quick-add-input" type="text" placeholder="URL veya site (örn: notion.so)" />
          <button type="button" class="eb-quick-add-btn" title="Kısayolu Ekle">
            ${ICONS.plus}
          </button>
        </div>
      </div>

      <!-- Existing Shortcuts List -->
      <div class="eb-setting-row">
        <div class="eb-setting-label">Kayıtlı Siteler</div>
        <div class="eb-manage-list"></div>
      </div>

      <!-- Modal Footer -->
      <div class="eb-modal-footer">
        <button type="button" class="eb-btn-link eb-reset-defaults">Varsayılana Sıfırla (Gemini)</button>
      </div>
    </div>
    `;
  }

  function getContextMenuHtml() {
    return `
      <div class="eb-context-item eb-ctx-open">Yeni Sekmede Aç</div>
      <div class="eb-context-item eb-ctx-copy">URL'yi Kopyala</div>
      <div class="eb-context-item eb-danger eb-ctx-delete">Kısayolu Kaldır</div>
    `;
  }

  return {
    getDrawerHtml,
    getModalHtml,
    getContextMenuHtml
  };
})();
