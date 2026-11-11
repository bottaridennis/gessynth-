# 🎵 Gesture Synth

Sintetizzatore polifonico interattivo controllato da gesti delle mani via webcam con MediaPipe Hand Tracking e Web Audio API.

## 🚀 Pubblicazione su GitHub Pages

Il deployment è automatico tramite **GitHub Actions** (`.github/workflows/deploy.yml`):

| Evento | Cosa succede |
| :--- | :--- |
| Push su `main` / `master` | lint → test → build → **deploy su Pages** |
| Pull request | lint → test → build (nessun deploy, solo verifica) |
| *Run workflow* manuale | come un push |

La pipeline usa **Node 22** e **Bun** (il lockfile del progetto è `bun.lock`), compila con
`--base-href ./` così il sito funziona sotto `https://<utente>.github.io/<repo>/` qualunque sia il nome del repository,
e verifica con `scripts/post-build-gh-pages.mjs` che `index.html`, il runtime WASM di MediaPipe,
`.nojekyll` e `404.html` siano presenti nell'output.

### Attivazione (una sola volta)

1. Su GitHub apri **Settings → Pages**.
2. In **Build and deployment → Source** seleziona **GitHub Actions** *(non "Deploy from a branch")*.
3. Fai push su `main` (oppure **Actions → Deploy to GitHub Pages → Run workflow**).
4. Dopo 1-2 minuti il sito è online su `https://<tuo-username>.github.io/<nome-repo>/`
   (l'URL esatto compare anche nel job *deploy*).

> **Nota webcam**: i browser concedono la videocamera (`getUserMedia`) solo in HTTPS; GitHub Pages è HTTPS di default.
> Il runtime WASM di MediaPipe è incluso nel sito (cartella `mediapipe/wasm`), mentre il modello
> `hand_landmarker.task` viene scaricato da `storage.googleapis.com` al primo avvio della camera.

---

## 🛠️ Comandi disponibili

```bash
# Installa le dipendenze (consigliato Bun, che rispetta bun.lock)
bun install          # oppure: npm install

# Avvia il server di sviluppo locale (http://localhost:3000)
bun run dev

# Lint e test unitari
bun run lint
bun run test -- --watch=false

# Build ottimizzata per GitHub Pages (output in dist/app/browser)
bun run build:gh-pages
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

### Tastiera (modalità virtuale)

`1`–`7` gradi · `M` maggiore/minore · `Q W E R` voicing · `Z X C` ottava · `↑ ↓` volume · `← →` filtro ·
`Spazio` mute · `0` / `Backspace` / `Esc` stop (Esc chiude prima eventuali finestre aperte) · `K` barra tasti · `S` synth rack.

È inoltre disponibile la modalità virtuale interattiva con barra dei tasti integrata `[K]`, synth shaping rack `[S]`, 14 preset timbrici e 10 scale musicali.
