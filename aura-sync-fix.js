/* ============================================================
   AURA WEALTH OS - SYNC IDEMPOTENCY FIX
   Load this AFTER aura-hardening-v2.js. It REPLACES
   schema-mismatch-guard.js - do not load both, this one includes
   everything that file did plus the duplicate-key fix below.

   Load order:
     app.js, supabase.js, aura-hardening-v2.js, aura-sync-fix.js
   ============================================================ */

(function () {
  const warnedTables = new Set();

  window.supaMirror = async function supaMirror(table, op, row) {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      const payload = { ...row };
      if (typeof state !== 'undefined' && state.authUser) payload.user_id = state.authUser.id;

      if (op === 'insert') {
        // FIX: was plain .insert(payload), which throws
        // "duplicate key value violates unique constraint" if this
        // exact row (same client-generated UUID) has already reached
        // the table - which can legitimately happen from a retried
        // network call, hydrateSupabase()'s missing-record check
        // racing an in-flight insert, or the offline sync queue
        // replaying an op that actually already succeeded.
        // .upsert() with onConflict:'id' makes this operation safe
        // to run more than once for the same row - insert if new,
        // overwrite-with-same-data if it already exists, no error
        // either way. This matches the Last-Write-Wins model your
        // performTimestampSync() already uses correctly elsewhere.
        const { error } = await supabaseClient.from(table).upsert(payload, { onConflict: 'id' });
        if (error) throw error;
      } else if (op === 'delete') {
        const { error } = await supabaseClient.from(table).delete().eq('id', row.id);
        if (error) throw error;
      } else if (op === 'update') {
        const { error } = await supabaseClient.from(table).update(payload).eq('id', row.id);
        if (error) throw error;
      }
    } catch (e) {
      // --- Missing-column fallback (from schema-mismatch-guard.js) ---
      const isMissingColumn = e && (e.code === 'PGRST204' || /could not find the .* column/i.test(e.message || ''));
      if (isMissingColumn) {
        const match = /'([^']+)' column/.exec(e.message || '');
        const badColumn = match ? match[1] : null;
        if (badColumn) {
          try {
            const retryPayload = { ...row };
            delete retryPayload[badColumn];
            if (typeof state !== 'undefined' && state.authUser) retryPayload.user_id = state.authUser.id;

            if (op === 'insert') await supabaseClient.from(table).upsert(retryPayload, { onConflict: 'id' });
            else if (op === 'update') await supabaseClient.from(table).update(retryPayload).eq('id', row.id);

            if (!warnedTables.has(table)) {
              warnedTables.add(table);
              console.warn(`[Aura] '${table}' is missing column '${badColumn}' - synced without it. Run fix-updated-at.sql to permanently fix this.`);
              if (typeof toast === 'function') {
                toast(`Cloud sync limited for ${table} until a schema update runs (saved locally)`, 'info');
              }
            }
            return;
          } catch (retryErr) {
            console.warn(`Retry without '${badColumn}' also failed for ${table}:`, retryErr);
          }
        }
      }

      // --- Generic fallback ---
      console.warn(`Supabase ${op} fallback to local state:`, e);
      if (!warnedTables.has(`${table}:generic`)) {
        warnedTables.add(`${table}:generic`);
        if (typeof toast === 'function') {
          toast(`Cloud sync issue (saved locally): ${e.message || 'unknown error'}`, 'error');
        }
      }
      if (typeof window.enqueueSyncOp === 'function') {
        window.enqueueSyncOp(table, op, row);
      }
    }
  };

  console.log('[Aura Hardening] Sync idempotency fix active - inserts are now safe to retry.');
})();
