// AeroFyta Chrome Extension — Content Script (Rumble.com)
// Detects creators on channel pages, video pages, and livestreams.
// Shows a floating "Tip with AeroFyta" FAB and a tip dialog.

(function () {
  'use strict';

  const POLL_INTERVAL = 2500;
  const FAB_ID = 'aerofyta-fab';
  const DIALOG_ID = 'aerofyta-tip-dialog';
  const OVERLAY_ID = 'aerofyta-overlay';

  let currentCreator = null;
  let fabInjected = false;
  let dialogOpen = false;

  // ─── Creator Detection ────────────────────────────────────────────

  function detectCreator() {
    const info = {
      name: null,
      channel: null,
      url: window.location.href,
      avatar: null,
      subscribers: null,
      isLive: false,
      pageType: 'unknown' // 'channel' | 'video' | 'live' | 'unknown'
    };

    const path = window.location.pathname;

    // --- Channel page: rumble.com/c/ChannelName ---
    if (/^\/c\/[^/]+/.test(path)) {
      info.pageType = 'channel';
      // Channel name from URL slug
      const slug = path.split('/')[2];
      info.channel = '/c/' + slug;

      // Try to get display name from page heading
      const heading = document.querySelector(
        '.channel-header--title h1, .channel-header--title, .listing-header--title h1, .listing-header--title'
      );
      if (heading) {
        info.name = heading.textContent.trim();
      }
      // Fallback: use slug cleaned up
      if (!info.name) {
        info.name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }

      // Subscriber count
      const subEl = document.querySelector(
        '.channel-header--subscribers, .listing-header--subscribers, [class*="subscriber"] span'
      );
      if (subEl) {
        info.subscribers = subEl.textContent.trim();
      }
    }

    // --- Video page: rumble.com/vXXXXXX-title.html or rumble.com/embed/... ---
    if (!info.name && /^\/(v[a-zA-Z0-9]+-|embed\/)/.test(path)) {
      info.pageType = 'video';

      // Primary: "media-by" author link (most reliable on Rumble video pages)
      const byLink = document.querySelector(
        '.media-by--a, a.media-heading-name, .media-heading-owner a'
      );
      if (byLink) {
        info.name = byLink.textContent.trim();
        info.channel = byLink.getAttribute('href') || '';
      }

      // Fallback: look in structured data
      if (!info.name) {
        const ldJson = document.querySelector('script[type="application/ld+json"]');
        if (ldJson) {
          try {
            const data = JSON.parse(ldJson.textContent);
            if (data.author && data.author.name) {
              info.name = data.author.name;
              info.channel = data.author.url || '';
            }
          } catch (_) { /* ignore parse errors */ }
        }
      }

      // Fallback: og:site_name or meta author
      if (!info.name) {
        const meta = document.querySelector('meta[name="author"]');
        if (meta && meta.content && meta.content !== 'Rumble') {
          info.name = meta.content.trim();
        }
      }

      // Subscriber count near channel info
      const subEl = document.querySelector(
        '.media-by-channel-subscribers, .media-heading-num-followers, [class*="subscriber"]'
      );
      if (subEl) {
        info.subscribers = subEl.textContent.trim();
      }
    }

    // --- Livestream detection ---
    const liveIndicators = document.querySelectorAll(
      '.video-item--live, .media-heading-live, [class*="live-indicator"], .watching-now, .live-badge'
    );
    if (liveIndicators.length > 0) {
      info.isLive = true;
      if (info.pageType === 'video') {
        info.pageType = 'live';
      }
    }
    // Also check if the page URL contains /live or has a live chat panel
    if (/\/live\b/.test(path) || document.querySelector('.chat-history--list, #chat-history-list')) {
      info.isLive = true;
      info.pageType = 'live';
    }

    // --- Avatar ---
    const avatarImg = document.querySelector(
      '.channel-header--thumb img, .media-by--a img, .listing-header--thumb img, .channel-header--image img'
    );
    if (avatarImg && avatarImg.src) {
      info.avatar = avatarImg.src;
    }

    // --- Final fallback: page title ---
    if (!info.name) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && ogTitle.content) {
        // Often "Video Title" or "Channel Name" — use as last resort
        info.name = ogTitle.content.split(' - ')[0].trim();
        if (info.name.length > 60) info.name = null; // too long, probably a video title
      }
    }

    if (info.name) {
      currentCreator = info;
      return info;
    }
    return null;
  }

  // ─── Floating Action Button (FAB) ────────────────────────────────

  function injectFAB() {
    if (document.getElementById(FAB_ID)) return;

    const fab = document.createElement('button');
    fab.id = FAB_ID;
    fab.className = 'aerofyta-fab';
    fab.setAttribute('aria-label', 'Tip with AeroFyta');
    fab.innerHTML = `
      <svg class="aerofyta-fab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 8.6L21.5 9.3L16.1 14L17.6 21L12 17.5L6.4 21L7.9 14L2.5 9.3L9.6 8.6L12 2Z" fill="currentColor"/>
      </svg>
      <span class="aerofyta-fab-label">Tip with AeroFyta</span>
    `;

    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTipDialog();
    });

    document.body.appendChild(fab);
    fabInjected = true;

    // Pulse animation on first appearance
    setTimeout(() => fab.classList.add('aerofyta-fab--visible'), 100);
  }

  function removeFAB() {
    const fab = document.getElementById(FAB_ID);
    if (fab) fab.remove();
    fabInjected = false;
  }

  // ─── Tip Dialog ──────────────────────────────────────────────────

  function toggleTipDialog() {
    if (dialogOpen) {
      closeTipDialog();
    } else {
      openTipDialog();
    }
  }

  function openTipDialog() {
    if (document.getElementById(DIALOG_ID)) return;

    const creator = currentCreator;
    if (!creator) {
      showOverlay('Could not detect a creator on this page.');
      return;
    }

    dialogOpen = true;

    const liveTag = creator.isLive
      ? '<span class="aerofyta-dialog-live">LIVE</span>'
      : '';
    const subsTag = creator.subscribers
      ? `<span class="aerofyta-dialog-subs">${escapeHtml(creator.subscribers)}</span>`
      : '';
    const avatarLetter = (creator.name || '?')[0].toUpperCase();
    const avatarContent = creator.avatar
      ? `<img src="${escapeHtml(creator.avatar)}" alt="" class="aerofyta-dialog-avatar-img">`
      : `<span class="aerofyta-dialog-avatar-letter">${avatarLetter}</span>`;

    const dialog = document.createElement('div');
    dialog.id = DIALOG_ID;
    dialog.className = 'aerofyta-dialog';
    dialog.innerHTML = `
      <div class="aerofyta-dialog-backdrop"></div>
      <div class="aerofyta-dialog-card">
        <div class="aerofyta-dialog-header">
          <span class="aerofyta-dialog-title">Tip Creator</span>
          <button class="aerofyta-dialog-close" aria-label="Close">&times;</button>
        </div>
        <div class="aerofyta-dialog-creator">
          <div class="aerofyta-dialog-avatar">${avatarContent}</div>
          <div class="aerofyta-dialog-creator-info">
            <span class="aerofyta-dialog-name">${escapeHtml(creator.name)}${liveTag}</span>
            <span class="aerofyta-dialog-channel">${escapeHtml(creator.channel || 'Rumble Creator')}${subsTag}</span>
          </div>
        </div>
        <div class="aerofyta-dialog-amounts">
          <button class="aerofyta-dialog-chip" data-amount="0.50">$0.50</button>
          <button class="aerofyta-dialog-chip" data-amount="1">$1</button>
          <button class="aerofyta-dialog-chip aerofyta-dialog-chip--selected" data-amount="2">$2</button>
          <button class="aerofyta-dialog-chip" data-amount="5">$5</button>
        </div>
        <div class="aerofyta-dialog-custom">
          <input type="number" class="aerofyta-dialog-input" id="aerofyta-custom-amount" placeholder="Custom USDT" min="0.01" step="0.01">
        </div>
        <button class="aerofyta-dialog-send" id="aerofyta-send-tip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.4 8.6L21.5 9.3L16.1 14L17.6 21L12 17.5L6.4 21L7.9 14L2.5 9.3L9.6 8.6L12 2Z" fill="currentColor"/></svg>
          Send Tip — $2.00 USDT
        </button>
        <div class="aerofyta-dialog-footer">
          Powered by <strong>AeroFyta</strong> &middot; Tether WDK
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Animate in
    requestAnimationFrame(() => dialog.classList.add('aerofyta-dialog--open'));

    // Bind events
    dialog.querySelector('.aerofyta-dialog-close').addEventListener('click', closeTipDialog);
    dialog.querySelector('.aerofyta-dialog-backdrop').addEventListener('click', closeTipDialog);

    let selectedAmount = 2.00;

    const chips = dialog.querySelectorAll('.aerofyta-dialog-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('aerofyta-dialog-chip--selected'));
        chip.classList.add('aerofyta-dialog-chip--selected');
        selectedAmount = parseFloat(chip.dataset.amount);
        const customInput = dialog.querySelector('#aerofyta-custom-amount');
        customInput.value = '';
        updateSendLabel(selectedAmount);
      });
    });

    const customInput = dialog.querySelector('#aerofyta-custom-amount');
    customInput.addEventListener('input', () => {
      if (customInput.value) {
        chips.forEach((c) => c.classList.remove('aerofyta-dialog-chip--selected'));
        const val = parseFloat(customInput.value);
        if (val > 0) {
          selectedAmount = val;
          updateSendLabel(val);
        }
      }
    });

    const sendBtn = dialog.querySelector('#aerofyta-send-tip');
    sendBtn.addEventListener('click', () => {
      sendTipFromDialog(selectedAmount);
    });

    function updateSendLabel(amount) {
      sendBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.4 8.6L21.5 9.3L16.1 14L17.6 21L12 17.5L6.4 21L7.9 14L2.5 9.3L9.6 8.6L12 2Z" fill="currentColor"/></svg>
        Send Tip — $${amount.toFixed(2)} USDT
      `;
    }
  }

  function closeTipDialog() {
    const dialog = document.getElementById(DIALOG_ID);
    if (!dialog) return;
    dialog.classList.remove('aerofyta-dialog--open');
    setTimeout(() => {
      dialog.remove();
      dialogOpen = false;
    }, 250);
  }

  function sendTipFromDialog(amount) {
    const creator = currentCreator;
    if (!creator) return;

    const sendBtn = document.querySelector('#aerofyta-send-tip');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
    }

    chrome.runtime.sendMessage({
      type: 'TIP_CREATOR',
      payload: {
        creator: creator.name,
        channel: creator.channel,
        amount: amount,
        url: creator.url,
        platform: 'rumble'
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        showOverlay('Extension error. Is the AeroFyta agent running?');
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send Tip';
        }
        return;
      }
      if (response && response.success) {
        closeTipDialog();
        showOverlay(`Tipped ${creator.name} $${response.amount.toFixed(2)} USDT!`, true);
      } else {
        showOverlay(response?.error || 'Tip failed. Check agent connection.');
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'Retry';
        }
      }
    });
  }

  // ─── Overlay Notification ────────────────────────────────────────

  function showOverlay(message, success = false) {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'aerofyta-overlay ' + (success ? 'aerofyta-overlay--success' : 'aerofyta-overlay--error');
    overlay.innerHTML = `
      <div class="aerofyta-overlay-icon">${success ? '&#10003;' : '&#9888;'}</div>
      <div class="aerofyta-overlay-text">${escapeHtml(message)}</div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('aerofyta-overlay--show'));
    setTimeout(() => {
      overlay.classList.remove('aerofyta-overlay--show');
      setTimeout(() => overlay.remove(), 350);
    }, 3500);
  }

  // ─── Livestream Chat Engagement Detection ────────────────────────

  let chatObserverActive = false;

  function observeChat() {
    if (chatObserverActive) return;

    const chatSelectors = [
      '.chat-history--list',
      '#chat-history-list',
      '.chat--messages',
      '[class*="chat-history"]'
    ];

    let chatContainer = null;
    for (const sel of chatSelectors) {
      chatContainer = document.querySelector(sel);
      if (chatContainer) break;
    }
    if (!chatContainer) return;

    chatObserverActive = true;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const text = node.textContent || '';
          const signals = ['tip', 'donate', 'support', 'love this', 'great content', 'amazing'];
          const hasSignal = signals.some((s) => text.toLowerCase().includes(s));
          if (hasSignal) {
            chrome.runtime.sendMessage({
              type: 'CHAT_ENGAGEMENT',
              payload: {
                message: text.slice(0, 200),
                creator: currentCreator?.name || 'Unknown',
                url: window.location.href,
                timestamp: Date.now()
              }
            });
          }
        }
      }
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
  }

  // ─── Message Listener ────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_CREATOR') {
      const creator = detectCreator();
      sendResponse({ creator });
      return true;
    }
    if (msg.type === 'PING') {
      sendResponse({ pong: true, creator: currentCreator });
      return true;
    }
  });

  // ─── Utils ───────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return '';
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // ─── Initialization ──────────────────────────────────────────────

  function init() {
    detectCreator();

    if (currentCreator) {
      injectFAB();
    }

    // Poll for dynamic page loads (Rumble uses some client-side nav)
    setInterval(() => {
      detectCreator();
      if (currentCreator && !fabInjected) {
        injectFAB();
      } else if (!currentCreator && fabInjected) {
        removeFAB();
      }
      observeChat();
    }, POLL_INTERVAL);

    // Watch for SPA navigation (URL changes)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        fabInjected = false;
        currentCreator = null;
        chatObserverActive = false;
        const oldFab = document.getElementById(FAB_ID);
        if (oldFab) oldFab.remove();
        const oldDialog = document.getElementById(DIALOG_ID);
        if (oldDialog) oldDialog.remove();
        dialogOpen = false;

        // Re-detect after a short delay (let new page content load)
        setTimeout(() => {
          detectCreator();
          if (currentCreator) {
            injectFAB();
          }
        }, 800);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
