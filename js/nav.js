/**
 * NavigationController
 * Manages the fixed top nav: scroll behaviour, hamburger toggle, and smooth scrolling.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

const NavigationController = {
  nav:       null,
  hamburger: null,
  navLinks:  null,

  init() {
    this.nav       = document.getElementById('main-nav');
    this.hamburger = document.getElementById('hamburger');
    this.navLinks  = document.getElementById('nav-links');

    if (!this.nav || !this.hamburger || !this.navLinks) return;

    // Scroll listener — darken nav background past hero
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Hamburger toggles the mobile menu
    this.hamburger.addEventListener('click', () => this.toggleMenu());

    // Intercept nav anchor clicks: animated scroll + close mobile menu
    const links = {
      'cta-start-nav':     'workout',
      'cta-play':          'music',
      'cta-motivated-nav': 'quotes',
    };

    Object.entries(links).forEach(([id, sectionId]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.smoothScrollTo(sectionId, 500);
        this.closeMenu();
      });
    });
  },

  onScroll() {
    const hero = document.getElementById('hero');
    const threshold = hero ? hero.offsetHeight : window.innerHeight;
    this.nav.classList.toggle('scrolled', window.scrollY > threshold);
  },

  /**
   * Toggle mobile nav by adding/removing 'nav-open'.
   * The CSS in <head> handles display:none / display:flex based on this class.
   * Requirement 7.5
   */
  toggleMenu() {
    const isOpen = this.navLinks.classList.toggle('nav-open');
    this.hamburger.setAttribute('aria-expanded', String(isOpen));
  },

  closeMenu() {
    if (window.innerWidth < 1024) {
      this.navLinks.classList.remove('nav-open');
      this.hamburger.setAttribute('aria-expanded', 'false');
    }
  },

  /**
   * rAF-based smooth scroll with ease-in-out cubic.
   * Duration clamped to 400–700 ms. Requirement 7.3
   */
  smoothScrollTo(sectionId, durationMs) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const duration = Math.min(700, Math.max(400, durationMs));
    const startY   = window.scrollY;
    const endY     = target.getBoundingClientRect().top + window.scrollY - this.nav.offsetHeight;
    const delta    = endY - startY;
    let   startTime = null;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      window.scrollTo(0, startY + delta * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  },
};
