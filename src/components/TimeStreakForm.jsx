import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { toDateTimeLocalValue } from '../utils/date'
import Field from './ui/Field'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import Modal from './ui/Modal'

export default function TimeStreakForm({ open, onClose, onSubmit, initial }) {
  const { t } = useLang()
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState(toDateTimeLocalValue(new Date()))
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Re-sync form fields with `initial` every time the modal opens, so
  // editing a record always shows its current data instead of stale state
  // left over from a previous render of this same form instance.
  useEffect(() => {
    if (!open) return
    setTitle(initial?.title || '')
    setStartAt(initial ? toDateTimeLocalValue(initial.start_at) : toDateTimeLocalValue(new Date()))
    setNote(initial?.note || '')
    setErrors({})
  }, [open, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!title.trim()) nextErrors.title = t('common.required')
    if (!startAt) nextErrors.startAt = t('common.required')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        start_at: new Date(startAt).toISOString(),
        note: note.trim() || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t('timeStreak.editTitle') : t('timeStreak.addTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} loading={saving}>{t('common.save')}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Field label={t('timeStreak.fieldTitle')} required error={errors.title}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('timeStreak.fieldTitlePlaceholder')}
            autoFocus
          />
        </Field>
        <Field label={t('timeStreak.fieldStart')} required error={errors.startAt}>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </Field>
        <Field label={`${t('timeStreak.fieldNote')} (${t('common.optional')})`}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('timeStreak.fieldNotePlaceholder')} />
        </Field>
      </form>
    </Modal>
  )
}
