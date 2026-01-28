# Mobile Browser Support

Play Xbox Cloud Gaming with a Bluetooth keyboard and mouse on your Android device!

## Supported Platforms

| Platform | Browser | Support Level |
|----------|---------|---------------|
| **Android** | Kiwi Browser | ✅ Full support |
| **Android** | Firefox Nightly | ✅ Full support (with custom collection) |
| **Android** | Yandex Browser | ⚠️ Experimental |
| **iOS/iPadOS** | Any browser | ❌ Not supported (Apple restrictions) |

## Android Setup

### Option 1: Kiwi Browser (Recommended)

Kiwi Browser is a Chromium-based browser that fully supports Chrome extensions on Android.

#### Install Kiwi Browser
1. Download [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) from Google Play
2. Open Kiwi Browser

#### Install the Extension
**Method A: From GitHub Release**
1. On your Android device, download the Chrome zip from [Releases](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest)
2. Extract the zip using a file manager (e.g., Files by Google, ZArchiver)
3. In Kiwi Browser, tap the three-dot menu → **Extensions**
4. Enable **Developer mode**
5. Tap **Load** and select the extracted folder
6. The extension is now installed!

**Method B: Load from URL (easier)**
1. In Kiwi Browser, go to `kiwi://extensions`
2. Enable **Developer mode**
3. Find the extension CRX/ZIP URL from the releases page
4. Use **Load** to install directly

### Option 2: Firefox Nightly (Advanced)

Firefox for Android supports extensions through Add-on Collections.

#### Step 1: Install Firefox Nightly
1. Download [Firefox Nightly](https://play.google.com/store/apps/details?id=org.mozilla.fenix) from Google Play

#### Step 2: Enable Custom Add-on Collections
1. Open Firefox Nightly
2. Tap the three-dot menu → **Settings**
3. Tap on **About Firefox Nightly**
4. Tap the Firefox logo **5 times** to enable debug menu
5. Go back to Settings
6. Tap **Custom Add-on collection** (new option)
7. Enter:
   - **Collection owner (User ID)**: `17388042`
   - **Collection name**: `xcloud-kbm`
8. Tap **OK** - Firefox will restart

#### Step 3: Install the Extension
1. After restart, tap menu → **Add-ons**
2. Find **Keyboard & Mouse for Xbox Cloud Gaming**
3. Tap **+** to install
4. Grant permissions when prompted

> **Note**: If the collection isn't available yet, you can create your own collection at [addons.mozilla.org](https://addons.mozilla.org/collections/) and add the extension.

### Option 3: Yandex Browser (Experimental)

1. Download [Yandex Browser](https://play.google.com/store/apps/details?id=com.yandex.browser) from Google Play
2. Go to the extensions catalog in settings
3. Extension support is limited - may not work fully

## Connecting Bluetooth Keyboard & Mouse

### On Android:
1. Go to **Settings → Connected devices → Pair new device**
2. Put your keyboard in pairing mode and connect
3. Repeat for your mouse
4. Both devices should now work system-wide

### Tips:
- Most Bluetooth keyboard/mouse combos work great
- USB keyboards/mice work with USB-C/OTG adapters
- Logitech Unifying receivers work with OTG adapters

## Using the Extension on Mobile

### First Time Setup
1. Open your mobile browser with the extension installed
2. Go to [xbox.com/play](https://www.xbox.com/play)
3. Sign in with your Microsoft account
4. Tap the extension icon to configure settings

### Playing Games
1. Launch a game on xCloud
2. **Tap the game stream** to enable mouse capture
3. Use your keyboard for controls:
   - WASD for movement
   - Mouse for camera
   - All standard bindings work
4. Tap **Escape** on keyboard to release mouse

### Mobile-Specific Notes

#### Pointer Lock
- On mobile, tap the game stream to capture mouse input
- Some browsers may show a permission prompt
- If pointer lock doesn't work, the extension falls back to relative mouse mode

#### Keyboard Shortcuts
- `Alt+Shift+X` - Toggle controls (may vary by browser)
- `Alt+Shift+P` - Switch profile

#### Screen Orientation
- **Landscape mode** recommended for best experience
- Lock orientation in Android settings if needed

#### Popup UI
- The settings popup is touch-friendly
- All features work the same as desktop

## Troubleshooting

### Extension doesn't load
- Make sure Developer Mode is enabled
- Try reinstalling the extension
- Check that all permissions are granted

### Mouse doesn't capture
- Tap directly on the game stream
- Try fullscreen mode (F11 or browser fullscreen)
- Some games may have delayed capture

### Keyboard not responding
- Make sure the game has focus (tap on it)
- Check Bluetooth connection
- Try pressing a key while the game stream is focused

### Game shows controller prompts instead of keyboard
- This is normal - the extension simulates a controller
- Keyboard/mouse → Virtual Controller → Game

### Lag or latency
- Use 5GHz WiFi for best results
- Close background apps
- Try reducing stream quality in xCloud settings

## iOS/iPadOS - Why It's Not Supported

Unfortunately, Apple does not allow browser extensions on iOS/iPadOS:
- Safari on iOS doesn't support Web Extensions
- Chrome/Firefox/Edge on iOS all use WebKit (Apple's engine) with no extension support
- This is an Apple platform restriction, not a browser limitation

**Potential workarounds (none currently work):**
- ❌ Bookmarklets - Can't override Gamepad API
- ❌ Shortcuts app - No browser integration
- ❌ Jailbreak - Possible but unsupported

If Apple ever allows browser extensions on iOS, we'll add support!

## Performance Tips

1. **Use a good Bluetooth connection**
   - Keep devices close together
   - Avoid interference from other Bluetooth devices

2. **Optimize network**
   - Use 5GHz WiFi
   - Wired ethernet via USB-C adapter is even better
   - Close bandwidth-heavy apps

3. **Device performance**
   - Close background apps
   - Keep device cool (avoid thermal throttling)
   - Plug in charger for consistent performance

4. **Browser settings**
   - Enable hardware acceleration
   - Disable battery saver (can limit performance)

## Tested Devices

| Device | Browser | Status |
|--------|---------|--------|
| Samsung Galaxy S21+ | Kiwi Browser | ✅ Works great |
| Pixel 7 | Kiwi Browser | ✅ Works great |
| OnePlus 9 | Firefox Nightly | ✅ Works |
| Galaxy Tab S8 | Kiwi Browser | ✅ Excellent |

*Have you tested on your device? Let us know in the GitHub Issues!*
