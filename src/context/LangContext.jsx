import { createContext, useContext, useMemo, useCallback } from 'react'
import vi from '../i18n/vi'

const LangContext = createContext(null)

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/**
 * The app only ever supports Vietnamese — there is no language switcher.
 * `lang` is still exposed (as the fixed string 'vi') because a couple of
 * date-formatting helpers (weekday/month short names) take it as a param.
 */
export function LangProvider({ children }) {
  const t = useCallback((path, vars) => {
    let str = getByPath(vi, path) ?? path
    if (vars && typeof str === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), v)
      })
    }
    return str
  }, [])

  const value = useMemo(() => ({ lang: 'vi', t }), [t])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
