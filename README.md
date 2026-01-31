# 🎮 Keyboard & Mouse for Xbox Cloud Gaming

Play Xbox Cloud Gaming (xCloud) with your keyboard and mouse instead of a controller!

This browser extension injects a virtual Xbox controller into the Xbox Cloud Gaming webpage, allowing you to use keyboard keys for buttons and mouse movement for camera control.

![License](https://img.shields.io/badge/license-MIT-green)
[![Latest Release](https://img.shields.io/github/v/release/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming)](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest)
[![Changelog](https://img.shields.io/badge/changelog-view-blue)](CHANGELOG.md)

**[Visit the Website](https://jeremiahjordanisaacson.github.io/Keyboard-Mouse-for-Xbox-Cloud-Gaming/)** | **[Browse Preset Library](https://jeremiahjordanisaacson.github.io/Keyboard-Mouse-for-Xbox-Cloud-Gaming/presets/)**

## ✨ Features

- **WASD Movement** - Smooth analog stick simulation
- **Mouse Camera Control** - Adjustable sensitivity with pointer lock
- **All Buttons Mapped** - Every Xbox controller button accessible via keyboard
- **Custom Key Bindings** - Rebind any action to your preferred keys or mouse buttons
- **Game Profiles** - Save different configurations for different games (FPS, Racing, etc.)
- **Auto-Profile Switching** - Automatically switch profiles when launching specific games
- **Quick Toggle Hotkeys** - Instantly toggle controls or switch profiles with keyboard shortcuts
- **50+ Languages** - Full localization support for worldwide users
- **Customizable** - Adjust sensitivity and invert Y-axis per profile
- **Lightweight** - No performance impact
- **Privacy Focused** - No data collection, no tracking, no ads
- **Works Everywhere** - 14+ browsers supported including Android (see below)
- **Mobile Ready** - Use with Bluetooth keyboard & mouse on Android devices

## 🎯 Default Controls

| Action | Key |
|--------|-----|
| Move Forward | W |
| Move Back | S |
| Move Left | A |
| Move Right | D |
| Look/Aim | Mouse |
| Jump (A) | Space |
| Interact (B) | E |
| Action (X) | Q |
| Reload (Y) | R |
| Sprint/Aim (LT) | Shift |
| Fire/Scope (RT) | Right Click |
| Left Bumper | F |
| Right Bumper | C |
| Left Stick Click | V |
| Right Stick Click | Middle Click |
| D-Pad | 1, 2, 3, 4 |
| View | Tab |
| Menu | Escape |

## 📦 Installation

### Download

**[📥 Download Latest Release](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest)**

Download the zip file for your browser. Each release includes SHA256 checksums to verify your download.

#### Chromium-Based Browsers
| Browser | Download |
|---------|----------|
| Google Chrome | `Xbox-Cloud-Gaming-KBM-Chrome-v*.zip` |
| Microsoft Edge | `Xbox-Cloud-Gaming-KBM-Edge-v*.zip` |
| Brave | `Xbox-Cloud-Gaming-KBM-Brave-v*.zip` |
| Opera | `Xbox-Cloud-Gaming-KBM-Opera-v*.zip` |
| Vivaldi | `Xbox-Cloud-Gaming-KBM-Vivaldi-v*.zip` |
| Yandex Browser | `Xbox-Cloud-Gaming-KBM-Yandex-v*.zip` |
| Naver Whale | `Xbox-Cloud-Gaming-KBM-Whale-v*.zip` |
| Cốc Cốc | `Xbox-Cloud-Gaming-KBM-CocCoc-v*.zip` |
| 360 Safe Browser | `Xbox-Cloud-Gaming-KBM-360Browser-v*.zip` |
| QQ Browser | `Xbox-Cloud-Gaming-KBM-QQBrowser-v*.zip` |
| Sogou Explorer | `Xbox-Cloud-Gaming-KBM-SogouExplorer-v*.zip` |
| Ecosia | `Xbox-Cloud-Gaming-KBM-Ecosia-v*.zip` |

#### Firefox-Based Browsers
| Browser | Download |
|---------|----------|
| Mozilla Firefox | `Xbox-Cloud-Gaming-KBM-Firefox-v*.zip` |
| Pale Moon | `Xbox-Cloud-Gaming-KBM-PaleMoon-v*.zip` |

#### Safari (macOS)
| Browser | Instructions |
|---------|--------------|
| Safari | Requires building with Xcode - see [Safari build guide](safari/README.md) |

#### Android (with Bluetooth Keyboard & Mouse)
| Browser | Instructions |
|---------|--------------|
| Kiwi Browser | Load Chrome extension directly - see [mobile guide](mobile/README.md) |
| Firefox Nightly | Via custom Add-on collection - see [mobile guide](mobile/README.md) |

### Install on Chromium-Based Browsers

1. Download the zip for your browser from the [Releases](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest) page
2. Extract the zip file to a folder on your computer
3. Open your browser's extension page:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
   - **Opera**: `opera://extensions`
   - **Vivaldi**: `vivaldi://extensions`
   - **Yandex**: `browser://extensions`
   - **Whale**: `whale://extensions`
   - **Cốc Cốc**: `coccoc://extensions`
   - **360 Safe Browser**: Settings → Extensions
   - **QQ Browser**: Settings → Extensions
   - **Sogou Explorer**: Settings → Extensions
   - **Ecosia**: `chrome://extensions`
4. Enable **Developer Mode** (toggle in top-right or sidebar)
5. Click **Load unpacked**
6. Select the extracted folder

### Install on Firefox-Based Browsers

1. Download the zip for your browser from the [Releases](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest) page
2. Open the debugging page:
   - **Firefox**: `about:debugging#/runtime/this-firefox`
   - **Pale Moon**: `about:debugging`
3. Click **Load Temporary Add-on**
4. Select the downloaded zip file (no need to extract)

### Install on Safari (macOS)

Safari requires building the extension with Xcode. See the detailed [Safari build guide](safari/README.md).

**Quick overview:**
1. Install Xcode from the Mac App Store (free)
2. Clone this repository
3. Run the setup script: `cd safari && ./setup.sh`
4. Open Xcode and create a new Safari Extension App project
5. Copy the files from `safari/Keyboard and Mouse for Xbox Cloud Gaming/Shared (Extension)/Resources/`
6. Build and run
7. Enable the extension in Safari Settings → Extensions

### Browser Compatibility

| Status | Browsers |
|--------|----------|
| ✅ Supported | Chrome, Edge, Firefox, Safari*, Brave, Opera, Vivaldi, Yandex, Whale, Cốc Cốc, 360 Safe, QQ, Sogou, Ecosia, Pale Moon |
| ✅ Android | Kiwi Browser, Firefox Nightly (with Bluetooth KB+M) - see [mobile guide](mobile/README.md) |
| ⚠️ Build Required | Safari (*requires Xcode on macOS - see [build guide](safari/README.md)) |
| ❌ Not Supported | iOS/iPadOS (Apple restrictions), Internet Explorer, Edge Legacy |

## 🎮 How to Use

1. Install the extension
2. Go to [xbox.com/play](https://www.xbox.com/play)
3. Sign in with your Xbox/Microsoft account
4. Launch any game
5. **Click on the game stream** to lock your mouse for camera control
6. Play with keyboard and mouse!
7. Press **Escape** to unlock your mouse

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+Shift+X` | Toggle controls on/off |
| `Alt+Shift+P` | Switch to next profile |

These shortcuts work globally, even when the popup is closed.

## ⚙️ Settings

Click the extension icon in your browser toolbar to:

### General
- Enable/disable the controls
- Adjust mouse sensitivity (1-20)
- Invert Y-axis

### Game Profiles
- **Switch profiles** - Use the dropdown to select a profile
- **Create profile** - Click + to create a new profile
- **Delete profile** - Click × to delete the current profile (except Default)
- **Built-in profiles**: Default, FPS/Shooter, Racing

Each profile saves its own key bindings, sensitivity, and invert Y setting.

### Auto-Profile Switching
When playing a game on xCloud, the extension detects which game you're playing:
- **Assign to Game** - Click to link the current profile to the detected game
- **Remove Assignment** - Click again to unlink the profile from the game
- The extension automatically switches to the assigned profile when you launch that game

### Custom Key Bindings
- Click any key binding button to rebind it
- Press the new key or mouse button you want to use
- Press Escape to cancel
- Click "Reset to Defaults" to restore all bindings

## 📁 Project Structure

```
├── manifest.json      # Extension manifest (Chrome/Edge/Opera/Brave)
├── background.js      # Service worker - handles hotkeys & profile management
├── content.js         # Content script - loads injected code & game detection
├── injected.js        # Main logic - virtual gamepad & input handling
├── popup.html         # Settings popup UI
├── popup.js           # Settings logic & profile management
├── _locales/          # Internationalization (50+ languages)
│   ├── en/            # English (default)
│   ├── es/            # Spanish
│   ├── fr/            # French
│   ├── de/            # German
│   ├── ja/            # Japanese
│   ├── zh_CN/         # Chinese (Simplified)
│   └── ...            # And 45+ more languages
├── icons/             # Extension icons
├── firefox/           # Firefox-specific files
│   └── manifest.json  # Firefox manifest (Manifest V2)
├── safari/            # Safari-specific files and build guide
│   ├── README.md      # Safari build instructions
│   └── setup.sh       # Setup script for Safari extension
├── mobile/            # Mobile browser support
│   └── README.md      # Android installation guide
└── docs/              # GitHub Pages website & documentation
    ├── index.html     # Landing page
    ├── css/           # Website styles
    ├── js/            # Website scripts
    └── presets/       # Preset library browser & presets.json
```

## 🌍 Supported Languages

The extension UI is fully translated into 50+ languages:

| Region | Languages |
|--------|-----------|
| **Americas** | English, Spanish, Portuguese (Brazil & Portugal) |
| **Europe** | French, German, Italian, Dutch, Polish, Russian, Ukrainian, Swedish, Danish, Norwegian, Finnish, Czech, Slovak, Hungarian, Romanian, Greek, Bulgarian, Croatian, Slovenian, Serbian, Lithuanian, Latvian, Catalan |
| **Asia** | Chinese (Simplified & Traditional), Japanese, Korean, Thai, Vietnamese, Indonesian, Malay, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Burmese, Nepali |
| **Middle East** | Arabic, Hebrew, Persian, Turkish, Urdu |
| **Africa** | Swahili |
| **Other** | Filipino, Kazakh |

The extension automatically displays in your browser's language. If your language isn't available, it defaults to English.

## 🔧 How It Works

1. **Background Script** (`background.js`) runs persistently to handle global hotkeys, profile management, and auto-switching
2. **Content Script** (`content.js`) runs when you visit xbox.com/play and detects which game you're playing
3. **Injected Script** (`injected.js`) is injected into the page context
4. **Virtual Gamepad** overrides `navigator.getGamepads()` to return a simulated Xbox 360 controller
5. **Input Capture** listens for keyboard and mouse events
6. **Gamepad State** is updated 60 times per second based on your inputs
7. **Game Detection** monitors the page to identify the current game for auto-profile switching
8. **xCloud** detects the virtual controller and accepts input

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy

This extension:
- Does **NOT** collect any personal data
- Does **NOT** track your activity
- Does **NOT** send data to external servers
- Stores settings locally on your device only

See [Privacy Policy](docs/PRIVACY_POLICY.md) for details.

## ⚠️ Disclaimer

This is an unofficial fan-made project and is not affiliated with, endorsed by, or connected to Microsoft or Xbox in any way. Xbox and Xbox Cloud Gaming are trademarks of Microsoft Corporation.

## 🙏 Acknowledgments

- Inspired by the need to play cloud games without a controller
- Thanks to everyone who contributes to making cloud gaming more accessible

---

**Made with ❤️ for the gaming community**
