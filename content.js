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

  // --- External Dependencies (constants.js, templates.js, settings-modal.js) ---
  const { ICONS, DEFAULT_SHORTCUTS } = window.__EDGEBAR_CONSTANTS || {};
  const TEMPLATES = window.__EDGEBAR_TEMPLATES || {};
  const MODAL = window.__EDGEBAR_MODAL || {};

  // --- State Variables ---
  let shortcuts = [];
  let activeShortcutId = null;
  let drawerWidth = 486;
  let drawerHeight = 600;
  let currentActiveUrl = '';
  let viewMode = 'mobile';
  let heightMode = 'full';
  let collapsedStyle = 'strip'; // 'strip' (dock visible) or 'pill' (trigger icon only)
  let openTop = null;
  let closedTop = null;
  let isDraggingDock = false;
  let dockStartY = 0;
  let dockStartTop = 0;
  let dockHasMoved = false;
  let preventNextClick = false;
  let zoomLevel = 1.0;

  // Clean any lingering host page styles
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

  // 2. Top-Left Trigger Pill
  const triggerPill = document.createElement('button');
  triggerPill.className = 'eb-trigger-pill';
  triggerPill.title = 'EdgeBar Aç';
  triggerPill.innerHTML = ICONS.sidebarClosed;
  container.appendChild(triggerPill);

  // 3. Unified Drawer
  const drawer = document.createElement('div');
  drawer.className = 'eb-drawer eb-height-full';
  drawer.innerHTML = TEMPLATES.getDrawerHtml(ICONS);
  container.appendChild(drawer);

  const itemsList = drawer.querySelector('.eb-items-list');
  const toggleBtn = drawer.querySelector('.eb-toggle-btn');
  const settingsBtn = drawer.querySelector('.eb-settings-btn');
  const dockDragHandle = drawer.querySelector('.eb-dock-drag-handle');
  const drawerHeader = drawer.querySelector('.eb-drawer-header');
  const drawerFavicon = drawer.querySelector('.eb-drawer-favicon');
  const drawerTitle = drawer.querySelector('.eb-drawer-title');
  const reloadBtn = drawer.querySelector('.eb-reload');
  const externalBtn = drawer.querySelector('.eb-external');
  const closeBtn = drawer.querySelector('.eb-close');
  const iframeContainer = drawer.querySelector('.eb-iframe-container');
  const loader = drawer.querySelector('.eb-loader-overlay');
  const resizer = drawer.querySelector('.eb-resizer');
  const resizerTop = drawer.querySelector('.eb-resizer-top');
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
  contextMenu.innerHTML = TEMPLATES.getContextMenuHtml();
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

  // 5. Settings & Shortcuts Management Modal
  const settingsModal = MODAL.createSettingsModal({
    container,
    ICONS,
    DEFAULT_SHORTCUTS,
    getShortcuts: () => shortcuts,
    setShortcuts: (updated) => {
      shortcuts = updated;
      saveShortcuts();
      renderShortcuts();
      if (activeShortcutId && !shortcuts.some((s) => s.id === activeShortcutId)) {
        if (shortcuts.length > 0) {
          openDrawer(shortcuts[0]);
        } else {
          closeDrawer();
        }
      }
    },
    getViewMode: () => viewMode,
    setViewMode: (newMode) => {
      chrome.runtime.sendMessage({ type: 'SET_VIEW_MODE', mode: newMode }, () => {
        viewMode = newMode;
        if (activeShortcutId && iframePool.has(activeShortcutId)) {
          loader.classList.remove('eb-hidden');
          const activeFrame = iframePool.get(activeShortcutId);
          activeFrame.src = activeFrame.src;
        }
      });
    },
    getHeightMode: () => heightMode,
    setHeightMode: (newHeightMode) => {
      applyHeightMode(newHeightMode);
      chrome.storage.local.set({ edgebar_height_mode: newHeightMode });
    },
    getCollapsedStyle: () => collapsedStyle,
    setCollapsedStyle: (newStyle) => {
      applyCollapsedStyle(newStyle);
      chrome.storage.local.set({ edgebar_collapsed_style: newStyle });
    },
    onOpenShortcut: (shortcut) => {
      openDrawer(shortcut);
    },
    onCloseDrawer: () => {
      closeDrawer();
    }
  });

  settingsBtn.addEventListener('click', () => {
    settingsModal.openModal();
  });

  function deleteShortcut(id) {
    shortcuts = shortcuts.filter((s) => s.id !== id);
    if (activeShortcutId === id) {
      if (shortcuts.length > 0) {
        openDrawer(shortcuts[0]);
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
    settingsModal.syncUI();
  }

  // ==========================================================================
  // ZOOM LOGIC
  // ==========================================================================

  function applyZoom(newZoom) {
    zoomLevel = Math.max(0.7, Math.min(newZoom, 1.5));
    zoomLevel = Math.round(zoomLevel * 10) / 10;
    iframePool.forEach((frame) => {
      frame.style.zoom = `${zoomLevel}`;
    });
    zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
    chrome.storage.local.set({ edgebar_zoom: zoomLevel });
  }

  zoomInBtn.addEventListener('click', () => applyZoom(zoomLevel + 0.1));
  zoomOutBtn.addEventListener('click', () => applyZoom(zoomLevel - 0.1));
  zoomLabel.addEventListener('click', () => applyZoom(1.0));

  // ==========================================================================
  // VIEW MODE & HEIGHT MODE
  // ==========================================================================

  function applyHeightMode(mode) {
    heightMode = mode;
    drawer.classList.remove('eb-height-full', 'eb-height-floating', 'eb-height-custom');
    drawer.classList.add(`eb-height-${mode}`);
    if (mode === 'custom') {
      applyOpenPosition(openTop);
    } else {
      drawer.style.removeProperty('top');
      drawer.style.removeProperty('bottom');
      drawer.style.removeProperty('height');
    }
    settingsModal.syncUI();
  }

  function applyCollapsedStyle(style) {
    collapsedStyle = style;
    if (!drawer.classList.contains('eb-open')) {
      closeDrawer(false);
    }
    settingsModal.syncUI();
  }

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
    if (e.button !== 0) return;
    if (
      e.target.closest('.eb-action-btn') ||
      e.target.closest('.eb-zoom-group') ||
      e.target.closest('.eb-zoom-btn') ||
      e.target.closest('.eb-item-btn') ||
      e.target.closest('.eb-toggle-btn') ||
      e.target.closest('.eb-settings-btn') ||
      e.target.closest('.eb-drawer-actions') ||
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

      btn.addEventListener('mouseenter', () => showTooltip(sc.name, btn));
      btn.addEventListener('mouseleave', hideTooltip);

      btn.addEventListener('click', () => {
        if (preventNextClick) return;
        if (activeShortcutId === sc.id && drawer.classList.contains('eb-open')) {
          closeDrawer();
        } else {
          openDrawer(sc);
        }
      });

      btn.addEventListener('contextmenu', (e) => {
        showContextMenu(e, sc);
      });

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
          settingsModal.syncUI();
        }
      });

      btn.addEventListener('dragend', () => {
        btn.classList.remove('eb-dragging', 'eb-drag-over');
        draggedItemIndex = null;
      });

      itemsList.appendChild(btn);
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

        openTop = (result.edgebar_open_top !== undefined && result.edgebar_open_top !== null) ? result.edgebar_open_top : null;
        closedTop = (result.edgebar_closed_top !== undefined && result.edgebar_closed_top !== null) ? result.edgebar_closed_top : null;

        if (result.edgebar_height_mode) {
          heightMode = result.edgebar_height_mode;
        }
        applyHeightMode(heightMode);

        if (result.edgebar_collapsed_style) {
          collapsedStyle = result.edgebar_collapsed_style;
        } else {
          collapsedStyle = 'strip';
        }

        renderShortcuts();
        settingsModal.syncUI();

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

    drawer.querySelectorAll('.eb-item-btn').forEach((b) => {
      b.classList.toggle('eb-active', b.dataset.id === sc.id);
    });

    drawerTitle.textContent = sc.name;
    if (sc.favicon) {
      drawerFavicon.src = sc.favicon;
      drawerFavicon.style.display = 'block';
    } else {
      drawerFavicon.style.display = 'none';
    }

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

    drawer.style.removeProperty('top');
    drawer.style.removeProperty('bottom');
    drawer.style.removeProperty('height');
    drawer.style.removeProperty('width');

    triggerPill.classList.add('eb-hidden');
    drawer.classList.remove('eb-strip-only');
    drawer.classList.add('eb-open');
    drawer.style.width = `${drawerWidth}px`;
    applyOpenPosition(openTop);
    toggleBtn.innerHTML = ICONS.sidebarOpen;
    toggleBtn.title = 'Paneli Daralt (Esc)';

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

    itemsList.querySelectorAll('.eb-item-btn').forEach((b) => {
      b.draggable = false;
    });

    hideTooltip();
    hideContextMenu();
    if (saveState) {
      chrome.storage.local.set({ edgebar_drawer_open: false });
    }
  }

  triggerPill.addEventListener('click', () => {
    if (preventNextClick) return;
    const current = shortcuts.find((s) => s.id === activeShortcutId) || shortcuts[0];
    openDrawer(current);
  });

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

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = drawer.getBoundingClientRect().width;
    resizer.classList.add('eb-resizing');
    dragOverlay.classList.add('eb-active');
    dragOverlay.style.cursor = 'col-resize';
    e.preventDefault();
  });

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

  // --- Keyboard Listeners ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (contextMenu.classList.contains('eb-show')) {
        hideContextMenu();
      } else if (settingsModal.isOpen()) {
        settingsModal.closeModal();
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
