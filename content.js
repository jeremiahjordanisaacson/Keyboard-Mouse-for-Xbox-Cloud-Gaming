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

  // Game detection - track current game for auto-profile switching
  let currentGameTitle = null;
  let gameDetectionObserver = null;

  function detectCurrentGame() {
    // Try multiple selectors to find game title on xCloud
    const selectors = [
      '[data-testid="gameTitle"]',
      '.game-title',
      'h1[class*="GameTitle"]',
      '[class*="gameTitle"]',
      '.StreamHUD-module__title',
      '[class*="StreamHUD"] h1',
      '[class*="streamhud"] [class*="title"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    // Try to get from page title when streaming
    const pageTitle = document.title;
    if (pageTitle && pageTitle.includes('|')) {
      const parts = pageTitle.split('|');
      if (parts.length > 0 && parts[0].trim() !== 'Xbox Cloud Gaming') {
        return parts[0].trim();
      }
    }

    // Try URL-based detection
    const url = window.location.href;
    const playMatch = url.match(/\/play\/games\/([^/?]+)/i);
    if (playMatch) {
      // Convert URL slug to readable name
      return playMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    return null;
  }

  function onGameChange(newGameTitle) {
    if (newGameTitle === currentGameTitle) return;

    const previousGame = currentGameTitle;
    currentGameTitle = newGameTitle;

    console.log('[XCloud KB+M] Game detected:', newGameTitle || 'None');

    // Notify background script of game change
    chrome.runtime.sendMessage({
      type: 'GAME_CHANGED',
      gameTitle: newGameTitle,
      previousGame: previousGame
    }).catch(() => {});
  }

  function startGameDetection() {
    // Initial detection
    onGameChange(detectCurrentGame());

    // Watch for DOM changes that might indicate game title change
    gameDetectionObserver = new MutationObserver(() => {
      const detected = detectCurrentGame();
      if (detected !== currentGameTitle) {
        onGameChange(detected);
      }
    });

    gameDetectionObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Also check periodically in case mutations are missed
    setInterval(() => {
      const detected = detectCurrentGame();
      if (detected !== currentGameTitle) {
        onGameChange(detected);
      }
    }, 3000);
  }

  // Start game detection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGameDetection);
  } else {
    startGameDetection();
  }

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

  // Listen for messages from popup and background script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'GET_CURRENT_GAME') {
      sendResponse({ gameTitle: currentGameTitle });
      return false;
    }

    if (request.type === 'CONFIG_UPDATE') {
      // Forward config update to injected script
      window.postMessage({
        type: 'XCLOUD_KBM_UPDATE_CONFIG',
        config: request.config,
        keyBindings: request.keyBindings
      }, '*');
    }

    if (request.type === 'TOGGLE_CONTROLS') {
      // Forward toggle command to injected script
      window.postMessage({
        type: 'XCLOUD_KBM_TOGGLE',
        enabled: request.enabled
      }, '*');
    }

    if (request.type === 'PROFILE_CHANGED') {
      // Forward profile change to injected script
      const profile = request.profile;
      window.postMessage({
        type: 'XCLOUD_KBM_UPDATE_CONFIG',
        config: {
          mouseSensitivity: profile.mouseSensitivity,
          invertY: profile.invertY
        },
        keyBindings: profile.keyBindings
      }, '*');
    }
  });

  // Send config when injected script is ready
  chrome.storage.sync.get(['config', 'keyBindings', 'profiles', 'activeProfileId'], function(result) {
    let config = result.config || null;
    let keyBindings = result.keyBindings || null;

    // If profiles exist, use active profile settings
    if (result.profiles && result.activeProfileId) {
      const activeProfile = result.profiles[result.activeProfileId];
      if (activeProfile) {
        keyBindings = activeProfile.keyBindings || keyBindings;
        config = config || {};
        config.mouseSensitivity = activeProfile.mouseSensitivity;
        config.invertY = activeProfile.invertY;
      }
    }

    window.postMessage({
      type: 'XCLOUD_KBM_CONFIG',
      config: config,
      keyBindings: keyBindings
    }, '*');
  });
})();
