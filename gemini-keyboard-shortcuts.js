// ==UserScript==
// @name         Gemini Keyboard Shortcuts (Sidebar & Model Switcher Only)
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @description  Power-user hotkeys for Gemini: Sidebar Toggle = ⌘/Ctrl+B, Model Toggle = ⌘/Ctrl+M. Keep Windows 11 key handling.
// @license      MIT
// @author       Adham Abouaita
// @match        https://gemini.google.com/*
// @match        https://gemini.google.com/u/*
// @match        https://gemini.google.com/app*
// @supportURL   https://github.com/adhamabouaita/gemini-keyboard-shortcuts/issues
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const CFG = {
        hotkeys: {
            sidebarToggle: { key: 'b' },
            modelToggle: { key: 'm' },
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
        },
    };

    window.onload = onLoad;

    function onLoad() {
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
            el.click();
        }

        let lastToggledModel = 1;

        function switchModel(modelNumber) {
            const modelIndex = modelNumber - 1;
            const switcher = document.querySelector(CFG.selectors.modelSwitcherButton);
            if (!switcher) { notify('Model switcher button not found.'); return; }
            simulateClick(switcher);

            waitForElement(CFG.selectors.modelMenuPanel, (panel) => {
                waitForElement(CFG.selectors.modelMenuItem, () => {
                    const content = panel.querySelector(CFG.selectors.modelMenuContent);
                    const buttons = content ? content.querySelectorAll(CFG.selectors.modelMenuItem) : null;

                    if (buttons && buttons.length && modelIndex >= 0 && modelIndex < buttons.length) {
                        const btn = buttons[modelIndex];
                        const name = (btn.textContent || '').trim().replace(/\s+/g, ' ') || `Model ${modelNumber}`;

                        setTimeout(() => {
                            simulateClick(btn);
                            notify(`Switched to ${name}`);
                        }, 150);
                    } else {
                        document.body.click();
                        notify(`Model number ${modelNumber} is invalid or not available.`);
                    }
                }, 2000);
            }, 2000);
        }

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

        const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

        function handleKeydown(event) {
            const key = (event.key || '').toLowerCase();
            const isCmdOrCtrl = (isMac && event.metaKey) || (!isMac && event.ctrlKey);

            if (isCmdOrCtrl && !event.shiftKey) {
                if (key === CFG.hotkeys.sidebarToggle.key) {
                    event.preventDefault();
                    toggleSidebar();
                    return;
                }

                if (key === CFG.hotkeys.modelToggle.key) {
                    event.preventDefault();
                    let target = lastToggledModel + 1;
                    if (target > 3) target = 1;

                    switchModel(target);
                    lastToggledModel = target;
                    return;
                }
            }
        }

        document.addEventListener('keydown', (event) => {
            try { handleKeydown(event); }
            catch (error) { notify(`Failed to execute shortcut: ${error}`); }
        }, { capture: true });
    }
})();
