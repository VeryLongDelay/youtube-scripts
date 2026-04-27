// ==UserScript==
// @name         YouTube Logo → Subscriptions
// @description  Make the top-left YouTube logo go to subscriptions
// @namespace    https://github.com/verylongdelay/youtube-scripts
// @author       VeryLongDelay (https://github.com/verylongdelay)
// @license         MIT
// @version      1.0.0
// @description  Make the top-left YouTube logo go to subscriptions
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://youtube.com/*
// @icon         https://raw.githubusercontent.com/VeryLongDelay/youtube-scripts/refs/heads/master/icon.ico
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/verylongdelay/youtube-scripts/main/youtube-logo-to-subs.user.js
// @downloadURL  https://raw.githubusercontent.com/verylongdelay/youtube-scripts/main/youtube-logo-to-subs.user.js
// ==/UserScript==

(function () {
  "use strict";

  const TARGET_PATH = "/feed/subscriptions";

  function getTargetUrl() {
    return new URL(TARGET_PATH, location.origin).href;
  }

  function findLogoLink() {
    // Try stable selectors first
    return document.querySelector("a#logo") || document.querySelector("ytd-topbar-logo-renderer a") || document.querySelector('a[href="/"]');
  }

  function patch() {
    const logo = findLogoLink();
    if (!logo) return;

    logo.href = getTargetUrl();
    logo.setAttribute("href", TARGET_PATH);
  }

  function handleClick(e) {
    const logo = e.target.closest?.("a");

    if (!logo) return;

    // Only intercept if it's likely the homepage logo
    const href = logo.getAttribute("href");

    if (href !== "/" && !logo.closest("ytd-topbar-logo-renderer")) {
      return;
    }

    patch();

    // Respect middle-click / new tab
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    location.assign(getTargetUrl());
  }

  document.addEventListener("click", handleClick, true);
  document.addEventListener("auxclick", handleClick, true);

  const observer = new MutationObserver(patch);

  function start() {
    patch();
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

  window.addEventListener("yt-navigate-finish", patch);
})();
