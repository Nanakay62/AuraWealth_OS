/* ============================================================
   AURA WEALTH OS - DELETE TOMBSTONE FIX
   Load AFTER aura-sync-race-fix.js.

   Load order:
     app.js, supabase.js, aura-hardening-v2.js,
     aura-sync-fix.js, aura-sync-race-fix.js,
     aura-delete-tombstone-fix.js
   ============================================================ */

(function () {
  const TOMBSTONE_KEY = 'aura_deleted_ids_v1';
  const TOMBSTONE_MAX_AGE_MS = 30 * 864e5; // prune after 30 days

  function loadTombstones() {
    try {
      const raw = localStorage.getItem(TOMBSTONE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) { return {}; }
  }
  function saveTombstones(t) {
    try { localStorage.setItem(TOMBSTONE_KEY, JSON.stringify(t)); } catch (e) {}
  }
  function markDeleted(table, id) {
    const t = loadTombstones();
    t[table] = t[table] || {};
    t[table][id] = Date.now();
    saveTombstones(t);
  }
  function pruneOldTombstones(t) {
    const now = Date.now();
    let changed = false;
    Object.keys(t).forEach(table => {
      Object.keys(t[table]).forEach(id => {
        if (now - t[table][id] > TOMBSTONE_MAX_AGE_MS) {
          delete t[table][id];
          changed = true;
        }
      });
    });
    if (changed) saveTombstones(t);
    return t;
  }

  // Tombstone SYNCHRONOUSLY, before the original delete's async
  // network call even starts. localStorage writes are synchronous,
  // so this survives an immediate page refresh no matter what.
  const tableMap = { deleteExpense: 'expenses', deleteIncome: 'incomes', deleteInvestment: 'investments', deleteDebt: 'debts', deleteTransfer: 'transfers' };
  Object.keys(tableMap).forEach(fnName => {
    const orig = window[fnName];
    if (typeof orig !== 'function') return;
    window[fnName] = function patchedDelete(id) {
      markDeleted(tableMap[fnName], id);
      return orig.apply(this, arguments);
    };
  });

  // After every hydrate: strip any tombstoned id that the cloud
  // still returned (delete didn't land yet), and re-fire the delete.
  // Re-deleting an already-deleted row is a harmless no-op, so this
  // is safe to repeat on every hydrate until it finally sticks.
  const _origHydrate = window.hydrateSupabase;
  window.hydrateSupabase = async function tombstoneAwareHydrate() {
    if (typeof _origHydrate === 'function') {
      await _origHydrate.apply(this, arguments);
    }

    const t = pruneOldTombstones(loadTombstones());
    let changed = false;

    Object.keys(tableMap).forEach(fnName => {
      const table = tableMap[fnName];
      if (!t[table]) return;
      const ids = Object.keys(t[table]);
      if (ids.length === 0 || typeof state === 'undefined' || !Array.isArray(state[table])) return;

      const before = state[table].length;
      state[table] = state[table].filter(item => !ids.includes(String(item.id)));
      if (state[table].length !== before) changed = true;

      // Retry the actual cloud delete for anything still tombstoned.
      if (table !== 'transfers' && typeof supaMirror === 'function') {
        ids.forEach(id => supaMirror(table, 'delete', { id }));
      }
    });

    if (changed) {
      if (typeof saveToStorage === 'function') saveToStorage();
      if (typeof renderAll === 'function') renderAll();
    }
  };

  console.log('[Aura Delete Fix] Tombstone guard active - deletes now survive a refresh instead of getting resurrected by hydrate.');
})();
