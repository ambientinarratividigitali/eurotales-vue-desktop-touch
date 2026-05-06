/**
 * English UI strings.
 * Database values are read from English columns (`name`, `description`,
 * `place`, `caption`, `language`, `category`) with fallback to the
 * Italian field when missing.
 */
export default {
  app: { title: 'Timeline', subtitle: 'Eurotales' },
  ui: {
    loading: 'Loading...',
    back: 'Back',
    close: 'Close',
    filterLanguages: 'Filter languages',
    selectCategory: 'Select category',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    instruction: 'Tap a marker to view details',
  },
  fields: {
    language: 'Language',
    category: 'Category',
    place: 'Place',
    caption: 'Caption',
  },
  errors: {
    fetchFailed: 'Failed to load data',
    maxLanguages: 'You can select at most {n} languages at a time',
    minLanguages: 'You must keep at least {n} language selected',
  },
}
