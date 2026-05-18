/**
 * CosmicToolbox Unit Converter Module
 * Instant telemetry mapping across multiple scalar physics categories.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.unit-tab-btn');
  const inputVal = document.getElementById('unit-input-val');
  const outputVal = document.getElementById('unit-output-val');
  const fromSelect = document.getElementById('unit-from-select');
  const toSelect = document.getElementById('unit-to-select');
  const formulaDisplay = document.getElementById('unit-formula-display');

  if (!inputVal || !fromSelect) return;

  // Internal baseline unit definitions mapped to a reference unit per category
  const unitsData = {
    length: {
      baseUnit: 'Meter',
      units: {
        Meter: { factor: 1, name: 'Meter (m)' },
        Kilometer: { factor: 1000, name: 'Kilometer (km)' },
        Centimeter: { factor: 0.01, name: 'Centimeter (cm)' },
        Millimeter: { factor: 0.001, name: 'Millimeter (mm)' },
        Mile: { factor: 1609.34, name: 'Mile (mi)' },
        Yard: { factor: 0.9144, name: 'Yard (yd)' },
        Foot: { factor: 0.3048, name: 'Foot (ft)' },
        Inch: { factor: 0.0254, name: 'Inch (in)' },
        LightYear: { factor: 9.461e15, name: 'Light Year (ly)' }
      }
    },
    weight: {
      baseUnit: 'Gram',
      units: {
        Gram: { factor: 1, name: 'Gram (g)' },
        Kilogram: { factor: 1000, name: 'Kilogram (kg)' },
        Milligram: { factor: 0.001, name: 'Milligram (mg)' },
        MetricTon: { factor: 1e6, name: 'Metric Ton (t)' },
        Pound: { factor: 453.592, name: 'Pound (lb)' },
        Ounce: { factor: 28.3495, name: 'Ounce (oz)' }
      }
    },
    temperature: {
      // Custom handler applied logic
      baseUnit: 'Celsius',
      units: {
        Celsius: { name: 'Celsius (°C)' },
        Fahrenheit: { name: 'Fahrenheit (°F)' },
        Kelvin: { name: 'Kelvin (K)' }
      }
    },
    speed: {
      baseUnit: 'MPS',
      units: {
        MPS: { factor: 1, name: 'Meters / Second (m/s)' },
        KMPH: { factor: 0.277778, name: 'Kilometers / Hour (km/h)' },
        MPH: { factor: 0.44704, name: 'Miles / Hour (mph)' },
        Knot: { factor: 0.514444, name: 'Knot (kn)' },
        Mach: { factor: 343, name: 'Mach (Speed of Sound)' }
      }
    },
    storage: {
      baseUnit: 'Byte',
      units: {
        Byte: { factor: 1, name: 'Byte (B)' },
        Kilobyte: { factor: 1024, name: 'Kilobyte (KB)' },
        Megabyte: { factor: 1048576, name: 'Megabyte (MB)' },
        Gigabyte: { factor: 1073741824, name: 'Gigabyte (GB)' },
        Terabyte: { factor: 1099511627776, name: 'Terabyte (TB)' },
        Petabyte: { factor: 1.1258999e15, name: 'Petabyte (PB)' }
      }
    },
    time: {
      baseUnit: 'Second',
      units: {
        Second: { factor: 1, name: 'Second (s)' },
        Millisecond: { factor: 0.001, name: 'Millisecond (ms)' },
        Minute: { factor: 60, name: 'Minute (min)' },
        Hour: { factor: 3600, name: 'Hour (h)' },
        Day: { factor: 86400, name: 'Day (d)' },
        Year: { factor: 31536000, name: 'Year (yr)' }
      }
    }
  };

  let activeCategory = 'length';

  function populateSelectors() {
    const catData = unitsData[activeCategory].units;
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    Object.keys(catData).forEach(key => {
      const opt1 = document.createElement('option');
      opt1.value = key;
      opt1.textContent = catData[key].name;
      fromSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = key;
      opt2.textContent = catData[key].name;
      toSelect.appendChild(opt2);
    });

    // Preset distinct initial target if options exist
    if (toSelect.options.length > 1) {
      toSelect.selectedIndex = 1;
    }

    computeUnitConversion();
  }

  function computeUnitConversion() {
    const val = parseFloat(inputVal.value);
    if (isNaN(val)) {
      outputVal.value = '';
      formulaDisplay.textContent = 'Awaiting valid scalar input';
      return;
    }

    const fromUnit = fromSelect.value;
    const toUnit = toSelect.value;

    if (fromUnit === toUnit) {
      outputVal.value = val;
      formulaDisplay.textContent = 'Identity Matrix: x = x';
      return;
    }

    let result;

    if (activeCategory === 'temperature') {
      // Temperature structural non-linear mapping
      if (fromUnit === 'Celsius' && toUnit === 'Fahrenheit') {
        result = (val * 9/5) + 32;
        formulaDisplay.textContent = '(°C × 9/5) + 32 = °F';
      } else if (fromUnit === 'Celsius' && toUnit === 'Kelvin') {
        result = val + 273.15;
        formulaDisplay.textContent = '°C + 273.15 = K';
      } else if (fromUnit === 'Fahrenheit' && toUnit === 'Celsius') {
        result = (val - 32) * 5/9;
        formulaDisplay.textContent = '(°F - 32) × 5/9 = °C';
      } else if (fromUnit === 'Fahrenheit' && toUnit === 'Kelvin') {
        result = (val - 32) * 5/9 + 273.15;
        formulaDisplay.textContent = '(°F - 32) × 5/9 + 273.15 = K';
      } else if (fromUnit === 'Kelvin' && toUnit === 'Celsius') {
        result = val - 273.15;
        formulaDisplay.textContent = 'K - 273.15 = °C';
      } else if (fromUnit === 'Kelvin' && toUnit === 'Fahrenheit') {
        result = (val - 273.15) * 9/5 + 32;
        formulaDisplay.textContent = '(K - 273.15) × 9/5 + 32 = °F';
      }
    } else {
      // Linear factor evaluation
      const catUnits = unitsData[activeCategory].units;
      const baseVal = val * catUnits[fromUnit].factor;
      result = baseVal / catUnits[toUnit].factor;

      const scalarRel = catUnits[fromUnit].factor / catUnits[toUnit].factor;
      
      if (scalarRel > 1e4 || scalarRel < 1e-4) {
        formulaDisplay.textContent = `Multiply scalar by ≈ ${scalarRel.toExponential(4)}`;
      } else {
        formulaDisplay.textContent = `Multiply scalar by ≈ ${scalarRel.toFixed(5).replace(/\.?0+$/, '')}`;
      }
    }

    // Guard precision rendering length
    if (Math.abs(result) > 1e8 || (Math.abs(result) < 1e-4 && result !== 0)) {
      outputVal.value = result.toExponential(5);
    } else {
      outputVal.value = parseFloat(result.toFixed(6));
    }
  }

  // Bind Listeners
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.CosmicOS) window.CosmicOS.playAudio('click');
      tabBtns.forEach(b => b.classList.remove('primary'));
      btn.classList.add('primary');

      activeCategory = btn.getAttribute('data-category');
      populateSelectors();
    });
  });

  inputVal.addEventListener('input', computeUnitConversion);
  fromSelect.addEventListener('change', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    computeUnitConversion();
  });
  toSelect.addEventListener('change', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    computeUnitConversion();
  });

  // Startup defaults initialization
  populateSelectors();
});
