/**
 * CosmicToolbox Color Converter
 */

document.addEventListener('DOMContentLoaded', () => {
  const hexInput = document.getElementById('color-hex');
  const rgbInput = document.getElementById('color-rgb');
  const hslInput = document.getElementById('color-hsl');
  const preview = document.getElementById('color-preview');

  if (!hexInput) return;

  function hexToRgb(hex) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgb('+[(c>>16)&255, (c>>8)&255, c&255].join(', ')+')';
    }
    return '';
  }

  function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  hexInput.addEventListener('input', () => {
    const hex = hexInput.value;
    const rgbStr = hexToRgb(hex);
    if (rgbStr) {
      rgbInput.value = rgbStr;
      preview.style.backgroundColor = hex;
      
      const rgbArr = rgbStr.match(/\d+/g).map(Number);
      hslInput.value = rgbToHsl(rgbArr[0], rgbArr[1], rgbArr[2]);
    }
  });

  rgbInput.addEventListener('input', () => {
    const rgbStr = rgbInput.value;
    const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      if (r <= 255 && g <= 255 && b <= 255) {
        const hex = rgbToHex(r, g, b);
        hexInput.value = hex;
        preview.style.backgroundColor = hex;
        hslInput.value = rgbToHsl(r, g, b);
      }
    }
  });
});
