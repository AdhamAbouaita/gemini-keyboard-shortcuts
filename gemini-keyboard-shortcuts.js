// ==UserScript==
// @name         Gemini Keyboard Shortcuts (Power Tweaks)
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  Power-user hotkeys for Gemini: Sidebar Toggle = ⌘/Ctrl+B, Model Switch = ⌘/Ctrl+M, Theme Toggle = Option+Shift+D.
// @license      MIT
// @author       Adham Abouaita
// @match        https://gemini.google.com/*
// @match        https://gemini.google.com/u/*
// @match        https://gemini.google.com/app*
// @supportURL   https://github.com/adhamabouaita/gemini-keyboard-shortcuts/issues
// @grant        none
// @run-at       document-start
// ==/UserScript==
/*

# Included Keyboard Shortcuts

| Shortcut (Mac/Windows)      | Action            |
|:---------------------------:|:------------------|
| ⌘/Ctrl + **B**              | Toggle sidebar    |
| ⌘/Ctrl + **M**              | Cycle Models (1-2-3) |
| Option + Shift + **D**      | Toggle Theme      |

*/


(function () {
    'use strict';

    // ====== CENTRAL CONFIG (shortcuts + selectors) ======
    const CFG = {
        hotkeys: {
            sidebarToggle: { key: 'b', shift: false, cmdOrCtrl: true },
            themeToggle: { key: 'd', code: 'KeyD', shift: true, cmdOrCtrl: false, alt: true }, // Option+Shift+D
            modelToggle: { key: 'm', shift: false, cmdOrCtrl: true }, // Cmd+M
        },
        selectors: {
            sidebarHide: '[aria-label*="Hide side panel"]',
            sidebarShow: '[aria-label*="Show side panel"]',
            mainMenu: '[aria-label*="Main menu"]',
            menuToggleButton: '[data-test-id="menu-toggle-button"]',
            modelSwitcherButton: '[data-test-id="bard-mode-menu-button"]',
            modelMenuPanel: '.mat-mdc-menu-panel',
            modelMenuContent: '.mat-mdc-menu-content',
            modelMenuItem: 'button.mat-mdc-menu-item',
            // Theme Toggle Selectors
            settingsButton: '[data-test-id="settings-and-help-button"] button',
            themeMenuButton: '[data-test-id="desktop-theme-menu-button"]',
            themeCheckmark: 'mat-icon[fonticon="check_circle"]',
        },
    };

    window.onload = onLoad;

    function onLoad() {
        // ----- CSS tweaks (minimal & intentional) -----
        const s = document.createElement('style');
        document.head.append(s);
        s.textContent = `
      #gbwa, .cdk-overlay-backdrop { display: none !important; }
      .mat-mdc-focus-indicator::before { border: none !important; }
    `;

        // ====== Helpers ======
        function clearNotifications() {
            for (const ele of document.querySelectorAll('.gemini-key-notification')) ele.remove();
        }

        function notify(text) {
            clearNotifications();
            const div = document.createElement('div');
            div.className = 'gemini-key-notification';
            const tDuration = 125, nDuration = 3000, tLeft = nDuration - tDuration;
            div.textContent = text;
            div.style.cssText = `
        position:fixed; bottom:26px; left:26px; font-family:sans-serif; font-size:.875rem;
        color:#fff; border-radius:4px; background:#333; z-index:2147483647; padding:14px 16px;
        box-shadow:0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12);
        transition:opacity ${tDuration}ms ease-in-out, transform ${tDuration}ms ease-in-out;
        transform-origin:center bottom; transform:scale(.8); opacity:0; max-width:calc(100% - 52px); box-sizing:border-box;
      `;
            document.body.appendChild(div);
            setTimeout(() => { div.style.opacity = '1'; div.style.transform = 'scale(1)'; }, 10);
            setTimeout(() => {
                div.style.opacity = '0'; div.style.transform = 'scale(.8)';
                setTimeout(() => { if (div.parentNode) div.remove(); }, tDuration);
            }, tLeft);
        }

        function simulateClick(el) {
            if (!el) throw new Error('Element not found for click().');
            const opts = { bubbles: true, cancelable: true, view: window };
            el.dispatchEvent(new MouseEvent('mousedown', opts));
            el.dispatchEvent(new MouseEvent('mouseup', opts));
            el.click(); // Standard click usually suffices if mouse events are fired, but some need specific 'click' event dispatch too.
        }

        let lastToggledModel = 1; // Start assuming we might want to go to 1, or default state.

        // ====== Model Switching ======
        function switchModel(modelNumber) {
            const modelIndex = modelNumber - 1;
            const switcher = document.querySelector(CFG.selectors.modelSwitcherButton);
            if (!switcher) { notify('Model switcher button not found.'); return; }
            simulateClick(switcher);

            // Wait for the menu panel to appear and be populated
            waitForElement(CFG.selectors.modelMenuPanel, (panel) => {
                // Even if panel exists, content might be rendering. Wait for items.
                waitForElement(CFG.selectors.modelMenuItem, () => {
                    const content = panel.querySelector(CFG.selectors.modelMenuContent);
                    const buttons = content ? content.querySelectorAll(CFG.selectors.modelMenuItem) : null;

                    if (buttons && buttons.length && modelIndex >= 0 && modelIndex < buttons.length) {
                        const btn = buttons[modelIndex];
                        const name = (btn.textContent || '').trim().replace(/\s+/g, ' ') || `Model ${modelNumber}`;

                        // Add small delay to ensure listeners are ready
                        setTimeout(() => {
                            simulateClick(btn);
                            notify(`Switched to ${name}`);
                        }, 150);
                    } else {
                        // Close menu if invalid
                        document.body.click();
                        notify(`Model number ${modelNumber} is invalid or not available.`);
                    }
                }, 2000); // 2s timeout to find items
            }, 2000); // 2s timeout to find panel
        }

        // ====== Sidebar Toggle ======
        function toggleSidebar() {
            const toggle =
                document.querySelector(CFG.selectors.sidebarHide) ||
                document.querySelector(CFG.selectors.sidebarShow) ||
                document.querySelector(CFG.selectors.mainMenu) ||
                document.querySelector(CFG.selectors.menuToggleButton);

            if (toggle) simulateClick(toggle);
            else {
                const side = document.querySelector('bard-sidenav-container');
                if (side) side.toggleAttribute('collapsed');
                else notify('Sidebar toggle not found.');
            }
        }

        // ====== Theme Toggle ======
        function toggleTheme() {
            const settingsBtn = document.querySelector(CFG.selectors.settingsButton);
            if (!settingsBtn) { notify('Settings button not found'); return; }

            // 1. Open Settings Menu
            simulateClick(settingsBtn);

            // 2. Wait for Theme Menu Item
            waitForElement(CFG.selectors.themeMenuButton, (themeBtn) => {
                // 3. Open Theme Submenu
                simulateClick(themeBtn);

                // 4. Wait for Theme Options
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    // Use a more robust selector to handle changes like 'menuitemradio' or nested buttons
                    const menuItems = document.querySelectorAll('.mat-mdc-menu-item, [role="menuitemradio"], [role="menuitem"]');
                    let lightBtn, darkBtn;

                    menuItems.forEach(btn => {
                        const text = btn.textContent || '';
                        if (text.includes('Light')) lightBtn = btn;
                        if (text.includes('Dark')) darkBtn = btn;
                    });

                    if (lightBtn && darkBtn) {
                        clearInterval(checkInterval);

                        // Look for standard checkmark, or role aria-checked fallback
                        const isDarkChecked = darkBtn.querySelector(CFG.selectors.themeCheckmark) || darkBtn.getAttribute('aria-checked') === 'true';

                        if (isDarkChecked) {
                            simulateClick(lightBtn);
                            notify('Switched to Light Mode');
                        } else {
                            simulateClick(darkBtn);
                            notify('Switched to Dark Mode');
                        }

                        // Strict Menu Collapse Logic
                        setTimeout(() => {
                            const mainSettingsBtn = document.querySelector(CFG.selectors.settingsButton);
                            const anyMenuOpen = document.querySelector('.mat-mdc-menu-panel.mat-mdc-menu-panel-above');

                            if (mainSettingsBtn) {
                                const isExpanded = mainSettingsBtn.getAttribute('aria-expanded') === 'true';
                                if (isExpanded || anyMenuOpen) {
                                    simulateClick(mainSettingsBtn);
                                }
                            }
                        }, 250);
                    } else if (attempts >= 15) { // Drop out after 1.5 seconds of polling
                        clearInterval(checkInterval);
                        notify('Theme options not found');
                        document.body.click();
                    }
                }, 100);
            });
        }

        function waitForElement(selector, callback, timeout = 1000) {
            const el = document.querySelector(selector);
            if (el) { callback(el); return; }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    callback(element);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), timeout);
        }

        // ====== Key Handling ======
        const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

        function handleKeydown(event) {
            const key = (event.key || '').toLowerCase();
            const code = event.code;
            const isCmdOrCtrl = (isMac && event.metaKey) || (!isMac && event.ctrlKey);

            // Theme Toggle: Option + Shift + D
            if (event.altKey && event.shiftKey && (key === CFG.hotkeys.themeToggle.key || code === CFG.hotkeys.themeToggle.code)) {
                event.preventDefault();
                toggleTheme();
                return;
            }

            // --- Cmd/Ctrl Shortcuts ---
            // Sidebar: Cmd/Ctrl + B
            if (isCmdOrCtrl && !event.shiftKey && key === CFG.hotkeys.sidebarToggle.key) {
                event.preventDefault();
                toggleSidebar();
                return;
            }

            // Model Toggle: Cmd/Ctrl + M
            if (isCmdOrCtrl && !event.shiftKey && key === CFG.hotkeys.modelToggle.key) {
                event.preventDefault();
                // Cycle 1 -> 2 -> 3 -> 1
                let target = lastToggledModel + 1;
                if (target > 3) target = 1;

                switchModel(target);
                lastToggledModel = target;
                return;
            }
        }

        document.addEventListener('keydown', (event) => {
            try { handleKeydown(event); }
            catch (error) { notify(`Failed to execute shortcut: ${error}`); }
        }, { capture: true });

    }
})();
