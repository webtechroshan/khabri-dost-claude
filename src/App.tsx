import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNewsPortalData } from './hooks/useNewsPortalData';

// Layout & Core Views
const LiveFeedPageView = lazy(() => import('./components/LiveFeedPageView').then((m) => ({ default: m.LiveFeedPageView })));
const SubmitNewsPageView = lazy(() => import('./components/SubmitNewsPageView').then((m) => ({ default: m.SubmitNewsPageView })));
import type { LegalPolicyType } from './components/LegalPolicyPageView';
const LegalPolicyPageView = lazy(() => import('./components/LegalPolicyPageView').then((m) => ({ default: m.LegalPolicyPageView })));
import { parseRoute, buildPath, legacyRedirect, POLICY_PATHS, type PolicyKey } from './utils/routes';
import { ListingPageView } from './components/ListingPageView';
import { NotFoundView } from './components/NotFoundView';
import { useDocumentHead } from './hooks/useDocumentHead';
import { SiteHeader } from './components/site/SiteHeader';
import { SiteFooter } from './components/site/SiteFooter';
import { HomeView } from './components/site/HomeView';
import { ArticleView } from './components/site/ArticleView';
import { categoryLabel } from './components/site/format';
const ArchivePageView = lazy(() => import('./components/ArchivePageView').then((m) => ({ default: m.ArchivePageView })));
const EPaperPageView = lazy(() => import('./components/EPaperPageView').then((m) => ({ default: m.EPaperPageView })));

// Homepage Components
const PortalPopup = lazy(() => import('./components/PortalPopup').then((m) => ({ default: m.PortalPopup })));
import { NotificationToast } from './components/NotificationToast';

// Navigation & Bars
const AdminFrontendCustomizerBar = lazy(() => import('./components/AdminFrontendCustomizerBar').then((m) => ({ default: m.AdminFrontendCustomizerBar })));
const QuickReadSlidePanel = lazy(() => import('./components/QuickReadSlidePanel').then((m) => ({ default: m.QuickReadSlidePanel })));

// Modals
const AllStatesDirectoryModal = lazy(() => import('./components/modals/AllStatesDirectoryModal').then((m) => ({ default: m.AllStatesDirectoryModal })));
const BookmarksModal = lazy(() => import('./components/BookmarksModal').then((m) => ({ default: m.BookmarksModal })));
const ReadLaterModal = lazy(() => import('./components/ReadLaterModal').then((m) => ({ default: m.ReadLaterModal })));
const EPaperModal = lazy(() => import('./components/EPaperModal').then((m) => ({ default: m.EPaperModal })));
const DailySudokuModal = lazy(() => import('./components/DailySudokuModal').then((m) => ({ default: m.DailySudokuModal })));
const StaffLoginModal = lazy(() => import('./components/StaffLoginModal').then((m) => ({ default: m.StaffLoginModal })));
const SubscriberPreferencesModal = lazy(() => import('./components/SubscriberPreferencesModal').then((m) => ({ default: m.SubscriberPreferencesModal })));
const PublisherCMS = lazy(() => import('./components/PublisherCMS').then((m) => ({ default: m.PublisherCMS })));
const AdminBackendPanel = lazy(() => import('./components/AdminBackendPanel').then((m) => ({ default: m.AdminBackendPanel })));

// Types & Data
import { NewsArticle, NewsCategory } from './types/news';
import { CATEGORIES, MAJOR_INDIAN_STATES, ALL_INDIAN_STATES_BY_REGION } from './data/seedNews';
import { DEFAULT_SPOTLIGHT_LAYOUT } from './data/portalDefaults';

// Icons & Utilities
import { Flame, Newspaper, PenTool, Sliders, MapPin, Eye, Zap } from 'lucide-react';
import { formatHindiTimeAgo } from './utils/hindiHelpers';
import { useGoogleServices } from './utils/useGoogleServices';
import { resetRootCssVariablesToDefault } from './utils/cssDefaults';

/**
 * NewsPortalMain
 * Primary application controller for Khabri Dost news portal.
 * Orchestrates views, navigation, elastic touch gestures, dynamic typography, and admin integration.
 */
/** Darken a #rrggbb colour by multiplying each channel (0–1). Returns the input if it is not hex. */
function shadeHex(hex: string, factor: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (shift: number) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('')}`;
}

function NewsPortalMain() {
  const { user, isStaff, isAdmin, isEditor, loading: authLoading } = useAuth();
  const [currentCategory, setCurrentCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCity, setUserCity] = useState<string>(() => {
    try {
      return localStorage.getItem('kd_my_city') || 'नई दिल्ली';
    } catch {
      return 'नई दिल्ली';
    }
  });

  // Dedicated View Navigation
  const [currentView, setCurrentView] = useState<
    | 'home'
    | 'article'
    | 'live-feed'
    | 'contact'
    | 'about'
    | 'legal'
    | 'submit-news'
    | 'archive'
    | 'epaper'
    | 'author'
    | 'tag'
    | 'videos'
    | 'not-found'
  >('home');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  // Modals Visibility
  const [showAdminBackend, setShowAdminBackend] = useState(false);
  const [showPublisherCMS, setShowPublisherCMS] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showReadLater, setShowReadLater] = useState(false);
  const [showEPaper, setShowEPaper] = useState(false);
  const [showSudokuModal, setShowSudokuModal] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('dashboard');
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [showAllStatesModal, setShowAllStatesModal] = useState(false);
  const [activeLegalPolicyType, setActiveLegalPolicyType] = useState<LegalPolicyType>('privacy');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // AI Quick Read Slide Panel State
  const [quickReadArticle, setQuickReadArticle] = useState<NewsArticle | null>(null);
  const [showQuickReadPanel, setShowQuickReadPanel] = useState(false);

  // Extracted Data & Cloud Sync Hook
  const {
    articles,
    staffArticles,
    setArticles,
    loading,
    bookmarks,
    isArticleBookmarked,
    handleToggleBookmark,
    readLaterItems,
    isArticleInReadLater,
    handleToggleReadLater,
    handleRemoveReadLater,
    handleClearAllReadLater,
    portalSettings,
    handleUpdateSettings,
    mediaAssets,
    handleAddMedia,
    handleUpdateMedia,
    handleDeleteMedia,
    editorialUsers,
    handleAddEditorialUser,
    handleUpdateEditorialUser,
    handleDeleteEditorialUser,
    liveBlogs,
    activeLiveBlog,
    setActiveLiveBlog,
    handleAddLiveBlog,
    handleUpdateLiveBlog,
    handleDeleteLiveBlog,
    contactInquiries,
    handleAddContactInquiry,
    handleUpdateInquiryStatus,
    handleDeleteInquiry,
    citizenSubmissions,
    handleAddCitizenSubmission,
    handleUpdateCitizenSubmissionStatus,
    handleDeleteCitizenSubmission,
    subscribers,
    handleAddSubscriber,
    handleDeleteSubscriber,
    notifications,
    activePushToast,
    setActivePushToast,
    handleSendNotification,
    handleSaveArticle,
    handleDeleteArticle,
  } = useNewsPortalData({ user, isAdmin, isStaff, isEditor, currentCategory });

  // Open Admin Backend helper
  const openAdminStudio = (tab: string = 'dashboard') => {
    let targetTab = tab;
    if (tab === 'header' || tab === 'footer') targetTab = 'header_footer';
    else if (tab === 'ads') targetTab = 'monetization';
    else if (tab === 'mobile') targetTab = 'mobile_sidebar';
    setAdminInitialTab(targetTab);
    setShowAdminBackend(true);
  };

  const handleOpenSpotlightSettings = () => {
    if (!isAdmin) {
      setAdminInitialTab('spotlight');
      setShowStaffLogin(true);
      return;
    }
    openAdminStudio('spotlight');
  };

  const handleOpenQuickRead = (article: NewsArticle) => {
    setQuickReadArticle(article);
    setShowQuickReadPanel(true);
  };

  // Mobile horizontal swipe between categories with elastic transition
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [swipeCategoryFeedback, setSwipeCategoryFeedback] = useState<{
    label: string;
    direction: 'left' | 'right';
  } | null>(null);
  const [swipeAnimationClass, setSwipeAnimationClass] = useState<string>('');
  const [swipeDragOffset, setSwipeDragOffset] = useState<number>(0);
  const [isTouchDragging, setIsTouchDragging] = useState<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      setIsTouchDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    // Apply tactile spring drag resistance if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      const damping = 0.32;
      const clamped = Math.max(-60, Math.min(60, deltaX * damping));
      setSwipeDragOffset(clamped);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsTouchDragging(false);
    setSwipeDragOffset(0);

    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      const categoryList = CATEGORIES;
      const currentIndex = categoryList.findIndex((c) => c.id === currentCategory);
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;

      if (deltaX < 0) {
        const nextIndex = (safeIndex + 1) % categoryList.length;
        const nextCategory = categoryList[nextIndex];
        setCurrentCategory(nextCategory.id);
        setSwipeAnimationClass('animate-elastic-swipe-right');
        setTimeout(() => setSwipeAnimationClass(''), 460);
        setSwipeCategoryFeedback({
          label: `${nextCategory.labelHindi} →`,
          direction: 'left',
        });
        setTimeout(() => setSwipeCategoryFeedback(null), 1800);
      } else {
        const prevIndex = (safeIndex - 1 + categoryList.length) % categoryList.length;
        const prevCategory = categoryList[prevIndex];
        setCurrentCategory(prevCategory.id);
        setSwipeAnimationClass('animate-elastic-swipe-left');
        setTimeout(() => setSwipeAnimationClass(''), 460);
        setSwipeCategoryFeedback({
          label: `← ${prevCategory.labelHindi}`,
          direction: 'right',
        });
        setTimeout(() => setSwipeCategoryFeedback(null), 1800);
      }
    }
  };

  // Reset typography settings helper
  const handleResetTypography = () => {
    setFontSize('normal');
    handleUpdateSettings({
      typography: {
        headerFont: 'Mukta, sans-serif',
        headlineFont: 'Mukta, sans-serif',
        bodyFont: 'Mukta, sans-serif',
        metaFont: 'Mukta, sans-serif',
        headlineWeight: 700,
        bodyWeight: 400,
        mobileScale: 'normal',
        baseSize: 'normal',
      },
    });
    resetRootCssVariablesToDefault();
  };

  // Typography is fixed by the design system (src/index.css): Noto Sans Devanagari + Noto Sans.
  // Older saved font choices in settings are intentionally ignored.


  // Dynamic Brand Customizer: Theme Colors, Document Title, Meta Tags & Favicon
  useEffect(() => {
    const root = document.documentElement;
    const hf = portalSettings?.headerFooter;
    const brandColor = hf?.primaryBrandColor || '#dc2626';
    const secondaryColor = hf?.secondaryBrandColor || '#2563eb';

    // Set CSS brand variables
    root.style.setProperty('--brand-red', brandColor);
    root.style.setProperty('--brand-primary', brandColor);
    root.style.setProperty('--brand-secondary', secondaryColor);
    root.style.setProperty('--brand-red-hover', `${brandColor}e6`);
    // Darker shades for text on white and hover states (keeps 4.5:1 contrast for links).
    root.style.setProperty('--brand-ink', shadeHex(brandColor, 0.82));
    root.style.setProperty('--brand-deep', shadeHex(brandColor, 0.7));

    // <title> and meta tags: useDocumentHead.

    // Dynamic Favicon
    if (hf?.faviconUrl) {
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(favicon);
      }
      favicon.href = hf.faviconUrl;
    }
  }, [portalSettings?.headerFooter, currentView]);

  // Google Services injection
  useGoogleServices(portalSettings, {
    path:
      currentView === 'article' && activeArticle
        ? `/article/${activeArticle.id}`
        : `/${currentView === 'home' ? '' : currentView}`,
    title: currentView === 'article' && activeArticle ? activeArticle.title : document.title,
  });

  // ---------------------------------------------------------------------------
  // Routing: the address bar is the source of truth (see src/utils/routes.ts).
  // URL → state on load and Back/Forward; state → URL whenever the reader navigates.
  // ---------------------------------------------------------------------------
  const [pendingArticleId, setPendingArticleId] = useState<string | null>(null);
  const [listingValue, setListingValue] = useState<string>('');
  const applyingUrl = useRef(false);

  const applyLocation = useCallback(() => {
    const { pathname, search, hash } = window.location;
    const redirect = legacyRedirect(pathname, search, hash);
    if (redirect) window.history.replaceState(null, '', redirect);
    const route = parseRoute(window.location.pathname, window.location.search);
    applyingUrl.current = true;
    setSearchQuery(route.page === 'search' ? route.value || '' : '');
    setPendingArticleId(route.page === 'article' ? route.value || null : null);
    if (route.page !== 'article') setActiveArticle(null);
    switch (route.page) {
      case 'home':
        setCurrentCategory('all');
        setCurrentView('home');
        break;
      case 'search':
        setCurrentCategory('all');
        setCurrentView('home');
        break;
      case 'category':
        setCurrentCategory((route.value || 'all') as NewsCategory);
        setCurrentView('home');
        break;
      case 'article':
        break; // resolved below once articles are loaded
      case 'live':
        setCurrentView('live-feed');
        break;
      case 'policy':
        setActiveLegalPolicyType((route.value || 'privacy') as LegalPolicyType);
        setCurrentView('legal');
        break;
      case 'author':
      case 'tag':
      case 'videos':
        setListingValue(route.value || '');
        setCurrentView(route.page);
        break;
      case 'not-found':
        setCurrentView('not-found');
        break;
      default:
        setCurrentView(route.page as typeof currentView);
    }
    if (route.overlay === 'login') setShowStaffLogin(true);
    if (route.overlay === 'sudoku') setShowSudokuModal(true);
    if (route.overlay === 'admin') setPendingAdminOpen(true);
  }, []);

  const [pendingAdminOpen, setPendingAdminOpen] = useState(false);
  useEffect(() => {
    if (!pendingAdminOpen || authLoading) return;
    setPendingAdminOpen(false);
    if (isStaff) setShowAdminBackend(true);
    else setShowStaffLogin(true);
  }, [pendingAdminOpen, authLoading, isStaff]);

  useEffect(() => {
    applyLocation();
    window.addEventListener('popstate', applyLocation);
    window.addEventListener('hashchange', applyLocation);
    return () => {
      window.removeEventListener('popstate', applyLocation);
      window.removeEventListener('hashchange', applyLocation);
    };
  }, [applyLocation]);

  // Plain internal links (<a href="/author/…">) navigate inside the app without a page reload.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/') || /\.[a-z0-9]{2,5}($|\?)/i.test(href)) return;
      e.preventDefault();
      window.history.pushState(null, '', href);
      applyLocation();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [applyLocation]);

  // Resolve /article/:id once articles are available. Staff may open their own drafts (preview).
  useEffect(() => {
    if (!pendingArticleId) return;
    const found =
      articles.find((a) => a.id === pendingArticleId) || staffArticles.find((a) => a.id === pendingArticleId);
    if (found) {
      setActiveArticle(found);
      setCurrentView('article');
      setPendingArticleId(null);
    } else if (!loading && !authLoading) {
      setCurrentView('not-found');
    }
  }, [pendingArticleId, articles, staffArticles, loading, authLoading]);

  // Keep the open article in sync with live updates (edits, unpublishing).
  useEffect(() => {
    if (!activeArticle) return;
    const fresh = articles.find((a) => a.id === activeArticle.id) || staffArticles.find((a) => a.id === activeArticle.id);
    if (fresh && fresh !== activeArticle) setActiveArticle(fresh);
  }, [articles, staffArticles]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPath = useMemo(() => {
    switch (currentView) {
      case 'article':
        return activeArticle ? buildPath({ page: 'article', value: activeArticle.id }) : null;
      case 'home':
        if (searchQuery.trim()) return buildPath({ page: 'search', value: searchQuery.trim() });
        return currentCategory === 'all' ? '/' : buildPath({ page: 'category', value: currentCategory });
      case 'live-feed':
        return '/live';
      case 'legal':
        if (activeLegalPolicyType === 'contact') return '/contact';
        if (activeLegalPolicyType === 'about') return '/about';
        if (activeLegalPolicyType === 'complaint') return POLICY_PATHS.grievance;
        return POLICY_PATHS[activeLegalPolicyType as PolicyKey] || POLICY_PATHS.privacy;
      case 'author':
      case 'tag':
        return buildPath({ page: currentView, value: listingValue });
      case 'not-found':
        return null; // keep the address the reader typed
      default:
        return `/${currentView}`;
    }
  }, [currentView, activeArticle, searchQuery, currentCategory, activeLegalPolicyType, listingValue]);

  useEffect(() => {
    if (applyingUrl.current) {
      applyingUrl.current = false;
      return;
    }
    if (!currentPath || pendingArticleId) return;
    const here = window.location.pathname + window.location.search;
    if (here === currentPath) return;
    // Typing in search refines the same results page instead of adding history entries.
    const replace = here.startsWith('/search') && currentPath.startsWith('/search');
    window.history[replace ? 'replaceState' : 'pushState'](null, '', currentPath);
  }, [currentPath, pendingArticleId]);

  useDocumentHead(currentPath, currentView === 'article' ? activeArticle : null, currentView === 'not-found');

  // Every view change starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentView, activeArticle?.id, currentCategory]);

  // Keyboard shortcut for Staff Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'l' || e.key === 'L'))
      ) {
        e.preventDefault();
        setShowStaffLogin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Trending articles calculation
  const filteredArticles = useMemo(() => {
    let result = articles;
    if (currentCategory === 'trending') {
      const pinnedIds = portalSettings.pinnedTrendingArticleIds || [];
      const pinned = pinnedIds.map((id) => articles.find((a) => a.id === id)).filter((a): a is NewsArticle => Boolean(a));
      const unpinned = articles.filter((a) => !pinnedIds.includes(a.id));
      unpinned.sort((a, b) => {
        const aT = a.isTrending ? 1 : 0;
        const bT = b.isTrending ? 1 : 0;
        if (aT !== bT) return bT - aT;
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      });
      result = [...pinned, ...unpinned];
    } else if (currentCategory !== 'all') {
      result = result.filter((a) => a.category === currentCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [articles, currentCategory, searchQuery, portalSettings.pinnedTrendingArticleIds]);

  const trendingArticles = useMemo(() => {
    const pinnedIds = portalSettings.pinnedTrendingArticleIds || [];
    const pinned = pinnedIds.map((id) => articles.find((a) => a.id === id)).filter((a): a is NewsArticle => Boolean(a));
    const unpinned = articles.filter((a) => !pinnedIds.includes(a.id));
    unpinned.sort((a, b) => {
      const aT = a.isTrending ? 1 : 0;
      const bT = b.isTrending ? 1 : 0;
      if (aT !== bT) return bT - aT;
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    });
    return [...pinned, ...unpinned];
  }, [articles, portalSettings.pinnedTrendingArticleIds]);

  // Spotlight Layout Segmenting
  const spotlightConfig = portalSettings.spotlightLayout || DEFAULT_SPOTLIGHT_LAYOUT;

  const heroSliderArticles = useMemo(() => {
    const config = spotlightConfig.heroSlider || DEFAULT_SPOTLIGHT_LAYOUT.heroSlider;
    if (config.source === 'manual' && config.selectedArticleIds && config.selectedArticleIds.length > 0) {
      const selected = articles.filter((a) => config.selectedArticleIds.includes(a.id));
      if (selected.length > 0) return selected;
    }
    if (config.source === 'category' && config.category && config.category !== 'all') {
      const catArticles = articles.filter((a) => a.category === config.category);
      if (catArticles.length > 0) return catArticles;
    }
    return filteredArticles.slice(0, 6);
  }, [articles, filteredArticles, spotlightConfig.heroSlider]);

  const heroArticle = heroSliderArticles[0] || filteredArticles[0];

  const topSecondaryStories = useMemo(() => {
    const config = spotlightConfig.secondaryCol || DEFAULT_SPOTLIGHT_LAYOUT.secondaryCol;
    const heroIds = new Set(heroSliderArticles.map((a) => a.id));
    let pool = filteredArticles.filter((a) => !heroIds.has(a.id));
    if (config.category && config.category !== 'all') {
      const catFiltered = pool.filter((a) => a.category === config.category);
      if (catFiltered.length >= 4) pool = catFiltered;
    }
    if (pool.length < 4 && heroArticle) {
      pool = filteredArticles.filter((a) => a.id !== heroArticle.id);
    }
    return pool.slice(0, 4);
  }, [filteredArticles, heroSliderArticles, heroArticle, spotlightConfig.secondaryCol]);

  const topBriefStories = useMemo(() => {
    const config = spotlightConfig.briefTicker || DEFAULT_SPOTLIGHT_LAYOUT.briefTicker;
    if (config.source === 'manual' && config.selectedArticleIds && config.selectedArticleIds.length > 0) {
      const manual = articles.filter((a) => config.selectedArticleIds.includes(a.id));
      if (manual.length > 0) return manual.slice(0, 5);
    }
    if (config.source === 'category' && config.category && config.category !== 'all') {
      const catArticles = articles.filter((a) => a.category === config.category);
      if (catArticles.length > 0) return catArticles.slice(0, 5);
    }
    const usedIds = new Set([heroArticle?.id, ...topSecondaryStories.map((a) => a.id)].filter(Boolean));
    const pool = articles.filter((a) => !usedIds.has(a.id));
    return pool.length >= 4 ? pool.slice(0, 5) : articles.slice(0, 5);
  }, [articles, heroArticle, topSecondaryStories, spotlightConfig.briefTicker]);

  // Top 3 popular states ranking
  const topPopularStates = useMemo(() => {
    return MAJOR_INDIAN_STATES.map((st) => {
      const stateArticles = articles.filter(
        (a) =>
          a.location === st ||
          a.title.toLowerCase().includes(st.toLowerCase()) ||
          a.content.toLowerCase().includes(st.toLowerCase())
      );
      const views = stateArticles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
      const topStory = stateArticles[0] || null;
      const regionGroup = ALL_INDIAN_STATES_BY_REGION.find((g) => g.states.includes(st));
      return {
        name: st,
        articleCount: stateArticles.length,
        views,
        topStory,
        regionShort: regionGroup?.regionShort || 'प्रमुख राज्य',
        badgeClass: regionGroup?.badgeClass || 'bg-slate-100 text-slate-800 border-slate-200',
        dotClass: regionGroup?.dotClass || 'bg-red-500',
        cardHoverClass: regionGroup?.cardHoverClass || 'hover:bg-slate-50',
        score: stateArticles.length * 1000 + views,
      };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [articles]);

  const customStatesList =
    portalSettings.headerFooter?.customStates && portalSettings.headerFooter.customStates.length > 0
      ? portalSettings.headerFooter.customStates
      : MAJOR_INDIAN_STATES;
  const disabledStatesList = portalSettings.headerFooter?.disabledStates || [];
  const activeStatesList = useMemo(() => {
    return customStatesList.filter((s) => !disabledStatesList.includes(s));
  }, [customStatesList, disabledStatesList]);

  // Navigation handlers
  const handleSelectArticle = (article: NewsArticle) => {
    setPendingArticleId(null);
    setActiveArticle(article);
    setCurrentView('article');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveArticle(null);
    setSearchQuery('');
    setCurrentCategory('all');
  };

  const handleOpenContactPage = () => {
    setActiveLegalPolicyType('contact');
    setCurrentView('legal');
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAboutUsPage = () => {
    setActiveLegalPolicyType('about');
    setCurrentView('legal');
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubmitNews = () => {
    setCurrentView('submit-news');
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLegalPolicy = (type: LegalPolicyType) => {
    setActiveLegalPolicyType(type);
    setCurrentView('legal');
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArchivePage = () => {
    setCurrentView('archive');
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEPaper = () => {
    setCurrentView('epaper');
    setActiveArticle(null);
  };

  const handleScrollToLiveVideo = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('live-video-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('live-video-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.id === currentCategory);

  // Categories shown in navigation: owner's order, minus disabled ones, with custom labels.
  const navCategories = useMemo(() => {
    const hf = portalSettings.headerFooter;
    const known = CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'trending').map((c) => c.id as string);
    const order = (hf?.navCategoryOrder || hf?.categoryOrder || known).filter((id: string) => known.includes(id));
    const rest = known.filter((id) => !order.includes(id));
    const disabled = new Set(hf?.disabledCategories || []);
    return [...order, ...rest]
      .filter((id) => !disabled.has(id as NewsCategory))
      .map((id) => ({ id, label: categoryLabel(id, hf?.customCategoryLabels as Record<string, string> | undefined) }));
  }, [portalSettings.headerFooter]);

  // A breaking band only for a real breaking story from the last 24 hours.
  const breakingArticle = useMemo(
    () => articles.find((a) => a.isBreaking && Date.now() - (Date.parse(a.createdAt) || 0) < 86400_000) || null,
    [articles]
  );

  return (
    <div className="kd-app">
      {/* 1. Primary Header */}
      <SiteHeader
        settings={portalSettings}
        categories={navCategories}
        activeCategory={currentView === 'home' && !searchQuery ? (currentCategory === 'all' ? '' : currentCategory) : ''}
        isHome={currentView === 'home' && !searchQuery}
        isArticle={currentView === 'article'}
        searchQuery={searchQuery}
        onSearch={(q) => {
          setCurrentCategory('all');
          setSearchQuery(q);
          setCurrentView('home');
        }}
        breaking={breakingArticle}
        hasLive={liveBlogs.some((b) => b.isLive)}
        isStaff={isStaff}
        onOpenNewsroom={() => setShowAdminBackend(true)}
      />

      {/* 2. View Switcher (less common pages load on demand) */}
      <main id="main-content" tabIndex={-1} className="kd-main">
      <Suspense fallback={<div className="kd-container kd-page" aria-busy="true"><div className="kd-skel" style={{ height: 320 }} /></div>}>
      {pendingArticleId && currentView !== 'not-found' ? (
        <div className="kd-container kd-page" aria-busy="true">
          <h1 className="sr-only">ख़बर लोड हो रही है…</h1>
          <div className="kd-skel" style={{ height: 40, maxWidth: 720 }} />
          <div className="kd-skel" style={{ height: 24, maxWidth: 560, marginTop: 16 }} />
          <div className="kd-skel" style={{ aspectRatio: '16 / 9', maxWidth: 812, marginTop: 24 }} />
        </div>
      ) : currentView === 'article' && activeArticle ? (
        <ArticleView
          article={activeArticle}
          allArticles={articles}
          settings={portalSettings}
          fontScale={fontSize}
          onOpen={handleSelectArticle}
          onEdit={isStaff ? () => setShowAdminBackend(true) : undefined}
        />
      ) : currentView === 'author' || currentView === 'tag' || currentView === 'videos' ? (
        <ListingPageView
          kind={currentView}
          value={listingValue}
          articles={articles}
          portalSettings={portalSettings}
          onSelectArticle={handleSelectArticle}
          onBackToHome={handleBackToHome}
        />
      ) : currentView === 'not-found' ? (
        <NotFoundView
          latest={articles}
          onSelectArticle={handleSelectArticle}
          onBackToHome={handleBackToHome}
          onSearch={(q) => {
            setCurrentCategory('all');
            setSearchQuery(q);
            setCurrentView('home');
          }}
        />
      ) : currentView === 'live-feed' && !(activeLiveBlog || liveBlogs[0]) ? (
        <div className="kd-container kd-page">
          <h1 className="kd-page-title">लाइव ख़बरें</h1>
          <div className="kd-empty">
            <p className="kd-empty__title">अभी कोई लाइव कवरेज नहीं चल रहा है।</p>
            <p className="kd-meta">बड़ी ख़बर पर लाइव अपडेट शुरू होते ही वे यहाँ दिखेंगे।</p>
            <button type="button" className="kd-btn kd-btn--primary" onClick={handleBackToHome}>
              ताज़ा ख़बरें पढ़ें
            </button>
          </div>
        </div>
      ) : currentView === 'live-feed' ? (
        <LiveFeedPageView
          liveBlog={(activeLiveBlog || liveBlogs[0])!}
          allLiveBlogs={liveBlogs}
          onSelectLiveBlog={(blog) => setActiveLiveBlog(blog)}
          onBackToHome={handleBackToHome}
          onSelectArticle={handleSelectArticle}
          articles={articles}
          fontSize={fontSize}
          portalSettings={portalSettings}
          onOpenAdminSettings={() => {
            if (!isAdmin) {
              setAdminInitialTab('live_feed');
              setShowStaffLogin(true);
              return;
            }
            setShowAdminBackend(true);
          }}
        />
      ) : currentView === 'contact' || currentView === 'about' || currentView === 'legal' ? (
        <LegalPolicyPageView
          initialPolicyType={
            currentView === 'contact' ? 'contact' : currentView === 'about' ? 'about' : activeLegalPolicyType
          }
          onBackToHome={handleBackToHome}
          portalSettings={portalSettings}
          isAdmin={isAdmin}
          onUpdateSettings={handleUpdateSettings}
          onOpenContactPage={handleOpenContactPage}
          onOpenAboutUsPage={handleOpenAboutUsPage}
          onAddInquiry={handleAddContactInquiry}
          onOpenAdminSettings={() => {
            openAdminStudio('footer');
          }}
        />
      ) : currentView === 'submit-news' ? (
        <SubmitNewsPageView
          onBackToHome={handleBackToHome}
          portalSettings={portalSettings}
          onOpenContactPage={handleOpenContactPage}
          onSubmitNews={(submission) => {
            handleAddCitizenSubmission(submission);
            setActivePushToast({
              id: 'toast-' + Date.now(),
              title: 'खबर सफलतापूर्वक प्राप्त हुई!',
              message: `टिकट ${submission.id}: आपकी खबर संपादकीय डेस्क को भेज दी गई है।`,
              status: 'sent',
              targetAudience: 'all',
              sentAt: new Date().toISOString(),
              clicksCount: 0,
              reachCount: 1,
            });
          }}
        />
      ) : currentView === 'archive' ? (
        <ArchivePageView
          articles={articles}
          onSelectArticle={handleSelectArticle}
          onBackToHome={handleBackToHome}
          portalSettings={portalSettings}
          fontSize={fontSize}
        />
      ) : currentView === 'epaper' ? (
        <EPaperPageView
          onBackToHome={handleBackToHome}
          portalSettings={portalSettings}
          articles={articles}
          onSelectArticle={handleSelectArticle}
          onOpenAdminSettings={isAdmin ? () => openAdminStudio('epaper') : undefined}
          isAdmin={isAdmin}
        />
      ) : (
        <HomeView
          articles={articles}
          filtered={filteredArticles}
          categories={navCategories}
          category={currentCategory}
          searchQuery={searchQuery}
          settings={portalSettings}
          loading={loading}
          onOpen={handleSelectArticle}
        />
      )}
      </Suspense>
      </main>

      {/* Overlays load on demand without hiding the page. */}
      <Suspense fallback={null}>

      {/* Floating editorial button for staff */}
      {isStaff && !isAdmin && (
        <button
          onClick={() => setShowAdminBackend(true)}
          className="fixed bottom-5 right-5 z-40 bg-white hover:bg-slate-50 text-slate-900 p-3 rounded-full shadow-2xl border-2 border-red-600/50 flex items-center space-x-2 transition hover:scale-105 group cursor-pointer"
          title="Open Editorial & Author Studio"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <Sliders className="w-4 h-4 text-red-600 group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-bold font-sans pr-1 hidden sm:inline">Editor Desk</span>
        </button>
      )}

      {/* Frontend Customizer Bar for Admin */}
      <AdminFrontendCustomizerBar
        onOpenSettingsTab={(tab) => openAdminStudio(tab)}
        onOpenAdminBackend={() => openAdminStudio('dashboard')}
        onNewArticle={() => openAdminStudio('articles')}
      />

      {/* Push Notification Toast */}
      <NotificationToast
        notification={activePushToast}
        onClose={() => setActivePushToast(null)}
        articles={articles}
        onSelectArticle={handleSelectArticle}
      />

      {/* Homepage Popup Modal */}
      <PortalPopup
        config={portalSettings.popupConfig}
        articles={articles}
        onSelectArticle={handleSelectArticle}
        onSubscribeEmail={(email) => {
          handleAddSubscriber({
            email,
            source: 'popup',
            status: 'active',
          });
        }}
      />

      {/* Admin Backend Studio */}
      {showAdminBackend && (
        <AdminBackendPanel
          initialTab={adminInitialTab}
          onClose={() => setShowAdminBackend(false)}
          articles={staffArticles}
          portalSettings={portalSettings}
          onUpdateSettings={handleUpdateSettings}
          onSaveArticle={handleSaveArticle}
          onDeleteArticle={handleDeleteArticle}
          subscribers={subscribers}
          onAddSubscriber={handleAddSubscriber}
          onDeleteSubscriber={handleDeleteSubscriber}
          notifications={notifications}
          onSendNotification={handleSendNotification}
          onSelectArticleToView={(art) => {
            setShowAdminBackend(false);
            handleSelectArticle(art);
          }}
          mediaAssets={mediaAssets}
          onAddMedia={handleAddMedia}
          onUpdateMedia={handleUpdateMedia}
          onDeleteMedia={handleDeleteMedia}
          editorialUsers={editorialUsers}
          onAddEditorialUser={handleAddEditorialUser}
          onUpdateEditorialUser={handleUpdateEditorialUser}
          onDeleteEditorialUser={handleDeleteEditorialUser}
          liveBlogs={liveBlogs}
          onAddLiveBlog={handleAddLiveBlog}
          onUpdateLiveBlog={handleUpdateLiveBlog}
          onDeleteLiveBlog={handleDeleteLiveBlog}
          onOpenLiveViewer={(blog) => {
            setActiveLiveBlog(blog);
            setCurrentView('live-feed');
            setShowAdminBackend(false);
          }}
          inquiries={contactInquiries}
          onUpdateInquiryStatus={handleUpdateInquiryStatus}
          onDeleteInquiry={handleDeleteInquiry}
          citizenSubmissions={citizenSubmissions}
          onUpdateCitizenSubmissionStatus={handleUpdateCitizenSubmissionStatus}
          onDeleteCitizenSubmission={handleDeleteCitizenSubmission}
        />
      )}

      {/* Publisher CMS */}
      {showPublisherCMS && (
        <PublisherCMS
          onClose={() => setShowPublisherCMS(false)}
          articles={staffArticles}
          onArticlePublished={() => {}}
          onSelectArticleToView={(art) => handleSelectArticle(art)}
          apiConfig={portalSettings.apiConfig}
          mediaLibrary={mediaAssets}
          onAddMedia={handleAddMedia}
        />
      )}

      {/* Bookmarks Modal */}
      {showBookmarks && (
        <BookmarksModal
          onClose={() => setShowBookmarks(false)}
          bookmarks={bookmarks}
          allArticles={articles}
          onSelectArticle={handleSelectArticle}
          onRemoveBookmark={handleToggleBookmark}
        />
      )}

      {/* Read Later Modal */}
      {showReadLater && (
        <ReadLaterModal
          onClose={() => setShowReadLater(false)}
          readLaterItems={readLaterItems}
          allArticles={articles}
          bookmarks={bookmarks}
          onSelectArticle={handleSelectArticle}
          onRemoveReadLater={handleRemoveReadLater}
          onToggleBookmark={handleToggleBookmark}
          onClearAllReadLater={handleClearAllReadLater}
        />
      )}

      {/* E-Paper Modal */}
      {showEPaper && (
        <EPaperModal
          onClose={() => setShowEPaper(false)}
          portalSettings={portalSettings}
          articles={articles}
          onSelectArticle={handleSelectArticle}
          onOpenAdminSettings={isAdmin ? () => openAdminStudio('epaper') : undefined}
          isAdmin={isAdmin}
        />
      )}

      {/* Daily Sudoku Puzzle */}
      {showSudokuModal && (
        <DailySudokuModal
          isOpen={showSudokuModal}
          onClose={() => {
            setShowSudokuModal(false);
            if (
              window.location.hash.toLowerCase().includes('sudoku') ||
              window.location.hash.toLowerCase().includes('game') ||
              window.location.hash.toLowerCase().includes('puzzle')
            ) {
              window.history.replaceState(null, '', '/');
            }
          }}
        />
      )}

      {/* Staff Login Modal */}
      {showStaffLogin && (
        <StaffLoginModal
          isOpen={showStaffLogin}
          onClose={() => {
            setShowStaffLogin(false);
            if (
              window.location.hash.toLowerCase().includes('login') ||
              window.location.hash.toLowerCase().includes('staff') ||
              window.location.hash.toLowerCase().includes('admin') ||
              window.location.pathname.toLowerCase().includes('/login')
            ) {
              window.history.replaceState(null, '', '/');
            }
          }}
          onLoginSuccess={() => {
            setShowStaffLogin(false);
            if (
              window.location.hash.toLowerCase().includes('login') ||
              window.location.hash.toLowerCase().includes('staff') ||
              window.location.hash.toLowerCase().includes('admin') ||
              window.location.pathname.toLowerCase().includes('/login')
            ) {
              window.history.replaceState(null, '', '/');
            }
            setShowAdminBackend(true);
          }}
        />
      )}

      {/* Subscriber Preferences Modal */}
      {showSubscriberModal && (
        <SubscriberPreferencesModal
          isOpen={showSubscriberModal}
          onClose={() => setShowSubscriberModal(false)}
          onSaveSubscriber={handleAddSubscriber}
        />
      )}

      {/* All Indian States & UTs Directory Modal */}
      <AllStatesDirectoryModal
        isOpen={showAllStatesModal}
        onClose={() => setShowAllStatesModal(false)}
        searchQuery={searchQuery}
        onSelectState={(st) => {
          setSearchQuery(st);
          setCurrentCategory('all');
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClearSearch={() => setSearchQuery('')}
        topPopularStates={topPopularStates}
      />

      {/* Footer */}
      </Suspense>

      <SiteFooter settings={portalSettings} categories={navCategories} />
      <Suspense fallback={null}>

      {/* 5-Item Mobile Bottom Navigation Bar */}
      {/* Phone bottom navigation lives in SiteHeader (and the article share bar). */}

      {/* AI Quick Read Slide Panel */}
      <QuickReadSlidePanel
        isOpen={showQuickReadPanel}
        onClose={() => setShowQuickReadPanel(false)}
        article={quickReadArticle}
        onSelectFullArticle={(art) => {
          setShowQuickReadPanel(false);
          handleSelectArticle(art);
        }}
        isBookmarked={quickReadArticle ? isArticleBookmarked(quickReadArticle.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NewsPortalMain />
    </AuthProvider>
  );
}
