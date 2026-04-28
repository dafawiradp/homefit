/**
 * WorkoutSessionController
 * Manages exercise cards, active card highlighting, progress tracking, and completion.
 */
const WorkoutSessionController = {
  state: {
    exercises: [],
    currentIndex: 0,
    completed: false,
  },

  init() {
    this.state.exercises = EXERCISES;
    this.state.currentIndex = 0;
    this.state.completed = false;
    this.renderCards();
    this.updateProgressBar();

    // Wire the Start Workout CTA buttons
    // Note: #cta-start-nav scroll is already handled by NavigationController.init(),
    // so we only attach the start() call here to avoid a duplicate smoothScrollTo.
    const ctaStart = document.getElementById('cta-start');
    const ctaStartNav = document.getElementById('cta-start-nav');
    if (ctaStart) ctaStart.addEventListener('click', () => {
      if (typeof NavigationController !== 'undefined') {
        NavigationController.smoothScrollTo('workout', 500);
      }
      WorkoutSessionController.start();
    });
    if (ctaStartNav) ctaStartNav.addEventListener('click', () => {
      // Scroll is handled by NavigationController; just start the workout
      WorkoutSessionController.start();
    });
  },

  start() {
    if (this.state.completed) return;

    const exercises = this.state.exercises;
    if (!exercises.length) return;

    // Disable start buttons to prevent double-start
    const ctaStart = document.getElementById('cta-start');
    const ctaStartNav = document.getElementById('cta-start-nav');
    if (ctaStart) ctaStart.disabled = true;
    if (ctaStartNav) ctaStartNav.disabled = true;

    // Highlight first card
    this._setActiveCard(0);

    // Enable and start the timer
    const timerPauseResume = document.getElementById('timer-pause-resume');
    if (timerPauseResume) timerPauseResume.disabled = false;

    if (typeof WorkoutTimerController !== 'undefined') {
      WorkoutTimerController.start(exercises[0].durationSecs);
    }
    this._updateTimerExerciseName(exercises[0].name);
  },

  advance() {
    const { exercises, currentIndex } = this.state;

    // Remove active class from current card
    this._removeActiveCard(currentIndex);

    const nextIndex = currentIndex + 1;

    if (nextIndex >= exercises.length) {
      // Last exercise done
      this.showCompletion();
      return;
    }

    // Move to next card
    this.state.currentIndex = nextIndex;
    this._setActiveCard(nextIndex);
    this.updateProgressBar();

    // Start timer for next exercise (start() clears any existing interval internally)
    if (typeof WorkoutTimerController !== 'undefined') {
      WorkoutTimerController.start(exercises[nextIndex].durationSecs);
    }
    this._updateTimerExerciseName(exercises[nextIndex].name);
  },

  renderCards() {
    const grid = document.getElementById('exercise-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.state.exercises.forEach((exercise, index) => {
      const card = document.createElement('div');
      card.className = 'exercise-card bg-slate-800 border-2 border-slate-700 rounded-lg p-6 shadow-md cursor-pointer transition-all duration-200';
      card.setAttribute('data-index', index);
      card.innerHTML = `
        <div class="text-4xl mb-3">${exercise.icon}</div>
        <h3 class="font-heading font-bold text-white text-lg mb-2">${exercise.name}</h3>
        <p class="text-slate-400 text-sm mb-4">${exercise.description}</p>
        <div class="flex items-center gap-2 text-emerald-400 font-semibold">
          <span>⏱</span>
          <span>${exercise.durationSecs}s</span>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  updateProgressBar() {
    const total = this.state.exercises.length;
    const completed = this.state.currentIndex;
    const percent = total > 0 ? (completed / total) * 100 : 0;

    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = percent + '%';

    const label = document.getElementById('progress-label');
    if (label) label.textContent = `${completed} / ${total}`;
  },

  showCompletion() {
    this.state.completed = true;

    // Stop the timer
    if (typeof WorkoutTimerController !== 'undefined') {
      WorkoutTimerController.reset(0);
    }

    // Update progress bar to 100%
    this.state.currentIndex = this.state.exercises.length;
    this.updateProgressBar();

    // Show completion message
    const completionMsg = document.getElementById('completion-message');
    if (completionMsg) completionMsg.classList.remove('hidden');

    // Set completion quote
    const quoteText = document.getElementById('completion-quote-text');
    if (quoteText) quoteText.textContent = COMPLETION_QUOTE;

    // Notify QuotesController
    if (typeof QuotesController !== 'undefined') {
      QuotesController.showCompletion();
    }
  },

  // ── Private helpers ──

  _setActiveCard(index) {
    const card = document.querySelector(`.exercise-card[data-index="${index}"]`);
    if (card) card.classList.add('active');
  },

  _removeActiveCard(index) {
    const card = document.querySelector(`.exercise-card[data-index="${index}"]`);
    if (card) card.classList.remove('active');
  },

  _updateTimerExerciseName(name) {
    const nameEl = document.getElementById('timer-exercise-name');
    if (nameEl) nameEl.textContent = name;
  },
};
