import type { RoomFourStationLayout } from './roomFourLayout';

export type RoomFourStationId = RoomFourStationLayout['id'];
export type RoomFourLanguage = 'vi' | 'en';

export interface RoomFourJourneyStep {
  id: string;
  titleVi: string;
  titleEn: string;
  detailVi: string;
  detailEn: string;
}

export interface RoomFourJourneyNarrative {
  vi: string;
  en: string;
}

/** A fixed, contextual illustration shown above the primary station text. */
export interface RoomFourJourneyIllustration {
  src: string;
  altVi: string;
  altEn: string;
  captionVi: string;
  captionEn: string;
}

export interface RoomFourJourneyContent {
  id: RoomFourStationId;
  eyebrowVi: string;
  eyebrowEn: string;
  leadVi: string;
  leadEn: string;
  illustration?: RoomFourJourneyIllustration;
  /** Optional archival material displayed after every historical paragraph. */
  closingIllustration?: RoomFourJourneyIllustration;
  historyVi: readonly string[];
  historyEn: readonly string[];
  /** The fixed exhibition rhythm: see → act → witness → understand. */
  before: RoomFourJourneyNarrative;
  action: RoomFourJourneyNarrative;
  after: RoomFourJourneyNarrative;
  meaning: RoomFourJourneyNarrative;
  steps: readonly RoomFourJourneyStep[];
  sealIds: readonly RoomFourSealId[];
}

export type RoomFourSealId =
  | 'theory'
  | 'relations'
  | 'method'
  | 'organisation'
  | 'press'
  | 'cadres'
  | 'network';

export interface RoomFourSeal {
  id: RoomFourSealId;
  labelVi: string;
  labelEn: string;
}

/**
 * The Soviet imprints are deliberately mapped here, rather than inside the
 * scene components, so the causal links remain part of Room Four's journey
 * data. The route always follows the existing floor spine from source to
 * destination; it does not introduce another historical zone.
 */
export interface RoomFourSealLink {
  sourceStationId: RoomFourStationId;
  targetStationIds: readonly RoomFourStationId[];
}

export const ROOM_FOUR_PROGRESS_PREFIX = 'room4:v2:';

export const ROOM_FOUR_SEALS: readonly RoomFourSeal[] = [
  { id: 'theory', labelVi: 'Lý luận', labelEn: 'Theory' },
  { id: 'relations', labelVi: 'Quan hệ', labelEn: 'Relations' },
  { id: 'method', labelVi: 'Phương pháp', labelEn: 'Method' },
  { id: 'organisation', labelVi: 'Tổ chức', labelEn: 'Organisation' },
  { id: 'press', labelVi: 'Báo chí', labelEn: 'Press' },
  { id: 'cadres', labelVi: 'Cán bộ', labelEn: 'Cadres' },
  { id: 'network', labelVi: 'Mạng lưới', labelEn: 'Network' },
] as const;

/**
 * Moscow → Guangzhou cause-and-effect links used by Phase 8.
 *
 * Theory becomes cadre training and the press; international relations become
 * reception and communications; method becomes the Ly Thuy base, clandestine
 * organisation, training, and routes home.
 */
export const ROOM_FOUR_SEAL_LINKS: Readonly<
  Partial<Record<RoomFourSealId, RoomFourSealLink>>
> = {
  theory: {
    sourceStationId: 's1',
    targetStationIds: ['s6', 's7'],
  },
  relations: {
    sourceStationId: 's2',
    targetStationIds: ['s4'],
  },
  method: {
    sourceStationId: 's2',
    targetStationIds: ['s4', 's5', 's7'],
  },
} as const;

export const ROOM_FOUR_JOURNEY_ORDER: readonly RoomFourStationId[] = [
  's1',
  's2',
  's3',
  's4',
  's5',
  's6',
  's7',
] as const;

/** The Room Four journey begins directly at Station 1 and ends at the Guangzhou training class. */
export const ROOM_FOUR_STATION_IDS = ROOM_FOUR_JOURNEY_ORDER;

/**
 * The five outcomes that must remain visible at the Return Map after the
 * finale: learning becomes organisation, press, cadres and a network home.
 */
export const ROOM_FOUR_FINALE_SEAL_IDS = [
  'theory',
  'organisation',
  'press',
  'cadres',
  'network',
] as const satisfies readonly RoomFourSealId[];

export const ROOM_FOUR_JOURNEY_CONTENT: Readonly<Record<RoomFourStationId, RoomFourJourneyContent>> = {
  s1: {
    id: 's1',
    eyebrowVi: 'Trạm 01 · Moscow · 1923',
    eyebrowEn: 'Station 01 · Moscow · 1923',
    leadVi: 'Một lớp học ngắn hạn ở Moscow mở đầu cho hành trình chuẩn bị trở về.',
    leadEn: 'A short course in Moscow begins the preparation for the journey home.',
    illustration: {
      src: '/images/room4/station1/communist-university-toilers-east-archive.png',
      altVi: 'Ảnh tư liệu mặt tiền Trường Đại học Cộng sản của những người lao động Phương Đông tại Moscow.',
      altEn: 'Historical image of the facade of the Communist University of the Toilers of the East in Moscow.',
      captionVi: 'Ảnh tư liệu Trường Đại học Cộng sản của những người lao động Phương Đông tại Moscow.',
      captionEn: 'Historical image of the Communist University of the Toilers of the East in Moscow.',
    },
    historyVi: [
      'Cuối năm 1923, Nguyễn Ái Quốc vào học lớp ngắn hạn tại Trường Đại học Cộng sản của những người lao động Phương Đông ở Moscow.',
      'Thành lập ngày 21/4/1921, trường đào tạo cán bộ cách mạng cho các nước thuộc địa và phụ thuộc.',
    ],
    historyEn: [
      'In late 1923, Nguyen Ai Quoc took a short course at the Communist University of the Toilers of the East in Moscow.',
      'Founded on 21 April 1921, the school trained revolutionary cadres from colonial and dependent countries.',
    ],
    before: {
      vi: 'Củng cố lý luận tại Trường Đại học Lao động Cộng sản Phương Đông',
      en: 'Strengthen theory at the Communist University of the Toilers of the East.',
    },
    action: {
      vi: 'Mở lần lượt ba quyển sách',
      en: 'Open the three books in sequence',
    },
    after: {
      vi: 'Sách mở, trang ghi chú và ba dấu ánh sáng cùng xuất hiện.',
      en: 'Open pages, note sheets and three light marks appear together.',
    },
    meaning: {
      vi: 'Học để mở đường.',
      en: 'Learning opens the road.',
    },
    steps: [
      {
        id: 'theory',
        titleVi: 'Học lý luận',
        titleEn: 'Study theory',
        detailVi: 'Hệ thống hóa các nguyên lý cách mạng thành một phương pháp nhận thức.',
        detailEn: 'Systematise revolutionary principles into a method of understanding.',
      },
      {
        id: 'soviet-practice',
        titleVi: 'Nghiên cứu thực tiễn',
        titleEn: 'Study Soviet practice',
        detailVi: 'Đối chiếu lý luận với cách một nhà nước Xô-viết vận hành trong thực tế.',
        detailEn: 'Compare theory with the practical operation of a Soviet state.',
      },
      {
        id: 'colonial-peoples',
        titleVi: 'Kết nối các dân tộc thuộc địa',
        titleEn: 'Connect colonised peoples',
        detailVi: 'Đặt vấn đề Việt Nam trong mối liên hệ với phong trào giải phóng thuộc địa.',
        detailEn: 'Place Vietnam within the wider movement for colonial liberation.',
      },
    ],
    sealIds: ['theory'],
  },
  s2: {
    id: 's2',
    eyebrowVi: 'Trạm 02 · Diễn đàn Quốc tế · 1923–1924',
    eyebrowEn: 'Station 02 · International forum · 1923–1924',
    leadVi: 'Tư liệu hình ảnh tại Đại hội lần thứ V của Quốc tế Cộng sản, tổ chức ở Moskva năm 1924.',
    leadEn: 'A photographic document from the Fifth Congress of the Communist International in Moscow, 1924.',
    illustration: {
      src: '/images/room4/station2/nguyen-ai-quoc-comintern-v-modal.png',
      altVi: 'Ảnh tư liệu Nguyễn Ái Quốc cùng các đại biểu tại Đại hội lần thứ V của Quốc tế Cộng sản ở Moskva năm 1924.',
      altEn: 'Historical image of Nguyen Ai Quoc with delegates at the Fifth Congress of the Communist International in Moscow, 1924.',
      captionVi: 'Ảnh tư liệu tại Đại hội lần thứ V của Quốc tế Cộng sản, Moskva, năm 1924.',
      captionEn: 'Historical image from the Fifth Congress of the Communist International, Moscow, 1924.',
    },
    historyVi: [
      'Tại diễn đàn này, Người đã dũng cảm, thẳng thắn phê phán một số đảng cộng sản ở các nước chính quốc chưa quan tâm đúng mức đến vấn đề thuộc địa, đồng thời khẳng định mạnh mẽ vai trò của cách mạng giải phóng dân tộc ở các nước bị áp bức.',
    ],
    historyEn: [
      'At this forum, he courageously and candidly criticised some communist parties in the metropoles for failing to give due attention to the colonial question, while strongly affirming the role of national liberation revolutions in oppressed countries.',
    ],
    before: {
      vi: 'Hình ảnh lãnh tụ Nguyễn Ái Quốc (Chủ tịch Hồ Chí Minh) tham dự và phát biểu tại Đại hội lần thứ V của Quốc tế Cộng sản tổ chức ở Moskva năm 1924.',
      en: 'Nguyen Ai Quoc (President Ho Chi Minh) attending and speaking at the Fifth Congress of the Communist International in Moscow, 1924.',
    },
    action: {
      vi: 'Mở lần lượt ba mốc tư liệu trên màn hình',
      en: 'Open the three documentary entries on the screen in sequence',
    },
    after: {
      vi: 'Ba đèn tín hiệu dưới màn hình sáng lên, làm rõ mối liên hệ giữa chính quốc và các dân tộc thuộc địa.',
      en: 'Three status lights beneath the screen illuminate, clarifying the link between the metropole and colonised peoples.',
    },
    meaning: {
      vi: 'Quan hệ và phương pháp mở rộng con đường thuộc địa.',
      en: 'Relations and method broaden the colonial road.',
    },
    steps: [
      {
        id: 'peasant-international',
        titleVi: 'Quốc tế Nông dân · 17/10/1923',
        titleEn: 'Peasant International · 17 Oct 1923',
        detailVi: 'Một vị trí trong Đoàn Chủ tịch tạo thêm kênh kết nối với phong trào nông dân quốc tế.',
        detailEn: 'A place on the Presidium opened another channel to the international peasant movement.',
      },
      {
        id: 'comintern-v',
        titleVi: 'Đại hội V Quốc tế Cộng sản · 23/6/1924',
        titleEn: 'Fifth Comintern Congress · 23 Jun 1924',
        detailVi: 'Vấn đề thuộc địa được đặt trong chiến lược chung của cách mạng thế giới.',
        detailEn: 'The colonial question was placed within the shared strategy of world revolution.',
      },
      {
        id: 'red-labour-unions',
        titleVi: 'Quốc tế Công hội Đỏ · 21/7/1924',
        titleEn: 'Red International of Labour Unions · 21 Jul 1924',
        detailVi: 'Tình hình công nhân Đông Dương được đưa ra một diễn đàn quốc tế.',
        detailEn: 'The condition of Indochinese workers entered an international forum.',
      },
    ],
    sealIds: ['relations', 'method'],
  },
  s3: {
    id: 's3',
    eyebrowVi: 'Trạm 03 · Hành trình đến Quảng Châu · 11/1924',
    eyebrowEn: 'Station 03 · Journey to Guangzhou · Nov 1924',
    leadVi: 'Hồ sơ hành trình đánh dấu bước chuyển từ Liên Xô đến Quảng Châu, nơi một nhiệm vụ tổ chức mới bắt đầu.',
    leadEn: 'The travel dossier marks the move from the Soviet Union to Guangzhou, where a new organisational mission began.',
    historyVi: [
      'Tháng 11/1924, Nguyễn Ái Quốc được cử đến Quảng Châu với tư cách Ủy viên Ban Phương Đông Quốc tế Cộng sản và Ủy viên Đoàn Chủ tịch Quốc tế Nông dân.',
    ],
    historyEn: [
      'In November 1924, Nguyen Ai Quoc was sent to Guangzhou as a member of the Eastern Bureau of the Communist International and of the Presidium of the Peasant International.',
    ],
    before: {
      vi: 'Hồ sơ hành trình đến Quảng Châu',
      en: 'Travel dossier to Guangzhou',
    },
    action: {
      vi: 'Quan sát tuyến Liên Xô – Quảng Châu',
      en: 'View the Soviet Union–Guangzhou route',
    },
    after: {
      vi: 'Dấu Lý Thụy tại điểm đến mở ra trạm kế tiếp ở Quảng Châu.',
      en: 'The Ly Thuy mark at the destination opens the next station in Guangzhou.',
    },
    meaning: {
      vi: 'Hành trình đưa sự chuẩn bị quốc tế vào thực tiễn cách mạng Việt Nam.',
      en: 'The journey brought international preparation into the practice of Vietnam’s revolution.',
    },
    steps: [
      {
        id: 'soviet-to-guangzhou-route',
        titleVi: 'Liên Xô → Quảng Châu · 11/1924',
        titleEn: 'Soviet Union → Guangzhou · Nov 1924',
        detailVi: 'Tuyến hành trình đưa Nguyễn Ái Quốc từ môi trường học tập quốc tế tới căn cứ hoạt động mới.',
        detailEn: 'The route carried Nguyen Ai Quoc from the international learning environment to a new operational base.',
      },
      {
        id: 'ly-thuy-destination-mark',
        titleVi: 'Dấu đến · Lý Thụy',
        titleEn: 'Arrival mark · Ly Thuy',
        detailVi: 'Bí danh Lý Thụy được nhấn tại điểm đến, dẫn sang câu chuyện của Trạm 04.',
        detailEn: 'The Ly Thuy alias is marked at the destination, leading into Station 04.',
      },
    ],
    sealIds: [],
  },
  s4: {
    id: 's4',
    eyebrowVi: 'Trạm 04 · Lý Thụy · 11/11/1924',
    eyebrowEn: 'Station 04 · Ly Thuy · 11 Nov 1924',
    leadVi: 'Ngày 11/11/1924, Nguyễn Ái Quốc đến Quảng Châu với bí danh Lý Thụy.',
    leadEn: 'On 11 November 1924, Nguyen Ai Quoc arrived in Guangzhou under the alias Ly Thuy.',
    historyVi: [
      'Nguyễn Ái Quốc đến Quảng Châu ngày 11/11/1924 với bí danh Lý Thụy.',
      'Danh nghĩa công khai của Người là cán bộ phiên dịch trong phái bộ Bôrôđin của Liên Xô.',
    ],
    historyEn: [
      'Nguyen Ai Quoc arrived in Guangzhou on 11 November 1924 under the alias Ly Thuy.',
      'His public role was as an interpreter in Borodin’s Soviet mission.',
    ],
    before: {
      vi: 'Lý Thụy – bí danh tại Quảng Châu',
      en: 'Ly Thuy – an alias in Guangzhou',
    },
    action: {
      vi: 'Quan sát hồ sơ danh tính Lý Thụy',
      en: 'View the Ly Thuy identity file',
    },
    after: {
      vi: 'Tấm thẻ danh tính cho thấy lớp vỏ công khai của một cán bộ phiên dịch.',
      en: 'The identity card shows the public cover of an interpreter.',
    },
    meaning: {
      vi: 'Bí danh Lý Thụy đánh dấu sự khởi đầu một căn cứ hoạt động cách mạng mới tại Quảng Châu.',
      en: 'The Ly Thuy alias marked the start of a new revolutionary base in Guangzhou.',
    },
    steps: [
      {
        id: 'ly-thuy-alias',
        titleVi: 'Bí danh Lý Thụy',
        titleEn: 'The Ly Thuy alias',
        detailVi: 'Bí danh được sử dụng khi Nguyễn Ái Quốc đến Quảng Châu ngày 11/11/1924.',
        detailEn: 'The alias used when Nguyen Ai Quoc arrived in Guangzhou on 11 November 1924.',
      },
      {
        id: 'public-interpreter-role',
        titleVi: 'Danh nghĩa phiên dịch',
        titleEn: 'Public interpreter role',
        detailVi: 'Danh nghĩa công khai của Người là cán bộ phiên dịch trong phái bộ Bôrôđin của Liên Xô.',
        detailEn: 'His public role was as an interpreter in Borodin’s Soviet mission.',
      },
    ],
    sealIds: [],
  },
  s5: {
    id: 's5',
    eyebrowVi: 'Trạm 05 · Hạt nhân tổ chức · 1925',
    eyebrowEn: 'Station 05 · Organisational nucleus · 1925',
    leadVi: 'Ngôi nhà số 13/1, nay là số 248–250 đường Văn Minh, Quảng Châu là trụ sở của Hội Việt Nam Cách mạng Thanh niên.',
    leadEn: 'House No. 13/1, now No. 248–250 Wenming Road in Guangzhou, was the headquarters of the Vietnamese Revolutionary Youth League.',
    illustration: {
      src: '/images/room4/station5/guangzhou-youth-league-headquarters.png',
      altVi: 'Ngôi nhà số 13/1 đường Văn Minh, trụ sở Hội Việt Nam Cách mạng Thanh niên tại Quảng Châu.',
      altEn: 'House No. 13/1 on Wenming Road, headquarters of the Vietnamese Revolutionary Youth League in Guangzhou.',
      captionVi: 'Ngôi nhà số 13/1, nay là số 248–250 đường Văn Minh, thành phố Quảng Châu, Trung Quốc.',
      captionEn: 'House No. 13/1, now No. 248–250 Wenming Road, Guangzhou, China.',
    },
    historyVi: [
      'Đây là nơi Nguyễn Ái Quốc mở các lớp huấn luyện, đào tạo cán bộ cho cách mạng Việt Nam trong những năm 1925–1927.',
      'Đầu năm 1925, từ các thành viên tích cực của Tâm Tâm xã hình thành nhóm bí mật, tức Cộng sản đoàn.',
      'Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên.',
    ],
    historyEn: [
      'Here, Nguyen Ai Quoc led training classes for cadres of the Vietnamese revolution from 1925 to 1927.',
      'In early 1925, active members of Tam Tam Xa formed a secret group, the Communist Youth Group.',
      'In June 1925, Nguyen Ai Quoc founded the Vietnamese Revolutionary Youth League.',
    ],
    before: {
      vi: 'Những điểm sáng rời rạc chưa tạo thành một tổ chức.',
      en: 'Separate points of light have not yet formed an organisation.',
    },
    action: {
      vi: 'Kết nối ba điểm tổ chức theo thứ tự',
      en: 'Connect the three organisational points in sequence',
    },
    after: {
      vi: 'Các điểm nối thành một mạng từ hạt nhân tới cơ sở trong nước.',
      en: 'The points connect into a network from its nucleus to domestic bases.',
    },
    meaning: {
      vi: 'Tổ chức biến lý tưởng thành lực lượng.',
      en: 'Organisation turns an ideal into a force.',
    },
    steps: [
      {
        id: 'communist-group',
        titleVi: 'Cộng sản đoàn',
        titleEn: 'Communist Youth Group',
        detailVi: 'Một nhóm bí mật được tạo từ các thành viên tích cực của Tâm Tâm xã.',
        detailEn: 'A secret group formed from active members of Tam Tam Xa.',
      },
      {
        id: 'youth-league',
        titleVi: 'Hội Việt Nam Cách mạng Thanh niên',
        titleEn: 'Vietnamese Revolutionary Youth League',
        detailVi: 'Tháng 6/1925, hạt nhân được phát triển thành một tổ chức cách mạng.',
        detailEn: 'In June 1925, the nucleus developed into a revolutionary organisation.',
      },
      {
        id: 'domestic-bases',
        titleVi: 'Cơ sở trong nước',
        titleEn: 'Domestic bases',
        detailVi: 'Mạng lưới mở rộng về Việt Nam, nối tổ chức ở Quảng Châu với thực tiễn trong nước.',
        detailEn: 'The network extended into Vietnam, linking the Guangzhou organisation with work at home.',
      },
    ],
    sealIds: ['organisation'],
  },
  s6: {
    id: 's6',
    eyebrowVi: 'Trạm 06 · Báo Thanh Niên · 21/6/1925',
    eyebrowEn: 'Station 06 · Thanh Nien newspaper · 21 Jun 1925',
    leadVi: 'Báo Thanh niên là tờ báo cách mạng đầu tiên của Việt Nam, đưa đường lối và tư tưởng cách mạng từ Quảng Châu về nước.',
    leadEn: 'Thanh Nien was Vietnam’s first revolutionary newspaper, carrying the revolutionary path and ideas from Guangzhou back home.',
    illustration: {
      src: '/images/room4/station6/bao-thanh-nien-1926.png',
      altVi: 'Trang Báo Thanh niên với măng sét tiếng Hán và tiếng Việt.',
      altEn: 'A Thanh Nien newspaper page bearing its Chinese and Vietnamese masthead.',
      captionVi: 'Báo Thanh niên – Tờ báo cách mạng đầu tiên của Việt Nam.',
      captionEn: 'Thanh Nien – Vietnam’s first revolutionary newspaper.',
    },
    historyVi: [
      'Ngày 21/6/1925, số đầu tiên của báo Thanh Niên ra đời tại Quảng Châu.',
      'Báo là cơ quan ngôn luận của Hội Việt Nam Cách mạng Thanh niên, truyền bá chủ nghĩa Mác–Lênin, tổ chức và hướng dẫn phong trào.',
      'Mỗi số được in bí mật với số lượng hạn chế, rồi theo đường dây liên lạc chuyển về Việt Nam và các nơi khác để chuẩn bị cho sự ra đời của Đảng.',
    ],
    historyEn: [
      'On 21 June 1925, the first issue of Thanh Nien was published in Guangzhou.',
      'As the voice of the Vietnamese Revolutionary Youth League, it spread Marxism–Leninism and guided the movement.',
      'Limited copies were printed secretly and distributed through underground routes, helping prepare the political, ideological and organisational foundations for the Party.',
    ],
    before: {
      vi: 'Báo Thanh niên – Tờ báo cách mạng đầu tiên của Việt Nam',
      en: 'Thanh Nien – Vietnam’s first revolutionary newspaper',
    },
    action: {
      vi: 'Quan sát trang Báo Thanh niên',
      en: 'View the Thanh Nien newspaper page',
    },
    after: {
      vi: 'Trang báo cho thấy một phương tiện bí mật đưa lý luận cách mạng đến với phong trào trong nước.',
      en: 'The page shows how clandestine journalism carried revolutionary theory to the movement in Vietnam.',
    },
    meaning: {
      vi: 'Báo Thanh niên mở đầu truyền thống báo chí cách mạng Việt Nam.',
      en: 'Thanh Nien opened the tradition of Vietnam’s revolutionary press.',
    },
    steps: [
      {
        id: 'view-newspaper-page',
        titleVi: 'Báo Thanh niên · 21/6/1925',
        titleEn: 'Thanh Nien newspaper · 21 Jun 1925',
        detailVi: 'Trang báo lưu dấu một khởi đầu quan trọng của báo chí cách mạng Việt Nam.',
        detailEn: 'The page records a defining beginning for Vietnam’s revolutionary press.',
      },
    ],
    sealIds: ['press'],
  },
  s7: {
    id: 's7',
    eyebrowVi: 'Trạm 07 · Quảng Châu · 1926–1927',
    eyebrowEn: 'Station 07 · Guangzhou · 1926–1927',
    leadVi: 'Từ đầu năm 1926 đến tháng 4/1927, Nguyễn Ái Quốc trực tiếp mở ba lớp huấn luyện chính trị cho 75 thanh niên Việt Nam ưu tú tại Quảng Châu.',
    leadEn: 'From early 1926 to April 1927, Nguyen Ai Quoc directly led three political training classes for 75 outstanding Vietnamese youths in Guangzhou.',
    illustration: {
      src: '/images/room4/station7/nguyen-ai-quoc-guangzhou-training.png',
      altVi: 'Nguyễn Ái Quốc đứng giảng bài cho học viên trong lớp huấn luyện chính trị ở Quảng Châu.',
      altEn: 'Nguyen Ai Quoc teaching students in a political training class in Guangzhou.',
      captionVi: 'Nguyễn Ái Quốc và lớp huấn luyện chính trị ở Quảng Châu.',
      captionEn: 'Nguyen Ai Quoc and the political training class in Guangzhou.',
    },
    historyVi: [
      'Ba lớp đã bồi dưỡng những thanh niên yêu nước về chủ nghĩa cộng sản và phương pháp cách mạng mới.',
      'Nhiều học viên sau đó trở về nước tổ chức, phát triển phong trào cách mạng Việt Nam.',
    ],
    historyEn: [
      'The three classes prepared patriotic young people in communism and a new revolutionary method.',
      'Many students later returned to Vietnam to organise and develop the revolutionary movement.',
    ],
    closingIllustration: {
      src: '/images/room4/station7/duong-kach-menh-cover.png',
      altVi: 'Bìa sách Đường Kách mệnh.',
      altEn: 'The cover of The Revolutionary Path.',
      captionVi: 'Sách “Đường Kách mệnh” tập hợp những bài giảng của Nguyễn Ái Quốc trong những năm 1925-1927 tại các lớp huấn luyện đào tạo cán bộ cho cách mạng Việt Nam tại Quảng Châu, Trung Quốc.',
      captionEn: 'The Revolutionary Path collected Nguyen Ai Quoc’s lectures from 1925 to 1927 for cadre-training classes in Guangzhou, China.',
    },
    before: {
      vi: 'Nguyễn Ái Quốc và lớp huấn luyện chính trị ở Quảng Châu',
      en: 'Nguyen Ai Quoc and the political training class in Guangzhou',
    },
    action: {
      vi: 'Quan sát lớp huấn luyện chính trị',
      en: 'View the political training class',
    },
    after: {
      vi: 'Ảnh tư liệu làm rõ vai trò đào tạo cán bộ tại Quảng Châu.',
      en: 'The archival photo highlights the cadre-training work in Guangzhou.',
    },
    meaning: {
      vi: 'Những hạt giống đỏ được bồi dưỡng để trở về phục vụ cách mạng Việt Nam.',
      en: 'The first revolutionary cadres were prepared to return and serve Vietnam’s revolution.',
    },
    steps: [
      {
        id: 'view-training-class',
        titleVi: 'Ba lớp huấn luyện · 75 học viên',
        titleEn: 'Three classes · 75 students',
        detailVi: 'Các học viên được chuẩn bị để trở về gây dựng phong trào cách mạng trong nước.',
        detailEn: 'The students were prepared to return and build the revolutionary movement in Vietnam.',
      },
    ],
    sealIds: ['cadres'],
  },
  s8: {
    id: 's8',
    eyebrowVi: 'Trạm 08 · Mạng lưới trở về Tổ quốc',
    eyebrowEn: 'Station 08 · The network homeward',
    leadVi: 'Bốn tuyến liên lạc tổng hợp hành trang thành một mạng lưới trở về Việt Nam.',
    leadEn: 'Four communication routes gather the journey’s preparation into a network returning to Vietnam.',
    historyVi: [
      'Quảng Châu là đầu mối tiếp nhận thanh niên, huấn luyện, đưa cán bộ về nước, chuyển báo chí và liên lạc với Quốc tế Cộng sản.',
      'Các tuyến tiêu biểu đi qua Móng Cái, Lạng Sơn, đường biển qua Hồng Kông và tuyến qua Xiêm.',
    ],
    historyEn: [
      'Guangzhou became a hub for receiving young people, training cadres, sending them home, carrying newspapers and maintaining contact with the Communist International.',
      'Representative routes ran through Mong Cai, Lang Son, by sea through Hong Kong, and through Siam.',
    ],
    before: {
      vi: 'Bốn tuyến liên lạc trên bản đồ vẫn chưa được nối thành mạng.',
      en: 'The four communication routes on the map have not yet joined into a network.',
    },
    action: {
      vi: 'Kích hoạt bốn tuyến liên lạc',
      en: 'Activate the four communication routes',
    },
    after: {
      vi: 'Bản đồ trở thành một mạng kết nối hoàn chỉnh hướng về Tổ quốc.',
      en: 'The map becomes a complete network directed homeward.',
    },
    meaning: {
      vi: 'Mạng lưới đưa hành trang trở về Tổ quốc.',
      en: 'The network brings the journey kit home.',
    },
    steps: [
      {
        id: 'route-mong-cai',
        titleVi: 'Tuyến Móng Cái',
        titleEn: 'Mong Cai route',
        detailVi: 'Một tuyến biên giới đưa người và tài liệu vào miền Bắc Việt Nam.',
        detailEn: 'A border route carried people and documents into northern Vietnam.',
      },
      {
        id: 'route-lang-son',
        titleVi: 'Tuyến Lạng Sơn',
        titleEn: 'Lang Son route',
        detailVi: 'Một hành lang liên lạc khác nối Quảng Châu với cơ sở trong nước.',
        detailEn: 'Another communication corridor linked Guangzhou with domestic bases.',
      },
      {
        id: 'route-hong-kong',
        titleVi: 'Đường biển qua Hồng Kông',
        titleEn: 'Sea route through Hong Kong',
        detailVi: 'Đường biển mở thêm phương thức chuyển báo chí và cán bộ.',
        detailEn: 'The sea route offered another way to move newspapers and cadres.',
      },
      {
        id: 'route-siam',
        titleVi: 'Tuyến qua Xiêm',
        titleEn: 'Route through Siam',
        detailVi: 'Mạng lưới khu vực nối hoạt động ở Quảng Châu với cộng đồng người Việt tại Xiêm.',
        detailEn: 'A regional network linked Guangzhou with Vietnamese communities in Siam.',
      },
    ],
    sealIds: ['network'],
  },
} as const;

export function roomFourStepToken(stationId: RoomFourStationId, stepId: string): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}step:${stationId}:${stepId}`;
}

export function roomFourCompletionToken(stationId: RoomFourStationId): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}complete:${stationId}`;
}

export function roomFourSealToken(sealId: RoomFourSealId): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}seal:${sealId}`;
}

/** Persisted only after the one-time Station 8 convergence has finished. */
export function roomFourFinaleToken(): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}finale:return-map`;
}

export function isRoomFourJourneyToken(token: string): boolean {
  return token.startsWith(ROOM_FOUR_PROGRESS_PREFIX);
}

export function getNextRoomFourStation(progress: readonly string[]): RoomFourStationId | null {
  return (
    ROOM_FOUR_JOURNEY_ORDER.find(
      (stationId) => !progress.includes(roomFourCompletionToken(stationId)),
    ) ?? null
  );
}

export function getRoomFourStationProgress(
  progress: readonly string[],
  stationId: RoomFourStationId,
): number {
  const station = ROOM_FOUR_JOURNEY_CONTENT[stationId];
  return station.steps.filter((step) => progress.includes(roomFourStepToken(stationId, step.id))).length;
}

/**
 * Phase 9 guard. A finale can never be unlocked by merely finishing the four
 * map routes: every one of the eight stations must already be complete.
 */
export function isRoomFourFinaleReady(progress: readonly string[]): boolean {
  return ROOM_FOUR_STATION_IDS.every((stationId) =>
    progress.includes(roomFourCompletionToken(stationId)),
  );
}
