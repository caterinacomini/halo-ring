'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SpecsScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    id: 'weight',
    title: 'Peso',
    desc: 'Più leggero di un foglio A4. Lo dimentichi di avere.',
    image: '/images/peso.png',
  },
  {
    id: 'battery',
    title: 'Autonomia',
    desc: 'Dieci giorni di sensori continui. Nessun caricatore in borsa.',
    image: '/images/8 minuti.png',
  },
  {
    id: 'water',
    title: 'Impermeabilità',
    desc: 'Nuota, immergiti. Certificato IP68 fino a 100 metri.',
    image: '/images/impermeabilita.png',
  },
  {
    id: 'edition',
    title: 'Edizione limitata',
    desc: 'Solo 500 esemplari nel mondo. Obsidian Edition, per sempre.',
    image: '/images/tipo.png',
  },
];

export default function SpecsScene() {
  const [activeId, setActiveId] = useState<string>(ITEMS[0].id);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'center center',
      end: '+=240',
      pin: true,
      pinSpacing: true,
    });

    return () => st.kill();
  }, []);

  const activeIndex = ITEMS.findIndex((i) => i.id === activeId);

  const goPrev = () => { if (activeIndex > 0) setActiveId(ITEMS[activeIndex - 1].id); };
  const goNext = () => { if (activeIndex < ITEMS.length - 1) setActiveId(ITEMS[activeIndex + 1].id); };

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Specifiche">
      <div className={styles.box}>

        {/* Full-bleed background images */}
        <div className={styles.box__bg}>
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className={`${styles.box__bgSlot} ${item.id === activeId ? styles['box__bgSlot--visible'] : ''}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center right' }}
              />
            </div>
          ))}
        </div>

        {/* Gradient scrim for text legibility */}
        <span className={styles.box__scrim} aria-hidden="true" />

        {/* Left: accordion content */}
        <div className={styles.box__content}>
          <div className={styles.listWrap}>

            {/* Up/down nav */}
            <div className={styles.navArrows}>
              <button className={styles.navBtn} onClick={goPrev} disabled={activeIndex <= 0} aria-label="Precedente">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className={styles.navBtn} onClick={goNext} disabled={activeIndex >= ITEMS.length - 1} aria-label="Successivo">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <ul className={styles.list}>
              {ITEMS.map((item) => {
                const isOpen = activeId === item.id;
                return (
                  <li key={item.id} className={styles.item}>
                    {isOpen ? (
                      <div className={styles.openCard}>
                        <p className={styles.openCard__text}>
                          <strong className={styles.openCard__title}>{item.title}.</strong>{' '}
                          {item.desc.split('. ').map((sentence, i, arr) => (
                            <span key={i}>
                              {sentence}{i < arr.length - 1 ? '.' : ''}
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    ) : (
                      <button className={styles.pill} onClick={() => setActiveId(item.id)}>
                        <span className={styles.pill__icon} aria-hidden="true">
                          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </span>
                        <span className={styles.pill__label}>{item.title}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
