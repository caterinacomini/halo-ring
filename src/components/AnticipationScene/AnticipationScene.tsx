'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import styles from './AnticipationScene.module.scss';

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

const W = 1440;
const H = 300;
const CY = H / 2;

const FLAT = `M0,${CY} L${W},${CY}`;

function buildDisturbedPath(): string {
  const pts: string[] = [];
  const POINTS = 120;
  const knotCenter = 0.3;
  const amplitude = 55;
  const width = 0.08;
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const x = t * W;
    const dist = t - knotCenter;
    const wave = amplitude * Math.exp(-(dist * dist) / (2 * width * width));
    const ripple = amplitude * 0.3 * Math.sin((t - knotCenter) * 80) *
                   Math.exp(-(dist * dist) / (0.8 * width * width));
    if (i === 0) pts.push(`M${x},${CY - wave - ripple}`);
    else pts.push(`L${x},${CY - wave - ripple}`);
  }
  return pts.join(' ');
}

export default function AnticipationScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const morphPathRef = useRef<SVGPathElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const morphPath = morphPathRef.current;
    if (!section || !morphPath) return;

    morphPath.setAttribute('d', buildDisturbedPath());

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.6,
      },
    });

    tl.to(morphPath, {
      morphSVG: FLAT,
      ease: 'power2.inOut',
      duration: 2,
    }, 0);

    tl.fromTo(line1Ref.current, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, ease: 'power3.out', duration: 1.5,
    }, 0.8);

    tl.fromTo(line2Ref.current, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, ease: 'power3.out', duration: 1.5,
    }, 1.2);

    // ── Three.js placeholder ──────────────────────────────────
    // TODO at progress ~0.5: signal HeroScene light shift → calm
    // window.dispatchEvent(new CustomEvent('halo:lightShift', { detail: { phase: 'calm' } }));

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="The Anticipation">
      <div className={styles.panel}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrow__tag}>03</span>
          <span className={styles.eyebrow__text}>L&apos;anticipazione</span>
        </div>

        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="healGlow" x="-10%" y="-200%" width="120%" height="500%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            ref={morphPathRef}
            fill="none"
            stroke="rgba(20,18,16,0.82)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#healGlow)"
          />
        </svg>

        <div className={styles.copy}>
          <span ref={line1Ref} className={styles.copy__line1} style={{ opacity: 0 }}>
            Anticipa la tempesta.
          </span>
          <span ref={line2Ref} className={styles.copy__line2} style={{ opacity: 0 }}>
            Mantiene il silenzio.
          </span>
        </div>
      </div>
    </section>
  );
}
