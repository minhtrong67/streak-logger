import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import { AppearanceProvider } from './context/AppearanceContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import TimeStreaks from './pages/TimeStreaks'
import StreakPosts from './pages/StreakPosts'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/time-streaks" replace />} />
        <Route path="/time-streaks" element={<TimeStreaks />} />
        <Route path="/streak-posts" element={<StreakPosts />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LangProvider>
      <ThemeProvider>
        <AppearanceProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </LangProvider>
  )
}
