import React, { useState, useRef } from 'react';
import {
  X,
  PenTool,
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Flame,
  Star,
  MapPin,
  Tag,
  LogIn,
  AlertCircle,
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  Search,
  Globe,
  Check,
  Eye,
  Sliders,
  AlertTriangle,
  TrendingUp,
  Share2,
  Send,
  Inbox,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewsArticle, NewsCategory, ApiConfiguration, MediaAsset } from '../types/news';
import { CATEGORIES } from '../data/seedNews';
import { publishArticle, deleteArticle } from '../services/newsService';
import { AiSeoAssistantModal, DraftedSeoArticle } from './admin/AiSeoAssistantModal';
import { MediaManagerModal } from './MediaManagerModal';
import { WordPressVisualEditor } from './admin/WordPressVisualEditor';
import { compressImage } from '../utils/imageCompressor';
import { slugifyHindiText } from '../utils/hindiHelpers';
import { authFetch } from '../utils/authFetch';
import { fetchSubmissions } from '../services/newsService';

interface PublisherCMSProps {
  onClose: () => void;
  articles: NewsArticle[];
  onArticlePublished: () => void;
  onSelectArticleToView: (article: NewsArticle) => void;
  apiConfig?: ApiConfiguration;
  mediaLibrary?: MediaAsset[];
  onAddMedia?: (media: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
}

const IMAGE_PRESETS = [
  {
    name: 'संसद / राजनीति',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    caption: 'संसद भवन एवं राजनीतिक गतिविधि',
  },
  {
    name: 'क्रिकेट / खेल',
    url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
    caption: 'क्रिकेट मैच एवं खेल स्टेडियम',
  },
  {
    name: 'अंतरिक्ष / विज्ञान',
    url: 'https://images.unsplash.com/photo-1517976487502-5f714249a5b4?w=1200&auto=format&fit=crop&q=80',
    caption: 'इसरो अंतरिक्ष प्रक्षेपण',
  },
  {
    name: 'शेयर बाज़ार / बिज़नेस',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    caption: 'वित्तीय बाज़ार एवं ट्रेडिंग स्क्रीन',
  },
  {
    name: 'टेक / स्मार्टफोन',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    caption: 'डिजिटल तकनीक व स्मार्टफोन नवाचार',
  },
  {
    name: 'आयुर्वेद / स्वास्थ्य',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80',
    caption: 'आरोग्य, योग एवं प्राकृतिक चिकित्सा',
  },
  {
    name: 'सिनेमा / मनोरंजन',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    caption: 'सिनेमा जगत एवं फ़िल्म समारोह',
  },
  {
    name: 'एक्सप्रेसवे / इन्फ्रा',
    url: 'https://images.unsplash.com/photo-1584972191378-d70853fc47bc?w=1200&auto=format&fit=crop&q=80',
    caption: 'आधुनिक एक्सप्रेसवे एवं राष्ट्रीय राजमार्ग',
  },
];

export const PublisherCMS: React.FC<PublisherCMSProps> = ({
  onClose,
  articles,
  onArticlePublished,
  onSelectArticleToView,
  apiConfig,
  mediaLibrary = [],
  onAddMedia,
}) => {
  const { user, isAdmin, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'trends' | 'citizen' | 'autoshare'>('create');

  // Media picker & upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const comp = await compressImage(file, { maxWidth: 1600, quality: 0.82, format: 'image/webp' });
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setImageUrl(comp.dataUrl);
      setImageCaption(`${cleanName} — सचित्र रिपोर्ट`);
      if (!imageAltText) setImageAltText(cleanName);
      if (onAddMedia) {
        onAddMedia({
          url: comp.dataUrl,
          title: cleanName,
          caption: `${cleanName} — सचित्र रिपोर्ट`,
          altText: cleanName,
          category: category || 'national',
          fileSize: comp.compressedSizeFormatted || `${(file.size / 1024).toFixed(1)} KB`,
          dimensions: `${comp.compressedWidth}x${comp.compressedHeight}`,
          type: 'image',
        });
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImageUrl(dataUrl);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (onAddMedia) {
          onAddMedia({
            url: dataUrl,
            title: cleanName,
            caption: `${cleanName} — सचित्र रिपोर्ट`,
            altText: cleanName,
            category: category || 'national',
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            dimensions: '1200x800',
            type: 'image',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Google Trends & AI Writer State
  const [trends, setTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [generatingTrendId, setGeneratingTrendId] = useState<string | null>(null);

  // Citizen Reporter Submissions State
  const [citizenSubmissions, setCitizenSubmissions] = useState<any[]>([]);

  // Social Auto-Share & Webhook State
  const [socialWebhookUrl, setSocialWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('kd_social_webhook_url') || '';
  });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [selectedArticleForShare, setSelectedArticleForShare] = useState<NewsArticle | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NewsCategory>('national');
  const [location, setLocation] = useState('नई दिल्ली');
  const [authorName, setAuthorName] = useState(user?.displayName || 'संपादकीय टीम');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [tags, setTags] = useState('ताज़ा ख़बर, ब्रेकिंग');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTopStory, setIsTopStory] = useState(true);

  // SEO Advanced Suite states
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [urlSlug, setUrlSlug] = useState('');
  const [showSeoSuite, setShowSeoSuite] = useState(true);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [autoGeneratingSeo, setAutoGeneratingSeo] = useState(false);

  // Real-time Content SEO Health calculation
  const seoHealth = React.useMemo(() => {
    let score = 0;
    const checks: { label: string; passed: boolean; tip: string }[] = [];

    // Title length (optimal 40-70 chars)
    const effectiveTitle = (seoTitle || title).trim();
    const titleOk = effectiveTitle.length >= 35 && effectiveTitle.length <= 75;
    if (titleOk) score += 20;
    checks.push({
      label: 'शीर्षक लंबाई (35-75 वर्ण)',
      passed: titleOk,
      tip: `वर्तमान: ${effectiveTitle.length} वर्ण`,
    });

    // Meta Description length (optimal 100-160 chars)
    const effectiveDesc = (seoDescription || summary).trim();
    const descOk = effectiveDesc.length >= 80 && effectiveDesc.length <= 165;
    if (descOk) score += 20;
    checks.push({
      label: 'मेटा विवरण (80-165 वर्ण)',
      passed: descOk,
      tip: `वर्तमान: ${effectiveDesc.length} वर्ण`,
    });

    // Focus Keywords
    const hasKeywords = focusKeywords.trim().length > 0;
    if (hasKeywords) score += 20;
    checks.push({
      label: 'फोकस कीवर्ड्स लक्षित',
      passed: hasKeywords,
      tip: hasKeywords ? `${focusKeywords.split(',').length} कीवर्ड्स` : 'कम से कम 1 कीवर्ड जोड़ें',
    });

    // Image Alt text
    const hasAlt = imageAltText.trim().length > 0 || (imageCaption && imageCaption.trim().length > 0);
    if (hasAlt) score += 20;
    checks.push({
      label: 'मुख्य फ़ोटो ऑल्ट टेक्स्ट',
      passed: Boolean(hasAlt),
      tip: hasAlt ? 'इमेज SEO सक्रिय' : 'गूगल इमेज हेतु ऑल्ट टेक्स्ट लिखें',
    });

    // Content length & structure
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const contentOk = words >= 80;
    if (contentOk) score += 20;
    checks.push({
      label: 'विस्तृत लेख सामग्री (80+ शब्द)',
      passed: contentOk,
      tip: `वर्तमान: ${words} शब्द`,
    });

    return { score, checks };
  }, [seoTitle, title, seoDescription, summary, focusKeywords, imageAltText, imageCaption, content]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);

  // AI News Image Finder & Generator
  const handleGenerateAiImage = async () => {
    setIsGeneratingAiImage(true);
    try {
      const res = await authFetch('/api/ai/generate-news-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: title || summary || 'ताज़ा समाचार',
          category,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImageCaption(data.imageCaption || `${title || 'ताज़ा समाचार'} - सचित्र कवरेज`);
        if (data.imageAltText) setImageAltText(data.imageAltText);
      }
    } catch (e) {
      console.warn('AI image generation error:', e);
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // AI Headline Assistant
  const handleGenerateCatchyHeadline = async () => {
    if (!title && !summary && !content) {
      alert('कृपया पहले विषय, सारांश या कुछ शब्द लिखें ताकि AI आकर्षक हिंदी शीर्षक बना सके।');
      return;
    }
    setIsGeneratingHeadline(true);
    try {
      // Generate standard editorial catchy Hindi news headlines
      const seedText = title || summary || content.slice(0, 80);
      const suggestions = [
        `बड़ा खुलासा: ${seedText} को लेकर नई गाइडलाइन जारी, जानें आम जनता पर क्या होगा असर`,
        `ताज़ा अपडेट: ${seedText} पर सरकार का बड़ा फैसला, तत्काल प्रभाव से लागू`,
        `विशेष रिपोर्ट: जानिए ${seedText} के पीछे की पूरी इनसाइड स्टोरी`,
      ];
      const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
      setTitle(picked);
    } finally {
      setIsGeneratingHeadline(false);
    }
  };

  // Auto-Generate SEO using Gemini API based on article content
  const handleAutoGenerateSeo = async () => {
    if (!content || content.trim().length < 20) {
      alert('कृपया पहले लेख की विस्तृत सामग्री (Content) लिखें ताकि AI सटीक SEO तैयार कर सके।');
      return;
    }
    setAutoGeneratingSeo(true);
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
          content,
          title,
          category,
          customApiKey: customKey,
          provider: activeProvider,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        const data = resData.data;
        if (!title.trim() && data.metaTitle) setTitle(data.metaTitle);
        if (!summary.trim() && data.metaDescription) setSummary(data.metaDescription);
        setSeoTitle(data.metaTitle);
        setSeoDescription(data.metaDescription);
        setFocusKeywords(data.focusKeywords);
        if (data.tags && Array.isArray(data.tags)) {
          setTags(data.tags.join(', '));
        }
        if (data.highlights && Array.isArray(data.highlights)) {
          setHighlights(data.highlights);
        }
        if (data.urlSlug) {
          setUrlSlug(data.urlSlug);
        }
        setSuccessMessage('✓ Auto-Generate SEO: Title, Slug, Meta, Tags & Highlights updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        throw new Error(resData.error || 'Failed to auto-generate SEO');
      }
    } catch (err: any) {
      console.error('Auto SEO error:', err);
      alert('SEO जनरेट करने में त्रुटि: ' + (err.message || 'Error'));
    } finally {
      setAutoGeneratingSeo(false);
    }
  };

  // 1. Google Trends Fetcher
  const loadGoogleTrends = async () => {
    setLoadingTrends(true);
    try {
      const res = await authFetch('/api/ai/google-trends');
      const data = await res.json();
      if (data?.trends) {
        setTrends(data.trends);
      }
    } catch (e) {
      console.warn('Failed to fetch google trends, using fallback:', e);
    } finally {
      setLoadingTrends(false);
    }
  };

  // 2. 100% Human-style AI News Article Generator based on Google Trends
  const handleGenerateTrendArticle = async (trendItem: any, autoPublish = false) => {
    setGeneratingTrendId(trendItem.id);
    try {
      const res = await authFetch('/api/ai/generate-trend-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: trendItem.query,
          category: trendItem.category,
          userAngle: trendItem.suggestedAngle,
        }),
      });
      const data = await res.json();
      if (data?.article) {
        const art = data.article;
        setTitle(art.title);
        setSummary(art.summary);
        setContent(art.content);
        setCategory((art.category as NewsCategory) || 'national');
        setTags(Array.isArray(art.tags) ? art.tags.join(', ') : 'ताज़ा ख़बर, बड़ा अपडेट');
        setImageUrl(trendItem.suggestedImage || IMAGE_PRESETS[0].url);
        setImageCaption(`${trendItem.query} - ग्राउंड रिपोर्ट`);
        setSeoTitle(art.title);
        setSeoDescription(art.summary);
        setFocusKeywords(art.metaKeywords || trendItem.query);

        if (autoPublish && user) {
          // Direct 1-click auto-publish
          await publishArticle({
            title: art.title,
            summary: art.summary,
            content: art.content,
            category: (art.category as NewsCategory) || 'national',
            imageUrl: trendItem.suggestedImage || IMAGE_PRESETS[0].url,
            imageCaption: `${trendItem.query} - ग्राउंड रिपोर्ट`,
            authorName: user.displayName || 'खबरी दोस्त AI ऑटो-डेस्क',
            authorEmail: user.email || 'khabridost.com@gmail.com',
            authorUid: user.uid,
            authorRole: 'वरिष्ठ संपादक (AI Desk)',
            location: 'नई दिल्ली',
            isBreaking: true,
            isTopStory: true,
            tags: art.tags || ['ताज़ा ख़बर'],
          });
          onArticlePublished();
          setSuccessMessage(`"${art.title}" गूगल ट्रेंड्स से 100% मानवीय भाषा में लिखकर सीधे प्रकाशित कर दिया गया!`);
          setTimeout(() => setSuccessMessage(''), 4500);
          setActiveTab('manage');
        } else {
          setActiveTab('create');
          setSuccessMessage(`"${art.title}" AI द्वारा 100% मानवीय शैली में तैयार होकर एडिटर में लोड हो गया है। समीक्षा करके प्रकाशित करें।`);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
    } catch (err: any) {
      alert('AI समाचार निर्माण में त्रुटि: ' + (err.message || 'Unknown error'));
    } finally {
      setGeneratingTrendId(null);
    }
  };

  // 3. Citizen Submissions Loader
  const loadCitizenSubmissions = async () => {
    try {
      setCitizenSubmissions(await fetchSubmissions());
    } catch {
      setCitizenSubmissions([]);
    }
  };

  const handleLoadCitizenSubmission = (sub: any) => {
    setTitle(sub.title || '');
    setSummary(`[नागरिक पत्रकार रिपोर्ट]: ${sub.location || ''} से प्राप्त ताज़ा जानकारी। ${sub.description?.slice(0, 100) || ''}...`);
    setContent(`## घटना का विवरण\n\n${sub.description}\n\n## रिपोर्टर व स्थान\n\nस्थान: ${sub.location}\nरिपोर्टर: ${sub.senderName || 'नागरिक पत्रकार'}\nसत्यापन टिकट ID: ${sub.id}\n${sub.videoUrl ? `वीडियो संदर्भ लिंक: ${sub.videoUrl}` : ''}`);
    setCategory((sub.category as NewsCategory) || 'national');
    setLocation(sub.location || 'नई दिल्ली');
    if (sub.images && sub.images.length > 0) {
      setImageUrl(sub.images[0]);
      setImageCaption(`${sub.location} से नागरिक पत्रकार द्वारा भेजी गई तस्वीर`);
    }
    setActiveTab('create');
    setSuccessMessage(`टिकट ${sub.id} का विवरण एडिटर में लोड कर दिया गया है।`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // 4. Social Webhook Tester
  const handleTestWebhook = async () => {
    if (!socialWebhookUrl) {
      alert('कृपया पहले वैध Webhook URL (Zapier, Buffer, Discord, Make.com) दर्ज करें।');
      return;
    }
    setIsTestingWebhook(true);
    setWebhookStatus(null);
    try {
      localStorage.setItem('kd_social_webhook_url', socialWebhookUrl);
      const testArt = articles[0] || {
        id: 'test-1',
        title: 'खबरी दोस्त: परीक्षण समाचार अलर्ट',
        summary: 'सोशल मीडिया ऑटो-शेयर वेबहुक का सफल एकीकरण परीक्षण।',
        category: 'national',
        imageUrl: IMAGE_PRESETS[0].url,
        authorName: 'सिस्टम बॉट',
      };
      const res = await authFetch('/api/social/webhook-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: socialWebhookUrl,
          article: testArt,
          channel: 'Zapier / Social Webhook',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookStatus(`✅ सफलता: वेबहुक पर डेटा सफलतापूर्वक भेजा गया (HTTP ${data.statusCode})`);
      } else {
        setWebhookStatus(`⚠️ चेतावनी: ${data.message}`);
      }
    } catch (e: any) {
      setWebhookStatus(`❌ विफलता: ${e.message}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('ख़बर प्रकाशित करने के लिए कृपया पहले Google से लॉगिन करें।');
      signInWithGoogle();
      return;
    }

    if (!title.trim() || !content.trim() || !summary.trim()) {
      alert('कृपया शीर्षक, सारांश और विस्तृत समाचार भरें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await publishArticle({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || IMAGE_PRESETS[0].url,
        imageCaption: imageCaption.trim() || '',
        imageAltText: imageAltText.trim() || imageCaption.trim() || title.trim(),
        authorName: authorName.trim() || user.displayName || 'संपादक',
        authorEmail: user.email || 'khabridost.com@gmail.com',
        authorUid: user.uid,
        authorRole: isAdmin ? 'मुख्य संपादक' : 'संवाददाता',
        location: location.trim() || 'नई दिल्ली',
        isBreaking,
        isTopStory,
        seoTitle: seoTitle.trim() || title.trim(),
        seoDescription: seoDescription.trim() || summary.trim(),
        focusKeywords: focusKeywords.trim(),
        canonicalUrl: canonicalUrl.trim(),
        urlSlug: urlSlug.trim() || undefined,
        highlights: highlights && highlights.length > 0 ? highlights : undefined,
        tags: parsedTags,
      });

      setSuccessMessage('आपकी ख़बर सफलतापूर्वक "खबरी दोस्त" पोर्टल पर लाइव प्रकाशित हो गई है!');
      onArticlePublished();
      
      // Reset form
      setTimeout(() => {
        setTitle('');
        setSummary('');
        setContent('');
        setSuccessMessage('');
        setActiveTab('manage');
      }, 1500);
    } catch (err: any) {
      alert('ख़बर प्रकाशित करने में त्रुटि आई: ' + (err.message || 'कृपया पुनः प्रयास करें'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (confirm('क्या आप सचमुच इस समाचार को हटाना चाहते हैं?')) {
      try {
        await deleteArticle(articleId);
        onArticlePublished();
      } catch (err) {
        alert('हटाने में समस्या आई।');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-sm flex justify-center p-1 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[96vh] sm:max-h-[94vh]">
        {/* Header Bar (Responsive: 2-Row on Mobile, Single Row on Desktop) */}
        <div className="bg-slate-900 text-white px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-xl font-bold font-['Rozha_One',serif] truncate">
                  संपादकीय कक्ष • Publisher Editorial Desk
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden xs:block">
                  खबरी दोस्त न्यूज़ पोर्टल | समाचार प्रकाशन एवं प्रबंधन प्रणाली
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
              title="Close Desk"
              aria-label="Close Desk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Strip (Horizontal Scrollable on Mobile) */}
          <div className="mt-2.5 sm:mt-3 flex items-center overflow-x-auto scrollbar-none gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-kd-meta">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'create' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              + नई ख़बर
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('trends');
                loadGoogleTrends();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'trends' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>गूगल ट्रेंड्स & AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('citizen');
                loadCitizenSubmissions();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'citizen' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-sky-400" />
              <span>नागरिक पत्रकार</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('autoshare')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'autoshare' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ऑटो-शेयर</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'manage' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              सभी समाचार ({articles.length})
            </button>
          </div>
        </div>

        {/* Auth check warning */}
        {!user && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                ख़बर प्रकाशित करने और डेटाबेस में सुरक्षित करने के लिए Google से साइन इन करें।
              </span>
            </div>
            <button
              onClick={signInWithGoogle}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded font-semibold flex items-center space-x-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>साइन इन करें</span>
            </button>
          </div>
        )}

        {/* Success toast */}
        {successMessage && (
          <div className="bg-emerald-600 text-white px-6 py-3 flex items-center space-x-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 bg-slate-50">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
              {/* Row 1: Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    खबर का विषय (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NewsCategory)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.labelHindi} ({cat.labelEnglish})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    स्थान / शहर (City / Location) *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="उदा. नई दिल्ली, मुंबई, लखनऊ"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    संवाददाता का नाम (Reporter Byline) *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="उदा. आकाश शर्मा"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Headline with AI Buttons */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    मुख्य शीर्षक (Headline in Hindi) *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleAutoGenerateSeo}
                      disabled={autoGeneratingSeo}
                      className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition flex items-center space-x-1 shadow-xs cursor-pointer disabled:opacity-50"
                      title="Generate SEO Title, Slug, Description, Tags, and Highlights based on content"
                    >
                      {autoGeneratingSeo ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Auto-Generate SEO</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAiAssistantOpen(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-lg transition flex items-center space-x-1 shadow-xs cursor-pointer"
                      title="Open AI SEO Assistant to draft, review, and refine title, meta, highlights, and body content"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI SEO Assistant</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateCatchyHeadline}
                      disabled={isGeneratingHeadline}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isGeneratingHeadline ? 'शीर्षक बन रहा है...' : 'AI शीर्षक'}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="आकर्षक एवं प्रामाणिक हिंदी शीर्षक लिखें..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-base sm:text-lg font-bold font-['Rozha_One',serif] focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              {/* Row 3: Summary / Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  समाचार सारांश / उप-शीर्षक (Summary / Excerpt) *
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="ख़बर का संक्षिप्त विवरण (2-3 पंक्तियों में)..."
                  rows={2}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              {/* Row 4: Image Selector & Presets */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>मुख्य फ़ीचर्ड फ़ोटो (Featured Photo)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      लाइब्रेरी से चुनें, अपने कंप्यूटर से सीधे अपलोड करें अथवा AI सुझाव लें।
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Media Library</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>फ़ोटो अपलोड करें</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateAiImage}
                      disabled={isGeneratingAiImage}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isGeneratingAiImage ? 'खोज रहे हैं...' : 'AI सुझाव'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Image Preview or Placeholder */}
                {imageUrl && imageUrl.trim() !== '' ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="relative group w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-300 shrink-0 shadow-2xs">
                        <img
                          src={imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                          alt={imageAltText || 'Featured Photo Preview'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition">
                          <button
                            type="button"
                            onClick={() => setIsMediaPickerOpen(true)}
                            className="p-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold"
                            title="बदलें"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setImageCaption('');
                              setImageAltText('');
                            }}
                            className="p-1.5 bg-red-600 text-white rounded-md text-[10px] font-bold"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 w-full text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">चयनित फ़ीचर्ड फ़ोटो विवरण:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setImageCaption('');
                              setImageAltText('');
                            }}
                            className="text-red-600 hover:text-red-700 font-bold text-[11px] hover:underline"
                          >
                            ✕ फ़ोटो हटाएं
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            फ़ोटो कैप्शन व क्रेडिट (Caption):
                          </label>
                          <input
                            type="text"
                            value={imageCaption}
                            onChange={(e) => setImageCaption(e.target.value)}
                            placeholder="फ़ोटो कैप्शन / विवरण / क्रेडिट..."
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Alt Text (Image SEO Description):
                          </label>
                          <input
                            type="text"
                            value={imageAltText}
                            onChange={(e) => setImageAltText(e.target.value)}
                            placeholder="सटीक दृश्य विवरण (गूगल इमेज सर्च के लिए)..."
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                          />
                        </div>

                        <div className="pt-1">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="सीधा URL पेस्ट करें..."
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-[11px] font-mono text-slate-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/60 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">कोई फ़ीचर्ड फ़ोटो चयनित नहीं है</p>
                    <p className="text-[11px] text-slate-500">
                      ऊपर दिए गए "Media Library" या "फ़ोटो अपलोड करें" बटन का उपयोग करें, अथवा नीचे दिए गए टेम्पलेट्स में से चुनें:
                    </p>
                    <div className="flex items-center justify-center gap-2 max-w-md mx-auto pt-1">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="या सीधे इमेज URL पेस्ट करें (https://...)"
                        className="flex-1 bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Presets Toggle / Drawer */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                    या त्वरित टेम्पलेट फ़ोटो चुनें (Quick Presets):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setImageUrl(preset.url);
                          setImageCaption(preset.caption);
                          if (!imageAltText) setImageAltText(preset.name);
                        }}
                        className={`cursor-pointer rounded-lg overflow-hidden border p-1 text-center transition ${
                          imageUrl === preset.url
                            ? 'border-red-600 bg-red-50 ring-2 ring-red-500'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <img src={preset.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'} alt="" className="w-full h-12 object-cover rounded" />
                        <span className="text-[10px] font-semibold text-slate-700 block mt-1 truncate">
                          {preset.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 5: Full Content with WordPress Visual Editor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    विस्तृत समाचार (Full Article Content) *
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    WordPress Visual & HTML Mode
                  </span>
                </div>
                <WordPressVisualEditor
                  value={content}
                  onChange={(val) => setContent(val)}
                  mediaLibrary={mediaLibrary}
                  placeholder="सम्पूर्ण समाचार विस्तार से यहाँ लिखें... (टूलबार से हेडिंग, बोल्ड, इटैलिक, उद्धरण, चित्र या वीडियो एम्बेड जोड़ें)"
                  minHeightPx={320}
                />
              </div>

              {/* Row 6: Toggles & Tags */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <Flame className="w-4 h-4 text-red-600" />
                    <span>ब्रेकिंग न्यूज़ (Breaking)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isTopStory}
                      onChange={(e) => setIsTopStory(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>लीड स्टोरी (Lead Banner)</span>
                  </label>
                </div>

                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="टैग्स (कॉमा से अलग करें)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 7: ADVANCED CONTENT SEO & GOOGLE DISCOVERY SUITE */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div
                  onClick={() => setShowSeoSuite(!showSeoSuite)}
                  className="bg-slate-50 hover:bg-slate-100 p-3.5 border-b border-slate-200 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Advance Content SEO & Google News Suite (सर्च इंजन अनुकूलन)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      SEO स्कोर: <strong className={seoHealth.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{seoHealth.score}/100</strong>
                    </span>
                    <span className="text-xs text-slate-400">{showSeoSuite ? '▲ संकुचित करें' : '▼ खोलें'}</span>
                  </div>
                </div>

                {showSeoSuite && (
                  <div className="p-4 space-y-4 bg-white">
                    {/* Google SERP Snippet Preview */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Google Search परिणाम पूर्वावलोकन (Live SERP Preview):
                      </span>
                      <div className="text-xs text-blue-600 hover:underline font-medium cursor-pointer line-clamp-1">
                        {seoTitle || title || 'खबरी दोस्त • ताज़ा हिंदी समाचार'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        https://khabridost.com/{category}/{title ? title.toLowerCase().slice(0, 30).replace(/[^a-z0-9]/g, '-') : 'story'}
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-2">
                        {seoDescription || summary || 'खबरी दोस्त पर पढ़ें देश, राजनीति, खेल और व्यापार से जुड़ी सभी ताज़ा ख़बरें विस्तार से...'}
                      </div>
                    </div>

                    {/* SEO Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            SEO शीर्षक (Google Meta Title)
                          </label>
                          <span className={`text-[10px] font-mono ${
                            (seoTitle || title).length >= 35 && (seoTitle || title).length <= 75 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                          }`}>
                            {(seoTitle || title).length}/70 वर्ण
                          </span>
                        </div>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder={title ? `डिफ़ॉल्ट: ${title.slice(0, 60)}...` : 'सर्च इंजन में दिखने वाला विशेष शीर्षक...'}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          फोकस कीवर्ड्स (Focus Keywords)
                        </label>
                        <input
                          type="text"
                          value={focusKeywords}
                          onChange={(e) => setFocusKeywords(e.target.value)}
                          placeholder="उदा: गगनयान, इसरो, भारतीय अंतरिक्ष, ताज़ा ख़बर"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          मेटा विवरण (Meta Description / Search Snippet)
                        </label>
                        <span className={`text-[10px] font-mono ${
                          (seoDescription || summary).length >= 80 && (seoDescription || summary).length <= 165 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                        }`}>
                          {(seoDescription || summary).length}/160 वर्ण
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder={summary ? `डिफ़ॉल्ट: ${summary.slice(0, 120)}...` : 'सर्च इंजन रिजल्ट्स में दिखने वाला संक्षिप्त व सटीक विवरण लिखें...'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            सर्च-अनुकूल URL स्लग (Clean URL Slug)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (title && title.trim()) {
                                setUrlSlug(slugifyHindiText(title));
                              }
                            }}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                            title="शीर्षक से तुरंत स्लग तैयार करें"
                          >
                            <Zap className="w-3 h-3" />
                            <span>ऑटो-जनरेट</span>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-2 rounded-l-lg border border-r-0 border-slate-300 font-mono">
                            /{category}/
                          </span>
                          <input
                            type="text"
                            value={urlSlug}
                            onChange={(e) => setUrlSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                            placeholder="story-url-slug"
                            className="w-full bg-slate-50 border border-slate-300 rounded-r-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          मुख्य आकर्षण (Highlights - प्रति पंक्ति एक बिंदु)
                        </label>
                        <textarea
                          rows={2}
                          value={highlights.join('\n')}
                          onChange={(e) => setHighlights(e.target.value.split('\n').filter((l) => l.trim().length > 0))}
                          placeholder="मुख्य बिंदु लिखें..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          मुख्य फ़ोटो ऑल्ट टेक्स्ट (Image Alt Text)
                        </label>
                        <input
                          type="text"
                          value={imageAltText}
                          onChange={(e) => setImageAltText(e.target.value)}
                          placeholder={imageCaption || 'चित्र का वर्णनात्मक ऑल्ट टेक्स्ट लिखें...'}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          कैनोनिकल URL (Canonical URL - वैकल्पिक)
                        </label>
                        <input
                          type="url"
                          value={canonicalUrl}
                          onChange={(e) => setCanonicalUrl(e.target.value)}
                          placeholder="https://khabridost.com/..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* SEO Health Checklist */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        SEO गुणवत्ता विश्लेषण (Quality Checklist):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {seoHealth.checks.map((c, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs">
                            {c.passed ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className={c.passed ? 'text-slate-700 font-medium' : 'text-amber-800'}>
                              {c.label}: <span className="text-[10px] text-slate-500 font-mono">({c.tip})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'प्रकाशित किया जा रहा है...' : 'तुरंत प्रकाशित करें (Publish)'}</span>
                </button>
              </div>
            </form>
          ) : activeTab === 'trends' ? (
            /* Google Trends & 100% Human AI Writer Tab */
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white p-6 rounded-2xl border border-red-800/50 shadow-md flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Google Trends Live
                    </span>
                    <span className="text-amber-400 font-bold text-xs">भारत में सर्च ट्रेंड्स 2026</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-['Rozha_One',serif]">
                    गूगल ट्रेंड्स से खोजें और AI से 100% मानवीय अंदाज़ में खबर लिखें
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    यह टूल गूगल ट्रेंड्स से ताज़ा विषय निकालकर स्वाभाविक, निष्पक्ष और बिना किसी कठिन या बोझिल शब्दों के सरल हिंदी में पूरी खबर लिखता है। आप तुरंत रिव्यू करके 1-क्लिक में प्रकाशित कर सकते हैं।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadGoogleTrends}
                  disabled={loadingTrends}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTrends ? 'animate-spin' : ''}`} />
                  <span>{loadingTrends ? 'ट्रेंड्स लोड हो रहे हैं...' : 'ताज़ा ट्रेंड्स रीफ्रेश करें'}</span>
                </button>
              </div>

              {/* Trends List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(trends.length > 0
                  ? trends
                  : [
                      {
                        id: 'trend-1',
                        query: 'गगनयान मिशन 2026 ताज़ा अपडेट',
                        category: 'tech',
                        searchVolume: '500K+ searches',
                        trafficRate: '+240%',
                        status: 'hot',
                        summary: 'इसरो का पहला मानवयुक्त अंतरिक्ष अभियान गगनयान अंतिम परीक्षण चरण में पहुँचा।',
                        suggestedAngle: 'जानिए अंतरिक्ष यात्रियों की ट्रेनिंग और उड़ान की पूरी टाइमलाइन आसान भाषा में।',
                        suggestedImage: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1000&auto=format&fit=crop&q=80',
                      },
                      {
                        id: 'trend-2',
                        query: 'मौसम विभाग अलर्ट: भारी बारिश और लू का पूर्वानुमान',
                        category: 'national',
                        searchVolume: '350K+ searches',
                        trafficRate: '+180%',
                        status: 'hot',
                        summary: 'उत्तर भारत में मौसम का मिज़ाज बदला, दिल्ली-यूपी समेत 8 राज्यों में यलो अलर्ट।',
                        suggestedAngle: 'किसानों और आम जनता के लिए मौसम विभाग की क्या है ताज़ा चेतावनी।',
                        suggestedImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1000&auto=format&fit=crop&q=80',
                      },
                      {
                        id: 'trend-3',
                        query: 'टी20 क्रिकेट वर्ल्ड कप टीम इंडिया की नई रणनीति',
                        category: 'sports',
                        searchVolume: '450K+ searches',
                        trafficRate: '+310%',
                        status: 'surging',
                        summary: 'कप्तान और कोच ने युवाओं पर जताया भरोसा, नई प्लेइंग इलेवन का खाका तैयार।',
                        suggestedAngle: 'कौन से नए खिलाड़ियों को मिलेगा मौका और क्या रहेगी टीम की मैच रणनीति।',
                        suggestedImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1000&auto=format&fit=crop&q=80',
                      },
                      {
                        id: 'trend-4',
                        query: 'सोने-चांदी के दामों में बड़ा उलटफेर',
                        category: 'business',
                        searchVolume: '280K+ searches',
                        trafficRate: '+120%',
                        status: 'trending',
                        summary: 'वैश्विक बाज़ार में हलचल के बीच सराफा बाज़ार में सोने के रेट में हुआ बदलाव।',
                        suggestedAngle: 'त्योहारी सीज़न से पहले ग्राहकों के लिए खरीदारी का सही समय क्या है।',
                        suggestedImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1000&auto=format&fit=crop&q=80',
                      },
                    ]
                ).map((trend: any) => (
                  <div
                    key={trend.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-red-400 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {trend.category}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-red-600">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{trend.trafficRate || '+200%'} ({trend.searchVolume || 'Trending'})</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-base text-slate-900 leading-snug">
                        {trend.query}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {trend.summary}
                      </p>

                      <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold text-amber-950">सुझाया गया एंगल: </span>
                        {trend.suggestedAngle}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateTrendArticle(trend, false)}
                        disabled={generatingTrendId === trend.id}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{generatingTrendId === trend.id ? 'लिखा जा रहा है...' : 'AI से खबर लिखें'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateTrendArticle(trend, true)}
                        disabled={generatingTrendId === trend.id}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        title="1-क्लिक में सीधे लिखकर प्रकाशित करें"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">ऑटो-पब्लिश</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'citizen' ? (
            /* Citizen Reporter Inbox Tab */
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 rounded-2xl border border-sky-800/40 shadow-md flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-sky-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Citizen Tip Line
                    </span>
                    <span className="text-sky-300 font-bold text-xs">नागरिक पत्रकार इनबॉक्स</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-['Rozha_One',serif] mt-1">
                    पाठकों द्वारा भेजी गई ताज़ा खबरें एवं ग्राउंड रिपोर्ट
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    "अपनी खबर हमें भेजें" पेज से आई हुई खबरों की समीक्षा करें और 1-क्लिक में मुख्य एडिटर में लोड करके प्रकाशित करें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadCitizenSubmissions}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>रीफ्रेश</span>
                </button>
              </div>

              {citizenSubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">अभी कोई नई नागरिक रिपोर्ट लंबित नहीं है</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    जैसे ही कोई पाठक 'अपनी खबर भेजें' कॉलम से खबर या तस्वीरें भेजेगा, वे यहाँ दिखाई देंगी।
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {citizenSubmissions.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            टिकट: {sub.id}
                          </span>
                          <span className="text-xs font-bold text-red-600 uppercase">
                            {sub.category || 'देश'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600">
                            {sub.location} ({new Date(sub.submittedAt || Date.now()).toLocaleDateString('hi-IN')})
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          भेजने वाले: <strong className="text-slate-900">{sub.senderName || 'गोपनीय पाठक'}</strong>
                          {sub.senderPhone && <span className="ml-1 text-slate-500 font-mono">({sub.senderPhone})</span>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-base text-slate-900">{sub.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {sub.description}
                        </p>
                      </div>

                      {/* Attached Images */}
                      {sub.images && sub.images.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-600 block">
                            संलग्न तस्वीरें ({sub.images.length}/3):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {sub.images.filter((img: string) => img && img.trim() !== '').map((img: string, idx: number) => (
                              <img
                                key={idx}
                                src={img || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                                alt={`Citizen ${idx + 1}`}
                                className="w-24 h-20 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition"
                                onClick={() => window.open(img, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Video Link */}
                      {sub.videoUrl && (
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="font-bold">वीडियो फुटेज लिंक:</span>
                            <span className="font-mono text-slate-700 truncate">{sub.videoUrl}</span>
                          </div>
                          <a
                            href={sub.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 font-bold flex items-center space-x-0.5 shrink-0 ml-2"
                          >
                            <span>देखें</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleLoadCitizenSubmission(sub)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>एडिटर में लोड करें व प्रकाशित करें</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'autoshare' ? (
            /* Social Media Auto-Share & Webhooks Tab */
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-emerald-800/40 shadow-md">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Social Auto-Pilot
                  </span>
                  <span className="text-emerald-300 font-bold text-xs">सोशल मीडिया ऑटो-शेयर & वेबहुक</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-['Rozha_One',serif] mt-1">
                  1-क्लिक सोशल मीडिया ब्रॉडकास्ट & ऑटोमेशन
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  WhatsApp चैनल, Telegram, Facebook, X (Twitter) पर समाचार का सुंदर फॉर्मैटेड पोस्ट तुरंत भेजें, या Zapier/Make.com वेबहुक से सीधे सोशल नेटवर्क पर ऑटो-पब्लिश करें।
                </p>
              </div>

              {/* 1. Pick Article */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  शेयर करने हेतु समाचार चुनें
                </label>
                <select
                  value={selectedArticleForShare?.id || articles[0]?.id || ''}
                  onChange={(e) => {
                    const found = articles.find((a) => a.id === e.target.value);
                    if (found) setSelectedArticleForShare(found);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      [{art.category.toUpperCase()}] {art.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Formatted Post Preview and Direct 1-Click Buttons */}
              {(() => {
                const targetArt = selectedArticleForShare || articles[0];
                if (!targetArt) return null;
                const shareText = `🔴 *ताज़ा ख़बर | खबरी दोस्त*\n\n📰 *${targetArt.title}*\n\n📌 *मुख्य बिंदु:* ${targetArt.summary}\n\n📍 *स्थान:* ${targetArt.location || 'भारत'}\n\n👉 *पूरी खबर विस्तार से पढ़ें:* https://khabridost.com/#article-${targetArt.id}\n\n📲 *ख़बरों के लिए व्हाट्सएप चैनल जॉइन करें:* https://whatsapp.com/channel/example`;
                const encodedText = encodeURIComponent(shareText);
                const encodedUrl = encodeURIComponent(`https://khabridost.com/#article-${targetArt.id}`);

                return (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase text-slate-700">
                        तैयार सोशल मीडिया पोस्ट फॉर्मेट (Live Preview)
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(shareText);
                          setShareCopied(true);
                          setTimeout(() => setShareCopied(false), 2000);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{shareCopied ? 'कॉपी हो गया!' : 'टेक्स्ट कॉपी करें'}</span>
                      </button>
                    </div>

                    <pre className="bg-slate-50 p-4 rounded-xl text-xs font-sans text-slate-800 border border-slate-200 whitespace-pre-wrap leading-relaxed">
                      {shareText}
                    </pre>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodedText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <span>WhatsApp पर भेजें</span>
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(targetArt.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <span>Telegram पर भेजें</span>
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <span>Facebook पर शेयर</span>
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(targetArt.title)}&url=${encodedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <span>X / Twitter पर पोस्ट</span>
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Automatic Webhook Auto-Publishing Suite */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    ऑटो-शेयर वेबहुक कॉन्फ़िगरेशन (Zapier, Buffer, Discord, Make.com)
                  </h4>
                  <p className="text-xs text-slate-500">
                    जब भी कोई नया समाचार प्रकाशित होगा, सिस्टम इस वेबहुक URL पर JSON पेलोड ऑटोमैटिकली भेज देगा।
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={socialWebhookUrl}
                    onChange={(e) => setSocialWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/... या Discord Webhook URL"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingWebhook ? 'टेस्ट भेजा जा रहा है...' : 'टेस्ट पिंग भेजें'}</span>
                  </button>
                </div>

                {webhookStatus && (
                  <div className="p-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200 animate-fadeIn">
                    {webhookStatus}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manage Articles Tab */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">
                  प्रकाशित समाचारों की सूची ({articles.length})
                </h3>
                <span className="text-xs text-slate-400">
                  एडमिन ईमेल: khabridost.com@gmail.com
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-3 sm:p-4 hover:bg-slate-50 transition flex items-center justify-between space-x-3"
                  >
                    <div
                      onClick={() => {
                        onSelectArticleToView(art);
                        onClose();
                      }}
                      className="flex items-center space-x-3 flex-1 cursor-pointer min-w-0"
                    >
                      <img
                        src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-14 h-12 rounded object-cover shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-0.5">
                          <span className="font-bold text-red-600 uppercase">{art.category}</span>
                          <span>•</span>
                          <span>{art.location}</span>
                          {art.isBreaking && (
                            <span className="bg-red-600 text-white text-[9px] px-1 rounded font-bold">
                              ब्रेकिंग
                            </span>
                          )}
                          {art.status === 'pending_review' ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              समीक्षा लंबित
                            </span>
                          ) : art.status === 'draft' ? (
                            <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              ड्राफ्ट
                            </span>
                          ) : art.status === 'scheduled' ? (
                            <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              शेड्यूल
                            </span>
                          ) : null}
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          द्वारा: {art.authorName} | {new Date(art.createdAt).toLocaleDateString('hi-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          onSelectArticleToView(art);
                          onClose();
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"
                        title="देखें"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI SEO ASSISTANT REVIEW & REFINE MODAL */}
      <AiSeoAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currentTitle={title}
        currentContent={content}
        currentCategory={category}
        apiConfig={apiConfig}
        onApplyToEditor={(draft: DraftedSeoArticle) => {
          setTitle(draft.title);
          setSummary(draft.summary || draft.metaDescription);
          setContent(draft.content || content);
          setCategory((draft.category as NewsCategory) || category);
          setSeoTitle(draft.title);
          setSeoDescription(draft.metaDescription || draft.summary);
          setFocusKeywords(draft.focusKeywords || '');
          if (draft.tags && draft.tags.length > 0) setTags(draft.tags.join(', '));
          if (draft.highlights && draft.highlights.length > 0) setHighlights(draft.highlights);
          if (draft.urlSlug) setUrlSlug(draft.urlSlug);
          setSuccessMessage('✓ AI SEO Assistant: Refined draft applied to editor!');
          setTimeout(() => setSuccessMessage(''), 4500);
        }}
      />

      {/* FEATURED IMAGE MEDIA PICKER MODAL */}
      <MediaManagerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mediaList={mediaLibrary}
        onAddMedia={(media) => {
          if (onAddMedia) {
            onAddMedia(media);
          }
        }}
        isPickerMode={true}
        pickerTitle="लेख के लिए मुख्य फ़ीचर्ड फ़ोटो चुनें (Featured Image)"
        onSelectMedia={(media, meta) => {
          setImageUrl(media.url);
          if (meta?.caption || media.caption) setImageCaption(meta?.caption || media.caption || '');
          if (meta?.altText || media.altText || media.title) {
            setImageAltText(meta?.altText || media.altText || media.title || '');
          }
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
};
