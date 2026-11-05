import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Check,
  Save,
  Globe,
  Upload,
  Eye,
  Sliders,
  Type,
  RefreshCw,
  Info,
} from 'lucide-react';
import { HeaderFooterSettings, PortalSettings } from '../../types/news';

interface BrandCustomizerTabProps {
  settings: PortalSettings;
  onUpdateSettings: (newSettings: PortalSettings) => void;
  onSuccessNotice?: (msg: string) => void;
}

export const BRAND_COLOR_PRESETS = [
  { name: 'Crimson Red (Default)', hex: '#dc2626', text: 'White' },
  { name: 'Royal Blue', hex: '#2563eb', text: 'White' },
  { name: 'Emerald Green', hex: '#059669', text: 'White' },
  { name: 'Imperial Purple', hex: '#7c3aed', text: 'White' },
  { name: 'Vivid Orange', hex: '#ea580c', text: 'White' },
  { name: 'Maroon / Burgundy', hex: '#991b1b', text: 'White' },
  { name: 'Dark Slate', hex: '#334155', text: 'White' },
  { name: 'Cyan / Teal', hex: '#0891b2', text: 'White' },
];

export const BrandCustomizerTab: React.FC<BrandCustomizerTabProps> = ({
  settings,
  onUpdateSettings,
  onSuccessNotice,
}) => {
  const current = settings.headerFooter || {
    siteTitle: 'Khabri Dost',
    siteTagline: 'सटीक ख़बर, निष्पक्ष नज़र',
    contactEmail: 'contact@khabridost.com',
    contactAddress: 'New Delhi, India',
    rniNumber: '',
    socialLinks: {
      whatsappChannel: 'https://whatsapp.com/channel',
      telegramChannel: 'https://t.me',
      facebook: 'https://facebook.com',
      twitter: 'https://x.com',
      youtube: 'https://youtube.com',
    },
  };

  const [siteTitle, setSiteTitle] = useState(current.siteTitle || 'Khabri Dost');
  const [siteTitleHindi, setSiteTitleHindi] = useState(current.siteTitleHindi || 'ख़बरी दोस्त');
  const [siteTagline, setSiteTagline] = useState(current.siteTagline || 'सटीक ख़बर, निष्पक्ष नज़र');
  const [showTagline, setShowTagline] = useState(current.showTagline ?? true);
  const [showTaglineDesktop, setShowTaglineDesktop] = useState(current.showTaglineDesktop ?? true);
  const [showTaglineMobile, setShowTaglineMobile] = useState(current.showTaglineMobile ?? false);

  const [primaryBrandColor, setPrimaryBrandColor] = useState(current.primaryBrandColor || '#dc2626');
  const [secondaryBrandColor, setSecondaryBrandColor] = useState(current.secondaryBrandColor || '#1e293b');

  const [logoUrl, setLogoUrl] = useState(current.logoUrl || '');
  const [headerLogoHeight, setHeaderLogoHeight] = useState(current.headerLogoHeight || 48);
  const [showSiteTitleText, setShowSiteTitleText] = useState(current.showSiteTitleText ?? true);
  const [footerLogoUrl, setFooterLogoUrl] = useState(current.footerLogoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(current.faviconUrl || '');

  const [isSaved, setIsSaved] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Handle image upload from computer (converts to data URL for instant live preview and persistence)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'footerLogo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, WebP, JPEG, SVG)');
      return;
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'logo') setLogoUrl(result);
      else if (target === 'footerLogo') setFooterLogoUrl(result);
      else if (target === 'favicon') setFaviconUrl(result);
      setUploadLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updatedHeaderFooter: HeaderFooterSettings = {
      ...current,
      siteTitle,
      siteTitleHindi,
      siteTagline,
      showTagline,
      showTaglineDesktop,
      showTaglineMobile,
      primaryBrandColor,
      secondaryBrandColor,
      logoUrl,
      headerLogoHeight,
      showSiteTitleText,
      footerLogoUrl,
      faviconUrl,
    };

    const newSettings: PortalSettings = {
      ...settings,
      headerFooter: updatedHeaderFooter,
    };
    onUpdateSettings(newSettings);

    // Also inject CSS variable immediately into DOM for real-time visual responsiveness
    const root = document.documentElement;
    root.style.setProperty('--brand-red', primaryBrandColor);
    root.style.setProperty('--brand-primary', primaryBrandColor);

    // Update document title and favicon dynamically
    document.title = siteTagline ? `${siteTitle} - ${siteTagline}` : siteTitle;
    if (faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = faviconUrl;
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    if (onSuccessNotice) {
      onSuccessNotice('Brand identity, custom logo, and theme colors updated successfully!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-kd-body">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: primaryBrandColor }}
          >
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Admin Brand Customizer</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                WordPress Parity
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize portal brand name, upload official logo, choose primary theme colors, and configure favicon.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
          style={{ backgroundColor: primaryBrandColor }}
        >
          {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
          <span>{isSaved ? 'सेव हो गया (Saved)' : 'सेव करें (Save Brand)'}</span>
        </button>
      </div>

      {/* 2. LIVE MASTHEAD PREVIEW (WYSIWYG REAL-TIME FEEDBACK) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-kd-meta">
            <Eye className="w-4 h-4 text-slate-500" />
            <span>लाइव हेडर प्रीव्यू (Live Header Masthead Preview)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            थीम रंग एवं लोगो में परिवर्तन यहाँ तुरंत दिखाई देता है
          </span>
        </div>

        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center min-h-[100px] text-center">
          {logoUrl ? (
            <div className="flex flex-row items-center justify-center space-x-2.5 py-1">
              <img
                src={logoUrl}
                alt={siteTitle}
                style={{ height: `${headerLogoHeight}px`, maxHeight: '80px' }}
                className="w-auto object-contain transition-all duration-200"
              />
              {showSiteTitleText && (
                <div className="text-left">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-kd-header">
                    {siteTitle}
                  </h1>
                  {siteTitleHindi && siteTitleHindi !== siteTitle && (
                    <p className="text-xs text-slate-500 font-bold">{siteTitleHindi}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: primaryBrandColor }}
              />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-kd-header">
                {siteTitle}
              </h1>
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: primaryBrandColor }}
              />
            </div>
          )}

          {showTagline && siteTagline && (
            <p className="text-xs text-slate-500 font-medium mt-1 font-kd-meta">
              {siteTagline}
            </p>
          )}

          {/* Dummy Navigation preview bar with brand color */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/70 w-full flex items-center justify-center gap-2">
            <span
              className="text-white text-xs font-bold px-3 py-1 rounded-md shadow-2xs"
              style={{ backgroundColor: primaryBrandColor }}
            >
              होम
            </span>
            <span className="text-slate-600 text-xs font-medium px-2 py-1 hover:text-slate-900">
              देश
            </span>
            <span className="text-slate-600 text-xs font-medium px-2 py-1 hover:text-slate-900">
              राजनीति
            </span>
            <span className="text-slate-600 text-xs font-medium px-2 py-1 hover:text-slate-900">
              खेल
            </span>
          </div>
        </div>
      </div>

      {/* 3. BRAND NAME & IDENTITY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Type className="w-4 h-4 text-slate-600" />
          <span>Brand Naming & Slogan (पोर्टल नाम एवं स्लोगन)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Portal / Brand Name (English)
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="e.g. Khabri Dost"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Displayed in header, SEO title tag, and brand cards.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand Name (हिंदी / देवनागरी)
            </label>
            <input
              type="text"
              value={siteTitleHindi}
              onChange={(e) => setSiteTitleHindi(e.target.value)}
              placeholder="उदा. ख़बरी दोस्त"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used across Hindi headlines, footer about section, and Hindi meta tags.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Brand Tagline / Slogan (स्लोगन)
          </label>
          <input
            type="text"
            value={siteTagline}
            onChange={(e) => setSiteTagline(e.target.value)}
            placeholder="उदा. सटीक ख़बर, निष्पक्ष नज़र"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Displayed directly beneath the header logo and in Google Search meta descriptions.
          </p>
        </div>

        {/* Tagline Display Options */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-wrap gap-4 items-center justify-between text-xs">
          <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showTagline}
              onChange={(e) => setShowTagline(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
            />
            <span>स्लोगन दिखाएं (Show Tagline)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showTaglineDesktop}
              onChange={(e) => setShowTaglineDesktop(e.target.checked)}
              disabled={!showTagline}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 disabled:opacity-50"
            />
            <span>डेस्कटॉप पर दिखाएं (Desktop)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showTaglineMobile}
              onChange={(e) => setShowTaglineMobile(e.target.checked)}
              disabled={!showTagline}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 disabled:opacity-50"
            />
            <span>मोबाइल पर दिखाएं (Mobile)</span>
          </label>
        </div>
      </div>

      {/* 4. PRIMARY BRAND COLOR & THEME PALETTE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Palette className="w-4 h-4 text-slate-600" />
          <span>Primary Brand Color & Dynamic Theme (थीम रंग)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Color Picker & Custom Hex Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Custom Primary Color (मुख्य ब्रांड रंग)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={primaryBrandColor}
                onChange={(e) => setPrimaryBrandColor(e.target.value)}
                className="w-12 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={primaryBrandColor}
                onChange={(e) => setPrimaryBrandColor(e.target.value)}
                placeholder="#dc2626"
                className="w-32 bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-red-500 uppercase"
              />
              <div
                className="w-8 h-8 rounded-lg shadow-2xs border border-slate-200"
                style={{ backgroundColor: primaryBrandColor }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Changes header buttons, reading progress bar, breaking ticker, and active navigation pills.
            </p>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Secondary / Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={secondaryBrandColor}
                onChange={(e) => setSecondaryBrandColor(e.target.value)}
                className="w-12 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={secondaryBrandColor}
                onChange={(e) => setSecondaryBrandColor(e.target.value)}
                placeholder="#1e293b"
                className="w-32 bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-red-500 uppercase"
              />
              <div
                className="w-8 h-8 rounded-lg shadow-2xs border border-slate-200"
                style={{ backgroundColor: secondaryBrandColor }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Used for subtle border accents and secondary badges.
            </p>
          </div>
        </div>

        {/* 1-Click Color Preset Palette */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Quick 1-Click Editorial Presets (लोकप्रिय न्यूज़ पैलेट):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BRAND_COLOR_PRESETS.map((preset) => {
              const isSelected = primaryBrandColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setPrimaryBrandColor(preset.hex)}
                  className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'border-slate-800 bg-slate-100 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-md shrink-0 shadow-2xs flex items-center justify-center text-white text-[10px]"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="truncate text-slate-800 font-bold">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. LOGO & FAVICON UPLOADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <ImageIcon className="w-4 h-4 text-slate-600" />
          <span>Logo & Visual Assets (लोगो एवं फेविकॉन)</span>
        </h3>

        {/* Header Logo */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Header Logo (हेडर लोगो)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="md:col-span-2 flex items-center space-x-2">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png or upload below"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-xs text-red-600 font-bold hover:underline shrink-0 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <label className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 p-2.5 rounded-xl cursor-pointer text-xs font-bold transition">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>{uploadLoading ? 'Uploading...' : 'कंप्यूटर से अपलोड'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Logo Height Slider */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
              <span>Logo Display Height (लोगो की ऊंचाई):</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                {headerLogoHeight}px
              </span>
            </div>
            <input
              type="range"
              min="28"
              max="80"
              step="2"
              value={headerLogoHeight}
              onChange={(e) => setHeaderLogoHeight(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>28px (Compact)</span>
              <span>48px (Recommended)</span>
              <span>80px (Large)</span>
            </div>
          </div>

          {/* Show Site Title Alongside Logo Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showSiteTitleText}
              onChange={(e) => setShowSiteTitleText(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
            />
            <span>लोगो के साथ पोर्टल का नाम भी दिखाएं (Show Title Text Alongside Logo)</span>
          </label>
        </div>

        {/* Favicon URL */}
        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Browser Favicon (ब्राउज़र टैब आइकन - 32x32 या 64x64)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://example.com/favicon.png"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <label className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition shrink-0">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>अपलोड</span>
              <input
                type="file"
                accept="image/png,image/x-icon,image/svg+xml"
                onChange={(e) => handleFileUpload(e, 'favicon')}
                className="hidden"
              />
            </label>
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt="Favicon"
                className="w-8 h-8 rounded-md border border-slate-200 object-contain p-0.5 bg-white shrink-0"
              />
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            This icon appears in the browser tab and bookmarks.
          </p>
        </div>
      </div>

      {/* 6. BOTTOM SAVE ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Info className="w-4 h-4 text-slate-400" />
          <span>परिवर्तन तुरंत सेव करें और पूरी वेबसाइट पर लागू करें</span>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition hover:opacity-95 active:scale-95 cursor-pointer"
          style={{ backgroundColor: primaryBrandColor }}
        >
          {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
          <span>{isSaved ? 'सेव हो गया (Saved)' : 'परिवर्तन सेव करें (Save Changes)'}</span>
        </button>
      </div>
    </div>
  );
};
