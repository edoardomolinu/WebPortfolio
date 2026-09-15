
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initScrollReveal();
  setupDynamicHeader();
  initHeroFadeScroll();
  initAboutFadeScroll();
  initHeroWordChanger();
  initWorksSplitScroll();
  initInteractiveGrid();
  initContactSpotlight();
  initFooterReveal();
  initSmoothScroll();
});

/**
 * Lenis Smooth Scroll Initialization
 * Delivers editorial momentum and buttery smooth inertia across modern browsers.
 */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
    infinite: false,
  });

  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

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

  // Quick 0% to 100% opacity reveal for text elements when clear of bottom edge
  const textElements = document.querySelectorAll('.text-fade-reveal');
  const textObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -20px 0px',
    threshold: 0.85
  });

  textElements.forEach(el => textObserver.observe(el));

  // Top-to-Bottom Fluid Image Mask Reveal when element arrives in position
  const imageElements = document.querySelectorAll('.img-reveal-top-down');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -25% 0px', // Triggers when container is 25% clear in position on screen
    threshold: 0
  });

  imageElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.5) {
      el.classList.add('visible');
    } else {
      imageObserver.observe(el);
    }
  });
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
 * Minimal Header transition logic on scroll.
 * Hides header on scroll down, reveals on scroll up.
 * Reappears automatically at the bottom of the page strictly on the Homepage.
 */
function setupDynamicHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  const isHomePage = !document.body.classList.contains('project-page');
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(0, scrollHeight - viewportHeight);
    
    // Detect if user has reached the bottom of the page (within 10px tolerance for inertia)
    const isAtBottom = maxScroll > 0 && currentScrollY >= maxScroll - 10;
    
    // Add/remove shrink class
    if (currentScrollY > 50) {
      header.classList.add('header--shrunk');
    } else {
      header.classList.remove('header--shrunk');
    }
    
    // Header visibility rules:
    // 1. On homepage ONLY: if at the absolute bottom of the page, header MUST reappear.
    // 2. Otherwise (on project pages or during normal downward scroll): hide header on scroll down past 100px.
    // 3. If scrolling up, reveal header.
    if (isHomePage && isAtBottom) {
      header.classList.remove('header--hidden');
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add('header--hidden');
    } else {
      header.classList.remove('header--hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateHeader();
  });

  // Initial call
  updateHeader();
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
 * Split Scroll-driven Interaction for Work Section:
 * Left column images scroll naturally with page scroll.
 * Right column sticky text smoothly cross-fades (evanescence) based on real geometric collision points:
 * - Transition begins when the bottom edge of image i meets the bottom edge of description i.
 * - Transition completes when the top edge of image i+1 meets the top edge of title i+1.
 */
function initWorksSplitScroll() {
  const visualFrames = document.querySelectorAll('.work-visual-frame');
  const infoSlides = document.querySelectorAll('.work-info-slide');
  const stage = document.querySelector('.work-info-content-stage');
  const workSection = document.querySelector('.work-section');
  if (!visualFrames.length || !infoSlides.length || !stage) return;

  const N = visualFrames.length;
  let ticking = false;

  const updateFrameAlignment = () => {
    const firstFrame = visualFrames[0];
    const lastFrame = visualFrames[N - 1];
    const lastSlide = infoSlides[N - 1];
    if (!firstFrame || !workSection) return;

    const frameHeight = firstFrame.offsetHeight;
    const topOffset = Math.max(0, (window.innerHeight - frameHeight) / 2);
    workSection.style.setProperty('--work-frame-top', `${topOffset}px`);

    if (lastFrame && lastSlide) {
      const lastVisualItem = lastFrame.closest('.work-visual-item');
      if (lastVisualItem) {
        // Exact space needed so the last project (Climbex) can glide all the way to centerTop
        const scrollNeeded = Math.max(0, topOffset);
        lastVisualItem.style.paddingBottom = `${scrollNeeded}px`;
      }
    }

    if (window.lenis) {
      window.lenis.resize();
    }
  };

  const applySlideStyles = (idx, opacity, translateY, scale, blur) => {
    const slide = infoSlides[idx];
    if (!slide) return;
    slide.style.opacity = opacity.toFixed(3);
    slide.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
    slide.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    if (opacity > 0.02) {
      slide.style.visibility = 'visible';
      slide.style.pointerEvents = opacity > 0.45 ? 'auto' : 'none';
      if (opacity > 0.45) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    } else {
      slide.style.visibility = 'hidden';
      slide.style.pointerEvents = 'none';
      slide.classList.remove('is-active');
    }
  };

  const applyFrameStyles = (idx, opacity) => {
    const frame = visualFrames[idx];
    if (!frame) return;
    frame.style.opacity = opacity.toFixed(3);
    frame.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
  };

  const updateCrossfade = () => {
    const stageRect = stage.getBoundingClientRect();
    const titleTop = stageRect.top;

    let transitionFound = false;

    for (let i = 0; i < N - 1; i++) {
      const frameA = visualFrames[i];
      const frameB = visualFrames[i + 1];
      if (!frameA || !frameB) continue;

      const rectA = frameA.getBoundingClientRect();
      const rectB = frameB.getBoundingClientRect();

      const descA = infoSlides[i].querySelector('.work-info-desc');
      const descBottomA = stageRect.top + (descA ? (descA.offsetTop + descA.offsetHeight) : infoSlides[i].offsetHeight);

      const gapAB = rectB.top - rectA.bottom;
      const yStart = descBottomA + gapAB;
      const yEnd = titleTop;

      if (rectB.top > yStart) {
        // Transition i -> i+1 has not started yet; Project i is fully active
        for (let k = 0; k < i; k++) {
          applySlideStyles(k, 0, -12, 0.98, 12);
          applyFrameStyles(k, 0);
        }
        applySlideStyles(i, 1, 0, 1, 0);
        applyFrameStyles(i, 1);
        for (let k = i + 1; k < N; k++) {
          applySlideStyles(k, 0, 12, 0.98, 12);
          applyFrameStyles(k, 1);
        }
        transitionFound = true;
        break;
      } else if (rectB.top <= yStart && rectB.top >= yEnd) {
        // We are within transition i -> i+1: lockstep cross-fade for both text and image
        const rawT = (yStart - rectB.top) / (yStart - yEnd);
        const t = Math.max(0, Math.min(1, rawT));
        const fade = t * t * (3 - 2 * t); // smoothstep curve

        for (let k = 0; k < i; k++) {
          applySlideStyles(k, 0, -12, 0.98, 12);
          applyFrameStyles(k, 0);
        }
        // Project i (outgoing): fades smoothly from 1.0 -> 0.0
        applySlideStyles(i, 1 - fade, -12 * fade, 1 - 0.02 * fade, 12 * fade);
        applyFrameStyles(i, 1 - fade);

        // Project i+1 (incoming): text fades 0.0 -> 1.0, image stays fully visible
        applySlideStyles(i + 1, fade, 12 * (1 - fade), 0.98 + 0.02 * fade, 12 * (1 - fade));
        applyFrameStyles(i + 1, 1);

        for (let k = i + 2; k < N; k++) {
          applySlideStyles(k, 0, 12, 0.98, 12);
          applyFrameStyles(k, 1);
        }

        transitionFound = true;
        break;
      }
    }

    if (!transitionFound) {
      // Past all transitions: last project is fully active
      for (let k = 0; k < N - 1; k++) {
        applySlideStyles(k, 0, -12, 0.98, 12);
        applyFrameStyles(k, 0);
      }
      applySlideStyles(N - 1, 1, 0, 1, 0);

      // Last frame (Climbex): stays 1.0 until contact section reveal starts
      const footer = document.querySelector('.contact-section');
      if (footer) {
        const footerHeight = footer.offsetHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScroll = scrollHeight - viewportHeight;
        const currentScroll = window.scrollY;
        const startScroll = maxScroll - footerHeight;

        if (currentScroll > startScroll && footerHeight > 0) {
          const rawProgress = (currentScroll - startScroll) / footerHeight;
          const progress = Math.max(0, Math.min(1, rawProgress));
          const fade = progress * progress * (3 - 2 * progress);
          applyFrameStyles(N - 1, 1 - fade);
        } else {
          applyFrameStyles(N - 1, 1);
        }
      } else {
        applyFrameStyles(N - 1, 1);
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateCrossfade();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    updateFrameAlignment();
    onScroll();
  });
  window.addEventListener('load', () => {
    updateFrameAlignment();
    onScroll();
  });
  // Initial compute
  updateFrameAlignment();
  updateCrossfade();
}

/**
 * Static Canvas Dot Grid Background for Work section.
 * Spacing is 119px (reduced by 20% from 149px).
 * Displays a clean, static grid of 45-degree rotated squares without animation or interactive hover physics.
 */
function initInteractiveGrid() {
  const canvas = document.getElementById('work-grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const workSection = document.getElementById('work') || document.querySelector('.pd-next-project-section');
  if (!workSection) return;
  
  const spacing = 119; // Reduced spacing by 20% (149 * 0.8 = 119.2)
  const radius = 1.8;  // Base size of 45-degree diamond square

  function drawGrid() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    
    const offsetX = (width % spacing) / 2;
    const offsetY = (height % spacing) / 2;
    
    ctx.fillStyle = "#000000";

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const drawX = c * spacing + offsetX;
        const drawY = r * spacing + offsetY;
        
        // Draw static 45-degree rotated square (diamond)
        ctx.beginPath();
        ctx.moveTo(drawX, drawY - radius); // Top point
        ctx.lineTo(drawX + radius, drawY); // Right point
        ctx.lineTo(drawX, drawY + radius); // Bottom point
        ctx.lineTo(drawX - radius, drawY); // Left point
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  
  window.addEventListener('resize', drawGrid);
  drawGrid();
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
  if (!footer || !mainContent || !contactContainer) return;
  
  let ticking = false;
  let cachedFooterHeight = 0;

  const updateFooterEffect = () => {
    const footerHeight = cachedFooterHeight || footer.offsetHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = scrollHeight - viewportHeight;
    const currentScroll = window.scrollY;
    
    // The reveal starts when the scroll position passes the start boundary
    const startScroll = maxScroll - footerHeight;
    
    if (footerHeight <= 0 || maxScroll <= 0) {
      ticking = false;
      return;
    }
    
    let progress = 0;
    if (currentScroll >= maxScroll - 2) {
      progress = 1;
    } else if (currentScroll <= startScroll) {
      progress = 0;
    } else {
      progress = (currentScroll - startScroll) / footerHeight;
    }
    
    // Smooth cinematic fade/blur curve matching Works section
    const t = Math.max(0, Math.min(1, progress));
    const fade = t * t * (3 - 2 * t); // smoothstep
    
    const opacity = fade;
    const blur = 8 * (1 - fade);
    const translateY = 16 * (1 - fade);
    const scale = 0.98 + (0.02 * fade);

    contactContainer.style.opacity = opacity.toFixed(3);
    contactContainer.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
    contactContainer.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;

    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateFooterEffect);
      ticking = true;
    }
  };
  
  const updateMargin = () => {
    const footerHeight = footer.offsetHeight;
    if (Math.abs(cachedFooterHeight - footerHeight) > 1 || !mainContent.style.marginBottom) {
      cachedFooterHeight = footerHeight;
      mainContent.style.marginBottom = `${footerHeight}px`;
      if (window.lenis) {
        window.lenis.resize();
      }
    }
    updateFooterEffect();
  };
  
  window.addEventListener('resize', updateMargin);
  window.addEventListener('load', updateMargin);
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // High-performance ResizeObserver only triggers when actual box dimensions change,
  // preventing layout thrashing and avoiding calling lenis.resize() during scroll or mousemove.
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.round(entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height);
        if (Math.abs(cachedFooterHeight - height) > 1) {
          cachedFooterHeight = height;
          mainContent.style.marginBottom = `${height}px`;
          if (window.lenis) {
            window.lenis.resize();
          }
        }
      }
    });
    resizeObserver.observe(footer);
  }
  
  // Initial compute
  updateMargin();
}

/**
 * Smooth navigation scroll interceptor and hash handler.
 * Seamlessly integrates with Lenis smooth scroll and native fallback.
 */
function initSmoothScroll() {
  document.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const hashIndex = href.indexOf('#');
      if (hashIndex !== -1) {
        const hash = href.substring(hashIndex);
        
        // Check if we are currently on the homepage
        const isHomePage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname === '/' || 
                           !window.location.pathname.includes('.html');
        
        if (isHomePage) {
          e.preventDefault();
          if (hash === '#contact') {
            if (window.lenis) {
              window.lenis.scrollTo(document.body.scrollHeight, { duration: 1.4 });
            } else {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
              });
            }
          } else {
            const targetElem = document.querySelector(hash);
            if (targetElem) {
              if (window.lenis) {
                window.lenis.scrollTo(targetElem, { duration: 1.2, offset: 0 });
              } else {
                targetElem.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }
          }
        }
      }
    });
  });

  // Handle page load with hash = #contact
  if (window.location.hash === '#contact') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo(document.body.scrollHeight, { duration: 1.4 });
        } else {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    });
  }
}

