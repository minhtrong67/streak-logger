import { useState } from 'react'
import { AlertTriangle, HelpCircle, Trash2, X } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { useLang } from '../../context/LangContext'

/**
 * Hộp thoại xác nhận. Mặc định dùng cho thao tác xóa (tone "danger").
 * `onConfirm` có thể async: nút hiện trạng thái đang xử lý và hộp thoại chỉ đóng
 * khi thao tác thành công, để lỗi không bị che khuất.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  confirmIcon: ConfirmIcon = Trash2,
  tone = 'danger',
}) {
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

  const danger = tone === 'danger'
  const HeaderIcon = danger ? AlertTriangle : HelpCircle

  return (
    <Modal open={open} onClose={working ? () => {} : onClose} title={title || t('common.deleteConfirmTitle')} size="sm">
      <div className="flex gap-3">
        <div
          className={`shrink-0 rounded-full p-2 h-fit ${
            danger ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' : 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
          }`}
        >
          <HeaderIcon size={18} />
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">{body || t('common.deleteConfirmBody')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        <Button variant="secondary" icon={X} onClick={onClose} disabled={working}>
          {t('common.cancel')}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} icon={ConfirmIcon} onClick={handleConfirm} loading={working}>
          {confirmLabel || t('common.delete')}
        </Button>
      </div>
    </Modal>
  )
}
