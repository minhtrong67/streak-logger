import { createContext, useCallback, useContext, useMemo } from 'react'
import vi from '../i18n/vi'

const LangContext = createContext(null)

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/**
 * Ứng dụng chỉ hỗ trợ tiếng Việt nên không có bộ chuyển ngôn ngữ.
 * Hàm `t('khóa.con', { biến: giá trị })` tra chuỗi và thay thế {biến}.
 */
export function LangProvider({ children }) {
  const t = useCallback((path, vars) => {
    let str = getByPath(vi, path) ?? path
    if (vars && typeof str === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, v)
      })
    }
    return str
  }, [])

  const value = useMemo(() => ({ t }), [t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang phải được dùng bên trong LangProvider')
  return ctx
}
