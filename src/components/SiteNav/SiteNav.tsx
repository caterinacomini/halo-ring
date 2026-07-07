'use client';

import { useEffect, useState } from 'react';
import styles from './SiteNav.module.scss';

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#top" className={styles.logo} aria-label="Halo Labs — home">
        <svg className={styles.mark} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        </svg>
        <span className={styles.wordmark}>HALO LABS</span>
      </a>

      <a href="#order" className={styles.cta}>
        <span>Acquista</span>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" className={styles.ctaArrow}>
          <path
            d="M3 8h10M9 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </header>
  );
}
