export type RoomFourFlagFrameId = 'soviet-zone' | 'guangdong-zone';

export interface RoomFourFlagFrame {
  id: RoomFourFlagFrameId;
  /** The existing two-part room structure; this is not a new station. */
  zone: 'soviet' | 'guangzhou';
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  /** Both user-provided images are normalized to the same 3:2 display size. */
  dimensions: readonly [number, number];
  textureSrc: string;
  titleVi: string;
  titleEn: string;
  timelineVi: string;
  timelineEn: string;
}

export type RoomFourQuotePanelId = 'soviet-quote' | 'guangzhou-quote';

/**
 * Wall text for the two existing historical zones. These are visual markers
 * only: neither one adds a station, interaction, collider, or route choice.
 */
export interface RoomFourQuotePanel {
  id: RoomFourQuotePanelId;
  zone: 'soviet' | 'guangzhou';
  /** Mounted on the wall opposite the flag within the same existing zone. */
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  dimensions: readonly [number, number];
  quoteLinesVi: readonly string[];
  quoteLinesEn: readonly string[];
  attributionVi: string;
  attributionEn: string;
}

/**
 * Exactly two framed walls are reserved. Every other Room 4 wall is left
 * untouched so it can be customized independently without changing the route,
 * station layout, travel corridor, progress logic, or colliders.
 */
export const ROOM_FOUR_FLAG_FRAMES: readonly RoomFourFlagFrame[] = [
  {
    id: 'soviet-zone',
    zone: 'soviet',
    // Left side in the visitor's entry view of the existing Soviet section.
    // Scene X is mirrored against the entrance camera, hence the +X wall.
    position: [8.72, 3.82, -49.8],
    rotation: [0, -Math.PI / 2, 0],
    dimensions: [6.2, 4.133333333333334],
    textureSrc: '/images/room4/flags/soviet-flag-framed.png',
    titleVi: 'LIÊN XÔ',
    titleEn: 'SOVIET UNION',
    timelineVi: '1923–1924',
    timelineEn: '1923–1924',
  },
  {
    id: 'guangdong-zone',
    zone: 'guangzhou',
    // Right side in the visitor's entry view of the existing Guangzhou/
    // Guangdong section, clear of the central route and Stations 4–5.
    position: [-8.72, 3.82, -27.4],
    rotation: [0, Math.PI / 2, 0],
    dimensions: [6.2, 4.133333333333334],
    textureSrc: '/images/room4/flags/china-flag-framed.png',
    titleVi: 'QUẢNG CHÂU, TRUNG QUỐC',
    titleEn: 'GUANGZHOU, CHINA',
    timelineVi: '1924–1927',
    timelineEn: '1924–1927',
  },
] as const;

/**
 * The paired quotations turn each side wall into a distinct reading moment:
 * Moscow foregrounds international solidarity; Guangzhou foregrounds the
 * organisational work that carries the journey home.
 */
export const ROOM_FOUR_QUOTE_PANELS: readonly RoomFourQuotePanel[] = [
  {
    id: 'soviet-quote',
    zone: 'soviet',
    // Opposite the Soviet flag; it faces the room rather than the corridor.
    position: [-8.72, 3.5, -49.8],
    rotation: [0, Math.PI / 2, 0],
    // Slightly oversized to give the three-line quotation a clear margin on all sides.
    dimensions: [13.2, 2.95],
    quoteLinesVi: [
      '“Vận mệnh của giai cấp vô sản thế giới và đặc biệt là vận mệnh',
      'của giai cấp vô sản ở các nước đi xâm lược thuộc địa gắn chặt',
      'với vận mệnh của giai cấp bị áp bức ở các thuộc địa”',
    ],
    quoteLinesEn: [
      '“The fate of the world proletariat is closely tied',
      'to the fate of the oppressed in the colonies.”',
    ],
    attributionVi: 'Nguyễn Ái Quốc (Hồ Chí Minh) tại Đại hội lần thứ V của Quốc tế Cộng sản năm 1924',
    attributionEn: '— Nguyen Ai Quoc',
  },
  {
    id: 'guangzhou-quote',
    zone: 'guangzhou',
    // Opposite the Guangzhou flag; it remains clear of Stations 4–5.
    position: [8.72, 3.5, -27.4],
    rotation: [0, -Math.PI / 2, 0],
    // Match the Soviet quote panel so both opposing-wall displays align.
    dimensions: [13.2, 2.95],
    quoteLinesVi: [
      '“Đảng có vững cách mệnh mới thành công, cũng như',
      'người cầm lái có vững thuyền mới chạy.”',
    ],
    quoteLinesEn: [
      '“A revolution succeeds with a firm party,',
      'just as a boat moves with a steady helmsman.”',
    ],
    attributionVi: '— Nguyễn Ái Quốc',
    attributionEn: '— Nguyen Ai Quoc',
  },
] as const;

export const ROOM_FOUR_PHASE_ELEVEN_TYPE_SCALE = {
  thresholdPx: 42,
  exitThresholdPx: 34,
  stationTitlePx: {
    focal: 22,
    standard: 20,
  },
  overlayTitleClass: 'text-3xl sm:text-4xl',
} as const;
