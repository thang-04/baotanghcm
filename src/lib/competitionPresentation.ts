export const competitionRooms = [
  { id: 'gallery-subsidy', name: 'Dấu chân tìm đường', hint: 'Khám phá những mốc chính của hành trình 1911–1930.' },
  { id: 'gallery-three', name: 'Bến cảng ra khơi', hint: 'Tìm hiểu Bến Nhà Rồng và công việc của Văn Ba trên tàu.' },
  { id: 'gallery-ceramics', name: 'Tiếng nói dân tộc', hint: 'Đọc tư liệu về Yêu sách của nhân dân An Nam.' },
  { id: 'gallery-market-economy', name: 'Những điểm dừng cách mạng', hint: 'Theo hành trình Liên Xô – Quảng Châu.' },
  { id: 'gallery-paintings', name: 'Hội tụ tại Hương Cảng', hint: 'Tìm hiểu hội nghị hợp nhất đầu năm 1930.' },
] as const;

export function formatRaceTime(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const value = Math.max(0, Math.floor(ms));
  return `${String(Math.floor(value / 60000)).padStart(2, '0')}:${String(Math.floor(value / 1000) % 60).padStart(2, '0')}.${String(value % 1000).padStart(3, '0')}`;
}

export function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return `"${(/^[\s]*[=+@-]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
}

export const competitionStatus: Record<string, string> = {
  lobby: 'Phòng chờ', countdown: 'Chuẩn bị bắt đầu', running: 'Đang thi', finalized: 'Đã tổng kết', aborted: 'Phiên đã hủy',
  waiting: 'Chờ bắt đầu', racing: 'Đang thi', finished: 'Hoàn thành', withdrawn: 'Rút lui', timed_out: 'Hết giờ',
};
