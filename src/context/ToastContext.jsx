import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const push = useCallback((message, type = 'info', duration = 3200) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  const value = useMemo(() => ({
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  }), [push])

  const icons = { success: CheckCircle2, error: XCircle, info: Info }
  const accentClass = {
    success: 'border-l-4 border-[var(--color-success)]',
    error: 'border-l-4 border-[var(--color-danger)]',
    info: 'border-l-4 border-[var(--color-info)]',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] lg:top-auto lg:bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-3 rounded-[var(--radius-card)] glass-surface shadow-[var(--shadow-modal)] px-4 py-3 text-sm text-[var(--color-ink)] ${accentClass[t.type]} animate-[toast-in_.25s_ease]`}
            >
              <Icon size={18} className="mt-0.5 shrink-0 text-[var(--color-ink-soft)]" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => remove(t.id)} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]" aria-label="Đóng">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
