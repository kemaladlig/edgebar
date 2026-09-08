// ============================================================================
// EdgeBar - Content Script (Linear / Raycast / Arc Inspired)
// Standardized Design System, Drag & Drop Reordering, Zoom Controls & Persistent Sessions
// ============================================================================

(function () {
  'use strict';

  if (window.top !== window || window.__edgebar_initialized) {
    return;
  }
  window.__edgebar_initialized = true;

  // --- Refined SVGs (1.8px fine strokes, sleek modern aesthetics) ---
  const ICONS = {
    sidebarClosed: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><circle cx="12" cy="10" r="1.3" fill="currentColor"/></svg>`,
    sidebarOpen: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><path d="m13.5 8-2 2 2 2"/></svg>`,
    trigger: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><circle cx="12" cy="10" r="1.3" fill="currentColor"/></svg>`,
    plus: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v12M4 10h12"/></svg>`,
    reload: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6L2 18"/><path d="M2 13.5V18h4.5"/></svg>`,
    external: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 11v5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16V7.5A1.5 1.5 0 0 1 4.5 6H9.5"/><path d="M11.5 3.5h5v5M8 12 16.5 3.5"/></svg>`,
    close: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-10 10M5 5l10 10"/></svg>`,
    gemini: `<svg viewBox="0 0 24 24" fill="currentColor" color="#f4f4f5"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"/></svg>`,
    chatgpt: `<svg viewBox="0 0 24 24" fill="currentColor" color="#10a37f"><path d="M22.28 10.74c-.16-1.52-.89-2.92-2.07-3.92a7.35 7.35 0 0 0-4.08-1.55c-.4-.95-1.07-1.78-1.92-2.39a6.6 6.6 0 0 0-4.9-.76 6.8 6.8 0 0 0-4.07 2.62 7.2 7.2 0 0 0-2.38 4.49 7.33 7.33 0 0 0-1.14 4.31c.25 1.54 1.05 2.94 2.29 3.96a7.22 7.22 0 0 0 4.23 1.53c.4.95 1.07 1.78 1.93 2.39a6.65 6.65 0 0 0 4.88.75 6.82 6.82 0 0 0 4.08-2.62 7.23 7.23 0 0 0 2.38-4.49 7.34 7.34 0 0 0 1.15-4.32c-.17-1.54-.92-2.97-2.17-4.02l-.5-.48.5-.49Zm-9.17 11.23c-1.1 0-2.18-.3-3.13-.88l.15-.09 3.93-2.27c.2-.12.33-.33.35-.57v-5.55l1.67.96v4.61c0 2.09-1.7 3.79-3.79 3.79l-.18-.01v.01Zm-8.4-4.5c-.7-.95-1.09-2.1-1.09-3.3 0-1.05.3-2.07.87-2.95l.15.26 2.27 3.93c.12.2.33.33.57.35h5.55v1.93H7.5c-2.09 0-3.79-1.7-3.79-3.79v-.43Zm-1.03-9.5c.38-1.12 1.13-2.08 2.12-2.73a5.55 5.55 0 0 1 3.42-.58l-.16.27-2.27 3.93a.62.62 0 0 0 0 .66l2.77 4.8-1.67.96-4-6.93a3.78 3.78 0 0 1-.21-.38Zm14.28 4.58-2.77-4.8 1.67-.96 4 6.93c.3.5.47 1.07.5 1.66.08 1.18-.32 2.34-1.1 3.23a5.55 5.55 0 0 1-3.41 1.91l.15-.26 2.27-3.93a.62.62 0 0 0 0-.66l-1.31-2.12Zm3.12-2.58c0 1.05-.3 2.07-.87 2.95l-.15-.26-2.27-3.93a.62.62 0 0 0-.57-.35h-5.55v-1.93h5.45c2.09 0 3.79 1.7 3.79 3.79l.17.33Zm-10.37-4.4a3.79 3.79 0 0 1 3.79 3.79v5.55l-1.67-.96V7.07c0-2.09-1.7-3.79-3.79-3.79-.4 0-.8.06-1.19.19l.27.15 2.59 1.45Z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor" color="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  };

  const DEFAULT_SHORTCUTS = [
    {
      id: 'gemini',
      name: 'Gemini',
      url: 'https://gemini.google.com',
      svgKey: 'gemini'
    }
  ];

  // --- State Variables ---
  let shortcuts = [];
  let activeShortcutId = null;
  let drawerWidth = 486;
  let drawerHeight = 600;
  let currentActiveUrl = '';
  let viewMode = 'mobile';
  let heightMode = 'full';
  let collapsedStyle = 'strip'; // 'strip' (shortcuts visible on left rail) or 'pill' (only icon)
  let zoomLevel = 1.0;

  // Persistent Iframe Cache (Multi-Session Pool)
  const iframePool = new Map();

  // --- Initialize Shadow DOM ---
  const host = document.createElement('div');
  host.id = 'v-edgebar-host';
  const shadow = host.attachShadow({ mode: 'open' });

  // Stylesheet
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('style.css');
  shadow.appendChild(styleLink);

  // Root Container
  const container = document.createElement('div');
  container.className = 'eb-container';
  shadow.appendChild(container);

  (document.body || document.documentElement).appendChild(host);

  // ==========================================================================
  // DOM BUILDERS
  // ==========================================================================

  // 1. Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'eb-tooltip';
  container.appendChild(tooltip);

  function showTooltip(text, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    tooltip.textContent = text;
    tooltip.style.top = `${rect.top + (rect.height / 2) - 13}px`;
    tooltip.classList.add('eb-tooltip-show');
  }

  function hideTooltip() {
    tooltip.classList.remove('eb-tooltip-show');
  }

  // 2. Top-Left Trigger Pill (Positioned at top-left to seamlessly align with drawer toggle)
  const triggerPill = document.createElement('button');
  triggerPill.className = 'eb-trigger-pill';
  triggerPill.title = 'EdgeBar Aç';
  triggerPill.innerHTML = ICONS.sidebarClosed;
  container.appendChild(triggerPill);

  // 3. Unified Drawer
  const drawer = document.createElement('div');
  drawer.className = 'eb-drawer eb-height-full';
  drawer.innerHTML = `
    <!-- Top Resizer for Custom Height Mode -->
    <div class="eb-resizer-top" title="Yüksekliği ayarlamak için yukarı/aşağı sürükleyin"></div>

    <!-- Left Rail: Integrated Dock Icons -->
    <div class="eb-dock-rail">
      <div class="eb-dock-top">
        <button type="button" class="eb-toggle-btn" title="Paneli Daralt (Esc)">
          ${ICONS.sidebarOpen}
        </button>
        <button type="button" class="eb-add-btn" title="Site Ekle / Ayarlar (+)">
          ${ICONS.plus}
        </button>
      </div>
      <div class="eb-dock-bottom">
        <div class="eb-items-list"></div>
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
  container.appendChild(drawer);

  const itemsList = drawer.querySelector('.eb-items-list');
  const toggleBtn = drawer.querySelector('.eb-toggle-btn');
  const addBtn = drawer.querySelector('.eb-add-btn');

  const drawerFavicon = drawer.querySelector('.eb-drawer-favicon');
  const drawerTitle = drawer.querySelector('.eb-drawer-title');
  const reloadBtn = drawer.querySelector('.eb-reload');
  const externalBtn = drawer.querySelector('.eb-external');
  const closeBtn = drawer.querySelector('.eb-close');
  const iframeContainer = drawer.querySelector('.eb-iframe-container');
  const loader = drawer.querySelector('.eb-loader-overlay');
  const resizer = drawer.querySelector('.eb-resizer');
  const resizerTop = drawer.querySelector('.eb-resizer-top');

  // Zoom Elements
  const zoomInBtn = drawer.querySelector('.eb-zoom-in');
  const zoomOutBtn = drawer.querySelector('.eb-zoom-out');
  const zoomLabel = drawer.querySelector('.eb-zoom-label');

  // Drag Overlay for smooth resizing
  const dragOverlay = document.createElement('div');
  dragOverlay.className = 'eb-drag-overlay';
  container.appendChild(dragOverlay);

  // 4. Safe Right-Click Context Menu
  const contextMenu = document.createElement('div');
  contextMenu.className = 'eb-context-menu';
  contextMenu.innerHTML = `
    <div class="eb-context-item eb-ctx-open">Yeni Sekmede Aç</div>
    <div class="eb-context-item eb-ctx-copy">URL'yi Kopyala</div>
    <div class="eb-context-item eb-danger eb-ctx-delete">Kısayolu Kaldır</div>
  `;
  container.appendChild(contextMenu);

  let contextTargetShortcut = null;

  function showContextMenu(e, sc) {
    e.preventDefault();
    contextTargetShortcut = sc;
    contextMenu.style.top = `${Math.min(e.clientY - 20, window.innerHeight - 110)}px`;
    contextMenu.classList.add('eb-show');
  }

  function hideContextMenu() {
    contextMenu.classList.remove('eb-show');
    contextTargetShortcut = null;
  }

  window.addEventListener('click', hideContextMenu);

  contextMenu.querySelector('.eb-ctx-open').addEventListener('click', () => {
    if (contextTargetShortcut) {
      window.open(contextTargetShortcut.url, '_blank');
      hideContextMenu();
    }
  });

  contextMenu.querySelector('.eb-ctx-copy').addEventListener('click', () => {
    if (contextTargetShortcut) {
      navigator.clipboard.writeText(contextTargetShortcut.url);
      hideContextMenu();
    }
  });

  contextMenu.querySelector('.eb-ctx-delete').addEventListener('click', () => {
    if (contextTargetShortcut) {
      deleteShortcut(contextTargetShortcut.id);
      hideContextMenu();
    }
  });

  // 5. Modal: Settings & Shortcuts Management (Minimalist Apple/Linear Aesthetic)
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'eb-modal-backdrop';
  modalBackdrop.innerHTML = `
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
  container.appendChild(modalBackdrop);

  const modalCloseBtn = modalBackdrop.querySelector('.eb-modal-close');
  const quickAddInput = modalBackdrop.querySelector('.eb-quick-add-input');
  const quickAddBtn = modalBackdrop.querySelector('.eb-quick-add-btn');
  const resetDefaultsBtn = modalBackdrop.querySelector('.eb-reset-defaults');
  const manageList = modalBackdrop.querySelector('.eb-manage-list');
  const segMobile = modalBackdrop.querySelector('.eb-segment-mobile');
  const segDesktop = modalBackdrop.querySelector('.eb-segment-desktop');
  const heightBtns = modalBackdrop.querySelectorAll('.eb-height-segmented .eb-segmented-btn');
  const collapsedBtns = modalBackdrop.querySelectorAll('.eb-collapsed-segmented .eb-segmented-btn');

  // ==========================================================================
  // ZOOM LOGIC
  // ==========================================================================

  function applyZoom(newZoom) {
    zoomLevel = Math.max(0.7, Math.min(newZoom, 1.5));
    zoomLevel = Math.round(zoomLevel * 10) / 10; // Clean decimal

    // Apply zoom to all iframes
    iframePool.forEach((frame) => {
      frame.style.zoom = `${zoomLevel}`;
    });

    zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
    chrome.storage.local.set({ edgebar_zoom: zoomLevel });
  }

  zoomInBtn.addEventListener('click', () => applyZoom(zoomLevel + 0.1));
  zoomOutBtn.addEventListener('click', () => applyZoom(zoomLevel - 0.1));
  zoomLabel.addEventListener('click', () => applyZoom(1.0)); // Click label resets to 100%

  // ==========================================================================
  // VIEW MODE & HEIGHT MODE
  // ==========================================================================

  function updateModeUI() {
    if (segMobile && segDesktop) {
      segMobile.classList.toggle('eb-active-segment', viewMode === 'mobile');
      segDesktop.classList.toggle('eb-active-segment', viewMode === 'desktop');
    }
  }

  function applyHeightMode(mode) {
    heightMode = mode;
    drawer.classList.remove('eb-height-full', 'eb-height-floating', 'eb-height-custom');
    drawer.classList.add(`eb-height-${mode}`);
    if (mode === 'custom') {
      drawer.style.height = `${drawerHeight}px`;
    } else {
      drawer.style.height = '';
    }
    heightBtns.forEach((btn) => {
      btn.classList.toggle('eb-active-segment', btn.dataset.height === mode);
    });
  }

  heightBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newHeightMode = btn.dataset.height;
      applyHeightMode(newHeightMode);
      chrome.storage.local.set({ edgebar_height_mode: newHeightMode });
    });
  });

  function applyCollapsedStyle(style) {
    collapsedStyle = style;
    collapsedBtns.forEach((btn) => {
      btn.classList.toggle('eb-active-segment', btn.dataset.collapsed === style);
    });
    if (!drawer.classList.contains('eb-open')) {
      closeDrawer();
    }
  }

  collapsedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newStyle = btn.dataset.collapsed;
      applyCollapsedStyle(newStyle);
      chrome.storage.local.set({ edgebar_collapsed_style: newStyle });
    });
  });

  [segMobile, segDesktop].forEach((btn) => {
    btn.addEventListener('click', () => {
      const newMode = btn.dataset.mode;
      if (newMode === viewMode) return;
      chrome.runtime.sendMessage({ type: 'SET_VIEW_MODE', mode: newMode }, () => {
        viewMode = newMode;
        updateModeUI();
        if (activeShortcutId && iframePool.has(activeShortcutId)) {
          loader.classList.remove('eb-hidden');
          const activeFrame = iframePool.get(activeShortcutId);
          activeFrame.src = activeFrame.src;
        }
      });
    });
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
      if (sc.id === activeShortcutId) {
        btn.classList.add('eb-active');
      }
      btn.dataset.id = sc.id;
      btn.dataset.index = index;
      btn.draggable = true;

      // Icon wrapper
      const iconWrap = document.createElement('div');
      iconWrap.className = 'eb-item-icon';

      if (sc.svgKey && ICONS[sc.svgKey]) {
        iconWrap.innerHTML = ICONS[sc.svgKey];
      } else if (sc.favicon) {
        const img = document.createElement('img');
        img.src = sc.favicon;
        img.alt = sc.name;
        img.onerror = () => {
          iconWrap.innerHTML = `<div class="eb-letter-avatar">${sc.name.charAt(0)}</div>`;
        };
        iconWrap.appendChild(img);
      } else {
        iconWrap.innerHTML = `<div class="eb-letter-avatar">${sc.name.charAt(0)}</div>`;
      }
      btn.appendChild(iconWrap);

      // Tooltip
      btn.addEventListener('mouseenter', () => showTooltip(sc.name, btn));
      btn.addEventListener('mouseleave', hideTooltip);

      // Left Click: Switch or Toggle
      btn.addEventListener('click', () => {
        if (activeShortcutId === sc.id && drawer.classList.contains('eb-open')) {
          closeDrawer();
        } else {
          openDrawer(sc);
        }
      });

      // Right Click: Safe Context Menu
      btn.addEventListener('contextmenu', (e) => {
        showContextMenu(e, sc);
      });

      // HTML5 Drag & Drop Listeners
      btn.addEventListener('dragstart', (e) => {
        draggedItemIndex = index;
        btn.classList.add('eb-dragging');
        hideTooltip();
        e.dataTransfer.effectAllowed = 'move';
      });

      btn.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        btn.classList.add('eb-drag-over');
      });

      btn.addEventListener('dragleave', () => {
        btn.classList.remove('eb-drag-over');
      });

      btn.addEventListener('drop', (e) => {
        e.preventDefault();
        btn.classList.remove('eb-drag-over');
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
          const movedItem = shortcuts.splice(draggedItemIndex, 1)[0];
          shortcuts.splice(index, 0, movedItem);
          saveShortcuts();
          renderShortcuts();
        }
      });

      btn.addEventListener('dragend', () => {
        draggedItemIndex = null;
        itemsList.querySelectorAll('.eb-item-btn').forEach((b) => {
          b.classList.remove('eb-dragging', 'eb-drag-over');
        });
      });

      itemsList.appendChild(btn);
    });

    renderManageList();
  }

  function renderManageList() {
    manageList.innerHTML = '';
    if (shortcuts.length === 0) {
      manageList.innerHTML = `<div style="color:#71717a; font-size:11.5px; padding: 6px 4px;">Henüz site eklenmedi.</div>`;
      return;
    }
    shortcuts.forEach((sc) => {
      const item = document.createElement('div');
      item.className = 'eb-manage-item';

      let iconHtml = '';
      if (sc.svgKey && ICONS[sc.svgKey]) {
        iconHtml = `<div class="eb-manage-item-icon">${ICONS[sc.svgKey]}</div>`;
      } else if (sc.favicon) {
        iconHtml = `<div class="eb-manage-item-icon"><img src="${sc.favicon}" alt="" onerror="this.parentElement.innerHTML='${sc.name.charAt(0)}'" /></div>`;
      } else {
        iconHtml = `<div class="eb-manage-item-icon">${sc.name.charAt(0)}</div>`;
      }

      item.innerHTML = `
        <div class="eb-manage-item-left">
          ${iconHtml}
          <span class="eb-manage-item-name" title="${sc.name} (${sc.url})">${sc.name}</span>
        </div>
        <button type="button" class="eb-manage-item-del" title="Kaldır">${ICONS.close}</button>
      `;

      item.querySelector('.eb-manage-item-del').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteShortcut(sc.id);
      });

      manageList.appendChild(item);
    });
  }

  // ==========================================================================
  // STATE LOADING & PERSISTENCE
  // ==========================================================================

  function loadState() {
    chrome.storage.local.get(
      [
        'edgebar_shortcuts',
        'edgebar_drawer_width',
        'edgebar_drawer_height',
        'edgebar_height_mode',
        'edgebar_collapsed_style',
        'edgebar_last_active',
        'edgebar_drawer_open',
        'edgebar_view_mode',
        'edgebar_zoom'
      ],
      (result) => {
        const isOldDefault =
          result.edgebar_shortcuts &&
          Array.isArray(result.edgebar_shortcuts) &&
          result.edgebar_shortcuts.length === 3 &&
          result.edgebar_shortcuts[0].id === 'gemini' &&
          result.edgebar_shortcuts[1].id === 'chatgpt' &&
          result.edgebar_shortcuts[2].id === 'x';

        if (
          !result.edgebar_shortcuts ||
          !Array.isArray(result.edgebar_shortcuts) ||
          result.edgebar_shortcuts.length === 0 ||
          isOldDefault
        ) {
          shortcuts = [...DEFAULT_SHORTCUTS];
          chrome.storage.local.set({ edgebar_shortcuts: shortcuts });
        } else {
          shortcuts = result.edgebar_shortcuts;
        }

        if (result.edgebar_drawer_width) {
          drawerWidth = Math.max(360, Math.min(result.edgebar_drawer_width, window.innerWidth * 0.85));
          drawer.style.width = `${drawerWidth}px`;
        }

        if (result.edgebar_drawer_height) {
          drawerHeight = Math.max(300, Math.min(result.edgebar_drawer_height, window.innerHeight - 20));
        }

        if (result.edgebar_zoom) {
          zoomLevel = result.edgebar_zoom;
          zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
        }

        if (result.edgebar_view_mode) {
          viewMode = result.edgebar_view_mode;
        }
        updateModeUI();

        if (result.edgebar_height_mode) {
          heightMode = result.edgebar_height_mode;
        }
        applyHeightMode(heightMode);

        if (result.edgebar_collapsed_style) {
          collapsedStyle = result.edgebar_collapsed_style;
        } else {
          collapsedStyle = 'strip';
        }
        applyCollapsedStyle(collapsedStyle);

        renderShortcuts();

        // Default open on page load: stays open unless explicitly closed
        const shouldOpen = result.edgebar_drawer_open !== false;
        if (shouldOpen) {
          const targetShortcut = shortcuts.find((s) => s.id === result.edgebar_last_active) || shortcuts[0];
          openDrawer(targetShortcut);
        } else {
          closeDrawer();
        }
      }
    );
  }

  function saveShortcuts() {
    chrome.storage.local.set({ edgebar_shortcuts: shortcuts });
  }

  // --- Drawer Open / Close ---
  function openDrawer(sc) {
    if (!sc) {
      sc = shortcuts[0] || DEFAULT_SHORTCUTS[0];
    }

    activeShortcutId = sc.id;
    currentActiveUrl = sc.url;

    // Highlight active button in dock rail
    drawer.querySelectorAll('.eb-item-btn').forEach((b) => {
      b.classList.toggle('eb-active', b.dataset.id === sc.id);
    });

    // Update Header
    drawerTitle.textContent = sc.name;
    if (sc.favicon) {
      drawerFavicon.src = sc.favicon;
      drawerFavicon.style.display = 'block';
    } else {
      drawerFavicon.style.display = 'none';
    }

    // MULTI-IFRAME SESSION POOL: Keep sessions alive
    let activeFrame = iframePool.get(sc.id);

    iframePool.forEach((frame) => {
      frame.classList.remove('eb-active-frame');
    });

    if (!activeFrame) {
      loader.classList.remove('eb-hidden');

      activeFrame = document.createElement('iframe');
      activeFrame.className = 'eb-iframe eb-active-frame';
      activeFrame.allow = 'clipboard-read; clipboard-write; camera; microphone; geolocation; encrypted-media';
      activeFrame.style.zoom = `${zoomLevel}`;
      activeFrame.src = sc.url;

      activeFrame.addEventListener('load', () => {
        loader.classList.add('eb-hidden');
      });

      iframeContainer.appendChild(activeFrame);
      iframePool.set(sc.id, activeFrame);
    } else {
      activeFrame.classList.add('eb-active-frame');
      activeFrame.style.zoom = `${zoomLevel}`;
      loader.classList.add('eb-hidden');
    }

    // Hide trigger pill, remove strip-only and open full drawer
    triggerPill.classList.add('eb-hidden');
    drawer.classList.remove('eb-strip-only');
    drawer.classList.add('eb-open');
    drawer.style.width = `${drawerWidth}px`;
    toggleBtn.innerHTML = ICONS.sidebarOpen;
    toggleBtn.title = 'Paneli Daralt (Esc)';

    chrome.storage.local.set({ edgebar_drawer_open: true, edgebar_last_active: sc.id });
  }

  function closeDrawer() {
    drawer.classList.remove('eb-open');

    toggleBtn.innerHTML = ICONS.sidebarClosed;
    toggleBtn.title = 'Paneli Genişlet';

    if (collapsedStyle === 'strip') {
      drawer.classList.add('eb-strip-only');
      triggerPill.classList.add('eb-hidden');
    } else {
      drawer.classList.remove('eb-strip-only');
      triggerPill.classList.remove('eb-hidden');
    }

    hideTooltip();
    hideContextMenu();
    chrome.storage.local.set({ edgebar_drawer_open: false });
  }

  // Toggle from Trigger Pill
  triggerPill.addEventListener('click', () => {
    const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
    openDrawer(current);
  });

  // Toggle from Primary Anchor (Top-Left Dock Button)
  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('eb-open')) {
      closeDrawer();
    } else {
      const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
      openDrawer(current);
    }
  });

  closeBtn.addEventListener('click', closeDrawer);

  // Header Actions
  reloadBtn.addEventListener('click', () => {
    if (activeShortcutId && iframePool.has(activeShortcutId)) {
      loader.classList.remove('eb-hidden');
      const activeFrame = iframePool.get(activeShortcutId);
      activeFrame.src = activeFrame.src;
    }
  });

  externalBtn.addEventListener('click', () => {
    if (currentActiveUrl) {
      window.open(currentActiveUrl, '_blank');
    }
  });

  // --- Resizer Handles (Width & Height) ---
  let isResizing = false;
  let isResizingHeight = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  // Right Border Resizer (Width)
  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = drawer.getBoundingClientRect().width;
    resizer.classList.add('eb-resizing');
    dragOverlay.classList.add('eb-active');
    dragOverlay.style.cursor = 'col-resize';
    e.preventDefault();
  });

  // Top Border Resizer (Height in Custom Mode)
  resizerTop.addEventListener('mousedown', (e) => {
    if (heightMode !== 'custom') return;
    isResizingHeight = true;
    startY = e.clientY;
    startHeight = drawer.getBoundingClientRect().height;
    resizerTop.classList.add('eb-resizing');
    dragOverlay.classList.add('eb-active');
    dragOverlay.style.cursor = 'ns-resize';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (isResizingHeight) {
      const deltaY = startY - e.clientY;
      const newHeight = Math.max(300, Math.min(startHeight + deltaY, window.innerHeight - 20));
      drawerHeight = newHeight;
      drawer.style.height = `${newHeight}px`;
      return;
    }

    if (isResizing) {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(360, Math.min(startWidth + deltaX, window.innerWidth * 0.85));
      drawerWidth = newWidth;
      drawer.style.width = `${newWidth}px`;
    }
  });

  window.addEventListener('mouseup', () => {
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

  // --- Modal: Add & Manage Custom Shortcuts ---
  function openAddModal() {
    quickAddInput.value = '';
    renderManageList();
    modalBackdrop.classList.add('eb-modal-open');
    setTimeout(() => quickAddInput.focus(), 50);
  }

  function closeAddModal() {
    modalBackdrop.classList.remove('eb-modal-open');
  }

  addBtn.addEventListener('click', openAddModal);
  modalCloseBtn.addEventListener('click', closeAddModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeAddModal();
  });

  function handleSaveCustomShortcut() {
    let raw = quickAddInput.value.trim();
    if (!raw) {
      quickAddInput.focus();
      return;
    }

    let name = '';
    let url = '';

    if (raw.includes(' ') && (raw.includes('http') || raw.includes('.'))) {
      const parts = raw.split(/\s+/);
      const urlPart = parts.find((p) => p.includes('.') || p.startsWith('http'));
      if (urlPart) {
        url = urlPart;
        name = parts.filter((p) => p !== urlPart).join(' ');
      }
    }

    if (!url) {
      url = raw;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      const parsedUrl = new URL(url);
      if (!name) {
        let host = parsedUrl.hostname.replace(/^www\./, '');
        let base = host.split('.')[0];
        name = base.charAt(0).toUpperCase() + base.slice(1);
      }

      const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

      const newShortcut = {
        id: 'custom_' + Date.now(),
        name: name,
        url: url,
        favicon: favicon
      };

      // Add to beginning so the first added items sit at the bottom of the stack
      shortcuts.unshift(newShortcut);
      saveShortcuts();
      renderShortcuts();
      closeAddModal();

      openDrawer(newShortcut);
    } catch (err) {
      alert('Geçerli bir web adresi giriniz.');
      quickAddInput.focus();
    }
  }

  quickAddBtn.addEventListener('click', handleSaveCustomShortcut);
  quickAddInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSaveCustomShortcut();
  });

  resetDefaultsBtn.addEventListener('click', () => {
    shortcuts = [...DEFAULT_SHORTCUTS];
    saveShortcuts();
    renderShortcuts();
    closeAddModal();
    openDrawer(DEFAULT_SHORTCUTS[0]);
  });

  function deleteShortcut(id) {
    shortcuts = shortcuts.filter((s) => s.id !== id);

    if (activeShortcutId === id) {
      const nextShortcut = shortcuts[0];
      if (nextShortcut) {
        openDrawer(nextShortcut);
      } else {
        closeDrawer();
      }
    }

    if (iframePool.has(id)) {
      const frame = iframePool.get(id);
      frame.remove();
      iframePool.delete(id);
    }

    saveShortcuts();
    renderShortcuts();
  }

  // --- Keyboard Listeners ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (contextMenu.classList.contains('eb-show')) {
        hideContextMenu();
      } else if (modalBackdrop.classList.contains('eb-modal-open')) {
        closeAddModal();
      } else if (drawer.classList.contains('eb-open')) {
        closeDrawer();
      }
    }
  });

  // --- Chrome Action & Toolbar Toggle Listener ---
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_DRAWER') {
      if (drawer.classList.contains('eb-open')) {
        closeDrawer();
      } else {
        const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
        openDrawer(current);
      }
    }
  });

  loadState();
})();
