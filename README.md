# Gemini Keyboard Shortcuts (Sidebar & Model Switcher)

A lightweight userscript designed to introduce essential power-user keyboard shortcuts to [Google Gemini](https://gemini.google.com/). This script drastically improves navigation speed for power users without adding bloat or unnecessarily overriding native features.

## ✨ Features

This script provides robust cross-platform shortcut bindings:

- **Toggle Sidebar** (`Cmd/Ctrl+B`): Show or hide the side panel seamlessly.
- **Cycle Models** (`Cmd/Ctrl+M`): Quickly cycle between your available Gemini models (e.g., Gemini Flash, Gemini Pro, etc.). Cycling wraps around once you reach your last available model.

## ⚡ Benefits

- **Focused and Lightweight:** This script was deliberately stripped down to only include high-impact navigation features, ensuring it is entirely frictionless and perfectly complements Gemini's existing UI.
- **Cross-Platform Compatibility:** Features built-in key normalization logic to handle Windows 11 `event.key` constraints seamlessly. Shortcuts act correctly regardless of your active OS (macOS or Windows/Linux).
- **Graceful Error Handling:** Fails gracefully and notifies you in the bottom left corner if UI layout changes prevent a shortcut from executing.

## 🛠 Installation

You need a userscript manager extension installed to use this script. We recommend [Tampermonkey](https://www.tampermonkey.net/).

1. **Install a Userscript Manager** (Tampermonkey, Greasemonkey, Violentmonkey).
2. **Install the Script:** Create a new script in your Userscript manager and copy/paste the entirety of `gemini-keyboard-shortcuts.js` into the editor. *Note: Ensure you overwrite any templated UserScript headers your manager adds by default.*
3. **Save and Refresh!** The script is now active on all Gemini URLs (`gemini.google.com/app`).

## ✍️ Authors and Credits

Author: [Adham Abouaita](https://github.com/adhamabouaita/gemini-keyboard-shortcuts)

*Note: This script is heavily based on an earlier pilot implementation by Henry Getz, which has since been stripped down and optimized into this streamlined version.*
