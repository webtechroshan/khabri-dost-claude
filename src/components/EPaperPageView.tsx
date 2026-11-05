import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Download,
  Share2,
  Check,
  FileText,
  Sliders,
  ChevronDown,
  Printer,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { PortalSettings, NewsArticle } from '../types/news';
import { ResolvedEPaperMode } from '../types/epaper';
import {
  getKolkataDateString,
  formatHindiNewspaperDate,
  resolveEPaperEdition,
} from '../utils/epaperEngine';
import { EPaperReader } from './EPaperReader';
import { AdBanner } from './AdBanner';
import { downloadDailyEPaperPdf } from '../utils/pdfGenerator';

interface EPaperPageViewProps {
  onBackToHome: () => void;
  portalSettings?: PortalSettings;
  articles?: NewsArticle[];
  onSelectArticle?: (article: NewsArticle) => void;
  onOpenAdminSettings?: () => void;
  isAdmin?: boolean;
}

export const EPaperPageView: React.FC<EPaperPageViewProps> = ({
  onBackToHome,
  portalSettings,
  onOpenAdminSettings,
  isAdmin = false,
}) => {
  const epaperSettings = portalSettings?.epaperSettings;
  const todayKolkata = getKolkataDateString();

  // Selected Date and Edition
  const [selectedDate, setSelectedDate] = useState<string>(
    epaperSettings?.activeEditionDate || todayKolkata
  );
  const [selectedEditionCode, setSelectedEditionCode] = useState<string>(
    epaperSettings?.activeEditionCode || 'national'
  );

  const [page, setPage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Read URL params on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const urlDate = params.get('date');
        const urlEdition = params.get('edition');
        const urlPage = params.get('page');
        if (urlDate) setSelectedDate(urlDate);
        if (urlEdition) setSelectedEditionCode(urlEdition);
        if (urlPage) {
          const p = parseInt(urlPage, 10);
          if (!isNaN(p) && p >= 1) setPage(p);
        }
      }
    } catch {}
  }, []);

  // Sync state to URL hash
  useEffect(() => {
    try {
      const newHash = `#epaper?date=${selectedDate}&edition=${selectedEditionCode}&page=${page}`;
      window.history.replaceState(null, '', newHash);
    } catch {}
  }, [selectedDate, selectedEditionCode, page]);

  // Reset page to 1 when date or edition changes
  useEffect(() => {
    setPage(1);
  }, [selectedDate, selectedEditionCode]);

  // Brand masthead metadata
  const hf = portalSettings?.headerFooter;
  const siteTitle = hf?.siteTitle || 'खबरी दोस्त';
  const siteTagline =
    hf?.siteTagline || 'राष्ट्र का सबसे विश्वसनीय एवं निष्पक्ष दैनिक समाचार पत्र';

  // Available Editions list
  const availableEditions = useMemo(() => {
    return [
      { code: 'national', name: 'राष्ट्रीय संस्करण (नई दिल्ली)', shortName: 'राष्ट्रीय (दिल्ली)', city: 'नई दिल्ली', state: 'दिल्ली / NCR' },
      { code: 'up', name: 'उत्तर प्रदेश एवं उत्तराखंड', shortName: 'उत्तर प्रदेश', city: 'लखनऊ / देहरादून', state: 'उत्तर प्रदेश' },
      { code: 'bihar', name: 'बिहार एवं झारखंड संस्करण', shortName: 'बिहार/झारखंड', city: 'पटना / रांची', state: 'बिहार' },
      { code: 'rajasthan', name: 'राजस्थान संस्करण', shortName: 'राजस्थान', city: 'जयपुर', state: 'राजस्थान' },
      { code: 'mp', name: 'मध्य प्रदेश एवं छत्तीसगढ़', shortName: 'मध्य प्रदेश', city: 'भोपाल / रायपुर', state: 'मध्य प्रदेश' },
    ];
  }, []);

  // Quick past dates (Past 7 days)
  const quickDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const ds = getKolkataDateString(d);
      dates.push({
        dateStr: ds,
        label: i === 0 ? 'आज' : i === 1 ? 'कल' : formatHindiNewspaperDate(ds).split(',')[0],
        fullHindi: formatHindiNewspaperDate(ds),
      });
    }
    return dates;
  }, []);

  // Central Resolution Engine: Pure PDF reader resolver
  const resolvedMode: ResolvedEPaperMode = useMemo(() => {
    return resolveEPaperEdition(
      selectedDate,
      selectedEditionCode,
      epaperSettings
    );
  }, [selectedDate, selectedEditionCode, epaperSettings]);

  const totalPages = resolvedMode.type === 'pdf' ? resolvedMode.totalPages : 1;

  const currentEditionName =
    resolvedMode.type === 'pdf'
      ? resolvedMode.edition.editionName
      : availableEditions.find((e) => e.code === selectedEditionCode)?.name || 'राष्ट्रीय संस्करण';

  const currentShortEditionName =
    availableEditions.find((e) => e.code === selectedEditionCode)?.shortName || currentEditionName;

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      if (resolvedMode.type === 'pdf' && resolvedMode.pdfUrl) {
        await downloadDailyEPaperPdf(
          portalSettings,
          undefined,
          undefined,
          currentEditionName,
          selectedDate,
          resolvedMode.pdfUrl
        );
      }
    } catch {
      if (resolvedMode.type === 'pdf' && resolvedMode.pdfUrl) {
        window.open(resolvedMode.pdfUrl, '_blank');
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Share handlers
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📰 *${siteTitle} • दैनिक ई-पेपर (${formatHindiNewspaperDate(selectedDate)})*\n\nआज का पूरा अखबारी डिजिटल संस्करण यहाँ ऑनलाइन पढ़ें:\n${window.location.origin}/#epaper?date=${selectedDate}&edition=${selectedEditionCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/#epaper?date=${selectedDate}&edition=${selectedEditionCode}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16 font-sans selection:bg-red-500 selection:text-white">
      <h1 className="sr-only">{siteTitle} ई-पेपर</h1>
      {/* 1. BREADCRUMBS & TOP NAV STRIP */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs font-kd-meta flex-wrap gap-2">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-slate-500 min-w-0">
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-red-600 transition flex items-center space-x-1 cursor-pointer font-medium"
            >
              <span>होम</span>
            </button>
            <span>/</span>
            <span className="text-red-600 font-bold flex items-center space-x-1 truncate">
              <FileText className="w-3.5 h-3.5" />
              <span>ई-पेपर (डिजिटल अखबारी संस्करण)</span>
            </span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline text-slate-700 font-medium truncate">
              {currentEditionName}
            </span>
          </nav>

          {/* Back to Home Button */}
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← मुख्य पृष्ठ पर लौटें</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN EPAPER PAGE HEADER (Responsive: Ultra-Compact on Mobile, Spacious on Desktop) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-1.5 sm:pt-6">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Subtle Editorial Top Accent Bar */}
          <div className="h-0.5 sm:h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />

          {/* MOBILE COMPACT HEADER (sm:hidden) - Minimalist, Compact, Native-Feeling */}
          <div className="sm:hidden px-2.5 py-2 space-y-2">
            {/* Row 1: Brand Title, Date & 1-Tap Action Pills */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center space-x-1.5">
                    <p className="font-bold text-sm text-slate-900 font-kd-headline truncate" aria-hidden="true">
                      {siteTitle} ई-पेपर
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono shrink-0">
                      {totalPages}P
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-kd-meta truncate pt-0.5">
                    <span>{formatHindiNewspaperDate(selectedDate).split(',')[0]}</span>
                    <span>•</span>
                    <span className="text-red-600 font-medium truncate">{currentShortEditionName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Compact Icon Pills */}
              <div className="flex items-center space-x-1 shrink-0">
                {/* 1-Tap WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#20ba59] active:scale-90 text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                  title="WhatsApp पर शेयर करें"
                  aria-label="WhatsApp पर शेयर करें"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`h-8 px-2 rounded-lg flex items-center justify-center space-x-1 border shadow-2xs transition active:scale-90 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="ई-पेपर लिंक कॉपी करें"
                  aria-label="ई-पेपर लिंक कॉपी करें"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px] font-bold text-white">कॉपी!</span>
                    </>
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>

                {/* Download PDF Pill */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="h-8 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-90 text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition disabled:opacity-50 cursor-pointer shrink-0"
                  title="अखबार PDF डाउनलोड"
                  aria-label="अखबार PDF डाउनलोड"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingPdf ? '...' : 'PDF'}</span>
                </button>

                {/* Admin Quick Settings if admin */}
                {isAdmin && onOpenAdminSettings && (
                  <button
                    type="button"
                    onClick={onOpenAdminSettings}
                    className="w-8 h-8 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center shadow-2xs transition cursor-pointer active:scale-90"
                    title="ePaper Admin Settings"
                    aria-label="ePaper Admin Settings"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Scrollable Quick Controls Strip (Edition, Date, Quick Chips) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100 text-xs">
              {/* Native-overlay Edition Selector Pill */}
              <div className="relative shrink-0">
                <div className="flex items-center space-x-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 transition shadow-2xs">
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  <span className="truncate max-w-[100px]">{currentShortEditionName}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
                <select
                  value={selectedEditionCode}
                  onChange={(e) => setSelectedEditionCode(e.target.value)}
                  aria-label="संस्करण चुनें"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[16px]"
                >
                  {availableEditions.map((ed) => (
                    <option key={ed.code} value={ed.code}>
                      📍 {ed.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Native-overlay Date Picker Pill */}
              <div className="relative shrink-0 flex items-center">
                <div className="flex items-center space-x-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 transition shadow-2xs">
                  <Calendar className="w-3 h-3 text-red-600 shrink-0" />
                  <span className="whitespace-nowrap">
                    {quickDates.find((d) => d.dateStr === selectedDate)?.label || selectedDate}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  max={todayKolkata}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                  }}
                  aria-label="तारीख चुनें"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[16px]"
                />
              </div>

              {/* Quick Dates Chips */}
              {quickDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP FULL-FEATURED HEADER (hidden sm:block) */}
          <div className="hidden sm:block p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
              {/* Left: Brand Identity & Current Date */}
              <div className="flex items-center space-x-2.5 sm:space-x-3.5">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <p className="font-bold text-xl sm:text-2xl text-slate-900 font-kd-headline" aria-hidden="true">
                      {siteTitle} ई-पेपर
                    </p>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-mono border border-red-200">
                      Digital Edition
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-kd-body truncate max-w-lg">
                    {siteTagline}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 pt-0.5 font-kd-meta">
                    <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{formatHindiNewspaperDate(selectedDate)}</span>
                    <span>•</span>
                    <span className="text-red-700 font-medium">{currentEditionName}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Download, WhatsApp, Copy, Admin) */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  title="WhatsApp पर शेयर करें"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-2xs cursor-pointer active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="ई-पेपर लिंक कॉपी करें"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'कॉपी हो गया!' : 'शेयर लिंक'}</span>
                </button>

                {/* Download PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="पूरा अखबारी PDF डाउनलोड करें"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingPdf ? 'डाउनलोड हो रहा है...' : 'PDF डाउनलोड'}</span>
                </button>

                {/* Admin Settings Button */}
                {isAdmin && onOpenAdminSettings && (
                  <button
                    type="button"
                    onClick={onOpenAdminSettings}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 text-xs font-bold transition shadow-2xs cursor-pointer"
                    title="Configure ePaper Edition PDFs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>ई-पेपर सेटिंग्स</span>
                  </button>
                )}
              </div>
            </div>

            {/* Edition Selector & Date Navigator Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              {/* Left: Edition Dropdown + Date Picker */}
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                {/* Edition Selector */}
                <div className="relative">
                  <select
                    value={selectedEditionCode}
                    onChange={(e) => setSelectedEditionCode(e.target.value)}
                    className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer transition shadow-2xs"
                  >
                    {availableEditions.map((ed) => (
                      <option key={ed.code} value={ed.code}>
                        📍 {ed.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Native Date Picker */}
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    max={todayKolkata}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Total Pages Badge */}
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl flex items-center space-x-1 font-mono">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>कुल {totalPages} पृष्ठ</span>
                </span>
              </div>

              {/* Right: Quick Dates Carousel (आज, कल, पिछले 7 दिन) */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
                <span className="text-[11px] font-semibold text-slate-500 shrink-0 font-kd-meta mr-1">
                  हाल के अंक:
                </span>
                {quickDates.map((item) => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 border ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={item.fullHindi}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPTIONAL LEADERBOARD AD BANNER */}
      {portalSettings?.adSettings?.showTopAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
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

      {/* 4. FULL-PAGE EPAPER DIGITAL READER CANVAS (NO CRAMPED POPUP) */}
      <div className="max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-16 sm:pb-8">
        <div className="bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-300 flex flex-col h-[82vh] sm:h-[88vh] min-h-[560px] sm:min-h-[640px] relative">
          {resolvedMode.type === 'pdf' ? (
            <EPaperReader
              pdfUrl={resolvedMode.pdfUrl}
              page={page}
              onPageChange={setPage}
              totalPages={totalPages}
              editionTitle={`${siteTitle} • ${currentEditionName}`}
              dateString={resolvedMode.dateString || selectedDate}
              allowDownload={true}
              allowPrint={true}
              showToolbar={true}
              showThumbnails={true}
              className="flex-1 w-full h-full"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
              <div className="bg-white rounded-2xl p-6 sm:p-10 max-w-md w-full text-center border border-slate-200 shadow-md space-y-4 text-slate-900">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold font-kd-headline text-slate-900">
                    ई-पेपर संस्करण उपलब्ध नहीं है
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {resolvedMode.message || 'चुनी गई तिथि के लिए अभी ई-पेपर अपलोड नहीं किया गया है।'}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayKolkata)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                  >
                    आज का मुख्य अंक पढ़ें
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. REGIONAL EDITIONS QUICK-SWITCH SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <h3 className="font-bold font-kd-headline text-base sm:text-lg text-slate-900">
              अन्य प्रादेशिक संस्करण • All Regional Newspaper Editions
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-kd-meta">
            दैनिक डिजिटल PDF आर्काइव
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {availableEditions.map((ed) => {
            const isCurrent = ed.code === selectedEditionCode;
            return (
              <button
                key={ed.code}
                type="button"
                onClick={() => {
                  setSelectedEditionCode(ed.code);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 shadow-2xs ${
                  isCurrent
                    ? 'bg-red-50/80 border-red-300 ring-2 ring-red-500/30'
                    : 'bg-white border-slate-200/90 hover:border-red-200 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {ed.state}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                      सक्रिय (Active)
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-kd-headline">
                    {ed.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-kd-meta mt-0.5">
                    मुख्य ब्यूरो: {ed.city}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-red-600 font-bold font-kd-meta">
                  <span>संस्करण पढ़ें</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
