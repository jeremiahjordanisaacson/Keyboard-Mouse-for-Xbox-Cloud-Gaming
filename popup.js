// Popup script - handles settings UI with accessibility support

document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const sensitivitySlider = document.getElementById('sensitivity');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const invertYCheckbox = document.getElementById('invertY');
  const statusEl = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['config'], function(result) {
    const config = result.config || {};

    if (config.enabled !== undefined) {
      enabledCheckbox.checked = config.enabled;
    }

    if (config.mouseSensitivity !== undefined) {
      sensitivitySlider.value = config.mouseSensitivity;
      sensitivityValue.textContent = config.mouseSensitivity;
      // Update ARIA attributes
      sensitivitySlider.setAttribute('aria-valuenow', config.mouseSensitivity);
    }

    if (config.invertY !== undefined) {
      invertYCheckbox.checked = config.invertY;
    }
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

    // The aria-live="polite" on the status element will announce changes to screen readers
  }

  // Save settings on change
  function saveConfig() {
    const config = {
      enabled: enabledCheckbox.checked,
      mouseSensitivity: parseInt(sensitivitySlider.value),
      invertY: invertYCheckbox.checked
    };

    chrome.storage.sync.set({ config: config }, function() {
      console.log('Config saved:', config);
    });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'CONFIG_UPDATE',
          config: config
        }).catch(() => {
          // Tab might not have content script loaded - this is expected on non-Xbox pages
        });
      }
    });
  }

  // Event listeners
  enabledCheckbox.addEventListener('change', function() {
    saveConfig();
    // Announce state change to screen readers
    const state = this.checked ? 'enabled' : 'disabled';
    announceToScreenReader(`Controls ${state}`);
  });

  sensitivitySlider.addEventListener('input', function() {
    sensitivityValue.textContent = this.value;
    // Update ARIA attribute for screen readers
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

  // Announce messages to screen readers without visual change
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Keyboard navigation enhancement for the scrollable key bindings
  const keyBindings = document.querySelector('.key-bindings');
  if (keyBindings) {
    keyBindings.addEventListener('keydown', function(e) {
      const scrollAmount = 40;
      if (e.key === 'ArrowDown') {
        this.scrollTop += scrollAmount;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        this.scrollTop -= scrollAmount;
        e.preventDefault();
      } else if (e.key === 'Home') {
        this.scrollTop = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        this.scrollTop = this.scrollHeight;
        e.preventDefault();
      }
    });
  }
});
