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
  const showOverlayCheckbox = document.getElementById('showOverlay');
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

  // Macro elements
  const macroList = document.getElementById('macroList');
  const macroEmpty = document.getElementById('macroEmpty');
  const newMacroBtn = document.getElementById('newMacroBtn');
  const macroModal = document.getElementById('macroModal');
  const macroName = document.getElementById('macroName');
  const macroStep1 = document.getElementById('macroStep1');
  const macroStep2 = document.getElementById('macroStep2');
  const macroStep3 = document.getElementById('macroStep3');
  const cancelMacro = document.getElementById('cancelMacro');
  const startRecordingBtn = document.getElementById('startRecordingBtn');
  const cancelRecordingBtn = document.getElementById('cancelRecordingBtn');
  const stopRecordingBtn = document.getElementById('stopRecordingBtn');
  const cancelTriggerBtn = document.getElementById('cancelTriggerBtn');
  const triggerKeyDisplay = document.getElementById('triggerKeyDisplay');

  // Default key bindings (now arrays for multi-key support)
  const DEFAULT_BINDINGS = {
    moveForward: ['KeyW'],
    moveBackward: ['KeyS'],
    moveLeft: ['KeyA'],
    moveRight: ['KeyD'],
    actionA: ['Space'],
    actionB: ['KeyE'],
    actionX: ['KeyQ'],
    actionY: ['KeyR'],
    leftBumper: ['KeyF'],
    rightBumper: ['KeyC'],
    leftTrigger: ['ShiftLeft'],
    rightTrigger: ['MouseRight'],
    dpadUp: ['Digit1'],
    dpadRight: ['Digit2'],
    dpadDown: ['Digit3'],
    dpadLeft: ['Digit4'],
    view: ['Tab'],
    menu: ['Escape'],
    leftStickClick: ['KeyV'],
    rightStickClick: ['MouseMiddle']
  };

  // Normalize binding to array format (backwards compatibility)
  function normalizeBinding(binding) {
    if (Array.isArray(binding)) return binding;
    if (typeof binding === 'string') return [binding];
    return [];
  }

  // Normalize all bindings in an object
  function normalizeBindings(bindings) {
    const result = {};
    for (const [action, val] of Object.entries(bindings)) {
      result[action] = normalizeBinding(val);
    }
    return result;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // State
  let profiles = {};
  let activeProfileId = 'default';
  let currentBindings = normalizeBindings({ ...DEFAULT_BINDINGS });
  let listeningButton = null;
  let listeningMode = null; // 'replace' or 'add'
  let gameProfiles = {};
  let macros = {};
  let currentMacroId = null;
  let waitingForTriggerKey = false;
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
      const binding = currentBindings[action];
      if (binding) {
        const keys = normalizeBinding(binding);
        if (keys.length === 0) {
          btn.innerHTML = '<span class="add-key">+ Add</span>';
        } else {
          btn.innerHTML = keys.map(k =>
            `<span class="key-chip">${escapeHtml(keyCodeToDisplayName(k))}<button type="button" class="remove-key" data-key="${escapeHtml(k)}" data-action="${action}" title="Remove this key">&times;</button></span>`
          ).join('') + '<span class="add-key" data-action="' + action + '" title="Add another key">+</span>';
        }
      }
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.key-bind-btn .remove-key').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.dataset.action;
        const keyToRemove = this.dataset.key;
        removeKeyFromBinding(action, keyToRemove);
      });
    });

    // Add event listeners for add buttons
    document.querySelectorAll('.key-bind-btn .add-key').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.closest('.key-bind-btn').dataset.action;
        startListening(this.closest('.key-bind-btn'), 'add');
      });
    });
  }

  // Remove a specific key from a binding
  function removeKeyFromBinding(action, keyToRemove) {
    const keys = normalizeBinding(currentBindings[action]);
    const newKeys = keys.filter(k => k !== keyToRemove);
    currentBindings[action] = newKeys.length > 0 ? newKeys : [];
    updateBindingDisplays();
    saveCurrentProfile();
    announceToScreenReader(`Removed ${keyCodeToDisplayName(keyToRemove)} from ${getMessage(action) || action}`);
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

    // Normalize bindings to array format for backwards compatibility
    const profileBindings = profile.keyBindings || {};
    currentBindings = normalizeBindings({ ...DEFAULT_BINDINGS, ...profileBindings });
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
      if (config.showOverlay !== undefined && showOverlayCheckbox) {
        showOverlayCheckbox.checked = config.showOverlay;
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

      // Ensure all profiles have keyBindings (fix for legacy data)
      for (const profileId of Object.keys(profiles)) {
        if (!profiles[profileId].keyBindings) {
          profiles[profileId].keyBindings = { ...DEFAULT_BINDINGS };
        }
      }

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

  // Overlay toggle
  if (showOverlayCheckbox) {
    showOverlayCheckbox.addEventListener('change', function() {
      const config = { showOverlay: this.checked };
      chrome.storage.sync.set({ config: { ...config } });

      // Notify content script to toggle overlay
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'CONFIG_UPDATE',
            config: { showOverlay: showOverlayCheckbox.checked }
          }).catch(() => {});
        }
      });

      announceToScreenReader(`Overlay ${this.checked ? 'shown' : 'hidden'}`);
    });
  }

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
    const newProfileId = this.value;

    // Reload profiles from storage to ensure we have latest data
    chrome.storage.sync.get(['profiles'], function(result) {
      if (result.profiles) {
        profiles = result.profiles;
      }

      activeProfileId = newProfileId;
      chrome.storage.sync.set({ activeProfileId });

      // Ensure profile has keyBindings (fix for legacy data)
      if (profiles[activeProfileId] && !profiles[activeProfileId].keyBindings) {
        profiles[activeProfileId].keyBindings = { ...DEFAULT_BINDINGS };
      }

      loadProfileIntoUI(profiles[activeProfileId]);

      // Notify background to update content scripts
      chrome.runtime.sendMessage({
        type: 'SET_ACTIVE_PROFILE',
        profileId: activeProfileId
      });

      announceToScreenReader(getMessage('switchedToProfile', [profiles[activeProfileId].name]));
    });
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

        // Create new profile with imported data (normalize bindings for backwards compatibility)
        const profileId = 'imported_' + Date.now();
        const importedBindings = importData.keyBindings || {};
        const newProfile = {
          id: profileId,
          name: importData.name,
          keyBindings: normalizeBindings({ ...DEFAULT_BINDINGS, ...importedBindings }),
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
  function startListening(button, mode = 'replace') {
    if (listeningButton) {
      listeningButton.classList.remove('listening');
      updateBindingDisplays();
    }

    listeningButton = button;
    listeningMode = mode;
    button.classList.add('listening');
    button.innerHTML = `<span class="listening-text">${getMessage('pressKey')}</span>`;
    button.setAttribute('aria-label', getMessage('listeningForKey'));
    announceToScreenReader(getMessage('pressKeyOrMouse'));
  }

  function stopListening(newCode = null) {
    if (!listeningButton) return;

    const action = listeningButton.dataset.action;
    const actionName = getMessage(action) || action;

    if (newCode) {
      const currentKeys = normalizeBinding(currentBindings[action]);

      if (listeningMode === 'add') {
        // Add key if not already bound to this action
        if (!currentKeys.includes(newCode)) {
          currentBindings[action] = [...currentKeys, newCode];
          announceToScreenReader(`Added ${keyCodeToDisplayName(newCode)} to ${actionName}`);
        }
      } else {
        // Replace mode - set only this key
        currentBindings[action] = [newCode];
        announceToScreenReader(getMessage('boundTo', [actionName, keyCodeToDisplayName(newCode)]));
      }
      saveCurrentProfile();
    }

    listeningButton.classList.remove('listening');
    listeningButton = null;
    listeningMode = null;
    updateBindingDisplays();
  }

  keyBindButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Don't start listening if clicking on remove or add buttons (handled separately)
      if (e.target.classList.contains('remove-key') || e.target.classList.contains('add-key')) {
        return;
      }
      if (listeningButton === this) {
        stopListening();
      } else {
        // Clicking on a key-chip or the button starts replace mode
        startListening(this, 'replace');
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
    currentBindings = normalizeBindings({ ...DEFAULT_BINDINGS });
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

  // ============================================
  // MACRO FUNCTIONALITY
  // ============================================

  // Update macro list display
  function updateMacroList() {
    const macroIds = Object.keys(macros);

    if (macroIds.length === 0) {
      macroEmpty.style.display = 'block';
      // Clear any existing macro items
      const existingItems = macroList.querySelectorAll('.macro-item');
      existingItems.forEach(item => item.remove());
      return;
    }

    macroEmpty.style.display = 'none';

    // Clear and rebuild
    const existingItems = macroList.querySelectorAll('.macro-item');
    existingItems.forEach(item => item.remove());

    for (const macro of Object.values(macros)) {
      const item = document.createElement('div');
      item.className = 'macro-item';
      item.dataset.macroId = macro.id;

      const actionCount = macro.actions ? macro.actions.length : 0;
      const duration = macro.actions && macro.actions.length > 0
        ? Math.round(macro.actions[macro.actions.length - 1].delay / 100) / 10
        : 0;

      item.innerHTML = `
        <div class="macro-info">
          <div class="macro-name">${escapeHtml(macro.name)}</div>
          <div class="macro-details">${actionCount} actions, ${duration}s</div>
        </div>
        <button class="macro-trigger" data-macro-id="${macro.id}" title="${getMessage('changeTrigger')}">${keyCodeToDisplayName(macro.triggerKey) || '?'}</button>
        <div class="macro-actions">
          <button class="macro-btn play-btn" data-macro-id="${macro.id}" title="${getMessage('playMacro')}">▶</button>
          <button class="macro-btn danger delete-btn" data-macro-id="${macro.id}" title="${getMessage('deleteMacro')}">×</button>
        </div>
      `;

      macroList.appendChild(item);
    }

    // Add event listeners to new buttons
    macroList.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const macroId = this.dataset.macroId;
        playMacro(macroId);
      });
    });

    macroList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const macroId = this.dataset.macroId;
        deleteMacro(macroId);
      });
    });

    macroList.querySelectorAll('.macro-trigger').forEach(btn => {
      btn.addEventListener('click', function() {
        const macroId = this.dataset.macroId;
        reassignTriggerKey(macroId, this);
      });
    });
  }

  // Load macros from storage
  function loadMacros() {
    chrome.storage.sync.get(['macros'], function(result) {
      macros = result.macros || {};
      updateMacroList();

      // Send macros to content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'LOAD_MACROS',
            macros: macros
          }).catch(() => {});
        }
      });
    });
  }

  // Save macros to storage
  function saveMacros() {
    chrome.storage.sync.set({ macros }, function() {
      console.log('Macros saved:', Object.keys(macros).length);
    });
  }

  // Play macro via content script
  function playMacro(macroId) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'PLAY_MACRO',
          macroId: macroId
        }).catch(() => {});
      }
    });
    announceToScreenReader(getMessage('macroPlaying'));
  }

  // Delete macro
  function deleteMacro(macroId) {
    const macro = macros[macroId];
    if (!macro) return;

    if (confirm(getMessage('deleteMacroConfirm', [macro.name]))) {
      delete macros[macroId];
      saveMacros();
      updateMacroList();

      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'DELETE_MACRO',
            macroId: macroId
          }).catch(() => {});
        }
      });

      announceToScreenReader(getMessage('macroDeleted'));
    }
  }

  // Reassign trigger key for existing macro
  let reassigningMacroId = null;
  let reassigningButton = null;

  function reassignTriggerKey(macroId, button) {
    reassigningMacroId = macroId;
    reassigningButton = button;
    button.classList.add('listening');
    button.textContent = getMessage('pressKey');
  }

  // New macro button
  if (newMacroBtn) {
    newMacroBtn.addEventListener('click', function() {
      macroModal.classList.add('active');
      macroStep1.style.display = 'block';
      macroStep2.style.display = 'none';
      macroStep3.style.display = 'none';
      macroName.value = '';
      macroName.focus();
    });
  }

  // Cancel macro creation
  if (cancelMacro) {
    cancelMacro.addEventListener('click', function() {
      macroModal.classList.remove('active');
    });
  }

  // Start recording
  if (startRecordingBtn) {
    startRecordingBtn.addEventListener('click', function() {
      const name = macroName.value.trim();
      if (!name) {
        macroName.focus();
        return;
      }

      currentMacroId = 'macro_' + Date.now();

      // Show step 2
      macroStep1.style.display = 'none';
      macroStep2.style.display = 'block';

      // Tell content script to start recording
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'START_MACRO_RECORDING',
            macroId: currentMacroId,
            name: name
          }).catch(() => {});
        }
      });
    });
  }

  // Cancel recording
  if (cancelRecordingBtn) {
    cancelRecordingBtn.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'CANCEL_MACRO_RECORDING'
          }).catch(() => {});
        }
      });
      macroModal.classList.remove('active');
      currentMacroId = null;
    });
  }

  // Stop recording
  if (stopRecordingBtn) {
    stopRecordingBtn.addEventListener('click', function() {
      // Show step 3 to assign trigger key
      macroStep2.style.display = 'none';
      macroStep3.style.display = 'block';
      waitingForTriggerKey = true;
      triggerKeyDisplay.textContent = getMessage('pressKey');
    });
  }

  // Cancel trigger assignment
  if (cancelTriggerBtn) {
    cancelTriggerBtn.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'CANCEL_MACRO_RECORDING'
          }).catch(() => {});
        }
      });
      macroModal.classList.remove('active');
      waitingForTriggerKey = false;
      currentMacroId = null;
    });
  }

  // Listen for trigger key assignment
  document.addEventListener('keydown', function(e) {
    // Handle reassigning existing macro trigger
    if (reassigningMacroId && reassigningButton) {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        reassigningButton.classList.remove('listening');
        reassigningButton.textContent = keyCodeToDisplayName(macros[reassigningMacroId].triggerKey);
        reassigningMacroId = null;
        reassigningButton = null;
        return;
      }

      macros[reassigningMacroId].triggerKey = e.code;
      saveMacros();
      updateMacroList();

      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'LOAD_MACROS',
            macros: macros
          }).catch(() => {});
        }
      });

      reassigningMacroId = null;
      reassigningButton = null;
      return;
    }

    // Handle new macro trigger assignment
    if (!waitingForTriggerKey) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.code === 'Escape') {
      // Cancel
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'CANCEL_MACRO_RECORDING'
          }).catch(() => {});
        }
      });
      macroModal.classList.remove('active');
      waitingForTriggerKey = false;
      currentMacroId = null;
      return;
    }

    // Assign trigger key and save
    triggerKeyDisplay.textContent = keyCodeToDisplayName(e.code);
    waitingForTriggerKey = false;

    // Stop recording with trigger key
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'STOP_MACRO_RECORDING',
          triggerKey: e.code
        }).catch(() => {});
      }
    });
  }, true);

  // Listen for storage changes to detect when macro is recorded
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'sync' && changes.lastRecordedMacroId) {
      // A new macro was recorded
      const macroId = changes.lastRecordedMacroId.newValue;
      if (macroId && changes.macros && changes.macros.newValue[macroId]) {
        macros = changes.macros.newValue;
        updateMacroList();
        macroModal.classList.remove('active');
        currentMacroId = null;
        waitingForTriggerKey = false;
        announceToScreenReader(getMessage('macroSaved'));

        // Clear the lastRecordedMacroId flag
        chrome.storage.sync.remove('lastRecordedMacroId');
      }
    }
  });

  // Click outside macro modal to close
  if (macroModal) {
    macroModal.addEventListener('click', function(e) {
      if (e.target === macroModal) {
        if (currentMacroId) {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'CANCEL_MACRO_RECORDING'
              }).catch(() => {});
            }
          });
        }
        macroModal.classList.remove('active');
        waitingForTriggerKey = false;
        currentMacroId = null;
      }
    });
  }

  // Enter key in macro name input
  if (macroName) {
    macroName.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        startRecordingBtn.click();
      } else if (e.key === 'Escape') {
        macroModal.classList.remove('active');
      }
    });
  }

  // Load macros on startup
  loadMacros();
});
