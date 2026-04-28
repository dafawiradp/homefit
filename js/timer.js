/**
 * WorkoutTimerController
 * Manages the countdown timer with circular SVG progress indicator.
 */
const WorkoutTimerController = {
  state: {
    totalSeconds: 0,
    remainingSeconds: 0,
    paused: false,
    intervalId: null,
  },

  start(durationSeconds) {
    this.state.totalSeconds = durationSeconds;
    this.state.remainingSeconds = durationSeconds;
    this.state.paused = false;

    // Clear any existing interval before starting a new one
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
    }

    this.state.intervalId = setInterval(() => this.tick(), 1000);
    this.render();

    // Update pause/resume button label
    const btn = document.getElementById('timer-pause-resume');
    if (btn) btn.textContent = 'Pause';
  },

  pause() {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
    this.state.paused = true;

    const btn = document.getElementById('timer-pause-resume');
    if (btn) btn.textContent = 'Resume';
  },

  resume() {
    if (this.state.paused) {
      this.state.paused = false;
      this.state.intervalId = setInterval(() => this.tick(), 1000);

      const btn = document.getElementById('timer-pause-resume');
      if (btn) btn.textContent = 'Pause';
    }
  },

  reset(durationSeconds) {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
    this.state.totalSeconds = durationSeconds;
    this.state.remainingSeconds = durationSeconds;
    this.state.paused = false;
    this.render();

    const btn = document.getElementById('timer-pause-resume');
    if (btn) btn.textContent = 'Pause';
  },

  tick() {
    // Guard: do nothing if paused or interval was cleared
    if (this.state.paused === true || this.state.intervalId === null) return;

    this.state.remainingSeconds -= 1;
    this.render();

    if (this.state.remainingSeconds <= 0) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
      this.onComplete();
    }
  },

  render() {
    const { remainingSeconds, totalSeconds } = this.state;

    // Update timer display with integer seconds
    const display = document.getElementById('timer-display');
    if (display) display.textContent = String(remainingSeconds);

    // Drive SVG stroke-dashoffset proportionally
    // 0 = full circle (start), 339.29 = empty circle (end)
    const circle = document.getElementById('timer-ring-circle');
    if (circle && totalSeconds > 0) {
      const dashoffset = 339.29 * (1 - remainingSeconds / totalSeconds);
      circle.style.strokeDashoffset = dashoffset;
    } else if (circle) {
      circle.style.strokeDashoffset = 0;
    }

    // Toggle timer-warning class on #timer section when ≤ 5s
    const timerSection = document.getElementById('timer');
    if (timerSection) {
      if (remainingSeconds <= 5 && remainingSeconds > 0) {
        timerSection.classList.add('timer-warning');
      } else {
        timerSection.classList.remove('timer-warning');
      }
    }
  },

  onComplete() {
    if (typeof WorkoutSessionController !== 'undefined') {
      WorkoutSessionController.advance();
    }
  },

  init() {
    // Wire pause/resume button
    const btn = document.getElementById('timer-pause-resume');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.state.paused) {
          this.resume();
        } else {
          this.pause();
        }
      });
    }
  },
};
