// Background service worker - handles global commands and badge updates

// Default profile structure
const DEFAULT_PROFILE = {
  name: 'Default',
  keyBindings: {
    moveForward: 'KeyW',
    moveBackward: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    actionA: 'Space',
    actionB: 'KeyE',
    actionX: 'KeyQ',
    actionY: 'KeyR',
    leftBumper: 'KeyF',
    rightBumper: 'KeyC',
    leftTrigger: 'ShiftLeft',
    rightTrigger: 'MouseRight',
    dpadUp: 'Digit1',
    dpadRight: 'Digit2',
    dpadDown: 'Digit3',
    dpadLeft: 'Digit4',
    view: 'Tab',
    menu: 'Escape',
    leftStickClick: 'KeyV',
    rightStickClick: 'MouseMiddle'
  },
  mouseSensitivity: 5,
  invertY: false
};

// Initialize storage with defaults if needed
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get(['profiles', 'activeProfileId', 'config']);

  if (!data.profiles) {
    // Create default profile
    const defaultProfiles = {
      'default': { ...DEFAULT_PROFILE, id: 'default' },
      'fps': {
        id: 'fps',
        name: 'FPS / Shooter',
        keyBindings: { ...DEFAULT_PROFILE.keyBindings },
        mouseSensitivity: 7,
        invertY: false
      },
      'racing': {
        id: 'racing',
        name: 'Racing',
        keyBindings: {
          ...DEFAULT_PROFILE.keyBindings,
          leftTrigger: 'KeyS',  // Brake
          rightTrigger: 'KeyW', // Accelerate
          moveLeft: 'KeyA',
          moveRight: 'KeyD',
          actionA: 'Space',     // Handbrake
          actionX: 'ShiftLeft', // Nitro
        },
        mouseSensitivity: 3,
        invertY: false
      }
    };

    await chrome.storage.sync.set({
      profiles: defaultProfiles,
      activeProfileId: 'default',
      config: { enabled: true }
    });
  }

  updateBadge(data.config?.enabled !== false);
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-controls') {
    await toggleControls();
  } else if (command === 'next-profile') {
    await switchToNextProfile();
  }
});

// Toggle controls on/off
async function toggleControls() {
  const data = await chrome.storage.sync.get(['config']);
  const config = data.config || {};
  const newEnabled = !config.enabled;

  config.enabled = newEnabled;
  await chrome.storage.sync.set({ config });

  updateBadge(newEnabled);

  // Notify content script
  const tabs = await chrome.tabs.query({ url: ['*://www.xbox.com/*play*', '*://xbox.com/*play*'] });
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_CONTROLS',
        enabled: newEnabled
      });
    } catch (e) {
      // Tab might not have content script
    }
  }

  // Show notification via badge flash
  flashBadge(newEnabled ? 'ON' : 'OFF');
}

// Switch to next profile
async function switchToNextProfile() {
  const data = await chrome.storage.sync.get(['profiles', 'activeProfileId']);
  const profiles = data.profiles || {};
  const profileIds = Object.keys(profiles);

  if (profileIds.length === 0) return;

  const currentIndex = profileIds.indexOf(data.activeProfileId);
  const nextIndex = (currentIndex + 1) % profileIds.length;
  const nextProfileId = profileIds[nextIndex];
  const nextProfile = profiles[nextProfileId];

  await chrome.storage.sync.set({ activeProfileId: nextProfileId });

  // Notify content script
  const tabs = await chrome.tabs.query({ url: ['*://www.xbox.com/*play*', '*://xbox.com/*play*'] });
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'PROFILE_CHANGED',
        profile: nextProfile
      });
    } catch (e) {
      // Tab might not have content script
    }
  }

  // Show profile name briefly
  flashBadge(nextProfile.name.substring(0, 3).toUpperCase());
}

// Update badge to show enabled/disabled state
function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#107c10' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#666666' });
  }
}

// Flash badge text temporarily
function flashBadge(text) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#107c10' });

  setTimeout(() => {
    chrome.storage.sync.get(['config'], (data) => {
      updateBadge(data.config?.enabled !== false);
    });
  }, 1500);
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PROFILES') {
    chrome.storage.sync.get(['profiles', 'activeProfileId'], (data) => {
      sendResponse({
        profiles: data.profiles || {},
        activeProfileId: data.activeProfileId || 'default'
      });
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'SET_ACTIVE_PROFILE') {
    chrome.storage.sync.set({ activeProfileId: request.profileId }, () => {
      // Notify content scripts
      chrome.storage.sync.get(['profiles'], async (data) => {
        const profile = data.profiles?.[request.profileId];
        if (profile) {
          const tabs = await chrome.tabs.query({ url: ['*://www.xbox.com/*play*', '*://xbox.com/*play*'] });
          for (const tab of tabs) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: 'PROFILE_CHANGED',
                profile
              });
            } catch (e) {}
          }
        }
      });
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.type === 'SAVE_PROFILE') {
    chrome.storage.sync.get(['profiles'], (data) => {
      const profiles = data.profiles || {};
      profiles[request.profile.id] = request.profile;
      chrome.storage.sync.set({ profiles }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.type === 'DELETE_PROFILE') {
    chrome.storage.sync.get(['profiles', 'activeProfileId'], (data) => {
      const profiles = data.profiles || {};

      // Don't delete the last profile or default
      if (Object.keys(profiles).length <= 1 || request.profileId === 'default') {
        sendResponse({ success: false, error: 'Cannot delete this profile' });
        return;
      }

      delete profiles[request.profileId];

      // If deleted active profile, switch to default
      let activeProfileId = data.activeProfileId;
      if (activeProfileId === request.profileId) {
        activeProfileId = 'default';
      }

      chrome.storage.sync.set({ profiles, activeProfileId }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.type === 'CREATE_PROFILE') {
    chrome.storage.sync.get(['profiles'], (data) => {
      const profiles = data.profiles || {};
      const id = 'profile_' + Date.now();
      profiles[id] = {
        id,
        name: request.name,
        keyBindings: { ...DEFAULT_PROFILE.keyBindings },
        mouseSensitivity: 5,
        invertY: false
      };
      chrome.storage.sync.set({ profiles }, () => {
        sendResponse({ success: true, profileId: id });
      });
    });
    return true;
  }

  if (request.type === 'UPDATE_BADGE') {
    updateBadge(request.enabled);
    sendResponse({ success: true });
    return false;
  }
});

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.config) {
    const newConfig = changes.config.newValue || {};
    updateBadge(newConfig.enabled !== false);
  }
});
