import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Tag,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';
import { NewsArticle, NewsCategory, PortalSettings } from '../types/news';
import { CATEGORIES } from '../data/seedNews';
import { MAJOR_INDIAN_STATES } from '../data/seedNews';
import { formatHindiDate, formatHindiTimeAgo } from '../utils/hindiHelpers';

interface ArchivePageViewProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onBackToHome: () => void;
  portalSettings: PortalSettings;
  fontSize?: 'normal' | 'large' | 'xlarge';
}

type SortOrder = 'newest' | 'oldest' | 'most_viewed' | 'most_liked';
type DateFilterMode = 'specific' | 'range' | 'preset';

const MONTH_NAMES_HINDI = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

const DAYS_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export const ArchivePageView: React.FC<ArchivePageViewProps> = ({
  articles,
  onSelectArticle,
  onBackToHome,
  portalSettings,
  fontSize = 'normal',
}) => {
  // Search & Filters State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [selectedState, setSelectedState] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Date Filter State
  const [dateMode, setDateMode] = useState<DateFilterMode>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('all');
  const [specificDate, setSpecificDate] = useState<string>(''); // YYYY-MM-DD
  const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
  const [toDate, setToDate] = useState<string>(''); // YYYY-MM-DD

  // Interactive Mini Calendar View State
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Font sizing styles
  const textScaleClass =
    fontSize === 'large'
      ? 'text-base sm:text-lg'
      : fontSize === 'xlarge'
      ? 'text-lg sm:text-xl'
      : 'text-sm sm:text-base';

  // Map dates of published articles for calendar badges
  const articleDatesMap = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.createdAt) {
        const d = a.createdAt.split('T')[0];
        set.add(d);
      }
    });
    return set;
  }, [articles]);

  // Calendar Day Calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days = [];

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: '' });
    }

    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthPadded = String(calendarMonth + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const dateStr = `${calendarYear}-${monthPadded}-${dayPadded}`;
      days.push({ day, dateStr, hasArticles: articleDatesMap.has(dateStr) });
    }

    return days;
  }, [calendarYear, calendarMonth, articleDatesMap]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setDateMode('preset');
    setSpecificDate('');
    setFromDate('');
    setToDate('');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setSpecificDate(todayStr);
      setDateMode('specific');
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      setSpecificDate(y.toISOString().split('T')[0]);
      setDateMode('specific');
    } else if (preset === 'last7') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
      setDateMode('range');
    } else if (preset === 'thisMonth') {
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setFromDate(firstOfMonth);
      setToDate(todayStr);
      setDateMode('range');
    } else if (preset === 'last30') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
      setDateMode('range');
    } else if (preset === 'thisYear') {
      const firstOfYear = `${now.getFullYear()}-01-01`;
      setFromDate(firstOfYear);
      setToDate(todayStr);
      setDateMode('range');
    }
  };

  // Handle Specific Date Selection from Calendar
  const handleSelectCalendarDate = (dateStr: string) => {
    setSpecificDate(dateStr);
    setDateMode('specific');
    setSelectedPreset('custom');
    setFromDate('');
    setToDate('');
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('all');
    setSelectedState('');
    setSortOrder('newest');
    setDateMode('preset');
    setSelectedPreset('all');
    setSpecificDate('');
    setFromDate('');
    setToDate('');
  };

  // Filter & Sort Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        // Keyword Search
        if (searchKeyword.trim()) {
          const kw = searchKeyword.toLowerCase().trim();
          const matchesTitle = article.title?.toLowerCase().includes(kw);
          const matchesSummary = article.summary?.toLowerCase().includes(kw);
          const matchesContent = article.content?.toLowerCase().includes(kw);
          const matchesAuthor = article.authorName?.toLowerCase().includes(kw);
          const matchesLocation = article.location?.toLowerCase().includes(kw);
          const matchesTags = article.tags?.some((t) => t.toLowerCase().includes(kw));

          if (!matchesTitle && !matchesSummary && !matchesContent && !matchesAuthor && !matchesLocation && !matchesTags) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'all') {
          if (article.category !== selectedCategory) return false;
        }

        // State Filter
        if (selectedState) {
          const matchesLocation = article.location?.includes(selectedState);
          const matchesTitle = article.title?.includes(selectedState);
          const matchesSummary = article.summary?.includes(selectedState);
          if (!matchesLocation && !matchesTitle && !matchesSummary) return false;
        }

        // Date Filter
        if (article.createdAt) {
          const articleDateStr = article.createdAt.split('T')[0];

          if (dateMode === 'specific' && specificDate) {
            if (articleDateStr !== specificDate) return false;
          } else if (dateMode === 'range') {
            if (fromDate && articleDateStr < fromDate) return false;
            if (toDate && articleDateStr > toDate) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOrder === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOrder === 'most_viewed') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        if (sortOrder === 'most_liked') {
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
        return 0;
      });
  }, [articles, searchKeyword, selectedCategory, selectedState, dateMode, specificDate, fromDate, toDate, sortOrder]);

  const activeFiltersCount = [
    Boolean(searchKeyword.trim()),
    selectedCategory !== 'all',
    Boolean(selectedState),
    dateMode === 'specific' && Boolean(specificDate),
    dateMode === 'range' && (Boolean(fromDate) || Boolean(toDate)),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 font-kd-body text-slate-800">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <div className="bg-white text-slate-900 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 font-kd-meta mb-1">
                <button
                  onClick={onBackToHome}
                  className="hover:underline flex items-center space-x-1 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>मुख्य पृष्ठ (Home)</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-red-600 font-bold">समाचार पुरालेख (Archive)</span>
              </div>
              <h1 className="kd-static-title flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                <span>समाचार पुरालेख एवं ऐतिहासिक कवरेज</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                विगत तिथियों, महीनों व वर्षों के प्रकाशित समाचार, विशेष रिपोर्ट एवं श्रेणीवार पुरालेख खोजें
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onBackToHome}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>होम पर वापस</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: FILTERS SIDEBAR + ARTICLE RESULTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: FILTERS & CALENDAR PICKER (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-5">
            {/* SEARCH BOX */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-kd-meta">
                खोज शब्द (Keyword Search)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="शीर्षक, विषय, पत्रकार, स्थान खोजें..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* INTERACTIVE CALENDAR PICKER */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 font-kd-meta">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-red-600" />
                  <span>कैलेंडर पिकर (News Date)</span>
                </span>
                {specificDate && (
                  <button
                    onClick={() => {
                      setSpecificDate('');
                      setSelectedPreset('all');
                      setDateMode('preset');
                    }}
                    className="text-[11px] text-red-600 font-bold hover:underline"
                  >
                    तिथि हटाएं ✕
                  </button>
                )}
              </div>

              {/* Month & Year Navigator */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear((y) => y - 1);
                    } else {
                      setCalendarMonth((m) => m - 1);
                    }
                  }}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="पिछला महीना"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-xs font-black text-slate-800">
                  {MONTH_NAMES_HINDI[calendarMonth]} {calendarYear}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear((y) => y + 1);
                    } else {
                      setCalendarMonth((m) => m + 1);
                    }
                  }}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="अगला महीना"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {DAYS_SHORT.map((day) => (
                  <div key={day} className="py-1 font-bold text-slate-400">
                    {day}
                  </div>
                ))}

                {calendarDays.map((item, idx) => {
                  if (!item.day) {
                    return <div key={`blank-${idx}`} className="h-7" />;
                  }

                  const isSelected = specificDate === item.dateStr;
                  const isToday = today.toISOString().split('T')[0] === item.dateStr;

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => handleSelectCalendarDate(item.dateStr)}
                      className={`h-7 w-full rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center relative transition cursor-pointer ${
                        isSelected
                          ? 'bg-red-600 text-white font-bold shadow-xs'
                          : isToday
                          ? 'border border-red-500 text-red-600 font-bold bg-red-50/50'
                          : item.hasArticles
                          ? 'bg-slate-50 hover:bg-red-50 text-slate-800 hover:text-red-700 font-medium'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={`${item.dateStr}${item.hasArticles ? ' - ख़बरें मौजूद हैं' : ''}`}
                    >
                      <span>{item.day}</span>
                      {item.hasArticles && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-red-500 absolute bottom-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected date indicator */}
              {specificDate && (
                <div className="p-2 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between border border-red-200">
                  <span>चयनित तिथि: {specificDate}</span>
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">सक्रिय</span>
                </div>
              )}

              {/* HTML5 Date Input Fallback / Direct Date Picker */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">
                  या सीधे कैलेंडर तिथि चुनें:
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectCalendarDate(e.target.value);
                    } else {
                      setSpecificDate('');
                    }
                  }}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                />
              </div>
            </div>

            {/* DATE RANGE & PRESETS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 font-kd-meta">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
                त्वरित समयावधि (Quick Date Presets)
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'सभी (All Time)' },
                  { id: 'today', label: 'आज (Today)' },
                  { id: 'yesterday', label: 'कल (Yesterday)' },
                  { id: 'last7', label: 'पिछले 7 दिन' },
                  { id: 'thisMonth', label: 'इस महीने' },
                  { id: 'last30', label: 'पिछले 30 दिन' },
                  { id: 'thisYear', label: 'इस वर्ष (Year)' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer border truncate ${
                      selectedPreset === preset.id
                        ? 'bg-red-600 text-white font-bold border-red-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range (From - To) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  तिथि सीमा (From Date - To Date)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-0.5">शुरुआत (From)</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setDateMode('range');
                        setSelectedPreset('custom');
                        setSpecificDate('');
                      }}
                      className="w-full p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-0.5">समाप्ति (To)</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setDateMode('range');
                        setSelectedPreset('custom');
                        setSpecificDate('');
                      }}
                      className="w-full p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY & STATE FILTER */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 font-kd-meta">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
                श्रेणी एवं राज्य (Category & State)
              </span>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin p-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`p-1.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer border truncate ${
                    selectedCategory === 'all'
                      ? 'bg-red-600 text-white font-bold border-red-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  सभी विषय (All)
                </button>
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer border truncate ${
                      selectedCategory === cat.id
                        ? 'bg-red-600 text-white font-bold border-red-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cat.labelHindi}
                  </button>
                ))}
              </div>

              {/* Indian States Filter */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>राज्य वार फ़िल्टर (State):</span>
                  </span>
                  {selectedState && (
                    <button
                      onClick={() => setSelectedState('')}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      हटाएं ✕
                    </button>
                  )}
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                >
                  <option value="">-- सभी राज्य (All States) --</option>
                  {MAJOR_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RESET ALL BUTTON */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs font-kd-meta"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>सभी फ़िल्टर साफ़ करें (Reset Filters)</span>
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: ARTICLE RESULTS (8 Cols on LG) */}
          <div className="lg:col-span-8 space-y-4">
            {/* RESULTS HEADER & SORTING */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-kd-meta">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black font-kd-headline text-slate-900">
                    पुरालेख परिणाम
                  </h2>
                  <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                    {filteredArticles.length} ख़बरें
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeFiltersCount > 0
                    ? `${activeFiltersCount} फ़िल्टर लागू हैं`
                    : 'सभी संग्रहीत समाचार प्रदर्शित हैं'}
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold shrink-0">क्रमबद्ध करें:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 cursor-pointer"
                >
                  <option value="newest">नवीनतम पहले (Newest)</option>
                  <option value="oldest">पुरातन पहले (Oldest)</option>
                  <option value="most_viewed">सर्वाधिक पढ़े गए (Most Viewed)</option>
                  <option value="most_liked">सर्वाधिक पसंद (Most Liked)</option>
                </select>
              </div>
            </div>

            {/* ACTIVE FILTERS CHIPS */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center flex-wrap gap-1.5 font-kd-meta text-xs">
                <span className="text-slate-400 font-medium text-[11px] mr-1">सक्रिय फ़िल्टर:</span>
                {searchKeyword && (
                  <span className="inline-flex items-center bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200 text-xs font-medium">
                    खोज: "{searchKeyword}"
                    <button onClick={() => setSearchKeyword('')} className="ml-1.5 hover:text-red-900 font-bold">
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-medium">
                    श्रेणी: {CATEGORIES.find((c) => c.id === selectedCategory)?.labelHindi || selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="ml-1.5 hover:text-amber-950 font-bold">
                      ×
                    </button>
                  </span>
                )}
                {selectedState && (
                  <span className="inline-flex items-center bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full border border-sky-200 text-xs font-medium">
                    राज्य: {selectedState}
                    <button onClick={() => setSelectedState('')} className="ml-1.5 hover:text-sky-950 font-bold">
                      ×
                    </button>
                  </span>
                )}
                {dateMode === 'specific' && specificDate && (
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-medium">
                    तिथि: {specificDate}
                    <button
                      onClick={() => {
                        setSpecificDate('');
                        setSelectedPreset('all');
                        setDateMode('preset');
                      }}
                      className="ml-1.5 hover:text-emerald-950 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                {dateMode === 'range' && (fromDate || toDate) && (
                  <span className="inline-flex items-center bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200 text-xs font-medium">
                    सीमा: {fromDate || 'आरंभ'} से {toDate || 'आज'}
                    <button
                      onClick={() => {
                        setFromDate('');
                        setToDate('');
                        setSelectedPreset('all');
                        setDateMode('preset');
                      }}
                      className="ml-1.5 hover:text-indigo-950 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-slate-500 hover:text-red-600 text-xs font-semibold underline ml-1 cursor-pointer"
                >
                  सभी हटाएं
                </button>
              </div>
            )}

            {/* ARTICLE CARDS LIST */}
            {filteredArticles.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 font-kd-headline">
                  चयनित तिथि या फ़िल्टर के अनुसार कोई पुरालेख खबर नहीं मिली
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  कृपया कोई अन्य तिथि, महीना अथवा श्रेणी चुनें या फ़िल्टर रीसेट करें।
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer inline-flex items-center space-x-1.5 mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>सभी फ़िल्टर साफ़ करें</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredArticles.map((art) => {
                  const catItem = CATEGORIES.find((c) => c.id === art.category);
                  const catLabel = catItem ? catItem.labelHindi : art.category;

                  return (
                    <article
                      key={art.id}
                      onClick={() => onSelectArticle(art)}
                      className="group bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start"
                    >
                      {/* Thumbnail Image */}
                      <div className="w-full sm:w-44 md:w-52 h-36 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                        {art.imageUrl ? (
                          <img
                            src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs uppercase">
                          {catLabel}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Meta strip: Date, Author, Location */}
                        <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-500 font-kd-meta">
                          <span className="flex items-center space-x-1 font-semibold text-slate-700">
                            <CalendarIcon className="w-3 h-3 text-red-500" />
                            <span>{formatHindiDate(art.createdAt)}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatHindiTimeAgo(art.createdAt)}</span>
                          </span>
                          {art.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{art.location}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Article Title */}
                        <h3 className={`font-black font-kd-headline text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2 ${textScaleClass}`}>
                          {art.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>

                        {/* Footer Meta: Views, Likes, Reporter, Read CTA */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-500 font-kd-meta">
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-slate-700">
                              ब्यूरो: {art.authorName || 'खबरी दोस्त डेस्क'}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span>{art.viewsCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-red-600">
                              <Heart className="w-3 h-3" />
                              <span>{art.likesCount || 0}</span>
                            </span>
                          </div>

                          <span className="text-red-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center space-x-0.5">
                            <span>पूरा पढ़ें</span>
                            <span>➔</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
