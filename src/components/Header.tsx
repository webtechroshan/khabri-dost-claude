import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Search,
  BookMarked,
  Newspaper,
  PenTool,
  LogIn,
  LogOut,
  Sun,
  TrendingUp,
  Settings,
  ChevronRight,
  Menu,
  X,
  Hash,
  Sliders,
  Play,
  Pause,
  FastForward,
  Type,
  Calendar,
  Clock,
  CloudSun,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Bell,
  Lock,
  Tv,
  Check,
  Radio,
  Mail,
  ShieldCheck,
  FileText,
  AlertCircle,
  BookOpen,
  Layout,
  Home,
  MapPin,
  Gamepad2,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewsCategory, PortalSettings, NewsArticle, MobileSidebarMenuConfig, NetworkEdition } from '../types/news';
import { CATEGORIES, ALL_INDIAN_STATES_BY_REGION } from '../data/seedNews';
import { DEFAULT_MOBILE_SIDEBAR_MENU } from '../data/portalDefaults';
import { getTodayHindiDate, formatHindiTimeAgo } from '../utils/hindiHelpers';

interface HeaderProps {
  currentCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPublisherCMS: () => void;
  onOpenBookmarks: () => void;
  onOpenReadLater?: () => void;
  onOpenEPaper: () => void;
  onOpenAdminSettings: (tab?: any) => void;
  onOpenAdminBackend?: () => void;
  onOpenStaffLogin?: () => void;
  onOpenSubscriberModal?: () => void;
  onScrollToLiveVideo?: () => void;
  onOpenTypography?: () => void;
  onOpenAllStatesModal?: () => void;
  bookmarksCount: number;
  readLaterCount?: number;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onResetTypography?: () => void;
  portalSettings: PortalSettings;
  onUpdateSettings: (newSettings: Partial<PortalSettings>) => void;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onOpenLiveFeed?: () => void;
  onOpenContactPage?: () => void;
  onOpenAboutUsPage?: () => void;
  onOpenSubmitNews?: () => void;
  onOpenLegalPolicy?: (type: any) => void;
  onOpenArchivePage?: () => void;
  onOpenSudokuGame?: () => void;
  onBackToHome?: () => void;
  myCity?: string;
  onSelectCity?: (city: string) => void;
}

export const POPULAR_CITIES = [
  'नई दिल्ली',
  'लखनऊ',
  'जयपुर',
  'भोपाल',
  'पटना',
  'मुंबई',
  'इंदौर',
  'वाराणसी',
  'प्रयागराज',
  'कानपुर',
  'चंडीगढ़',
  'देहरादून',
  'रांची',
  'रायपुर',
  'गोरखपुर',
  'मेरठ',
  'आगरा',
  'अहमदाबाद',
  'कोलकाता',
];

const CITY_WEATHER_LIST = [
  { city: 'नई दिल्ली', temp: '28°C', condition: 'साफ़ धूप', aqi: 'AQI 108' },
  { city: 'लखनऊ', temp: '29°C', condition: 'आंशिक बादल', aqi: 'AQI 115' },
  { city: 'पटना', temp: '30°C', condition: 'धूप खिली', aqi: 'AQI 122' },
  { city: 'भोपाल', temp: '27°C', condition: 'सुहावना मौसम', aqi: 'AQI 94' },
  { city: 'जयपुर', temp: '31°C', condition: 'शुष्क व गर्म', aqi: 'AQI 110' },
  { city: 'मुंबई', temp: '32°C', condition: 'हल्की धूप', aqi: 'AQI 88' },
];

export const MAJOR_INDIAN_STATES = [
  'उत्तर प्रदेश',
  'बिहार',
  'दिल्ली NCR',
  'मध्य प्रदेश',
  'राजस्थान',
  'महाराष्ट्र',
  'हरियाणा',
  'गुजरात',
  'पंजाब',
  'उत्तराखंड',
  'झारखंड',
  'छत्तीसगढ़',
  'हिमाचल प्रदेश',
  'पश्चिम बंगाल',
  'ओडिशा',
  'असम',
  'जम्मू-कश्मीर',
  'कर्नाटक',
  'तमिलनाडु',
  'तेलंगाना',
];

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenPublisherCMS,
  onOpenBookmarks,
  onOpenReadLater,
  onOpenEPaper,
  onOpenAdminSettings,
  onOpenAdminBackend,
  onOpenStaffLogin,
  onOpenSubscriberModal,
  onScrollToLiveVideo,
  onOpenTypography,
  onOpenAllStatesModal,
  bookmarksCount,
  readLaterCount = 0,
  fontSize,
  onChangeFontSize,
  onResetTypography,
  portalSettings,
  onUpdateSettings,
  articles,
  onSelectArticle,
  onOpenLiveFeed,
  onOpenContactPage,
  onOpenAboutUsPage,
  onOpenSubmitNews,
  onOpenLegalPolicy,
  onOpenArchivePage,
  onOpenSudokuGame,
  onBackToHome,
  myCity: controlledCity,
  onSelectCity,
}) => {
  const { user, isStaff, isAdmin, staffSession, signInWithGoogle, logout, logoutStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMegaMenuOpen, setDesktopMegaMenuOpen] = useState(false);
  const [statesMenuOpen, setStatesMenuOpen] = useState(false);
  const [megaMenuCategory, setMegaMenuCategory] = useState<NewsCategory>('all');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [customSpeedInput, setCustomSpeedInput] = useState(portalSettings.tickerSpeedSeconds || 65);
  const [showCustomSpeedForm, setShowCustomSpeedForm] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const [weatherMenuOpen, setWeatherMenuOpen] = useState(false);
  const [mobileStatesExpanded, setMobileStatesExpanded] = useState(true);
  const [editionsOpen, setEditionsOpen] = useState(false);
  const editionsDropdownRef = useRef<HTMLDivElement>(null);

  // 'मेरा शहर' (My City) State & LocalStorage persistence
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (controlledCity) return controlledCity;
    try {
      return localStorage.getItem('kd_my_city') || 'नई दिल्ली';
    } catch {
      return 'नई दिल्ली';
    }
  });
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledCity) {
      setSelectedCity(controlledCity);
    }
  }, [controlledCity]);

  const handleChooseCity = (city: string) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('kd_my_city', city);
    } catch {}
    setCityPickerOpen(false);
    if (onSelectCity) {
      onSelectCity(city);
    } else {
      onSearchChange(city);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statesMenuRef = useRef<HTMLDivElement>(null);
  const statesTriggerRef = useRef<HTMLButtonElement>(null);
  const statesHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterMegaMenu = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setStatesMenuOpen(false);
    setDesktopMegaMenuOpen(true);
  };

  const handleMouseLeaveMegaMenu = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setDesktopMegaMenuOpen(false);
    }, 450);
  };

  const handleMouseEnterStatesMenu = () => {
    if (statesHoverTimeoutRef.current) {
      clearTimeout(statesHoverTimeoutRef.current);
      statesHoverTimeoutRef.current = null;
    }
    setDesktopMegaMenuOpen(false);
    setStatesMenuOpen(true);
  };

  const handleMouseLeaveStatesMenu = () => {
    if (statesHoverTimeoutRef.current) {
      clearTimeout(statesHoverTimeoutRef.current);
    }
    statesHoverTimeoutRef.current = setTimeout(() => {
      setStatesMenuOpen(false);
    }, 400);
  };

  // Filtered stories inside Mega Menu based on active category
  const megaMenuArticles = React.useMemo(() => {
    let pool = articles || [];
    if (megaMenuCategory !== 'all') {
      pool = pool.filter((a) => a.category === megaMenuCategory);
    }
    return pool.slice(0, 5);
  }, [articles, megaMenuCategory]);

  // Top trending stories for Mega Menu
  const megaTrendingArticles = React.useMemo(() => {
    return [...(articles || [])]
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      .slice(0, 4);
  }, [articles]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close desktop mega menu when clicking outside or pressing ESC
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If clicked inside the menu itself, let it handle its own events
      if (megaMenuRef.current && megaMenuRef.current.contains(target)) {
        return;
      }
      // If clicked on trigger button or inside it, ignore here so button's onClick can toggle cleanly
      if (target.closest && target.closest('[data-megamenu-trigger]')) {
        return;
      }
      if (megaMenuTriggerRef.current && megaMenuTriggerRef.current.contains(target)) {
        return;
      }
      setDesktopMegaMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopMegaMenuOpen(false);
      }
    };

    if (desktopMegaMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [desktopMegaMenuOpen]);

  // Close editions dropdown on outside click or ESC
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (editionsDropdownRef.current && editionsDropdownRef.current.contains(target)) {
        return;
      }
      setEditionsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditionsOpen(false);
      }
    };

    if (editionsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editionsOpen]);

  // Close city picker dropdown on outside click or ESC
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (cityDropdownRef.current && cityDropdownRef.current.contains(target)) {
        return;
      }
      setCityPickerOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCityPickerOpen(false);
      }
    };

    if (cityPickerOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cityPickerOpen]);

  // Active Network & Language Editions
  const activeEditions: NetworkEdition[] = React.useMemo(() => {
    const configured = portalSettings.headerFooter?.languageEditions;
    if (configured && configured.length > 0) {
      return configured.filter((e) => e.enabled);
    }
    return [
      {
        id: 'edition-hi',
        name: 'हिंदी (मुख्य)',
        langCode: 'hi',
        icon: '🇮🇳',
        url: 'https://khabridost.com',
        openInNewTab: false,
        enabled: true,
        isCurrent: true,
      },
      {
        id: 'edition-en',
        name: 'English Edition',
        langCode: 'en',
        icon: '🌐',
        url: 'https://en.khabridost.com',
        openInNewTab: true,
        enabled: true,
        isCurrent: false,
      },
      {
        id: 'edition-pa',
        name: 'ਪੰਜਾਬੀ (Punjabi)',
        langCode: 'pa',
        icon: '🌾',
        url: 'https://punjabi.khabridost.com',
        openInNewTab: true,
        enabled: true,
        isCurrent: false,
      },
    ];
  }, [portalSettings.headerFooter?.languageEditions]);

  const todayHindi = getTodayHindiDate();
  const [currentTime, setCurrentTime] = useState<string>('');

  const siteTitle = portalSettings.headerFooter?.siteTitle || 'खबरी दोस्त';
  const siteTagline = portalSettings.headerFooter?.siteTagline || 'KHABRI DOST • भारत का विश्वसनीय हिंदी न्यूज़ पोर्टल';
  const showTagline = portalSettings.headerFooter?.showTagline ?? false;
  const showTaglineDesktop = portalSettings.headerFooter?.showTaglineDesktop ?? true;
  const showTaglineMobile = portalSettings.headerFooter?.showTaglineMobile ?? false;
  const isTaglineVisible = showTagline;
  const taglineVisibilityClass = isTaglineVisible
    ? showTaglineDesktop && showTaglineMobile
      ? 'block'
      : showTaglineDesktop
      ? 'hidden md:block'
      : showTaglineMobile
      ? 'block md:hidden'
      : 'block'
    : 'hidden';
  const socialLinks = portalSettings.headerFooter?.socialLinks || {
    whatsappChannel: 'https://whatsapp.com/channel/example',
    telegramChannel: 'https://t.me/example',
    facebook: 'https://facebook.com',
    twitter: 'https://x.com',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
  };

  const hfSettings = portalSettings.headerFooter;

  // Custom ordered and filtered categories for desktop and mobile navigation
  const sortedCategories = React.useMemo(() => {
    const rawOrder = hfSettings?.navCategoryOrder || [
      'national',
      'state',
      'politics',
      'business',
      'entertainment',
      'sports',
      'tech',
      'lifestyle',
      'world',
    ];
    const disabled = hfSettings?.disabledCategories || [];
    const baseCats = CATEGORIES.filter((c) => c.id !== 'all' && !disabled.includes(c.id));

    // Sort according to admin's custom sequence
    return [...baseCats].sort((a, b) => {
      const idxA = rawOrder.indexOf(a.id);
      const idxB = rawOrder.indexOf(b.id);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });
  }, [hfSettings?.navCategoryOrder, hfSettings?.disabledCategories]);

  const mobileSidebarConfig: MobileSidebarMenuConfig = {
    ...DEFAULT_MOBILE_SIDEBAR_MENU,
    ...(portalSettings.mobileSidebarMenu || {}),
  };

  // Live real-time clock for top header bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('hi-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchModalOpen]);

  // Extract recent news for breaking ticker
  const recentBreakingHeadlines = React.useMemo(() => {
    const list: { id?: string; title: string; article?: NewsArticle }[] = [];
    
    articles
      .filter((a) => a.isBreaking)
      .slice(0, 5)
      .forEach((a) => list.push({ id: a.id, title: a.title, article: a }));

    [...articles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach((a) => {
        if (!list.some((item) => item.id === a.id)) {
          list.push({ id: a.id, title: a.title, article: a });
        }
      });

    return list;
  }, [articles]);

  // Filtered articles inside the search modal for live results preview
  const searchPreviewArticles = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q))
      )
      .slice(0, 4);
  }, [searchQuery, articles]);

  const speedDuration = React.useMemo(() => {
    if (portalSettings.tickerSpeed === 'paused') return '0s';
    if (portalSettings.tickerSpeed === 'custom') {
      const sec = portalSettings.tickerSpeedSeconds || customSpeedInput || 65;
      return `${sec}s`;
    }
    const map: Record<string, string> = {
      ultra_slow: '140s',
      slow: '90s',
      normal: '65s',
      fast: '35s',
    };
    return map[portalSettings.tickerSpeed || 'slow'] || '90s';
  }, [portalSettings.tickerSpeed, portalSettings.tickerSpeedSeconds, customSpeedInput]);

  const isPaused = portalSettings.tickerSpeed === 'paused';

  // Sequenced and enabled categories according to Admin settings
  const navOrder = portalSettings.headerFooter?.navCategoryOrder || [
    'national',
    'state',
    'politics',
    'business',
    'entertainment',
    'sports',
    'tech',
    'lifestyle',
    'world',
  ];
  const disabledCats = portalSettings.headerFooter?.disabledCategories || [];
  const customCatLabels = portalSettings.headerFooter?.customCategoryLabels || {};

  const activeCategories = React.useMemo(() => {
    return navOrder
      .map((id) => CATEGORIES.find((c) => c.id === id))
      .filter((c): c is (typeof CATEGORIES)[0] => Boolean(c && !disabledCats.includes(c.id)));
  }, [navOrder, disabledCats]);

  // Custom sequenced states
  const customStatesList =
    portalSettings.headerFooter?.customStates && portalSettings.headerFooter.customStates.length > 0
      ? portalSettings.headerFooter.customStates
      : MAJOR_INDIAN_STATES;
  const disabledStatesList = portalSettings.headerFooter?.disabledStates || [];
  const activeStatesList = React.useMemo(() => {
    return customStatesList.filter((s) => !disabledStatesList.includes(s));
  }, [customStatesList, disabledStatesList]);

  // Duplicate trending topics array to ensure smooth continuous marquee sliding
  const duplicatedTopics = React.useMemo(() => {
    const topics = portalSettings.trendingTopics || [];
    return [...topics, ...topics, ...topics];
  }, [portalSettings.trendingTopics]);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 1. TOP UTILITY STRIP (CLEAN, MINIMAL & PREMIUM LIGHT) */}
      <div className="w-full bg-slate-50 text-slate-700 text-[11px] sm:text-xs py-1.5 border-b border-slate-200 select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: Date & Live Time (DESKTOP ONLY - HIDDEN ON MOBILE AS REQUESTED) */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3 shrink-0 font-kd-meta">
            {/* Hindi Date */}
            <div className="flex items-center space-x-1.5 text-slate-800 whitespace-nowrap font-medium">
              <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>{todayHindi}</span>
            </div>

            <span className="text-slate-300 hidden sm:inline">•</span>

            {/* Live Real-time Clock */}
            <div className="hidden sm:flex items-center space-x-1.5 text-slate-600 whitespace-nowrap font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-700">{currentTime || '11:45 AM'}</span>
            </div>
          </div>

          {/* Right: Clean, Minimal Essentials (Live TV, e-Paper, Bookmarks & Social) */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1 sm:gap-2.5 font-kd-meta overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {/* 1. Live TV Button */}
              {portalSettings.headerFooter?.headerShowLiveTv !== false && onScrollToLiveVideo && (
                <button
                  type="button"
                  onClick={onScrollToLiveVideo}
                  className="flex items-center space-x-1 sm:space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-2.5 py-1 rounded-full transition text-[11px] sm:text-xs font-bold shadow-xs relative cursor-pointer group shrink-0"
                  title="लाइव टीवी देखें (Watch Live TV)"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Live TV</span>
                </button>
              )}

              {/* 2. e-Paper Button */}
              {portalSettings.headerFooter?.headerShowEPaper !== false && (
                <button
                  type="button"
                  onClick={onOpenEPaper}
                  className="flex items-center space-x-1 sm:space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-red-600 px-2 sm:px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition text-[11px] sm:text-xs font-semibold shadow-xs cursor-pointer shrink-0"
                  title="डिजिटल ई-पेपर पढ़ें (Digital e-Paper)"
                >
                  <Newspaper className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">e-Paper</span>
                </button>
              )}

              {/* 2.5 Language / Brand Network Editions Switcher */}
              {portalSettings.headerFooter?.headerShowLanguageEditions !== false && (
                <div className="relative shrink-0" ref={editionsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setEditionsOpen(!editionsOpen)}
                    className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full border transition text-[11px] sm:text-xs font-semibold shadow-xs cursor-pointer ${
                      editionsOpen
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-red-600 border-slate-200'
                    }`}
                    title="Select Language / Edition"
                    aria-expanded={editionsOpen}
                    aria-haspopup="true"
                  >
                    <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Editions</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${editionsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu (Dual-mode: Screen-Centered Modal on Mobile to Prevent Cropping, Absolute Dropdown on Desktop) */}
                  {editionsOpen && (
                    <>
                      {/* Mobile Backdrop & Centered Popover (NEVER CROPPED) */}
                      <div
                        className="sm:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-start justify-center p-3 pt-14 animate-fadeIn"
                        onClick={() => setEditionsOpen(false)}
                      >
                        <div
                          className="w-full max-w-xs bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-kd-body"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-kd-meta flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-red-600" />
                              <span>भाषा व संस्करण (Editions)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditionsOpen(false)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                              title="बंद करें"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                            {activeEditions.map((ed) => (
                              <a
                                key={ed.id}
                                href={ed.url}
                                target={ed.openInNewTab ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                onClick={() => setEditionsOpen(false)}
                                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                                  ed.isCurrent
                                    ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                                    : 'hover:bg-slate-100 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <span className="text-base shrink-0 leading-none">{ed.icon || '🌐'}</span>
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-900">{ed.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate">{ed.url.replace(/^https?:\/\//, '')}</div>
                                  </div>
                                </div>
                                {ed.isCurrent ? (
                                  <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                                    सक्रिय
                                  </span>
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Dropdown */}
                      <div className="hidden sm:block absolute right-0 top-full mt-2 w-60 sm:w-64 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn font-kd-body">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-kd-meta flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-red-600" />
                            <span>Editions & Languages</span>
                          </span>
                          <span className="text-[10px] text-red-600 font-bold font-kd-meta">Khabri Dost</span>
                        </div>

                        <div className="p-1.5 space-y-1">
                          {activeEditions.map((ed) => (
                            <a
                              key={ed.id}
                              href={ed.url}
                              target={ed.openInNewTab ? '_blank' : '_self'}
                              rel="noopener noreferrer"
                              onClick={() => setEditionsOpen(false)}
                              className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                                ed.isCurrent
                                  ? 'bg-red-50 text-red-700 font-bold border border-red-200/80'
                                  : 'hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <span className="text-base shrink-0 leading-none">{ed.icon || '🌐'}</span>
                                <div className="truncate">
                                  <div className="font-semibold text-slate-900">{ed.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate">{ed.url.replace(/^https?:\/\//, '')}</div>
                                </div>
                              </div>
                              {ed.isCurrent ? (
                                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                  Active
                                </span>
                              ) : (
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 2.6 'मेरा शहर' (My City / District Pin Selector with Persistent Selection) */}
              <div className="relative shrink-0" ref={cityDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCityPickerOpen(!cityPickerOpen)}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full border transition text-[11px] sm:text-xs font-semibold shadow-xs cursor-pointer ${
                    cityPickerOpen
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-red-600 border-slate-200'
                  }`}
                  title="अपना शहर / ज़िला चुनें (Select My City)"
                  aria-expanded={cityPickerOpen}
                  aria-haspopup="true"
                >
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 shrink-0" />
                  <span className="hidden sm:inline text-slate-500 font-normal">शहर:</span>
                  <span className="font-bold text-slate-900 max-w-[70px] sm:max-w-none truncate">{selectedCity}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${cityPickerOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* City Picker Dropdown Modal / Popover (Dual-mode: Screen-Centered Modal on Mobile, Absolute on Desktop) */}
                {cityPickerOpen && (
                  <>
                    {/* Mobile Backdrop & Centered Popover (NEVER CROPPED) */}
                    <div
                      className="sm:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-start justify-center p-3 pt-14 animate-fadeIn"
                      onClick={() => setCityPickerOpen(false)}
                    >
                      <div
                        className="w-full max-w-xs bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-kd-body"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-kd-headline">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span>अपना शहर / ज़िला चुनें</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setCityPickerOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                            title="बंद करें"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-3 max-h-72 overflow-y-auto">
                          <p className="text-[11px] text-slate-500 mb-2 px-0.5 font-kd-meta">
                            अपने शहर की प्रमुख स्थानीय खबरें देखें:
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {POPULAR_CITIES.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  handleChooseCity(c);
                                  setCityPickerOpen(false);
                                }}
                                className={`text-xs text-left px-2.5 py-2 rounded-xl transition cursor-pointer font-medium flex items-center justify-between ${
                                  selectedCity === c
                                    ? 'bg-red-600 text-white font-bold shadow-2xs'
                                    : 'bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200/80'
                                }`}
                              >
                                <span className="truncate">{c}</span>
                                {selectedCity === c && <Check className="w-3 h-3 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Dropdown */}
                    <div className="hidden sm:block absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn font-kd-body">
                      <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-kd-headline">
                          <MapPin className="w-3.5 h-3.5 text-red-600" />
                          <span>अपना शहर / ज़िला चुनें</span>
                        </span>
                        <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                          लोकल न्यूज़
                        </span>
                      </div>

                      <div className="p-2.5 max-h-64 overflow-y-auto">
                        <p className="text-[11px] text-slate-500 mb-2 px-1 font-kd-meta">
                          अपने शहर की प्रमुख स्थानीय खबरें देखें:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {POPULAR_CITIES.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleChooseCity(c)}
                              className={`text-xs text-left px-2.5 py-1.5 rounded-lg transition cursor-pointer font-medium flex items-center justify-between ${
                                selectedCity === c
                                  ? 'bg-red-600 text-white font-bold shadow-2xs'
                                  : 'bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700'
                              }`}
                            >
                              <span className="truncate">{c}</span>
                              {selectedCity === c && <Check className="w-3 h-3 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Bookmarks Button (Desktop only for a clean mobile header) */}
              {portalSettings.headerFooter?.headerShowBookmarks !== false && (
                <button
                  type="button"
                  onClick={onOpenBookmarks}
                  className="hidden sm:flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-red-600 px-2.5 py-1 rounded-full border border-slate-200 transition text-xs font-medium shadow-2xs relative cursor-pointer shrink-0"
                  title="सहेजी गई ख़बरें (Bookmarks)"
                >
                  <BookMarked className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="hidden md:inline">Bookmarks</span>
                  {bookmarksCount > 0 && (
                    <span className="bg-red-600 text-white rounded-full text-[9px] px-1.5 min-w-[15px] h-[15px] flex items-center justify-center font-bold">
                      {bookmarksCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Subtle Divider before Social Channels */}
            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* 4. Streamlined Social Media Channels: FULLY RESPONSIVE & ALWAYS VISIBLE ON MOBILE & DESKTOP */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0" aria-label="Follow Us Social Channels">
              {/* WhatsApp Channel */}
              <a
                href={socialLinks.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0"
                title="Join WhatsApp Channel"
                aria-label="WhatsApp Channel"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>

              {/* YouTube Channel */}
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full bg-[#FF0000] hover:bg-[#e60000] active:scale-95 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0"
                title="Watch on YouTube"
                aria-label="YouTube Channel"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook (Tablet & Desktop) */}
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex w-6 h-6 rounded-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0"
                title="Follow on Facebook"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* X / Twitter (Desktop only) */}
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex w-6 h-6 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-200 items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0"
                title="Follow on X"
                aria-label="X Twitter"
              >
                <svg className="w-3 h-3 fill-slate-800 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MASTHEAD WITH STRICT HORIZONTALLY CENTERED LOGO AND SEARCH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center border-b border-slate-100 relative min-w-0 gap-2">
        {/* Left Column: Mobile Menu Toggle ONLY */}
        <div className="flex items-center space-x-2 sm:space-x-3 justify-self-start shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-600 border border-slate-200 transition cursor-pointer group shadow-2xs font-kd-meta"
            aria-label="मेनू खोलें"
            title="मेनू खोलें (Menu)"
          >
            <Menu className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">मेनू</span>
          </button>
        </div>

        {/* Center Column (STRICTLY CENTERED LOGO AS REQUESTED - SINGLE LINE ENFORCED & MOBILE OPTIMIZED) */}
        <div
          className="flex flex-col items-center justify-center text-center justify-self-center cursor-pointer group select-none whitespace-nowrap shrink-0 min-w-0 max-w-full px-1"
          onClick={() => {
            onSelectCategory('all');
            onSearchChange('');
            if (onBackToHome) onBackToHome();
          }}
        >
          {portalSettings.headerFooter?.logoUrl && portalSettings.headerFooter.logoUrl.trim() !== '' ? (
            <div className="flex flex-row flex-nowrap items-center justify-center space-x-2 sm:space-x-3 py-0.5 whitespace-nowrap shrink-0 max-w-full">
              <img
                src={portalSettings.headerFooter.logoUrl}
                alt={siteTitle}
                style={{
                  height: `${portalSettings.headerFooter?.headerLogoHeight || portalSettings.typography?.headerLogoHeightPx || 48}px`,
                  maxHeight: '64px',
                }}
                className="w-auto max-h-8 sm:max-h-12 object-contain transition-all duration-200 shrink-0"
              />
              {portalSettings.headerFooter?.showSiteTitleText && (
                <span
                  style={{
                    fontSize: portalSettings.headerFooter?.headerTitleCustomPx || portalSettings.typography?.headerTitleCustomPx
                      ? `${portalSettings.headerFooter?.headerTitleCustomPx || portalSettings.typography?.headerTitleCustomPx}px`
                      : undefined,
                  }}
                  className="text-sm sm:text-base md:text-lg font-black font-kd-header tracking-tight text-slate-900 group-hover:text-red-700 transition whitespace-nowrap shrink-0 truncate max-w-[150px] sm:max-w-none"
                >
                  {siteTitle}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-row flex-nowrap items-center justify-center space-x-1 sm:space-x-2 whitespace-nowrap shrink-0">
              <span className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
              <h1
                style={{
                  fontSize: portalSettings.headerFooter?.headerTitleCustomPx || portalSettings.typography?.headerTitleCustomPx
                    ? `${portalSettings.headerFooter?.headerTitleCustomPx || portalSettings.typography?.headerTitleCustomPx}px`
                    : undefined,
                }}
                className="text-xl sm:text-3xl md:text-4xl font-black font-kd-header tracking-tight text-slate-900 group-hover:text-red-700 transition whitespace-nowrap shrink-0"
              >
                {siteTitle}
              </h1>
              <span className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
            </div>
          )}
          {siteTagline && (
            <div className={`tagline-container transition-all ${taglineVisibilityClass}`}>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide mt-0.5 truncate max-w-[280px] sm:max-w-none">
                {siteTagline}
              </p>
            </div>
          )}
        </div>

        {/* Right Column (aligned right): SEARCH + STAFF CMS / ADMIN SETTINGS */}
        <div className="flex items-center space-x-2 justify-self-end">
          {/* Desktop Search Input (Clean, streamlined, no card box background) */}
          <div className="hidden md:flex items-center relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="ख़बरें खोजें..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-36 lg:w-52 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs pl-8 pr-7 py-1.5 rounded-full border border-slate-200/90 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-medium text-slate-800 placeholder-slate-400 shadow-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 text-slate-400 hover:text-red-600 text-xs font-bold cursor-pointer"
                  title="Clear Search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Button (Toggles mobile-tailored search strip below header) */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center p-1.5 text-slate-700 hover:text-red-600 transition cursor-pointer bg-transparent border-0 shadow-none"
            title="Search News (ख़बरें खोजें)"
          >
            <Search className={`w-5 h-5 ${mobileSearchOpen || searchQuery ? 'text-red-600' : 'text-slate-700'}`} />
          </button>

          {/* Editorial / Write news CMS button */}
          {(isStaff || isAdmin) && (
            <button
              onClick={onOpenPublisherCMS}
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Editorial Desk - Compose News"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Newsroom</span>
              <span className="sm:hidden">Write</span>
            </button>
          )}

          {/* Admin Header & Branding Settings Button (Only for already logged-in Admin; Login accessible via /login) */}
          {isAdmin && (
            <button
              onClick={() => {
                if (onOpenAdminBackend) onOpenAdminBackend();
                else onOpenAdminSettings('header');
              }}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-800 hover:text-red-600 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border border-slate-300 shadow-xs transition cursor-pointer"
              title="Admin Panel & Header Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden md:inline">Admin Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH STRIP (Toggled on mobile via search button, perfectly tailored for phones) */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-2.5 px-4 animate-fadeIn shadow-xs font-kd-body">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-red-600 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              autoFocus
              placeholder="ख़बरें, मुद्दे या शहर खोजें..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none text-slate-800 font-medium"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-red-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Mobile Trending Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none text-[11px] font-kd-meta">
            <button
              type="button"
              onClick={() => onSelectCategory('trending')}
              className="text-[10px] text-red-600 font-bold shrink-0 hover:underline flex items-center gap-0.5 cursor-pointer bg-red-50 px-1.5 py-0.5 rounded border border-red-200"
              title="सभी ट्रेंडिंग समाचार देखें"
            >
              <Flame className="w-2.5 h-2.5 text-red-600 fill-red-600" />
              <span>ट्रेंडिंग:</span>
            </button>
            {(portalSettings.trendingTopics || []).slice(0, 4).map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSearchChange(t.replace(/^#/, ''));
                }}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:text-red-600 hover:bg-red-50 text-[10px] whitespace-nowrap cursor-pointer shrink-0 border border-slate-200"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH MODAL / DIALOG OVERLAY (CLEAN, POWERFUL, INSTANT SEARCH) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-fadeIn font-kd-body">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Modal Search Header */}
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-red-600 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search topics, news stories, leaders, or sports..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trending Quick Search Tags inside Search Modal */}
            <div className="p-3 sm:p-4 bg-white border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-kd-meta">
                Trending Topics (Click to search):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(portalSettings.trendingTopics || []).map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSearchChange(topic.replace(/^#/, ''));
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 text-xs font-medium transition cursor-pointer font-kd-meta"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Results Preview inside Modal */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50">
              {searchQuery.trim() ? (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-kd-meta">
                    <span>
                      Results for "{searchQuery}" ({searchPreviewArticles.length})
                    </span>
                    <button
                      onClick={() => setSearchModalOpen(false)}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      View all results on homepage →
                    </button>
                  </div>

                  {searchPreviewArticles.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                      No stories found. Try searching with different keywords.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchPreviewArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => {
                            onSelectArticle(art);
                            setSearchModalOpen(false);
                          }}
                          className="flex items-start gap-3 p-2.5 bg-white hover:bg-red-50/50 rounded-xl border border-slate-200/80 transition cursor-pointer group"
                        >
                          <img
                            src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                            alt={art.title}
                            className="w-16 h-14 sm:w-20 sm:h-16 rounded-lg object-cover shrink-0 bg-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-red-600 uppercase font-kd-meta">
                              {art.category} {art.location && `• ${art.location}`}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 font-kd-headline leading-snug">
                              {art.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 mt-1 block font-kd-meta">
                              {formatHindiTimeAgo(art.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  किसी भी विषय, शीर्षक या स्थान का नाम लिखकर तुरंत खोजें।
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-3 border-t border-slate-200 flex justify-between items-center text-xs font-kd-meta">
              <span className="text-slate-500">
                {searchQuery ? `खोज परिणाम` : 'समाचार खोजें'}
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-semibold cursor-pointer shadow-xs"
              >
                खोज बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CATEGORY NAVIGATION & DESKTOP MEGA MENU (CLEAN LIGHT THEME) */}
      <nav className="w-full bg-white text-slate-800 border-t border-b border-slate-200 relative z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div
            style={{
              fontSize: portalSettings.typography?.navLinkFontSizePx
                ? `${portalSettings.typography.navLinkFontSizePx}px`
                : undefined,
            }}
            className="hidden md:flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none font-kd-meta"
          >
            {/* 1. HOMEPAGE BUTTON */}
            <button
              type="button"
              onClick={() => {
                setDesktopMegaMenuOpen(false);
                onSelectCategory('all');
                onSearchChange('');
                if (onBackToHome) onBackToHome();
              }}
              className={`px-3 py-1.5 text-sm font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 shrink-0 mr-1 ${
                currentCategory === 'all' && !searchQuery
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-900 hover:text-red-600 hover:bg-slate-100'
              }`}
              title="होमपेज (Homepage)"
            >
              <Home className="w-4 h-4" />
              <span>होम</span>
            </button>

            {/* 2. HOVER-BASED MEGA MENU TRIGGER ('प्रमुख ख़बरें') */}
            <div
              className="relative z-50 flex items-center shrink-0"
              onMouseEnter={handleMouseEnterMegaMenu}
              onMouseLeave={handleMouseLeaveMegaMenu}
            >
              <button
                ref={megaMenuTriggerRef}
                data-megamenu-trigger="true"
                type="button"
                onClick={() => setDesktopMegaMenuOpen((prev) => !prev)}
                className={`px-3 py-1.5 text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 shrink-0 mr-1.5 rounded-lg ${
                  desktopMegaMenuOpen
                    ? 'text-red-600 font-black bg-red-50 shadow-2xs border border-red-200'
                    : 'text-slate-900 hover:text-red-600 hover:bg-slate-100'
                }`}
                title="प्रमुख ख़बरें (Hover or click to view top news & categories)"
              >
                <Layout className="w-4 h-4 text-red-600" />
                <span>प्रमुख ख़बरें</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopMegaMenuOpen ? 'rotate-180 text-red-600' : 'text-slate-500'}`} />
              </button>
            </div>

            {/* 3. LOGICALLY SEQUENCED NEWS CATEGORIES (CONFIGURED BY ADMIN) */}
            {activeCategories.filter((cat) => cat.id !== 'all').map((cat) => {
              const catDisplayLabel = customCatLabels[cat.id] || cat.labelHindi;
              if (cat.id === 'state') {
                const isActive = currentCategory === 'state' || (Boolean(searchQuery) && activeStatesList.includes(searchQuery));
                return (
                  <div
                    key={cat.id}
                    className="relative z-50 flex items-center shrink-0"
                    onMouseEnter={handleMouseEnterStatesMenu}
                    onMouseLeave={handleMouseLeaveStatesMenu}
                  >
                    <button
                      ref={statesTriggerRef}
                      type="button"
                      onClick={() => {
                        setStatesMenuOpen((prev) => !prev);
                        setDesktopMegaMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 text-sm font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center space-x-1 shrink-0 ${
                        statesMenuOpen || isActive
                          ? 'bg-red-600 text-white font-black shadow-xs'
                          : 'text-slate-900 hover:text-red-600 hover:bg-slate-100'
                      }`}
                      title="राज्य समाचार (Hover to view all states by region)"
                    >
                      <MapPin className={`w-4 h-4 ${statesMenuOpen || isActive ? 'text-white' : 'text-red-600'}`} />
                      <span>{catDisplayLabel}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${statesMenuOpen || isActive ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                    </button>
                  </div>
                );
              }

              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setDesktopMegaMenuOpen(false);
                    setStatesMenuOpen(false);
                    onSelectCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 text-sm font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center space-x-1 ${
                    isActive
                      ? 'bg-red-600 text-white font-black shadow-xs'
                      : cat.id === 'trending'
                      ? 'text-red-700 bg-red-50/70 hover:bg-red-100 border border-red-200/60 font-bold'
                      : 'text-slate-900 hover:text-red-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.id === 'trending' && <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />}
                  <span>{catDisplayLabel}</span>
                </button>
              );
            })}

            {/* 4. LIVE COVERAGE DEDICATED BUTTON */}
            {portalSettings.headerFooter?.headerShowLiveCoverage !== false &&
              portalSettings.homepageSections?.headerLiveFeedLink !== false &&
              onOpenLiveFeed && (
              <button
                onClick={() => {
                  setDesktopMegaMenuOpen(false);
                  onOpenLiveFeed();
                }}
                className="px-3 py-1.5 text-sm font-bold rounded-lg transition whitespace-nowrap cursor-pointer bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5 shadow-xs shrink-0 mr-1 ml-1"
                title="Live News Updates & Coverage"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <Radio className="w-4 h-4" />
                <span>Live Coverage</span>
              </button>
            )}
          </div>

          <div className="flex md:hidden items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none w-full font-kd-meta">
            {/* Mobile Homepage Button */}
            <button
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
                if (onBackToHome) onBackToHome();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center space-x-1 shrink-0 cursor-pointer ${
                currentCategory === 'all' && !searchQuery
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-800 hover:text-red-600 hover:bg-slate-100 active:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>होम</span>
            </button>

            {/* Mobile Live Coverage Button */}
            {portalSettings.headerFooter?.headerShowLiveCoverage !== false &&
              portalSettings.homepageSections?.headerLiveFeedLink !== false &&
              onOpenLiveFeed && (
              <button
                onClick={onOpenLiveFeed}
                className="px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1 shrink-0 shadow-xs cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <Radio className="w-3.5 h-3.5" />
                <span>LIVE</span>
              </button>
            )}

            {activeCategories.filter((cat) => cat.id !== 'all').map((cat) => {
              const catDisplayLabel = customCatLabels[cat.id] || cat.labelHindi;
              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center space-x-1 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xs'
                      : cat.id === 'trending'
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-50 font-bold'
                      : 'text-slate-800 hover:text-red-600 hover:bg-slate-100 active:bg-slate-100'
                  }`}
                >
                  {cat.id === 'trending' && <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />}
                  <span>{catDisplayLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BACKDROP OVERLAY WHEN DESKTOP MEGA MENU IS OPEN (Positioned safely below nav so cursor never leaves nav bar) */}
        {desktopMegaMenuOpen && (
          <div
            className="hidden md:block fixed inset-x-0 bottom-0 top-[100%] bg-slate-950/45 backdrop-blur-2xs z-30 transition-opacity cursor-pointer"
            onClick={() => setDesktopMegaMenuOpen(false)}
          />
        )}

        {/* DESKTOP MEGA MENU DROPDOWN PANEL (HOVER-PERSISTENT WITH RICH NEWS CARDS & STATE DIRECTORY) */}
        {desktopMegaMenuOpen && (
          <div
            ref={megaMenuRef}
            onMouseEnter={handleMouseEnterMegaMenu}
            onMouseLeave={handleMouseLeaveMegaMenu}
            className="hidden md:block absolute left-0 right-0 top-full bg-white text-slate-900 border-b-4 border-red-600 shadow-2xl z-50 border-t border-slate-200 animate-fadeIn font-kd-meta"
          >
            {/* Top Toolbar with Clear Title 'प्रमुख ख़बरें', Quick Category Switcher and Close Button */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <h3 className="font-bold text-sm sm:text-base font-kd-headline text-slate-900 tracking-wide flex items-center gap-2">
                  <span>प्रमुख ख़बरें</span>
                  <span className="text-[10px] font-medium text-slate-500 font-kd-meta hidden lg:inline">• ताज़ा व मुख्य समाचार</span>
                </h3>
              </div>

              {/* Quick Category Filter Tabs inside Mega Menu */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">विषय:</span>
                {CATEGORIES.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMegaMenuCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                      megaMenuCategory === cat.id
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat.labelHindi}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDesktopMegaMenuOpen(false)}
                className="bg-slate-200 hover:bg-red-600 hover:text-white text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs shrink-0"
                title="बंद करें (Esc)"
              >
                <X className="w-3.5 h-3.5" />
                <span>बंद करें</span>
              </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
              <div className="grid grid-cols-12 gap-5">
                {/* COLUMNS 1-6: TOP NEWS CARDS (CLICKING OPENS THE ARTICLE DIRECTLY) */}
                <div className="col-span-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-kd-headline">
                        {megaMenuCategory === 'all'
                          ? 'ताज़ा प्रमुख समाचार'
                          : `${CATEGORIES.find((c) => c.id === megaMenuCategory)?.labelHindi || 'प्रमुख'} समाचार`}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        onSelectCategory(megaMenuCategory);
                        setDesktopMegaMenuOpen(false);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>सभी ख़बरें देखें</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {megaMenuArticles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Lead Story */}
                      {megaMenuArticles[0] && (
                        <div
                          onClick={() => {
                            onSelectArticle(megaMenuArticles[0]);
                            setDesktopMegaMenuOpen(false);
                          }}
                          className="col-span-2 group bg-slate-50 hover:bg-red-50/50 p-2.5 rounded-xl border border-slate-200 hover:border-red-300 transition cursor-pointer flex gap-3.5 items-center"
                        >
                          <div className="w-36 h-24 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative">
                            <img
                              src={megaMenuArticles[0].imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                              alt={megaMenuArticles[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              {megaMenuArticles[0].category}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition font-kd-headline leading-snug">
                              {megaMenuArticles[0].title}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {megaMenuArticles[0].summary}
                            </p>
                            <div className="text-[10px] text-slate-400 font-kd-meta pt-0.5 flex items-center gap-2">
                              <span>{formatHindiTimeAgo(megaMenuArticles[0].createdAt)}</span>
                              {megaMenuArticles[0].location && <span>• {megaMenuArticles[0].location}</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Secondary Stories */}
                      {megaMenuArticles.slice(1, 5).map((art) => (
                        <div
                          key={art.id}
                          onClick={() => {
                            onSelectArticle(art);
                            setDesktopMegaMenuOpen(false);
                          }}
                          className="group bg-white hover:bg-slate-50 p-2 rounded-xl border border-slate-200/90 hover:border-slate-300 transition cursor-pointer flex gap-2.5 items-center"
                        >
                          <img
                            src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                            alt={art.title}
                            className="w-16 h-14 rounded-lg object-cover bg-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-red-600 uppercase block">
                              {art.category}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition leading-snug">
                              {art.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {formatHindiTimeAgo(art.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">कोई खबर उपलब्ध नहीं है।</p>
                  )}
                </div>

                {/* COLUMNS 7-9: TRENDING HEADLINES PREVIEW */}
                <div className="col-span-3 space-y-3 border-l border-slate-200 pl-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-kd-headline">
                      ट्रेंडिंग सुर्खियां
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {megaTrendingArticles.map((art, idx) => (
                      <div
                        key={art.id}
                        onClick={() => {
                          onSelectArticle(art);
                          setDesktopMegaMenuOpen(false);
                        }}
                        className="flex items-start space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer group"
                      >
                        <div className="w-12 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                          <img
                            src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-0 left-0 bg-red-600 text-[8px] font-black text-white px-1">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] text-red-600 font-bold uppercase block">
                            {art.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition leading-tight">
                            {art.title}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMNS 10-12: REGIONAL STATES DIRECTORY & QUICK SERVICES */}
                <div className="col-span-3 space-y-3 border-l border-slate-200 pl-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-kd-headline">
                        राज्य समाचार
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">प्रमुख राज्य</span>
                  </div>

                  {/* Quick Major States Grid */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                    {MAJOR_INDIAN_STATES.slice(0, 12).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onSearchChange(st);
                          onSelectCategory('all');
                          setDesktopMegaMenuOpen(false);
                        }}
                        className="text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 transition cursor-pointer truncate"
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Services & Quick Links */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <button
                      onClick={() => {
                        onOpenEPaper();
                        setDesktopMegaMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 flex items-center justify-between border border-amber-200 transition cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Newspaper className="w-3.5 h-3.5 text-amber-700" />
                        <span className="text-xs font-bold">ई-पेपर (E-Paper)</span>
                      </div>
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">पढ़ें ➔</span>
                    </button>

                    {onOpenLiveFeed && (
                      <button
                        onClick={() => {
                          onOpenLiveFeed();
                          setDesktopMegaMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-950 flex items-center justify-between border border-red-200 transition cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Radio className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-xs font-bold">लाइव कवरेज</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BACKDROP OVERLAY WHEN STATES MEGA MENU IS OPEN */}
        {statesMenuOpen && (
          <div
            className="hidden md:block fixed inset-x-0 bottom-0 top-[100%] bg-slate-950/45 backdrop-blur-2xs z-30 transition-opacity cursor-pointer"
            onClick={() => setStatesMenuOpen(false)}
          />
        )}

        {/* DESKTOP STATES MEGA MENU DROPDOWN (ALL STATES GROUPED BY REGION WITH COLOR BADGES) */}
        {statesMenuOpen && (
          <div
            ref={statesMenuRef}
            onMouseEnter={handleMouseEnterStatesMenu}
            onMouseLeave={handleMouseLeaveStatesMenu}
            className="hidden md:block absolute left-0 right-0 top-full bg-white text-slate-900 border-b-4 border-red-600 shadow-2xl z-50 border-t border-slate-200 animate-fadeIn font-kd-meta"
          >
            {/* Top Bar inside States Menu */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <h3 className="font-bold text-sm sm:text-base font-kd-headline text-slate-900 tracking-wide flex items-center gap-2">
                  <span>📍 भारत के सभी राज्य व केंद्र शासित प्रदेश</span>
                </h3>
              </div>

              {/* Popular States Quick Tags */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
                {activeStatesList.slice(0, 10).map((stName) => {
                  const stateIcons: Record<string, string> = {
                    'उत्तर प्रदेश': '🚩',
                    'बिहार': '🌿',
                    'मध्य प्रदेश': '🌲',
                    'राजस्थान': '🏰',
                    'दिल्ली': '🏛️',
                    'दिल्ली NCR': '🏛️',
                    'पंजाब': '🌾',
                    'हरियाणा': '🏙️',
                    'महाराष्ट्र': '⚡',
                    'गुजरात': '🦁',
                    'उत्तराखंड': '⛰️',
                    'झारखंड': '⛏️',
                    'छत्तीसगढ़': '🏞️',
                  };
                  const icon = stateIcons[stName] || '📍';
                  return (
                    <button
                      key={stName}
                      type="button"
                      onClick={() => {
                        onSearchChange(stName);
                        onSelectCategory('all');
                        setStatesMenuOpen(false);
                        if (onBackToHome) onBackToHome();
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 flex items-center space-x-1 ${
                        searchQuery === stName
                          ? 'bg-red-600 text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{stName}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {onOpenAllStatesModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatesMenuOpen(false);
                      onOpenAllStatesModal();
                    }}
                    className="bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-red-200 transition cursor-pointer flex items-center space-x-1"
                  >
                    <span>विस्तृत डायरेक्टरी</span>
                    <span>→</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStatesMenuOpen(false)}
                  className="bg-slate-200 hover:bg-red-600 hover:text-white text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                  title="बंद करें"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>बंद करें</span>
                </button>
              </div>
            </div>

            {/* 5 Geographic Regions Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 sm:gap-4">
                {ALL_INDIAN_STATES_BY_REGION.map((reg) => (
                  <div key={reg.regionShort} className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${reg.dotClass}`}></span>
                          <h4 className="text-xs font-bold text-slate-900 font-kd-headline truncate">
                            {reg.region}
                          </h4>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${reg.badgeClass}`}>
                          {reg.states.length}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {reg.states.map((st) => {
                          const isSelected = searchQuery === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                onSearchChange(st);
                                onSelectCategory('all');
                                setStatesMenuOpen(false);
                                if (onBackToHome) onBackToHome();
                              }}
                              className={`w-full text-left px-2 py-1 rounded-md text-xs transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-red-600 text-white font-bold'
                                  : 'text-slate-700 hover:text-red-600 hover:bg-white'
                              }`}
                            >
                              <span className="truncate">{st}</span>
                              {isSelected && <span className="text-[10px]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 3. BREAKING NEWS TICKER (POSITIONED DIRECTLY BELOW NAVIGATION BAR & ABOVE TRENDING BAR) */}
      <div
        style={{
          fontSize: portalSettings.typography?.tickerFontSizePx
            ? `${portalSettings.typography.tickerFontSizePx}px`
            : undefined,
        }}
        className="w-full bg-red-700 text-white py-1.5 text-xs sm:text-sm flex items-center shadow-inner overflow-hidden font-kd-headline"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center space-x-2 shrink-0 mr-3">
            <span className="flex items-center space-x-1 bg-white text-red-700 px-2.5 py-0.5 rounded font-black text-xs tracking-wide uppercase shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
              <span>बड़ी ख़बर</span>
            </span>

            {/* Ticker Speed Quick Controller */}
            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="p-1 rounded hover:bg-red-800 text-white/90 text-xs flex items-center space-x-1 border border-red-500/50 cursor-pointer"
                title={`Ticker Speed: ${
                  portalSettings.tickerSpeed === 'ultra_slow'
                    ? 'Ultra Slow (140s)'
                    : portalSettings.tickerSpeed === 'slow'
                    ? 'Slow (90s - Recommended)'
                    : portalSettings.tickerSpeed === 'normal'
                    ? 'Normal (65s)'
                    : portalSettings.tickerSpeed === 'fast'
                    ? 'Fast (35s)'
                    : portalSettings.tickerSpeed === 'custom'
                    ? `Custom (${portalSettings.tickerSpeedSeconds || 90}s)`
                    : 'Paused'
                }`}
              >
                {isPaused ? <Pause className="w-3 h-3 text-amber-300" /> : <FastForward className="w-3 h-3" />}
                <span className="hidden xs:inline text-[10px] font-sans font-semibold">
                  {portalSettings.tickerSpeed === 'ultra_slow'
                    ? '140s'
                    : portalSettings.tickerSpeed === 'slow'
                    ? '90s'
                    : portalSettings.tickerSpeed === 'normal'
                    ? '65s'
                    : portalSettings.tickerSpeed === 'fast'
                    ? '35s'
                    : portalSettings.tickerSpeed === 'custom'
                    ? `${portalSettings.tickerSpeedSeconds || 90}s`
                    : 'Paused'}
                </span>
              </button>

              {speedMenuOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 text-xs z-50 flex flex-col space-y-1 min-w-[170px]">
                  <span className="text-[10px] text-slate-500 font-bold uppercase px-2 py-0.5 border-b border-slate-100">
                    स्लाइडिंग गति (Ticker Speed)
                  </span>
                  {[
                    { id: 'ultra_slow', label: 'Ultra Slow (140s)' },
                    { id: 'slow', label: 'Slow (90s - अनुशंसित)' },
                    { id: 'normal', label: 'Normal (65s)' },
                    { id: 'fast', label: 'Fast (35s)' },
                    { id: 'paused', label: 'Pause Ticker' },
                  ].map((spd) => (
                    <button
                      key={spd.id}
                      onClick={() => {
                        onUpdateSettings({ tickerSpeed: spd.id as any });
                        setSpeedMenuOpen(false);
                        setShowCustomSpeedForm(false);
                      }}
                      className={`text-left px-2.5 py-1 rounded-lg transition flex items-center justify-between cursor-pointer ${
                        portalSettings.tickerSpeed === spd.id
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{spd.label}</span>
                      {portalSettings.tickerSpeed === spd.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}

                  {/* Custom Speed in seconds */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setShowCustomSpeedForm(!showCustomSpeedForm)}
                      className={`w-full text-left px-2.5 py-1 rounded-lg transition flex items-center justify-between text-slate-800 hover:bg-slate-100 cursor-pointer ${
                        portalSettings.tickerSpeed === 'custom' ? 'bg-red-50 text-red-700 font-bold' : ''
                      }`}
                    >
                      <span>⚙️ Custom Speed</span>
                      {portalSettings.tickerSpeed === 'custom' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {showCustomSpeedForm && (
                      <div className="p-2 mt-1 bg-slate-50 rounded-lg space-y-1.5 border border-slate-200">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Duration (20s - 180s):</span>
                          <span className="font-mono text-slate-900 font-bold">{customSpeedInput}s</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="180"
                          step="5"
                          value={customSpeedInput}
                          onChange={(e) => setCustomSpeedInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-red-600"
                        />
                        <button
                          onClick={() => {
                            onUpdateSettings({
                              tickerSpeed: 'custom',
                              tickerSpeedSeconds: customSpeedInput,
                            });
                            setSpeedMenuOpen(false);
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 rounded transition cursor-pointer"
                        >
                          Apply ({customSpeedInput}s)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Marquee Content */}
          <div className="flex-1 overflow-hidden whitespace-nowrap relative">
            <div
              style={{
                animation: isPaused ? 'none' : `marquee ${speedDuration} linear infinite`,
              }}
              className="inline-block hover:[animation-play-state:paused]"
            >
              {recentBreakingHeadlines.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => item.article && onSelectArticle(item.article)}
                  className="mx-5 font-medium tracking-wide hover:underline cursor-pointer inline-flex items-center text-xs sm:text-sm text-white"
                >
                  <span className="text-amber-300 mr-2 font-bold">●</span>
                  {item.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TRENDING TOPICS SLIDING STRIP (POSITIONED DIRECTLY BELOW NEWS TICKER) */}
      <div className="w-full bg-slate-100/95 border-b border-slate-200 text-slate-700 py-1.5 text-xs sm:text-sm overflow-hidden font-kd-meta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          {/* Label Badge */}
          <button
            type="button"
            onClick={() => onSelectCategory('trending')}
            className="flex items-center space-x-1.5 font-bold text-slate-900 hover:text-white hover:bg-red-600 shrink-0 text-xs uppercase tracking-wider bg-slate-200/90 px-2.5 py-1 rounded-md z-10 shadow-2xs font-kd-meta transition cursor-pointer group"
            title="सभी ट्रेंडिंग समाचार देखें (View All Trending Stories)"
          >
            <Hash className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors" />
            <span>ट्रेंडिंग:</span>
          </button>

          {/* Continuous Sliding Container */}
          <div className="flex-1 overflow-hidden relative mx-2">
            <div className="animate-trending-slide flex items-center space-x-3 py-0.5">
              {duplicatedTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => onSearchChange(topic.replace(/^#/, ''))}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 text-xs sm:text-[13px] font-semibold transition cursor-pointer shrink-0 shadow-2xs font-kd-meta"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Edit button - Only visible for Admin */}
          {isAdmin && (
            <button
              onClick={onOpenAdminSettings}
              className="hidden sm:inline-flex text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded font-bold shrink-0 font-kd-meta z-10 transition cursor-pointer"
              title="Edit Trending Topics & Portal Settings (Admin Only)"
            >
              Edit ✎
            </button>
          )}
        </div>
      </div>

      {/* FULL SLIDE-OVER SIDEBAR DRAWER (ALL WEBSITE PAGES ACCESSIBLE VIA SIDEBAR MENU) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-kd-meta animate-fadeIn">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div
              style={{
                fontFamily: mobileSidebarConfig.fontFamily || undefined,
                fontSize: portalSettings.typography?.mobileSidebarFontScale
                  ? `${portalSettings.typography.mobileSidebarFontScale}rem`
                  : 'calc(1rem * var(--mobile-sidebar-font-scale, 1))',
              }}
              className="w-screen max-w-xs sm:max-w-sm bg-white text-slate-800 shadow-2xl flex flex-col border-r border-slate-200"
            >
              {/* 1. TOP: WEBSITE LOGO & CLOSE BUTTON */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div
                  className="flex items-center space-x-2.5 cursor-pointer select-none min-w-0"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSelectCategory('all');
                    onSearchChange('');
                    if (onBackToHome) onBackToHome();
                  }}
                >
                  {portalSettings.headerFooter?.logoUrl && portalSettings.headerFooter.logoUrl.trim() !== '' ? (
                    <img
                      src={portalSettings.headerFooter.logoUrl}
                      alt={siteTitle}
                      className="h-8 max-h-8 w-auto max-w-[150px] object-contain shrink-0"
                    />
                  ) : portalSettings.headerFooter?.faviconUrl && portalSettings.headerFooter.faviconUrl.trim() !== '' ? (
                    <img
                      src={portalSettings.headerFooter.faviconUrl}
                      alt={siteTitle}
                      className="w-8 h-8 rounded-lg object-contain bg-slate-200 p-0.5 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-base shadow-xs shrink-0">
                      K
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-black text-base sm:text-lg font-kd-header tracking-tight text-slate-900 leading-none truncate">
                      {siteTitle}
                    </h3>
                    {siteTagline && (
                      <div className={`tagline-container transition-all ${isTaglineVisible ? 'block' : 'hidden'}`}>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px] mt-0.5">
                          {siteTagline}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shrink-0"
                  title="Close Menu"
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-thin bg-white font-kd-meta">
                {/* 2. SEARCH BAR */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ख़बरें खोजें (Search news)..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setMobileMenuOpen(false);
                        if (onBackToHome) onBackToHome();
                      }
                    }}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 3. ALL NEWS MENU WITH ACCORDION SUB-MENUS */}
                {mobileSidebarConfig.showCategories !== false && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-xs font-bold text-slate-900 tracking-wide flex items-center space-x-1.5">
                        <Flame className="w-3.5 h-3.5 text-red-600" />
                        <span>ताज़ा ख़बरें</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {/* Home / Top Stories */}
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSelectCategory('all');
                          if (onBackToHome) onBackToHome();
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition cursor-pointer border flex items-center justify-between ${
                          currentCategory === 'all'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-red-50/60 text-slate-800 hover:text-red-700 border-slate-200/80'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <Home className="w-3.5 h-3.5 shrink-0" />
                          <span>ताज़ा ख़बरें</span>
                        </span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </button>

                      {/* Other Categories Grid */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {activeCategories.filter((c) => c.id !== 'all' && c.id !== 'state').map((cat) => {
                          const isActive = currentCategory === cat.id;
                          const catDisplayLabel = customCatLabels[cat.id] || cat.labelHindi;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                onSelectCategory(cat.id);
                                if (onBackToHome) onBackToHome();
                              }}
                              className={`p-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer border truncate ${
                                isActive
                                  ? 'bg-red-600 text-white font-bold border-red-600 shadow-xs'
                                  : 'bg-slate-50 hover:bg-red-50/60 text-slate-800 hover:text-red-700 border-slate-200/80'
                              }`}
                            >
                              <span className="truncate block">{catDisplayLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* State Menu with Accordion (Sub-menu expands on click) */}
                      {activeCategories.some((c) => c.id === 'state') && (
                        <div className="rounded-xl border border-red-200 bg-red-50/40 overflow-hidden transition-all">
                          <button
                            type="button"
                            onClick={() => setMobileStatesExpanded((prev) => !prev)}
                            className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-red-700 hover:bg-red-50 transition cursor-pointer"
                          >
                            <span className="flex items-center space-x-2">
                              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>{customCatLabels['state'] || 'राज्य / States'}</span>
                            </span>
                            <span className="flex items-center space-x-1.5 text-[11px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-red-200">
                              <span>{mobileStatesExpanded ? 'बंद करें' : 'राज्य चुनें'}</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-red-600 transition-transform duration-200 ${
                                  mobileStatesExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </span>
                          </button>

                          {/* Accordion Content */}
                          {mobileStatesExpanded && (
                            <div className="p-2.5 pt-1 border-t border-red-100 bg-white space-y-2 animate-fadeIn">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                <span>सीधे राज्य चुनें:</span>
                                {onOpenAllStatesModal && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      onOpenAllStatesModal();
                                    }}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    सभी राज्य ➔
                                  </button>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-thin py-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    onSelectCategory('state');
                                    if (onBackToHome) onBackToHome();
                                  }}
                                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition border cursor-pointer ${
                                    currentCategory === 'state' && !searchQuery
                                      ? 'bg-red-600 text-white border-red-600'
                                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  सभी राज्य समाचार
                                </button>
                                {activeStatesList.map((stateName) => {
                                  const isSelected = searchQuery === stateName;
                                  return (
                                    <button
                                      key={stateName}
                                      type="button"
                                      onClick={() => {
                                        onSearchChange(stateName);
                                        onSelectCategory('all');
                                        setMobileMenuOpen(false);
                                        if (onBackToHome) onBackToHome();
                                      }}
                                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition border cursor-pointer ${
                                        isSelected
                                          ? 'bg-red-600 text-white font-bold border-red-600 shadow-2xs'
                                          : 'bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-200'
                                      }`}
                                    >
                                      {stateName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. OUR NETWORK */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>हमारा नेटवर्क</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {activeEditions.map((ed) => (
                      <a
                        key={ed.id}
                        href={ed.url || "#"}
                        target={ed.openInNewTab ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between border cursor-pointer ${
                          ed.isCurrent
                            ? "bg-blue-50/70 border-blue-200 text-blue-900 font-bold"
                            : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="text-base shrink-0">{ed.icon || "🌐"}</span>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold">{ed.name}</div>
                            {ed.isCurrent && (
                              <div className="text-[10px] text-blue-600 font-medium">वर्तमान सक्रिय संस्करण</div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 ml-2">
                          {ed.openInNewTab ? "विज़िट ➔" : "सक्रिय"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 5. READER SERVICES & UTILITIES */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Layout className="w-3.5 h-3.5 text-red-600" />
                      <span>सेवाएं एवं त्वरित लिंक्स</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* e-Paper */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenEPaper();
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left"
                    >
                      <Newspaper className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">ई-पेपर पढ़ें</span>
                    </button>

                    {/* Live TV / Coverage */}
                    {onOpenLiveFeed && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenLiveFeed();
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-red-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left"
                      >
                        <Radio className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="truncate">लाइव कवरेज</span>
                      </button>
                    )}

                    {/* Bookmarks */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenBookmarks();
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left"
                    >
                      <BookMarked className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">सहेजी ख़बरें ({bookmarksCount})</span>
                    </button>

                    {/* Submit News */}
                    {onOpenSubmitNews && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenSubmitNews();
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-red-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left"
                      >
                        <PenTool className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="truncate">अपनी खबर भेजें</span>
                      </button>
                    )}

                    {/* Sudoku Game */}
                    {onOpenSudokuGame && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenSudokuGame();
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left"
                      >
                        <Gamepad2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate">दैनिक सुडोकू</span>
                      </button>
                    )}

                    {/* Contact Us */}
                    {onOpenContactPage && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenContactPage();
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left"
                      >
                        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">संपर्क करें</span>
                      </button>
                    )}

                    {/* About Us */}
                    {onOpenAboutUsPage && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAboutUsPage();
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer text-left col-span-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">हमारे बारे में एवं कानूनी नीतियां (Legal & About)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 6. OFFICIAL SOCIAL MEDIA ICONS (FOLLOW US) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                      <span>Follow Us</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
                    {/* WhatsApp */}
                    <a
                      href={socialLinks.whatsappChannel || "https://whatsapp.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xs"
                      title="WhatsApp Channel"
                    >
                      <svg width="20" height="20" className="w-5 h-5 fill-white fill-current shrink-0" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </a>

                    {/* YouTube */}
                    <a
                      href={socialLinks.youtube || "https://youtube.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xs"
                      title="YouTube"
                    >
                      <svg width="20" height="20" className="w-5 h-5 fill-white fill-current shrink-0" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a
                      href={socialLinks.facebook || "https://facebook.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xs"
                      title="Facebook"
                    >
                      <svg width="20" height="20" className="w-5 h-5 fill-white fill-current shrink-0" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>

                    {/* X / Twitter */}
                    <a
                      href={socialLinks.twitter || "https://x.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-slate-100 text-slate-800 flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xs border border-slate-200"
                      title="X / Twitter"
                    >
                      <svg width="20" height="20" className="w-4.5 h-4.5 fill-slate-800 fill-current shrink-0" style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a
                      href={socialLinks.instagram || "https://instagram.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xs"
                      title="Instagram"
                    >
                      <svg width="20" height="20" className="w-5 h-5 fill-white fill-current shrink-0" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>

                    {/* Telegram */}
                    <a
                      href={socialLinks.telegramChannel || "https://telegram.org"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#229ED9] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xs"
                      title="Telegram"
                    >
                      <svg width="20" height="20" className="w-5 h-5 fill-white fill-current shrink-0" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Authenticated Staff/Admin Session Bar or Login Prompt (Light Theme) */}
                {(isStaff || isAdmin) ? (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="text-[10px] text-amber-700 font-semibold flex items-center justify-between">
                      <span>सक्रिय सत्र: {user?.displayName || staffSession?.name || 'Staff'}</span>
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold">
                        {isAdmin ? 'ADMIN' : 'STAFF'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onOpenAdminBackend) onOpenAdminBackend();
                          else onOpenAdminSettings('dashboard');
                        }}
                        className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs p-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer border border-slate-300 shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-700" />
                        <span>👑 एडमिन हब (Admin Panel)</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPublisherCMS();
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs p-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Newsroom Desk</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (staffSession) logoutStaff();
                        else logout();
                      }}
                      className="w-full text-xs text-red-600 hover:text-red-700 p-1 text-center transition cursor-pointer font-semibold"
                    >
                      साइन आउट करें (Sign Out)
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
