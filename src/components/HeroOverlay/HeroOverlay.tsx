'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './HeroOverlay.module.scss';

export default function HeroOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-anim]', {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.15,
        delay: 0.4,
        ease: 'power3.out',
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={styles.overlay}>
      {/* Bottom-left: title */}
      <div className={styles.bottom}>
        <h1 className={styles.title} data-hero-anim>
          Halo<br /><em>Ring</em>
        </h1>
        <p className={styles.sub} data-hero-anim>Aura-Gen™ Biosensor · Obsidian Edition</p>
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint} data-hero-anim>
        <span className={styles.scrollHint__label}>scorri</span>
        <div className={styles.scrollHint__line} />
      </div>
    </div>
  );
}
