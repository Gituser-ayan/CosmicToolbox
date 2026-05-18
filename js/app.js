/**
 * CosmicToolbox Global Framework Orchestrator
 * Handles internal single-page routing, client telemetry, particle generation,
 * synthesized audio output, and custom overlays.
 */

// ── Register Service Worker for PWA ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('Service Worker registered successfully.', reg);
    }).catch(err => {
      console.warn('Service Worker registration failed.', err);
    });
  });
}

// ── 1. GLOBAL STATE & SOUND ENGINE ──
window.CosmicOS = {
  settings: {
    particles: true
  },
  
  // Audio system completely removed as per user request.
  // Method retained as a silent no-op to prevent exceptions from other modules.
  playAudio(type = 'click') {
    return;
  },

  // Renders automated toast arrays seamlessly
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-overlay');
    if (!container) return;

    this.playAudio(type === 'error' ? 'error' : 'success');

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    
    // Icon configuration
    const icon = type === 'error' ? '⚠️' : '✦';
    
    toast.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span style="flex: 1;">${message}</span>
      <button style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding: 0 4px;" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto dispose queue
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'toast-enter 0.3s forwards reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Routing Engine
  const navItems = document.querySelectorAll('.nav-item');
  const viewContainers = document.querySelectorAll('.view-container');
  const topBarTitle = document.getElementById('top-bar-title');
  const body = document.body;

  // View Switch logic
  function navigateTo(targetId) {
    const targetLink = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (!targetLink) return;

    // Trigger audio pulse
    window.CosmicOS.playAudio('click');

    // Update link active state
    navItems.forEach(item => item.classList.remove('active'));
    targetLink.classList.add('active');

    // Update screen header label
    const label = targetLink.querySelector('span').textContent;
    if (topBarTitle) topBarTitle.textContent = label === 'Dashboard' ? 'Home Dashboard' : label;

    // Switch view containers
    viewContainers.forEach(container => {
      if (container.id === targetId) {
        container.classList.add('active-view');
      } else {
        container.classList.remove('active-view');
      }
    });

    // Close mobile menu if active
    body.classList.remove('sidebar-open');
  }

  // Bind Sidebar items
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      if (target) navigateTo(target);
    });
  });

  // Bind Quick Navigation targets
  document.querySelectorAll('.quick-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = btn.getAttribute('data-target');
      if (target) navigateTo(target);
    });
  });

  // Menu Drawer toggles
  const menuToggleBtn = document.getElementById('mobile-menu-toggle');
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      window.CosmicOS.playAudio('click');
      body.classList.toggle('sidebar-open');
    });
  }

  const desktopMenuToggleBtn = document.getElementById('desktop-menu-toggle');
  if (desktopMenuToggleBtn) {
    desktopMenuToggleBtn.addEventListener('click', () => {
      window.CosmicOS.playAudio('click');
      body.classList.toggle('sidebar-collapsed');
    });
  }

  // Live Sub-system Space-Time synchronizer
  const topBarTime = document.getElementById('top-bar-time');
  function updateTopTime() {
    if (!topBarTime) return;
    topBarTime.textContent = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
  }
  setInterval(updateTopTime, 1000);
  updateTopTime();

  // Background Starfield & Particle Generative Arrays
  const starfield = document.getElementById('starfield');
  const particlesContainer = document.getElementById('particles-container');

  function initStarfield() {
    if (!starfield) return;
    starfield.innerHTML = '';
    const starCount = window.innerWidth < 768 ? 60 : 150;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = '#fff';
      star.style.borderRadius = '50%';
      star.style.opacity = Math.random() * 0.6 + 0.2;
      
      // Twinkle dynamic logic
      if (Math.random() > 0.7) {
        star.classList.add('glow-pulse');
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      }
      starfield.appendChild(star);
    }
  }

  function createFloatingParticle() {
    if (!window.CosmicOS.settings.particles || !particlesContainer) return;
    
    // Throttle total count
    if (particlesContainer.children.length > 25) return;

    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    const pSize = Math.random() * 4 + 2;
    particle.style.width = `${pSize}px`;
    particle.style.height = `${pSize}px`;

    // Dynamic travel delta mapping
    const moveX = (Math.random() - 0.5) * 100; // pixels
    const moveY = -(Math.random() * 150 + 50); // drifting up
    const duration = Math.random() * 8 + 6;

    particle.style.setProperty('--move-x', `${moveX}px`);
    particle.style.setProperty('--move-y', `${moveY}px`);
    particle.style.setProperty('--max-opacity', `${Math.random() * 0.5 + 0.2}`);
    particle.style.animationDuration = `${duration}s`;

    particlesContainer.appendChild(particle);

    setTimeout(() => {
      if (particle.parentElement) particle.remove();
    }, duration * 1000);
  }

  // Initialize Particle simulation loops
  initStarfield();
  window.addEventListener('resize', () => {
    // Re-seed dynamic map on layout resizing
    clearTimeout(window._resizeDebounce);
    window._resizeDebounce = setTimeout(initStarfield, 500);
  });

  setInterval(createFloatingParticle, 600);

  // Global Config Settings Controls Registry
  const particlesCheckbox = document.getElementById('setting-particles-checkbox');

  if (particlesCheckbox) {
    particlesCheckbox.addEventListener('change', (e) => {
      window.CosmicOS.settings.particles = e.target.checked;
      if (!e.target.checked && particlesContainer) {
        particlesContainer.innerHTML = '';
      }
    });
  }

  const clearDataBtn = document.getElementById('setting-clear-data-btn');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      if (confirm('CAUTION: Are you sure you want to permanently clear all stored local parameters and note files?')) {
        localStorage.clear();
        window.CosmicOS.showToast('Memory database wiped completely.', 'error');
        // Force sync active note rendering array if accessible
        if (window.loadNotesGrid) window.loadNotesGrid();
      }
    });
  }

});
