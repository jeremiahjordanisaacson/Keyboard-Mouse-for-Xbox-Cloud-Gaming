# Safari Extension Build Instructions

This guide explains how to build the Keyboard & Mouse for Xbox Cloud Gaming extension for Safari on macOS.

## Requirements

- macOS 12.0 (Monterey) or later
- Xcode 14.0 or later (free from the Mac App Store)
- Apple Developer account (free account works for personal use)

## Quick Setup

### Option 1: Using the Setup Script

1. Open Terminal
2. Navigate to this directory:
   ```bash
   cd path/to/Xbox/safari
   ```
3. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
4. Open the generated Xcode project and build (see Step 4 below)

### Option 2: Manual Setup

#### Step 1: Create Safari Web Extension Project

1. Open Xcode
2. Go to **File → New → Project**
3. Select **Safari Extension App** (under macOS tab)
4. Configure the project:
   - **Product Name**: `Keyboard and Mouse for Xbox Cloud Gaming`
   - **Team**: Select your Apple ID (or create one)
   - **Organization Identifier**: `com.yourname` (use your own)
   - **Language**: Swift
   - **Uncheck** "Include Tests"
5. Click **Next** and save to the `safari` folder

#### Step 2: Replace Extension Files

1. In Finder, navigate to your new Xcode project
2. Find the `Shared (Extension)/Resources` folder
3. Delete the default files (except `_locales` if present)
4. Copy these files from the main extension folder:
   - `background.js`
   - `content.js`
   - `injected.js`
   - `popup.html`
   - `popup.js`
   - `_locales/` (entire folder)
5. Copy the `manifest.json` from `safari/Keyboard and Mouse for Xbox Cloud Gaming/Shared (Extension)/Resources/`
6. Copy icons to `images/` folder (create if needed):
   - Rename `icon16.png` → `icon-16.png`
   - Rename `icon32.png` → `icon-32.png`
   - Rename `icon48.png` → `icon-48.png`
   - Rename `icon128.png` → `icon-128.png`
   - Create 256px and 512px versions if desired

#### Step 3: Update Xcode Project References

1. In Xcode, right-click the **Resources** folder
2. Select **Add Files to "Project"**
3. Add all the files you copied
4. Make sure **Copy items if needed** is unchecked
5. Click **Add**

#### Step 4: Build and Run

1. Select the **macOS** target (your Mac) in the scheme selector
2. Click **Product → Build** (or press ⌘B)
3. If successful, click **Product → Run** (or press ⌘R)
4. The app will install and open Safari preferences

#### Step 5: Enable in Safari

1. Open **Safari → Settings** (or press ⌘,)
2. Go to the **Extensions** tab
3. Check the box next to **Keyboard and Mouse for Xbox Cloud Gaming**
4. Click **Turn On** when prompted
5. Grant permission to access xbox.com when prompted

## Troubleshooting

### "Developer cannot be verified" error
1. Go to **System Settings → Privacy & Security**
2. Scroll down and click **Open Anyway** next to the blocked app

### Extension doesn't appear in Safari
1. Make sure you ran the app at least once from Xcode
2. Quit and reopen Safari
3. Check Safari Extensions settings

### Permissions issues
1. In Safari settings, ensure the extension has permission for xbox.com
2. You may need to allow access for "All Websites" or specifically xbox.com

## Distribution

### Personal Use
- Build and run directly from Xcode (free Apple ID required)
- The extension will work on your Mac only

### Sharing with Others
- Requires a paid Apple Developer account ($99/year)
- Must be notarized or distributed via the Mac App Store
- See Apple's documentation on [Distributing Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions/distributing_your_safari_web_extension)

## Keyboard Shortcuts

Safari uses slightly different shortcuts:
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+X` | Toggle controls on/off |
| `Ctrl+Shift+P` | Switch to next profile |

Note: On Mac, `Ctrl` refers to the Control key (not Command).

## Notes

- Safari Web Extensions use the same WebExtension APIs as Chrome/Firefox
- Some minor API differences may exist; report any issues on GitHub
- The extension requires Safari 14+ (macOS 11 Big Sur or later)
