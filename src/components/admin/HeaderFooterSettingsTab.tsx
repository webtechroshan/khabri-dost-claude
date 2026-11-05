import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sliders,
  Share2,
  Mail,
  ShieldCheck,
  Sparkles,
  MapPin,
  FileText,
  Tv,
  Newspaper,
  BookMarked,
  Radio,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  Search,
  ExternalLink,
  Code2,
  Camera,
  Layers,
  RotateCcw,
  Smartphone,
  Upload,
  Image as ImageIcon,
  Megaphone,
  Home,
  Zap,
  Flame,
  Gamepad2,
  Send,
  Archive,
  PhoneCall,
  X,
  Link2,
  Hash,
  Scale,
} from 'lucide-react';
import {
  PortalSettings,
  HeaderFooterSettings,
  CustomSocialChannel,
  PhotoStoryItem,
  NetworkEdition,
  MobileStickyBarConfig,
  FooterBannerAdConfig,
  MobileBottomNavConfig,
  BottomNavItemConfig,
  BottomNavItemType,
} from '../../types/news';
import { CATEGORIES, MAJOR_INDIAN_STATES } from '../../data/seedNews';
import {
  INITIAL_PHOTO_STORIES,
  DEFAULT_MOBILE_STICKY_BAR_CONFIG,
  DEFAULT_FOOTER_BANNER_AD_CONFIG,
  DEFAULT_MOBILE_BOTTOM_NAV_CONFIG,
  DEFAULT_BOTTOM_NAV_ITEMS,
  BOTTOM_NAV_PRESETS,
} from '../../data/portalDefaults';

interface HeaderFooterSettingsTabProps {
  settings: PortalSettings;
  onChange: (newSettings: PortalSettings) => void;
  defaultSection?: 'branding' | 'navigation' | 'states' | 'social' | 'footer' | 'contact' | 'policies' | 'multimedia' | 'ads' | 'editions' | 'mobile_footer';
  onOpenFactoryReset?: () => void;
}

export const HeaderFooterSettingsTab: React.FC<HeaderFooterSettingsTabProps> = ({
  settings,
  onChange,
  defaultSection = 'branding',
  onOpenFactoryReset,
}) => {
  const [activeSection, setActiveSection] = useState<
    'branding' | 'navigation' | 'states' | 'social' | 'footer' | 'contact' | 'policies' | 'multimedia' | 'ads' | 'editions' | 'mobile_footer'
  >(defaultSection);

  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection]);

  // New social channel input state
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');

  // New state input
  const [newStateName, setNewStateName] = useState('');

  // Category heading rename state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');

  // New photo story input state
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoLocation, setNewPhotoLocation] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('राष्ट्रीय');

  // New Network Edition inputs
  const [newEditionName, setNewEditionName] = useState('');
  const [newEditionLang, setNewEditionLang] = useState('en');
  const [newEditionIcon, setNewEditionIcon] = useState('🌐');
  const [newEditionUrl, setNewEditionUrl] = useState('');
  const [newEditionNewTab, setNewEditionNewTab] = useState(true);

  const current: HeaderFooterSettings = settings.headerFooter || {
    siteTitle: 'खबरी दोस्त',
    siteTagline: 'KHABRI DOST • भारत का विश्वसनीय हिंदी न्यूज़ पोर्टल',
    contactEmail: 'khabridost.com@gmail.com',
    contactAddress: '',
    contactPhone: '',
    rniNumber: '',
    showRniNumber: false,
    footerTheme: 'light',
    footerAboutHeading: 'खबरी दोस्त • निष्पक्ष पत्रकारिता का संकल्प',
    footerAboutText:
      'भारत का अग्रणी, स्वतंत्र और निष्पक्ष डिजिटल समाचार मंच। सत्य, सटीकता और जनहित की पत्रकारिता के प्रति पूर्णतः समर्पित।',
    footerBrandingPartnerName: 'iTree Network Solutions',
    footerBrandingPartnerUrl: 'https://itreenet.com',
    footerBottomName: 'खबरी दोस्त डिजिटल न्यूज़ नेटवर्क',
    headerShowLiveTv: true,
    headerShowEPaper: true,
    headerShowBookmarks: true,
    headerShowNewsTicker: true,
    headerShowMegaMenu: true,
    headerShowSearch: true,
    headerShowAdminButton: true,
    socialLinks: {
      whatsappChannel: 'https://whatsapp.com/channel/example',
      telegramChannel: 'https://t.me/example',
      facebook: 'https://facebook.com',
      twitter: 'https://x.com',
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
    },
    customSocialChannels: [],
    navCategoryOrder: [
      'national',
      'state',
      'politics',
      'business',
      'entertainment',
      'sports',
      'tech',
      'lifestyle',
      'world',
    ],
    disabledCategories: [],
    legalPolicies: {
      factCheckPolicy: 'We strictly verify all news claims with primary sources, official records, and ground correspondents before publication.',
      editorialEthics: 'We maintain independent reporting, free from bias, ensuring accurate, transparent, and fair journalism.',
      grievanceRedressal: 'Grievance Officer: Desk Head, Email: grievance@khabridost.com. Responses are issued within 24 hours under digital media guidelines.',
      privacyPolicy: 'We respect your privacy. Subscriber emails and visitor data are securely encrypted and never shared with third-party advertisers.',
      termsOfService: 'All portal content is protected by copyright. Reproduction without attribution is strictly prohibited.',
    },
  };

  const updateHeaderFooter = (updates: Partial<HeaderFooterSettings>) => {
    onChange({
      ...settings,
      headerFooter: {
        ...current,
        ...updates,
      },
    });
  };

  const updateSocialLinks = (key: keyof HeaderFooterSettings['socialLinks'], value: string) => {
    updateHeaderFooter({
      socialLinks: {
        ...current.socialLinks,
        [key]: value,
      },
    });
  };

  // Add custom social channel
  const handleAddCustomSocial = () => {
    if (!newPlatformName.trim() || !newPlatformUrl.trim()) return;
    const newChan: CustomSocialChannel = {
      id: `custom-soc-${Date.now()}`,
      platform: newPlatformName.trim(),
      url: newPlatformUrl.trim(),
      enabled: true,
    };
    updateHeaderFooter({
      customSocialChannels: [...(current.customSocialChannels || []), newChan],
    });
    setNewPlatformName('');
    setNewPlatformUrl('');
  };

  const handleToggleCustomSocial = (id: string) => {
    const updated = (current.customSocialChannels || []).map((ch) =>
      ch.id === id ? { ...ch, enabled: !ch.enabled } : ch
    );
    updateHeaderFooter({ customSocialChannels: updated });
  };

  const handleDeleteCustomSocial = (id: string) => {
    const updated = (current.customSocialChannels || []).filter((ch) => ch.id !== id);
    updateHeaderFooter({ customSocialChannels: updated });
  };

  // Language & Network Editions Handlers
  const handleAddEdition = () => {
    if (!newEditionName.trim() || !newEditionUrl.trim()) return;
    const currentEditions = current.languageEditions || [
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
    ];
    const newEd: NetworkEdition = {
      id: `ed-${Date.now()}`,
      name: newEditionName.trim(),
      langCode: newEditionLang.trim() || 'en',
      icon: newEditionIcon.trim() || '🌐',
      url: newEditionUrl.trim(),
      openInNewTab: newEditionNewTab,
      enabled: true,
      isCurrent: false,
    };
    updateHeaderFooter({
      languageEditions: [...currentEditions, newEd],
    });
    setNewEditionName('');
    setNewEditionUrl('');
    setNewEditionIcon('🌐');
  };

  const handleToggleEdition = (id: string) => {
    const currentEditions = current.languageEditions || [
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
    updateHeaderFooter({
      languageEditions: currentEditions.map((e) =>
        e.id === id ? { ...e, enabled: !e.enabled } : e
      ),
    });
  };

  const handleDeleteEdition = (id: string) => {
    const currentEditions = current.languageEditions || [];
    updateHeaderFooter({
      languageEditions: currentEditions.filter((e) => e.id !== id),
    });
  };

  // Navigation category ordering & toggling
  const categoryOrder = current.navCategoryOrder || [
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
  const disabledCats = current.disabledCategories || [];

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...categoryOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    updateHeaderFooter({ navCategoryOrder: newOrder });
  };

  const handleToggleCategory = (catId: string) => {
    const isCurrentlyDisabled = disabledCats.includes(catId);
    const newDisabled = isCurrentlyDisabled
      ? disabledCats.filter((id) => id !== catId)
      : [...disabledCats, catId];
    updateHeaderFooter({ disabledCategories: newDisabled });
  };

  // Category custom heading handler
  const handleSaveCategoryHeading = (catId: string) => {
    if (!editingCatLabel.trim()) return;
    updateHeaderFooter({
      customCategoryLabels: {
        ...(current.customCategoryLabels || {}),
        [catId]: editingCatLabel.trim(),
      },
    });
    setEditingCatId(null);
    setEditingCatLabel('');
  };

  // Indian States Ordering & Customization
  const statesList =
    current.customStates && current.customStates.length > 0
      ? current.customStates
      : MAJOR_INDIAN_STATES;
  const disabledStates = current.disabledStates || [];

  const handleMoveState = (index: number, direction: 'up' | 'down') => {
    const newStates = [...statesList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStates.length) return;
    const temp = newStates[index];
    newStates[index] = newStates[targetIndex];
    newStates[targetIndex] = temp;
    updateHeaderFooter({ customStates: newStates });
  };

  const handleToggleState = (stateName: string) => {
    const isCurrentlyDisabled = disabledStates.includes(stateName);
    const newDisabled = isCurrentlyDisabled
      ? disabledStates.filter((s) => s !== stateName)
      : [...disabledStates, stateName];
    updateHeaderFooter({ disabledStates: newDisabled });
  };

  const handleAddState = () => {
    if (!newStateName.trim()) return;
    const trimmed = newStateName.trim();
    if (statesList.includes(trimmed)) return;
    updateHeaderFooter({ customStates: [...statesList, trimmed] });
    setNewStateName('');
  };

  const handleDeleteState = (stateName: string) => {
    updateHeaderFooter({
      customStates: statesList.filter((s) => s !== stateName),
      disabledStates: disabledStates.filter((s) => s !== stateName),
    });
  };

  // Policies update
  const defaultLegalPolicies = {
    factCheckPolicy: 'We strictly verify all news claims with primary sources, official records, and ground correspondents before publication.',
    editorialEthics: 'We maintain independent reporting, free from bias, ensuring accurate, transparent, and fair journalism.',
    grievanceRedressal: 'Grievance Officer: Desk Head, Email: grievance@khabridost.com. Responses are issued within 24 hours under digital media guidelines.',
    privacyPolicy: 'We respect your privacy. Subscriber emails and visitor data are securely encrypted and never shared with third-party advertisers.',
    termsOfService: 'All portal content is protected by copyright. Reproduction without attribution is strictly prohibited.',
  };

  const updatePolicies = (key: keyof typeof defaultLegalPolicies, value: string) => {
    updateHeaderFooter({
      legalPolicies: {
        ...defaultLegalPolicies,
        ...(current.legalPolicies || {}),
        [key]: value,
      },
    });
  };

  // Photo stories management
  const photoStories: PhotoStoryItem[] =
    settings.customPhotoStories && settings.customPhotoStories.length > 0
      ? settings.customPhotoStories
      : INITIAL_PHOTO_STORIES;

  const handleAddPhotoStory = () => {
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) return;
    const newStory: PhotoStoryItem = {
      id: `photo-${Date.now()}`,
      title: newPhotoTitle.trim(),
      imageUrl: newPhotoUrl.trim(),
      photosCount: 6,
      location: newPhotoLocation.trim() || 'भारत',
      category: newPhotoCategory,
      caption: newPhotoCaption.trim(),
      seoAltText: newPhotoCaption.trim() || newPhotoTitle.trim(),
    };
    onChange({
      ...settings,
      customPhotoStories: [newStory, ...photoStories],
    });
    setNewPhotoTitle('');
    setNewPhotoUrl('');
    setNewPhotoLocation('');
    setNewPhotoCaption('');
  };

  const handleDeletePhotoStory = (id: string) => {
    onChange({
      ...settings,
      customPhotoStories: photoStories.filter((p) => p.id !== id),
    });
  };

  // Mobile Bottom Navigation Bar (5 Items) Management
  const currentBottomNav: MobileBottomNavConfig = {
    ...DEFAULT_MOBILE_BOTTOM_NAV_CONFIG,
    ...(settings.mobileBottomNav || {}),
  };

  const updateMobileBottomNav = (updates: Partial<MobileBottomNavConfig>) => {
    const updated = { ...currentBottomNav, ...updates };
    onChange({
      ...settings,
      mobileBottomNav: updated,
    });
  };

  // Mobile Sticky Bar & Footer Banner Ad Management
  const currentSticky: MobileStickyBarConfig = {
    ...DEFAULT_MOBILE_STICKY_BAR_CONFIG,
    ...(settings.mobileStickyBar || settings.articlePageConfig?.mobileStickyBar || {}),
  };

  const updateMobileStickyBar = (updates: Partial<MobileStickyBarConfig>) => {
    const updated = { ...currentSticky, ...updates };
    onChange({
      ...settings,
      mobileStickyBar: updated,
      articlePageConfig: {
        ...(settings.articlePageConfig || {}),
        mobileStickyBar: updated,
      } as any,
    });
  };

  const currentFooterAd: FooterBannerAdConfig = {
    ...DEFAULT_FOOTER_BANNER_AD_CONFIG,
    ...(settings.footerBannerAd || current.footerBannerAd || {}),
  };

  const updateFooterAd = (updates: Partial<FooterBannerAdConfig>) => {
    const updated = { ...currentFooterAd, ...updates };
    onChange({
      ...settings,
      footerBannerAd: updated,
      headerFooter: {
        ...current,
        footerBannerAd: updated,
      },
    });
  };

  const handleStickyAdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateMobileStickyBar({ adImageUrl: reader.result, adType: 'image' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterDesktopAdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateFooterAd({ desktopImageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterMobileAdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateFooterAd({ mobileImageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateHeaderFooter({ logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateHeaderFooter({ faviconUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-slate-800">
      {/* Top Banner with Clean Unified Theme */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 text-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Website Customization & Core Settings (Unified Customizer)</span>
                <span className="text-[10px] bg-red-600 text-white font-mono px-2 py-0.5 rounded-full uppercase">
                  ADMIN CONSOLE
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Header branding, navigation ordering, state editions, social & WhatsApp channels, footer, contact information, and legal policies.
              </p>
            </div>
          </div>
          {onOpenFactoryReset && (
            <button
              type="button"
              onClick={onOpenFactoryReset}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
              title="पोर्टल सेटिंग्स व टाइपोग्राफी को फ़ैक्टरी डिफ़ॉल्ट पर रीसेट करें"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Factory Reset (फ़ैक्टरी रीसेट)</span>
            </button>
          )}
        </div>

        {/* Unified Sub-Nav Switcher */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-200 flex-wrap gap-y-1.5">
          {[
            { id: 'branding', label: '1. Header & Branding', icon: Sliders },
            { id: 'navigation', label: '2. Navigation & Order', icon: Layers },
            { id: 'states', label: '3. State Editions', icon: MapPin },
            { id: 'social', label: '4. Social & WhatsApp', icon: Share2 },
            { id: 'footer', label: '5. Footer & About', icon: Mail },
            { id: 'contact', label: '6. Contact Details', icon: Mail },
            { id: 'multimedia', label: '7. Video & Photo Studio', icon: Camera },
            { id: 'ads', label: '8. Ad Slots & Scripts', icon: Code2 },
            { id: 'policies', label: '9. Legal & Policies', icon: ShieldCheck },
            { id: 'editions', label: '10. Network Editions (भाषा)', icon: Globe },
            { id: 'mobile_footer', label: '11. Mobile Footer Settings (मोबाइल फुटर)', icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. HEADER & BRANDING TAB */}
      {activeSection === 'branding' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Website Name, Logo & Tagline</span>
              </h4>
              <span className="text-xs text-slate-400">Desktop & Mobile Header</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Site Title
                </label>
                <input
                  type="text"
                  value={current.siteTitle}
                  onChange={(e) => updateHeaderFooter({ siteTitle: e.target.value })}
                  placeholder="Khabri Dost"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Tagline
                </label>
                <input
                  type="text"
                  value={current.siteTagline}
                  onChange={(e) => updateHeaderFooter({ siteTagline: e.target.value })}
                  placeholder="KHABRI DOST • India's Trusted News Network"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
                {/* Master Portal Tagline Visibility Toggle */}
                <div className="mt-2.5 p-3 bg-red-50/70 rounded-xl border border-red-200/80 space-y-2">
                  <label className="flex items-center space-x-2.5 text-xs text-slate-800 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(current.showTagline)}
                      onChange={(e) => updateHeaderFooter({ showTagline: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Show Portal Tagline (वेबसाइट टैगलाइन दिखाएं / छिपाएं)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-normal pl-6">
                    अनचेक रहने पर लोगो के नीचे की टैगलाइन हेडर और मोबाइल मेनू में पूरी तरह छिपी (hidden) रहेगी।
                  </p>
                  {/* Additional Desktop & Mobile breakdown when tagline is enabled */}
                  {current.showTagline && (
                    <div className="flex items-center space-x-4 pt-1.5 pl-6 border-t border-red-100/80 text-xs">
                      <label className="flex items-center space-x-1.5 text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={current.showTaglineDesktop ?? true}
                          onChange={(e) => updateHeaderFooter({ showTaglineDesktop: e.target.checked })}
                          className="rounded text-red-600 focus:ring-red-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Desktop पर दिखाएं</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={current.showTaglineMobile ?? true}
                          onChange={(e) => updateHeaderFooter({ showTaglineMobile: e.target.checked })}
                          className="rounded text-red-600 focus:ring-red-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Mobile पर दिखाएं</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Custom Logo Image (वेबसाइट लोगो इमेज)
                  </label>
                  <label
                    htmlFor="admin-logo-upload"
                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>फ़ाइल अपलोड करें</span>
                  </label>
                  <input
                    id="admin-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={current.logoUrl || ''}
                  onChange={(e) => updateHeaderFooter({ logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png अथवा ऊपर से अपलोड करें"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition font-mono"
                />
                {current.logoUrl && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={current.logoUrl}
                        alt="Logo Preview"
                        className="h-8 max-w-[140px] object-contain rounded bg-white p-1 border border-slate-200 shadow-2xs"
                      />
                      <span className="text-[11px] text-slate-600 font-medium truncate">
                        सक्रिय लोगो इमेज
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateHeaderFooter({ logoUrl: '' })}
                      className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-white px-2 py-0.5 rounded border border-slate-200 transition"
                    >
                      हटाएं (Remove)
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                  इमेज लोगो सेट करने पर हेडर में टेक्स्ट के बजाय यह लोगो शो होगा (Desktop & Mobile दोनों पर)।
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Favicon / Mobile App Icon (फ़ेविकॉन)
                  </label>
                  <label
                    htmlFor="admin-favicon-upload"
                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>अपलोड करें</span>
                  </label>
                  <input
                    id="admin-favicon-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={current.faviconUrl || ''}
                  onChange={(e) => updateHeaderFooter({ faviconUrl: e.target.value })}
                  placeholder="https://example.com/icon.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition font-mono"
                />
              </div>

              {/* Logo Image Height & Title Size Controls */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Header Logo Image Height
                  </label>
                  <span className="text-xs font-mono font-bold text-red-600">
                    {current.headerLogoHeight || 52}px
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={90}
                  step={2}
                  value={current.headerLogoHeight || 52}
                  onChange={(e) => updateHeaderFooter({ headerLogoHeight: Number(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1">
                  {[36, 44, 52, 64, 76].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateHeaderFooter({ headerLogoHeight: sz })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                        (current.headerLogoHeight || 52) === sz
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Header Title Text Font Size
                  </label>
                  <span className="text-xs font-mono font-bold text-red-600">
                    {current.headerTitleCustomPx || 36}px
                  </span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={60}
                  step={2}
                  value={current.headerTitleCustomPx || 36}
                  onChange={(e) => updateHeaderFooter({ headerTitleCustomPx: Number(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1">
                  {[28, 32, 36, 44, 52].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateHeaderFooter({ headerTitleCustomPx: sz })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                        (current.headerTitleCustomPx || 36) === sz
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Header Utilities Toggles */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Header Elements Visibility (Enable / Disable)</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Realtime</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'headerShowLiveTv', label: 'Live TV Button', icon: Tv, desc: 'Top bar Live TV stream button' },
                { key: 'headerShowLiveCoverage', label: 'Live Coverage (Updates)', icon: Radio, desc: 'Navigation & mobile Live feed button' },
                { key: 'headerShowEPaper', label: 'e-Paper Edition Button', icon: Newspaper, desc: 'Digital newspaper reader button' },
                { key: 'headerShowBookmarks', label: 'Saved Bookmarks', icon: BookMarked, desc: 'Saved articles bookmark counter' },
                { key: 'headerShowNewsTicker', label: 'News Ticker (Breaking)', icon: Sparkles, desc: 'Top breaking news ticker strip' },
                { key: 'headerShowMegaMenu', label: 'Mega Menu Dropdown', icon: Layers, desc: 'Hover-based top stories grid' },
                { key: 'headerShowSearch', label: 'Search Bar', icon: Search, desc: 'Header search input and popup' },
                { key: 'headerShowAdminButton', label: 'Admin Panel Button', icon: Sliders, desc: 'Header quick admin access button' },
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = (current as any)[item.key] !== false;
                return (
                  <div
                    key={item.key}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-red-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateHeaderFooter({ [item.key]: !isEnabled })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        isEnabled
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. NAVIGATION MENU & SEQUENCE TAB */}
      {activeSection === 'navigation' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Navigation Menu Order & Categories (Desktop & Mobile)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Reorder navigation categories using up/down arrows or toggle visibility on frontend.
              </p>
            </div>
            <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
              Live Reorder
            </span>
          </div>

          <div className="space-y-2">
            {categoryOrder.map((catId, index) => {
              const catMeta = CATEGORIES.find((c) => c.id === catId);
              const isDisabled = disabledCats.includes(catId);
              if (!catMeta) return null;

              return (
                <div
                  key={catId}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                    isDisabled
                      ? 'bg-slate-100 border-slate-200 opacity-60'
                      : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      {editingCatId === catId ? (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <input
                            type="text"
                            value={editingCatLabel}
                            onChange={(e) => setEditingCatLabel(e.target.value)}
                            className="bg-white border border-red-400 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold"
                            placeholder={catMeta.labelHindi}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCategoryHeading(catId)}
                            className="bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="bg-slate-200 text-slate-700 text-[11px] px-1.5 py-1 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{current.customCategoryLabels?.[catId] || catMeta.labelHindi}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({catMeta.labelEnglish})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(catId);
                              setEditingCatLabel(current.customCategoryLabels?.[catId] || catMeta.labelHindi);
                            }}
                            className="text-[10px] text-red-600 hover:underline cursor-pointer"
                            title="Rename Category Title"
                          >
                            Rename ✎
                          </button>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono">ID: {catId}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveCategory(index, 'up')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer text-slate-700"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === categoryOrder.length - 1}
                      onClick={() => handleMoveCategory(index, 'down')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer text-slate-700"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(catId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        !isDisabled
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {!isDisabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{!isDisabled ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. INDIAN STATES ORDERING & CUSTOMIZATION TAB */}
      {activeSection === 'states' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>State Editions Ordering & Customization</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Reorder states in header state menu and footer, add new states/regions, or toggle state visibility.
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
              {statesList.length} States Active
            </span>
          </div>

          {/* Add New State Input Bar */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              placeholder="New State / Territory Name (e.g. Uttarakhand, Ladakh, Chhattisgarh)..."
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={handleAddState}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add State</span>
            </button>
          </div>

          {/* States Sequence List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {statesList.map((stateName, index) => {
              const isDisabled = disabledStates.includes(stateName);
              return (
                <div
                  key={stateName}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                    isDisabled
                      ? 'bg-slate-100 border-slate-200 opacity-60'
                      : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {stateName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveState(index, 'up')}
                      className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer text-slate-700"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === statesList.length - 1}
                      onClick={() => handleMoveState(index, 'down')}
                      className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer text-slate-700"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleState(stateName)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                        !isDisabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {!isDisabled ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteState(stateName)}
                      className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SOCIAL MEDIA CHANNELS TAB */}
      {activeSection === 'social' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Official Social Media Channels
                </h4>
                <p className="text-xs text-slate-500">
                  Social profile links displayed in top strip, article share cards, and footer directory.
                </p>
              </div>
            </div>

            {/* WhatsApp Community Bulletin Channel Featured Input */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                  <span>WhatsApp News Bulletin (Community Channel)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  Special Channel
                </span>
              </label>
              <p className="text-[11px] text-emerald-700 mb-2">
                Featured WhatsApp community broadcast channel link displayed across the portal.
              </p>
              <input
                type="url"
                value={current.whatsappNewsBulletinUrl || ''}
                onChange={(e) => updateHeaderFooter({ whatsappNewsBulletinUrl: e.target.value })}
                placeholder="https://whatsapp.com/channel/..."
                className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                { key: 'whatsappChannel', label: 'WhatsApp Channel URL', color: '#25D366' },
                { key: 'telegramChannel', label: 'Telegram Channel URL', color: '#229ED9' },
                { key: 'youtube', label: 'YouTube Channel URL', color: '#FF0000' },
                { key: 'facebook', label: 'Facebook Page URL', color: '#1877F2' },
                { key: 'twitter', label: 'X (Twitter) Profile URL', color: '#000000' },
                { key: 'instagram', label: 'Instagram Profile URL', color: '#E1306C' },
              ].map((item) => (
                <div key={item.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </label>
                  <input
                    type="url"
                    value={(current.socialLinks as any)[item.key] || ''}
                    onChange={(e) => updateSocialLinks(item.key as any, e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ADD MORE CUSTOM SOCIAL MEDIA CHANNELS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Add Custom Social Media Channels</span>
              <span className="text-xs text-slate-400">Threads, LinkedIn, Bluesky, etc.</span>
            </h4>

            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  placeholder="e.g. Threads, LinkedIn"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profile / Channel URL</label>
                <input
                  type="url"
                  value={newPlatformUrl}
                  onChange={(e) => setNewPlatformUrl(e.target.value)}
                  placeholder="https://threads.net/@..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddCustomSocial}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Channel</span>
                </button>
              </div>
            </div>

            {/* List of Custom Channels */}
            {current.customSocialChannels && current.customSocialChannels.length > 0 && (
              <div className="space-y-2 pt-2">
                {current.customSocialChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900">{ch.platform}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{ch.url}</div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCustomSocial(ch.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          ch.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {ch.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomSocial(ch.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. FOOTER & BRAND PARTNER TAB */}
      {activeSection === 'footer' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Footer & Branding Controls
              </h4>
              <p className="text-xs text-slate-500">
                About us narrative, theme mode, bureau contacts, RNI registration, and technology partner credits.
              </p>
            </div>
            <span className="text-xs text-slate-400">Desktop & Mobile</span>
          </div>

          {/* Mobile Footer & Sticky Ad Quick Switch Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-amber-950">
                  Mobile Footer & Sticky Advertisement Studio
                </h5>
                <p className="text-[11px] text-amber-800">
                  स्मार्टफ़ोन पाठकों के लिए बॉटम 'Social Sharing Bar' बनाम 'Sticky Advertisement' और फुटर टेस्टिंग बैनर।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('mobile_footer')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-2xs self-start sm:self-auto"
            >
              <span>ओपन मोबाइल फुटर सेटिंग्स</span>
              <span>➔</span>
            </button>
          </div>

          {/* Footer Theme Selector */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-900">
              Footer Theme Mode (100% Light Mode Standard)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Clean White (Default)', desc: 'Crisp white card background with high contrast' },
                { id: 'light_slate', label: 'Soft Slate Light', desc: 'Subtle slate neutral tone for clear separation' },
                { id: 'light_red', label: 'Warm Editorial Tint', desc: 'Subtle light warm crimson tint background' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => updateHeaderFooter({ footerTheme: th.id as any })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    (current.footerTheme || 'light') === th.id
                      ? 'border-red-600 bg-white ring-2 ring-red-400 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{th.label}</div>
                  <p className="text-[10px] text-slate-500 mt-1">{th.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Dedicated Logo Update */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900">
                Dedicated Footer Logo URL
              </label>
              <span className="text-[10px] text-slate-500 font-mono">PNG / SVG / JPG</span>
            </div>
            <p className="text-[11px] text-slate-500">
              High-visibility logo rendered in footer. Falls back to primary logo if omitted.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={current.footerLogoUrl || ''}
                onChange={(e) => updateHeaderFooter({ footerLogoUrl: e.target.value })}
                placeholder="https://example.com/footer-logo.png"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {current.footerLogoUrl && (
                <button
                  type="button"
                  onClick={() => updateHeaderFooter({ footerLogoUrl: '' })}
                  className="px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold cursor-pointer transition shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            {current.footerLogoUrl && (
              <div className="p-3 bg-slate-900 rounded-lg inline-flex items-center gap-2 border border-slate-800">
                <span className="text-[10px] text-slate-400">Footer Preview:</span>
                <img
                  src={current.footerLogoUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                  alt="Footer Logo Preview"
                  className="h-8 max-w-[180px] object-contain"
                />
              </div>
            )}
          </div>

          {/* About us text inside footer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Footer 'About Us' Heading
            </label>
            <input
              type="text"
              value={current.footerAboutHeading || 'खबरी दोस्त • निष्पक्ष पत्रकारिता का संकल्प'}
              onChange={(e) => updateHeaderFooter({ footerAboutHeading: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Footer 'About Us' Description
            </label>
            <textarea
              rows={3}
              value={current.footerAboutText || ''}
              onChange={(e) => updateHeaderFooter({ footerAboutText: e.target.value })}
              placeholder="India's leading independent digital news network..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
            />
          </div>

          {/* Technology partner & bottom branding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technology & Growth Partner
              </label>
              <input
                type="text"
                value={current.footerBrandingPartnerName || 'iTree Network Solutions'}
                onChange={(e) => updateHeaderFooter({ footerBrandingPartnerName: e.target.value })}
                placeholder="iTree Network Solutions"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Partner Website URL
              </label>
              <input
                type="url"
                value={current.footerBrandingPartnerUrl || 'https://itreenet.com'}
                onChange={(e) => updateHeaderFooter({ footerBrandingPartnerUrl: e.target.value })}
                placeholder="https://itreenet.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bottom Copyright Name
              </label>
              <input
                type="text"
                value={current.footerBottomName || 'खबरी दोस्त डिजिटल न्यूज़ नेटवर्क'}
                onChange={(e) => updateHeaderFooter({ footerBottomName: e.target.value })}
                placeholder="Khabri Dost Digital News Network"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                RNI Registration Number (आर.एन.आई नंबर)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={current.rniNumber}
                  onChange={(e) => updateHeaderFooter({ rniNumber: e.target.value })}
                  placeholder="Registration number (if any)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => updateHeaderFooter({ showRniNumber: !current.showRniNumber })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    current.showRniNumber ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {current.showRniNumber ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={current.contactEmail}
                onChange={(e) => updateHeaderFooter({ contactEmail: e.target.value })}
                placeholder="khabridost.com@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Helpline & News Desk Phone
              </label>
              <input
                type="text"
                value={current.contactPhone || ''}
                onChange={(e) => updateHeaderFooter({ contactPhone: e.target.value })}
                placeholder="+91 …"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Editorial Headquarter Address
              </label>
              <input
                type="text"
                value={current.contactAddress}
                onChange={(e) => updateHeaderFooter({ contactAddress: e.target.value })}
                placeholder="Press Enclave, Connaught Place, New Delhi - 110001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED CONTACT DETAILS TAB */}
      {activeSection === 'contact' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                <span>Contact Details & Bureau Information</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage official editorial email, phone helpline, press enclave headquarters address, and WhatsApp community channel.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
              Live on Frontend
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={current.contactEmail || 'khabridost.com@gmail.com'}
                onChange={(e) => updateHeaderFooter({ contactEmail: e.target.value })}
                placeholder="khabridost.com@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Displayed on Contact page, footer contact row, and grievance desk</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Newsroom & Helpline Phone
              </label>
              <input
                type="text"
                value={current.contactPhone || ''}
                onChange={(e) => updateHeaderFooter({ contactPhone: e.target.value })}
                placeholder="+91 …"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Toll-free or news desk landline</span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                National Bureau & Headquarters Address
              </label>
              <input
                type="text"
                value={current.contactAddress || 'प्रेस एंक्लेव, कनाट प्लेस, नई दिल्ली - 110001'}
                onChange={(e) => updateHeaderFooter({ contactAddress: e.target.value })}
                placeholder="प्रेस एंक्लेव, कनाट प्लेस, नई दिल्ली - 110001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Displayed on Contact Us page and footer directory</span>
            </div>

            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp News Bulletin Channel / Community Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={current.whatsappNewsBulletinUrl || 'https://whatsapp.com/channel/khabridost'}
                  onChange={(e) => updateHeaderFooter({ whatsappNewsBulletinUrl: e.target.value })}
                  placeholder="https://whatsapp.com/channel/..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Direct invitation link for reader community and instant bulletins</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. MULTIMEDIA: VIDEO & PHOTO GALLERY TAB */}
      {activeSection === 'multimedia' && (
        <div className="space-y-5">
          {/* YouTube Video Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-red-600" />
                <span>Live Video Bulletin & Studio Controls</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...settings,
                    liveVideoSectionEnabled: !settings.liveVideoSectionEnabled,
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  settings.liveVideoSectionEnabled !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.liveVideoSectionEnabled !== false ? 'Enabled' : 'Disabled'}
              </button>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Section Headline Title
                </label>
                <input
                  type="text"
                  value={settings.liveVideoTitle || 'Live Video Bulletin • Khabri Dost Studio'}
                  onChange={(e) => onChange({ ...settings, liveVideoTitle: e.target.value })}
                  placeholder="Live Video Bulletin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Video / Live ID (e.g. jfKfPfyJRdk)
                </label>
                <input
                  type="text"
                  value={settings.liveVideoYoutubeId || ''}
                  onChange={(e) => onChange({ ...settings, liveVideoYoutubeId: e.target.value })}
                  placeholder="jfKfPfyJRdk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Photo Stories Gallery with SEO Captions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Photo Stories & Editorial Gallery Studio</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const currentHg = settings.homepageSections || {
                    heroSlider: true,
                    liveVideoBulletin: true,
                    liveFeedCoverage: true,
                    headerLiveFeedLink: true,
                    briefsTicker: true,
                    trendingTopics: true,
                    webStories: true,
                    photoGallery: true,
                    categoryBlocks: true,
                  };
                  onChange({
                    ...settings,
                    homepageSections: {
                      ...currentHg,
                      photoGallery: !currentHg.photoGallery,
                    },
                  });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  settings.homepageSections?.photoGallery !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.homepageSections?.photoGallery !== false ? 'Enabled' : 'Disabled'}
              </button>
            </h4>

            {/* Add New Photo Story */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">Add New Photo Story</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="Story Title..."
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Image URL..."
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                />
                <input
                  type="text"
                  value={newPhotoLocation}
                  onChange={(e) => setNewPhotoLocation(e.target.value)}
                  placeholder="Location (e.g. New Delhi, Ayodhya)..."
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="SEO Caption & Alt Text..."
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPhotoStory}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Photo Story</span>
              </button>
            </div>

            {/* Existing Photo Stories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {photoStories.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-200 flex gap-2.5 items-center justify-between bg-white shadow-2xs"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-16 h-12 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                    <p className="text-[10px] text-slate-500 truncate">
                      {item.location} • {item.caption || 'Editorial photo caption'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePhotoStory(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. ADVERTISEMENTS & CUSTOM SCRIPT TAB */}
      {activeSection === 'ads' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-red-600" />
                <span>Ad Slots, Scripts & Banner Customization</span>
              </h4>
              <p className="text-xs text-slate-500">
                Enable or disable top, in-content, sidebar, and bottom ad placements, or insert custom AdSense script / HTML code.
              </p>
            </div>
          </div>

          {/* Ad Slot Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'showTopAd', label: 'Top Header Ad' },
              { key: 'showMidContentAd', label: 'Mid-Content Ad' },
              { key: 'showSidebarAd', label: 'Sidebar Ad' },
              { key: 'showBottomAd', label: 'Bottom Footer Ad' },
            ].map((slot) => {
              const isEnabled = (settings.adSettings as any)[slot.key] !== false;
              return (
                <div
                  key={slot.key}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...settings,
                        adSettings: {
                          ...settings.adSettings,
                          [slot.key]: !isEnabled,
                        },
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Custom Ad Script / HTML Space */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              Custom Ad Script / HTML Space (Google AdSense, MGID, Taboola)
            </label>
            <p className="text-[11px] text-slate-500">
              Paste your responsive AdSense snippet, JavaScript tag, or HTML banner code below:
            </p>
            <textarea
              rows={5}
              value={settings.adSettings.customScriptOrHtml || ''}
              onChange={(e) =>
                onChange({
                  ...settings,
                  adSettings: {
                    ...settings.adSettings,
                    customScriptOrHtml: e.target.value,
                  },
                })
              }
              placeholder="<script async src='https://pagead2.googlesyndication.com...'></script> OR <a href='...'><img src='...' /></a>"
              className="w-full p-3 bg-slate-900 text-amber-200 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      )}

      {/* 8. LEGAL POLICIES TAB */}
      {activeSection === 'policies' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Editorial Policies & Code of Ethics
              </h4>
              <p className="text-xs text-slate-500">
                Official transparency standards, grievance mechanism, and policies displayed in footer and about pages.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Fact Check Policy
              </label>
              <textarea
                rows={3}
                value={current.legalPolicies?.factCheckPolicy || ''}
                onChange={(e) => updatePolicies('factCheckPolicy', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Editorial Ethics & Policy
              </label>
              <textarea
                rows={3}
                value={current.legalPolicies?.editorialEthics || ''}
                onChange={(e) => updatePolicies('editorialEthics', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Grievance Redressal Officer
              </label>
              <textarea
                rows={3}
                value={current.legalPolicies?.grievanceRedressal || ''}
                onChange={(e) => updatePolicies('grievanceRedressal', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                4. Privacy Policy
              </label>
              <textarea
                rows={3}
                value={current.legalPolicies?.privacyPolicy || ''}
                onChange={(e) => updatePolicies('privacyPolicy', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                5. Terms of Service
              </label>
              <textarea
                rows={3}
                value={current.legalPolicies?.termsOfService || ''}
                onChange={(e) => updatePolicies('termsOfService', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 10. NETWORK EDITIONS & LANGUAGE SWITCHER SECTION */}
      {activeSection === 'editions' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
              <div>
                <h4 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-red-600" />
                  <span>भाषा संस्करण एवं नेटवर्क वेबसाइट्स (Language Editions & Sister Portals)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  यहाँ से आप अपने ब्रांड की अन्य भाषाओं की वेबसाइट्स (जैसे English, Punjabi, TV आदि) जोड़ सकते हैं, जो हेडर के ड्रॉपडाउन में पाठकों को रीडायरेक्ट करेंगी।
                </p>
              </div>

              {/* Master Visibility Toggle */}
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl cursor-pointer border border-slate-200">
                <input
                  type="checkbox"
                  checked={current.headerShowLanguageEditions !== false}
                  onChange={(e) =>
                    updateHeaderFooter({
                      headerShowLanguageEditions: e.target.checked,
                    })
                  }
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <span>हेडर में संस्करण मेनू दिखाएं (Show in Header)</span>
              </label>
            </div>

            {/* Add New Edition Form */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>नया संस्करण / वेबसाइट जोड़ें (Add New Language Portal)</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Icon / Flag */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">आइकन / फ़्लैग</label>
                  <input
                    type="text"
                    value={newEditionIcon}
                    onChange={(e) => setNewEditionIcon(e.target.value)}
                    placeholder="🌐 या 🌾"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-500 text-center"
                  />
                </div>

                {/* Name */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">संस्करण का नाम</label>
                  <input
                    type="text"
                    value={newEditionName}
                    onChange={(e) => setNewEditionName(e.target.value)}
                    placeholder="e.g. English Edition"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Language Code */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">भाषा कोड</label>
                  <input
                    type="text"
                    value={newEditionLang}
                    onChange={(e) => setNewEditionLang(e.target.value)}
                    placeholder="en, pa, ur"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-500 font-mono text-center"
                  />
                </div>

                {/* Target URL */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">वेबसाइट URL</label>
                  <input
                    type="url"
                    value={newEditionUrl}
                    onChange={(e) => setNewEditionUrl(e.target.value)}
                    placeholder="https://en.khabridost.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEditionNewTab}
                    onChange={(e) => setNewEditionNewTab(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                  />
                  <span>नये टैब में खोलें (Open in new window/tab)</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddEdition}
                  disabled={!newEditionName.trim() || !newEditionUrl.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>संस्करण जोड़ें (Save Edition)</span>
                </button>
              </div>
            </div>

            {/* List of Configured Editions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                सक्रिय नेटवर्क संस्करण सूची (Active Language Network Portals)
              </h5>

              <div className="space-y-2">
                {(current.languageEditions || [
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
                ]).map((ed) => (
                  <div
                    key={ed.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-xl shrink-0">{ed.icon || '🌐'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{ed.name}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                            {ed.langCode}
                          </span>
                          {ed.isCurrent && (
                            <span className="text-[9px] font-bold bg-red-600 text-white px-2 py-0.2 rounded-full">
                              मुख्य पोर्टल
                            </span>
                          )}
                        </div>
                        <a
                          href={ed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-red-600 hover:underline font-mono truncate block flex items-center space-x-1 mt-0.5"
                        >
                          <span>{ed.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleEdition(ed.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          ed.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={ed.enabled ? 'सक्रिय (Active)' : 'अक्रिय (Hidden)'}
                      >
                        {ed.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Delete button (cannot delete current active portal) */}
                      {!ed.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEdition(ed.id)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                          title="संस्करण हटाएं (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. MOBILE FOOTER & STICKY ADVERTISEMENT SETTINGS */}
      {activeSection === 'mobile_footer' && (
        <div className="space-y-6">
          {/* Section Master Header */}
          <div className="bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-base sm:text-lg font-kd-headline text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-red-600" />
                  <span>Mobile Footer Settings (मोबाइल फुटर सेटिंग्स)</span>
                </h4>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                स्मार्टफ़ोन पाठकों के लिए बॉटम 'Social Sharing Bar' बनाम 'Sticky Advertisement' का चयन करें। इमेज अपलोड करें, क्लिक लिंक डालें, कस्टम स्क्रिप्ट/HTML इंजेक्ट करें तथा फुटर टेस्टिंग बैनर प्रबंधित करें।
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-700">
                {currentSticky.enabled !== false ? 'सक्रिय (Enabled)' : 'छुपा हुआ (Hidden)'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSticky.enabled !== false}
                  onChange={(e) => updateMobileStickyBar({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* 5-ITEM MOBILE BOTTOM NAVIGATION BAR CONFIGURATION CARD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-slate-900 text-base font-kd-headline flex items-center gap-2">
                    <span>5-Item Mobile Bottom Navigation Bar (मोबाइल बॉटम नेविगेशन बार)</span>
                    <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                      5 Customizable Slots
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  स्मार्टफ़ोन पाठकों के लिए 5-बटन बॉटम बार। आप रेडीमेड प्रीसेट चुन सकते हैं, ई-पेपर की जगह कोई भी फीचर/कैटेगरी/कस्टम लिंक लगा सकते हैं, या पाँचों स्लॉट्स को अपनी पसंद से पूरी तरह बदल सकते हैं।
                </p>
              </div>

              {/* Master Bottom Nav Toggle */}
              <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {currentBottomNav.enabled !== false ? 'नेविगेशन चालू' : 'नेविगेशन बंद'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentBottomNav.enabled !== false}
                    onChange={(e) => updateMobileBottomNav({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {currentBottomNav.enabled !== false && (() => {
              // Current 5 active items
              const rawItems: BottomNavItemConfig[] =
                currentBottomNav.items && currentBottomNav.items.length === 5
                  ? currentBottomNav.items
                  : [
                      { id: 'slot-1', type: 'home', label: currentBottomNav.homeLabel || 'होम', icon: '🏠' },
                      { id: 'slot-2', type: 'latest', label: currentBottomNav.latestLabel || 'ताज़ा', icon: '⚡' },
                      { id: 'slot-3', type: 'trending', label: currentBottomNav.trendingLabel || 'ट्रेंडिंग', icon: '🔥' },
                      { id: 'slot-4', type: 'states', label: currentBottomNav.statesLabel || 'राज्य', icon: '📍' },
                      {
                        id: 'slot-5',
                        type: (currentBottomNav.fifthItem as any) || 'epaper',
                        label: currentBottomNav.customLabel || 'ई-पेपर',
                        icon: currentBottomNav.customIcon || '📰',
                        targetCategory: currentBottomNav.customCategory,
                        targetUrl: currentBottomNav.customUrl,
                        openInNewTab: currentBottomNav.openInNewTab,
                      },
                    ];

              const handleUpdateSlot = (slotIdx: number, updates: Partial<BottomNavItemConfig>) => {
                const newItems = [...rawItems];
                newItems[slotIdx] = { ...newItems[slotIdx], ...updates };
                const navUpdates: Partial<MobileBottomNavConfig> = {
                  items: newItems,
                  activePreset: 'custom',
                };
                if (slotIdx === 0 && updates.label) navUpdates.homeLabel = updates.label;
                if (slotIdx === 1 && updates.label) navUpdates.latestLabel = updates.label;
                if (slotIdx === 2 && updates.label) navUpdates.trendingLabel = updates.label;
                if (slotIdx === 3 && updates.label) navUpdates.statesLabel = updates.label;
                if (slotIdx === 4) {
                  if (updates.type) navUpdates.fifthItem = updates.type as any;
                  if (updates.label !== undefined) navUpdates.customLabel = updates.label;
                  if (updates.icon !== undefined) navUpdates.customIcon = updates.icon;
                  if (updates.targetCategory !== undefined) navUpdates.customCategory = updates.targetCategory;
                  if (updates.targetUrl !== undefined) navUpdates.customUrl = updates.targetUrl;
                  if (updates.openInNewTab !== undefined) navUpdates.openInNewTab = updates.openInNewTab;
                }
                updateMobileBottomNav(navUpdates);
              };

              const handleApplyPreset = (presetId: string) => {
                const preset = BOTTOM_NAV_PRESETS.find((p) => p.id === presetId);
                if (!preset) return;
                const fifth = preset.items[4];
                updateMobileBottomNav({
                  activePreset: preset.id,
                  items: preset.items,
                  homeLabel: preset.items[0]?.label || 'होम',
                  latestLabel: preset.items[1]?.label || 'ताज़ा',
                  trendingLabel: preset.items[2]?.label || 'ट्रेंडिंग',
                  statesLabel: preset.items[3]?.label || 'राज्य',
                  fifthItem: (fifth?.type as any) || 'epaper',
                  customLabel: fifth?.label,
                  customIcon: fifth?.icon,
                  customCategory: fifth?.targetCategory,
                  customUrl: fifth?.targetUrl,
                  openInNewTab: fifth?.openInNewTab,
                });
              };

              // Destination options dictionary for any slot
              const DESTINATION_OPTIONS: {
                id: BottomNavItemType;
                icon: string;
                title: string;
                desc: string;
                badge?: string;
              }[] = [
                { id: 'epaper', icon: '📰', title: 'ई-पेपर (E-Paper)', desc: 'डिजिटल अख़बार व्यूअर' },
                { id: 'videos', icon: '📺', title: 'वीडियो बुलेटिन', desc: 'लाइव न्यूज़ व वीडियो प्लेयर' },
                { id: 'photos', icon: '📸', title: 'फ़ोटो स्टोरीज़', desc: 'विजुअल गैलरी व एल्बम' },
                { id: 'games', icon: '🎮', title: 'सुडोकू व पहेलियां', desc: 'दैनिक माइंड गेम्स व ब्रेन टीज़र' },
                { id: 'submit_news', icon: '✍️', title: 'ख़बर भेजें', desc: 'नागरिक पत्रकारिता व पाठक रिपोर्ट' },
                { id: 'archive', icon: '📂', title: 'पुरालेख (Archive)', desc: 'तारीख अनुसार पुरानी ख़बरें' },
                { id: 'contact', icon: '📞', title: 'संपर्क डेस्क', desc: 'संपादकीय, विज्ञापन व ब्यूरो संपर्क' },
                { id: 'about', icon: '🏢', title: 'हमारे बारे में', desc: 'संस्था, विजन व एडिटोरियल टीम' },
                { id: 'legal', icon: '🛡️', title: 'विधिक नीतियां', desc: 'गोपनीयता, नियम, कुकीज़ व कॉपीराइट' },
                { id: 'complaint', icon: '⚖️', title: 'शिकायत निवारण', desc: 'IT Rules 2021 ऑनलाइन ग्रीवेंस फॉर्म' },
                { id: 'category', icon: '🏷️', title: 'वेबसाइट श्रेणी (Category)', desc: 'राजनीति, खेल, बिजनेस आदि कोई भी कैटेगरी', badge: 'फ्लेक्सिबल' },
                { id: 'custom_link', icon: '🔗', title: 'कस्टम वेबसाइट लिंक / URL', desc: 'अपनी पसंद का कोई भी वेब लिंक या हैशटैग', badge: 'कस्टम' },
              ];

              return (
                <div className="space-y-6">
                  {/* 1. READY-MADE PRESETS (1-क्लिक रेडीमेड प्रीसेट्स) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>1-Click Navigation Presets (तैयार प्रीसेट्स - एक क्लिक में लागू करें):</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {currentBottomNav.activePreset && currentBottomNav.activePreset !== 'custom' ? (
                          <span className="text-emerald-600 font-bold">
                            सक्रिय प्रीसेट: {BOTTOM_NAV_PRESETS.find((p) => p.id === currentBottomNav.activePreset)?.nameHindi || currentBottomNav.activePreset}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">कस्टम कस्टमाइज़ेशन मोड</span>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {BOTTOM_NAV_PRESETS.map((preset) => {
                        const isPresetActive = currentBottomNav.activePreset === preset.id;
                        return (
                          <div
                            key={preset.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                              isPresetActive
                                ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20 shadow-xs'
                                : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                  <span>{preset.nameHindi}</span>
                                </h5>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                                  {preset.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {preset.description}
                              </p>
                              {/* 5 Slots Preview Pills */}
                              <div className="flex items-center flex-wrap gap-1 pt-1">
                                {preset.items.map((it, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 flex items-center gap-1 font-kd-meta"
                                  >
                                    <span>{it.icon}</span>
                                    <span>{it.label}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyPreset(preset.id)}
                              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                isPresetActive
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {isPresetActive ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span>यह प्रीसेट सक्रिय है</span>
                                </>
                              ) : (
                                <>
                                  <span>यह प्रीसेट लागू करें</span>
                                  <span>➔</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. LIVE INTERACTIVE PHONE PREVIEW */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Eye className="w-3.5 h-3.5 text-red-600" />
                        <span>Live Mobile Bottom Bar Preview (स्मार्टफ़ोन बॉटम बार लाइव प्रीव्यू)</span>
                      </span>
                      <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                        360px Mobile Viewport
                      </span>
                    </div>

                    {/* Phone Screen Mockup Bar */}
                    <div className="max-w-md mx-auto bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                      <div className="grid grid-cols-5 py-2 px-1 divide-x divide-slate-100">
                        {rawItems.map((slot, sIdx) => {
                          const isFifth = sIdx === 4;
                          return (
                            <div
                              key={slot.id || sIdx}
                              className={`flex flex-col items-center justify-center py-1 transition ${
                                sIdx === 0
                                  ? 'text-red-600 font-bold'
                                  : isFifth
                                  ? 'text-amber-900 bg-amber-50/50 rounded font-medium'
                                  : 'text-slate-600'
                              }`}
                            >
                              <span className="text-lg leading-none">{slot.icon || (isFifth ? '📰' : '•')}</span>
                              {currentBottomNav.showLabels !== false && (
                                <span className="text-[10px] mt-0.5 tracking-tight font-kd-meta truncate max-w-[60px]">
                                  {slot.label}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[11px] text-center text-slate-400">
                      स्मार्टफ़ोन पर बॉटम बार ठीक ऐसा दिखेगा। आप नीचे ई-पेपर की जगह कोई भी विकल्प बदल सकते हैं।
                    </p>
                  </div>

                  {/* 3. DEDICATED 5th SLOT CUSTOMIZER (ई-पेपर की जगह कुछ भी लगाएं) */}
                  <div className="bg-gradient-to-br from-amber-50/80 via-white to-red-50/40 p-5 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📰 ➔ 🚀</span>
                          <h4 className="font-bold text-slate-900 text-sm font-kd-headline flex items-center gap-2">
                            <span>पाँचवाँ स्लॉट बदलें: ई-पेपर की जगह कोई भी फीचर या लिंक लगाएं</span>
                            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                              Slot 5 Customize
                            </span>
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600">
                          वेबसाइट के अनुसार ई-पेपर की जगह वीडियो बुलेटिन, सुडोकू गेम्स, नागरिक ख़बर, विशिष्ट कैटेगरी या कस्टम यूआरएल लगाएं:
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">वर्तमान चयन:</span>
                        <span className="text-xs font-bold bg-white border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                          <span>{rawItems[4]?.icon}</span>
                          <span>{rawItems[4]?.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Destination Choice Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {DESTINATION_OPTIONS.map((dest) => {
                        const isSelected = rawItems[4]?.type === dest.id;
                        return (
                          <button
                            key={dest.id}
                            type="button"
                            onClick={() => {
                              handleUpdateSlot(4, {
                                type: dest.id,
                                label: dest.title.split(' ')[0],
                                icon: dest.icon,
                              });
                            }}
                            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                              isSelected
                                ? 'border-amber-600 bg-amber-100/70 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{dest.icon}</span>
                              {isSelected ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
                              ) : dest.badge ? (
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {dest.badge}
                                </span>
                              ) : null}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 line-clamp-1">{dest.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{dest.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Specific Category Selection (if Category chosen) */}
                    {rawItems[4]?.type === 'category' && (
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          वेबसाइट की श्रेणी चुनें (Select Target Category):
                        </label>
                        <select
                          value={rawItems[4]?.targetCategory || 'national'}
                          onChange={(e) => {
                            const catId = e.target.value;
                            const catObj = CATEGORIES.find((c) => c.id === catId);
                            handleUpdateSlot(4, {
                              targetCategory: catId,
                              label: catObj?.labelHindi || rawItems[4]?.label,
                            });
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.labelHindi} ({cat.labelEnglish})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500">
                          इस बटन पर क्लिक करने पर पाठक सीधे इस श्रेणी के समाचारों पर पहुंच जाएंगे।
                        </p>
                      </div>
                    )}

                    {/* Custom URL Input (if Custom Link chosen) */}
                    {rawItems[4]?.type === 'custom_link' && (
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">
                            कस्टम वेब लिंक या हैशटैग URL (Target Link / URL):
                          </label>
                          <input
                            type="text"
                            value={rawItems[4]?.targetUrl || ''}
                            onChange={(e) => handleUpdateSlot(4, { targetUrl: e.target.value })}
                            placeholder="उदा. https://youtube.com/@khabridost या #live-video-section"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                          />
                        </div>

                        <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={rawItems[4]?.openInNewTab !== false}
                            onChange={(e) => handleUpdateSlot(4, { openInNewTab: e.target.checked })}
                            className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                          />
                          <span>नए टैब में खोलें (Open in new browser tab)</span>
                        </label>
                      </div>
                    )}

                    {/* Custom Label & Emoji Picker for Slot 5 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-amber-200/80 bg-white">
                      {/* Custom Label */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          5वें बटन का नाम / लेबल (Button Label):
                        </label>
                        <input
                          type="text"
                          value={rawItems[4]?.label || ''}
                          onChange={(e) => handleUpdateSlot(4, { label: e.target.value })}
                          placeholder="उदा. ई-पेपर, वीडियो, खेल, आदि"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                        />
                        <p className="text-[11px] text-slate-400">
                          स्मार्टफ़ोन पर आइकन के नीचे दिखने वाला टेक्स्ट।
                        </p>
                      </div>

                      {/* Custom Emoji Picker */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          आइकन या इमोजी (Icon / Emoji Picker):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rawItems[4]?.icon || ''}
                            onChange={(e) => handleUpdateSlot(4, { icon: e.target.value })}
                            placeholder="उदा. 📰"
                            maxLength={4}
                            className="w-16 px-2 py-2 text-center text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                          />
                          {/* Quick Emoji Chips */}
                          <div className="flex items-center flex-wrap gap-1">
                            {['📰', '📺', '📸', '🎮', '✍️', '📂', '📞', '🏢', '🛡️', '⚖️', '🌟', '🎙️', '🔔', '🗞️', '🚀', '🏏', '🎬', '🏛️'].map((ico) => (
                              <button
                                key={ico}
                                type="button"
                                onClick={() => handleUpdateSlot(4, { icon: ico })}
                                className={`w-7 h-7 text-sm rounded-lg border flex items-center justify-center transition cursor-pointer ${
                                  rawItems[4]?.icon === ico
                                    ? 'border-amber-600 bg-amber-100 font-bold'
                                    : 'border-slate-200 bg-white hover:bg-slate-100'
                                }`}
                                title={`चुनें ${ico}`}
                              >
                                {ico}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. ALL 5 SLOTS QUICK LABELS & TOGGLE */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-slate-600" />
                        <span>सभी 5 बटनों के शीर्षक व लेबल (Quick Labels for All 5 Slots):</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={currentBottomNav.showLabels !== false}
                          onChange={(e) => updateMobileBottomNav({ showLabels: e.target.checked })}
                          className="w-4 h-4 text-red-600 rounded cursor-pointer"
                        />
                        <span>बटनों के नीचे नाम दिखाएं (Show Labels)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {rawItems.map((slot, sIdx) => (
                        <div key={slot.id || sIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <span className="block text-[11px] font-bold text-slate-600">
                            स्लॉट {sIdx + 1} ({slot.icon}):
                          </span>
                          <input
                            type="text"
                            value={slot.label}
                            onChange={(e) => handleUpdateSlot(sIdx, { label: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* TOGGLE SWITCHES: Social Sharing Bar vs Sticky Advertisement */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>मोबाइल बॉटम बार मोड चुनें (Select Mobile Footer Mode)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                एडमिन चुन सकते हैं कि मोबाइल स्क्रीन पर नीचे क्या दिखे: सोशल शेयरिंग बार या स्टिकी विज्ञापन।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option 1: Social Sharing Bar */}
              <button
                type="button"
                onClick={() => updateMobileStickyBar({ enabled: true, mode: 'share' })}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  currentSticky.enabled !== false && (currentSticky.mode || 'share') === 'share'
                    ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    <Share2 className="w-4 h-4" />
                  </span>
                  {currentSticky.enabled !== false && (currentSticky.mode || 'share') === 'share' && (
                    <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                      सक्रिय (Active)
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Social Sharing Bar</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    WhatsApp, Telegram, X, Facebook और लिंक कॉपी बटन्स।
                  </p>
                </div>
              </button>

              {/* Option 2: Sticky Advertisement */}
              <button
                type="button"
                onClick={() => updateMobileStickyBar({ enabled: true, mode: 'ad' })}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  currentSticky.enabled !== false && currentSticky.mode === 'ad'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  {currentSticky.enabled !== false && currentSticky.mode === 'ad' && (
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                      सक्रिय (Active)
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Sticky Advertisement</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    320x50 मोबाइल एंकर विज्ञापन (इमेज या स्क्रिप्ट)।
                  </p>
                </div>
              </button>

              {/* Option 3: Dual Mode (Ad + Share) */}
              <button
                type="button"
                onClick={() => updateMobileStickyBar({ enabled: true, mode: 'both' })}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  currentSticky.enabled !== false && currentSticky.mode === 'both'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </span>
                  {currentSticky.enabled !== false && currentSticky.mode === 'both' && (
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      सक्रिय (Active)
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Dual Mode (Combo)</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    स्टिकी विज्ञापन और शेयरिंग बार दोनों एक साथ।
                  </p>
                </div>
              </button>

              {/* Option 4: Hide / Disabled */}
              <button
                type="button"
                onClick={() => updateMobileStickyBar({ enabled: false })}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  currentSticky.enabled === false
                    ? 'border-slate-700 bg-slate-100 ring-2 ring-slate-400/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    <X className="w-4 h-4" />
                  </span>
                  {currentSticky.enabled === false && (
                    <span className="text-[10px] font-bold bg-slate-700 text-white px-2 py-0.5 rounded-full">
                      छुपा हुआ (Hidden)
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Hide / Disabled</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    मोबाइल पर कोई भी बॉटम स्टिकी बार नहीं दिखेगा।
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* STICKY ADVERTISEMENT CONTROLS (Ad Image, Target URL, Custom Script) */}
          {(currentSticky.mode === 'ad' || currentSticky.mode === 'both') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-amber-600" />
                    <span>Sticky Advertisement Settings (मोबाइल विज्ञापन विवरण)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    बैनर इमेज अपलोड करें, क्लिक लिंक सेट करें अथवा Google AdSense / कस्टम HTML स्क्रिप्ट इंजेक्ट करें।
                  </p>
                </div>
              </div>

              {/* Ad Format Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  विज्ञापन प्रकार (Ad Format):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateMobileStickyBar({ adType: 'image' })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      (currentSticky.adType || 'image') === 'image'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    इमेज बैनर व लिंक (Image Banner + Link)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMobileStickyBar({ adType: 'script' })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentSticky.adType === 'script'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    कस्टम स्क्रिप्ट / AdSense कोड (HTML / Script)
                  </button>
                </div>
              </div>

              {(currentSticky.adType || 'image') === 'image' ? (
                <div className="space-y-4 pt-1">
                  {/* Ad Image Upload & URL input */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        <span>Ad Image (बैनर इमेज - 320x50):</span>
                      </label>
                      <label className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer transition shadow-2xs flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>इमेज अपलोड करें (Upload Image)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStickyAdFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentSticky.adImageUrl || ''}
                        onChange={(e) => updateMobileStickyBar({ adImageUrl: e.target.value })}
                        placeholder="https://example.com/ad-banner-320x50.png"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateMobileStickyBar({
                            adImageUrl:
                              'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80',
                            adType: 'image',
                          })
                        }
                        className="px-3 py-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition shrink-0 cursor-pointer"
                        title="डिफ़ॉल्ट सैंपल बैनर उपयोग करें"
                      >
                        सैंपल बैनर
                      </button>
                    </div>

                    {/* Live Preview */}
                    {currentSticky.adImageUrl && (
                      <div className="pt-2 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          लाइव प्रीव्यू:
                        </span>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-300 shadow-2xs">
                          <img
                            src={currentSticky.adImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80'}
                            alt="Sticky Ad Preview"
                            className="h-[46px] w-auto max-w-[280px] object-contain rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target URL (क्लिक करने पर खुलने वाला लिंक):
                    </label>
                    <input
                      type="text"
                      value={currentSticky.adTargetUrl || ''}
                      onChange={(e) => updateMobileStickyBar({ adTargetUrl: e.target.value })}
                      placeholder="#contact या https://sponsor-brand.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono bg-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      यदि '#contact' रखेंगे तो क्लिक करने पर वेबसाइट का संपर्क पेज खुलेगा।
                    </p>
                  </div>

                  {/* Alt Text / Sponsor Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      प्रायोजक का नाम / Alt Text:
                    </label>
                    <input
                      type="text"
                      value={currentSticky.adAltText || ''}
                      onChange={(e) => updateMobileStickyBar({ adAltText: e.target.value })}
                      placeholder="खबरी दोस्त प्रायोजित विज्ञापन"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* Custom Script / HTML Injection */
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Inject Custom Script / HTML (कस्टम स्क्रिप्ट या Google AdSense कोड):
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">HTML / JS / AdSense Tag</span>
                    </div>
                    <textarea
                      rows={5}
                      value={currentSticky.adScriptCode || ''}
                      onChange={(e) => updateMobileStickyBar({ adScriptCode: e.target.value })}
                      placeholder="<!-- Google AdSense 320x50 Anchor Script Code -->&#10;<ins class='adsbygoogle' ...></ins>&#10;<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-900 text-amber-200"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      यह स्क्रिप्ट सीधे मोबाइल पाठकों के बॉटम स्टिकी कंटेनर में इंजेक्ट की जाएगी।
                    </p>
                  </div>
                </div>
              )}

              {/* Sticky Ad UX Toggles */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                  <div className="pr-2">
                    <span className="font-bold text-slate-800 block">पाठक के लिए क्लोज़ बटन ('X')</span>
                    <span className="text-[11px] text-slate-500">मोबाइल यूज़र्स विज्ञापन बंद कर सकेंगे</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSticky.dismissible !== false}
                    onChange={(e) => updateMobileStickyBar({ dismissible: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                  <div className="pr-2">
                    <span className="font-bold text-emerald-950 block">फुटर आने पर स्वतः छुपाएं</span>
                    <span className="text-[11px] text-emerald-800">फुटर डिटेल्स व कॉपीराइट कभी नहीं दबेगा</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSticky.autoHideOnFooter !== false}
                    onChange={(e) => updateMobileStickyBar({ autoHideOnFooter: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SOCIAL SHARING BAR CONTROLS (Platforms & Share Label) */}
          {(currentSticky.mode === 'share' || currentSticky.mode === 'both') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-red-600" />
                    <span>Social Sharing Bar Platforms (शेयरिंग प्लेटफॉर्म्स)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    मोबाइल सोशल शेयरिंग बार में कौन-कौन से बटन दिखाई दें:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
                  { key: 'telegram', label: 'Telegram', color: '#0088cc' },
                  { key: 'twitter', label: 'X (Twitter)', color: '#000000' },
                  { key: 'facebook', label: 'Facebook', color: '#1877F2' },
                  { key: 'copyLink', label: 'Copy Link', color: '#64748b' },
                  { key: 'nativeShare', label: 'Native Share Drawer', color: '#dc2626' },
                ].map((pl) => (
                  <label
                    key={pl.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pl.color }} />
                      <span>{pl.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={currentSticky.sharePlatforms?.[pl.key as keyof typeof currentSticky.sharePlatforms] ?? true}
                      onChange={(e) =>
                        updateMobileStickyBar({
                          sharePlatforms: {
                            ...(currentSticky.sharePlatforms || {
                              whatsapp: true,
                              twitter: true,
                              facebook: true,
                              telegram: true,
                              copyLink: true,
                              nativeShare: true,
                            }),
                            [pl.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-red-600 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">
                  'Share:' / 'शेयर करें' टेक्स्ट लेबल दिखाएं:
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSticky.showShareLabel !== false}
                    onChange={(e) => updateMobileStickyBar({ showShareLabel: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TESTING BANNER AD ON FOOTER: DESKTOP & MOBILE CONTROLS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="text-base">📢</span>
                  <span>Sticky Footer Banner Advertisement (Desktop & Mobile)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Floating sticky advertisement docked at the bottom of the viewport across all reading views. Supports distinct creatives for Desktop (728x90) and Mobile (320x50), plus left-side Close (✕) and Minimize (−/+) controls.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentFooterAd.enabled !== false}
                  onChange={(e) => updateFooterAd({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {currentFooterAd.enabled !== false && (
              <div className="space-y-4">
                {/* 1. Desktop Banner Image (728x90) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>Desktop Banner Ad (728x90 Leaderboard Image):</span>
                    </label>
                    <label className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer transition shadow-2xs flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Desktop Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFooterDesktopAdUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentFooterAd.desktopImageUrl || ''}
                      onChange={(e) => updateFooterAd({ desktopImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... (728x90 desktop banner)"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateFooterAd({
                          desktopImageUrl:
                            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
                        })
                      }
                      className="px-3 py-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Sample Desktop
                    </button>
                  </div>
                </div>

                {/* 2. Mobile Banner Image (320x50) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Mobile Banner Ad (320x50 Banner Image):</span>
                    </label>
                    <label className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer transition shadow-2xs flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Mobile Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFooterMobileAdUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentFooterAd.mobileImageUrl || ''}
                      onChange={(e) => updateFooterAd({ mobileImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... (320x50 mobile banner)"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateFooterAd({
                          mobileImageUrl:
                            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80',
                        })
                      }
                      className="px-3 py-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Sample Mobile
                    </button>
                  </div>
                </div>

                {/* Target Link & Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Link URL (Click Destination):
                    </label>
                    <input
                      type="text"
                      value={currentFooterAd.targetUrl || ''}
                      onChange={(e) => updateFooterAd({ targetUrl: e.target.value })}
                      placeholder="#contact or https://partner.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banner Headline Title:
                    </label>
                    <input
                      type="text"
                      value={currentFooterAd.title || ''}
                      onChange={(e) => updateFooterAd({ title: e.target.value })}
                      placeholder="Khabri Dost Digital News Network • Special Advertisement"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banner Subtitle / Tagline:
                    </label>
                    <input
                      type="text"
                      value={currentFooterAd.subTitle || ''}
                      onChange={(e) => updateFooterAd({ subTitle: e.target.value })}
                      placeholder="Promote your brand to 500,000+ readers across India | Special Editorial Partner Rates"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    />
                  </div>
                </div>

                {/* Custom Script/HTML code for Footer Testing Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Script / HTML / AdSense Code (Optional):
                  </label>
                  <textarea
                    rows={3}
                    value={currentFooterAd.scriptCode || ''}
                    onChange={(e) =>
                      updateFooterAd({
                        scriptCode: e.target.value,
                        type: e.target.value.trim() ? 'script' : 'image',
                      })
                    }
                    placeholder="<!-- Paste your custom HTML, AdSense, or third-party ad script here -->"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-slate-900 text-amber-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
