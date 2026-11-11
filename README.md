# 🎵 Gesture Synth

Sintetizzatore polifonico interattivo controllato da gesti delle mani via webcam con MediaPipe Hand Tracking e Web Audio API.

## 🚀 Pubblicazione su GitHub Pages

Questo repository è già configurato al 100% per il deployment automatico su **GitHub Pages** tramite **GitHub Actions** (`.github/workflows/deploy.yml`).

### Come attivare GitHub Pages sul tuo repository GitHub:

1. Fai il push di questo progetto sul tuo repository GitHub (ramo `main` o `master`).
2. Vai su **Settings** del tuo repository su GitHub.
3. Nella barra laterale sinistra, clicca su **Pages** (sotto la sezione *Code and automation*).
4. Sotto **Build and deployment** -> **Source**, seleziona:
   👉 **GitHub Actions** *(invece di "Deploy from a branch")*.
5. Fai un commit o lancia manualmente la workflow da **Actions** -> **Deploy to GitHub Pages** -> **Run workflow**.
6. In circa 1-2 minuti, la Action completerà i test e la build, e il tuo sito sarà online all'indirizzo:
   `https://<tuo-username>.github.io/<nome-repo>/`

> **Nota WebCam**: I browser richiedono HTTPS per accedere alla videocamera (`navigator.mediaDevices.getUserMedia`), e GitHub Pages include HTTPS di default!

---

## 🛠️ Comandi disponibili

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo locale
npm run dev

# Esegui i test unitari
npm test -- --watch=false

# Esegui la build ottimizzata per GitHub Pages
npm run build:gh-pages
```

---

## 🎹 Controlli e Gesti

| Mano Sinistra (Gradi Accordo) | Gesto | Azione |
| :--- | :--- | :--- |
| **I** | 1️⃣ 1 dito | Primo grado |
| **II** | 2️⃣ 2 dita | Secondo grado |
| **III** | 3️⃣ 3 dita | Terzo grado |
| **IV** | 4️⃣ 4 dita | Quarto grado |
| **V** | 5️⃣ 5 dita | Quinto grado |
| **VI** | 🤘 Corna rock | Sesto grado |
| **VII** | 🤟 "I love you" | Settimo grado |
| **Silenzio / Stop** | ✊ **Mano chiusa (Pugno)** | **Nessun suono (Stop immediato)** |
| **Inclinazione mano** | ↗️ / ↖️ | Inclinazione a destra = Maggiore, a sinistra = Minore |

| Mano Destra (Voicing & Inversioni) | Gesto | Azione |
| :--- | :--- | :--- |
| **Root** | 1️⃣ 1 dito | Posizione fondamentale |
| **1st** | 2️⃣ 2 dita | Prima inversione |
| **7th** | 3️⃣ 3 dita | Settima (Maj 7 o Min 7) |
| **Dom / Dim 7** | 4️⃣ 4 dita | Dominante 7 o Diminuita 7 |
| **Mute / Choke** | ✊ **Mano chiusa** | **Mute / Stop** |
| **Altezza mano** | ↕️ Asse verticale | Controllo volume dinamico |
| **Pollice esteso** | 👍 Pollice in fuori | Spostamento ottava |

È inoltre disponibile la modalità virtuale interattiva con barra dei tasti integrata `[K]`, synth shaping rack `[S]`, 14 preset timbrici e 10 scale musicali.
