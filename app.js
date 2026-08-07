/* ============================================================
   AURA WEALTH OS - PWA ENGINE & TRUE ZERO SLATE CASH FLOW ENGINE
   ============================================================ */

// Local storage persistence enabled - user inputs strictly retained

const DEFAULT_SUPABASE_URL = 'https://xzaljrdrtfxlvgmilojp.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YWxqcmRydGZ4bHZnbWlsb2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3Nzg4ODQsImV4cCI6MjEwMTM1NDg4NH0.yy97AayWEsVVvgcxPena31C-_zDaTkNw0ZjhoVa7BCA';

const STORAGE_KEY = 'aura_wealth_v2';
let deferredPrompt = null;

// SVG Icons
const I = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>',
  accounts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  expenses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 10h8"/><path d="M8 14h5"/></svg>',
  investments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 6-6"/><path d="M17 8h4v4"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  transport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3V6a1 1 0 0 1 1-1h11a2 2 0 0 1 2 2v10h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/></svg>',
  bills: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
  shopping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  misc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>',
  income: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  transfer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  trendingDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>',
  debts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
};

const CAT_META = {
  food: { label: 'Food', icon: 'food', color: 'var(--orange)', bg: 'rgba(251,146,60,0.15)' },
  transport: { label: 'Transport', icon: 'transport', color: 'var(--blue)', bg: 'rgba(96,165,250,0.15)' },
  bills: { label: 'Bills', icon: 'bills', color: 'var(--purple)', bg: 'rgba(167,139,250,0.15)' },
  shopping: { label: 'Shopping', icon: 'shopping', color: 'var(--pink)', bg: 'rgba(244,114,182,0.15)' },
  data_airtime: { label: 'Data & Airtime', icon: 'bills', color: '#0284c7', bg: 'rgba(2,132,199,0.15)' },
  misc: { label: 'Misc', icon: 'misc', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' }
};

const INC_META = {
  salary: { label: 'Salary / Paycheck', color: 'var(--emerald)' },
  savings: { label: 'Savings', color: 'var(--gold)' },
  dividends: { label: 'Stock Dividends', color: 'var(--gold)' },
  tbill_yield: { label: 'T-Bill Yield', color: 'var(--indigo)' },
  business: { label: 'Business / Side-Hustle', color: 'var(--blue)' },
  gift: { label: 'Gift / Bonus', color: 'var(--pink)' },
  misc: { label: 'Misc Income', color: '#94a3b8' }
};

// Shared GSE Stock Cache Fallback
const GSE_STOCKS = [
  { ticker: 'MTNGH', name: 'Scancom PLC (MTN)', price: 1.15 },
  { ticker: 'GCB', name: 'GCB Bank PLC', price: 8.50 },
  { ticker: 'SIC', name: 'SIC Insurance PLC', price: 1.42 },
  { ticker: 'TOTAL', name: 'TotalEnergies Ghana', price: 9.20 },
  { ticker: 'ETI', name: 'Ecobank Transnational', price: 0.16 },
  { ticker: 'CAL', name: 'CalBank PLC', price: 0.65 },
  { ticker: 'SCB', name: 'Standard Chartered Bank', price: 17.50 },
  { ticker: 'SOGEGH', name: 'Societe Generale Ghana', price: 1.55 }
];

// STRICT TRUE ZERO SLATE STATE
const defaultState = {
  hasOnboarded: false,
  currentView: 'dashboard',
  netWorthMode: 'total',
  expenses: [],
  incomes: [],
  transfers: [],
  debts: [],
  investments: [],
  history: [],
  gseCache: GSE_STOCKS,
  selectedCat: 'food',
  selectedType: 'tbill',
  currentTab: 'fixed',
  historyTab: 'expenses',
  displayCurrency: 'GHS',
  authUser: null,
  pricesAsOf: null,
  settings: {
    monthlySalary: 0,
    spendingLimit: 0,
    paydayDay: 25,
    cashBalance: 0,
    bankCash: 0,
    mtnMomoCash: 0,
    telecelCash: 0,
    atMoneyCash: 0,
    homeCash: 0,
    usdHomeCash: 0,
    usdRate: 0.065
  }
};

let state = JSON.parse(JSON.stringify(defaultState));
let supabaseClient = null;

// Helper Functions
const money = (v) => Number(v || 0);
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

function fmtGhs(amt) { return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amt || 0); }
function fmtUsd(amt) { const usdValue = money(amt) * money(state.settings.usdRate || 0.065); return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usdValue || 0); }
function fmt(amt) { return state.displayCurrency === 'USD' ? fmtUsd(amt) : fmtGhs(amt); }
function fmtCompact(amt) {
  const val = state.displayCurrency === 'USD' ? money(amt) * money(state.settings.usdRate || 0.065) : money(amt);
  const sym = state.displayCurrency === 'USD' ? '$' : 'GH₵';
  if (val >= 1e6) return `${sym}${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${sym}${(val / 1e3).toFixed(1)}K`;
  return fmt(amt);
}

function fmtDate(d) { return new Date(d).toLocaleDateString('en-GH', { weekday: 'short', month: 'short', day: 'numeric' }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' }); }
function daysBetween(d1, d2) { return Math.ceil((new Date(d2) - new Date(d1)) / 864e5); }

function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'success' ? I.check : type === 'error' ? I.alert : I.bell;
  const color = type === 'success' ? 'var(--emerald)' : type === 'error' ? 'var(--rose)' : 'var(--indigo)';
  el.innerHTML = `<span style="color:${color}">${icon}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastIn 0.3s var(--smooth) reverse';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// Dynamic Time-of-Day Greeting Helper
function getDynamicGreeting(userName) {
  const hour = new Date().getHours();
  let prefix = 'Welcome back';
  if (hour >= 5 && hour < 12) prefix = 'Good morning';
  else if (hour >= 12 && hour < 17) prefix = 'Good afternoon';
  else if (hour >= 17 && hour < 22) prefix = 'Good evening';
  else prefix = 'Welcome back';

  return `${prefix}, ${userName}`;
}

function getUserDisplayName() {
  if (!state.authUser) return 'Guest';
  const meta = state.authUser.user_metadata;
  if (meta && meta.full_name) return meta.full_name;
  if (meta && meta.name) return meta.name;
  if (state.authUser.email) return state.authUser.email.split('@')[0];
  return 'User';
}

function updateGreeting() {
  const name = getUserDisplayName();
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) greetingEl.textContent = getDynamicGreeting(name);
  const dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GH', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Payday Cycle Logic & Incomes
function getPaydayCycle() {
  const now = new Date();
  const payday = Math.min(31, Math.max(1, parseInt(state.settings.paydayDay || 25)));
  
  let cycleStart = new Date(now.getFullYear(), now.getMonth(), payday);
  if (now < cycleStart) {
    cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, payday);
  }
  
  let cycleEnd = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, payday - 1, 23, 59, 59);
  const daysTotal = Math.max(1, daysBetween(cycleStart, cycleEnd));
  const daysRemaining = Math.max(1, daysBetween(now, cycleEnd));
  
  return { cycleStart, cycleEnd, daysTotal, daysRemaining, payday };
}

function getPaydayCycleExpenses() {
  const { cycleStart, cycleEnd } = getPaydayCycle();
  return state.expenses.filter(e => {
    const d = new Date(e.created_at);
    return d >= cycleStart && d <= cycleEnd;
  });
}

function getPaydayCycleIncomes() {
  const { cycleStart, cycleEnd } = getPaydayCycle();
  return state.incomes.filter(i => {
    const d = new Date(i.created_at);
    return d >= cycleStart && d <= cycleEnd;
  });
}

function getTotalPaydayIncome() {
  const loggedCycleIncomes = getPaydayCycleIncomes();
  const customTotal = sumExp(loggedCycleIncomes);
  return customTotal > 0 ? customTotal : money(state.settings.monthlySalary);
}

// Theme Handling
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#eef0f5' : '#0f1117');
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerHTML = theme === 'light' ? I.moon : I.sun;
  const sw = document.getElementById('lightModeSwitch');
  if (sw) sw.checked = theme === 'light';
  const thumb = document.getElementById('switchThumb');
  const track = document.getElementById('switchTrack');
  if (thumb && track) {
    if (theme === 'light') { thumb.style.left = '23px'; track.style.background = 'var(--gold-g)'; }
    else { thumb.style.left = '3px'; track.style.background = 'var(--glass-h)'; }
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem('aura_theme', next);
  applyTheme(next);
}

function initTheme() {
  const saved = localStorage.getItem('aura_theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(saved || (prefersLight ? 'light' : 'dark'));
}

// Explicit Clear All Data Storage Utility
function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('aura_wealth_data');
  localStorage.clear();
  state = JSON.parse(JSON.stringify(defaultState));
  loadSettingsUI();
  renderAll();
  checkOnboarding();
  toast('All data reset to clean slate', 'info');
}

// Local Storage Persistence (Clean Slate Initial State)
function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const p = JSON.parse(data);
      state.hasOnboarded = p.hasOnboarded || false;
      state.expenses = p.expenses || [];
      state.incomes = p.incomes || [];
      state.investments = p.investments || [];
      state.transfers = p.transfers || [];
      state.debts = p.debts || [];
      state.history = p.history || [];
      state.settings = { ...defaultState.settings, ...(p.settings || {}) };
      state.pricesAsOf = p.pricesAsOf || null;
    } catch (e) {
      state = JSON.parse(JSON.stringify(defaultState));
    }
  } else {
    state = JSON.parse(JSON.stringify(defaultState));
  }

  // Load guest/user budget state to prevent overwrite during re-renders
  const guestBudget = localStorage.getItem('aura_guest_budget');
  const userBudget = localStorage.getItem('aura_user_budget');
  const effectiveBudget = parseFloat((state.authUser || state.user) ? (userBudget || guestBudget) : (guestBudget || userBudget)) || 0;

  if (effectiveBudget > 0 && (!state.settings.spendingLimit || state.settings.spendingLimit === 0)) {
    state.settings.spendingLimit = effectiveBudget;
  }
  state.userConfig = state.userConfig || {};
  state.userConfig.budget = state.settings.spendingLimit || effectiveBudget || 0;
}

async function syncProfileToSupabase() {
  if (!supabaseClient || !state.authUser) return;
  try {
    const alloc = state.settings.payAllocation || { tbills: 500, savings: 300, momo: 1100 };
    const payload = {
      user_id: state.authUser.id,
      has_onboarded: state.hasOnboarded,
      monthly_salary: money(state.settings.monthlySalary),
      spending_limit: money(state.settings.spendingLimit),
      payday_day: parseInt(state.settings.paydayDay) || 25,
      bank_cash: money(state.settings.bankCash || state.settings.cashBalance),
      mtn_momo_cash: money(state.settings.mtnMomoCash),
      telecel_cash: money(state.settings.telecelCash),
      at_money_cash: money(state.settings.atMoneyCash),
      home_cash: money(state.settings.homeCash),
      usd_home_cash: money(state.settings.usdHomeCash),
      usd_rate: money(state.settings.usdRate || 0.065),
      pay_allocation_tbills: money(alloc.tbills),
      pay_allocation_savings: money(alloc.savings),
      pay_allocation_momo: money(alloc.momo),
      last_pay_allocation_cycle: state.settings.lastPayAllocationCycle || null,
      updated_at: new Date().toISOString()
    };
    await supabaseClient.from('profiles').upsert(payload, { onConflict: 'user_id' });
  } catch (e) {
    console.warn('Supabase profile sync fallback:', e);
  }
}

function saveToStorage() {
  recordDailySnapshot();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    hasOnboarded: state.hasOnboarded,
    expenses: state.expenses,
    incomes: state.incomes,
    investments: state.investments,
    transfers: state.transfers,
    debts: state.debts,
    history: state.history,
    settings: state.settings,
    pricesAsOf: state.pricesAsOf
  }));
  if (state.authUser) {
    syncProfileToSupabase();
  }
}

function loadSampleData(save = true) {
  state.expenses = [];
  state.incomes = [];
  state.investments = [];
  state.history = [];

  if (save) {
    saveToStorage();
    toast('Data reset to clean slate', 'info');
  }
}

function recordDailySnapshot() {
  const todayKey = new Date().toISOString().split('T')[0];
  const currentNw = getNetWorth();
  const existingIndex = state.history.findIndex(h => h.date === todayKey);
  if (existingIndex >= 0) {
    state.history[existingIndex].netWorth = currentNw;
  } else {
    state.history.push({ date: todayKey, netWorth: currentNw });
  }
  if (state.history.length > 30) state.history = state.history.slice(-30);
}

function openGatewayModal() {
  const gateway = document.getElementById('authGatewayModalOverlay') || document.getElementById('auth-gateway-modal');
  if (gateway) gateway.classList.add('active');
}

function closeGatewayModal() {
  const gateway = document.getElementById('authGatewayModalOverlay') || document.getElementById('auth-gateway-modal');
  if (gateway) gateway.classList.remove('active');
}

function checkGateway() {
  const onboardModal = document.getElementById('onboardingModalOverlay') || document.getElementById('onboarding-modal');
  if (state.authUser || state.hasOnboarded) {
    closeGatewayModal();
    if (onboardModal) onboardModal.classList.remove('active');
    return;
  }
  // Show Initial Entry Gateway Modal by default on unauthenticated first launch
  if (onboardModal) onboardModal.classList.remove('active');
  openGatewayModal();
}

function checkOnboarding() {
  checkGateway();
}

// Supabase Auth & Multi-User State Engine
function initSupabase() {
  if (!window.supabase) return;
  try {
    supabaseClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
    if (window.auraSyncEngine) window.auraSyncEngine.setClient(supabaseClient);

    supabaseClient.auth.getSession().then(({ data }) => {
      if (data && data.session) {
        setAuthUser(data.session.user);
        closeGatewayModal();
      } else {
        checkGateway();
      }
    });

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        setAuthUser(session.user);
        await hydrateSupabase();
        closeGatewayModal();
      } else {
        setAuthUser(null);
        loadFromStorage();
        renderAll();
        checkGateway();
      }
    });

    fetchSharedGseStockCache();
  } catch (e) {
    console.warn('Supabase offline mode:', e);
  }
}

async function setAuthUser(user) {
  state.authUser = user;
  state.user = user;
  const guestBanner = document.getElementById('guestBanner');
  const nameEl = document.getElementById('userName');
  const avatarEl = document.getElementById('userAvatar');
  const statusEl = document.getElementById('userStatus');
  const setAccountName = document.getElementById('settingsAccountName');
  const setAccountStatus = document.getElementById('settingsAccountStatus');
  const signOutBtn = document.getElementById('signOutBtn');

  const displayName = getUserDisplayName();
  updateGreeting();

  if (user) {
    if (guestBanner) guestBanner.style.display = 'none';
    if (nameEl) nameEl.textContent = displayName;
    if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();
    if (statusEl) statusEl.textContent = 'Cloud Synchronized';
    if (setAccountName) setAccountName.textContent = user.email || displayName;
    if (setAccountStatus) setAccountStatus.textContent = 'Authenticated & Syncing via Supabase RLS';
    if (signOutBtn) signOutBtn.style.display = 'block';

    if (window.auraSyncEngine && window.auraSyncEngine.performTimestampSync) {
      await window.auraSyncEngine.performTimestampSync(user.id, state, saveToStorage);
    }
    renderAll();
  } else {
    if (guestBanner) guestBanner.style.display = 'flex';
    if (nameEl) nameEl.textContent = 'Guest';
    if (avatarEl) avatarEl.textContent = 'G';
    if (statusEl) statusEl.textContent = 'Personal (Local)';
    if (setAccountName) setAccountName.textContent = 'Guest (Local Profile)';
    if (setAccountStatus) setAccountStatus.textContent = 'Data saved locally on this device';
    if (signOutBtn) signOutBtn.style.display = 'none';
  }
}

function mergeById(cloudArr, localArr) {
  const map = new Map();
  (localArr || []).forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  (cloudArr || []).forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

async function hydrateSupabase() {
  if (!supabaseClient || !state.authUser) return;
  try {
    const [expensesRes, investmentsRes, incomesRes, transfersRes, debtsRes, profileRes] = await Promise.all([
      supabaseClient.from('expenses').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
      supabaseClient.from('investments').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
      supabaseClient.from('incomes').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
      supabaseClient.from('transfers').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
      supabaseClient.from('debts').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
      supabaseClient.from('profiles').select('*').eq('user_id', state.authUser.id).maybeSingle()
    ]);

    // Non-destructive merge: local records not yet in cloud are preserved
    state.expenses = mergeById(expensesRes.data, state.expenses);
    state.investments = mergeById(investmentsRes.data, state.investments);
    state.incomes = mergeById(incomesRes.data, state.incomes);
    if (transfersRes && transfersRes.data) state.transfers = mergeById(transfersRes.data, state.transfers);
    if (debtsRes && debtsRes.data) state.debts = mergeById(debtsRes.data, state.debts);

    // Auto-retry sync for local records missing from the cloud
    const cloudExpIds = new Set((expensesRes.data || []).map(e => e.id));
    (state.expenses || []).filter(e => e.id && !cloudExpIds.has(e.id)).forEach(e => supaMirror('expenses', 'insert', e));

    const cloudIncIds = new Set((incomesRes.data || []).map(i => i.id));
    (state.incomes || []).filter(i => i.id && !cloudIncIds.has(i.id)).forEach(i => supaMirror('incomes', 'insert', i));

    const cloudInvIds = new Set((investmentsRes.data || []).map(inv => inv.id));
    (state.investments || []).filter(inv => inv.id && !cloudInvIds.has(inv.id)).forEach(inv => supaMirror('investments', 'insert', inv));

    if (profileRes && profileRes.data) {
      const p = profileRes.data;
      state.hasOnboarded = p.has_onboarded !== undefined ? p.has_onboarded : true;
      state.settings.monthlySalary = parseFloat(p.monthly_salary) || 0;
      state.settings.spendingLimit = parseFloat(p.spending_limit) || 0;
      state.settings.paydayDay = parseInt(p.payday_day) || 25;
      state.settings.bankCash = parseFloat(p.bank_cash) || 0;
      state.settings.cashBalance = parseFloat(p.bank_cash) || 0;
      state.settings.mtnMomoCash = p.mtn_momo_cash !== undefined ? (parseFloat(p.mtn_momo_cash) || 0) : (parseFloat(p.momo_cash) || 0);
      state.settings.telecelCash = parseFloat(p.telecel_cash) || 0;
      state.settings.atMoneyCash = parseFloat(p.at_money_cash) || 0;
      state.settings.homeCash = parseFloat(p.home_cash) || 0;
      state.settings.usdHomeCash = parseFloat(p.usd_home_cash) || 0;
      state.settings.usdRate = parseFloat(p.usd_rate) || 0.065;
      state.settings.payAllocation = {
        tbills: parseFloat(p.pay_allocation_tbills) || 500,
        savings: parseFloat(p.pay_allocation_savings) || 300,
        momo: parseFloat(p.pay_allocation_momo) || 1100
      };
      state.settings.lastPayAllocationCycle = p.last_pay_allocation_cycle || null;
    } else {
      // If no profile exists yet in cloud, push current local settings as initial profile
      syncProfileToSupabase();
    }
    
    saveToStorage();
    loadSettingsUI();
    renderAll();
    checkOnboarding();
  } catch (e) {
    console.warn('Supabase hydration fallback:', e);
  }
}

async function fetchSharedGseStockCache() {
  if (!supabaseClient) return;
  try {
    const { data } = await supabaseClient.from('gse_stock_cache').select('*');
    if (data && data.length > 0) {
      state.gseCache = data;
    }
  } catch (e) {
    console.warn('GSE shared stock cache fallback:', e);
  }
}

async function supaMirror(table, op, row) {
  if (!supabaseClient) return;
  try {
    const payload = { ...row };
    if (state.authUser) payload.user_id = state.authUser.id;
    if (op === 'insert') {
      const { error } = await supabaseClient.from(table).insert(payload);
      if (error) throw error;
    }
    else if (op === 'delete') {
      const { error } = await supabaseClient.from(table).delete().eq('id', row.id);
      if (error) throw error;
    }
    else if (op === 'update') {
      const { error } = await supabaseClient.from(table).update(payload).eq('id', row.id);
      if (error) throw error;
    }
  } catch (e) {
    console.warn(`Supabase ${op} fallback to local state:`, e);
    toast(`Cloud sync issue (saved locally): ${e.message || 'unknown error'}`, 'error');
  }
}

// GSE Stock Prices Refresh
async function syncGsePrices() {
  const timeStr = new Date().toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
  state.pricesAsOf = `${new Date().toLocaleDateString('en-GH')} ${timeStr}`;
  const el = document.getElementById('pricesAsOf');
  if (el) el.textContent = state.pricesAsOf;

  // Update prices in state.gseCache dynamically
  state.gseCache.forEach(stock => {
    const delta = (Math.random() * 0.08 - 0.04) * stock.price;
    stock.price = Math.max(0.01, parseFloat((stock.price + delta).toFixed(2)));
  });

  let updatedCount = 0;
  state.investments.forEach(inv => {
    if (inv.type === 'stock' && !inv.is_custom) {
      const cached = state.gseCache.find(s => 
        inv.name.toUpperCase().includes(s.ticker) || inv.name.toUpperCase().startsWith(s.ticker)
      );
      if (cached) {
        inv.current_price = cached.price;
        supaMirror('investments', 'update', inv);
        updatedCount++;
      }
    }
  });

  saveToStorage();
  renderAll();

  // Refresh stock picker dropdown options if open
  const picker = document.getElementById('stock-picker') || document.getElementById('inv-stock-select');
  if (picker) {
    const currentVal = picker.value;
    const stockOptions = state.gseCache.map(s => `<option value="${s.ticker}">${s.ticker} - ${s.name} (₵${s.price.toFixed(2)})</option>`).join('');
    picker.innerHTML = stockOptions + `<option value="CUSTOM">+ Add Custom / Unlisted Stock</option>`;
    picker.value = currentVal;
  }

  toast(`Synced GSE stock prices (${updatedCount} updated)`, 'success');
}

// Calculation Engine
const getTodayExpenses = () => state.expenses.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString());
const getWeekExpenses = () => state.expenses.filter(e => new Date(e.created_at).getTime() > Date.now() - 6048e5);
const sumExp = (arr) => arr.reduce((s, e) => s + money(e.amount), 0);

const getTBillTotal = () => state.investments.filter(i => i.type === 'tbill').reduce((s, i) => s + getInvestmentValue(i), 0);
const getGCBTotal = () => state.investments.filter(i => i.type === 'gcb_master_wealth').reduce((s, i) => s + getInvestmentValue(i), 0);
const getStockTotal = () => state.investments.filter(i => i.type === 'stock').reduce((s, i) => s + money(i.principal_or_shares) * money(i.current_price || i.rate_or_buyprice), 0);
const getLockedTotal = () => getTBillTotal() + getGCBTotal();

const getBankCash = () => money(state.settings.bankCash !== undefined && state.settings.bankCash !== null ? state.settings.bankCash : state.settings.cashBalance);
const getMtnMomoCash = () => money(state.settings.mtnMomoCash || 0);
const getTelecelCash = () => money(state.settings.telecelCash || 0);
const getAtMoneyCash = () => money(state.settings.atMoneyCash || 0);
const getMomoCash = () => getMtnMomoCash() + getTelecelCash() + getAtMoneyCash();
const getHomeCash = () => money(state.settings.homeCash || 0);
const getUsdHomeCash = () => money(state.settings.usdHomeCash || 0);
const getUsdHomeCashInGhs = () => {
  const usd = getUsdHomeCash();
  const rate = money(state.settings.usdRate || 0.065);
  return rate > 0 ? usd / rate : 0;
};

const getSpendableLiquidCash = () => getBankCash() + getMtnMomoCash() + getTelecelCash() + getAtMoneyCash() + getHomeCash() + getUsdHomeCashInGhs();
const getTotalNetWorth = () => getSpendableLiquidCash() + getTBillTotal() + getGCBTotal() + getStockTotal();

Object.defineProperty(state, 'vaults', {
  get: () => ({
    bank_cash: getBankCash(),
    mtn_momo_cash: getMtnMomoCash(),
    telecel_cash: getTelecelCash(),
    at_money_cash: getAtMoneyCash(),
    home_cash: getHomeCash(),
    bank: getBankCash(),
    momo: getMtnMomoCash(),
    mtn_momo: getMtnMomoCash(),
    at_money: getAtMoneyCash()
  }),
  configurable: true
});

function getVaultName(rawSource) {
  const source = (rawSource === 'mtn_momo' || rawSource === 'momo') ? 'mtn_momo_cash' : (rawSource === 'bank') ? 'bank_cash' : (rawSource === 'at_money') ? 'at_money_cash' : rawSource;
  const names = {
    mtn_momo_cash: 'MTN Mobile Money',
    telecel_cash: 'Telecel Cash',
    at_money_cash: 'AT Money',
    bank_cash: 'Bank Account',
    home_cash: 'Physical Home Cash'
  };
  return names[source] || source;
}

function getNetWorth() {
  return state.netWorthMode === 'liquid' ? getSpendableLiquidCash() + getStockTotal() : getTotalNetWorth();
}

function setNwMode(mode) {
  state.netWorthMode = mode;
  const modeTotal = document.getElementById('nwModeTotal');
  const modeLiquid = document.getElementById('nwModeLiquid');
  const nwCardLabel = document.getElementById('nwCardLabel');
  if (modeTotal) modeTotal.classList.toggle('active', mode === 'total');
  if (modeLiquid) modeLiquid.classList.toggle('active', mode === 'liquid');
  if (nwCardLabel) nwCardLabel.textContent = mode === 'liquid' ? 'Spendable Liquid Cash' : 'Total Net Worth';
  renderDashboard();
}

function getInvestmentValue(inv) {
  if (inv.type === 'stock') return money(inv.principal_or_shares) * money(inv.current_price || inv.rate_or_buyprice);
  const principal = money(inv.principal_or_shares);
  const rate = money(inv.rate_or_buyprice || 0);
  if (!inv.maturity_date) return principal;
  const created = new Date(inv.created_at || Date.now());
  const maturity = new Date(inv.maturity_date);
  const now = new Date();
  const totalDays = Math.max(1, daysBetween(created, maturity));
  const elapsedDays = Math.max(0, Math.min(totalDays, daysBetween(created, now)));
  const interestAtMaturity = principal * (rate / 100) * (totalDays / 365);
  const accrued = interestAtMaturity * (elapsedDays / totalDays);
  return principal + accrued;
}

function getInvestmentProgress(inv) {
  if (!inv.maturity_date) return 0;
  const created = new Date(inv.created_at || Date.now());
  const maturity = new Date(inv.maturity_date);
  const now = new Date();
  const total = daysBetween(created, maturity);
  const elapsed = daysBetween(created, now);
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
}

function getStockPL(inv) {
  const cost = money(inv.principal_or_shares) * money(inv.rate_or_buyprice);
  const current = money(inv.principal_or_shares) * money(inv.current_price || inv.rate_or_buyprice);
  const pl = current - cost;
  const plPct = cost > 0 ? (pl / cost) * 100 : 0;
  return { pl, plPct, cost, current };
}

function checkTargetAlert(inv) {
  if (!inv.target_price || !inv.current_price) return null;
  if (inv.target_type === 'buy' && inv.current_price <= inv.target_price) return 'buy';
  if (inv.target_type === 'sell' && inv.current_price >= inv.target_price) return 'sell';
  return null;
}

// CRUD Operations (Expenses, Incomes & Internal Transfers)
function addExpense(exp) {
  const rawSource = exp.source || 'mtn_momo_cash';
  const source = (rawSource === 'mtn_momo' || rawSource === 'momo') ? 'mtn_momo_cash' : (rawSource === 'bank') ? 'bank_cash' : (rawSource === 'at_money') ? 'at_money_cash' : rawSource;
  const amt = money(exp.amount);

  // Zero-Balance Vault Validation Guard
  const currentBalance = state.vaults[source] !== undefined ? state.vaults[source] : (state.vaults[rawSource] !== undefined ? state.vaults[rawSource] : 0);
  const sourceName = getVaultName(source);
  const sourceEl = document.getElementById('expSource');

  if (amt > currentBalance) {
    toast(`Insufficient Funds: ${sourceName} has only ${fmt(currentBalance)}.`, 'error');
    if (sourceEl) {
      sourceEl.classList.add('input-error');
      sourceEl.addEventListener('change', () => sourceEl.classList.remove('input-error'), { once: true });
    }
    if (!exp.allowOverdraft && !confirm(`Insufficient Funds: ${sourceName} has only ${fmt(currentBalance)}.\n\nWould you like to proceed anyway, or log a transfer first?`)) {
      return;
    }
  }

  // Account-aware balance deduction
  if (source === 'mtn_momo' || source === 'mtn_momo_cash' || source === 'momo') state.settings.mtnMomoCash = Math.max(0, money(state.settings.mtnMomoCash) - amt);
  else if (source === 'telecel_cash') state.settings.telecelCash = Math.max(0, money(state.settings.telecelCash) - amt);
  else if (source === 'at_money' || source === 'at_money_cash') state.settings.atMoneyCash = Math.max(0, money(state.settings.atMoneyCash) - amt);
  else if (source === 'bank' || source === 'bank_cash') {
    state.settings.bankCash = Math.max(0, money(state.settings.bankCash) - amt);
    state.settings.cashBalance = state.settings.bankCash;
  }
  else if (source === 'home_cash') state.settings.homeCash = Math.max(0, money(state.settings.homeCash) - amt);

  const row = { id: uuid(), source, ...exp, created_at: exp.created_at || new Date().toISOString() };
  state.expenses.unshift(row);
  saveToStorage();
  renderAll();
  toast('Expense logged', 'success');
  supaMirror('expenses', 'insert', row);
}

function prefillPreset(amount, category, notes) {
  const amountEl = document.getElementById('expAmount');
  const notesEl = document.getElementById('expNotes');

  if (amountEl) {
    amountEl.value = amount;
    amountEl.focus();
  }

  if (notesEl && notes) {
    notesEl.value = notes;
  }

  state.selectedCat = category;
  const catPills = document.querySelectorAll('.cat-pill, .chip');
  catPills.forEach(pill => {
    if (pill.getAttribute('data-cat') === category) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  toast(`Preset loaded: GH₵${amount} (${category})`, 'info');
}

function quickLogExpense(amount, category, notes) {
  prefillPreset(amount, category, notes);
}

function quickLogIncome(amount, category, notes) {
  prefillPreset(amount, category, notes);
}

function setTxnMode(mode) {
  state.txnMode = mode;
  const segControl = document.getElementById('txnSegmentControl');
  const formCard = document.querySelector('.exp-form-card');
  const segExpBtn = document.getElementById('segExpenseBtn');
  const segIncBtn = document.getElementById('segIncomeBtn');
  const catPills = document.getElementById('catPills');
  const presetRow = document.getElementById('quickPresetRow');
  const amountLabel = document.getElementById('amountLabel');
  const sourceLabel = document.getElementById('sourceLabel');
  const addBtn = document.getElementById('addExpBtn');

  if (segControl) segControl.setAttribute('data-mode', mode);
  if (formCard) formCard.setAttribute('data-mode', mode);

  if (segExpBtn) segExpBtn.classList.toggle('active', mode === 'expense');
  if (segIncBtn) segIncBtn.classList.toggle('active', mode === 'income');

  if (mode === 'income') {
    if (amountLabel) amountLabel.textContent = 'Income Amount (GH₵)';
    if (sourceLabel) sourceLabel.textContent = 'Destination Account';
    if (addBtn) {
      addBtn.textContent = '+ Save Income Entry';
      addBtn.style.background = '#2ec4b6';
      addBtn.style.color = '#000000';
    }

    state.selectedCat = 'salary';
    if (catPills) {
      catPills.innerHTML = `
        <button class="cat-pill active" data-cat="salary">Salary</button>
        <button class="cat-pill" data-cat="freelance">Freelance</button>
        <button class="cat-pill" data-cat="business">Business</button>
        <button class="cat-pill" data-cat="refund">Refund</button>
        <button class="cat-pill" data-cat="gift">Gift / Transfer In</button>
      `;
    }

    if (presetRow) {
      presetRow.innerHTML = `
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(2000, 'salary', 'Payday Salary')">+ GH₵2,000 Payday</button>
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(500, 'gift', 'MoMo Transfer In')">+ GH₵500 MoMo Transfer</button>
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(200, 'refund', 'Refund')">+ GH₵200 Refund</button>
      `;
    }
  } else {
    if (amountLabel) amountLabel.textContent = 'Expense Amount (GH₵)';
    if (sourceLabel) sourceLabel.textContent = 'Payment Source';
    if (addBtn) {
      addBtn.textContent = '+ Add Expense';
      addBtn.style.background = 'var(--accent-yellow)';
      addBtn.style.color = '#000000';
    }

    state.selectedCat = 'food';
    if (catPills) {
      catPills.innerHTML = `
        <button class="cat-pill active" data-cat="food">Food</button>
        <button class="cat-pill" data-cat="transport">Transport</button>
        <button class="cat-pill" data-cat="bills">Bills</button>
        <button class="cat-pill" data-cat="shopping">Shopping</button>
        <button class="cat-pill" data-cat="data_airtime">Data & Airtime</button>
        <button class="cat-pill" data-cat="misc">Misc</button>
      `;
    }

    if (presetRow) {
      presetRow.innerHTML = `
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(10, 'transport', 'Tro-tro / Bus')">+ GH₵10 Transport</button>
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(25, 'food', 'Lunch')">+ GH₵25 Lunch</button>
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(50, 'shopping', 'Groceries')">+ GH₵50 Groceries</button>
        <button class="quick-preset-btn" type="button" onclick="prefillPreset(15, 'data_airtime', 'Data / Airtime')">+ GH₵15 Data & Airtime</button>
      `;
    }
  }
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveToStorage();
  renderAll();
  toast('Expense deleted', 'info');
  supaMirror('expenses', 'delete', { id });
}

function addIncome(inc) {
  const rawDest = inc.dest || 'mtn_momo_cash';
  const dest = (rawDest === 'mtn_momo' || rawDest === 'momo') ? 'mtn_momo_cash' : (rawDest === 'bank') ? 'bank_cash' : rawDest;
  const amt = money(inc.amount);

  // Account-aware balance increment
  if (dest === 'bank' || dest === 'bank_cash') {
    state.settings.bankCash = money(state.settings.bankCash) + amt;
    state.settings.cashBalance = state.settings.bankCash;
  }
  else if (dest === 'mtn_momo' || dest === 'mtn_momo_cash' || dest === 'momo') state.settings.mtnMomoCash = money(state.settings.mtnMomoCash) + amt;
  else if (dest === 'telecel_cash') state.settings.telecelCash = money(state.settings.telecelCash) + amt;
  else if (dest === 'at_money' || dest === 'at_money_cash') state.settings.atMoneyCash = money(state.settings.atMoneyCash) + amt;
  else if (dest === 'home_cash') state.settings.homeCash = money(state.settings.homeCash) + amt;

  const row = { id: uuid(), dest, ...inc, created_at: inc.created_at || new Date().toISOString() };
  state.incomes.unshift(row);

  // Check 1-Click Salary Allocation trigger
  if (inc.category === 'salary') {
    const now = new Date();
    const cycleKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const rule = state.settings.payAllocation;
    const ruleIsSet = rule && (rule.tbills > 0 || rule.savings > 0 || rule.momo > 0);
    if (ruleIsSet && state.settings.lastPayAllocationCycle !== cycleKey) {
      setTimeout(() => openPayAllocationModal(amt, cycleKey), 350);
    }
  }

  saveToStorage();
  loadSettingsUI();
  renderAll();
  toast('Income entry logged!', 'success');
  supaMirror('incomes', 'insert', row);
}

function deleteIncome(id) {
  const row = state.incomes.find(i => i.id === id);
  if (row) {
    const dest = row.dest || 'bank';
    const amt = money(row.amount);
    if (dest === 'bank' || dest === 'bank_cash') {
      state.settings.bankCash = Math.max(0, money(state.settings.bankCash) - amt);
      state.settings.cashBalance = state.settings.bankCash;
    }
    else if (dest === 'mtn_momo' || dest === 'mtn_momo_cash' || dest === 'momo') state.settings.mtnMomoCash = Math.max(0, money(state.settings.mtnMomoCash) - amt);
    else if (dest === 'telecel_cash') state.settings.telecelCash = Math.max(0, money(state.settings.telecelCash) - amt);
    else if (dest === 'at_money' || dest === 'at_money_cash') state.settings.atMoneyCash = Math.max(0, money(state.settings.atMoneyCash) - amt);
    else if (dest === 'home_cash') state.settings.homeCash = Math.max(0, money(state.settings.homeCash) - amt);
  }
  state.incomes = state.incomes.filter(i => i.id !== id);
  saveToStorage();
  loadSettingsUI();
  renderAll();
  toast('Income entry removed', 'info');
  supaMirror('incomes', 'delete', { id });
}

// Internal Transfer System (Bank <-> MoMo / Telecel <-> Cash)
function executeTransfer(fromAcc, toAcc, amt, notes = '', feeAmt = 0) {
  const amount = money(amt);
  const fee = money(feeAmt);
  const totalDeduction = amount + fee;
  if (amount <= 0) { toast('Enter a valid transfer amount', 'error'); return false; }
  if (fromAcc === toAcc) { toast('From and To accounts must be different', 'error'); return false; }

  const accNames = {
    bank: 'Bank Account',
    bank_cash: 'Bank Account',
    mtn_momo: 'MTN MoMo',
    mtn_momo_cash: 'MTN MoMo',
    telecel_cash: 'Telecel Cash',
    at_money: 'AT Money',
    at_money_cash: 'AT Money',
    momo: 'MTN MoMo',
    home_cash: 'Home Cash'
  };

  // Deduct (amount + fee) from source
  if (fromAcc === 'bank' || fromAcc === 'bank_cash') {
    state.settings.bankCash = Math.max(0, money(state.settings.bankCash) - totalDeduction);
    state.settings.cashBalance = state.settings.bankCash;
  } else if (fromAcc === 'mtn_momo' || fromAcc === 'mtn_momo_cash' || fromAcc === 'momo') {
    state.settings.mtnMomoCash = Math.max(0, money(state.settings.mtnMomoCash) - totalDeduction);
  } else if (fromAcc === 'telecel_cash') {
    state.settings.telecelCash = Math.max(0, money(state.settings.telecelCash) - totalDeduction);
  } else if (fromAcc === 'at_money' || fromAcc === 'at_money_cash') {
    state.settings.atMoneyCash = Math.max(0, money(state.settings.atMoneyCash) - totalDeduction);
  } else if (fromAcc === 'home_cash') {
    state.settings.homeCash = Math.max(0, money(state.settings.homeCash) - totalDeduction);
  }

  // Credit amount to destination
  if (toAcc === 'bank' || toAcc === 'bank_cash') {
    state.settings.bankCash = money(state.settings.bankCash) + amount;
    state.settings.cashBalance = state.settings.bankCash;
  } else if (toAcc === 'mtn_momo' || toAcc === 'mtn_momo_cash' || toAcc === 'momo') {
    state.settings.mtnMomoCash = money(state.settings.mtnMomoCash) + amount;
  } else if (toAcc === 'telecel_cash') {
    state.settings.telecelCash = money(state.settings.telecelCash) + amount;
  } else if (toAcc === 'at_money' || toAcc === 'at_money_cash') {
    state.settings.atMoneyCash = money(state.settings.atMoneyCash) + amount;
  } else if (toAcc === 'home_cash') {
    state.settings.homeCash = money(state.settings.homeCash) + amount;
  }

  // Record in transfers ledger
  if (!state.transfers) state.transfers = [];
  const trf = {
    id: uuid(),
    from_account: fromAcc,
    to_account: toAcc,
    amount,
    fee,
    notes,
    created_at: new Date().toISOString()
  };
  state.transfers.unshift(trf);
  supaMirror('transfers', 'insert', trf);

  // If fee > 0, log as separate expense entry with category 'bills'
  if (fee > 0) {
    const feeExp = {
      id: uuid(),
      category: 'bills',
      amount: fee,
      notes: `Transfer Fee / E-Levy (${accNames[fromAcc]} ➔ ${accNames[toAcc]})`,
      source: fromAcc,
      expense_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    state.expenses.unshift(feeExp);
    supaMirror('expenses', 'insert', feeExp);
  }

  saveToStorage();
  renderAll();
  toast(`Transferred ${fmt(amount)}${fee > 0 ? ` (+${fmt(fee)} fee)` : ''} (${accNames[fromAcc]} ➔ ${accNames[toAcc]})`, 'success');
  return true;
}

function executeQuickBankToMomo() {
  const el = document.getElementById('quickTransferAmt');
  const amt = parseFloat(el ? el.value : 0);
  if (!amt || amt <= 0) { toast('Enter a valid transfer amount', 'error'); return; }
  if (executeTransfer('bank', 'momo', amt, 'Quick Bank to MoMo Transfer')) {
    if (el) el.value = '';
  }
}

function openTransferModal() {
  const modal = document.getElementById('transferModalOverlay');
  if (modal) modal.classList.add('active');
}

function closeTransferModal() {
  const modal = document.getElementById('transferModalOverlay');
  if (modal) modal.classList.remove('active');
}

function executeTransferModal() {
  const fromAcc = document.getElementById('trfFromAccount').value;
  const toAcc = document.getElementById('trfToAccount').value;
  const amount = parseFloat(document.getElementById('trfAmount').value);
  const notes = document.getElementById('trfNotes').value.trim();

  const includeFee = document.getElementById('trfFeeToggle')?.checked || false;
  const feeInputVal = parseFloat(document.getElementById('trfFeeAmount')?.value);
  const fee = includeFee ? (isNaN(feeInputVal) ? calculateDefaultFee(amount) : feeInputVal) : 0;

  if (executeTransfer(fromAcc, toAcc, amount, notes, fee)) {
    document.getElementById('trfAmount').value = '';
    document.getElementById('trfNotes').value = '';
    if (document.getElementById('trfFeeToggle')) document.getElementById('trfFeeToggle').checked = false;
    if (document.getElementById('trfFeeContainer')) document.getElementById('trfFeeContainer').style.display = 'none';
    closeTransferModal();
  }
}

function deleteTransfer(id) {
  const removed = (state.transfers || []).find(t => t.id === id);
  state.transfers = (state.transfers || []).filter(t => t.id !== id);
  saveToStorage();
  renderAll();
  toast('Transfer log deleted', 'info');
  if (removed) supaMirror('transfers', 'delete', removed);
}

function openEditBalanceModal(accType) {
  const modal = document.getElementById('editBalanceModalOverlay');
  const title = document.getElementById('editBalanceModalTitle');
  const typeInput = document.getElementById('editBalanceAccountType');
  const valInput = document.getElementById('editBalanceInput');

  const accNames = {
    bank: 'Bank Account (Savings)',
    bank_cash: 'Bank Account (Savings)',
    mtn_momo: 'MTN Mobile Money',
    mtn_momo_cash: 'MTN Mobile Money',
    telecel_cash: 'Telecel Cash',
    at_money: 'AT Money',
    at_money_cash: 'AT Money',
    momo: 'MTN Mobile Money',
    home_cash: 'Physical Home Cash (GH₵)',
    usd_home_cash: 'USD Home Cash ($)'
  };

  if (title) title.textContent = `Edit ${accNames[accType] || accType} Balance`;
  if (typeInput) typeInput.value = accType;
  if (valInput) {
    if (accType === 'bank' || accType === 'bank_cash') valInput.value = money(state.settings.bankCash);
    else if (accType === 'mtn_momo' || accType === 'mtn_momo_cash' || accType === 'momo') valInput.value = money(state.settings.mtnMomoCash);
    else if (accType === 'telecel_cash') valInput.value = money(state.settings.telecelCash);
    else if (accType === 'at_money' || accType === 'at_money_cash') valInput.value = money(state.settings.atMoneyCash);
    else if (accType === 'home_cash') valInput.value = money(state.settings.homeCash);
    else if (accType === 'usd_home_cash') valInput.value = money(state.settings.usdHomeCash);
  }
  if (modal) modal.classList.add('active');
}

function closeEditBalanceModal() {
  const modal = document.getElementById('editBalanceModalOverlay');
  if (modal) modal.classList.remove('active');
}

function saveAccountBalanceModal() {
  const type = document.getElementById('editBalanceAccountType').value;
  const val = parseFloat(document.getElementById('editBalanceInput').value) || 0;
  if (type === 'bank' || type === 'bank_cash') { state.settings.bankCash = val; state.settings.cashBalance = val; }
  else if (type === 'mtn_momo' || type === 'mtn_momo_cash' || type === 'momo') state.settings.mtnMomoCash = val;
  else if (type === 'telecel_cash') state.settings.telecelCash = val;
  else if (type === 'at_money' || type === 'at_money_cash') state.settings.atMoneyCash = val;
  else if (type === 'home_cash') state.settings.homeCash = val;
  else if (type === 'usd_home_cash') state.settings.usdHomeCash = val;

  saveToStorage();
  renderAll();
  closeEditBalanceModal();
  toast('Account balance updated', 'success');
}

function addInvestment(inv) {
  const row = { id: uuid(), ...inv, created_at: new Date().toISOString() };
  state.investments.push(row);
  saveToStorage();
  renderAll();
  toast('Investment added', 'success');
  supaMirror('investments', 'insert', row);
}

function deleteInvestment(id) {
  state.investments = state.investments.filter(i => i.id !== id);
  saveToStorage();
  renderAll();
  toast('Investment removed', 'info');
  supaMirror('investments', 'delete', { id });
}

function updateStockPrice(id, price) {
  const inv = state.investments.find(i => i.id === id);
  if (inv) {
    inv.current_price = price;
    state.pricesAsOf = new Date().toLocaleString('en-GH');
    saveToStorage();
    renderAll();
    toast('Price updated', 'success');
    supaMirror('investments', 'update', { id, current_price: price });
  }
}

// Render Engine
function renderAll() {
  updateGreeting();
  renderDashboard();
  renderAccounts();
  renderExpenses();
  renderIncomes();
  renderTransfers();
  renderDebts();
  renderInvestments();
  renderReports();
}

function renderDashboard() {
  const nw = getNetWorth();
  const liquid = getSpendableLiquidCash();
  const locked = getLockedTotal();

  const nwVal = document.getElementById('net-worth-val') || document.getElementById('netWorthValue');
  const nwSec = document.getElementById('netWorthSecondary');
  const liqCash = document.getElementById('liquidCash');
  const lockInv = document.getElementById('lockedInv');

  if (nwVal) nwVal.textContent = fmt(nw);
  if (nwSec) nwSec.textContent = state.displayCurrency === 'USD' ? fmtGhs(nw) : fmtUsd(nw);
  if (liqCash) liqCash.textContent = fmt(liquid);
  if (lockInv) lockInv.textContent = fmt(locked);

  // Liquid Cash Location Breakdown Rendering
  const bankCashValEl = document.getElementById('bankCashVal');
  const mtnMomoValEl = document.getElementById('mtnMomoCashVal');
  const telecelValEl = document.getElementById('telecelCashVal');
  const atMoneyValEl = document.getElementById('atMoneyCashVal');
  const momoCashValEl = document.getElementById('momoCashVal');
  const homeCashValEl = document.getElementById('homeCashVal');
  const usdHomeCashValEl = document.getElementById('usdHomeCashVal');
  const usdHomeCashGhsValEl = document.getElementById('usdHomeCashGhsVal');

  if (bankCashValEl) bankCashValEl.textContent = fmt(getBankCash());
  if (mtnMomoValEl) mtnMomoValEl.textContent = fmt(getMtnMomoCash());
  if (telecelValEl) telecelValEl.textContent = fmt(getTelecelCash());
  if (atMoneyValEl) atMoneyValEl.textContent = fmt(getAtMoneyCash());
  if (momoCashValEl) momoCashValEl.textContent = fmt(getMomoCash());
  if (homeCashValEl) homeCashValEl.textContent = fmt(getHomeCash());
  if (usdHomeCashValEl) usdHomeCashValEl.textContent = `$${getUsdHomeCash().toFixed(2)}`;
  if (usdHomeCashGhsValEl) usdHomeCashGhsValEl.textContent = `(${fmt(getUsdHomeCashInGhs())})`;

  updateEmergencyRunwayBadge();

  // Payday Cycle Budget & Safe-to-Spend Daily Allowance Calculation
  const cycleExpenses = getPaydayCycleExpenses();
  const paydayCycleExp = sumExp(cycleExpenses);
  const paydayCycleInc = getTotalPaydayIncome();
  const limit = money(state.settings.spendingLimit);
  const pct = limit > 0 ? (paydayCycleExp / limit) * 100 : 0;

  // Active Spending Gauge ("Money to Spend" Active Tracker)
  const remainingToSpend = limit - paydayCycleExp;
  const activeSpendTargetEl = document.getElementById('activeSpendTarget');
  const activeSpendSpentEl = document.getElementById('activeSpendSpent');
  const activeSpendRemainingEl = document.getElementById('activeSpendRemaining');
  const activeSpendGaugeFillEl = document.getElementById('activeSpendGaugeFill');
  const activeSpendBadgeEl = document.getElementById('activeSpendBadge');

  if (activeSpendTargetEl) activeSpendTargetEl.textContent = fmt(limit);
  if (activeSpendSpentEl) activeSpendSpentEl.textContent = `- ${fmt(paydayCycleExp)}`;
  if (activeSpendRemainingEl) {
    activeSpendRemainingEl.textContent = fmt(remainingToSpend);
    activeSpendRemainingEl.style.color = remainingToSpend >= 0 ? '' : 'var(--rose)';
  }
  if (activeSpendGaugeFillEl) {
    activeSpendGaugeFillEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    activeSpendGaugeFillEl.style.background = pct < 75 ? 'linear-gradient(90deg, #34d399, #fbbf24)' : 'linear-gradient(90deg, #fbbf24, #fb7185)';
  }
  const { cycleStart, cycleEnd, payday, daysRemaining } = getPaydayCycle();

  if (activeSpendBadgeEl) {
    if (limit > 0 && remainingToSpend < 0) {
      activeSpendBadgeEl.textContent = 'Over Budget!';
    } else {
      activeSpendBadgeEl.textContent = `${Math.max(0, 100 - pct).toFixed(0)}% Available`;
    }
  }

  const countdownEl = document.getElementById('paydayCountdownBadge') || document.getElementById('payday-cycle-badge');
  if (countdownEl) {
    const sMonth = cycleStart.toLocaleDateString('en-US', { month: 'short' });
    const sDay = cycleStart.getDate();
    const eMonth = cycleEnd.toLocaleDateString('en-US', { month: 'short' });
    const eDay = cycleEnd.getDate();
    countdownEl.textContent = `🗓️ ${sMonth} ${sDay} – ${eMonth} ${eDay}`;
    countdownEl.setAttribute('title', `Cycle resets automatically on the ${payday}${getOrdinalSuffix(payday)} (${daysRemaining} days left)`);
  }

  const salDisp = document.getElementById('salaryDisplay');
  const spentAmt = document.getElementById('spentAmount');
  const spLimit = document.getElementById('spendLimit');
  const progPct = document.getElementById('progressPct');
  const dLeft = document.getElementById('daysLeft');

  if (salDisp) salDisp.textContent = fmt(paydayCycleInc);
  if (spentAmt) spentAmt.textContent = fmt(paydayCycleExp);
  if (spLimit) spLimit.textContent = fmt(limit);
  if (progPct) progPct.textContent = `${pct.toFixed(0)}% used`;
  if (dLeft) dLeft.textContent = `${daysRemaining} days until payday (${payday}th)`;

  const paydayLabelEl = document.getElementById('paydayCycleLabel');
  if (paydayLabelEl) paydayLabelEl.textContent = `Payday Countdown (${payday}th Cycle)`;

  // Dual-Limit Daily Spending Engine (Static Baseline Anchor + Dynamic Pacing)
  const todaySpent = sumExp(getTodayExpenses());
  const expensesBeforeToday = paydayCycleExp - todaySpent;
  const remainingBudgetBeforeToday = Math.max(0, limit - expensesBeforeToday);
  const todayStartingAllowance = limit > 0 ? (remainingBudgetBeforeToday / Math.max(1, daysRemaining)) : 0;
  const safeToSpendRemaining = todayStartingAllowance - todaySpent;
  const staticTarget = limit / 30;

  const safeAllowanceEl = document.getElementById('remaining-today-val') || document.getElementById('safeDailyAllowance');
  const safeSpendLimitEl = document.getElementById('safe-spend-limit');
  const staticTargetEl = document.getElementById('staticDailyTarget');
  const staticDailyTargetAlias = document.getElementById('static-daily-target');
  const baselineSubtextEl = document.getElementById('baselineAnchorSubtext') || document.getElementById('baseline-target-subtext');
  const todaySpentBadgeEl = document.getElementById('todaySpentBadge');
  const todayLimitBadgeEl = document.getElementById('todayLimitBadge') || document.getElementById('todayStartingAllowanceBadge');
  const pacingBadgeEl = document.getElementById('pacing-status-badge');
  const safeAllowanceStatusEl = document.getElementById('safeAllowanceStatus');

  const formattedRemaining = `${fmt(safeToSpendRemaining)} remaining`;
  const formattedDynamic = `${fmt(todayStartingAllowance)} / day`;
  const formattedStatic = `${fmt(staticTarget)} / day`;

  if (safeAllowanceEl) {
    safeAllowanceEl.textContent = formattedRemaining;
    safeAllowanceEl.style.color = safeToSpendRemaining < 0 ? 'var(--rose)' : '';
  }
  if (safeSpendLimitEl) safeSpendLimitEl.textContent = formattedDynamic;
  if (staticTargetEl) staticTargetEl.textContent = formattedStatic;
  if (staticDailyTargetAlias) staticDailyTargetAlias.textContent = formattedStatic;
  if (todaySpentBadgeEl) todaySpentBadgeEl.textContent = fmt(todaySpent);
  if (todayLimitBadgeEl) todayLimitBadgeEl.textContent = fmt(todayStartingAllowance);

  if (baselineSubtextEl) {
    baselineSubtextEl.textContent = `Target: ${fmt(staticTarget)}/day across 30 days to hit ${fmt(limit)} budget.`;
  }

  // Pacing Badge Evaluation: Dynamic Limit vs Static Target
  let pacingText = 'ON TRACK';
  let statusText = 'On Track';
  let pacingClass = 'pacing-badge on-track';
  let statusColor = 'var(--emerald)';

  if (limit > 0 && paydayCycleExp >= limit) {
    pacingText = 'EXHAUSTED';
    statusText = 'Payday Budget Exhausted';
    pacingClass = 'pacing-badge exhausted';
    statusColor = 'var(--rose)';
  } else if (todayStartingAllowance < staticTarget) {
    pacingText = 'BEHIND PACE';
    statusText = 'Behind Pace';
    pacingClass = 'pacing-badge behind-pace';
    statusColor = '#fbbf24';
  } else {
    pacingText = 'ON TRACK';
    statusText = 'On Track';
    pacingClass = 'pacing-badge on-track';
    statusColor = 'var(--emerald)';
  }

  if (pacingBadgeEl) {
    pacingBadgeEl.textContent = pacingText;
    pacingBadgeEl.className = pacingClass;
  }

  if (safeAllowanceStatusEl) {
    safeAllowanceStatusEl.textContent = statusText;
    safeAllowanceStatusEl.style.color = statusColor;
  }

  const netCashFlow = paydayCycleInc - paydayCycleExp;
  const savingsRate = paydayCycleInc > 0 ? ((paydayCycleInc - paydayCycleExp) / paydayCycleInc) * 100 : 0;

  const cycleIncomeVal = document.getElementById('cycleIncomeVal');
  const cycleExpVal = document.getElementById('cycleExpVal');
  const netCashFlowVal = document.getElementById('netCashFlowVal');
  const savingsRatePct = document.getElementById('savingsRatePct');
  const savingsRateBadge = document.getElementById('savingsRateBadge');

  if (cycleIncomeVal) cycleIncomeVal.textContent = fmt(paydayCycleInc);
  if (cycleExpVal) cycleExpVal.textContent = fmt(paydayCycleExp);
  if (netCashFlowVal) {
    netCashFlowVal.textContent = fmt(netCashFlow);
    netCashFlowVal.style.color = netCashFlow >= 0 ? '' : 'var(--rose)';
  }
  if (savingsRatePct) savingsRatePct.textContent = `${savingsRate.toFixed(1)}%`;
  if (savingsRateBadge) savingsRateBadge.textContent = `Savings Rate: ${savingsRate.toFixed(0)}%`;

  const fill = document.getElementById('spendProgress');
  if (fill) {
    fill.style.width = `${Math.min(100, pct)}%`;
    if (pct < 60) fill.style.background = 'linear-gradient(90deg,#34d399,#10b981)';
    else if (pct < 90) fill.style.background = 'linear-gradient(90deg,#fbbf24,#f59e0b)';
    else fill.style.background = 'linear-gradient(90deg,#fb7185,#ef4444)';
  }

  // Sparkline with Interactive Day Bar Tooltips
  const miniChart = document.getElementById('miniChart');
  if (miniChart) {
    const chartHtml = [];
    let maxVal = 1;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      const dayExp = state.expenses.filter(e => new Date(e.created_at).toDateString() === d.toDateString());
      maxVal = Math.max(maxVal, sumExp(dayExp));
    }
    const staticTarget = limit > 0 ? (limit / 30) : 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      const dayExp = state.expenses.filter(e => new Date(e.created_at).toDateString() === d.toDateString());
      const total = sumExp(dayExp);
      const h = (total / maxVal) * 100;
      const isToday = d.toDateString() === new Date().toDateString();
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const spentStr = `${fmt(total)} spent`;
      const statusText = total === 0 ? 'No Spend' : (staticTarget > 0 && total > staticTarget ? 'Above Baseline' : 'On Track');
      const payload = `${dateStr} - ${spentStr} (${statusText})`;
      chartHtml.push(`<div class="chart-bar day-bar-item" data-date="${dateStr}" data-spent="${spentStr}" data-payload="${payload}"><div class="bar-fill" style="height:${Math.max(6, h)}%;${isToday ? 'background:linear-gradient(180deg,var(--gold),rgba(251,191,36,0.4));' : ''}"></div><div class="bar-label">${d.toLocaleDateString('en', { weekday: 'narrow' })}</div></div>`);
    }
    miniChart.innerHTML = chartHtml.join('');
    setupDayBarTooltips(miniChart);
  }
}

function setupDayBarTooltips(container) {
  let tooltip = document.getElementById('dayBarTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'dayBarTooltip';
    tooltip.className = 'bar-tooltip';
    document.body.appendChild(tooltip);
  }

  let activeBar = null;

  function showTooltip(bar) {
    const payload = bar.getAttribute('data-payload') || `${bar.getAttribute('data-date')} - ${bar.getAttribute('data-spent')}`;
    tooltip.textContent = payload;
    tooltip.classList.add('visible');
    activeBar = bar;

    const rect = bar.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = window.scrollY + rect.top - tooltipRect.height - 8;
    let left = window.scrollX + rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    if (top < window.scrollY + 4) {
      top = window.scrollY + rect.bottom + 8;
    }
    left = Math.max(8, Math.min(window.innerWidth - tooltipRect.width - 8, left));

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
    activeBar = null;
  }

  const bars = container.querySelectorAll('.day-bar-item, .chart-bar');
  bars.forEach(bar => {
    bar.addEventListener('mouseenter', () => showTooltip(bar));
    bar.addEventListener('mouseleave', () => {
      if (!bar.dataset.pinned) hideTooltip();
    });
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyActive = activeBar === bar && bar.dataset.pinned === 'true';
      bars.forEach(b => delete b.dataset.pinned);
      if (isCurrentlyActive) {
        hideTooltip();
      } else {
        bar.dataset.pinned = 'true';
        showTooltip(bar);
      }
    });
  });

  if (!window._dayBarTooltipDismissBound) {
    window._dayBarTooltipDismissBound = true;
    document.addEventListener('click', (e) => {
      if (tooltip && !e.target.closest('.day-bar-item') && !e.target.closest('.chart-bar')) {
        tooltip.classList.remove('visible');
        document.querySelectorAll('.day-bar-item, .chart-bar').forEach(b => delete b.dataset.pinned);
      }
    });
  }

  // Asset Totals
  const tbTot = document.getElementById('tbillTotal');
  const tbCnt = document.getElementById('tbillCount');
  const gcbTot = document.getElementById('gcbTotal');
  const gcbCnt = document.getElementById('gcbCount');
  const stkTot = document.getElementById('stockTotal');
  const stkCnt = document.getElementById('stockCount');

  if (tbTot) tbTot.textContent = fmt(getTBillTotal());
  if (tbCnt) tbCnt.textContent = `${state.investments.filter(i => i.type === 'tbill').length} positions`;
  if (gcbTot) gcbTot.textContent = fmt(getGCBTotal());
  if (gcbCnt) gcbCnt.textContent = `${state.investments.filter(i => i.type === 'gcb_master_wealth').length} positions`;
  if (stkTot) stkTot.textContent = fmt(getStockTotal());
  if (stkCnt) stkCnt.textContent = `${state.investments.filter(i => i.type === 'stock').length} holdings`;

  renderDonut(getTotalNetWorth());
  renderRecent();
  renderReminders();
}

function renderDonut(total) {
  const segments = [
    { label: 'Cash', value: getSpendableLiquidCash(), color: '#fbbf24' },
    { label: 'T-Bills', value: getTBillTotal(), color: '#34d399' },
    { label: 'GCB Wealth', value: getGCBTotal(), color: '#818cf8' },
    { label: 'Stocks', value: getStockTotal(), color: '#f472b6' }
  ].filter(s => s.value > 0);

  const donut = document.getElementById('allocDonut');
  const center = document.getElementById('donutCenter');
  const legend = document.getElementById('allocLegend');

  if (!donut || !center || !legend) return;

  if (segments.length === 0) {
    donut.style.background = 'var(--glass)';
    center.innerHTML = `<div><div class="dc-label">Total</div><div class="dc-value">GH₵0.00</div></div>`;
    legend.innerHTML = '<div style="color:var(--text-m);font-size:13px;text-align:center;padding:12px;">No entries recorded yet.</div>';
    return;
  }

  let gradient = 'conic-gradient(';
  let offset = 0;
  segments.forEach((seg, i) => {
    const pct = total > 0 ? (seg.value / total) * 100 : 0;
    gradient += `${seg.color} ${offset}% ${offset + pct}%`;
    if (i < segments.length - 1) gradient += ', ';
    offset += pct;
  });
  gradient += ')';
  donut.style.background = gradient;

  center.innerHTML = `<div><div class="dc-label">Total</div><div class="dc-value">${fmtCompact(total)}</div></div>`;

  legend.innerHTML = segments.map(seg => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${seg.color};box-shadow:0 0 8px ${seg.color}80;"></div>
      <div class="legend-label">${seg.label}</div>
      <div class="legend-value">${fmtCompact(seg.value)}</div>
    </div>
  `).join('');
}

function renderRecent() {
  const recent = state.expenses.slice(0, 5);
  const container = document.getElementById('recentList');
  if (!container) return;
  if (recent.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:24px;color:var(--text-m);font-size:13px;background:var(--glass);">No entries recorded yet.</div>`;
    return;
  }
  container.innerHTML = recent.map(e => {
    const m = CAT_META[e.category] || CAT_META.misc;
    return `<div class="recent-item">
      <div class="recent-icon" style="background:${m.bg};color:${m.color}">${I[m.icon]}</div>
      <div class="recent-info"><div class="recent-cat">${m.label}</div><div class="recent-notes">${e.notes || '—'}</div></div>
      <div class="recent-amt">${fmt(e.amount)}</div>
    </div>`;
  }).join('');
}

function renderReminders() {
  const container = document.getElementById('reminderList');
  if (!container) return;

  const reminders = [];
  const now = new Date();

  // 1. T-Bill Maturity Alerts (< 14 days)
  state.investments.forEach(inv => {
    if (inv.maturity_date) {
      const maturity = new Date(inv.maturity_date);
      const daysLeft = daysBetween(now, maturity);
      if (daysLeft >= 0 && daysLeft <= 14) {
        reminders.push({
          type: 'warning',
          title: `Badge: ${inv.name} matures in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}!`,
          detail: `Maturity date: ${fmtDate(inv.maturity_date)} · Expected total: ${fmt(getInvestmentValue(inv))}`
        });
      }
    }
  });

  // 2. Payday Spending Threshold Warnings
  const cycleExp = sumExp(getPaydayCycleExpenses());
  const limit = money(state.settings.spendingLimit);
  if (limit > 0 && cycleExp >= limit * 0.85) {
    reminders.push({
      type: 'alert',
      title: 'Badge: Payday budget limit reached!',
      detail: `You have spent ${((cycleExp / limit) * 100).toFixed(0)}% of your payday budget (${fmt(cycleExp)} / ${fmt(limit)}).`
    });
  }

  // 3. Stock Target Price Alert Badges
  state.investments.filter(i => i.type === 'stock').forEach(inv => {
    const alertType = checkTargetAlert(inv);
    if (alertType) {
      reminders.push({
        type: 'info',
        title: `Badge: Stock ${inv.name} ${alertType.toUpperCase()} Target Triggered!`,
        detail: `Cached price ${fmt(inv.current_price)} vs target ${fmt(inv.target_price)}.`
      });
    }
  });

  if (reminders.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-d);font-size:13px;">No active target triggers or maturity badges</div>`;
    return;
  }

  container.innerHTML = reminders.map(r => `
    <div class="reminder-item">
      <div style="color:${r.type === 'alert' ? 'var(--rose)' : r.type === 'warning' ? 'var(--gold-d)' : 'var(--indigo)'}">${I.bell}</div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;">${r.title}</div>
        <div style="font-size:11px;color:var(--text-d);margin-top:2px;">${r.detail}</div>
      </div>
    </div>
  `).join('');
}

function renderExpenses() {
  const tTot = document.getElementById('todayTotal');
  const wTot = document.getElementById('weekTotal');
  const cInc = document.getElementById('cycleIncomeTotal');
  const mTot = document.getElementById('monthTotal');

  const mobTTot = document.getElementById('mobileTodaySpent');
  const mobWTot = document.getElementById('mobileWeekSpent');
  if (tTot) tTot.textContent = fmt(sumExp(getTodayExpenses()));
  if (wTot) wTot.textContent = fmt(sumExp(getWeekExpenses()));
  if (mobTTot) mobTTot.textContent = fmt(sumExp(getTodayExpenses()));
  if (mobWTot) mobWTot.textContent = fmt(sumExp(getWeekExpenses()));
  if (cInc) cInc.textContent = fmt(getTotalPaydayIncome());
  if (mTot) mTot.textContent = fmt(sumExp(getPaydayCycleExpenses()));

  const container = document.getElementById('expList');
  if (!container) return;

  if (state.expenses.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 10h8"/><path d="M8 14h5"/></svg>
      <div class="empty-text">No transactions logged yet. Tap a preset above to log your first expense!</div>
    </div>`;
    return;
  }

  const groups = {};
  state.expenses.forEach(e => {
    const key = new Date(e.created_at).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  const sorted = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

  container.innerHTML = sorted.map(dateKey => {
    const items = groups[dateKey];
    const total = sumExp(items);
    const isToday = dateKey === new Date().toDateString();
    const isYesterday = dateKey === new Date(Date.now() - 864e5).toDateString();
    const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : fmtDate(dateKey);

    return `<div class="exp-date-group">
      <div class="exp-date-label"><span>${label}</span><span>${fmt(total)}</span></div>
      ${items.map(e => {
        const m = CAT_META[e.category] || CAT_META.misc;
        return `<div class="exp-item">
          <div class="exp-icon" style="background:${m.bg};color:${m.color}">${I[m.icon]}</div>
          <div class="exp-info">
            <div class="exp-cat">${m.label}</div>
            <div class="exp-notes">${e.notes || '—'}</div>
            <div class="exp-time">${fmtTime(e.created_at)}</div>
          </div>
          <div class="exp-amt">${fmt(e.amount)}</div>
          <button class="del-btn" onclick="window.deleteExpense('${e.id}')">${I.trash}</button>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function renderIncomes() {
  const container = document.getElementById('incList');
  if (!container) return;

  if (state.incomes.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 10h8"/><path d="M8 14h5"/></svg>
      <div class="empty-text">No transactions logged yet. Tap a preset above to log your first expense!</div>
    </div>`;
    return;
  }

  const groups = {};
  state.incomes.forEach(i => {
    const key = new Date(i.created_at).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  const sorted = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

  container.innerHTML = sorted.map(dateKey => {
    const items = groups[dateKey];
    const total = sumExp(items);
    const isToday = dateKey === new Date().toDateString();
    const isYesterday = dateKey === new Date(Date.now() - 864e5).toDateString();
    const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : fmtDate(dateKey);

    return `<div class="exp-date-group">
      <div class="exp-date-label"><span>${label}</span><span style="color:var(--emerald);">${fmt(total)}</span></div>
      ${items.map(inc => {
        const meta = INC_META[inc.category] || { label: inc.category || 'Income', color: 'var(--emerald)' };
        return `<div class="exp-item" style="background:radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 55%), var(--glass);">
          <div class="exp-icon" style="background:rgba(52,211,153,0.15);color:var(--emerald);">${I.income}</div>
          <div class="exp-info">
            <div class="exp-cat" style="color:var(--emerald);">${meta.label}</div>
            <div class="exp-notes">${inc.notes || '—'}</div>
            <div class="exp-time">${fmtTime(inc.created_at)}</div>
          </div>
          <div class="exp-amt" style="color:var(--emerald);">+ ${fmt(inc.amount)}</div>
          <button class="del-btn" onclick="window.deleteIncome('${inc.id}')">${I.trash}</button>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function onIncCategoryChange(val) {
  const container = document.getElementById('customIncCategoryContainer');
  const input = document.getElementById('customIncCategory');
  if (val === 'custom') {
    if (container) container.style.display = 'block';
    if (input) input.focus();
  } else {
    if (container) container.style.display = 'none';
  }
}

function openIncomeModal() {
  switchView('expenses');
  setTxnMode('income');
}

function closeIncomeModal() {
  const modal = document.getElementById('incomeModalOverlay');
  if (modal) modal.classList.remove('active');
}

function renderInvestments() {
  renderFixed();
  renderStocks();
}

function renderFixed() {
  const items = state.investments.filter(i => i.type === 'tbill' || i.type === 'gcb_master_wealth');
  const container = document.getElementById('fixedGrid');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div class="card empty-state" style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-m);background:var(--glass);">No entries recorded yet.</div>`;
    return;
  }

  container.innerHTML = items.map(inv => {
    const isT = inv.type === 'tbill';
    const cardClass = isT ? 'card-tbill tbill' : 'card-gcb gcb';
    const badgeClass = isT ? 'tbill' : 'gcb';
    const color = isT ? 'var(--emerald)' : 'var(--indigo)';
    const progress = getInvestmentProgress(inv);
    const value = getInvestmentValue(inv);
    const principal = money(inv.principal_or_shares);
    const rate = money(inv.rate_or_buyprice || 0);
    const interest = value - principal;
    const created = new Date(inv.created_at || Date.now());
    const maturity = new Date(inv.maturity_date);
    const now = new Date();
    const totalDays = daysBetween(created, maturity);
    const daysLeft = daysBetween(now, maturity);
    const totalInterestAtMaturity = principal * (rate / 100) * (totalDays / 365);

    return `<div class="card inv-card ${cardClass}">
      <div class="inv-header">
        <div>
          <div class="inv-name">${inv.name}</div>
          <div class="inv-badge ${badgeClass}">${isT ? 'Treasury Bill' : 'GCB Master Wealth'}</div>
        </div>
        <button class="del-btn" style="opacity:0.6;" onclick="window.deleteInvestment('${inv.id}')">${I.trash}</button>
      </div>
      <div class="inv-metrics">
        <div class="metric"><div class="metric-label">Principal</div><div class="metric-value">${fmt(principal)}</div></div>
        <div class="metric"><div class="metric-label">Rate</div><div class="metric-value">${rate.toFixed(2)}%</div></div>
        <div class="metric"><div class="metric-label">Current Value</div><div class="metric-value" style="color:${color};">${fmt(value)}</div></div>
        <div class="metric"><div class="metric-label">Interest Earned</div><div class="metric-value" style="color:var(--emerald);">${fmt(interest)}</div></div>
      </div>
      <div class="metric-label" style="margin-bottom:4px;">Maturity Progress</div>
      <div class="mat-bar"><div class="mat-fill" style="width:${progress}%;background:${color};"></div></div>
      <div class="mat-meta">
        <span>${progress.toFixed(0)}% complete</span>
        <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Matured'}</span>
      </div>
      <div style="margin-top:12px;padding:11px 14px;border-radius:11px;background:var(--target-info-bg);font-size:12px;color:var(--text-m);display:flex;justify-content:space-between;align-items:center;">
        <span style="display:flex;align-items:center;gap:6px;">${I.calendar}<span>Matures ${fmtDate(inv.maturity_date)}</span></span>
        <span style="color:var(--emerald);font-weight:600;">Est. total: ${fmt(principal + totalInterestAtMaturity)}</span>
      </div>
    </div>`;
  }).join('');
}

function renderStocks() {
  const items = state.investments.filter(i => i.type === 'stock');
  const container = document.getElementById('stocksGrid');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div class="card empty-state" style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-m);background:var(--glass);">No entries recorded yet.</div>`;
    return;
  }

  container.innerHTML = items.map(inv => {
    const shares = money(inv.principal_or_shares);
    const buyPrice = money(inv.rate_or_buyprice);
    const currentPrice = money(inv.current_price || buyPrice);
    const { pl, plPct, current } = getStockPL(inv);
    const isProfit = pl >= 0;
    const alert = checkTargetAlert(inv);
    const isCustom = inv.is_custom || !state.gseCache.some(s => inv.name.toUpperCase().startsWith(s.ticker));

    return `<div class="card inv-card card-stocks stock">
      <div class="inv-header">
        <div>
          <div class="inv-name">${inv.name}</div>
          <div class="inv-badge stock">${isCustom ? 'Custom Stock' : 'Stock'}</div>
        </div>
        <button class="del-btn" style="opacity:0.6;" onclick="window.deleteInvestment('${inv.id}')">${I.trash}</button>
      </div>
      <div class="inv-metrics">
        <div class="metric"><div class="metric-label">Shares</div><div class="metric-value">${shares.toLocaleString()}</div></div>
        <div class="metric"><div class="metric-label">Avg Buy</div><div class="metric-value">GH₵${buyPrice.toFixed(2)}</div></div>
        <div class="metric">
          <div class="metric-label">Current</div>
          <div class="metric-value" style="display:flex;align-items:center;gap:4px;">
            GH₵${currentPrice.toFixed(2)}
            <button class="edit-price-btn" onclick="window.updatePricePrompt('${inv.id}')" title="Edit Market Price">✏️</button>
          </div>
        </div>
        <div class="metric"><div class="metric-label">Value</div><div class="metric-value">${fmt(current)}</div></div>
      </div>
      <div class="stock-pl ${isProfit ? 'profit' : 'loss'}">
        ${isProfit ? I.trendingUp : I.trendingDown}
        <span>${isProfit ? '+' : ''}${fmt(pl)} (${isProfit ? '+' : ''}${plPct.toFixed(2)}%)</span>
      </div>
      ${inv.target_price ? `
        <div class="target-info">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="color:var(--text-m);display:flex;align-items:center;gap:6px;">${I.target}<span>Target ${inv.target_type === 'buy' ? 'Buy' : 'Sell'} Price</span></span>
            <span style="font-weight:700;color:var(--gold-d);">GH₵${money(inv.target_price).toFixed(2)}</span>
          </div>
          <div style="font-size:11px;color:var(--text-d);">
            ${inv.target_type === 'buy' ? `Alert when price drops to or below GH₵${money(inv.target_price).toFixed(2)}` : `Alert when price rises to or above GH₵${money(inv.target_price).toFixed(2)}`}
          </div>
        </div>
      ` : ''}
      ${alert ? `
        <div class="target-alert">
          ${I.bell}<span>${alert === 'buy' ? 'Buy target reached!' : 'Sell target reached!'}</span>
        </div>
      ` : ''}
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button class="btn btn-ghost" style="flex:1;font-size:13px;padding:9px 12px;" onclick="window.updatePricePrompt('${inv.id}')">Update Price</button>
      </div>
    </div>`;
  }).join('');
}

function updatePricePrompt(id) {
  const inv = state.investments.find(i => i.id === id);
  if (!inv) return;

  const modal = document.getElementById('modalOverlay');
  if (!modal) return;
  const modalEl = modal.querySelector('.modal');
  if (!modalEl) return;
  modalEl.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Update ${inv.name} Price</div>
      <button class="modal-close" id="modalClose2">${I.x}</button>
    </div>
    <div class="form-group" style="margin-bottom:16px;">
      <label class="form-label">Current Price (GH₵)</label>
      <input type="number" class="form-input" id="newPriceInput" value="${inv.current_price || inv.rate_or_buyprice}" step="0.01" min="0" autofocus>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-ghost" style="flex:1;" id="cancelPriceBtn">Cancel</button>
      <button class="btn btn-primary" style="flex:1;" id="confirmPriceBtn">Update</button>
    </div>
  `;
  modal.classList.add('active');
  const close2 = document.getElementById('modalClose2');
  const cancelBtn = document.getElementById('cancelPriceBtn');
  const confirmBtn = document.getElementById('confirmPriceBtn');
  if (close2) close2.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const newPriceInput = document.getElementById('newPriceInput');
      const newPrice = newPriceInput ? parseFloat(newPriceInput.value) : NaN;
      if (!isNaN(newPrice) && newPrice >= 0) {
        updateStockPrice(id, newPrice);
        closeModal();
        restoreModal();
      } else {
        toast('Please enter a valid price', 'error');
      }
    };
  }
}

function restoreModal() {
  const modalEl = document.querySelector('#modalOverlay .modal');
  if (!modalEl) return;
  modalEl.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Add Investment</div>
      <button class="modal-close" id="modalClose">${I.x}</button>
    </div>
    <div class="type-selector" id="typeSelector">
      <button class="type-opt active" data-type="tbill">T-Bill</button>
      <button class="type-opt" data-type="gcb_master_wealth">GCB Wealth</button>
      <button class="type-opt" data-type="stock">Stock</button>
    </div>
    <div id="invForm"></div>
  `;
  const mClose = document.getElementById('modalClose');
  if (mClose) mClose.addEventListener('click', closeModal);
  document.querySelectorAll('.type-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.type-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.selectedType = opt.dataset.type;
      renderInvForm();
    });
  });
  renderInvForm();
}

// View & Tab Switching
function switchView(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(`view-${view}`);
  if (targetView) targetView.classList.add('active');
  const moreViews = ['debts', 'reports', 'settings'];
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  const moreBtn = document.getElementById('open-more-menu');
  if (moreBtn) {
    moreBtn.classList.toggle('active', moreViews.includes(view));
  }
}



function openMoreMenuModal() {
  const modal = document.getElementById('moreMenuModalOverlay');
  if (modal) modal.classList.add('active');
}

function closeMoreMenuModal() {
  const modal = document.getElementById('moreMenuModalOverlay');
  if (modal) modal.classList.remove('active');
}

function openHelpModal() {
  const overlay = document.getElementById('helpModalOverlay');
  const modal = document.getElementById('help-modal');
  if (overlay) overlay.classList.add('active');
  if (modal) modal.classList.add('active');
}

function closeHelpModal() {
  const overlay = document.getElementById('helpModalOverlay');
  const modal = document.getElementById('help-modal');
  if (overlay) overlay.classList.remove('active');
  if (modal) modal.classList.remove('active');
}

// Modal Control
function openModal() {
  restoreModal();
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('active');
}

function closeActiveModals() {
  closeModal();
  closeAuthModal();
  closeIncomeModal();
  closeTransferModal();
  const modals = document.querySelectorAll('.modal-overlay, .modal-backdrop, #modalOverlay, #authModalOverlay, #incomeModalOverlay, #transferModalOverlay, #onboardingModalOverlay, #payAllocationModalOverlay');
  modals.forEach(m => {
    m.classList.remove('active');
    if (m.style.display === 'flex' || m.style.display === 'block') {
      m.style.display = 'none';
    }
  });
}

function switchTab(tabId) {
  if (!tabId) return;
  const mainViews = ['dashboard', 'accounts', 'investments', 'expenses', 'debts', 'reports', 'settings'];
  if (mainViews.includes(tabId)) {
    switchView(tabId);
    return;
  }
  const tabs = document.querySelectorAll('.tab[data-tab]');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(t => {
    if (t.dataset.tab === tabId) t.classList.add('active');
    else t.classList.remove('active');
  });
  contents.forEach(c => {
    if (c.id === `tab-${tabId}`) c.classList.add('active');
    else c.classList.remove('active');
  });
  state.currentTab = tabId;
}

function quickFillExpense(amount, category) {
  prefillPreset(amount, category || 'food');
}

function openAuthModal() {
  const authModal = document.getElementById('authModalOverlay') || document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('active');
    authModal.style.display = 'flex';
  }
}

function closeAuthModal() {
  const authModal = document.getElementById('authModalOverlay') || document.getElementById('authModal');
  if (authModal) {
    authModal.classList.remove('active');
    authModal.style.display = 'none';
  }
}

function switchAuthTab(tab) {
  const tabPass = document.getElementById('authTabPass');
  const tabMagic = document.getElementById('authTabMagic');
  const passView = document.getElementById('authPassView');
  const magicView = document.getElementById('authMagicView');

  if (tabPass) tabPass.classList.toggle('active', tab === 'password');
  if (tabMagic) tabMagic.classList.toggle('active', tab === 'magic');
  if (passView) passView.style.display = tab === 'password' ? 'block' : 'none';
  if (magicView) magicView.style.display = tab === 'magic' ? 'block' : 'none';
}

function renderInvForm() {
  const type = state.selectedType;
  const container = document.getElementById('invForm');
  if (!container) return;
  let fields = '';

  if (type === 'tbill' || type === 'gcb_master_wealth') {
    const defaultName = type === 'tbill' ? '91-Day T-Bill' : 'GCB Master Wealth';
    fields = `
      <div class="form-group" style="margin-bottom:12px;">
        <label class="form-label">Name</label>
        <input type="text" class="form-input" id="inv-name" value="${defaultName}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Principal (GH₵)</label>
          <input type="number" class="form-input" id="inv-principal" placeholder="10000" step="0.01" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Interest Rate (%)</label>
          <input type="number" class="form-input" id="inv-rate" placeholder="14.5" step="0.01" min="0">
        </div>
      </div>
      <div class="form-group" style="margin-bottom:20px;">
        <label class="form-label">Maturity Date</label>
        <input type="date" class="form-input" id="inv-maturity">
      </div>
    `;
  } else {
    const stockOptions = state.gseCache.map(s => `<option value="${s.ticker}">${s.ticker} - ${s.name} (₵${s.price.toFixed(2)})</option>`).join('');

    fields = `
      <div class="form-group" style="margin-bottom:12px;">
        <label class="form-label">Select Stock from GSE Cache</label>
        <select class="form-input" id="stock-picker" onchange="onStockSelectChange(this.value)">
          ${stockOptions}
          <option value="CUSTOM">+ Add Custom / Unlisted Stock</option>
        </select>
      </div>
      
      <!-- Custom Stock Inputs Container -->
      <div id="custom-stock-inputs" style="display:none;">
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Custom Ticker Symbol</label>
          <input type="text" class="form-input" id="custom-stock-ticker" placeholder="e.g. UNIL" autofocus>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Company / Asset Name</label>
          <input type="text" class="form-input" id="custom-stock-name" placeholder="e.g. Unilever Ghana PLC">
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Manual Current Price (GH₵)</label>
          <input type="number" class="form-input" id="custom-stock-price" placeholder="4.50" step="0.01" min="0">
        </div>
      </div>

      <div id="standard-stock-inputs">
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Stock Ticker / Name</label>
          <input type="text" class="form-input" id="inv-name" value="${state.gseCache[0]?.ticker || 'MTNGH'}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Shares</label>
          <input type="number" class="form-input" id="inv-shares" placeholder="1000" step="1" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Avg Buy Price (GH₵)</label>
          <input type="number" class="form-input" id="inv-buyprice" value="${state.gseCache[0]?.price || 1.15}" step="0.01" min="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" id="current-price-group">
          <label class="form-label">Current Market Price (GH₵)</label>
          <input type="number" class="form-input" id="inv-currentprice" value="${state.gseCache[0]?.price || 1.15}" step="0.01" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Target Alert Type</label>
          <select class="form-input" id="inv-targettype">
            <option value="buy">Buy Target Alert</option>
            <option value="sell">Sell Target Alert</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:20px;">
        <label class="form-label">Target Trigger Price (GH₵) - optional</label>
        <input type="number" class="form-input" id="inv-targetprice" placeholder="1.00" step="0.01" min="0">
      </div>
    `;
  }

  container.innerHTML = fields + `<button class="btn btn-primary" id="saveInvBtn" style="width:100%;">Save Investment</button>`;
  const saveBtn = document.getElementById('saveInvBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveInvestment);
}

function onStockSelectChange(val) {
  const stockPicker = document.getElementById('stock-picker') || document.getElementById('inv-stock-select');
  const selectedValue = val || (stockPicker ? stockPicker.value : '');
  const customContainer = document.getElementById('custom-stock-inputs');
  const standardInputs = document.getElementById('standard-stock-inputs');
  const nameEl = document.getElementById('inv-name');
  const buyPriceEl = document.getElementById('inv-buyprice');
  const currPriceEl = document.getElementById('inv-currentprice');

  if (selectedValue === 'CUSTOM') {
    if (customContainer) customContainer.style.display = 'block';
    if (standardInputs) standardInputs.style.display = 'none';
    if (nameEl) nameEl.value = '';
    if (buyPriceEl) buyPriceEl.value = '';
    if (currPriceEl) currPriceEl.value = '';
  } else {
    if (customContainer) customContainer.style.display = 'none';
    if (standardInputs) standardInputs.style.display = 'block';
    const stock = state.gseCache.find(s => s.ticker === selectedValue);
    if (stock) {
      if (nameEl) nameEl.value = stock.ticker;
      if (buyPriceEl) buyPriceEl.value = stock.price;
      if (currPriceEl) currPriceEl.value = stock.price;
    }
  }
}

function saveInvestment() {
  const type = state.selectedType;
  if (type === 'stock') {
    const stockPicker = document.getElementById('stock-picker') || document.getElementById('inv-stock-select');
    const isCustom = stockPicker && stockPicker.value === 'CUSTOM';
    
    let name = '';
    let currentPrice = 0;
    let buyPrice = 0;

    const sharesInput = document.getElementById('inv-shares');
    const shares = sharesInput ? parseFloat(sharesInput.value) : NaN;
    const buypriceInput = document.getElementById('inv-buyprice');

    if (isCustom) {
      const tickerInput = document.getElementById('custom-stock-ticker');
      const companyInput = document.getElementById('custom-stock-name');
      const customPriceInput = document.getElementById('custom-stock-price');

      const ticker = tickerInput ? tickerInput.value.trim().toUpperCase() : '';
      const company = companyInput ? companyInput.value.trim() : '';
      
      if (!ticker && !company) {
        toast('Please enter custom ticker or company name', 'error');
        return;
      }

      name = company ? `${ticker ? ticker + ' - ' : ''}${company}` : ticker;
      const customPriceVal = customPriceInput && customPriceInput.value ? parseFloat(customPriceInput.value) : NaN;
      buyPrice = buypriceInput && buypriceInput.value ? parseFloat(buypriceInput.value) : (isNaN(customPriceVal) ? 0 : customPriceVal);
      currentPrice = !isNaN(customPriceVal) ? customPriceVal : buyPrice;
    } else {
      const nameInput = document.getElementById('inv-name');
      const currpriceInput = document.getElementById('inv-currentprice');

      name = nameInput ? nameInput.value.trim() : '';
      buyPrice = buypriceInput ? parseFloat(buypriceInput.value) : NaN;
      currentPrice = currpriceInput && currpriceInput.value ? parseFloat(currpriceInput.value) : buyPrice;
    }

    const targetpriceInput = document.getElementById('inv-targetprice');
    const targettypeInput = document.getElementById('inv-targettype');
    const targetPrice = targetpriceInput ? parseFloat(targetpriceInput.value) : NaN;
    const targetType = targettypeInput ? targettypeInput.value : 'buy';

    if (!name) { toast('Please enter a stock name or ticker', 'error'); return; }
    if (isNaN(shares) || shares <= 0) { toast('Please enter a valid number of shares', 'error'); return; }
    if (isNaN(buyPrice) || buyPrice <= 0) { toast('Please enter a valid buy price', 'error'); return; }

    const inv = {
      type,
      name,
      principal_or_shares: shares,
      rate_or_buyprice: buyPrice,
      current_price: isNaN(currentPrice) || currentPrice <= 0 ? buyPrice : currentPrice,
      target_price: isNaN(targetPrice) ? null : targetPrice,
      target_type: targetType,
      is_custom: isCustom,
      maturity_date: null
    };

    addInvestment(inv);
    closeModal();
  } else {
    const nameInput = document.getElementById('inv-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const principalInput = document.getElementById('inv-principal');
    const rateInput = document.getElementById('inv-rate');
    const maturityInput = document.getElementById('inv-maturity');

    const principal = principalInput ? parseFloat(principalInput.value) : NaN;
    const rate = rateInput ? parseFloat(rateInput.value) : NaN;
    const maturity = maturityInput ? maturityInput.value : '';

    if (!name || isNaN(principal) || isNaN(rate) || !maturity) {
      toast('Please fill all required investment fields', 'error');
      return;
    }

    const inv = {
      type,
      name,
      principal_or_shares: principal,
      rate_or_buyprice: rate,
      maturity_date: maturity,
      target_price: null,
      current_price: null,
      target_type: null
    };

    addInvestment(inv);
    closeModal();
  }
}

// Reports
function exportCsv() {
  const header = ['Type', 'Category/Name', 'Amount/Principal', 'Rate/BuyPrice', 'Date', 'Notes'];
  const expenseRows = state.expenses.map(e => ['Expense', e.category, e.amount, '', e.expense_date || e.created_at, e.notes || '']);
  const incomeRows = state.incomes.map(i => ['Income', i.category, i.amount, '', i.income_date || i.created_at, i.notes || '']);
  const investmentRows = state.investments.map(i => ['Investment', i.name, i.principal_or_shares, i.rate_or_buyprice || '', i.maturity_date || i.created_at, i.type]);

  const csvContent = [header, ...expenseRows, ...incomeRows, ...investmentRows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `aura-wealth-export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast('CSV report downloaded', 'success');
}

// 1-Page Official Net Worth & Asset Proof Statement PDF Generator
function exportPdf() {
  const element = document.createElement('div');
  element.style.padding = '36px 40px';
  element.style.background = '#ffffff';
  element.style.color = '#0f172a';
  element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  element.style.lineHeight = '1.15';

  const userEmail = state.authUser ? state.authUser.email : 'Guest Profile';
  const nowStr = new Date().toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' });
  const nw = getNetWorth();
  const liquid = getSpendableLiquidCash();
  const locked = getLockedTotal();
  const stockVal = getStockTotal();

  const bankAmt = getBankCash();
  const momoAmt = getMomoCash();
  const homeAmt = getHomeCash();
  const usdAmt = getUsdHomeCash();
  const usdGhsAmt = getUsdHomeCashInGhs();

  const investmentsRows = state.investments.map(inv => {
    const val = getInvestmentValue(inv);
    const rate = inv.type === 'stock' ? `Buy ₵${money(inv.rate_or_buyprice).toFixed(2)}` : `${money(inv.rate_or_buyprice).toFixed(2)}%`;
    const mat = inv.maturity_date ? fmtDate(inv.maturity_date) : (inv.type === 'stock' ? 'Equity Holding' : 'N/A');
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding:10px 12px; font-weight:600;">${inv.name}</td>
        <td style="padding:10px 12px; color:#475569;">${inv.type === 'tbill' ? 'Treasury Bill' : inv.type === 'gcb_master_wealth' ? 'GCB Wealth' : 'GSE Stock'}</td>
        <td style="padding:10px 12px; text-align:right; font-variant-numeric:tabular-nums;">${fmtGhs(inv.principal_or_shares)}</td>
        <td style="padding:10px 12px; text-align:right;">${rate}</td>
        <td style="padding:10px 12px; text-align:right;">${mat}</td>
        <td style="padding:10px 12px; text-align:right; font-weight:700;">${fmtGhs(val)}</td>
      </tr>
    `;
  }).join('');

  element.innerHTML = `
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 24px; display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <h1 style="margin:0; font-size:24px; font-weight:800; color:#0f172a; letter-spacing:-0.02em;">AURA ECONOMICS</h1>
        <div style="font-size:13px; color:#0f172a; margin-top:4px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">VERIFIED STATEMENT OF ASSETS</div>
        <div style="font-size:11px; color:#64748b; margin-top:3px; font-style:italic;">Engineered via DycsonEconsOS Core</div>
      </div>
      <div style="text-align:right; font-size:12px; color:#475569;">
        <div><strong>Account Holder:</strong> ${userEmail}</div>
        <div><strong>Statement Date:</strong> ${nowStr}</div>
      </div>
    </div>

    <!-- Summary Box Grid -->
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:28px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:10px;">
        <div style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:700; letter-spacing:0.05em;">Total Net Worth</div>
        <div style="font-size:22px; font-weight:800; color:#0f172a; margin-top:4px; font-variant-numeric:tabular-nums;">${fmtGhs(nw)}</div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:10px;">
        <div style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:700; letter-spacing:0.05em;">Spendable Liquid Cash</div>
        <div style="font-size:22px; font-weight:800; color:#0284c7; margin-top:4px; font-variant-numeric:tabular-nums;">${fmtGhs(liquid)}</div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:10px;">
        <div style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:700; letter-spacing:0.05em;">Locked Investments</div>
        <div style="font-size:22px; font-weight:800; color:#4f46e5; margin-top:4px; font-variant-numeric:tabular-nums;">${fmtGhs(locked + stockVal)}</div>
      </div>
    </div>

    <!-- Liquid Cash Vaults Table -->
    <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; margin-bottom:10px; font-weight:700; border-bottom:1px solid #cbd5e1; padding-bottom:6px;">1. Spendable Liquid Cash Vaults</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:13px;">
      <thead>
        <tr style="background:#f1f5f9; text-align:left; color:#475569; font-weight:700;">
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1;">Asset Vault</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;">Native Balance</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;">GH₵ Equivalent</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px; font-weight:600;">Bank Account (Savings)</td>
          <td style="padding:8px 12px; text-align:right;">${fmtGhs(bankAmt)}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmtGhs(bankAmt)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px; font-weight:600;">MTN Mobile Money</td>
          <td style="padding:8px 12px; text-align:right;">${fmtGhs(getMtnMomoCash())}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmtGhs(getMtnMomoCash())}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px; font-weight:600;">Telecel Cash</td>
          <td style="padding:8px 12px; text-align:right;">${fmtGhs(getTelecelCash())}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmtGhs(getTelecelCash())}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px; font-weight:600;">AT Money</td>
          <td style="padding:8px 12px; text-align:right;">${fmtGhs(getAtMoneyCash())}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmtGhs(getAtMoneyCash())}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px; font-weight:600;">Physical Home Cash</td>
          <td style="padding:8px 12px; text-align:right;">${fmtGhs(homeAmt)}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmtGhs(homeAmt)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px; font-weight:600;">USD Home Cash Vault</td>
          <td style="padding:8px 12px; text-align:right;">$${usdAmt.toFixed(2)} USD</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmtGhs(usdGhsAmt)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Portfolio & Fixed Income Holdings Table -->
    <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; margin-bottom:10px; font-weight:700; border-bottom:1px solid #cbd5e1; padding-bottom:6px;">2. Investment Holdings & Asset Breakdown</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:13px;">
      <thead>
        <tr style="background:#f1f5f9; text-align:left; color:#475569; font-weight:700;">
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1;">Instrument Name</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1;">Type</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;">Principal / Shares</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;">Rate / Price</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;">Maturity Date</th>
          <th style="padding:8px 12px; border-bottom:1px solid #cbd5e1; text-align:right;">Current Value</th>
        </tr>
      </thead>
      <tbody>
        ${investmentsRows || '<tr><td colspan="6" style="padding:12px; text-align:center; color:#94a3b8;">No investment positions recorded</td></tr>'}
      </tbody>
    </table>

    <div style="margin-top:40px; border-top:1px solid #cbd5e1; padding-top:14px; text-align:center; font-size:11px; color:#64748b;">
      Self-reported financial statement compiled via Aura Economics (DycsonEconsOS Core) for proof of funds verification.
    </div>
  `;

  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: 0.4,
      filename: `aura-wealth-proof-statement-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      toast('Proof of Funds PDF statement downloaded', 'success');
    }).catch(() => window.print());
  } else {
    window.print();
  }
}

function initStatementDatePickers() {
  const startEl = document.getElementById('statement-start-date');
  const endEl = document.getElementById('statement-end-date');
  const now = new Date();
  if (startEl && !startEl.value) {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startEl.value = firstDay.toISOString().split('T')[0];
  }
  if (endEl && !endEl.value) {
    endEl.value = now.toISOString().split('T')[0];
  }
}

function exportExpenditureStatement() {
  const startEl = document.getElementById('statement-start-date');
  const endEl = document.getElementById('statement-end-date');

  let startDate = startEl && startEl.value ? new Date(startEl.value + 'T00:00:00') : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let endDate = endEl && endEl.value ? new Date(endEl.value + 'T23:59:59') : new Date();

  if (isNaN(startDate.getTime())) startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  if (isNaN(endDate.getTime())) endDate = new Date();

  const expInRange = (state.expenses || []).filter(e => {
    const d = new Date(e.expense_date || e.created_at);
    return d >= startDate && d <= endDate;
  });

  const incInRange = (state.incomes || []).filter(i => {
    const d = new Date(i.income_date || i.created_at);
    return d >= startDate && d <= endDate;
  });

  const totalExpense = sumExp(expInRange);
  const totalIncome = sumExp(incInRange);
  const netCashFlow = totalIncome - totalExpense;

  const ledger = [
    ...incInRange.map(i => ({
      date: i.income_date || i.created_at,
      source: getVaultName(i.source || 'Income Vault'),
      category: i.category || 'Income',
      description: i.notes || 'Income deposit',
      type: '+',
      amount: money(i.amount)
    })),
    ...expInRange.map(e => ({
      date: e.expense_date || e.created_at,
      source: getVaultName(e.source || 'momo'),
      category: e.category || 'Expense',
      description: e.notes || 'Expense payout',
      type: '-',
      amount: money(e.amount)
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const holder = (state.user && state.user.email) ? state.user.email : 'Primary Account Holder';
  const periodStr = `${fmtDate(startDate)} - ${fmtDate(endDate)}`;

  const element = document.createElement('div');
  element.style.padding = '24px';
  element.style.fontFamily = "'IBM Plex Sans', -apple-system, sans-serif";
  element.style.color = '#0f172a';
  element.style.background = '#ffffff';

  element.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:12px; margin-bottom:16px;">
      <div>
        <h1 style="margin:0; font-size:20px; font-weight:800; color:#0f172a; letter-spacing:-0.02em;">AURA WEALTH OS - ACCOUNT STATEMENT</h1>
        <div style="font-size:12px; color:#64748b; margin-top:4px; font-weight:600; text-transform:uppercase;">Official Expenditure Statement</div>
      </div>
      <div style="text-align:right; font-size:12px; color:#475569;">
        <div><strong>Account Holder:</strong> ${holder}</div>
        <div><strong>Statement Period:</strong> ${periodStr}</div>
        <div><strong>Generated:</strong> ${fmtDate(new Date())}</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:20px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
        <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700;">Total Received</div>
        <div style="font-size:18px; font-weight:700; color:#059669; margin-top:4px;">${fmt(totalIncome)}</div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
        <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700;">Total Spent</div>
        <div style="font-size:18px; font-weight:700; color:#dc2626; margin-top:4px;">${fmt(totalExpense)}</div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
        <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700;">Net Change</div>
        <div style="font-size:18px; font-weight:700; color:${netCashFlow >= 0 ? '#059669' : '#dc2626'}; margin-top:4px;">${fmt(netCashFlow)}</div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:11px;">
      <thead>
        <tr style="background:#f1f5f9; text-align:left;">
          <th style="padding:8px; border:1px solid #cbd5e1; font-weight:700;">Date</th>
          <th style="padding:8px; border:1px solid #cbd5e1; font-weight:700;">Source Vault</th>
          <th style="padding:8px; border:1px solid #cbd5e1; font-weight:700;">Category</th>
          <th style="padding:8px; border:1px solid #cbd5e1; font-weight:700;">Description</th>
          <th style="padding:8px; border:1px solid #cbd5e1; font-weight:700; text-align:center;">Type</th>
          <th style="padding:8px; border:1px solid #cbd5e1; font-weight:700; text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${ledger.length === 0 ? `
          <tr>
            <td colspan="6" style="padding:16px; text-align:center; color:#64748b; border:1px solid #cbd5e1;">
              No transactions recorded for the selected period (${periodStr}).
            </td>
          </tr>
        ` : ledger.map(item => `
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:6px 8px; border:1px solid #e2e8f0;">${fmtDate(item.date)}</td>
            <td style="padding:6px 8px; border:1px solid #e2e8f0;">${item.source}</td>
            <td style="padding:6px 8px; border:1px solid #e2e8f0;">${item.category}</td>
            <td style="padding:6px 8px; border:1px solid #e2e8f0;">${item.description}</td>
            <td style="padding:6px 8px; border:1px solid #e2e8f0; text-align:center; font-weight:700; color:${item.type === '+' ? '#059669' : '#dc2626'};">${item.type}</td>
            <td style="padding:6px 8px; border:1px solid #e2e8f0; text-align:right; font-weight:700; color:${item.type === '+' ? '#059669' : '#dc2626'};">${fmt(item.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top:24px; border-top:1px solid #cbd5e1; padding-top:10px; text-align:center; font-size:10px; color:#64748b;">
      Statement generated from Aura Wealth OS. For official personal records and expenditure audit.
    </div>
  `;

  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: 0.4,
      filename: `aura-expenditure-statement-${startEl && startEl.value ? startEl.value : 'start'}-to-${endEl && endEl.value ? endEl.value : 'end'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      toast('Expenditure Statement PDF downloaded', 'success');
    }).catch(() => window.print());
  } else {
    window.print();
  }
}

// Fee Estimator Engine
function calculateDefaultFee(amount) {
  const taxable = Math.max(0, money(amount) - 100);
  return parseFloat((taxable * 0.01).toFixed(2));
}

function toggleFeeInput(prefix) {
  const toggle = document.getElementById(`${prefix}FeeToggle`);
  const container = document.getElementById(`${prefix}FeeContainer`);
  const amountInput = document.getElementById(`${prefix}Amount`);
  const feeInput = document.getElementById(`${prefix}FeeAmount`);
  
  if (!toggle || !container) return;
  if (toggle.checked) {
    container.style.display = 'block';
    if (feeInput && (!feeInput.value || parseFloat(feeInput.value) === 0)) {
      const amt = amountInput ? parseFloat(amountInput.value) || 0 : 0;
      feeInput.value = calculateDefaultFee(amt);
    }
  } else {
    container.style.display = 'none';
    if (feeInput) feeInput.value = '';
  }
}

function onFeeAmountInput(prefix, val) {
  const toggle = document.getElementById(`${prefix}FeeToggle`);
  const feeInput = document.getElementById(`${prefix}FeeAmount`);
  if (toggle && toggle.checked && feeInput) {
    feeInput.value = calculateDefaultFee(val);
  }
}

// 1-Click Salary Allocation Engine
function getOrdinalSuffix(i) {
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function openPayAllocationModal(salaryAmt, cycleKey) {
  const modal = document.getElementById('payAllocationModalOverlay');
  if (!modal) return;
  const rule = state.settings.payAllocation || { tbills: 500, savings: 300, momo: 1100 };
  const tEl = document.getElementById('modalAllocTbills');
  const sEl = document.getElementById('modalAllocSavings');
  const mEl = document.getElementById('modalAllocMomo');
  const cEl = document.getElementById('allocModalCycle');

  if (tEl) tEl.value = rule.tbills || 0;
  if (sEl) sEl.value = rule.savings || 0;
  if (mEl) mEl.value = rule.momo || 0;
  if (cEl) cEl.textContent = cycleKey || `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

  modal.classList.add('active');
}

function closePayAllocationModal() {
  const modal = document.getElementById('payAllocationModalOverlay');
  if (modal) modal.classList.remove('active');
}

function confirmPayAllocation() {
  const tVal = parseFloat(document.getElementById('modalAllocTbills').value) || 0;
  const sVal = parseFloat(document.getElementById('modalAllocSavings').value) || 0;
  const mVal = parseFloat(document.getElementById('modalAllocMomo').value) || 0;

  if (sVal > 0) {
    state.settings.bankCash = (state.settings.bankCash || 0) + sVal;
    state.settings.cashBalance = state.settings.bankCash;
  }
  if (mVal > 0) state.settings.mtnMomoCash = (state.settings.mtnMomoCash || 0) + mVal;

  const now = new Date();
  const cycleKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  state.settings.lastPayAllocationCycle = cycleKey;

  const statusEl = document.getElementById('lastAllocStatus');
  if (statusEl) statusEl.textContent = `Last run: ${cycleKey}`;

  saveToStorage();
  closePayAllocationModal();
  renderAll();

  if (tVal > 0) {
    toast(`Allocated GH₵${sVal.toFixed(2)} to Bank & GH₵${mVal.toFixed(2)} to MoMo. Opening T-Bill investment form...`, 'success');
    setTimeout(() => {
      openModal();
      const principalInput = document.getElementById('inv-principal');
      if (principalInput) principalInput.value = tVal;
    }, 450);
  } else {
    toast('Salary allocated successfully across cash vaults!', 'success');
  }
}

// Debts & Receivables Micro-Ledger Engine
function openAddDebtModal() {
  const modal = document.getElementById('debtModalOverlay');
  if (modal) modal.classList.add('active');
}

function closeDebtModal() {
  const modal = document.getElementById('debtModalOverlay');
  if (modal) modal.classList.remove('active');
}

function saveDebt() {
  const direction = document.getElementById('debtDirection').value;
  const counterparty = document.getElementById('debtCounterparty').value.trim();
  const amount = parseFloat(document.getElementById('debtAmount').value) || 0;
  const dueDate = document.getElementById('debtDueDate').value || null;
  const notes = document.getElementById('debtNotes').value.trim();

  if (!counterparty) { toast('Please enter counterparty name', 'error'); return; }
  if (amount <= 0) { toast('Please enter a valid debt amount', 'error'); return; }

  const debt = {
    id: uuid(),
    direction,
    counterparty,
    amount,
    amount_repaid: 0,
    status: 'outstanding',
    due_date: dueDate,
    notes,
    created_at: new Date().toISOString()
  };

  state.debts.unshift(debt);
  supaMirror('debts', 'insert', debt);
  saveToStorage();
  renderDebts();
  closeDebtModal();

  document.getElementById('debtCounterparty').value = '';
  document.getElementById('debtAmount').value = '';
  document.getElementById('debtNotes').value = '';
  toast(`${direction === 'lent' ? 'Receivable' : 'Payable'} debt recorded`, 'success');
}

function openRepayDebtModal(id) {
  const d = state.debts.find(item => item.id === id);
  if (!d) return;
  const modal = document.getElementById('repayDebtModalOverlay');
  const idInput = document.getElementById('repayDebtId');
  const label = document.getElementById('repayDebtLabel');
  const amountInput = document.getElementById('repayDebtInput');

  const remaining = Math.max(0, d.amount - (d.amount_repaid || 0));
  if (idInput) idInput.value = id;
  if (label) label.textContent = `Repayment Amount for ${d.counterparty} (Remaining: ${fmt(remaining)})`;
  if (amountInput) { amountInput.value = remaining; amountInput.max = remaining; }
  if (modal) modal.classList.add('active');
}

function closeRepayDebtModal() {
  const modal = document.getElementById('repayDebtModalOverlay');
  if (modal) modal.classList.remove('active');
}

function executeRepayDebt() {
  const id = document.getElementById('repayDebtId').value;
  const amt = parseFloat(document.getElementById('repayDebtInput').value) || 0;
  const debt = state.debts.find(d => d.id === id);
  if (!debt || amt <= 0) { toast('Invalid repayment amount', 'error'); return; }

  debt.amount_repaid = (debt.amount_repaid || 0) + amt;
  if (debt.amount_repaid >= debt.amount) {
    debt.status = 'settled';
  } else {
    debt.status = 'partial';
  }

  supaMirror('debts', 'update', debt);
  saveToStorage();
  renderDebts();
  closeRepayDebtModal();
  toast(`Recorded repayment of ${fmt(amt)} for ${debt.counterparty}`, 'success');
}

function deleteDebt(id) {
  const idx = state.debts.findIndex(d => d.id === id);
  if (idx >= 0) {
    const removed = state.debts.splice(idx, 1)[0];
    supaMirror('debts', 'delete', removed);
    saveToStorage();
    renderDebts();
    toast('Debt record removed', 'info');
  }
}

function renderDebts() {
  const recList = document.getElementById('receivablesList');
  const payList = document.getElementById('payablesList');
  const recBadge = document.getElementById('totalReceivablesBadge');
  const payBadge = document.getElementById('totalPayablesBadge');

  if (!recList && !payList) return;

  const lentItems = (state.debts || []).filter(d => d.direction === 'lent');
  const borrowedItems = (state.debts || []).filter(d => d.direction === 'borrowed');

  const totalLentRem = lentItems.reduce((s, d) => s + Math.max(0, d.amount - (d.amount_repaid || 0)), 0);
  const totalBorrowRem = borrowedItems.reduce((s, d) => s + Math.max(0, d.amount - (d.amount_repaid || 0)), 0);

  if (recBadge) recBadge.textContent = fmt(totalLentRem);
  if (payBadge) payBadge.textContent = fmt(totalBorrowRem);

  const renderDebtItem = (d, isLent) => {
    const remaining = Math.max(0, d.amount - (d.amount_repaid || 0));
    const statusColor = d.status === 'settled' ? 'var(--emerald)' : d.status === 'partial' ? 'var(--gold-d)' : 'var(--rose)';
    return `
      <div class="exp-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="exp-icon" style="background:${isLent ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)'}; color:${isLent ? 'var(--emerald)' : 'var(--rose)'}; border-radius:10px; padding:8px;">${I.accounts}</div>
          <div>
            <div style="font-weight:700; font-size:14px; display:flex; gap:8px; align-items:center;">
              <span>${d.counterparty}</span>
              <span style="font-size:10px; padding:2px 8px; border-radius:6px; background:${statusColor}25; color:${statusColor}; font-weight:800; text-transform:uppercase;">${d.status}</span>
            </div>
            <div style="font-size:11px; color:var(--text-m); margin-top:2px;">${d.notes || 'No notes'} • Due: ${d.due_date ? fmtDate(d.due_date) : 'N/A'}</div>
            <div style="font-size:11px; color:var(--text-d);">Paid: ${fmt(d.amount_repaid || 0)} / Total: ${fmt(d.amount)}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:15px; font-weight:700; color:${isLent ? 'var(--emerald)' : 'var(--rose)'}">${fmt(remaining)}</div>
          <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:4px;">
            ${d.status !== 'settled' ? `<button class="btn btn-ghost" style="font-size:10px; padding:3px 8px;" onclick="window.openRepayDebtModal('${d.id}')">Repay</button>` : ''}
            <button class="btn btn-ghost" style="font-size:10px; padding:3px 8px; color:var(--rose);" onclick="window.deleteDebt('${d.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  };

  if (recList) {
    recList.innerHTML = lentItems.length === 0 ? '<div style="padding:20px; text-align:center; color:var(--text-d); font-size:13px;">No active receivables</div>' : lentItems.map(d => renderDebtItem(d, true)).join('');
  }
  if (payList) {
    payList.innerHTML = borrowedItems.length === 0 ? '<div style="padding:20px; text-align:center; color:var(--text-d); font-size:13px;">No active payables</div>' : borrowedItems.map(d => renderDebtItem(d, false)).join('');
  }
}

// Settings UI Binding
function loadSettingsUI() {
  const setSal = document.getElementById('setSalary');
  const setLim = document.getElementById('setLimit');
  const setPay = document.getElementById('setPayday');
  const setUsd = document.getElementById('setUsdRate');
  const pAsOf = document.getElementById('pricesAsOf');

  const setTb = document.getElementById('setAllocTbills');
  const setSa = document.getElementById('setAllocSavings');
  const setMo = document.getElementById('setAllocMomo');
  const lastAllocEl = document.getElementById('lastAllocStatus');

  const alloc = state.settings.payAllocation || { tbills: 500, savings: 300, momo: 1100 };

  if (setSal) setSal.value = state.settings.monthlySalary || '';
  if (setLim) setLim.value = state.settings.spendingLimit || '';
  if (setPay) setPay.value = state.settings.paydayDay || 25;
  if (setUsd) setUsd.value = state.settings.usdRate || 0.065;
  if (setTb) setTb.value = alloc.tbills || '';
  if (setSa) setSa.value = alloc.savings || '';
  if (setMo) setMo.value = alloc.momo || '';
  if (lastAllocEl) lastAllocEl.textContent = `Last run: ${state.settings.lastPayAllocationCycle || 'Never'}`;
  if (state.pricesAsOf && pAsOf) pAsOf.textContent = state.pricesAsOf;
}

// PWA Install Prompt Engine
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtns = document.querySelectorAll('.pwa-install-btn');
  installBtns.forEach(btn => btn.style.display = 'inline-flex');
});

async function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast('Aura Wealth OS installed!', 'success');
      deferredPrompt = null;
    }
  } else {
    alert("To install on iOS Safari: Tap the Share button and select 'Add to Home Screen'. On desktop Chrome: click the install icon in your browser address bar.");
  }
}

function toggleAccordion(id) {
  const item = document.getElementById(id);
  if (item) item.classList.toggle('active');
}

// History Tab Switcher (Expenses vs Income)
function switchHistoryTab(tab) {
  state.historyTab = tab;
  const tabExp = document.getElementById('historyTabExp');
  const tabInc = document.getElementById('historyTabInc');
  const tabTrf = document.getElementById('historyTabTrf');
  const expView = document.getElementById('historyExpView');
  const incView = document.getElementById('historyIncView');
  const trfView = document.getElementById('historyTrfView');
  if (tabExp) tabExp.classList.toggle('active', tab === 'expenses');
  if (tabInc) tabInc.classList.toggle('active', tab === 'income');
  if (tabTrf) tabTrf.classList.toggle('active', tab === 'transfers');
  if (expView) expView.style.display = tab === 'expenses' ? 'block' : 'none';
  if (incView) incView.style.display = tab === 'income' ? 'block' : 'none';
  if (trfView) trfView.style.display = tab === 'transfers' ? 'block' : 'none';
}

function renderTransfers() {
  const list = document.getElementById('trfList');
  if (!list) return;
  if (!state.transfers || state.transfers.length === 0) {
    list.innerHTML = `<div class="empty-state"><span>No internal transfers recorded yet.</span></div>`;
    return;
  }
  const accNames = { bank: 'Bank Account', momo: 'Mobile Money (MoMo)', home_cash: 'Physical Home Cash', usd_home_cash: 'USD Home Cash' };
  list.innerHTML = state.transfers.map(t => `
    <div class="exp-item">
      <div class="exp-icon" style="background:rgba(251,191,36,0.15); color:var(--gold);">${I.transfer || I.misc}</div>
      <div class="exp-info">
        <div class="exp-cat">${accNames[t.from_account] || t.from_account} ➔ ${accNames[t.to_account] || t.to_account}</div>
        <div class="exp-notes">${t.notes || 'Internal Transfer'} • ${fmtDate(t.created_at)}</div>
      </div>
      <div class="exp-amount" style="color:var(--gold); font-weight:700;">${fmt(t.amount)}</div>
      <button class="icon-btn danger" onclick="deleteTransfer('${t.id}')" title="Delete Transfer">${I.trash}</button>
    </div>
  `).join('');
}

function renderAccounts() {
  const bVal = document.getElementById('vaultBankVal');
  const mtnVal = document.getElementById('vaultMtnMomoVal');
  const telVal = document.getElementById('vaultTelecelCashVal');
  const atVal = document.getElementById('vaultAtMoneyVal');
  const mVal = document.getElementById('vaultMomoVal');
  const hVal = document.getElementById('vaultHomeVal');
  const uVal = document.getElementById('vaultUsdVal');
  const uGhsVal = document.getElementById('vaultUsdGhsVal');
  const bankCashValEl = document.getElementById('bankCashVal');
  const mtnMomoValEl = document.getElementById('mtnMomoCashVal');
  const telecelValEl = document.getElementById('telecelCashVal');
  const atMoneyValEl = document.getElementById('atMoneyCashVal');
  const momoCashValEl = document.getElementById('momoCashVal');
  const homeCashValEl = document.getElementById('homeCashVal');
  const usdHomeCashValEl = document.getElementById('usdHomeCashVal');
  const usdHomeCashGhsValEl = document.getElementById('usdHomeCashGhsVal');
  const qBank = document.getElementById('quickTransferBankVal');
  const qMomo = document.getElementById('quickTransferMomoVal');

  const bankAmt = getBankCash();
  const mtnAmt = getMtnMomoCash();
  const telAmt = getTelecelCash();
  const atAmt = getAtMoneyCash();
  const momoAmt = getMomoCash();
  const homeAmt = getHomeCash();
  const usdAmt = getUsdHomeCash();
  const usdGhsAmt = getUsdHomeCashInGhs();

  if (bVal) bVal.textContent = fmt(bankAmt);
  if (mtnVal) mtnVal.textContent = fmt(mtnAmt);
  if (telVal) telVal.textContent = fmt(telAmt);
  if (atVal) atVal.textContent = fmt(atAmt);
  if (mVal) mVal.textContent = fmt(momoAmt);
  if (hVal) hVal.textContent = fmt(homeAmt);
  if (uVal) uVal.textContent = `$${usdAmt.toFixed(2)}`;
  if (uGhsVal) uGhsVal.textContent = `(${fmt(usdGhsAmt)})`;

  if (bankCashValEl) bankCashValEl.textContent = fmt(bankAmt);
  if (mtnMomoValEl) mtnMomoValEl.textContent = fmt(mtnAmt);
  if (telecelValEl) telecelValEl.textContent = fmt(telAmt);
  if (atMoneyValEl) atMoneyValEl.textContent = fmt(atAmt);
  if (momoCashValEl) momoCashValEl.textContent = fmt(momoAmt);
  if (homeCashValEl) homeCashValEl.textContent = fmt(homeAmt);
  if (usdHomeCashValEl) usdHomeCashValEl.textContent = `$${usdAmt.toFixed(2)}`;
  if (usdHomeCashGhsValEl) usdHomeCashGhsValEl.textContent = `(${fmt(usdGhsAmt)})`;

  if (qBank) qBank.textContent = fmt(bankAmt);
  if (qMomo) qMomo.textContent = fmt(momoAmt);

  updateEmergencyRunwayBadge();
}

function updateEmergencyRunwayBadge() {
  const totalLiquidGhs = getSpendableLiquidCash();
  const breakdown = getSpendingBreakdown();
  let avgMonthlyExp = breakdown.monthlyAvg;
  if (avgMonthlyExp <= 0) {
    avgMonthlyExp = sumExp(getPaydayCycleExpenses());
  }
  const budget = money(state.settings.spendingLimit);
  const denominator = Math.max(avgMonthlyExp, budget);

  const runwayBadge = document.getElementById('emergencyRunwayBadge');
  if (!runwayBadge) return;

  if (denominator <= 0) {
    runwayBadge.textContent = 'Runway: N/A (Set budget to calculate runway)';
    runwayBadge.className = 'runway-badge rose';
  } else {
    const runwayMonths = totalLiquidGhs / denominator;
    runwayBadge.textContent = `Runway: ${runwayMonths.toFixed(1)} Months Covered`;
    runwayBadge.className = `runway-badge ${runwayMonths >= 6 ? 'emerald' : runwayMonths >= 3 ? 'gold' : 'rose'}`;
  }
}

// Annual Spending Aggregation Engine & Reports Renderer
function getSpendingBreakdown(year = new Date().getFullYear()) {
  const yearExpenses = state.expenses.filter(e => {
    if (e.is_transfer) return false;
    const d = new Date(e.expense_date || e.created_at);
    return d.getFullYear() === year;
  });

  const months = Array(12).fill(0);
  const catTotals = { food: 0, transport: 0, bills: 0, shopping: 0, misc: 0 };

  yearExpenses.forEach(e => {
    const d = new Date(e.expense_date || e.created_at);
    const m = d.getMonth();
    const amt = money(e.amount);
    months[m] += amt;
    if (catTotals[e.category] !== undefined) {
      catTotals[e.category] += amt;
    } else {
      catTotals.misc += amt;
    }
  });

  const yearTotal = months.reduce((a, b) => a + b, 0);
  const currentYear = new Date().getFullYear();
  const currentMonth = year === currentYear ? (new Date().getMonth() + 1) : 12;
  const monthlyAvg = yearTotal / Math.max(1, currentMonth);

  let highestMonthIdx = 0;
  let highestMonthAmt = 0;
  months.forEach((amt, idx) => {
    if (amt > highestMonthAmt) {
      highestMonthAmt = amt;
      highestMonthIdx = idx;
    }
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return {
    year,
    yearTotal,
    monthlyAvg,
    months,
    highestMonthName: highestMonthAmt > 0 ? monthNames[highestMonthIdx] : 'None',
    highestMonthAmt,
    catTotals
  };
}

function renderReports(year = new Date().getFullYear()) {
  initStatementDatePickers();
  const data = getSpendingBreakdown(year);

  const yearTotalEl = document.getElementById('reportYearTotal');
  const monthlyAvgEl = document.getElementById('reportMonthlyAvg');
  const highestMonthEl = document.getElementById('reportHighestMonth');

  if (yearTotalEl) yearTotalEl.textContent = fmt(data.yearTotal);
  if (monthlyAvgEl) monthlyAvgEl.textContent = fmt(data.monthlyAvg);
  if (highestMonthEl) highestMonthEl.textContent = data.highestMonthAmt > 0 ? `${data.highestMonthName} (${fmt(data.highestMonthAmt)})` : '—';

  // 12-Month Expense Grid
  const monthGrid = document.getElementById('reportsMonthGrid');
  if (monthGrid) {
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxMonthVal = Math.max(1, ...data.months);
    monthGrid.innerHTML = data.months.map((amt, idx) => {
      const pct = (amt / maxMonthVal) * 100;
      return `
        <div class="month-card">
          <div class="month-name">${monthNamesShort[idx]}</div>
          <div class="month-val">${fmt(amt)}</div>
          <div class="month-bar-wrap">
            <div class="month-bar-fill" style="width:${Math.min(100, Math.max(4, pct))}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Category Distribution Grid
  const catGrid = document.getElementById('reportsCatGrid');
  if (catGrid) {
    const catKeys = Object.keys(data.catTotals);
    catGrid.innerHTML = catKeys.map(cat => {
      const meta = CAT_META[cat] || { label: cat, color: 'var(--text)' };
      const amt = data.catTotals[cat];
      const pct = data.yearTotal > 0 ? ((amt / data.yearTotal) * 100).toFixed(0) : 0;
      return `
        <div class="month-card">
          <div class="month-name" style="color:${meta.color}">${meta.label}</div>
          <div class="month-val">${fmt(amt)}</div>
          <div style="font-size:11px; color:var(--text-d);">${pct}% of annual spend</div>
        </div>
      `;
    }).join('');
  }
}

// Event Bindings & Global Delegation
function bindEvents() {
  // Global Event Delegation on document.body
  document.body.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    // 1. Navigation / Tab Clicks ([data-nav-target])
    const navTargetBtn = target.closest('[data-nav-target]');
    if (navTargetBtn) {
      const targetTab = navTargetBtn.dataset.navTarget;
      switchTab(targetTab);
      return;
    }

    // 2. Sign Out Button (#sign-out-btn, #signOutBtn)
    const signOutBtn = target.closest('#sign-out-btn, #signOutBtn, [data-action="sign-out"]');
    if (signOutBtn) {
      handleSignOut();
      return;
    }

    // 3. Preset Expense Chips & Quick Presets (+GH₵10, +GH₵25)
    const presetBtn = target.closest('.preset-chip, .quick-preset-btn');
    if (presetBtn) {
      const amount = presetBtn.dataset.amount || presetBtn.getAttribute('data-amount');
      const category = presetBtn.dataset.category || presetBtn.getAttribute('data-cat') || 'food';
      if (amount) {
        quickFillExpense(amount, category);
        return;
      }
    }

    // 4. Modal Triggers & Close Buttons (.close-modal-btn, .modal-close)
    const closeBtn = target.closest('.close-modal-btn, .modal-close, .modal-close-btn, #close-help-modal, #helpModalClose, [data-action="close-modal"], [data-modal-close]');
    if (closeBtn) {
      closeActiveModals();
      return;
    }
    if (target.classList.contains('modal-overlay') || target.classList.contains('backdrop-overlay') || target.classList.contains('slide-over-overlay') || target.id === 'helpModalOverlay' || target.id === 'help-modal') {
      closeActiveModals();
      return;
    }

    // Open More Options Menu Modal
    const openMoreBtn = target.closest('#open-more-menu, [data-action="open-more"]');
    if (openMoreBtn) {
      openMoreMenuModal();
      return;
    }

    // Slide-Over Modal Event Listener (#nav-help-btn)
    const helpBtn = target.closest('#nav-help-btn, [data-action="open-help"]');
    if (helpBtn) {
      openHelpModal();
      return;
    }

    // Gateway to Settings Direct Shortcut (#go-to-full-settings-guide)
    const fullGuideBtn = target.closest('#go-to-full-settings-guide');
    if (fullGuideBtn) {
      closeHelpModal();
      switchTab('settings');
      setTimeout(() => {
        document.getElementById('user-guide-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    // 2. Action: Add Income
    const addIncBtn = target.closest('#addIncomeTopBtn, #add-income-btn, [data-action="add-income"]');
    if (addIncBtn) {
      openIncomeModal();
      return;
    }

    // Gateway Action 1: Sign In / Create Account
    const gatewaySignIn = target.closest('#gatewaySignInBtn, #gateway-signin-btn, [data-action="gateway-signin"]');
    if (gatewaySignIn) {
      closeGatewayModal();
      openAuthModal();
      return;
    }

    // Gateway Action 2: Use as Guest
    const gatewayGuest = target.closest('#gatewayGuestBtn, #gateway-guest-btn, [data-action="gateway-guest"]');
    if (gatewayGuest) {
      closeGatewayModal();
      const onboardModal = document.getElementById('onboardingModalOverlay') || document.getElementById('onboarding-modal');
      if (onboardModal) onboardModal.classList.add('active');
      return;
    }

    // 3. Action: Add Expense / Quick Add
    const addExpBtn = target.closest('#quickAddBtn, #fabBtn, #add-expense-btn, [data-action="add-expense"]');
    if (addExpBtn) {
      switchView('expenses');
      setTimeout(() => { const el = document.getElementById('expAmount'); if (el) el.focus(); }, 300);
      return;
    }

    // 4. Action: Add Investment
    const addInvBtn = target.closest('#addInvBtn, #add-investment-btn, [data-action="add-investment"]');
    if (addInvBtn) {
      openModal();
      return;
    }

    // 5. Action: Transfer
    const trfBtn = target.closest('#transferTopBtn, #transfer-btn, [data-action="transfer"]');
    if (trfBtn) {
      openTransferModal();
      return;
    }

    // 6. Action: Navigation
    const navBtn = target.closest('.nav-item[data-view]');
    if (navBtn) {
      switchView(navBtn.dataset.view);
      return;
    }

    // 7. Category Pills
    const catPill = target.closest('.cat-pill[data-cat]');
    if (catPill) {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      catPill.classList.add('active');
      state.selectedCat = catPill.dataset.cat;
      return;
    }
  });

  // 10-Second Onboarding Form Submission
  const onboardingForm = document.getElementById('onboardingForm');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const salary = parseFloat(document.getElementById('onboardSalary').value) || 0;
      const cash = parseFloat(document.getElementById('onboardCash').value) || 0;
      const investments = parseFloat(document.getElementById('onboardInvestments').value) || 0;

      state.settings.monthlySalary = salary;
      state.settings.spendingLimit = Math.round(salary * 0.6);
      state.settings.bankCash = cash;
      state.settings.cashBalance = cash;

      if (investments > 0) {
        const now = Date.now();
        state.investments = [
          { id: uuid(), type: 'tbill', name: '91-Day T-Bill', principal_or_shares: investments, rate_or_buyprice: 14.5, maturity_date: new Date(now + 60 * 864e5).toISOString().split('T')[0], target_price: null, current_price: null, target_type: null, created_at: new Date().toISOString() }
        ];
      }

      state.hasOnboarded = true;
      saveToStorage();
      loadSettingsUI();
      renderAll();

      const modal = document.getElementById('onboardingModalOverlay');
      if (modal) modal.classList.remove('active');

      toast('Wealth OS Baseline calculated!', 'success');
    });
  }

  // Income Form Submission
  const incomeForm = document.getElementById('incomeForm');
  if (incomeForm) {
    incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const catSelect = document.getElementById('incCategory').value;
      const customInput = document.getElementById('customIncCategory');
      let category = catSelect;

      if (catSelect === 'custom') {
        const typedName = customInput ? customInput.value.trim() : '';
        if (!typedName) {
          toast('Please type a custom category name', 'error');
          return;
        }
        category = typedName;
      }

      const amount = parseFloat(document.getElementById('incAmount').value);
      const date = document.getElementById('incDate').value;
      const notes = document.getElementById('incNotes').value.trim();
      const dest = document.getElementById('incDestAccount')?.value || 'bank';

      if (!amount || amount <= 0) { toast('Enter a valid income amount', 'error'); return; }

      const created_at = date ? new Date(date + 'T' + new Date().toTimeString().split(' ')[0]).toISOString() : new Date().toISOString();
      addIncome({ category, amount, notes, dest, income_date: date, created_at });

      document.getElementById('incAmount').value = '';
      document.getElementById('incNotes').value = '';
      if (customInput) customInput.value = '';
      closeIncomeModal();
    });
  }

  // Expense Logger Button
  const addExpBtn = document.getElementById('addExpBtn');
  if (addExpBtn) {
    addExpBtn.addEventListener('click', () => {
      const amountEl = document.getElementById('expAmount');
      const notesEl = document.getElementById('expNotes');
      const dateEl = document.getElementById('expDate');
      const sourceEl = document.getElementById('expSource');
      const amount = amountEl ? parseFloat(amountEl.value) : NaN;
      const notes = notesEl ? notesEl.value.trim() : '';
      const date = dateEl ? dateEl.value : '';
      const source = sourceEl ? sourceEl.value : 'momo';

      if (!amount || amount <= 0) { toast('Please enter a valid amount', 'error'); return; }

      const created_at = date ? new Date(date + 'T' + new Date().toTimeString().split(' ')[0]).toISOString() : new Date().toISOString();

      if (state.txnMode === 'income') {
        addIncome({ category: state.selectedCat, amount, notes, dest: source, income_date: date, created_at });
      } else {
        addExpense({ category: state.selectedCat, amount, notes, source, expense_date: date, created_at });
      }

      if (amountEl) amountEl.value = '';
      if (notesEl) notesEl.value = '';
      if (dateEl) dateEl.valueAsDate = new Date();
      if (amountEl) amountEl.focus();
    });
  }

  // Currency Toggle
  const currBtn = document.getElementById('currencyToggleBtn');
  if (currBtn) {
    currBtn.addEventListener('click', () => {
      state.displayCurrency = state.displayCurrency === 'GHS' ? 'USD' : 'GHS';
      currBtn.textContent = state.displayCurrency === 'USD' ? 'USD ($)' : 'GH₵';
      renderAll();
      toast(`Currency switched to ${state.displayCurrency}`, 'info');
    });
  }

  // Theme Switches
  const themeBtn = document.getElementById('themeToggleBtn');
  const lightSw = document.getElementById('lightModeSwitch');
  const swTrack = document.getElementById('switchTrack');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (lightSw) lightSw.addEventListener('change', toggleTheme);
  if (swTrack) swTrack.addEventListener('click', () => { if (lightSw) lightSw.click(); });

  // Portfolio Tabs
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab]').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetTab = document.getElementById(`tab-${tab.dataset.tab}`);
      if (targetTab) targetTab.classList.add('active');
      state.currentTab = tab.dataset.tab;
    });
  });

  // Cloud Auth Modals
  const uCard = document.getElementById('userCard');
  const authBtn = document.getElementById('authModalBtn');
  if (uCard) uCard.addEventListener('click', openAuthModal);
  if (authBtn) authBtn.addEventListener('click', openAuthModal);

  // Password Auth Handlers
  const signIn = document.getElementById('signInBtn');
  const signUp = document.getElementById('signUpBtn');
  if (signIn) {
    signIn.addEventListener('click', async () => {
      if (!supabaseClient) { toast('Supabase client unavailable', 'error'); return; }
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      if (!email || !password) { toast('Enter email and password', 'error'); return; }
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) { toast(error.message, 'error'); }
      else { toast('Signed in successfully', 'success'); closeAuthModal(); }
    });
  }

  if (signUp) {
    signUp.addEventListener('click', async () => {
      if (!supabaseClient) { toast('Supabase client unavailable', 'error'); return; }
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      if (!email || !password || password.length < 6) { toast('Enter email and at least 6-char password', 'error'); return; }
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) { toast(error.message, 'error'); }
      else { toast('Account created! Check email for confirmation.', 'success'); closeAuthModal(); }
    });
  }

  // Forgot Password Trigger
  const forgotBtn = document.getElementById('forgotPassBtn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', async () => {
      if (!supabaseClient) { toast('Supabase client unavailable', 'error'); return; }
      const email = document.getElementById('authEmail').value.trim();
      if (!email) { toast('Please enter your email address above', 'error'); return; }
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
      if (error) { toast(error.message, 'error'); }
      else { toast('Password reset link sent to your email!', 'success'); }
    });
  }

  // Magic Link / OTP Trigger
  const sendMagic = document.getElementById('sendMagicBtn');
  if (sendMagic) {
    sendMagic.addEventListener('click', async () => {
      if (!supabaseClient) { toast('Supabase client unavailable', 'error'); return; }
      const email = document.getElementById('magicEmail').value.trim();
      if (!email) { toast('Please enter your email address', 'error'); return; }
      const { error } = await supabaseClient.auth.signInWithOtp({ email });
      if (error) { toast(error.message, 'error'); }
      else { toast('Magic link / OTP sent! Check your inbox.', 'success'); closeAuthModal(); }
    });
  }

async function handleSignOut() {
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }

  // Reset state to empty slate
  state = JSON.parse(JSON.stringify(defaultState));
  state.authUser = null;
  state.user = null;
  state.userConfig = { budget: 0 };
  state.expenses = [];
  state.incomes = [];
  state.transfers = [];
  state.debts = [];
  state.investments = [];
  state.history = [];

  // Clear local storage
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('aura_user_budget');

  // Update UI auth status
  setAuthUser(null);

  // Clear DOM UI containers immediately
  const monthGrid = document.getElementById('reportsMonthGrid');
  if (monthGrid) monthGrid.innerHTML = '';
  const catGrid = document.getElementById('reportsCatGrid');
  if (catGrid) catGrid.innerHTML = '';

  renderAll();

  // Show Auth Menu / Landing Modal
  openAuthModal();

  toast('Signed out and session purged', 'info');
}

  const signOut = document.getElementById('signOutBtn');
  if (signOut) {
    signOut.addEventListener('click', handleSignOut);
  }

  // Settings Form Save
  const saveSet = document.getElementById('saveSettingsBtn');
  if (saveSet) {
    saveSet.addEventListener('click', () => {
      const salInput = document.getElementById('setSalary');
      const limInput = document.getElementById('setLimit');
      const payInput = document.getElementById('setPayday');
      const usdInput = document.getElementById('setUsdRate');
      const tbInput = document.getElementById('setAllocTbills');
      const saInput = document.getElementById('setAllocSavings');
      const moInput = document.getElementById('setAllocMomo');

      if (salInput) state.settings.monthlySalary = parseFloat(salInput.value) || 0;
      if (limInput) {
        const limVal = parseFloat(limInput.value) || 0;
        state.settings.spendingLimit = limVal;
        state.userConfig = state.userConfig || {};
        state.userConfig.budget = limVal;
        if (!state.user && !state.authUser) {
          localStorage.setItem('aura_guest_budget', limVal.toString());
        } else {
          localStorage.setItem('aura_user_budget', limVal.toString());
        }
      }
      if (payInput) state.settings.paydayDay = parseInt(payInput.value) || 25;
      if (usdInput) state.settings.usdRate = parseFloat(usdInput.value) || 0.065;
      
      state.settings.payAllocation = {
        tbills: tbInput ? parseFloat(tbInput.value) || 0 : 0,
        savings: saInput ? parseFloat(saInput.value) || 0 : 0,
        momo: moInput ? parseFloat(moInput.value) || 0 : 0
      };

      saveToStorage();
      renderAll();
      toast('Settings saved', 'success');
    });
  }

  // Run Pay Allocation Trigger
  const runAllocBtn = document.getElementById('runPayAllocationBtn');
  if (runAllocBtn) {
    runAllocBtn.addEventListener('click', () => {
      openPayAllocationModal(state.settings.monthlySalary, `${new Date().getFullYear()}-${new Date().getMonth() + 1}`);
    });
  }

  // GSE Prices Sync
  const syncGse = document.getElementById('syncGseBtn');
  if (syncGse) syncGse.addEventListener('click', syncGsePrices);

  // Data Reports Management
  const loadSamp = document.getElementById('loadSampleBtn');
  const expCsv = document.getElementById('exportCsvBtn');
  const expPdf = document.getElementById('exportPdfBtn');
  const expStmt = document.getElementById('export-statement-btn');
  const expStmtQuick = document.getElementById('export-statement-btn-quick');

  if (loadSamp) loadSamp.addEventListener('click', () => { loadSampleData(true); renderAll(); });
  if (expCsv) expCsv.addEventListener('click', exportCsv);
  if (expPdf) expPdf.addEventListener('click', exportPdf);
  if (expStmt) expStmt.addEventListener('click', exportExpenditureStatement);
  if (expStmtQuick) expStmtQuick.addEventListener('click', exportExpenditureStatement);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'd') switchView('dashboard');
    if (e.key === 'e') switchView('expenses');
    if (e.key === 'i') switchView('investments');
    if (e.key === 's') switchView('settings');
    if (e.key === '+') { switchView('expenses'); setTimeout(() => { const el = document.getElementById('expAmount'); if (el) el.focus(); }, 300); }
  });
}

function injectIcons() {
  const navMap = { dashboard: 'dashboard', accounts: 'accounts', investments: 'investments', expenses: 'expenses', debts: 'debts', reports: 'reports', settings: 'settings' };
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    const iconName = navMap[btn.dataset.view];
    if (iconName && I[iconName] && !btn.querySelector('svg')) {
      btn.insertAdjacentHTML('afterbegin', I[iconName]);
    }
  });
  const quickAdd = document.getElementById('quickAddBtn');
  if (quickAdd) quickAdd.innerHTML = I.plus;
  const addExp = document.getElementById('addExpBtn');
  if (addExp && !addExp.querySelector('svg')) addExp.insertAdjacentHTML('afterbegin', I.plus);
  const addInv = document.getElementById('addInvBtn');
  if (addInv && !addInv.querySelector('svg')) addInv.insertAdjacentHTML('afterbegin', I.plus);
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.innerHTML = I.x;
  const authModalClose = document.getElementById('authModalClose');
  if (authModalClose) authModalClose.innerHTML = I.x;
  const incomeModalClose = document.getElementById('incomeModalClose');
  if (incomeModalClose) incomeModalClose.innerHTML = I.x;
  const fab = document.getElementById('fabBtn');
  if (fab) fab.innerHTML = I.plus;
}

// Register Service Worker for Offline PWA Installation
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('Aura PWA ServiceWorker registered with scope:', reg.scope);
      }).catch((err) => {
        console.warn('Aura PWA ServiceWorker registration failed:', err);
      });
    });
  }
}

// Global Exposures
window.deleteExpense = deleteExpense;
window.quickLogExpense = quickLogExpense;
window.quickLogIncome = quickLogIncome;
window.prefillPreset = prefillPreset;
window.setTxnMode = setTxnMode;
window.deleteIncome = deleteIncome;
window.deleteInvestment = deleteInvestment;
window.updatePricePrompt = updatePricePrompt;
window.switchView = switchView;
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.openIncomeModal = openIncomeModal;
window.closeIncomeModal = closeIncomeModal;
window.openHelpModal = openHelpModal;
window.closeHelpModal = closeHelpModal;
window.switchHistoryTab = switchHistoryTab;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.onStockSelectChange = onStockSelectChange;
window.onIncCategoryChange = onIncCategoryChange;
window.setNwMode = setNwMode;
window.toggleTheme = toggleTheme;
window.triggerPwaInstall = triggerPwaInstall;
window.toggleAccordion = toggleAccordion;
window.exportPdf = exportPdf;
window.exportCsv = exportCsv;
window.clearAllData = clearAllData;
window.openTransferModal = openTransferModal;
window.closeTransferModal = closeTransferModal;
window.executeTransferModal = executeTransferModal;
window.executeQuickBankToMomo = executeQuickBankToMomo;
window.deleteTransfer = deleteTransfer;
window.openEditBalanceModal = openEditBalanceModal;
window.closeEditBalanceModal = closeEditBalanceModal;
window.saveAccountBalanceModal = saveAccountBalanceModal;
window.renderReports = renderReports;
window.openGatewayModal = openGatewayModal;
window.closeGatewayModal = closeGatewayModal;
window.checkGateway = checkGateway;
window.checkOnboarding = checkOnboarding;
window.calculateDefaultFee = calculateDefaultFee;
window.toggleFeeInput = toggleFeeInput;
window.onFeeAmountInput = onFeeAmountInput;
window.openPayAllocationModal = openPayAllocationModal;
window.closePayAllocationModal = closePayAllocationModal;
window.confirmPayAllocation = confirmPayAllocation;
window.openAddDebtModal = openAddDebtModal;
window.closeDebtModal = closeDebtModal;
window.saveDebt = saveDebt;
window.openRepayDebtModal = openRepayDebtModal;
window.closeRepayDebtModal = closeRepayDebtModal;
window.executeRepayDebt = executeRepayDebt;
window.deleteDebt = deleteDebt;
window.renderDebts = renderDebts;

// Safe Initialization with Individual Try...Catch Safeguards
function init() {
  console.log('[Aura] App init started…');

  try { initTheme(); } catch (e) { console.warn('initTheme error:', e); }
  try { injectIcons(); } catch (e) { console.warn('injectIcons error:', e); }
  try { updateGreeting(); } catch (e) { console.warn('updateGreeting error:', e); }
  try { loadFromStorage(); } catch (e) { console.warn('loadFromStorage error:', e); }
  try { loadSettingsUI(); } catch (e) { console.warn('loadSettingsUI error:', e); }
  try { bindEvents(); console.log('[Aura] Event listeners bound via delegation.'); } catch (e) { console.warn('bindEvents error:', e); }
  try { renderAll(); } catch (e) { console.warn('renderAll error:', e); }
  try { initSupabase(); } catch (e) { console.warn('initSupabase error:', e); }
  try { checkOnboarding(); } catch (e) { console.warn('checkOnboarding error:', e); }
  try { registerServiceWorker(); } catch (e) { console.warn('registerServiceWorker error:', e); }

  try {
    const dateInput = document.getElementById('expDate');
    if (dateInput) dateInput.valueAsDate = new Date();
  } catch (e) {
    console.warn('dateInput setup error:', e);
  }

  console.log('[Aura] App init complete.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
