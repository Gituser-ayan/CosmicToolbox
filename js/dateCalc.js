/**
 * CosmicToolbox Date Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  const startIn = document.getElementById('date-start');
  const endIn = document.getElementById('date-end');
  const resultDays = document.getElementById('date-result-days');
  const resultBreakdown = document.getElementById('date-result-breakdown');

  if (!startIn) return;

  function calculateDiff() {
    if (!startIn.value || !endIn.value) return;
    
    const d1 = new Date(startIn.value);
    const d2 = new Date(endIn.value);
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    resultDays.textContent = `${diffDays} Days`;
    
    if (diffDays === 0) {
      resultBreakdown.textContent = "Dates are identical.";
    } else {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      let str = "";
      if (weeks > 0) str += `${weeks} week${weeks > 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        if (str !== "") str += " and ";
        str += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
      str += ` | Approx ${Math.floor(diffDays / 30)} months | ${diffDays * 24} hours`;
      resultBreakdown.textContent = str;
    }
  }

  startIn.addEventListener('change', calculateDiff);
  endIn.addEventListener('change', calculateDiff);
});
