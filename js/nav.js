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

  /** Attach all listeners and wire CTA anchor links. */
  init() {
    this.nav       = document.getElementById('main-nav');
    this.hamburger = document.getElementById('hamburger');
    this.navLinks  = document.getElementById('nav-links');

    if (!this.nav || !this.hamburger || !this.navLinks) return;

    // Scroll listener — add/remove 'scrolled' class
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Hamburger toggle
    this.hamburger.addEventListener('click', () => this.toggleMenu());

    // Intercept anchor clicks for animated smooth scroll + menu close
    const ctaStart     = document.getElementById('cta-start-nav');
    const ctaPlay      = document.getElementById('cta-play');
    const ctaMotivated = document.getElementById('cta-motivated-nav');

    if (ctaStart) {
      ctaStart.addEventListener('click', (e) => {
        e.preventDefault();
        this.smoothScrollTo('workout', 500);
        this.closeMenu();
      });
    }

    if (ctaPlay) {
      ctaPlay.addEventListener('click', (e) => {
        e.preventDefault();
        // Expand the Spotify widget if it isn't already open
        var player    = document.getElementById('spotify-player');
        var iconOpen  = document.getElementById('spotify-icon-open');
        var iconClose = document.getElementById('spotify-icon-close');
        var toggle    = document.getElementById('spotify-toggle');
        if (player && player.classList.contains('spotify-collapsed')) {
          player.classList.remove('spotify-collapsed');
          if (iconOpen)  iconOpen.style.display  = 'none';
          if (iconClose) iconClose.style.display = 'block';
          if (toggle) {
            toggle.title = 'Close Spotify';
            toggle.setAttribute('aria-label', 'Close Spotify player');
          }
          // Keep the JS toggle state in sync
          if (typeof spotifyExpanded !== 'undefined') spotifyExpanded = true;
        }
        // Scroll to the bottom-right widget area (spotify-section is fixed, so
        // scroll to the music section as a visual cue instead)
        this.smoothScrollTo('music', 500);
        this.closeMenu();
      });
    }

    if (ctaMotivated) {
      ctaMotivated.addEventListener('click', (e) => {
        e.preventDefault();
        this.smoothScrollTo('quotes', 500);
        this.closeMenu();
      });
    }
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
   * Toggle the mobile nav menu using the 'nav-open' class.
   * Avoids fighting Tailwind's 'hidden' / 'lg:flex' utilities.
   * Requirement 7.5
   */
  toggleMenu() {
    const isOpen = this.navLinks.classList.toggle('nav-open');
    this.hamburger.setAttribute('aria-expanded', String(isOpen));
  },

  /** Close the mobile menu if it is open. */
  closeMenu() {
    if (window.innerWidth < 1024 && this.navLinks.classList.contains('nav-open')) {
      this.navLinks.classList.remove('nav-open');
      this.hamburger.setAttribute('aria-expanded', 'false');
    }
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

    const duration = Math.min(700, Math.max(400, durationMs));
    const startY   = window.scrollY;
    const endY     = target.getBoundingClientRect().top + window.scrollY - this.nav.offsetHeight;
    const delta    = endY - startY;
    let startTime  = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + delta * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  },
};
