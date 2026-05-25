'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ThreatScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const POINTS = 120;
const W = 1440;
const H = 300;
const CY = H / 2;

function buildPoints(progress: number): string {
  const knotCenter = 1 - progress * 0.7;
  const amplitude = 72 * progress;
  const width = 0.08;

  const pts: string[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const x = t * W;
    const dist = t - knotCenter;
    const wave = amplitude * Math.exp(-(dist * dist) / (2 * width * width));
    const ripple = amplitude * 0.3 * Math.sin((t - knotCenter) * 80) *
                   Math.exp(-(dist * dist) / (0.8 * width * width));
    pts.push(`${x},${CY - wave - ripple}`);
  }
  return pts.join(' ');
}

export default function ThreatScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const polyRef = useRef<SVGPolylineElement>(null);
  const cortisolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const poly = polyRef.current;
    if (!section || !poly) return;

    poly.setAttribute('points', buildPoints(0));

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        poly.setAttribute('points', buildPoints(self.progress));
        if (cortisolRef.current) {
          const co = gsap.utils.clamp(0, 1, (self.progress - 0.28) / 0.2);
          cortisolRef.current.style.opacity = String(co);
        }
      },
    });

    return () => { st.kill(); };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="The Threat">
      {/* Sticky panel — stays in viewport while section scrolls */}
      <div className={styles.panel}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrow__tag}>02</span>
          <span className={styles.eyebrow__text}>La minaccia silenziosa</span>
        </div>

        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="lineGlow" x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={f * W} y1={0} x2={f * W} y2={H}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1"
            />
          ))}
          <polyline
            ref={polyRef}
            fill="none"
            stroke="rgba(20,18,16,0.82)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#lineGlow)"
          />
        </svg>

        <div ref={cortisolRef} className={styles.cortisol} style={{ opacity: 0 }}>
          <span className={styles.cortisol__value}>+142%</span>
          <span className={styles.cortisol__label}>cortisolo rilevato</span>
        </div>

        <p className={styles.descriptor}>Il tuo corpo sapeva. Tu no.</p>
      </div>
    </section>
  );
}
