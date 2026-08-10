/* ============================================================
   AURA WEALTH OS - CROSS-DEVICE SYNC RACE FIX
   Load AFTER aura-sync-fix.js.

   Load order:
     app.js, supabase.js, aura-hardening-v2.js,
     aura-sync-fix.js, aura-sync-race-fix.js
   ============================================================

   This file provides the serialization wrappers that prevent
   concurrent profile pushes from racing each other, and tracks
   the timing state (lastLocalSettingsEditAt, lastSyncedAt,
   pendingProfilePush) that hydrateSupabase (in aura-realtime-v3.js)
   uses to decide whether to accept cloud settings or keep the
   local copy.

   NOTE: hydrateSupabase is now defined in aura-realtime-v3.js
   which correctly merges these protections with the soft-delete-
   aware hydration. Do NOT redefine hydrateSupabase here.
   ============================================================ */

(function () {
  // Timing state - exported on window so aura-realtime-v3.js can
  // reference them during hydration.
  window._auraSyncRace = {
    pendingProfilePush: Promise.resolve(),
    lastLocalSettingsEditAt: 0,
    lastSyncedAt: 0
  };

  // Every settings-affecting save stamps "I just changed something locally"
  if (typeof window.saveToStorage === 'function') {
    const _origSaveToStorage = window.saveToStorage;
    window.saveToStorage = function patchedSaveToStorage() {
      window._auraSyncRace.lastLocalSettingsEditAt = Date.now();
      return _origSaveToStorage.apply(this, arguments);
    };
  }

  // saveToStorage() calls this internally - serialize it instead of
  // letting pushes fire in parallel and race each other or a hydrate.
  if (typeof window.syncProfileToSupabase === 'function') {
    const _origSyncProfile = window.syncProfileToSupabase;
    window.syncProfileToSupabase = function patchedSyncProfile() {
      const pushedAt = Date.now();
      window._auraSyncRace.pendingProfilePush = window._auraSyncRace.pendingProfilePush
        .catch(() => {})
        .then(() => _origSyncProfile.apply(this, arguments))
        .then(() => { window._auraSyncRace.lastSyncedAt = Math.max(window._auraSyncRace.lastSyncedAt, pushedAt); })
        .catch(e => console.warn('[Aura Sync Fix] profile push failed:', e));
      return window._auraSyncRace.pendingProfilePush;
    };
  }

  console.log('[Aura Sync Fix] Cross-device settings race patched - serialized profile pushes with timing state exported for hydration guard.');
})();
