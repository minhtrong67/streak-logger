import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { toDateTimeLocalValue } from '../utils/date'
import { LIMITS, cleanLine, cleanMultiline, firstError, validateTimeStreak } from '../utils/validation'
import Field from './ui/Field'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import Modal from './ui/Modal'

/** Form thiết lập / sửa mốc thời gian. Dữ liệu được trim và kiểm tra trước khi lưu. */
export default function TimeStreakForm({ open, onClose, onSubmit, initial }) {
  const { t } = useLang()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Đồng bộ lại các trường mỗi lần mở modal để luôn hiển thị đúng dữ liệu hiện tại.
  useEffect(() => {
    if (!open) return
    setTitle(initial?.title || '')
    setStartAt(toDateTimeLocalValue(initial ? initial.start_at : new Date()))
    setNote(initial?.note || '')
    setErrors({})
  }, [open, initial])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const { values, errors: nextErrors } = validateTimeStreak({ title, startAtLocal: startAt, note })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      toast.error(firstError(nextErrors) || t('toast.invalid'))
      return
    }
    setSaving(true)
    try {
      await onSubmit(values)
      onClose()
    } catch {
      // Toast lỗi đã được hiển thị ở trang cha, giữ nguyên modal để người dùng sửa lại.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={initial ? t('timeStreak.editTitle') : t('timeStreak.addTitle')}
      footer={
        <>
          <Button variant="secondary" icon={X} onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button icon={Check} onClick={handleSubmit} loading={saving}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field label={t('timeStreak.fieldTitle')} required error={errors.title}>
          <Input
            value={title}
            maxLength={LIMITS.title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitle(cleanLine(title))}
            placeholder={t('timeStreak.fieldTitlePlaceholder')}
            autoFocus
          />
        </Field>
        <Field label={t('timeStreak.fieldStart')} required error={errors.startAt}>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </Field>
        <Field label={`${t('timeStreak.fieldNote')} (${t('common.optional')})`} error={errors.note}>
          <Textarea
            value={note}
            maxLength={LIMITS.note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setNote(cleanMultiline(note))}
            placeholder={t('timeStreak.fieldNotePlaceholder')}
          />
        </Field>
        {/* Nút ẩn để nhấn Enter trong ô nhập vẫn gửi form. */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  )
}
