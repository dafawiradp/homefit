/**
 * MusicPlayerController
 * Wraps the HTML5 <audio> element with play/pause/volume controls.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

const MusicPlayerController = {
  /** @type {MusicState} */
  state: {
    playing: false,
    volume: 0.1,   // default low volume (≤ 0.2 per requirement 4.6)
  },

  /** @type {HTMLAudioElement} */
  audio: null,

  /**
   * Set default volume, attach error listener, wire play/pause button and volume slider.
   * Requirement 4.6 — default low volume on page load.
   */
  init() {
    this.audio = document.getElementById('bg-music');
    if (!this.audio) return;

    // Set default low volume (≤ 0.2)
    this.audio.volume = 0.1;
    this.state.volume = 0.1;

    // Attach error listener for unsupported audio format (Requirement 4.5)
    this.audio.addEventListener('error', () => this.onError());

    // Wire play/pause button (Requirement 4.2)
    const btn = document.getElementById('music-play-pause');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.state.playing) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    // Wire volume slider (Requirement 4.2)
    const slider = document.getElementById('volume-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        this.setVolume(slider.value / 100);
      });
    }
  },

  /**
   * Begin audio playback and update state.
   * Requirement 4.3 — play when CTA "Play Music" is clicked.
   */
  play() {
    if (!this.audio) return;
    this.audio.play().catch(() => {
      // Autoplay may be blocked; onError will handle audio element errors
    });
    this.state.playing = true;
    this.onPlaybackChange();
  },

  /**
   * Pause audio playback and update state.
   * Requirement 4.2
   */
  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.state.playing = false;
    this.onPlaybackChange();
  },

  /**
   * Set audio volume.
   * @param {number} v - Volume level 0.0–1.0.
   * Requirement 4.2
   */
  setVolume(v) {
    if (!this.audio) return;
    const clamped = Math.min(1, Math.max(0, v));
    this.audio.volume = clamped;
    this.state.volume = clamped;
  },

  /**
   * Toggle equalizer/music-icon visibility and update button text based on playing state.
   * Requirement 4.4 — visual indicator while playing.
   */
  onPlaybackChange() {
    const equalizer  = document.getElementById('equalizer');
    const musicIcon  = document.getElementById('music-icon');
    const btn        = document.getElementById('music-play-pause');

    if (this.state.playing) {
      if (equalizer) equalizer.style.display = 'flex';
      if (musicIcon) musicIcon.style.display = 'none';
      if (btn)       btn.textContent = '⏸ Pause';
    } else {
      if (equalizer) equalizer.style.display = 'none';
      if (musicIcon) musicIcon.style.display = '';
      if (btn)       btn.textContent = '▶ Play';
    }
  },

  /**
   * Handle audio load/playback errors — hide controls, show fallback message.
   * Requirement 4.5
   */
  onError() {
    const btn      = document.getElementById('music-play-pause');
    const fallback = document.getElementById('audio-fallback');
    if (btn)      btn.style.display = 'none';
    if (fallback) fallback.classList.remove('hidden');
  },
};
