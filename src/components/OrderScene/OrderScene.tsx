'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './OrderScene.module.scss';

gsap.registerPlugin(ScrollTrigger);

const SIZES = ['6', '7', '8', '9', '10', '11', '12'];

export default function OrderScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

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

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: integrate with order API
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} id="order" className={styles.section} aria-label="Pre-order">
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

          {/* Counter */}
          <div className={styles.counter}>
            <span className={styles.counter__num}>487</span>
            <span className={styles.counter__label}>posti rimanenti</span>
          </div>
        </div>

        {/* Right: form */}
        <div className={styles.formWrap}>
          {submitted ? (
            <div className={styles.success}>
              <span className={styles.success__icon}>◎</span>
              <p className={styles.success__title}>Sei dentro.</p>
              <p className={styles.success__body}>
                Ti contatteremo appena il tuo Obsidian Edition è pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.form__field}>
                <label htmlFor="name" className={styles.form__label}>Nome</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="given-name"
                  className={styles.form__input}
                  placeholder="Il tuo nome"
                />
              </div>

              <div className={styles.form__field}>
                <label htmlFor="email" className={styles.form__label}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={styles.form__input}
                  placeholder="tu@esempio.com"
                />
              </div>

              <div className={styles.form__field}>
                <label className={styles.form__label}>Misura anello</label>
                <div className={styles.sizeGrid} role="group" aria-label="Seleziona misura">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.sizeBtn} ${size === s ? styles['sizeBtn--active'] : ''}`}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={!size}>
                <span>Prenota il mio Halo Ring →</span>
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

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2026 Halo Labs S.r.l.</span>
        <span>Privacy · Termini</span>
        <span>Fatto in Italia</span>
      </footer>
    </section>
  );
}
