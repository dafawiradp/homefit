/**
 * QuotesController
 * Manages the rotating pool of Motivational_Quotes and the completion quote.
 */
const QuotesController = {
  state: {
    pool: [],
    currentIndex: 0,
    completionQuote: '',
  },

  init() {
    this.state.pool = QUOTES.slice();
    this.state.completionQuote = COMPLETION_QUOTE;
    this.state.currentIndex = 0;

    const el = document.getElementById('quote-display');
    if (el && this.state.pool.length > 0) {
      el.textContent = this.state.pool[0];
    }
  },

  next() {
    const pool = this.state.pool;
    if (pool.length === 0) return;

    const prevIndex = this.state.currentIndex;
    let nextIndex = (prevIndex + 1) % pool.length;

    // Ensure new quote differs from previous when pool has > 1 entry
    if (pool.length > 1 && pool[nextIndex] === pool[prevIndex]) {
      nextIndex = (nextIndex + 1) % pool.length;
    }

    this.state.currentIndex = nextIndex;

    const el = document.getElementById('quote-display');
    if (el) {
      this.animateTransition(el, pool[nextIndex]);
    }
  },

  showCompletion() {
    const el = document.getElementById('quote-display');
    if (el) {
      this.animateTransition(el, this.state.completionQuote);
    }
  },

  animateTransition(el, newText) {
    // Fade out (200ms), update text, fade in (200ms) — total ~400ms
    el.style.transition = 'opacity 200ms ease';
    el.style.opacity = '0';

    setTimeout(function () {
      el.textContent = newText;
      el.style.opacity = '1';
    }, 200);
  },
};
