import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
  Tag,
  FileText,
  TrendingUp,
  Cpu,
  AlertCircle,
  Flame,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ApiConfiguration, NewsArticle, NewsCategory } from '../../types/news';
import { CATEGORIES } from '../../data/seedNews';
import { authFetch } from '../../utils/authFetch';

interface AiSeoAssistantModuleProps {
  apiConfig?: ApiConfiguration;
  onOpenArticleEditorWithData?: (data: {
    title: string;
    summary: string;
    content?: string;
    category: NewsCategory;
    seoTitle?: string;
    seoDescription?: string;
    focusKeywords?: string;
    tags?: string[];
    highlights?: string[];
    urlSlug?: string;
  }) => void;
  articles?: NewsArticle[];
}

export const AiSeoAssistantModule: React.FC<AiSeoAssistantModuleProps> = ({
  apiConfig,
  onOpenArticleEditorWithData,
  articles = [],
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<NewsCategory>('national');
  const [bodyDraft, setBodyDraft] = useState('');
  const [editorialAngle, setEditorialAngle] = useState('Factual, human-interest & search-intent focused');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedResult, setGeneratedResult] = useState<{
    title: string;
    alternativeTitles: string[];
    urlSlug: string;
    metaDescription: string;
    alternativeDescriptions: string[];
    focusKeywords: string;
    tags: string[];
    highlights: string[];
    imageAltText: string;
    content?: string;
    explanation?: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedDescription, setSelectedDescription] = useState('');

  const activeProvider = apiConfig?.activeAiProvider || 'gemini';
  const customKey =
    activeProvider === 'gemini'
      ? apiConfig?.geminiApiKey
      : activeProvider === 'openai'
      ? apiConfig?.openaiApiKey
      : apiConfig?.anthropicApiKey;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !bodyDraft.trim()) {
      setError('Please provide a Topic / Working Headline or Article Body text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (bodyDraft.trim().length > 30) {
        // Detailed content analysis
        const res = await authFetch('/api/ai/generate-seo-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: topic.trim() || undefined,
            content: bodyDraft,
            category,
            customApiKey: customKey,
            provider: activeProvider,
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          setGeneratedResult({
            ...data.data,
            title: data.data.metaTitle || topic,
          });
          setSelectedTitle(data.data.metaTitle || topic);
          setSelectedDescription(data.data.metaDescription || '');
        } else {
          throw new Error(data.error || 'Failed to generate SEO metadata.');
        }
      } else {
        // Draft from topic
        const res = await authFetch('/api/ai/draft-article-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic.trim(),
            category,
            userAngle: editorialAngle,
            customApiKey: customKey,
            provider: activeProvider,
          }),
        });

        const data = await res.json();
        if (data.success && data.article) {
          setGeneratedResult(data.article);
          setSelectedTitle(data.article.title);
          setSelectedDescription(data.article.metaDescription || data.article.summary);
        } else {
          throw new Error(data.error || 'Failed to generate draft.');
        }
      }
    } catch (err: any) {
      console.error('AI SEO Assistant error:', err);
      setError(err.message || 'Error occurred while contacting AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadIntoEditor = () => {
    if (!generatedResult || !onOpenArticleEditorWithData) return;
    onOpenArticleEditorWithData({
      title: selectedTitle || generatedResult.title,
      summary: selectedDescription || generatedResult.metaDescription,
      content: generatedResult.content || bodyDraft,
      category,
      seoTitle: selectedTitle || generatedResult.title,
      seoDescription: selectedDescription || generatedResult.metaDescription,
      focusKeywords: generatedResult.focusKeywords,
      tags: generatedResult.tags,
      highlights: generatedResult.highlights,
      urlSlug: generatedResult.urlSlug,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Module Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  AI SEO Assistant Studio
                </h2>
                <span className="text-[10px] font-mono uppercase bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Automatically generate search-engine optimized headlines, clean URL slugs, meta descriptions, keyword tags, and Discover highlights based on article drafts or Google Trends topics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Provider: {activeProvider.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Topic / Draft Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>Source Topic or Article Draft</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">INPUT DATA</span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                News Headline / Working Topic Idea
              </label>
              <input
                type="text"
                placeholder="e.g. गगनयान मिशन 2026 अंतरिक्ष यात्रियों की ट्रेनिंग पूरी..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category (विषय)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-medium"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.labelHindi} ({c.labelEnglish})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Editorial Angle
                </label>
                <select
                  value={editorialAngle}
                  onChange={(e) => setEditorialAngle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-medium"
                >
                  <option value="Factual & In-depth">Factual & In-depth</option>
                  <option value="Breaking News Urgent">Breaking / Urgent</option>
                  <option value="Public Interest & Impact">Public Impact (आम जनता)</option>
                  <option value="Analytical & Explainer">Explainer (समझाएं)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Article Body Text (Optional Draft for Deep SEO Analysis)
                </label>
                <span className="text-[10px] text-slate-400">
                  {bodyDraft.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={7}
                placeholder="यदि आपके पास पहले से कोई ड्राफ्ट या पैराग्राफ हैं, तो यहाँ पेस्ट करें। एआई पूरे टेक्स्ट का विश्लेषण करके उच्चतम रैंक वाले कीवर्ड्स व मेटाडेटा तैयार करेगा..."
                value={bodyDraft}
                onChange={(e) => setBodyDraft(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 font-sans leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-md shadow-red-900/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Complete SEO Suite...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Generate SEO & Content Suite</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Pick from Existing Published Articles */}
          {articles.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Or Pick from Published Articles to Optimize:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {articles.slice(0, 5).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      setTopic(art.title);
                      setCategory(art.category);
                      setBodyDraft(art.content);
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-800 truncate mr-2">{art.title}</span>
                    <span className="text-[10px] text-red-600 font-bold shrink-0">Select →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output: Results & Review */}
        <div className="lg:col-span-7 space-y-4">
          {generatedResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Header with Load into Editor Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      SEO Optimization Complete
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ready for Google Search, Google News, and Discover feed ranking.
                    </p>
                  </div>
                </div>

                {onOpenArticleEditorWithData && (
                  <button
                    type="button"
                    onClick={handleLoadIntoEditor}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Load into Article Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 1. Primary Title & Alternative Angles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>1. Primary SEO Headline (Hindi)</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({selectedTitle.length} chars • Ideal 48-60)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTitle, 'title')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />

                {/* Alternative Titles */}
                {generatedResult.alternativeTitles && generatedResult.alternativeTitles.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Alternative Editorial Angles (Click to use):
                    </span>
                    <div className="space-y-1">
                      {generatedResult.alternativeTitles.map((altT, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedTitle(altT)}
                          className={`text-xs p-2 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                            selectedTitle === altT
                              ? 'bg-red-50 border-red-300 text-red-900 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="truncate mr-2">{altT}</span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {altT.length} ch
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. URL Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    2. Clean Romanized URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedResult.urlSlug, 'slug')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedKey === 'slug' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800">
                  <span className="text-slate-400 mr-1">khabridost.com/news/</span>
                  <span className="font-bold text-indigo-700">{generatedResult.urlSlug}</span>
                </div>
              </div>

              {/* 3. Meta Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>3. Google Snippet Meta Description</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({selectedDescription.length} chars • Ideal 140-160)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedDescription, 'desc')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedKey === 'desc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={selectedDescription}
                  onChange={(e) => setSelectedDescription(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none leading-relaxed"
                />

                {/* Alternative Meta Descriptions */}
                {generatedResult.alternativeDescriptions && generatedResult.alternativeDescriptions.length > 0 && (
                  <div className="space-y-1">
                    {generatedResult.alternativeDescriptions.map((altD, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedDescription(altD)}
                        className={`text-xs p-2 rounded-lg border cursor-pointer transition ${
                          selectedDescription === altD
                            ? 'bg-red-50 border-red-300 text-red-900 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {altD}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Tags & Focus Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Focus Search Keywords
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedResult.focusKeywords, 'fkw')}
                      className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'fkw' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                    {generatedResult.focusKeywords}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Article Keyword Tags
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedResult.tags.join(', '), 'tags')}
                      className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'tags' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedResult.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Article Highlights (Google Discover Key Points) */}
              {generatedResult.highlights && generatedResult.highlights.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>⚡ Article Highlights (Key Facts for Discover)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedResult.highlights.join('\n• '), 'hl')}
                      className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'hl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                    {generatedResult.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="text-xs text-amber-950 flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                {onOpenArticleEditorWithData && (
                  <button
                    type="button"
                    onClick={handleLoadIntoEditor}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Draft & Publish in Editor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                AI SEO Assistant Waiting for Input
              </h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Enter a news topic on the left or paste an article draft to automatically generate optimized titles, slugs, meta tags, and highlights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
