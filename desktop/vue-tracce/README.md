# Tracce — Vue 3

Port unificato (IT + EN reattivo) delle pagine **Tracce** del progetto Eurotales.

## Stack
- **Vue 3** (Composition API, `<script setup>`)
- **Vite** (build)
- **Pinia** (state + cache localStorage)
- **vue-i18n** (IT default, EN fallback inverso: il DB è italiano, EN si attiva quando il campo `_inglese`/`titles`/`description`/… è valorizzato)
- **vue-router** (hash mode, niente config server)
- **Leaflet** (mappa principale + mappa scheda)

## Cosa fa
6 viste, una per ogni pagina dell'originale:

| Route             | Componente            | Sostituisce                              |
|-------------------|----------------------|------------------------------------------|
| `/` (home)        | GalleryView           | `gallery/indexHome2.html`                |
| `/mappa`          | MappaView             | `mappa/index.html`                       |
| `/random`         | RandomGalleryView     | `randomGallery/index.html`               |
| `/scheda/:id`     | SchedaView            | `scheda/index.html`                      |
| `/lingua/:nome`   | LinguaView            | `lingue/index.html?lingua=…`             |
| `/tag/:id`        | TagView               | `tag/index.html?tag=…`                   |

## Caratteristiche
- **Cambio lingua reattivo ovunque**: switcher IT/EN nell'header, le label DB e UI si aggiornano senza ricaricare. Le preferenze sono salvate in localStorage (`tracce-locale`).
- **Cache Directus**: tutte le chiamate API hanno cache localStorage TTL 24h con versioning (`CACHE_VERSION`).
- **Reattività ovunque**: filtri, ricerca, ordinamento, sidebar mappa visibile, accordion scheda — tutto reattivo via `computed`/`watch`.
- **Touch-4K ottimizzato**: `tap-min`/`tap-large` come CSS variables, `@media (min-width: 2560px)` per scalare i tap target a 64-96px, `@media (hover: none)` per disattivare effetti hover su touchscreen, viewport con `maximum-scale=1` e `overscroll-behavior: none`.
- **Design tokens** (`src/assets/main.css`): palette beige/burlywood dell'originale, font-size con `clamp()`, spaziature/raggi/ombre standardizzate. Stesso impianto di `risonanze-vue` e `timeline-vue`.

## Mappatura campi DB IT ↔ EN

| Tabella                | Campo IT               | Campo EN              |
|------------------------|------------------------|-----------------------|
| `tracce`               | `titolo`               | `titles`              |
| `tracce`               | `descrizione`          | `description`         |
| `tracce`               | `approfondimento`      | `insight`             |
| `tracce`               | `data`                 | `date`                |
| `tracce`               | `bibliografia`         | `bibliography`        |
| `tracce`               | `conservazione`        | `conservation`        |
| `tipologia`            | `tipologia`            | `typology`            |
| `tags`                 | `tag`                  | `tag_inglese`         |
| `lingue`               | `lingua`               | `language`            |
| `iscrizione`           | `traduzione_italiana`  | `traduzione_inglese`  |
| `sistemi_scrittori`    | `sistemi_scrittori`    | `writing_systems`     |
| `scritture`            | `scritture`            | `writing`             |

L'helper `pick(item, fieldIt, fieldEn, locale)` (in `stores/dataStore.js`) restituisce automaticamente il campo corretto.

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # output in dist/
```

## Note sulle rotte
Uso `createWebHashHistory` (URL con `#`) per evitare la configurazione del web server. Le rotte sono:
- `/#/`          → gallery
- `/#/mappa`     → mappa
- `/#/scheda/42` → dettaglio traccia 42
- `/#/lingua/Latino` → tracce in lingua latina (filtro da nome)
- `/#/tag/3`     → tracce con tag id 3
