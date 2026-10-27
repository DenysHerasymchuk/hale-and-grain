import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Language = 'nl' | 'en'

export const languages: { code: Language; label: string; locale: string }[] = [
  { code: 'nl', label: 'Nederlands', locale: 'nl-NL' },
  { code: 'en', label: 'English', locale: 'en-IE' },
]

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

/** Dutch first; the choice is remembered per browser. */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'nl',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'hale-grain-language', storage: createJSONStorage(() => localStorage) },
  ),
)

export const localeFor = (language: Language) => languages.find((l) => l.code === language)?.locale ?? 'nl-NL'

/** For non-React code (API client, formatters) that needs the current language. */
export const currentLanguage = () => useLanguageStore.getState().language
