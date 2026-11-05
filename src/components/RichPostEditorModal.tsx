import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Tag,
  MapPin,
  Flame,
  Star,
  Bookmark,
  FileText,
  HelpCircle,
  Play,
  ShieldCheck,
  Camera,
  Upload,
  User,
  RefreshCw,
  RotateCcw,
  Check,
  Globe,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sliders,
  Send,
  Trash2,
  Plus,
} from 'lucide-react';
import { NewsArticle, NewsCategory, MediaAsset, ApiConfiguration } from '../types/news';
import { CATEGORIES, getAuthorPhoto, AUTHOR_PROFILES } from '../data/seedNews';
import { AiSeoMetaGenerator } from './admin/AiSeoMetaGenerator';
import { AiSeoAssistantModal, DraftedSeoArticle } from './admin/AiSeoAssistantModal';
import { MediaManagerModal } from './MediaManagerModal';
import { WordPressVisualEditor } from './admin/WordPressVisualEditor';
import { renderArticleBlock } from '../utils/articleContentParser';
import { compressImage } from '../utils/imageCompressor';
import { authFetch } from '../utils/authFetch';

interface RichPostEditorModalProps {
  article: Partial<NewsArticle> | null;
  onClose: () => void;
  onSave: (article: Partial<NewsArticle>) => Promise<void>;
  mediaLibrary?: MediaAsset[];
  onOpenMediaLibrary?: () => void;
  apiConfig?: ApiConfiguration;
  inline?: boolean;
  existingArticles?: NewsArticle[];
  onAddMedia?: (media: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
}

export const RichPostEditorModal: React.FC<RichPostEditorModalProps> = ({
  article,
  onClose,
  onSave,
  mediaLibrary = [],
  onOpenMediaLibrary,
  apiConfig,
  inline = false,
  existingArticles = [],
  onAddMedia,
}) => {
  // Form State
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: article?.title || '',
    subtitle: article?.subtitle || '',
    summary: article?.summary || '',
    content: article?.content || '',
    category: article?.category || 'national',
    subcategory: article?.subcategory || '',
    imageUrl: article?.imageUrl || '',
    imageCaption: article?.imageCaption || '',
    imageAltText: article?.imageAltText || '',
    imageCredit: article?.imageCredit || '',
    authorName: article?.authorName || 'मुख्य संपादक',
    authorRole: article?.authorRole || 'संपादकीय डेस्क',
    authorPhotoUrl: article?.authorPhotoUrl || getAuthorPhoto(article?.authorName || 'मुख्य संपादक'),
    authorUid: article?.authorUid || 'admin-user',
    reviewerName: article?.reviewerName || '',
    location: article?.location || 'नई दिल्ली',
    sourceAttribution: article?.sourceAttribution || '',
    isBreaking: article?.isBreaking || false,
    isTopStory: article?.isTopStory || false,
    isPinned: article?.isPinned || false,
    isEditorsPick: article?.isEditorsPick || false,
    status: article?.status || 'published',
    scheduledFor: article?.scheduledFor || '',
    seoTitle: article?.seoTitle || '',
    seoDescription: article?.seoDescription || '',
    focusKeywords: article?.focusKeywords || '',
    secondaryKeywords: article?.secondaryKeywords || '',
    canonicalUrl: article?.canonicalUrl || '',
    urlSlug: article?.urlSlug || '',
    highlights: article?.highlights || [],
    ogTitle: article?.ogTitle || '',
    ogDescription: article?.ogDescription || '',
    tags: article?.tags || ['ताज़ा ख़बर', 'राष्ट्रीय'],
    notifySubscribers: article?.notifySubscribers ?? false,
    relatedArticleIds: article?.relatedArticleIds || [],
    corrections: article?.corrections || [],
    revisions: article?.revisions || [],
    ...(article?.id ? { id: article.id } : {}),
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isFeaturedMediaModalOpen, setIsFeaturedMediaModalOpen] = useState(false);
  const featuredFileInputRef = useRef<HTMLInputElement>(null);

  const handleFeaturedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const comp = await compressImage(file, { maxWidth: 1600, quality: 0.82, format: 'image/webp' });
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormData((prev) => ({
        ...prev,
        imageUrl: comp.dataUrl,
        imageCaption: prev.imageCaption || `${cleanName} — सचित्र रिपोर्ट`,
        imageAltText: prev.imageAltText || cleanName,
      }));
      if (onAddMedia) {
        onAddMedia({
          url: comp.dataUrl,
          title: cleanName,
          caption: `${cleanName} — सचित्र रिपोर्ट`,
          altText: cleanName,
          category: formData.category || 'national',
          fileSize: comp.compressedSizeFormatted || `${(file.size / 1024).toFixed(1)} KB`,
          dimensions: `${comp.compressedWidth}x${comp.compressedHeight}`,
          type: 'image',
        });
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          imageUrl: dataUrl,
        }));
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (onAddMedia) {
          onAddMedia({
            url: dataUrl,
            title: cleanName,
            caption: `${cleanName} — सचित्र रिपोर्ट`,
            altText: cleanName,
            category: formData.category || 'national',
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            dimensions: '1200x800',
            type: 'image',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [isCompressingAuthorPhoto, setIsCompressingAuthorPhoto] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [autoGeneratingSeo, setAutoGeneratingSeo] = useState(false);
  const [seoSuccessToast, setSeoSuccessToast] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [newHighlightInput, setNewHighlightInput] = useState('');

  // Collapsible metabox states for WordPress post publisher
  const [isExcerptOpen, setIsExcerptOpen] = useState(true);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true);
  const [isSeoBoxOpen, setIsSeoBoxOpen] = useState(true);

  // Autosave Draft Recovery
  const [autosavedDraftAvailable, setAutosavedDraftAvailable] = useState<{
    data: Partial<NewsArticle>;
    savedAt: string;
  } | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<string | null>(null);

  // Check for autosaved draft on mount if composing a new article
  useEffect(() => {
    if (!article?.id) {
      try {
        const raw = localStorage.getItem('kd_editor_autosave_draft');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.data && (parsed.data.title?.trim() || parsed.data.content?.trim())) {
            setAutosavedDraftAvailable(parsed);
          }
        }
      } catch {}
    }
  }, [article?.id]);

  // Periodic autosave for new articles (every 1.5s after editing stops)
  useEffect(() => {
    if (article?.id) return;
    if (!formData.title?.trim() && !formData.content?.trim()) return;

    const timer = setTimeout(() => {
      try {
        const payload = {
          data: formData,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('kd_editor_autosave_draft', JSON.stringify(payload));
        const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setAutosaveStatus(`ऑटो-सेव: ${timeStr}`);
      } catch {}
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, article?.id]);

  // Duplicate slug / title collision detection
  const duplicateCollision = useMemo(() => {
    if (!existingArticles || existingArticles.length === 0) return null;
    const currentSlug = formData.urlSlug?.trim().toLowerCase();
    const currentTitle = formData.title?.trim().toLowerCase();
    if (!currentSlug && !currentTitle) return null;

    for (const a of existingArticles) {
      if (article?.id && a.id === article.id) continue;
      if (currentSlug && a.urlSlug && a.urlSlug.toLowerCase() === currentSlug) {
        return { type: 'slug' as const, value: a.urlSlug, title: a.title };
      }
      if (currentTitle && a.title && a.title.trim().toLowerCase() === currentTitle) {
        return { type: 'title' as const, value: a.title, title: a.title };
      }
    }
    return null;
  }, [existingArticles, formData.urlSlug, formData.title, article?.id]);

  const handleAutoSuffixSlug = () => {
    const base = formData.urlSlug || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 30) : 'khabri-news');
    const suffixed = `${base.replace(/-+$/, '')}-${Math.floor(10 + Math.random() * 90)}`;
    setFormData((prev) => ({ ...prev, urlSlug: suffixed }));
  };

  const handleRestoreAutosavedDraft = () => {
    if (autosavedDraftAvailable) {
      setFormData((prev) => ({ ...prev, ...autosavedDraftAvailable.data }));
      setAutosavedDraftAvailable(null);
      setSeoSuccessToast('✓ पिछला ड्राफ्ट सफलतापूर्वक लोड किया गया!');
      setTimeout(() => setSeoSuccessToast(null), 3500);
    }
  };

  const handleDiscardAutosavedDraft = () => {
    try {
      localStorage.removeItem('kd_editor_autosave_draft');
    } catch {}
    setAutosavedDraftAvailable(null);
  };

  const authorPhotoInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Formatting helper that inserts markdown/tags into content
  const applyFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content || '';

    const selectedText = currentText.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    setFormData({ ...formData, content: newContent });

    // Re-focus and position cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Hindi News Template Inserters
  const insertTemplate = (type: 'breaking' | 'statement' | 'quote' | 'keypoints') => {
    if (type === 'breaking') {
      const template = `\n\n### ⚡ बड़ी बातें (Key Highlights):\n- **घटना:** \n- **समय व स्थान:** \n- **मुख्य बिंदु:** \n- **आधिकारिक पुष्टि:** \n\n`;
      applyFormatting('', '', template);
    } else if (type === 'statement') {
      const template = `\n\n> «यहाँ संबंधित नेता या अधिकारी का आधिकारिक बयान लिखें। निष्पक्ष पत्रकारिता के सिद्धांतों का पालन करें।» \n— **नाम व पदनाम**\n\n`;
      applyFormatting('', '', template);
    } else if (type === 'quote') {
      applyFormatting('> «', '»\n');
    } else if (type === 'keypoints') {
      const template = `\n\n> 💡 **विशेष तथ्य (Special Report):**\n> 1. \n> 2. \n> 3. \n\n`;
      applyFormatting('', '', template);
    }
  };

  // Word & Character count calculations
  const wordsCount = (formData.content || '').trim().split(/\s+/).filter(Boolean).length;
  const charsCount = (formData.content || '').length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordsCount / 180));

  // Tag Management
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    const currentTags = formData.tags || [];
    if (!currentTags.includes(clean)) {
      setFormData({ ...formData, tags: [...currentTags, clean] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((tag) => tag !== t),
    });
  };

  // Highlights Management
  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    const current = formData.highlights || [];
    setFormData({
      ...formData,
      highlights: [...current, newHighlightInput.trim()],
    });
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    const current = formData.highlights || [];
    setFormData({
      ...formData,
      highlights: current.filter((_, i) => i !== idx),
    });
  };

  // Auto-Generate SEO using Gemini API based on article content
  const handleAutoGenerateSeo = async () => {
    if (!formData.content || formData.content.trim().length < 20) {
      setFormError('कृपया पहले लेख का विवरण / बॉडी (Body Content) लिखें ताकि AI सही व सटीक SEO तैयार कर सके।');
      return;
    }
    setAutoGeneratingSeo(true);
    setFormError(null);
    try {
      const activeProvider = apiConfig?.activeAiProvider || 'gemini';
      const customKey =
        activeProvider === 'gemini'
          ? apiConfig?.geminiApiKey
          : activeProvider === 'openai'
          ? apiConfig?.openaiApiKey
          : apiConfig?.anthropicApiKey;

      const res = await authFetch('/api/ai/generate-seo-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          category: formData.category || 'national',
          customApiKey: customKey,
          provider: activeProvider,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        const data = resData.data;
        setFormData((prev) => ({
          ...prev,
          title: prev.title?.trim() ? prev.title : data.metaTitle,
          seoTitle: data.metaTitle,
          seoDescription: data.metaDescription,
          summary: prev.summary?.trim() ? prev.summary : data.metaDescription,
          focusKeywords: data.focusKeywords,
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : prev.tags,
          highlights: data.highlights || prev.highlights,
          urlSlug: data.urlSlug || prev.urlSlug,
        }));
        setSeoSuccessToast('✓ AI Auto-Generate: Title, Slug, Meta, Tags & Highlights updated!');
        setTimeout(() => setSeoSuccessToast(null), 4000);
      } else {
        throw new Error(resData.error || 'Failed to auto-generate SEO');
      }
    } catch (err: any) {
      console.error('Auto SEO error:', err);
      setFormError('SEO जनरेट करने में त्रुटि: ' + (err.message || 'Error'));
    } finally {
      setAutoGeneratingSeo(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e?: React.FormEvent, forceStatus?: 'published' | 'draft' | 'pending_review') => {
    if (e) e.preventDefault();
    setFormError(null);

    // Record revision history if editing an existing article
    let revisionsList = formData.revisions ? [...formData.revisions] : [];
    if (formData.id && (article?.title || article?.content)) {
      revisionsList.unshift({
        id: `rev_${Date.now()}`,
        savedAt: new Date().toISOString(),
        savedBy: formData.authorName || 'Editor',
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
      });
      revisionsList = revisionsList.slice(0, 15);
    }

    const submissionData = {
      ...formData,
      ...(forceStatus ? { status: forceStatus } : {}),
      revisions: revisionsList,
      // Auto-populate URL slug from title if missing
      urlSlug:
        formData.urlSlug?.trim() ||
        (formData.title
          ? formData.title
              .toLowerCase()
              .replace(/[^a-z0-9]/gi, '-')
              .replace(/-+/g, '-')
              .slice(0, 60)
          : `story-${Date.now()}`),
    };

    if (!submissionData.title?.trim() || !submissionData.summary?.trim() || !submissionData.content?.trim()) {
      setFormError('कृपया समाचार शीर्षक, संक्षिप्त सार और पूर्ण लेख अवश्य भरें।');
      return;
    }

    if (submissionData.status === 'scheduled' && !submissionData.scheduledFor) {
      setFormError('कृपया शेड्यूल्ड प्रकाशन का समय (Release Timestamp) चुनें।');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(submissionData);
      try {
        localStorage.removeItem('kd_editor_autosave_draft');
      } catch {}
      onClose();
    } catch (err: any) {
      console.error(err);
      setFormError('आर्टिकल सहेजने में त्रुटि आई: ' + (err?.message || 'पुनः प्रयास करें'));
    } finally {
      setIsSaving(false);
    }
  };

  const editorLayout = (
    <div className="bg-white border border-slate-200 w-full rounded-2xl shadow-sm flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* 1. WORDPRESS-STYLE TOP ADMIN BAR (Light Theme) */}
      <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 gap-3 z-20">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <Edit3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {formData.id ? 'Edit Article' : 'Add New Article'}
              </h2>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  formData.status === 'published'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : formData.status === 'scheduled'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {formData.status || 'PUBLISHED'}
              </span>
            </div>
            {autosaveStatus && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                {autosaveStatus}
              </span>
            )}
          </div>
        </div>

        {/* Top Header Actions (WordPress Style) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Quick AI Buttons */}
          <button
            type="button"
            onClick={handleAutoGenerateSeo}
            disabled={autoGeneratingSeo}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200 cursor-pointer disabled:opacity-50"
            title="Auto-generate title, slug, meta description, and keywords with AI"
          >
            {autoGeneratingSeo ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
            )}
            <span>Auto-SEO</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(true)}
            className="hidden md:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition border border-purple-200 cursor-pointer"
            title="Open AI SEO Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Assistant</span>
          </button>

          {/* Switch Tab: Editor / Preview */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center space-x-1 ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center space-x-1 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          {/* Save Draft */}
          {formData.status !== 'published' && (
            <button
              type="button"
              onClick={() => handleSubmit(undefined, 'draft')}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition cursor-pointer disabled:opacity-50"
            >
              Save Draft
            </button>
          )}

          {/* Primary Publish / Update Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{formData.id ? 'Update' : 'Publish'}</span>
              </>
            )}
          </button>

          {/* Close Editor */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer ml-1"
            title="Close editor and return to articles list"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. NOTIFICATIONS & ALERTS STRIP */}
      <div className="px-4 sm:px-6 pt-3 space-y-2">
        {/* Error Alert */}
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-500 hover:text-red-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Success Alert */}
        {seoSuccessToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{seoSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSeoSuccessToast(null)}
              className="text-emerald-500 hover:text-emerald-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Autosaved Draft Recovery Notice */}
        {autosavedDraftAvailable && !article?.id && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>ड्राफ्ट पुनर्प्राप्ति:</strong> पिछला बिना सहेजा गया ड्राफ्ट ("{autosavedDraftAvailable.data.title || 'शीर्षक रहित'}") उपलब्ध है।
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreAutosavedDraft}
                className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition cursor-pointer"
              >
                ड्राफ्ट लोड करें (Restore)
              </button>
              <button
                type="button"
                onClick={handleDiscardAutosavedDraft}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
              >
                हटाएं (Discard)
              </button>
            </div>
          </div>
        )}

        {/* Duplicate Slug Warning */}
        {duplicateCollision && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>डुप्लिकेट चेतावनी ({duplicateCollision.type === 'slug' ? 'URL स्लग' : 'शीर्षक'}):</strong> यह पहले से मौजूद खबर ("{duplicateCollision.title.slice(0, 45)}...") से मेल खाता है।
              </span>
            </div>
            {duplicateCollision.type === 'slug' && (
              <button
                type="button"
                onClick={handleAutoSuffixSlug}
                className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shrink-0 transition cursor-pointer"
              >
                स्लग में '-2' जोड़ें (Auto-Fix)
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. MAIN WORKSPACE (EDITOR vs PREVIEW) */}
      {activeTab === 'editor' ? (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: MAIN CONTENT & METABOXES (~70% width) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 3.1 Post Title Input (WordPress Gutenberg Style) */}
            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="Add title / समाचार शीर्षक यहाँ लिखें..."
                value={formData.title || ''}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title: newTitle,
                    // If no slug set or pristine, create URL-friendly slug
                    urlSlug:
                      prev.urlSlug ||
                      newTitle
                        .toLowerCase()
                        .replace(/[^a-z0-9]/gi, '-')
                        .replace(/-+/g, '-')
                        .slice(0, 50),
                  }));
                }}
                className="w-full text-xl sm:text-2xl md:text-3xl font-black font-kd-headline text-slate-900 placeholder:text-slate-400 bg-transparent border-b-2 border-slate-200 pb-2.5 focus:outline-none focus:border-red-600 transition"
              />

              {/* Subtitle / Sub-headline */}
              <input
                type="text"
                placeholder="उप-शीर्षक (Subtitle / Sub-headline - वैकल्पिक)..."
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full text-xs sm:text-sm font-medium font-kd-body text-slate-700 placeholder:text-slate-400 bg-transparent border-b border-slate-200 pb-1.5 focus:outline-none focus:border-red-500 transition"
              />

              {/* 3.2 WordPress Permalink Box */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono flex-wrap gap-y-1">
                <span className="font-semibold text-slate-600">Permalink:</span>
                <span className="text-slate-400">https://khabridost.com/{formData.category || 'national'}/</span>
                {isEditingSlug ? (
                  <div className="inline-flex items-center space-x-1">
                    <input
                      type="text"
                      value={formData.urlSlug || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          urlSlug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(false)}
                      className="px-2 py-0.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {formData.urlSlug || 'untitled-post'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(!isEditingSlug)}
                  className="text-blue-600 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  {isEditingSlug ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {/* 3.3 WordPress Visual & Code Editor */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Article Body / Content (विस्तृत समाचार सामग्री) *</span>
                <span className="text-[11px] font-normal text-slate-500 font-mono">
                  WordPress Visual & HTML Mode
                </span>
              </label>
              <WordPressVisualEditor
                value={formData.content || ''}
                onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                mediaLibrary={mediaLibrary}
                placeholder="यहाँ पूरा समाचार विस्तार से लिखें... (टूलबार से हेडिंग, बोल्ड, इटैलिक, उद्धरण, चित्र या वीडियो एम्बेड जोड़ें)"
                minHeightPx={360}
              />
            </div>

            {/* 3.4 COLLAPSIBLE METABOX: EXCERPT / STANDFIRST (संक्षिप्त सार) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setIsExcerptOpen(!isExcerptOpen)}
                className="w-full p-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Excerpt & Summary (संक्षिप्त सार / इंट्रो) *
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({(formData.summary || '').length} characters)
                  </span>
                </div>
                {isExcerptOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {isExcerptOpen && (
                <div className="p-4 space-y-2">
                  <p className="text-[11px] text-slate-500">
                    समाचार का 2-3 पंक्तियों में सार लिखें। यह होमपेज कार्ड्स और लेख के शीर्ष पर हाइलाइटेड दिखेगा।
                  </p>
                  <textarea
                    rows={2}
                    required
                    placeholder="संक्षिप्त सार यहाँ लिखें..."
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              )}
            </div>

            {/* 3.5 COLLAPSIBLE METABOX: KEY HIGHLIGHTS (मुख्य बिंदु / 5 खास बातें) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}
                className="w-full p-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center space-x-2">
                  <ListOrdered className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Key Highlights Box (मुख्य बिंदु / 5 खास बातें)
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                    {(formData.highlights || []).length} Points
                  </span>
                </div>
                {isHighlightsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {isHighlightsOpen && (
                <div className="p-4 space-y-3">
                  <p className="text-[11px] text-slate-500">
                    लेख के मुख्य बुलेट पॉइंट्स जोड़ें जो पाठक को त्वरित रूप से खबर का सार समझाएं।
                  </p>

                  {/* Highlights List */}
                  <div className="space-y-2">
                    {(formData.highlights || []).map((point, idx) => (
                      <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span
                          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
                          className="text-xs text-slate-800 flex-1 min-w-0 leading-relaxed [overflow-wrap:anywhere] [word-break:normal]"
                        >
                          {point}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Highlight */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="नया मुख्य बिंदु यहाँ लिखें और '+' दबाएं..."
                      value={newHighlightInput}
                      onChange={(e) => setNewHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHighlight();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3.6 COLLAPSIBLE METABOX: YOAST/RANKMATH STYLE SEO & SERP SNIPPET BOX */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setIsSeoBoxOpen(!isSeoBoxOpen)}
                className="w-full p-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900">
                    SEO & Google Discovery Meta Box (Yoast / RankMath Style)
                  </span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-bold font-mono">
                    SERP Preview
                  </span>
                </div>
                {isSeoBoxOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {isSeoBoxOpen && (
                <div className="p-4 sm:p-5 space-y-4">
                  {/* AI SEO Assistant Generator */}
                  <AiSeoMetaGenerator
                    articleContent={formData.content || ''}
                    articleTitle={formData.title || ''}
                    articleCategory={formData.category || 'national'}
                    currentSeoTitle={formData.seoTitle}
                    currentSeoDescription={formData.seoDescription}
                    currentFocusKeywords={formData.focusKeywords}
                    currentImageAltText={formData.imageAltText}
                    apiConfig={apiConfig}
                    onApplyMeta={(meta) => {
                      setFormData((prev) => ({
                        ...prev,
                        ...(meta.seoTitle ? { seoTitle: meta.seoTitle } : {}),
                        ...(meta.seoDescription ? { seoDescription: meta.seoDescription } : {}),
                        ...(meta.focusKeywords ? { focusKeywords: meta.focusKeywords } : {}),
                        ...(meta.imageAltText ? { imageAltText: meta.imageAltText } : {}),
                        ...(meta.tags && meta.tags.length > 0 ? { tags: meta.tags } : {}),
                        ...(meta.highlights && meta.highlights.length > 0 ? { highlights: meta.highlights } : {}),
                        ...(meta.urlSlug ? { urlSlug: meta.urlSlug } : {}),
                      }));
                      setSeoSuccessToast('✓ AI Meta applied to SEO box!');
                      setTimeout(() => setSeoSuccessToast(null), 3000);
                    }}
                  />

                  {/* Google SERP Snippet Preview */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                      Google Search Result Preview (Google News SERP):
                    </span>
                    <div className="text-sm font-semibold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                      {formData.seoTitle || formData.title || 'खबरी दोस्त • मुख्य समाचार'}
                    </div>
                    <div className="text-[11px] text-[#006621] font-mono truncate">
                      https://khabridost.com/{formData.category || 'news'}/{formData.urlSlug || 'article-slug'}
                    </div>
                    <div className="text-xs text-[#545454] line-clamp-2 leading-relaxed">
                      {formData.seoDescription || formData.summary || 'खबरी दोस्त हिंदी न्यूज़ पोर्टल पर पढ़ें देश, विदेश, खेल, व्यापार और राजनीति की ताज़ा व प्रामाणिक ख़बरें।'}
                    </div>
                  </div>

                  {/* SEO Title Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        SEO Meta Title (Google Title):
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {(formData.seoTitle || '').length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder={formData.title || 'सर्च इंजन रिजल्ट्स टाइटल...'}
                      value={formData.seoTitle || ''}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* SEO Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        Meta Description (Google Snippet):
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {(formData.seoDescription || '').length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder={formData.summary || 'सर्च इंजन में दिखने वाला संक्षिप्त विवरण...'}
                      value={formData.seoDescription || ''}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Focus Keywords & Canonical URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Focus Keywords (कीवर्ड्स):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. गगनयान, इसरो, भारतीय अंतरिक्ष"
                        value={formData.focusKeywords || ''}
                        onChange={(e) => setFormData({ ...formData, focusKeywords: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Canonical URL (कैनोनिकल URL):
                      </label>
                      <input
                        type="url"
                        placeholder="https://khabridost.com/..."
                        value={formData.canonicalUrl || ''}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary Keywords & Social Sharing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Secondary Keywords (सहायक कीवर्ड्स):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ताजा अपडेट, विश्लेषण"
                        value={formData.secondaryKeywords || ''}
                        onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Social Share Title (OG Title):
                      </label>
                      <input
                        type="text"
                        placeholder={formData.seoTitle || formData.title || 'सोशल मीडिया शेयर शीर्षक'}
                        value={formData.ogTitle || ''}
                        onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: EDITORIAL SIDEBAR (~30% width, ~320px) */}
          <div className="lg:col-span-4 space-y-4 mt-6 lg:mt-0">
            {/* METABOX 1: PUBLISH & STATUS (प्रकाशन नियंत्रण) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Publish (प्रकाशन)</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    formData.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : formData.status === 'scheduled'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {formData.status || 'PUBLISHED'}
                </span>
              </div>

              <div className="p-4 space-y-3.5 text-xs">
                {/* Status Selector */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status:</label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="published">🟢 Published (लाइव प्रकाशित)</option>
                    <option value="draft">🟡 Draft (ड्राफ्ट)</option>
                    <option value="pending_review">🟠 Pending Review (समीक्षा हेतु लंबित)</option>
                    <option value="scheduled">⏱️ Scheduled (शेड्यूल)</option>
                    <option value="archived">⚪ Archived (आर्काइव)</option>
                  </select>
                </div>

                {/* Reviewer / Approver field */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reviewer / Approver (समीक्षक):</label>
                  <input
                    type="text"
                    placeholder="e.g. वरिष्ठ संपादक"
                    value={formData.reviewerName || ''}
                    onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Scheduled Release Date & Time */}
                {formData.status === 'scheduled' && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                    <label className="block text-[11px] font-bold text-amber-900">
                      प्रकाशन समय (Schedule Timestamp):
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledFor || ''}
                      onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-amber-300 rounded font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {/* Editorial Flags / Badges */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="block font-bold text-slate-700 text-[11px]">Editorial Badges:</span>
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.isBreaking || false}
                        onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
                        className="w-4 h-4 text-red-600 rounded accent-red-600 cursor-pointer"
                      />
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-red-600" />
                        <span>Breaking News (ब्रेकिंग अलर्ट)</span>
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.isTopStory || false}
                        onChange={(e) => setFormData({ ...formData, isTopStory: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded accent-amber-600 cursor-pointer"
                      />
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Top Story (लीड स्टोरी)</span>
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.isPinned || false}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer"
                      />
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                        <span>Pin to Top (पिन करें)</span>
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.isEditorsPick || false}
                        onChange={(e) => setFormData({ ...formData, isEditorsPick: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded accent-purple-600 cursor-pointer"
                      />
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>Editor's Pick (संपादकीय पसंद)</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Push Notification / Notify Subscribers */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition border border-slate-100">
                    <input
                      type="checkbox"
                      checked={formData.notifySubscribers || false}
                      onChange={(e) => setFormData({ ...formData, notifySubscribers: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded accent-red-600 cursor-pointer"
                    />
                    <span className="text-slate-800 font-semibold text-[11px] flex items-center gap-1">
                      <Send className="w-3 h-3 text-blue-600" />
                      <span>Notify Subscribers (पुश अलर्ट भेजें)</span>
                    </span>
                  </label>
                </div>

                {/* Bottom Action Buttons in Box */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleSubmit(undefined, 'draft')}
                      disabled={isSaving}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
                    >
                      Save Draft
                    </button>
                    {formData.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => handleSubmit(undefined, 'pending_review')}
                        disabled={isSaving}
                        className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 cursor-pointer disabled:opacity-50"
                        title="Submit for editorial review"
                      >
                        Submit Review
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : formData.id ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* METABOX 2: CATEGORIES (श्रेणियां) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Category (श्रेणी) *</span>
                </span>
              </div>
              <div className="p-3.5 space-y-2 max-h-56 overflow-y-auto text-xs">
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center space-x-2 p-1.5 rounded-lg transition cursor-pointer ${
                      formData.category === c.id
                        ? 'bg-red-50 text-red-900 font-bold border border-red-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={formData.category === c.id}
                      onChange={() => setFormData({ ...formData, category: c.id as NewsCategory })}
                      className="w-3.5 h-3.5 text-red-600 accent-red-600 cursor-pointer"
                    />
                    <span>{c.labelHindi} ({c.labelEnglish})</span>
                  </label>
                ))}

                {/* Subcategory / Beat Input */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Subcategory / Beat (उप-श्रेणी):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. चुनाव 2026, अंतरिक्ष, क्रिकेट"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* METABOX 3: FEATURED IMAGE (विशेष छवि) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Featured Image (मुख्य फ़ोटो)</span>
                </span>
                {mediaLibrary.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const random = mediaLibrary[Math.floor(Math.random() * mediaLibrary.length)];
                      if (random) {
                        setFormData({
                          ...formData,
                          imageUrl: random.url,
                          imageCaption: random.caption || random.title,
                        });
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Random
                  </button>
                )}
              </div>

              <div className="p-4 space-y-3 text-xs">
                {/* Hidden File Input for Direct Upload */}
                <input
                  type="file"
                  ref={featuredFileInputRef}
                  accept="image/*"
                  onChange={handleFeaturedFileUpload}
                  className="hidden"
                />

                {formData.imageUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 relative group shadow-2xs">
                      <img src={formData.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'} alt={formData.imageAltText || 'Featured Photo'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200">
                        <button
                          type="button"
                          onClick={() => setIsFeaturedMediaModalOpen(true)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Media Library</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => featuredFileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '', imageCaption: '', imageAltText: '' })}
                          className="px-2.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsFeaturedMediaModalOpen(true)}
                        className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition text-[11px] flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>लाइब्रेरी से बदलें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => featuredFileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition text-[11px] flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>नई फ़ोटो अपलोड</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '', imageCaption: '', imageAltText: '' })}
                        className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                        title="हटाएं"
                      >
                        हटाएं
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">फ़ोटो URL (Image URL):</label>
                      <input
                        type="url"
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">फ़ोटो कैप्शन व क्रेडिट (Caption / Photo Credit):</label>
                      <input
                        type="text"
                        placeholder="उदा. फ़ोटो: पीटीआई / ग्राउंड रिपोर्ट"
                        value={formData.imageCaption || ''}
                        onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Alt Text (Image SEO Description):</label>
                      <input
                        type="text"
                        placeholder="उदा. संसद परिसर में बहस करते नेता"
                        value={formData.imageAltText || ''}
                        onChange={(e) => setFormData({ ...formData, imageAltText: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">फ़ोटो क्रेडिट (Photo Credit):</label>
                      <input
                        type="text"
                        placeholder="उदा. पीटीआई / रॉयटर्स / खबरी दोस्त ब्यूरो"
                        value={formData.imageCredit || ''}
                        onChange={(e) => setFormData({ ...formData, imageCredit: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">स्रोत / साभार (Source / Attribution):</label>
                      <input
                        type="text"
                        placeholder="उदा. विशेष संवाददाता / एजेंसी इनपुट"
                        value={formData.sourceAttribution || ''}
                        onChange={(e) => setFormData({ ...formData, sourceAttribution: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center space-y-3 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-700 font-bold">कोई फ़ीचर्ड फ़ोटो नहीं चुनी गई है</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">लेख के लिए मुख्य छवि चुनें या कंप्यूटर से सीधे अपलोड करें</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsFeaturedMediaModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Library से चुनें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => featuredFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>फ़ोटो अपलोड करें</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <input
                        type="url"
                        placeholder="या सीधे इमेज URL पेस्ट करें (https://...)"
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* METABOX 4: AUTHOR & BYLINE CREDENTIALS (लेखक व पद) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>Author & Bureau (लेखक व ब्यूरो)</span>
                </span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                {/* Team Quick Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select From Newsroom Team:
                  </label>
                  <select
                    onChange={(e) => {
                      const name = e.target.value;
                      if (!name) return;
                      const prof = AUTHOR_PROFILES[name];
                      if (prof) {
                        setFormData({
                          ...formData,
                          authorName: name,
                          authorRole: prof.role,
                          authorPhotoUrl: prof.photoURL,
                        });
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="">-- टीम से चुनें (Select Author) --</option>
                    {Object.keys(AUTHOR_PROFILES).map((author) => (
                      <option key={author} value={author}>
                        {author} ({AUTHOR_PROFILES[author].role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name & Role */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.authorName || ''}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="लेखक का नाम (Author Name)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.authorRole || ''}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    placeholder="पद / दायित्व (Reporter Role)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Location / Bureau */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Location / Bureau (स्थान / शहर):
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. नई दिल्ली / लखनऊ"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Author Avatar with Camera Upload */}
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                    <img
                      src={formData.authorPhotoUrl || getAuthorPhoto(formData.authorName)}
                      alt={formData.authorName || 'Author'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    ref={authorPhotoInputRef}
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setIsCompressingAuthorPhoto(true);
                        const res = await compressImage(file, {
                          maxWidth: 300,
                          maxHeight: 300,
                          quality: 0.85,
                          format: 'image/webp',
                        });
                        setFormData({ ...formData, authorPhotoUrl: res.dataUrl });
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsCompressingAuthorPhoto(false);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => authorPhotoInputRef.current?.click()}
                    disabled={isCompressingAuthorPhoto}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded border border-slate-300 flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-slate-600" />
                    <span>{isCompressingAuthorPhoto ? 'Compressing...' : 'Upload'}</span>
                  </button>
                  <input
                    type="url"
                    placeholder="Avatar URL..."
                    value={formData.authorPhotoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, authorPhotoUrl: e.target.value })}
                    className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* METABOX 5: TAGS & TOPICS (टैग्स) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-red-600" />
                  <span>Tags (टैग्स)</span>
                </span>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Add tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(formData.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full border border-slate-200"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* LIVE PREVIEW TAB (Full Width Reader Simulation) */
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 bg-white min-h-[70vh]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="bg-red-600 text-white text-[11px] font-bold uppercase px-2.5 py-0.5 rounded">
                {formData.category || 'National'}
              </span>
              {formData.isBreaking && (
                <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded border border-red-200">
                  🔴 ब्रेकिंग
                </span>
              )}
              {formData.isTopStory && (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-200">
                  ⭐ टॉप स्टोरी
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {formData.location || 'नई दिल्ली'} • {new Date().toLocaleDateString('hi-IN')}
            </span>
          </div>

          <h1
            style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
            className="text-2xl sm:text-4xl font-black font-kd-headline text-slate-950 leading-tight min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
          >
            {formData.title || 'मुख्य समाचार शीर्षक पूर्वावलोकन'}
          </h1>

          <p
            style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
            className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed font-kd-body border-l-4 border-red-600 pl-3 py-1 bg-slate-50 rounded-r-lg min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
          >
            {formData.summary || 'समाचार का संक्षिप्त सार यहाँ प्रदर्शित होगा...'}
          </p>

          {/* Highlights */}
          {formData.highlights && formData.highlights.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 min-w-0 max-w-full">
              <h4 className="font-bold text-amber-950 text-xs sm:text-sm">मुख्य बिंदु (Key Highlights):</h4>
              <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside min-w-0">
                {formData.highlights.map((pt, i) => (
                  <li
                    key={i}
                    style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
                    className="min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
                  >
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Featured Image */}
          {formData.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-100 max-w-full min-w-0">
              <img src={formData.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'} alt="" className="w-full h-full object-cover" />
              {formData.imageCaption && (
                <p className="p-2 text-xs text-slate-500 italic text-center bg-slate-50 border-t border-slate-100 min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
                  {formData.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Article Body */}
          <div className="space-y-4 pt-2 font-kd-body text-slate-800 text-base leading-relaxed min-w-0 max-w-full article-content-container">
            {(formData.content || '').split('\n\n').filter(Boolean).map((para, i) => {
              return renderArticleBlock(para, i, 'text-base text-slate-800');
            })}
          </div>

          {/* Byline Strip */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-kd-meta">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formData.authorPhotoUrl || getAuthorPhoto(formData.authorName)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-slate-800">
                {formData.authorName} ({formData.authorRole})
              </span>
            </div>
            <span>पढ़ने का समय: {readTimeMinutes} मिनट</span>
          </div>
        </div>
      )}

      {/* AI SEO ASSISTANT MODAL (Grounded Gemini Dialogue) */}
      <AiSeoAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currentTitle={formData.title}
        currentContent={formData.content}
        currentCategory={formData.category}
        apiConfig={apiConfig}
        onApplyToEditor={(draft: DraftedSeoArticle) => {
          setFormData((prev) => ({
            ...prev,
            title: draft.title,
            summary: draft.summary || draft.metaDescription,
            content: draft.content || prev.content,
            category: draft.category || prev.category,
            seoTitle: draft.title,
            seoDescription: draft.metaDescription || draft.summary,
            focusKeywords: draft.focusKeywords,
            tags: draft.tags && draft.tags.length > 0 ? draft.tags : prev.tags,
            highlights: draft.highlights || prev.highlights,
            urlSlug: draft.urlSlug || prev.urlSlug,
          }));
          setSeoSuccessToast('✓ AI SEO Assistant: Refined draft applied to editor!');
          setTimeout(() => setSeoSuccessToast(null), 4000);
        }}
      />

      {/* FEATURED IMAGE MEDIA PICKER MODAL */}
      <MediaManagerModal
        isOpen={isFeaturedMediaModalOpen}
        onClose={() => setIsFeaturedMediaModalOpen(false)}
        mediaList={mediaLibrary}
        onAddMedia={(media) => {
          if (onAddMedia) {
            onAddMedia(media);
          }
        }}
        isPickerMode={true}
        pickerTitle="मुख्य फ़ीचर्ड फ़ोटो चुनें (Select Featured Image)"
        onSelectMedia={(media, meta) => {
          setFormData((prev) => ({
            ...prev,
            imageUrl: media.url,
            imageCaption: meta?.caption || media.caption || prev.imageCaption,
            imageAltText: meta?.altText || media.altText || media.title || prev.imageAltText,
          }));
          setIsFeaturedMediaModalOpen(false);
        }}
      />
    </div>
  );

  if (inline) {
    return <div className="w-full animate-fadeIn">{editorLayout}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-6xl w-full my-auto max-h-[94vh] overflow-y-auto">{editorLayout}</div>
    </div>
  );
};
