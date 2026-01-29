# Changelog

All notable changes to Keyboard & Mouse for Xbox Cloud Gaming will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- On-screen overlay showing current profile
- Turbo mode for rapid-fire buttons
- Macro recording

---

## [1.5.0] - 2025-01-28

### Added
- **Sensitivity response curves** - Fine-tune mouse input behavior
  - Linear (default) - Direct 1:1 mouse mapping
  - Exponential - More precision at low speeds, faster at high speeds
  - S-Curve - Smooth acceleration with soft start/stop
- **Deadzone settings** - Adjustable deadzone (0-30%) for the right stick
  - Helps eliminate mouse drift
  - Configurable per profile
- **Profile import/export** - Share configurations
  - Export profile to clipboard as JSON
  - Import profile from clipboard
  - Import/Export buttons in profile row
- **Clickable status link** - Status bar now opens xbox.com/play when clicked

### Changed
- Updated popup UI with Response Curve dropdown and Deadzone slider
- All new features are saved per-profile
- Added localization for new features (EN, FR, ES)

---

## [1.4.1] - 2025-01-28

### Fixed
- Fixed release packaging missing `background.js` and `_locales/` folder
- Extensions now load correctly in all browsers

---

## [1.4.0] - 2025-01-28

### Added
- **Android mobile support** - Play with Bluetooth keyboard & mouse on Android
  - Kiwi Browser support (load Chrome extension directly)
  - Firefox Nightly support (via custom Add-on collection)
- Mobile device detection
- Touch-to-lock for pointer capture on mobile
- `unadjustedMovement` option for better mouse precision
- Comprehensive mobile guide (`mobile/README.md`)

### Changed
- Updated browser compatibility to include Android browsers
- Improved pointer lock request handling

---

## [1.3.2] - 2025-01-28

### Added
- **Safari support** for macOS
  - Safari Web Extension project structure
  - Xcode build instructions (`safari/README.md`)
  - Setup script for easy configuration
  - Mac-specific keyboard shortcuts (Ctrl+Shift+X/P)

### Changed
- Updated README with Safari installation instructions
- Updated project structure documentation

---

## [1.3.1] - 2025-01-28

### Changed
- Updated README with localization and auto-profile switching documentation
- Added Supported Languages section listing all 50+ translations
- Added Auto-Profile Switching section under Settings

---

## [1.3.0] - 2025-01-28

### Added
- **Internationalization (i18n)** - Full localization support
  - 54 languages supported
  - Automatic language detection based on browser settings
  - All UI elements translated
- **Per-game auto-profile switching**
  - Automatically switch profiles when launching specific games
  - Game detection via DOM observation and URL patterns
  - Assign/remove game-profile associations from popup
- New localization messages for all features

### Changed
- Manifest updated with `default_locale: "en"`
- Popup UI now uses Chrome i18n API
- Background script handles game change events

### Languages Added
- **European**: English, Spanish, French, German, Italian, Portuguese (BR/PT), Dutch, Polish, Russian, Ukrainian, Swedish, Danish, Norwegian, Finnish, Czech, Slovak, Hungarian, Romanian, Greek, Bulgarian, Croatian, Slovenian, Serbian, Lithuanian, Latvian, Catalan
- **Asian**: Chinese (Simplified/Traditional), Japanese, Korean, Thai, Vietnamese, Indonesian, Malay, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Burmese, Nepali
- **Middle Eastern**: Arabic, Hebrew, Persian, Turkish, Urdu
- **Other**: Filipino, Swahili, Kazakh

---

## [1.2.1] - 2025-01-28

### Changed
- Updated README with new features documentation
  - Added Custom Key Bindings section
  - Added Game Profiles section
  - Added Keyboard Shortcuts section
  - Updated Project Structure to include background.js

---

## [1.2.0] - 2025-01-28

### Added
- **Custom key bindings** - Rebind any action to keyboard or mouse buttons
  - Click any binding to change it
  - Press Escape to cancel
  - Reset to Defaults button
- **Game profiles** - Save different configurations
  - Default, FPS/Shooter, and Racing profiles included
  - Create custom profiles
  - Delete profiles (except Default)
  - Each profile saves: key bindings, sensitivity, invert Y
- **Quick toggle hotkeys**
  - `Alt+Shift+X` - Toggle controls on/off
  - `Alt+Shift+P` - Switch to next profile
- Background service worker for global hotkeys
- Badge indicator showing ON/OFF status

### Changed
- Popup UI redesigned with profile selector
- Settings now saved per-profile
- Improved accessibility with ARIA labels

---

## [1.1.0] - 2025-01-27

### Added
- **Adjustable mouse sensitivity** (1-20 range)
- **Invert Y-axis option**
- Settings popup with modern dark UI
- Settings persistence using Chrome storage API
- Status indicator showing active/inactive state

### Changed
- Improved mouse smoothing algorithm
- Better diagonal movement normalization

---

## [1.0.0] - 2025-01-27

### Added
- Initial release
- **Virtual Xbox 360 controller emulation**
- **WASD movement** mapped to left analog stick
- **Mouse look** mapped to right analog stick
- **Pointer lock** for immersive camera control
- All Xbox controller buttons mapped:
  - A/B/X/Y face buttons
  - Left/Right bumpers and triggers
  - D-pad (1/2/3/4 keys)
  - View and Menu buttons
  - Left/Right stick clicks
- Support for 14+ browsers:
  - Chrome, Edge, Firefox, Brave, Opera, Vivaldi
  - Yandex, Whale, Cốc Cốc, 360 Safe, QQ, Sogou, Ecosia, Pale Moon
- Privacy-focused: no data collection

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.5.0 | 2025-01-28 | Sensitivity curves, deadzone, import/export |
| 1.4.1 | 2025-01-28 | Fix release packaging |
| 1.4.0 | 2025-01-28 | Android mobile support |
| 1.3.2 | 2025-01-28 | Safari/macOS support |
| 1.3.1 | 2025-01-28 | Documentation updates |
| 1.3.0 | 2025-01-28 | i18n (50+ languages) + auto-profile switching |
| 1.2.1 | 2025-01-28 | README updates |
| 1.2.0 | 2025-01-28 | Key bindings + profiles + hotkeys |
| 1.1.0 | 2025-01-27 | Settings UI + sensitivity |
| 1.0.0 | 2025-01-27 | Initial release |

---

[Unreleased]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/jeremiahjordanisaacson/Keyboard-Mouse-for-Xbox-Cloud-Gaming/releases/tag/v1.0.0
