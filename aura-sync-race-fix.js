/* ============================================================
   AURA WEALTH OS - CROSS-DEVICE SYNC RACE FIX
   Load AFTER aura-sync-fix.js.

   Load order:
     app.js, supabase.js, aura-hardening-v2.js,
     aura-sync-fix.js, aura-sync-race-fix.js
   ============================================================ */

(function () {
  let pendingProfilePush = Promise.resolve();
  let lastLocalSettingsEditAt = 0;
  let lastSyncedAt = 0;

  // Every settings-affecting save stamps "I just changed something locally"
  if (typeof window.saveToStorage === 'function') {
    const _origSaveToStorage = window.saveToStorage;
    window.saveToStorage = function patchedSaveToStorage() {
      lastLocalSettingsEditAt = Date.now();
      return _origSaveToStorage.apply(this, arguments);
    };
  }

  // saveToStorage() calls this internally - serialize it instead of
  // letting pushes fire in parallel and race each other or a hydrate.
  if (typeof window.syncProfileToSupabase === 'function') {
    const _origSyncProfile = window.syncProfileToSupabase;
    window.syncProfileToSupabase = function patchedSyncProfile() {
      const pushedAt = Date.now();
      pendingProfilePush = pendingProfilePush
        .catch(() => {})
        .then(() => _origSyncProfile.apply(this, arguments))
        .then(() => { lastSyncedAt = Math.max(lastSyncedAt, pushedAt); })
        .catch(e => console.warn('[Aura Sync Fix] profile push failed:', e));
      return pendingProfilePush;
    };
  }

  // hydrateSupabase must wait for any in-flight push, then only accept
  // the cloud copy of settings if it's actually newer than a local edit
  // that hasn't been confirmed synced yet.
  window.hydrateSupabase = async function patchedHydrateSupabase() {
    try { await pendingProfilePush; } catch (e) { /* already logged */ }
    if (typeof supabaseClient === 'undefined' || !supabaseClient || typeof state === 'undefined' || !state.authUser) return;

    try {
      const [expensesRes, investmentsRes, incomesRes, transfersRes, debtsRes, profileRes] = await Promise.all([
        supabaseClient.from('expenses').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
        supabaseClient.from('investments').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
        supabaseClient.from('incomes').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
        supabaseClient.from('transfers').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
        supabaseClient.from('debts').select('*').eq('user_id', state.authUser.id).order('created_at', { ascending: false }),
        supabaseClient.from('profiles').select('*').eq('user_id', state.authUser.id).maybeSingle()
      ]);

      if (typeof mergeById === 'function') {
        state.expenses = mergeById(expensesRes.data, state.expenses);
        state.investments = mergeById(investmentsRes.data, state.investments);
        state.incomes = mergeById(incomesRes.data, state.incomes);
        if (transfersRes && transfersRes.data) state.transfers = mergeById(transfersRes.data, state.transfers);
        if (debtsRes && debtsRes.data) state.debts = mergeById(debtsRes.data, state.debts);
      }

      if (typeof supaMirror === 'function') {
        const cloudExpIds = new Set((expensesRes.data || []).map(e => e.id));
        (state.expenses || []).filter(e => e.id && !cloudExpIds.has(e.id)).forEach(e => supaMirror('expenses', 'insert', e));
        const cloudIncIds = new Set((incomesRes.data || []).map(i => i.id));
        (state.incomes || []).filter(i => i.id && !cloudIncIds.has(i.id)).forEach(i => supaMirror('incomes', 'insert', i));
        const cloudInvIds = new Set((investmentsRes.data || []).map(inv => inv.id));
        (state.investments || []).filter(inv => inv.id && !cloudInvIds.has(inv.id)).forEach(inv => supaMirror('investments', 'insert', inv));
      }

      if (profileRes && profileRes.data) {
        const p = profileRes.data;
        const cloudUpdatedAt = p.updated_at ? new Date(p.updated_at).getTime() : 0;

        // THE FIX: only accept the cloud row if it's newer than the
        // last local edit, or that local edit has already been confirmed pushed.
        if (cloudUpdatedAt >= lastLocalSettingsEditAt || lastLocalSettingsEditAt <= lastSyncedAt) {
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
          console.warn('[Aura Sync Fix] Skipped profile hydrate: local edit is newer than the cloud row. Re-pushing local settings.');
          if (typeof window.syncProfileToSupabase === 'function') {
            window.syncProfileToSupabase();
          }
        }
      } else {
        if (typeof window.syncProfileToSupabase === 'function') {
          window.syncProfileToSupabase();
        }
      }

      if (typeof saveToStorage === 'function') saveToStorage();
      if (typeof loadSettingsUI === 'function') loadSettingsUI();
      if (typeof renderAll === 'function') renderAll();
      if (typeof checkOnboarding === 'function') checkOnboarding();
    } catch (e) {
      console.warn('Supabase hydration fallback:', e);
    }
  };

  console.log('[Aura Sync Fix] Cross-device settings race patched - hydrate now waits for pending pushes and checks updated_at before overwriting local edits.');
})();
