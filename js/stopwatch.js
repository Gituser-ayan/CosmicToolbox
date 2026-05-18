/**
 * CosmicToolbox Stopwatch Module
 * Millisecond-precision chronometer with lap recording and animated SVG ring.
 */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn   = document.getElementById('sw-start-btn');
  const lapBtn     = document.getElementById('sw-lap-btn');
  const resetBtn   = document.getElementById('sw-reset-btn');
  const mainTime   = document.getElementById('sw-main-time');
  const msTime     = document.getElementById('sw-ms-time');
  const ring       = document.getElementById('stopwatch-ring');
  const lapsCont   = document.getElementById('sw-laps-container');

  if (!startBtn) return;

  // Ring geometry: circumference = 2π × r100 ≈ 628.3
  const RING_CIRC = 628.3;

  let running       = false;
  let startEpoch    = 0;      // performance.now() snapshot at last start
  let elapsedMs     = 0;      // accumulated ms before current run
  let lapMarkMs     = 0;      // elapsed at last lap mark
  let lapCount      = 0;
  let frameId       = null;

  /* ── Helpers ── */
  function pad(n, d = 2) { return String(n).padStart(d, '0'); }

  function msToHMS(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h  = Math.floor(totalSec / 3600);
    const m  = Math.floor((totalSec % 3600) / 60);
    const s  = totalSec % 60;
    const ms3 = Math.floor(ms % 1000);
    return { h, m, s, ms3 };
  }

  function renderTime(totalMs) {
    const { h, m, s, ms3 } = msToHMS(totalMs);
    if (mainTime) mainTime.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    if (msTime)   msTime.textContent   = `.${pad(ms3, 3)}`;

    // Animate ring once per 60-second revolution
    if (ring) {
      const secInMinute = (totalMs / 1000) % 60;
      const pct = secInMinute / 60;
      ring.style.strokeDashoffset = RING_CIRC * (1 - pct);
    }
  }

  function tick() {
    const now      = performance.now();
    const totalMs  = elapsedMs + (now - startEpoch);
    renderTime(totalMs);
    frameId = requestAnimationFrame(tick);
  }

  /* ── Controls ── */
  startBtn.addEventListener('click', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    if (!running) {
      // Start / Resume
      running    = true;
      startEpoch = performance.now();
      frameId    = requestAnimationFrame(tick);
      startBtn.textContent = 'Pause';
      startBtn.classList.add('primary');
      lapBtn.disabled = false;
    } else {
      // Pause
      running   = false;
      elapsedMs += performance.now() - startEpoch;
      cancelAnimationFrame(frameId);
      startBtn.textContent = 'Resume';
      startBtn.classList.remove('primary');
    }
  });

  lapBtn.addEventListener('click', () => {
    if (!running) return;
    if (window.CosmicOS) window.CosmicOS.playAudio('beep');

    lapCount++;
    const now      = performance.now();
    const totalMs  = elapsedMs + (now - startEpoch);
    const splitMs  = totalMs - lapMarkMs;
    lapMarkMs      = totalMs;

    // Remove placeholder text on first lap
    if (lapCount === 1) lapsCont.innerHTML = '';

    // Prepend newest lap on top
    const { h: lh, m: lm, s: ls, ms3: lms } = msToHMS(totalMs);
    const { h: sh, m: sm, s: ss, ms3: sms } = msToHMS(splitMs);

    const row = document.createElement('div');
    row.style.cssText = `
      display: flex; justify-content: space-between;
      padding: 6px 8px; border-radius: 6px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-glass);
      animation: fade-in 0.25s ease;
    `;
    row.innerHTML = `
      <span style="color: var(--accent-cyan);">Lap&nbsp;${pad(lapCount)}&nbsp;&nbsp;${pad(lh)}:${pad(lm)}:${pad(ls)}.${pad(lms, 3)}</span>
      <span style="color: var(--text-muted);">+${pad(sh)}:${pad(sm)}:${pad(ss)}.${pad(sms, 3)}</span>
    `;
    lapsCont.insertBefore(row, lapsCont.firstChild);
  });

  resetBtn.addEventListener('click', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('beep');
    running   = false;
    elapsedMs = 0;
    lapMarkMs = 0;
    lapCount  = 0;
    cancelAnimationFrame(frameId);

    startBtn.textContent = 'Start';
    startBtn.classList.remove('primary');
    lapBtn.disabled = true;

    renderTime(0);
    lapsCont.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 12px 0; font-family: var(--font-body); font-size: 12px;">No telemetry markers saved.</div>`;
  });

  // Initial render
  renderTime(0);
});
