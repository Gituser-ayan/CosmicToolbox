/**
 * CosmicToolbox QR Code Generator
 * Uses qrcode-generator via CDN to generate local SVG optical markers
 */
document.addEventListener('DOMContentLoaded', () => {
  const qrInput = document.getElementById('qr-input');
  const qrContainer = document.getElementById('qrcode-container');
  const qrPlaceholder = document.getElementById('qr-placeholder-text');
  const qrDownloadBtn = document.getElementById('qr-download-btn');
  
  if (!qrInput || !qrContainer) return;

  let debounceTimeout = null;
  let currentSvgString = '';

  function generateQR() {
    const text = qrInput.value.trim();
    
    if (!text) {
      qrContainer.style.display = 'none';
      qrPlaceholder.style.display = 'block';
      qrDownloadBtn.disabled = true;
      qrContainer.innerHTML = '';
      currentSvgString = '';
      return;
    }

    qrPlaceholder.style.display = 'none';
    qrContainer.style.display = 'flex';
    qrDownloadBtn.disabled = false;
    
    if (window.CosmicOS) window.CosmicOS.playAudio('typing');

    try {
      // Create QR Code (type 0 = auto size, 'H' = high error correction)
      const qr = qrcode(0, 'H');
      qr.addData(text);
      qr.make();
      
      // Generate SVG Tag (cellSize: 10, margin: 2)
      // qrcode-generator's createSvgTag produces a raw string of HTML
      const svgTag = qr.createSvgTag(10, 2);
      
      // To ensure our custom colors, we inject it into the SVG string
      // qrcode-generator uses black/white by default.
      // We want background: #ffffff, foreground: #0f172a
      currentSvgString = svgTag
        .replace(/fill="#ffffff"/g, 'fill="#ffffff"')
        .replace(/fill="#000000"/g, 'fill="#0f172a"');
      
      qrContainer.innerHTML = currentSvgString;
      
    } catch (e) {
      console.warn("QR Library failed or not loaded yet.", e);
    }
  }

  qrInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(generateQR, 300);
  });

  qrDownloadBtn.addEventListener('click', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    
    if (!currentSvgString) return;

    try {
      // Add XML namespace to SVG if it doesn't have it
      let finalSvg = currentSvgString;
      if (!finalSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
        finalSvg = finalSvg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      }
      
      const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cosmic_QR_${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      if (window.CosmicOS) window.CosmicOS.playAudio('success');
    } catch (e) {
      console.error("Could not export SVG.", e);
    }
  });
});
