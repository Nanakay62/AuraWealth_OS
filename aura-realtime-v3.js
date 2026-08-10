/* ============================================================
   AURA WEALTH OS - REALTIME SYNC + SOFT DELETE ENGINE (v3.1)
   Load AFTER app.js, supabase.js, aura-hardening-v2.js,
   aura-sync-fix.js, aura-sync-race-fix.js.

   This file provides:
   1. Soft-delete override for supaMirror (with retry queue)
   2. Soft-delete-aware hydrateSupabase with cross-device race guard
   3. Per-table Supabase Realtime subscriptions
   ============================================================ */

(function () {

  // ------------------------------------------------------------
  // 1. Soft-delete override: every supaMirror('table','delete',row)
  //    call becomes an UPDATE that sets deleted_at, not a hard DELETE.
  //
  //    FIX (v3.1): On failure, enqueue the delete for offline retry
  //    via enqueueSyncOp instead of silently dropping it.
  // ------------------------------------------------------------
  const _origSupaMirror = window.supaMirror;
  window.supaMirror = async function (table, op, row) {
    if (op === 'delete' && row && row.id && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from(table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', row.id);
        if (error) throw error;
        return;
      } catch (e) {
        console.warn(`[Aura Realtime] Soft delete failed for ${table}/${row.id}:`, e);
        // Enqueue for offline retry so the delete is not permanently lost
        if (typeof window.enqueueSyncOp === 'function') {
          window.enqueueSyncOp(table, 'delete', row);
          console.log(`[Aura Realtime] Enqueued soft-delete retry for ${table}/${row.id}`);
        }
        if (typeof toast === 'function') {
          toast(`Cloud sync issue (delete queued for retry): ${e.message || 'unknown error'}`, 'error');
        }
      }
      return;
    }
    return _origSupaMirror.apply(this, arguments);
  };

  // ------------------------------------------------------------
  // 2. Corrected hydrateSupabase: fetches ALL rows (including
  //    soft-deleted ones), splits active vs deleted client-side,
  //    and explicitly purges deleted ids from local state before
  //    merging.
  //
  //    FIX (v3.1): Merges the cross-device settings race guard
  //    from aura-sync-race-fix.js that v3.0 was accidentally
  //    destroying by blindly reassigning window.hydrateSupabase.
  //    Now waits for pending profile pushes and checks updated_at
  //    before overwriting local settings with cloud data.
  //
  //    Also adds auto-retry sync for transfers and debts (was
  //    missing in v3.0).
  // ------------------------------------------------------------
  window.hydrateSupabase = async function hydrateSupabaseV3() {
    // Cross-device race guard: wait for any in-flight profile push
    // before we read from the cloud, so we don't read stale data.
    const raceState = window._auraSyncRace || {};
    try { await (raceState.pendingProfilePush || Promise.resolve()); } catch (e) { /* already logged */ }

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

      function splitActiveDeleted(rows) {
        const active = [];
        const deletedIds = new Set();
        (rows || []).forEach(r => {
          if (r.deleted_at) deletedIds.add(r.id);
          else active.push(r);
        });
        return { active, deletedIds };
      }

      const exp = splitActiveDeleted(expensesRes.data);
      const inc = splitActiveDeleted(incomesRes.data);
      const inv = splitActiveDeleted(investmentsRes.data);
      const trf = splitActiveDeleted(transfersRes.data);
      const dbt = splitActiveDeleted(debtsRes.data);

      // Purge anything the cloud says is deleted, from local state,
      // BEFORE merging - this is the step the original code was missing.
      state.expenses = (state.expenses || []).filter(e => !exp.deletedIds.has(e.id));
      state.incomes = (state.incomes || []).filter(i => !inc.deletedIds.has(i.id));
      state.investments = (state.investments || []).filter(v => !inv.deletedIds.has(v.id));
      state.transfers = (state.transfers || []).filter(t => !trf.deletedIds.has(t.id));
      state.debts = (state.debts || []).filter(d => !dbt.deletedIds.has(d.id));

      // Non-destructive merge is now safe: deleted ids are gone from
      // both sides, so nothing stale can survive.
      state.expenses = mergeById(exp.active, state.expenses);
      state.investments = mergeById(inv.active, state.investments);
      state.incomes = mergeById(inc.active, state.incomes);
      state.transfers = mergeById(trf.active, state.transfers);
      state.debts = mergeById(dbt.active, state.debts);

      // Auto-retry sync for genuinely local-only records (offline
      // entries never pushed yet) - guarded so a deleted id can never
      // be re-inserted.
      const cloudExpIds = new Set(exp.active.map(e => e.id));
      (state.expenses || []).filter(e => e.id && !cloudExpIds.has(e.id) && !exp.deletedIds.has(e.id)).forEach(e => supaMirror('expenses', 'insert', e));

      const cloudIncIds = new Set(inc.active.map(i => i.id));
      (state.incomes || []).filter(i => i.id && !cloudIncIds.has(i.id) && !inc.deletedIds.has(i.id)).forEach(i => supaMirror('incomes', 'insert', i));

      const cloudInvIds = new Set(inv.active.map(v => v.id));
      (state.investments || []).filter(v => v.id && !cloudInvIds.has(v.id) && !inv.deletedIds.has(v.id)).forEach(v => supaMirror('investments', 'insert', v));

      // FIX (v3.1): Also auto-retry for transfers and debts (was missing)
      const cloudTrfIds = new Set(trf.active.map(t => t.id));
      (state.transfers || []).filter(t => t.id && !cloudTrfIds.has(t.id) && !trf.deletedIds.has(t.id)).forEach(t => supaMirror('transfers', 'insert', t));

      const cloudDbtIds = new Set(dbt.active.map(d => d.id));
      (state.debts || []).filter(d => d.id && !cloudDbtIds.has(d.id) && !dbt.deletedIds.has(d.id)).forEach(d => supaMirror('debts', 'insert', d));

      // Profile hydration with cross-device race guard
      if (profileRes && profileRes.data) {
        const p = profileRes.data;
        const cloudUpdatedAt = p.updated_at ? new Date(p.updated_at).getTime() : 0;
        const lastLocalEdit = raceState.lastLocalSettingsEditAt || 0;
        const lastSynced = raceState.lastSyncedAt || 0;

        // Only accept the cloud profile if it's newer than the last
        // local edit, or that local edit has already been confirmed pushed.
        if (cloudUpdatedAt >= lastLocalEdit || lastLocalEdit <= lastSynced) {
          state.settings.username = p.username || state.settings.username || '';
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
        if (typeof syncProfileToSupabase === 'function') {
          syncProfileToSupabase();
        }
      }

      saveToStorage();
      loadSettingsUI();
      renderAll();
      checkOnboarding();
    } catch (e) {
      console.warn('Supabase hydration fallback:', e);
    }
  };

  // ------------------------------------------------------------
  // 3. Realtime: one postgres_changes listener PER table on a
  //    single channel.
  // ------------------------------------------------------------
  const REALTIME_TABLES = ['expenses', 'incomes', 'investments', 'transfers', 'debts'];

  function applyRealtimeChange(table, eventType, newRow, oldRow) {
    if (!Array.isArray(state[table])) return;

    if (eventType === 'INSERT') {
      if (newRow.deleted_at) return;
      if (!state[table].some(item => item.id === newRow.id)) {
        state[table].unshift(newRow);
      }
    } else if (eventType === 'UPDATE') {
      if (newRow.deleted_at) {
        state[table] = state[table].filter(item => item.id !== newRow.id);
      } else if (state[table].some(item => item.id === newRow.id)) {
        state[table] = state[table].map(item => item.id === newRow.id ? newRow : item);
      } else {
        state[table].unshift(newRow);
      }
    } else if (eventType === 'DELETE') {
      state[table] = state[table].filter(item => item.id !== oldRow.id);
    }

    saveToStorage();
    renderAll();
  }

  window.initRealtimeSync = function () {
    if (!supabaseClient || !state.authUser) return;
    if (window._auraRealtimeChannel) {
      supabaseClient.removeChannel(window._auraRealtimeChannel);
    }

    let channel = supabaseClient.channel('aura-db-changes');
    REALTIME_TABLES.forEach(table => {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${state.authUser.id}` },
        (payload) => applyRealtimeChange(table, payload.eventType, payload.new, payload.old)
      );
    });
    channel.subscribe();
    window._auraRealtimeChannel = channel;
  };

  // Re-subscribe whenever auth state changes to a signed-in user,
  // and tear down on sign-out.
  const _origSetAuthUser = window.setAuthUser;
  window.setAuthUser = async function (user) {
    const result = await _origSetAuthUser.apply(this, arguments);
    if (user) {
      window.initRealtimeSync();
    } else if (window._auraRealtimeChannel && supabaseClient) {
      supabaseClient.removeChannel(window._auraRealtimeChannel);
      window._auraRealtimeChannel = null;
    }
    return result;
  };

  console.log('[Aura Realtime v3.1] Soft deletes with retry queue + cross-device race guard + per-table realtime + purge-on-hydrate active.');
})();
