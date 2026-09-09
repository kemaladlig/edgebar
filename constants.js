// ============================================================================
// EdgeBar - Constants & Icons
// Refined SVGs (1.8px fine strokes, sleek Linear/Raycast aesthetic)
// ============================================================================

window.__EDGEBAR_CONSTANTS = (function () {
  'use strict';

  const ICONS = {
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
    {
      id: 'gemini',
      name: 'Gemini',
      url: 'https://gemini.google.com',
      svgKey: 'gemini'
    }
  ];

  return {
    ICONS,
    DEFAULT_SHORTCUTS
  };
})();
