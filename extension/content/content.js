// AeroFyta Chrome Extension — Content Script (Rumble.com)

(function () {
  'use strict';

  const AEROFYTA_BTN_ID = 'aerofyta-tip-btn';
  const POLL_INTERVAL = 3000;
  let currentCreator = null;
  let injected = false;

  // --- Creator Detection ---

  function detectCreator() {
    const creator = {
      name: null,
      channel: null,
      url: window.location.href,
      avatar: null
    };

    // Strategy 1: Video page — channel name from media-by link
    const byLink = document.querySelector('.media-heading-owner a, .media-by--a, a.media-heading-name');
    if (byLink) {
      creator.name = byLink.textContent.trim();
      creator.channel = byLink.getAttribute('href') || '';
    }

    // Strategy 2: Channel page header
    if (!creator.name) {
      const channelHeader = document.querySelector('.channel-header--title, .listing-header--title, h1.channel-name');
      if (channelHeader) {
        creator.name = channelHeader.textContent.trim();
        creator.channel = window.location.pathname;
      }
    }

    // Strategy 3: Broader search for creator identity
    if (!creator.name) {
      const metaAuthor = document.querySelector('meta[name="author"], meta[property="og:site_name"]');
      if (metaAuthor && metaAuthor.content && metaAuthor.content !== 'Rumble') {
        creator.name = metaAuthor.content.trim();
      }
    }

    // Strategy 4: Look for subscribe button context
    if (!creator.name) {
      const subBtn = document.querySelector('.subscribe-button-text, [class*="subscribe"] span');
      if (subBtn) {
        const parent = subBtn.closest('[class*="channel"], [class*="media-by"]');
        if (parent) {
          const nameEl = parent.querySelector('a, span.name, .channel-name');
          if (nameEl) {
            creator.name = nameEl.textContent.trim();
          }
        }
      }
    }

    if (creator.name) {
      currentCreator = creator;
      return creator;
    }
    return null;
  }

  // --- Button Injection ---

  function injectTipButton() {
    if (document.getElementById(AEROFYTA_BTN_ID)) return;

    // Find an anchor point near subscribe/follow buttons
    const anchors = [
      '.media-by-wrap',
      '.subscribe-btn',
      '.media-heading-info',
      '.channel-header--actions',
      '.media-by'
    ];

    let anchor = null;
    for (const sel of anchors) {
      anchor = document.querySelector(sel);
      if (anchor) break;
    }

    if (!anchor) return;

    const btn = document.createElement('button');
    btn.id = AEROFYTA_BTN_ID;
    btn.className = 'aerofyta-tip-button';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L10.2 5.5L15 6.2L11.5 9.6L12.4 14.4L8 12.1L3.6 14.4L4.5 9.6L1 6.2L5.8 5.5L8 1Z" fill="currentColor"/>
      </svg>
      Tip with AeroFyta
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTipClick();
    });

    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    injected = true;
  }

  function handleTipClick() {
    const creator = detectCreator();
    if (!creator) {
      showOverlay('Could not detect creator on this page.');
      return;
    }

    // Send tip request to background script
    chrome.runtime.sendMessage({
      type: 'TIP_CREATOR',
      payload: {
        creator: creator.name,
        channel: creator.channel,
        url: creator.url,
        platform: 'rumble'
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        showOverlay('AeroFyta extension error. Is the agent running?');
        return;
      }
      if (response && response.success) {
        showOverlay(`Tipped ${creator.name} $${response.amount} USDT!`, true);
      } else {
        showOverlay(response?.error || 'Tip failed. Check agent connection.');
      }
    });
  }

  // --- Overlay Notification ---

  function showOverlay(message, success = false) {
    let overlay = document.getElementById('aerofyta-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'aerofyta-overlay';
    overlay.className = 'aerofyta-overlay ' + (success ? 'aerofyta-overlay--success' : 'aerofyta-overlay--error');
    overlay.innerHTML = `
      <div class="aerofyta-overlay-icon">${success ? '&#10003;' : '&#33;'}</div>
      <div class="aerofyta-overlay-text">${escapeHtml(message)}</div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('aerofyta-overlay--show'));
    setTimeout(() => {
      overlay.classList.remove('aerofyta-overlay--show');
      setTimeout(() => overlay.remove(), 300);
    }, 3000);
  }

  // --- Livestream Chat Engagement Detection ---

  function observeChat() {
    // Rumble livestream chat container
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

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const text = node.textContent || '';
          // Detect engagement signals (mentions of tips, donations, support)
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

  // --- Message Listener ---

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_CREATOR') {
      const creator = detectCreator();
      sendResponse({ creator });
      return true;
    }
    if (msg.type === 'PING') {
      sendResponse({ pong: true });
      return true;
    }
  });

  // --- Utils ---

  function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // --- Init ---

  function init() {
    detectCreator();

    if (currentCreator) {
      injectTipButton();
    }

    // Observe for dynamic page loads (Rumble uses client-side nav)
    const poll = setInterval(() => {
      detectCreator();
      if (currentCreator && !injected) {
        injectTipButton();
      }
      observeChat();
    }, POLL_INTERVAL);

    // Also watch for URL changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        injected = false;
        const old = document.getElementById(AEROFYTA_BTN_ID);
        if (old) old.remove();
        detectCreator();
        if (currentCreator) {
          injectTipButton();
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
