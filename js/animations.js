/**
 * AnimationHelpers
 * Scroll-triggered section reveals and micro-interactions for buttons and cards.
 */

const ANIM_HOVER_MS     = 150;
const ANIM_PRESS_MS     = 200;
const ANIM_REVEAL_MS    = 500;
const ANIM_HERO_MS      = 600;
const ANIM_CARD_PULSE_MS = 600;

const AnimationHelpers = {
  /**
   * Creates an IntersectionObserver that watches all .reveal-section elements.
   * When a section enters the viewport (threshold 0.15), onSectionVisible is called.
   * Also applies button press effects to all CTA buttons.
   */
  initScrollObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            AnimationHelpers.onSectionVisible(entry.target);
            observer.unobserve(entry.target); // reveal once
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal-section').forEach((el) => {
      observer.observe(el);
    });

    // Apply press effect to all CTA buttons
    const ctaIds = ['cta-start', 'cta-start-nav', 'cta-play', 'cta-motivated', 'cta-motivated-nav'];
    ctaIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) AnimationHelpers.addButtonPressEffect(btn);
    });
  },

  /**
   * Adds the 'revealed' CSS class to a section element, triggering its
   * opacity/transform transition defined in index.html CSS.
   * @param {Element} el
   */
  onSectionVisible(el) {
    el.classList.add('revealed');
  },

  /**
   * Attaches pointer events to a button for a scale-down/up press animation.
   * pointerdown → scale 0.95 (within 100ms), pointerup/pointerleave → scale 1.0 (within 100ms).
   * Total animation ≤ ANIM_PRESS_MS (200ms).
   * @param {Element} btn
   */
  addButtonPressEffect(btn) {
    btn.style.transition = `transform ${ANIM_PRESS_MS / 2}ms ease`;

    btn.addEventListener('pointerdown', () => {
      btn.style.transform = 'scale(0.95)';
    });

    const release = () => {
      btn.style.transform = 'scale(1)';
    };

    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
  },

  /**
   * Attaches mouse events to a card for a hover lift effect.
   * mouseenter → translateY(-4px) + increased shadow (within ANIM_HOVER_MS).
   * mouseleave → revert (within ANIM_HOVER_MS).
   * @param {Element} card
   */
  addHoverLiftEffect(card) {
    card.style.transition =
      `transform ${ANIM_HOVER_MS}ms ease, box-shadow ${ANIM_HOVER_MS}ms ease`;

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  },

  /**
   * Applies addHoverLiftEffect to all current .exercise-card elements.
   * Call this after WorkoutSessionController.renderCards() has run.
   */
  applyCardEffects() {
    document.querySelectorAll('.exercise-card').forEach((card) => {
      AnimationHelpers.addHoverLiftEffect(card);
    });
  },
};
