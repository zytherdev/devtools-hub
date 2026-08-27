
export type Theme = 'light' | 'dark'

export const STORAGE_KEY = 'devtools-theme'
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const saved = localStorage.getItem(STORAGE_KEY)

  return saved === 'dark' ? 'dark' : 'light'
}