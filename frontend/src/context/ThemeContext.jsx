import { createContext, useContext, useLayoutEffect, useState } from 'react'

export const THEMES = [
  { id: 'pink',   label: '분홍', color: '#D88CA6' },
  { id: 'white',  label: '흰색', color: '#6B6B6B' },
  { id: 'purple', label: '보라', color: '#9B7FD4' },
  { id: 'sky',    label: '하늘', color: '#5BBBDC' },
]

// 실제 hex 값 (Recharts SVG 속성, Lucide color prop 등 CSS 변수가 안 되는 곳에 사용)
const THEME_COLORS = {
  pink:   { primary: '#D88CA6', dark: '#B5607E', track: '#F4C0D1', border: '#EDD0DC' },
  white:  { primary: '#6B6B6B', dark: '#383838', track: '#C5C2C0', border: '#D6D3D1' },
  purple: { primary: '#9B7FD4', dark: '#5F4A8C', track: '#C5B2E8', border: '#D5C8F0' },
  sky:    { primary: '#5BBBDC', dark: '#2A7A9C', track: '#99D0E5', border: '#B8E0EF' },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('wallLog_theme') ?? 'pink')

  useLayoutEffect(() => {
    const root = document.documentElement
    THEMES.forEach(({ id }) => root.classList.remove(`theme-${id}`))
    if (theme !== 'pink') root.classList.add(`theme-${theme}`)
    localStorage.setItem('wallLog_theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEME_COLORS[theme] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
