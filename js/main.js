
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  setupDynamicHeader();
  initHeroFadeScroll();
  initAboutFadeScroll();
  initHeroWordChanger();
  initProjectRevealScroll();
  initInteractiveGrid();
  initContactSpotlight();
  initFooterReveal();
});

/**
 * Cinematic Scroll-driven Reveal Animations
 * Uses IntersectionObserver to trigger css transitions on scroll.
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-zoom-in');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Reveal only once for cinematic flow
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger slightly before element enters viewport completely
    threshold: 0.1
  });
  
  revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * Performance-optimized Lazy Loader for Interactive 3D WebGL scenes.
 * Initializes the Three.js viewport only when the element is near the viewport
 * and destroys it when it leaves to conserve GPU contexts and memory.
 */
function initThreeViewers() {
  const threeContainers = document.querySelectorAll('.three-container');
  const viewerInstances = new Map(); // Store instances by container ID/Element
  
  const viewportObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const container = entry.target;
      const modelPath = container.getAttribute('data-model') || null;
      const accentColor = container.getAttribute('data-accent') || '#00ff66';
      
      if (entry.isIntersecting) {
        // If not initialized yet, spawn a new ProductViewer
        if (!viewerInstances.has(container)) {
          const viewer = new ProductViewer(container, modelPath, accentColor);
          viewerInstances.set(container, viewer);
        }
      } else {
        // If it moves far off screen, destroy instance to free WebGL context
        if (viewerInstances.has(container)) {
          const viewer = viewerInstances.get(container);
          viewer.destroy();
          viewerInstances.delete(container);
          container.classList.remove('loaded');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '200px 0px 200px 0px', // Load 200px before appearing to make it feel instant
    threshold: 0.01
  });
  
  threeContainers.forEach(container => viewportObserver.observe(container));
}

/**
 * Minimal Header transition logic on scroll
 */
function setupDynamicHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScrollY = window.scrollY;
  const headerHeight = 90; // default header height
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add/remove shrink class
    if (currentScrollY > 50) {
      header.classList.add('header--shrunk');
    } else {
      header.classList.remove('header--shrunk');
    }
    
    lastScrollY = currentScrollY;
  });
}

/**
 * Immersive cross-fade to white scroll effect.
 * Gradually transitions the hero overlay opacity to 1.0 (pure FFFFFF)
 * as the user scrolls, creating a smooth entrance for the white profile page.
 */
function initHeroFadeScroll() {
  const fadeOverlay = document.querySelector('.hero__fade-overlay');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');
  if (!fadeOverlay) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;
    
    // Transition starts immediately and reaches 100% white when scrolled to 80% viewport height
    let opacity = scrollY / (heroHeight * 0.8);
    opacity = Math.max(0, Math.min(1, opacity));
    
    fadeOverlay.style.opacity = opacity;
    
    // Fade out scroll indicator to white/transparent
    if (scrollIndicator) {
      scrollIndicator.style.opacity = 1 - opacity;
    }
  });
}

/**
 * Scroll-driven fade reveal for the centered About profile text.
 * Gradually transitions opacity of each line from 10% to 100% sequencially as the section enters the screen.
 */
function initAboutFadeScroll() {
  const lines = document.querySelectorAll('.profile-scroll-line');
  const profileSection = document.querySelector('.profile-section');
  if (!lines.length || !profileSection) return;
  
  const handleScroll = () => {
    const rect = profileSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Start fading when top of the section reaches the middle of the screen (rect.top = viewportHeight * 0.5)
    // Reach 100% opacity of the last line when section top reaches 15% of viewport height
    const startScroll = viewportHeight * 0.5;
    const endScroll = viewportHeight * 0.15;
    
    let progress = (startScroll - rect.top) / (startScroll - endScroll);
    progress = Math.max(0, Math.min(1, progress));
    
    // Interpolate opacity for each line sequencially (riga per riga)
    const N = lines.length;
    lines.forEach((line, index) => {
      // Define a staggered start and end range for each line span
      const startFraction = index * (0.85 / N);
      const endFraction = (index + 1) * (0.85 / N);
      
      let lineProgress = (progress - startFraction) / (endFraction - startFraction);
      lineProgress = Math.max(0, Math.min(1, lineProgress));
      
      // Interpolate opacity from 10% (0.1) to 100% (1.0)
      const opacity = 0.1 + (lineProgress * 0.9);
      line.style.opacity = opacity;
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  // Trigger once on init
  handleScroll();
}

/**
 * Infinite looping word rotation for the Hero section text "Bold".
 * Alternates between "Bold", "Autonomous", "Invisible", "Biomimetric" every 3 seconds.
 */
function initHeroWordChanger() {
  const wordSpan = document.querySelector('.hero__headline--bold');
  if (!wordSpan) return;
  
  const words = ['Bold', 'Autonomous', 'Invisible', 'Biomimetric'];
  let currentIndex = 0;
  
  // Initial slide-in animation
  setTimeout(() => {
    wordSpan.classList.add('is-visible');
  }, 400);
  
  const changeWord = () => {
    // 1. Trigger fast fade-out animation
    wordSpan.classList.remove('is-visible');
    
    // 2. Wait for fade-out to finish, change text, and fade-in the new word
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % words.length;
      wordSpan.textContent = words[currentIndex];
      
      // Force reflow to re-trigger transition
      void wordSpan.offsetWidth;
      
      // 3. Trigger slow premium fade-in animation
      wordSpan.classList.add('is-visible');
    }, 600); // matches the CSS fade-out transition duration
  };
  
  // Repeat cycle every 3.6s (3s display + 0.6s transition)
  setInterval(changeWord, 3600);
}

/**
 * Scroll-driven unmasking clip-reveal for all project frames (inspired by Tendril Studio).
 * Dynamically expands the visible container height from top to bottom (via clip-path)
 * and scales/translates the inner image proportionally to the scroll progress.
 */
function initProjectRevealScroll() {
  const frames = document.querySelectorAll('.project-reveal-frame');
  if (!frames.length) return;
  
  const handleScroll = () => {
    frames.forEach(frame => {
      const rect = frame.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate progress if the frame is in or approaching viewport
      if (rect.top < viewportHeight && rect.bottom > 0) {
        // Start revealing when the top of the frame enters viewport (rect.top = viewportHeight)
        // Reach 100% reveal when the top of the frame reaches 30% of viewport height
        const startScroll = viewportHeight;
        const endScroll = viewportHeight * 0.3;
        
        let progress = (startScroll - rect.top) / (startScroll - endScroll);
        progress = Math.max(0, Math.min(1, progress));
        
        // Calculate clip percentage from 100% (hidden) to 0% (fully visible)
        const clipPercent = 100 - (progress * 100);
        
        const inner = frame.querySelector('.project-reveal-inner');
        if (inner) {
          inner.style.clipPath = `inset(0% 0% ${clipPercent}% 0% round 8px)`;
          
          const image = inner.querySelector('.project-image-reveal');
          if (image) {
            // Smooth zoom out from 1.35 to 1.00 and subtle slide down parallax translation
            const scale = 1.35 - (progress * 0.35);
            const translateY = (1 - progress) * 30;
            image.style.transform = `translateY(${translateY}px) scale(${scale})`;
          }
        }
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  // Run once on load
  handleScroll();
}

/**
 * Interactive Canvas Dot Grid Background
 * Spacing is 168px (tripled from 56px).
 * Dots are responsive to mouse movement with magnetic push and brightness highlight.
 * Real-time coordinates update even during scroll movements for high-fidelity response.
 */
function initInteractiveGrid() {
  const canvas = document.getElementById('work-grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const workSection = document.getElementById('work');
  if (!workSection) return;
  
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  let mouseX = -1000;
  let mouseY = -1000;
  let targetMouseX = -1000;
  let targetMouseY = -1000;
  
  window.addEventListener('mousemove', (e) => {
    // Screen coordinates mapping 1:1 to position: fixed canvas
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    targetMouseX = -1000;
    targetMouseY = -1000;
  });
  
  const spacing = 112;
  const hoverRadius = 120;
  
  function animate() {
    // Smooth physical inertia
    if (targetMouseX === -1000) {
      mouseX += (-1000 - mouseX) * 0.08;
      mouseY += (-1000 - mouseY) * 0.08;
    } else {
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;
    }
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);
    
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    
    const offsetX = (width % spacing) / 2;
    const offsetY = (height % spacing) / 2;
    
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const baseX = c * spacing + offsetX;
        const baseY = r * spacing + offsetY;
        
        const dx = baseX - mouseX;
        const dy = baseY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let drawX = baseX;
        let drawY = baseY;
        let radius = 1.2;
        
        if (dist < hoverRadius) {
          const force = (hoverRadius - dist) / hoverRadius; // 0 to 1
          
          // Magnetic push away from cursor (subtle push)
          const angle = Math.atan2(dy, dx);
          const pushDist = force * 6; 
          drawX = baseX + Math.cos(angle) * pushDist;
          drawY = baseY + Math.sin(angle) * pushDist;
          
          // Scale adjustment (subtle growth)
          radius = 1.2 + force * 1.0; // Grows up to 2.2px
        }
        
        // Draw rotated square (45-degree diamond)
        ctx.beginPath();
        ctx.moveTo(drawX, drawY - radius); // Top point
        ctx.lineTo(drawX + radius, drawY); // Right point
        ctx.lineTo(drawX, drawY + radius); // Bottom point
        ctx.lineTo(drawX - radius, drawY); // Left point
        ctx.closePath();
        ctx.fillStyle = "#000000";
        ctx.fill();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

/**
 * Tracks mouse coordinates over the entire contact section container to align a custom CSS property
 * for a radial LED backlight glow spotlight behind the cursor.
 */
function initContactSpotlight() {
  const contactSection = document.querySelector('.contact-section');
  if (!contactSection) return;
  
  contactSection.addEventListener('mousemove', (e) => {
    const rect = contactSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    contactSection.style.setProperty('--mouse-x', `${x}px`);
    contactSection.style.setProperty('--mouse-y', `${y}px`);
  });
}

/**
 * Dynamically calculates the height of the fixed footer and applies it as a margin-bottom
 * to the main-content wrapper, creating a premium cross-browser reveal parallax unmasking effect.
 */
function initFooterReveal() {
  const footer = document.querySelector('.contact-section');
  const mainContent = document.querySelector('.main-content');
  const contactContainer = document.querySelector('.contact-container');
  if (!footer || !mainContent) return;
  
  const handleScroll = () => {
    const footerHeight = footer.offsetHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = scrollHeight - viewportHeight;
    const currentScroll = window.scrollY;
    
    // The reveal starts when the scroll position passes the start boundary
    const startScroll = maxScroll - footerHeight;
    
    if (footerHeight <= 0 || maxScroll <= 0) return;
    
    let progress = 0;
    if (currentScroll >= maxScroll) {
      progress = 1;
    } else if (currentScroll <= startScroll) {
      progress = 0;
    } else {
      progress = (currentScroll - startScroll) / footerHeight;
    }
    
    // Smooth settling animation: starts at scale(1.06) and translateY(-35px) when covered,
    // and settles smoothly to scale(1.00) and translateY(0px) when fully revealed.
    const scale = 1.06 - (0.06 * progress);
    const translateY = -35 * (1 - progress);
    
    if (contactContainer) {
      contactContainer.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    }
  };
  
  const updateMargin = () => {
    const footerHeight = footer.offsetHeight;
    mainContent.style.marginBottom = `${footerHeight}px`;
    handleScroll();
  };
  
  window.addEventListener('resize', updateMargin);
  window.addEventListener('load', updateMargin);
  window.addEventListener('scroll', handleScroll);
  
  // Use MutationObserver to track elements rendering asynchronously
  const observer = new MutationObserver(updateMargin);
  observer.observe(footer, { attributes: true, childList: true, subtree: true });
  
  // Initial compute
  updateMargin();
}

