# Datarain — Vue 3

Port unificato (IT + EN reattivo) della scena interattiva **Datarain** del progetto Eurotales (Tracce Linguistiche).

## Cos'è
Un'unica pagina con:
- 43 **gocce** che cadono dall'alto in tre profondità (`far` / `medium` / `near`); cliccando una goccia si apre la scheda della relativa "traccia linguistica".
- 5 bottoni **Focus** posizionati sulla scena, ognuno apre una bubble con testo bilingue (IT + EN).
- 1 bottone **Crediti** in alto a sinistra.
- Auto-reload dopo 3 minuti di inattività (come l'originale).

## Stack
- **Vue 3** (Composition API, `<script setup>`)
- **Vite** (build)
- **Pinia** (state + cache localStorage)
- **vue-i18n** (IT default, fallback IT)
- 43 gocce mosse via JS puro (no D3) per ridurre il bundle

## Caratteristiche
- **Cambio lingua reattivo ovunque**: switcher IT/EN nell'header, applicato a tutti i Focus + UI labels. Persistito in `localStorage('datarain-locale')`.
- **CSS con variabili**: tutti i colori, font-size, spaziature in `src/assets/main.css` (`--bubble-red-bg`, `--accent-teal`, `--fs-title`, ecc.) per editing facile.
- **Cache localStorage TTL 24h**: i dati delle 43 tracce sono cachati con versioning (`datarain-v1:tracce`). Anche se ora i dati sono statici, la struttura è già pronta per un fetch da endpoint Directus.
- **Touch-4K ottimizzato**:
  - `tap-min`/`tap-large` come CSS variables, scalate a 64-96px su `@media (min-width: 2560px)`
  - `@media (hover: none)` disattiva effetti hover su touchscreen
  - viewport con `maximum-scale=1.0` e `overscroll-behavior: none`
  - tutti i bottoni e tap target rispettano i minimi touch
- **Fluid typography**: ogni font-size usa `clamp()`, scala da mobile a 4K senza media query manuali.
- **Posizioni in %**: i 5 bottoni Focus hanno coordinate in percentuale del viewport, scalano correttamente da 1080p (originale) a 4K 55".

## Struttura
```
src/
  App.vue               (orchestratore: rain + focus buttons + modali + idle reload)
  main.js               (Vue + Pinia + i18n)
  assets/main.css       (design tokens)
  components/
    PageHeader.vue      (titolo + lang switch)
    RainCanvas.vue      (gocce che cadono, click → modale)
    FocusButtons.vue    (5 Focus + Crediti, posizioni %)
    TraccaModal.vue     (bubble rossa scheda traccia)
    FocusModal.vue      (bubble Focus, 3 varianti: rossa/beige/verde)
    FocusAltText.vue    (testo nella lingua alternativa, sotto <hr>)
  data/tracce.json      (43 record statici)
  locales/
    it.js               (UI + 5 Focus + Crediti)
    en.js               (UI + 5 Focus + Crediti)
  stores/dataStore.js   (Pinia + cache localStorage)

public/
  Immagini/
    Proverbi/*.png      (44 gocce piccole)
    tracce/*.png        (immagini grandi schede)
    Focus/*.png         (5 bottoni focus)
    Mappa/mappa1.png
  assets/
    Tracce_Background.png      (sfondo della scena)
    MappaTracceFullscreen.png  (mappa Europa per Focus 2)
    close_btn_white.png
    close_btn_grey.png
    CreditiBtn.png
```

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build      # output in dist/
```

## Note di design
- **Palette dell'originale conservata**: rosso `#680b23` (bubble traccia), beige `rgb(225 206 175)` (bubble "Cos'è una traccia" + Crediti), verde `rgb(54 92 66)` (bubble "Dove sono le tracce" con mappa), teal `#29CEAE` (sottotitoli e parole italics).
- **Tre dimensioni gocce**: `far` (60-130px, lente), `medium` (90-180px, medie), `near` (120-230px, veloci).
- **ESC chiude le modali**.

## Sorgente dati
L'app supporta due sorgenti, configurabili in `src/stores/dataStore.js` con la costante `USE_DIRECTUS`:

- **`USE_DIRECTUS = true`** (default): fetch da Directus filtrando i 43 ID storici di datarain (`tracce` con `stato_traccia=4` e `id` in lista). Mappa i campi Directus al formato datarain con cambio lingua reattivo (IT ↔ EN). Cache localStorage TTL 24h.
- **`USE_DIRECTUS = false`**: usa il JSON statico `src/data/tracce.json` (lingua mista, niente traduzioni).

**Fallback automatico**: anche con `USE_DIRECTUS = true`, se Directus non risponde o restituisce 0 record, l'app passa automaticamente al JSON statico. Quando attivo Directus, le tracce diventano completamente bilingui (IT/EN) reattive al lang switcher.

### Mappatura campi Directus → datarain
| Directus | datarain | Lingua |
|---|---|---|
| `titolo` / `titles` | `title` | IT / EN |
| `descrizione` / `description` | `descrizione` | IT / EN |
| `approfondimento` / `insight` | `descrizione2` | IT / EN |
| `bibliografia` / `bibliography` | `biblio` | IT / EN |
| `autore_scheda` | `autore` | (mono) |
| `img_cover` | `image` (URL `/assets/{id}`) | (mono) |
| `luogo`, `data`, `materia`, `conservazione`, `misure` | `datibox` (tabella generata) | localizzata |
