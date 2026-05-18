/**
 * CosmicToolbox Pomodoro Tracker
 */

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('pomo-display');
  const badge = document.getElementById('pomo-mode-badge');
  const toggleBtn = document.getElementById('pomo-toggle-btn');
  const resetBtn = document.getElementById('pomo-reset-btn');
  const counterEl = document.getElementById('pomo-counter');

  if (!display) return;

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  let timeLeft = WORK_TIME;
  let isWorkMode = true;
  let isRunning = false;
  let interval = null;
  let sessions = 0;

  function updateDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
  }

  function toggleMode() {
    isWorkMode = !isWorkMode;
    if (isWorkMode) {
      badge.textContent = 'Focus Session';
      badge.style.color = '#ef4444';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      timeLeft = WORK_TIME;
    } else {
      badge.textContent = 'Break Time';
      badge.style.color = '#10b981';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      timeLeft = BREAK_TIME;
      sessions++;
      counterEl.textContent = sessions;
    }
    updateDisplay();
  }

  function tick() {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      if (window.CosmicOS && window.CosmicOS.showToast) {
        window.CosmicOS.showToast(`Pomodoro session complete! Starting ${isWorkMode ? 'Break' : 'Focus'} time.`, 'success');
      }
      toggleMode();
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(interval);
      toggleBtn.textContent = 'RESUME';
      isRunning = false;
    } else {
      interval = setInterval(tick, 1000);
      toggleBtn.textContent = 'PAUSE';
      isRunning = true;
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
    isWorkMode = true;
    timeLeft = WORK_TIME;
    badge.textContent = 'Focus Session';
    badge.style.color = '#ef4444';
    badge.style.background = 'rgba(239, 68, 68, 0.2)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    toggleBtn.textContent = 'START';
    updateDisplay();
  });
});
