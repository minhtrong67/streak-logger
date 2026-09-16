import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Natural key used to detect "this is the same entry" on import, so
 * re-importing a file that overlaps with existing data overwrites the
 * matching rows instead of creating duplicates. */
function naturalKey(row) {
  const date = String(row.post_date || '').trim()
  const time = String(row.post_time || '').slice(0, 5).trim()
  const duration = String(row.duration || '').trim().toLowerCase()
  return `${date}|${time}|${duration}`
}

export function useStreakPosts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('streak_posts')
      .select('*')
      .order('post_date', { ascending: false })
      .order('post_time', { ascending: false })
    if (err) setError(err.message)
    else setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (payload) => {
    const { data, error: err } = await supabase
      .from('streak_posts')
      .insert([payload])
      .select()
      .single()
    if (err) throw err
    setItems((prev) => [data, ...prev])
    return data
  }, [])

  const update = useCallback(async (id, payload) => {
    const { data, error: err } = await supabase
      .from('streak_posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    setItems((prev) => prev.map((it) => (it.id === id ? data : it)))
    return data
  }, [])

  const remove = useCallback(async (id) => {
    const { error: err } = await supabase.from('streak_posts').delete().eq('id', id)
    if (err) throw err
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const removeMany = useCallback(async (ids) => {
    const { error: err } = await supabase.from('streak_posts').delete().in('id', ids)
    if (err) throw err
    setItems((prev) => prev.filter((it) => !ids.includes(it.id)))
  }, [])

  /**
   * Imports a batch of rows. Rows that match an existing entry on
   * (post_date + post_time + duration) overwrite that entry instead of
   * creating a duplicate — re-importing the same file (or an updated
   * export of it) is always safe to repeat. Duplicate keys *within* the
   * imported batch itself collapse to the last occurrence, same rule.
   */
  const bulkCreate = useCallback(async (rows) => {
    const existingByKey = new Map(items.map((it) => [naturalKey(it), it]))
    const dedupedByKey = new Map()
    rows.forEach((row) => { dedupedByKey.set(naturalKey(row), row) })

    const toInsert = []
    const toUpdate = []
    dedupedByKey.forEach((row, key) => {
      const existing = existingByKey.get(key)
      if (existing) toUpdate.push({ id: existing.id, payload: row })
      else toInsert.push(row)
    })

    if (toInsert.length) {
      const { error: err } = await supabase.from('streak_posts').insert(toInsert)
      if (err) throw err
    }
    for (const { id, payload } of toUpdate) {
      const { error: err } = await supabase.from('streak_posts').update(payload).eq('id', id)
      if (err) throw err
    }

    await refresh()
    return { inserted: toInsert.length, updated: toUpdate.length }
  }, [items, refresh])

  return { items, loading, error, refresh, create, update, remove, removeMany, bulkCreate }
}
