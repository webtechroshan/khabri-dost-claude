import type { PortalSettings } from '../types/news';
import {
  DEFAULT_POPUP_CONFIG,
  DEFAULT_FOOTER_BANNER_AD_CONFIG,
  DEFAULT_SIDEBAR_ADS_CONFIG,
  DEFAULT_GOOGLE_SERVICES,
  DEFAULT_EPAPER_SETTINGS,
} from '../data/portalDefaults';

/**
 * Older versions shipped invented placeholder values (a fake breaking-news popup, stock-photo ads,
 * a "Testing Ad Banner", made-up Google IDs, phone and RNI numbers, hashtags, a third-party newspaper
 * PDF as the e-paper, a third-party live stream). Those values may already be saved in the live
 * settings document. This function recognises them and replaces only those values with clean
 * defaults; anything the owner entered is kept. Saving settings in the admin writes the cleaned values.
 */

const STOCK_PHOTO = /images\.unsplash\.com/i;
const FAKE_GOOGLE_IDS = new Set([
  'G-KD2026IN',
  'GTM-KD2026X',
  'ca-pub-9840284729482910',
  'google-site-verification=kd_news_portal_master_2026_verified',
]);
const FAKE_CONTACT = new Set(['+91 11 2345 6789', 'DELHIN/2024/84920', 'प्रेस एंक्लेव, कनाट प्लेस, नई दिल्ली - 110001']);
const PLACEHOLDER_LINK = /(\/channel\/example|t\.me\/example)$/i;
const BARE_SOCIAL_HOMEPAGE = /^https?:\/\/(www\.)?(facebook\.com|x\.com|twitter\.com|youtube\.com|instagram\.com|news\.google\.com)\/?$/i;
const INVENTED_HASHTAGS = new Set([
  '#गगनयान_मिशन', '#टी20_वर्ल्डकप', '#नीरज_चोपड़ा', '#सेंसेक्स_81400', '#संसद_सत्र',
  '#डिजिटल_सुरक्षा', '#मेक_इन_इंडिया', '#वंदे_भारत_स्लीपर', '#यूपी_एक्सप्रेसवे',
  '#Budget2026', '#Election2026', '#Cricket', '#TechNews',
]);
const THIRD_PARTY_PDF = /dainik[ _]?jagran|\/assets\/aistudio\//i;
const PLACEHOLDER_STREAM_IDS = new Set(['jfKfPfyJRdk']);

const isPlaceholderAdText = (s?: string) => !!s && /(testing|टेस्टिंग|5 लाख\+|500,000\+|खबरी दोस्त (मीडिया|बिजनेस|डिजिटल) (नेटवर्क|न्यूज़ नेटवर्क))/i.test(s);

export function cleanPortalSettings<T extends PortalSettings>(input: T): T {
  if (!input || typeof input !== 'object') return input;
  const s: any = { ...input };

  // Fake breaking-news popup.
  const popup = s.popupConfig;
  if (popup && (/गगनयान/.test(popup.title || '') || popup.ctaLink === 'news-1' || STOCK_PHOTO.test(popup.imageUrl || ''))) {
    s.popupConfig = { ...DEFAULT_POPUP_CONFIG };
  }

  // Stock-photo / test ads.
  const fb = s.footerBannerAd || s.headerFooter?.footerBannerAd;
  const cleanFooter = (ad: any) =>
    ad && (STOCK_PHOTO.test(ad.desktopImageUrl || '') || STOCK_PHOTO.test(ad.mobileImageUrl || '') || isPlaceholderAdText(ad.title))
      ? { ...DEFAULT_FOOTER_BANNER_AD_CONFIG }
      : ad;
  if (fb) s.footerBannerAd = cleanFooter(s.footerBannerAd);
  if (s.headerFooter?.footerBannerAd) s.headerFooter = { ...s.headerFooter, footerBannerAd: cleanFooter(s.headerFooter.footerBannerAd) };

  if (s.desktopStickyAd && (STOCK_PHOTO.test(s.desktopStickyAd.imageUrl || '') || isPlaceholderAdText(s.desktopStickyAd.subTitle))) {
    s.desktopStickyAd = { ...s.desktopStickyAd, enabled: false, imageUrl: '', targetUrl: '', title: '', subTitle: '', altText: '' };
  }
  const sticky = s.mobileStickyBar;
  if (sticky && STOCK_PHOTO.test(sticky.adImageUrl || '')) {
    s.mobileStickyBar = { ...sticky, adImageUrl: '', adTargetUrl: '', adAltText: '', mode: sticky.mode === 'ad' ? 'share' : sticky.mode };
  }
  if (s.articlePageConfig?.mobileStickyBar && STOCK_PHOTO.test(s.articlePageConfig.mobileStickyBar.adImageUrl || '')) {
    const m = s.articlePageConfig.mobileStickyBar;
    s.articlePageConfig = {
      ...s.articlePageConfig,
      mobileStickyBar: { ...m, adImageUrl: '', adTargetUrl: '', adAltText: '', mode: m.mode === 'ad' ? 'share' : m.mode },
    };
  }
  if (s.sidebarAdsConfig) {
    const slots: any = { ...s.sidebarAdsConfig };
    for (const k of ['topSlot', 'middleSlot', 'bottomSlot']) {
      const slot = slots[k];
      if (slot && (STOCK_PHOTO.test(slot.bannerUrl || '') || isPlaceholderAdText(slot.bannerTitle))) {
        slots[k] = { ...(DEFAULT_SIDEBAR_ADS_CONFIG as any)[k], breakpoints: slot.breakpoints };
      }
    }
    s.sidebarAdsConfig = slots;
  }
  if (s.adSettings && (STOCK_PHOTO.test(s.adSettings.privateBannerUrl || '') || isPlaceholderAdText(s.adSettings.privateBannerTitle))) {
    s.adSettings = { ...s.adSettings, privateBannerUrl: '', privateBannerLink: '', privateBannerTitle: '' };
  }

  // Invented Google IDs.
  if (s.googleServices) {
    const g: any = { ...s.googleServices };
    for (const k of ['googleAnalyticsId', 'googleTagManagerId', 'adsenseClientId', 'searchConsoleVerification']) {
      if (FAKE_GOOGLE_IDS.has(g[k]) || /X{4,}/.test(g[k] || '')) g[k] = (DEFAULT_GOOGLE_SERVICES as any)[k];
    }
    if (!g.adsenseClientId) g.adsenseAutoAds = false;
    s.googleServices = g;
  }

  // Invented contact / registration details and placeholder social links.
  if (s.headerFooter) {
    const h: any = { ...s.headerFooter };
    for (const k of ['contactPhone', 'rniNumber', 'contactAddress']) if (FAKE_CONTACT.has(h[k])) h[k] = '';
    if (PLACEHOLDER_LINK.test(h.whatsappNewsBulletinUrl || '')) h.whatsappNewsBulletinUrl = '';
    if (h.socialLinks) {
      const links: any = { ...h.socialLinks };
      for (const k of Object.keys(links)) {
        if (typeof links[k] === 'string' && (PLACEHOLDER_LINK.test(links[k]) || BARE_SOCIAL_HOMEPAGE.test(links[k]))) links[k] = '';
      }
      h.socialLinks = links;
    }
    s.headerFooter = h;
  }

  // Invented hashtags.
  if (Array.isArray(s.trendingTopics)) s.trendingTopics = s.trendingTopics.filter((t: string) => !INVENTED_HASHTAGS.has(t));

  // Third-party newspaper PDF presented as our e-paper.
  if (s.epaperSettings && (THIRD_PARTY_PDF.test(s.epaperSettings.customPdfUrl || '') || /गगनयान/.test(s.epaperSettings.featuredHeadline || ''))) {
    const list = (s.epaperSettings.editionsList || []).filter((e: any) => !THIRD_PARTY_PDF.test(e?.pdfUrl || ''));
    s.epaperSettings = { ...DEFAULT_EPAPER_SETTINGS, editionsList: list };
  }

  // Third-party live stream presented as our studio.
  if (PLACEHOLDER_STREAM_IDS.has(s.liveVideoYoutubeId)) {
    s.liveVideoYoutubeId = '';
    s.liveVideoSectionEnabled = false;
    s.liveVideoTitle = '';
  }

  // Seed article ids pinned as "trending".
  if (Array.isArray(s.pinnedTrendingArticleIds)) {
    s.pinnedTrendingArticleIds = s.pinnedTrendingArticleIds.filter((id: string) => !/^news-\d+$/.test(id));
  }

  // Invented gold rates (shown as live market data).
  const w = s.sidebarWidgets;
  if (w && w.goldRate24k === 78450 && w.goldRate22k === 71920) {
    s.sidebarWidgets = { ...w, showGoldRate: false, goldRate24k: 0, goldRate22k: 0, silverRate1kg: 0, goldRateUpdateDate: '' };
  }
  if (w && /क्या 2026 में डिजिटल मीडिया/.test(w.pollQuestion || '')) {
    s.sidebarWidgets = { ...(s.sidebarWidgets || w), showOpinionPoll: false, pollQuestion: '' };
  }

  return s as T;
}
