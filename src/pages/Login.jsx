import { useState } from 'react'
import { ShieldCheck, Clock, NotebookText, BarChart3, TriangleAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { isFirebaseConfigured } from '../lib/firebase'
import BrandMark from '../components/BrandMark'
import Button from '../components/ui/Button'
import ThemeSwitcher from '../components/ThemeSwitcher'

/** Logo Google nhiều màu (lucide không có logo thương hiệu). */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

const HIGHLIGHTS = [
  { icon: Clock, text: 'Đếm thời gian trôi qua theo thời gian thực' },
  { icon: NotebookText, text: 'Ghi nhật ký streak, nhập và xuất nhiều định dạng' },
  { icon: BarChart3, text: 'Thống kê trực quan theo ngày, tuần, tháng, năm' },
]

/** Màn hình đăng nhập bằng Google. */
export default function Login() {
  const { signInWithGoogle } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const handleLogin = async () => {
    setBusy(true)
    const message = await signInWithGoogle()
    setBusy(false)
    if (message) toast.error(message)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-end p-4">
        <ThemeSwitcher iconOnly />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="page-enter w-full max-w-md rounded-[var(--radius-modal)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-6 sm:p-8 flex flex-col items-center text-center">
          <BrandMark size={56} />
          <h1 className="mt-5 text-xl sm:text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{t('auth.title')}</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)] leading-relaxed">{t('auth.subtitle')}</p>

          <ul className="mt-6 w-full flex flex-col gap-2.5 text-left">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {!isFirebaseConfigured && (
            <div className="mt-6 w-full flex items-start gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-xs text-left p-3">
              <TriangleAlert size={16} className="shrink-0 mt-0.5" />
              <span>{t('auth.configMissing')}</span>
            </div>
          )}

          <Button
            size="lg"
            variant="outline"
            className="mt-6 w-full !bg-white !text-zinc-800 !border-zinc-300 hover:!bg-zinc-50"
            onClick={handleLogin}
            loading={busy}
            disabled={!isFirebaseConfigured}
          >
            {!busy && <GoogleLogo />}
            {busy ? t('auth.signingIn') : t('auth.google')}
          </Button>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
            <ShieldCheck size={14} className="shrink-0" />
            {t('auth.privacy')}
          </p>
        </div>
      </main>

      <footer className="text-center text-xs text-[var(--color-ink-soft)] px-4 pb-5">{t('app.credit')}</footer>
    </div>
  )
}
