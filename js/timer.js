/**
 * CosmicToolbox Timer Module
 * Countdown timer with preset shortcuts, animated SVG progress ring, and Web Audio alarm.
 */

document.addEventListener('DOMContentLoaded', () => {
  const displayEl      = document.getElementById('timer-display');
  const startBtn       = document.getElementById('timer-start-btn');
  const resetBtn       = document.getElementById('timer-reset-btn');
  const ring           = document.getElementById('timer-progress-ring');
  const inputM         = document.getElementById('timer-input-m');
  const inputS         = document.getElementById('timer-input-s');
  const setupContainer = document.getElementById('timer-setup-container');
  const presetBtns     = document.querySelectorAll('.timer-preset-btn');

  if (!displayEl || !startBtn) return;

  // Ring geometry: r=90 → circ = 2π×90 ≈ 565.48
  const RING_CIRC = 565.48;

  let totalSeconds  = 300;   // default 5 min
  let remaining     = 300;
  let running       = false;
  let intervalId    = null;
  let alarmFired    = false;

  /* ── Helpers ── */
  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function secToMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function renderTimer() {
    if (!displayEl) return;
    displayEl.textContent = secToMMSS(remaining);

    if (ring) {
      const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;
      ring.style.strokeDashoffset = RING_CIRC * (1 - pct);

      // Dynamic color gradient when time is low
      if (pct <= 0.1) {
        ring.style.stroke = '#f43f5e';
        ring.style.filter = 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.7))';
      } else if (pct <= 0.33) {
        ring.style.stroke = '#fbbf24';
        ring.style.filter = 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))';
      } else {
        ring.style.stroke = '#38bdf8';
        ring.style.filter = 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))';
      }
    }
  }

  function fireAlarm() {
    if (alarmFired) return;
    alarmFired = true;

    // Visual flash effect on display
    displayEl.style.color = '#f43f5e';
    displayEl.style.textShadow = '0 0 20px rgba(244,63,94,0.8)';

    // Synthesize alarm pattern via Web Audio
    if (window.CosmicOS && window.CosmicOS.settings.audio) {
      window.CosmicOS.initAudio();
      const ctx = window.CosmicOS.audioCtx;
      if (ctx) {
        // Triple beep pattern
        [0, 0.35, 0.7].forEach(offset => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          const t = ctx.currentTime + offset;
          osc.frequency.setValueAtTime(1000, t);
          osc.frequency.setValueAtTime(800, t + 0.1);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.28);
          osc.start(t);
          osc.stop(t + 0.28);
        });
      }
    }

    if (window.CosmicOS) {
      window.CosmicOS.showToast('⏱ Countdown sequence complete — temporal alarm triggered.', 'info');
    }
  }

  function tick() {
    if (remaining > 0) {
      remaining--;
      renderTimer();
    } else {
      clearInterval(intervalId);
      running = false;
      startBtn.textContent = 'Start';
      startBtn.classList.remove('primary');
      if (setupContainer) setupContainer.style.display = 'flex';
      fireAlarm();
    }
  }

  function applyInputValues() {
    const m = parseInt(inputM.value) || 0;
    const s = Math.min(59, parseInt(inputS.value) || 0);
    totalSeconds = (m * 60) + s;
    remaining    = totalSeconds;
    alarmFired   = false;

    // Reset display color
    if (displayEl) {
      displayEl.style.color = '';
      displayEl.style.textShadow = '';
    }

    renderTimer();
  }

  /* ── Controls ── */
  startBtn.addEventListener('click', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');

    if (!running) {
      if (remaining === 0 || alarmFired) {
        applyInputValues();
        if (remaining === 0) return;
      }
      running = true;
      startBtn.textContent = 'Pause';
      startBtn.classList.add('primary');
      if (setupContainer) setupContainer.style.display = 'none';
      intervalId = setInterval(tick, 1000);
    } else {
      // Pause
      running = false;
      clearInterval(intervalId);
      startBtn.textContent = 'Resume';
      startBtn.classList.remove('primary');
    }
  });

  resetBtn.addEventListener('click', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('beep');
    running = false;
    clearInterval(intervalId);
    alarmFired = false;

    startBtn.textContent = 'Start';
    startBtn.classList.remove('primary');
    if (setupContainer) setupContainer.style.display = 'flex';

    if (displayEl) {
      displayEl.style.color = '';
      displayEl.style.textShadow = '';
    }

    applyInputValues();
  });

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.CosmicOS) window.CosmicOS.playAudio('click');
      if (running) {
        clearInterval(intervalId);
        running = false;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('primary');
      }

      const secs = parseInt(btn.getAttribute('data-time'));
      totalSeconds = secs;
      remaining    = secs;
      alarmFired   = false;

      // Sync input fields with preset values
      if (inputM) inputM.value = Math.floor(secs / 60);
      if (inputS) inputS.value = secs % 60;
      if (setupContainer) setupContainer.style.display = 'flex';
      if (displayEl) {
        displayEl.style.color = '';
        displayEl.style.textShadow = '';
      }

      renderTimer();
    });
  });

  // Live input sync
  if (inputM) inputM.addEventListener('change', applyInputValues);
  if (inputS) inputS.addEventListener('change', applyInputValues);

  // Initial render
  renderTimer();
});
