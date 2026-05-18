/**
 * CosmicToolbox Calculator Module
 * Handles floating-point standard arithmetic alongside advanced trigonometric
 * and exponential scientific function evaluation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('calc-display');
  const history = document.getElementById('calc-history');
  const sciTray = document.getElementById('scientific-tray');
  const modeToggleBtn = document.getElementById('calc-mode-toggle');

  if (!display) return;

  let currentVal = '0';
  let previousVal = '';
  let operator = null;
  let resetDisplayOnNextInput = false;
  let isScientificMode = false;

  function updateScreen() {
    display.textContent = currentVal;
    if (operator && previousVal !== '') {
      // Map beautiful operator characters
      let opChar = operator;
      if (operator === '*') opChar = '×';
      if (operator === '/') opChar = '÷';
      if (operator === 'pow') opChar = '^';
      history.textContent = `${previousVal} ${opChar}`;
    } else {
      history.textContent = '';
    }
  }

  function appendNumber(num) {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    if (currentVal === '0' || resetDisplayOnNextInput) {
      currentVal = num;
      resetDisplayOnNextInput = false;
    } else {
      // Impose max input length constraint to prevent display overflow
      if (currentVal.length < 16) {
        currentVal += num;
      }
    }
    updateScreen();
  }

  function appendDecimal() {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    if (resetDisplayOnNextInput) {
      currentVal = '0.';
      resetDisplayOnNextInput = false;
    } else if (!currentVal.includes('.')) {
      currentVal += '.';
    }
    updateScreen();
  }

  function handleClear() {
    if (window.CosmicOS) window.CosmicOS.playAudio('beep');
    currentVal = '0';
    previousVal = '';
    operator = null;
    resetDisplayOnNextInput = false;
    updateScreen();
  }

  function handleDelete() {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    if (resetDisplayOnNextInput) return;
    if (currentVal.length > 1) {
      currentVal = currentVal.slice(0, -1);
    } else {
      currentVal = '0';
    }
    updateScreen();
  }

  function compute() {
    let result;
    const prev = parseFloat(previousVal);
    const curr = parseFloat(currentVal);

    if (isNaN(prev) || isNaN(curr)) return;

    switch (operator) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '*':
        result = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          if (window.CosmicOS) window.CosmicOS.showToast('Division by zero error anomaly detected.', 'error');
          handleClear();
          return;
        }
        result = prev / curr;
        break;
      case '%':
        result = prev % curr;
        break;
      case 'pow':
        result = Math.pow(prev, curr);
        break;
      default:
        return;
    }

    // Fix standard IEEE 754 precision issues gracefully
    result = Math.round(result * 1e10) / 1e10;
    
    currentVal = result.toString();
    operator = null;
    previousVal = '';
    resetDisplayOnNextInput = true;
    updateScreen();
  }

  function handleOperator(nextOp) {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    if (operator !== null && !resetDisplayOnNextInput) {
      compute();
    }
    previousVal = currentVal;
    operator = nextOp;
    resetDisplayOnNextInput = true;
    updateScreen();
  }

  function handleScientificAction(action) {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    let curr = parseFloat(currentVal);
    if (isNaN(curr)) return;

    switch (action) {
      case 'sin':
        curr = Math.sin(curr);
        break;
      case 'cos':
        curr = Math.cos(curr);
        break;
      case 'tan':
        curr = Math.tan(curr);
        break;
      case 'sqrt':
        if (curr < 0) {
          if (window.CosmicOS) window.CosmicOS.showToast('Imaginary root parameter anomaly.', 'error');
          handleClear();
          return;
        }
        curr = Math.sqrt(curr);
        break;
      case 'log':
        if (curr <= 0) {
          if (window.CosmicOS) window.CosmicOS.showToast('Logarithm defined on positive subset only.', 'error');
          handleClear();
          return;
        }
        curr = Math.log10(curr);
        break;
      case 'square':
        curr = Math.pow(curr, 2);
        break;
      case 'pi':
        curr = Math.PI;
        break;
      case 'pow':
        handleOperator('pow');
        return;
    }

    curr = Math.round(curr * 1e10) / 1e10;
    currentVal = curr.toString();
    resetDisplayOnNextInput = true;
    updateScreen();
  }

  // Click handler routing
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const val = btn.getAttribute('data-value');

      if (action === 'number') appendNumber(val);
      else if (action === 'decimal') appendDecimal();
      else if (action === 'clear') handleClear();
      else if (action === 'delete') handleDelete();
      else if (action === 'operator') handleOperator(val);
      else if (action === 'calculate') {
        if (window.CosmicOS) window.CosmicOS.playAudio('success');
        compute();
      }
      else if (btn.classList.contains('sci-btn')) {
        handleScientificAction(action);
      }
    });
  });

  // Scientific Mode UI integration
  if (modeToggleBtn && sciTray) {
    modeToggleBtn.addEventListener('click', () => {
      if (window.CosmicOS) window.CosmicOS.playAudio('click');
      isScientificMode = !isScientificMode;
      if (isScientificMode) {
        sciTray.style.display = 'grid';
        modeToggleBtn.innerHTML = `Scientific Mode: <span style="color: var(--accent-cyan);">ON</span>`;
        modeToggleBtn.style.borderColor = 'var(--accent-cyan)';
      } else {
        sciTray.style.display = 'none';
        modeToggleBtn.innerHTML = `Scientific Mode: <span style="color: var(--text-muted);">OFF</span>`;
        modeToggleBtn.style.borderColor = 'var(--border-glass)';
      }
    });
  }

  // Bind Keyboard Inputs
  window.addEventListener('keydown', (e) => {
    // Prevent interfering if user is editing inputs in other tabs
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
      return;
    }

    // Only process if calculator view is active
    const calcView = document.getElementById('calculator-view');
    if (!calcView || !calcView.classList.contains('active-view')) return;

    if (e.key >= '0' && e.key <= '9') {
      appendNumber(e.key);
      simulatePress(`[data-action="number"][data-value="${e.key}"]`);
    } else if (e.key === '.') {
      appendDecimal();
      simulatePress(`[data-action="decimal"]`);
    } else if (e.key === 'Backspace') {
      handleDelete();
      simulatePress(`[data-action="delete"]`);
    } else if (e.key === 'Escape') {
      handleClear();
      simulatePress(`[data-action="clear"]`);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
      handleOperator(e.key);
      simulatePress(`[data-action="operator"][data-value="${e.key}"]`);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      if (window.CosmicOS) window.CosmicOS.playAudio('success');
      compute();
      simulatePress(`[data-action="calculate"]`);
    }
  });

  function simulatePress(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.style.transform = 'scale(0.92)';
      btn.style.boxShadow = '0 0 20px var(--accent-cyan)';
      setTimeout(() => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
      }, 120);
    }
  }

  updateScreen();
});
