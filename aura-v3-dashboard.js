/* ============================================================
   DYCSON ECONOMICOS - V3 DASHBOARD VISUAL PATCH (JS)
   Load this AFTER app.js and all your other patch scripts:
   <script src="aura-v3-dashboard.js"></script>

   REQUIRES ONE LINE ADDED TO app.js:
     window.state = state;
   (add it right after "let state = JSON.parse(...)" near the top -
   without it the sparkline + weekly strip fall back gracefully,
   everything else still works.)
   ============================================================ */

(function () {
  const parseMoney = (txt) => {
    if (!txt) return 0;
    const n = parseFloat(String(txt).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? 0 : n;
  };
  const byId = (id) => document.getElementById(id);

  // Catmull-Rom -> cubic Bezier smoothing through the REAL data points.
  // With 2 points this correctly degrades to a straight line (a curve
  // needs 3+ points to bend) - no synthetic points are ever inserted.
  function smoothPath(pts) {
    if (pts.length < 3) {
      return pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    }
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  // ---------- 1. Net worth trend badge + sparkline ----------
  function renderNwTrend() {
    const card = document.querySelector('.net-worth-card .nw-content');
    if (!card) return;

    let row = byId('nwTrendRow');
    if (!row) {
      row = document.createElement('div');
      row.id = 'nwTrendRow';
      row.className = 'nw-trend-row';
      const valueEl = card.querySelector('.net-worth-value');
      valueEl.insertAdjacentElement('afterend', row);
    }

    let sparkWrap = byId('nwSparkWrap');
    if (!sparkWrap) {
      sparkWrap = document.createElement('div');
      sparkWrap.id = 'nwSparkWrap';
      sparkWrap.className = 'nw-sparkline-wrap';
      row.insertAdjacentElement('afterend', sparkWrap);
    }

    const history = (window.state && window.state.history) || [];
    const MIN_TREND_POINTS = 5;
    if (history.length < MIN_TREND_POINTS) {
      row.innerHTML = '';
      sparkWrap.innerHTML = '';
      return;
    }

    const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0].netWorth || 0;
    const last = sorted[sorted.length - 1].netWorth || 0;
    const delta = last - first;
    const pct = first > 0 ? (delta / first) * 100 : 0;
    const isUp = delta >= 0;
    const fmtFn = window.fmtUsd || ((v) => `$${v.toFixed(2)}`);

    // Label reflects how much real history we actually have -
    // never claims "vs last month" unless the data spans that long.
    const daysSpan = (new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / 86400000;
    let periodLabel;
    if (daysSpan >= 25) periodLabel = 'vs last month';
    else if (daysSpan >= 6) periodLabel = 'vs last week';
    else if (daysSpan >= 1) periodLabel = `vs ${Math.round(daysSpan)} day${Math.round(daysSpan) === 1 ? '' : 's'} ago`;
    else periodLabel = 'today';

    const arrow = isUp
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    row.innerHTML = `
      <span class="nw-trend-badge ${isUp ? 'up' : 'down'}">${arrow}${isUp ? '+' : ''}${pct.toFixed(1)}% ${periodLabel}</span>
      <span class="nw-trend-usd">${fmtFn(Math.abs(delta))}</span>
    `;

    // build sparkline path
    const W = 400, H = 100, PAD = 6;
    const vals = sorted.map(h => h.netWorth || 0);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = (max - min) || 1;
    const stepX = (W - PAD * 2) / Math.max(1, vals.length - 1);
    const pts = vals.map((v, i) => {
      const x = PAD + i * stepX;
      const y = PAD + (H - PAD * 2) * (1 - (v - min) / range);
      return [x, y];
    });
    const linePath = smoothPath(pts);
    const fillPath = `${linePath} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
    const lastPt = pts[pts.length - 1];

    sparkWrap.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nwSparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${isUp ? '#818cf8' : '#fb7185'}"/>
            <stop offset="100%" stop-color="${isUp ? '#34d399' : '#f59e0b'}"/>
          </linearGradient>
          <linearGradient id="nwSparkFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${isUp ? '#34d399' : '#fb7185'}" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="${isUp ? '#34d399' : '#fb7185'}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path class="nw-spark-fill" d="${fillPath}"/>
        <path class="nw-spark-line" d="${linePath}"/>
        <circle class="nw-spark-dot" cx="${lastPt[0]}" cy="${lastPt[1]}" r="4.5"/>
      </svg>
    `;
  }

  // ---------- 2. Circular "Remaining Today" ring ----------
  function renderRemainingRing() {
    const header = document.querySelector('.safe-spend-card .safe-spend-header');
    if (!header) return;
    header.classList.add('with-ring');

    const spent = parseMoney(byId('todaySpentBadge') && byId('todaySpentBadge').textContent);
    const limit = parseMoney(byId('todayLimitBadge') && byId('todayLimitBadge').textContent);
    const pct = limit > 0 ? Math.max(0, Math.min(100, ((limit - spent) / limit) * 100)) : 0;

    let ring = byId('remainingRingWrap');
    if (!ring) {
      ring = document.createElement('div');
      ring.id = 'remainingRingWrap';
      ring.className = 'remaining-ring-wrap';
      header.appendChild(ring);
    }

    const R = 40, C = 2 * Math.PI * R;
    const offset = C - (pct / 100) * C;
    const color = pct >= 50 ? 'var(--emerald)' : pct >= 20 ? 'var(--gold)' : 'var(--rose)';

    ring.innerHTML = `
      <svg viewBox="0 0 96 96">
        <circle class="remaining-ring-track" cx="48" cy="48" r="${R}"/>
        <circle class="remaining-ring-fill" cx="48" cy="48" r="${R}"
          stroke="${color}" stroke-dasharray="${C}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="remaining-ring-center">
        <div class="remaining-ring-pct">${pct.toFixed(0)}%</div>
        <div class="remaining-ring-label">Remaining</div>
      </div>
    `;
  }

  // ---------- 3. Ensure a net-worth snapshot exists for *today*,
  // even if the user hasn't logged a transaction yet. Without this,
  // state.history only gains an entry when saveToStorage() runs (i.e.
  // on a transaction), so quiet days silently have no data point -
  // that's why the trend/sparkline can look thinner than your actual
  // number of days using the app. This does not invent any values;
  // it just makes sure today's real current net worth gets recorded.
  function ensureTodaySnapshot() {
    if (typeof window.saveToStorage === 'function' && !window.__v3SnapshotDone) {
      window.__v3SnapshotDone = true;
      window.saveToStorage();
    }
  }

  // ---------- Hook into the app's render cycle ----------
  function renderV3Extras() {
    try { renderNwTrend(); } catch (e) { console.warn('[v3] nwTrend', e); }
    try { renderRemainingRing(); } catch (e) { console.warn('[v3] ring', e); }
  }

  function bootstrap() {
    if (typeof window.renderAll === 'function' && !window.renderAll.__v3Wrapped) {
      const original = window.renderAll;
      const wrapped = function () {
        original.apply(this, arguments);
        renderV3Extras();
      };
      wrapped.__v3Wrapped = true;
      window.renderAll = wrapped;
      renderV3Extras(); // run once immediately in case renderAll already fired
    } else {
      // app.js not loaded yet - retry shortly
      setTimeout(bootstrap, 150);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();