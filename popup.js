// Popup script - handles settings UI with accessibility support

document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const sensitivitySlider = document.getElementById('sensitivity');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const invertYCheckbox = document.getElementById('invertY');
  const statusEl = document.getElementById('status');
  const resetBindingsBtn = document.getElementById('resetBindings');
  const keyBindButtons = document.querySelectorAll('.key-bind-btn');

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

  // Current bindings (will be loaded from storage)
  let currentBindings = { ...DEFAULT_BINDINGS };

  // Currently listening button (if any)
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

  // Load saved settings
  chrome.storage.sync.get(['config', 'keyBindings'], function(result) {
    const config = result.config || {};

    if (config.enabled !== undefined) {
      enabledCheckbox.checked = config.enabled;
    }

    if (config.mouseSensitivity !== undefined) {
      sensitivitySlider.value = config.mouseSensitivity;
      sensitivityValue.textContent = config.mouseSensitivity;
      sensitivitySlider.setAttribute('aria-valuenow', config.mouseSensitivity);
    }

    if (config.invertY !== undefined) {
      invertYCheckbox.checked = config.invertY;
    }

    // Load key bindings
    if (result.keyBindings) {
      currentBindings = { ...DEFAULT_BINDINGS, ...result.keyBindings };
    }
    updateBindingDisplays();
  });

  // Check if we're on an xCloud page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0]?.url || '';
    if (url.includes('xbox.com') && url.includes('play')) {
      updateStatus(true, 'Active on this page');
    } else {
      updateStatus(false, 'Go to xbox.com/play to use');
    }
  });

  // Update status with screen reader announcement
  function updateStatus(isActive, message) {
    const icon = isActive ? '●' : '○';
    statusEl.innerHTML = `<span aria-hidden="true" class="status-icon">${icon}</span>${message}`;
    statusEl.className = isActive ? 'status active' : 'status';
  }

  // Save settings
  function saveConfig() {
    const config = {
      enabled: enabledCheckbox.checked,
      mouseSensitivity: parseInt(sensitivitySlider.value),
      invertY: invertYCheckbox.checked
    };

    chrome.storage.sync.set({ config: config, keyBindings: currentBindings }, function() {
      console.log('Config saved:', config, 'Bindings:', currentBindings);
    });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'CONFIG_UPDATE',
          config: config,
          keyBindings: currentBindings
        }).catch(() => {
          // Tab might not have content script loaded
        });
      }
    });
  }

  // Event listeners for settings
  enabledCheckbox.addEventListener('change', function() {
    saveConfig();
    const state = this.checked ? 'enabled' : 'disabled';
    announceToScreenReader(`Controls ${state}`);
  });

  sensitivitySlider.addEventListener('input', function() {
    sensitivityValue.textContent = this.value;
    this.setAttribute('aria-valuenow', this.value);
  });

  sensitivitySlider.addEventListener('change', function() {
    saveConfig();
    announceToScreenReader(`Sensitivity set to ${this.value}`);
  });

  invertYCheckbox.addEventListener('change', function() {
    saveConfig();
    const state = this.checked ? 'enabled' : 'disabled';
    announceToScreenReader(`Invert Y axis ${state}`);
  });

  // Key binding functionality
  function startListening(button) {
    // Cancel any previous listening
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
      saveConfig();
      announceToScreenReader(`${action} bound to ${keyCodeToDisplayName(newCode)}`);
    }

    listeningButton.classList.remove('listening');
    listeningButton.textContent = keyCodeToDisplayName(currentBindings[action]);
    listeningButton.setAttribute('aria-label', `Change ${action} key binding. Currently ${keyCodeToDisplayName(currentBindings[action])}`);
    listeningButton = null;
  }

  // Click handler for binding buttons
  keyBindButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      if (listeningButton === this) {
        // Clicking same button cancels
        stopListening();
      } else {
        startListening(this);
      }
    });
  });

  // Keyboard listener for key binding
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

  // Mouse listener for key binding
  document.addEventListener('mousedown', function(e) {
    if (!listeningButton) return;

    // Don't capture left clicks on the button itself (that's for starting/stopping)
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

  // Prevent context menu when binding right click
  document.addEventListener('contextmenu', function(e) {
    if (listeningButton) {
      e.preventDefault();
    }
  });

  // Reset bindings button
  resetBindingsBtn.addEventListener('click', function() {
    currentBindings = { ...DEFAULT_BINDINGS };
    updateBindingDisplays();
    saveConfig();
    announceToScreenReader('All key bindings reset to defaults');
  });

  // Announce messages to screen readers
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
      if (listeningButton) return; // Don't scroll while listening

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
