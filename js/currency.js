/**
 * CosmicToolbox Currency Converter Module
 * Fetches real-time exchange rates via public API endpoints, implements persistent
 * client fallback parities, and provides instant recalculations.
 */

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('curr-amount');
  const fromSelect = document.getElementById('curr-from');
  const toSelect = document.getElementById('curr-to');
  const swapBtn = document.getElementById('curr-swap-btn');
  const resultDisplay = document.getElementById('curr-result-display');
  const rateInfo = document.getElementById('curr-rate-info');
  const timestampDisplay = document.getElementById('curr-update-timestamp');
  const refreshBtn = document.getElementById('curr-refresh-btn');
  const loadingOverlay = document.getElementById('currency-loading');
  const errorBanner = document.getElementById('currency-error');

  if (!amountInput || !resultDisplay) return;

  // Premium Persistent Base Parity Index (Fallback values when offline)
  let exchangeRates = {
    USD: 1.0000,
    EUR: 0.9245,
    GBP: 0.7912,
    JPY: 156.12,
    AUD: 1.5034,
    CAD: 1.3650,
    CHF: 0.9080,
    CNY: 7.2355,
    INR: 95.0000, // Kept at your requested ~95 parity
    SGD: 1.3480
  };

  // Maps clean label names
  const currencySymbols = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$',
    CAD: 'C$', CHF: 'Fr', CNY: '¥', INR: '₹', SGD: 'S$'
  };

  async function fetchLiveTelemetry() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (errorBanner) errorBanner.style.display = 'none';

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) throw new Error('Network payload exception');
      
      const data = await response.json();
      if (data && data.rates) {
        // Merge fetched dynamic variables into operational list
        Object.keys(exchangeRates).forEach(code => {
          if (data.rates[code]) {
            exchangeRates[code] = data.rates[code];
          }
        });

        // time_last_updated is in seconds
        const dateStr = new Date(data.time_last_updated * 1000).toLocaleString();
        if (timestampDisplay) timestampDisplay.textContent = `Last Updated: ${dateStr}`;
        // Quietly confirm live rates loaded
      }
    } catch (err) {
      // Fallback rates are already loaded — just update the label silently
      if (timestampDisplay) timestampDisplay.textContent = 'Last Updated: Using built-in rates';
      // No red banner, no toast — fallback rates work perfectly fine
    } finally {
      if (loadingOverlay) loadingOverlay.style.display = 'none';
      computeConversion();
    }
  }

  function computeConversion() {
    const amount = parseFloat(amountInput.value);
    const fromCode = fromSelect.value;
    const toCode = toSelect.value;

    if (isNaN(amount) || amount < 0) {
      resultDisplay.textContent = '0.00';
      rateInfo.textContent = 'Invalid baseline input value';
      return;
    }

    // Convert baseline amount to intermediate USD vector, then target
    const amountInUSD = amount / exchangeRates[fromCode];
    const targetAmount = amountInUSD * exchangeRates[toCode];

    // Compute specific scalar baseline rate
    const unitRate = exchangeRates[toCode] / exchangeRates[fromCode];
    
    // Render outputs
    const sym = currencySymbols[toCode] || '';
    resultDisplay.textContent = `${sym}${targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    rateInfo.textContent = `1 ${fromCode} = ${unitRate.toFixed(4)} ${toCode}`;
  }

  // Bind Listeners
  amountInput.addEventListener('input', computeConversion);
  fromSelect.addEventListener('change', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    computeConversion();
  });
  toSelect.addEventListener('change', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    computeConversion();
  });

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      if (window.CosmicOS) window.CosmicOS.playAudio('click');
      // Animate rotation matrix
      swapBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => swapBtn.style.transform = '', 200);

      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      computeConversion();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (window.CosmicOS) window.CosmicOS.playAudio('beep');
      fetchLiveTelemetry();
    });
  }

  // Dispatch live API sync routine on client bootstrap
  fetchLiveTelemetry();
});
