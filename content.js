// Content script - runs in the context of the xCloud page
// This injects our gamepad script into the page's main world

(function() {
  'use strict';

  // Inject the main script into the page context
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  console.log('[XCloud KB+M] Content script loaded, injecting gamepad...');

  // Listen for messages from the injected script
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;

    if (event.data.type === 'XCLOUD_KBM_GET_CONFIG') {
      // Get config and key bindings from storage and send back
      chrome.storage.sync.get(['config', 'keyBindings'], function(result) {
        window.postMessage({
          type: 'XCLOUD_KBM_CONFIG',
          config: result.config || null,
          keyBindings: result.keyBindings || null
        }, '*');
      });
    }

    if (event.data.type === 'XCLOUD_KBM_SAVE_CONFIG') {
      // Save config to storage
      chrome.storage.sync.set({
        config: event.data.config,
        keyBindings: event.data.keyBindings
      });
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'CONFIG_UPDATE') {
      // Forward config update to injected script
      window.postMessage({
        type: 'XCLOUD_KBM_UPDATE_CONFIG',
        config: request.config,
        keyBindings: request.keyBindings
      }, '*');
    }
  });

  // Send config when injected script is ready
  chrome.storage.sync.get(['config', 'keyBindings'], function(result) {
    window.postMessage({
      type: 'XCLOUD_KBM_CONFIG',
      config: result.config || null,
      keyBindings: result.keyBindings || null
    }, '*');
  });
})();
