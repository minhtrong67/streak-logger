import { Clock, NotebookText, BarChart3, Settings as SettingsIcon } from 'lucide-react'

/** Danh sách trang điều hướng dùng chung cho Sidebar, BottomNav và CommandPalette. */
export const NAV_ITEMS = [
  { to: '/time-streaks', key: 'timeStreaks', icon: Clock },
  { to: '/streak-posts', key: 'streakPosts', icon: NotebookText },
  { to: '/statistics', key: 'statistics', icon: BarChart3 },
  { to: '/settings', key: 'settings', icon: SettingsIcon },
]
