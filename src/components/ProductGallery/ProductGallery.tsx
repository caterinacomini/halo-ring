'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ProductGallery.module.scss';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { id: 1, variant: 'Oro Giallo 18K', material: 'Oro giallo 18 carati', price: '€699', image: '/images/immagine anello still life 2.png', hoverImage: '/images/immagine ambientata anello oro.png' },
  { id: 2, variant: 'Titanio Nero', material: 'Titanio grado 5', price: '€349', image: '/images/immagine anello still life 1.png', hoverImage: '/images/immagine ambientata anello nero.png' },
  { id: 3, variant: 'Oro Rosa 18K', material: 'Oro rosa 18 carati', price: '€599', image: '/images/immagine anello still life 3.png', hoverImage: '/images/immagine ambientata anello rosa.png' },
];

export default function ProductGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const banner = bannerRef.current;
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!section || !banner || !panel || !track) return;

    gsap.set(banner, { width: '100%' });
    gsap.set(panel, { width: '0%', opacity: 0 });
    gsap.set(track, { x: 0 });

    // Section = 500vh → 400vh di scroll
    // Phase 1 (0→25%): banner shrinks, panel appears  → 100vh
    // Phase 2 (25→87.5%): track scorre fino all'ultima card → 250vh
    // Hold (87.5→100%): sezione ferma a fine scroll → 50vh prima del rilascio
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });

    // Calcola maxX matematicamente (panel a 0% durante il setup → DOM non misurabile)
    const getMaxX = () => {
      const vw = window.innerWidth;
      const panelWidth = vw * 0.6;
      const cardBase = (vw * 0.5 - 160) * 0.9;
      const marginPerSide = cardBase * (-0.06) + 16;
      const cardLayout = cardBase + 2 * marginPerSide;
      const trackWidth = 24 + 3 * cardLayout + 72; // padding-left + 3 cards + padding-right
      return -(trackWidth - panelWidth);
    };

    tl
      .to(banner, { width: '40%', ease: 'power2.inOut', duration: 1 }, 0)
      .to(panel,  { width: '60%', opacity: 1, ease: 'power2.inOut', duration: 1 }, 0)
      .to(track, {
        x: getMaxX,
        ease: 'none',
        duration: 5,
      }, 1)
      // Hold finale prima del rilascio
      .to({}, { duration: 1 });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.sticky}>

        <div ref={bannerRef} className={styles.banner}>
          <Image
            src="/images/banner.jpg"
            alt="Halo Ring"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            priority
          />
          <div className={styles.banner__overlay}>
            <p className={styles.banner__eyebrow}>Collezione 2025</p>
            <h2 className={styles.banner__title}>Scegli il tuo<br />Halo</h2>
          </div>
        </div>

        <div ref={panelRef} className={styles.panel}>
          <div ref={trackRef} className={styles.panel__track}>
            {CARDS.map((card) => (
              <div
                key={card.id}
                className={`${styles.card} ${hoveredId === card.id ? styles.card__hovered : ''}`}
                onMouseEnter={() => setHoveredId(card.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={styles.card__image}>
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.variant}
                      fill
                      style={{ objectFit: 'cover' }}
                      className={styles.card__img}
                    />
                  )}
                  {card.hoverImage && (
                    <Image
                      src={card.hoverImage}
                      alt={`${card.variant} ambientata`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className={styles.card__img__hover}
                    />
                  )}
                </div>
                <div className={styles.card__info}>
                  <div className={styles.card__text}>
                    <p className={styles.card__material}>{card.material}</p>
                    <h3 className={styles.card__variant}>{card.variant}</h3>
                    <p className={styles.card__price}>{card.price}</p>
                  </div>
                  <button className={styles.card__cta} aria-label="Seleziona">
                    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
