'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ThreatScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const POINTS = 900;
const W = 1440;
const H = 300;
const CY = H / 2;

/**
 * One ECG heartbeat (PQRST complex), phase ∈ [0,1) within a beat.
 * Returns vertical displacement, baseline 0, R-peak ≈ 1.
 *   P  small bump · Q dip · R tall spike · S dip · T medium bump
 */
function ecgBeat(phase: number): number {
  const p = phase - Math.floor(phase); // wrap to [0,1)
  // smooth bump (gaussian) for P and T waves
  const bump = (c: number, w: number, h: number) =>
    h * Math.exp(-((p - c) * (p - c)) / (2 * w * w));
  // sharp triangular spike for Q, R, S
  const spike = (c: number, hw: number, h: number) => {
    const d = Math.abs(p - c);
    return d < hw ? h * (1 - d / hw) : 0;
  };
  return (
    bump(0.18, 0.022, 0.14) +   // P wave
    spike(0.262, 0.012, -0.11) + // Q
    spike(0.288, 0.011, 1.0) +   // R (tall spike)
    spike(0.312, 0.014, -0.32) + // S
    bump(0.46, 0.032, 0.20)      // T wave
  );
}

/**
 * Builds the ECG polyline. `progress` (scroll) raises stress → faster,
 * taller beats; `offset` (time) scrolls the trace left like a monitor.
 */
function buildPoints(progress: number, offset: number): string {
  const stress = Math.sin(Math.PI * Math.max(0, Math.min(1, progress)));
  const beatsAcross = 4 + stress * 4.5; // 4 → ~8.5 beats visible
  const amplitude = 24 + stress * 74;   // calm → spiking

  const pts: string[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const x = t * W;
    const phase = t * beatsAcross + offset;
    const y = CY - ecgBeat(phase) * amplitude;
    pts.push(`${x},${y.toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function ThreatScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const polyRef = useRef<SVGPolylineElement>(null);
  const cortisolRef = useRef<HTMLDivElement>(null);
  const cortisolNumRef = useRef<HTMLSpanElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const poly = polyRef.current;
    if (!section || !poly) return;

    poly.setAttribute('points', buildPoints(0, 0));

    // Initial states
    gsap.set(cortisolRef.current, { opacity: 0 });
    gsap.set(text1Ref.current,   { opacity: 0, y: 12 });
    gsap.set(text2Ref.current,   { opacity: 0, y: 12 });

    // ── ECG draw loop — trace scrolls left over time like a monitor ──
    let raf = 0;
    let offset = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = progressRef.current;
      // beats per second: calm ~1 Hz (60 bpm) → stressed ~2.4 Hz (~145 bpm)
      const stress = Math.sin(Math.PI * Math.max(0, Math.min(1, p)));
      offset += dt * (0.95 + stress * 1.5);
      poly.setAttribute('points', buildPoints(p, offset));
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;

        // Cortisol counter: in 18–36%, out 60–78%
        const corIn  = gsap.utils.clamp(0, 1, (p - 0.18) / 0.18);
        const corOut = gsap.utils.clamp(0, 1, (p - 0.60) / 0.18);
        const corVis = corIn * (1 - corOut);
        if (cortisolRef.current) {
          // opacity
          cortisolRef.current.style.opacity = String(corVis);
          // scale: from 0.4 → 1 as corIn goes 0→1
          const scale = 0.4 + corIn * 0.6;
          cortisolRef.current.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
          // color: light gray → near black
          const lightness = Math.round(72 - corIn * 60); // 72% → 12%
          cortisolRef.current.style.color = `hsl(25, 8%, ${lightness}%)`;
        }
        // count the number
        if (cortisolNumRef.current) {
          cortisolNumRef.current.textContent = `+${Math.round(corIn * 142)}%`;
        }

        // Text 1 "Il tuo corpo sapeva. Tu no." — in 15–30%, out 55–70%
        const t1In  = gsap.utils.clamp(0, 1, (p - 0.14) / 0.16);
        const t1Out = gsap.utils.clamp(0, 1, (p - 0.55) / 0.14);
        if (text1Ref.current) {
          text1Ref.current.style.opacity = String(t1In * (1 - t1Out));
          text1Ref.current.style.transform = `translateX(-50%) translateY(${(1 - t1In) * 12}px)`;
        }

        // Text 2 "Anticipa la tempesta…" — in 65–80%
        const t2In = gsap.utils.clamp(0, 1, (p - 0.65) / 0.18);
        if (text2Ref.current) {
          text2Ref.current.style.opacity = String(t2In);
          text2Ref.current.style.transform = `translateX(-50%) translateY(${(1 - t2In) * 12}px)`;
        }
      },
    });

    return () => { st.kill(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Signal">
      <div className={styles.panel}>

        {/* SVG signal line */}
        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="sigGlow" x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polyline
            ref={polyRef}
            fill="none"
            stroke="rgba(20,18,16,0.48)"
            strokeWidth="1.4"
            strokeLinecap="round"
            filter="url(#sigGlow)"
          />
        </svg>

        {/* Cortisol counter */}
        <div ref={cortisolRef} className={styles.cortisol}>
          <span ref={cortisolNumRef} className={styles.cortisol__value}>+0%</span>
          <span className={styles.cortisol__label}>cortisolo rilevato</span>
        </div>

        {/* Text 1 — threat */}
        <div ref={text1Ref} className={styles.caption} style={{ opacity: 0 }}>
          <em>Il tuo corpo sapeva. Tu no.</em>
        </div>

        {/* Text 2 — anticipation */}
        <div ref={text2Ref} className={`${styles.caption} ${styles['caption--heal']}`} style={{ opacity: 0 }}>
          Anticipa la tempesta.<br />
          <em>Mantiene il silenzio.</em>
        </div>

      </div>
    </section>
  );
}
