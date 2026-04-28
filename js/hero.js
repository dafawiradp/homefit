/**
 * HeroSection
 * Triggers the fade-in entrance animation and wires the "Start Workout" CTA.
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

const HeroSection = {
  /** Add 'visible' class to #hero on DOMContentLoaded to trigger CSS fade-in. */
  init() {
    const hero = document.getElementById('hero');

    // Trigger entrance animation
    if (hero) {
      hero.classList.add('visible');
    }

    // Note: #cta-start click handling (scroll + workout start) is owned by
    // WorkoutSessionController.init() to avoid duplicate scroll calls.
  },
};
