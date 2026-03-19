// AeroFyta Chrome Extension — Popup Controller

(function () {
  'use strict';

  // --- Constants ---
  const DEFAULT_API_URL = 'http://localhost:3001';
  const DEFAULT_TIP_AMOUNT = 5.00;
  const MAX_RECENT_TIPS = 4;

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
  const tipButton = $('#tipButton');
  const tipList = $('#tipList');
  const tipCount = $('#tipCount');
  const customAmount = $('#customAmount');
  const apiUrlInput = $('#apiUrl');
  const defaultTipInput = $('#defaultTip');
  const autoDetectInput = $('#autoDetect');
  const saveSettingsBtn = $('#saveSettings');

  let selectedAmount = DEFAULT_TIP_AMOUNT;
  let currentCreator = null;
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
    await detectCurrentCreator();
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

  // --- Creator Detection ---
  async function detectCurrentCreator() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || !tab.url.includes('rumble.com')) {
        creatorCard.style.display = 'none';
        return;
      }
      // Ask content script for creator info
      chrome.tabs.sendMessage(tab.id, { type: 'GET_CREATOR' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.creator) {
          creatorCard.style.display = 'none';
          return;
        }
        currentCreator = response.creator;
        showCreator(currentCreator);
      });
    } catch {
      creatorCard.style.display = 'none';
    }
  }

  function showCreator(creator) {
    creatorCard.style.display = 'block';
    creatorName.textContent = creator.name || 'Unknown';
    creatorChannel.textContent = creator.channel || '';
    creatorAvatar.textContent = (creator.name || '?')[0].toUpperCase();
  }

  // --- Tipping ---
  async function sendTip() {
    if (!currentCreator) {
      showToast('No creator detected on this page', 'error');
      return;
    }

    const amount = parseFloat(customAmount.value) || selectedAmount;
    if (amount <= 0) {
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
      tipButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L10.2 5.5L15 6.2L11.5 9.6L12.4 14.4L8 12.1L3.6 14.4L4.5 9.6L1 6.2L5.8 5.5L8 1Z" fill="currentColor"/></svg> Tip Creator';
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
      tipList.innerHTML = '<div class="tip-empty">No tips yet. Start tipping creators!</div>';
      return;
    }

    tipList.innerHTML = tips.map((tip) => {
      const timeAgo = formatTimeAgo(tip.timestamp);
      return `
        <div class="tip-item">
          <div class="tip-item-left">
            <span class="tip-item-creator">${escapeHtml(tip.creator)}</span>
            <span class="tip-item-time">${timeAgo}</span>
          </div>
          <span class="tip-item-amount">$${parseFloat(tip.amount).toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  // --- Events ---
  function bindEvents() {
    // Tip chips
    document.querySelectorAll('.btn-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-chip').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAmount = parseFloat(btn.dataset.amount);
        customAmount.value = '';
      });
    });

    // Custom amount clears chip selection
    customAmount.addEventListener('input', () => {
      if (customAmount.value) {
        document.querySelectorAll('.btn-chip').forEach((b) => b.classList.remove('active'));
      }
    });

    // Tip button
    tipButton.addEventListener('click', sendTip);

    // Save settings
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Copy wallet address
    walletAddress.addEventListener('click', () => {
      const addr = walletAddress.title;
      if (addr && addr.startsWith('0x')) {
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
