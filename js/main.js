
document.addEventListener('DOMContentLoaded', () => {
  initVideoAutoplayManager();
  initLenis();
  initScrollReveal();
  setupDynamicHeader();
  initMobileMenu();
  initHeroFadeScroll();
  initWorkStickyScroll();
  initAboutFadeScroll();
  initAboutPageScroll();
  initHeroWordChanger();
  initInteractiveGrid();
  initContactSpotlight();
  initFooterReveal();
  initContactMessageChanger();
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
    rootMargin: '0px 0px -5% 0px',
    threshold: 0.15
  });

  textElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      el.classList.add('visible');
    } else {
      textObserver.observe(el);
    }
  });

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
    rootMargin: '0px 0px -15% 0px',
    threshold: 0
  });

  imageElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
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
 * Dynamic Header transition logic on scroll.
 * - Hides header on scroll down (past 60px).
 * - Reveals header on scroll up only after an intentional upward scroll buffer (20px) to prevent hysterical pop-ins.
 * - Reappears automatically at the bottom of the page (Homepage and About page).
 */
function setupDynamicHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  const isHomePage = !document.body.classList.contains('project-page') && !document.body.classList.contains('about-page');
  const isAboutPage = document.body.classList.contains('about-page');
  let lastScrollY = window.scrollY;
  let accumulatedUpScroll = 0;
  const SCROLL_UP_THRESHOLD = 20; // 20px buffer before un-hiding header on scroll up
  let ticking = false;

  const updateHeader = () => {
    // If mobile menu is open, guarantee header stays visible
    if (document.body.classList.contains('mobile-menu-open') || header.classList.contains('header--menu-open')) {
      header.classList.remove('header--hidden');
      return;
    }

    const currentScrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(0, scrollHeight - viewportHeight);
    
    // Detect if user has reached the bottom of the page (within 20px tolerance for inertia)
    const isAtBottom = maxScroll > 0 && currentScrollY >= maxScroll - 20;
    
    // Add/remove shrink class
    if (currentScrollY > 50) {
      header.classList.add('header--shrunk');
    } else {
      header.classList.remove('header--shrunk');
    }

    // Header visibility rules:
    // 1. Reappear automatically at the bottom of the page on Home and About.
    // 2. Hide on scroll down past 60px.
    // 3. Reveal on intentional scroll up (after exceeding the buffer threshold) or when near top.
    if ((isHomePage || isAboutPage) && isAtBottom) {
      header.classList.remove('header--hidden');
      accumulatedUpScroll = 0;
    } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
      // Scrolling down
      header.classList.add('header--hidden');
      accumulatedUpScroll = 0;
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up: accumulate upward delta
      accumulatedUpScroll += (lastScrollY - currentScrollY);
      if (currentScrollY <= 60 || accumulatedUpScroll >= SCROLL_UP_THRESHOLD) {
        header.classList.remove('header--hidden');
      }
    } else if (currentScrollY <= 60) {
      header.classList.remove('header--hidden');
      accumulatedUpScroll = 0;
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
 * Mobile Hamburger Navigation Menu Controller
 * Manages mobile drawer state, two-line to X transformation, white opacity veil, and smooth navigation.
 */
function initMobileMenu() {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__nav .header__link');
  
  if (!header || !burger || !nav) return;

  const openMenu = () => {
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    header.classList.add('header--menu-open');
    header.classList.remove('header--hidden');
    nav.classList.add('is-open');
    document.body.classList.add('mobile-menu-open');
    if (window.lenis) {
      window.lenis.stop();
    }
  };

  const closeMenu = () => {
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    header.classList.remove('header--menu-open');
    nav.classList.remove('is-open');
    document.body.classList.remove('mobile-menu-open');
    if (window.lenis) {
      window.lenis.start();
    }
  };

  const toggleMenu = () => {
    const isOpen = burger.classList.contains('is-active');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking any navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('mobile-menu-open')) {
        closeMenu();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
      closeMenu();
    }
  });

  // Automatically reset menu if viewport is resized to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && document.body.classList.contains('mobile-menu-open')) {
      closeMenu();
    }
  });
}

/**
 * Immersive sticky hero scroll effect.
 * Keeps the video pinned full-screen while gradually transitioning
 * the hero overlay opacity to 1.0 (pure FFFFFF) proportionally to scroll.
 * Only once the fade is 100% complete does the page scroll into the profile/about section.
 */
function initHeroFadeScroll() {
  const pinWrapper = document.querySelector('.hero-pin-wrapper');
  const fadeOverlay = document.querySelector('.hero__fade-overlay');
  const heroContent = document.querySelector('.hero__content-container');
  const workHeader = document.querySelector('.work-sticky-header');
  const workTitle = document.querySelector('.work-sticky-title');
  const lastProject = document.querySelector('#project-04') || document.querySelector('.work-project-row:last-of-type');
  if (!fadeOverlay) return;

  let workHeaderDefaultTop = 0;
  const measureDefaultTop = () => {
    if (!workHeader) return;
    const currentInline = workHeader.style.top;
    workHeader.style.top = '';
    workHeaderDefaultTop = workHeader.getBoundingClientRect().top;
    workHeader.style.top = currentInline;
  };
  
  const updateHeroFade = () => {
    if (window.innerWidth <= 768) {
      if (fadeOverlay) fadeOverlay.style.opacity = '0';
      return;
    }
    let progress = 0;
    if (pinWrapper) {
      const rect = pinWrapper.getBoundingClientRect();
      const totalScrollableDistance = pinWrapper.offsetHeight - window.innerHeight;
      if (totalScrollableDistance > 0) {
        // Scrolled distance within the pinning container
        const scrolled = -rect.top;
        progress = Math.max(0, Math.min(1, scrolled / totalScrollableDistance));
      }
    } else {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      progress = Math.max(0, Math.min(1, scrollY / (heroHeight * 0.8)));
    }
    
    // Smoothly reach 100% pure white before unpinning to guarantee seamless handoff
    const overlayOpacity = Math.min(1, progress / 0.92);
    fadeOverlay.style.opacity = overlayOpacity;
    
    // Fade out hero text
    if (heroContent) {
      heroContent.style.opacity = Math.max(0, 1 - progress * 1.5);
    }

    // Trigger reveal of fixed "Work" title directly on the spot (at 70% of video trailer fade-out) on desktop
    if (workTitle && window.innerWidth > 768) {
      if (overlayOpacity >= 0.70) {
        workTitle.classList.add('is-visible');
      } else {
        workTitle.classList.remove('is-visible');
      }
    }

    // When the top margin of Climbex reaches the top of "Work",
    // Work pins to Climbex and travels upward out of the screen on desktop.
    if (workHeader && lastProject && window.innerWidth > 768) {
      const lastRect = lastProject.getBoundingClientRect();
      if (workHeaderDefaultTop === 0) {
        measureDefaultTop();
      }
      if (lastRect.top <= workHeaderDefaultTop) {
        workHeader.style.top = `${lastRect.top}px`;
      } else {
        workHeader.style.top = '';
      }
    }
  };

  window.addEventListener('scroll', updateHeroFade, { passive: true });
  window.addEventListener('resize', () => {
    measureDefaultTop();
    updateHeroFade();
  }, { passive: true });
  window.addEventListener('load', () => {
    measureDefaultTop();
    updateHeroFade();
  });
  measureDefaultTop();
  updateHeroFade();
}

/**
 * Scroll-driven pinning for project text boxes in the Work section:
 * - Entering: text top aligns with project image top.
 * - Pins text when its bottom reaches the target reading baseline (the bottom edge of the image when image midline is at 50vh).
 * - As the image continues scrolling up and its bottom reaches the bottom of the sticky text box, the row pushes the text up synchronously.
 */
function initWorkStickyScroll() {
  const rows = document.querySelectorAll('.work-project-row');
  if (!rows.length) return;

  const updateStickyPositions = () => {
    const vh = window.innerHeight;
    rows.forEach(row => {
      const visualCol = row.querySelector('.work-visual-col');
      const infoContent = row.querySelector('.work-info-content');
      if (!visualCol || !infoContent) return;

      const imgHeight = visualCol.offsetHeight;
      const textHeight = infoContent.offsetHeight;

      if (imgHeight > 0 && textHeight > 0) {
        // Target baseline: bottom edge of image when image midline is at 50vh (vh / 2 + imgHeight / 2)
        const targetBaseline = (vh / 2) + (imgHeight / 2);
        const stickyTop = Math.round(targetBaseline - textHeight);
        infoContent.style.top = `${stickyTop}px`;

        // Irreversible bottom lock: Only trigger when the project has actively entered
        // and scrolled past its sticky point, and its bottom has reached or passed the target baseline.
        if (!row.classList.contains('is-bottom-locked')) {
          const visualRect = visualCol.getBoundingClientRect();
          const hasPassedStickyPoint = visualRect.top <= stickyTop;
          const hasReachedBottom = visualRect.bottom > 0 && visualRect.bottom <= targetBaseline;
          
          if (hasPassedStickyPoint && hasReachedBottom) {
            row.classList.add('is-bottom-locked');
          }
        }
      }
    });
  };

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      updateStickyPositions();
    });
    rows.forEach(row => ro.observe(row));
  }

  window.addEventListener('scroll', updateStickyPositions, { passive: true });
  window.addEventListener('resize', updateStickyPositions, { passive: true });
  window.addEventListener('load', updateStickyPositions);
  updateStickyPositions();
}

/**
 * Scroll-driven fade reveal for centered profile text blocks.
 * Gradually transitions opacity of each line from 10% to 100% sequentially as the section enters the screen.
 */
function initAboutFadeScroll() {
  const profileSections = document.querySelectorAll('.profile-section, .about-reflection-section, .work-intro-wrap');
  if (!profileSections.length) return;
  
  const handleScroll = () => {
    profileSections.forEach(profileSection => {
      const lines = profileSection.querySelectorAll('.profile-scroll-line');
      if (!lines.length) return;
      
      const rect = profileSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Start fading when top of the section enters the reading zone earlier (65vh):
      const startScroll = viewportHeight * 0.65;
      const endScroll = viewportHeight * 0.30;
      
      let progress = (startScroll - rect.top) / (startScroll - endScroll);
      progress = Math.max(0, Math.min(1, progress));
      
      // Interpolate opacity for each line sequentially
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
    });
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Dedicated About Page Scroll-driven Pin Animation:
 * - Phase 1 (p: 0.0 -> 0.18): "Hello! I am \n Edoardo Molinu" moves from center to top-right; photo rises to center-left (50vh); Bio text rises to align with photo bottom.
 * - Phase 2 (p: 0.18 -> 1.00): Photo remains firmly locked at 50vh center while the right text column
 *   scrolls upwards until the bottom of the last item ("Softwares") touches the bottom of the photo.
 * - Once progress reaches 1.00, the pinned container smoothly unpins, and the photo + softwares scroll UP in unison with normal page scroll.
 */
function initAboutPageScroll() {
  const pinWrapper = document.querySelector('.about-pin-wrapper');
  const photoWrapper = document.querySelector('.about-photo-wrapper');
  const textContent = document.querySelector('.about-text-content');
  const textIntro = document.querySelector('.about-text-intro');
  const textName = document.querySelector('.about-text-name');
  const streamContent = document.querySelector('.about-scroll-stream-content');
  const bioBlock = document.querySelector('.about-stream-bio');
  const softwareBlock = document.querySelector('.about-stream-software');
  if (!pinWrapper || !photoWrapper || !textContent || !textName) return;

  const updateDimensions = () => {
    const stage = document.querySelector('.about-hero-stage');
    const photoImg = document.querySelector('.about-photo-img');
    if (stage) {
      if (photoImg) {
        const h = photoImg.offsetHeight || photoWrapper.offsetHeight;
        if (h > 0) {
          stage.style.setProperty('--about-photo-height', `${h}px`);
        }
      }
      if (bioBlock) {
        const bioH = bioBlock.offsetHeight;
        if (bioH > 0) {
          stage.style.setProperty('--about-bio-height', `${bioH}px`);
        }
      }
    }
  };

  const getRelativeOffsetTop = (elem, ancestor) => {
    let top = 0;
    let curr = elem;
    while (curr && curr !== ancestor) {
      top += curr.offsetTop;
      curr = curr.offsetParent;
    }
    return top;
  };

  const updateAboutAnimation = () => {
    const windowWidth = window.innerWidth;
    const isMobile = windowWidth <= 768;

    if (isMobile) {
      photoWrapper.style.transform = '';
      photoWrapper.style.opacity = '';
      textContent.style.transform = '';
      textContent.style.opacity = '';
      if (textIntro) textIntro.style.transform = '';
      if (streamContent) {
        streamContent.style.transform = '';
        streamContent.style.opacity = '';
      }
      return;
    }

    updateDimensions();
    const rect = pinWrapper.getBoundingClientRect();
    const totalDist = pinWrapper.offsetHeight - window.innerHeight;
    let progress = 0;
    if (totalDist > 0) {
      const scrolled = -rect.top;
      progress = Math.max(0, Math.min(1, scrolled / totalDist));
    }

    const windowHeight = window.innerHeight;

    // Calculate exact scroll distance needed for bottom of software line to reach bottom of photo:
    const bioHeight = bioBlock ? bioBlock.offsetHeight : 120;
    const targetItem = softwareBlock || (streamContent ? streamContent.lastElementChild : null);
    let streamDistToAlignLastItem = 0;
    if (streamContent && bioBlock && targetItem) {
      const bioBottom = getRelativeOffsetTop(bioBlock, streamContent) + bioBlock.offsetHeight;
      const targetItemBottom = getRelativeOffsetTop(targetItem, streamContent) + targetItem.offsetHeight;
      streamDistToAlignLastItem = Math.max(0, targetItemBottom - bioBottom);
    } else if (streamContent && bioBlock) {
      const bioBottom = getRelativeOffsetTop(bioBlock, streamContent) + bioBlock.offsetHeight;
      streamDistToAlignLastItem = Math.max(0, streamContent.offsetHeight - bioBottom);
    }

    // Two-Phase Clean Timing:
    // Phase 1 (0.00 to 0.18): Intro composition docks (photo rises to 50vh, bio text rises to dock)
    // Phase 2 (0.18 to 1.00): Photo frozen at 50vh; stream scrolls up until Softwares bottom touches photo bottom at progress = 1.0
    const p1End = 0.18;

    const pIntro = Math.min(1, progress / p1End);
    const pStream = Math.max(0, Math.min(1, (progress - p1End) / (1 - p1End)));

    // Phase 2 stream translation:
    const streamY = -pStream * streamDistToAlignLastItem;
    const streamMoved = Math.abs(streamY);

    // 1. Photo Animation:
    // - In Phase 1: Rises from bottom until centered vertically at 50vh
    // - In Phase 2: Remains locked at 50vh center
    // - After Pin: Moves up together with page scroll
    const startOffsetY = (windowHeight * 0.8) + (photoWrapper.offsetHeight || 450);
    const photoIntroY = (1 - pIntro) * startOffsetY;
    const photoOpacity = Math.min(1, pIntro * 2.8);

    photoWrapper.style.transform = `translate3d(0, calc(-50% + ${photoIntroY}px), 0)`;
    photoWrapper.style.opacity = photoOpacity;

    // 2. Headline Text Animation: moves from center to top-right in Phase 1, fades out as stream scrolls in Phase 2
    const targetScale = 0.76;
    const currentScale = 1 - (pIntro * (1 - targetScale));

    const nameWidth = textName.offsetWidth;
    const introWidth = textIntro ? textIntro.offsetWidth : 0;
    const blockWidth = textContent.offsetWidth;

    const rightPadding = Math.min(Math.max(windowWidth * 0.025, 24), 40);
    const initialCenterX = windowWidth / 2;
    const initialCenterY = windowHeight / 2;
    const finalCenterX = windowWidth - rightPadding - (blockWidth * targetScale) / 2;
    const targetTopY = windowHeight * 0.34;
    const finalCenterY = targetTopY + (textContent.offsetHeight * targetScale) / 2;

    const deltaX = finalCenterX - initialCenterX;
    const deltaY = finalCenterY - initialCenterY;

    const currentX = pIntro * deltaX;
    const currentY = (pIntro * deltaY) + streamY;
    const titleOpacity = Math.max(0, 1 - (streamMoved / (windowHeight * 0.26)));

    textContent.style.transform = `translate3d(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px), 0) scale(${currentScale})`;
    textContent.style.opacity = titleOpacity;

    if (textIntro && nameWidth > introWidth) {
      const introShiftX = ((nameWidth - introWidth) / 2) * pIntro;
      textIntro.style.transform = `translate3d(${introShiftX}px, 0, 0)`;
    }

    // 3. Right Column Continuous Stream Scroll:
    if (streamContent) {
      const streamStartOffsetY = (windowHeight * 0.8) + bioHeight;
      const streamIntroOffsetY = (1 - pIntro) * streamStartOffsetY;
      const totalStreamY = streamIntroOffsetY + streamY;

      streamContent.style.transform = `translate3d(0, ${totalStreamY}px, 0)`;
      streamContent.style.opacity = Math.min(1, pIntro * 2.5);
    }
  };

  window.addEventListener('scroll', updateAboutAnimation, { passive: true });
  window.addEventListener('resize', updateAboutAnimation, { passive: true });
  updateAboutAnimation();
}

/**
 * Synchronized word rotation for the Hero section headline.
 * Locks the alternating words ("Bold", "Autonomous", "Invisible", "Biomimetic")
 * directly to the Home.mp4 duration and playback timeline.
 * Divides video duration equally by words count (4) so words transition on exact quarter-marks
 * and seamlessly restart on video loop with zero temporal drift.
 */
function initHeroWordChanger() {
  const wordSpan = document.querySelector('.hero__headline--bold');
  const video = document.querySelector('.hero__video');
  if (!wordSpan) return;

  const words = ['Bold', 'Autonomous', 'Invisible', 'Biomimetic'];
  let currentIndex = 0;
  let isTransitioning = false;

  // Initial display setup
  wordSpan.textContent = words[0];
  setTimeout(() => {
    wordSpan.classList.add('is-visible');
  }, 300);

  if (!video) return;

  const getTargetIndex = () => {
    const duration = video.duration;
    if (!duration || isNaN(duration) || duration <= 0) return 0;
    const progress = Math.max(0, Math.min(0.999, video.currentTime / duration));
    return Math.floor(progress * words.length);
  };

  const switchWord = (newIndex) => {
    if (isTransitioning || newIndex === currentIndex) return;
    isTransitioning = true;
    currentIndex = newIndex;

    // Fade out previous word
    wordSpan.classList.remove('is-visible');

    setTimeout(() => {
      wordSpan.textContent = words[newIndex];
      void wordSpan.offsetWidth; // Force reflow
      wordSpan.classList.add('is-visible');
      isTransitioning = false;
    }, 400);
  };

  const checkSync = () => {
    if (!video.paused && !video.ended) {
      const targetIndex = getTargetIndex();
      if (targetIndex !== currentIndex && !isTransitioning) {
        switchWord(targetIndex);
      }
    }
    requestAnimationFrame(checkSync);
  };

  // Immediate event listeners for video seeking / timeupdate
  video.addEventListener('seeked', () => {
    const targetIndex = getTargetIndex();
    if (targetIndex !== currentIndex) {
      switchWord(targetIndex);
    }
  });

  video.addEventListener('timeupdate', () => {
    const targetIndex = getTargetIndex();
    if (targetIndex !== currentIndex && !isTransitioning) {
      switchWord(targetIndex);
    }
  });

  requestAnimationFrame(checkSync);
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
  const isHomePage = !document.body.classList.contains('project-page') && !document.body.classList.contains('about-page');

  // Logo click behavior
  const logo = document.querySelector('.header__logo');
  if (logo) {
    logo.addEventListener('click', function(e) {
      if (isHomePage) {
        e.preventDefault();
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
      // On project pages, default browser navigation opens ./index.html
    });
  }

  // Header navigation links
  document.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const hashIndex = href.indexOf('#');
      if (hashIndex !== -1) {
        const hash = href.substring(hashIndex);
        const isLocalAnchor = href.startsWith('#');
        
        if (isHomePage || isLocalAnchor) {
          if (hash === '#contact') {
            e.preventDefault();
            if (window.lenis) {
              window.lenis.scrollTo(document.body.scrollHeight, { duration: 1.4 });
            } else {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
              });
            }
          } else if (isHomePage) {
            const targetElem = document.querySelector(hash);
            if (targetElem) {
              e.preventDefault();
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

/**
 * Rotating Message Changer for the Contact section.
 * Alternates between:
 * 1. "End of Portfolio. Start of a Conversation."
 * 2. "Beyond the pages. Let's design what's next."
 * 3. "This concludes my work. Let's start ours."
 * with a 4-second interval and cinematic Blur Reveal transition.
 */
function initContactMessageChanger() {
  const messageElements = document.querySelectorAll('.contact-message');
  if (!messageElements.length) return;

  const phrases = [
    "End of Portfolio. Start of a Conversation.",
    "Beyond the pages. Let's design what's next.",
    "This concludes my work. Let's start ours."
  ];

  let currentIndex = 0;
  let isTransitioning = false;

  const nextPhrase = () => {
    if (isTransitioning) return;
    isTransitioning = true;
    const nextIndex = (currentIndex + 1) % phrases.length;
    currentIndex = nextIndex;

    messageElements.forEach(el => el.classList.add('is-changing'));

    setTimeout(() => {
      messageElements.forEach(el => {
        el.textContent = phrases[nextIndex];
        void el.offsetWidth; // Force reflow
        el.classList.remove('is-changing');
      });
      isTransitioning = false;
    }, 400);
  };

  setInterval(nextPhrase, 4000);
}

/**
 * Cross-Device Video Autoplay & iOS Safari Resilience Manager
 * Guarantees videos play seamlessly across iOS Safari, WebKit, Low Power Mode, and Android.
 */
function initVideoAutoplayManager() {
  const videos = document.querySelectorAll('video');
  if (!videos.length) return;

  const attemptPlay = (video) => {
    // Explicitly enforce muted and playsInline properties on the DOM node for iOS WebKit
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy prevented playback (e.g. iOS Low Power Mode).
        // It will resume on first user touch, scroll, or click.
      });
    }
  };

  // Mobile-specific hero video immediate autoplay without static poster
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    const heroVideo = document.querySelector('.hero__video');
    if (heroVideo) {
      heroVideo.removeAttribute('poster');
      const tryHeroPlay = () => {
        heroVideo.muted = true;
        heroVideo.defaultMuted = true;
        heroVideo.playsInline = true;
        const p = heroVideo.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {});
        }
      };
      tryHeroPlay();
      heroVideo.addEventListener('loadedmetadata', tryHeroPlay, { once: true });
      heroVideo.addEventListener('loadeddata', tryHeroPlay, { once: true });
      heroVideo.addEventListener('canplay', tryHeroPlay, { once: true });
      window.addEventListener('pageshow', tryHeroPlay);
      [100, 300, 600, 1000].forEach(delay => setTimeout(tryHeroPlay, delay));
    }
  }

  // 1. Initial attempt on load
  videos.forEach(video => {
    attemptPlay(video);

    // If Safari pauses video unexpectedly after buffering
    video.addEventListener('suspend', () => {
      if (video.paused && !video.ended) {
        attemptPlay(video);
      }
    });
  });

  // 2. Wake up all videos upon first user interaction (touch, scroll, click)
  const wakeUpVideos = () => {
    videos.forEach(video => {
      if (video.paused) {
        attemptPlay(video);
      }
    });
  };

  window.addEventListener('touchstart', wakeUpVideos, { passive: true, once: true });
  window.addEventListener('scroll', wakeUpVideos, { passive: true, once: true });
  window.addEventListener('pointerdown', wakeUpVideos, { passive: true, once: true });
  document.addEventListener('click', wakeUpVideos, { passive: true, once: true });

  // 3. Ensure videos resume when scrolling into view
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          attemptPlay(video);
        }
      });
    }, { threshold: 0.1 });

    videos.forEach(video => videoObserver.observe(video));
  }
}


