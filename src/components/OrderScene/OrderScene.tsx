'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './OrderScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

// US ring sizes → inner diameter (mm)
const RING_SIZES = [
  { size: '6', mm: 16.5 },
  { size: '7', mm: 17.3 },
  { size: '8', mm: 18.2 },
  { size: '9', mm: 19.0 },
  { size: '10', mm: 19.8 },
  { size: '11', mm: 20.6 },
  { size: '12', mm: 21.4 },
];

const MIN_MM = RING_SIZES[0].mm;
const MAX_MM = RING_SIZES[RING_SIZES.length - 1].mm;

// CSS reference: 96px per inch → px per mm
const DEFAULT_PX_PER_MM = 96 / 25.4;
// ISO/IEC 7810 ID-1 (credit card) dimensions
const CARD_MM = 85.6;
const CARD_RATIO = 53.98 / 85.6;

// Sizing guide steps (Halo copy, Oura-inspired structure)
const GUIDE_STEPS = [
  {
    title: '1° passaggio: Scegli il dito',
    body: 'Per precisione e prestazioni ottimali, indossa Halo Ring sull\'indice, sul medio o sull\'anulare. Evita le dita che hanno una base più stretta rispetto alla nocca.',
  },
  {
    title: '2° passaggio: Trova la misura giusta',
    body: 'Indossa l\'anello di prova per almeno un\'ora, anche di notte. Le dita cambiano volume durante il giorno: la taglia giusta resta comoda in ogni momento.',
  },
  {
    title: '3° passaggio: Conferma la misura',
    body: 'L\'anello deve superare la nocca con una leggera resistenza. Se ruota troppo liberamente, scegli la taglia inferiore per un contatto stabile con i sensori.',
  },
];

function nearestSize(mm: number) {
  return RING_SIZES.reduce((best, s) =>
    Math.abs(s.mm - mm) < Math.abs(best.mm - mm) ? s : best
  );
}

export default function OrderScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<'choose' | 'measure'>('choose');
  const [chosenSize, setChosenSize] = useState<string>('');
  const [diameter, setDiameter] = useState<number>(17.3); // size 7 default
  const [pxPerMm, setPxPerMm] = useState<number>(DEFAULT_PX_PER_MM);
  const [calibrating, setCalibrating] = useState(false);
  const [cardPx, setCardPx] = useState<number>(CARD_MM * DEFAULT_PX_PER_MM);
  const [guideOpen, setGuideOpen] = useState(false);
  const [openStep, setOpenStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [remaining, setRemaining] = useState<number>(500);

  const measured = useMemo(() => nearestSize(diameter), [diameter]);
  const activeSize = mode === 'measure' ? measured.size : chosenSize;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.fromTo(
      innerRef.current,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 65%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    const pin = ScrollTrigger.create({
      trigger: section,
      start: 'center center',
      end: '+=240',
      pin: true,
      pinSpacing: true,
    });

    // Counter rolls 500 → 487 when the section enters view
    const counterProxy = { v: 500 };
    const counterST = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(counterProxy, {
          v: 487,
          duration: 3.0,
          ease: 'power2.out',
          onUpdate: () => setRemaining(Math.round(counterProxy.v)),
        });
      },
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
      pin.kill();
    };
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!guideOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setGuideOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guideOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeSize) return;
    // TODO: integrate with order API
    setSubmitted(true);
  };

  const applyCalibration = () => {
    setPxPerMm(cardPx / CARD_MM);
    setCalibrating(false);
  };

  return (
    <section ref={sectionRef} id="order" className={styles.section} aria-label="Scegli la misura">
      <div ref={innerRef} className={styles.inner} style={{ opacity: 0 }}>
        {/* Left: narrative */}
        <div className={styles.narrative}>
          <h2 className={styles.headline}>
            500 anelli.<br />
            <em>Quale è il tuo?</em>
          </h2>
          <p className={styles.body}>
            Consegna prevista Q4 2026.<br />
            Nessun addebito prima della spedizione.
          </p>

          <div className={styles.counter}>
            <span className={styles.counter__num}>{remaining}</span>
            <span className={styles.counter__label}>posti rimanenti</span>
          </div>
        </div>

        {/* Right: sizing experience */}
        <div className={styles.formWrap}>
          {submitted ? (
            <div className={styles.success}>
              <span className={styles.success__icon}>◎</span>
              <p className={styles.success__title}>Sei dentro.</p>
              <p className={styles.success__body}>
                Misura {activeSize} riservata. Ti contatteremo appena il tuo
                Obsidian Edition è pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.form__field}>
                <span className={styles.form__label}>Misura anello</span>

                {/* Tabs */}
                <div className={styles.tabs} role="tablist" aria-label="Metodo di misura">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'choose'}
                    className={`${styles.tab} ${mode === 'choose' ? styles['tab--active'] : ''}`}
                    onClick={() => setMode('choose')}
                  >
                    Scegli la misura
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'measure'}
                    className={`${styles.tab} ${mode === 'measure' ? styles['tab--active'] : ''}`}
                    onClick={() => setMode('measure')}
                  >
                    Misura con l&apos;anello
                  </button>
                </div>
              </div>

              {mode === 'choose' ? (
                <div className={styles.sizeGrid} role="group" aria-label="Seleziona misura">
                  {RING_SIZES.map(({ size }) => (
                    <button
                      key={size}
                      type="button"
                      className={`${styles.sizeBtn} ${chosenSize === size ? styles['sizeBtn--active'] : ''}`}
                      onClick={() => setChosenSize(size)}
                      aria-pressed={chosenSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.measure}>
                  {/* Immersive stage */}
                  <div className={styles.measure__stage}>
                    <div
                      className={styles.measure__circle}
                      style={{
                        width: `${diameter * pxPerMm}px`,
                        height: `${diameter * pxPerMm}px`,
                      }}
                    />
                    <span className={styles.measure__badge}>
                      Misura <strong>{measured.size}</strong>
                      <em>⌀ {diameter.toFixed(1)} mm</em>
                    </span>
                  </div>

                  <input
                    type="range"
                    className={styles.slider}
                    min={MIN_MM}
                    max={MAX_MM}
                    step={0.1}
                    value={diameter}
                    onChange={(e) => setDiameter(parseFloat(e.target.value))}
                    aria-label="Regola il diametro"
                  />

                  <p className={styles.measure__hint}>
                    Appoggia sullo schermo un anello che già indossi e regola il
                    cerchio finché combacia con il suo diametro interno.
                  </p>

                  <div className={styles.measure__actions}>
                    <button
                      type="button"
                      className={styles.measure__guideCta}
                      onClick={() => setGuideOpen(true)}
                    >
                      Consigli per la misurazione
                      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {calibrating ? null : (
                      <button
                        type="button"
                        className={styles.measure__calibLink}
                        onClick={() => setCalibrating(true)}
                      >
                        Calibra lo schermo
                      </button>
                    )}
                  </div>

                  {calibrating && (
                    <div className={styles.calibrate}>
                      <p className={styles.calibrate__hint}>
                        Appoggia una carta (bancomat, fidelity) e trascina finché i
                        bordi combaciano.
                      </p>
                      <div
                        className={styles.calibrate__card}
                        style={{ width: `${cardPx}px`, height: `${cardPx * CARD_RATIO}px` }}
                      />
                      <input
                        type="range"
                        className={styles.slider}
                        min={CARD_MM * DEFAULT_PX_PER_MM * 0.7}
                        max={CARD_MM * DEFAULT_PX_PER_MM * 1.6}
                        step={0.5}
                        value={cardPx}
                        onChange={(e) => setCardPx(parseFloat(e.target.value))}
                        aria-label="Regola la larghezza della carta"
                      />
                      <button
                        type="button"
                        className={styles.calibrate__done}
                        onClick={applyCalibration}
                      >
                        Fatto
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={!activeSize}>
                <span>Prenota il mio Halo Ring</span>
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p className={styles.legal}>
                Nessun addebito ora · Cancellazione libera · Dati trattati secondo GDPR
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── Sizing guide modal ── */}
      {guideOpen && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Consigli per la misurazione">
          <div className={styles.modal__backdrop} onClick={() => setGuideOpen(false)} />
          <div className={styles.modal__card}>
            <button
              type="button"
              className={styles.modal__close}
              onClick={() => setGuideOpen(false)}
              aria-label="Chiudi"
            >
              <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>

            <h3 className={styles.modal__title}>Halo Ring — Consigli per la misurazione</h3>
            <p className={styles.modal__intro}>
              Il kit di misura Halo ti aiuta a scegliere la taglia più adatta per
              garantire precisione e comfort, giorno e notte. I biosensori leggono
              i tuoi dati solo se l&apos;anello aderisce perfettamente al dito.
            </p>

            <div className={styles.modal__grid}>
              <div className={styles.modal__media}>
                <Image
                  src="/images/mano tipo.png"
                  alt="Mano con Halo Ring"
                  fill
                  sizes="(max-width: 700px) 100vw, 40vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div className={styles.modal__steps}>
                {GUIDE_STEPS.map((step, i) => {
                  const open = openStep === i;
                  return (
                    <div
                      key={step.title}
                      className={`${styles.step} ${open ? styles['step--open'] : ''}`}
                    >
                      <button
                        type="button"
                        className={styles.step__head}
                        onClick={() => setOpenStep(open ? -1 : i)}
                        aria-expanded={open}
                      >
                        <span className={styles.step__title}>{step.title}</span>
                        <span className={styles.step__icon} aria-hidden="true">{open ? '−' : '+'}</span>
                      </button>
                      {open && <p className={styles.step__body}>{step.body}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
