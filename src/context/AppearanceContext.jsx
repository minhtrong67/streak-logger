import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppearanceContext = createContext(null)

const SIZE_KEY = 'streak-logger:fontSize'

/** 3 mức cỡ chữ, áp dụng lên font-size gốc nên toàn bộ giao diện (đơn vị rem) co giãn theo. */
export const FONT_SIZES = {
  sm: { px: '15px' },
  md: { px: '16px' },
  lg: { px: '18px' },
}

export const DEFAULT_FONT_SIZE = 'md'

function applySize(size) {
  document.documentElement.style.fontSize = (FONT_SIZES[size] || FONT_SIZES[DEFAULT_FONT_SIZE]).px
}

export function AppearanceProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(() => {
    const saved = localStorage.getItem(SIZE_KEY)
    return saved in FONT_SIZES ? saved : DEFAULT_FONT_SIZE
  })

  useEffect(() => {
    applySize(fontSize)
  }, [fontSize])

  const setFontSize = useCallback((value) => {
    localStorage.setItem(SIZE_KEY, value)
    setFontSizeState(value)
  }, [])

  const value = useMemo(() => ({ fontSize, setFontSize }), [fontSize, setFontSize])
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance phải được dùng bên trong AppearanceProvider')
  return ctx
}
