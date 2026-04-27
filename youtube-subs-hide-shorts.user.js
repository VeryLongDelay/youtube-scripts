// ==UserScript==
// @name         YouTube Subscriptions - Hide Shorts
// @description  Remove Shorts sections from the YouTube subscriptions feed
// @namespace    https://github.com/verylongdelay/youtube-scripts
// @author       VeryLongDelay (https://github.com/verylongdelay)
// @license         MIT
// @version      1.0.0
// @description  Remove Shorts sections from the YouTube subscriptions feed
// @match        https://www.youtube.com/feed/subscriptions*
// @match        https://m.youtube.com/feed/subscriptions*
// @icon         https://raw.githubusercontent.com/VeryLongDelay/youtube-scripts/refs/heads/master/icon.ico
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/verylongdelay/youtube-scripts/main/youtube-subs-hide-shorts.user.js
// @downloadURL  https://raw.githubusercontent.com/verylongdelay/youtube-scripts/main/youtube-subs-hide-shorts.user.js
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "yt-hide-subscription-shorts-style";
  const SHORTS_SELECTORS = ["ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])", 'ytd-rich-section-renderer:has([title="Shorts"])', "ytd-reel-shelf-renderer", "ytd-shorts-shelf-renderer", 'grid-shelf-view-model:has(a[href^="/shorts/"])'];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
            ${SHORTS_SELECTORS.join(",\n")} {
                display: none !important;
            }
        `;

    document.documentElement.appendChild(style);
  }

  function removeShortsSections(root = document) {
    const candidates = root.querySelectorAll?.(["ytd-rich-section-renderer", "ytd-reel-shelf-renderer", "ytd-shorts-shelf-renderer", "grid-shelf-view-model"].join(","));

    candidates?.forEach((el) => {
      const text = el.textContent || "";
      const hasShortsLink = Boolean(el.querySelector?.('a[href^="/shorts/"]'));
      const hasShortsShelf = Boolean(el.querySelector?.("ytd-rich-shelf-renderer[is-shorts]"));

      if (hasShortsShelf || hasShortsLink || /\bShorts\b/i.test(text)) {
        el.remove();
      }
    });
  }

  function run() {
    injectStyle();
    removeShortsSections();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          removeShortsSections(node);
        }
      });
    }
  });

  function start() {
    run();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.addEventListener("yt-navigate-finish", run);
})();
