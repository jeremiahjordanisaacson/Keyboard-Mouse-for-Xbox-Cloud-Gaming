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
    }
  };

  let config = { ...DEFAULT_CONFIG };

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

    // Check if this key is bound
    const isBound = Object.values(bindings).includes(key);
    if (isBound && !isTypingInInput(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (keyState[key]) return; // Already pressed
    keyState[key] = true;
  }

  function handleKeyUp(e) {
    if (!config.enabled) return;

    const key = e.code;
    const bindings = config.keyBindings;

    const isBound = Object.values(bindings).includes(key);
    if (isBound && !isTypingInInput(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }

    keyState[key] = false;
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
    mouseState.x += e.movementX * sensitivity;
    mouseState.y += e.movementY * sensitivity * (config.invertY ? -1 : 1);

    // Clamp to -1 to 1
    mouseState.x = Math.max(-1, Math.min(1, mouseState.x));
    mouseState.y = Math.max(-1, Math.min(1, mouseState.y));
  }

  function handleMouseDown(e) {
    if (!config.enabled) return;

    // Request pointer lock on left click in game area
    if (e.button === 0 && !mouseState.locked) {
      const target = e.target;
      if (target.tagName === 'VIDEO' || target.tagName === 'CANVAS' ||
          target.closest('[data-testid="game-stream"]') ||
          target.closest('.StreamPage') ||
          target.closest('#game-stream')) {
        document.body.requestPointerLock();
      }
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
    if (config.enabled && config.keyBindings.rightTrigger === 'MouseRight') {
      e.preventDefault();
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

    // Update face buttons
    setButton(BUTTONS.A, keyState[bindings.actionA]);
    setButton(BUTTONS.B, keyState[bindings.actionB]);
    setButton(BUTTONS.X, keyState[bindings.actionX]);
    setButton(BUTTONS.Y, keyState[bindings.actionY]);

    // Update bumpers and triggers
    setButton(BUTTONS.LB, keyState[bindings.leftBumper]);
    setButton(BUTTONS.RB, keyState[bindings.rightBumper]);
    setButton(BUTTONS.LT, keyState[bindings.leftTrigger]);
    setButton(BUTTONS.RT, keyState[bindings.rightTrigger]);

    // Update special buttons
    setButton(BUTTONS.VIEW, keyState[bindings.view]);
    setButton(BUTTONS.MENU, keyState[bindings.menu]);
    setButton(BUTTONS.LS, keyState[bindings.leftStickClick]);
    setButton(BUTTONS.RS, keyState[bindings.rightStickClick]);

    // Update D-pad
    setButton(BUTTONS.DPAD_UP, keyState[bindings.dpadUp]);
    setButton(BUTTONS.DPAD_DOWN, keyState[bindings.dpadDown]);
    setButton(BUTTONS.DPAD_LEFT, keyState[bindings.dpadLeft]);
    setButton(BUTTONS.DPAD_RIGHT, keyState[bindings.dpadRight]);

    // Update left stick (WASD)
    let leftX = 0, leftY = 0;
    if (keyState[bindings.moveLeft]) leftX -= 1;
    if (keyState[bindings.moveRight]) leftX += 1;
    if (keyState[bindings.moveForward]) leftY -= 1;
    if (keyState[bindings.moveBackward]) leftY += 1;

    // Normalize diagonal movement
    const magnitude = Math.sqrt(leftX * leftX + leftY * leftY);
    if (magnitude > 1) {
      leftX /= magnitude;
      leftY /= magnitude;
    }

    virtualGamepad.axes[0] = leftX;
    virtualGamepad.axes[1] = leftY;

    // Update right stick (mouse)
    virtualGamepad.axes[2] = mouseState.x;
    virtualGamepad.axes[3] = mouseState.y;

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

  // Start update loop
  requestAnimationFrame(updateGamepad);

  // ============================================
  // CONFIG MANAGEMENT
  // ============================================
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;

    if (event.data.type === 'XCLOUD_KBM_CONFIG' && event.data.config) {
      config = { ...DEFAULT_CONFIG, ...event.data.config };
      console.log('[XCloud KB+M] Config loaded:', config);
    }

    if (event.data.type === 'XCLOUD_KBM_UPDATE_CONFIG') {
      config = { ...DEFAULT_CONFIG, ...event.data.config };
      console.log('[XCloud KB+M] Config updated:', config);
    }

    if (event.data.type === 'XCLOUD_KBM_TOGGLE') {
      config.enabled = !config.enabled;
      console.log('[XCloud KB+M] Enabled:', config.enabled);
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
    setEnabled: (enabled) => { config.enabled = enabled; },
    getMouseState: () => mouseState,
    getKeyState: () => keyState
  };

  console.log('[XCloud KB+M] Virtual gamepad ready!');
  console.log('[XCloud KB+M] Test with: navigator.getGamepads()[0]');
  console.log('[XCloud KB+M] Click on game stream to lock mouse for camera control');

})();
