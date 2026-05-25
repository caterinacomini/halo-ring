'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './MuseumScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function MuseumScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4,
      },
    });

    // Curtain lifts from top
    tl.to(curtainRef.current, {
      yPercent: -100,
      ease: 'power2.inOut',
      duration: 2,
    }, 0);

    // Ring fades in as curtain lifts
    tl.fromTo(ringWrapRef.current,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'power3.out', duration: 2 },
      0.3
    );

    // Copy rises
    tl.fromTo(copyRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, ease: 'power3.out', duration: 1.5 },
      1.2
    );

    // ── Three.js placeholder ──────────────────────────────────
    // TODO: dispatch 'halo:museumEnter' when curtain is halfway lifted
    // to trigger environment transition in HeroScene clone

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Museum">
      <div className={styles.panel}>
        {/* Ring canvas */}
        <div ref={ringWrapRef} className={styles.ringWrap} style={{ opacity: 0 }}>
          <HeroScene />
        </div>

        {/* Dark curtain that lifts */}
        <div ref={curtainRef} className={styles.curtain} aria-hidden="true" />

        {/* Copy */}
        <div ref={copyRef} className={styles.copy} style={{ opacity: 0 }}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrow__tag}>04</span>
            <span className={styles.eyebrow__text}>Obsidian Edition</span>
          </p>
          <h2 className={styles.headline}>
            Il silenzio ha una forma.<br />
            <em>500 esemplari.</em>
          </h2>
          <p className={styles.sub}>Titanio sinterizzato · Ceramica opaca · Halo Labs 2026</p>
        </div>
      </div>
    </section>
  );
}
