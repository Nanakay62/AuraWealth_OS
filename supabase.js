/* ============================================================
   AURA WEALTH OS - SUPABASE SYNC & AUTH ENGINE (LAST-WRITE-WINS)
   ============================================================ */

(function () {
  // Scoped to this IIFE so it never collides with `let supabaseClient`
  // declared in app.js. Two top-level scripts share one global scope,
  // so redeclaring the same `let` name in both files is a SyntaxError.
  let supabaseClient = null;

  const SUPABASE_URL = 'https://xzaljrdrtfxlvgmilojp.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YWxqcmRydGZ4bHZnbWlsb2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3Nzg4ODQsImV4cCI6MjEwMTM1NDg4NH0.yy97AayWEsVVvgcxPena31C-_zDaTkNw0ZjhoVa7BCA';

  function ensureClient() {
    if (supabaseClient) return supabaseClient;
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabaseClient;
  }

  // Called once from app.js after it creates its own client, so both
  // files talk to the exact same Supabase connection instead of two
  // independent ones.
  function setClient(client) {
    supabaseClient = client;
  }

  /**
   * Merge local and remote records based on updated_at timestamp (Last-Write-Wins).
   */
  function syncTimestampRecords(localArr = [], remoteArr = []) {
    const recordMap = new Map();

    (localArr || []).forEach(item => {
      if (item && item.id) {
        recordMap.set(item.id, {
          data: {
            ...item,
            updated_at: item.updated_at || item.created_at || new Date().toISOString()
          },
          source: 'local'
        });
      }
    });

    const toPushToRemote = [];

    (remoteArr || []).forEach(remoteItem => {
      if (!remoteItem || !remoteItem.id) return;

      const remoteTime = new Date(remoteItem.updated_at || remoteItem.created_at || 0).getTime();
      const existing = recordMap.get(remoteItem.id);

      if (!existing) {
        recordMap.set(remoteItem.id, { data: remoteItem, source: 'remote' });
      } else {
        const localTime = new Date(existing.data.updated_at || existing.data.created_at || 0).getTime();
        if (remoteTime >= localTime) {
          recordMap.set(remoteItem.id, { data: remoteItem, source: 'remote' });
        } else {
          toPushToRemote.push(existing.data);
        }
      }
    });

    const mergedList = Array.from(recordMap.values()).map(entry => entry.data);
    return { mergedList, toPushToRemote };
  }

  /**
   * Perform timestamp-based synchronization (Last-Write-Wins) across data tables.
   */
  async function performTimestampSync(userId, state, saveStateCallback) {
    const client = ensureClient();
    if (!client || !userId || !state) return state;

    const tables = ['expenses', 'incomes', 'transfers', 'debts', 'investments'];
    let stateChanged = false;

    for (const table of tables) {
      try {
        const { data: remoteRecords, error } = await client
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.warn(`Timestamp sync fetch error for ${table}:`, error.message);
          continue;
        }

        const localRecords = state[table] || [];
        const { mergedList, toPushToRemote } = syncTimestampRecords(localRecords, remoteRecords || []);

        if (JSON.stringify(state[table]) !== JSON.stringify(mergedList)) {
          state[table] = mergedList;
          stateChanged = true;
        }

        // Upsert local records that are newer than remote
        for (const item of toPushToRemote) {
          const payload = {
            ...item,
            user_id: userId,
            updated_at: item.updated_at || new Date().toISOString()
          };
          await client.from(table).upsert(payload, { onConflict: 'id' });
        }

        // Upsert local-only records
        const remoteIdSet = new Set((remoteRecords || []).map(r => r.id));
        const localOnly = localRecords.filter(item => item && item.id && !remoteIdSet.has(item.id));
        for (const item of localOnly) {
          const payload = {
            ...item,
            user_id: userId,
            updated_at: item.updated_at || new Date().toISOString()
          };
          await client.from(table).upsert(payload, { onConflict: 'id' });
        }

      } catch (err) {
        console.warn(`Timestamp sync exception for ${table}:`, err);
      }
    }

    if (stateChanged && typeof saveStateCallback === 'function') {
      saveStateCallback();
    }

    return state;
  }

  if (typeof window !== 'undefined') {
    window.auraSyncEngine = {
      setClient,
      syncTimestampRecords,
      performTimestampSync
    };
  }
})();
