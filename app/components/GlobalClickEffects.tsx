"use client";

import { useEffect } from "react";

/**
 * Contextual click-sound engine.
 *
 * Sound types (set via data-sound="<type>" on any interactive element):
 *   auth       – Soft rising bell chime  (login / register buttons)
 *   add-cart   – Two-tone reward "da-ding"  (add-to-cart)
 *   count-up   – Short upward chirp  (quantity + button)
 *   count-down – Short downward soft click  (quantity − button)
 *   delete     – Low thud + noise swipe  (remove/trash button)
 *   (default)  – Gentle water-droplet pluck  (everything else)
 */
export default function GlobalClickEffects() {
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let noiseBuffer: AudioBuffer | null = null;

    const isMobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches;
    const quietMode =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const qv = quietMode ? 0.62 : 1;   // quiet-mode volume scale
    const mv = isMobile  ? 0.82 : 1;   // mobile volume scale

    // ─── AudioContext helpers ──────────────────────────────────────────────
    const getCtx = async (): Promise<AudioContext | null> => {
      if (!audioCtx) {
        const Ctor =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        audioCtx = new Ctor({ latencyHint: "interactive" });
      }
      if (audioCtx.state !== "running") await audioCtx.resume();
      return audioCtx;
    };

    const getNoise = (ctx: AudioContext): AudioBuffer => {
      if (noiseBuffer) return noiseBuffer;
      const len = Math.floor(ctx.sampleRate * 0.22);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch  = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5);
      }
      noiseBuffer = buf;
      return buf;
    };

    /** Tiny utility: wire node chain and return the final node. */
    const chain = (...nodes: AudioNode[]): AudioNode => {
      for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
      return nodes[nodes.length - 1];
    };

    // ─── Master compressor (shared per-sound, created inline) ─────────────
    const makeComp = (ctx: AudioContext, now: number): DynamicsCompressorNode => {
      const c = ctx.createDynamicsCompressor();
      c.threshold.setValueAtTime(-18, now);
      c.knee.setValueAtTime(10, now);
      c.ratio.setValueAtTime(4, now);
      c.attack.setValueAtTime(0.002, now);
      c.release.setValueAtTime(0.1, now);
      c.connect(ctx.destination);
      return c;
    };

    // ─── SOUND: auth ──────────────────────────────────────────────────────
    // Rising two-tone bell chime  (inspired by Slack / iMessage notifications)
    const playAuth = async () => {
      const ctx = await getCtx(); if (!ctx) return;
      const now = ctx.currentTime + 0.001;
      const vol = 0.30 * qv * mv;
      const dest = makeComp(ctx, now);

      // Bell tone 1 – C#5 (554 Hz)
      const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
      o1.type = "sine";
      o1.frequency.setValueAtTime(554, now);
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.linearRampToValueAtTime(vol, now + 0.006);
      g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      chain(o1, g1, dest); o1.start(now); o1.stop(now + 0.24);

      // Soft triangle overtone for warmth
      const o1h = ctx.createOscillator(); const g1h = ctx.createGain();
      o1h.type = "triangle";
      o1h.frequency.setValueAtTime(1108, now);
      g1h.gain.setValueAtTime(0.0001, now);
      g1h.gain.linearRampToValueAtTime(vol * 0.18, now + 0.005);
      g1h.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      chain(o1h, g1h, dest); o1h.start(now); o1h.stop(now + 0.14);

      // Bell tone 2 – A5 (880 Hz), delayed 80 ms
      const t2 = now + 0.08;
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(880, t2);
      g2.gain.setValueAtTime(0.0001, t2);
      g2.gain.linearRampToValueAtTime(vol * 0.82, t2 + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.28);
      chain(o2, g2, dest); o2.start(t2); o2.stop(t2 + 0.30);

      // Sparkle overtone for tone 2
      const o2h = ctx.createOscillator(); const g2h = ctx.createGain();
      o2h.type = "triangle";
      o2h.frequency.setValueAtTime(1760, t2);
      g2h.gain.setValueAtTime(0.0001, t2);
      g2h.gain.linearRampToValueAtTime(vol * 0.12, t2 + 0.004);
      g2h.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.14);
      chain(o2h, g2h, dest); o2h.start(t2); o2h.stop(t2 + 0.16);
    };

    // ─── SOUND: add-cart ──────────────────────────────────────────────────
    // Two-tone ascending "da-ding" reward chime (like a shop till / Mario coin)
    const playAddCart = async () => {
      const ctx = await getCtx(); if (!ctx) return;
      const now = ctx.currentTime + 0.001;
      const vol = 0.32 * qv * mv;
      const dest = makeComp(ctx, now);

      // Note 1 – G4 (392 Hz)
      const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
      o1.type = "sine";
      o1.frequency.setValueAtTime(392, now);
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.linearRampToValueAtTime(vol, now + 0.006);
      g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      chain(o1, g1, dest); o1.start(now); o1.stop(now + 0.15);

      // Note 2 – C6 (1047 Hz), delayed 70 ms
      const t2 = now + 0.07;
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(1047, t2);
      g2.gain.setValueAtTime(0.0001, t2);
      g2.gain.linearRampToValueAtTime(vol * 0.90, t2 + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.24);
      chain(o2, g2, dest); o2.start(t2); o2.stop(t2 + 0.26);

      // Metallic sparkle – C7 (2093 Hz) triangle, same offset
      const o3 = ctx.createOscillator(); const g3 = ctx.createGain();
      o3.type = "triangle";
      o3.frequency.setValueAtTime(2093, t2);
      g3.gain.setValueAtTime(0.0001, t2);
      g3.gain.linearRampToValueAtTime(vol * 0.22, t2 + 0.004);
      g3.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.11);
      chain(o3, g3, dest); o3.start(t2); o3.stop(t2 + 0.13);
    };

    // ─── SOUND: count-up ─────────────────────────────────────────────────
    // Short upward blip (typewriter + key click feel)
    const playCountUp = async () => {
      const ctx = await getCtx(); if (!ctx) return;
      const now = ctx.currentTime + 0.001;
      const vol = 0.24 * qv * mv;
      const dest = makeComp(ctx, now);

      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(560, now);
      o.frequency.exponentialRampToValueAtTime(880, now + 0.055);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      chain(o, g, dest); o.start(now); o.stop(now + 0.08);

      // Tiny tick transient
      const ot = ctx.createOscillator(); const gt = ctx.createGain();
      ot.type = "square";
      ot.frequency.setValueAtTime(1800, now);
      gt.gain.setValueAtTime(0.0001, now);
      gt.gain.linearRampToValueAtTime(vol * 0.06, now + 0.002);
      gt.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      chain(ot, gt, dest); ot.start(now); ot.stop(now + 0.014);
    };

    // ─── SOUND: count-down ───────────────────────────────────────────────
    // Short downward blip (softer, muted)
    const playCountDown = async () => {
      const ctx = await getCtx(); if (!ctx) return;
      const now = ctx.currentTime + 0.001;
      const vol = 0.20 * qv * mv;
      const dest = makeComp(ctx, now);

      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(560, now);
      o.frequency.exponentialRampToValueAtTime(300, now + 0.06);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
      chain(o, g, dest); o.start(now); o.stop(now + 0.09);
    };

    // ─── SOUND: delete ────────────────────────────────────────────────────
    // Low descending "whomp" + noise swipe  (Tinder-swipe / iOS delete feel)
    const playDelete = async () => {
      const ctx = await getCtx(); if (!ctx) return;
      const now = ctx.currentTime + 0.001;
      const vol = 0.28 * qv * mv;
      const dest = makeComp(ctx, now);

      // Sub thud – drops from 220 → 55 Hz
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(220, now);
      o.frequency.exponentialRampToValueAtTime(55, now + 0.10);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      chain(o, g, dest); o.start(now); o.stop(now + 0.14);

      // Noise swipe – bandpass sweeps 1400 → 220 Hz
      const ns = ctx.createBufferSource(); ns.buffer = getNoise(ctx);
      const filt = ctx.createBiquadFilter(); const ng = ctx.createGain();
      filt.type = "bandpass";
      filt.frequency.setValueAtTime(1400, now);
      filt.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      filt.Q.setValueAtTime(0.6, now);
      ng.gain.setValueAtTime(0.0001, now + 0.003);
      ng.gain.linearRampToValueAtTime(vol * 0.55, now + 0.012);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      chain(ns, filt, ng, dest); ns.start(now + 0.003); ns.stop(now + 0.14);
    };

    // ─── SOUND: default — soft muted key tap ─────────────────────────────
    // A warm, very short "tock" inspired by macOS / Notion UI micro-interactions.
    // Fundamental sine at ~400 Hz decays in ~80 ms; a quiet triangle overtone adds
    // just enough body without harshness. Tiny per-click pitch jitter keeps it
    // feeling natural rather than mechanical.
    const playDefault = async () => {
      const ctx = await getCtx(); if (!ctx) return;
      const now = ctx.currentTime + 0.001;
      const jitter = () => 1 + (Math.random() * 2 - 1) * 0.035;
      const vol = (isMobile ? 0.16 : 0.22) * qv;
      const dest = makeComp(ctx, now);

      // Warm fundamental — short sine pluck
      const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
      const f1 = ctx.createBiquadFilter();
      o1.type = "sine";
      const baseHz = (isMobile ? 390 : 420) * jitter();
      o1.frequency.setValueAtTime(baseHz, now);
      // Tiny frequency droop gives it a "key landing" feel
      o1.frequency.linearRampToValueAtTime(baseHz * 0.88, now + 0.055);
      f1.type = "lowpass"; f1.frequency.setValueAtTime(1800, now); f1.Q.setValueAtTime(0.5, now);
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.linearRampToValueAtTime(vol, now + 0.003);
      g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.075 + Math.random() * 0.015);
      chain(o1, f1, g1, dest); o1.start(now); o1.stop(now + 0.095);

      // Soft triangle overtone — one octave up, much quieter
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.type = "triangle";
      o2.frequency.setValueAtTime(baseHz * 2 * jitter(), now);
      g2.gain.setValueAtTime(0.0001, now);
      g2.gain.linearRampToValueAtTime(vol * 0.22, now + 0.003);
      g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);
      chain(o2, g2, dest); o2.start(now); o2.stop(now + 0.045);
    };

    // ─── Sound router ─────────────────────────────────────────────────────
    const playSound = async (type: string) => {
      try {
        switch (type) {
          case "auth":       await playAuth();       break;
          case "add-cart":   await playAddCart();    break;
          case "count-up":   await playCountUp();    break;
          case "count-down": await playCountDown();  break;
          case "delete":     await playDelete();     break;
          default:           await playDefault();    break;
        }
      } catch {
        // Ignore browser audio-policy / runtime errors.
      }
    };

    // ─── Event wiring ─────────────────────────────────────────────────────
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        "button, a, [role='button'], [data-bubble='true'], [data-sound]",
      ) as HTMLElement | null;
      if (!el) return;
      const type = el.dataset.sound ?? "default";
      void playSound(type);
    };

    // Pre-warm AudioContext on first interaction so subsequent calls are instant.
    const primeAudio = () => {
      void getCtx();
      window.removeEventListener("pointerdown", primeAudio, true);
      window.removeEventListener("keydown",     primeAudio, true);
      window.removeEventListener("touchstart",  primeAudio, true);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerdown", primeAudio,     true);
    window.addEventListener("keydown",     primeAudio,     true);
    window.addEventListener("touchstart",  primeAudio,     true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerdown", primeAudio,     true);
      window.removeEventListener("keydown",     primeAudio,     true);
      window.removeEventListener("touchstart",  primeAudio,     true);
    };
  }, []);

  return null;
}
