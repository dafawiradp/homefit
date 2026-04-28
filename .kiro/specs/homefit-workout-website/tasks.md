# Implementation Plan: HomeFit Workout Website

## Overview

Build HomeFit as a static single-page site using HTML5, Tailwind CSS (CDN), and Vanilla JavaScript. The implementation follows the module-per-concern architecture defined in the design: each controller is a named JS object, all state is in-memory, and the deliverable is `index.html` with optional linked JS/CSS files. Tasks are ordered so each step produces runnable, integrated code.

## Tasks

- [x] 1. Set up project structure and static data
  - Create `index.html` with the full HTML skeleton: `<head>` (Tailwind CDN, Google Fonts CDN, inline `<style>` for custom keyframes and fallback layout), and `<body>` with placeholder sections `#hero`, `#workout`, `#timer`, `#music`, `#quotes`, and `<footer>`
  - Create `js/data.js` with the `EXERCISES` array (≥ 6 entries matching the design data model) and the `QUOTES` array (≥ 10 motivational quotes + 1 distinct `COMPLETION_QUOTE`)
  - Add the minimal inline fallback `<style>` block (flexbox nav, grid cards, basic typography) to handle Tailwind CDN failure
  - Wire `<script src="js/data.js">` into `index.html`
  - _Requirements: 2.1, 2.2, 5.2, 10.1, 10.2, 10.3, 10.5_

- [x] 2. Implement NavigationController and responsive nav
  - [x] 2.1 Build the `<nav id="main-nav">` HTML with the HomeFit logo, three CTA buttons ("Start Workout", "Play Music", "Get Motivated"), and `<button id="hamburger">` / `<ul id="nav-links">` for mobile
  - Apply Tailwind classes for fixed positioning (`fixed top-0 z-50`), single-row flex layout on desktop (`lg:flex-row`), and hidden hamburger on desktop (`lg:hidden`)
  - Create `js/nav.js` implementing `NavigationController` with `init()`, `onScroll()`, `toggleMenu()`, and `smoothScrollTo(sectionId, durationMs)` (scroll duration 400–700 ms)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 2.2 Write unit tests for NavigationController
    - Test that nav contains logo and three CTA buttons
    - Test that `position: fixed` CSS is applied to `<nav>`
    - Test that hamburger menu toggles `nav-links` visibility on mobile viewport
    - Test that `smoothScrollTo` completes within 400–700 ms
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 3. Implement HeroSection with entrance animation
  - [x] 3.1 Build `<section id="hero">` HTML with the HomeFit logo/headline, `<button id="cta-start">` ("Start Workout"), and `<div id="reminder-banner">` with an encouraging message
  - Apply Tailwind classes for initial state (`opacity-0 translate-y-4`) and define a CSS transition (400–800 ms) to `opacity-100 translate-y-0` via the `visible` class
  - Create `js/hero.js` implementing `HeroSection.init()` that adds the `visible` class on `DOMContentLoaded`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 3.2 Write unit tests for HeroSection
    - Test that `#hero`, `#cta-start`, and `#reminder-banner` exist in the DOM
    - Test that the hero fade-in transition duration is between 400 ms and 800 ms
    - Test that `#reminder-banner` is visible on page load
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 4. Implement WorkoutSessionController and Exercise Cards
  - [x] 4.1 Create `js/workout.js` with `WorkoutSessionController` implementing `init()`, `start()`, `advance()`, `renderCards()`, `updateProgressBar()`, and `showCompletion()`
  - `renderCards()` builds `<div class="exercise-card" data-index="N">` nodes from `EXERCISES`, each containing name, description, duration, and icon
  - `start()` adds an `active` highlight class to the first card and calls `WorkoutTimerController.start()`
  - `advance()` removes the active class from the current card, increments `currentIndex`, adds active class to the next card (or calls `showCompletion()` on last)
  - `updateProgressBar()` sets `#progress-bar-fill` width to `(currentIndex / total) * 100%`
  - Apply Tailwind responsive grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 8.2, 8.3, 8.4_

  - [ ]* 4.2 Write property test for exercise card rendering (Property 1)
    - **Property 1: Exercise card renders all required fields**
    - Use `fc.record` to generate arbitrary valid `Exercise` objects and assert that `renderExerciseCard(exercise)` output contains `name`, `description`, `String(durationSecs)`, and `icon`
    - **Validates: Requirements 2.2**

  - [ ]* 4.3 Write property test for progress bar ratio (Property 3)
    - **Property 3: Progress bar reflects completed ratio**
    - Use `fc.integer` to generate `(completedCount, totalCount)` pairs where `0 ≤ completedCount ≤ totalCount` and `totalCount > 0`, assert fill width equals `(completedCount / totalCount) * 100`
    - **Validates: Requirements 2.7**

  - [ ]* 4.4 Write unit tests for WorkoutSessionController
    - Test that workout section renders ≥ 6 exercise cards
    - Test that clicking "Start Workout" highlights the first card
    - Test that last exercise completion displays the completion message
    - _Requirements: 2.1, 2.4, 2.6_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement WorkoutTimerController
  - [x] 6.1 Create `js/timer.js` with `WorkoutTimerController` implementing `start(durationSeconds)`, `pause()`, `resume()`, `reset(durationSeconds)`, `tick()`, `render()`, and `onComplete()`
  - `render()` updates `#timer-display` with the integer remaining seconds, drives the SVG `stroke-dashoffset` proportionally to `remainingSeconds / totalSeconds`, and toggles the `timer-warning` class when `remainingSeconds ≤ 5`
  - `tick()` guards against calls when `paused = true` or `intervalId = null`
  - `onComplete()` calls `WorkoutSessionController.advance()`
  - Build the timer HTML inside `<section id="timer">`: `<div id="timer-display">`, `<svg id="timer-ring">` with a `<circle>`, and `<button id="timer-pause-resume">`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Write property test for timer display (Property 4)
    - **Property 4: Timer display shows whole seconds**
    - Use `fc.nat` to generate arbitrary non-negative integers and assert `formatTimerDisplay(n)` returns exactly `String(n)` with no decimals or extra characters
    - **Validates: Requirements 3.1**

  - [ ]* 6.3 Write property test for timer progress indicator (Property 5)
    - **Property 5: Timer progress indicator is proportional**
    - Use `fc.tuple(fc.nat(), fc.nat(1, 300))` to generate `(remainingSeconds, totalSeconds)` where `remainingSeconds ≤ totalSeconds`, assert SVG `stroke-dashoffset` value is proportional to `remainingSeconds / totalSeconds`
    - **Validates: Requirements 3.2**

  - [ ]* 6.4 Write property test for timer warning threshold (Property 6)
    - **Property 6: Timer warning activates at threshold**
    - Use `fc.nat` to generate arbitrary `remainingSeconds` values, assert `timer-warning` class is present iff `remainingSeconds ≤ 5`
    - **Validates: Requirements 3.3**

  - [ ]* 6.5 Write property test for pause freezing timer state (Property 7)
    - **Property 7: Pause freezes timer state**
    - Set up timer with arbitrary `remainingSeconds = R`, call `pause()`, simulate a tick, assert `remainingSeconds` is still `R`
    - **Validates: Requirements 3.5**

  - [ ]* 6.6 Write unit tests for WorkoutTimerController
    - Test that pause/resume button exists and is interactive
    - Test that `tick()` is a no-op when `paused = true`
    - _Requirements: 3.4, 3.5_

- [x] 7. Implement MusicPlayerController
  - [x] 7.1 Create `js/music.js` with `MusicPlayerController` implementing `init()`, `play()`, `pause()`, `setVolume(v)`, `onPlaybackChange()`, and `onError()`
  - Build the music player HTML inside `<section id="music">`: `<audio id="bg-music" preload="none">`, `<button id="music-play-pause">`, `<input id="volume-slider" type="range">`, `<div id="equalizer">` (animated bars), and `<p id="audio-fallback">` (hidden by default)
  - `init()` sets `audio.volume = 0.1` (default low volume), attaches `error` event listener to call `onError()`
  - `onPlaybackChange()` toggles `#equalizer` visibility based on `state.playing`
  - `onError()` hides the play/pause button and shows `#audio-fallback`
  - Wire the "Play Music" CTA button (`#cta-play`) to call `MusicPlayerController.play()`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 7.2 Write property test for playback indicator (Property 8)
    - **Property 8: Playback indicator matches playing state**
    - Use `fc.boolean` to generate arbitrary `playing` states, assert `#equalizer` is visible iff `playing = true`
    - **Validates: Requirements 4.4**

  - [ ]* 7.3 Write unit tests for MusicPlayerController
    - Test that music player DOM elements exist (`#bg-music`, `#music-play-pause`, `#volume-slider`)
    - Test that play/pause/volume controls are operable
    - Test that "Play Music" CTA triggers `audio.play()`
    - Test that audio error event shows `#audio-fallback`
    - Test that initial volume is ≤ 0.2 on page load
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 8. Implement QuotesController
  - [x] 8.1 Create `js/quotes.js` with `QuotesController` implementing `init()`, `next()`, `showCompletion()`, and `animateTransition(el, newText)`
  - `next()` advances `currentIndex` (wrapping), ensures the new quote differs from the previous one, then calls `animateTransition`
  - `animateTransition` fades out `#quote-display`, updates text, fades in — total duration 300–600 ms
  - `showCompletion()` displays `COMPLETION_QUOTE` (which must not be in the rotation pool) with the same animation
  - Build the quotes HTML inside `<section id="quotes">`: `<div id="quote-display">` and `<button id="cta-motivated">` ("Get Motivated")
  - Wire `#cta-motivated` to `QuotesController.next()`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.2 Write property test for quote rotation (Property 9)
    - **Property 9: Quote rotation avoids consecutive repeats**
    - Use `fc.nat(1, 50)` to generate N clicks, simulate N calls to `next()`, assert each returned quote differs from the immediately preceding one and the pool has ≥ 10 distinct entries
    - **Validates: Requirements 5.2**

  - [ ]* 8.3 Write property test for completion quote distinctness (Property 10)
    - **Property 10: Completion quote is distinct from rotation pool**
    - Assert that `COMPLETION_QUOTE` is not present in the `QUOTES` array
    - **Validates: Requirements 5.5**

  - [ ]* 8.4 Write unit tests for QuotesController
    - Test that at least one quote is visible without scrolling on load
    - Test that quote transition duration is between 300 ms and 600 ms
    - _Requirements: 5.1, 5.3_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement AnimationHelpers and micro-interactions
  - [x] 10.1 Create `js/animations.js` with `AnimationHelpers` implementing `initScrollObserver()`, `onSectionVisible(el)`, `addButtonPressEffect(btn)`, and `addHoverLiftEffect(card)`
  - `initScrollObserver()` registers an `IntersectionObserver` on all major sections; `onSectionVisible` adds the `revealed` CSS class
  - `addButtonPressEffect` uses CSS transitions or the Web Animations API for scale-down on `pointerdown` and scale-up on `pointerup`, completing within 200 ms
  - `addHoverLiftEffect` applies shadow increase and `translateY(-4px)` on `mouseenter`, reverting on `mouseleave`, within 200 ms
  - Define all animation durations as named constants (e.g., `ANIM_HOVER_MS = 150`, `ANIM_PRESS_MS = 200`) and assert none exceed 800 ms
  - Apply `addButtonPressEffect` to all CTA buttons; apply `addHoverLiftEffect` to all exercise cards
  - Add the workout-start pulse/glow animation (400–800 ms) to the active card in `WorkoutSessionController.start()`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 10.2 Write property test for scroll-triggered section reveals (Property 11)
    - **Property 11: Scroll-triggered sections receive revealed class**
    - Use jsdom/Playwright to simulate intersection events on arbitrary registered section elements, assert `revealed` class is added when intersection ratio crosses the threshold
    - **Validates: Requirements 6.3**

  - [ ]* 10.3 Write property test for animation duration limits (Property 12)
    - **Property 12: No animation exceeds 800 ms**
    - Use `fc.record` over the animation constants object, assert every value is ≤ 800
    - **Validates: Requirements 6.5**

  - [ ]* 10.4 Write unit tests for AnimationHelpers
    - Test that CTA button hover transition completes within 150 ms
    - Test that CTA button press animation completes within 200 ms
    - Test that workout-start animation duration is between 400 ms and 800 ms
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 11. Implement responsive layout and visual design
  - [x] 11.1 Apply the full Tailwind visual design system across all sections: energetic accent color palette, `rounded-lg` (≥ 8px) and `shadow-md` on cards and interactive components, fitness-inspired heading font and legible body font (min 16px), 8px-base spacing scale
  - Verify the exercise card grid uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (already wired in task 4.1)
  - Ensure all tap targets (buttons, links, controls) have `min-h-[44px] min-w-[44px]` on mobile viewports
  - Add `overflow-x-hidden` to `<body>` and verify no section causes horizontal scroll at any width 320–2560 px
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.5_

  - [ ]* 11.2 Write property test for responsive grid columns (Property 13)
    - **Property 13: Responsive grid column count matches viewport**
    - Use Playwright with `fc.integer` to generate viewport widths in `[320, 2560]`, assert grid column count is 1 / 2 / 3 per the breakpoint rules
    - **Validates: Requirements 8.2, 8.3, 8.4**

  - [ ]* 11.3 Write property test for no horizontal overflow (Property 14)
    - **Property 14: No horizontal overflow across viewport widths**
    - Use Playwright with `fc.integer` to generate widths in `[320, 2560]`, assert `document.body.scrollWidth ≤ document.body.clientWidth`
    - **Validates: Requirements 8.1**

  - [ ]* 11.4 Write property test for tap target sizes (Property 15)
    - **Property 15: Tap targets meet minimum size on mobile**
    - Use Playwright at mobile viewport (width < 768 px), query all interactive elements, assert each bounding rect width and height ≥ 44 px
    - **Validates: Requirements 8.5**

  - [ ]* 11.5 Write unit tests for visual design
    - Test that text/background contrast ratio is ≥ 4.5:1 for all body text elements
    - _Requirements: 9.4_

- [x] 12. Wire all controllers together and finalize index.html
  - [x] 12.1 Add all `<script>` tags to `index.html` in dependency order: `data.js`, `timer.js`, `workout.js`, `music.js`, `quotes.js`, `nav.js`, `animations.js`, `hero.js`
  - Add a `main.js` (or inline `<script>`) that calls `init()` on each controller after `DOMContentLoaded`
  - Wire cross-controller calls: `WorkoutTimerController.onComplete → WorkoutSessionController.advance`, `WorkoutSessionController.showCompletion → QuotesController.showCompletion`, `#cta-start → WorkoutSessionController.start`, `#cta-play → MusicPlayerController.play`, `#cta-motivated → QuotesController.next`
  - Verify the page opens directly in a browser (`file://`) without a server and all features work
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 12.2 Write integration tests for end-to-end workout flow
    - Test full workout flow: click "Start Workout" → timer counts down → exercise advances → progress bar updates → completion message shown
    - Test "Play Music" CTA triggers playback and equalizer appears
    - Test "Get Motivated" cycles quotes without consecutive repeats
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 4.3, 5.2_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with `numRuns: 100` minimum; run with `vitest --run`
- Playwright is used for viewport/DOM property tests (Properties 11, 13, 14, 15)
- All animation durations are defined as named JS constants so Property 12 can be verified programmatically
- The site must open directly via `file://` — no build step or server required
