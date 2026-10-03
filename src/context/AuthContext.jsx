import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

/** Mã lỗi cho biết popup không dùng được (bị chặn, PWA/in-app browser) nên cần chuyển sang redirect. */
const REDIRECT_FALLBACK_CODES = [
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
]

/** Chuyển mã lỗi Firebase Auth thành thông báo tiếng Việt dễ hiểu. */
function toAuthMessage(err) {
  switch (err?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null // người dùng tự đóng cửa sổ, không cần báo lỗi
    case 'auth/network-request-failed':
      return 'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.'
    case 'auth/unauthorized-domain':
      return 'Tên miền này chưa được cấp phép trong Firebase Authentication.'
    case 'auth/operation-not-allowed':
      return 'Đăng nhập Google chưa được bật trong Firebase Authentication.'
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Khóa API Firebase không hợp lệ. Hãy kiểm tra lại file .env.'
    default:
      return 'Đăng nhập không thành công. Vui lòng thử lại.'
  }
}

/**
 * Quản lý trạng thái đăng nhập. `loading` là true cho tới khi Firebase
 * xác định xong phiên đăng nhập hiện có (tránh nháy màn hình đăng nhập).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  /** Đăng nhập Google. Trả về thông báo lỗi (hoặc null nếu thành công/hủy). */
  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      return null
    } catch (err) {
      if (REDIRECT_FALLBACK_CODES.includes(err?.code)) {
        try {
          await signInWithRedirect(auth, googleProvider)
          return null
        } catch (redirectErr) {
          return toAuthMessage(redirectErr)
        }
      }
      return toAuthMessage(err)
    }
  }, [])

  const signOut = useCallback(() => firebaseSignOut(auth), [])

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return ctx
}
