/**
 * NavigationController
 * Manages the fixed top nav: scroll behaviour, hamburger toggle, and smooth scrolling.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

const NavigationController = {
  /** @type {HTMLElement} */
  nav: null,
  /** @type {HTMLButtonElement} */
  hamburger: null,
  /** @type {HTMLUListElement} */
  navLinks: null,

  /** Attach all listeners and wire CTA buttons. */
  init() {
    this.nav       = document.getElementById('main-nav');
    this.hamburger = document.getElementById('hamburger');
    this.navLinks  = document.getElementById('nav-links');

    if (!this.nav || !this.hamburger || !this.navLinks) return;

    // Scroll listener — add/remove 'scrolled' class
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Hamburger toggle
    this.hamburger.addEventListener('click', () => this.toggleMenu());

    // CTA nav buttons → smooth scroll
    const ctaStart     = document.getElementById('cta-start-nav');
    const ctaPlay      = document.getElementById('cta-play');
    const ctaMotivated = document.getElementById('cta-motivated-nav');

    if (ctaStart)     ctaStart.addEventListener('click',     () => this.smoothScrollTo('workout', 500));
    if (ctaPlay)      ctaPlay.addEventListener('click',      () => this.smoothScrollTo('music',   500));
    if (ctaMotivated) ctaMotivated.addEventListener('click', () => this.smoothScrollTo('quotes',  500));
  },

  /**
   * Add 'scrolled' class to <nav> when the page has scrolled past the hero section.
   * Requirement 7.2
   */
  onScroll() {
    const hero = document.getElementById('hero');
    const threshold = hero ? hero.offsetHeight : window.innerHeight;
    if (window.scrollY > threshold) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
  },

  /**
   * Toggle the mobile nav menu by toggling the 'hidden' class on #nav-links.
   * Requirement 7.5
   */
  toggleMenu() {
    const isHidden = this.navLinks.classList.toggle('hidden');
    this.hamburger.setAttribute('aria-expanded', String(!isHidden));
  },

  /**
   * Smoothly scroll to a section by ID.
   * @param {string} sectionId  - The id of the target section element.
   * @param {number} durationMs - Scroll duration in ms (400–700).
   * Requirement 7.3
   */
  smoothScrollTo(sectionId, durationMs) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    // Clamp duration to the allowed range
    const duration = Math.min(700, Math.max(400, durationMs));

    const startY = window.scrollY;
    const endY   = target.getBoundingClientRect().top + window.scrollY - this.nav.offsetHeight;
    const delta  = endY - startY;
    let startTime = null;

    /**
     * Ease-in-out cubic easing.
     * @param {number} t - Progress 0–1.
     * @returns {number}
     */
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + delta * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);

    // Close mobile menu after navigating
    if (!this.navLinks.classList.contains('hidden') &&
        window.innerWidth < 1024) {
      this.toggleMenu();
    }
  },
};
