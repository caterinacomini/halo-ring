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
      {/* Navbar */}
      <header className={styles.navbar} data-hero-anim>
        <a href="#" className={styles.navbar__logo} aria-label="Halo Labs — home">
          <svg
            className={styles.navbar__mark}
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          </svg>
          <span className={styles.navbar__wordmark}>HALO LABS</span>
        </a>

        <a href="#order" className={styles.navbar__cta}>
          <span>Acquista</span>
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            aria-hidden="true"
            className={styles.navbar__ctaArrow}
          >
            <path
              d="M3 13L13 3M13 3H6M13 3V10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </header>

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
