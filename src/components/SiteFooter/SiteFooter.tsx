'use client';

import { useState } from 'react';
import styles from './SiteFooter.module.scss';

export default function SiteFooter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    // TODO: integrate with newsletter API
    setDone(true);
  };

  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={styles.inner}>
        {/* Top: tagline + newsletter */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.tagline}>
              Ascolta il tuo corpo.<br /><em>Con leggerezza.</em>
            </p>
            <span className={styles.mark}>◎ Halo Ring</span>
          </div>

          <div className={styles.newsletter}>
            <p className={styles.newsletter__label}>Ricevi gli aggiornamenti</p>
            <p className={styles.newsletter__hint}>
              Solo l&apos;essenziale — mai spam, mai rumore.
            </p>
            {done ? (
              <p className={styles.newsletter__done}>Grazie. Ti scriviamo presto.</p>
            ) : (
              <form className={styles.newsletter__form} onSubmit={handleSubmit} noValidate>
                <input
                  type="email"
                  className={styles.newsletter__input}
                  placeholder="tu@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email"
                />
                <button type="submit" className={styles.newsletter__btn} aria-label="Iscriviti">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle: navigation columns */}
        <div className={styles.cols}>
          <div className={styles.col}>
            <span className={styles.col__title}>Prodotto</span>
            <a href="#top" className={styles.col__link}>Halo Ring</a>
            <a href="#features" className={styles.col__link}>Tecnologia</a>
            <a href="#specs" className={styles.col__link}>Specifiche</a>
            <a href="#order" className={styles.col__link}>Ordina</a>
          </div>

          <div className={styles.col}>
            <span className={styles.col__title}>Contatti</span>
            <a href="mailto:ciao@halolabs.it" className={styles.col__link}>ciao@halolabs.it</a>
            <a href="#order" className={styles.col__link}>Assistenza</a>
          </div>

          <div className={styles.col}>
            <span className={styles.col__title}>Social</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.col__link}>Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.col__link}>LinkedIn</a>
          </div>
        </div>

        {/* Bottom: legal */}
        <div className={styles.legal}>
          <span>© 2026 Halo Labs S.r.l. Tutti i diritti riservati.</span>
          <div className={styles.legal__links}>
            <a href="#" className={styles.legal__link}>Privacy</a>
            <a href="#" className={styles.legal__link}>Termini</a>
            <span>Fatto in Italia</span>
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className={styles.wordmark} aria-hidden="true">Halo Ring</div>
      </div>
    </footer>
  );
}
