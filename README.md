# 🎮 Keyboard & Mouse for Xbox Cloud Gaming

Play Xbox Cloud Gaming (xCloud) with your keyboard and mouse instead of a controller!

This browser extension injects a virtual Xbox controller into the Xbox Cloud Gaming webpage, allowing you to use keyboard keys for buttons and mouse movement for camera control.

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge%20%7C%20Firefox%20%7C%20Opera%20%7C%20Brave-blue)
[![Latest Release](https://img.shields.io/github/v/release/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming)](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest)

## ✨ Features

- **WASD Movement** - Smooth analog stick simulation
- **Mouse Camera Control** - Adjustable sensitivity with pointer lock
- **All Buttons Mapped** - Every Xbox controller button accessible via keyboard
- **Customizable** - Adjust sensitivity and invert Y-axis
- **Lightweight** - No performance impact
- **Privacy Focused** - No data collection, no tracking, no ads
- **Works Everywhere** - Chrome, Edge, Firefox, Opera, Brave, and more

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

| Browser | Download |
|---------|----------|
| Google Chrome | `Xbox-Cloud-Gaming-KBM-Chrome-v*.zip` |
| Microsoft Edge | `Xbox-Cloud-Gaming-KBM-Edge-v*.zip` |
| Mozilla Firefox | `Xbox-Cloud-Gaming-KBM-Firefox-v*.zip` |
| Brave | `Xbox-Cloud-Gaming-KBM-Brave-v*.zip` |
| Opera | `Xbox-Cloud-Gaming-KBM-Opera-v*.zip` |
| Vivaldi | `Xbox-Cloud-Gaming-KBM-Vivaldi-v*.zip` |

### Install on Chrome / Edge / Brave / Opera / Vivaldi

1. Download the zip for your browser from the [Releases](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest) page
2. Extract the zip file to a folder on your computer
3. Open your browser's extension page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
   - Vivaldi: `vivaldi://extensions`
4. Enable **Developer Mode** (toggle in top-right or sidebar)
5. Click **Load unpacked**
6. Select the extracted folder

### Install on Firefox

1. Download `Xbox-Cloud-Gaming-KBM-Firefox-v*.zip` from the [Releases](https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/latest) page
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the downloaded zip file (no need to extract)

### From Browser Stores

Coming soon to:
- Chrome Web Store
- Edge Add-ons
- Firefox Add-ons

## 🎮 How to Use

1. Install the extension
2. Go to [xbox.com/play](https://www.xbox.com/play)
3. Sign in with your Xbox/Microsoft account
4. Launch any game
5. **Click on the game stream** to lock your mouse for camera control
6. Play with keyboard and mouse!
7. Press **Escape** to unlock your mouse

## ⚙️ Settings

Click the extension icon in your browser toolbar to:
- Enable/disable the controls
- Adjust mouse sensitivity (1-20)
- Invert Y-axis

## 📁 Project Structure

```
├── manifest.json      # Extension manifest (Chrome/Edge/Opera/Brave)
├── content.js         # Content script - loads injected code
├── injected.js        # Main logic - virtual gamepad & input handling
├── popup.html         # Settings popup UI
├── popup.js           # Settings logic
├── icons/             # Extension icons
├── firefox/           # Firefox-specific files
│   └── manifest.json  # Firefox manifest (Manifest V2)
└── docs/              # Documentation
    ├── PRIVACY_POLICY.md
    └── STORE_SUBMISSION.md
```

## 🔧 How It Works

1. **Content Script** (`content.js`) runs when you visit xbox.com/play
2. **Injected Script** (`injected.js`) is injected into the page context
3. **Virtual Gamepad** overrides `navigator.getGamepads()` to return a simulated Xbox 360 controller
4. **Input Capture** listens for keyboard and mouse events
5. **Gamepad State** is updated 60 times per second based on your inputs
6. **xCloud** detects the virtual controller and accepts input

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
