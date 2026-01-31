// Injected script - runs in the page's main world
// Creates virtual gamepad and captures keyboard/mouse input

(function() {
  'use strict';

  console.log('[XCloud KB+M] Initializing virtual gamepad...');

  // ============================================
  // DEFAULT CONFIGURATION
  // ============================================
  const DEFAULT_CONFIG = {
    enabled: true,
    mouseSensitivity: 5,
    invertY: false,
    sensitivityCurve: 'linear',
    deadzone: 5,
    keyBindings: {
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
    }
  };

  // ============================================
  // MULTI-KEY BINDING HELPERS
  // ============================================
  // Normalize binding to array format (backwards compatibility)
  function normalizeBinding(binding) {
    if (Array.isArray(binding)) return binding;
    if (typeof binding === 'string') return [binding];
    return [];
  }

  // Check if a key is bound to any action
  function isKeyBound(bindings, key) {
    return Object.values(bindings).some(val => {
      const keys = normalizeBinding(val);
      return keys.includes(key);
    });
  }

  // Check if any key in a binding is pressed
  function isBindingPressed(binding, keyState) {
    const keys = normalizeBinding(binding);
    return keys.some(k => keyState[k]);
  }

  // ============================================
  // SENSITIVITY CURVES
  // ============================================
  // Apply sensitivity curve to input value (-1 to 1)
  function applySensitivityCurve(value, curveType) {
    const sign = value < 0 ? -1 : 1;
    const absValue = Math.abs(value);

    switch (curveType) {
      case 'exponential':
        // Quadratic curve - more precision at low speeds
        return sign * (absValue * absValue);

      case 'sCurve':
        // S-curve (smoothstep) - smooth acceleration/deceleration
        // Uses smoothstep formula: 3x^2 - 2x^3
        return sign * (absValue * absValue * (3 - 2 * absValue));

      case 'linear':
      default:
        // Linear - direct 1:1 mapping
        return value;
    }
  }

  // Apply deadzone to stick input
  function applyDeadzone(x, y, deadzonePercent) {
    const deadzone = deadzonePercent / 100;
    const magnitude = Math.sqrt(x * x + y * y);

    if (magnitude < deadzone) {
      return { x: 0, y: 0 };
    }

    // Rescale from deadzone to 1.0
    const scale = (magnitude - deadzone) / (1 - deadzone);
    const normalizedX = x / magnitude;
    const normalizedY = y / magnitude;

    return {
      x: normalizedX * scale,
      y: normalizedY * scale
    };
  }

  let config = { ...DEFAULT_CONFIG };

  // ============================================
  // MACRO SYSTEM
  // ============================================
  const macroState = {
    recording: false,
    recordingMacroId: null,
    recordingStartTime: 0,
    recordingActions: [],
    playing: false,
    playingMacroId: null,
    macros: {}  // { macroId: { name, triggerKey, actions: [{ type, button, delay }] } }
  };

  // Button name to index mapping for macros
  const BUTTON_NAMES = {
    'A': 0, 'B': 1, 'X': 2, 'Y': 3,
    'LB': 4, 'RB': 5, 'LT': 6, 'RT': 7,
    'View': 8, 'Menu': 9,
    'LS': 10, 'RS': 11,
    'DPadUp': 12, 'DPadDown': 13, 'DPadLeft': 14, 'DPadRight': 15
  };

  // Action name to button name mapping
  const ACTION_TO_BUTTON = {
    'actionA': 'A', 'actionB': 'B', 'actionX': 'X', 'actionY': 'Y',
    'leftBumper': 'LB', 'rightBumper': 'RB',
    'leftTrigger': 'LT', 'rightTrigger': 'RT',
    'view': 'View', 'menu': 'Menu',
    'leftStickClick': 'LS', 'rightStickClick': 'RS',
    'dpadUp': 'DPadUp', 'dpadDown': 'DPadDown',
    'dpadLeft': 'DPadLeft', 'dpadRight': 'DPadRight'
  };

  // Start recording a macro
  function startMacroRecording(macroId, name) {
    macroState.recording = true;
    macroState.recordingMacroId = macroId;
    macroState.recordingStartTime = performance.now();
    macroState.recordingActions = [];
    console.log('[XCloud KB+M] Macro recording started:', name);

    // Notify overlay
    updateOverlay();
  }

  // Stop recording and save macro
  function stopMacroRecording(triggerKey) {
    if (!macroState.recording) return null;

    const macroId = macroState.recordingMacroId;
    const actions = macroState.recordingActions;

    macroState.recording = false;
    macroState.recordingMacroId = null;
    macroState.recordingActions = [];

    if (actions.length === 0) {
      console.log('[XCloud KB+M] Macro recording cancelled - no actions');
      return null;
    }

    // Normalize delays (make first action delay 0)
    if (actions.length > 0) {
      const firstDelay = actions[0].delay;
      actions.forEach(a => a.delay -= firstDelay);
    }

    const macro = {
      id: macroId,
      name: macroState.macros[macroId]?.name || 'Macro',
      triggerKey: triggerKey,
      actions: actions
    };

    macroState.macros[macroId] = macro;
    console.log('[XCloud KB+M] Macro saved:', macro.name, 'with', actions.length, 'actions');

    updateOverlay();
    return macro;
  }

  // Cancel recording without saving
  function cancelMacroRecording() {
    macroState.recording = false;
    macroState.recordingMacroId = null;
    macroState.recordingActions = [];
    console.log('[XCloud KB+M] Macro recording cancelled');
    updateOverlay();
  }

  // Record a button action during recording
  function recordMacroAction(actionType, buttonName) {
    if (!macroState.recording) return;

    const delay = performance.now() - macroState.recordingStartTime;
    macroState.recordingActions.push({
      type: actionType,  // 'press' or 'release'
      button: buttonName,
      delay: Math.round(delay)
    });
  }

  // Play a macro
  function playMacro(macroId) {
    const macro = macroState.macros[macroId];
    if (!macro || macroState.playing) return;

    macroState.playing = true;
    macroState.playingMacroId = macroId;
    console.log('[XCloud KB+M] Playing macro:', macro.name);

    // Schedule all actions
    macro.actions.forEach(action => {
      setTimeout(() => {
        if (!macroState.playing) return;  // Macro was cancelled

        const buttonIndex = BUTTON_NAMES[action.button];
        if (buttonIndex !== undefined) {
          if (action.type === 'press') {
            virtualGamepad.buttons[buttonIndex].pressed = true;
            virtualGamepad.buttons[buttonIndex].touched = true;
            virtualGamepad.buttons[buttonIndex].value = 1;
          } else {
            virtualGamepad.buttons[buttonIndex].pressed = false;
            virtualGamepad.buttons[buttonIndex].touched = false;
            virtualGamepad.buttons[buttonIndex].value = 0;
          }
        }
      }, action.delay);
    });

    // End playback after last action + small buffer
    const lastDelay = macro.actions.length > 0 ? macro.actions[macro.actions.length - 1].delay : 0;
    setTimeout(() => {
      macroState.playing = false;
      macroState.playingMacroId = null;
      console.log('[XCloud KB+M] Macro playback complete');
    }, lastDelay + 50);
  }

  // Stop macro playback
  function stopMacroPlayback() {
    macroState.playing = false;
    macroState.playingMacroId = null;
  }

  // Check if a key triggers a macro
  function checkMacroTrigger(keyCode) {
    for (const macro of Object.values(macroState.macros)) {
      if (macro.triggerKey === keyCode) {
        playMacro(macro.id);
        return true;
      }
    }
    return false;
  }

  // Delete a macro
  function deleteMacro(macroId) {
    delete macroState.macros[macroId];
    console.log('[XCloud KB+M] Macro deleted:', macroId);
  }

  // ============================================
  // VIRTUAL GAMEPAD
  // ============================================
  const virtualGamepad = {
    id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
    index: 0,
    connected: true,
    timestamp: performance.now(),
    mapping: 'standard',
    axes: [0, 0, 0, 0], // [leftX, leftY, rightX, rightY]
    buttons: [],
    vibrationActuator: null
  };

  // Initialize 17 buttons
  for (let i = 0; i < 17; i++) {
    virtualGamepad.buttons.push({
      pressed: false,
      touched: false,
      value: 0
    });
  }

  // ============================================
  // OVERRIDE NAVIGATOR.GETGAMEPADS
  // ============================================
  const originalGetGamepads = navigator.getGamepads.bind(navigator);

  navigator.getGamepads = function() {
    if (!config.enabled) {
      return originalGetGamepads();
    }

    virtualGamepad.timestamp = performance.now();

    // Return virtual gamepad at index 0
    const gamepads = [
      createGamepadSnapshot(),
      null,
      null,
      null
    ];

    return gamepads;
  };

  function createGamepadSnapshot() {
    return {
      id: virtualGamepad.id,
      index: virtualGamepad.index,
      connected: virtualGamepad.connected,
      timestamp: virtualGamepad.timestamp,
      mapping: virtualGamepad.mapping,
      axes: Float64Array.from(virtualGamepad.axes),
      buttons: virtualGamepad.buttons.map(b => Object.freeze({
        pressed: b.pressed,
        touched: b.touched,
        value: b.value
      })),
      vibrationActuator: virtualGamepad.vibrationActuator
    };
  }

  // Dispatch gamepadconnected event
  setTimeout(() => {
    const event = new GamepadEvent('gamepadconnected', {
      gamepad: createGamepadSnapshot()
    });
    window.dispatchEvent(event);
    console.log('[XCloud KB+M] Virtual gamepad connected!');
  }, 100);

  // ============================================
  // INPUT STATE
  // ============================================
  const keyState = {};
  const mouseState = { x: 0, y: 0, locked: false };

  // Mobile/tablet detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasPointerLock = 'pointerLockElement' in document;

  if (isMobile) {
    console.log('[XCloud KB+M] Mobile device detected - touch/BT keyboard+mouse mode');
  }

  // Button indices
  const BUTTONS = {
    A: 0, B: 1, X: 2, Y: 3,
    LB: 4, RB: 5, LT: 6, RT: 7,
    VIEW: 8, MENU: 9,
    LS: 10, RS: 11,
    DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15
  };

  // ============================================
  // KEYBOARD INPUT
  // ============================================
  function handleKeyDown(e) {
    if (!config.enabled) return;

    const key = e.code;
    const bindings = config.keyBindings;

    // Check if this key triggers a macro (unless recording)
    if (!macroState.recording && !isTypingInInput(e.target)) {
      if (checkMacroTrigger(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    // Check if this key is bound
    const isBound = isKeyBound(bindings, key);
    if (isBound && !isTypingInInput(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (keyState[key]) return; // Already pressed
    keyState[key] = true;

    // Record macro action if recording
    if (macroState.recording) {
      // Find which action this key is bound to
      for (const [action, boundKeys] of Object.entries(bindings)) {
        const keys = normalizeBinding(boundKeys);
        if (keys.includes(key) && ACTION_TO_BUTTON[action]) {
          recordMacroAction('press', ACTION_TO_BUTTON[action]);
          break;
        }
      }
    }
  }

  function handleKeyUp(e) {
    if (!config.enabled) return;

    const key = e.code;
    const bindings = config.keyBindings;

    const isBound = isKeyBound(bindings, key);
    if (isBound && !isTypingInInput(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }

    keyState[key] = false;

    // Record macro action if recording
    if (macroState.recording) {
      // Find which action this key is bound to
      for (const [action, boundKeys] of Object.entries(bindings)) {
        const keys = normalizeBinding(boundKeys);
        if (keys.includes(key) && ACTION_TO_BUTTON[action]) {
          recordMacroAction('release', ACTION_TO_BUTTON[action]);
          break;
        }
      }
    }
  }

  function isTypingInInput(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || element.isContentEditable;
  }

  // ============================================
  // MOUSE INPUT
  // ============================================
  function handleMouseMove(e) {
    if (!config.enabled || !mouseState.locked) return;

    const sensitivity = config.mouseSensitivity * 0.002;
    let deltaX = e.movementX * sensitivity;
    let deltaY = e.movementY * sensitivity * (config.invertY ? -1 : 1);

    // Apply sensitivity curve to mouse deltas
    deltaX = applySensitivityCurve(deltaX, config.sensitivityCurve);
    deltaY = applySensitivityCurve(deltaY, config.sensitivityCurve);

    mouseState.x += deltaX;
    mouseState.y += deltaY;

    // Clamp to -1 to 1
    mouseState.x = Math.max(-1, Math.min(1, mouseState.x));
    mouseState.y = Math.max(-1, Math.min(1, mouseState.y));
  }

  function handleMouseDown(e) {
    if (!config.enabled) return;

    // Request pointer lock on left click in game area
    if (e.button === 0 && !mouseState.locked) {
      requestPointerLockOnGameStream(e.target);
    }

    // Handle right click as trigger
    if (e.button === 2) {
      keyState['MouseRight'] = true;
      e.preventDefault();
    }

    // Handle middle click
    if (e.button === 1) {
      keyState['MouseMiddle'] = true;
      e.preventDefault();
    }
  }

  // Unified pointer lock request for both desktop and mobile
  function requestPointerLockOnGameStream(target) {
    if (mouseState.locked) return;

    const isGameStream = target.tagName === 'VIDEO' || target.tagName === 'CANVAS' ||
        target.closest('[data-testid="game-stream"]') ||
        target.closest('.StreamPage') ||
        target.closest('#game-stream') ||
        target.closest('[class*="stream"]');

    if (isGameStream && hasPointerLock) {
      // Use requestPointerLock with unadjustedMovement for better precision (if supported)
      const lockTarget = document.body;
      if (lockTarget.requestPointerLock) {
        try {
          // Try with unadjustedMovement first (better for games)
          lockTarget.requestPointerLock({ unadjustedMovement: true }).catch(() => {
            // Fallback to standard pointer lock
            lockTarget.requestPointerLock();
          });
        } catch (e) {
          // Old API doesn't return promise
          lockTarget.requestPointerLock();
        }
      }
    }
  }

  // Touch event handler for mobile pointer lock
  function handleTouchStart(e) {
    if (!config.enabled || !isMobile) return;

    const touch = e.touches[0];
    if (touch) {
      requestPointerLockOnGameStream(touch.target);
    }
  }

  function handleMouseUp(e) {
    if (e.button === 2) {
      keyState['MouseRight'] = false;
    }
    if (e.button === 1) {
      keyState['MouseMiddle'] = false;
    }
  }

  function handlePointerLockChange() {
    mouseState.locked = document.pointerLockElement !== null;
    if (!mouseState.locked) {
      mouseState.x = 0;
      mouseState.y = 0;
    }
    console.log('[XCloud KB+M] Pointer lock:', mouseState.locked ? 'ACTIVE' : 'INACTIVE');
  }

  // Prevent context menu
  function handleContextMenu(e) {
    if (config.enabled) {
      const rtKeys = normalizeBinding(config.keyBindings.rightTrigger);
      if (rtKeys.includes('MouseRight')) {
        e.preventDefault();
      }
    }
  }

  // ============================================
  // UPDATE GAMEPAD STATE
  // ============================================
  function updateGamepad() {
    if (!config.enabled) {
      requestAnimationFrame(updateGamepad);
      return;
    }

    const bindings = config.keyBindings;

    // Helper to check if any bound key is pressed
    const isPressed = (binding) => isBindingPressed(binding, keyState);

    // Update face buttons
    setButton(BUTTONS.A, isPressed(bindings.actionA));
    setButton(BUTTONS.B, isPressed(bindings.actionB));
    setButton(BUTTONS.X, isPressed(bindings.actionX));
    setButton(BUTTONS.Y, isPressed(bindings.actionY));

    // Update bumpers and triggers
    setButton(BUTTONS.LB, isPressed(bindings.leftBumper));
    setButton(BUTTONS.RB, isPressed(bindings.rightBumper));
    setButton(BUTTONS.LT, isPressed(bindings.leftTrigger));
    setButton(BUTTONS.RT, isPressed(bindings.rightTrigger));

    // Update special buttons
    setButton(BUTTONS.VIEW, isPressed(bindings.view));
    setButton(BUTTONS.MENU, isPressed(bindings.menu));
    setButton(BUTTONS.LS, isPressed(bindings.leftStickClick));
    setButton(BUTTONS.RS, isPressed(bindings.rightStickClick));

    // Update D-pad
    setButton(BUTTONS.DPAD_UP, isPressed(bindings.dpadUp));
    setButton(BUTTONS.DPAD_DOWN, isPressed(bindings.dpadDown));
    setButton(BUTTONS.DPAD_LEFT, isPressed(bindings.dpadLeft));
    setButton(BUTTONS.DPAD_RIGHT, isPressed(bindings.dpadRight));

    // Update left stick (WASD) - check all bound keys
    let leftX = 0, leftY = 0;
    if (isPressed(bindings.moveLeft)) leftX -= 1;
    if (isPressed(bindings.moveRight)) leftX += 1;
    if (isPressed(bindings.moveForward)) leftY -= 1;
    if (isPressed(bindings.moveBackward)) leftY += 1;

    // Normalize diagonal movement
    const magnitude = Math.sqrt(leftX * leftX + leftY * leftY);
    if (magnitude > 1) {
      leftX /= magnitude;
      leftY /= magnitude;
    }

    virtualGamepad.axes[0] = leftX;
    virtualGamepad.axes[1] = leftY;

    // Update right stick (mouse) with deadzone applied
    const rightStick = applyDeadzone(mouseState.x, mouseState.y, config.deadzone);
    virtualGamepad.axes[2] = rightStick.x;
    virtualGamepad.axes[3] = rightStick.y;

    // Decay mouse position when not moving
    if (!mouseState.locked) {
      mouseState.x *= 0.8;
      mouseState.y *= 0.8;
    } else {
      // Gradual return to center
      mouseState.x *= 0.95;
      mouseState.y *= 0.95;
    }

    virtualGamepad.timestamp = performance.now();
    requestAnimationFrame(updateGamepad);
  }

  function setButton(index, pressed) {
    virtualGamepad.buttons[index].pressed = !!pressed;
    virtualGamepad.buttons[index].touched = !!pressed;
    virtualGamepad.buttons[index].value = pressed ? 1 : 0;
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keyup', handleKeyUp, true);
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('mousedown', handleMouseDown, true);
  document.addEventListener('mouseup', handleMouseUp, true);
  document.addEventListener('contextmenu', handleContextMenu, true);
  document.addEventListener('pointerlockchange', handlePointerLockChange);

  // Mobile touch support for pointer lock
  if (isMobile) {
    document.addEventListener('touchstart', handleTouchStart, true);
  }

  // Start update loop
  requestAnimationFrame(updateGamepad);

  // ============================================
  // ON-SCREEN OVERLAY
  // ============================================
  let overlayState = {
    visible: true,
    minimized: false,
    profileName: 'Default',
    gameName: null,
    position: { x: 20, y: 20 }
  };

  // Create overlay element
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'xcloud-kbm-overlay';
    overlay.innerHTML = `
      <div class="xcloud-kbm-overlay-header">
        <span class="xcloud-kbm-overlay-title">KB+M</span>
        <div class="xcloud-kbm-overlay-controls">
          <button class="xcloud-kbm-overlay-btn minimize" title="Minimize">−</button>
          <button class="xcloud-kbm-overlay-btn close" title="Hide (Alt+Shift+O)">×</button>
        </div>
      </div>
      <div class="xcloud-kbm-overlay-content">
        <div class="xcloud-kbm-overlay-row status-row">
          <span class="xcloud-kbm-overlay-indicator"></span>
          <span class="xcloud-kbm-overlay-status">Enabled</span>
        </div>
        <div class="xcloud-kbm-overlay-row profile-row">
          <span class="xcloud-kbm-overlay-label">Profile:</span>
          <span class="xcloud-kbm-overlay-value profile-name">Default</span>
        </div>
        <div class="xcloud-kbm-overlay-row game-row" style="display:none;">
          <span class="xcloud-kbm-overlay-label">Game:</span>
          <span class="xcloud-kbm-overlay-value game-name"></span>
        </div>
        <div class="xcloud-kbm-overlay-row mouse-row">
          <span class="xcloud-kbm-overlay-label">Mouse:</span>
          <span class="xcloud-kbm-overlay-value mouse-status">Click to lock</span>
        </div>
        <div class="xcloud-kbm-overlay-row macro-row" style="display:none;">
          <span class="xcloud-kbm-overlay-indicator recording"></span>
          <span class="xcloud-kbm-overlay-value macro-status">Recording...</span>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #xcloud-kbm-overlay {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(16, 124, 16, 0.95);
        border: 2px solid #4fbf4f;
        border-radius: 8px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        color: #fff;
        z-index: 999999;
        min-width: 140px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        user-select: none;
        transition: opacity 0.2s, transform 0.2s;
      }
      #xcloud-kbm-overlay.hidden {
        display: none !important;
      }
      #xcloud-kbm-overlay.minimized .xcloud-kbm-overlay-content {
        display: none;
      }
      #xcloud-kbm-overlay.minimized {
        min-width: auto;
      }
      #xcloud-kbm-overlay.disabled {
        background: rgba(80, 80, 80, 0.95);
        border-color: #666;
      }
      #xcloud-kbm-overlay.dragging {
        opacity: 0.8;
        cursor: grabbing;
      }
      .xcloud-kbm-overlay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        cursor: grab;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      #xcloud-kbm-overlay.minimized .xcloud-kbm-overlay-header {
        border-bottom: none;
      }
      .xcloud-kbm-overlay-title {
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .xcloud-kbm-overlay-controls {
        display: flex;
        gap: 4px;
      }
      .xcloud-kbm-overlay-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: #fff;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .xcloud-kbm-overlay-btn:hover {
        background: rgba(255,255,255,0.25);
      }
      .xcloud-kbm-overlay-content {
        padding: 8px 10px;
      }
      .xcloud-kbm-overlay-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }
      .xcloud-kbm-overlay-row:last-child {
        margin-bottom: 0;
      }
      .xcloud-kbm-overlay-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4fbf4f;
        box-shadow: 0 0 6px #4fbf4f;
      }
      #xcloud-kbm-overlay.disabled .xcloud-kbm-overlay-indicator {
        background: #ff6b6b;
        box-shadow: 0 0 6px #ff6b6b;
      }
      .xcloud-kbm-overlay-status {
        font-weight: 500;
      }
      .xcloud-kbm-overlay-label {
        color: rgba(255,255,255,0.7);
        font-size: 11px;
      }
      .xcloud-kbm-overlay-value {
        font-weight: 500;
        font-size: 11px;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .xcloud-kbm-overlay-row.mouse-row .xcloud-kbm-overlay-value {
        color: #ffd700;
      }
      .xcloud-kbm-overlay-row.mouse-row.locked .xcloud-kbm-overlay-value {
        color: #4fbf4f;
      }
      .xcloud-kbm-overlay-indicator.recording {
        background: #ff4444;
        box-shadow: 0 0 6px #ff4444;
        animation: pulse-recording 1s infinite;
      }
      @keyframes pulse-recording {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .xcloud-kbm-overlay-row.macro-row .xcloud-kbm-overlay-value {
        color: #ff4444;
        font-weight: 600;
      }
    `;
    document.head.appendChild(styles);
    document.body.appendChild(overlay);

    // Make draggable
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    const header = overlay.querySelector('.xcloud-kbm-overlay-header');
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('xcloud-kbm-overlay-btn')) return;
      isDragging = true;
      overlay.classList.add('dragging');
      dragOffset.x = e.clientX - overlay.offsetLeft;
      dragOffset.y = e.clientY - overlay.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, e.clientX - dragOffset.x));
      const y = Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, e.clientY - dragOffset.y));
      overlay.style.left = x + 'px';
      overlay.style.top = y + 'px';
      overlayState.position = { x, y };
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      overlay.classList.remove('dragging');
    });

    // Minimize button
    overlay.querySelector('.minimize').addEventListener('click', () => {
      overlayState.minimized = !overlayState.minimized;
      overlay.classList.toggle('minimized', overlayState.minimized);
      overlay.querySelector('.minimize').textContent = overlayState.minimized ? '+' : '−';
    });

    // Close button
    overlay.querySelector('.close').addEventListener('click', () => {
      overlayState.visible = false;
      overlay.classList.add('hidden');
    });

    return overlay;
  }

  // Update overlay content
  function updateOverlay() {
    const overlay = document.getElementById('xcloud-kbm-overlay');
    if (!overlay) return;

    // Update enabled state
    overlay.classList.toggle('disabled', !config.enabled);
    overlay.querySelector('.xcloud-kbm-overlay-status').textContent = config.enabled ? 'Enabled' : 'Disabled';

    // Update profile name
    overlay.querySelector('.profile-name').textContent = overlayState.profileName;

    // Update game name
    const gameRow = overlay.querySelector('.game-row');
    if (overlayState.gameName) {
      gameRow.style.display = 'flex';
      overlay.querySelector('.game-name').textContent = overlayState.gameName;
    } else {
      gameRow.style.display = 'none';
    }

    // Update mouse state
    const mouseRow = overlay.querySelector('.mouse-row');
    mouseRow.classList.toggle('locked', mouseState.locked);
    overlay.querySelector('.mouse-status').textContent = mouseState.locked ? 'Locked' : 'Click to lock';

    // Update macro recording state
    const macroRow = overlay.querySelector('.macro-row');
    if (macroState.recording) {
      macroRow.style.display = 'flex';
      const actionCount = macroState.recordingActions.length;
      overlay.querySelector('.macro-status').textContent = `Recording (${actionCount} actions)`;
    } else {
      macroRow.style.display = 'none';
    }
  }

  // Initialize overlay after DOM is ready
  function initOverlay() {
    if (document.body) {
      createOverlay();
      // Update overlay periodically
      setInterval(updateOverlay, 100);
    } else {
      setTimeout(initOverlay, 100);
    }
  }

  // Toggle overlay visibility (for hotkey)
  function toggleOverlay() {
    const overlay = document.getElementById('xcloud-kbm-overlay');
    if (!overlay) return;
    overlayState.visible = !overlayState.visible;
    overlay.classList.toggle('hidden', !overlayState.visible);
  }

  initOverlay();

  // ============================================
  // CONFIG MANAGEMENT (UPDATED FOR OVERLAY)
  // ============================================
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;

    if (event.data.type === 'XCLOUD_KBM_CONFIG') {
      if (event.data.config) {
        config = { ...config, ...event.data.config };
      }
      if (event.data.keyBindings) {
        config.keyBindings = { ...DEFAULT_CONFIG.keyBindings, ...event.data.keyBindings };
      }
      if (event.data.profileName) {
        overlayState.profileName = event.data.profileName;
      }
      if (event.data.showOverlay !== undefined) {
        overlayState.visible = event.data.showOverlay;
        const overlay = document.getElementById('xcloud-kbm-overlay');
        if (overlay) overlay.classList.toggle('hidden', !overlayState.visible);
      }
      console.log('[XCloud KB+M] Config loaded:', config);
      updateOverlay();
    }

    if (event.data.type === 'XCLOUD_KBM_UPDATE_CONFIG') {
      if (event.data.config) {
        config = { ...config, ...event.data.config };
      }
      if (event.data.keyBindings) {
        config.keyBindings = { ...DEFAULT_CONFIG.keyBindings, ...event.data.keyBindings };
      }
      if (event.data.profileName) {
        overlayState.profileName = event.data.profileName;
      }
      if (event.data.showOverlay !== undefined) {
        overlayState.visible = event.data.showOverlay;
        const overlay = document.getElementById('xcloud-kbm-overlay');
        if (overlay) overlay.classList.toggle('hidden', !overlayState.visible);
      }
      console.log('[XCloud KB+M] Config updated:', config);
      updateOverlay();
    }

    if (event.data.type === 'XCLOUD_KBM_TOGGLE') {
      config.enabled = event.data.enabled !== undefined ? event.data.enabled : !config.enabled;
      console.log('[XCloud KB+M] Controls', config.enabled ? 'ENABLED' : 'DISABLED');
      updateOverlay();
    }

    if (event.data.type === 'XCLOUD_KBM_TOGGLE_OVERLAY') {
      toggleOverlay();
    }

    if (event.data.type === 'XCLOUD_KBM_GAME_DETECTED') {
      overlayState.gameName = event.data.gameName;
      updateOverlay();
    }

    // Macro commands
    if (event.data.type === 'XCLOUD_KBM_MACRO_START_RECORDING') {
      const { macroId, name } = event.data;
      macroState.macros[macroId] = { id: macroId, name: name, triggerKey: null, actions: [] };
      startMacroRecording(macroId, name);
    }

    if (event.data.type === 'XCLOUD_KBM_MACRO_STOP_RECORDING') {
      const { triggerKey } = event.data;
      const macro = stopMacroRecording(triggerKey);
      // Send back the recorded macro
      window.postMessage({
        type: 'XCLOUD_KBM_MACRO_RECORDED',
        macro: macro
      }, '*');
    }

    if (event.data.type === 'XCLOUD_KBM_MACRO_CANCEL_RECORDING') {
      cancelMacroRecording();
    }

    if (event.data.type === 'XCLOUD_KBM_MACRO_PLAY') {
      playMacro(event.data.macroId);
    }

    if (event.data.type === 'XCLOUD_KBM_MACRO_DELETE') {
      deleteMacro(event.data.macroId);
    }

    if (event.data.type === 'XCLOUD_KBM_MACRO_LOAD') {
      // Load macros from storage
      if (event.data.macros) {
        macroState.macros = event.data.macros;
        console.log('[XCloud KB+M] Macros loaded:', Object.keys(macroState.macros).length);
      }
    }

    if (event.data.type === 'XCLOUD_KBM_MACRO_GET_ALL') {
      // Return all macros
      window.postMessage({
        type: 'XCLOUD_KBM_MACRO_LIST',
        macros: macroState.macros,
        recording: macroState.recording,
        playing: macroState.playing
      }, '*');
    }
  });

  // Request initial config
  window.postMessage({ type: 'XCLOUD_KBM_GET_CONFIG' }, '*');

  // ============================================
  // EXPOSE FOR DEBUGGING
  // ============================================
  window.__xcloudKBM = {
    getGamepad: () => createGamepadSnapshot(),
    getConfig: () => config,
    setEnabled: (enabled) => { config.enabled = enabled; updateOverlay(); },
    getMouseState: () => mouseState,
    getKeyState: () => keyState,
    toggleOverlay: toggleOverlay,
    getOverlayState: () => overlayState,
    // Macro debugging
    getMacros: () => macroState.macros,
    getMacroState: () => macroState,
    startRecording: (id, name) => startMacroRecording(id, name),
    stopRecording: (key) => stopMacroRecording(key),
    playMacro: (id) => playMacro(id)
  };

  console.log('[XCloud KB+M] Virtual gamepad ready!');
  console.log('[XCloud KB+M] Test with: navigator.getGamepads()[0]');
  console.log('[XCloud KB+M] Click on game stream to lock mouse for camera control');

})();
