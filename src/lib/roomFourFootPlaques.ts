import type { RoomFourStationId } from './roomFourJourney';

/**
 * Phase 12 keeps the short, at-object reading layer separate from the longer
 * documentation in the station form. Each plaque has one historical moment
 * and a single deliberate way into that form.
 */
export interface RoomFourFootPlaqueContent {
  timeVi: string;
  timeEn: string;
  eventVi: string;
  eventEn: string;
}

export const ROOM_FOUR_FOOT_PLAQUES: Readonly<Record<RoomFourStationId, RoomFourFootPlaqueContent>> = {
  s1: {
    timeVi: 'Moscow · 1923',
    timeEn: 'Moscow · 1923',
    eventVi: 'Củng cố lý luận tại Trường Đại học Lao động Cộng sản Phương Đông',
    eventEn: 'Strengthen theory at the Communist University of the Toilers of the East.',
  },
  s2: {
    timeVi: '1923-1924',
    timeEn: '1923-1924',
    eventVi: 'Đưa vấn đề thuộc địa lên diễn đàn quốc tế.',
    eventEn: 'Bring the colonial question to international forums.',
  },
  s3: {
    timeVi: '11/1924',
    timeEn: 'Nov 1924',
    eventVi: 'Hành trình từ Liên Xô đến Quảng Châu, mở đầu nhiệm vụ mới.',
    eventEn: 'The journey from the Soviet Union to Guangzhou opens a new mission.',
  },
  s4: {
    timeVi: 'Quảng Châu · 11/11/1924',
    timeEn: 'Guangzhou · 11 Nov 1924',
    eventVi: 'Nguyễn Ái Quốc đến Quảng Châu với bí danh Lý Thụy.',
    eventEn: 'Nguyen Ai Quoc arrives in Guangzhou under the alias Ly Thuy.',
  },
  s5: {
    timeVi: '1925',
    timeEn: '1925',
    eventVi: 'Hình thành hạt nhân và Hội Việt Nam Cách mạng Thanh niên.',
    eventEn: 'Form the nucleus and the Vietnamese Revolutionary Youth League.',
  },
  s6: {
    timeVi: '21/6/1925',
    timeEn: '21 Jun 1925',
    eventVi: 'Báo Thanh niên – Tờ báo cách mạng đầu tiên của Việt Nam.',
    eventEn: "Thanh Nien – Vietnam's first revolutionary newspaper.",
  },
  s7: {
    timeVi: 'Quảng Châu · 1926–1927',
    timeEn: 'Guangzhou · 1926–1927',
    eventVi: 'Nguyễn Ái Quốc mở ba lớp huấn luyện cho 75 thanh niên Việt Nam.',
    eventEn: 'Nguyen Ai Quoc led three training classes for 75 Vietnamese youths.',
  },
  // Retained only for compatibility with historical persisted progress. There
  // is no longer an S8 layout, model, plaque, collider, or interaction point.
  s8: {
    timeVi: '1925-1927',
    timeEn: '1925-1927',
    eventVi: 'Liên kết người, báo chí và tư liệu trở về Việt Nam.',
    eventEn: 'Link people, press and documents returning to Vietnam.',
  },
} as const;
