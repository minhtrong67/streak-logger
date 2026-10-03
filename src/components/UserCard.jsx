import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Button from './ui/Button'
import ConfirmDialog from './ui/ConfirmDialog'

/** Ảnh đại diện Google, nếu không có ảnh thì hiện chữ cái đầu của tên. */
export function Avatar({ user, size = 36 }) {
  const initial = (user?.displayName || user?.email || '?').trim().charAt(0).toUpperCase()
  const style = { width: size, height: size }
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt=""
        style={style}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover shrink-0 bg-[var(--color-surface-2)]"
      />
    )
  }
  return (
    <span
      style={style}
      className="rounded-full shrink-0 flex items-center justify-center bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold text-sm"
    >
      {initial}
    </span>
  )
}

/** Thẻ tài khoản (ảnh, tên, email) kèm nút Đăng xuất có xác nhận. */
export default function UserCard({ compact = false }) {
  const { user, signOut } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success(t('auth.loggedOut'))
    } catch {
      toast.error(t('toast.error'))
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar user={user} size={compact ? 32 : 40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{user?.displayName || user?.email}</p>
          {user?.displayName && <p className="text-xs text-[var(--color-ink-soft)] truncate">{user.email}</p>}
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={LogOut}
          onClick={() => setConfirmOpen(true)}
          aria-label={t('auth.logout')}
          className="shrink-0"
        >
          {!compact && t('auth.logout')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSignOut}
        title={t('auth.logoutTitle')}
        body={t('auth.logoutBody')}
        confirmLabel={t('auth.logout')}
        confirmIcon={LogOut}
        tone="primary"
      />
    </>
  )
}
