/**
 * CosmicToolbox Text Analyzer Module
 */

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('analyzer-input');
  const wordsEl = document.getElementById('analyzer-words');
  const charsEl = document.getElementById('analyzer-chars');
  const sentencesEl = document.getElementById('analyzer-sentences');

  if (!inputEl) return;

  inputEl.addEventListener('input', () => {
    const text = inputEl.value;
    
    // Characters
    const chars = text.length;
    charsEl.textContent = chars;

    // Words
    const wordMatches = text.match(/\b[-?(\w+)?]+\b/gi);
    const words = wordMatches ? wordMatches.length : 0;
    wordsEl.textContent = words;

    // Sentences
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    sentencesEl.textContent = sentences;
  });
});
