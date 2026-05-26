# Halo Ring — Guida per collaboratori

Benvenuto nel progetto. Questa guida ti porta da zero a sviluppare in locale, passo per passo.

---

## 1. Strumenti necessari

Prima di tutto, assicurati di avere installato sul tuo Mac:

- **Node.js** (versione 18 o superiore) → [nodejs.org](https://nodejs.org) — scarica la versione LTS
- **Git** → già installato su Mac, verifica con `git --version` nel terminale
- **VS Code** (consigliato) → [code.visualstudio.com](https://code.visualstudio.com)

Per verificare che Node sia installato correttamente, apri il Terminale e scrivi:
```bash
node --version
```
Deve rispondere con qualcosa tipo `v20.x.x`.

---

## 2. Accesso al repository

Chiedi a Caterina di invitarti come collaboratore su GitHub. Riceverai una mail con l'invito — accettalo.

Se non hai ancora un account GitHub, creane uno su [github.com](https://github.com).

---

## 3. Clonare il progetto

Apri il Terminale e scegli una cartella dove vuoi mettere il progetto (es. la cartella Documenti):

```bash
cd ~/Documents
git clone https://github.com/catcomin/halo-ring.git
cd halo-ring
```

> Sostituisci l'URL con quello che trovi su GitHub → tasto verde "Code" → copia l'URL HTTPS.

---

## 4. Installare le dipendenze

Una volta dentro la cartella del progetto:

```bash
npm install
```

Questo scarica tutti i pacchetti necessari (Three.js, GSAP, Next.js ecc.). Può volerci qualche minuto la prima volta.

---

## 5. Font locali

Il progetto usa il font **Reckless Neue** che non è incluso nel repo per motivi di licenza.

Chiedi a Caterina i file `.otf` e mettili in questa cartella:

```
public/fonts/
├── RecklessNeue-Light.otf
├── RecklessNeue-LightItalic.otf
├── RecklessNeue-Regular.otf
└── RecklessNeue-RegularItalic.otf
```

---

## 6. Avviare il progetto in locale

```bash
npm run dev
```

Apri il browser su **[http://localhost:3000](http://localhost:3000)** — vedrai il sito girare in locale.

Ogni modifica che salvi si aggiorna automaticamente nel browser.

---

## 7. Struttura del progetto

```
src/
├── app/              → pagina principale (page.tsx) e layout (layout.tsx)
├── components/       → ogni scena è un componente separato
│   ├── HeroScene/    → scena 3D con Three.js
│   ├── ThreatScene/  → animazione SVG con GSAP ScrollTrigger
│   ├── MuseumScene/  → tendina scura
│   ├── FeaturesScene/
│   ├── SpecsScene/
│   └── OrderScene/   → form di pre-ordine
├── styles/           → variabili SCSS, font, reset
└── types/            → tipi TypeScript
public/
├── fonts/            → font locali (vedi punto 5)
└── images/           → assets statici
```

---

## 8. Regole per lavorare in team

### Branch
- **Non lavorare mai direttamente su `main`** — è il branch di produzione
- Crea sempre un branch per le tue modifiche:
  ```bash
  git checkout -b nome-feature
  # esempio: git checkout -b fix-order-form
  ```

### Commit
- Scrivi messaggi di commit chiari e in italiano o inglese:
  ```bash
  git add .
  git commit -m "fix: corregge layout mobile nella OrderScene"
  ```

### Push e Pull Request
1. Fai push del tuo branch:
   ```bash
   git push origin nome-feature
   ```
2. Vai su GitHub → clicca "Compare & pull request"
3. Scrivi cosa hai fatto e manda la PR a Caterina per review

### Prima di iniziare a lavorare
Aggiorna sempre il tuo main locale:
```bash
git checkout main
git pull origin main
```

---

## 9. Deploy

Il deploy è automatico su **[halo-ring-seven.vercel.app](https://halo-ring-seven.vercel.app)**.

Ogni push su `main` triggera un nuovo deploy su Vercel. Non serve fare nulla manualmente.

---

## 10. Problemi comuni

**`npm install` fallisce**
→ Prova con `npm install --legacy-peer-deps`

**Il font non si vede**
→ Controlla che i file `.otf` siano nella cartella `public/fonts/` con i nomi esatti (punto 5)

**La pagina va in crash con un errore Three.js**
→ Assicurati di usare Node 18+. Prova a cancellare la cartella `.next` e riavviare:
```bash
rm -rf .next && npm run dev
```

**Git mi chiede username e password ogni volta**
→ Configura le credenziali una volta sola:
```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua@email.com"
```
E usa SSH invece di HTTPS — chiedi a Caterina.

---

## Contatti

Per qualsiasi problema → scrivi a Caterina su WhatsApp o apri una Issue su GitHub.
