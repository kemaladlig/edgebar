// ============================================================================
// EdgeBar - Background Service Worker (Manifest V3)
// Handles Dynamic DeclarativeNetRequest Rules (Mobile User-Agent Switcher)
// ============================================================================

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';

const MOBILE_RULE_ID = 100;

// Enable mobile user-agent for sub_frames
function setMobileMode(enable, callback) {
  if (enable) {
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: [MOBILE_RULE_ID],
        addRules: [
          {
            id: MOBILE_RULE_ID,
            priority: 2,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                {
                  header: 'user-agent',
                  operation: 'set',
                  value: MOBILE_USER_AGENT
                }
              ]
            },
            condition: {
              resourceTypes: ['sub_frame']
            }
          }
        ]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
        if (callback) callback({ success: true, mode: 'mobile' });
      }
    );
  } else {
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: [MOBILE_RULE_ID]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
        if (callback) callback({ success: true, mode: 'desktop' });
      }
    );
  }
}

const BYPASS_HEADERS_RULE_ID = 200;

// Ensure sub_frame embedding headers (X-Frame-Options, CSP) are stripped dynamically
function ensureBypassRules() {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [BYPASS_HEADERS_RULE_ID],
      addRules: [
        {
          id: BYPASS_HEADERS_RULE_ID,
          priority: 1000,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'x-frame-options', operation: 'remove' },
              { header: 'frame-options', operation: 'remove' },
              { header: 'content-security-policy', operation: 'remove' },
              { header: 'content-security-policy-report-only', operation: 'remove' },
              { header: 'cross-origin-opener-policy', operation: 'remove' },
              { header: 'cross-origin-embedder-policy', operation: 'remove' },
              { header: 'cross-origin-resource-policy', operation: 'remove' }
            ]
          },
          condition: {
            resourceTypes: ['sub_frame']
          }
        }
      ]
    },
    () => {
      if (chrome.runtime.lastError) {
        console.warn('Bypass rule registration:', chrome.runtime.lastError.message);
      }
    }
  );
}

// On install or startup, ensure headers bypass and default view mode
chrome.runtime.onInstalled.addListener(() => {
  ensureBypassRules();
  chrome.storage.local.get(['edgebar_view_mode'], (result) => {
    const mode = result.edgebar_view_mode || 'desktop';
    chrome.storage.local.set({ edgebar_view_mode: mode });
    setMobileMode(mode === 'mobile');
  });
});

chrome.runtime.onStartup.addListener(() => {
  ensureBypassRules();
});
ensureBypassRules();

// Action Click (Extension icon in Chrome top toolbar next to address bar)
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_DRAWER' }).catch(() => {});
  }
});

// Global keyboard command (Alt+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-edgebar') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_DRAWER' }).catch(() => {});
    }
  }
});

// Message listener from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_VIEW_MODE') {
    const isMobile = message.mode === 'mobile';
    chrome.storage.local.set({ edgebar_view_mode: message.mode }, () => {
      setMobileMode(isMobile, sendResponse);
    });
    return true; // Async sendResponse
  }

  if (message.type === 'GET_VIEW_MODE') {
    chrome.storage.local.get(['edgebar_view_mode'], (result) => {
      sendResponse({ mode: result.edgebar_view_mode || 'mobile' });
    });
    return true;
  }

  if (message.type === 'GET_SEARCH_SUGGESTIONS') {
    const query = (message.query || '').trim();
    if (!query) {
      sendResponse({ suggestions: [] });
      return true;
    }
    fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1].slice(0, 6) : [];
        sendResponse({ suggestions });
      })
      .catch(() => {
        sendResponse({ suggestions: [] });
      });
    return true;
  }
});
