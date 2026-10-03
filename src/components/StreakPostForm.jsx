import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { LIMITS, cleanLine, cleanMultiline, firstError, validatePost } from '../utils/validation'
import { dateKey } from '../utils/date'
import Field from './ui/Field'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import Modal from './ui/Modal'

const pad = (n) => String(n).padStart(2, '0')
const nowTimeStr = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Form thêm / sửa nhật ký streak. Dữ liệu được trim và kiểm tra trước khi lưu. */
export default function StreakPostForm({ open, onClose, onSubmit, initial }) {
  const { t } = useLang()
  const toast = useToast()
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Đồng bộ lại các trường mỗi lần mở modal.
  useEffect(() => {
    if (!open) return
    setDuration(initial?.duration || '')
    setDate(initial?.post_date || dateKey(new Date()))
    setTime(initial?.post_time?.slice(0, 5) || nowTimeStr())
    setDescription(initial?.description || '')
    setErrors({})
  }, [open, initial])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const { values, errors: nextErrors } = validatePost({ duration, post_date: date, post_time: time, description })
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
      title={initial ? t('streakPost.editTitle') : t('streakPost.addTitle')}
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
        <Field label={t('streakPost.fieldDuration')} required error={errors.duration}>
          <Input
            value={duration}
            maxLength={LIMITS.duration}
            onChange={(e) => setDuration(e.target.value)}
            onBlur={() => setDuration(cleanLine(duration))}
            placeholder={t('streakPost.fieldDurationPlaceholder')}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('streakPost.fieldDate')} required error={errors.date}>
            <Input type="date" value={date} min="1900-01-01" max="2100-12-31" onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={t('streakPost.fieldTime')} required error={errors.time}>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <Field label={`${t('streakPost.fieldDescription')} (${t('common.optional')})`} error={errors.description}>
          <Textarea
            value={description}
            maxLength={LIMITS.description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setDescription(cleanMultiline(description))}
            placeholder={t('streakPost.fieldDescriptionPlaceholder')}
            rows={4}
          />
        </Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  )
}
