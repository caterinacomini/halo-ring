'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './SiteLoader.module.scss';

const WORDS = ['Now', 'is', 'the', 'time.'];
const ITALIC_FROM = 1;

const IMAGES = [
  '/images/peso.png',
  '/images/impermeabilita.png',
  '/images/pesca.png',
  '/images/img04.png',
  '/images/tipo.png',
  '/images/8 minuti.png',
  '/images/immagine ambientata anello oro.png',
  '/images/playa.png',
];

// Scattered collage tiles (Floema-style). Positions in %, size in px.
// left/top ordered so consecutive tiles land far apart → round-robin
// image assignment never places the same image next to itself.
const TILES = [
  { left: 22, top: 16, w: 150 },
  { left: 48, top: 8, w: 116 },
  { left: 71, top: 14, w: 200 },
  { left: 12, top: 40, w: 160 },
  { left: 35, top: 30, w: 128 },
  { left: 60, top: 24, w: 112 },
  { left: 83, top: 34, w: 150 },
  { left: 20, top: 64, w: 172 },
  { left: 41, top: 74, w: 136 },
  { left: 63, top: 66, w: 120 },
  { left: 79, top: 60, w: 188, img: '/images/Ceramica opaca.png' },
  { left: 30, top: 50, w: 112 },
  { left: 53, top: 56, w: 104 },
  { left: 88, top: 78, w: 160 },
  { left: 8, top: 80, w: 146 },
  { left: 67, top: 84, w: 150 },
];

export default function SiteLoader() {
  const rootRef  = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root  = rootRef.current;
    const els   = wordsRef.current.filter(Boolean) as HTMLSpanElement[];
    const tiles = tilesRef.current.filter(Boolean) as HTMLDivElement[];
    if (!root || els.length === 0) return;

    // Start deep in Z-space (far, converging to the vanishing point)
    gsap.set(tiles, { z: -2000, opacity: 0, filter: 'blur(6px)', transformOrigin: '50% 50%' });

    const tl = gsap.timeline();

    // Phase 1 — words blur in, grey → black
    els.forEach((el, i) => {
      tl.fromTo(
        el,
        { opacity: 0, filter: 'blur(22px)', color: 'rgba(20,18,16,0.25)' },
        { opacity: 1, filter: 'blur(0px)', color: 'rgba(20,18,16,0.85)', duration: 0.75, ease: 'power2.out' },
        i === 0 ? 0 : '-=0.45'
      );
    });

    // Phase 2 — images drift slowly forward out of depth (Floema pace)
    tl.to({}, { duration: 0.35 });
    tl.to(tiles, {
      z: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 2.0,
      ease: 'power1.out',
      stagger: { each: 0.07, from: 'random' },
    });

    // Phase 3 — curtain rises just as the tiles come to rest
    tl.to(root, {
      yPercent: -100,
      duration: 0.85,
      ease: 'power3.inOut',
      onStart: () => window.dispatchEvent(new CustomEvent('loaderDone')),
      onComplete: () => setHidden(true),
    });
  }, []);

  if (hidden) return null;

  return (
    <div ref={rootRef} className={styles.loader} aria-hidden="true">
      {/* Floema-style scattered collage */}
      <div className={styles.collage}>
        {TILES.map((tile, i) => (
          <div
            key={i}
            ref={(el) => { tilesRef.current[i] = el; }}
            className={styles.tile}
            style={{
              left: `${tile.left}%`,
              top: `${tile.top}%`,
              width: `${tile.w}px`,
              height: `${Math.round(tile.w * 0.7)}px`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.img ?? IMAGES[i % IMAGES.length]} alt="" />
          </div>
        ))}
      </div>

      <p className={styles.phrase}>
        {WORDS.map((word, i) => (
          <span
            key={word}
            ref={(el) => { wordsRef.current[i] = el; }}
            className={i >= ITALIC_FROM ? styles.moment : styles.now}
          >
            {word}{i < WORDS.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </div>
  );
}
