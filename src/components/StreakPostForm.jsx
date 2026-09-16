import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import Field from "./ui/Field";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import { Check, X } from "lucide-react";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function StreakPostForm({ open, onClose, onSubmit, initial }) {
  const { t } = useLang();
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTimeStr());
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Re-sync form fields with `initial` every time the modal opens, so
  // editing a different post always reflects its own data instead of
  // whatever was left in state from the previous time this form was used.
  useEffect(() => {
    if (!open) return;
    setDuration(initial?.duration || "");
    setDate(initial?.post_date || todayStr());
    setTime(initial?.post_time?.slice(0, 5) || nowTimeStr());
    setDescription(initial?.description || "");
    setErrors({});
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!duration.trim()) nextErrors.duration = t("common.required");
    if (!date) nextErrors.date = t("common.required");
    if (!time) nextErrors.time = t("common.required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await onSubmit({
        duration: duration.trim(),
        post_date: date,
        post_time: time,
        description: description.trim() || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t("streakPost.editTitle") : t("streakPost.addTitle")}
      footer={
        <>
          <Button
            size="lg"
            variant="secondary"
            icon={X}
            onClick={onClose}
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            icon={Check}
            loading={saving}
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Field
          label={t("streakPost.fieldDuration")}
          required
          error={errors.duration}
        >
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder={t("streakPost.fieldDurationPlaceholder")}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("streakPost.fieldDate")} required error={errors.date}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label={t("streakPost.fieldTime")} required error={errors.time}>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
        </div>
        <Field
          label={`${t("streakPost.fieldDescription")} (${t("common.optional")})`}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("streakPost.fieldDescriptionPlaceholder")}
            rows={4}
          />
        </Field>
      </form>
    </Modal>
  );
}
