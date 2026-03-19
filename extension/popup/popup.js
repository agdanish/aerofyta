// AeroFyta Chrome Extension — Popup Controller

(function () {
  'use strict';

  // --- Constants ---
  const DEFAULT_API_URL = 'http://localhost:3001';
  const DEFAULT_TIP_AMOUNT = 2.00;
  const MAX_RECENT_TIPS = 8;

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const statusBadge = $('#statusBadge');
  const statusText = statusBadge.querySelector('.status-text');
  const balanceAmount = $('#balanceAmount');
  const chainBadge = $('#chainBadge');
  const walletAddress = $('#walletAddress');
  const creatorCard = $('#creatorCard');
  const creatorName = $('#creatorName');
  const creatorChannel = $('#creatorChannel');
  const creatorAvatar = $('#creatorAvatar');
  const creatorSubs = $('#creatorSubs');
  const pageTypeBadge = $('#pageTypeBadge');
  const tipButton = $('#tipButton');
  const tipList = $('#tipList');
  const tipCount = $('#tipCount');
  const customAmount = $('#customAmount');
  const apiUrlInput = $('#apiUrl');
  const defaultTipInput = $('#defaultTip');
  const autoDetectInput = $('#autoDetect');
  const saveSettingsBtn = $('#saveSettings');
  const notRumbleCard = $('#notRumbleCard');

  let selectedAmount = DEFAULT_TIP_AMOUNT;
  let currentCreator = null;
  let isOnRumble = false;
  let settings = {
    apiUrl: DEFAULT_API_URL,
    defaultTip: DEFAULT_TIP_AMOUNT,
    autoDetect: true
  };

  // --- Init ---
  async function init() {
    await loadSettings();
    await loadRecentTips();
    await checkAgentStatus();
    await detectCurrentPage();
    bindEvents();
  }

  // --- Settings ---
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          settings = { ...settings, ...result.settings };
        }
        apiUrlInput.value = settings.apiUrl;
        defaultTipInput.value = settings.defaultTip;
        autoDetectInput.checked = settings.autoDetect;
        selectedAmount = settings.defaultTip;
        resolve();
      });
    });
  }

  function saveSettings() {
    settings.apiUrl = apiUrlInput.value.replace(/\/+$/, '') || DEFAULT_API_URL;
    settings.defaultTip = parseFloat(defaultTipInput.value) || DEFAULT_TIP_AMOUNT;
    settings.autoDetect = autoDetectInput.checked;

    chrome.storage.local.set({ settings }, () => {
      showToast('Settings saved', 'success');
      checkAgentStatus();
    });
  }

  // --- Agent Status ---
  async function checkAgentStatus() {
    try {
      const resp = await fetchAgent('/api/status');
      if (resp && resp.status === 'ok') {
        setConnected(true);
        if (resp.balance !== undefined) {
          balanceAmount.textContent = parseFloat(resp.balance).toFixed(2);
        }
        if (resp.chain) {
          chainBadge.textContent = resp.chain.toUpperCase();
        }
        if (resp.address) {
          const addr = resp.address;
          walletAddress.textContent = addr.slice(0, 6) + '...' + addr.slice(-4);
          walletAddress.title = addr;
        }
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  }

  function setConnected(connected) {
    if (connected) {
      statusBadge.classList.add('connected');
      statusText.textContent = 'Connected';
    } else {
      statusBadge.classList.remove('connected');
      statusText.textContent = 'Disconnected';
      balanceAmount.textContent = '--';
      walletAddress.textContent = 'Agent not running';
    }
  }

  // --- Page & Creator Detection ---
  async function detectCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) {
        showNotOnRumble();
        return;
      }

      // Check if we are on Rumble
      if (!tab.url.includes('rumble.com')) {
        showNotOnRumble();
        return;
      }

      isOnRumble = true;
      notRumbleCard.style.display = 'none';

      // Ask content script for creator info
      chrome.tabs.sendMessage(tab.id, { type: 'GET_CREATOR' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.creator) {
          // On Rumble but no creator detected (maybe homepage)
          creatorCard.style.display = 'none';
          return;
        }
        currentCreator = response.creator;
        showCreator(currentCreator);
      });
    } catch {
      showNotOnRumble();
    }
  }

  function showNotOnRumble() {
    isOnRumble = false;
    notRumbleCard.style.display = 'flex';
    creatorCard.style.display = 'none';
  }

  function showCreator(creator) {
    creatorCard.style.display = 'block';
    creatorName.textContent = creator.name || 'Unknown Creator';
    creatorChannel.textContent = creator.channel || 'rumble.com';

    // Avatar
    const letter = (creator.name || '?')[0].toUpperCase();
    if (creator.avatar) {
      creatorAvatar.innerHTML = `<img src="${escapeHtml(creator.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      creatorAvatar.textContent = letter;
    }

    // Subscriber count
    if (creator.subscribers) {
      creatorSubs.style.display = 'inline';
      creatorSubs.textContent = creator.subscribers;
    } else {
      creatorSubs.style.display = 'none';
    }

    // Page type badge
    if (creator.isLive) {
      pageTypeBadge.textContent = 'LIVE';
      pageTypeBadge.className = 'page-type-badge page-type-live';
    } else if (creator.pageType === 'channel') {
      pageTypeBadge.textContent = 'CHANNEL';
      pageTypeBadge.className = 'page-type-badge page-type-channel';
    } else if (creator.pageType === 'video') {
      pageTypeBadge.textContent = 'VIDEO';
      pageTypeBadge.className = 'page-type-badge page-type-video';
    } else {
      pageTypeBadge.textContent = '';
      pageTypeBadge.className = 'page-type-badge';
    }

    updateTipButtonLabel();
  }

  // --- Tipping ---
  function updateTipButtonLabel() {
    const amount = parseFloat(customAmount.value) || selectedAmount;
    tipButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.4 8.6L21.5 9.3L16.1 14L17.6 21L12 17.5L6.4 21L7.9 14L2.5 9.3L9.6 8.6L12 2Z" fill="currentColor"/></svg>
      Send $${amount.toFixed(2)} Tip
    `;
  }

  async function sendTip() {
    if (!currentCreator) {
      showToast('No creator detected on this page', 'error');
      return;
    }

    const amount = parseFloat(customAmount.value) || selectedAmount;
    if (amount <= 0 || isNaN(amount)) {
      showToast('Invalid tip amount', 'error');
      return;
    }

    tipButton.disabled = true;
    tipButton.textContent = 'Sending...';

    try {
      const resp = await fetchAgent('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator: currentCreator.name,
          channel: currentCreator.channel,
          amount: amount,
          platform: 'rumble',
          url: currentCreator.url || ''
        })
      });

      if (resp && resp.success) {
        const tip = {
          creator: currentCreator.name,
          amount: amount,
          timestamp: Date.now(),
          txHash: resp.txHash || null
        };
        await saveTip(tip);
        showToast(`Tipped ${currentCreator.name} $${amount.toFixed(2)}`, 'success');
        checkAgentStatus(); // refresh balance
      } else {
        showToast(resp?.error || 'Tip failed', 'error');
      }
    } catch (err) {
      showToast('Could not reach agent', 'error');
    } finally {
      tipButton.disabled = false;
      updateTipButtonLabel();
    }
  }

  // --- Tip History ---
  async function saveTip(tip) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tips'], (result) => {
        const tips = result.tips || [];
        tips.unshift(tip);
        const trimmed = tips.slice(0, MAX_RECENT_TIPS);
        chrome.storage.local.set({ tips: trimmed }, () => {
          renderTips(trimmed);
          resolve();
        });
      });
    });
  }

  async function loadRecentTips() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tips'], (result) => {
        renderTips(result.tips || []);
        resolve();
      });
    });
  }

  function renderTips(tips) {
    tipCount.textContent = tips.length;
    if (tips.length === 0) {
      tipList.innerHTML = '<div class="tip-empty">No tips yet. Visit a Rumble creator to get started!</div>';
      return;
    }

    tipList.innerHTML = tips.map((tip) => {
      const timeAgo = formatTimeAgo(tip.timestamp);
      const txLink = tip.txHash
        ? `<a class="tip-item-tx" href="https://etherscan.io/tx/${escapeHtml(tip.txHash)}" target="_blank" title="View transaction">TX</a>`
        : '';
      return `
        <div class="tip-item">
          <div class="tip-item-left">
            <span class="tip-item-creator">${escapeHtml(tip.creator)}</span>
            <span class="tip-item-time">${timeAgo}</span>
          </div>
          <div class="tip-item-right">
            <span class="tip-item-amount">$${parseFloat(tip.amount).toFixed(2)}</span>
            ${txLink}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Events ---
  function bindEvents() {
    // Tip chips
    document.querySelectorAll('.btn-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-chip').forEach((b) => b.classList.remove('aerofyta-chip-active'));
        btn.classList.add('aerofyta-chip-active');
        selectedAmount = parseFloat(btn.dataset.amount);
        customAmount.value = '';
        updateTipButtonLabel();
      });
    });

    // Custom amount clears chip selection
    customAmount.addEventListener('input', () => {
      if (customAmount.value) {
        document.querySelectorAll('.btn-chip').forEach((b) => b.classList.remove('aerofyta-chip-active'));
      }
      updateTipButtonLabel();
    });

    // Tip button
    tipButton.addEventListener('click', sendTip);

    // Save settings
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Copy wallet address
    walletAddress.addEventListener('click', () => {
      const addr = walletAddress.title;
      if (addr && (addr.startsWith('0x') || addr.startsWith('UQ'))) {
        navigator.clipboard.writeText(addr).then(() => {
          showToast('Address copied', 'success');
        });
      }
    });
  }

  // --- API Helper ---
  async function fetchAgent(path, options = {}) {
    const url = settings.apiUrl + path;
    const resp = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(5000)
    });
    return resp.json();
  }

  // --- Utils ---
  function formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message, type = '') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast ' + type;
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // --- Boot ---
  document.addEventListener('DOMContentLoaded', init);
})();
