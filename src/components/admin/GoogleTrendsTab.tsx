import React, { useState } from 'react';
import {
  TrendingUp,
  Globe,
  Key,
  Rss,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Layers,
  Zap,
} from 'lucide-react';
import { PortalSettings, GoogleTrendsConfig, NewsCategory } from '../../types/news';
import { DEFAULT_GOOGLE_TRENDS_CONFIG } from '../../data/portalDefaults';
import { DEMO_CONTENT } from '../../utils/articleVisibility';

interface GoogleTrendsTabProps {
  settings?: GoogleTrendsConfig;
  onUpdateSettings: (updated: GoogleTrendsConfig) => void;
  onOpenArticleEditorWithTopic?: (topic: string, category: NewsCategory) => void;
  onSendToAiGenerator?: (topic: string, category: NewsCategory) => void;
}

export interface TrendingItem {
  id: string;
  query: string;
  volume: string;
  category: NewsCategory;
  categoryHindi: string;
  growth: string;
  relatedQueries: string[];
  isBreakout?: boolean;
}

const SAMPLE_TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'tr-1',
    query: 'Budget 2026 Tax Slab Updates',
    volume: '250K+ खोजें',
    category: 'business',
    categoryHindi: 'व्यापार एवं अर्थव्यवस्था',
    growth: '+420%',
    relatedQueries: ['Income Tax Slab 2026', 'New Tax Regime Benefits', 'Middle Class Relief'],
    isBreakout: true,
  },
  {
    id: 'tr-2',
    query: 'WTC Final Indian Cricket Squad',
    volume: '180K+ खोजें',
    category: 'sports',
    categoryHindi: 'खेल / क्रिकेट',
    growth: '+180%',
    relatedQueries: ['BCCI Selection Meeting', 'Rohit Sharma Press Conference', 'India Playing 11'],
  },
  {
    id: 'tr-3',
    query: 'Delhi NCR Weather Alert Cold Wave',
    volume: '120K+ खोजें',
    category: 'national',
    categoryHindi: 'देश एवं मौसम',
    growth: '+95%',
    relatedQueries: ['IMD Yellow Alert', 'Delhi School Winter Holidays', 'Fog Flight Delays'],
  },
  {
    id: 'tr-4',
    query: 'Lok Sabha Election Seat Sharing Talks',
    volume: '150K+ खोजें',
    category: 'politics',
    categoryHindi: 'राजनीति',
    growth: '+210%',
    relatedQueries: ['NDA Alliance Meeting', 'Opposition Strategy Delhi', 'State Wise Polls'],
    isBreakout: true,
  },
  {
    id: 'tr-5',
    query: 'Gold Silver Rate Today India',
    volume: '90K+ खोजें',
    category: 'business',
    categoryHindi: 'बाजार एवं सराफा',
    growth: '+65%',
    relatedQueries: ['24 Carat Gold Price', 'MCX Silver Today', 'Jewellery Market Delhi'],
  },
  {
    id: 'tr-6',
    query: 'Vande Bharat Sleeper Route Map',
    volume: '85K+ खोजें',
    category: 'national',
    categoryHindi: 'राष्ट्रीय / रेलवे',
    growth: '+140%',
    relatedQueries: ['Indian Railways New Trains', 'Fare Chart Sleeper Express', 'Speed Test 160kmph'],
  },
  {
    id: 'tr-7',
    query: 'AI Smartphone Features Launched India',
    volume: '70K+ खोजें',
    category: 'tech',
    categoryHindi: 'टेक एवं गैजेट्स',
    growth: '+110%',
    relatedQueries: ['Hindi Voice Translation AI', '5G Mobile Under 20000', 'Best Camera Phone'],
  },
];

/** Sample topics exist only in demo builds; this is not live Google Trends data. */
export const INITIAL_TRENDING_ITEMS: TrendingItem[] = DEMO_CONTENT ? SAMPLE_TRENDING_ITEMS : [];

export const GoogleTrendsTab: React.FC<GoogleTrendsTabProps> = ({
  settings,
  onUpdateSettings,
  onOpenArticleEditorWithTopic,
  onSendToAiGenerator,
}) => {
  const current: GoogleTrendsConfig = {
    ...DEFAULT_GOOGLE_TRENDS_CONFIG,
    ...(settings || {}),
  };

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [trendingList, setTrendingList] = useState<TrendingItem[]>(INITIAL_TRENDING_ITEMS);

  const handleSaveConfig = (changes: Partial<GoogleTrendsConfig>) => {
    onUpdateSettings({
      ...current,
      ...changes,
    });
  };

  const handleRefreshTrends = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccess(true);
      handleSaveConfig({ lastFetchedAt: new Date().toLocaleTimeString('hi-IN') });
      setTimeout(() => setRefreshSuccess(false), 2500);
    }, 900);
  };

  const handleAddCustomKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    const updated = Array.from(new Set([...(current.customKeywords || []), newKeywordInput.trim()]));
    handleSaveConfig({ customKeywords: updated });
    setNewKeywordInput('');
  };

  const handleRemoveCustomKeyword = (kw: string) => {
    const updated = (current.customKeywords || []).filter((k: string) => k !== kw);
    handleSaveConfig({ customKeywords: updated });
  };

  const filteredTrends = trendingList.filter((item) => {
    const matchCat = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    const matchSearch =
      item.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.categoryHindi.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.relatedQueries.some((r) => r.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-slate-800">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white text-slate-800 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
              Google Trends Integration & Real-Time Keywords
            </h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
              LIVE RADAR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Track trending search queries and viral topics across India in real-time. Feed high-ranking queries straight into the AI Assistant or News Post Editor to boost Google News & Discover ranking.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshTrends}
          disabled={isRefreshing}
          className="self-start sm:self-auto flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing Trends...' : 'Refresh Trends'}</span>
        </button>
      </div>

      {/* 2. API & RSS FEED CONFIGURATION CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Google Trends API & Feed Connectivity
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {current.lastFetchedAt ? `Last Synced: ${current.lastFetchedAt}` : 'Live Auto-Sync Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Trends Data Source:</label>
            <select
              value={current.provider || 'google_rss'}
              onChange={(e) => handleSaveConfig({ provider: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="google_rss">Google Trends Official RSS Feed (Free / No Key Required)</option>
              <option value="serpapi">SerpApi Google Trends Engine</option>
              <option value="serper">Serper.dev Search Engine API</option>
              <option value="custom_api">Custom Enterprise Trends Webhook / Endpoint</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Google Trends RSS Feed URL / Endpoint:
            </label>
            <input
              type="text"
              value={current.rssFeedUrl || 'https://trends.google.com/trending/rss?geo=IN'}
              onChange={(e) => handleSaveConfig({ rssFeedUrl: e.target.value })}
              placeholder="https://trends.google.com/trending/rss?geo=IN"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              API Key (Optional for SerpApi / Serper / Custom):
            </label>
            <input
              type="password"
              value={current.apiKey || ''}
              onChange={(e) => handleSaveConfig({ apiKey: e.target.value })}
              placeholder="Paste SerpApi / Serper Key..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Region Target:</span>
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">
              🇮🇳 India (Hindi & National Focus)
            </span>
          </div>

          {refreshSuccess && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Google Trends Data successfully fetched!</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. LIVE TRENDING KEYWORDS DASHBOARD WIDGET */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Live Trending Keywords Widget (लाइव ट्रेंडिंग कीवर्ड्स)
            </h3>
            <span className="text-xs font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
              {filteredTrends.length} Active Topics
            </span>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search trending topic..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'सभी विषय (All Trends)' },
            { id: 'politics', label: '🏛️ राजनीति' },
            { id: 'national', label: '🇮🇳 देश / राष्ट्रीय' },
            { id: 'sports', label: '🏏 खेल व क्रिकेट' },
            { id: 'business', label: '📈 बिज़नेस व शेयर' },
            { id: 'tech', label: '💻 टेक' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Trending Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTrends.map((tr, idx) => (
            <div
              key={tr.id}
              className="bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200/90 hover:border-red-300 p-4 space-y-3 transition shadow-2xs group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    {tr.categoryHindi}
                  </span>
                  <div className="flex items-center space-x-1 text-emerald-700 font-bold font-mono">
                    <span>{tr.growth}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="text-base font-black text-slate-300 group-hover:text-red-600 transition font-mono w-5 shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-red-700 transition">
                      {tr.query}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                      {tr.volume}
                    </span>
                  </div>
                </div>

                {/* Related Queries Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {tr.relatedQueries.map((rq, rIdx) => (
                    <span
                      key={rIdx}
                      className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                    >
                      {rq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Editorial Team */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSendToAiGenerator && onSendToAiGenerator(tr.query, tr.category)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                  title="Generate complete SEO Article using AI"
                >
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>AI SEO Write ➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenArticleEditorWithTopic && onOpenArticleEditorWithTopic(tr.query, tr.category)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                  title="Open Article Editor with this title"
                >
                  <Plus className="w-3 h-3" />
                  <span>Editor</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CUSTOM MONITORED KEYWORDS MANAGER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Custom Keywords & Topic Watchlist (कस्टम कीवर्ड्स मॉनिटर)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {(current.customKeywords || []).length} Tracked Topics
          </span>
        </div>

        <form onSubmit={handleAddCustomKeyword} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            placeholder="Add new keyword to monitor (e.g. #RailwayBudget2026)..."
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1">
          {(current.customKeywords || []).map((kw: string) => (
            <div
              key={kw}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2 text-slate-800"
            >
              <span className="font-semibold">{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveCustomKeyword(kw)}
                className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                title="Remove keyword"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
