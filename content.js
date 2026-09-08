// ============================================================================
// EdgeBar - Minimalist Web Panels (Content Script)
// 3-Tier Architecture: 1. Bottom Trigger -> 2. Bottom Strip Dock -> 3. Persistent Drawer
// ============================================================================

(function () {
  'use strict';

  // Prevent subframe injection or double execution
  if (window.top !== window || window.__edgebar_initialized) {
    return;
  }
  window.__edgebar_initialized = true;

  // --- Refined SVGs (Fine strokes, modern minimalist aesthetic) ---
  const ICONS = {
    // Elite dual-line dock icon for bottom-left trigger
    trigger: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="2" y="2" rx="3.5"/><path d="M7 2v16"/><circle cx="12" cy="10" r="1.2" fill="currentColor"/></svg>`,
    collapse: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m13 15-5-5 5-5"/></svg>`,
    plus: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v12M4 10h12"/></svg>`,
    reload: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6L2 18"/><path d="M2 13.5V18h4.5"/></svg>`,
    external: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 11v5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16V7.5A1.5 1.5 0 0 1 4.5 6H9.5"/><path d="M11.5 3.5h5v5M8 12 16.5 3.5"/></svg>`,
    close: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-10 10M5 5l10 10"/></svg>`,
    gemini: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#gemini-grad)"/><defs><linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#4E95FF"/><stop offset="0.5" stop-color="#9A72F8"/><stop offset="1" stop-color="#F277B5"/></linearGradient></defs></svg>`,
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

  // --- State Variables ---
  let shortcuts = [];
  let isStripExpanded = false;
  let activeShortcutId = null;
  let drawerWidth = 440;
  let currentActiveUrl = '';

  // Persistent Iframe Cache (Multi-Session Pool)
  // Keeps active sessions alive in memory so Gemini/ChatGPT chats never reset on close or tab switch
  const iframePool = new Map();

  // --- Initialize Shadow DOM ---
  const host = document.createElement('div');
  host.id = 'v-edgebar-host';
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject Stylesheet
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

  // 2. Tier 1: Bottom-Left Elite Trigger Pill
  const triggerPill = document.createElement('button');
  triggerPill.className = 'eb-trigger-pill';
  triggerPill.title = 'EdgeBar Paneli Aç';
  triggerPill.innerHTML = ICONS.trigger;
  container.appendChild(triggerPill);

  // 3. Tier 2: Vertical Strip Dock (Bottom Anchored)
  const strip = document.createElement('div');
  strip.className = 'eb-strip';
  strip.innerHTML = `
    <div class="eb-items-list"></div>
    <div class="eb-divider"></div>
    <button class="eb-add-btn" title="Yeni Kısayol Ekle (+)">
      ${ICONS.plus}
    </button>
    <button class="eb-collapse-btn" title="Şeridi Gizle">
      ${ICONS.collapse}
    </button>
  `;
  container.appendChild(strip);

  const itemsList = strip.querySelector('.eb-items-list');
  const addBtn = strip.querySelector('.eb-add-btn');
  const collapseBtn = strip.querySelector('.eb-collapse-btn');

  // 4. Tier 3: Slide-out Web Panel Drawer (Docked with ZERO GAP at left: 44px)
  const drawer = document.createElement('div');
  drawer.className = 'eb-drawer';
  drawer.innerHTML = `
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
        <button class="eb-action-btn eb-close" title="Paneli Kapat (Esc)">
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
  `;
  container.appendChild(drawer);

  const drawerFavicon = drawer.querySelector('.eb-drawer-favicon');
  const drawerTitle = drawer.querySelector('.eb-drawer-title');
  const reloadBtn = drawer.querySelector('.eb-reload');
  const externalBtn = drawer.querySelector('.eb-external');
  const closeBtn = drawer.querySelector('.eb-close');
  const iframeContainer = drawer.querySelector('.eb-iframe-container');
  const loader = drawer.querySelector('.eb-loader-overlay');
  const resizer = drawer.querySelector('.eb-resizer');

  // Drag Overlay for smooth resizing over iframes
  const dragOverlay = document.createElement('div');
  dragOverlay.className = 'eb-drag-overlay';
  container.appendChild(dragOverlay);

  // 5. Context Menu (Right Click on Any Shortcut to Remove / Copy)
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
    contextMenu.style.top = `${e.clientY - 20}px`;
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

  // 6. Modal: Add Custom Shortcut
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'eb-modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="eb-modal-card">
      <div class="eb-modal-title">
        <span>Yeni Kısayol Ekle</span>
      </div>
      <div class="eb-form-group">
        <label class="eb-form-label">Site Adı</label>
        <input class="eb-form-input eb-input-name" type="text" placeholder="Örn: Notion, DevDocs, YouTube..." />
      </div>
      <div class="eb-form-group">
        <label class="eb-form-label">Site URL'si</label>
        <input class="eb-form-input eb-input-url" type="text" placeholder="Örn: devdocs.io veya https://..." />
      </div>
      <div class="eb-modal-actions">
        <button class="eb-btn-link eb-reset-defaults" title="Varsayılan kısayolları (Gemini, ChatGPT, X) geri getir">Varsayılanları Sıfırla</button>
        <div class="eb-modal-btns-right">
          <button class="eb-btn eb-btn-secondary eb-modal-cancel">İptal</button>
          <button class="eb-btn eb-btn-primary eb-modal-save">Ekle</button>
        </div>
      </div>
    </div>
  `;
  container.appendChild(modalBackdrop);

  const inputName = modalBackdrop.querySelector('.eb-input-name');
  const inputUrl = modalBackdrop.querySelector('.eb-input-url');
  const modalCancelBtn = modalBackdrop.querySelector('.eb-modal-cancel');
  const modalSaveBtn = modalBackdrop.querySelector('.eb-modal-save');
  const resetDefaultsBtn = modalBackdrop.querySelector('.eb-reset-defaults');

  // ==========================================================================
  // STATE MANAGEMENT & LOGIC
  // ==========================================================================

  function loadState() {
    chrome.storage.local.get(['edgebar_shortcuts', 'edgebar_drawer_width'], (result) => {
      if (result.edgebar_shortcuts && Array.isArray(result.edgebar_shortcuts) && result.edgebar_shortcuts.length > 0) {
        shortcuts = result.edgebar_shortcuts;
      } else {
        shortcuts = [...DEFAULT_SHORTCUTS];
      }

      if (result.edgebar_drawer_width) {
        drawerWidth = Math.max(320, Math.min(result.edgebar_drawer_width, window.innerWidth * 0.85));
        drawer.style.width = `${drawerWidth}px`;
      }

      renderShortcuts();
    });
  }

  function saveShortcuts() {
    chrome.storage.local.set({ edgebar_shortcuts: shortcuts });
  }

  // Render Shortcuts in Vertical Strip
  function renderShortcuts() {
    itemsList.innerHTML = '';

    shortcuts.forEach((sc) => {
      const btn = document.createElement('button');
      btn.className = 'eb-item-btn';
      if (sc.id === activeShortcutId) {
        btn.classList.add('eb-active');
      }
      btn.dataset.id = sc.id;

      // Icon element
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

      // Left click: Toggle/Open drawer
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.eb-item-del-btn')) return;
        toggleShortcut(sc);
      });

      // Right click: Open Context Menu to delete / copy URL
      btn.addEventListener('contextmenu', (e) => {
        showContextMenu(e, sc);
      });

      // Hover remove mini badge (now available for ALL shortcuts)
      const delBtn = document.createElement('div');
      delBtn.className = 'eb-item-del-btn';
      delBtn.title = 'Kısayolu Sil';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteShortcut(sc.id);
      });
      btn.appendChild(delBtn);

      itemsList.appendChild(btn);
    });
  }

  // --- Tier 1 & Tier 2: Strip Expansion / Collapse ---
  function expandStrip() {
    isStripExpanded = true;
    triggerPill.classList.add('eb-hidden');
    strip.classList.add('eb-visible');
  }

  function collapseStrip() {
    isStripExpanded = false;
    strip.classList.remove('eb-visible');
    triggerPill.classList.remove('eb-hidden');
    closeDrawer();
  }

  triggerPill.addEventListener('click', expandStrip);
  collapseBtn.addEventListener('click', collapseStrip);

  // --- Tier 3: Drawer & Multi-Iframe Session Pool ---
  function toggleShortcut(sc) {
    if (activeShortcutId === sc.id && drawer.classList.contains('eb-open')) {
      closeDrawer();
    } else {
      openDrawer(sc);
    }
  }

  function openDrawer(sc) {
    activeShortcutId = sc.id;
    currentActiveUrl = sc.url;

    // Highlight active button in dock
    strip.querySelectorAll('.eb-item-btn').forEach((b) => {
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

    // MULTI-IFRAME SESSION POOL:
    // Check if iframe already exists for this shortcut
    let activeFrame = iframePool.get(sc.id);

    // Hide all currently loaded iframes
    iframePool.forEach((frame) => {
      frame.classList.remove('eb-active-frame');
    });

    if (!activeFrame) {
      // First time opening this shortcut -> Create iframe
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
      // Re-activating an existing iframe: Keep active session intact! (No reload!)
      activeFrame.classList.add('eb-active-frame');
      loader.classList.add('eb-hidden');
    }

    // Open Drawer
    drawer.classList.add('eb-open');
  }

  function closeDrawer() {
    activeShortcutId = null;
    strip.querySelectorAll('.eb-item-btn').forEach((b) => b.classList.remove('eb-active'));
    drawer.classList.remove('eb-open');
    hideTooltip();
    hideContextMenu();
  }

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

  closeBtn.addEventListener('click', closeDrawer);

  // --- Resizer Handle Logic ---
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = drawer.getBoundingClientRect().width;
    resizer.classList.add('eb-resizing');
    dragOverlay.classList.add('eb-active');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(320, Math.min(startWidth + deltaX, window.innerWidth * 0.85));
    drawerWidth = newWidth;
    drawer.style.width = `${newWidth}px`;
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('eb-resizing');
      dragOverlay.classList.remove('eb-active');
      chrome.storage.local.set({ edgebar_drawer_width: drawerWidth });
    }
  });

  // --- Add Custom Shortcut Modal ---
  function openAddModal() {
    inputName.value = '';
    inputUrl.value = '';
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

  // Reset to Defaults (Gemini, ChatGPT, X)
  resetDefaultsBtn.addEventListener('click', () => {
    shortcuts = [...DEFAULT_SHORTCUTS];
    saveShortcuts();
    renderShortcuts();
    closeAddModal();
  });

  // Delete Shortcut & Destroy Cached Iframe
  function deleteShortcut(id) {
    shortcuts = shortcuts.filter((s) => s.id !== id);

    // If deleting active one, close drawer
    if (activeShortcutId === id) {
      closeDrawer();
    }

    // Clean up cached iframe to release memory
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

  loadState();
})();
