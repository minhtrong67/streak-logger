import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

/** Firestore giới hạn 500 thao tác mỗi batch, dùng 400 để có biên an toàn. */
const BATCH_SIZE = 400

/**
 * Khóa tự nhiên dùng để nhận biết "cùng một mục" khi nhập tệp: nếu nhập lại
 * dữ liệu trùng (ngày + giờ + thời lượng) thì ghi đè thay vì tạo bản sao.
 */
export function naturalKey(row) {
  const date = String(row.post_date || '').trim()
  const time = String(row.post_time || '').slice(0, 5).trim()
  const duration = String(row.duration || '').trim().toLowerCase()
  return `${date}|${time}|${duration}`
}

/** Chia mảng thành các nhóm nhỏ để ghi theo batch. */
function chunk(list, size) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/**
 * Quản lý nhật ký streak của người dùng hiện tại trên Firestore.
 * Dữ liệu nằm ở users/{uid}/streakPosts và được đồng bộ realtime.
 */
export function useStreakPosts() {
  const { user } = useAuth()
  const uid = user?.uid
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Tham chiếu collection chỉ tạo lại khi đổi người dùng.
  const colRef = useMemo(() => (uid ? collection(db, 'users', uid, 'streakPosts') : null), [uid])

  useEffect(() => {
    if (!colRef) return undefined
    setLoading(true)
    const unsubscribe = onSnapshot(
      colRef,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [colRef])

  /** Thêm một nhật ký mới. */
  const create = useCallback(
    async (payload) => {
      const ref = doc(colRef)
      const batch = writeBatch(db)
      batch.set(ref, { ...payload, created_at: serverTimestamp(), updated_at: serverTimestamp() })
      await batch.commit()
      return ref.id
    },
    [colRef],
  )

  /** Cập nhật một nhật ký theo id. */
  const update = useCallback(
    async (id, payload) => {
      const batch = writeBatch(db)
      batch.update(doc(colRef, id), { ...payload, updated_at: serverTimestamp() })
      await batch.commit()
    },
    [colRef],
  )

  /** Xóa nhiều nhật ký (tự chia batch). */
  const removeMany = useCallback(
    async (ids) => {
      for (const group of chunk(ids, BATCH_SIZE)) {
        const batch = writeBatch(db)
        group.forEach((id) => batch.delete(doc(colRef, id)))
        await batch.commit()
      }
    },
    [colRef],
  )

  const remove = useCallback((id) => removeMany([id]), [removeMany])

  /**
   * Nhập hàng loạt. Dòng trùng khóa tự nhiên với dữ liệu đang có sẽ ghi đè
   * mục đó; các dòng trùng nhau ngay trong tệp chỉ giữ dòng xuất hiện sau cùng.
   */
  const bulkCreate = useCallback(
    async (rows) => {
      const existingByKey = new Map(items.map((it) => [naturalKey(it), it]))
      const dedupedByKey = new Map()
      rows.forEach((row) => dedupedByKey.set(naturalKey(row), row))

      const operations = []
      let inserted = 0
      let updated = 0
      dedupedByKey.forEach((row, key) => {
        const existing = existingByKey.get(key)
        if (existing) {
          operations.push({ ref: doc(colRef, existing.id), data: row, merge: true })
          updated += 1
        } else {
          operations.push({ ref: doc(colRef), data: row, merge: false })
          inserted += 1
        }
      })

      for (const group of chunk(operations, BATCH_SIZE)) {
        const batch = writeBatch(db)
        group.forEach(({ ref, data, merge }) => {
          if (merge) batch.set(ref, { ...data, updated_at: serverTimestamp() }, { merge: true })
          else batch.set(ref, { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() })
        })
        await batch.commit()
      }
      return { inserted, updated }
    },
    [items, colRef],
  )

  return { items, loading, error, create, update, remove, removeMany, bulkCreate }
}
