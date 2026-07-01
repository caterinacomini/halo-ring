'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './SiteLoader.module.scss';

/**
 * Intro loader. Shows for a minimum ~1.2s with an entrance animation
 * (mark draws + rotates, grounding shadow appears) to build anticipation,
 * then lifts away to reveal the site.
 */
export default function SiteLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.set(root, { yPercent: 0 });

    // Entrance — shadow blooms in, mark scales + rotates in, word rises
    const intro = gsap.timeline();
    intro
      .fromTo(
        shadowRef.current,
        { opacity: 0, scaleX: 0.4, scaleY: 0.7 },
        { opacity: 1, scaleX: 1, scaleY: 1, duration: 0.7, ease: 'power2.out' },
        0
      )
      .fromTo(
        markRef.current,
        { opacity: 0, scale: 0.7, rotate: -120 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'power3.out' },
        0
      )
      .fromTo(
        wordRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.15
      );

    // Guaranteed ~1.2s minimum, then lift away to reveal the site
    const timer = window.setTimeout(() => {
      gsap
        .timeline({ onComplete: () => setHidden(true) })
        .to([markRef.current, wordRef.current, shadowRef.current], {
          opacity: 0, y: -14, duration: 0.4, ease: 'power2.in', stagger: 0.04,
        })
        .to(root, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, '-=0.1');
    }, 1200);

    return () => { intro.kill(); window.clearTimeout(timer); };
  }, []);

  if (hidden) return null;

  return (
    <div ref={rootRef} className={styles.loader} aria-hidden="true">
      <div className={styles.stage}>
        <svg
          ref={markRef}
          className={styles.mark}
          viewBox="0 0 48 48"
          width="48"
          height="48"
        >
          <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle
            className={styles.markInner}
            cx="24" cy="24" r="9"
            fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"
          />
        </svg>
        <div ref={shadowRef} className={styles.shadow} />
      </div>
      <div ref={wordRef} className={styles.word}>Halo</div>
    </div>
  );
}
