'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SpecsScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Visual components for each dark card ──────────────────────────

function VisualWeight() {
  return (
    <div className={styles.visual}>
      <div className={styles.visual__ring}>◎</div>
      <div className={styles.visual__number}>10.2</div>
      <div className={styles.visual__sub}>grammi</div>
      <div className={styles.visual__divider} />
      <div className={styles.visual__label}>PESO ANELLO</div>
    </div>
  );
}

function VisualBattery() {
  return (
    <div className={styles.visual}>
      <div className={styles.visual__bar}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={styles.visual__barSegment} style={{ opacity: 1 - i * 0.06 }} />
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={`e${i}`} className={`${styles.visual__barSegment} ${styles['visual__barSegment--empty']}`} />
        ))}
      </div>
      <div className={styles.visual__number}>10</div>
      <div className={styles.visual__sub}>giorni</div>
      <div className={styles.visual__divider} />
      <div className={styles.visual__label}>AUTONOMIA</div>
    </div>
  );
}

function VisualWater() {
  return (
    <div className={styles.visual}>
      <div className={styles.visual__waves}>≋</div>
      <div className={styles.visual__number}>100</div>
      <div className={styles.visual__sub}>metri</div>
      <div className={styles.visual__divider} />
      <div className={styles.visual__label}>IMPERMEABILITÀ</div>
    </div>
  );
}

function VisualEdition() {
  return (
    <div className={styles.visual}>
      <div className={styles.visual__counter}>
        <span className={styles.visual__counterNum}>487</span>
        <span className={styles.visual__counterSlash}>/</span>
        <span className={styles.visual__counterTotal}>500</span>
      </div>
      <div className={styles.visual__progress}>
        <span className={styles.visual__progressFill} style={{ width: '97.4%' }} />
      </div>
      <div className={styles.visual__divider} />
      <div className={styles.visual__label}>POSTI RIMASTI</div>
    </div>
  );
}

const SPECS = [
  {
    visual: VisualWeight,
    title: 'Peso',
    desc: 'Più leggero di un foglio A4. Lo dimentichi di avere.',
  },
  {
    visual: VisualBattery,
    title: 'Autonomia',
    desc: 'Dieci giorni di sensori continui. Nessun caricatore in borsa.',
  },
  {
    visual: VisualWater,
    title: 'Impermeabilità',
    desc: 'Nuota, immergiti. Certificato IP68 fino a 100 metri.',
  },
  {
    visual: VisualEdition,
    title: 'Edizione limitata',
    desc: 'Solo 500 esemplari nel mondo. Obsidian Edition, per sempre.',
  },
];

export default function SpecsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    cardsRef.current.forEach((card) => {
      if (card) gsap.set(card, { opacity: 0, y: 36 });
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
      duration: 1.1,
      stagger: 0.16,
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Specifiche">
      <div className={styles.grid}>
        {SPECS.map((s, i) => {
          const Visual = s.visual;
          return (
            <div
              key={s.title}
              ref={(el) => { cardsRef.current[i] = el; }}
              className={styles.card}
            >
              <Visual />
              <div className={styles.card__body}>
                <h3 className={styles.card__title}>{s.title}</h3>
                <p className={styles.card__desc}>{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
