'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Globe, User, BookOpen, Gamepad2, HelpCircle, Check, AlertTriangle, ArrowRight, Volume2, Pause, Play } from 'lucide-react';
import { useMuseum } from '@/context/MuseumContext';
import { FirstVoyageGame } from './FirstVoyageGame';
import { GalleyWorkMission } from './GalleyWorkMission';
import { VanBaProfile } from './VanBaProfile';
import { DepartureMission } from './DepartureMission';
import { ShipExplorationMission } from './ShipExplorationMission';
import { ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID, ROOM_ONE_FINAL_EXHIBIT_ID, ROOM_ONE_GAMEPLAY, ROOM_ONE_REQUIRED_CLUE_IDS } from '@/lib/roomOneGameplay';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number | number[]; // index (hoặc mảng index nếu chọn nhiều)
  isMulti?: boolean;
}

interface GameplayData {
  hasTimer: boolean;
  timerDuration: number;
  quizzes: QuizQuestion[];
  historyText: string;
  clueText: string;
  isFinalRound?: boolean;
}

interface ExhibitMediaCarouselProps {
  images: string[];
  alt: string;
  objectPosition: string;
}

const NHA_RONG_DEPARTURE_IMAGES = [
  '/exhibits/nha-rong-harbor-1911.png',
  '/exhibits/nha-rong-postcard-1911.png',
];

function ExhibitMediaCarousel({ images, alt, objectPosition }: ExhibitMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [images]);

  return (
    <>
      {images.map((imageUrl, index) => (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={index === activeIndex ? alt : ''}
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 w-full h-full object-contain lg:object-cover bg-slate-950 transition-opacity duration-700 ${
            index === activeIndex ? 'opacity-95' : 'opacity-0'
          }`}
          style={{ objectPosition }}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-5 right-5 z-10 flex gap-1.5" aria-label="Ảnh tư liệu">
          {images.map((imageUrl, index) => (
            <span
              key={`${imageUrl}-indicator`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-300/60'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

const GAMEPLAY_DICTIONARY: Record<string, GameplayData> = {
  'exhibit-coupon': {
    hasTimer: true,
    timerDuration: 10,
    quizzes: [
      {
        question: 'Theo quan sát, vai trò chính của tem phiếu trong đời sống thời kỳ này là gì?',
        options: [
          'Một loại giấy xác nhận quyền sở hữu hàng hóa của người dân',
          'Một công cụ giúp Nhà nước phân phối hàng hóa theo định mức',
          'Một hình thức tiền tệ thay thế khi người dân mua hàng',
          'Một loại phiếu ưu đãi giúp người dân mua hàng với giá rẻ hơn'
        ],
        correctIndex: 1
      },
      {
        question: 'Gia đình bạn có 4 người, được cấp 13kg gạo theo tem và có 300 đồng tiền mặt. Gia đình muốn mua thêm 20kg gạo. Theo cơ chế lúc đó, điều gì xảy ra?',
        options: [
          'Có thể mua nếu có đủ tiền vì tiền quyết định việc mua hàng',
          'Không thể mua nếu không có thêm tem phiếu dù vẫn còn tiền',
          'Có thể mua tự do tại mọi cửa hàng vì gạo là nhu yếu phẩm',
          'Có thể mua thêm nếu trả giá cao hơn người khác'
        ],
        correctIndex: 1
      }
    ],
    historyText: 'Tem phiếu lương thực: Trong thời kỳ bao cấp, người dân muốn mua gạo phải có cả tiền và tem phiếu. Tem phiếu quy định số lượng hàng hóa được mua theo định mức. Khi hết tem, dù còn tiền, người dân cũng không thể mua thêm gạo.',
    clueText: 'Hàng hóa được mua theo tem phiếu'
  },
  'exhibit-ricebook': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Trong sổ ghi: Gia đình: 4 người, Định mức: 13kg/tháng. Ai quyết định con số này?',
        options: [
          'Gia đình tự đăng ký dựa trên nhu cầu sử dụng',
          'Cửa hàng quyết định dựa trên lượng hàng còn lại',
          'Nhà nước quy định dựa trên chế độ phân phối',
          'Người dân có thể thương lượng với người bán để thay đổi'
        ],
        correctIndex: 2
      }
    ],
    historyText: 'Sổ gạo - Dấu ấn của thời kỳ bao cấp: Lương thực được phân phối theo định mức do Nhà nước quy định. Số lượng gạo mỗi gia đình được nhận phụ thuộc vào số nhân khẩu và tiêu chuẩn được cấp, không do người dân tự quyết định.',
    clueText: 'Lương thực được cấp theo định mức'
  },
  'exhibit-factory': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Nhà máy có kế hoạch: Xe đạp 5000 chiếc, Quạt 3000 chiếc. Nếu nhu cầu xe đạp tăng gấp đôi, nhà máy có thể tự quyết định sản xuất thêm?',
        options: [
          'Có, vì doanh nghiệp luôn được tự do thay đổi sản lượng khi thị trường cần',
          'Có, nhưng phải xin phép cơ quan quản lý trước khi thay đổi kế hoạch',
          'Không, vì phải thực hiện theo chỉ tiêu kế hoạch được giao',
          'Không, vì nhà máy không được phép tăng sản lượng trong mọi trường hợp'
        ],
        correctIndex: 2
      }
    ],
    historyText: 'Trong thời kỳ bao cấp, nhiều nhà máy hoạt động theo cơ chế kế hoạch hóa tập trung. Sản lượng sản xuất, số lượng hàng hóa và mục tiêu sản xuất đều được Nhà nước giao theo kế hoạch. Vì vậy, dù nhu cầu thị trường thay đổi, nhà máy không thể tự quyết định sản lượng.',
    clueText: 'Sản xuất theo kế hoạch được giao'
  },
  'exhibit-priceboard': {
    hasTimer: true,
    timerDuration: 10,
    quizzes: [
      {
        question: 'Giá gạo ngoài thị trường tăng cao. Cửa hàng quốc doanh có thể xử lý như thế nào?',
        options: [
          'Tự tăng giá để cân bằng cung cầu',
          'Giữ nguyên giá theo quy định của Nhà nước',
          'Tăng giá nếu người mua đồng ý trả thêm tiền',
          'Điều chỉnh giá dựa trên mức giá của các cửa hàng khác'
        ],
        correctIndex: 1
      }
    ],
    historyText: 'Bảng giá mậu dịch: Giá nhiều mặt hàng được giữ theo mức quy định cứng của Nhà nước, không thay đổi linh hoạt theo cung - cầu thị trường.',
    clueText: 'Giá hàng hóa do Nhà nước quy định'
  },
  'exhibit-shop': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Vì sao cửa hàng thường xảy ra tình trạng hết hàng? (Chọn 2 đáp án)',
        options: [
          'Nhu cầu của người dân tăng nhưng nguồn cung không đáp ứng đủ',
          'Hàng hóa được phân phối theo kế hoạch nên lượng hàng có giới hạn',
          'Người dân cố tình mua tích trữ quá nhiều',
          'Cửa hàng không muốn bán hết hàng để giữ lại cho tháng sau'
        ],
        correctIndex: [0, 1],
        isMulti: true
      }
    ],
    historyText: 'Cửa hàng mậu dịch thời bao cấp: Hàng hóa thiết yếu chủ yếu được phân phối qua cửa hàng mậu dịch quốc doanh. Do sản xuất còn nhiều khó khăn, nguồn cung hạn chế trong khi nhu cầu lớn nên thường xuyên thiếu hụt hàng hóa, người dân phải xếp hàng dài để mua.',
    clueText: 'Hàng hóa phân phối hạn chế, thường xuyên thiếu hụt'
  },
  'exhibit-witness': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Theo câu chuyện trên, cuộc sống của người dân thời bao cấp có đặc điểm gì?',
        options: [
          'Người dân có thể mua hàng hóa tự do theo nhu cầu',
          'Người dân phải sử dụng hàng hóa theo định mức được phân phối',
          'Giá cả hàng hóa thay đổi liên tục theo thị trường',
          'Các gia đình có thể tự quyết định số lượng hàng được mua'
        ],
        correctIndex: 1
      }
    ],
    historyText: 'Ký ức thời bao cấp: Đời sống phụ thuộc vào chế độ phân phối. Mọi gia đình tính toán từng bữa ăn, quen với việc xếp hàng và tiết kiệm phần được cấp.',
    clueText: 'Đời sống phụ thuộc vào chế độ phân phối'
  }
};

export const ExhibitModal: React.FC = () => {
  const {
    selectedExhibit,
    setSelectedExhibit,
    language,
    setLanguage,
    audioPlaying,
    setAudioPlaying,
    setMiniGameOpen,
    gameState: globalGameState,
    initializeGame,
    cluesCollected,
    addClue,
    activeGallery,
    exhibitModalMode,
    nickname,
    roomOneCompleted,
    roomFiveProgress,
    completeRoomFiveFragment,
    resetRoomFiveFragment,
    visitRoomFiveShipHotspot,
  } = useMuseum();

  // --- States cho Audio thuyết minh mặc định ---
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(150);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechKeyRef = useRef<string | null>(null);
  // --- States cho Gameplay Bao cấp (gallery-subsidy) ---
  const isSubsidyRoom = activeGallery?.id === 'gallery-subsidy';
  const gameData = selectedExhibit
    ? ROOM_ONE_GAMEPLAY[selectedExhibit.id] ?? GAMEPLAY_DICTIONARY[selectedExhibit.id]
    : null;
  const isDepartureMission = selectedExhibit?.id === 'nha-rong-departure-1911' && exhibitModalMode === 'game';
  const isFirstVoyageGame = selectedExhibit?.id === 'nha-rong-first-voyage' && exhibitModalMode === 'game';
  const isVanBaProfile = selectedExhibit?.id === 'nha-rong-latouche-treville' && exhibitModalMode === 'game';
  const isGalleyWorkMission = selectedExhibit?.id === 'nha-rong-galley-work' && exhibitModalMode === 'game';
  const isShipExplorationMission = selectedExhibit?.id === 'nha-rong-ship-exploration' && exhibitModalMode === 'game';
  const isNhaRongExhibit = selectedExhibit?.gallery_id === 'gallery-three';

  const [gameState, setGameState] = useState<'quiz' | 'info'>('quiz');
  const effectiveGameState = exhibitModalMode === 'info' ? 'info' : gameState;
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]); // Cho chi-choice
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const isRoomOneFinalRound = selectedExhibit?.id === ROOM_ONE_FINAL_EXHIBIT_ID;
  const hasAllRoomOnePoints = ROOM_ONE_REQUIRED_CLUE_IDS.every((id) => cluesCollected.includes(id));
  const finalArchiveClueCollected = cluesCollected.includes(ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID);

  const lastExhibitIdRef = useRef<string | null>(null);

  // Reset audio & gameplay states chỉ khi thay đổi hiện vật mở lên (tránh reset giữa chừng khi làm bài sai)
  useEffect(() => {
    if (!selectedExhibit) {
      lastExhibitIdRef.current = null;
      return;
    }

    // Nếu vẫn là hiện vật cũ đang mở thì không reset lại trạng thái đang làm bài
    if (selectedExhibit.id === lastExhibitIdRef.current) return;
    lastExhibitIdRef.current = selectedExhibit.id;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      speechUtteranceRef.current = null;
      speechKeyRef.current = null;
    }

    const resetTimer = window.setTimeout(() => {
      setAudioProgress(0);
      setAudioPlaying(false);
      setAudioDuration(selectedExhibit.id.length * 7 + 80);

      if (isSubsidyRoom && gameData) {
        if (exhibitModalMode === 'info' || roomOneCompleted) {
          setGameState('info');
          return;
        }

        const alreadyCollected = isRoomOneFinalRound
          ? cluesCollected.includes(ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID)
          : cluesCollected.includes(selectedExhibit.id);

        if ((isRoomOneFinalRound && !hasAllRoomOnePoints) || alreadyCollected) {
          setGameState('info');
        } else {
          setGameState('quiz');
          setCurrentQuizIndex(0);
          setSelectedOption(null);
          setSelectedOptions([]);
          setAnswerChecked(false);
          setIsCorrect(false);
        }
      }
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [selectedExhibit, cluesCollected, isSubsidyRoom, gameData, exhibitModalMode, roomOneCompleted, isRoomOneFinalRound, hasAllRoomOnePoints, setAudioPlaying]);

  // Mô phỏng Audio thuyết minh chạy giây tăng dần
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (audioPlaying) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= audioDuration) {
            setAudioPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [audioPlaying, audioDuration, setAudioPlaying]);

  // Đọc nội dung thuyết minh bằng giọng nói do trình duyệt cung cấp.
  // Thanh tiến trình vẫn được giữ để người dùng dễ theo dõi trạng thái nghe.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synthesis = window.speechSynthesis;
    if (!audioPlaying) {
      if (synthesis.speaking && !synthesis.paused) synthesis.pause();
      return;
    }

    if (!selectedExhibit) return;

    const key = `${selectedExhibit.id}-${language}`;
    if (speechKeyRef.current === key && synthesis.paused) {
      synthesis.resume();
      return;
    }

    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      language === 'vi' ? selectedExhibit.description.vi : selectedExhibit.description.en
    );
    utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => {
      if (speechUtteranceRef.current !== utterance) return;
      setAudioPlaying(false);
      setAudioProgress(0);
    };
    utterance.onerror = () => {
      if (speechUtteranceRef.current !== utterance) return;
      setAudioPlaying(false);
    };

    speechUtteranceRef.current = utterance;
    speechKeyRef.current = key;
    synthesis.speak(utterance);
  }, [audioPlaying, language, selectedExhibit, setAudioPlaying]);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Xử lý logic Quiz game ---
  const currentQuiz = gameData?.quizzes[currentQuizIndex];
  const shuffledOptions = useMemo(() => {
    if (!currentQuiz || !selectedExhibit) return [];

    const seedText = `${nickname}-${selectedExhibit.id}-${currentQuizIndex}`;
    let seed = 0;
    for (let i = 0; i < seedText.length; i += 1) {
      seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    }

    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    return currentQuiz.options
      .map((text, originalIndex) => ({ text, originalIndex }))
      .sort(() => random() - 0.5);
  }, [currentQuiz, currentQuizIndex, nickname, selectedExhibit]);

  const previewImages = useMemo(() => {
    if (!selectedExhibit) return [];
    if (selectedExhibit.id === 'vn-back-right') return ['/exhibits/anhgame.jpg'];
    // Room 05 có thể đã được preload trước khi dữ liệu JSON mới được tải lại.
    // Ưu tiên danh sách ảnh cố định này để modal luôn thay poster SVG cũ.
    if (selectedExhibit.id === 'nha-rong-departure-1911') return NHA_RONG_DEPARTURE_IMAGES;
    if (selectedExhibit.id === 'nha-rong-first-voyage') return ['/exhibits/nha-rong-first-voyage.png'];
    if (selectedExhibit.id === 'nha-rong-latouche-treville' && exhibitModalMode === 'game') {
      return ['/exhibits/nha-rong-van-ba-profile.png'];
    }
    if (selectedExhibit.id === 'nha-rong-galley-work' && exhibitModalMode === 'game') {
      return ['/exhibits/nha-rong-galley-archive.png'];
    }
    if (selectedExhibit.id === 'nha-rong-ship-exploration') return ['/exhibits/nha-rong-ship.svg'];

    const slideshowImages = selectedExhibit.image_urls?.filter(Boolean) ?? [];
    return slideshowImages.length > 0
      ? slideshowImages
      : selectedExhibit.thumbnail_url
        ? [selectedExhibit.thumbnail_url]
        : [];
  }, [selectedExhibit, exhibitModalMode]);

  if (!selectedExhibit) return null;

  const titleText = isVanBaProfile
    ? (language === 'vi' ? 'Hồ sơ Văn Ba' : 'The Văn Ba profile')
    : (language === 'vi' ? selectedExhibit.title.vi : selectedExhibit.title.en);
  const authorText = isVanBaProfile
    ? (language === 'vi' ? 'Tư liệu nhân thân và lao động' : 'Identity and labour archive')
    : (language === 'vi' ? selectedExhibit.author.vi : selectedExhibit.author.en);
  const descriptionText = language === 'vi' ? selectedExhibit.description.vi : selectedExhibit.description.en;

  const handleSelectOption = (idx: number) => {
    if (answerChecked) return;
    if (currentQuiz?.isMulti) {
      setSelectedOptions(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setSelectedOption(idx);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentQuiz) return;

    let correct = false;
    if (currentQuiz.isMulti) {
      const correctIdxs = currentQuiz.correctIndex as number[];
      correct = selectedOptions.length === correctIdxs.length &&
        selectedOptions.every(val => correctIdxs.includes(val));
    } else {
      correct = selectedOption === currentQuiz.correctIndex;
    }

    setIsCorrect(correct);
    setAnswerChecked(true);
  };

  const handleNextStep = () => {
    if (!gameData) return;

    if (!isCorrect) {
      setSelectedOption(null);
      setSelectedOptions([]);
      setAnswerChecked(false);
      setIsCorrect(false);
      return;
    }

    if (currentQuizIndex < gameData.quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setSelectedOptions([]);
      setAnswerChecked(false);
      setIsCorrect(false);
    } else if (isRoomOneFinalRound) {
      // Câu hỏi trong tủ kính là manh mối thứ 7; hoàn thành Room 1 chỉ xảy ra
      // sau khi người chơi giải puzzle tổng kết trong Sổ điều tra.
      addClue(ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID);
      setGameState('info');
    } else {
      // A Room 1 point is only awarded after every question for this exhibit is correct.
      addClue(selectedExhibit!.id);
      setGameState('info');
    }
  };

  return (
    <div className="absolute inset-x-4 top-16 bottom-16 z-50 flex items-center justify-center pointer-events-none select-none">
      <div className={`w-full max-w-7xl h-full bg-slate-950/92 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row text-slate-100 transition-all duration-300 pointer-events-auto ${isNhaRongExhibit ? 'nha-rong-typography' : ''}`}>
        {/* Ảnh xem trước lớn bên trái */}
        <div className="relative h-[38vh] lg:h-full lg:w-[48%] xl:w-[52%] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 flex items-center justify-center">
          {previewImages.length > 0 ? (
            <ExhibitMediaCarousel
              key={selectedExhibit.id}
              images={previewImages}
              alt={titleText}
              objectPosition={selectedExhibit.id === 'exhibit-priceboard' ? 'right center' : 'center'}
            />
          ) : (
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-24 h-24 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                  <Gamepad2 size={48} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-wide">{titleText}</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm">
                    {language === 'vi' 
                      ? 'Trò chơi tương tác tìm hiểu lịch sử trực quan của phòng trưng bày.' 
                      : 'Interactive game to explore the gallery\'s visual history.'}
                  </p>
                </div>
              </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/85 via-slate-950/10 to-transparent pointer-events-none" />

          {/* Nhãn loại hiện vật */}
          <span className="absolute bottom-5 left-5 bg-amber-500/20 text-amber-200 border border-amber-500/35 text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-lg uppercase font-sans">
            {isDepartureMission
              ? (language === 'vi' ? 'Nhiệm vụ khởi hành' : 'Departure mission')
              : isShipExplorationMission
              ? (language === 'vi' ? 'Khám phá con tàu' : 'Ship exploration')
              : isGalleyWorkMission
              ? (language === 'vi' ? 'Nhiệm vụ lịch sử' : 'Historical mission')
              : isVanBaProfile
              ? (language === 'vi' ? 'Hồ sơ tương tác' : 'Interactive profile')
              : isFirstVoyageGame
              ? (language === 'vi' ? 'Trò chơi hải trình' : 'Voyage game')
              : isSubsidyRoom
                ? 'Theo dấu chân Người'
                : (selectedExhibit.model_3d_url ? 'Điêu Khắc 3D' : 'Hội Họa 2D')}
          </span>
        </div>

        {/* Nội dung chi tiết */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Nút đóng */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setAudioPlaying(false);
              setSelectedExhibit(null);
            }}
            className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-slate-900/85 hover:bg-slate-800/90 text-slate-200 hover:text-white p-3 rounded-full border border-slate-700/60 backdrop-blur-sm transition-colors cursor-pointer z-50 shadow-md"
          >
            <X size={20} />
          </button>

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 custom-scrollbar text-base">

            {/* ═══════════════════════════════════════════════════════════════
                TRƯỜNG HỢP 1: GAMEPLAY KHÁM PHÁ THỜI BAO CẤP (PHÒNG BAO CẤP)
                ═══════════════════════════════════════════════════════════════ */}
            {isDepartureMission ? (
              <DepartureMission
                language={language}
                completed={roomFiveProgress.fragments.includes('departure')}
                onComplete={() => completeRoomFiveFragment('departure')}
                onReset={() => resetRoomFiveFragment('departure')}
              />
            ) : isShipExplorationMission ? (
              <ShipExplorationMission
                language={language}
                visitedHotspots={roomFiveProgress.shipHotspots}
                onVisit={visitRoomFiveShipHotspot}
              />
            ) : isGalleyWorkMission ? (
              <GalleyWorkMission
                language={language}
                setLanguage={setLanguage}
                nickname={nickname}
                completed={roomFiveProgress.fragments.includes('labour')}
                onComplete={() => completeRoomFiveFragment('labour')}
                onReset={() => resetRoomFiveFragment('labour')}
              />
            ) : isVanBaProfile ? (
              <VanBaProfile
                language={language}
                setLanguage={setLanguage}
                completed={roomFiveProgress.fragments.includes('identity')}
                onComplete={() => completeRoomFiveFragment('identity')}
              />
            ) : isFirstVoyageGame ? (
              <FirstVoyageGame
                language={language}
                setLanguage={setLanguage}
                completed={roomFiveProgress.fragments.includes('voyage')}
                onComplete={() => completeRoomFiveFragment('voyage')}
                onReset={() => resetRoomFiveFragment('voyage')}
                onClose={() => {
                  setAudioPlaying(false);
                  setSelectedExhibit(null);
                }}
              />
            ) : isSubsidyRoom && gameData ? (
              <div className="space-y-4">
                {/* Tiêu đề hiện vật */}
                <div className="pr-12">
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-2 font-sans">
                    {titleText}
                  </h2>
                  <div className="text-amber-300 font-sans text-sm uppercase tracking-wider font-bold">
                    {authorText}
                  </div>
                </div>
                <hr className="border-slate-800/80" />

                {/* Mở tranh là vào câu hỏi ngay, không có thời gian chờ. */}
                {effectiveGameState === 'quiz' && currentQuiz && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                      <HelpCircle size={14} />
                      <span>CÂU HỎI LỊCH SỬ {currentQuizIndex + 1}/{gameData.quizzes.length}</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                      <p className="font-sans text-xl lg:text-2xl font-bold text-slate-50 leading-relaxed">
                        {currentQuiz.question}
                      </p>
                    </div>

                    {!answerChecked && (
                      <div className="space-y-2">
                        {shuffledOptions.map((opt) => {
                          const isOptionSelected = currentQuiz.isMulti
                            ? selectedOptions.includes(opt.originalIndex)
                            : selectedOption === opt.originalIndex;

                          let optStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';

                          if (isOptionSelected) {
                            optStyle = 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold';
                          }

                          return (
                            <button
                              key={opt.originalIndex}
                              disabled={answerChecked}
                              onClick={() => handleSelectOption(opt.originalIndex)}
                              className={`w-full text-left p-5 rounded-2xl border text-base lg:text-lg leading-relaxed font-sans transition-all cursor-pointer ${optStyle}`}
                            >
                              <span className="font-mono font-bold mr-1.5">
                                {String.fromCharCode(65 + shuffledOptions.findIndex(item => item.originalIndex === opt.originalIndex))}.
                              </span>
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!answerChecked ? (
                      <button
                        onClick={handleCheckAnswer}
                        disabled={(currentQuiz.isMulti ? selectedOptions.length === 0 : selectedOption === null)}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black py-4 px-5 rounded-2xl transition-all cursor-pointer uppercase font-sans tracking-wide text-base"
                      >
                        Kiểm tra đáp án
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {isCorrect ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/25 p-5 rounded-2xl flex flex-col items-center text-center gap-3 text-emerald-400">
                            <Check size={30} />
                            <span className="font-mono font-bold text-sm">Đáp án chính xác!</span>
                            <p className="text-xs text-emerald-300/80">
                              {currentQuizIndex < gameData.quizzes.length - 1
                                ? 'Tiếp tục trả lời câu tiếp theo để nhận điểm.'
                                : isRoomOneFinalRound
                                  ? 'Bạn đã đúng câu hỏi cuối và sẽ nhận điểm cuối để mở Sổ điều tra.'
                                  : 'Bạn đã đúng toàn bộ câu hỏi và sẽ nhận 1 điểm.'}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-rose-500/10 border border-rose-500/25 p-5 rounded-2xl flex flex-col items-center text-center gap-3 text-rose-400">
                            <AlertTriangle size={30} />
                            <span className="font-mono font-bold text-sm">Lựa chọn chưa đúng.</span>
                            <p className="text-xs text-rose-300/80">Hãy chọn lại đáp án đúng để tiếp tục câu hỏi này.</p>
                          </div>
                        )}

                        <button
                          onClick={handleNextStep}
                          className={`w-full text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-mono tracking-wider ${
                            isCorrect ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              {currentQuizIndex < gameData.quizzes.length - 1
                                ? 'Câu tiếp theo'
                                : isRoomOneFinalRound
                                  ? 'Nhận điểm cuối'
                                  : 'Nhận 1 điểm'}
                              <ArrowRight size={14} />
                            </>
                          ) : (
                            'Thử lại câu này'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* BƯỚC 3: ĐỌC TƯ LIỆU VÀ LƯU MANH MỐI */}
                {effectiveGameState === 'info' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <BookOpen size={14} />
                        Tư liệu lịch sử bao cấp
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans text-justify bg-slate-900/35 p-3 rounded-xl border border-slate-900 font-medium">
                        {gameData.historyText}
                      </p>
                    </div>



                    {isRoomOneFinalRound && roomOneCompleted ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                        <span className="text-xl">✓</span>
                        <div>
                          <span className="text-[10px] font-bold block tracking-wider uppercase font-sans text-emerald-500">Đã hoàn thành Room 1</span>
                          <span className="text-xs font-semibold leading-relaxed font-sans">Bạn đã giải đúng câu hỏi cuối trong tủ kính trung tâm.</span>
                        </div>
                      </div>
                    ) : isRoomOneFinalRound && finalArchiveClueCollected ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                        <span className="text-xl">✓</span>
                        <div>
                          <span className="text-[10px] font-bold block tracking-wider uppercase font-sans text-emerald-500">Đã nhận điểm cuối</span>
                          <span className="text-xs font-semibold leading-relaxed font-sans">Sổ điều tra đã mở để bạn hoàn thành puzzle tổng kết.</span>
                        </div>
                      </div>
                    ) : cluesCollected.includes(selectedExhibit.id) ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                        <span className="text-xl">✓</span>
                        <div>
                          <span className="text-[10px] font-bold block tracking-wider uppercase font-sans text-emerald-500">Đã nhận 1 điểm</span>
                          <span className="text-xs font-semibold leading-relaxed font-sans">{gameData.clueText}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              /* ═══════════════════════════════════════════════════════════════
                  TRƯỜNG HỢP 2: THUYẾT MINH MẶC ĐỊNH (PHÒNG TRANH HOẶC TƯỢNG)
                  ═══════════════════════════════════════════════════════════════ */
              <>
                {/* Tiêu đề & Tác giả */}
                <div className="pr-12">
                  <h2 className="text-xl font-bold tracking-tight text-white leading-tight mb-1 font-sans">
                    {titleText}
                  </h2>
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
                    <User size={12} />
                    <span className="font-semibold">{authorText}</span>
                  </div>
                </div>

                <hr className="border-slate-800/80" />

                {/* Bộ đổi ngôn ngữ (i18n) */}
                <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <Globe size={14} />
                    {language === 'vi' ? 'NGÔN NGỮ THUYẾT MINH' : 'GUIDE LANGUAGE'}
                  </span>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setLanguage('vi')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer font-mono ${language === 'vi' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      VI
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer font-mono ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {/* Thuyết minh văn bản */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                    <BookOpen size={14} />
                    {selectedExhibit.id === 'vn-back-right'
                      ? (language === 'vi' ? 'LUẬT CHƠI' : 'RULES OF THE GAME')
                      : (language === 'vi' ? 'THUYẾT MINH HIỆN VẬT' : 'EXPLANATORY NOTE')}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify bg-slate-900/20 p-3 rounded-xl border border-slate-900 whitespace-pre-line">
                    {descriptionText}
                  </p>
                </div>

                {/* Audio Guide */}
                {selectedExhibit.id !== 'vn-back-right' && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <Volume2 size={14} />
                        AUDIO GUIDE
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTime(audioProgress)} / {formatTime(audioDuration)}
                      </span>
                    </div>

                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setAudioPlaying(!audioPlaying)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-5 rounded-full font-bold text-[10px] transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 font-mono"
                      >
                        {audioPlaying ? (
                          <>
                            <Pause size={12} fill="currentColor" />
                            TẠM DỪNG
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" />
                            NGHE THUYẾT MINH
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nút chơi game cho hiện vật WTO */}
                {selectedExhibit.id === 'vn-back-right' && (
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-4 rounded-xl border border-cyan-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <Gamepad2 size={14} />
                        {language === 'vi' ? 'DÒNG CHẢY LỊCH SỬ' : 'HISTORY FLOW'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      {language === 'vi'
                        ? 'Kiểm tra trí nhớ của bạn qua trò chơi sắp xếp trục thời gian về các dấu mốc lịch sử.'
                        : 'Test your memory with our timeline sorting game about historical milestones.'}
                    </p>
                    <p className="text-[10px] text-amber-400 font-semibold bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed font-sans">
                      {language === 'vi'
                        ? '⚠️ Lưu ý: Mỗi người chơi chỉ được chơi 1 lần duy nhất. Khi đã bắt đầu chơi game, bạn có thể thoát ra ngoài để kiểm tra lại các tác phẩm tranh trong phòng nhằm chắc chắn mốc thời gian của từng sự kiện trước khi xác nhận sắp xếp!'
                        : '⚠️ Note: Each player can only play once. When you start the game, you can exit to check the paintings in the room to make sure of the time of each event before confirming the sorting!'}
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          if (globalGameState === 'idle') {
                            initializeGame();
                          }
                          setMiniGameOpen(true);
                          setSelectedExhibit(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 px-6 rounded-xl font-bold text-xs transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20 font-mono"
                      >
                        <Gamepad2 size={14} fill="currentColor" />
                        {globalGameState === 'playing'
                          ? (language === 'vi' ? 'TIẾP TỤC CHƠI' : 'RESUME GAME')
                          : (globalGameState === 'won' || globalGameState === 'lost'
                            ? (language === 'vi' ? 'XEM KẾT QUẢ' : 'VIEW RESULTS')
                            : (language === 'vi' ? 'BẮT ĐẦU CHƠI GAME' : 'START GAME'))}
                      </button>
                    </div>
                  </div>
                )}

              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitModal;
