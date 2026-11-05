import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Newspaper,
  ExternalLink,
  Globe,
  Link2,
  Sliders,
  Mail,
  UserCheck,
  HelpCircle,
  CheckCircle2,
  Radio,
  Layout,
  Type,
  PenTool,
  Flame,
  Download,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Loader2,
  Info,
  Tag,
  X,
  Megaphone,
  Smartphone,
  Camera,
} from 'lucide-react';
import {
  NewsArticle,
  NewsComment,
  PortalSettings,
  ReactionType,
  ArticleReactions,
  MobileStickyBarConfig,
} from '../types/news';
import { getAuthorPhoto, CATEGORIES } from '../data/seedNews';
import {
  DEFAULT_PORTAL_SETTINGS,
  DEFAULT_ARTICLE_META_SETTINGS,
  DEFAULT_ARTICLE_SIDEBAR_WIDGETS,
  DEFAULT_ARTICLE_PAGE_CONFIG,
  DEFAULT_SIDEBAR_ADS_CONFIG,
  DEFAULT_MOBILE_STICKY_BAR_CONFIG,
  FONT_OPTIONS,
} from '../data/portalDefaults';
import { renderStyledHeadline } from '../utils/headlineHelper';
import { ArticleEPaperClippingModal } from './ArticleEPaperClippingModal';
import { generateArticlePdf } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import {
  fetchComments,
  postComment,
  likeArticle,
  incrementArticleViews,
  updateArticleReaction,
  updateArticle,
} from '../services/newsService';
import { formatHindiTimeAgo, speakHindiText, stopHindiSpeech } from '../utils/hindiHelpers';
import { renderArticleBlock, splitArticleContent } from '../utils/articleContentParser';
import { AdCode } from './AdCode';
import { AdBanner } from './AdBanner';
import { ArticleCard } from './ArticleCard';
import { SpotlightBriefTicker } from './SpotlightBriefTicker';
import { OpinionPollWidget } from './OpinionPollWidget';
import { GoldRateWidget } from './widgets/GoldRateWidget';
import { RashifalWidget } from './widgets/RashifalWidget';
import { SudokuGameWidget } from './widgets/SudokuGameWidget';
import { AudioNewsPlayer } from './AudioNewsPlayer';
import { ArticleKeyHighlights } from './ArticleKeyHighlights';
import { Reactions } from './Reactions';

export const getEnglishArticleSlug = (art: NewsArticle): string => {
  if (art.urlSlug && art.urlSlug.trim()) {
    return art.urlSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  }
  const engWords = (art.title + ' ' + (art.tags || []).join(' ')).match(/[a-zA-Z0-9]+/g);
  if (engWords && engWords.length >= 2) {
    return engWords.slice(0, 5).join('-').toLowerCase();
  }
  const cleanId = art.id.replace(/[^a-zA-Z0-9]/g, '');
  return `${art.category || 'news'}-${cleanId}`;
};

interface ArticlePageViewProps {
  article: NewsArticle;
  onBackToHome: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  allArticles: NewsArticle[];
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  isReadLater?: boolean;
  onToggleReadLater?: (article: NewsArticle) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  portalSettings: PortalSettings;
  onOpenAdminSettings?: (tab?: any) => void;
  onUpdateSettings?: (settings: PortalSettings) => void;
  onOpenEPaper?: () => void;
  onEditArticle?: (article: NewsArticle) => void;
  onOpenTypography?: () => void;
  onOpenSudokuModal?: () => void;
  onResetTypography?: () => void;
}

export const ArticlePageView: React.FC<ArticlePageViewProps> = ({
  article,
  onBackToHome,
  onSelectArticle,
  allArticles,
  isBookmarked,
  onToggleBookmark,
  isReadLater = false,
  onToggleReadLater,
  fontSize,
  portalSettings,
  onOpenAdminSettings,
  onUpdateSettings,
  onOpenEPaper,
  onEditArticle,
  onOpenTypography,
  onOpenSudokuModal,
  onResetTypography,
}) => {
  const { user, signInWithGoogle, isAdmin } = useAuth();
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [commentNotice, setCommentNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [likes, setLikes] = useState(article.likesCount);
  const [hasLiked, setHasLiked] = useState(false);

  // EMOJI REACTIONS (👍, ❤️, 😂, 😲)
  const [reactions, setReactions] = useState<ArticleReactions>(() => ({
    like: article.reactions?.like ?? (article.likesCount || 0),
    love: article.reactions?.love ?? Math.max(0, Math.floor((article.viewsCount || 8) * 0.14)),
    funny: article.reactions?.funny ?? Math.max(0, Math.floor((article.viewsCount || 8) * 0.05)),
    surprised: article.reactions?.surprised ?? Math.max(0, Math.floor((article.viewsCount || 8) * 0.03)),
    insightful: article.reactions?.insightful ?? 0,
  }));

  const [userReaction, setUserReaction] = useState<ReactionType | null>(() => {
    try {
      const stored = localStorage.getItem(`kd_reaction_${article.id}`);
      return (stored as ReactionType) || null;
    } catch {
      return null;
    }
  });

  const [reactionBurst, setReactionBurst] = useState<ReactionType | null>(null);

  // Sync reactions when article changes
  useEffect(() => {
    const nextReactions: ArticleReactions = {
      like: article.reactions?.like ?? (article.likesCount || 0),
      love: article.reactions?.love ?? Math.max(0, Math.floor((article.viewsCount || 8) * 0.14)),
      funny: article.reactions?.funny ?? Math.max(0, Math.floor((article.viewsCount || 8) * 0.05)),
      surprised: article.reactions?.surprised ?? Math.max(0, Math.floor((article.viewsCount || 8) * 0.03)),
      insightful: article.reactions?.insightful ?? 0,
    };
    setReactions(nextReactions);
    setLikes(nextReactions.like);
    try {
      const stored = localStorage.getItem(`kd_reaction_${article.id}`);
      const r = (stored as ReactionType) || null;
      setUserReaction(r);
      setHasLiked(r === 'like');
    } catch {
      setUserReaction(null);
      setHasLiked(false);
    }
  }, [article.id, article.reactions, article.likesCount, article.viewsCount]);

  // Synchronize document Title & SEO Meta Tags with Admin Published Article data
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = `${article.seoTitle || article.title} - Khabri Dost`;
    document.title = pageTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    const oldDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute('content', article.seoDescription || article.summary || article.title);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', article.seoTitle || article.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', article.seoDescription || article.summary || article.title);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', article.ogImage || article.imageUrl);

    return () => {
      document.title = originalTitle;
      if (metaDesc && oldDesc) metaDesc.setAttribute('content', oldDesc);
    };
  }, [article.id, article.title, article.seoTitle, article.seoDescription, article.summary, article.imageUrl, article.ogImage]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [showClippingModal, setShowClippingModal] = useState(false);
  const [swipeGestureFeedback, setSwipeGestureFeedback] = useState<string | null>(null);
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);

  // Derive previous and next articles for one-tap navigation & mobile swipe
  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  // Admin-configurable Related Articles count (admin can choose 3, 4, 6 or more)
  const [adminRelatedCount, setAdminRelatedCount] = useState<number>(() => {
    return portalSettings.sidebarWidgets?.relatedArticlesCount || 4;
  });

  // Interactive Sidebar Slider Carousel state for single page content
  const [isSidebarSlider, setIsSidebarSlider] = useState<boolean>(() => {
    return portalSettings.sidebarWidgets?.sidebarSliderMode ?? false;
  });
  const [sidebarSlideIndex, setSidebarSlideIndex] = useState<number>(0);
  const [isSliderAutoplay, setIsSliderAutoplay] = useState<boolean>(true);
  const [isSliderHovered, setIsSliderHovered] = useState<boolean>(false);

  // Auto-play timer for sidebar slider carousel
  useEffect(() => {
    if (!isSidebarSlider || !isSliderAutoplay || isSliderHovered) return;
    const interval = setInterval(() => {
      setSidebarSlideIndex((prev) => (prev + 1) % 5);
    }, 5500);
    return () => clearInterval(interval);
  }, [isSidebarSlider, isSliderAutoplay, isSliderHovered]);

  // Newsletter & Poll state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [pollVoted, setPollVoted] = useState<'A' | 'B' | null>(null);
  const [pollPercentages, setPollPercentages] = useState<{ a: number; b: number }>({ a: 73, b: 27 });

  // Article PDF download state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Dynamic Reader Typography Customizer State (Font-Size & Font-Family Dropdown)
  const [showTypographyDropdown, setShowTypographyDropdown] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kd_reader_font_size');
      if (saved) return Number(saved);
    } catch {}
    return portalSettings.typography?.articleBodyFontSizePx || 17;
  });
  const [readerFontFamily, setReaderFontFamily] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kd_reader_font_family');
      if (saved) return saved;
    } catch {}
    return portalSettings.typography?.bodyFont || "'Mukta', sans-serif";
  });
  const [readerLineHeight, setReaderLineHeight] = useState<number>(() => {
    return portalSettings.typography?.articleBodyLineHeight || 1.75;
  });

  const handleUpdateReaderFontSize = (newSize: number) => {
    setReaderFontSize(newSize);
    try {
      localStorage.setItem('kd_reader_font_size', String(newSize));
    } catch {}
  };

  const handleUpdateReaderFontFamily = (newFont: string) => {
    setReaderFontFamily(newFont);
    try {
      localStorage.setItem('kd_reader_font_family', newFont);
    } catch {}
  };

  // Admin Headline Direct Inline Editor State (On-page immediate editing)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [inlineTitle, setInlineTitle] = useState(article.title);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [titleSaveSuccess, setTitleSaveSuccess] = useState(false);

  useEffect(() => {
    setInlineTitle(article.title);
  }, [article.id, article.title]);

  const handleSaveInlineTitle = async () => {
    const trimmed = inlineTitle.trim();
    if (!trimmed) return;
    setIsSavingTitle(true);
    try {
      await updateArticle(article.id, { title: trimmed });
      article.title = trimmed;
      if (onEditArticle) {
        onEditArticle({ ...article, title: trimmed });
      }
      setTitleSaveSuccess(true);
      setTimeout(() => setTitleSaveSuccess(false), 2500);
      setIsEditingTitle(false);
    } catch (err) {
      console.warn('Updated title locally', err);
      article.title = trimmed;
      if (onEditArticle) {
        onEditArticle({ ...article, title: trimmed });
      }
      setIsEditingTitle(false);
      setTitleSaveSuccess(true);
      setTimeout(() => setTitleSaveSuccess(false), 2500);
    } finally {
      setIsSavingTitle(false);
    }
  };

  // Trending stories vertical slider state (smooth continuous bottom-to-top like homepage 3rd card)
  const [trendingSlideIndex, setTrendingSlideIndex] = useState(0);
  const [isTrendingHovered, setIsTrendingHovered] = useState(false);
  const [isTrendingPaused, setIsTrendingPaused] = useState(false);
  const trendingScrollRef = React.useRef<HTMLDivElement>(null);

  // Extract customizable article meta and action bar settings (configured by Admin)
  const metaSettings = {
    ...DEFAULT_ARTICLE_META_SETTINGS,
    ...(portalSettings.articleMetaSettings || {}),
    platforms: {
      ...DEFAULT_ARTICLE_META_SETTINGS.platforms,
      ...(portalSettings.articleMetaSettings?.platforms || {}),
    },
  };

  // Extract single page and sidebar widget settings (configured by Admin)
  const sidebarWidgets = {
    ...DEFAULT_ARTICLE_SIDEBAR_WIDGETS,
    ...(portalSettings.sidebarWidgets || {}),
  };

  // Extract master single article page config (configured by Admin)
  const articlePageConfig = {
    ...DEFAULT_ARTICLE_PAGE_CONFIG,
    ...(portalSettings.articlePageConfig || {}),
  };

  // Author Biographical Section Visibility (Admin toggleable after showing content)
  const isAuthorBoxVisible =
    articlePageConfig.showAuthorBioBox !== false && metaSettings.showAuthorBox !== false;

  const handleToggleAuthorBox = () => {
    if (!onUpdateSettings) return;
    const nextState = !isAuthorBoxVisible;
    onUpdateSettings({
      ...portalSettings,
      articlePageConfig: {
        ...articlePageConfig,
        showAuthorBioBox: nextState,
      },
      articleMetaSettings: {
        ...metaSettings,
        showAuthorBox: nextState,
      },
    });
  };

  const stickyBarConfig: MobileStickyBarConfig = {
    ...DEFAULT_MOBILE_STICKY_BAR_CONFIG,
    ...(articlePageConfig.mobileStickyBar || portalSettings.mobileStickyBar || {}),
  };

  const [isMobileStickyDismissed, setIsMobileStickyDismissed] = useState(false);
  const [isFooterNear, setIsFooterNear] = useState(false);

  useEffect(() => {
    if (stickyBarConfig.autoHideOnFooter === false) return;

    const footerMarker =
      document.getElementById('site-footer-bottom-marker') || document.querySelector('footer');
    if (!footerMarker) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsFooterNear(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(footerMarker);
    return () => observer.disconnect();
  }, [stickyBarConfig.autoHideOnFooter]);

  const containerMaxWidthClass = {
    normal: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-[96rem]',
  }[articlePageConfig.containerMaxWidth || 'wide'] || 'max-w-7xl';

  const contentColumnClass = {
    compact: 'lg:col-span-7',
    standard: 'lg:col-span-8',
    wide: 'lg:col-span-9',
  }[articlePageConfig.contentColumnWidth || 'standard'] || 'lg:col-span-8';

  const sidebarColumnClass = {
    compact: 'lg:col-span-5',
    standard: 'lg:col-span-4',
    wide: 'lg:col-span-3',
  }[articlePageConfig.contentColumnWidth || 'standard'] || 'lg:col-span-4';

  const sectionH1 = portalSettings?.typography?.sections?.articleHeadline;
  const h1FontFamily =
    sectionH1?.enabled && sectionH1.fontFamily
      ? sectionH1.fontFamily
      : articlePageConfig.h1FontFamily
      ? (articlePageConfig.h1FontFamily === 'Mukta'
          ? "'Mukta', sans-serif"
          : articlePageConfig.h1FontFamily === 'Hind'
          ? "'Hind', sans-serif"
          : articlePageConfig.h1FontFamily === 'Rozha One'
          ? "'Rozha One', serif"
          : articlePageConfig.h1FontFamily)
      : portalSettings?.typography?.headlineFont || "var(--font-article-headline, 'Noto Sans Devanagari', 'Noto Sans', sans-serif)";

  const h1FontWeight =
    sectionH1?.enabled && sectionH1.fontWeight
      ? sectionH1.fontWeight
      : portalSettings?.typography?.headlineWeight || 700;

  // Desktop content reading container width in pixels (600px to 900px, default 780px)
  const contentContainerWidthPx = articlePageConfig.contentContainerWidthPx || 780;

  // Dynamic estimated reading time calculation (~180 words/minute)
  const estimatedReadTimeMinutes = React.useMemo(() => {
    const raw = `${article.title || ''} ${article.summary || ''} ${article.content || ''}`;
    const words = raw.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  }, [article.title, article.summary, article.content]);

  // Multi-image slider for featured images
  const [activeFeatureImageIdx, setActiveFeatureImageIdx] = useState<number>(0);
  const featureImageTouchStartXRef = React.useRef<number | null>(null);

  const allFeatureImages = React.useMemo(() => {
    const list: string[] = [];
    if (article.imageUrl) list.push(article.imageUrl);
    if (article.galleryImages && Array.isArray(article.galleryImages)) {
      article.galleryImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'];
  }, [article.imageUrl, article.galleryImages]);

  // Reset active image index on article change
  useEffect(() => {
    setActiveFeatureImageIdx(0);
  }, [article.id]);

  const handleNextFeatureImage = () => {
    setActiveFeatureImageIdx((prev) => (prev + 1) % allFeatureImages.length);
  };

  const handlePrevFeatureImage = () => {
    setActiveFeatureImageIdx((prev) => (prev - 1 + allFeatureImages.length) % allFeatureImages.length);
  };

  const currentFeatureCaption = React.useMemo(() => {
    if (article.galleryCaptions && article.galleryCaptions[activeFeatureImageIdx]) {
      return article.galleryCaptions[activeFeatureImageIdx];
    }
    return article.imageCaption || '';
  }, [article.galleryCaptions, article.imageCaption, activeFeatureImageIdx]);

  // Extract modular sidebar advertising configuration
  const sidebarAds = portalSettings.sidebarAdsConfig || DEFAULT_SIDEBAR_ADS_CONFIG;

  // Scroll listener for reading progress bar and sticky mini header
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolledPastHero(currentScroll > 320);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile Touch Swipe Navigation (Swipe Left = Next Article, Swipe Right = Previous Article)
  const handleArticleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleArticleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold: > 65px horizontal delta and at least 1.35x vertical motion
    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      if (deltaX < 0 && nextArticle) {
        // Swiped left -> next article
        setSwipeGestureFeedback(`अगली खबर: ${nextArticle.title.slice(0, 32)}...`);
        setTimeout(() => {
          onSelectArticle(nextArticle);
          setSwipeGestureFeedback(null);
        }, 200);
      } else if (deltaX > 0 && prevArticle) {
        // Swiped right -> previous article
        setSwipeGestureFeedback(`पिछली खबर: ${prevArticle.title.slice(0, 32)}...`);
        setTimeout(() => {
          onSelectArticle(prevArticle);
          setSwipeGestureFeedback(null);
        }, 200);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    incrementArticleViews(article.id, article.viewsCount);
    loadComments();
    return () => {
      stopHindiSpeech();
    };
  }, [article.id]);

  const loadComments = async () => {
    const list = await fetchComments(article.id);
    setComments(list);
  };

  const handleSpeechToggle = () => {
    setShowAudioPlayer((prev) => !prev);
  };

  const handleReaction = async (type: ReactionType) => {
    const prev = userReaction;
    const isTogglingOff = prev === type;
    const nextUserReaction = isTogglingOff ? null : type;

    // Optimistic local state update
    setUserReaction(nextUserReaction);
    try {
      if (nextUserReaction) {
        localStorage.setItem(`kd_reaction_${article.id}`, nextUserReaction);
      } else {
        localStorage.removeItem(`kd_reaction_${article.id}`);
      }
    } catch {
      // ignore storage error
    }

    // Trigger visual pop animation
    if (nextUserReaction) {
      setReactionBurst(nextUserReaction);
      setTimeout(() => setReactionBurst(null), 1200);
    }

    setReactions((current) => {
      const updated = { ...current };
      if (prev && prev !== type) {
        updated[prev] = Math.max(0, (updated[prev] || 0) - 1);
      }
      if (isTogglingOff) {
        updated[type] = Math.max(0, (updated[type] || 0) - 1);
      } else {
        updated[type] = (updated[type] || 0) + 1;
      }
      return updated;
    });

    if (type === 'like' || prev === 'like') {
      const nextLiked = !isTogglingOff && nextUserReaction === 'like';
      setHasLiked(nextLiked);
      setLikes((curr) => {
        if (type === 'like') {
          return isTogglingOff ? Math.max(0, curr - 1) : curr + 1;
        } else if (prev === 'like') {
          return Math.max(0, curr - 1);
        }
        return curr;
      });
    }

    await updateArticleReaction(article.id, type, reactions, prev);
  };

  const handleLike = async () => {
    await handleReaction('like');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorDisplayName = user?.displayName || guestName.trim() || 'पाठक';
    const authorUid = user?.uid || `reader_${Date.now()}`;

    setIsSubmittingComment(true);
    setCommentNotice(null);
    try {
      const added = await postComment(
        article.id,
        newComment.trim(),
        {
          uid: authorUid,
          name: authorDisplayName,
          email: user?.email || undefined,
          photoURL: user?.photoURL || undefined,
        }
      );
      setComments([added, ...comments]);
      setNewComment('');
      setGuestName('');
      setCommentNotice({ text: 'आपका कमेंट सफलतापूर्वक दर्ज हो गया है!', isError: false });
      setTimeout(() => setCommentNotice(null), 4000);
    } catch (err) {
      console.error('Failed to post comment:', err);
      setCommentNotice({ text: 'कमेंट पोस्ट करने में समस्या हुई। कृपया पुनः प्रयास करें।', isError: true });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const existing = localStorage.getItem('kd_subscribers');
      const list = existing ? JSON.parse(existing) : [];
      if (!list.some((s: any) => s.email?.toLowerCase() === newsletterEmail.trim().toLowerCase())) {
        list.push({
          id: `sub_${Date.now()}`,
          email: newsletterEmail.trim(),
          status: 'active',
          source: 'sidebar',
          subscribedAt: new Date().toISOString(),
        });
        localStorage.setItem('kd_subscribers', JSON.stringify(list));
      }
    } catch {}
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4000);
  };

  const handleVotePoll = (option: 'A' | 'B') => {
    if (pollVoted) return;
    setPollVoted(option);
    if (option === 'A') {
      setPollPercentages({ a: 76, b: 24 });
    } else {
      setPollPercentages({ a: 71, b: 29 });
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://khabridost.com';
  const shareTitle = encodeURIComponent(`${article.title} - Khabri Dost`);
  const shareUrl = encodeURIComponent(currentUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || article.title,
          url: currentUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Font size multiplier
  const contentFontSizeClass = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-loose',
    xlarge: 'text-xl sm:text-2xl leading-loose',
  }[fontSize];

  // Admin option changer for related articles count (3, 4, 6, etc.)
  const handleSetRelatedCount = (count: number) => {
    setAdminRelatedCount(count);
    if (onUpdateSettings) {
      onUpdateSettings({
        ...portalSettings,
        sidebarWidgets: {
          ...sidebarWidgets,
          relatedArticlesCount: count,
        },
      });
    }
  };

  // Strictly prioritize articles from the SAME CATEGORY as currently active article
  const sameCategoryArticles = allArticles.filter(
    (a) => a.id !== article.id && (a.category?.toLowerCase() === article.category?.toLowerCase())
  );
  // Graceful backfill from other articles if current category has fewer stories
  const otherCategoryArticles = allArticles.filter(
    (a) => a.id !== article.id && (a.category?.toLowerCase() !== article.category?.toLowerCase())
  );
  const relatedArticles = [
    ...sameCategoryArticles,
    ...otherCategoryArticles,
  ].slice(0, adminRelatedCount);

  const handleDownloadArticlePdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await generateArticlePdf(article, portalSettings);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Trending Sidebar articles filtered by admin category & count settings
  const trendingCategory = sidebarWidgets.trendingCategoryFilter || 'all';
  let filteredTrending = allArticles.filter((a) => a.id !== article.id);
  if (trendingCategory !== 'all') {
    filteredTrending = filteredTrending.filter(
      (a) => a.category?.trim().toLowerCase() === trendingCategory.trim().toLowerCase()
    );
  }
  filteredTrending.sort((a, b) => b.viewsCount - a.viewsCount);
  const trendingCount = sidebarWidgets.trendingStoriesCount || 5;
  const trendingSidebarArticles = (
    filteredTrending.length > 0 ? filteredTrending : allArticles.filter((a) => a.id !== article.id)
  ).slice(0, trendingCount);

  // Auto-slide timer for Trending Stories (Vertical bottom-to-top auto sliding)
  const isTrendingSliderEnabled = sidebarWidgets.trendingSliderEnabled !== false;
  const trendingSlideSpeed = sidebarWidgets.trendingSlideSpeed || 3500;

  useEffect(() => {
    if (!isTrendingSliderEnabled || isTrendingHovered || trendingSidebarArticles.length <= 1) return;
    const interval = setInterval(() => {
      setTrendingSlideIndex((prev) => (prev + 1) % trendingSidebarArticles.length);
    }, trendingSlideSpeed);
    return () => clearInterval(interval);
  }, [isTrendingSliderEnabled, isTrendingHovered, trendingSidebarArticles.length, trendingSlideSpeed]);

  const editorPickArticles = [...allArticles]
    .filter((a) => a.id !== article.id && (a.isEditorsPick || a.isTopStory))
    .slice(0, 3);

  // Helper to format full Hindi/English date and time
  const formatArticleDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const months = [
        'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
        'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
      ];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm} IST`;
    } catch {
      return isoString;
    }
  };

  const paragraphs = splitArticleContent(article.content);
  const midPoint = Math.max(1, Math.floor(paragraphs.length / 2));

  // Helper to render rich markdown and embeds (YouTube, Twitter/X, Images, Fact Check, Callouts) in paragraphs
  const renderFormattedParagraph = (text: string, key: React.Key) => {
    return renderArticleBlock(text, key, contentFontSizeClass);
  };

  /* ICON-ONLY SOCIAL SHARING BAR AS REQUESTED BY USER:
     "social share wale button sirf social icons use karo"
  */
  /* ICON-ONLY SOCIAL SHARING BAR AS REQUESTED BY USER:
     "social share wale button sirf social icons use karo"
  */
  const renderSocialIconButtons = () => {
    const showWhatsapp = portalSettings.sharePlatforms?.whatsapp ?? true;
    const showTelegram = portalSettings.sharePlatforms?.telegram ?? true;
    const showTwitter = portalSettings.sharePlatforms?.twitter ?? true;
    const showFacebook = portalSettings.sharePlatforms?.facebook ?? true;
    const showCopyLink = portalSettings.sharePlatforms?.copyLink ?? true;

    return (
      <div className="flex items-center space-x-2 py-1.5 flex-wrap gap-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-kd-meta mr-1">
          Share:
        </span>

        {/* Mobile Single Share Button */}
        <button
          onClick={handleNativeShare}
          className="sm:hidden flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
          title="Share Article"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* WhatsApp Icon */}
        {showWhatsapp && (
          <a
            href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on WhatsApp"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-90 text-white flex items-center justify-center shadow-xs hover:scale-110 transition duration-200"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        )}

        {/* Telegram Icon */}
        {showTelegram && (
          <a
            href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Telegram"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0088cc] hover:bg-[#0077b5] active:scale-90 text-white flex items-center justify-center shadow-xs hover:scale-110 transition duration-200"
          >
            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
        )}

        {/* X / Twitter Icon */}
        {showTwitter && (
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on X"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black hover:bg-neutral-800 active:scale-90 text-white flex items-center justify-center shadow-xs hover:scale-110 transition duration-200"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        )}

        {/* Facebook Icon */}
        {showFacebook && (
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Facebook"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-90 text-white flex items-center justify-center shadow-xs hover:scale-110 transition duration-200"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        )}

        {/* Copy Link Icon */}
        {showCopyLink && (
          <button
            onClick={handleCopyLink}
            title={copiedLink ? 'Link Copied!' : 'Copy Link'}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-xs hover:scale-110 active:scale-90 transition duration-200 cursor-pointer ${
              copiedLink ? 'bg-emerald-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    );
  };



  return (
    <article
      onTouchStart={handleArticleTouchStart}
      onTouchEnd={handleArticleTouchEnd}
      className="min-h-screen bg-slate-50/70 pb-28 sm:pb-16 relative"
    >
      {/* 0. DYNAMIC TOP READING PROGRESS BAR (Controlled by Admin) */}
      {sidebarWidgets.showReadingProgressBar !== false && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-200/60 z-50 pointer-events-none">
          <div
            className="h-full bg-red-600 shadow-sm transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* 0.1 DESKTOP STICKY MINI READING HEADER (Visible on Desktop when Scrolled Down) */}
      {isScrolledPastHero && (
        <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md px-4 lg:px-8 py-2 items-center justify-between transition-all duration-200 animate-in fade-in slide-in-from-top-2 font-kd-body">
          {/* Left: Home Return + Category Pill + Truncated Article Title */}
          <div className="flex items-center space-x-3 min-w-0 flex-1 mr-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-1 text-slate-700 hover:text-red-600 font-bold text-xs shrink-0 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition font-kd-meta"
              title="होमपेज पर वापस जाएं"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>होम</span>
            </button>

            <span className="w-px h-4 bg-slate-200 shrink-0" />

            <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 font-kd-meta">
              {CATEGORIES.find((c) => c.id === article.category)?.labelHindi || article.category}
            </span>

            <p className="font-kd-headline font-bold text-slate-900 text-sm truncate max-w-xl">
              {article.title}
            </p>
          </div>

          {/* Right: Progress % + Font Size Controls + Audio + Share + Next Story */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Reading Progress Pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              <span>{readingProgress}%</span>
            </div>

            {/* Font resize buttons */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleUpdateReaderFontSize(Math.max(14, readerFontSize - 1))}
                className="px-2 py-0.5 rounded text-slate-700 hover:bg-white font-bold cursor-pointer transition"
                title="फ़ॉन्ट छोटा करें (A-)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleUpdateReaderFontSize(Math.min(26, readerFontSize + 1))}
                className="px-2 py-0.5 rounded text-slate-700 hover:bg-white font-bold cursor-pointer transition"
                title="फ़ॉन्ट बड़ा करें (A+)"
              >
                A+
              </button>
            </div>

            {/* Listen Audio Button */}
            <button
              type="button"
              onClick={handleSpeechToggle}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                showAudioPlayer
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="खबर सुनें (Listen Audio)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{showAudioPlayer ? 'बंद करें' : 'सुनें'}</span>
            </button>

            {/* Quick WhatsApp Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-xs transition"
              title="WhatsApp पर शेयर करें"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>

            {/* Quick Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition cursor-pointer ${
                copiedLink ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={copiedLink ? 'लिंक कॉपी हो गया!' : 'लिंक कॉपी करें'}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
            </button>

            {/* Next Article Shortcut */}
            {nextArticle && (
              <button
                type="button"
                onClick={() => onSelectArticle(nextArticle)}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ml-1"
                title={`अगली खबर: ${nextArticle.title}`}
              >
                <span className="hidden xl:inline">अगली खबर</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 0.2 MOBILE TOUCH SWIPE FEEDBACK TOAST */}
      {swipeGestureFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[240px] font-medium">{swipeGestureFeedback}</span>
        </div>
      )}

      {/* 0.3 MOBILE FLOATING WHATSAPP SHARE PILL (ONE-TAP CONVENIENCE) */}
      {isScrolledPastHero && (
        <a
          href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden fixed bottom-20 right-4 z-40 bg-[#25D366] hover:bg-[#20ba59] active:scale-90 text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white transition-all animate-in fade-in slide-in-from-bottom-3"
          title="WhatsApp पर शेयर करें"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="text-xs font-bold font-kd-meta">शेयर करें</span>
        </a>
      )}

      {/* 1. TOP BREADCRUMB */}
      <div className="bg-white border-b border-slate-200 py-2.5 shadow-2xs sticky top-[102px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600 font-kd-meta min-w-0 truncate">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-1 font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Home</span>
            </button>
            <span className="shrink-0">/</span>
            <span className="font-bold text-slate-800 uppercase shrink-0">
              {CATEGORIES.find((c) => c.id === article.category)?.labelEnglish || article.category}
            </span>
            <span className="shrink-0 hidden sm:inline">/</span>
            <span className="text-slate-500 font-mono text-xs truncate max-w-xs sm:max-w-md hidden sm:inline">
              {getEnglishArticleSlug(article)}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(article)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer shadow-2xs ${
                isBookmarked
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Saved in Bookmarks' : 'Save Story'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP ADVERTISEMENT */}
      {portalSettings.adSettings.showTopAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <AdBanner
            slot="leaderboard"
            type={portalSettings.adSettings.topAdType}
            privateBannerUrl={portalSettings.adSettings.privateBannerUrl}
            privateBannerLink={portalSettings.adSettings.privateBannerLink}
            privateBannerTitle={portalSettings.adSettings.privateBannerTitle}
            breakpoints={portalSettings.adSettings.responsiveBreakpoints?.leaderboard}
          />
        </div>
      )}

      {/* MAIN TWO-COLUMN ARTICLE PAGE BODY */}
      <div className={`${containerMaxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-w-0`}>
        {/* LEFT COLUMN: ARTICLE CONTENT (COLS - Dynamic Admin Width Slider) */}
        <div
          style={{ maxWidth: contentContainerWidthPx ? `${contentContainerWidthPx}px` : undefined }}
          className={`${contentColumnClass} min-w-0 w-full bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 sm:space-y-5 article-content-container`}
        >
          {/* ADMIN IN-PLACE CUSTOMIZER BAR (STRICTLY VISIBLE ONLY TO AUTHENTICATED ADMIN) */}
          {isAdmin && onOpenAdminSettings && (
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-3 rounded-xl border border-red-700/60 shadow-md flex items-center justify-between flex-wrap gap-2 text-xs font-kd-meta mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-amber-300">Admin Live Studio:</span>
                <span className="text-slate-300 hidden sm:inline">Title, Meta, Author & Widgets Settings</span>
              </div>
              <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                <button
                  onClick={() => onOpenAdminSettings('articlemeta')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Meta & Author Settings"
                >
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>Meta & Author</span>
                </button>
                {onUpdateSettings && (
                  <button
                    type="button"
                    onClick={handleToggleAuthorBox}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                      isAuthorBoxVisible
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700/60'
                        : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-700/60'
                    }`}
                    title={isAuthorBoxVisible ? 'लेखक परिचय बॉक्स छिपाएं (Hide Author Box)' : 'लेखक परिचय बॉक्स दिखाएं (Enable Author Box)'}
                  >
                    <span>लेखक बॉक्स: {isAuthorBoxVisible ? 'ON ✓' : 'OFF ✕'}</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenAdminSettings('sidebar_widgets')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Widgets & Sidebar Settings"
                >
                  <Layout className="w-3 h-3 text-sky-400" />
                  <span>Widgets & Sidebar</span>
                </button>
                <button
                  onClick={() => onOpenAdminSettings('typography')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Font & Body Typography"
                >
                  <Type className="w-3 h-3 text-rose-400" />
                  <span>Typography</span>
                </button>
                {onEditArticle && (
                  <button
                    onClick={() => onEditArticle(article)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs flex items-center space-x-1 cursor-pointer"
                    title="Edit This Article"
                  >
                    <PenTool className="w-3.5 h-3.5 text-white" />
                    <span>Edit Article</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. Strip Above Heading: Category & [A- A+, Save, PDF, Views Counter] */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs font-kd-meta flex-wrap min-w-0">
            {/* Left: Category Badge + Mobile Location & Time (Hidden on Desktop by default) */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 min-w-0">
              {articlePageConfig.showCategoryBadge !== false && (
                <span className="bg-red-600 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs shrink-0">
                  {article.category}
                </span>
              )}

              {/* Location: Hidden on desktop as requested, shown on mobile if enabled */}
              {article.location && articlePageConfig.showLocationTag !== false && metaSettings.showLocationBadge !== false && (
                <span className={`text-[11px] sm:text-xs text-slate-600 items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded-md ${metaSettings.showDesktopLocationTime ? 'flex' : 'flex sm:hidden'}`}>
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  <span>{article.location}</span>
                </span>
              )}

              {/* Relative Time: Hidden on desktop as requested, shown on mobile if enabled */}
              {(metaSettings.showPublishDate || metaSettings.showRelativeTime) && (
                <span className={`text-[11px] sm:text-xs text-slate-500 items-center space-x-1 ${metaSettings.showDesktopLocationTime ? 'flex' : 'flex sm:hidden'}`}>
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{formatHindiTimeAgo(article.createdAt)}</span>
                </span>
              )}
            </div>

            {/* Right (Above Heading): A- A+, Save, PDF, and Views Counter (All Admin Toggleable) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* 1. Font Size Control (A- / A+) */}
              {metaSettings.showFontSizeControl !== false && articlePageConfig.showFontSizeControls !== false && (
                <div className="inline-flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleUpdateReaderFontSize(readerFontSize - 1)}
                    disabled={readerFontSize <= 14}
                    className="px-1.5 py-0.5 text-xs font-bold text-slate-600 hover:text-red-600 rounded disabled:opacity-30 cursor-pointer"
                    title="Font छोटा करें (A-)"
                  >
                    A-
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-500 px-1 border-x border-slate-100 select-none">
                    {readerFontSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateReaderFontSize(readerFontSize + 1)}
                    disabled={readerFontSize >= 24}
                    className="px-1.5 py-0.5 text-xs font-bold text-slate-600 hover:text-red-600 rounded disabled:opacity-30 cursor-pointer"
                    title="Font बड़ा करें (A+)"
                  >
                    A+
                  </button>
                </div>
              )}

              {/* 2. Save Button */}
              {metaSettings.showBookmarkButton !== false && (
                <button
                  type="button"
                  onClick={() => onToggleBookmark(article)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer border shadow-2xs ${
                    isBookmarked
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={isBookmarked ? 'Saved in Bookmarks' : 'Save Story'}
                >
                  <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-white' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              )}

              {/* 3. PDF Download Button */}
              {metaSettings.showPdfButton !== false && articlePageConfig.showPrintPdf !== false && (
                <button
                  type="button"
                  onClick={handleDownloadArticlePdf}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-60"
                  title="Download Article PDF"
                >
                  <Download className="w-3 h-3 text-red-600" />
                  <span>PDF</span>
                </button>
              )}

              {/* 4. Views Counter (e.g., 5355 Reads) */}
              {metaSettings.showViewsCount !== false && articlePageConfig.showViewCount !== false && (
                <span className="text-[11px] sm:text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0" title="कुल पाठक संख्या">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{article.viewsCount} Reads</span>
                </span>
              )}
            </div>
          </div>

          {/* 2. Headline (Clean, prominent news headline) */}
          <div className="relative group/h1">
            {isEditingTitle && isAdmin ? (
              <div className="space-y-2.5 bg-amber-50/80 p-4 rounded-xl border-2 border-amber-400 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-amber-700" />
                    <span>Admin Inline Headline Editor</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-normal">Instant live update on page</span>
                </div>
                <textarea
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  rows={2}
                  className="w-full text-lg sm:text-2xl font-bold font-kd-headline text-slate-900 p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInlineTitle(article.title);
                      setIsEditingTitle(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInlineTitle}
                    disabled={isSavingTitle || !inlineTitle.trim()}
                    className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition cursor-pointer shadow-xs flex items-center space-x-1"
                  >
                    {isSavingTitle ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Headline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-w-0 w-full">
                <h1
                  style={{
                    fontSize:
                      articlePageConfig.h1FontSize === 'large'
                        ? `clamp(${portalSettings.typography?.articleTitleMobilePx || 24}px, 4.2vw, ${(portalSettings.typography?.articleTitleDesktopPx || 32) + 4}px)`
                        : articlePageConfig.h1FontSize === 'xlarge'
                        ? `clamp(${portalSettings.typography?.articleTitleMobilePx || 26}px, 4.6vw, ${(portalSettings.typography?.articleTitleDesktopPx || 32) + 8}px)`
                        : `clamp(${portalSettings.typography?.articleTitleMobilePx || 22}px, 3.8vw, ${portalSettings.typography?.articleTitleDesktopPx || 32}px)`,
                    fontFamily: h1FontFamily,
                    fontWeight: h1FontWeight,
                    lineHeight: sectionH1?.lineHeight || 1.28,
                    letterSpacing: sectionH1?.letterSpacingPx ? `${sectionH1.letterSpacingPx}px` : undefined,
                    textTransform: sectionH1?.textTransform || 'none',
                    overflowWrap: 'anywhere',
                    wordBreak: 'normal',
                  }}
                  className="text-slate-900 tracking-tight [overflow-wrap:anywhere] [word-break:normal] min-w-0 transition-all duration-150"
                >
                  {renderStyledHeadline(
                    inlineTitle || article.title,
                    article.headlineHighlight,
                    article.highlightColor || portalSettings?.headlineStyling?.defaultColor || '#dc2626'
                  )}
                </h1>
                {article.subtitle && (
                  <p
                    style={{
                      overflowWrap: 'anywhere',
                      wordBreak: 'normal',
                    }}
                    className="mt-2 text-base sm:text-lg font-semibold text-slate-700 leading-snug [overflow-wrap:anywhere] [word-break:normal] font-kd-body"
                  >
                    {article.subtitle}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md transition cursor-pointer shadow-2xs"
                      title="Click to edit headline instantly on page"
                    >
                      <PenTool className="w-3 h-3 text-red-600" />
                      <span>Edit Headline</span>
                    </button>
                    {titleSaveSuccess && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-fadeIn">
                        ✓ Updated!
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>



          {/* 4. Subtitle / Summary (Lead Story Paragraph) */}
          {article.summary && (
            <p
              style={{
                fontSize: portalSettings.typography?.articleLeadSubtitlePx
                  ? `${portalSettings.typography.articleLeadSubtitlePx}px`
                  : undefined,
                overflowWrap: 'anywhere',
                wordBreak: 'normal',
              }}
              className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed font-kd-body border-l-3 border-red-600 pl-3 py-0.5 bg-slate-50/60 rounded-r-lg [overflow-wrap:anywhere] [word-break:normal] min-w-0"
            >
              {article.summary}
            </p>
          )}

          {/* 4.5. Featured Image & Multi-Image Sliding Carousel (Placed before Byline & Key Highlights) */}
          <div className="space-y-1.5 my-3.5">
            <div
              className="relative rounded-xl overflow-hidden aspect-[16/9] bg-slate-950 border border-slate-200 shadow-xs group select-none"
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  featureImageTouchStartXRef.current = e.touches[0].clientX;
                }
              }}
              onTouchEnd={(e) => {
                if (featureImageTouchStartXRef.current === null || e.changedTouches.length === 0) return;
                const deltaX = e.changedTouches[0].clientX - featureImageTouchStartXRef.current;
                if (Math.abs(deltaX) > 40) {
                  if (deltaX < 0) {
                    handleNextFeatureImage();
                  } else {
                    handlePrevFeatureImage();
                  }
                }
                featureImageTouchStartXRef.current = null;
              }}
            >
              <img
                key={allFeatureImages[activeFeatureImageIdx]}
                src={allFeatureImages[activeFeatureImageIdx]}
                alt={article.imageAltText || `${article.title} - फ़ोटो ${activeFeatureImageIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                decoding="async"
              />

              {/* Multi-Image Controls & Slider Indicators */}
              {allFeatureImages.length > 1 && (
                <>
                  {/* Photo Counter Badge */}
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center space-x-1.5 font-kd-meta z-10 pointer-events-none">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeFeatureImageIdx + 1} / {allFeatureImages.length}</span>
                  </div>

                  {/* Previous Slide Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevFeatureImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-xs border border-white/20 shadow-md cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100 z-10 active:scale-95"
                    title="पिछली तस्वीर (Previous Image)"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* Next Slide Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextFeatureImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-xs border border-white/20 shadow-md cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100 z-10 active:scale-95"
                    title="अगली तस्वीर (Next Image)"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* Slide Dots Indicator */}
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center space-x-1.5 z-10 pointer-events-auto">
                    {allFeatureImages.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFeatureImageIdx(dotIdx);
                        }}
                        className={`transition-all rounded-full cursor-pointer ${
                          activeFeatureImageIdx === dotIdx
                            ? 'w-6 h-2 bg-red-600 shadow-xs'
                            : 'w-2 h-2 bg-white/70 hover:bg-white'
                        }`}
                        title={`तस्वीर ${dotIdx + 1} पर जाएं`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Image Caption */}
            {articlePageConfig.showImageCaption !== false && currentFeatureCaption && (
              <p className="text-xs text-slate-500 italic text-center font-kd-meta">
                फोटो: {currentFeatureCaption}
              </p>
            )}
          </div>

          {/* 5. Sleek Editorial Byline & Action Strip (Division 1 - Top Indian News Style) */}
          <div className="border-y border-slate-200/90 py-2.5 sm:py-3 my-4 font-kd-meta">
            {/* MOBILE LAYOUT (Editorial 2-Row Clean Strip) */}
            <div className="sm:hidden space-y-2.5">
              {/* Row 1: Author, City / Bureau & Relative Time */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center space-x-2.5 min-w-0">
                  {metaSettings.showAuthorAvatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs aspect-square flex items-center justify-center relative">
                      <img
                        src={article.authorPhotoUrl || getAuthorPhoto(article.authorName)}
                        alt={article.authorName}
                        className="w-full h-full object-cover object-center aspect-square rounded-full block"
                      />
                    </div>
                  )}
                  <div className="min-w-0 leading-tight">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      {articlePageConfig.showAuthorByline !== false && metaSettings.showAuthorName !== false && (
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {article.authorName}
                        </span>
                      )}
                      {articlePageConfig.showEditorByline !== false && article.editorName && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          · संपा: {article.editorName}
                        </span>
                      )}
                    </div>
                    {articlePageConfig.showRelativeTime !== false && (
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatHindiTimeAgo(article.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Mobile Action Buttons [Audio + WhatsApp + Facebook + Share] */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {/* 1. Audio Listen */}
                {metaSettings.showListenButton !== false && articlePageConfig.showAudioListen !== false && (
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    className={`inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border shadow-2xs mr-auto ${
                      showAudioPlayer
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                    title={showAudioPlayer ? 'ऑडियो बंद करें' : 'खबर सुनें'}
                  >
                    {showAudioPlayer ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>ऑडियो बंद</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>खबर सुनें</span>
                      </>
                    )}
                  </button>
                )}

                {/* 2. WhatsApp (Simple round official icon) */}
                {metaSettings.platforms?.whatsapp !== false && (
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-2xs transition shrink-0"
                    title="WhatsApp पर शेयर करें"
                    aria-label="WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                )}

                {/* 3. Facebook (Simple round official icon) */}
                {metaSettings.platforms?.facebook !== false && (
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white flex items-center justify-center shadow-2xs transition shrink-0"
                    title="Facebook पर शेयर करें"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}

                {/* 4. Simple Share Button */}
                {metaSettings.showNativeShare !== false && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
                    title="खबर शेयर करें"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4 text-red-600 shrink-0" />
                  </button>
                )}
              </div>
            </div>

            {/* DESKTOP LAYOUT (Clean Single Horizontal Line like The Hindu / Bhaskar) */}
            <div className="hidden sm:flex items-center justify-between gap-3 min-w-0">
              {/* Left: Author Info */}
              <div className="flex items-center space-x-3 min-w-0">
                {metaSettings.showAuthorAvatar && (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs aspect-square flex items-center justify-center relative">
                    <img
                      src={article.authorPhotoUrl || getAuthorPhoto(article.authorName)}
                      alt={article.authorName}
                      className="w-full h-full object-cover object-center aspect-square rounded-full block"
                    />
                  </div>
                )}
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center space-x-2 flex-wrap min-w-0">
                    {articlePageConfig.showAuthorByline !== false && metaSettings.showAuthorName !== false && (
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {article.authorName}
                      </span>
                    )}
                    {articlePageConfig.showEditorByline !== false && article.editorName && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        · संपा: {article.editorName}
                      </span>
                    )}
                  </div>
                  {articlePageConfig.showPublishedDate !== false && metaSettings.showPublishDate !== false && (
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatArticleDateTime(article.createdAt)}</span>
                      </div>
                      {articlePageConfig.showReadingTime !== false && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1 text-slate-500" title="अनुमानित पढ़ने का समय">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{estimatedReadTimeMinutes} मिनट पढ़ने का समय</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions Row [Audio Listen | Simple Share | WhatsApp | Facebook | Twitter | Copy Link] */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* 1. Audio Listen */}
                {metaSettings.showListenButton !== false && (
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      showAudioPlayer
                        ? 'bg-red-600 text-white border-red-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    title={showAudioPlayer ? 'ऑडियो बंद करें' : 'खबर सुनें (Audio Bulletin)'}
                  >
                    {showAudioPlayer ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-white" />
                        <span>ऑडियो ON</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-red-600" />
                        <span>सुनें</span>
                      </>
                    )}
                  </button>
                )}

                {/* 3. Social Media Buttons Strip (WhatsApp, Facebook, Twitter, Copy Link) */}
                {metaSettings.showSocialIcons !== false && (
                  <div className="inline-flex items-center space-x-1.5 pl-1.5 border-l border-slate-200">
                    {/* WhatsApp */}
                    {metaSettings.platforms?.whatsapp !== false && (
                      <a
                        href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp पर शेयर करें"
                        className="w-7 h-7 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-2xs"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    )}

                    {/* Facebook */}
                    {metaSettings.platforms?.facebook !== false && (
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Facebook पर शेयर करें"
                        className="w-7 h-7 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-2xs"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}

                    {/* Twitter / X */}
                    {metaSettings.platforms?.twitter !== false && (
                      <a
                        href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="X (Twitter) पर शेयर करें"
                        className="w-7 h-7 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-2xs"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}

                    {/* Copy Link */}
                    {metaSettings.platforms?.copyLink !== false && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        title={copiedLink ? 'Link Copied!' : 'Copy Link'}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer ${
                          copiedLink ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Link2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                )}

                {/* 3. Simple Share Button (Last on Desktop as requested) */}
                {metaSettings.showNativeShare !== false && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer active:scale-95 shadow-2xs"
                    title="खबर शेयर करें (Share)"
                  >
                    <Share2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Share</span>
                  </button>
                )}

                {/* Admin Quick Access */}
                {isAdmin && onOpenAdminSettings && (
                  <button
                    type="button"
                    onClick={() => onOpenAdminSettings('articlemeta')}
                    title="Article Meta Settings"
                    className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AUDIO NEWS PLAYER BAR (Minimalist Audio Bulletin with Hindi TTS) */}
          {showAudioPlayer && (
            <div className="my-2.5">
              <AudioNewsPlayer
                title={article.title}
                textToRead={`${article.title}। ${article.summary ? article.summary + '।' : ''} ${article.content}`}
                isOpen={showAudioPlayer}
                onClose={() => {
                  setShowAudioPlayer(false);
                  stopHindiSpeech();
                }}
              />
            </div>
          )}

          {/* EDITORIAL KEY HIGHLIGHTS (मुख्य बिंदु / 5 खास बातें) */}
          {articlePageConfig.showKeyHighlights !== false && (
            <ArticleKeyHighlights article={article} />
          )}

          {/* Article Full Paragraphs with In-Content Middle Ad */}
          <div
            style={{
              fontSize: `${readerFontSize}px`,
              fontFamily: readerFontFamily,
              lineHeight: readerLineHeight,
              overflowWrap: 'anywhere',
              wordBreak: 'normal',
            }}
            className="space-y-4 text-slate-800 transition-all duration-150 min-w-0 max-w-full article-content-container"
          >
            {paragraphs.slice(0, midPoint).map((p, idx) => renderFormattedParagraph(p, idx))}

            {portalSettings.adSettings.showMidContentAd && (
              <div className="my-6">
                <AdBanner
                  slot="in-content"
                  type="adsense"
                  breakpoints={portalSettings.adSettings.responsiveBreakpoints?.inContent}
                />
              </div>
            )}

            {paragraphs.slice(midPoint).map((p, idx) =>
              renderFormattedParagraph(p, idx + midPoint)
            )}
          </div>

          {/* Article Tags (टैग्स - Admin Publish Article से मैचिंग) */}
          {articlePageConfig.showTags !== false && article.tags && article.tags.length > 0 && (
            <div className="pt-2 pb-1 flex flex-wrap items-center gap-1.5 font-kd-meta">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-red-600" />
                <span>टैग्स:</span>
              </span>
              {article.tags.map((tag, idx) => {
                const cleanTag = tag.replace(/^#/, '');
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 px-2.5 py-1 rounded-full border border-slate-200 transition font-medium cursor-pointer"
                  >
                    #{cleanTag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Post-Content Disclaimer Section (सूचना / अस्वीकरण - Fully Admin Customizable) */}
          {articlePageConfig.showDisclaimerBox !== false && (
            <div className="my-4 p-3 sm:p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 font-kd-meta leading-relaxed shadow-2xs flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5 text-amber-700">
                <Info className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div className="space-y-0.5">
                <span
                  className="font-bold text-amber-900 block"
                  style={{ fontSize: articlePageConfig.disclaimerFontSize || '12px' }}
                >
                  सूचना / अस्वीकरण (Disclaimer):
                </span>
                <p
                  className="text-amber-900/90 leading-relaxed font-normal"
                  style={{ fontSize: articlePageConfig.disclaimerFontSize || '12px' }}
                >
                  {articlePageConfig.disclaimerText ||
                    "'खबरी दोस्त' पर मौजूद सभी समाचार सामग्री कंप्यूटर द्वारा तैयार की गई है और इसे थर्ड पार्टी तथा सोशल मीडिया से लिया गया है। चूंकि यह सामग्री केवल जानकारी देने के उद्देश्य से उपलब्ध कराई गई है, इसलिए कृपया इसे पूरी सावधानी के साथ पढ़ें। किसी भी तरह की समस्या उत्पन्न होने पर 'खबरी दोस्त' जिम्मेदार नहीं होगा।"}
                </p>
              </div>
            </div>
          )}

          {/* AUTHOR DETAILS SECTION: Horizontal layout with rounded author image on left, author's name & bio paragraph on right */}
          {isAuthorBoxVisible ? (
            <div className="border border-slate-200/90 bg-white rounded-2xl p-4 sm:p-5 my-5 shadow-2xs font-kd-body">
              <div className="flex flex-row items-center sm:items-start gap-3.5 sm:gap-4 md:gap-5 min-w-0">
                {/* Left side: Strictly Rounded Author Image (Square Cropped Container -> Round Shape) */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border-2 border-slate-200 shadow-2xs flex items-center justify-center relative">
                  <img
                    src={article.authorPhotoUrl || getAuthorPhoto(article.authorName)}
                    alt={article.authorName}
                    className="w-full h-full object-cover object-center aspect-square rounded-full block"
                    loading="lazy"
                  />
                </div>

                {/* Right side: Author Name & Bio Paragraph */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg font-kd-headline leading-tight">
                        {article.authorName}
                      </h4>
                      {article.authorRole && (
                        <span className="text-[10px] sm:text-[11px] text-red-700 bg-red-50 border border-red-100 font-semibold px-2 py-0.5 rounded-full font-kd-meta">
                          {article.authorRole}
                        </span>
                      )}
                    </div>

                    {/* Admin In-Place Toggle (Show/Hide Author Details) */}
                    {isAdmin && onUpdateSettings && (
                      <button
                        type="button"
                        onClick={handleToggleAuthorBox}
                        className="text-[10px] sm:text-[11px] font-bold text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition cursor-pointer font-kd-meta flex items-center space-x-1 shadow-2xs shrink-0"
                        title="एडमिन: लेखक विवरण छिपाएं (Hide Author Details)"
                      >
                        <Sliders className="w-3 h-3 text-red-600" />
                        <span>लेखक विवरण: दृश्यमान (Hide)</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-kd-body mt-1 sm:mt-1.5">
                    {article.authorBio ||
                      'खबरी दोस्त के विशेष संवाददाता। राष्ट्रीय, प्रादेशिक और जनहित के मामलों पर निष्पक्ष, सटीक व तथ्यपरक रिपोर्टिंग के प्रति समर्पित।'}
                  </p>
                </div>
              </div>
            </div>
          ) : isAdmin ? (
            /* Admin-only preview box when Author Details are disabled */
            <div className="border border-dashed border-red-300 bg-red-50/50 rounded-2xl p-3.5 sm:p-4 my-5 flex items-center justify-between font-kd-meta text-xs text-red-900 shadow-2xs flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span>
                  <strong>लेखक विवरण (Author Details):</strong> वर्तमान में पाठकों के लिए <em>छिपा हुआ</em> है (Admin Preview)
                </span>
              </div>
              {onUpdateSettings && (
                <button
                  type="button"
                  onClick={handleToggleAuthorBox}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer shadow-2xs"
                  title="लेखक विवरण को पाठकों के लिए सक्रिय करें (Enable Author Details)"
                >
                  लेखक विवरण दिखाएं (Enable)
                </button>
              )}
            </div>
          ) : null}

          {/* 1. CONTENT END QUICK ACTIONS: Follow on Google | Download PDF | WhatsApp Channel | Telegram Channel */}
          {articlePageConfig.showQuickActionsStrip !== false && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 pb-2 border-t border-slate-200 font-kd-meta">
              {/* Google News */}
              <a
                href={portalSettings?.headerFooter?.socialLinks?.googleNews || 'https://news.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs transition active:scale-95"
                title="Google News पर फॉलो करें"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Google News</span>
              </a>

              {/* Download PDF */}
              <button
                type="button"
                onClick={handleDownloadArticlePdf}
                disabled={isDownloadingPdf}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-white hover:bg-red-50/50 border border-slate-200 hover:border-red-200 text-slate-800 hover:text-red-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="खबर को PDF में डाउनलोड करें"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 text-red-600 animate-spin shrink-0" />
                    <span className="truncate">PDF बन रही है...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="truncate">Download PDF</span>
                  </>
                )}
              </button>

              {/* WhatsApp Channel */}
              <a
                href={portalSettings?.headerFooter?.socialLinks?.whatsappChannel || 'https://whatsapp.com/channel/example'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-2xs transition active:scale-95"
                title="WhatsApp चैनल से जुड़ें"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="truncate">WhatsApp चैनल</span>
              </a>

              {/* Telegram Channel */}
              <a
                href={portalSettings?.headerFooter?.socialLinks?.telegramChannel || 'https://t.me/example'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-semibold shadow-2xs transition active:scale-95"
                title="Telegram चैनल से जुड़ें"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="truncate">Telegram चैनल</span>
              </a>
            </div>
          )}

          {/* 2. REACTION EMOJIS: Simple clean emojis (👍, ❤️, 😂, 😲) without any extra text */}
          {articlePageConfig.showReactionsBar !== false && (
            <Reactions
              articleId={article.id}
              initialReactions={reactions}
              userReaction={userReaction}
              onReactionChange={(type, updated) => {
                handleReaction(type);
                if (updated) setReactions(updated);
              }}
            />
          )}

          {/* BOTTOM ADVERTISEMENT */}
          {portalSettings.adSettings.showBottomAd && (
            <div className="pt-2">
              <AdBanner
                slot="bottom"
                type="adsense"
                breakpoints={portalSettings.adSettings.responsiveBreakpoints?.bottom}
              />
            </div>
          )}

          {/* 3. SIMPLIFIED COMMENTS SECTION (Desktop & Mobile) */}
          {(articlePageConfig.showCommentsSection !== false && sidebarWidgets.showCommentsSection !== false) && (
            <div className="border-t border-slate-200 pt-5 space-y-3 font-kd-body">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-kd-headline text-base sm:text-lg text-slate-900 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-red-600" />
                  <span>Comments ({comments.length})</span>
                </h3>
                {!user && (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Google से साइन-इन
                  </button>
                )}
              </div>

              {/* Status Notice */}
              {commentNotice && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-medium ${
                    commentNotice.isError
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {commentNotice.text}
                </div>
              )}

              {/* Comment Input Box */}
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                {!user && (
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="आपका नाम (वैकल्पिक)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white transition"
                  />
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="इस खबर पर अपनी राय लिखें..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                />
                <div className="flex justify-between items-center font-kd-meta">
                  <span className="text-[11px] text-slate-500">
                    {user ? `नाम: ${user.displayName}` : guestName ? `नाम: ${guestName}` : 'पाठक'}
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>भेज रहे हैं...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>कमेंट भेजें</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Simplified Comments Stream */}
              <div className="space-y-2 pt-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    अभी कोई कमेंट नहीं है। सबसे पहले अपनी राय साझा करें!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-2.5 sm:p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs sm:text-sm space-y-1 min-w-0">
                      <div className="flex items-center justify-between font-kd-meta min-w-0">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm truncate mr-2">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatHindiTimeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
                        className="text-slate-700 leading-relaxed text-xs sm:text-sm min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
                      >
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RICH INTERACTIVE SIDEBAR WITH MODULAR ADS & OPINION POLL */}
        <aside className={`${sidebarColumnClass} min-w-0 w-full space-y-4 pt-4 lg:pt-0`}>
          {/* Mobile-only section title divider */}
          <div className="lg:hidden flex items-center justify-between pb-2.5 border-b-2 border-red-600/30 font-kd-headline mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                चर्चित व अनुशंसित • Trending & Recommended
              </h3>
            </div>
          </div>

          {/* Admin Quick Controls Bar */}
          {isAdmin && onOpenAdminSettings && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs font-kd-meta">
              <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-red-600" />
                <span>Sidebar Admin Controls</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenAdminSettings('sidebar_ads')}
                  className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded transition cursor-pointer"
                  title="Configure Modular Sidebar Ads"
                >
                  Sidebar Ads 📢
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAdminSettings('sidebar_widgets')}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-bold px-2 py-0.5 rounded transition cursor-pointer"
                  title="Configure Sidebar Widgets"
                >
                  Widgets ⚙
                </button>
              </div>
            </div>
          )}

          {/* 1. TOP ADVERTISEMENT SPACE (MODULAR SLOT 1) */}
          {sidebarAds.topSlot?.enabled !== false && (
            <AdBanner
              slot="sidebar"
              type={sidebarAds.topSlot?.adType || portalSettings.adSettings.sidebarAdType}
              privateBannerUrl={sidebarAds.topSlot?.bannerUrl || portalSettings.adSettings.privateBannerUrl}
              privateBannerLink={sidebarAds.topSlot?.bannerLink || portalSettings.adSettings.privateBannerLink}
              privateBannerTitle={sidebarAds.topSlot?.bannerTitle || portalSettings.adSettings.privateBannerTitle}
              breakpoints={sidebarAds.topSlot?.breakpoints || sidebarAds.globalBreakpoints || portalSettings.adSettings.responsiveBreakpoints?.sidebar}
            />
          )}

          {/* 2. FAST-READ BRIEFS VERTICAL SLIDER (EXACT HOMEPAGE SPOTLIGHT BRIEF TICKER) */}
          {sidebarWidgets.showTrendingNews !== false && (
            <div className="h-[380px] sm:h-[420px] flex flex-col overflow-hidden animate-fadeIn">
              <SpotlightBriefTicker
                articles={trendingSidebarArticles.length > 0 ? trendingSidebarArticles : allArticles}
                config={{
                  title: portalSettings.spotlightLayout?.briefTicker?.title || 'बड़ी सुर्खियां • FAST BRIEFS',
                  slideSpeed: portalSettings.spotlightLayout?.briefTicker?.slideSpeed || 'normal',
                  pauseOnHover: true,
                  showCategoryBadge: true,
                }}
                onSelectArticle={onSelectArticle}
                onOpenSettings={isAdmin && onOpenAdminSettings ? () => onOpenAdminSettings('spotlight') : undefined}
                onViewAllCategory={(cat) => onSelectArticle({ ...article, category: cat as any })}
              />
            </div>
          )}

          {/* TODAY'S GOLD & SILVER RATE WIDGET (Simple & Suitable News Portal Style) */}
          {sidebarWidgets.showGoldRate !== false && (
            <GoldRateWidget
              config={sidebarWidgets}
              isAdmin={isAdmin}
              onOpenAdminSettings={() => onOpenAdminSettings && onOpenAdminSettings('sidebar_widgets')}
            />
          )}

          {/* TODAY'S RASHIFAL WIDGET (Simple & Suitable News Portal Style) */}
          {sidebarWidgets.showRashifal !== false && (
            <RashifalWidget
              config={sidebarWidgets}
              isAdmin={isAdmin}
              onOpenAdminSettings={() => onOpenAdminSettings && onOpenAdminSettings('sidebar_widgets')}
            />
          )}

          {/* 3. MIDDLE ADVERTISEMENT SPACE (MODULAR SLOT 2) */}
          {sidebarAds.middleSlot?.enabled !== false && (
            <AdBanner
              slot="sidebar"
              type={sidebarAds.middleSlot?.adType || portalSettings.adSettings.sidebarAdType}
              privateBannerUrl={sidebarAds.middleSlot?.bannerUrl || portalSettings.adSettings.privateBannerUrl}
              privateBannerLink={sidebarAds.middleSlot?.bannerLink || portalSettings.adSettings.privateBannerLink}
              privateBannerTitle={sidebarAds.middleSlot?.bannerTitle || portalSettings.adSettings.privateBannerTitle}
              breakpoints={sidebarAds.middleSlot?.breakpoints || sidebarAds.globalBreakpoints || portalSettings.adSettings.responsiveBreakpoints?.sidebar}
            />
          )}

          {/* 4. MODULAR OPINION POLL WIDGET WITH MULTIPLE CHOICE & RESULTS PERCENTAGE BAR */}
          {sidebarWidgets.showOpinionPoll !== false && (
            <OpinionPollWidget
              pollId={`poll_${article.id}`}
              question={sidebarWidgets.pollQuestion}
              optionA={sidebarWidgets.pollOptionA}
              optionB={sidebarWidgets.pollOptionB}
              optionC={sidebarWidgets.pollOptionC}
              optionD={sidebarWidgets.pollOptionD}
              isAdmin={isAdmin}
              onOpenAdminSettings={() => onOpenAdminSettings && onOpenAdminSettings('sidebar_widgets')}
            />
          )}

          {/* 5. BOTTOM ADVERTISEMENT SPACE (MODULAR SLOT 3) */}
          {sidebarAds.bottomSlot?.enabled !== false && (
            <AdBanner
              slot="sidebar"
              type={sidebarAds.bottomSlot?.adType || portalSettings.adSettings.sidebarAdType}
              privateBannerUrl={sidebarAds.bottomSlot?.bannerUrl || portalSettings.adSettings.privateBannerUrl}
              privateBannerLink={sidebarAds.bottomSlot?.bannerLink || portalSettings.adSettings.privateBannerLink}
              privateBannerTitle={sidebarAds.bottomSlot?.bannerTitle || portalSettings.adSettings.privateBannerTitle}
              breakpoints={sidebarAds.bottomSlot?.breakpoints || sidebarAds.globalBreakpoints || portalSettings.adSettings.responsiveBreakpoints?.sidebar}
            />
          )}
        </aside>
      </div>

      {/* RELATED ARTICLES SECTION (Admin customizable: category, location, date, buttons, count, mobile layout) */}
      {(articlePageConfig.showRelatedStories !== false && sidebarWidgets.showRelatedStories !== false) && relatedArticles.length > 0 && (
        <section className={`${containerMaxWidthClass} mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8`}>
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-4 sm:space-y-6">
            {/* Header Bar with Admin Count & Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-3.5 border-b-2 border-red-600 gap-2.5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                  <h3
                    style={{
                      fontSize: portalSettings.typography?.relatedHeadingCustomPx
                        ? `${portalSettings.typography.relatedHeadingCustomPx}px`
                        : undefined,
                    }}
                    className="font-black font-kd-headline text-base sm:text-lg text-slate-900 tracking-tight"
                  >
                    {articlePageConfig.relatedHeadingTitle || sidebarWidgets.relatedHeadingTitle || 'यह भी पढ़ें'}
                  </h3>
                  {(articlePageConfig.showRelatedHeadingCategoryBadge ?? sidebarWidgets.showRelatedHeadingCategoryBadge) && (
                    <span
                      style={{
                        fontSize: portalSettings.typography?.relatedCategoryBadgePx
                          ? `${portalSettings.typography.relatedCategoryBadgePx}px`
                          : undefined,
                      }}
                      className="text-[11px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase font-kd-meta"
                    >
                      {article.category}
                    </span>
                  )}
                  {(articlePageConfig.showRelatedHeadingSubtitle ?? sidebarWidgets.showRelatedHeadingSubtitle) && (
                    <span className="text-xs text-slate-500 font-medium font-kd-meta pl-1 hidden sm:inline">
                      {articlePageConfig.relatedHeadingSubtitleText || sidebarWidgets.relatedHeadingSubtitleText || 'अन्य ताज़ा ख़बरें'}
                    </span>
                  )}
                </div>
              </div>

              {/* Admin Option: Quick Count [2, 3, 4, 6, 8, 12, +] & Settings Shortcut */}
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-kd-meta border border-slate-200 self-start sm:self-auto">
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] font-bold text-slate-600 pl-1 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-red-600" />
                      <span>संख्या:</span>
                    </span>
                    {[2, 3, 4, 6, 8, 12].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetRelatedCount(num)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          adminRelatedCount === num
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-200'
                        }`}
                        title={`Show ${num} related articles`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSetRelatedCount(Math.min(24, adminRelatedCount + 1))}
                      className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs border border-slate-200"
                      title="1 और कार्ड बढ़ाएं"
                    >
                      +
                    </button>
                  </div>

                  {onOpenAdminSettings && (
                    <div className="flex items-center space-x-2 pl-2 border-l border-slate-300">
                      <button
                        type="button"
                        onClick={() => onOpenAdminSettings('article_meta')}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-800 underline flex items-center gap-0.5 cursor-pointer"
                        title="कार्ड्स व लेआउट कस्टमाइज़ करें"
                      >
                        कार्ड्स सेटिंग ⚙
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenAdminSettings('typography')}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 underline flex items-center gap-0.5 cursor-pointer"
                        title="कस्टमाइज़ फ़ॉन्ट साइज़"
                      >
                        फ़ॉन्ट ✎
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Grid: tight mobile gap and responsive widths */}
            {(() => {
              const isListMode =
                articlePageConfig.relatedMobileLayout === 'compact_list' ||
                sidebarWidgets.relatedMobileLayout === 'list';
              const isGrid2Mode =
                articlePageConfig.relatedMobileLayout === 'grid_2col' ||
                sidebarWidgets.relatedMobileLayout === 'grid2';

              const cardShowCategory =
                articlePageConfig.relatedCardShowCategory ??
                sidebarWidgets.relatedCardShowCategory ??
                false;
              const cardShowLocation =
                articlePageConfig.relatedCardShowLocation ??
                sidebarWidgets.relatedCardShowLocation ??
                false;
              const cardShowDate =
                articlePageConfig.relatedCardShowDate ??
                sidebarWidgets.relatedCardShowDate ??
                false;
              const cardShowReadMore =
                articlePageConfig.relatedCardShowReadMore ??
                sidebarWidgets.relatedCardShowReadMore ??
                false;

              return (
                <div
                  className={
                    isGrid2Mode
                      ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5'
                      : isListMode
                      ? 'flex flex-col space-y-2.5 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:space-y-0 lg:gap-5'
                      : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${
                          adminRelatedCount === 3 ? '3' : '4'
                        } gap-3 sm:gap-4 lg:gap-5`
                  }
                >
                  {relatedArticles.map((relArt) => {
                    return (
                      <div
                        key={relArt.id}
                        onClick={() => {
                          onSelectArticle(relArt);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`bg-slate-50 hover:bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 hover:border-red-400 hover:shadow-md transition-all duration-200 group cursor-pointer ${
                          isListMode
                            ? 'flex flex-row sm:flex-col justify-between items-center sm:items-stretch p-2 sm:p-0'
                            : 'flex flex-col justify-between'
                        }`}
                      >
                        <div className={isListMode ? 'flex sm:block items-center gap-3 w-full' : 'w-full'}>
                          {sidebarWidgets.relatedCardShowImage !== false && (
                            <div
                              className={`overflow-hidden bg-slate-200 relative shrink-0 ${
                                isListMode
                                  ? 'w-20 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] rounded-lg sm:rounded-none'
                                  : 'aspect-[16/10]'
                              }`}
                            >
                              <img
                                src={relArt.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                                alt={relArt.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              {/* Category Badge on card (Admin toggleable) */}
                              {cardShowCategory && (
                                <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase font-kd-meta shadow-xs">
                                  {relArt.category}
                                </span>
                              )}
                              {/* Location Badge on card (Admin toggleable) */}
                              {cardShowLocation && relArt.location && (
                                <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded font-kd-meta flex items-center space-x-1">
                                  <MapPin className="w-2.5 h-2.5 text-red-400" />
                                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{relArt.location}</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className={isListMode ? 'p-1.5 sm:p-3.5 space-y-1 flex-1 min-w-0' : 'p-3 sm:p-4 space-y-1 sm:space-y-2 flex-1 min-w-0'}>
                            <h4
                              style={{
                                fontSize: portalSettings.typography?.relatedCardTitlePx
                                  ? `${portalSettings.typography.relatedCardTitlePx}px`
                                  : undefined,
                                overflowWrap: 'anywhere',
                                wordBreak: 'normal',
                              }}
                              className="text-xs sm:text-sm font-bold font-kd-headline text-slate-900 group-hover:text-red-700 transition leading-snug line-clamp-2 [overflow-wrap:anywhere] [word-break:normal]"
                            >
                              {relArt.title}
                            </h4>
                            {sidebarWidgets.relatedCardShowSummary !== false && (
                              <p
                                style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
                                className="text-[11px] sm:text-xs text-slate-600 font-kd-body line-clamp-2 leading-relaxed hidden sm:block [overflow-wrap:anywhere] [word-break:normal]"
                              >
                                {relArt.summary || relArt.content.slice(0, 110)}
                              </p>
                            )}
                          </div>
                        </div>

                        {(cardShowDate || cardShowReadMore) && (
                          <div className="px-3 pb-2.5 sm:px-4 sm:pb-3.5 pt-1 border-t border-slate-100 mt-0.5 sm:mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-kd-meta w-full">
                            {cardShowDate ? (
                              <span>{formatHindiTimeAgo(relArt.createdAt)}</span>
                            ) : (
                              <span />
                            )}
                            {cardShowReadMore && (
                              <span className="text-red-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                पढ़ें ➔
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* MOBILE STICKY FLOATING SOCIAL VIRAL SHARE & ADVERTISEMENT BAR (Admin Configurable) */}
      {stickyBarConfig.enabled !== false && !isMobileStickyDismissed && (
        <aside
          aria-label="Mobile Sticky Floating Action & Ad Bar"
          className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 pb-[env(safe-area-inset-bottom)] ${
            stickyBarConfig.autoHideOnFooter !== false && isFooterNear
              ? 'translate-y-full opacity-0 pointer-events-none'
              : 'translate-y-0 opacity-100'
          }`}
        >
          {/* 1. ADVERTISEMENT MODE ONLY */}
          {stickyBarConfig.mode === 'ad' && (
            <div className="px-3 py-1.5 flex items-center justify-between gap-2 min-h-[50px]">
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-300">
                  Ad
                </span>
                <span className="text-[10px] text-slate-500 font-kd-meta truncate max-w-[70px]">
                  {stickyBarConfig.adAltText || 'प्रायोजित'}
                </span>
              </div>

              {stickyBarConfig.adType === 'script' && stickyBarConfig.adScriptCode ? (
                <AdCode
                  code={stickyBarConfig.adScriptCode}
                  className="flex-1 overflow-hidden max-h-[55px] text-center"
                />
              ) : (
                <a
                  href={stickyBarConfig.adTargetUrl || '#contact'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex justify-center items-center overflow-hidden"
                  title={stickyBarConfig.adAltText || 'Sponsored Partner'}
                >
                  <img
                    src={stickyBarConfig.adImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80'}
                    alt={stickyBarConfig.adAltText || 'प्रायोजित विज्ञापन'}
                    className="h-[46px] w-auto max-w-[320px] object-contain rounded shadow-2xs"
                  />
                </a>
              )}

              {stickyBarConfig.dismissible !== false && (
                <button
                  type="button"
                  onClick={() => setIsMobileStickyDismissed(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0 cursor-pointer"
                  title="विज्ञापन बंद करें / Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* 2. DUAL MODE: STACKED AD + SHARING STRIP */}
          {stickyBarConfig.mode === 'both' && (
            <div className="flex flex-col">
              {/* Ad Banner Strip */}
              <div className="px-2.5 py-1 bg-amber-50/50 border-b border-slate-200/60 flex items-center justify-between gap-2 min-h-[44px]">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-100 px-1 rounded border border-amber-300">
                    Ad
                  </span>
                </div>
                {stickyBarConfig.adType === 'script' && stickyBarConfig.adScriptCode ? (
                  <AdCode
                    code={stickyBarConfig.adScriptCode}
                    className="flex-1 overflow-hidden max-h-[44px] text-center"
                  />
                ) : (
                  <a
                    href={stickyBarConfig.adTargetUrl || '#contact'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex justify-center items-center overflow-hidden"
                  >
                    <img
                      src={stickyBarConfig.adImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80'}
                      alt={stickyBarConfig.adAltText || 'प्रायोजित विज्ञापन'}
                      className="h-[38px] w-auto max-w-[280px] object-contain rounded"
                    />
                  </a>
                )}
                {stickyBarConfig.dismissible !== false && (
                  <button
                    type="button"
                    onClick={() => setIsMobileStickyDismissed(true)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 transition shrink-0 cursor-pointer"
                    title="विज्ञापन बंद करें"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Social Sharing Strip */}
              <div className="px-3 py-1.5 flex items-center justify-between gap-1.5">
                <div className="flex items-center space-x-1.5 shrink-0">
                  <Share2 className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  {stickyBarConfig.showShareLabel !== false && (
                    <span className="text-[11px] font-bold text-slate-800 font-kd-meta">
                      Share:
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
                  {(stickyBarConfig.sharePlatforms?.whatsapp ?? true) && (
                    <a
                      href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-90 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs transition"
                      title="WhatsApp पर शेयर करें"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {(stickyBarConfig.sharePlatforms?.telegram ?? true) && (
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-[#0088cc] active:scale-90 text-white flex items-center justify-center shadow-2xs hover:scale-105 transition"
                      title="Telegram पर शेयर करें"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </a>
                  )}

                  {(stickyBarConfig.sharePlatforms?.twitter ?? true) && (
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-slate-950 active:scale-90 text-white flex items-center justify-center shadow-2xs hover:scale-105 transition"
                      title="X पर शेयर करें"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}

                  {(stickyBarConfig.sharePlatforms?.facebook ?? true) && (
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-[#1877F2] active:scale-90 text-white flex items-center justify-center shadow-2xs hover:scale-105 transition"
                      title="Facebook पर शेयर करें"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}

                  {(stickyBarConfig.sharePlatforms?.copyLink ?? true) && (
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-2xs active:scale-90 transition cursor-pointer ${
                        copiedLink ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                      title={copiedLink ? 'लिंक कॉपी हो गया!' : 'लिंक कॉपी करें'}
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-white" /> : <Link2 className="w-3 h-3" />}
                    </button>
                  )}

                  {(stickyBarConfig.sharePlatforms?.nativeShare ?? true) && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                      title="अन्य ऐप्स पर शेयर करें"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. DEFAULT SOCIAL SHARING MODE ONLY */}
          {(stickyBarConfig.mode === 'share' || !stickyBarConfig.mode) && (
            <div className="px-3.5 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 shrink-0">
                <Share2 className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                {stickyBarConfig.showShareLabel !== false && (
                  <span className="text-[11px] font-bold text-slate-800 font-kd-meta">
                    Share:
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* WhatsApp Button */}
                {(stickyBarConfig.sharePlatforms?.whatsapp ?? true) && (
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-90 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs transition"
                    title="WhatsApp पर शेयर करें"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Telegram */}
                {(stickyBarConfig.sharePlatforms?.telegram ?? true) && (
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#0088cc] hover:bg-[#0077b5] active:scale-90 text-white flex items-center justify-center shadow-2xs hover:scale-105 transition duration-150"
                    title="Telegram पर शेयर करें"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                )}

                {/* Twitter / X */}
                {(stickyBarConfig.sharePlatforms?.twitter ?? true) && (
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-slate-950 active:scale-90 text-white flex items-center justify-center shadow-2xs hover:scale-105 transition duration-150"
                    title="X (Twitter) पर शेयर करें"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}

                {/* Facebook */}
                {(stickyBarConfig.sharePlatforms?.facebook ?? true) && (
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#1877F2] active:scale-90 text-white flex items-center justify-center shadow-2xs hover:scale-105 transition duration-150"
                    title="Facebook पर शेयर करें"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}

                {/* Copy Link */}
                {(stickyBarConfig.sharePlatforms?.copyLink ?? true) && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-2xs active:scale-90 transition duration-150 cursor-pointer ${
                      copiedLink ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                    title={copiedLink ? 'लिंक कॉपी हो गया!' : 'लिंक कॉपी करें'}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Link2 className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Native OS Share Drawer */}
                {(stickyBarConfig.sharePlatforms?.nativeShare ?? true) && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center shadow-2xs transition duration-150 cursor-pointer"
                    title="अन्य ऐप्स पर शेयर करें"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Optional User Dismiss Button */}
                {stickyBarConfig.dismissible !== false && (
                  <button
                    type="button"
                    onClick={() => setIsMobileStickyDismissed(true)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer ml-1"
                    title="बार छुपाएं / Hide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* E-PAPER CLIPPING & PRINT / PDF MODAL */}
      {showClippingModal && (
        <ArticleEPaperClippingModal
          article={article}
          portalSettings={portalSettings}
          onClose={() => setShowClippingModal(false)}
        />
      )}

      {/* Temporary, Non-Intrusive 'Link Copied!' Toast Notification */}
      {copiedLink && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/60 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-kd-meta tracking-wide whitespace-nowrap">
            Link Copied! / लिंक कॉपी हो गया!
          </span>
        </div>
      )}
    </article>
  );
};
