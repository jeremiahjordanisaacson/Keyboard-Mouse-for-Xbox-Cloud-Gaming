// Popup script - handles settings UI with profiles and accessibility support

// Localization helper
function getMessage(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

// Apply localization to all elements with data-i18n attributes
function localizeUI() {
  // Localize text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const message = getMessage(key);
    if (message && message !== key) {
      el.textContent = message;
    }
  });

  // Localize placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const message = getMessage(key);
    if (message && message !== key) {
      el.placeholder = message;
    }
  });

  // Localize titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const message = getMessage(key);
    if (message && message !== key) {
      el.title = message;
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Apply localization
  localizeUI();
  const enabledCheckbox = document.getElementById('enabled');
  const sensitivitySlider = document.getElementById('sensitivity');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const invertYCheckbox = document.getElementById('invertY');
  const sensitivityCurveSelect = document.getElementById('sensitivityCurve');
  const deadzoneSlider = document.getElementById('deadzone');
  const deadzoneValue = document.getElementById('deadzoneValue');
  const statusEl = document.getElementById('status');
  const statusLink = document.getElementById('statusLink');
  const resetBindingsBtn = document.getElementById('resetBindings');
  const keyBindButtons = document.querySelectorAll('.key-bind-btn');

  // Profile elements
  const profileSelect = document.getElementById('profileSelect');
  const newProfileBtn = document.getElementById('newProfileBtn');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');
  const exportProfileBtn = document.getElementById('exportProfileBtn');
  const importProfileBtn = document.getElementById('importProfileBtn');
  const newProfileModal = document.getElementById('newProfileModal');
  const newProfileName = document.getElementById('newProfileName');
  const cancelNewProfile = document.getElementById('cancelNewProfile');
  const createNewProfile = document.getElementById('createNewProfile');

  // Auto-switch elements
  const autoSwitchRow = document.getElementById('autoSwitchRow');
  const currentGameNameEl = document.getElementById('currentGameName');
  const assignGameBtn = document.getElementById('assignGameBtn');

  // Default key bindings
  const DEFAULT_BINDINGS = {
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
  };

  // State
  let profiles = {};
  let activeProfileId = 'default';
  let currentBindings = { ...DEFAULT_BINDINGS };
  let listeningButton = null;
  let gameProfiles = {};
  let currentGameTitle = null;

  // Convert key code to display name
  function keyCodeToDisplayName(code) {
    const keyMap = {
      'KeyW': 'W', 'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D',
      'KeyQ': 'Q', 'KeyE': 'E', 'KeyR': 'R', 'KeyF': 'F',
      'KeyC': 'C', 'KeyV': 'V', 'KeyZ': 'Z', 'KeyX': 'X',
      'KeyG': 'G', 'KeyH': 'H', 'KeyB': 'B', 'KeyN': 'N',
      'KeyT': 'T', 'KeyY': 'Y', 'KeyU': 'U', 'KeyI': 'I',
      'KeyO': 'O', 'KeyP': 'P', 'KeyJ': 'J', 'KeyK': 'K',
      'KeyL': 'L', 'KeyM': 'M',
      'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4',
      'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8',
      'Digit9': '9', 'Digit0': '0',
      'Space': 'Space',
      'ShiftLeft': 'Shift', 'ShiftRight': 'R-Shift',
      'ControlLeft': 'Ctrl', 'ControlRight': 'R-Ctrl',
      'AltLeft': 'Alt', 'AltRight': 'R-Alt',
      'Tab': 'Tab',
      'Escape': 'Esc',
      'Enter': 'Enter',
      'Backspace': 'Backspace',
      'CapsLock': 'Caps',
      'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right',
      'MouseLeft': 'Left Click',
      'MouseRight': 'Right Click',
      'MouseMiddle': 'Middle Click',
      'MouseButton4': 'Mouse 4',
      'MouseButton5': 'Mouse 5',
      'Numpad0': 'Num 0', 'Numpad1': 'Num 1', 'Numpad2': 'Num 2', 'Numpad3': 'Num 3',
      'Numpad4': 'Num 4', 'Numpad5': 'Num 5', 'Numpad6': 'Num 6', 'Numpad7': 'Num 7',
      'Numpad8': 'Num 8', 'Numpad9': 'Num 9',
      'NumpadAdd': 'Num +', 'NumpadSubtract': 'Num -',
      'NumpadMultiply': 'Num *', 'NumpadDivide': 'Num /',
      'NumpadEnter': 'Num Enter', 'NumpadDecimal': 'Num .',
      'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4',
      'F5': 'F5', 'F6': 'F6', 'F7': 'F7', 'F8': 'F8',
      'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
      'Backquote': '`', 'Minus': '-', 'Equal': '=',
      'BracketLeft': '[', 'BracketRight': ']', 'Backslash': '\\',
      'Semicolon': ';', 'Quote': "'", 'Comma': ',', 'Period': '.', 'Slash': '/',
      'Insert': 'Insert', 'Delete': 'Delete', 'Home': 'Home', 'End': 'End',
      'PageUp': 'Page Up', 'PageDown': 'Page Down'
    };
    return keyMap[code] || code;
  }

  // Update all key binding button displays
  function updateBindingDisplays() {
    keyBindButtons.forEach(btn => {
      const action = btn.dataset.action;
      if (currentBindings[action]) {
        btn.textContent = keyCodeToDisplayName(currentBindings[action]);
      }
    });
  }

  // Update profile dropdown
  function updateProfileDropdown() {
    profileSelect.innerHTML = '';
    for (const [id, profile] of Object.entries(profiles)) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = profile.name;
      if (id === activeProfileId) {
        option.selected = true;
      }
      profileSelect.appendChild(option);
    }
  }

  // Update auto-switch UI
  function updateAutoSwitchUI() {
    if (!currentGameTitle) {
      autoSwitchRow.style.display = 'none';
      return;
    }

    autoSwitchRow.style.display = 'block';
    currentGameNameEl.textContent = currentGameTitle;

    // Check if this game is already assigned to a profile
    const assignedProfileId = gameProfiles[currentGameTitle];

    if (assignedProfileId) {
      const assignedProfile = profiles[assignedProfileId];
      assignGameBtn.textContent = getMessage('removeGameAssignment');
      assignGameBtn.classList.add('assigned');
      assignGameBtn.setAttribute('data-assigned', 'true');
    } else {
      assignGameBtn.textContent = getMessage('assignToGame');
      assignGameBtn.classList.remove('assigned');
      assignGameBtn.removeAttribute('data-assigned');
    }
  }

  // Detect current game from active tab
  function detectCurrentGame() {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_GAME' }, function(response) {
      if (response && response.gameTitle) {
        currentGameTitle = response.gameTitle;
        updateAutoSwitchUI();
      }
    });
  }

  // Load game profiles from storage
  function loadGameProfiles() {
    chrome.runtime.sendMessage({ type: 'GET_GAME_PROFILES' }, function(response) {
      if (response && response.gameProfiles) {
        gameProfiles = response.gameProfiles;
        updateAutoSwitchUI();
      }
    });
  }

  // Load profile data into UI
  function loadProfileIntoUI(profile) {
    if (!profile) return;

    currentBindings = { ...DEFAULT_BINDINGS, ...profile.keyBindings };
    updateBindingDisplays();

    if (profile.mouseSensitivity !== undefined) {
      sensitivitySlider.value = profile.mouseSensitivity;
      sensitivityValue.textContent = profile.mouseSensitivity;
      sensitivitySlider.setAttribute('aria-valuenow', profile.mouseSensitivity);
    }

    if (profile.invertY !== undefined) {
      invertYCheckbox.checked = profile.invertY;
    }

    if (profile.sensitivityCurve !== undefined && sensitivityCurveSelect) {
      sensitivityCurveSelect.value = profile.sensitivityCurve;
    }

    if (profile.deadzone !== undefined && deadzoneSlider) {
      deadzoneSlider.value = profile.deadzone;
      deadzoneValue.textContent = profile.deadzone + '%';
      deadzoneSlider.setAttribute('aria-valuenow', profile.deadzone);
    }
  }

  // Load all data from storage
  function loadFromStorage() {
    chrome.storage.sync.get(['profiles', 'activeProfileId', 'config'], function(result) {
      // Load config
      const config = result.config || {};
      if (config.enabled !== undefined) {
        enabledCheckbox.checked = config.enabled;
      }

      // Load profiles
      profiles = result.profiles || {
        'default': {
          id: 'default',
          name: 'Default',
          keyBindings: { ...DEFAULT_BINDINGS },
          mouseSensitivity: 5,
          invertY: false
        }
      };

      activeProfileId = result.activeProfileId || 'default';

      updateProfileDropdown();
      loadProfileIntoUI(profiles[activeProfileId]);
    });
  }

  // Save current profile
  function saveCurrentProfile() {
    if (!profiles[activeProfileId]) return;

    profiles[activeProfileId].keyBindings = { ...currentBindings };
    profiles[activeProfileId].mouseSensitivity = parseInt(sensitivitySlider.value);
    profiles[activeProfileId].invertY = invertYCheckbox.checked;
    profiles[activeProfileId].sensitivityCurve = sensitivityCurveSelect ? sensitivityCurveSelect.value : 'linear';
    profiles[activeProfileId].deadzone = deadzoneSlider ? parseInt(deadzoneSlider.value) : 5;

    chrome.storage.sync.set({ profiles }, function() {
      console.log('Profile saved:', activeProfileId);
    });

    // Also save to legacy format for backward compatibility
    const config = {
      enabled: enabledCheckbox.checked,
      mouseSensitivity: parseInt(sensitivitySlider.value),
      invertY: invertYCheckbox.checked,
      sensitivityCurve: sensitivityCurveSelect ? sensitivityCurveSelect.value : 'linear',
      deadzone: deadzoneSlider ? parseInt(deadzoneSlider.value) : 5
    };

    chrome.storage.sync.set({ config, keyBindings: currentBindings }, function() {
      console.log('Config saved');
    });

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'CONFIG_UPDATE',
          config: config,
          keyBindings: currentBindings
        }).catch(() => {});
      }
    });
  }

  // Check if we're on an xCloud page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0]?.url || '';
    if (url.includes('xbox.com') && url.includes('play')) {
      updateStatus(true, getMessage('statusActive'));
    } else {
      updateStatus(false, getMessage('statusInactive'));
    }
  });

  // Update status
  function updateStatus(isActive, message) {
    const icon = isActive ? '●' : '○';
    const iconSpan = statusEl.querySelector('.status-icon');
    if (iconSpan) iconSpan.textContent = icon;
    if (statusLink) {
      statusLink.textContent = message;
      statusLink.style.pointerEvents = isActive ? 'none' : 'auto';
    }
    statusEl.className = isActive ? 'status active' : 'status';
  }

  // Handle status link click - open xCloud
  if (statusLink) {
    statusLink.addEventListener('click', function(e) {
      e.preventDefault();
      // Open xCloud in new tab
      chrome.tabs.create({ url: 'https://www.xbox.com/play' });
    });
  }

  // Load initial data
  loadFromStorage();
  loadGameProfiles();
  detectCurrentGame();

  // Event listeners
  enabledCheckbox.addEventListener('change', function() {
    const config = { enabled: this.checked };
    chrome.storage.sync.set({ config: { ...config, mouseSensitivity: parseInt(sensitivitySlider.value), invertY: invertYCheckbox.checked } });

    // Update badge
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', enabled: this.checked });

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_CONTROLS',
          enabled: enabledCheckbox.checked
        }).catch(() => {});
      }
    });

    announceToScreenReader(this.checked ? getMessage('controlsEnabled') : getMessage('controlsDisabled'));
  });

  sensitivitySlider.addEventListener('input', function() {
    sensitivityValue.textContent = this.value;
    this.setAttribute('aria-valuenow', this.value);
  });

  sensitivitySlider.addEventListener('change', function() {
    saveCurrentProfile();
    announceToScreenReader(`Sensitivity set to ${this.value}`);
  });

  invertYCheckbox.addEventListener('change', function() {
    saveCurrentProfile();
    announceToScreenReader(`Invert Y axis ${this.checked ? 'enabled' : 'disabled'}`);
  });

  // Sensitivity curve change
  if (sensitivityCurveSelect) {
    sensitivityCurveSelect.addEventListener('change', function() {
      saveCurrentProfile();
      announceToScreenReader(`Response curve set to ${this.value}`);
    });
  }

  // Deadzone slider
  if (deadzoneSlider) {
    deadzoneSlider.addEventListener('input', function() {
      deadzoneValue.textContent = this.value + '%';
      this.setAttribute('aria-valuenow', this.value);
    });

    deadzoneSlider.addEventListener('change', function() {
      saveCurrentProfile();
      announceToScreenReader(`Deadzone set to ${this.value}%`);
    });
  }

  // Profile selection
  profileSelect.addEventListener('change', function() {
    activeProfileId = this.value;
    chrome.storage.sync.set({ activeProfileId });
    loadProfileIntoUI(profiles[activeProfileId]);

    // Notify background to update content scripts
    chrome.runtime.sendMessage({
      type: 'SET_ACTIVE_PROFILE',
      profileId: activeProfileId
    });

    announceToScreenReader(getMessage('switchedToProfile', [profiles[activeProfileId].name]));
  });

  // New profile button
  newProfileBtn.addEventListener('click', function() {
    newProfileModal.classList.add('active');
    newProfileName.value = '';
    newProfileName.focus();
  });

  // Cancel new profile
  cancelNewProfile.addEventListener('click', function() {
    newProfileModal.classList.remove('active');
  });

  // Create new profile
  createNewProfile.addEventListener('click', function() {
    const name = newProfileName.value.trim();
    if (!name) {
      newProfileName.focus();
      return;
    }

    chrome.runtime.sendMessage({ type: 'CREATE_PROFILE', name }, function(response) {
      if (response.success) {
        // Reload profiles
        chrome.storage.sync.get(['profiles'], function(result) {
          profiles = result.profiles;
          activeProfileId = response.profileId;
          chrome.storage.sync.set({ activeProfileId });
          updateProfileDropdown();
          loadProfileIntoUI(profiles[activeProfileId]);
          announceToScreenReader(getMessage('profileCreated', [name]));
        });
      }
    });

    newProfileModal.classList.remove('active');
  });

  // Enter key in modal
  newProfileName.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      createNewProfile.click();
    } else if (e.key === 'Escape') {
      cancelNewProfile.click();
    }
  });

  // Click outside modal to close
  newProfileModal.addEventListener('click', function(e) {
    if (e.target === newProfileModal) {
      newProfileModal.classList.remove('active');
    }
  });

  // Delete profile
  deleteProfileBtn.addEventListener('click', function() {
    if (activeProfileId === 'default') {
      announceToScreenReader(getMessage('cannotDeleteDefault'));
      return;
    }

    const profileName = profiles[activeProfileId]?.name || activeProfileId;

    if (confirm(getMessage('deleteProfileConfirm', [profileName]))) {
      chrome.runtime.sendMessage({ type: 'DELETE_PROFILE', profileId: activeProfileId }, function(response) {
        if (response.success) {
          chrome.storage.sync.get(['profiles', 'activeProfileId'], function(result) {
            profiles = result.profiles;
            activeProfileId = result.activeProfileId;
            updateProfileDropdown();
            loadProfileIntoUI(profiles[activeProfileId]);
            announceToScreenReader(getMessage('profileDeleted', [profileName]));
          });
        } else {
          announceToScreenReader(response.error || getMessage('cannotDeleteDefault'));
        }
      });
    }
  });

  // Export profile
  exportProfileBtn.addEventListener('click', function() {
    const profile = profiles[activeProfileId];
    if (!profile) return;

    // Create export data (exclude internal id)
    const exportData = {
      name: profile.name,
      keyBindings: profile.keyBindings,
      mouseSensitivity: profile.mouseSensitivity,
      invertY: profile.invertY,
      sensitivityCurve: profile.sensitivityCurve || 'linear',
      deadzone: profile.deadzone || 5
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
      announceToScreenReader(getMessage('profileExported'));
    }).catch(err => {
      console.error('Failed to copy profile:', err);
    });
  });

  // Import profile
  importProfileBtn.addEventListener('click', function() {
    // Read from clipboard
    navigator.clipboard.readText().then(text => {
      try {
        const importData = JSON.parse(text);

        // Validate imported data
        if (!importData.name || typeof importData.name !== 'string') {
          throw new Error('Invalid profile name');
        }

        // Create new profile with imported data
        const profileId = 'imported_' + Date.now();
        const newProfile = {
          id: profileId,
          name: importData.name,
          keyBindings: { ...DEFAULT_BINDINGS, ...(importData.keyBindings || {}) },
          mouseSensitivity: importData.mouseSensitivity || 5,
          invertY: importData.invertY || false,
          sensitivityCurve: importData.sensitivityCurve || 'linear',
          deadzone: importData.deadzone || 5
        };

        profiles[profileId] = newProfile;
        activeProfileId = profileId;

        chrome.storage.sync.set({ profiles, activeProfileId }, function() {
          updateProfileDropdown();
          loadProfileIntoUI(profiles[activeProfileId]);
          announceToScreenReader(getMessage('profileImported'));

          // Notify background to update content scripts
          chrome.runtime.sendMessage({
            type: 'SET_ACTIVE_PROFILE',
            profileId: activeProfileId
          });
        });
      } catch (err) {
        console.error('Failed to import profile:', err);
        announceToScreenReader(getMessage('invalidProfileData'));
      }
    }).catch(err => {
      console.error('Failed to read clipboard:', err);
      announceToScreenReader(getMessage('invalidProfileData'));
    });
  });

  // Assign/remove game profile
  assignGameBtn.addEventListener('click', function() {
    if (!currentGameTitle) return;

    const isAssigned = this.getAttribute('data-assigned') === 'true';
    const profileName = profiles[activeProfileId]?.name || activeProfileId;

    if (isAssigned) {
      // Remove assignment
      chrome.runtime.sendMessage({
        type: 'REMOVE_GAME_PROFILE',
        gameTitle: currentGameTitle
      }, function(response) {
        if (response.success) {
          delete gameProfiles[currentGameTitle];
          updateAutoSwitchUI();
          announceToScreenReader(getMessage('gameAssignmentRemoved', [currentGameTitle]));
        }
      });
    } else {
      // Assign current profile to this game
      chrome.runtime.sendMessage({
        type: 'ASSIGN_GAME_PROFILE',
        gameTitle: currentGameTitle,
        profileId: activeProfileId
      }, function(response) {
        if (response.success) {
          gameProfiles[currentGameTitle] = activeProfileId;
          updateAutoSwitchUI();
          announceToScreenReader(getMessage('profileAssignedToGame', [profileName, currentGameTitle]));
        }
      });
    }
  });

  // Key binding functionality
  function startListening(button) {
    if (listeningButton) {
      listeningButton.classList.remove('listening');
      listeningButton.textContent = keyCodeToDisplayName(currentBindings[listeningButton.dataset.action]);
    }

    listeningButton = button;
    button.classList.add('listening');
    button.textContent = getMessage('pressKey');
    button.setAttribute('aria-label', getMessage('listeningForKey'));
    announceToScreenReader(getMessage('pressKeyOrMouse'));
  }

  function stopListening(newCode = null) {
    if (!listeningButton) return;

    const action = listeningButton.dataset.action;
    const actionName = getMessage(action) || action;

    if (newCode) {
      currentBindings[action] = newCode;
      saveCurrentProfile();
      announceToScreenReader(getMessage('boundTo', [actionName, keyCodeToDisplayName(newCode)]));
    }

    listeningButton.classList.remove('listening');
    listeningButton.textContent = keyCodeToDisplayName(currentBindings[action]);
    listeningButton.setAttribute('aria-label', getMessage('changeBinding', [actionName, keyCodeToDisplayName(currentBindings[action])]));
    listeningButton = null;
  }

  keyBindButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      if (listeningButton === this) {
        stopListening();
      } else {
        startListening(this);
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (!listeningButton) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.code === 'Escape') {
      stopListening();
      announceToScreenReader(getMessage('keyBindingCancelled'));
      return;
    }

    stopListening(e.code);
  }, true);

  document.addEventListener('mousedown', function(e) {
    if (!listeningButton) return;
    if (e.button === 0 && e.target === listeningButton) return;

    e.preventDefault();
    e.stopPropagation();

    let mouseCode;
    switch (e.button) {
      case 0: mouseCode = 'MouseLeft'; break;
      case 1: mouseCode = 'MouseMiddle'; break;
      case 2: mouseCode = 'MouseRight'; break;
      case 3: mouseCode = 'MouseButton4'; break;
      case 4: mouseCode = 'MouseButton5'; break;
      default: mouseCode = `MouseButton${e.button}`;
    }

    stopListening(mouseCode);
  }, true);

  document.addEventListener('contextmenu', function(e) {
    if (listeningButton) {
      e.preventDefault();
    }
  });

  // Reset bindings
  resetBindingsBtn.addEventListener('click', function() {
    currentBindings = { ...DEFAULT_BINDINGS };
    updateBindingDisplays();
    saveCurrentProfile();
    announceToScreenReader(getMessage('bindingsReset'));
  });

  // Screen reader announcements
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Keyboard navigation for scrollable key bindings
  const keyBindingsContainer = document.getElementById('keyBindings');
  if (keyBindingsContainer) {
    keyBindingsContainer.addEventListener('keydown', function(e) {
      if (listeningButton) return;

      const scrollAmount = 40;
      if (e.key === 'ArrowDown' && !e.target.classList.contains('key-bind-btn')) {
        this.scrollTop += scrollAmount;
        e.preventDefault();
      } else if (e.key === 'ArrowUp' && !e.target.classList.contains('key-bind-btn')) {
        this.scrollTop -= scrollAmount;
        e.preventDefault();
      }
    });
  }
});
