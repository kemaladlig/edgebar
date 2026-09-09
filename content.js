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

  // --- Constants (Imported from constants.js) ---
  const { ICONS, DEFAULT_SHORTCUTS } = window.__EDGEBAR_CONSTANTS || {};


  // --- State Variables ---
  let shortcuts = [];
  let activeShortcutId = null;
  let drawerWidth = 486;
  let drawerHeight = 600;
  let currentActiveUrl = '';
  let viewMode = 'mobile';
  let heightMode = 'full';
  let collapsedStyle = 'strip'; // 'strip' (shortcuts visible on left rail) or 'pill' (only icon)
  let openTop = null;
  let closedTop = null;
  let isDraggingDock = false;
  let dockStartY = 0;
  let dockStartTop = 0;
  let dockHasMoved = false;
  let preventNextClick = false;

  // Clean any lingering page styles
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
  container.appendChild(drawer);

  const itemsList = drawer.querySelector('.eb-items-list');
  const toggleBtn = drawer.querySelector('.eb-toggle-btn');
  const settingsBtn = drawer.querySelector('.eb-settings-btn');
  const dockDragHandle = drawer.querySelector('.eb-dock-drag-handle');
  const drawerHeader = drawer.querySelector('.eb-drawer-header');
  const dockRail = drawer.querySelector('.eb-dock-rail');

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
      applyOpenPosition(openTop);
    } else {
      drawer.style.height = '';
      drawer.style.top = '';
      drawer.style.bottom = '';
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

  // ==========================================================================
  // INDEPENDENT DOCK & OPEN WINDOW POSITIONING
  // ==========================================================================

  function applyClosedPosition(topPx) {
    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    triggerPill.style.removeProperty('top');
    triggerPill.style.removeProperty('bottom');

    if (topPx === null || topPx === undefined) {
      drawer.style.bottom = '24px';
      triggerPill.style.bottom = '24px';
      closedTop = null;
      return;
    }

    const targetHeight = drawer.offsetHeight || 120;
    const minTop = 10;
    const maxTop = Math.max(minTop, window.innerHeight - targetHeight - 10);
    const clampedTop = Math.max(minTop, Math.min(topPx, maxTop));
    closedTop = clampedTop;

    drawer.style.top = `${clampedTop}px`;
    triggerPill.style.top = `${clampedTop}px`;
  }

  function applyOpenPosition(topPx) {
    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    drawer.style.removeProperty('height');

    if (heightMode === 'full') {
      drawer.style.height = '100vh';
      return;
    }

    if (heightMode === 'floating') {
      return;
    }

    // heightMode === 'custom'
    if (topPx === null || topPx === undefined) {
      drawer.style.bottom = '0px';
      drawer.style.height = `${drawerHeight}px`;
      openTop = null;
      return;
    }

    const minTop = 10;
    const maxTop = Math.max(minTop, window.innerHeight - drawerHeight - 10);
    const clampedTop = Math.max(minTop, Math.min(topPx, maxTop));
    openTop = clampedTop;

    drawer.style.height = `${drawerHeight}px`;
    drawer.style.top = `${clampedTop}px`;
  }

  function startDockDrag(e) {
    if (e.button !== 0) return; // Left click only
    if (
      e.target.closest('.eb-action-btn') ||
      e.target.closest('.eb-zoom-group') ||
      e.target.closest('.eb-zoom-btn') ||
      e.target.closest('.eb-item-btn') ||
      e.target.closest('.eb-toggle-btn') ||
      e.target.closest('.eb-settings-btn') ||
      e.target.closest('.eb-header-actions') ||
      e.target.closest('.eb-view-segment')
    ) {
      return;
    }

    isDraggingDock = true;
    dockHasMoved = false;
    dockStartY = e.clientY;

    const el = drawer.classList.contains('eb-open')
      ? drawer
      : (collapsedStyle === 'strip' ? drawer : triggerPill);

    const rect = el.getBoundingClientRect();
    dockStartTop = rect.top;
  }

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
      btn.draggable = drawer.classList.contains('eb-open');

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
        if (preventNextClick) return;
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

      // HTML5 Drag & Drop Listeners (only active when drawer is open)
      btn.addEventListener('dragstart', (e) => {
        if (!drawer.classList.contains('eb-open')) {
          e.preventDefault();
          return false;
        }
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
        btn.classList.remove('eb-dragging', 'eb-drag-over');
        draggedItemIndex = null;
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
        'edgebar_open_top',
        'edgebar_closed_top',
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

        // Restore independent open and closed vertical positions
        if (result.edgebar_open_top !== undefined && result.edgebar_open_top !== null) {
          openTop = result.edgebar_open_top;
        } else {
          openTop = null;
        }

        if (result.edgebar_closed_top !== undefined && result.edgebar_closed_top !== null) {
          closedTop = result.edgebar_closed_top;
        } else {
          closedTop = null;
        }

        if (result.edgebar_height_mode) {
          heightMode = result.edgebar_height_mode;
        }
        applyHeightMode(heightMode);

        if (result.edgebar_collapsed_style) {
          collapsedStyle = result.edgebar_collapsed_style;
        } else {
          collapsedStyle = 'strip';
        }
        collapsedBtns.forEach((btn) => {
          btn.classList.toggle('eb-active-segment', btn.dataset.collapsed === collapsedStyle);
        });

        renderShortcuts();

        // Default open on page load: stays open unless explicitly closed
        const shouldOpen = result.edgebar_drawer_open !== false;
        if (shouldOpen) {
          const targetShortcut = shortcuts.find((s) => s.id === result.edgebar_last_active) || shortcuts[0];
          openDrawer(targetShortcut);
        } else {
          closeDrawer(false);
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

    // Clean any lingering closed styles
    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    drawer.style.removeProperty('height');
    drawer.style.removeProperty('width');

    // Hide trigger pill, remove strip-only and open full drawer
    triggerPill.classList.add('eb-hidden');
    drawer.classList.remove('eb-strip-only');
    drawer.classList.add('eb-open');
    drawer.style.width = `${drawerWidth}px`;
    applyOpenPosition(openTop);
    toggleBtn.innerHTML = ICONS.sidebarOpen;
    toggleBtn.title = 'Paneli Daralt (Esc)';

    // Allow reordering when drawer is open
    itemsList.querySelectorAll('.eb-item-btn').forEach((b) => {
      b.draggable = true;
    });

    chrome.storage.local.set({ edgebar_drawer_open: true, edgebar_last_active: sc.id });
  }

  function closeDrawer(saveState = true) {
    drawer.classList.remove('eb-open');

    toggleBtn.innerHTML = ICONS.sidebarClosed;
    toggleBtn.title = 'Paneli Genişlet';

    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    drawer.style.removeProperty('height');
    drawer.style.removeProperty('width');

    if (collapsedStyle === 'strip') {
      drawer.classList.add('eb-strip-only');
      drawer.style.width = '46px';
      triggerPill.classList.add('eb-hidden');
    } else {
      drawer.classList.remove('eb-strip-only');
      triggerPill.classList.remove('eb-hidden');
    }

    applyClosedPosition(closedTop);

    // Disable draggable on shortcuts so clicking them is 100% normal and instant
    itemsList.querySelectorAll('.eb-item-btn').forEach((b) => {
      b.draggable = false;
    });

    hideTooltip();
    hideContextMenu();
    if (saveState) {
      chrome.storage.local.set({ edgebar_drawer_open: false });
    }
  }

  // Toggle from Trigger Pill
  triggerPill.addEventListener('click', () => {
    if (preventNextClick) return;
    const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
    openDrawer(current);
  });

  // Toggle from Primary Anchor (Top-Left Dock Button)
  toggleBtn.addEventListener('click', () => {
    if (preventNextClick) return;
    if (drawer.classList.contains('eb-open')) {
      closeDrawer();
    } else {
      const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
      openDrawer(current);
    }
  });

  closeBtn.addEventListener('click', () => closeDrawer());

  // Dragging Listeners
  if (dockDragHandle) {
    dockDragHandle.addEventListener('mousedown', startDockDrag);
  }
  triggerPill.addEventListener('mousedown', startDockDrag);
  drawerHeader.addEventListener('mousedown', (e) => {
    if (
      e.target.closest('.eb-drawer-actions') ||
      e.target.closest('.eb-action-btn') ||
      e.target.closest('.eb-zoom-group') ||
      e.target.closest('.eb-zoom-btn') ||
      e.target.closest('.eb-view-segment')
    ) {
      return;
    }
    startDockDrag(e);
  });

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
    if (isDraggingDock) {
      const deltaY = e.clientY - dockStartY;
      if (!dockHasMoved && Math.abs(deltaY) > 3) {
        dockHasMoved = true;
        dragOverlay.classList.add('eb-active');
        dragOverlay.style.cursor = 'grabbing';
        if (drawer.classList.contains('eb-open')) {
          if (heightMode === 'full') {
            drawerHeight = Math.max(400, window.innerHeight - 100);
            applyHeightMode('custom');
            chrome.storage.local.set({ edgebar_height_mode: 'custom', edgebar_drawer_height: drawerHeight });
          }
          drawer.classList.add('eb-dragging-drawer');
        } else if (collapsedStyle === 'strip') {
          drawer.classList.add('eb-dragging');
        } else {
          triggerPill.classList.add('eb-dragging');
        }
      }

      if (dockHasMoved) {
        const newTop = dockStartTop + deltaY;
        if (drawer.classList.contains('eb-open')) {
          applyOpenPosition(newTop);
        } else {
          applyClosedPosition(newTop);
        }
      }
      return;
    }

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
    if (isDraggingDock) {
      isDraggingDock = false;
      dragOverlay.classList.remove('eb-active');
      dragOverlay.style.cursor = '';
      drawer.classList.remove('eb-dragging-drawer', 'eb-dragging');
      triggerPill.classList.remove('eb-dragging');

      if (dockHasMoved) {
        preventNextClick = true;
        setTimeout(() => {
          preventNextClick = false;
        }, 100);
        if (drawer.classList.contains('eb-open')) {
          chrome.storage.local.set({ edgebar_open_top: openTop });
        } else {
          chrome.storage.local.set({ edgebar_closed_top: closedTop });
        }
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

  window.addEventListener('resize', () => {
    if (drawer.classList.contains('eb-open')) {
      if (openTop !== null) applyOpenPosition(openTop);
    } else {
      if (closedTop !== null) applyClosedPosition(closedTop);
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

  settingsBtn.addEventListener('click', openAddModal);
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

      // Push to list so it stacks above Gemini (first item stays at bottom above toggle)
      shortcuts.push(newShortcut);
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
