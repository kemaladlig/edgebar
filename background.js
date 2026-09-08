// ============================================================================
// EdgeBar - Background Service Worker (Manifest V3)
// Handles Dynamic DeclarativeNetRequest Rules (Mobile User-Agent Switcher)
// ============================================================================

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

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

// On install, default to Mobile View for ultra-clean vertical panels
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['edgebar_view_mode'], (result) => {
    const mode = result.edgebar_view_mode || 'mobile';
    chrome.storage.local.set({ edgebar_view_mode: mode });
    setMobileMode(mode === 'mobile');
  });
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
});
