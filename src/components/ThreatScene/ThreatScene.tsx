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
 * Builds polyline points. progress [0,1]:
 *   0   → flat
 *   0.5 → peak disturbance (knot near center)
 *   1   → back to flat (healed)
 *
 * Amplitude follows sin(π·p) so it rises and falls symmetrically.
 */
function buildPoints(progress: number): string {
  // knotCenter drifts left as scroll advances (wave "passing through")
  const knotCenter = 0.65 - progress * 0.35;
  // amplitude: 0 → peak → 0
  const amplitude = 72 * Math.sin(Math.PI * progress);
  const width = 0.09;

  const pts: string[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const x = t * W;
    const dist = t - knotCenter;
    const wave = amplitude * Math.exp(-(dist * dist) / (2 * width * width));
    // secondary ripple trailing behind the knot
    const ripple =
      amplitude * 0.28 *
      Math.sin((t - knotCenter) * 70) *
      Math.exp(-(dist * dist) / (0.9 * width * width));
    pts.push(`${x},${CY - wave - ripple}`);
  }
  return pts.join(' ');
}

export default function ThreatScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const polyRef = useRef<SVGPolylineElement>(null);
  const cortisolRef = useRef<HTMLDivElement>(null);
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

        // Cortisol: in 20–40%, out 60–80%
        const corIn  = gsap.utils.clamp(0, 1, (p - 0.18) / 0.18);
        const corOut = gsap.utils.clamp(0, 1, (p - 0.60) / 0.18);
        if (cortisolRef.current) {
          cortisolRef.current.style.opacity = String(corIn * (1 - corOut));
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

        {/* Cortisol reading */}
        <div ref={cortisolRef} className={styles.cortisol}>
          <span className={styles.cortisol__value}>+142%</span>
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
