import { useEffect, useRef, useState } from 'react';

/* ──────────────────────────────────────────────
   VIDEO SCRUBBING ENGINE (scroll-driven, seek-safe)
   ────────────────────────────────────────────── */

/** Coarse pointer = touch devices (mobile/tablet). */
const COARSE_POINTER_QUERY = '(hover: none) and (pointer: coarse)';

/** Events used to unlock the decoder on the first user interaction. */
const GESTURE_EVENTS = ['touchstart', 'pointerdown'];

/**
 * Creates the seek pipeline for a <video> element.
 *
 * The ScrollTrigger keeps ownership of the progress; this engine only receives
 * an absolute target time and decides *when* (and *if*) the decoder is touched:
 *
 *  • Coalescing — at most ONE seek in flight. While `video.seeking` is true the
 *    newest target is stored (overwriting any older one) and applied on `seeked`.
 *  • Readiness gate — no seek is issued before `readyState >= 2`
 *    (HAVE_CURRENT_DATA). Targets that arrive earlier are kept and applied on the
 *    first `canplay`.
 *  • Epsilon — targets practically identical to the current position are ignored
 *    (1 frame on coarse pointers, half a frame otherwise).
 *  • Priming (touch devices) — `muted = true` + `play() → pause()` to
 *    unlock programmatic scrubbing (WebKit/iOS quirk), with one extra attempt on
 *    the first gesture. The video never stays playing: scroll is the only driver.
 *  • fastSeek() is used on coarse pointers when available; fine pointers keep the
 *    exact `currentTime` behaviour used on desktop.
 *
 * The progress → time mapping (0.92 dwell, duration offset, etc.) stays in the
 * Hero and is intentionally NOT duplicated here.
 */
function createScrubberEngine(video, { fps = 24 } = {}) {
  // Seeking strategy follows the explicit coarse-pointer query (mobile/tablet).
  const coarse = window.matchMedia(COARSE_POINTER_QUERY).matches;
  // Hybrid devices (touch laptops/tablets with a mouse) still benefit from the
  // decoder unlock, so priming is attempted on any touch-capable device.
  const needsPriming = coarse || navigator.maxTouchPoints > 0;

  const state = {
    target: 0,      // last requested time (seconds)
    pending: null,  // target waiting for `seeked` or for readiness
    rafId: 0,       // scheduled flush handle
    ready: false,   // readyState >= 2
    duration: 0,    // real media duration (0 = unknown)
    primed: false,  // decoder unlocked for programmatic scrubbing
    gestureBound: false,
    destroyed: false,
    coarse,
    needsPriming,
    epsilon: coarse ? 1 / fps : 1 / (fps * 2),
  };

  /** Keeps the target inside the media bounds. */
  function clampTarget(time) {
    if (time < 0) return 0;
    if (state.duration > 0) {
      const maxTime = Math.max(0, state.duration - 0.001);
      return time > maxTime ? maxTime : time;
    }
    return time;
  }

  /** Applies the latest target respecting readiness, coalescing and epsilon. */
  function flush() {
    state.rafId = 0;
    if (state.destroyed) return;

    // Readiness: no frame data yet → keep the target for the first `canplay`.
    if (!state.ready || video.readyState < 2) {
      state.pending = state.target;
      return;
    }

    // Coalescing: never keep two seeks in flight — only the last target survives.
    if (video.seeking) {
      state.pending = state.target;
      return;
    }

    // Epsilon: skip seeks practically identical to the current position.
    if (Math.abs(state.target - video.currentTime) < state.epsilon) {
      state.pending = null;
      return;
    }

    state.pending = null;
    const time = clampTarget(state.target);
    if (coarse && typeof video.fastSeek === 'function') video.fastSeek(time);
    else video.currentTime = time;
  }

  /** Queues one target (frame-aligned) without stacking seeks. */
  function schedule(time) {
    state.target = time;
    if (state.rafId) return;
    state.rafId = requestAnimationFrame(flush);
  }

  /** Re-schedules the target that was waiting for a seek/readiness boundary. */
  function flushPending() {
    if (state.pending === null) return;
    const time = state.pending;
    state.pending = null;
    schedule(time);
  }

  /**
   * Unlocks programmatic scrubbing on mobile: muted play() → pause().
   * The video must never remain playing; scroll is the only driver.
   */
  function prime() {
    if (!state.needsPriming || state.primed || state.destroyed) return;
    video.muted = true;
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt
        .then(() => {
          state.primed = true;
          video.pause();
          schedule(state.target); // realign with the scroll target
        })
        .catch(() => {
          // No user gesture yet — retried on the first touchstart/pointerdown.
        });
    } else {
      state.primed = true;
      video.pause();
    }
  }

  function unbindGesture() {
    if (!state.gestureBound) return;
    state.gestureBound = false;
    GESTURE_EVENTS.forEach((type) => window.removeEventListener(type, onFirstGesture));
  }

  function onFirstGesture() {
    prime();
    unbindGesture();
  }

  function bindGesture() {
    if (state.gestureBound || state.destroyed) return;
    state.gestureBound = true;
    GESTURE_EVENTS.forEach((type) => window.addEventListener(type, onFirstGesture, { passive: true }));
  }

  /** Mirrors the media state: real duration + readiness (readyState >= 2). */
  function syncFromMedia() {
    const d = video.duration;
    if (typeof d === 'number' && Number.isFinite(d) && d > 0) state.duration = d;
    if (video.readyState >= 2) {
      state.ready = true;
      prime();
      flushPending();
    }
  }

  /** A seek just finished → apply the newest target that arrived meanwhile. */
  function onSeeked() {
    flushPending();
  }

  video.addEventListener('loadedmetadata', syncFromMedia);
  video.addEventListener('loadeddata', syncFromMedia);
  video.addEventListener('canplay', syncFromMedia);
  video.addEventListener('seeked', onSeeked);

  if (state.needsPriming) bindGesture();
  syncFromMedia(); // media may already be buffered when this engine starts

  return {
    setTarget(time) {
      if (typeof time === 'number' && Number.isFinite(time)) schedule(time);
    },
    getDuration() {
      return state.duration;
    },
    destroy() {
      state.destroyed = true;
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
      video.removeEventListener('loadedmetadata', syncFromMedia);
      video.removeEventListener('loadeddata', syncFromMedia);
      video.removeEventListener('canplay', syncFromMedia);
      video.removeEventListener('seeked', onSeeked);
      unbindGesture();
      if (!video.paused) video.pause();
    },
  };
}

/**
 * useVideoScrubber
 *
 * React adapter around the scrubbing engine. Returns a stable API that can be
 * captured once inside a `useEffect` (the ScrollTrigger effect), because its
 * methods always resolve against the engine of the current mount.
 *
 * @param {object} videoRef  ref of the <video> element
 * @param {{ fps?: number }} [options]
 * @returns {{ setTarget: (time: number) => void, getDuration: () => number }}
 */
export default function useVideoScrubber(videoRef, { fps = 24 } = {}) {
  const engineRef = useRef(null);

  const [api] = useState(() => ({
    setTarget(time) {
      engineRef.current?.setTarget(time);
    },
    getDuration() {
      return engineRef.current ? engineRef.current.getDuration() : 0;
    },
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const engine = createScrubberEngine(video, { fps });
    engineRef.current = engine;

    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [videoRef, fps]);

  return api;
}
