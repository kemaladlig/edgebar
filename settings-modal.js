// ============================================================================
// EdgeBar - Settings & Shortcuts Management Modal
// ============================================================================

window.__EDGEBAR_MODAL = (function () {
  'use strict';

  function createSettingsModal(options) {
    const {
      container,
      ICONS,
      DEFAULT_SHORTCUTS,
      getShortcuts,
      setShortcuts,
      getViewMode,
      setViewMode,
      getHeightMode,
      setHeightMode,
      getCollapsedStyle,
      setCollapsedStyle,
      onOpenShortcut,
      onCloseDrawer
    } = options;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'eb-modal-backdrop';
    modalBackdrop.innerHTML = window.__EDGEBAR_TEMPLATES.getModalHtml(ICONS);
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

    function syncUI() {
      // Sync View Mode
      const currentMode = getViewMode();
      if (segMobile && segDesktop) {
        segMobile.classList.toggle('eb-active-segment', currentMode === 'mobile');
        segDesktop.classList.toggle('eb-active-segment', currentMode === 'desktop');
      }

      // Sync Height Mode
      const currentHeightMode = getHeightMode();
      heightBtns.forEach((btn) => {
        btn.classList.toggle('eb-active-segment', btn.dataset.height === currentHeightMode);
      });

      // Sync Collapsed Style
      const currentCollapsedStyle = getCollapsedStyle();
      collapsedBtns.forEach((btn) => {
        btn.classList.toggle('eb-active-segment', btn.dataset.collapsed === currentCollapsedStyle);
      });

      // Sync Shortcuts List
      renderManageList();
    }

    function renderManageList() {
      manageList.innerHTML = '';
      const shortcuts = getShortcuts();
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

    function openModal() {
      quickAddInput.value = '';
      syncUI();
      modalBackdrop.classList.add('eb-modal-open');
      setTimeout(() => quickAddInput.focus(), 50);
    }

    function closeModal() {
      modalBackdrop.classList.remove('eb-modal-open');
    }

    function isOpen() {
      return modalBackdrop.classList.contains('eb-modal-open');
    }

    // View Mode Switcher
    [segMobile, segDesktop].forEach((btn) => {
      btn.addEventListener('click', () => {
        const newMode = btn.dataset.mode;
        if (newMode === getViewMode()) return;
        setViewMode(newMode);
        syncUI();
      });
    });

    // Height Mode Switcher
    heightBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const newHeightMode = btn.dataset.height;
        setHeightMode(newHeightMode);
        syncUI();
      });
    });

    // Collapsed Style Switcher
    collapsedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const newStyle = btn.dataset.collapsed;
        setCollapsedStyle(newStyle);
        syncUI();
      });
    });

    // Add Shortcut Logic
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

        const updated = [...getShortcuts(), newShortcut];
        setShortcuts(updated);
        closeModal();
        if (onOpenShortcut) {
          onOpenShortcut(newShortcut);
        }
      } catch (_) {
        alert('Geçerli bir web adresi giriniz.');
        quickAddInput.focus();
      }
    }

    function deleteShortcut(id) {
      const remaining = getShortcuts().filter((s) => s.id !== id);
      setShortcuts(remaining);
      syncUI();
    }

    // Event Listeners
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    quickAddBtn.addEventListener('click', handleSaveCustomShortcut);
    quickAddInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveCustomShortcut();
    });
    resetDefaultsBtn.addEventListener('click', () => {
      setShortcuts([...DEFAULT_SHORTCUTS]);
      syncUI();
      closeModal();
      if (onOpenShortcut) {
        onOpenShortcut(DEFAULT_SHORTCUTS[0]);
      }
    });

    return {
      openModal,
      closeModal,
      isOpen,
      syncUI
    };
  }

  return {
    createSettingsModal
  };
})();
