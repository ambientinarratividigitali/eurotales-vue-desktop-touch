/**
 * Stringhe UI italiane.
 * I valori dal DB sono già in italiano nei campi `nome`, `descrizione`,
 * `luogo`, `dida`, `lingua`, `categoria`. Per l'inglese si leggono
 * `name`, `description`, `place`, `caption`, `language`, `category`
 * con fallback all'italiano se vuoti (gestito in dataStore).
 */
export default {
  app: { title: 'Linea del Tempo', subtitle: 'Eurotales' },
  ui: {
    loading: 'Caricamento...',
    back: 'Indietro',
    close: 'Chiudi',
    filterLanguages: 'Filtra lingue',
    selectCategory: 'Seleziona categoria',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    instruction: 'Tocca un marker per visualizzare i dettagli',
  },
  fields: {
    language: 'Lingua',
    category: 'Categoria',
    place: 'Luogo',
    caption: 'Didascalia',
  },
  errors: {
    fetchFailed: 'Errore nel caricamento dei dati',
    maxLanguages: 'Puoi selezionare al massimo {n} lingue contemporaneamente',
    minLanguages: 'Devi mantenere almeno {n} lingua selezionata',
  },
}
