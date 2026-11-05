import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, AlertCircle, FileText, Lightbulb, CheckCircle2, Tag, List, Link } from 'lucide-react';
import { ApiConfiguration } from '../../types/news';
import { authFetch } from '../../utils/authFetch';

interface AiSeoMetaResult {
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string;
  imageAltText: string;
  explanation: string;
  alternativeTitles?: string[];
  alternativeDescriptions?: string[];
  tags?: string[];
  highlights?: string[];
  urlSlug?: string;
}

interface AiSeoMetaGeneratorProps {
  articleTitle: string;
  articleContent: string;
  articleCategory: string;
  currentSeoTitle?: string;
  currentSeoDescription?: string;
  currentFocusKeywords?: string;
  currentImageAltText?: string;
  apiConfig?: ApiConfiguration;
  onApplyMeta: (meta: {
    seoTitle?: string;
    seoDescription?: string;
    focusKeywords?: string;
    imageAltText?: string;
    tags?: string[];
    highlights?: string[];
    urlSlug?: string;
  }) => void;
}

export const AiSeoMetaGenerator: React.FC<AiSeoMetaGeneratorProps> = ({
  articleTitle,
  articleContent,
  articleCategory,
  apiConfig,
  onApplyMeta,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiSeoMetaResult | null>(null);
  const [appliedField, setAppliedField] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [selectedDescription, setSelectedDescription] = useState<string>('');

  const wordCount = (articleContent || '').trim().split(/\s+/).filter(Boolean).length;

  const handleGenerate = async () => {
    if (!articleContent || articleContent.trim().length < 30) {
      setError('Please add body content first so the AI can evaluate context and recommend accurate SEO metadata.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const activeProvider = apiConfig?.activeAiProvider || 'gemini';
      const customKey =
        activeProvider === 'gemini'
          ? apiConfig?.geminiApiKey
          : activeProvider === 'openai'
          ? apiConfig?.openaiApiKey
          : apiConfig?.anthropicApiKey;

      const response = await authFetch('/api/ai/generate-seo-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: articleContent,
          title: articleTitle,
          category: articleCategory,
          customApiKey: customKey,
          provider: activeProvider,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
        setSelectedTitle(resJson.data.metaTitle);
        setSelectedDescription(resJson.data.metaDescription);
      } else {
        throw new Error(resJson.error || 'Failed to generate SEO metadata.');
      }
    } catch (err: any) {
      console.error('Error generating AI SEO meta:', err);
      setError('Encountered an issue generating SEO suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAll = () => {
    if (!result) return;
    onApplyMeta({
      seoTitle: selectedTitle || result.metaTitle,
      seoDescription: selectedDescription || result.metaDescription,
      focusKeywords: result.focusKeywords,
      imageAltText: result.imageAltText,
      tags: result.tags,
      highlights: result.highlights,
      urlSlug: result.urlSlug,
    });
    setAppliedField('all');
    setTimeout(() => setAppliedField(null), 2500);
  };

  const notifyApplied = (fieldName: string) => {
    setAppliedField(fieldName);
    setTimeout(() => setAppliedField(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>AI Automated Meta Title & Description Generator</span>
              <span className="text-[10px] font-mono uppercase bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                Gemini AI
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Generate 100% search and news optimized metadata based on your article draft.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing draft...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{result ? 'Regenerate' : 'Generate SEO with AI'}</span>
            </>
          )}
        </button>
      </div>

      {/* Helper notice if no content */}
      {wordCount < 10 && !result && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-600">
          <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-900 font-semibold block mb-0.5">Body content recommended:</span>
            <span>
              As you draft your article (current words: {wordCount}), AI can evaluate context to craft high-CTR titles and meta snippets.
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Results Area */}
      {result && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* Top Explanation Banner */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-slate-800 flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                AI SEO Strategy & Insights:
              </span>
              <span>{result.explanation}</span>
            </div>
            <button
              type="button"
              onClick={handleApplyAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1 shrink-0 ml-2 cursor-pointer shadow-2xs"
            >
              {appliedField === 'all' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Applied!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply All</span>
                </>
              )}
            </button>
          </div>

          {/* 1. Meta Title Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900">
                  Suggested SEO Meta Title
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    selectedTitle.length >= 48 && selectedTitle.length <= 60
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedTitle.length} / 60 chars ({selectedTitle.length >= 48 && selectedTitle.length <= 60 ? 'Optimal' : 'Needs Review'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onApplyMeta({ seoTitle: selectedTitle });
                  notifyApplied('title');
                }}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                {appliedField === 'title' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Applied
                  </span>
                ) : (
                  <span>Apply Title →</span>
                )}
              </button>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between gap-2 shadow-2xs">
              <span className="line-clamp-2">{selectedTitle}</span>
            </div>

            {/* Alternative Titles */}
            {result.alternativeTitles && result.alternativeTitles.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Alternative Title Angles:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {result.alternativeTitles.map((altTitle, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedTitle(altTitle)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition flex items-center justify-between border ${
                        selectedTitle === altTitle
                          ? 'bg-red-50 border-red-400 text-red-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="line-clamp-1">{altTitle}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">
                        {altTitle.length}ch
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Meta Description Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900">
                  Suggested Meta Description
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    selectedDescription.length >= 135 && selectedDescription.length <= 160
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedDescription.length} / 160 chars ({selectedDescription.length >= 135 && selectedDescription.length <= 160 ? 'Optimal for SERP' : 'Needs Review'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onApplyMeta({ seoDescription: selectedDescription });
                  notifyApplied('desc');
                }}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                {appliedField === 'desc' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Applied
                  </span>
                ) : (
                  <span>Apply Description →</span>
                )}
              </button>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
              {selectedDescription}
            </div>

            {/* Alternative Descriptions */}
            {result.alternativeDescriptions && result.alternativeDescriptions.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Alternative Snippet Variations:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {result.alternativeDescriptions.map((altDesc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDescription(altDesc)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition flex items-center justify-between border ${
                        selectedDescription === altDesc
                          ? 'bg-red-50 border-red-400 text-red-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="line-clamp-2">{altDesc}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">
                        {altDesc.length}ch
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Focus Keywords & Image Alt Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Keywords */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Focus Keywords</span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyMeta({ focusKeywords: result.focusKeywords });
                    notifyApplied('kw');
                  }}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  {appliedField === 'kw' ? 'Applied' : 'Apply →'}
                </button>
              </div>
              <div className="text-xs text-slate-800 font-mono bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                {result.focusKeywords}
              </div>
            </div>

            {/* Alt Text */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Image Alt Text</span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyMeta({ imageAltText: result.imageAltText });
                    notifyApplied('alt');
                  }}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  {appliedField === 'alt' ? 'Applied' : 'Apply →'}
                </button>
              </div>
              <div className="text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200 line-clamp-2 shadow-2xs">
                {result.imageAltText}
              </div>
            </div>
          </div>

          {/* 4. Highlights, Tags, & URL Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Highlights */}
            {result.highlights && result.highlights.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <List className="w-3.5 h-3.5 text-amber-500" />
                    <span>Story Highlights</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyMeta({ highlights: result.highlights });
                      notifyApplied('highlights');
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    {appliedField === 'highlights' ? 'Applied' : 'Apply →'}
                  </button>
                </div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {result.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">•</span>
                      <span className="line-clamp-2">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags & URL Slug */}
            <div className="space-y-3">
              {result.tags && result.tags.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      <span>Recommended Tags</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyMeta({ tags: result.tags });
                        notifyApplied('tags');
                      }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      {appliedField === 'tags' ? 'Applied' : 'Apply →'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags.map((t, i) => (
                      <span key={i} className="text-[11px] bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.urlSlug && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Clean SEO Slug</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyMeta({ urlSlug: result.urlSlug });
                        notifyApplied('slug');
                      }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      {appliedField === 'slug' ? 'Applied' : 'Apply →'}
                    </button>
                  </div>
                  <div className="text-xs font-mono text-emerald-700 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    /{result.urlSlug}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
