// Preset Library JavaScript
// Handles loading presets, search/filter, and extension communication

(function() {
  'use strict';

  // Extension ID - update this after publishing
  const EXTENSION_ID = null; // Set to actual ID after publishing, or null for same-origin

  let presets = [];
  let filteredPresets = [];
  let selectedPreset = null;
  let extensionInstalled = false;

  // DOM Elements
  const presetsGrid = document.getElementById('presetsGrid');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.getElementById('filterButtons');
  const extensionNotice = document.getElementById('extensionNotice');

  // Modal elements
  const presetModal = document.getElementById('presetModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalAuthor = document.getElementById('modalAuthor');
  const modalCategory = document.getElementById('modalCategory');
  const modalDescription = document.getElementById('modalDescription');
  const modalSensitivity = document.getElementById('modalSensitivity');
  const modalCurve = document.getElementById('modalCurve');
  const modalDeadzone = document.getElementById('modalDeadzone');
  const modalBindings = document.getElementById('modalBindings');
  const modalClose = document.getElementById('modalClose');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalInstallBtn = document.getElementById('modalInstallBtn');

  // Key code to display name mapping
  const KEY_DISPLAY_NAMES = {
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
    'Tab': 'Tab', 'Escape': 'Esc', 'Enter': 'Enter',
    'MouseLeft': 'Left Click', 'MouseRight': 'Right Click', 'MouseMiddle': 'Middle Click',
    'MouseButton4': 'Mouse 4', 'MouseButton5': 'Mouse 5',
    'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right'
  };

  // Action names for display
  const ACTION_NAMES = {
    moveForward: 'Move Forward',
    moveBackward: 'Move Back',
    moveLeft: 'Move Left',
    moveRight: 'Move Right',
    actionA: 'A Button',
    actionB: 'B Button',
    actionX: 'X Button',
    actionY: 'Y Button',
    leftBumper: 'Left Bumper',
    rightBumper: 'Right Bumper',
    leftTrigger: 'Left Trigger',
    rightTrigger: 'Right Trigger',
    dpadUp: 'D-Pad Up',
    dpadDown: 'D-Pad Down',
    dpadLeft: 'D-Pad Left',
    dpadRight: 'D-Pad Right',
    view: 'View',
    menu: 'Menu',
    leftStickClick: 'L-Stick Click',
    rightStickClick: 'R-Stick Click'
  };

  // Check if extension is installed
  async function checkExtensionInstalled() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      return false;
    }

    try {
      // Try to communicate with the extension
      return new Promise((resolve) => {
        if (EXTENSION_ID) {
          chrome.runtime.sendMessage(EXTENSION_ID, { type: 'CHECK_INSTALLED' }, (response) => {
            if (chrome.runtime.lastError) {
              resolve(false);
            } else {
              resolve(response && response.installed);
            }
          });
        } else {
          // No extension ID set, assume not installed
          resolve(false);
        }
      });
    } catch (e) {
      return false;
    }
  }

  // Load presets from JSON file
  async function loadPresets() {
    try {
      const response = await fetch('presets.json');
      if (!response.ok) throw new Error('Failed to load presets');
      const data = await response.json();
      presets = data.presets || [];
      filteredPresets = [...presets];
      renderPresets();
    } catch (error) {
      console.error('Error loading presets:', error);
      presetsGrid.innerHTML = `
        <div class="empty-state">
          <p>Failed to load presets. Please try again later.</p>
        </div>
      `;
    }
  }

  // Filter presets by search and category
  function filterPresets(searchTerm = '', category = 'all') {
    const term = searchTerm.toLowerCase().trim();

    filteredPresets = presets.filter(preset => {
      // Category filter
      if (category !== 'all' && preset.category !== category) {
        return false;
      }

      // Search filter
      if (term) {
        const searchable = [
          preset.name,
          preset.description,
          preset.author,
          ...(preset.tags || [])
        ].join(' ').toLowerCase();

        return searchable.includes(term);
      }

      return true;
    });

    renderPresets();
  }

  // Render preset cards
  function renderPresets() {
    if (filteredPresets.length === 0) {
      presetsGrid.innerHTML = `
        <div class="empty-state">
          <p>No presets found matching your criteria.</p>
        </div>
      `;
      return;
    }

    presetsGrid.innerHTML = filteredPresets.map(preset => `
      <div class="preset-card" data-preset-id="${escapeHtml(preset.id)}">
        <div class="preset-card-header">
          <h3>${escapeHtml(preset.name)}</h3>
          <div class="preset-meta">
            <span class="preset-author">by ${escapeHtml(preset.author)}</span>
            <span class="preset-category">${escapeHtml(preset.category)}</span>
          </div>
        </div>
        <div class="preset-card-body">
          <p>${escapeHtml(preset.description)}</p>
          ${preset.tags && preset.tags.length > 0 ? `
            <div class="preset-tags">
              ${preset.tags.map(tag => `<span class="preset-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="preset-card-footer">
          <button class="btn btn-secondary btn-small view-btn" data-preset-id="${escapeHtml(preset.id)}">View Details</button>
          <button class="btn btn-primary btn-small install-btn" data-preset-id="${escapeHtml(preset.id)}" ${!extensionInstalled ? 'disabled title="Extension not installed"' : ''}>Install</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => openPresetModal(btn.dataset.presetId));
    });

    document.querySelectorAll('.install-btn').forEach(btn => {
      btn.addEventListener('click', () => installPreset(btn.dataset.presetId));
    });
  }

  // Open preset detail modal
  function openPresetModal(presetId) {
    selectedPreset = presets.find(p => p.id === presetId);
    if (!selectedPreset) return;

    const profile = selectedPreset.profile || {};
    const bindings = profile.keyBindings || {};

    modalTitle.textContent = selectedPreset.name;
    modalAuthor.textContent = `by ${selectedPreset.author}`;
    modalCategory.textContent = selectedPreset.category;
    modalDescription.textContent = selectedPreset.description;

    // Settings
    modalSensitivity.textContent = profile.mouseSensitivity || 5;
    modalCurve.textContent = formatCurve(profile.sensitivityCurve || 'linear');
    modalDeadzone.textContent = `${profile.deadzone || 5}%`;

    // Key bindings
    modalBindings.innerHTML = Object.entries(bindings).map(([action, keys]) => {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      const displayKeys = keyArray.map(k => KEY_DISPLAY_NAMES[k] || k).join(', ');
      return `
        <tr>
          <td>${ACTION_NAMES[action] || action}</td>
          <td class="key">${escapeHtml(displayKeys)}</td>
        </tr>
      `;
    }).join('');

    modalInstallBtn.disabled = !extensionInstalled;

    presetModal.classList.add('active');
  }

  // Close modal
  function closeModal() {
    presetModal.classList.remove('active');
    selectedPreset = null;
  }

  // Install preset
  async function installPreset(presetId) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    if (!extensionInstalled) {
      alert('Please install the extension first to install presets.');
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'INSTALL_PRESET',
          preset: preset
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Installation failed'));
          }
        });
      });

      alert(`Preset "${preset.name}" installed successfully! Open the extension popup to see it.`);
      closeModal();
    } catch (error) {
      console.error('Install error:', error);
      alert(`Failed to install preset: ${error.message}`);
    }
  }

  // Format curve name for display
  function formatCurve(curve) {
    switch (curve) {
      case 'exponential': return 'Exponential';
      case 'sCurve': return 'S-Curve';
      case 'linear':
      default: return 'Linear';
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize
  async function init() {
    // Check extension
    extensionInstalled = await checkExtensionInstalled();
    if (!extensionInstalled) {
      extensionNotice.style.display = 'block';
    }

    // Load presets
    await loadPresets();

    // Search handler
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
        filterPresets(e.target.value, activeCategory);
      }, 300);
    });

    // Filter button handlers
    filterButtons.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        filterPresets(searchInput.value, e.target.dataset.category);
      }
    });

    // Modal handlers
    modalClose.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalInstallBtn.addEventListener('click', () => {
      if (selectedPreset) {
        installPreset(selectedPreset.id);
      }
    });

    // Close modal on overlay click
    presetModal.addEventListener('click', (e) => {
      if (e.target === presetModal) {
        closeModal();
      }
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && presetModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Start
  init();
})();
