# Gemini Keyboard Shortcuts

A powerful and straightforward Tampermonkey userscript designed to enhance your experience with Google Gemini on the web. This script introduces essential keyboard shortcuts to accelerate your workflow and keep you focused on your tasks without reaching for the mouse.

## Features

This userscript is intentionally lightweight, providing three highly requested features crafted for speed:

*   **Sidebar Toggle (`Cmd/Ctrl + B`)**: Quickly show or hide the Google Gemini sidebar navigation. Essential for taking back screen real estate when you need to focus solely on the chat interface.
*   **Model Switcher (`Cmd/Ctrl + M`)**: Cycle through your available Gemini models effortlessly. This shortcut clicks the dropdown menu automatically and selects the next model in sequence, resetting to the first option when the list wraps around.
*   **Theme Toggle (`Option + Shift + D`)**: Switch between the Light and Dark theme with a single shortcut sequence. This feature is heavily optimized to automatically manage the Gemini "Settings" menu states, even compensating for user interface changes like the "System" theme dropdown option to ensure a clean Light/Dark jump every single time. 

## Installation

To install this script, you must have a userscript manager installed in your web browser. 

1.  **Install a Userscript Manager:**
    *   **Chrome/Edge:** Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
    *   **Firefox:** Install [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).
    *   **Safari:** Install [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089).

2.  **Add the Script:**
    *   Once your manager is installed, click to create a new script.
    *   Copy the entire contents of `gemini-keyboard-shortcuts.js` from this repository.
    *   Paste the code into your new script file and Save (`Ctrl/Cmd + S`).
    *   Alternatively, if you are viewing the raw `.js` file via GitHub, your userscript extension should ask to automatically install it.

3.  **Ensure it is Enabled:**
    *   Navigate to `https://gemini.google.com/` and ensure your userscript manager indicates that the script is currently active on the page.

## Technical Details

The script operates primarily by simulating native mouse click events on specifically targeted elements within the Google Gemini DOM (Document Object Model). 

### Selectors
A central `CFG` object acts as the configuration hub for all Data-Test-IDs, ARIA-labels, and CSS selectors. When Google updates their code architecture, maintaining this script is as simple as updating the `CFG` object string values.

### Asynchronous Menu Handling 
Many of the menus on the Gemini platform (like the settings menu and model selection menu) are dynamically rendered Angular components that animate into view. To combat missing elements, the script employs a robust `waitForElement` utility relying on `MutationObserver` and polling intervals. This guarantees that elements like the "Light Theme" and "Dark Theme" buttons are fully rendered into the user's browser document before a click is simulated.

### Backwards Compatibility 
Functionality such as the `Theme Toggle` has been battle-tested to support variable interface sizes. When Google introduced a "System" default option into their theme selection stack, this userscript was built specifically with a fallback logic chain to accommodate UI environments displaying two options, three options, or irregular class mappings.

## Troubleshooting

*   **Shortcuts not firing:** Make sure that the script is active and you are clicked inside the application window. If you are focused inside a standard text entry input or browser address bar, the hotkey sequence may be intercepted by the active system before the userscript parses it. 
*   **Failed Toggles:** Google continually updates their web UI. If an element fails to toggle, the browser console should log a notification indicating that the selector was not found. If this occurs, please file an issue or update the root `CFG` selectors. 

## Requirements

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   A userscript management extension (Tampermonkey recommended).
*   Active internet connection and access to `https://gemini.google.com/`.

## License

This project is open-source and available under the standard MIT License. You are free to copy, modify, distribute, and perform the work entirely.
