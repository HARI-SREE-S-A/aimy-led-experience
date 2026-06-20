import { create } from 'zustand';

// Shared state for the scrolly experience. GSAP writes here on scroll;
// the 3D scene and the chapter overlay both read from it on every frame.
// We keep this in a ref-style store so React re-renders aren't driven by
// per-frame updates — the renderer reads via subscribe() in useFrame.
export const useScrollStore = create((set) => ({
  // 0 → 1 across the entire scroll length
  progress: 0,
  // current chapter index 0..N-1
  chapter: 0,
  // 0 → 1 within the current chapter (for sub-animations)
  chapterProgress: 0,
  // 0 → 1 fade-in at the start of the chapter
  intro: 0,
  // 0 → 1 fade-out at the end of the chapter
  outro: 0,
  // user has scrolled past the boot screen
  ready: false,

  setProgress: (progress, chapter, chapterProgress) =>
    set({ progress, chapter, chapterProgress }),
  setIntroOutro: (intro, outro) => set({ intro, outro }),
  setReady: (ready) => set({ ready }),
}));
