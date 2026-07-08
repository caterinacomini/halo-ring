'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './HeroOverlay.module.scss';

// Matches SiteLoader total duration before curtain rise
const LOADER_DURATION = 5.0;

const DEFAULT_IMAGE = '/images/pesca.png';
const HOVER_IMAGES = [
  '/images/tipo.png',
  '/images/impermeabilita.png',
  '/images/mano tipo.png',
  '/images/playa.png',
  '/images/immagine ambientata anello oro.png',
];

export default function HeroOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const [bannerImage, setBannerImage] = useState(DEFAULT_IMAGE);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = Array.from(ref.current.querySelectorAll('[data-hero-anim]'));
    if (els.length === 0) return;

    gsap.set(els, { opacity: 0, y: 40 });

    const tl = gsap.timeline({ delay: LOADER_DURATION });
    tl.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power3.out',
    });

    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, []);

  const startCycle = () => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    let i = 0;
    setBannerImage(HOVER_IMAGES[0]);
    cycleRef.current = setInterval(() => {
      i = (i + 1) % HOVER_IMAGES.length;
      setBannerImage(HOVER_IMAGES[i]);
    }, 180);
  };

  const stopCycle = () => {
    if (cycleRef.current) {
      clearInterval(cycleRef.current);
      cycleRef.current = null;
    }
    setBannerImage(DEFAULT_IMAGE);
  };

  return (
    <div ref={ref} className={styles.overlay}>
      {/* Left banner */}
      <a
        href="#order"
        className={styles.banner}
        data-hero-anim
        onMouseEnter={startCycle}
        onMouseLeave={stopCycle}
      >
        <div className={styles.banner__media}>
          <Image
            src={bannerImage}
            alt="Halo Ring indossato"
            fill
            sizes="220px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.banner__text}>
          <p className={styles.banner__copy}>
            Un compagno elegante, pensato per un comfort assoluto.
          </p>
          <span className={styles.banner__cta}>Ordinalo ora</span>
        </div>
      </a>

      <div className={styles.bottom}>
        <h1 className={styles.title} data-hero-anim>
          Halo<br /><em>Ring</em>
        </h1>
        <p className={styles.sub} data-hero-anim>Aura-Gen™ Biosensor · Obsidian Edition</p>
      </div>

      <div className={styles.scrollHint} data-hero-anim>
        <span className={styles.scrollHint__label}>scorri</span>
        <div className={styles.scrollHint__line} />
      </div>
    </div>
  );
}
