/**
 * CosmicToolbox World Clock Module
 * Real-time multi-timezone digital clock displays with 1-second refresh.
 */

document.addEventListener('DOMContentLoaded', () => {
  const localTimeEl = document.getElementById('clock-local-time');
  const localDateEl = document.getElementById('clock-local-date');
  const utcTimeEl   = document.getElementById('clock-utc-time');
  const utcDateEl   = document.getElementById('clock-utc-date');
  const worldNodes  = document.querySelectorAll('.world-time-val');

  if (!localTimeEl) return;

  /* ── Helpers ── */
  function pad(n) { return String(n).padStart(2, '0'); }

  const DATE_OPTS = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  function formatHMS(date) {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
  }

  function formatHMSTZ(tzName) {
    try {
      return new Date().toLocaleTimeString('en-US', { 
        timeZone: tzName, 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '--:-- --';
    }
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', { ...DATE_OPTS, timeZone: 'Asia/Kolkata' });
  }

  function formatDateTZ(tzName) {
    try {
      return new Date().toLocaleDateString('en-US', { ...DATE_OPTS, timeZone: tzName });
    } catch {
      return '---';
    }
  }

  /* ── Tick ── */
  function updateClocks() {
    const now = new Date();

    // Local
    if (localTimeEl) localTimeEl.textContent = formatHMS(now);
    if (localDateEl) localDateEl.textContent = formatDate(now);

    // UTC
    const utcHRaw = now.getUTCHours();
    const utcAmPm = utcHRaw >= 12 ? 'PM' : 'AM';
    const utcH = utcHRaw % 12 || 12;
    const utcM = pad(now.getUTCMinutes());
    const utcS = pad(now.getUTCSeconds());
    if (utcTimeEl)   utcTimeEl.textContent = `${pad(utcH)}:${utcM}:${utcS} ${utcAmPm}`;
    if (utcDateEl)   utcDateEl.textContent  = formatDateTZ('UTC');

    // World nodes — each carries data-tz attribute
    worldNodes.forEach(el => {
      const tz = el.getAttribute('data-tz');
      if (tz) {
        // Show 12-hour format with AM/PM
        el.textContent = formatHMSTZ(tz);
      }
    });
  }

  // Tick every second
  setInterval(updateClocks, 1000);
  updateClocks(); // Immediate first paint
});
