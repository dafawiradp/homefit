# Design Document

## Overview

HomeFit is a single-page workout website delivered as a minimal set of static files (primarily `index.html` with optional linked JS/CSS). It targets home exercisers — especially beginners — who want a clean, motivating, and easy-to-use interface for following home workout routines without any equipment or backend infrastructure.

The site is built entirely with HTML5, Tailwind CSS (via CDN), and Vanilla JavaScript. All state is managed in-memory in the browser; no server, database, or build tool is required. The design prioritises:

- **Simplicity of delivery** — open `index.html` in any modern browser and it works.
- **Progressive enhancement** — core content is readable even if JS or CDN resources fail.
- **Responsive-first layout** — single-column on mobile, scaling up to three columns on desktop.
- **Snappy micro-interactions** — all animations ≤ 800 ms using CSS transitions or the Web Animations API.

---

## Architecture

HomeFit follows a **module-per-concern** architecture inside a single JavaScript scope. There is no framework, no bundler, and no module system beyond plain `<script>` tags. Each logical concern is encapsulated in a named object/function group.

```
index.html
├── <head>
│   ├── Tailwind CSS CDN link
│   ├── Google Fonts CDN link (headings + body)
│   └── Inline <style> for custom keyframe animations
├── <body>
│   ├── <nav>          — NavigationController
│   ├── #hero          — HeroSection
│   ├── #workout       — WorkoutSession (Exercise_Cards + Progress_Bar)
│   ├── #timer         — WorkoutTimer
│   ├── #music         — MusicPlayer
│   ├── #quotes        — QuotesSection
│   └── <footer>
└── <script>
    ├── data.js (inline or linked) — static exercise + quote data
    ├── timer.js      — WorkoutTimerController
    ├── workout.js    — WorkoutSessionController
    ├── music.js      — MusicPlayerController
    ├── quotes.js     — QuotesController
    ├── nav.js        — NavigationController
    └── animations.js — AnimationHelpers + scroll observer
```

### Data Flow

```
User Interaction
      │
      ▼
Controller (e.g. WorkoutSessionController)
      │  reads/writes
      ▼
In-Memory State Object (plain JS object)
      │  calls
      ▼
DOM Renderer (updates innerHTML / classList / style)
      │  triggers
      ▼
CSS Transitions / Web Animations API
```

All state is ephemeral — refreshing the page resets the workout. There is no localStorage persistence requirement in the spec.

---

## Components and Interfaces

### 1. NavigationController

Manages the fixed top navigation bar and hamburger menu.

```js
NavigationController = {
  init()                  // attach scroll listener, hamburger toggle
  onScroll()              // add/remove 'scrolled' class to <nav>
  toggleMenu()            // expand/collapse mobile menu
  smoothScrollTo(sectionId, durationMs)  // animated scroll
}
```

**DOM contract:**
- `<nav id="main-nav">` — fixed, `z-50`
- `<button id="hamburger">` — visible only on `< 768px`
- `<ul id="nav-links">` — hidden on mobile until toggled

---

### 2. HeroSection

Static HTML with a fade-in entrance animation triggered on `DOMContentLoaded`.

```js
HeroSection = {
  init()   // add 'visible' class after page load to trigger CSS transition
}
```

**DOM contract:**
- `<section id="hero">` — starts with `opacity-0 translate-y-4`, transitions to `opacity-100 translate-y-0`
- `<button id="cta-start">` — "Start Workout" CTA
- `<div id="reminder-banner">` — Reminder_Banner, always visible on load

---

### 3. WorkoutSessionController

Manages the ordered list of Exercise_Cards, active card highlighting, progress tracking, and completion state.

```js
WorkoutSessionController = {
  state: {
    exercises: Exercise[],   // loaded from data
    currentIndex: number,    // 0-based index of active exercise
    completed: boolean,
  },
  init()                     // render all cards, attach listeners
  start()                    // highlight first card, start timer
  advance()                  // move to next card or show completion
  renderCards()              // build Exercise_Card DOM nodes
  updateProgressBar()        // set width = (currentIndex / total) * 100%
  showCompletion()           // display congratulatory message
}
```

**DOM contract:**
- `<section id="workout">` — grid container
- `<div class="exercise-card" data-index="N">` — one per exercise
- `<div id="progress-bar-fill">` — width driven by JS

---

### 4. WorkoutTimerController

Manages the countdown timer with circular SVG progress indicator.

```js
WorkoutTimerController = {
  state: {
    totalSeconds: number,
    remainingSeconds: number,
    paused: boolean,
    intervalId: number | null,
  },
  start(durationSeconds)     // begin countdown
  pause()                    // freeze countdown
  resume()                   // continue countdown
  reset(durationSeconds)     // restart for new exercise
  tick()                     // called every 1000ms by setInterval
  render()                   // update DOM display + SVG arc + warning style
  onComplete()               // notify WorkoutSessionController
}
```

**DOM contract:**
- `<div id="timer-display">` — shows remaining seconds as integer
- `<svg id="timer-ring">` — circular SVG with `<circle>` stroke-dashoffset driven by JS
- `<button id="timer-pause-resume">` — single toggle button
- Warning state: add class `timer-warning` (amber/red color) when ≤ 5 s

---

### 5. MusicPlayerController

Wraps the HTML5 `<audio>` element with play/pause/volume controls.

```js
MusicPlayerController = {
  state: {
    playing: boolean,
    volume: number,   // 0.0 – 1.0, default 0.1
  },
  init()             // set default volume, attach listeners
  play()             // audio.play()
  pause()            // audio.pause()
  setVolume(v)       // audio.volume = v
  onPlaybackChange() // update equalizer animation visibility
  onError()          // show fallback message
}
```

**DOM contract:**
- `<audio id="bg-music" src="...">` — preload="none", muted initially
- `<button id="music-play-pause">` — play/pause toggle
- `<input id="volume-slider" type="range">` — 0–100 mapped to 0.0–1.0
- `<div id="equalizer">` — animated bars, visible only when playing
- `<p id="audio-fallback">` — hidden by default, shown on `error` event

---

### 6. QuotesController

Manages the rotating pool of Motivational_Quotes and the completion quote.

```js
QuotesController = {
  state: {
    pool: string[],           // ≥ 10 quotes
    currentIndex: number,
    completionQuote: string,  // distinct from pool
  },
  init()                      // display first quote
  next()                      // advance index, animate transition
  showCompletion()            // display completion quote with animation
  animateTransition(el, newText)  // fade-out → update text → fade-in
}
```

**DOM contract:**
- `<div id="quote-display">` — current quote text
- `<button id="cta-motivated">` — "Get Motivated" CTA

---

### 7. AnimationHelpers

Utility functions for scroll-triggered reveals and micro-interactions.

```js
AnimationHelpers = {
  initScrollObserver()        // IntersectionObserver for section reveals
  onSectionVisible(el)        // add 'revealed' class
  addButtonPressEffect(btn)   // scale-down on pointerdown, scale-up on pointerup
  addHoverLiftEffect(card)    // applied to Exercise_Cards
}
```

---

## Data Models

### Exercise

```js
/**
 * @typedef {Object} Exercise
 * @property {string} id           - Unique identifier (e.g. "ex-01")
 * @property {string} name         - Display name (e.g. "Jumping Jacks")
 * @property {string} description  - Short instruction (1–2 sentences)
 * @property {number} durationSecs - Countdown duration in whole seconds (> 0)
 * @property {string} icon         - Emoji or SVG identifier for the animated icon
 */
```

### WorkoutState

```js
/**
 * @typedef {Object} WorkoutState
 * @property {Exercise[]} exercises    - Ordered list of exercises in the session
 * @property {number}     currentIndex - Index of the active exercise (0-based)
 * @property {boolean}    started      - Whether the session has been started
 * @property {boolean}    completed    - Whether all exercises are done
 */
```

### TimerState

```js
/**
 * @typedef {Object} TimerState
 * @property {number}      totalSeconds     - Full duration of current exercise
 * @property {number}      remainingSeconds - Seconds left (integer, ≥ 0)
 * @property {boolean}     paused           - Whether the timer is frozen
 * @property {number|null} intervalId       - setInterval handle, null when stopped
 */
```

### MusicState

```js
/**
 * @typedef {Object} MusicState
 * @property {boolean} playing - Whether audio is currently playing
 * @property {number}  volume  - Current volume level (0.0 – 1.0)
 */
```

### QuotePool

```js
/**
 * @typedef {Object} QuotePool
 * @property {string[]} quotes          - Array of ≥ 10 motivational quote strings
 * @property {number}   currentIndex    - Index of the currently displayed quote
 * @property {string}   completionQuote - Special quote shown on workout completion
 */
```

### Static Exercise Data (minimum 6 entries)

```js
const EXERCISES = [
  { id: "ex-01", name: "Jumping Jacks",    description: "Stand tall, jump feet wide while raising arms overhead.",  durationSecs: 45, icon: "🤸" },
  { id: "ex-02", name: "Push-Ups",         description: "Lower chest to floor with straight back, then push up.",   durationSecs: 40, icon: "💪" },
  { id: "ex-03", name: "Bodyweight Squats",description: "Feet shoulder-width apart, lower hips until thighs parallel.", durationSecs: 45, icon: "🏋️" },
  { id: "ex-04", name: "High Knees",       description: "Run in place, driving knees up to hip height.",            durationSecs: 30, icon: "🏃" },
  { id: "ex-05", name: "Plank Hold",       description: "Hold a straight-body position on forearms and toes.",      durationSecs: 30, icon: "🧘" },
  { id: "ex-06", name: "Mountain Climbers",description: "From plank, alternate driving knees toward chest rapidly.", durationSecs: 40, icon: "⛰️" },
];
```

---


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Exercise card renders all required fields

*For any* exercise object in the data array, rendering it as an Exercise_Card should produce a DOM element that contains the exercise name, description, duration (in seconds), and icon — all four fields must be present and non-empty.

**Validates: Requirements 2.2**

---

### Property 2: Timer advance on completion

*For any* exercise at index `i` (where `i < total - 1`), when the Workout_Timer reaches zero, the active exercise index should become `i + 1` and the timer should reset to the next exercise's `durationSecs`.

**Validates: Requirements 2.5**

---

### Property 3: Progress bar reflects completed ratio

*For any* pair `(completedCount, totalCount)` where `0 ≤ completedCount ≤ totalCount` and `totalCount > 0`, the progress bar fill width percentage should equal `(completedCount / totalCount) * 100`, rounded to a reasonable precision.

**Validates: Requirements 2.7**

---

### Property 4: Timer display shows whole seconds

*For any* non-negative integer `remainingSeconds`, the timer display text should equal exactly that integer — no decimal points, no rounding artifacts, no extra characters.

**Validates: Requirements 3.1**

---

### Property 5: Timer progress indicator is proportional

*For any* `remainingSeconds` and `totalSeconds` where `0 ≤ remainingSeconds ≤ totalSeconds` and `totalSeconds > 0`, the SVG progress indicator value (stroke-dashoffset or equivalent) should be proportional to `remainingSeconds / totalSeconds`.

**Validates: Requirements 3.2**

---

### Property 6: Timer warning activates at threshold

*For any* `remainingSeconds` value: if `remainingSeconds ≤ 5`, the timer element should have the warning style class applied; if `remainingSeconds > 5`, the warning style class should not be present.

**Validates: Requirements 3.3**

---

### Property 7: Pause freezes timer state

*For any* timer state with `remainingSeconds = R` and `paused = true`, after waiting one full tick interval (≥ 1000 ms), `remainingSeconds` should still equal `R` — the countdown must not advance while paused.

**Validates: Requirements 3.5**

---

### Property 8: Playback indicator matches playing state

*For any* music player state, the visual playback indicator (equalizer/pulsing icon) should be visible if and only if `playing = true`. When `playing = false`, the indicator must be hidden.

**Validates: Requirements 4.4**

---

### Property 9: Quote rotation avoids consecutive repeats

*For any* sequence of N clicks on "Get Motivated" (N ≥ 1), the quote displayed after each click should differ from the quote displayed immediately before that click. Additionally, the quote pool must contain at least 10 distinct entries.

**Validates: Requirements 5.2**

---

### Property 10: Completion quote is distinct from rotation pool

*For any* workout completion event, the congratulatory quote displayed should not be present in the general rotation pool array.

**Validates: Requirements 5.5**

---

### Property 11: Scroll-triggered sections receive revealed class

*For any* section element registered with the IntersectionObserver, when that element's intersection ratio crosses the visibility threshold (enters the viewport), the element should have the `revealed` CSS class added to it.

**Validates: Requirements 6.3**

---

### Property 12: No animation exceeds 800 ms

*For any* animation duration value defined in the system's animation configuration object (CSS custom properties or JS constants), that value should be ≤ 800 ms.

**Validates: Requirements 6.5**

---

### Property 13: Responsive grid column count matches viewport

*For any* viewport width `W`:
- If `W < 768`, the exercise card grid should have exactly 1 column.
- If `768 ≤ W < 1024`, the exercise card grid should have exactly 2 columns.
- If `W ≥ 1024`, the exercise card grid should have exactly 3 columns.

**Validates: Requirements 8.2, 8.3, 8.4**

---

### Property 14: No horizontal overflow across viewport widths

*For any* viewport width `W` in the range `[320, 2560]`, the document body's `scrollWidth` should not exceed its `clientWidth` — no horizontal scrollbar should appear.

**Validates: Requirements 8.1**

---

### Property 15: Tap targets meet minimum size on mobile

*For any* interactive element (button, link, or form control) rendered on a mobile viewport (width < 768 px), its bounding rectangle width and height should both be ≥ 44 px.

**Validates: Requirements 8.5**

---

## Error Handling

### CDN / External Resource Failure (Requirement 10.5)

If Tailwind CSS CDN fails to load, the page must remain readable. Strategy:
- Include a minimal inline `<style>` block with critical layout rules (flexbox nav, grid cards, basic typography) as a fallback.
- Use `<link onerror>` or a `<noscript>` block to detect CDN failure and apply fallback class.

### Audio Format Not Supported (Requirement 4.5)

The `<audio>` element's `error` event is caught by `MusicPlayerController.onError()`:
- Hide the play/pause button.
- Show `<p id="audio-fallback">` with the message: "Audio playback is not supported in your browser."

### Last Exercise Completion (Requirement 2.6)

When `WorkoutSessionController.advance()` is called and `currentIndex === exercises.length - 1`:
- Stop the timer.
- Hide the timer section.
- Display the completion overlay with the congratulatory quote from `QuotesController.showCompletion()`.

### JavaScript Disabled

All static content (exercise names, descriptions, quotes) is rendered in the initial HTML so the page is readable without JS. Interactive features (timer, music, animations) degrade gracefully to static content.

### Invalid Timer State

If `WorkoutTimerController.tick()` is called when `paused = true` or `intervalId = null`, it returns immediately without modifying state — defensive guard against stale interval callbacks.

---

## Testing Strategy

### PBT Applicability Assessment

HomeFit is a front-end static site. The majority of its logic is:
- **Pure transformation functions** (timer state → display value, progress ratio → bar width, exercise data → card DOM) — **PBT applies**
- **UI rendering and layout** (CSS classes, responsive breakpoints) — PBT applies for the logic layer (column count calculation, animation duration config)
- **External service behavior** (audio playback, CDN loading) — integration/example tests only

PBT is appropriate for the pure logic functions. The property-based testing library chosen is **[fast-check](https://github.com/dubzzz/fast-check)** (JavaScript), which integrates with any test runner (Jest, Vitest).

---

### Unit Tests (Example-Based)

Focus on specific scenarios, edge cases, and integration points:

| Test | Requirement |
|------|-------------|
| Hero section DOM structure exists | 1.1 |
| "Start Workout" button scrolls to workout section | 1.2 |
| Reminder banner is visible on load | 1.3, 5.4 |
| Hero fade-in transition duration is 400–800 ms | 1.4 |
| Workout section renders ≥ 6 cards | 2.1 |
| Clicking "Start Workout" highlights first card | 2.4 |
| Last exercise completion shows completion message | 2.6 |
| Pause/resume button exists and is interactive | 3.4 |
| Music player DOM element exists | 4.1 |
| Play/pause/volume controls exist | 4.2 |
| "Play Music" CTA triggers audio.play() | 4.3 |
| Audio error event shows fallback message | 4.5 |
| Initial volume ≤ 0.2 on page load | 4.6 |
| At least one quote visible without scrolling | 5.1 |
| Quote transition duration is 300–600 ms | 5.3 |
| Nav contains logo and three CTA buttons | 7.1 |
| Nav has position:fixed CSS | 7.2 |
| Smooth scroll duration is 400–700 ms | 7.3 |
| Desktop nav is single-row flex layout | 7.4 |
| Hamburger menu toggles on mobile | 7.5 |
| CTA button hover transition ≤ 150 ms | 6.1 |
| CTA button press animation ≤ 200 ms | 6.2 |
| Start animation duration is 400–800 ms | 6.4 |
| Text/background contrast ratio ≥ 4.5:1 | 9.4 |

---

### Property-Based Tests (fast-check, minimum 100 iterations each)

Each test is tagged with the design property it validates.

```
// Feature: homefit-workout-website, Property 1: Exercise card renders all required fields
fc.assert(fc.property(fc.record({...exerciseArb}), exercise => {
  const card = renderExerciseCard(exercise);
  return card.includes(exercise.name) && card.includes(exercise.description)
    && card.includes(String(exercise.durationSecs)) && card.includes(exercise.icon);
}), { numRuns: 100 });

// Feature: homefit-workout-website, Property 2: Timer advance on completion
// Feature: homefit-workout-website, Property 3: Progress bar reflects completed ratio
// Feature: homefit-workout-website, Property 4: Timer display shows whole seconds
// Feature: homefit-workout-website, Property 5: Timer progress indicator is proportional
// Feature: homefit-workout-website, Property 6: Timer warning activates at threshold
// Feature: homefit-workout-website, Property 7: Pause freezes timer state
// Feature: homefit-workout-website, Property 8: Playback indicator matches playing state
// Feature: homefit-workout-website, Property 9: Quote rotation avoids consecutive repeats
// Feature: homefit-workout-website, Property 10: Completion quote is distinct from rotation pool
// Feature: homefit-workout-website, Property 11: Scroll-triggered sections receive revealed class
// Feature: homefit-workout-website, Property 12: No animation exceeds 800 ms
// Feature: homefit-workout-website, Property 13: Responsive grid column count matches viewport
// Feature: homefit-workout-website, Property 14: No horizontal overflow across viewport widths
// Feature: homefit-workout-website, Property 15: Tap targets meet minimum size on mobile
```

**Configuration:**
- Test runner: Vitest (or Jest) — run with `vitest --run` for single execution
- fast-check `numRuns: 100` minimum per property
- DOM tests use jsdom or Playwright for browser environment simulation
- Responsive/viewport tests use Playwright with `page.setViewportSize()`

---

### Smoke Tests

- Page loads without errors in Chrome, Firefox, Safari (latest)
- Tailwind CDN loads; fallback styles activate when CDN is blocked
- Performance: Lighthouse mobile score ≥ 90, LCP ≤ 3 s on simulated 4G (Requirement 8.6)
- No JS framework or build tool required — `index.html` opens directly in browser

---
