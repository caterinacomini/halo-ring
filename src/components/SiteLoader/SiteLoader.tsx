'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './SiteLoader.module.scss';

/**
 * Intro loader. The ring slides in from the side while the title reveals
 * line-by-line from behind a mask (GSAP). Holds a ~1.2s minimum, then
 * lifts away to hand off to the hero (same layout, seamless).
 */
export default function SiteLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.set(root, { yPercent: 0 });
    const lines = linesRef.current?.querySelectorAll('[data-line-inner]') ?? [];

    // Entrance
    const intro = gsap.timeline();
    intro
      .fromTo(
        ringRef.current,
        { xPercent: 150, opacity: 0, rotate: -20 },
        { xPercent: 0, opacity: 1, rotate: 0, duration: 1.1, ease: 'power3.out' },
        0
      )
      .fromTo(
        shadowRef.current,
        { opacity: 0, scaleX: 0.35 },
        { opacity: 1, scaleX: 1, duration: 0.9, ease: 'power2.out' },
        0.2
      )
      .fromTo(
        lines,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power4.out', stagger: 0.12 },
        0.35
      );

    // Guaranteed ~1.2s minimum, then lift away to reveal the site
    const timer = window.setTimeout(() => {
      gsap
        .timeline({ onComplete: () => setHidden(true) })
        .to(ringRef.current, { xPercent: -30, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
        .to(lines, { yPercent: -120, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.06 }, 0)
        .to(shadowRef.current, { opacity: 0, duration: 0.35 }, 0)
        .to(root, { yPercent: -100, duration: 0.75, ease: 'power3.inOut' }, '-=0.15');
    }, 1200);

    return () => { intro.kill(); window.clearTimeout(timer); };
  }, []);

  if (hidden) return null;

  return (
    <div ref={rootRef} className={styles.loader} aria-hidden="true">
      <div ref={linesRef} className={styles.title}>
        <span className={styles.line}><span className={styles.lineInner} data-line-inner>Halo</span></span>
        <span className={styles.line}><em className={styles.lineInner} data-line-inner>Ring</em></span>
      </div>

      <div className={styles.stage}>
        <div ref={ringRef} className={styles.ring}>
          <svg viewBox="0 0 260 180" width="260" height="180" aria-hidden="true">
            <defs>
              <linearGradient id="loaderRing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3a3a42" />
                <stop offset="0.5" stopColor="#141418" />
                <stop offset="1" stopColor="#050507" />
              </linearGradient>
            </defs>
            <ellipse
              cx="130" cy="90" rx="104" ry="60"
              fill="none" stroke="url(#loaderRing)" strokeWidth="34"
            />
            <ellipse
              cx="130" cy="84" rx="104" ry="60"
              fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2"
            />
          </svg>
        </div>
        <div ref={shadowRef} className={styles.shadow} />
      </div>
    </div>
  );
}
