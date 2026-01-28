// Popup script - handles settings UI

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
    }

    if (config.invertY !== undefined) {
      invertYCheckbox.checked = config.invertY;
    }
  });

  // Check if we're on an xCloud page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0]?.url || '';
    if (url.includes('xbox.com') && url.includes('play')) {
      statusEl.textContent = '✓ Active on this page';
      statusEl.classList.add('active');
    }
  });

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
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'CONFIG_UPDATE',
        config: config
      }).catch(() => {
        // Tab might not have content script loaded
      });
    });
  }

  // Event listeners
  enabledCheckbox.addEventListener('change', saveConfig);

  sensitivitySlider.addEventListener('input', function() {
    sensitivityValue.textContent = this.value;
  });

  sensitivitySlider.addEventListener('change', saveConfig);

  invertYCheckbox.addEventListener('change', saveConfig);
});
