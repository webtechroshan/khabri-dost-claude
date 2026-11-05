import React, { useState } from 'react';
import {
  Send,
  Check,
  Sliders,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  X,
  Minus,
  Plus,
  Megaphone,
} from 'lucide-react';
import { CATEGORIES, MAJOR_INDIAN_STATES } from '../data/seedNews';
import { NewsCategory, PortalSettings, FooterBannerAdConfig } from '../types/news';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_HEADER_FOOTER_SETTINGS, DEFAULT_FOOTER_BANNER_AD_CONFIG } from '../data/portalDefaults';
import { LegalPolicyType } from './LegalPolicyPageView';
import { AdCode } from './AdCode';

interface FooterProps {
  onSelectCategory: (cat: NewsCategory) => void;
  onOpenEPaper: () => void;
  onOpenPublisherCMS: () => void;
  onOpenStaffLogin?: () => void;
  onOpenSubscriberPreferences?: () => void;
  portalSettings?: PortalSettings;
  onOpenAdminSettings?: (tab?: any) => void;
  onOpenLegalPolicy?: (type: LegalPolicyType) => void;
  onOpenContactPage?: () => void;
  onOpenAboutUsPage?: () => void;
  onOpenSubmitNews?: () => void;
  onOpenArchivePage?: () => void;
  onOpenSudokuGame?: () => void;
  onSearchState?: (stateName: string) => void;
}

const renderOfficialSocialIcon = (platform: string) => {
  const p = platform.toLowerCase().trim();
  if (p.includes('whatsapp')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    );
  }
  if (p.includes('telegram')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z"/>
      </svg>
    );
  }
  if (p.includes('youtube')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (p.includes('facebook') || p.includes('fb')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (p.includes('twitter') || p === 'x' || p.includes(' x ')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (p.includes('instagram') || p.includes('insta')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  if (p.includes('thread')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12.002 0C5.385 0 0 5.384 0 12s5.385 12 12.002 12c6.613 0 11.998-5.384 11.998-12S18.615 0 12.002 0zm0 18.917c-3.818 0-6.917-3.099-6.917-6.917s3.099-6.917 6.917-6.917c3.818 0 6.917 3.099 6.917 6.917s-3.099 6.917-6.917 6.917z"/>
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
};

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenEPaper,
  onOpenPublisherCMS,
  onOpenStaffLogin,
  onOpenSubscriberPreferences,
  portalSettings,
  onOpenAdminSettings,
  onOpenLegalPolicy,
  onOpenContactPage,
  onOpenAboutUsPage,
  onOpenSubmitNews,
  onOpenArchivePage,
  onOpenSudokuGame,
  onSearchState,
}) => {
  const { isAdmin } = useAuth();
  const [emailSub, setEmailSub] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  const hf = portalSettings?.headerFooter || DEFAULT_HEADER_FOOTER_SETTINGS;
  const isLight = true;

  const navOrder: string[] = hf.categoryOrder || hf.navCategoryOrder || [
    'national',
    'state',
    'politics',
    'crime',
    'entertainment',
    'sports',
    'business',
    'tech',
    'lifestyle',
    'world',
  ];
  const disabledCats: string[] = hf.disabledCategories || [];
  const customCatLabels: Record<string, string> = hf.customCategoryLabels || {};

  const activeCategories = React.useMemo(() => {
    return navOrder
      .map((id: string) => CATEGORIES.find((cat) => cat.id === id))
      .filter((cat): cat is (typeof CATEGORIES)[0] => Boolean(cat && !disabledCats.includes(cat.id)));
  }, [navOrder, disabledCats]);

  const customStatesList =
    hf.customStates && hf.customStates.length > 0 ? hf.customStates : MAJOR_INDIAN_STATES;
  const disabledStatesList = hf.disabledStates || [];
  const activeStatesList = React.useMemo(() => {
    return customStatesList.filter((s) => !disabledStatesList.includes(s));
  }, [customStatesList, disabledStatesList]);

  // Mobile Accordion state: 'categories' open by default so readers instantly see topics, others collapsible
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    states: false,
    policies: false,
    services: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 100% Strict Light Mode Editorial Footer styling
  const theme = {
    wrapper: 'bg-white text-slate-700 border-t border-slate-200 shadow-2xs',
    headerText: 'text-slate-900',
    sectionBorder: 'border-slate-200',
    link: 'text-slate-600 hover:text-red-700 transition-colors',
    mutedText: 'text-slate-500',
    divider: 'border-slate-200',
    inputBg: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-600',
    socialBtn: 'bg-white hover:bg-slate-100 text-slate-700 hover:text-red-700 border border-slate-200 shadow-2xs',
    bottomBar: 'border-slate-200 text-slate-500',
    bottomLink: 'text-slate-700 hover:text-red-600',
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenSubscriberPreferences) {
      onOpenSubscriberPreferences();
      return;
    }
    if (emailSub.trim()) {
      setSubSuccess(true);
      setTimeout(() => {
        setEmailSub('');
        setSubSuccess(false);
      }, 3000);
    }
  };

  const handleCategoryClick = (cat: NewsCategory, e: React.MouseEvent) => {
    e.preventDefault();
    onSelectCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLegalClick = (type: LegalPolicyType, e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenLegalPolicy) {
      onOpenLegalPolicy(type);
    }
  };

  const handleStateClick = (stateName: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onSearchState) {
      onSearchState(stateName);
    } else {
      onSelectCategory('state');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerAd: FooterBannerAdConfig = {
    ...DEFAULT_FOOTER_BANNER_AD_CONFIG,
    ...(portalSettings?.footerBannerAd || hf.footerBannerAd || {}),
  };

  // Sticky Advertisement Controls (Close & Minimize) State with Session Storage Memory
  const [isAdClosed, setIsAdClosed] = useState(() => {
    try {
      return sessionStorage.getItem('kd_footer_ad_closed') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdMinimized, setIsAdMinimized] = useState(() => {
    try {
      return sessionStorage.getItem('kd_footer_ad_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const handleCloseAd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdClosed(true);
    try {
      sessionStorage.setItem('kd_footer_ad_closed', 'true');
    } catch {}
  };

  const handleToggleMinimize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdMinimized((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem('kd_footer_ad_minimized', String(next));
      } catch {}
      return next;
    });
  };

  const handleRestoreAd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdClosed(false);
    setIsAdMinimized(false);
    try {
      sessionStorage.removeItem('kd_footer_ad_closed');
      sessionStorage.removeItem('kd_footer_ad_minimized');
    } catch {}
  };

  return (
    <footer
      role="contentinfo"
      aria-label="साइट फुटर"
      className={`${theme.wrapper} relative z-10 pt-10 sm:pt-12 pb-20 sm:pb-8 font-kd-body font-kd-footer transition-colors duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Quick Trigger Banner (Visible Only to Admin) */}
        {isAdmin && onOpenAdminSettings && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 px-4 flex items-center justify-between flex-wrap gap-2 text-xs font-kd-meta text-slate-800 shadow-2xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-bold text-red-900">Admin Footer Control:</span>
              <span className="text-slate-600">Theme, Mobile Footer Settings, Testing Banner Ad & RNI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAdminSettings('mobile_footer')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <span>📱 Mobile Footer</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAdminSettings('footer')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Footer Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. TOP EDITORIAL BANNER: BRAND MASTHEAD + COMPACT NEWSLETTER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-inherit">
          {/* Brand Identity */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              {((hf.footerLogoUrl && hf.footerLogoUrl.trim() !== '') || (hf.logoUrl && hf.logoUrl.trim() !== '')) ? (
                <img
                  src={hf.footerLogoUrl?.trim() || hf.logoUrl?.trim()}
                  alt={hf.siteTitle || 'खबरी दोस्त'}
                  className="h-28 sm:h-36 w-auto max-w-[480px] object-contain"
                />
              ) : (
                <>
                  <span className="w-4 h-4 rounded-full bg-red-600 shrink-0"></span>
                  <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black font-kd-header tracking-tight ${theme.headerText}`}>
                    {hf.siteTitle || 'खबरी दोस्त'}
                  </h2>
                </>
              )}
            </div>
            <div className={`text-xs sm:text-sm leading-relaxed space-y-1.5 ${theme.link}`}>
              <p>
                {hf.footerAboutText ||
                  'खबरी दोस्त आपका अपना सच्चा और निष्पक्ष हिंदी न्यूज़ पोर्टल है। यहाँ आपको देश, राजनीति, खेल, मनोरंजन और आपके शहर की हर ताज़ा खबर सबसे पहले और आसान भाषा में मिलती है। हम बिना किसी पक्षपात के सिर्फ सच और जरूरी जानकारी आप तक पहुँचाने के लिए प्रतिबद्ध हैं।'}
              </p>
            </div>
          </div>

          {/* Newsletter & Social Links (Clean, Compact, Natural) */}
          <div className="flex flex-col sm:items-start lg:items-end space-y-3">
            {/* Newsletter input */}
            <form onSubmit={handleSubscribe} className="w-full sm:w-80">
              <div className="flex gap-1.5">
                <input
                  type="email"
                  required
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="अपना ईमेल दर्ज करें..."
                  className={`flex-1 rounded-lg px-3 py-2 text-xs border focus:outline-none focus:ring-1 ${theme.inputBg}`}
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  {subSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">सब्सक्राइब</span>
                </button>
              </div>
            </form>

            {/* Social Icons + WhatsApp Bulletin Channel */}
            <div className="flex items-center flex-wrap gap-2">


              {/* Standard Social Icons */}
              <div className="flex items-center space-x-1.5">
              {/* WhatsApp */}
              <a
                href={hf.socialLinks?.whatsappChannel || 'https://whatsapp.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
                title="WhatsApp Channel"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a
                href={hf.socialLinks?.telegramChannel || 'https://t.me/example'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Channel"
                title="Telegram Channel"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={hf.socialLinks?.youtube || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                title="YouTube Channel"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={hf.socialLinks?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                title="Facebook Page"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href={hf.socialLinks?.twitter || 'https://x.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X Twitter"
                title="X Twitter"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              {hf.socialLinks?.instagram && (
                <a
                  href={hf.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {/* Custom Social Channels added by Admin - Official SVG Icons Only */}
              {hf.customSocialChannels &&
                hf.customSocialChannels
                  .filter((c) => c.enabled)
                  .map((ch) => (
                    <a
                      key={ch.id}
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={ch.platform}
                      aria-label={ch.platform}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${theme.socialBtn}`}
                    >
                      {renderOfficialSocialIcon(ch.platform)}
                    </a>
                  ))}
            </div>
          </div>
        </div>
        </div>

        {/* 2. SYMMETRICAL 4-COLUMN EDITORIAL DIRECTORY WITH MOBILE ACCORDIONS */}
        <div
          style={{
            fontSize: portalSettings?.typography?.footerTextPx
              ? `${portalSettings.typography.footerTextPx}px`
              : undefined,
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-10 text-xs font-kd-meta"
        >
          {/* COLUMN 1: PRAMUKH VISHAY */}
          <div className={`border-b sm:border-b-0 ${theme.sectionBorder} pb-3 sm:pb-0`}>
            {/* Header: Clickable button on mobile to toggle accordion, static title on desktop */}
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className={`w-full flex items-center justify-between sm:cursor-default py-1.5 sm:py-0 border-b sm:border-b ${theme.sectionBorder} pb-2 text-left`}
            >
              <h3
                style={{
                  fontSize: portalSettings?.typography?.footerHeadingPx
                    ? `${portalSettings.typography.footerHeadingPx}px`
                    : undefined,
                }}
                className={`text-xs sm:text-sm font-bold tracking-wider uppercase font-kd-headline ${theme.headerText}`}
              >
                प्रमुख विषय
              </h3>
              <ChevronDown
                className={`w-4 h-4 sm:hidden transition-transform duration-200 ${
                  openSections.categories ? 'rotate-180 text-red-500' : 'text-slate-400'
                }`}
              />
            </button>
            <div className={`${openSections.categories ? 'block' : 'hidden'} sm:!block pt-2 sm:pt-3`}>
              <ul className="grid grid-cols-2 gap-y-2 gap-x-2">
                {activeCategories.filter((c) => c.id !== 'all').map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`#category/${cat.id}`}
                      onClick={(e) => handleCategoryClick(cat.id, e)}
                      className={`${theme.link} block py-0.5 truncate`}
                    >
                      {customCatLabels[cat.id] || cat.labelHindi}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* COLUMN 2: REGIONAL / STATES */}
          <div className={`border-b sm:border-b-0 ${theme.sectionBorder} pb-3 sm:pb-0`}>
            <button
              type="button"
              onClick={() => toggleSection('states')}
              className={`w-full flex items-center justify-between sm:cursor-default py-1.5 sm:py-0 border-b sm:border-b ${theme.sectionBorder} pb-2 text-left`}
            >
              <h3 className={`text-xs sm:text-sm font-bold tracking-wider uppercase font-kd-headline ${theme.headerText}`}>
                राज्य व शहर
              </h3>
              <ChevronDown
                className={`w-4 h-4 sm:hidden transition-transform duration-200 ${
                  openSections.states ? 'rotate-180 text-red-500' : 'text-slate-400'
                }`}
              />
            </button>
            <div className={`${openSections.states ? 'block' : 'hidden'} sm:!block pt-2 sm:pt-3`}>
              <ul className="grid grid-cols-2 gap-y-2 gap-x-2">
                {activeStatesList.slice(0, 16).map((state) => (
                  <li key={state}>
                    <a
                      href={`#state/${encodeURIComponent(state)}`}
                      onClick={(e) => handleStateClick(state, e)}
                      className={`${theme.link} block py-0.5 truncate`}
                    >
                      {state}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* COLUMN 3: EDITORIAL & LEGAL POLICIES */}
          <div className={`border-b sm:border-b-0 ${theme.sectionBorder} pb-3 sm:pb-0`}>
            <button
              type="button"
              onClick={() => toggleSection('policies')}
              className={`w-full flex items-center justify-between sm:cursor-default py-1.5 sm:py-0 border-b sm:border-b ${theme.sectionBorder} pb-2 text-left`}
            >
              <h3 className={`text-xs sm:text-sm font-bold tracking-wider uppercase font-kd-headline ${theme.headerText}`}>
                नीतियां एवं नियम
              </h3>
              <ChevronDown
                className={`w-4 h-4 sm:hidden transition-transform duration-200 ${
                  openSections.policies ? 'rotate-180 text-red-500' : 'text-slate-400'
                }`}
              />
            </button>
            <div className={`${openSections.policies ? 'block' : 'hidden'} sm:!block pt-2 sm:pt-3`}>
              <ul className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 gap-y-2 gap-x-2">
                {onOpenAboutUsPage && (
                  <li>
                    <button
                      onClick={onOpenAboutUsPage}
                      className={`${theme.link} text-left cursor-pointer block py-0.5 truncate`}
                    >
                      हमारे बारे में (About Us)
                    </button>
                  </li>
                )}
                <li>
                  <a
                    href="#privacy-policy"
                    onClick={(e) => handleLegalClick('privacy', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    गोपनीयता नीति (Privacy Policy)
                  </a>
                </li>
                <li>
                  <a
                    href="#terms-of-service"
                    onClick={(e) => handleLegalClick('terms', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    नियम एवं शर्तें (Terms)
                  </a>
                </li>
                <li>
                  <a
                    href="#cookie-policy"
                    onClick={(e) => handleLegalClick('cookies', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    कुकीज़ नीति (Cookie Policy)
                  </a>
                </li>
                <li>
                  <a
                    href="#grievance-redressal"
                    onClick={(e) => handleLegalClick('grievance', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    शिकायत निवारण (Grievance)
                  </a>
                </li>
                <li>
                  <a
                    href="#fact-check-policy"
                    onClick={(e) => handleLegalClick('factCheck', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    तथ्य-जांच नीति (Fact-Checking)
                  </a>
                </li>
                <li>
                  <a
                    href="#editorial-ethics"
                    onClick={(e) => handleLegalClick('ethics', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    संपादकीय आचार संहिता
                  </a>
                </li>
                <li>
                  <a
                    href="#disclaimer"
                    onClick={(e) => handleLegalClick('disclaimer', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    डिस्क्लेमर (Disclaimer)
                  </a>
                </li>
                <li>
                  <a
                    href="#dmca-notice"
                    onClick={(e) => handleLegalClick('dmca', e)}
                    className={`${theme.link} block py-0.5 truncate`}
                  >
                    कॉपीराइट व DMCA नोटिस
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMN 4: SERVICES & NEWSROOM CONTACT */}
          <div className="pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('services')}
              className={`w-full flex items-center justify-between sm:cursor-default py-1.5 sm:py-0 border-b sm:border-b ${theme.sectionBorder} pb-2 text-left`}
            >
              <h3 className={`text-xs sm:text-sm font-bold tracking-wider uppercase font-kd-headline ${theme.headerText}`}>
                सेवाएं एवं संपर्क
              </h3>
              <ChevronDown
                className={`w-4 h-4 sm:hidden transition-transform duration-200 ${
                  openSections.services ? 'rotate-180 text-red-500' : 'text-slate-400'
                }`}
              />
            </button>
            <div className={`${openSections.services ? 'block' : 'hidden'} sm:!block pt-2 sm:pt-3 space-y-3`}>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={onOpenEPaper}
                    className={`${theme.link} text-left cursor-pointer block py-0.5 font-medium truncate`}
                  >
                    ई-पेपर (E-Paper)
                  </button>
                </li>
                {onOpenArchivePage && (
                  <li>
                    <button
                      onClick={onOpenArchivePage}
                      className={`${theme.link} text-left cursor-pointer block py-0.5 truncate`}
                    >
                      समाचार पुरालेख (Archive)
                    </button>
                  </li>
                )}
                {onOpenSubmitNews && (
                  <li>
                    <button
                      onClick={onOpenSubmitNews}
                      className={`${theme.link} text-left cursor-pointer block py-0.5 truncate`}
                    >
                      खबर भेजें (Submit News)
                    </button>
                  </li>
                )}

                {onOpenContactPage && (
                  <li>
                    <button
                      onClick={onOpenContactPage}
                      className={`${theme.link} text-left cursor-pointer block py-0.5 truncate font-semibold text-red-500`}
                    >
                      संपादकीय संपर्क व कार्यालय विवरण ➔
                    </button>
                  </li>
                )}
                {onOpenSubscriberPreferences && (
                  <li>
                    <button
                      onClick={onOpenSubscriberPreferences}
                      className={`${theme.link} text-left cursor-pointer block py-0.5 truncate`}
                    >
                      अलर्ट एवं पसंदीदा विषय
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT & ATTRIBUTION BAR */}
        <div className={`pt-6 border-t ${theme.bottomBar} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-kd-meta`}>
          <div className="flex items-center flex-wrap gap-2 text-center sm:text-left">
            <span>
              © {new Date().getFullYear()} {hf.footerBottomName || hf.siteTitle || 'खबरी दोस्त'} • All Rights Reserved.
            </span>
            {hf.showRniNumber === true && hf.rniNumber && (
              <span className="opacity-75 font-mono text-[11px]">| RNI: {hf.rniNumber}</span>
            )}
          </div>
          <div>
            <span className="opacity-80 flex items-center space-x-1.5 flex-wrap justify-center sm:justify-end">
              <span>Technology & Growth Partner:</span>
              <a
                href={hf.footerBrandingPartnerUrl || 'https://itreenet.com'}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.bottomLink} font-bold underline underline-offset-2 transition hover:text-red-500`}
                title={hf.footerBrandingPartnerName || 'iTree Network Solutions'}
              >
                {hf.footerBrandingPartnerName || 'iTree Network Solutions'}
              </a>
            </span>
          </div>
        </div>

        {/* 4. STICKY FOOTER BANNER ADVERTISEMENT WITH LEFT-SIDE CLOSE & MINIMIZE CONTROLS */}
        {footerAd.enabled !== false && (
          <>
            {/* A. Closed state restore button (subtle floating pill) */}
            {isAdClosed && (
              <div className="fixed bottom-[60px] md:bottom-3 left-3 md:left-6 z-40 animate-in fade-in duration-200 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleRestoreAd}
                  className="bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-slate-300 shadow-xl flex items-center gap-1.5 backdrop-blur-md transition hover:scale-105 cursor-pointer font-kd-headline"
                  title="विज्ञापन पुनः देखें / Restore Footer Advertisement"
                >
                  <Megaphone className="w-3.5 h-3.5 text-red-600" />
                  <span>विज्ञापन देखें (Show Ad)</span>
                </button>
              </div>
            )}

            {/* B. Minimized state (compact floating pill on the left) */}
            {!isAdClosed && isAdMinimized && (
              <div className="fixed bottom-[60px] md:bottom-3 left-3 md:left-6 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
                <div className="flex items-center gap-1.5 bg-white/95 border border-slate-300 rounded-full shadow-xl p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={handleToggleMinimize}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-800 hover:text-red-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                    title="विज्ञापन बड़ा करें / Expand Advertisement"
                  >
                    <Plus className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[11px] font-kd-headline">विज्ञापन (Ad)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseAd}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-600 transition cursor-pointer"
                    title="विज्ञापन बंद करें / Close Ad"
                    aria-label="Close Ad"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* C. Full Sticky Footer Banner Ad (Desktop: bottom-0, Mobile: above bottom nav bar at bottom-[56px]) */}
            {!isAdClosed && !isAdMinimized && (
              <div className="fixed bottom-[56px] sm:bottom-[60px] md:bottom-0 left-0 right-0 z-40 pointer-events-none px-2 sm:px-4 pb-1 sm:pb-2 transition-all duration-300 animate-in slide-in-from-bottom-4">
                <div className="pointer-events-auto max-w-5xl w-full mx-auto bg-white/98 border border-slate-300 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden relative flex items-stretch">
                  
                  {/* Left-Side Controls Dock: Close (✕) & Minimize (−) */}
                  <div className="bg-slate-50 flex flex-col justify-center items-center px-1.5 sm:px-2.5 py-1.5 border-r border-slate-200 shrink-0 gap-1.5 z-20">
                    {/* 1. Close Button (✕) */}
                    <button
                      type="button"
                      onClick={handleCloseAd}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center transition cursor-pointer shadow-xs"
                      title="Close Advertisement / विज्ञापन बंद करें"
                      aria-label="Close Advertisement"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {/* 2. Minimize Button (−) */}
                    <button
                      type="button"
                      onClick={handleToggleMinimize}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-600 border border-slate-200 flex items-center justify-center transition cursor-pointer shadow-xs"
                      title="Minimize Advertisement / विज्ञापन छोटा करें"
                      aria-label="Minimize Advertisement"
                    >
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <span className="text-[9px] font-black text-red-600 uppercase tracking-wider font-mono">
                      AD
                    </span>
                  </div>

                  {/* Ad Content: Custom Script/HTML or Linked Responsive Banner */}
                  {footerAd.type === 'script' && footerAd.scriptCode ? (
                    <AdCode
                      code={footerAd.scriptCode}
                      className="flex-1 min-w-0 p-2 sm:p-3 bg-slate-50 text-slate-800 flex justify-center items-center overflow-hidden min-h-[50px] sm:min-h-[80px]"
                    />
                  ) : (
                    <a
                      href={footerAd.targetUrl || '#contact'}
                      onClick={(e) => {
                        if (footerAd.targetUrl === '#contact' || !footerAd.targetUrl) {
                          e.preventDefault();
                          if (onOpenContactPage) onOpenContactPage();
                          else window.location.hash = 'contact';
                        }
                      }}
                      target={footerAd.targetUrl?.startsWith('http') ? '_blank' : undefined}
                      rel={footerAd.targetUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex-1 min-w-0 group block relative overflow-hidden"
                      title={footerAd.altText || 'खबरी दोस्त फुटर विज्ञापन बैनर'}
                    >
                      {/* 1. DESKTOP FOOTER BANNER (728x90 / Responsive Leaderboard) */}
                      <div className="hidden sm:flex relative w-full h-[76px] lg:h-[86px] bg-gradient-to-r from-red-50 via-white to-amber-50 items-center justify-between px-4 lg:px-7 overflow-hidden border-l border-slate-100">
                        <img
                          src={footerAd.desktopImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80'}
                          alt={footerAd.altText || 'डेस्कटॉप फुटर विज्ञापन बैनर'}
                          className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-transparent" />

                        <div className="relative z-10 space-y-0.5 max-w-xl text-left">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.2 rounded font-mono shadow-2xs">
                              विशेष ऑफ़र
                            </span>
                            <span className="text-[11px] font-bold text-red-700 font-kd-meta">
                              Sticky Banner Ad
                            </span>
                          </div>
                          <h4 className="text-sm lg:text-base font-bold text-slate-900 font-kd-headline line-clamp-1">
                            {footerAd.title || 'खबरी दोस्त डिजिटल न्यूज़ नेटवर्क • विशेष विज्ञापन'}
                          </h4>
                          <p className="text-[11px] text-slate-600 font-kd-body line-clamp-1">
                            {footerAd.subTitle}
                          </p>
                        </div>

                        <div className="relative z-10 flex items-center space-x-3 shrink-0 ml-3">
                          <span className="bg-red-600 group-hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-sm group-hover:scale-105 transition duration-200">
                            <span>देखें</span>
                            <span>➔</span>
                          </span>
                        </div>
                      </div>

                      {/* 2. MOBILE FOOTER BANNER (320x50 / Mobile Responsive) */}
                      <div className="flex sm:hidden relative w-full min-h-[50px] bg-gradient-to-r from-red-50 to-white items-center justify-between px-2.5 py-1.5 overflow-hidden border-l border-slate-100">
                        <img
                          src={footerAd.mobileImageUrl || footerAd.desktopImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80'}
                          alt={footerAd.altText || 'मोबाइल फुटर विज्ञापन'}
                          className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-transparent" />

                        <div className="relative z-10 flex items-center space-x-2 flex-1 min-w-0 pr-2 text-left">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate font-kd-headline">
                              {footerAd.title || 'खबरी दोस्त विज्ञापन'}
                            </p>
                            <p className="text-[10px] text-slate-600 truncate font-kd-meta">
                              {footerAd.subTitle}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 shrink-0">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 shadow-2xs">
                            <span>देखें</span>
                            <span>➔</span>
                          </span>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Bottom spacer to prevent sticky banner from obscuring footer content when scrolled to bottom */}
            {!isAdClosed && !isAdMinimized && (
              <div className="h-20 sm:h-24 w-full" aria-hidden="true" />
            )}
          </>
        )}

        {/* Anchor marker to detect footer end and ensure complete visibility */}
        <div id="site-footer-bottom-marker" className="h-4 sm:h-2 w-full pb-[env(safe-area-inset-bottom)]" aria-hidden="true" />
      </div>
    </footer>
  );
};
