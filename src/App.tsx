import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNewsPortalData } from './hooks/useNewsPortalData';

// Layout & Core Views
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ArticlePageView } from './components/ArticlePageView';
import { LiveFeedPageView } from './components/LiveFeedPageView';
import { ContactUsPageView } from './components/ContactUsPageView';
import { AboutUsPageView } from './components/AboutUsPageView';
import { SubmitNewsPageView } from './components/SubmitNewsPageView';
import { LegalPolicyPageView, LegalPolicyType } from './components/LegalPolicyPageView';
import { ArchivePageView } from './components/ArchivePageView';
import { EPaperPageView } from './components/EPaperPageView';

// Homepage Components
import { SpotlightSection } from './components/SpotlightSection';
import { TrendingSection } from './components/TrendingSection';
import { RegionalStatesFilterBar } from './components/home/RegionalStatesFilterBar';
import { TopCategoriesGrid } from './components/home/TopCategoriesGrid';
import { VideoSection } from './components/VideoSection';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { AdBanner } from './components/AdBanner';
import { PortalPopup } from './components/PortalPopup';
import { NotificationToast } from './components/NotificationToast';

// Navigation & Bars
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { AdminFrontendCustomizerBar } from './components/AdminFrontendCustomizerBar';
import { QuickReadSlidePanel } from './components/QuickReadSlidePanel';

// Modals
import { AllStatesDirectoryModal } from './components/modals/AllStatesDirectoryModal';
import { BookmarksModal } from './components/BookmarksModal';
import { ReadLaterModal } from './components/ReadLaterModal';
import { EPaperModal } from './components/EPaperModal';
import { DailySudokuModal } from './components/DailySudokuModal';
import { StaffLoginModal } from './components/StaffLoginModal';
import { SubscriberPreferencesModal } from './components/SubscriberPreferencesModal';
import { PublisherCMS } from './components/PublisherCMS';
import { AdminBackendPanel } from './components/AdminBackendPanel';

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
function NewsPortalMain() {
  const { user, isStaff, isAdmin, isEditor } = useAuth();
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
    'home' | 'article' | 'live-feed' | 'contact' | 'about' | 'legal' | 'submit-news' | 'archive' | 'epaper'
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

  // Apply typography CSS variables dynamically to the document
  useEffect(() => {
    if (portalSettings?.typography) {
      const root = document.documentElement;
      
      // Global Typography Base Tokens
      const defaultFont = portalSettings.typography.defaultFontFamily || "'Noto Sans Devanagari', 'Noto Sans', sans-serif";
      const defaultWeight = String(portalSettings.typography.defaultFontWeight || 400);
      root.style.setProperty('--font-global', defaultFont);
      root.style.setProperty('--weight-global', defaultWeight);
      if (portalSettings.typography.globalDesktopFontSize) {
        root.style.setProperty('--size-global-desktop', `${portalSettings.typography.globalDesktopFontSize}px`);
      }
      if (portalSettings.typography.globalMobileFontSize) {
        root.style.setProperty('--size-global-mobile', `${portalSettings.typography.globalMobileFontSize}px`);
      }
      if (portalSettings.typography.globalLineHeight) {
        root.style.setProperty('--lh-global', String(portalSettings.typography.globalLineHeight));
      }
      if (portalSettings.typography.globalLetterSpacing) {
        root.style.setProperty('--ls-global', `${portalSettings.typography.globalLetterSpacing}px`);
      }

      // 18 Section Overrides Injection
      const sections = portalSettings.typography.sections;
      if (sections) {
        const cssMap: Record<string, string> = {
          global: 'global',
          header: 'header',
          navigation: 'nav',
          homepage: 'homepage',
          homepageHeadings: 'homepage-headings',
          newsCards: 'cards',
          categoryPages: 'category',
          singleArticle: 'single-article',
          articleHeadline: 'article-headline',
          articleBody: 'article-body',
          articleSubheadings: 'article-subheadings',
          articleDescription: 'article-description',
          authorProfiles: 'author-profiles',
          imageCaptions: 'image-captions',
          sidebar: 'sidebar',
          widgetHeadings: 'widget-headings',
          footer: 'footer',
          legalPages: 'legal-pages',
          adminEditor: 'admin-editor',
        };

        Object.keys(cssMap).forEach((secKey) => {
          const sec = (sections as any)[secKey];
          const prefix = cssMap[secKey];
          if (sec && sec.enabled) {
            if (sec.fontFamily) root.style.setProperty(`--font-${prefix}`, sec.fontFamily);
            if (sec.fontWeight) root.style.setProperty(`--weight-${prefix}`, String(sec.fontWeight));
            if (sec.desktopFontSizePx) root.style.setProperty(`--size-${prefix}-desktop`, `${sec.desktopFontSizePx}px`);
            if (sec.mobileFontSizePx) root.style.setProperty(`--size-${prefix}-mobile`, `${sec.mobileFontSizePx}px`);
            if (sec.lineHeight) root.style.setProperty(`--lh-${prefix}`, String(sec.lineHeight));
            if (sec.letterSpacingPx != null) root.style.setProperty(`--ls-${prefix}`, `${sec.letterSpacingPx}px`);
          } else {
            root.style.removeProperty(`--font-${prefix}`);
            root.style.removeProperty(`--weight-${prefix}`);
            root.style.removeProperty(`--size-${prefix}-desktop`);
            root.style.removeProperty(`--size-${prefix}-mobile`);
            root.style.removeProperty(`--lh-${prefix}`);
            root.style.removeProperty(`--ls-${prefix}`);
          }
        });
      }

      root.style.setProperty('--font-headline', portalSettings.typography.headlineFont);
      root.style.setProperty('--font-body', portalSettings.typography.bodyFont);
      root.style.setProperty('--font-header', portalSettings.typography.headerFont);
      root.style.setProperty('--font-footer', portalSettings.typography.footerFont || portalSettings.typography.bodyFont);
      root.style.setProperty('--font-meta', portalSettings.typography.metaFont);
      root.style.setProperty('--weight-headline', String(portalSettings.typography.headlineWeight || 700));
      root.style.setProperty('--weight-body', String(portalSettings.typography.bodyWeight || 400));

      const scaleMap = { compact: '0.94', normal: '1', large: '1.1' };
      const baseMap = { small: '0.92', normal: '1', large: '1.08', xlarge: '1.16' };
      const computedScaleFont =
        portalSettings.typography.customScaleFont != null
          ? String(portalSettings.typography.customScaleFont)
          : baseMap[portalSettings.typography.baseSize || 'normal'] || '1';
      root.style.setProperty('--scale-font', computedScaleFont);
      root.style.setProperty('--mobile-scale', scaleMap[portalSettings.typography.mobileScale || 'normal'] || '1');

      const sizeScaleMap = { sm: '0.9', normal: '1', large: '1.12', xlarge: '1.24' };
      const metaScaleMap = { sm: '0.88', normal: '1', large: '1.1' };
      root.style.setProperty(
        '--size-heading-scale',
        portalSettings.typography.sizeHeadingScale != null
          ? String(portalSettings.typography.sizeHeadingScale)
          : sizeScaleMap[portalSettings.typography.headingSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-title-scale',
        portalSettings.typography.sizeTitleScale != null
          ? String(portalSettings.typography.sizeTitleScale)
          : sizeScaleMap[portalSettings.typography.titleSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-content-scale',
        portalSettings.typography.sizeContentScale != null
          ? String(portalSettings.typography.sizeContentScale)
          : sizeScaleMap[portalSettings.typography.contentSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-archive-scale',
        portalSettings.typography.sizeArchiveScale != null
          ? String(portalSettings.typography.sizeArchiveScale)
          : sizeScaleMap[portalSettings.typography.archiveSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-meta-scale',
        portalSettings.typography.sizeMetaScale != null
          ? String(portalSettings.typography.sizeMetaScale)
          : metaScaleMap[portalSettings.typography.metaSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-header-scale',
        portalSettings.typography.sizeHeaderScale != null
          ? String(portalSettings.typography.sizeHeaderScale)
          : sizeScaleMap[portalSettings.typography.headerFontSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-footer-scale',
        portalSettings.typography.sizeFooterScale != null
          ? String(portalSettings.typography.sizeFooterScale)
          : sizeScaleMap[portalSettings.typography.footerFontSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-homepage-title-scale',
        portalSettings.typography.sizeHomepageTitleScale != null
          ? String(portalSettings.typography.sizeHomepageTitleScale)
          : sizeScaleMap[portalSettings.typography.homepageTitleSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-article-title-scale',
        portalSettings.typography.sizeArticleTitleScale != null
          ? String(portalSettings.typography.sizeArticleTitleScale)
          : sizeScaleMap[portalSettings.typography.articleTitleSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-excerpt-scale',
        portalSettings.typography.sizeExcerptScale != null
          ? String(portalSettings.typography.sizeExcerptScale)
          : sizeScaleMap[portalSettings.typography.articleExcerptSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--size-meta-desc-scale',
        portalSettings.typography.sizeMetaDescScale != null
          ? String(portalSettings.typography.sizeMetaDescScale)
          : sizeScaleMap[portalSettings.typography.metaDescriptionSize || 'normal'] || '1'
      );
      root.style.setProperty(
        '--mobile-sidebar-font-scale',
        String(portalSettings.typography.mobileSidebarFontScale || '1')
      );

      // Custom Pixel Inputs from Admin Typography Customizer
      if (portalSettings.typography.baseFontSizePx) {
        root.style.setProperty('--base-font-size', `${portalSettings.typography.baseFontSizePx}px`);
      }
      if (portalSettings.typography.sectionHeadingPx) {
        root.style.setProperty('--font-section-heading-size', `${portalSettings.typography.sectionHeadingPx}px`);
      }
      if (portalSettings.typography.heroTitlePx) {
        root.style.setProperty('--font-hero-title-size', `${portalSettings.typography.heroTitlePx}px`);
      }
      if (portalSettings.typography.gridCardTitlePx) {
        root.style.setProperty('--font-grid-card-title-size', `${portalSettings.typography.gridCardTitlePx}px`);
      }
      if (portalSettings.typography.gridCardExcerptPx) {
        root.style.setProperty('--font-grid-card-excerpt-size', `${portalSettings.typography.gridCardExcerptPx}px`);
      }
      if (portalSettings.typography.cardMetaFontSizePx) {
        root.style.setProperty('--font-card-meta-size', `${portalSettings.typography.cardMetaFontSizePx}px`);
      }
      if (portalSettings.typography.navLinkFontSizePx) {
        root.style.setProperty('--font-nav-link-size', `${portalSettings.typography.navLinkFontSizePx}px`);
      }
      if (portalSettings.typography.tickerFontSizePx) {
        root.style.setProperty('--font-ticker-size', `${portalSettings.typography.tickerFontSizePx}px`);
      }
      if (portalSettings.typography.articleLeadSubtitlePx) {
        root.style.setProperty('--font-article-lead-size', `${portalSettings.typography.articleLeadSubtitlePx}px`);
      }
      if (portalSettings.typography.articleBodyFontSizePx) {
        root.style.setProperty('--font-article-body-size', `${portalSettings.typography.articleBodyFontSizePx}px`);
      }
      if (portalSettings.typography.articleBodyLineHeight) {
        root.style.setProperty('--line-height-article-body', `${portalSettings.typography.articleBodyLineHeight}`);
      }
      if (portalSettings.typography.sidebarHeadingPx) {
        root.style.setProperty('--font-sidebar-heading-size', `${portalSettings.typography.sidebarHeadingPx}px`);
      }
      if (portalSettings.typography.sidebarItemTitlePx) {
        root.style.setProperty('--font-sidebar-item-title', `${portalSettings.typography.sidebarItemTitlePx}px`);
      }
      if (portalSettings.typography.footerHeadingPx) {
        root.style.setProperty('--font-footer-heading-size', `${portalSettings.typography.footerHeadingPx}px`);
      }
      if (portalSettings.typography.footerTextPx) {
        root.style.setProperty('--font-footer-text-size', `${portalSettings.typography.footerTextPx}px`);
      }
    }
  }, [portalSettings.typography]);

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

    // Dynamic Title & Description
    if (hf?.siteTitle && currentView !== 'article') {
      const siteTitle = hf.siteTitle;
      const tagline = hf.siteTagline || '';
      document.title = tagline ? `${siteTitle} - ${tagline}` : siteTitle;

      const metaDesc = document.querySelector('meta[name="description"]');
      const descContent = hf.aboutText || hf.footerAboutText || hf.siteTagline;
      if (metaDesc && descContent) {
        metaDesc.setAttribute('content', descContent);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', document.title);
    }

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

  // URL Route Detection for Articles, Categories, Staff Login, Legal Policies
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname;
      const lowerPath = path.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const articleQuery = searchParams.get('article');
      const categoryQuery = searchParams.get('category');

      // 1. Direct Article URL Resolution
      let targetArticleId: string | null = null;
      if (lowerPath.startsWith('/article/')) {
        targetArticleId = path.slice('/article/'.length).split('/')[0].split('?')[0].trim();
      } else if (articleQuery) {
        targetArticleId = articleQuery.trim();
      }

      if (targetArticleId) {
        const found = articles.find((a) => a.id === targetArticleId);
        if (found) {
          setActiveArticle(found);
          setCurrentView('article');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 2. Category URL Resolution
      let targetCategory: string | null = null;
      if (lowerPath.startsWith('/category/')) {
        targetCategory = path.slice('/category/'.length).split('/')[0].split('?')[0].trim();
      } else if (categoryQuery) {
        targetCategory = categoryQuery.trim();
      }

      if (targetCategory) {
        const validCat = CATEGORIES.find((c) => c.id === targetCategory.toLowerCase());
        if (validCat) {
          setCurrentCategory(validCat.id as NewsCategory);
          setCurrentView('home');
          setActiveArticle(null);
          return;
        }
      }

      // 3. Live Feed
      if (lowerPath === '/live-feed' || lowerPath === '/live' || hash === '#live-feed' || hash === '#live') {
        setCurrentView('live-feed');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 4. E-Paper Page URL
      if (lowerPath === '/epaper' || hash.startsWith('#epaper')) {
        setCurrentView('epaper');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 5. Admin & Staff routes
      if (hash === '#admin' || hash === '#/admin' || lowerPath === '/admin' || lowerPath.endsWith('/admin')) {
        if (isAdmin || isStaff) {
          setShowAdminBackend(true);
        } else {
          setShowStaffLogin(true);
        }
      } else if (hash === '#login' || hash === '#/login' || hash === '#staff' || lowerPath === '/login' || lowerPath.endsWith('/login')) {
        setShowStaffLogin(true);
      } else if (hash === '#about' || lowerPath === '/about' || lowerPath.endsWith('/about')) {
        setCurrentView('about');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#contact' || lowerPath === '/contact' || lowerPath.endsWith('/contact')) {
        setCurrentView('contact');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#submit-news' || hash === '#reporter' || lowerPath === '/submit-news' || lowerPath.endsWith('/submit-news')) {
        setCurrentView('submit-news');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#archive' || lowerPath === '/archive' || lowerPath.endsWith('/archive')) {
        setCurrentView('archive');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        hash === '#sudoku' ||
        hash === '#/sudoku' ||
        hash === '#game' ||
        hash === '#puzzle' ||
        lowerPath === '/sudoku' ||
        lowerPath.endsWith('/sudoku')
      ) {
        setShowSudokuModal(true);
      } else if (
        hash.startsWith('#legal-') ||
        hash === '#privacy-policy' ||
        lowerPath === '/privacy-policy' ||
        hash === '#terms-of-service' ||
        lowerPath === '/terms' ||
        lowerPath === '/terms-and-conditions' ||
        hash === '#grievance-redressal' ||
        hash === '#fact-check-policy' ||
        hash === '#editorial-ethics' ||
        hash === '#disclaimer' ||
        hash === '#corrections' ||
        hash === '#dmca'
      ) {
        let policy: LegalPolicyType = 'privacy';
        if (hash.includes('terms') || lowerPath.includes('terms')) policy = 'terms';
        else if (hash.includes('grievance')) policy = 'grievance';
        else if (hash.includes('fact')) policy = 'factCheck';
        else if (hash.includes('ethics')) policy = 'ethics';
        else if (hash.includes('disclaimer')) policy = 'disclaimer';
        else if (hash.includes('corrections')) policy = 'corrections';
        else if (hash.includes('dmca') || hash.includes('copyright')) policy = 'dmca';
        setActiveLegalPolicyType(policy);
        setCurrentView('legal');
        setActiveArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (lowerPath === '/' && !hash) {
        if (currentView === 'article') {
          setCurrentView('home');
          setActiveArticle(null);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [articles, isAdmin, isStaff]);

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
    setActiveArticle(article);
    setCurrentView('article');
    try {
      window.history.pushState({ view: 'article', id: article.id }, '', `/article/${article.id}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveArticle(null);
    try {
      window.history.pushState({ view: 'home' }, '', '/');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    try {
      window.history.pushState({ view: 'epaper' }, '', '#epaper');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-['Mukta',sans-serif]">
      {/* 1. Primary Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          if (currentView !== 'home') setCurrentView('home');
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') setCurrentView('home');
        }}
        onOpenPublisherCMS={() => {
          if (isStaff) setShowAdminBackend(true);
          else setShowPublisherCMS(true);
        }}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onOpenReadLater={() => setShowReadLater(true)}
        onOpenEPaper={handleOpenEPaper}
        onOpenAdminSettings={(tab) => {
          if (!isAdmin) {
            setAdminInitialTab(tab || 'header_footer');
            setShowStaffLogin(true);
            return;
          }
          openAdminStudio(tab || 'header_footer');
        }}
        onOpenAdminBackend={() => {
          if (isStaff || isAdmin) setShowAdminBackend(true);
          else setShowStaffLogin(true);
        }}
        onOpenStaffLogin={() => setShowStaffLogin(true)}
        onOpenSubscriberModal={() => setShowSubscriberModal(true)}
        onOpenTypography={() => openAdminStudio('typography')}
        onScrollToLiveVideo={handleScrollToLiveVideo}
        bookmarksCount={bookmarks.length}
        readLaterCount={readLaterItems.length}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        portalSettings={portalSettings}
        onUpdateSettings={handleUpdateSettings}
        articles={articles}
        onSelectArticle={handleSelectArticle}
        onOpenLiveFeed={() => setCurrentView('live-feed')}
        onOpenContactPage={handleOpenContactPage}
        onOpenAboutUsPage={handleOpenAboutUsPage}
        onOpenSubmitNews={handleOpenSubmitNews}
        onOpenLegalPolicy={handleOpenLegalPolicy}
        onOpenArchivePage={handleOpenArchivePage}
        onResetTypography={handleResetTypography}
        onBackToHome={handleBackToHome}
        myCity={userCity}
        onSelectCity={(city) => {
          setUserCity(city);
          setSearchQuery(city);
          if (currentView !== 'home') setCurrentView('home');
        }}
      />

      {/* 2. View Switcher */}
      {currentView === 'article' && activeArticle ? (
        <ArticlePageView
          article={activeArticle}
          onBackToHome={handleBackToHome}
          onSelectArticle={handleSelectArticle}
          allArticles={articles}
          isBookmarked={isArticleBookmarked(activeArticle.id)}
          onToggleBookmark={handleToggleBookmark}
          isReadLater={isArticleInReadLater(activeArticle.id)}
          onToggleReadLater={handleToggleReadLater}
          fontSize={fontSize}
          portalSettings={portalSettings}
          onOpenAdminSettings={(tab) => {
            if (!isAdmin) {
              setAdminInitialTab(tab || 'sidebar_widgets');
              setShowStaffLogin(true);
              return;
            }
            openAdminStudio(tab || 'sidebar_widgets');
          }}
          onOpenTypography={() => openAdminStudio('typography')}
          onResetTypography={handleResetTypography}
          onUpdateSettings={handleUpdateSettings}
          onOpenEPaper={handleOpenEPaper}
          onEditArticle={(art) => {
            setActiveArticle(art);
            setArticles((prev) => prev.map((a) => (a.id === art.id ? art : a)));
          }}
        />
      ) : currentView === 'live-feed' ? (
        <LiveFeedPageView
          liveBlog={activeLiveBlog || liveBlogs[0] || undefined}
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
        /* HOMEPAGE VIEW */
        <main
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: swipeDragOffset !== 0 ? `translateX(${swipeDragOffset}px)` : undefined,
            transition: isTouchDragging ? 'none' : 'transform 0.44s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 relative ${swipeAnimationClass}`}
        >
          {/* Mobile Horizontal Swipe Feedback Pill */}
          {swipeCategoryFeedback && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-slate-200 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{swipeCategoryFeedback.label}</span>
              </div>
            </div>
          )}

          {/* Active Search Notification */}
          {searchQuery && (
            <div className="bg-white p-3.5 rounded-xl shadow-2xs border border-slate-200 flex items-center justify-between">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                "{searchQuery}" के लिए खोज परिणाम ({filteredArticles.length} ख़बरें)
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
              >
                खोज हटाएं
              </button>
            </div>
          )}

          {/* Category Filter Title Banner */}
          {currentCategory !== 'all' && !searchQuery && (
            <div className="bg-white p-4 rounded-xl shadow-2xs border-l-4 border-red-600 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block font-mono">
                  विशेष कवरेज
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-kd-headline text-slate-900">
                  {currentCategoryObj?.labelHindi}
                </h2>
              </div>
              <button
                onClick={() => setCurrentCategory('all')}
                className="text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 transition cursor-pointer font-medium"
              >
                ← ताज़ा ख़बरों पर लौटें
              </button>
            </div>
          )}

          {/* Top Leaderboard Ad */}
          {portalSettings.adSettings.showTopAd && (
            <AdBanner
              slot="leaderboard"
              type={portalSettings.adSettings.topAdType}
              privateBannerUrl={portalSettings.adSettings.privateBannerUrl}
              privateBannerLink={portalSettings.adSettings.privateBannerLink}
              privateBannerTitle={portalSettings.adSettings.privateBannerTitle}
              onOpenContactPage={handleOpenContactPage}
              breakpoints={portalSettings.adSettings.responsiveBreakpoints?.leaderboard}
            />
          )}

          {/* Loading Skeleton */}
          {loading && articles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
              <div className="md:col-span-2 h-72 bg-slate-200 rounded-xl" />
              <div className="h-72 bg-slate-200 rounded-xl" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <Newspaper className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800">इस विषय में अभी कोई खबर उपलब्ध नहीं है</h3>
              <p className="text-xs text-slate-500">जल्द ही इस विषय पर ताज़ा अपडेट प्रकाशित किए जाएंगे।</p>
              {isAdmin && (
                <button
                  onClick={() => setShowAdminBackend(true)}
                  className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-semibold inline-flex items-center space-x-1 cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>नई खबर लिखें</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Category / Search Results Grid */}
              {(currentCategory !== 'all' || searchQuery) && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                      <h3 className="text-base sm:text-lg font-bold font-kd-headline text-slate-900 flex items-center space-x-1.5">
                        {currentCategory === 'trending' ? (
                          <>
                            <Flame className="w-5 h-5 text-red-600 animate-pulse" />
                            <span>🔥 ट्रेंडिंग समाचार • सभी प्रमुख वायरल और चर्चित सुर्खियां</span>
                          </>
                        ) : searchQuery ? (
                          <span>खोज परिणाम: {searchQuery}</span>
                        ) : (
                          <span>{currentCategoryObj?.labelHindi || 'श्रेणी'} के सभी मुख्य समाचार</span>
                        )}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-kd-meta">
                      कुल {filteredArticles.length} ख़बरें उपलब्ध
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles.map((art, artIdx) => (
                      <div
                        key={art.id}
                        onClick={() => handleSelectArticle(art)}
                        className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-300 transition duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200">
                          <img
                            src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                            alt={art.imageAltText || art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-0"
                            loading="lazy"
                            decoding="async"
                            onLoad={(e) => {
                              (e.currentTarget as HTMLImageElement).classList.remove('opacity-0');
                              (e.currentTarget as HTMLImageElement).classList.add('opacity-100');
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center space-x-1">
                            {currentCategory === 'trending' && (
                              <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md font-mono shadow-xs flex items-center space-x-0.5">
                                <span>🔥 #{artIdx + 1}</span>
                              </span>
                            )}
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-kd-meta shadow-xs">
                              {art.category}
                            </span>
                            {art.isBreaking && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md font-kd-meta shadow-xs">
                                ब्रेकिंग
                              </span>
                            )}
                          </div>
                          {art.location && (
                            <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded font-kd-meta flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-red-400" />
                              <span>{art.location}</span>
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-kd-meta">
                              <span>{art.authorName}</span>
                              <span>{formatHindiTimeAgo(art.createdAt)}</span>
                            </div>
                            <h3
                              style={{ fontSize: 'var(--font-grid-card-title-size, 16px)' }}
                              className="font-bold font-kd-headline text-slate-900 group-hover:text-red-700 transition leading-snug"
                            >
                              {art.title}
                            </h3>
                            <p
                              style={{ fontSize: 'var(--font-grid-card-excerpt-size, 13px)' }}
                              className="text-slate-600 font-kd-body leading-relaxed mt-2"
                            >
                              {art.summary}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-100 font-kd-meta">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenQuickRead(art);
                                }}
                                className="bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-red-700 border border-red-200/90 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                                title="3 मुख्य बातें 15 सेकंड में पढ़ें"
                              >
                                <Zap className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                                <span>त्वरित सार</span>
                              </button>
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>{art.viewsCount || 0}</span>
                              </span>
                            </div>
                            <span className="text-red-600 font-bold group-hover:translate-x-0.5 transition-transform">
                              पूरी खबर पढ़ें →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 1. TOP SPOTLIGHT 3-COLUMN HERO SECTION */}
              {currentCategory === 'all' && !searchQuery && (
                <SpotlightSection
                  heroArticle={heroArticle}
                  heroSliderArticles={heroSliderArticles}
                  secondaryArticles={topSecondaryStories}
                  briefArticles={topBriefStories}
                  spotlightConfig={spotlightConfig}
                  portalSettings={portalSettings}
                  onSelectArticle={handleSelectArticle}
                  isArticleBookmarked={isArticleBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  isArticleInReadLater={isArticleInReadLater}
                  onToggleReadLater={handleToggleReadLater}
                  isAdmin={isAdmin}
                  onOpenSpotlightSettings={handleOpenSpotlightSettings}
                  onSelectCategory={(cat) => setCurrentCategory(cat as any)}
                  onQuickRead={handleOpenQuickRead}
                />
              )}

              {/* DEDICATED TRENDING FEATURE CARD */}
              {currentCategory === 'all' && !searchQuery && (
                <TrendingSection
                  articles={trendingArticles}
                  config={portalSettings.trendingConfig}
                  trendingTopics={portalSettings.trendingTopics}
                  onSelectArticle={handleSelectArticle}
                  onSelectTopic={(topic) => setSearchQuery(topic)}
                  onViewAllTrending={() => {
                    setCurrentCategory('trending');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenAdminTrending={isAdmin ? () => openAdminStudio('trending') : undefined}
                  isAdmin={isAdmin}
                  headlineStyling={portalSettings.headlineStyling}
                  onQuickRead={handleOpenQuickRead}
                />
              )}

              {/* 2. REGIONAL STATES QUICK FILTER STRIP */}
              <RegionalStatesFilterBar
                userCity={userCity}
                searchQuery={searchQuery}
                activeStatesList={activeStatesList}
                onSelectCity={(city) => {
                  if (searchQuery === city) setSearchQuery('');
                  else setSearchQuery(city);
                }}
                onSelectState={(stateName) => {
                  if (searchQuery === stateName) setSearchQuery('');
                  else setSearchQuery(stateName);
                }}
                onOpenAllStatesModal={() => setShowAllStatesModal(true)}
              />

              {/* 3. COMPACT CATEGORIES GRID */}
              {currentCategory === 'all' && !searchQuery && (
                <TopCategoriesGrid
                  articles={articles}
                  onSelectArticle={handleSelectArticle}
                  onQuickRead={handleOpenQuickRead}
                  onSelectCategory={(cat) => setCurrentCategory(cat)}
                  isArticleBookmarked={isArticleBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  isArticleInReadLater={isArticleInReadLater}
                  onToggleReadLater={handleToggleReadLater}
                  displayOptions={portalSettings.displayOptions}
                  mobileScale={portalSettings.typography?.mobileScale || 'normal'}
                />
              )}

              {/* 4. MULTIMEDIA SECTION: LIVE VIDEO */}
              {portalSettings.homepageSections?.liveVideoBulletin !== false &&
                portalSettings.liveVideoSectionEnabled !== false && (
                  <VideoSection
                    title={portalSettings.liveVideoTitle || 'Live Video Bulletin'}
                    youtubeId={portalSettings.liveVideoYoutubeId || 'jfKfPfyJRdk'}
                    videos={portalSettings.videoMediaList}
                  />
                )}

              {/* 5. MULTIMEDIA SECTION: PHOTO GALLERY */}
              {portalSettings.homepageSections?.photoGallery !== false && <PhotoGallerySection />}

              {/* 6. HOMEPAGE BOTTOM ADVERTISEMENT */}
              {portalSettings.adSettings.showBottomAd && (
                <div className="pt-2">
                  <AdBanner
                    slot="bottom"
                    type="adsense"
                    onOpenContactPage={handleOpenContactPage}
                    breakpoints={portalSettings.adSettings.responsiveBreakpoints?.bottom}
                  />
                </div>
              )}
            </>
          )}
        </main>
      )}

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
      <Footer
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          setCurrentView('home');
        }}
        onOpenEPaper={handleOpenEPaper}
        onOpenPublisherCMS={() => {
          if (isStaff) setShowAdminBackend(true);
          else setShowStaffLogin(true);
        }}
        onOpenStaffLogin={() => setShowStaffLogin(true)}
        onOpenSubscriberPreferences={() => setShowSubscriberModal(true)}
        portalSettings={portalSettings}
        onOpenAdminSettings={(tab) => {
          if (!isAdmin) {
            setAdminInitialTab(tab || 'footer');
            setShowStaffLogin(true);
            return;
          }
          openAdminStudio(tab || 'footer');
        }}
        onOpenLegalPolicy={handleOpenLegalPolicy}
        onOpenContactPage={handleOpenContactPage}
        onOpenAboutUsPage={handleOpenAboutUsPage}
        onOpenSubmitNews={handleOpenSubmitNews}
        onOpenArchivePage={handleOpenArchivePage}
        onSearchState={(stateName) => {
          setSearchQuery(stateName);
          setCurrentCategory('all');
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 5-Item Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        currentCategory={currentCategory}
        activeArticle={activeArticle}
        activeLegalPolicyType={activeLegalPolicyType}
        config={portalSettings.mobileBottomNav}
        onNavigateHome={() => {
          setCurrentView('home');
          setCurrentCategory('all');
          setActiveArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateLatest={() => {
          setCurrentView('home');
          setCurrentCategory('national');
          setActiveArticle(null);
          const ticker =
            document.getElementById('breaking-news-ticker') || document.getElementById('spotlight-hero-section');
          if (ticker) ticker.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateTrending={() => {
          setCurrentView('home');
          setActiveArticle(null);
          setCurrentCategory('trending');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateStates={() => {
          setCurrentView('home');
          setCurrentCategory('state');
          setActiveArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenEPaper={handleOpenEPaper}
        onScrollToVideos={() => {
          setCurrentView('home');
          const vidSec = document.getElementById('live-video-section');
          if (vidSec) vidSec.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToPhotos={() => {
          setCurrentView('home');
          const photoSec = document.getElementById('photo-gallery-section');
          if (photoSec) photoSec.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSudoku={() => setShowSudokuModal(true)}
        onOpenSubmitNews={handleOpenSubmitNews}
        onOpenArchivePage={handleOpenArchivePage}
        onOpenContactPage={handleOpenContactPage}
        onOpenAboutUsPage={handleOpenAboutUsPage}
        onOpenLegalPolicy={handleOpenLegalPolicy}
        onSelectCategory={(cat) => {
          setCurrentView('home');
          setCurrentCategory(cat);
          setActiveArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

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
