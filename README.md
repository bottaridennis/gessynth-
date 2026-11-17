# Gesture Synth

Sintetizzatore di accordi controllato dai gesti delle mani (webcam + MediaPipe) con tastiera virtuale,
libreria di brani famosi, tutorial iniziale ed esercitazione guidata. Si installa come app (PWA) su
telefono, tablet e computer e funziona anche offline.

## Funzioni

- **Gesti con la webcam**: mano sinistra per l'accordo, mano destra per voicing, volume e ottava.
- **Tastiera virtuale e touch**: per suonare senza webcam, ottimizzata per telefono e desktop.
- **Libreria brani**: 18 brani (Creep, Let It Be, Hotel California, Wonderwall…) con accordi, gradi,
  note di ogni accordo, modalità "passo per passo" con riconoscimento automatico e ascolto del giro.
- **Intro tutorial** al primo avvio ed **esercitazione guidata** in cinque passi.
- **Installabile come app** (Chrome, Edge, Android, iOS/iPadOS) con funzionamento offline.
- Interfaccia in italiano, icone e illustrazioni vettoriali, contrasti AA, target touch da 44 px,
  navigazione da tastiera, rispetto di "riduci movimento".

## Gesti

| Mano sinistra | Grado | | Mano destra (facoltativa) | Effetto |
| :--- | :---: | --- | :--- | :--- |
| 1 dito (indice) | I | | 1 dito | Fondamentale |
| 2 dita | II | | 2 dita | Primo rivolto |
| 3 dita | III | | 3 dita | Settima (maj7 / m7) |
| 4 dita | IV | | 4 dita | Dominante 7 / diminuito 7 |
| Mano aperta | V | | Altezza della mano | Volume |
| Corna (indice e mignolo) | VI | | Pollice in fuori | Un'ottava sotto |
| Pollice, indice e mignolo | VII | | | |
| Pugno chiuso | Silenzio | | | |

Inclinando la mano sinistra a destra l'accordo è **maggiore**, a sinistra **minore**.

Tastiera del computer: `1`–`7` gradi, `M` maggiore/minore, `Q W E R` voicing, `Z C X` ottava,
`↑ ↓` volume, `← →` filtro, `Spazio` audio, `0`/`Esc` stop, `L` brani, `G` gesti, `S` suono,
`H` istruzioni, `P` ascolta il giro, `K` tastiera virtuale.

## Libreria brani

I brani sono in `src/app/synth/songs.ts`: titolo, artista, tonalità, scala e accordi espressi come
gradi (con qualità maggiore/minore). Solo armonia, nessun testo. Un test (`songs.test.ts`) verifica
che ogni grado produca davvero l'accordo indicato, per esempio Creep: `G – B – C – Cm` in Sol maggiore
(I, III maggiore, IV, IV minore). Per aggiungere un brano basta una nuova voce nell'array `SONGS`.

## Installare l'app

- **Chrome / Edge (desktop, Android)**: pulsante *Installa* nell'app o icona di installazione nella barra degli indirizzi.
- **iPhone / iPad**: Safari → *Condividi* → *Aggiungi alla schermata Home* (le istruzioni sono anche nell'app).
- **Store (facoltativo)**: dall'URL pubblicato, [PWABuilder](https://www.pwabuilder.com) genera i pacchetti per
  Google Play, Microsoft Store e App Store partendo dalla stessa PWA.

## Pubblicazione su GitHub Pages

Il deployment è automatico tramite **GitHub Actions** (`.github/workflows/deploy.yml`):

| Evento | Cosa succede |
| :--- | :--- |
| Push su `main` / `master` | lint → test → build → **pubblicazione sul branch `gh-pages`** |
| Pull request | lint → test → build (nessun deploy, solo verifica) |
| *Run workflow* manuale | come un push |

Il workflow **non usa nessuna action esterna** (`uses:`), solo comandi shell: funziona anche se in
*Settings → Actions → General* sono consentite solo le actions di tua proprietà.
Usa il Node preinstallato sul runner e **Bun** (il lockfile è `bun.lock`), compila con `--base-href ./`
così il sito funziona sotto `https://<utente>.github.io/<repo>/`, e verifica con
`scripts/post-build-gh-pages.mjs` che `index.html`, il runtime WASM di MediaPipe, `.nojekyll` e `404.html` siano presenti.

### Attivazione (una sola volta)

1. Fai push su `main` (oppure **Actions → Deploy to GitHub Pages → Run workflow**): la prima esecuzione crea il branch `gh-pages`.
2. Su GitHub apri **Settings → Pages**.
3. In **Build and deployment → Source** seleziona **Deploy from a branch**, poi branch **`gh-pages`** e cartella **`/ (root)`**, e salva.
4. Dopo circa un minuto il sito è online su `https://<tuo-username>.github.io/<nome-repo>/`
   (l'URL compare anche nel riepilogo della run).

> **Nota webcam**: i browser concedono la videocamera (`getUserMedia`) solo in HTTPS; GitHub Pages è HTTPS di default.
> Il runtime WASM di MediaPipe è incluso nel sito (cartella `mediapipe/wasm`), mentre il modello
> `hand_landmarker.task` viene scaricato da `storage.googleapis.com` al primo avvio della camera.


---

## Comandi

```bash
bun install                    # dipendenze (oppure npm install)
bun run dev                    # sviluppo su http://localhost:3000
bun run lint                   # lint
bun run test -- --watch=false  # test unitari
bun run build:gh-pages         # build per GitHub Pages in dist/app/browser
```
