import { useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { useLang } from '../../context/LangContext'

export default function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel }) {
  const { t } = useLang()
  const [working, setWorking] = useState(false)

  const handleConfirm = async () => {
    setWorking(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setWorking(false)
    }
  }

  return (
    <Modal open={open} onClose={working ? () => {} : onClose} title={title || t('common.deleteConfirmTitle')} size="md">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] p-2 h-fit">
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          {body || t('common.deleteConfirmBody')}
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" icon={X} onClick={onClose} disabled={working}>{t('common.cancel')}</Button>
        <Button variant="danger" icon={Trash2} onClick={handleConfirm} loading={working}>
          {confirmLabel || t('common.delete')}
        </Button>
      </div>
    </Modal>
  )
}
