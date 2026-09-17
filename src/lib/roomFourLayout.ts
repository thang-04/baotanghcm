import spatial from './roomFourSpatial.json';

export type RoomFourStationKind =
  | 'study-desk'
  | 'forum-globe'
  | 'guangzhou-travel-dossier'
  | 'ly-thuy-identity-desk'
  | 'guangzhou-headquarters'
  | 'thanh-nien-newspaper-photo'
  | 'guangzhou-training-photo'
  | 'secret-classroom'
  | 'return-map';

export interface RoomFourStationLayout {
  id: 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';
  index: number;
  section: 'threshold' | 'soviet' | 'guangzhou';
  kind: RoomFourStationKind;
  object: readonly [number, number];
  stop: readonly [number, number];
  footprint: readonly [number, number];
  dateVi: string;
  dateEn: string;
  titleVi: string;
  titleEn: string;
  purposeVi: string;
  purposeEn: string;
  focalLevel: 1 | 2 | 3;
}

export interface RoomFourCollider {
  id: string;
  center: readonly [number, number];
  size: readonly [number, number];
}

export interface RoomFourPortalLayout {
  id: string;
  z: number;
  halfSpan: number;
  skin: 'cold-frame' | 'warm-wood' | 'warm-frame';
}

export const ROOM_FOUR_SPATIAL = spatial;

export const ROOM_FOUR_CENTERLINE: ReadonlyArray<readonly [number, number]> = [
  [0, -74],
  [-2.8, -70.2],
  [1.8, -63],
  [-0.3, -54.8],
  [1.8, -46.2],
  [0.5, -42],
  [-0.5, -34.8],
  [-1.8, -30.7],
  [0.5, -23.2],
  [-1.6, -16.2],
  [1.3, -8.8],
  [-1.6, -1.3],
  [0, 4],
];

export const ROOM_FOUR_PORTALS: readonly RoomFourPortalLayout[] = [
  { id: 'soviet-threshold', z: -67, halfSpan: 7.7, skin: 'cold-frame' },
  { id: 'transition-cold', z: -42, halfSpan: 4.6, skin: 'cold-frame' },
  { id: 'transition-warm', z: -34, halfSpan: 4.6, skin: 'warm-wood' },
  { id: 'exit-threshold', z: 2, halfSpan: 7.7, skin: 'warm-frame' },
] as const;

export const ROOM_FOUR_STATIONS: readonly RoomFourStationLayout[] = [
  {
    id: 's1',
    index: 1,
    section: 'soviet',
    kind: 'study-desk',
    object: [4.9, -63],
    stop: [1.8, -63],
    footprint: [3.6, 3.2],
    dateVi: 'Moscow · 1923',
    dateEn: 'Moscow · 1923',
    titleVi: 'Bàn học Moscow',
    titleEn: 'The Moscow study desk',
    purposeVi: 'Học để mở đường',
    purposeEn: 'Learning opens the road',
    focalLevel: 2,
  },
  {
    id: 's2',
    index: 2,
    section: 'soviet',
    kind: 'forum-globe',
    object: [-3.6, -54.8],
    stop: [-0.3, -54.8],
    footprint: [4.4, 4.4],
    dateVi: '1923–1924',
    dateEn: '1923–1924',
    titleVi: 'Diễn đàn Quốc tế',
    titleEn: 'The International forum',
    purposeVi: 'Lý luận · Quan hệ · Phương pháp',
    purposeEn: 'Theory · Relations · Method',
    focalLevel: 1,
  },
  {
    id: 's3',
    index: 3,
    section: 'soviet',
    kind: 'guangzhou-travel-dossier',
    object: [4.9, -46.2],
    stop: [1.8, -46.2],
    footprint: [3.5, 2.6],
    dateVi: '11 · 1924',
    dateEn: '11 · 1924',
    titleVi: 'Hồ sơ hành trình đến Quảng Châu',
    titleEn: 'Travel dossier to Guangzhou',
    purposeVi: 'Từ Liên Xô đến Quảng Châu',
    purposeEn: 'From the Soviet Union to Guangzhou',
    focalLevel: 2,
  },
  {
    id: 's4',
    index: 4,
    section: 'guangzhou',
    kind: 'ly-thuy-identity-desk',
    object: [-5, -30.7],
    stop: [-1.8, -30.7],
    footprint: [3.3, 2.8],
    dateVi: '11 · 11 · 1924',
    dateEn: '11 · 11 · 1924',
    titleVi: 'Lý Thụy · Danh tính công khai',
    titleEn: 'Ly Thuy · A public identity',
    purposeVi: 'Bí danh mở đường cho nhiệm vụ cách mạng',
    purposeEn: 'An alias opens the way for revolutionary work',
    focalLevel: 2,
  },
  {
    id: 's5',
    index: 5,
    section: 'guangzhou',
    kind: 'guangzhou-headquarters',
    object: [3.9, -23.2],
    stop: [0.5, -23.2],
    footprint: [4.2, 4.2],
    dateVi: '1925',
    dateEn: '1925',
    titleVi: 'Hạt nhân tổ chức',
    titleEn: 'The organisational nucleus',
    purposeVi: 'Lý tưởng trở thành lực lượng',
    purposeEn: 'Ideals become a force',
    focalLevel: 2,
  },
  {
    id: 's6',
    index: 6,
    section: 'guangzhou',
    kind: 'thanh-nien-newspaper-photo',
    object: [-5, -16.2],
    stop: [-1.6, -16.2],
    footprint: [3.8, 3],
    dateVi: '21 · 6 · 1925',
    dateEn: '21 · 6 · 1925',
    titleVi: 'Báo Thanh niên – Tờ báo cách mạng đầu tiên của Việt Nam',
    titleEn: "Thanh Nien – Vietnam's first revolutionary newspaper",
    purposeVi: 'Truyền bá chủ nghĩa Mác – Lênin và dẫn dắt phong trào',
    purposeEn: 'Spreading Marxism–Leninism and guiding the movement',
    focalLevel: 1,
  },
  {
    id: 's7',
    index: 7,
    section: 'guangzhou',
    kind: 'guangzhou-training-photo',
    object: [4.7, -8.8],
    stop: [1.3, -8.8],
    footprint: [4, 3.2],
    dateVi: 'Quảng Châu · 1926–1927',
    dateEn: 'Guangzhou · 1926–1927',
    titleVi: 'Nguyễn Ái Quốc và lớp huấn luyện chính trị ở Quảng Châu',
    titleEn: 'Nguyen Ai Quoc and the political training class in Guangzhou',
    purposeVi: 'Bồi dưỡng những hạt giống đỏ cho cách mạng Việt Nam',
    purposeEn: 'Nurturing the first revolutionary cadres for Vietnam',
    focalLevel: 1,
  },
] as const;

const COLLIDER_PADDING = 0.35;
const PORTAL_POST_COLLIDER_SIZE: readonly [number, number] = [0.5, 0.62];

export const ROOM_FOUR_PLAYER_COLLISION_MARGIN = 0.28;
export const ROOM_FOUR_WALL_INSET = 0.3;

export const ROOM_FOUR_COLLIDERS: readonly RoomFourCollider[] = [
  ...ROOM_FOUR_STATIONS.map((station) => ({
    id: station.id,
    center: station.object,
    size: [
      station.footprint[0] + COLLIDER_PADDING * 2,
      station.footprint[1] + COLLIDER_PADDING * 2,
    ] as const,
  })),
  { id: 'transition-wing-left-a', center: [-6.6, -40.1], size: [2.5, 0.7] },
  { id: 'transition-wing-right-a', center: [6.6, -38.1], size: [2.5, 0.7] },
  { id: 'transition-wing-left-b', center: [-6.6, -36.1], size: [2.5, 0.7] },
  ...ROOM_FOUR_PORTALS.flatMap((portal) => [
    {
      id: `${portal.id}-left-post`,
      center: [-portal.halfSpan, portal.z] as const,
      size: PORTAL_POST_COLLIDER_SIZE,
    },
    {
      id: `${portal.id}-right-post`,
      center: [portal.halfSpan, portal.z] as const,
      size: PORTAL_POST_COLLIDER_SIZE,
    },
  ]),
] as const;

export function isPointWithinRoomFourBounds(localX: number, localZ: number, margin = 0): boolean {
  const halfWidth = ROOM_FOUR_SPATIAL.roomWidth / 2 - ROOM_FOUR_WALL_INSET - margin;
  return (
    Math.abs(localX) <= halfWidth &&
    localZ >= ROOM_FOUR_SPATIAL.localStartZ + ROOM_FOUR_WALL_INSET + margin &&
    localZ <= ROOM_FOUR_SPATIAL.localEndZ - ROOM_FOUR_WALL_INSET - margin
  );
}

export function isPointInsideRoomFourCollider(localX: number, localZ: number, extraMargin = 0): boolean {
  return ROOM_FOUR_COLLIDERS.some((collider) => {
    const halfWidth = collider.size[0] / 2 + extraMargin;
    const halfDepth = collider.size[1] / 2 + extraMargin;
    return (
      Math.abs(localX - collider.center[0]) < halfWidth &&
      Math.abs(localZ - collider.center[1]) < halfDepth
    );
  });
}

export function worldToRoomFourLocalZ(worldZ: number): number {
  return worldZ - spatial.worldOffsetZ;
}
