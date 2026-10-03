/**
 * Màu và nhãn cho từng buổi trong ngày, dùng chung cho bảng, modal và biểu đồ
 * để màu luôn nhất quán. Chọn màu gợi đúng thời điểm: sáng là hổ phách của
 * bình minh, trưa là xanh da trời, chiều là xanh ngọc, tối là violet hoàng hôn.
 */
export const PERIOD_TONE = {
  morning: 'warning',
  noon: 'info',
  afternoon: 'success',
  evening: 'violet',
}

export const PERIOD_HEX = {
  morning: '#F59E0B',
  noon: '#0EA5E9',
  afternoon: '#10B981',
  evening: '#7C3AED',
}

export const PERIOD_LABEL = {
  morning: 'Sáng',
  noon: 'Trưa',
  afternoon: 'Chiều',
  evening: 'Tối',
}
