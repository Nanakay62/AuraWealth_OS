/* ============================================================
   AURA WEALTH OS - HARDENING PATCH v2
   Corrections after reviewing the real index.html / styles.css.
   Load this INSTEAD of the v1 aura-hardening.js (it supersedes it:
   same functions, corrected DOM ids, plus the sign-out fix below).
   Load order: app.js, supabase.js, aura-hardening-v2.js
   ============================================================ */

(function () {

/* ------------------------------------------------------------
   NEW: FIX FOR CONFIRMED DOUBLE-BIND ON #signOutBtn
   ------------------------------------------------------------
   Verified against your real HTML: bindEvents() does
     document.getElementById('signOutBtn').addEventListener('click', handleSignOut)
   AND the body-level delegated click handler separately matches
   `#sign-out-btn, #signOutBtn, [data-action="sign-out"]` and also
   calls handleSignOut(). Same button, same handler, bound twice:
   one click fires sign-out logic twice (double toast, double
   auth.signOut() call, double state wipe).

   Fix: clone-and-replace the node to strip ALL existing listeners
   (both the direct one and whatever else may be attached), then
   reattach exactly one. This is safer than trying to unbind a
   specific anonymous handler reference we don't have access to.
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', dedupeSignOutButton);
if (document.readyState !== 'loading') dedupeSignOutButton();

function dedupeSignOutButton() {
  const btn = document.getElementById('signOutBtn');
  if (!btn || btn.dataset.hardeningDeduped) return;
  const clone = btn.cloneNode(true); // strips all previously-attached listeners
  clone.dataset.hardeningDeduped = 'true';
  btn.parentNode.replaceChild(clone, btn);
  clone.addEventListener('click', () => {
    if (typeof window.handleSignOut === 'function') window.handleSignOut();
  });
}

// Belt-and-braces: even if some other path calls handleSignOut() twice
// in rapid succession (e.g. a future code change re-introduces the
// collision), this guard makes concurrent calls a no-op rather than
// re-running the whole purge/sign-out flow twice.
const _origHandleSignOut = window.handleSignOut;
let _signOutInFlight = false;
window.handleSignOut = async function guardedHandleSignOut() {
  if (_signOutInFlight) return;
  _signOutInFlight = true;
  try {
    if (typeof _origHandleSignOut === 'function') {
      await _origHandleSignOut();
    }
  } finally {
    setTimeout(() => { _signOutInFlight = false; }, 500);
  }
};

/* ------------------------------------------------------------
   1. STRICT NUMERICAL SANITATION
   ------------------------------------------------------------ */
window.parseNum = function parseNum(v) {
  if (typeof v === 'number') return isNaN(v) || !isFinite(v) ? 0 : v;
  if (v === null || v === undefined) return 0;
  const cleaned = String(v).replace(/[GH₵$,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

window.round2 = function round2(v) {
  return Math.round((parseNum(v) + Number.EPSILON) * 100) / 100;
};

window.money = function money(v) {
  return parseNum(v);
};

window.calculateDailyAllowance = function calculateDailyAllowance(remainingBudget, cycleEnd, now) {
  const budget = parseNum(remainingBudget);
  now = now instanceof Date && !isNaN(now) ? now : new Date();
  const end = cycleEnd instanceof Date && !isNaN(cycleEnd) ? cycleEnd : null;
  if (!end) return round2(Math.max(0, budget));
  const msPerDay = 864e5;
  const rawDaysLeft = Math.ceil((end - now) / msPerDay);
  const daysLeft = Math.max(1, rawDaysLeft);
  const allowance = budget / daysLeft;
  return isFinite(allowance) ? round2(allowance) : 0;
};

/* ------------------------------------------------------------
   2. SESSION ISOLATION & MEMORY PURGE
   ------------------------------------------------------------
   CORRECTED: the id list below is now built from your actual
   index.html rather than assumed generic names.
   ------------------------------------------------------------ */

const SENSITIVE_DOM_IDS = [
  // Net worth / dashboard hero
  'net-worth-val', 'netWorthSecondary', 'liquidCash', 'lockedInv', 'salaryDisplay',
  // Safe-to-spend / daily allowance
  'remaining-today-val', 'todayLimitBadge', 'todaySpentBadge', 'staticDailyTarget',
  'activeSpendTarget', 'activeSpendSpent', 'activeSpendRemaining',
  // Cycle / cashflow
  'cycleIncomeVal', 'cycleExpVal', 'netCashFlowVal', 'savingsRatePct',
  'spentAmount', 'spendLimit',
  // Cash & Accounts breakdown (dashboard card)
  'bankCashVal', 'mtnMomoCashVal', 'telecelCashVal', 'atMoneyCashVal',
  'momoCashVal', 'homeCashVal', 'usdHomeCashVal', 'usdHomeCashGhsVal',
  // Accounts / Vaults view
  'vaultBankVal', 'vaultMtnMomoVal', 'vaultTelecelCashVal', 'vaultAtMoneyVal',
  'vaultMomoVal', 'vaultHomeVal', 'vaultUsdVal', 'vaultUsdGhsVal',
  'quickTransferBankVal', 'quickTransferMomoVal',
  // Asset totals
  'tbillTotal', 'gcbTotal', 'stockTotal',
  // List/grid containers
  'recentList', 'expList', 'incList', 'trfList',
  'receivablesList', 'payablesList', 'totalReceivablesBadge', 'totalPayablesBadge',
  'fixedGrid', 'stocksGrid', 'reportsMonthGrid', 'reportsCatGrid',
  'reminderList', 'donutCenter', 'allocLegend',
  // Stats row
  'todayTotal', 'weekTotal', 'cycleIncomeTotal', 'monthTotal',
  'mobileTodaySpent', 'mobileWeekSpent'
];

function purgeSensitiveDom() {
  SENSITIVE_DOM_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
}

function purgeUserLocalStorage() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !key.startsWith('aura_guest_')) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

window.clearAllData = function clearAllData() {
  purgeUserLocalStorage();
  if (typeof defaultState !== 'undefined') {
    state = JSON.parse(JSON.stringify(defaultState));
  }
  purgeSensitiveDom();
  if (typeof loadSettingsUI === 'function') loadSettingsUI();
  if (typeof renderAll === 'function') renderAll();
  if (typeof checkOnboarding === 'function') checkOnboarding();
  if (typeof toast === 'function') toast('All data reset to clean slate', 'info');
};

// Wrap handleSignOut (already re-wrapped above for the guard) once more
// to purge the DOM synchronously before the async sign-out call resolves.
const _guardedHandleSignOut = window.handleSignOut;
window.handleSignOut = async function purgeThenSignOut() {
  purgeSensitiveDom();
  if (typeof _guardedHandleSignOut === 'function') {
    await _guardedHandleSignOut();
  }
  const gateway = document.getElementById('authGatewayModalOverlay');
  if (gateway) gateway.classList.add('active');
};

/* ------------------------------------------------------------
   3. OFFLINE SYNC RETRY QUEUE
   ------------------------------------------------------------ */
const SYNC_QUEUE_KEY = 'aura_sync_queue_v1';

function loadSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}
function saveSyncQueue(queue) {
  try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue)); }
  catch (e) { console.warn('Sync queue persist failed:', e); }
}
window.enqueueSyncOp = function enqueueSyncOp(table, op, row) {
  const queue = loadSyncQueue();
  queue.push({ table, op, row, queued_at: new Date().toISOString() });
  saveSyncQueue(queue);
};
window.flushSyncQueue = async function flushSyncQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  let queue = loadSyncQueue();
  if (queue.length === 0) return;
  const remaining = [];
  for (const item of queue) {
    try {
      if (typeof supaMirror === 'function') {
        await supaMirror(item.table, item.op, item.row);
      }
    } catch (e) { remaining.push(item); }
  }
  saveSyncQueue(remaining);
  if (remaining.length < queue.length && typeof toast === 'function') {
    toast(`Synced ${queue.length - remaining.length} queued change(s)`, 'success');
  }
};
window.addEventListener('online', () => {
  if (typeof toast === 'function') toast('Back online - syncing queued changes...', 'info');
  flushSyncQueue();
});
window.addEventListener('offline', () => {
  if (typeof toast === 'function') toast('You are offline. Changes will sync automatically when reconnected.', 'info');
});
window.addEventListener('load', () => setTimeout(flushSyncQueue, 1500));

/* ------------------------------------------------------------
   5. LOCALSTORAGE GUARDS
   ------------------------------------------------------------ */
window.safeLocalStorage = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { console.warn(`getItem('${key}') blocked:`, e); return null; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch (e) { console.warn(`setItem('${key}') blocked:`, e); return false; } },
  remove(key) { try { localStorage.removeItem(key); return true; } catch (e) { console.warn(`removeItem('${key}') blocked:`, e); return false; } }
};

const STATE_SHAPE_DEFAULTS = { hasOnboarded: false, expenses: [], incomes: [], investments: [], transfers: [], debts: [], history: [], settings: {} };

function repairStateShape(parsed) {
  if (!parsed || typeof parsed !== 'object') return JSON.parse(JSON.stringify(STATE_SHAPE_DEFAULTS));
  const repaired = { ...STATE_SHAPE_DEFAULTS, ...parsed };
  ['expenses', 'incomes', 'investments', 'transfers', 'debts', 'history'].forEach(k => {
    if (!Array.isArray(repaired[k])) repaired[k] = [];
  });
  if (typeof repaired.settings !== 'object' || repaired.settings === null) repaired.settings = {};
  return repaired;
}

window.loadFromStorage = function loadFromStorage() {
  const storageKeyVal = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : 'aura_wealth_os_data';
  const raw = safeLocalStorage.get(storageKeyVal);
  let p = null;
  if (raw) {
    try { p = repairStateShape(JSON.parse(raw)); }
    catch (e) { console.warn('Corrupted localStorage JSON - repairing with defaults:', e); p = JSON.parse(JSON.stringify(STATE_SHAPE_DEFAULTS)); }
  }
  if (p) {
    state.hasOnboarded = p.hasOnboarded || false;
    state.expenses = p.expenses || [];
    state.incomes = p.incomes || [];
    state.investments = p.investments || [];
    state.transfers = p.transfers || [];
    state.debts = p.debts || [];
    state.history = p.history || [];
    state.settings = { ...(typeof defaultState !== 'undefined' ? defaultState.settings : {}), ...(p.settings || {}) };
    state.pricesAsOf = p.pricesAsOf || null;
  } else if (typeof defaultState !== 'undefined') {
    state = JSON.parse(JSON.stringify(defaultState));
  }
  const guestBudget = safeLocalStorage.get('aura_guest_budget');
  const userBudget = safeLocalStorage.get('aura_user_budget');
  const effectiveBudget = parseNum((state.authUser || state.user) ? (userBudget || guestBudget) : (guestBudget || userBudget));
  if (effectiveBudget > 0 && (!state.settings.spendingLimit || state.settings.spendingLimit === 0)) {
    state.settings.spendingLimit = effectiveBudget;
  }
  state.userConfig = state.userConfig || {};
  state.userConfig.budget = state.settings.spendingLimit || effectiveBudget || 0;
};

/* ------------------------------------------------------------
   6. DEBOUNCE UTILITY
   ------------------------------------------------------------ */
window.debounce = function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

document.addEventListener('DOMContentLoaded', () => {
  const limInput = document.getElementById('setLimit');
  if (limInput) {
    const debouncedPreview = debounce(() => {
      const val = parseNum(limInput.value);
      const progPct = document.getElementById('progressPct');
      if (progPct) {
        const cycleExp = typeof sumExp === 'function' && typeof getPaydayCycleExpenses === 'function' ? sumExp(getPaydayCycleExpenses()) : 0;
        const pct = val > 0 ? (cycleExp / val) * 100 : 0;
        progPct.textContent = `${pct.toFixed(0)}% used (preview)`;
      }
    }, 300);
    limInput.addEventListener('input', debouncedPreview);
  }
});

/* ------------------------------------------------------------
   7. XSS DEFENSE
   ------------------------------------------------------------ */
window.escapeHtml = function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

window.renderRecent = function renderRecent() {
  const recent = state.expenses.slice(0, 5);
  const container = document.getElementById('recentList');
  if (!container) return;
  if (recent.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:24px;color:var(--text-m);font-size:13px;background:var(--glass);">No entries recorded yet.</div>`;
    return;
  }
  container.innerHTML = recent.map(e => {
    const m = (typeof CAT_META !== 'undefined' && CAT_META[e.category]) ? CAT_META[e.category] : (typeof CAT_META !== 'undefined' ? CAT_META.misc : { label: e.category, bg: 'rgba(255,255,255,0.1)', color: '#fff', icon: 'misc' });
    const iconContent = (typeof I !== 'undefined' && I[m.icon]) ? I[m.icon] : '•';
    const fmtVal = typeof fmt === 'function' ? fmt(e.amount) : `GH₵${Number(e.amount).toFixed(2)}`;
    return `<div class="recent-item">
      <div class="recent-icon" style="background:${m.bg};color:${m.color}">${iconContent}</div>
      <div class="recent-info"><div class="recent-cat">${escapeHtml(m.label)}</div><div class="recent-notes">${escapeHtml(e.notes) || '-'}</div></div>
      <div class="recent-amt">${fmtVal}</div>
    </div>`;
  }).join('');
};

window.renderDebts = function renderDebts() {
  const recList = document.getElementById('receivablesList');
  const payList = document.getElementById('payablesList');
  const recBadge = document.getElementById('totalReceivablesBadge');
  const payBadge = document.getElementById('totalPayablesBadge');
  if (!recList && !payList) return;

  const lentItems = (state.debts || []).filter(d => d.direction === 'lent');
  const borrowedItems = (state.debts || []).filter(d => d.direction === 'borrowed');
  const totalLentRem = lentItems.reduce((s, d) => s + Math.max(0, d.amount - (d.amount_repaid || 0)), 0);
  const totalBorrowRem = borrowedItems.reduce((s, d) => s + Math.max(0, d.amount - (d.amount_repaid || 0)), 0);
  const fmtLent = typeof fmt === 'function' ? fmt(totalLentRem) : `GH₵${totalLentRem.toFixed(2)}`;
  const fmtBorrow = typeof fmt === 'function' ? fmt(totalBorrowRem) : `GH₵${totalBorrowRem.toFixed(2)}`;
  if (recBadge) recBadge.textContent = fmtLent;
  if (payBadge) payBadge.textContent = fmtBorrow;

  const renderDebtItem = (d, isLent) => {
    const remaining = Math.max(0, d.amount - (d.amount_repaid || 0));
    const statusColor = d.status === 'settled' ? 'var(--emerald)' : d.status === 'partial' ? 'var(--gold-d)' : 'var(--rose)';
    const accIcon = (typeof I !== 'undefined' && I.accounts) ? I.accounts : '💳';
    const fmtRem = typeof fmt === 'function' ? fmt(remaining) : `GH₵${remaining.toFixed(2)}`;
    const fmtRepaid = typeof fmt === 'function' ? fmt(d.amount_repaid || 0) : `GH₵${Number(d.amount_repaid || 0).toFixed(2)}`;
    const fmtTotal = typeof fmt === 'function' ? fmt(d.amount) : `GH₵${Number(d.amount).toFixed(2)}`;
    const dateStr = d.due_date ? (typeof fmtDate === 'function' ? fmtDate(d.due_date) : d.due_date) : 'N/A';
    return `
      <div class="exp-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="exp-icon" style="background:${isLent ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)'}; color:${isLent ? 'var(--emerald)' : 'var(--rose)'}; border-radius:10px; padding:8px;">${accIcon}</div>
          <div>
            <div style="font-weight:700; font-size:14px; display:flex; gap:8px; align-items:center;">
              <span>${escapeHtml(d.counterparty)}</span>
              <span style="font-size:10px; padding:2px 8px; border-radius:6px; background:${statusColor}25; color:${statusColor}; font-weight:800; text-transform:uppercase;">${escapeHtml(d.status)}</span>
            </div>
            <div style="font-size:11px; color:var(--text-m); margin-top:2px;">${escapeHtml(d.notes) || 'No notes'} • Due: ${dateStr}</div>
            <div style="font-size:11px; color:var(--text-d);">Paid: ${fmtRepaid} / Total: ${fmtTotal}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:15px; font-weight:700; color:${isLent ? 'var(--emerald)' : 'var(--rose)'}">${fmtRem}</div>
          <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:4px;">
            ${d.status !== 'settled' ? `<button class="btn btn-ghost" style="font-size:10px; padding:3px 8px;" onclick="window.openRepayDebtModal('${d.id}')">Repay</button>` : ''}
            <button class="btn btn-ghost edit-btn" style="font-size:10px; padding:3px 8px;" data-action="edit-debt" data-id="${d.id}" onclick="window.editDebt('${d.id}')" title="Edit Debt">✏️ Edit</button>
            <button class="btn btn-ghost" style="font-size:10px; padding:3px 8px; color:var(--rose);" onclick="window.deleteDebt('${d.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  };
  if (recList) recList.innerHTML = lentItems.length === 0 ? '<div style="padding:20px; text-align:center; color:var(--text-d); font-size:13px;">No active receivables</div>' : lentItems.map(d => renderDebtItem(d, true)).join('');
  if (payList) payList.innerHTML = borrowedItems.length === 0 ? '<div style="padding:20px; text-align:center; color:var(--text-d); font-size:13px;">No active payables</div>' : borrowedItems.map(d => renderDebtItem(d, false)).join('');
};

window.renderTransfers = function renderTransfers() {
  const list = document.getElementById('trfList');
  if (!list) return;
  if (!state.transfers || state.transfers.length === 0) {
    list.innerHTML = `<div class="empty-state"><span>No internal transfers recorded yet.</span></div>`;
    return;
  }
  const accNames = { bank: 'Bank Account', momo: 'Mobile Money (MoMo)', home_cash: 'Physical Home Cash', usd_home_cash: 'USD Home Cash' };
  const trfIcon = (typeof I !== 'undefined' && (I.transfer || I.misc)) ? (I.transfer || I.misc) : '🔄';
  const trashIcon = (typeof I !== 'undefined' && I.trash) ? I.trash : '🗑️';
  list.innerHTML = state.transfers.map(t => {
    const fmtAmt = typeof fmt === 'function' ? fmt(t.amount) : `GH₵${Number(t.amount).toFixed(2)}`;
    const dateStr = typeof fmtDate === 'function' ? fmtDate(t.created_at) : t.created_at;
    return `
    <div class="exp-item">
      <div class="exp-icon" style="background:rgba(251,191,36,0.15); color:var(--gold);">${trfIcon}</div>
      <div class="exp-info">
        <div class="exp-cat">${escapeHtml(accNames[t.from_account] || t.from_account)} ➔ ${escapeHtml(accNames[t.to_account] || t.to_account)}</div>
        <div class="exp-notes">${escapeHtml(t.notes) || 'Internal Transfer'} • ${dateStr}</div>
      </div>
      <div class="exp-amount" style="color:var(--gold); font-weight:700;">${fmtAmt}</div>
      <button class="icon-btn danger" onclick="deleteTransfer('${t.id}')" title="Delete Transfer">${trashIcon}</button>
    </div>
  `;
  }).join('');
};

if (typeof window.addExpense === 'function') {
  const _origAddExpense = window.addExpense;
  window.addExpense = function (exp) { if (exp && typeof exp.notes === 'string') exp.notes = exp.notes.slice(0, 500); return _origAddExpense(exp); };
}
if (typeof window.addIncome === 'function') {
  const _origAddIncome = window.addIncome;
  window.addIncome = function (inc) { if (inc && typeof inc.notes === 'string') inc.notes = inc.notes.slice(0, 500); return _origAddIncome(inc); };
}

console.log('[Aura Hardening v2] Sign-out dedupe, corrected DOM purge list, numerics, offline queue, storage guards, debounce, and XSS escaping are active.');

})();
