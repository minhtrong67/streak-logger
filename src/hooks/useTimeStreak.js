import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

/**
 * Quản lý mốc thời gian duy nhất của người dùng.
 * Ứng dụng chỉ theo dõi một mốc nên dữ liệu lưu ở một document cố định:
 * users/{uid}/timeStreaks/current (đồng bộ realtime).
 */
export function useTimeStreak() {
  const { user } = useAuth()
  const uid = user?.uid
  const [streak, setStreak] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const ref = useMemo(() => (uid ? doc(db, 'users', uid, 'timeStreaks', 'current') : null), [uid])

  useEffect(() => {
    if (!ref) return undefined
    setLoading(true)
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setStreak(snap.exists() ? { id: snap.id, ...snap.data() } : null)
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [ref])

  /** Tạo mới hoặc cập nhật mốc thời gian (merge để giữ created_at cũ). */
  const save = useCallback(
    async (payload) => {
      const data = { ...payload, updated_at: serverTimestamp() }
      if (!streak) data.created_at = serverTimestamp()
      await setDoc(ref, data, { merge: true })
    },
    [ref, streak],
  )

  const remove = useCallback(async () => {
    await deleteDoc(ref)
  }, [ref])

  return { streak, loading, error, save, remove }
}
