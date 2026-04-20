export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Labelbase…': 0,
  'Web Interface': 1,
  'Labelbase is ready': 2,
  'Labelbase is not ready': 3,
  'MySQL': 4,
  'Django Application': 5,
  'Waiting for MySQL to be ready': 6,
  'MySQL is ready': 7,
  'Django is ready': 8,
  'Django is not ready': 9,

  // interfaces.ts
  'Web UI': 10,
  'The Labelbase web interface — BIP-329 label management': 11,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
