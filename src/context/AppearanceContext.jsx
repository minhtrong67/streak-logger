import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'

const AppearanceContext = createContext(null)

const SIZE_KEY = 'streak-dashboard:fontSize'
const COLOR_KEY = 'streak-dashboard:colorTheme'
const RANDOM_KEY = 'streak-dashboard:randomColor'

export const FONT_SIZES = {
  sm: { label: 'Small', px: '15px' },
  md: { label: 'Medium', px: '16px' },
  lg: { label: 'Large', px: '18px' },
}

export const COLOR_THEMES = {
  material: { label: 'Material', className: 'theme-material', swatch: '#6750A4' },
  amber: { label: 'Ember', className: 'theme-amber', swatch: '#825500' },
  ocean: { label: 'Ocean', className: 'theme-ocean', swatch: '#0061A4' },
  sky: { label: 'Sky', className: 'theme-sky', swatch: '#38608F' },
  forest: { label: 'Forest', className: 'theme-forest', swatch: '#386A20' },
  mint: { label: 'Mint', className: 'theme-mint', swatch: '#006A60' },
  rose: { label: 'Rose', className: 'theme-rose', swatch: '#8E4956' },
  red: { label: 'Coral', className: 'theme-red', swatch: '#904A43' },
}

const COLOR_KEYS = Object.keys(COLOR_THEMES)

function applySize(size) {
  document.documentElement.style.fontSize = (FONT_SIZES[size] || FONT_SIZES.md).px
}

function applyColor(color) {
  const root = document.documentElement
  Object.values(COLOR_THEMES).forEach((c) => root.classList.remove(c.className))
  root.classList.add((COLOR_THEMES[color] || COLOR_THEMES.amber).className)
}

function randomColorKey(exclude) {
  const pool = exclude ? COLOR_KEYS.filter((k) => k !== exclude) : COLOR_KEYS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function AppearanceProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(() => localStorage.getItem(SIZE_KEY) || 'md')
  const [randomColor, setRandomColorState] = useState(() => localStorage.getItem(RANDOM_KEY) === 'true')
  const savedColor = useRef(localStorage.getItem(COLOR_KEY) || 'material')
  const [colorTheme, setColorThemeState] = useState(() => {
    if (typeof window !== 'undefined' && window.__bootColorTheme) {
      return window.__bootColorTheme
    }
    if (localStorage.getItem(RANDOM_KEY) === 'true') {
      return randomColorKey()
    }
    return savedColor.current
  })

  useEffect(() => { applySize(fontSize) }, [fontSize])
  useEffect(() => { applyColor(colorTheme) }, [colorTheme])

  const setFontSize = useCallback((v) => {
    localStorage.setItem(SIZE_KEY, v)
    setFontSizeState(v)
  }, [])
  const setColorTheme = useCallback((v) => {
    localStorage.setItem(COLOR_KEY, v)
    savedColor.current = v
    setColorThemeState(v)
  }, [])
  const setRandomColor = useCallback((v) => {
    localStorage.setItem(RANDOM_KEY, String(v))
    setRandomColorState(v)
    // Give immediate feedback: swap to a fresh random pick right away when
    // turning it on; restore the saved pick when turning it off.
    setColorThemeState(v ? randomColorKey(colorTheme) : savedColor.current)
  }, [colorTheme])

  const shuffleColor = useCallback(() => {
    setColorThemeState((prev) => randomColorKey(prev))
  }, [])

  const value = useMemo(() => ({
    fontSize, setFontSize,
    colorTheme, setColorTheme,
    randomColor, setRandomColor,
    shuffleColor,
  }), [fontSize, setFontSize, colorTheme, setColorTheme, randomColor, setRandomColor, shuffleColor])

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider')
  return ctx
}
