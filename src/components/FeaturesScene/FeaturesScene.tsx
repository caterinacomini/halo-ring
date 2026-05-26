'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './FeaturesScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    id: 'biosensor',
    icon: '◎',
    label: '01',
    title: 'Aura-Gen™ Biosensor',
    body: 'Doppio fotodiodo. HRV, SpO₂ e temperatura cutanea ogni secondo.',
  },
  {
    id: 'predict',
    icon: '⧖',
    label: '02',
    title: 'Predizione 8 minuti',
    body: 'Riconosce i pattern HRV che precedono un picco di cortisolo e ti avvisa prima.',
  },
  {
    id: 'ceramic',
    icon: '◆',
    label: '03',
    title: 'Ceramica opaca',
    body: 'Titanio sinterizzato. Anti-graffio. Impermeabile fino a 100 m.',
  },
];

export default function FeaturesScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Init each line hidden
    linesRef.current.forEach((line) => {
      if (line) {
        const len = 920; // approximate path length (full width line)
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = String(len);
      }
    });

    // Set rows hidden
    rowsRef.current.forEach((row) => {
      if (row) gsap.set(row, { opacity: 0, y: 16 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4,
      },
    });

    FEATURES.forEach((_, i) => {
      const line = linesRef.current[i];
      const row = rowsRef.current[i];
      const offset = i * 1.4;

      if (line) {
        tl.to(line, {
          strokeDashoffset: 0,
          ease: 'power2.inOut',
          duration: 1.2,
        }, offset);
      }

      if (row) {
        tl.to(row, {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
          duration: 1,
        }, offset + 0.5);
      }
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Features">
      <div className={styles.panel}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>
            Ogni dettaglio,<br /><em>deliberato.</em>
          </h2>

          <ul className={styles.list}>
            {FEATURES.map((f, i) => (
              <li key={f.id} className={styles.item}>
                {/* Reveal line — a simple SVG line drawn via strokeDashoffset */}
                <svg
                  className={styles.item__lineSvg}
                  viewBox="0 0 920 1"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <line
                    ref={(el) => { linesRef.current[i] = el; }}
                    x1="0" y1="0.5" x2="920" y2="0.5"
                    stroke="rgba(20,18,16,0.18)"
                    strokeWidth="1"
                  />
                </svg>

                <div
                  ref={(el) => { rowsRef.current[i] = el; }}
                  className={styles.item__row}
                >
                  <span className={styles.item__num}>{f.label}</span>
                  <span className={styles.item__icon} aria-hidden="true">{f.icon}</span>
                  <div className={styles.item__content}>
                    <h3 className={styles.item__title}>{f.title}</h3>
                    <p className={styles.item__body}>{f.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
