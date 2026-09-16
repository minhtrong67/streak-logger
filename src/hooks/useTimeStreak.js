import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Manages the single time streak record. The app is designed to track
 * exactly one milestone at a time, so this hook exposes a single
 * `streak` object (or null) instead of a list.
 */
export function useTimeStreak() {
  const [streak, setStreak] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('time_streaks')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (err) setError(err.message)
    else setStreak(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const save = useCallback(async (payload) => {
    if (streak) {
      const { data, error: err } = await supabase
        .from('time_streaks')
        .update(payload)
        .eq('id', streak.id)
        .select()
        .single()
      if (err) throw err
      setStreak(data)
      return data
    }
    const { data, error: err } = await supabase
      .from('time_streaks')
      .insert([payload])
      .select()
      .single()
    if (err) throw err
    setStreak(data)
    return data
  }, [streak])

  const remove = useCallback(async () => {
    if (!streak) return
    const { error: err } = await supabase.from('time_streaks').delete().eq('id', streak.id)
    if (err) throw err
    setStreak(null)
  }, [streak])

  return { streak, loading, error, refresh, save, remove }
}
