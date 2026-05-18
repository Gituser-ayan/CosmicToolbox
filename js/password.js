/**
 * CosmicToolbox Password Generator Module
 * Cryptographically random password generation using Crypto.getRandomValues,
 * with real-time entropy strength analysis and clipboard integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  const output      = document.getElementById('pwd-output');
  const copyBtn     = document.getElementById('pwd-copy-btn');
  const generateBtn = document.getElementById('pwd-generate-btn');
  const lengthSlider= document.getElementById('pwd-length');
  const lengthLabel = document.getElementById('pwd-length-display');
  const upperCheck  = document.getElementById('pwd-upper');
  const lowerCheck  = document.getElementById('pwd-lower');
  const numbersCheck= document.getElementById('pwd-numbers');
  const symbolsCheck= document.getElementById('pwd-symbols');
  const strengthBar = document.getElementById('pwd-strength-bar');
  const strengthLabel = document.getElementById('pwd-strength-label');

  if (!output || !generateBtn) return;

  /* ── Character pools ── */
  const POOLS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  /* ── Cryptographically-secure random index ── */
  function secureRandIndex(max) {
    const arr = new Uint32Array(1);
    let rand;
    do {
      crypto.getRandomValues(arr);
      rand = arr[0];
    } while (rand >= Math.floor(0xFFFFFFFF / max) * max); // rejection sampling
    return rand % max;
  }

  /* ── Generate ── */
  function generatePassword() {
    const len = parseInt(lengthSlider.value);
    let pool = '';
    const guaranteed = [];

    if (upperCheck.checked)   { pool += POOLS.upper;   guaranteed.push(POOLS.upper[secureRandIndex(POOLS.upper.length)]); }
    if (lowerCheck.checked)   { pool += POOLS.lower;   guaranteed.push(POOLS.lower[secureRandIndex(POOLS.lower.length)]); }
    if (numbersCheck.checked) { pool += POOLS.numbers; guaranteed.push(POOLS.numbers[secureRandIndex(POOLS.numbers.length)]); }
    if (symbolsCheck.checked) { pool += POOLS.symbols; guaranteed.push(POOLS.symbols[secureRandIndex(POOLS.symbols.length)]); }

    if (pool.length === 0) {
      if (window.CosmicOS) window.CosmicOS.showToast('Select at least one character category.', 'error');
      return;
    }

    // Fill rest of password
    const rest = Array.from({ length: Math.max(0, len - guaranteed.length) }, () =>
      pool[secureRandIndex(pool.length)]
    );

    // Fisher-Yates shuffle the combined array to prevent category clustering
    const combined = [...guaranteed, ...rest];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = secureRandIndex(i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    const pwd = combined.join('');
    output.value = pwd;

    if (window.CosmicOS) window.CosmicOS.playAudio('success');
    analyzeStrength(pwd, pool.length);
  }

  /* ── Entropy Strength Assessment ── */
  function analyzeStrength(pwd, poolSize) {
    const entropy = pwd.length * Math.log2(poolSize || 1);

    let level, color, pct;
    if (entropy < 28) {
      level = 'Critical Weak'; color = '#f43f5e'; pct = 15;
    } else if (entropy < 40) {
      level = 'Weak';          color = '#fb923c'; pct = 30;
    } else if (entropy < 60) {
      level = 'Moderate';      color = '#fbbf24'; pct = 55;
    } else if (entropy < 80) {
      level = 'Strong';        color = '#34d399'; pct = 78;
    } else {
      level = 'Quantum-Grade'; color = 'var(--accent-cyan)'; pct = 100;
    }

    if (strengthBar) {
      strengthBar.style.width = `${pct}%`;
      strengthBar.style.background = color;
    }
    if (strengthLabel) {
      strengthLabel.textContent = level;
      strengthLabel.style.color = color;
    }
  }

  /* ── Clipboard ── */
  async function copyToClipboard() {
    const text = output.value;
    if (!text) {
      if (window.CosmicOS) window.CosmicOS.showToast('Generate a password first.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      if (window.CosmicOS) {
        window.CosmicOS.playAudio('success');
        window.CosmicOS.showToast('Encrypted key copied to clipboard.', 'info');
      }
      // Brief visual feedback on button
      if (copyBtn) {
        copyBtn.style.background = 'rgba(0, 245, 255, 0.2)';
        copyBtn.style.boxShadow  = '0 0 15px var(--accent-cyan)';
        setTimeout(() => {
          copyBtn.style.background = '';
          copyBtn.style.boxShadow  = '';
        }, 600);
      }
    } catch {
      if (window.CosmicOS) window.CosmicOS.showToast('Clipboard write denied by browser.', 'error');
    }
  }

  /* ── Bind Events ── */
  generateBtn.addEventListener('click', generatePassword);
  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);

  if (lengthSlider) {
    lengthSlider.addEventListener('input', () => {
      if (lengthLabel) lengthLabel.textContent = lengthSlider.value;
    });
  }

  // Start with a clean empty state — generate only on button click
  output.value = '';
  if (strengthBar) { strengthBar.style.width = '0%'; }
  if (strengthLabel) { strengthLabel.textContent = '—'; strengthLabel.style.color = 'var(--text-muted)'; }
});
