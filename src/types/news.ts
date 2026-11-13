export type NewsCategory = 
  | 'all'
  | 'national'
  | 'politics'
  | 'world'
  | 'sports'
  | 'business'
  | 'tech'
  | 'entertainment'
  | 'lifestyle'
  | 'state'
  | 'trending';

export interface TrendingSectionConfig {
  enabled: boolean;
  title: string;
  subTitle: string;
  badgeText?: string;
  displayStyle: 'hero_grid' | 'grid' | 'ranked_list' | 'carousel';
  itemCount: number;
  showRankBadges: boolean;
  showViewCounts: boolean;
  showFireBadge: boolean;
  showCategoryTag?: boolean;
  showReadTime?: boolean;
  showHashtagsBar?: boolean;
  autoTrendingViewsThreshold: number;
}

export interface CategoryItem {
  id: NewsCategory;
  labelHindi: string;
  labelEnglish: string;
  icon?: string;
}

export type ReactionType = 'like' | 'love' | 'funny' | 'surprised' | 'insightful';

export interface ArticleReactions {
  like: number;
  love: number;
  funny: number;
  surprised?: number;
  insightful?: number;
  [key: string]: number | undefined;
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  category: NewsCategory;
  subcategory?: string;
  imageUrl: string;
  galleryImages?: string[];
  galleryCaptions?: string[];
  imageCaption?: string;
  imageAltText?: string;
  imageCredit?: string;
  authorName: string;
  authorEmail?: string;
  authorUid: string;
  authorRole?: string;
  authorPhotoUrl?: string;
  authorBio?: string;
  editorName?: string;
  editorRole?: string;
  reviewerName?: string;
  location: string;
  sourceAttribution?: string;
  isBreaking?: boolean;
  isTopStory?: boolean;
  isPinned?: boolean;
  isEditorsPick?: boolean;
  isTrending?: boolean;
  isSpotlight?: boolean;
  trendingRank?: number;
  status?: 'published' | 'draft' | 'pending_review' | 'scheduled' | 'archived';
  scheduledFor?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeywords?: string;
  secondaryKeywords?: string;
  canonicalUrl?: string;
  urlSlug?: string;
  highlights?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  viewsCount: number;
  likesCount: number;
  reactions?: ArticleReactions;
  readTimeMinutes?: number;
  tags?: string[];
  videoUrl?: string;
  headlineHighlight?: string;
  highlightColor?: string;
  notifySubscribers?: boolean;
  relatedArticleIds?: string[];
  corrections?: Array<{
    date: string;
    text: string;
  }>;
  revisions?: Array<{
    id: string;
    savedAt: string;
    savedBy: string;
    title: string;
    summary: string;
    content: string;
  }>;
  alternateLanguageLinks?: {
    en?: string;
    pa?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt?: string;
  /** When the article first went live (set by editors' Publish or the server scheduler). */
  publishedAt?: string;
  /** 'scheduler' when the server published it on schedule. */
  publishedBy?: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  altText?: string;
  caption?: string;
  type: 'image' | 'banner' | 'infographic' | 'icon';
  category?: string;
  fileSize?: string;
  dimensions?: string;
  uploadedAt: string;
  uploadedBy?: string;
  seoSlug?: string;
  focusKeywords?: string;
  loadingStrategy?: 'lazy' | 'eager';
  aspectRatio?: string;
  tags?: string[];
  usageCount?: number;
  watermarkApplied?: boolean;
  filterStyle?: 'normal' | 'grayscale' | 'contrast' | 'warm' | 'vivid';
  cropPreset?: '16:9' | '4:3' | '1:1' | '3:2' | '21:9' | 'original';
  originalUrl?: string;
  folder?: string; // Hierarchical folder path, e.g. "Hero", "Gallery", "Author Icons", "Hero/Breaking"
  customCategory?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  path: string; // e.g. "hero", "hero/breaking", "gallery", "author-icons"
  parentId?: string | null;
  description?: string;
  color?: string;
  icon?: string;
  isSystem?: boolean;
  createdAt?: string;
}

export type StaffRole =
  | 'super_admin'
  | 'editor'
  | 'sub_editor'
  | 'reporter'
  | 'contributor'
  | 'analyst'
  | 'seo_manager'
  | 'editor_in_chief'
  | 'senior_editor'
  | 'journalist'
  | 'fact_checker';

export interface StaffPermissions {
  canPublishDirectly: boolean; // Direct live publishing vs submit draft for review
  canEditAllArticles: boolean; // Edit any article vs only their own articles
  canDeleteArticles: boolean; // Can delete articles
  canAccessMediaLibrary: boolean; // Upload & manage media
  canAccessSEO: boolean; // Access to Advance SEO Optimization & Sitemap
  canAccessSettings: boolean; // Access website branding & settings
  canManageUsers: boolean; // User management access
  canManageMonetization: boolean; // Ads & banners
  allowedCategories?: NewsCategory[]; // Category restrictions (empty = all)
}

export interface EditorialUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: 'active' | 'suspended' | 'pending';
  photoURL?: string;
  articlesCount: number;
  lastLogin?: string;
  joinedAt: string;
  bio?: string;
  assignedCategories?: NewsCategory[];
  permissions?: StaffPermissions;
  accessPin?: string;
  assignedStates?: string[];
  phone?: string;
  department?: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  slot: 'top_leaderboard' | 'in_article' | 'bottom_banner' | 'sidebar_sticky' | 'mobile_sticky';
  type: 'adsense' | 'private_sponsor' | 'affiliate';
  bannerUrl?: string;
  targetUrl?: string;
  advertiserName?: string;
  impressions: number;
  clicks: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'paused' | 'expired';
  cpmRate?: number;
}

export interface NewsComment {
  id: string;
  articleId: string;
  authorUid: string;
  authorName: string;
  authorEmail?: string;
  authorPhoto?: string;
  content: string;
  likesCount?: number;
  createdAt: string;
}

export interface NewsBookmark {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  articleCategory: string;
  articleImageUrl: string;
  createdAt: string;
}

export interface NewsReadLater {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  articleCategory: string;
  articleImageUrl: string;
  createdAt: string;
  estimatedReadTime?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'reader' | 'reporter' | 'editor' | 'admin';
  createdAt: string;
}

export interface VideoNewsItem {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  isLive?: boolean;
  description?: string;
  caption?: string;
  credit?: string;
  thumbnailAltText?: string;
  videoUrl?: string;
}

export interface DesktopStickyAdConfig {
  enabled: boolean;
  type: 'image' | 'script' | 'adsense';
  imageUrl?: string;
  targetUrl?: string;
  scriptCode?: string;
  title?: string;
  subTitle?: string;
  altText?: string;
  dismissible?: boolean;
  widthPx?: number;
  maxHeightPx?: number;
}

export type BottomNavItemType =
  | 'home'
  | 'latest'
  | 'trending'
  | 'states'
  | 'epaper'
  | 'videos'
  | 'photos'
  | 'games'
  | 'submit_news'
  | 'archive'
  | 'contact'
  | 'about'
  | 'legal'
  | 'complaint'
  | 'category'
  | 'custom_link';

export interface BottomNavItemConfig {
  id: string;
  type: BottomNavItemType;
  label: string;
  icon?: string;
  targetCategory?: string;
  targetUrl?: string;
  openInNewTab?: boolean;
}

export interface MobileBottomNavConfig {
  enabled: boolean;
  activePreset?: string;
  items?: BottomNavItemConfig[];
  fifthItem?: 'epaper' | 'videos' | 'photos' | 'games' | 'submit_news' | 'archive' | 'contact' | 'about' | 'legal' | 'complaint' | 'category' | 'custom_link' | string;
  customLabel?: string;
  customIcon?: string;
  customCategory?: string;
  customUrl?: string;
  openInNewTab?: boolean;
  showLabels?: boolean;
  homeLabel?: string;
  latestLabel?: string;
  trendingLabel?: string;
  statesLabel?: string;
}

export interface HeadlineStylingConfig {
  enabled: boolean;
  defaultColor: string; // e.g. '#dc2626'
  applyToHero: boolean;
  applyToFeatured: boolean;
  applyToCompact: boolean;
}

export interface LinkStylingConfig {
  bodyLinkColor: string; // e.g. '#1e3a8a'
  hoverColor: string; // e.g. '#dc2626'
  underlineBehavior: 'always' | 'hover' | 'none';
  distinctExternal: boolean;
  externalLinkColor?: string; // e.g. '#b91c1c'
}

export interface PhotoStoryItem {
  id: string;
  title: string;
  imageUrl: string;
  photosCount: number;
  location: string;
  category: string;
  caption?: string;
  seoAltText?: string;
}

export interface TypographySectionOverride {
  enabled?: boolean; // false = inherits from global
  fontFamily?: string;
  fontWeight?: number;
  desktopFontSizePx?: number;
  mobileFontSizePx?: number;
  lineHeight?: number;
  letterSpacingPx?: number;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
}

export interface TypographySectionsConfig {
  header?: TypographySectionOverride;
  navigation?: TypographySectionOverride;
  homepage?: TypographySectionOverride;
  homepageHeadings?: TypographySectionOverride;
  newsCards?: TypographySectionOverride;
  categoryPages?: TypographySectionOverride;
  singleArticle?: TypographySectionOverride;
  articleHeadline?: TypographySectionOverride;
  articleBody?: TypographySectionOverride;
  articleSubheadings?: TypographySectionOverride;
  articleDescription?: TypographySectionOverride;
  authorProfiles?: TypographySectionOverride;
  imageCaptions?: TypographySectionOverride;
  sidebar?: TypographySectionOverride;
  widgetHeadings?: TypographySectionOverride;
  footer?: TypographySectionOverride;
  legalPages?: TypographySectionOverride;
  adminEditor?: TypographySectionOverride;
}

export interface TypographySettings {
  // Global Typography Defaults
  defaultFontFamily?: string;
  defaultFontWeight?: number;
  globalLineHeight?: number;
  globalLetterSpacing?: number;
  globalDesktopFontSize?: number;
  globalMobileFontSize?: number;
  sections?: TypographySectionsConfig;

  headerFont: string;
  footerFont?: string;
  headlineFont: string;
  bodyFont: string;
  metaFont: string;
  headlineWeight: number;
  bodyWeight: number;
  mobileScale: 'compact' | 'normal' | 'large';
  baseSize: 'small' | 'normal' | 'large' | 'xlarge';
  baseFontSizePx?: number;
  headingSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  titleSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  contentSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  archiveSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  metaSize?: 'sm' | 'normal' | 'large';
  headerFontSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  footerFontSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  homepageTitleSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  articleTitleSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  articleTitleDesktopPx?: number;
  articleTitleMobilePx?: number;
  articleLeadSubtitlePx?: number;
  articleBodyFontSizePx?: number;
  articleBodyLineHeight?: number;
  articleExcerptSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  metaDescriptionSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  // CSS Variables Custom Scaling (index.css mapped)
  customScaleFont?: number; // Maps to --scale-font (root base scale)
  sizeHeadingScale?: number; // Maps to --size-heading-scale
  sizeTitleScale?: number; // Maps to --size-title-scale
  sizeContentScale?: number; // Maps to --size-content-scale
  sizeArchiveScale?: number; // Maps to --size-archive-scale
  sizeMetaScale?: number; // Maps to --size-meta-scale
  sizeHeaderScale?: number; // Maps to --size-header-scale
  sizeFooterScale?: number; // Maps to --size-footer-scale
  sizeHomepageTitleScale?: number; // Maps to --size-homepage-title-scale
  sizeArticleTitleScale?: number; // Maps to --size-article-title-scale
  sizeExcerptScale?: number; // Maps to --size-excerpt-scale
  sizeMetaDescScale?: number; // Maps to --size-meta-desc-scale
  mobileSidebarFontScale?: number; // Scale font size of entire mobile sidebar drawer container
  headerLogoHeightPx?: number;
  headerTitleCustomPx?: number;
  navLinkFontSizePx?: number;
  tickerFontSizePx?: number;
  sectionHeadingPx?: number;
  heroTitlePx?: number;
  gridCardTitlePx?: number;
  gridCardExcerptPx?: number;
  cardMetaFontSizePx?: number;
  relatedHeadingSize?: 'sm' | 'normal' | 'large' | 'xlarge';
  relatedHeadingCustomPx?: number;
  relatedCategoryBadgePx?: number;
  relatedCardTitlePx?: number;
  sidebarHeadingPx?: number;
  sidebarItemTitlePx?: number;
  footerHeadingPx?: number;
  footerTextPx?: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: 'editorial' | 'grievance' | 'news_tip' | 'advertising' | 'press_release' | 'general';
  subject: string;
  message: string;
  sourceUrl?: string;
  submittedAt: string;
  status: 'new' | 'in_review' | 'replied' | 'archived';
  adminNotes?: string;
}

export interface SubscriberItem {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'vip';
  source: 'popup' | 'footer' | 'sidebar' | 'article_page' | 'manual';
  subscribedAt: string;
  tags?: string[];
  preferredCategories?: NewsCategory[];
  digestPreference?: 'daily_morning' | 'breaking_instant' | 'weekly_digest' | 'all';
  deliveryChannel?: 'email' | 'push' | 'both';
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  url?: string;
  icon?: string;
  status: 'sent' | 'scheduled' | 'draft';
  targetAudience: 'all' | 'breaking' | 'sports' | 'business';
  sentAt: string;
  clicksCount: number;
  reachCount: number;
}

export interface PortalPopupConfig {
  enabled: boolean;
  type: 'breaking_alert' | 'newsletter_subscribe' | 'special_coverage' | 'festive_greeting' | 'app_install';
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  delaySeconds: number;
  showFrequency: 'once_session' | 'every_visit';
}

export interface SpotlightLayoutSettings {
  heroSlider: {
    enabled: boolean;
    source: 'recent' | 'category' | 'manual';
    category: NewsCategory | 'all';
    selectedArticleIds: string[];
    slideIntervalSeconds: number;
    autoPlay: boolean;
    showArrows: boolean;
    showDots: boolean;
  };
  secondaryCol: {
    newsCount: number; // default 3 news as requested
    source: 'recent' | 'category' | 'manual';
    category?: NewsCategory | 'all';
    selectedArticleIds?: string[];
  };
  briefTicker: {
    enabled: boolean;
    title: string;
    showCategoryBadge: boolean; // admin option whether to show category or not
    source: 'recent' | 'category' | 'manual'; // which news or category to show
    category: NewsCategory | 'all';
    selectedArticleIds: string[];
    slideSpeed: 'slow' | 'normal' | 'fast';
    direction: 'bottom_to_top'; // niche se upar ki taraf sliding
    pauseOnHover: boolean;
    itemCount: number;
  };
}

export interface ArticleMetaSettings {
  showAuthorAvatar: boolean;
  showAuthorName: boolean;
  showAuthorRole: boolean;
  showAuthorBox?: boolean; // Control whether bottom author biographical card is shown after article content
  showPublishDate: boolean;
  showRelativeTime: boolean;
  showViewsCount: boolean;
  showFontSizeControl?: boolean;
  showDesktopLocationTime?: boolean;
  showListenButton?: boolean;
  showPdfButton?: boolean;
  showLocationBadge?: boolean;
  showLikesButton: boolean;
  showBookmarkButton: boolean;
  showNativeShare: boolean;
  showSocialIcons: boolean;
  compactSingleLine: boolean;
  platforms: {
    whatsapp: boolean;
    telegram: boolean;
    twitter: boolean;
    facebook: boolean;
    copyLink: boolean;
  };
}

export interface ArticlePageConfig {
  // Container & Layout
  containerMaxWidth: 'normal' | 'wide' | 'full'; // max-w-6xl vs max-w-7xl vs full
  contentContainerWidthPx?: number; // 600px to 900px adjustable desktop reading width (e.g., 780)
  contentColumnWidth: 'compact' | 'standard' | 'wide'; // 7-col vs 8-col vs 9-col
  // Typography
  h1FontSize: 'normal' | 'large' | 'xlarge';
  h1FontFamily: 'Rozha One' | 'Mukta' | 'Hind';
  bodyLineHeight: 'normal' | 'relaxed' | 'loose';
  // Identity & Byline Visibility
  showCategoryBadge: boolean;
  showLocationTag: boolean;
  showAuthorByline: boolean;
  showEditorByline: boolean;
  showAuthorBioBox?: boolean; // Toggle for author biographical card at bottom of article
  showPublishedDate: boolean;
  showRelativeTime: boolean;
  showReadingTime: boolean;
  showViewCount: boolean;
  showKeyHighlights?: boolean; // Toggle for 5 Key Highlights card
  showImageCaption?: boolean; // Toggle for featured image caption
  showTags?: boolean; // Toggle for article tags / keywords
  // Action Bar Toggles
  showAudioListen: boolean;
  showFontSizeControls: boolean;
  showPrintPdf: boolean;
  showClippingModal: boolean;
  showCopyLink: boolean;
  showSocialShare: boolean;
  showReactionsBar: boolean;
  showCommentsSection: boolean;
  showQuickActionsStrip?: boolean; // Toggle for Google News, PDF, WhatsApp, Telegram strip
  // Disclaimer Box
  showDisclaimerBox: boolean;
  disclaimerText: string;
  disclaimerFontSize: '12px' | '13px' | '14px' | '16px';
  // Related Stories Section & Cards
  showRelatedStories: boolean;
  relatedHeadingTitle: string;
  showRelatedHeadingCategoryBadge: boolean;
  showRelatedHeadingSubtitle: boolean;
  relatedHeadingSubtitleText: string;
  relatedArticlesCount: number;
  relatedCardShowCategory: boolean;
  relatedCardShowLocation: boolean;
  relatedCardShowDate: boolean;
  relatedCardShowReadMore: boolean;
  relatedMobileLayout: 'compact_list' | 'grid_2col';
  // Mobile Sticky Bottom Bar & Advertisement
  mobileStickyBar?: MobileStickyBarConfig;
}

export interface MobileStickyBarConfig {
  enabled: boolean; // Enable or hide the mobile sticky bottom bar entirely
  mode: 'share' | 'ad' | 'both'; // 'share' = social share buttons, 'ad' = sticky advertisement, 'both' = dual
  sharePlatforms?: {
    whatsapp?: boolean;
    twitter?: boolean;
    facebook?: boolean;
    telegram?: boolean;
    copyLink?: boolean;
    nativeShare?: boolean;
  };
  showShareLabel?: boolean; // Show 'Share:' text or icon-only
  // Mobile Sticky Advertisement options
  adType?: 'image' | 'script'; // 'image' = banner image + link, 'script' = custom HTML/AdSense
  adImageUrl?: string; // 320x50 or responsive image URL
  adTargetUrl?: string; // click destination URL
  adAltText?: string; // alt text / sponsor title
  adScriptCode?: string; // HTML / AdSense script
  adHeightPx?: number; // default 50
  dismissible?: boolean; // allow mobile user to dismiss/close with (X) button
  autoHideOnFooter?: boolean; // whether to automatically collapse or clear space when viewing footer
}

export interface ArticleSidebarWidgets {
  showReadingProgressBar: boolean;
  showSidebarAd: boolean;
  showTrendingNews: boolean;
  showEditorPicks: boolean;
  showNewsletterSubscribe: boolean;
  showOpinionPoll: boolean;
  showEPaperPromo: boolean;
  showMarketGlance: boolean;
  showAuthorBio: boolean;
  showEditorialDisclaimer: boolean;
  showCommentsSection: boolean;
  showRelatedStories: boolean;
  showFollowUsChannels: boolean;
  relatedArticlesCount?: number; // 3, 4, 6, 8, 10, 12 or more (admin configurable)
  sidebarSliderMode?: boolean; // Interactive slider / carousel for sidebar widgets
  // Related Stories Section & Cards Customization (Admin control)
  relatedHeadingTitle?: string;
  showRelatedHeadingCategoryBadge?: boolean;
  showRelatedHeadingSubtitle?: boolean;
  relatedHeadingSubtitleText?: string;
  relatedCardShowCategory?: boolean;
  relatedCardShowLocation?: boolean;
  relatedCardShowDate?: boolean;
  relatedCardShowReadMore?: boolean;
  relatedCardShowSummary?: boolean;
  relatedCardShowImage?: boolean;
  relatedMobileLayout?: 'grid1' | 'grid2' | 'list';
  // Trending Stories vertical slider options (bottom-to-top auto-sliding)
  trendingSliderEnabled?: boolean;
  trendingStoriesCount?: number; // 3, 5, 8, 10, or all
  trendingCategoryFilter?: string; // 'all' or category name
  trendingSlideSpeed?: number; // ms speed
  pollQuestion?: string;
  pollOptionA?: string;
  pollOptionB?: string;
  pollOptionC?: string;
  pollOptionD?: string;
  // Extended Modular Sidebar Widgets (Gold Rate, Rashifal, Quotes, etc.)
  showGoldRate?: boolean;
  goldRateWidgetTitle?: string; // Customizable title e.g. 'सोने-चांदी का भाव'
  goldRateCity?: string; // e.g. 'दिल्ली (Delhi)', 'मुंबई', 'लखनऊ', 'जयपुर'
  goldRate24k?: number; // per 10g in Rs
  goldRate22k?: number; // per 10g in Rs
  silverRate1kg?: number; // per 1kg in Rs
  goldRateUpdateDate?: string;
  showRashifal?: boolean;
  rashifalWidgetTitle?: string; // Customizable title e.g. 'दैनिक राशिफल'
  rashifalAutoUpdate?: boolean; // Auto daily calculation/simulation or manual
  rashifalDate?: string;
  customRashifalList?: Array<{
    id: string;
    sign: string; // e.g. 'मेष (Aries)'
    symbol: string; // e.g. '♈'
    ruler: string; // e.g. 'मंगल'
    prediction: string;
    luckyNumber: number;
    luckyColor: string;
  }>;
}

export interface AdSlotBreakpointSize {
  maxWidth?: number; // e.g. 640 (Mobile), 1024 (Tablet), undefined (Desktop)
  minHeightPx?: number; // e.g. 60, 90, 140, 250
  maxHeightPx?: number; // e.g. 100, 160, 320
  aspectRatio?: string; // e.g. '300/250', '320/100', '728/90', 'auto'
  hideOnBreakpoint?: boolean; // optionally hide banner on this screen size
}

export interface AdResponsiveBreakpoints {
  mobile: AdSlotBreakpointSize; // < 640px
  tablet: AdSlotBreakpointSize; // 640px - 1024px
  desktop: AdSlotBreakpointSize; // >= 1024px
  enableCustomBreakpoints?: boolean;
}

export interface SidebarAdSlotConfig {
  enabled: boolean;
  adType: 'private' | 'adsense';
  bannerUrl?: string;
  bannerLink?: string;
  bannerTitle?: string;
  altText?: string;
  adSlotId?: string;
  breakpoints?: AdResponsiveBreakpoints;
}

export interface SidebarAdsConfig {
  topSlot: SidebarAdSlotConfig;
  middleSlot: SidebarAdSlotConfig;
  bottomSlot: SidebarAdSlotConfig;
  globalBreakpoints?: AdResponsiveBreakpoints;
}

export interface CitizenNewsSubmission {
  id: string;
  title: string;
  category: NewsCategory | string;
  location: string;
  incidentDate: string;
  description: string;
  images: string[];
  videoUrl?: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  isAnonymous: boolean;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'published';
  editorialNotes?: string;
}

export interface CustomSocialChannel {
  id: string;
  platform: string; // e.g. 'Threads', 'LinkedIn', 'Koo', 'Dailyhunt'
  url: string;
  enabled: boolean;
}

export interface NetworkEdition {
  id: string;
  name: string; // e.g. "English Edition", "ਪੰਜਾਬੀ (Punjabi)"
  langCode: string; // e.g. "en", "pa", "hi"
  icon?: string; // e.g. "🌐", "🌾", "🇮🇳"
  url: string; // e.g. "https://en.khabridost.com"
  openInNewTab?: boolean;
  enabled: boolean;
  isCurrent?: boolean; // marks current active portal
}

export interface FooterBannerAdConfig {
  enabled: boolean; // Enable testing banner ad on footer
  type: 'image' | 'script' | 'adsense';
  desktopImageUrl?: string; // 728x90 or 970x90 banner image
  mobileImageUrl?: string; // 320x50 or 300x100 mobile banner image
  targetUrl?: string; // Click destination URL
  title?: string; // Ad title
  subTitle?: string; // Ad subtitle
  altText?: string; // Alt text or sponsor name
  scriptCode?: string; // Custom HTML/script code
  adSlotId?: string; // AdSense slot ID
}

export interface HeaderFooterSettings {
  siteTitle: string;
  siteTagline: string;
  showTagline?: boolean; // Master toggle to show/hide portal tagline across header & mobile menu (default false/hidden)
  showTaglineDesktop?: boolean; // Control tagline visibility on desktop screens (default true)
  showTaglineMobile?: boolean; // Control tagline visibility on mobile screens (default false, zero empty space)
  footerBannerAd?: FooterBannerAdConfig; // Testing banner ad on footer (desktop & mobile)
  logoUrl?: string;
  headerLogoHeight?: number; // Custom height in px (e.g. 36px to 90px)
  headerTitleCustomPx?: number; // Custom font size for siteTitle text in px
  showSiteTitleText?: boolean; // Whether to display site title text alongside/below logo
  primaryBrandColor?: string; // Hex color for primary brand identity (default: #dc2626)
  secondaryBrandColor?: string; // Hex color for secondary brand accents
  siteTitleHindi?: string; // Hindi/Devanagari localized site title
  footerLogoUrl?: string; // Dedicated logo URL for footer
  faviconUrl?: string;
  contactEmail: string;
  contactAddress: string;
  contactPhone?: string;
  rniNumber: string;
  showRniNumber?: boolean;
  footerTheme?: 'light' | 'light_slate' | 'light_red';
  // Comprehensive footer custom settings
  footerAboutHeading?: string;
  footerAboutText?: string;
  aboutText?: string; // Short about summary for meta description
  footerBrandingPartnerName?: string;
  footerBrandingPartnerUrl?: string;
  footerBottomName?: string;
  // WhatsApp News Bulletin Channel
  whatsappNewsBulletinUrl?: string;
  whatsappNewsBulletinText?: string;
  // Header element toggles
  headerShowLiveTv?: boolean;
  headerShowEPaper?: boolean;
  headerShowBookmarks?: boolean;
  headerShowNewsTicker?: boolean;
  headerShowMegaMenu?: boolean;
  headerShowSearch?: boolean;
  headerShowAdminButton?: boolean;
  headerShowLiveCoverage?: boolean;
  // Multi-Language & Brand Network Editions
  headerShowLanguageEditions?: boolean;
  languageEditions?: NetworkEdition[];
  socialLinks: {
    whatsappChannel: string;
    telegramChannel: string;
    facebook: string;
    twitter: string;
    youtube: string;
    instagram?: string;
    googleNews?: string;
  };
  customSocialChannels?: CustomSocialChannel[];
  // Desktop & mobile navigation category ordering and enable/disable
  navCategoryOrder?: string[]; // IDs of categories in custom sequence
  categoryOrder?: string[]; // Alias for navCategoryOrder
  disabledCategories?: string[]; // IDs of hidden categories
  customCategoryLabels?: Record<string, string>; // ID -> custom heading label
  // States sequence & enable/disable
  customStates?: string[]; // list of states in sequence
  disabledStates?: string[]; // hidden states
  legalPolicies?: {
    factCheckPolicy: string;
    editorialEthics: string;
    grievanceRedressal: string;
    privacyPolicy: string;
    termsOfService: string;
    disclaimer?: string;
    correctionPolicy?: string;
    dmcaNotice?: string;
    cookiePolicy?: string;
  };
}

export interface HomepageSectionsConfig {
  heroSlider: boolean;
  liveVideoBulletin: boolean; // digital studio / live video bulletin hide/enable
  liveFeedCoverage: boolean; // homepage live news updates card/strip
  headerLiveFeedLink: boolean; // header menu 'Live Coverage' link
  briefsTicker: boolean;
  trendingTopics: boolean;
  webStories: boolean;
  photoGallery: boolean;
  categoryBlocks: boolean;
  morningCapsule?: boolean; // ⚡ सुबह का 60-सेकंड कैप्सूल (Morning Brief / 60-Second News Capsule)
}

export interface GoogleServicesConfig {
  googleAnalyticsId: string; // e.g. G-XXXXXXXXXX
  searchConsoleVerification: string; // e.g. google-site-verification=...
  googleTagManagerId: string; // e.g. GTM-XXXXXXX
  adsenseClientId: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
  adsenseAutoAds: boolean;
  adsenseStatus?: 'active' | 'pending' | 'disabled';
}

export interface SpeedAndWebVitalsConfig {
  enableLazyLoading: boolean;
  enableWebpOptimization: boolean;
  enableDnsPrefetch: boolean;
  enableScriptDeferral: boolean;
  targetLcpMs: number; // Largest Contentful Paint target
  targetFidMs: number; // First Input Delay target
  targetCls: number; // Cumulative Layout Shift target
  currentScore: number;
}

export interface AdvancedSeoConfig {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultFocusKeywords: string;
  canonicalDomain: string;
  newsOrganizationSchema: boolean;
  newsArticleSchema: boolean;
  breadcrumbSchema: boolean;
  robotsDirectives?: string;
  brokenLinkCheck?: {
    totalChecked: number;
    brokenCount: number;
    lastAuditTime: string;
    status: 'healthy' | 'warnings' | 'error';
  };
}

export interface MobileSettingsConfig {
  mobileScale: 'compact' | 'normal' | 'large';
  stickyMobileBottomNav: boolean;
  mobileImageQuality: 'high' | 'balanced' | 'data_saver';
  touchFriendlyPadding: boolean;
}

export interface ApiConfiguration {
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleTrendsApiKey?: string;
  activeAiProvider: 'gemini' | 'openai' | 'anthropic';
  googleTrendsRegion: string;
  googleTrendsLanguage: string;
  googleTrendsAutoRefresh: boolean;
  googleTrendsRefreshIntervalMinutes?: number;
}

export interface AiSeoConfig {
  apiKey?: string;
  provider?: 'gemini' | 'openai';
  model?: string;
  modelName?: string;
  defaultLanguage?: string;
  defaultTone?: string;
  autoExtractKeywords?: boolean;
  autoKeywordsEnabled?: boolean;
  autoGenerateSlug?: boolean;
  autoSlugEnabled?: boolean;
}

export interface GoogleTrendsConfig {
  region?: string;
  category?: string;
  provider?: string;
  rssFeedUrl?: string;
  autoSync?: boolean;
  refreshIntervalMinutes?: number;
  lastFetchedAt?: string;
  customKeywords?: string[];
  apiKey?: string;
}

export interface PortalSettings {
  apiConfig?: ApiConfiguration;
  headerFooter?: HeaderFooterSettings;
  homepageSections?: HomepageSectionsConfig;
  googleServices?: GoogleServicesConfig;
  speedAndWebVitals?: SpeedAndWebVitalsConfig;
  advancedSeoSettings?: AdvancedSeoConfig;
  mobileSettings?: MobileSettingsConfig;
  tickerSpeed: 'ultra_slow' | 'slow' | 'normal' | 'fast' | 'paused' | 'custom';
  tickerSpeedSeconds?: number;
  liveVideoSectionEnabled?: boolean;
  liveVideoYoutubeId?: string;
  liveVideoTitle?: string;
  liveFeedCoverageEnabled?: boolean; // controls homepage strip
  headerLiveFeedLinkEnabled?: boolean; // controls header menu link
  trendingTopics: string[];
  pinnedTrendingArticleIds?: string[];
  spotlightLayout?: SpotlightLayoutSettings;
  displayOptions: {
    showExcerptOnMobile: boolean;
    showAuthor: boolean;
    showDate: boolean;
    showViews: boolean;
    showLocation: boolean;
    showBookmark?: boolean;
    showShare?: boolean;
    showReadLater?: boolean;
    cardStyle: 'compact' | 'standard';
  };
  articleMetaSettings?: ArticleMetaSettings;
  sidebarWidgets?: ArticleSidebarWidgets;
  typography: TypographySettings;
  sharePlatforms: {
    whatsapp: boolean;
    telegram: boolean;
    twitter: boolean;
    facebook: boolean;
    copyLink: boolean;
    googleNews: boolean;
  };
  adSettings: {
    showTopAd: boolean;
    showMidContentAd: boolean;
    showBottomAd: boolean;
    showSidebarAd: boolean;
    showMobileStickyAd?: boolean;
    topAdType: 'adsense' | 'private';
    sidebarAdType: 'adsense' | 'private';
    adsenseClientId?: string;
    topAdSlotId?: string;
    midAdSlotId?: string;
    sidebarAdSlotId?: string;
    bottomAdSlotId?: string;
    privateBannerUrl?: string;
    privateBannerLink?: string;
    privateBannerTitle?: string;
    advertiserName?: string;
    campaignExpiry?: string;
    customScriptOrHtml?: string;
    responsiveBreakpoints?: {
      leaderboard?: AdResponsiveBreakpoints;
      inContent?: AdResponsiveBreakpoints;
      sidebar?: AdResponsiveBreakpoints;
      bottom?: AdResponsiveBreakpoints;
    };
  };
  customPhotoStories?: PhotoStoryItem[];
  articlePageConfig?: ArticlePageConfig;
  mobileStickyBar?: MobileStickyBarConfig;
  sidebarAdsConfig?: SidebarAdsConfig;
  popupConfig?: PortalPopupConfig;
  mobileSidebarMenu?: MobileSidebarMenuConfig;
  epaperSettings?: EPaperSettings;
  footerBannerAd?: FooterBannerAdConfig;
  desktopStickyAd?: DesktopStickyAdConfig;
  mobileBottomNav?: MobileBottomNavConfig;
  headlineStyling?: HeadlineStylingConfig;
  linkStyling?: LinkStylingConfig;
  videoMediaList?: VideoNewsItem[];
  trendingConfig?: TrendingSectionConfig;
}

import { EPaperEditionRecord } from './epaper';

export interface EPaperSettings {
  customPdfUrl?: string; // Direct URL to latest uploaded daily PDF
  customPdfTitle?: string; // e.g. 'खबरी दोस्त • दैनिक राष्ट्रीय समाचार पत्र'
  customPdfEdition?: string; // e.g. 'राष्ट्रीय संस्करण (नई दिल्ली)'
  customPdfDate?: string; // publication date
  customPdfThumbnail?: string; // attractive front page cover thumbnail
  customPdfPageCount?: number; // total pages e.g. 15
  customPdfPages?: string[]; // Array of page images if cached
  featuredHeadline?: string; // front-page headline
  allowDownload?: boolean; // allow reader PDF download
  allowShare?: boolean; // allow social sharing
  allowPrint?: boolean; // allow browser printing
  price?: string; // e.g. '₹ 4.50'
  issueNumber?: string; // e.g. 'वर्ष 1 • अंक 245'
  editionsList?: EPaperEditionRecord[];
  activeEditionCode?: string;
  activeEditionDate?: string;
  mode?: string; // legacy compatibility
}

export interface MobileSidebarCustomLink {
  id: string;
  labelHindi: string;
  labelEnglish: string;
  linkType: 'category' | 'page' | 'external';
  target: string;
  icon?: string;
  enabled: boolean;
}

export interface MobileSidebarMenuConfig {
  showLogo?: boolean;
  showSiteTitle?: boolean;
  showEPaperButton?: boolean;
  showSubmitNewsButton?: boolean;
  showCategories?: boolean;
  showOfficialChannels?: boolean;
  showWhatsAppButton?: boolean;
  showTelegramButton?: boolean;
  showSocialMediaIcons?: boolean;
  showSubscriberCard?: boolean;
  fontSize?: 'sm' | 'normal' | 'large';
  fontFamily?: string;
  customLinks?: MobileSidebarCustomLink[];
}

export interface LiveNewsUpdate {
  id: string;
  timestamp: string; // e.g. '11:15 AM'
  title: string;
  content: string;
  authorName?: string;
  imageUrl?: string;
  isImportant?: boolean;
  tag?: string; // e.g. 'संसद', 'बड़ा बयान', 'अपडेट'
  createdAt: string;
}

export interface LiveBlogEvent {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  isLive: boolean;
  startedAt: string;
  lastUpdatedAt: string;
  coverImage: string;
  keyHighlights: string[];
  updates: LiveNewsUpdate[];
}
