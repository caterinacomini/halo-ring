'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SpecsScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  { value: '10g', label: 'Peso', unit: 'grammi' },
  { value: '10', label: 'Autonomia', unit: 'giorni' },
  { value: '100m', label: 'Impermeabilità', unit: 'profondità' },
  { value: '500', label: 'Esemplari', unit: 'limited edition' },
];

export default function SpecsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Set initial hidden state
    cardsRef.current.forEach((card) => {
      if (card) gsap.set(card, { opacity: 0, y: 32 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(cardsRef.current, {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      duration: 1,
      stagger: 0.14,
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Specs">
      <div className={styles.grid}>
        {SPECS.map((s, i) => (
          <div
            key={s.label}
            ref={(el) => { cardsRef.current[i] = el; }}
            className={styles.card}
          >
            <span className={styles.card__value}>{s.value}</span>
            <span className={styles.card__label}>{s.label}</span>
            <span className={styles.card__unit}>{s.unit}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className={styles.divider} aria-hidden="true" />
    </section>
  );
}
