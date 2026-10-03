import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'streak-logger:theme'

/** Màu thanh trạng thái trình duyệt/PWA theo giao diện. */
const THEME_COLOR = { light: '#7c3aed', dark: '#18181b' }

/**
 * Áp dụng giao diện lên <html>: class `dark`, meta theme-color và manifest.
 * Manifest bản tối giúp màn hình chờ PWA (theo background_color) khớp giao diện
 * ở lần cập nhật manifest tiếp theo của hệ điều hành.
 */
function applyTheme(mode) {
  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && systemDark)
  root.classList.toggle('dark', isDark)

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? THEME_COLOR.dark : THEME_COLOR.light)
  document
    .getElementById('app-manifest')
    ?.setAttribute('href', isDark ? '/manifest-dark.webmanifest' : '/manifest.webmanifest')
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system')

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Ở chế độ "Hệ thống", tự đổi theo khi người dùng đổi giao diện của thiết bị.
  useEffect(() => {
    if (theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((mode) => setThemeState(mode), [])
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme phải được dùng bên trong ThemeProvider')
  return ctx
}
