/**
 * CosmicToolbox BMI & Health Calculator
 */
document.addEventListener('DOMContentLoaded', () => {
  const heightInput = document.getElementById('bmi-height');
  const weightInput = document.getElementById('bmi-weight');
  const heightLabel = document.getElementById('bmi-height-label');
  const weightLabel = document.getElementById('bmi-weight-label');
  const calcBtn = document.getElementById('bmi-calc-btn');
  const resultCard = document.getElementById('bmi-result-card');
  const scoreDisplay = document.getElementById('bmi-score-display');
  const categoryDisplay = document.getElementById('bmi-category-display');
  const meterIndicator = document.getElementById('bmi-meter-indicator');
  const unitToggles = document.querySelectorAll('.bmi-unit-toggle');

  if (!heightInput || !calcBtn) return;

  let currentUnit = 'metric'; // 'metric' or 'imperial'

  unitToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.CosmicOS) window.CosmicOS.playAudio('click');
      unitToggles.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      currentUnit = e.target.dataset.unit;
      
      // Update labels and placeholders
      if (currentUnit === 'metric') {
        heightLabel.textContent = 'cm';
        weightLabel.textContent = 'kg';
        heightInput.placeholder = 'e.g. 175';
        weightInput.placeholder = 'e.g. 70';
      } else {
        heightLabel.textContent = 'in';
        weightLabel.textContent = 'lbs';
        heightInput.placeholder = 'e.g. 68';
        weightInput.placeholder = 'e.g. 150';
      }
      
      // Clear inputs to avoid confusion on switch
      heightInput.value = '';
      weightInput.value = '';
      resultCard.style.display = 'none';
    });
  });

  calcBtn.addEventListener('click', () => {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      if (window.CosmicOS) window.CosmicOS.playAudio('error');
      return;
    }

    if (window.CosmicOS) window.CosmicOS.playAudio('success');

    let bmi = 0;
    if (currentUnit === 'metric') {
      // Metric: BMI = kg / (m * m)
      const heightInMeters = h / 100;
      bmi = w / (heightInMeters * heightInMeters);
    } else {
      // Imperial: BMI = (lbs / (in * in)) * 703
      bmi = (w / (h * h)) * 703;
    }

    displayBMI(bmi);
  });

  function displayBMI(bmi) {
    resultCard.style.display = 'flex';
    scoreDisplay.textContent = bmi.toFixed(1);

    let category = '';
    let color = '';
    let percentage = 0;

    // Define percentage on the 15 to 40 scale
    // Scale: 15 -> 0%, 18.5 -> 14%, 25 -> 40%, 30 -> 60%, 40 -> 100%
    const minBMI = 15;
    const maxBMI = 40;
    
    percentage = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#38bdf8'; // Cyan
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal Weight';
      color = '#10b981'; // Emerald
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = '#fbbf24'; // Amber
    } else {
      category = 'Obese';
      color = '#f43f5e'; // Rose
    }

    categoryDisplay.textContent = category;
    categoryDisplay.style.color = color;
    scoreDisplay.style.color = color;

    // Animate the meter
    setTimeout(() => {
      meterIndicator.style.left = `${percentage}%`;
      meterIndicator.style.boxShadow = `0 0 10px ${color}`;
    }, 50);
  }
});
