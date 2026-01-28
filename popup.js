// Popup script - handles settings UI with profiles and accessibility support

document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const sensitivitySlider = document.getElementById('sensitivity');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const invertYCheckbox = document.getElementById('invertY');
  const statusEl = document.getElementById('status');
  const resetBindingsBtn = document.getElementById('resetBindings');
  const keyBindButtons = document.querySelectorAll('.key-bind-btn');

  // Profile elements
  const profileSelect = document.getElementById('profileSelect');
  const newProfileBtn = document.getElementById('newProfileBtn');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');
  const newProfileModal = document.getElementById('newProfileModal');
  const newProfileName = document.getElementById('newProfileName');
  const cancelNewProfile = document.getElementById('cancelNewProfile');
  const createNewProfile = document.getElementById('createNewProfile');

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

    chrome.storage.sync.set({ profiles }, function() {
      console.log('Profile saved:', activeProfileId);
    });

    // Also save to legacy format for backward compatibility
    const config = {
      enabled: enabledCheckbox.checked,
      mouseSensitivity: parseInt(sensitivitySlider.value),
      invertY: invertYCheckbox.checked
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
      updateStatus(true, 'Active on this page');
    } else {
      updateStatus(false, 'Go to xbox.com/play to use');
    }
  });

  // Update status
  function updateStatus(isActive, message) {
    const icon = isActive ? '●' : '○';
    statusEl.innerHTML = `<span aria-hidden="true" class="status-icon">${icon}</span>${message}`;
    statusEl.className = isActive ? 'status active' : 'status';
  }

  // Load initial data
  loadFromStorage();

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

    announceToScreenReader(`Controls ${this.checked ? 'enabled' : 'disabled'}`);
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

    announceToScreenReader(`Switched to ${profiles[activeProfileId].name} profile`);
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
          announceToScreenReader(`Created ${name} profile`);
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
      announceToScreenReader('Cannot delete the default profile');
      return;
    }

    const profileName = profiles[activeProfileId]?.name || activeProfileId;

    if (confirm(`Delete "${profileName}" profile?`)) {
      chrome.runtime.sendMessage({ type: 'DELETE_PROFILE', profileId: activeProfileId }, function(response) {
        if (response.success) {
          chrome.storage.sync.get(['profiles', 'activeProfileId'], function(result) {
            profiles = result.profiles;
            activeProfileId = result.activeProfileId;
            updateProfileDropdown();
            loadProfileIntoUI(profiles[activeProfileId]);
            announceToScreenReader(`Deleted ${profileName} profile`);
          });
        } else {
          announceToScreenReader(response.error || 'Cannot delete this profile');
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
    button.textContent = 'Press key...';
    button.setAttribute('aria-label', 'Listening for key press. Press Escape to cancel.');
    announceToScreenReader('Press a key or mouse button to bind. Press Escape to cancel.');
  }

  function stopListening(newCode = null) {
    if (!listeningButton) return;

    const action = listeningButton.dataset.action;

    if (newCode) {
      currentBindings[action] = newCode;
      saveCurrentProfile();
      announceToScreenReader(`${action} bound to ${keyCodeToDisplayName(newCode)}`);
    }

    listeningButton.classList.remove('listening');
    listeningButton.textContent = keyCodeToDisplayName(currentBindings[action]);
    listeningButton.setAttribute('aria-label', `Change ${action} key binding. Currently ${keyCodeToDisplayName(currentBindings[action])}`);
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
      announceToScreenReader('Key binding cancelled');
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
    announceToScreenReader('All key bindings reset to defaults');
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
