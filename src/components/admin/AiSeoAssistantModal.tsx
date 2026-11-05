import React, { useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Check,
  Cpu,
  Layers,
  FileText,
  Tag,
  ArrowRight,
  AlertCircle,
  Copy,
  Sliders,
  AlignLeft,
} from 'lucide-react';
import { ApiConfiguration, NewsCategory } from '../../types/news';
import { CATEGORIES } from '../../data/seedNews';
import { authFetch } from '../../utils/authFetch';

export interface DraftedSeoArticle {
  title: string;
  alternativeTitles?: string[];
  urlSlug?: string;
  summary: string;
  metaDescription: string;
  alternativeDescriptions?: string[];
  focusKeywords?: string;
  tags?: string[];
  highlights?: string[];
  content?: string;
  category?: NewsCategory;
}

interface AiSeoAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle?: string;
  currentContent?: string;
  currentCategory?: NewsCategory;
  apiConfig?: ApiConfiguration;
  onApplyToEditor: (draft: DraftedSeoArticle) => void;
}

export const AiSeoAssistantModal: React.FC<AiSeoAssistantModalProps> = ({
  isOpen,
  onClose,
  currentTitle = '',
  currentContent = '',
  currentCategory = 'national',
  apiConfig,
  onApplyToEditor,
}) => {
  const [topicPrompt, setTopicPrompt] = useState(currentTitle || '');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>(currentCategory);
  const [editorialAngle, setEditorialAngle] = useState('Factual & Objective News');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review & Refine Draft State
  const [draft, setDraft] = useState<DraftedSeoArticle | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'meta' | 'content' | 'highlights'>('meta');

  const activeProvider = apiConfig?.activeAiProvider || 'gemini';
  const customKey =
    activeProvider === 'gemini'
      ? apiConfig?.geminiApiKey
      : activeProvider === 'openai'
      ? apiConfig?.openaiApiKey
      : apiConfig?.anthropicApiKey;

  if (!isOpen) return null;

  const handleGenerateDraft = async () => {
    const queryTopic = topicPrompt.trim() || currentTitle.trim();
    if (!queryTopic && !currentContent.trim()) {
      setError('कृपया कोई विषय (Topic), शीर्षक या ड्राफ्ट टेक्स्ट अवश्य दर्ज करें।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (currentContent.trim().length > 50 && (!topicPrompt || topicPrompt === currentTitle)) {
        // Optimize existing content
        const res = await authFetch('/api/ai/generate-seo-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: queryTopic,
            content: currentContent,
            category: selectedCategory,
            customApiKey: customKey,
            provider: activeProvider,
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          setDraft({
            title: data.data.metaTitle || queryTopic,
            alternativeTitles: data.data.alternativeTitles || [],
            urlSlug: data.data.urlSlug || '',
            summary: data.data.metaDescription || '',
            metaDescription: data.data.metaDescription || '',
            alternativeDescriptions: data.data.alternativeDescriptions || [],
            focusKeywords: data.data.focusKeywords || '',
            tags: data.data.tags || [],
            highlights: data.data.highlights || [],
            content: currentContent,
            category: selectedCategory,
          });
        } else {
          throw new Error(data.error || 'Failed to optimize content.');
        }
      } else {
        // Draft new article & SEO
        const res = await authFetch('/api/ai/draft-article-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: queryTopic,
            category: selectedCategory,
            userAngle: editorialAngle,
            customApiKey: customKey,
            provider: activeProvider,
          }),
        });

        const data = await res.json();
        if (data.success && data.article) {
          setDraft(data.article);
        } else {
          throw new Error(data.error || 'Failed to draft article.');
        }
      }
    } catch (err: any) {
      console.error('Draft error:', err);
      setError(err.message || 'Error communicating with AI Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!draft) return;
    onApplyToEditor(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto text-slate-100">
        {/* MODAL HEADER */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-900/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI SEO Assistant & Article Drafter</span>
                <span className="text-[10px] font-mono bg-red-600/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                  {activeProvider.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Draft headlines, SEO meta, tags, highlights, and full body content with review & refine control.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Prompt / Input Controls */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topic / Headline Idea (विषय अथवा मुख्य विचार)
                </label>
                <input
                  type="text"
                  placeholder="e.g. गगनयान मिशन अंतिम चरण में, अंतरिक्ष यात्रियों की ट्रेनिंग पूरी..."
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                />
              </div>

              <div className="w-full sm:w-44 shrink-0">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category (विषय)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as NewsCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.labelHindi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{draft ? 'Re-Generate' : 'Draft with AI'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* DRAFT REVIEW & REFINE INTERFACE */}
          {draft && (
            <div className="space-y-4">
              {/* Review Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('meta')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeReviewTab === 'meta'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Review Title, Slug & Meta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('content')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeReviewTab === 'content'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Review Body Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('highlights')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeReviewTab === 'highlights'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Highlights & Tags ({draft.highlights?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: REVIEW META & TITLE */}
              {activeReviewTab === 'meta' && (
                <div className="space-y-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      SEO Headline (शीर्षक)
                    </label>
                    <input
                      type="text"
                      value={draft.title || ''}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />

                    {/* Alternatives */}
                    {draft.alternativeTitles && draft.alternativeTitles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[11px] text-slate-400">
                          Click an alternative to switch headline:
                        </span>
                        {draft.alternativeTitles.map((alt, i) => (
                          <div
                            key={i}
                            onClick={() => setDraft({ ...draft, title: alt })}
                            className="p-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer text-slate-300 hover:text-white"
                          >
                            {alt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={draft.urlSlug || ''}
                      onChange={(e) => setDraft({ ...draft, urlSlug: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-indigo-300 focus:outline-none"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Meta Description (गूगल स्निपेट विवरण)
                    </label>
                    <textarea
                      rows={3}
                      value={draft.metaDescription || draft.summary || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          metaDescription: e.target.value,
                          summary: e.target.value,
                        })
                      }
                      className="w-full p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: REVIEW BODY CONTENT */}
              {activeReviewTab === 'content' && (
                <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Drafted Hindi Article Body (समाचार का पूरा पाठ)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {(draft.content || '').split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={draft.content || ''}
                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                    className="w-full p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              )}

              {/* TAB 3: REVIEW HIGHLIGHTS & TAGS */}
              {activeReviewTab === 'highlights' && (
                <div className="space-y-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  {/* Highlights */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Key Highlights (बड़ी बातें - Google Discover Bullet Points)
                    </label>
                    <div className="space-y-2">
                      {(draft.highlights || []).map((hl, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => {
                              const updated = [...(draft.highlights || [])];
                              updated[idx] = e.target.value;
                              setDraft({ ...draft, highlights: updated });
                            }}
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Keyword Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(draft.tags || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-900 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Focus Keywords */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Focus Keywords
                    </label>
                    <input
                      type="text"
                      value={draft.focusKeywords || ''}
                      onChange={(e) => setDraft({ ...draft, focusKeywords: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!draft}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Refined Draft to Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
