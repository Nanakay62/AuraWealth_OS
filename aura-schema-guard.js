/* ============================================================
   AURA WEALTH OS - SCHEMA-MISMATCH GUARD
   Load this AFTER aura-hardening-v2.js (or after app.js/supabase.js
   if you are not using the hardening patch).

   Fixes the symptom: "Could not find the 'updated_at'
   column of 'expenses' in the schema cache" firing repeatedly.
   The real fix is the SQL migration (fix-updated-at.sql) - this
   is just a graceful fallback so the app does not spam the same
   toast every sync pass while that migration has not run yet, or
   for any table you have not migrated.
   ============================================================ */

(function () {
  const warnedTables = new Set(); // dedupe: warn once per table per session, not once per row

  const _origSupaMirror = window.supaMirror;
  window.supaMirror = async function supaMirror(table, op, row) {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      const payload = { ...row };
      if (typeof state !== 'undefined' && state.authUser) payload.user_id = state.authUser.id;

      if (op === 'insert') {
        const { error } = await supabaseClient.from(table).insert(payload);
        if (error) throw error;
      } else if (op === 'delete') {
        const { error } = await supabaseClient.from(table).delete().eq('id', row.id);
        if (error) throw error;
      } else if (op === 'update') {
        const { error } = await supabaseClient.from(table).update(payload).eq('id', row.id);
        if (error) throw error;
      }
    } catch (e) {
      const isMissingColumn = e && (e.code === 'PGRST204' || /could not find the .* column/i.test(e.message || ''));

      if (isMissingColumn) {
        // Extract the offending column name if present, strip it, retry once.
        const match = /'([^']+)' column/.exec(e.message || '');
        const badColumn = match ? match[1] : null;

        if (badColumn) {
          try {
            const retryPayload = { ...row };
            delete retryPayload[badColumn];
            if (typeof state !== 'undefined' && state.authUser) retryPayload.user_id = state.authUser.id;

            if (op === 'insert') await supabaseClient.from(table).insert(retryPayload);
            else if (op === 'update') await supabaseClient.from(table).update(retryPayload).eq('id', row.id);
            // delete does not send a payload, so no retry needed there.

            if (!warnedTables.has(table)) {
              warnedTables.add(table);
              console.warn(`[Aura] '${table}' is missing column '${badColumn}' - synced without it. Run fix-updated-at.sql to permanently fix this.`);
              if (typeof toast === 'function') {
                toast(`Cloud sync limited for ${table} until a schema update runs (saved locally)`, 'info');
              }
            }
            return; // recovered - do not fall through to generic error toast
          } catch (retryErr) {
            console.warn(`Retry without '${badColumn}' also failed for ${table}:`, retryErr);
          }
        }
      }

      // Generic path: same behavior as before, but deduped per table per session
      // so a burst of queued writes does not produce a wall of identical toasts.
      console.warn(`Supabase ${op} fallback to local state:`, e);
      if (!warnedTables.has(`${table}:generic`)) {
        warnedTables.add(`${table}:generic`);
        if (typeof toast === 'function') {
          toast(`Cloud sync issue (saved locally): ${e.message || 'unknown error'}`, 'error');
        }
      }

      // Keep it queued for retry once the schema/network issue is resolved.
      if (typeof window.enqueueSyncOp === 'function') {
        window.enqueueSyncOp(table, op, row);
      }
    }
  };

  console.log('[Aura Hardening] Schema-mismatch guard active.');
})();
