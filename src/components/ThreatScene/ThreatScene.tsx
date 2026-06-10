'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ThreatScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const POINTS = 160;
const W = 1440;
const H = 300;
const CY = H / 2;

/**
 * Layered octave noise — organic, never repeating, like a biosignal.
 * Uses irrational-ratio harmonics to avoid visible periodicity.
 */
function bioNoise(x: number): number {
  // 6 octaves at golden-ratio-spaced frequencies, alternating phase
  const layers = [
    [1.000, 17.3,  0.00],
    [0.500, 29.7,  1.57],
    [0.250, 47.1, -0.93],
    [0.125, 78.4,  2.41],
    [0.062, 131.2, -1.76],
    [0.031, 211.6,  0.88],
  ] as const;
  let v = 0, norm = 0;
  for (const [amp, freq, phase] of layers) {
    v    += Math.sin(x * freq + phase) * amp;
    norm += amp;
  }
  return v / norm; // roughly [-1, 1]
}

/**
 * Builds polyline points. progress [0,1]:
 *   0   → flat
 *   0.5 → peak disturbance
 *   1   → healed
 */
function buildPoints(progress: number): string {
  const knotCenter = 0.65 - progress * 0.35;
  // Main amplitude envelope: 0 → peak → 0
  const amplitude = 80 * Math.sin(Math.PI * progress);
  // Disturbance zone widens slightly as stress builds
  const zoneWidth = 0.18 + progress * 0.14;

  const pts: string[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const x = t * W;
    const dist = t - knotCenter;

    // Envelope: gaussian window around the knot
    const envelope = Math.exp(-(dist * dist) / (2 * zoneWidth * zoneWidth));

    // Bio-noise displacement — completely organic shape
    const displacement = bioNoise(t * 3.7 + progress * 1.2) * amplitude * envelope;

    pts.push(`${x},${CY - displacement}`);
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

  useEffect(() => {
    const section = sectionRef.current;
    const poly = polyRef.current;
    if (!section || !poly) return;

    poly.setAttribute('points', buildPoints(0));

    // Initial states
    gsap.set(cortisolRef.current, { opacity: 0 });
    gsap.set(text1Ref.current,   { opacity: 0, y: 12 });
    gsap.set(text2Ref.current,   { opacity: 0, y: 12 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        // Line — disturb and heal
        poly.setAttribute('points', buildPoints(p));

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

    return () => { st.kill(); };
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
