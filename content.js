// ============================================================================
// EdgeBar - Minimalist Web Panels (Content Script)
// Unified Architecture: Left: 0 Seamless Docking + Safe Shortcut Management
// ============================================================================

(function () {
  'use strict';

  if (window.top !== window || window.__edgebar_initialized) {
    return;
  }
  window.__edgebar_initialized = true;

  // --- Refined SVGs (1.6px fine strokes, sleek modern aesthetics) ---
  const ICONS = {
    trigger: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><circle cx="12" cy="10" r="1.2" fill="currentColor"/></svg>`,
    collapse: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m13 15-5-5 5-5"/></svg>`,
    plus: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v12M4 10h12"/></svg>`,
    reload: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6L2 18"/><path d="M2 13.5V18h4.5"/></svg>`,
    external: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 11v5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16V7.5A1.5 1.5 0 0 1 4.5 6H9.5"/><path d="M11.5 3.5h5v5M8 12 16.5 3.5"/></svg>`,
    close: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-10 10M5 5l10 10"/></svg>`,
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
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      url: 'https://chatgpt.com',
      svgKey: 'chatgpt'
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      url: 'https://x.com',
      svgKey: 'x'
    }
  ];

  // --- State ---
  let shortcuts = [];
  let activeShortcutId = null;
  let drawerWidth = 484; // 44px dock + 440px content
  let drawerHeight = 600;
  let currentActiveUrl = '';
  let viewMode = 'mobile';
  let heightMode = 'full';

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

  // 2. Bottom-Left Trigger Pill
  const triggerPill = document.createElement('button');
  triggerPill.className = 'eb-trigger-pill';
  triggerPill.title = 'EdgeBar Aç';
  triggerPill.innerHTML = ICONS.trigger;
  container.appendChild(triggerPill);

  // 3. Unified Drawer (Starts at left: 0, ZERO GAP)
  const drawer = document.createElement('div');
  drawer.className = 'eb-drawer eb-height-full';
  drawer.innerHTML = `
    <!-- Top Resizer for Custom Height Mode -->
    <div class="eb-resizer-top" title="Yüksekliği ayarlamak için yukarı/aşağı sürükleyin"></div>

    <!-- Left Rail: Integrated Dock Icons -->
    <div class="eb-dock-rail">
      <div class="eb-dock-top">
        <button class="eb-add-btn" title="Kısayolları Yönet / Ekle (+)">
          ${ICONS.plus}
        </button>
      </div>
      <div class="eb-dock-bottom">
        <div class="eb-items-list"></div>
        <div class="eb-divider"></div>
        <button class="eb-collapse-btn" title="Paneli Gizle (Esc)">
          ${ICONS.collapse}
        </button>
      </div>
    </div>

    <!-- Right Area: Header, Web Content & Resizer -->
    <div class="eb-panel-main">
      <div class="eb-drawer-header">
        <div class="eb-drawer-title-area">
          <img class="eb-drawer-favicon" src="" alt="" style="display:none;" />
          <span class="eb-drawer-title">Web Panel</span>
        </div>
        <div class="eb-drawer-actions">
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
  const addBtn = drawer.querySelector('.eb-add-btn');
  const collapseBtn = drawer.querySelector('.eb-collapse-btn');

  const drawerFavicon = drawer.querySelector('.eb-drawer-favicon');
  const drawerTitle = drawer.querySelector('.eb-drawer-title');
  const reloadBtn = drawer.querySelector('.eb-reload');
  const externalBtn = drawer.querySelector('.eb-external');
  const closeBtn = drawer.querySelector('.eb-close');
  const iframeContainer = drawer.querySelector('.eb-iframe-container');
  const loader = drawer.querySelector('.eb-loader-overlay');
  const resizer = drawer.querySelector('.eb-resizer');
  const resizerTop = drawer.querySelector('.eb-resizer-top');

  // Drag Overlay for resizing
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
    contextMenu.style.top = `${Math.min(e.clientY - 20, window.innerHeight - 100)}px`;
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

  // 5. Modal: Add & Manage Shortcuts Safely
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'eb-modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="eb-modal-card">
      <div class="eb-modal-title">
        <span>Kısayolları Yönet</span>
      </div>
      <div class="eb-form-group">
        <label class="eb-form-label">Site Adı</label>
        <input class="eb-form-input eb-input-name" type="text" placeholder="Örn: Notion, DevDocs, YouTube..." />
      </div>
      <div class="eb-form-group">
        <label class="eb-form-label">Site URL'si</label>
        <input class="eb-form-input eb-input-url" type="text" placeholder="Örn: devdocs.io veya https://..." />
      </div>

      <!-- View Mode Selector in Modal -->
      <div class="eb-form-group">
        <label class="eb-form-label">Görünüm Modu</label>
        <div class="eb-segmented-control">
          <button type="button" class="eb-segmented-btn eb-segment-mobile" data-mode="mobile">📱 Mobil (Kompakt)</button>
          <button type="button" class="eb-segmented-btn eb-segment-desktop" data-mode="desktop">💻 Masaüstü / Web</button>
        </div>
      </div>

      <!-- Height Mode Selector in Modal -->
      <div class="eb-form-group">
        <label class="eb-form-label">Panel Yüksekliği</label>
        <div class="eb-segmented-control eb-height-segmented">
          <button type="button" class="eb-segmented-btn eb-h-full" data-height="full">Tam Boy (%100)</button>
          <button type="button" class="eb-segmented-btn eb-h-floating" data-height="floating">Yüzen Ada</button>
          <button type="button" class="eb-segmented-btn eb-h-custom" data-height="custom">Ayarlanabilir</button>
        </div>
      </div>

      <div class="eb-modal-actions">
        <button class="eb-btn-link eb-reset-defaults" title="Varsayılan kısayolları (Gemini, ChatGPT, X) geri getir">Varsayılanları Sıfırla</button>
        <div class="eb-modal-btns-right">
          <button class="eb-btn eb-btn-secondary eb-modal-cancel">İptal</button>
          <button class="eb-btn eb-btn-primary eb-modal-save">Ekle</button>
        </div>
      </div>

      <!-- Existing Shortcuts Manager List -->
      <div class="eb-modal-manage-section">
        <div class="eb-manage-title">Mevcut Kısayollar</div>
        <div class="eb-manage-list"></div>
      </div>
    </div>
  `;
  container.appendChild(modalBackdrop);

  const inputName = modalBackdrop.querySelector('.eb-input-name');
  const inputUrl = modalBackdrop.querySelector('.eb-input-url');
  const modalCancelBtn = modalBackdrop.querySelector('.eb-modal-cancel');
  const modalSaveBtn = modalBackdrop.querySelector('.eb-modal-save');
  const resetDefaultsBtn = modalBackdrop.querySelector('.eb-reset-defaults');
  const manageList = modalBackdrop.querySelector('.eb-manage-list');
  const segMobile = modalBackdrop.querySelector('.eb-segment-mobile');
  const segDesktop = modalBackdrop.querySelector('.eb-segment-desktop');
  const heightBtns = modalBackdrop.querySelectorAll('.eb-height-segmented .eb-segmented-btn');

  // ==========================================================================
  // STATE MANAGEMENT & LOGIC
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

  function loadState() {
    chrome.storage.local.get(
      [
        'edgebar_shortcuts',
        'edgebar_drawer_width',
        'edgebar_drawer_height',
        'edgebar_height_mode',
        'edgebar_last_active',
        'edgebar_drawer_open',
        'edgebar_view_mode'
      ],
      (result) => {
        if (result.edgebar_shortcuts && Array.isArray(result.edgebar_shortcuts) && result.edgebar_shortcuts.length > 0) {
          shortcuts = result.edgebar_shortcuts;
        } else {
          shortcuts = [...DEFAULT_SHORTCUTS];
        }

        if (result.edgebar_drawer_width) {
          drawerWidth = Math.max(364, Math.min(result.edgebar_drawer_width, window.innerWidth * 0.85));
          drawer.style.width = `${drawerWidth}px`;
        }

        if (result.edgebar_drawer_height) {
          drawerHeight = Math.max(300, Math.min(result.edgebar_drawer_height, window.innerHeight - 20));
        }

        if (result.edgebar_view_mode) {
          viewMode = result.edgebar_view_mode;
        }
        updateModeUI();

        if (result.edgebar_height_mode) {
          heightMode = result.edgebar_height_mode;
        }
        applyHeightMode(heightMode);

        renderShortcuts();

        // Default open: stays open on page load unless user explicitly closed it
        const shouldOpen = result.edgebar_drawer_open !== false;
        if (shouldOpen) {
          const targetShortcut = shortcuts.find((s) => s.id === result.edgebar_last_active) || shortcuts[0];
          openDrawer(targetShortcut);
        }
      }
    );
  }

  function saveShortcuts() {
    chrome.storage.local.set({ edgebar_shortcuts: shortcuts });
  }

  // Render Shortcuts in Dock Rail (NO ACCIDENTAL DELETE HOVER BADGE)
  function renderShortcuts() {
    itemsList.innerHTML = '';

    shortcuts.forEach((sc) => {
      const btn = document.createElement('button');
      btn.className = 'eb-item-btn';
      if (sc.id === activeShortcutId) {
        btn.classList.add('eb-active');
      }
      btn.dataset.id = sc.id;

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

      // Right Click: Safe Context Menu (Delete / Open new tab)
      btn.addEventListener('contextmenu', (e) => {
        showContextMenu(e, sc);
      });

      itemsList.appendChild(btn);
    });

    renderManageList();
  }

  // Render Shortcuts inside the Management Modal
  function renderManageList() {
    manageList.innerHTML = '';
    shortcuts.forEach((sc) => {
      const item = document.createElement('div');
      item.className = 'eb-manage-item';
      item.innerHTML = `
        <span>${sc.name}</span>
        <button class="eb-manage-item-del" title="Kısayolu Kaldır">Kaldır</button>
      `;
      item.querySelector('.eb-manage-item-del').addEventListener('click', () => {
        deleteShortcut(sc.id);
      });
      manageList.appendChild(item);
    });
  }

  // --- Open & Close Drawer (Smooth Left-Edge Flush Slide) ---
  function openDrawer(sc) {
    if (!sc) {
      // Default to first shortcut (Gemini)
      sc = shortcuts[0] || DEFAULT_SHORTCUTS[0];
    }

    activeShortcutId = sc.id;
    currentActiveUrl = sc.url;

    // Update active highlight in dock rail
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
      activeFrame.src = sc.url;

      activeFrame.addEventListener('load', () => {
        loader.classList.add('eb-hidden');
      });

      iframeContainer.appendChild(activeFrame);
      iframePool.set(sc.id, activeFrame);
    } else {
      activeFrame.classList.add('eb-active-frame');
      loader.classList.add('eb-hidden');
    }

    // Hide trigger pill and slide open drawer flush from left: 0
    triggerPill.classList.add('eb-hidden');
    drawer.classList.add('eb-open');
    chrome.storage.local.set({ edgebar_drawer_open: true, edgebar_last_active: sc.id });
  }

  function closeDrawer() {
    drawer.classList.remove('eb-open');
    triggerPill.classList.remove('eb-hidden');
    hideTooltip();
    hideContextMenu();
    chrome.storage.local.set({ edgebar_drawer_open: false });
  }

  // Toggle from Trigger Pill
  triggerPill.addEventListener('click', () => {
    // Open currently active shortcut or first shortcut
    const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
    openDrawer(current);
  });

  collapseBtn.addEventListener('click', closeDrawer);
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
      const newWidth = Math.max(364, Math.min(startWidth + deltaX, window.innerWidth * 0.85));
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
    inputName.value = '';
    inputUrl.value = '';
    renderManageList();
    modalBackdrop.classList.add('eb-modal-open');
    setTimeout(() => inputName.focus(), 50);
  }

  function closeAddModal() {
    modalBackdrop.classList.remove('eb-modal-open');
  }

  addBtn.addEventListener('click', openAddModal);
  modalCancelBtn.addEventListener('click', closeAddModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeAddModal();
  });

  function handleSaveCustomShortcut() {
    let name = inputName.value.trim();
    let url = inputUrl.value.trim();

    if (!url) {
      inputUrl.focus();
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      const parsedUrl = new URL(url);
      if (!name) {
        name = parsedUrl.hostname.replace(/^www\./, '');
      }

      const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

      const newShortcut = {
        id: 'custom_' + Date.now(),
        name: name,
        url: url,
        favicon: favicon
      };

      shortcuts.push(newShortcut);
      saveShortcuts();
      renderShortcuts();
      closeAddModal();

      openDrawer(newShortcut);
    } catch (err) {
      alert('Geçerli bir URL giriniz.');
      inputUrl.focus();
    }
  }

  modalSaveBtn.addEventListener('click', handleSaveCustomShortcut);
  [inputName, inputUrl].forEach((inp) => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveCustomShortcut();
    });
  });

  resetDefaultsBtn.addEventListener('click', () => {
    shortcuts = [...DEFAULT_SHORTCUTS];
    saveShortcuts();
    renderShortcuts();
    closeAddModal();
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

  // --- Extension Action / Toolbar & Global Shortcut Listener ---
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
