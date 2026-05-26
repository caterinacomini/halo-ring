'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ChaosScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const STRESS_WORDS: Array<{ text: string; top: string; left?: string; right?: string; size: string }> = [
  { text: 'deadline',         top: '7%',  left: '4%',  size: 'clamp(1rem, 2.5vw, 2rem)' },
  { text: 'riunione urgente', top: '13%', right: '6%', size: 'clamp(1.2rem, 3vw, 2.5rem)' },
  { text: 'inbox zero',       top: '24%', left: '14%', size: 'clamp(.9rem, 2vw, 1.6rem)' },
  { text: '12 notifiche',     top: '38%', right: '12%', size: 'clamp(1.1rem, 2.5vw, 2rem)' },
  { text: 'URGENTE',          top: '54%', left: '5%',  size: 'clamp(1.3rem, 3vw, 2.5rem)' },
  { text: 'call tra 2 min',   top: '62%', right: '4%', size: 'clamp(.9rem, 2vw, 1.6rem)' },
  { text: 'pitch domani',     top: '74%', left: '18%', size: 'clamp(1rem, 2.5vw, 2rem)' },
  { text: 'notte in bianco',  top: '84%', right: '18%', size: 'clamp(.8rem, 1.8vw, 1.4rem)' },
  { text: 'battito alto',     top: '44%', left: '2%',  size: 'clamp(.8rem, 1.5vw, 1.2rem)' },
  { text: 'nessun tempo',     top: '30%', left: '70%', size: 'clamp(1rem, 2vw, 1.6rem)' },
];

const NOTIFS = [
  '📱  3 chiamate perse',
  '⚠️  Budget superato',
  '📧  147 non letti',
  '🔔  Meeting in 2 min',
  '💬  Urgente dal CEO',
];

const HRV_PATH =
  'M0,35 L55,35 L75,32 L95,28 L115,14 L125,3 L135,58 L145,30 L165,33 L195,35 L215,30 L235,10 L245,1 L255,62 L265,28 L285,33 L315,35 L345,30 L365,6 L375,0 L385,66 L395,22 L415,33 L445,35 L475,29 L495,4 L505,0 L515,68 L525,18 L545,30 L575,33 L615,30 L655,26 L700,24';

export default function ChaosScene() {
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const cortNumRef = useRef<HTMLDivElement>(null);
  const cortWrapRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const hrvWrapRef = useRef<HTMLDivElement>(null);
  const hrvLineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const wordEls = root.querySelectorAll<HTMLSpanElement>('[data-chaos-word]');
    const notifEls = notifsRef.current?.querySelectorAll<HTMLDivElement>('[data-chaos-notif]') ?? [];

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
          const p = self.progress;

          // Background warms + slight darkening
          if (bgRef.current) {
            const l = (0.9577 - p * 0.12).toFixed(4);
            const c = (0.0059 + p * 0.04).toFixed(4);
            bgRef.current.style.background = `oklch(${l} ${c} 22)`;
          }
          if (grainRef.current) {
            grainRef.current.style.opacity = String(p * 0.45);
          }

          // Cortisol: 142 → 580
          if (cortNumRef.current) {
            cortNumRef.current.textContent = String(Math.round(142 + 438 * p));
            if (p < 0.35) {
              cortNumRef.current.style.color = 'var(--fg, rgba(0,0,0,0.82))';
            } else {
              const f = Math.min(1, (p - 0.35) / 0.65);
              const r = Math.round(39 + 153 * f);
              const g = Math.round(37 - 10 * f);
              const b = Math.round(64 - 21 * f);
              cortNumRef.current.style.color = `rgb(${r}, ${g}, ${b})`;
            }
          }
          if (cortWrapRef.current) {
            cortWrapRef.current.style.animation =
              p > 0.78 ? `${styles.shake} ${Math.max(0.16, 0.35 - p * 0.2)}s infinite` : 'none';
          }

          // Stress words: stagger fade-in
          wordEls.forEach((w, i) => {
            const t = 0.07 + i * 0.06;
            w.style.opacity = String(Math.min(0.1, Math.max(0, (p - t) / 0.12)));
          });

          // Notifications: container then items
          if (notifsRef.current) {
            notifsRef.current.style.opacity = String(Math.max(0, (p - 0.38) / 0.18));
          }
          notifEls.forEach((n, i) => {
            const t = Math.max(0, (p - 0.42 - i * 0.05) / 0.1);
            n.style.opacity = String(Math.min(1, t));
            n.style.transform = `translateX(${24 - t * 24}px)`;
          });

          // HRV line draws in
          if (hrvWrapRef.current) {
            hrvWrapRef.current.style.opacity = String(Math.max(0, (p - 0.18) / 0.2));
          }
          if (hrvLineRef.current) {
            hrvLineRef.current.style.strokeDashoffset = String(
              900 * (1 - Math.min(1, (p - 0.18) / 0.55))
            );
          }
        },
      });

    // Force a measurement after mount (canvas/dynamic imports can shift layout)
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      window.clearTimeout(refreshTimer);
      st.kill();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.scene}>
      <div className={styles.sticky}>
        <div ref={bgRef} className={styles.bg} />
        <div ref={grainRef} className={styles.grain} />

        <div className={styles.words} aria-hidden="true">
          {STRESS_WORDS.map((w, i) => (
            <span
              key={i}
              data-chaos-word
              className={styles.word}
              style={{
                top: w.top,
                left: w.left,
                right: w.right,
                fontSize: w.size,
              }}
            >
              {w.text}
            </span>
          ))}
        </div>

        <div ref={notifsRef} className={styles.notifs}>
          {NOTIFS.map((n, i) => (
            <div key={i} data-chaos-notif className={styles.notif}>
              {n}
            </div>
          ))}
        </div>

        <div ref={cortWrapRef} className={styles.cortisol}>
          <p className={styles.cortisol__eye}>Cortisolo — nmol/L</p>
          <div ref={cortNumRef} className={styles.cortisol__num}>142</div>
          <p className={styles.cortisol__sub}>normale: 138–195 · valori medi mattutini</p>
        </div>

        <div ref={hrvWrapRef} className={styles.hrv}>
          <svg
            viewBox="0 0 700 70"
            preserveAspectRatio="none"
            width="100%"
            height="70"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="hrv-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(192,57,43,0)" />
                <stop offset="30%" stopColor="rgba(192,57,43,.45)" />
                <stop offset="100%" stopColor="#c0392b" />
              </linearGradient>
            </defs>
            <path
              ref={hrvLineRef}
              d={HRV_PATH}
              fill="none"
              stroke="url(#hrv-gradient)"
              strokeWidth={1.2}
              strokeLinejoin="round"
              style={{ strokeDasharray: 900, strokeDashoffset: 900 }}
            />
          </svg>
          <p className={styles.hrv__label}>HRV · variabilità cardiaca in tempo reale</p>
        </div>
      </div>
    </section>
  );
}
