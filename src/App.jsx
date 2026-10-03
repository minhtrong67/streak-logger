import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import { AppearanceProvider } from './context/AppearanceContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import BrandMark from './components/BrandMark'
import { SkeletonCard } from './components/ui/Skeleton'
import TimeStreaks from './pages/TimeStreaks'
import StreakPosts from './pages/StreakPosts'

// Trang thống kê chứa thư viện biểu đồ nặng nên chỉ tải khi người dùng mở trang.
const Statistics = lazy(() => import('./pages/Statistics'))
const Settings = lazy(() => import('./pages/Settings'))

/**
 * Màn hình chờ trong lúc Firebase xác định phiên đăng nhập. Cùng màu với splash
 * của PWA (tím đậm ở giao diện sáng, đen ở giao diện tối) nên chuyển tiếp liền mạch.
 */
function AuthLoading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#5b21b6] dark:bg-zinc-950">
      <div className="pulse-soft">
        <BrandMark size={88} />
      </div>
    </div>
  )
}

function PageFallback() {
  return <SkeletonCard className="max-w-xl" />
}

/** Chỉ hiện ứng dụng khi đã đăng nhập, ngược lại hiện màn hình đăng nhập. */
function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoading />
  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/time-streaks" replace />} />
        <Route path="/time-streaks" element={<TimeStreaks />} />
        <Route path="/streak-posts" element={<StreakPosts />} />
        <Route
          path="/statistics"
          element={
            <Suspense fallback={<PageFallback />}>
              <Statistics />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  // Khi React đã chạy, bỏ nền tạm của giai đoạn khởi động (xem index.html).
  useEffect(() => {
    document.documentElement.classList.remove('booting')
  }, [])

  return (
    <LangProvider>
      <ThemeProvider>
        <AppearanceProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </LangProvider>
  )
}
