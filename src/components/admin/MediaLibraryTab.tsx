import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  Eye,
  Sparkles,
  X,
  FileCode,
  Tag,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Zap,
  Video,
  Play,
  Share2,
  LayoutGrid,
  List,
  Table as TableIcon,
  Crop,
  Stamp,
  Download,
  CheckSquare,
  Square,
  Maximize2,
  FileDown,
  FolderPlus,
  ArrowUpDown,
  Layers,
  ShieldCheck,
  RefreshCw,
  Folder,
  FolderOpen,
  FolderTree,
  FolderCheck,
  ChevronRight,
  ChevronDown,
  Edit3,
  Move,
  Users,
  Camera,
  BarChart2,
  DollarSign,
  Flame,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { MediaAsset, NewsArticle, MediaFolder } from '../../types/news';
import { DEFAULT_MEDIA_FOLDERS } from '../../data/portalDefaults';
import { DEMO_CONTENT } from '../../utils/articleVisibility';
import {
  compressImage,
  CompressionResult,
  formatBytes,
} from '../../utils/imageCompressor';

const SAMPLE_STOCK = [
  {
    topic: 'ताज़ा ख़बरें',
    title: 'प्रेस कॉन्फ्रेंस एवं मीडिया ब्रीफिंग (Press Briefing)',
    url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    altText: 'प्रेस वार्ता में पत्रकारों के माइक व लाइव रिपोर्टिंग दृश्य',
    category: 'national',
    caption: 'फोटो: ब्यूरो रिपोर्ट / खबरी दोस्त न्यूज़ एजेंसी',
  },
  {
    topic: 'ताज़ा ख़बरें',
    title: 'संसद भवन व प्रशासनिक परिसर (Indian Parliament)',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    altText: 'संसद भवन व सरकारी प्रशासनिक भवन का दृश्य',
    category: 'national',
    caption: 'फोटो: पीटीआई / विशेष संवाददाता',
  },
  {
    topic: 'राजनीति',
    title: 'चुनावी जनसभा व लोकतंत्र उत्सव (Election Rally)',
    url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
    altText: 'विशाल जनसभा व भारतीय राष्ट्रीय ध्वज के साथ नागरिक',
    category: 'politics',
    caption: 'फोटो: चुनावी डेस्क / खबरी दोस्त नेटवर्क',
  },
  {
    topic: 'राजनीति',
    title: 'भारतीय तिरंगा व राष्ट्रीय गौरव (Tricolor Flag)',
    url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&auto=format&fit=crop&q=80',
    altText: 'लहराता भारतीय राष्ट्रीय ध्वज तिरंगा',
    category: 'politics',
    caption: 'फोटो: राष्ट्रीय अभिलेखागार',
  },
  {
    topic: 'खेल',
    title: 'क्रिकेट स्टेडियम फ्लडलाइट्स मैच (Cricket Stadium Night)',
    url: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=1200&auto=format&fit=crop&q=80',
    altText: 'क्रिकेट मैदान व फ्लडलाइट्स के नीचे रोमांचक मुकाबला',
    category: 'sports',
    caption: 'फोटो: स्पोर्ट्स डेस्क / आईसीसी क्रिकेट',
  },
  {
    topic: 'खेल',
    title: 'एथलीट ट्रैक एवं फ़ील्ड प्रतियोगिता (Sports Championship)',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    altText: 'ट्रैक पर दौड़ते एथलीट्स व खेल प्रतियोगिता',
    category: 'sports',
    caption: 'फोटो: एथलेटिक्स फेडरेशन',
  },
  {
    topic: 'व्यापार',
    title: 'शेयर बाज़ार सेंसेक्स एवं वित्तीय विश्लेषण (Stock Market Chart)',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    altText: 'स्टॉक मार्केट बुल्स व वित्तीय ग्राफिक्स ट्रेडिंग स्क्रीन',
    category: 'business',
    caption: 'फोटो: मार्केट डेस्क / सेंसेक्स एनएसई',
  },
  {
    topic: 'व्यापार',
    title: 'भारतीय मुद्रा रुपया एवं बैंकिंग व्यवस्था (Indian Rupee Currency)',
    url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1200&auto=format&fit=crop&q=80',
    altText: 'भारतीय रुपया नोट व बैंकिंग निवेश दस्तावेज',
    category: 'business',
    caption: 'फोटो: रिज़र्व बैंक ऑफ इंडिया संदर्भ',
  },
  {
    topic: 'मौसम व पर्यावरण',
    title: 'मानसून बारिश व प्राकृतिक दृश्य (Indian Monsoon Cloudburst)',
    url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200&auto=format&fit=crop&q=80',
    altText: 'घने काले मानसूनी बादल और तेज़ बारिश',
    category: 'state',
    caption: 'फोटो: मौसम विज्ञान केंद्र (IMD)',
  },
  {
    topic: 'मौसम व पर्यावरण',
    title: 'पर्यावरण प्रदूषण एवं वायु गुणवत्ता (Air Quality AQI Fog)',
    url: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=1200&auto=format&fit=crop&q=80',
    altText: 'शहरी धुंध और वायु गुणवत्ता सूचकांक दृश्य',
    category: 'national',
    caption: 'फोटो: केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB)',
  },
  {
    topic: 'तकनीक व ऑटो',
    title: 'स्मार्टफोन डिजिटल तकनीक व 5G नेटवर्क (5G Digital Tech)',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    altText: 'लैपटॉप व स्मार्टफोन पर काम करते टेक प्रोफेशनल्स',
    category: 'tech',
    caption: 'फोटो: टेक ब्यूरो / खबरी दोस्त',
  },
  {
    topic: 'तकनीक व ऑटो',
    title: 'कृत्रिम बुद्धिमत्ता एवं माइक्रोचिप (AI & Semiconductor)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    altText: 'आर्टिफिशियल इंटेलिजेंस और आधुनिक न्यूरल नेटवर्क विजुअलाइजेशन',
    category: 'tech',
    caption: 'फोटो: डिजिटल इनोवेशन लैब',
  },
];

/** Stock photos (with invented credits) are only offered in demo builds. Real photos are uploaded by the newsroom. */
export const CURATED_NEWSROOM_STOCK = DEMO_CONTENT ? SAMPLE_STOCK : [];

interface MediaLibraryTabProps {
  mediaAssets: MediaAsset[];
  onAddMedia: (media: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
  onUpdateMedia?: (media: Partial<MediaAsset> & { id: string }) => void;
  onDeleteMedia: (id: string) => void;
  onOpenEditorWithImage?: (image: MediaAsset) => void;
  articles?: NewsArticle[];
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  mediaAssets,
  onAddMedia,
  onUpdateMedia,
  onDeleteMedia,
  onOpenEditorWithImage,
  articles = [],
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'banner' | 'infographic'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompressorModal, setShowCompressorModal] = useState(false);
  const [showVideoEmbedModal, setShowVideoEmbedModal] = useState(false);

  // Multi-Select Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>('national');
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  // Hierarchical Folder Management State
  const [folders, setFolders] = useState<MediaFolder[]>(() => {
    try {
      const saved = localStorage.getItem('kd_media_folders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load folders from localStorage', e);
    }
    return DEFAULT_MEDIA_FOLDERS;
  });

  const [activeFolder, setActiveFolder] = useState<string>('all'); // 'all', 'unorganized', or folder path like 'Hero/Breaking'
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    Hero: true,
    Gallery: true,
  });
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderParentPath, setFolderParentPath] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [folderColor, setFolderColor] = useState('#2563eb');

  // Bulk Delete Modal State (Safe in-app confirmation with live article scan)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [acknowledgeInUseDeletion, setAcknowledgeInUseDeletion] = useState<boolean>(false);

  // Single Asset Delete Modal State (Safe in-app confirmation avoiding window.confirm)
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);

  // Bulk Metadata Update Modal State
  const [showBulkMetaModal, setShowBulkMetaModal] = useState<boolean>(false);
  const [bulkMetaFolderOption, setBulkMetaFolderOption] = useState<'no-change' | 'set' | 'clear'>('no-change');
  const [bulkMetaTargetFolder, setBulkMetaTargetFolder] = useState<string>('Hero/Breaking');
  const [bulkMetaCategoryOption, setBulkMetaCategoryOption] = useState<'no-change' | 'set'>('no-change');
  const [bulkMetaCategoryValue, setBulkMetaCategoryValue] = useState<string>('national');
  const [bulkMetaCaptionOption, setBulkMetaCaptionOption] = useState<'no-change' | 'replace' | 'append'>('no-change');
  const [bulkMetaCaptionValue, setBulkMetaCaptionValue] = useState<string>('');
  const [bulkMetaAltOption, setBulkMetaAltOption] = useState<'no-change' | 'replace' | 'auto-seo' | 'prefix'>('no-change');
  const [bulkMetaAltValue, setBulkMetaAltValue] = useState<string>('');
  const [bulkMetaLoadingOption, setBulkMetaLoadingOption] = useState<'no-change' | 'lazy' | 'eager'>('no-change');
  const [bulkMetaTypeOption, setBulkMetaTypeOption] = useState<'no-change' | 'image' | 'banner' | 'infographic'>('no-change');
  const [bulkMetaTagsOption, setBulkMetaTagsOption] = useState<'no-change' | 'replace' | 'append'>('no-change');
  const [bulkMetaTagsValue, setBulkMetaTagsValue] = useState<string>('');

  // Quick move target folder for toolbar
  const [quickMoveTargetFolder, setQuickMoveTargetFolder] = useState<string>('Hero/Breaking');

  // Stock Photos Importer Modal State
  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const [stockTopicFilter, setStockTopicFilter] = useState<string>('all');
  const [importedStockUrls, setImportedStockUrls] = useState<string[]>([]);

  // Aspect Ratio Cropping Modal State
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [croppingAsset, setCroppingAsset] = useState<MediaAsset | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '3:2' | '21:9'>('16:9');
  const [isCropping, setIsCropping] = useState<boolean>(false);

  // Watermark Engine Modal State
  const [showWatermarkModal, setShowWatermarkModal] = useState<boolean>(false);
  const [watermarkingAsset, setWatermarkingAsset] = useState<MediaAsset | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('खबरी दोस्त • Khabri Dost');
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'center'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.75);
  const [isWatermarking, setIsWatermarking] = useState<boolean>(false);

  // Fullscreen Lightbox Inspector
  const [inspectingAsset, setInspectingAsset] = useState<MediaAsset | null>(null);

  // Auto-compression upon upload for Core Web Vitals
  const [autoCompressOnUpload, setAutoCompressOnUpload] = useState(true);
  const [uploadMaxWidth, setUploadMaxWidth] = useState(1600);
  const [uploadQuality, setUploadQuality] = useState(78);
  const [isCompressingUpload, setIsCompressingUpload] = useState(false);
  const [uploadStats, setUploadStats] = useState<CompressionResult | null>(null);
  const [newDimensions, setNewDimensions] = useState('1600x900');
  const [newFileSize, setNewFileSize] = useState('220 KB WebP');
  const [optimizingAssetId, setOptimizingAssetId] = useState<string | null>(null);
  const [optimizeMessage, setOptimizeMessage] = useState<string | null>(null);
  const [mediaErrorMsg, setMediaErrorMsg] = useState<string | null>(null);

  // Compressor Modal State (Enhanced for Core Web Vitals)
  const [compressUrl, setCompressUrl] = useState('');
  const [compressTitle, setCompressTitle] = useState('');
  const [compressQuality, setCompressQuality] = useState(75);
  const [compressMaxWidth, setCompressMaxWidth] = useState(1600);
  const [compressSuccess, setCompressSuccess] = useState(false);
  const [isProcessingCompressor, setIsProcessingCompressor] = useState(false);
  const [activeCompressResult, setActiveCompressResult] = useState<CompressionResult | null>(null);

  // Video Embed State
  const [embedPlatform, setEmbedPlatform] = useState<'youtube' | 'twitter' | 'instagram' | 'facebook'>('youtube');
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedCopied, setEmbedCopied] = useState(false);

  // Image SEO Edit Modal State
  const [editingSeoAsset, setEditingSeoAsset] = useState<MediaAsset | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editSeoTitle, setEditSeoTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editFocusKeywords, setEditFocusKeywords] = useState('');
  const [editSeoSlug, setEditSeoSlug] = useState('');
  const [editLoadingStrategy, setEditLoadingStrategy] = useState<'lazy' | 'eager'>('lazy');
  const [editFolder, setEditFolder] = useState('');

  // Upload Form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newFocusKeywords, setNewFocusKeywords] = useState('');
  const [newSeoSlug, setNewSeoSlug] = useState('');
  const [newCategory, setNewCategory] = useState('national');
  const [newType, setNewType] = useState<'image' | 'banner' | 'infographic'>('image');
  const [newFolder, setNewFolder] = useState('Hero/Breaking');

  // Calculate article usage
  const getAssetUsage = (url: string) => {
    return articles.filter(
      (a) => a.imageUrl === url || (a.content && a.content.includes(url))
    );
  };

  const filteredMedia = useMemo(() => {
    const list = mediaAssets.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.altText && m.altText.toLowerCase().includes(search.toLowerCase())) ||
        (m.caption && m.caption.toLowerCase().includes(search.toLowerCase())) ||
        (m.focusKeywords && m.focusKeywords.toLowerCase().includes(search.toLowerCase())) ||
        (m.folder && m.folder.toLowerCase().includes(search.toLowerCase())) ||
        (m.category && m.category.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      const matchesType = typeFilter === 'all' || m.type === typeFilter;

      let matchesFolder = true;
      if (activeFolder === 'all') {
        matchesFolder = true;
      } else if (activeFolder === 'unorganized') {
        matchesFolder = !m.folder || m.folder === '' || m.folder === 'unorganized';
      } else {
        // Matches exact folder path or any child subfolder path (e.g. 'Hero' matches 'Hero' and 'Hero/Breaking')
        matchesFolder = m.folder === activeFolder || Boolean(m.folder && m.folder.startsWith(activeFolder + '/'));
      }

      return matchesSearch && matchesCategory && matchesType && matchesFolder;
    });

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    } else if (sortBy === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title_desc') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }

    return list;
  }, [mediaAssets, search, categoryFilter, typeFilter, sortBy, activeFolder]);

  // SEO statistics
  const totalAssets = mediaAssets.length;
  const assetsWithAlt = mediaAssets.filter((m) => m.altText && m.altText.trim().length > 0).length;
  const assetsMissingAlt = totalAssets - assetsWithAlt;
  const seoHealthScore = totalAssets > 0 ? Math.round((assetsWithAlt / totalAssets) * 100) : 100;

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySeoImgTag = (item: MediaAsset) => {
    const alt = item.altText || item.title;
    const title = item.title;
    const tag = `<img src="${item.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}" alt="${alt}" title="${title}" loading="lazy" decoding="async" class="w-full h-auto rounded-xl" />`;
    handleCopyLink(tag, `tag-${item.id}`);
  };

  const handleCopyMarkdown = (item: MediaAsset) => {
    const alt = item.altText || item.title;
    const title = item.title;
    const md = `![${alt}](${item.url} "${title}")`;
    handleCopyLink(md, `md-${item.id}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewTitle(cleanName);
      setNewAltText(cleanName);
      setNewSeoSlug(file.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }

    if (autoCompressOnUpload) {
      setIsCompressingUpload(true);
      try {
        const result = await compressImage(file, {
          maxWidth: uploadMaxWidth,
          quality: uploadQuality / 100,
          format: 'image/webp',
        });
        setUploadStats(result);
        setNewUrl(result.dataUrl);
        setNewDimensions(`${result.compressedWidth}x${result.compressedHeight}`);
        setNewFileSize(`${result.compressedSizeFormatted} WebP`);
      } catch (err) {
        console.warn('Auto compression fallback:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewUrl(event.target?.result as string);
          setNewFileSize(formatBytes(file.size));
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingUpload(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewUrl(event.target?.result as string);
        setNewFileSize(formatBytes(file.size));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptimizeUrl = async () => {
    if (!newUrl.trim()) return;
    setIsCompressingUpload(true);
    try {
      const result = await compressImage(newUrl, {
        maxWidth: uploadMaxWidth,
        quality: uploadQuality / 100,
        format: 'image/webp',
      });
      setUploadStats(result);
      setNewUrl(result.dataUrl);
      setNewDimensions(`${result.compressedWidth}x${result.compressedHeight}`);
      setNewFileSize(`${result.compressedSizeFormatted} WebP`);
    } catch (err) {
      console.warn('URL optimization error:', err);
      setMediaErrorMsg('Unable to compress URL image. Please verify the link is direct and publicly accessible.');
      setTimeout(() => setMediaErrorMsg(null), 4500);
    } finally {
      setIsCompressingUpload(false);
    }
  };

  const handleOptimizeExistingAsset = async (item: MediaAsset) => {
    if (!onUpdateMedia) return;
    setOptimizingAssetId(item.id);
    try {
      const result = await compressImage(item.url, {
        maxWidth: 1600,
        quality: 0.78,
        format: 'image/webp',
      });
      onUpdateMedia({
        id: item.id,
        url: result.dataUrl,
        fileSize: `${result.compressedSizeFormatted} WebP`,
        dimensions: `${result.compressedWidth}x${result.compressedHeight}`,
        title: item.title.includes('WebP') ? item.title : `${item.title} (WebP Optimized)`,
      });
      setOptimizeMessage(`Photo "${item.title}" successfully compressed to WebP! LCP improved by ~${(result.coreWebVitalsImpact.lcpSavingMs / 1000).toFixed(1)}s.`);
      setTimeout(() => setOptimizeMessage(null), 3500);
    } catch (err) {
      console.error('Error optimizing existing asset:', err);
      setMediaErrorMsg('Error occurred while compressing the image.');
      setTimeout(() => setMediaErrorMsg(null), 4000);
    } finally {
      setOptimizingAssetId(null);
    }
  };

  const handleOpenSeoModal = (item: MediaAsset) => {
    setEditingSeoAsset(item);
    setEditAltText(item.altText || item.title || '');
    setEditSeoTitle(item.title || '');
    setEditCaption(item.caption || '');
    setEditFocusKeywords(item.focusKeywords || '');
    setEditSeoSlug(item.seoSlug || item.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    setEditLoadingStrategy(item.loadingStrategy || 'lazy');
    setEditFolder(item.folder || '');
  };

  const handleSaveSeoMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeoAsset) return;

    if (onUpdateMedia) {
      onUpdateMedia({
        id: editingSeoAsset.id,
        altText: editAltText.trim(),
        title: editSeoTitle.trim(),
        caption: editCaption.trim(),
        focusKeywords: editFocusKeywords.trim(),
        seoSlug: editSeoSlug.trim(),
        loadingStrategy: editLoadingStrategy,
        folder: editFolder.trim() || undefined,
      });
    }

    setEditingSeoAsset(null);
  };

  const handleSaveNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) {
      setMediaErrorMsg('Please fill in both title and image URL.');
      setTimeout(() => setMediaErrorMsg(null), 4000);
      return;
    }

    onAddMedia({
      title: newTitle.trim(),
      url: newUrl.trim(),
      altText: newAltText.trim() || newTitle.trim(),
      caption: newCaption.trim(),
      focusKeywords: newFocusKeywords.trim(),
      seoSlug: newSeoSlug.trim() || newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: newCategory,
      type: newType,
      folder: newFolder.trim() || undefined,
      loadingStrategy: 'lazy',
      fileSize: newFileSize || (uploadStats ? `${uploadStats.compressedSizeFormatted} WebP` : '220 KB WebP'),
      dimensions: newDimensions || (uploadStats ? `${uploadStats.compressedWidth}x${uploadStats.compressedHeight}` : '1600x900'),
      uploadedBy: 'Chief Editor',
    });

    setNewTitle('');
    setNewUrl('');
    setNewAltText('');
    setNewCaption('');
    setNewFocusKeywords('');
    setNewSeoSlug('');
    setUploadStats(null);
    setShowUploadModal(false);
  };

  // Canvas-based Aspect Ratio Cropping Engine
  const executeCrop = async (
    imageUrl: string,
    ratioString: '16:9' | '4:3' | '1:1' | '3:2' | '21:9'
  ): Promise<{ dataUrl: string; width: number; height: number }> => {
    const ratioMap = {
      '16:9': 16 / 9,
      '4:3': 4 / 3,
      '1:1': 1 / 1,
      '3:2': 3 / 2,
      '21:9': 21 / 9,
    };
    const targetRatio = ratioMap[ratioString] || 16 / 9;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const origAspect = img.width / img.height;
        let cropW = img.width;
        let cropH = img.height;
        let startX = 0;
        let startY = 0;

        if (origAspect > targetRatio) {
          cropW = img.height * targetRatio;
          startX = (img.width - cropW) / 2;
        } else {
          cropH = img.width / targetRatio;
          startY = (img.height - cropH) / 2;
        }

        const outW = Math.min(Math.round(cropW), 1600);
        const outH = Math.round(outW / targetRatio);
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No canvas context'));

        ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, outW, outH);
        resolve({
          dataUrl: canvas.toDataURL('image/webp', 0.86),
          width: outW,
          height: outH,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for cropping'));
      img.src = imageUrl;
    });
  };

  const handleApplyCrop = async (saveAsNew: boolean) => {
    if (!croppingAsset) return;
    setIsCropping(true);
    try {
      const result = await executeCrop(croppingAsset.url, cropAspectRatio);
      if (saveAsNew) {
        onAddMedia({
          title: `${croppingAsset.title} [${cropAspectRatio} Crop]`,
          url: result.dataUrl,
          altText: croppingAsset.altText || croppingAsset.title,
          caption: `${croppingAsset.caption || croppingAsset.title} (${cropAspectRatio} Cropped)`,
          category: croppingAsset.category || 'national',
          type: croppingAsset.type || 'image',
          loadingStrategy: 'lazy',
          fileSize: 'WebP Cropped',
          dimensions: `${result.width}x${result.height}`,
          uploadedBy: 'Cropping Tool',
        });
        setOptimizeMessage(`✓ ${cropAspectRatio} cropped version saved as a new asset!`);
      } else if (onUpdateMedia) {
        onUpdateMedia({
          id: croppingAsset.id,
          url: result.dataUrl,
          dimensions: `${result.width}x${result.height}`,
          fileSize: 'WebP Cropped',
        });
        setOptimizeMessage(`✓ Asset "${croppingAsset.title}" updated with ${cropAspectRatio} crop!`);
      }
      setShowCropModal(false);
      setCroppingAsset(null);
      setTimeout(() => setOptimizeMessage(null), 3500);
    } catch (err) {
      console.error('Crop error:', err);
      setMediaErrorMsg('Could not crop image. Verify the image link is accessible.');
      setTimeout(() => setMediaErrorMsg(null), 4000);
    } finally {
      setIsCropping(false);
    }
  };

  // Canvas-based Brand Watermarking Engine
  const executeWatermark = async (
    imageUrl: string,
    text: string,
    pos: 'bottom-right' | 'bottom-left' | 'top-right' | 'center',
    opacityVal: number
  ): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No canvas context'));

        ctx.drawImage(img, 0, 0);

        const fontSize = Math.max(16, Math.round(canvas.width / 32));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textBaseline = 'middle';

        const padding = fontSize * 0.8;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const badgeW = textWidth + padding * 2;
        const badgeH = fontSize * 1.8;

        let badgeX = canvas.width - badgeW - padding;
        let badgeY = canvas.height - badgeH - padding;

        if (pos === 'bottom-left') {
          badgeX = padding;
          badgeY = canvas.height - badgeH - padding;
        } else if (pos === 'top-right') {
          badgeX = canvas.width - badgeW - padding;
          badgeY = padding;
        } else if (pos === 'center') {
          badgeX = (canvas.width - badgeW) / 2;
          badgeY = (canvas.height - badgeH) / 2;
        }

        ctx.save();
        ctx.globalAlpha = opacityVal;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, fontSize * 0.4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, badgeX + padding, badgeY + badgeH / 2);
        ctx.restore();

        resolve({
          dataUrl: canvas.toDataURL('image/webp', 0.88),
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for watermarking'));
      img.src = imageUrl;
    });
  };

  const handleApplyWatermark = async (saveAsNew: boolean) => {
    if (!watermarkingAsset) return;
    setIsWatermarking(true);
    try {
      const result = await executeWatermark(
        watermarkingAsset.url,
        watermarkText.trim() || 'खबरी दोस्त • Khabri Dost',
        watermarkPosition,
        watermarkOpacity
      );
      if (saveAsNew) {
        onAddMedia({
          title: `${watermarkingAsset.title} [Watermarked]`,
          url: result.dataUrl,
          altText: watermarkingAsset.altText || watermarkingAsset.title,
          caption: `${watermarkingAsset.caption || watermarkingAsset.title} (Watermarked)`,
          category: watermarkingAsset.category || 'national',
          type: watermarkingAsset.type || 'image',
          loadingStrategy: 'lazy',
          fileSize: 'Watermarked WebP',
          dimensions: `${result.width}x${result.height}`,
          uploadedBy: 'Watermark Tool',
        });
        setOptimizeMessage('✓ Watermarked version saved as a new asset!');
      } else if (onUpdateMedia) {
        onUpdateMedia({
          id: watermarkingAsset.id,
          url: result.dataUrl,
          fileSize: 'Watermarked WebP',
        });
        setOptimizeMessage(`✓ Asset "${watermarkingAsset.title}" updated with watermark!`);
      }
      setShowWatermarkModal(false);
      setWatermarkingAsset(null);
      setTimeout(() => setOptimizeMessage(null), 3500);
    } catch (err) {
      console.error('Watermark error:', err);
      setMediaErrorMsg('Could not apply watermark. Verify image URL is accessible.');
      setTimeout(() => setMediaErrorMsg(null), 4000);
    } finally {
      setIsWatermarking(false);
    }
  };

  // Stock Photo Importer
  const handleImportStockPhoto = (stock: typeof CURATED_NEWSROOM_STOCK[0]) => {
    onAddMedia({
      title: stock.title,
      url: stock.url,
      altText: stock.altText,
      caption: stock.caption,
      focusKeywords: stock.title.replace(/[()]/g, ''),
      seoSlug: stock.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      category: stock.category,
      type: 'image',
      loadingStrategy: 'lazy',
      fileSize: '180 KB WebP',
      dimensions: '1200x800',
      uploadedBy: 'Curated Stock Importer',
    });
    setImportedStockUrls((prev) => [...prev, stock.url]);
    setOptimizeMessage(`✓ Imported "${stock.title}" to Media Library!`);
    setTimeout(() => setOptimizeMessage(null), 3000);
  };

  // Bulk Actions
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredMedia.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMedia.map((m) => m.id));
    }
  };

  // Folder state persistence helper
  const persistFolders = (newFolders: MediaFolder[]) => {
    setFolders(newFolders);
    try {
      localStorage.setItem('kd_media_folders', JSON.stringify(newFolders));
    } catch (e) {
      console.warn('Failed to save folders to localStorage', e);
    }
  };

  const toggleFolderExpand = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const getFolderAssetCount = (folderPath: string) => {
    return mediaAssets.filter(
      (m) => m.folder === folderPath || Boolean(m.folder && m.folder.startsWith(folderPath + '/'))
    ).length;
  };

  const unorganizedCount = mediaAssets.filter(
    (m) => !m.folder || m.folder === '' || m.folder === 'unorganized'
  ).length;

  const handleOpenNewFolderModal = (parentPath: string = '') => {
    setEditingFolder(null);
    setFolderName('');
    setFolderParentPath(parentPath);
    setFolderDescription('');
    setFolderColor('#2563eb');
    setShowFolderModal(true);
  };

  const handleOpenEditFolderModal = (folder: MediaFolder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderParentPath(
      folder.parentId ? folders.find((f) => f.id === folder.parentId)?.path || '' : ''
    );
    setFolderDescription(folder.description || '');
    setFolderColor(folder.color || '#2563eb');
    setShowFolderModal(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = folderName.trim();
    if (!trimmedName) return;

    const parent = folderParentPath ? folders.find((f) => f.path === folderParentPath) : null;
    const newPath = folderParentPath ? `${folderParentPath}/${trimmedName}` : trimmedName;

    if (editingFolder) {
      const oldPath = editingFolder.path;
      const updatedFolders = folders.map((f) => {
        if (f.id === editingFolder.id) {
          return {
            ...f,
            name: trimmedName,
            path: newPath,
            parentId: parent ? parent.id : null,
            description: folderDescription.trim(),
            color: folderColor,
          };
        }
        if (f.path.startsWith(oldPath + '/')) {
          const suffix = f.path.slice(oldPath.length);
          return {
            ...f,
            path: `${newPath}${suffix}`,
          };
        }
        return f;
      });

      if (onUpdateMedia && oldPath !== newPath) {
        mediaAssets.forEach((asset) => {
          if (asset.folder === oldPath) {
            onUpdateMedia({ id: asset.id, folder: newPath });
          } else if (asset.folder && asset.folder.startsWith(oldPath + '/')) {
            const suffix = asset.folder.slice(oldPath.length);
            onUpdateMedia({ id: asset.id, folder: `${newPath}${suffix}` });
          }
        });
      }

      persistFolders(updatedFolders);
      if (activeFolder === oldPath) {
        setActiveFolder(newPath);
      }
      setOptimizeMessage(`✓ Folder "${trimmedName}" updated successfully!`);
    } else {
      const newFolderItem: MediaFolder = {
        id: `folder-${Date.now()}`,
        name: trimmedName,
        path: newPath,
        parentId: parent ? parent.id : null,
        description: folderDescription.trim(),
        color: folderColor,
        isSystem: false,
        createdAt: new Date().toISOString(),
      };
      persistFolders([...folders, newFolderItem]);
      setOptimizeMessage(`✓ New folder "${trimmedName}" created!`);
    }

    setShowFolderModal(false);
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  const handleDeleteFolder = (folder: MediaFolder) => {
    if (folder.isSystem) {
      setMediaErrorMsg('System folders cannot be deleted as they are essential for portal layout.');
      setTimeout(() => setMediaErrorMsg(null), 4000);
      return;
    }

    const folderPath = folder.path;
    if (onUpdateMedia) {
      mediaAssets.forEach((asset) => {
        if (asset.folder === folderPath || (asset.folder && asset.folder.startsWith(folderPath + '/'))) {
          onUpdateMedia({ id: asset.id, folder: '' });
        }
      });
    }

    const remainingFolders = folders.filter(
      (f) => f.id !== folder.id && f.parentId !== folder.id && !f.path.startsWith(folderPath + '/')
    );
    persistFolders(remainingFolders);
    if (activeFolder === folderPath || activeFolder.startsWith(folderPath + '/')) {
      setActiveFolder('all');
    }
    setOptimizeMessage(`✓ Folder "${folder.name}" deleted. Contained assets moved to Unorganized.`);
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  const handleMoveAssetsToFolder = (assetIds: string[], targetFolder: string) => {
    if (!onUpdateMedia || assetIds.length === 0) return;
    assetIds.forEach((id) => {
      onUpdateMedia({ id, folder: targetFolder });
    });
    setOptimizeMessage(
      `✓ Moved ${assetIds.length} asset(s) to "${targetFolder || 'Root / Unorganized'}"!`
    );
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  // Safe Bulk Delete with Article Scanning
  const handleOpenBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setAcknowledgeInUseDeletion(false);
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => onDeleteMedia(id));
    const count = selectedIds.length;
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
    setOptimizeMessage(`✓ Successfully removed ${count} media asset(s).`);
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  // Safe Single Delete Confirmation
  const handleConfirmSingleDelete = () => {
    if (!assetToDelete) return;
    onDeleteMedia(assetToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== assetToDelete.id));
    setOptimizeMessage(`✓ Deleted asset "${assetToDelete.title}".`);
    setAssetToDelete(null);
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  // Safe Bulk Metadata Batch Application
  const handleOpenBulkMetaModal = () => {
    if (selectedIds.length === 0) return;
    setBulkMetaFolderOption('no-change');
    setBulkMetaTargetFolder(folders[0]?.path || 'Hero/Breaking');
    setBulkMetaCategoryOption('no-change');
    setBulkMetaCategoryValue('national');
    setBulkMetaCaptionOption('no-change');
    setBulkMetaCaptionValue('');
    setBulkMetaAltOption('no-change');
    setBulkMetaAltValue('');
    setBulkMetaLoadingOption('no-change');
    setBulkMetaTypeOption('no-change');
    setBulkMetaTagsOption('no-change');
    setBulkMetaTagsValue('');
    setShowBulkMetaModal(true);
  };

  const handleApplyBulkMetadata = () => {
    if (selectedIds.length === 0 || !onUpdateMedia) return;

    selectedIds.forEach((id) => {
      const asset = mediaAssets.find((m) => m.id === id);
      if (!asset) return;

      const updates: Partial<MediaAsset> & { id: string } = { id };

      // 1. Folder / Category
      if (bulkMetaFolderOption === 'set') {
        updates.folder = bulkMetaTargetFolder;
      } else if (bulkMetaFolderOption === 'clear') {
        updates.folder = '';
      }

      // 2. Category
      if (bulkMetaCategoryOption === 'set') {
        updates.category = bulkMetaCategoryValue;
      }

      // 3. Caption / Credit
      if (bulkMetaCaptionOption === 'replace') {
        updates.caption = bulkMetaCaptionValue.trim();
      } else if (bulkMetaCaptionOption === 'append') {
        const existing = asset.caption || '';
        updates.caption = existing
          ? `${existing} | ${bulkMetaCaptionValue.trim()}`
          : bulkMetaCaptionValue.trim();
      }

      // 4. Alt Text (SEO)
      if (bulkMetaAltOption === 'replace') {
        updates.altText = bulkMetaAltValue.trim();
      } else if (bulkMetaAltOption === 'auto-seo') {
        const cat = updates.category || asset.category || 'News';
        updates.altText = `${asset.title} • ${cat.toUpperCase()} | Khabri Dost`;
      } else if (bulkMetaAltOption === 'prefix') {
        const existing = asset.altText || asset.title;
        updates.altText = `${bulkMetaAltValue.trim()} ${existing}`;
      }

      // 5. Loading Strategy
      if (bulkMetaLoadingOption !== 'no-change') {
        updates.loadingStrategy = bulkMetaLoadingOption;
      }

      // 6. Media Type
      if (bulkMetaTypeOption !== 'no-change') {
        updates.type = bulkMetaTypeOption;
      }

      // 7. Focus Keywords / Tags
      if (bulkMetaTagsOption === 'replace') {
        updates.focusKeywords = bulkMetaTagsValue.trim();
      } else if (bulkMetaTagsOption === 'append') {
        const existing = asset.focusKeywords || '';
        updates.focusKeywords = existing
          ? `${existing}, ${bulkMetaTagsValue.trim()}`
          : bulkMetaTagsValue.trim();
      }

      onUpdateMedia(updates);
    });

    const count = selectedIds.length;
    setShowBulkMetaModal(false);
    setOptimizeMessage(`✓ Batch metadata updated successfully for ${count} asset(s)!`);
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  const handleBulkCategoryChange = () => {
    if (selectedIds.length === 0 || !onUpdateMedia) return;
    selectedIds.forEach((id) => {
      onUpdateMedia({ id, category: bulkCategory });
    });
    setOptimizeMessage(`✓ Category updated to "${bulkCategory}" for ${selectedIds.length} assets.`);
    setSelectedIds([]);
    setTimeout(() => setOptimizeMessage(null), 3500);
  };

  const handleExportCatalog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mediaAssets, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `khabri-dost-media-catalog-${Date.now()}.json`);
    dl.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & SEO Health Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-500" />
            <span>Editorial Media Gallery & Image SEO Suite</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            High-resolution press photos, Alt text, Google Images ranking, and Core Web Vitals compression management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowStockModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-200" />
            <span>Royalty-Free Stock</span>
          </button>

          <button
            type="button"
            onClick={handleExportCatalog}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer border border-slate-700"
            title="Export Media Catalog as JSON"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowCompressorModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Image Compressor (Web Vitals)</span>
          </button>

          <button
            onClick={() => setShowVideoEmbedModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Social Video Embed</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Add Media</span>
          </button>
        </div>
      </div>

      {optimizeMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{optimizeMessage}</span>
        </div>
      )}

      {mediaErrorMsg && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{mediaErrorMsg}</span>
        </div>
      )}

      {/* SEO Health Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Media Assets
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalAssets}</div>
          <span className="text-[10px] text-slate-500">Stored images in library</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Image SEO Score
          </span>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-600 font-mono">{seoHealthScore}%</div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
              {seoHealthScore >= 80 ? 'Excellent' : 'Needs Optimization'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Google Images readiness</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Alt Text Complete (Alt OK)
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{assetsWithAlt}</div>
          <span className="text-[10px] text-emerald-600">✓ Ready for Google Index</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Alt Text Pending
          </span>
          <div className={`text-2xl font-bold font-mono ${assetsMissingAlt > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {assetsMissingAlt}
          </div>
          <span className="text-[10px] text-amber-600">
            {assetsMissingAlt > 0 ? '⚠️ SEO review needed' : 'All images optimized'}
          </span>
        </div>
      </div>

      {/* 2-Column Responsive DAM Workspace: Left Folder Tree Sidebar + Right Media DAM Workspace */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT SIDEBAR: Hierarchical Folder Explorer & Custom Categories */}
        <aside className="w-full lg:w-72 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Media Folders
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleOpenNewFolderModal()}
              className="text-[11px] bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2 py-1 rounded-lg transition flex items-center space-x-1 cursor-pointer border border-red-200"
              title="Create New Custom Folder"
            >
              <Plus className="w-3 h-3" />
              <span>New Folder</span>
            </button>
          </div>

          {/* Root Level Filters */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveFolder('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeFolder === 'all'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Layers
                  className={`w-4 h-4 ${activeFolder === 'all' ? 'text-amber-400' : 'text-slate-400'}`}
                />
                <span>All Media Assets</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeFolder === 'all'
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {mediaAssets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('unorganized')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeFolder === 'unorganized'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Folder
                  className={`w-4 h-4 ${
                    activeFolder === 'unorganized' ? 'text-white' : 'text-amber-500'
                  }`}
                />
                <span>Unorganized / Root</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeFolder === 'unorganized'
                    ? 'bg-amber-700 text-amber-100'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {unorganizedCount}
              </span>
            </button>
          </div>

          {/* Hierarchical Folder Tree */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Categories & Folders
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {folders.length} Folders
              </span>
            </div>

            <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
              {folders
                .filter((f) => !f.parentId && !f.path.includes('/'))
                .map((rootFolder) => {
                  const subfolders = folders.filter(
                    (sub) =>
                      sub.parentId === rootFolder.id ||
                      (sub.path.startsWith(rootFolder.path + '/') && sub.id !== rootFolder.id)
                  );
                  const isExpanded = Boolean(expandedFolders[rootFolder.path]);
                  const isRootActive = activeFolder === rootFolder.path;
                  const count = getFolderAssetCount(rootFolder.path);

                  return (
                    <div key={rootFolder.id} className="space-y-0.5">
                      <div
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-xl text-xs transition ${
                          isRootActive
                            ? 'bg-red-50 text-red-900 border border-red-200 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                          {subfolders.length > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFolderExpand(rootFolder.path);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer rounded"
                              title={isExpanded ? 'Collapse subfolders' : 'Expand subfolders'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <div className="w-4" />
                          )}

                          <button
                            type="button"
                            onClick={() => setActiveFolder(rootFolder.path)}
                            className="flex items-center space-x-2 truncate flex-1 text-left cursor-pointer"
                          >
                            <Folder
                              className="w-4 h-4 shrink-0"
                              style={{ color: rootFolder.color || '#2563eb' }}
                            />
                            <span className="truncate">{rootFolder.name}</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-1">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                              isRootActive
                                ? 'bg-red-200 text-red-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {count}
                          </span>

                          <div className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNewFolderModal(rootFolder.path);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded cursor-pointer"
                              title="Add subfolder inside this folder"
                            >
                              <Plus className="w-3 h-3" />
                            </button>

                            {!rootFolder.isSystem && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditFolderModal(rootFolder);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 rounded cursor-pointer"
                                  title="Edit folder"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(rootFolder);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded cursor-pointer"
                                  title="Delete custom folder"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subfolders list */}
                      {isExpanded && subfolders.length > 0 && (
                        <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-0.5 py-0.5">
                          {subfolders.map((sub) => {
                            const isSubActive = activeFolder === sub.path;
                            const subCount = getFolderAssetCount(sub.path);

                            return (
                              <div
                                key={sub.id}
                                className={`group flex items-center justify-between px-2 py-1 rounded-lg text-xs transition ${
                                  isSubActive
                                    ? 'bg-red-50 text-red-900 font-bold border border-red-200'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setActiveFolder(sub.path)}
                                  className="flex items-center space-x-2 truncate flex-1 text-left cursor-pointer"
                                >
                                  <FolderOpen
                                    className="w-3.5 h-3.5 shrink-0"
                                    style={{ color: sub.color || '#3b82f6' }}
                                  />
                                  <span className="truncate">{sub.name}</span>
                                </button>

                                <div className="flex items-center space-x-1 shrink-0 ml-1">
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                      isSubActive
                                        ? 'bg-red-200 text-red-800'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {subCount}
                                  </span>

                                  {!sub.isSystem && (
                                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditFolderModal(sub);
                                        }}
                                        className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                                        title="Edit subfolder"
                                      >
                                        <Edit3 className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteFolder(sub);
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                        title="Delete subfolder"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </aside>

        {/* RIGHT AREA: Breadcrumb, Filters, Views, and Sticky Bulk Toolbar */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          {/* Breadcrumb Trail & Current Location Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <nav className="flex items-center space-x-1.5 text-xs text-slate-500 min-w-0">
              <button
                type="button"
                onClick={() => setActiveFolder('all')}
                className="hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Media Library</span>
              </button>

              {activeFolder === 'all' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-bold text-slate-900">All Folders</span>
                </>
              )}

              {activeFolder === 'unorganized' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Unorganized / Root
                  </span>
                </>
              )}

              {activeFolder !== 'all' && activeFolder !== 'unorganized' && (
                <>
                  {activeFolder.split('/').map((segment, idx, arr) => {
                    const partialPath = arr.slice(0, idx + 1).join('/');
                    const isLast = idx === arr.length - 1;
                    return (
                      <React.Fragment key={partialPath}>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        {isLast ? (
                          <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            {segment}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveFolder(partialPath)}
                            className="hover:text-red-600 font-medium text-slate-700 cursor-pointer"
                          >
                            {segment}
                          </button>
                        )}
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              <span className="text-[11px] font-mono text-slate-400 ml-1">
                ({filteredMedia.length} {filteredMedia.length === 1 ? 'asset' : 'assets'})
              </span>
            </nav>

            {activeFolder !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFolder('all')}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Show All Folders</span>
              </button>
            )}
          </div>

          {/* Type & Sorting Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Type Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Type:</span>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'image', label: 'News Images' },
            { id: 'banner', label: 'Banners' },
            { id: 'infographic', label: 'Infographics' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                typeFilter === t.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort & Select All */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center space-x-1.5 ${
              selectedIds.length > 0 && selectedIds.length === filteredMedia.length
                ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {selectedIds.length > 0 && selectedIds.length === filteredMedia.length ? (
              <CheckSquare className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{selectedIds.length === filteredMedia.length ? 'Deselect All' : 'Select All'}</span>
          </button>

          <div className="flex items-center space-x-1 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, Alt text, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {['all', 'national', 'politics', 'sports', 'business', 'tech', 'state', 'advertising'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize ${
                  categoryFilter === cat
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Images' : cat}
              </button>
            )
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'grid' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'table' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Media Assets View: Grid or Table */}
      {filteredMedia.length === 0 ? (
        <div className="py-20 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">No media assets found</p>
          <p className="text-xs text-slate-500">Upload a new image, import royalty-free stock, or clear search filter.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-mono">
                <tr>
                  <th className="p-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredMedia.length}
                      onChange={handleToggleSelectAll}
                      className="rounded accent-red-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Asset Preview & Title</th>
                  <th className="p-3">Alt Text (SEO)</th>
                  <th className="p-3">Folder</th>
                  <th className="p-3">Category & Usage</th>
                  <th className="p-3">Dimensions / Size</th>
                  <th className="p-3 pr-4 text-right">DAM Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedia.map((item) => {
                  const hasAlt = Boolean(item.altText && item.altText.trim());
                  const isSelected = selectedIds.includes(item.id);
                  const usage = getAssetUsage(item.url);
                  return (
                    <tr key={item.id} className={`transition ${isSelected ? 'bg-red-50/50' : 'hover:bg-slate-50/80'}`}>
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded accent-red-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div
                            onClick={() => setInspectingAsset(item)}
                            className="relative cursor-pointer group shrink-0"
                            title="Click to inspect high-resolution preview"
                          >
                            <img
                              src={item.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                              alt={item.altText || item.title}
                              className="w-14 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 group-hover:opacity-85 transition"
                            />
                            <Maximize2 className="w-3.5 h-3.5 text-white absolute inset-0 m-auto opacity-0 group-hover:opacity-100 drop-shadow-md transition" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {hasAlt ? (
                          <span className="text-[11px] text-emerald-700 font-medium block truncate max-w-[160px]" title={item.altText}>
                            ✓ {item.altText}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                            ⚠️ Alt Missing
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-mono">
                            <Folder className="w-2.5 h-2.5 text-slate-500" />
                            <span className="truncate max-w-[110px]">{item.folder || 'Unorganized'}</span>
                          </span>
                          <select
                            value={item.folder || ''}
                            onChange={(e) => handleMoveAssetsToFolder([item.id], e.target.value)}
                            className="block text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 max-w-[125px]"
                            title="Move to folder"
                          >
                            <option value="">Move to...</option>
                            <option value="">(Root / Unorganized)</option>
                            {folders.map((f) => (
                              <option key={f.id} value={f.path}>{f.path}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono inline-block">
                            {item.category || item.type}
                          </span>
                          <div>
                            {usage.length > 0 ? (
                              <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded" title={usage.map(u => u.title).join(', ')}>
                                {usage.length} Story
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Library only</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        <div>{item.dimensions || '1600x900'}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">{item.fileSize || 'WebP'}</div>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick Crop */}
                          <button
                            type="button"
                            onClick={() => {
                              setCroppingAsset(item);
                              setShowCropModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition cursor-pointer text-xs font-semibold flex items-center space-x-0.5 border border-indigo-200"
                            title="Crop Aspect Ratio (16:9, 4:3, 1:1, 21:9)"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Crop</span>
                          </button>

                          {/* Watermark */}
                          <button
                            type="button"
                            onClick={() => {
                              setWatermarkingAsset(item);
                              setShowWatermarkModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 transition cursor-pointer text-xs font-semibold flex items-center space-x-0.5 border border-purple-200"
                            title="Apply Khabri Dost Watermark"
                          >
                            <Stamp className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Brand</span>
                          </button>

                          {/* SEO */}
                          <button
                            type="button"
                            onClick={() => handleOpenSeoModal(item)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer text-xs font-semibold flex items-center space-x-0.5 border border-amber-200"
                            title="Edit Alt Text & SEO Metadata"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>SEO</span>
                          </button>

                          {/* WebP */}
                          <button
                            type="button"
                            onClick={() => handleOptimizeExistingAsset(item)}
                            disabled={optimizingAssetId === item.id}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer text-xs font-semibold flex items-center space-x-0.5 border border-emerald-200 disabled:opacity-50"
                            title="Convert to WebP"
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          {/* Copy URL */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item.url, item.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                            title="Copy URL"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Safe Delete with in-app confirmation modal */}
                          <button
                            type="button"
                            onClick={() => setAssetToDelete(item)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((item) => {
            const hasAlt = Boolean(item.altText && item.altText.trim());
            const isSelected = selectedIds.includes(item.id);
            const usage = getAssetUsage(item.url);
            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl overflow-hidden group flex flex-col justify-between transition shadow-2xs ${
                  isSelected ? 'border-red-600 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                    alt={item.altText || item.title}
                    loading={item.loadingStrategy || 'lazy'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Multi-Select Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <label className="flex items-center justify-center p-1 bg-black/60 backdrop-blur-xs rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded accent-red-600 cursor-pointer w-4 h-4"
                      />
                    </label>
                  </div>

                  {/* Fullscreen Inspector Button */}
                  <button
                    type="button"
                    onClick={() => setInspectingAsset(item)}
                    className="absolute top-2 right-2 bg-black/65 hover:bg-black text-white p-1.5 rounded-lg shadow-xs backdrop-blur-xs transition cursor-pointer"
                    title="Fullscreen Lightbox & Inspector"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* WebP & Core Web Vitals Status Badge */}
                  <span className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 backdrop-blur-xs">
                    <Zap className="w-2.5 h-2.5 text-amber-300" />
                    <span>{item.fileSize?.includes('WebP') ? 'WebP' : item.fileSize || 'Optimized'}</span>
                  </span>

                  {/* SEO Health Badge */}
                  <span
                    className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 backdrop-blur-xs ${
                      hasAlt
                        ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
                        : 'bg-amber-950/80 text-amber-200 border border-amber-500/50'
                    }`}
                  >
                    {hasAlt ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>SEO Alt OK</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Alt Missing</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                          {item.category || item.type}
                        </span>
                        <span className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                          <Folder className="w-2.5 h-2.5 text-blue-500" />
                          <span className="truncate max-w-[100px]">{item.folder || 'Unorganized'}</span>
                        </span>
                      </div>
                      {usage.length > 0 ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shrink-0" title={usage.map(u => u.title).join(', ')}>
                          Used in {usage.length} story
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 shrink-0">Library only</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={item.title}>
                      {item.title}
                    </h4>
                    <p
                      className="text-[11px] text-slate-500 line-clamp-1 mt-0.5"
                      title={item.altText || 'Alt missing'}
                    >
                      <strong className="text-slate-700">Alt:</strong> {item.altText || 'Missing'}
                    </p>
                    {item.caption && (
                      <p className="text-[10px] text-slate-400 italic line-clamp-1">
                        Credit: {item.caption}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="font-mono">{item.dimensions || '1920x1080'}</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                      {item.loadingStrategy || 'lazy'}
                    </span>
                  </div>

                  {/* Folder quick assign */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 shrink-0">Folder:</span>
                    <select
                      value={item.folder || ''}
                      onChange={(e) => handleMoveAssetsToFolder([item.id], e.target.value)}
                      className="w-full text-[10px] bg-slate-50 hover:bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500 truncate"
                    >
                      <option value="">(Root / Unorganized)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.path}>{f.path}</option>
                      ))}
                    </select>
                  </div>

                  {/* SEO Quick Copy & Action Toolbar */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopySeoImgTag(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-200 flex items-center justify-center space-x-1 transition cursor-pointer"
                        title="Copy full HTML <img> tag with alt, title, and lazy loading"
                      >
                        {copiedId === `tag-${item.id}` ? (
                          <span className="text-emerald-600 font-bold">Tag Copied!</span>
                        ) : (
                          <>
                            <Code2 className="w-3 h-3 text-red-600" />
                            <span>Copy HTML &lt;img&gt;</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyMarkdown(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-200 flex items-center justify-center space-x-1 transition cursor-pointer"
                        title="Copy Markdown ![Alt](url)"
                      >
                        {copiedId === `md-${item.id}` ? (
                          <span className="text-emerald-600 font-bold">MD Copied!</span>
                        ) : (
                          <>
                            <FileCode className="w-3 h-3 text-blue-600" />
                            <span>Copy Markdown</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* DAM Quick Tools Bar: Crop, Watermark, SEO, WebP */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {/* Aspect Ratio Cropper */}
                      <button
                        type="button"
                        onClick={() => {
                          setCroppingAsset(item);
                          setShowCropModal(true);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                        title="Crop Aspect Ratio (16:9, 4:3, 1:1, 21:9)"
                      >
                        <Crop className="w-3 h-3 text-indigo-600" />
                        <span>Crop</span>
                      </button>

                      {/* Brand Watermark */}
                      <button
                        type="button"
                        onClick={() => {
                          setWatermarkingAsset(item);
                          setShowWatermarkModal(true);
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                        title="Stamp Khabri Dost Brand Watermark"
                      >
                        <Stamp className="w-3 h-3 text-purple-600" />
                        <span>Brand</span>
                      </button>

                      {/* SEO */}
                      <button
                        type="button"
                        onClick={() => handleOpenSeoModal(item)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                        title="Edit Image SEO Alt Text, Title & Keywords"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>SEO</span>
                      </button>

                      {/* WebP */}
                      <button
                        type="button"
                        onClick={() => handleOptimizeExistingAsset(item)}
                        disabled={optimizingAssetId === item.id}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer disabled:opacity-50"
                        title="Convert to WebP"
                      >
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>WebP</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item.url, item.id)}
                        className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center space-x-1"
                        title="Copy Direct URL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      {onOpenEditorWithImage && (
                        <button
                          type="button"
                          onClick={() => onOpenEditorWithImage(item)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition cursor-pointer"
                          title="Create article from this photo"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setAssetToDelete(item)}
                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 transition cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STICKY BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.length} media asset(s) selected
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            {/* Quick Move to Folder */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-slate-300">Move:</span>
              <select
                value={quickMoveTargetFolder}
                onChange={(e) => setQuickMoveTargetFolder(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-0.5 text-xs text-white max-w-[140px]"
              >
                <option value="">(Root / Unorganized)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.path}>
                    {f.path}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleMoveAssetsToFolder(selectedIds, quickMoveTargetFolder)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg transition cursor-pointer"
              >
                Move
              </button>
            </div>

            {/* Bulk Metadata Modal Trigger */}
            <button
              type="button"
              onClick={handleOpenBulkMetaModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-200" />
              <span>Bulk Edit Metadata</span>
            </button>

            {/* Safe Bulk Delete Trigger */}
            <button
              type="button"
              onClick={handleOpenBulkDeleteModal}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* ASPECT RATIO CROPPING TOOL MODAL */}
      {showCropModal && croppingAsset && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Aspect Ratio Cropping Presets
                  </h3>
                  <p className="text-[11px] text-slate-500">Preset ratios for breaking hero, editorial card, and social shares</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setCroppingAsset(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Cropping Preview Box */}
            <div className="space-y-3">
              <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[200px]">
                <div
                  className="overflow-hidden border-2 border-indigo-500 shadow-lg relative transition-all duration-300"
                  style={{
                    aspectRatio:
                      cropAspectRatio === '16:9'
                        ? '16/9'
                        : cropAspectRatio === '4:3'
                        ? '4/3'
                        : cropAspectRatio === '1:1'
                        ? '1/1'
                        : cropAspectRatio === '3:2'
                        ? '3/2'
                        : '21/9',
                    maxWidth: '100%',
                    maxHeight: '260px',
                  }}
                >
                  <img
                    src={croppingAsset.url}
                    alt={croppingAsset.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {cropAspectRatio} Target Ratio
                  </div>
                </div>
              </div>

              {/* Ratio Buttons */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Select Aspect Ratio:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: '16:9', label: '16:9', desc: 'News Hero' },
                    { id: '4:3', label: '4:3', desc: 'Editorial' },
                    { id: '1:1', label: '1:1', desc: 'Square Social' },
                    { id: '3:2', label: '3:2', desc: 'DSLR Press' },
                    { id: '21:9', label: '21:9', desc: 'Ultrawide' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setCropAspectRatio(r.id as any)}
                      className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                        cropAspectRatio === r.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className={`text-[9px] ${cropAspectRatio === r.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCropModal(false);
                  setCroppingAsset(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCropping}
                onClick={() => handleApplyCrop(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isCropping ? 'Cropping...' : 'Save as New Asset'}</span>
              </button>
              <button
                type="button"
                disabled={isCropping}
                onClick={() => handleApplyCrop(false)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>Overwrite Existing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BRAND WATERMARK ENGINE MODAL */}
      {showWatermarkModal && watermarkingAsset && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Newsroom Brand Watermark Engine
                  </h3>
                  <p className="text-[11px] text-slate-500">Protect portal photos with the official Khabri Dost brand watermark</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWatermarkModal(false);
                  setWatermarkingAsset(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[190px]">
              <div className="relative max-h-[240px] overflow-hidden rounded-lg">
                <img
                  src={watermarkingAsset.url}
                  alt={watermarkingAsset.title}
                  className="max-h-[240px] w-auto object-contain"
                />
                {/* Live CSS simulation of watermark badge */}
                <div
                  className={`absolute bg-slate-950 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-lg pointer-events-none ${
                    watermarkPosition === 'bottom-right'
                      ? 'bottom-3 right-3'
                      : watermarkPosition === 'bottom-left'
                      ? 'bottom-3 left-3'
                      : watermarkPosition === 'top-right'
                      ? 'top-3 right-3'
                      : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                  }`}
                  style={{ opacity: watermarkOpacity }}
                >
                  {watermarkText || 'खबरी दोस्त • Khabri Dost'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="खबरी दोस्त • Khabri Dost"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Watermark Position
                  </label>
                  <select
                    value={watermarkPosition}
                    onChange={(e) => setWatermarkPosition(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="bottom-right">Bottom Right (अनुशंसित)</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="center">Center Stamp</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Opacity: {Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="1.00"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowWatermarkModal(false);
                  setWatermarkingAsset(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isWatermarking}
                onClick={() => handleApplyWatermark(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isWatermarking ? 'Stamping...' : 'Save Watermarked Copy'}</span>
              </button>
              <button
                type="button"
                disabled={isWatermarking}
                onClick={() => handleApplyWatermark(false)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>Overwrite Existing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROYALTY-FREE NEWSROOM STOCK PHOTO QUICK IMPORTER MODAL */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Curated Royalty-Free Newsroom Press Stock Photos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    High-resolution verified news photography with pre-configured Hindi SEO Alt tags, categories and credits
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Topic Filter Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'ताज़ा ख़बरें', 'राजनीति', 'खेल', 'व्यापार', 'मौसम व पर्यावरण', 'तकनीक व ऑटो'].map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setStockTopicFilter(tp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    stockTopicFilter === tp
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tp === 'all' ? 'सभी फ़ोटो (All)' : tp}
                </button>
              ))}
            </div>

            {/* Stock Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {CURATED_NEWSROOM_STOCK.filter((st) =>
                stockTopicFilter === 'all' ? true : st.topic === stockTopicFilter
              ).map((stock, idx) => {
                const isImported = importedStockUrls.includes(stock.url) || mediaAssets.some((m) => m.url === stock.url);
                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-100">
                      <img
                        src={stock.url}
                        alt={stock.altText}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/75 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase font-mono">
                        {stock.topic}
                      </span>
                    </div>

                    <div className="p-3 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={stock.title}>
                        {stock.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        <strong>Alt:</strong> {stock.altText}
                      </p>
                      <div className="text-[9px] text-slate-400 italic truncate">
                        {stock.caption}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleImportStockPhoto(stock)}
                        disabled={isImported}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                          isImported
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        {isImported ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Media Library</span>
                          </>
                        ) : (
                          <>
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>Import to Library</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX & METADATA INSPECTOR MODAL */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-950 text-white rounded-3xl max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Maximize2 className="w-4 h-4 text-red-500" />
                <h3 className="text-sm sm:text-base font-bold truncate max-w-[280px] sm:max-w-md">
                  {inspectingAsset.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingAsset(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Full Image Display */}
              <div className="relative bg-black rounded-2xl overflow-hidden flex items-center justify-center max-h-[50vh] border border-slate-800">
                <img
                  src={inspectingAsset.url}
                  alt={inspectingAsset.altText || inspectingAsset.title}
                  className="max-h-[50vh] w-auto object-contain mx-auto"
                />
              </div>

              {/* Metadata Inspector Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Dimensions</span>
                  <span className="font-mono font-bold text-white">{inspectingAsset.dimensions || '1600x900'}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">File Size / Format</span>
                  <span className="font-mono font-bold text-emerald-400">{inspectingAsset.fileSize || 'WebP'}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="font-bold text-amber-400 capitalize">{inspectingAsset.category || 'National'}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Article Usage</span>
                  <span className="font-bold text-cyan-400">
                    {getAssetUsage(inspectingAsset.url).length} stories linked
                  </span>
                </div>
              </div>

              {/* SEO Alt Text & Caption */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div>
                  <strong className="text-slate-400">Google SEO Alt Text:</strong>{' '}
                  <span className="text-slate-200">{inspectingAsset.altText || 'Missing'}</span>
                </div>
                {inspectingAsset.caption && (
                  <div>
                    <strong className="text-slate-400">Credit / Caption:</strong>{' '}
                    <span className="text-slate-200 italic">{inspectingAsset.caption}</span>
                  </div>
                )}
                <div>
                  <strong className="text-slate-400">Direct CDN Link:</strong>{' '}
                  <code className="text-[11px] text-red-400 font-mono break-all">{inspectingAsset.url}</code>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(inspectingAsset.url, inspectingAsset.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === inspectingAsset.id ? 'Copied URL!' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopySeoImgTag(inspectingAsset)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center space-x-1"
                >
                  <Code2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Copy &lt;img&gt;</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setCroppingAsset(inspectingAsset);
                    setShowCropModal(true);
                    setInspectingAsset(null);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center space-x-1"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWatermarkingAsset(inspectingAsset);
                    setShowWatermarkModal(true);
                    setInspectingAsset(null);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center space-x-1"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Watermark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingAsset(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-1.5 rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE SEO EDIT MODAL */}
      {editingSeoAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Image SEO & Alt Text Editor
                  </h4>
                  <p className="text-xs text-slate-500">
                    Configure complete details for Google Images and search engine ranking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSeoAsset(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeoMetadata} className="space-y-3.5">
              {/* Image Preview & Snippet */}
              <div className="flex gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
                <img
                  src={editingSeoAsset.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                  alt={editAltText || 'Preview'}
                  className="w-24 h-16 object-cover rounded-lg shrink-0 bg-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase block font-mono">
                    {editingSeoAsset.category} • {editingSeoAsset.dimensions || '1920x1080'}
                  </span>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {editSeoTitle || editingSeoAsset.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    URL: {editingSeoAsset.url}
                  </div>
                </div>
              </div>

              {/* 1. Alt Text (Crucial for Google Image SEO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Image Alt Text *</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      Google Ranking Factor
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {editAltText.length} chars (ideal: 30-100 chars)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter accurate and descriptive alt text (e.g. Finance Minister presenting Union Budget in Parliament)..."
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Most critical tag for screen readers and search crawlers.
                </span>
              </div>

              {/* 2. Image Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Image Title Attribute
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gaganyaan Crew Module Ocean Splashdown"
                  value={editSeoTitle}
                  onChange={(e) => setEditSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* 3. Caption / Photo Credit */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Photo Credit / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo: PTI / Special Correspondent"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* 4. Focus Keywords & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Focus Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. space mission, isro, national technology"
                    value={editFocusKeywords}
                    onChange={(e) => setEditFocusKeywords(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    SEO Slug / Clean Filename
                  </label>
                  <input
                    type="text"
                    placeholder="gaganyaan-crew-module"
                    value={editSeoSlug}
                    onChange={(e) => setEditSeoSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* 5. Loading Strategy */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Loading Strategy
                </label>
                <select
                  value={editLoadingStrategy}
                  onChange={(e) => setEditLoadingStrategy(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="lazy">loading="lazy" (Recommended for Core Web Vitals)</option>
                  <option value="eager">loading="eager" (Top Hero Banner only)</option>
                </select>
              </div>

              {/* 6. Folder / Custom Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Assigned Folder / Custom Category
                </label>
                <select
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  <option value="">(Root / Unorganized)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.path}>
                      {f.path}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSeoAsset(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save SEO Metadata</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD NEW ASSET MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-600" />
                <span>Upload Media Asset & Configure Image SEO</span>
              </h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAsset} className="space-y-3.5">
              {/* CORE WEB VITALS AUTO-COMPRESSION PANEL */}
              <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">
                      Core Web Vitals Auto-Compression (WebP Lossless)
                    </span>
                  </div>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={autoCompressOnUpload}
                      onChange={(e) => setAutoCompressOnUpload(e.target.checked)}
                      className="rounded accent-emerald-600 cursor-pointer"
                    />
                    <span>Auto-compress on upload</span>
                  </label>
                </div>

                {autoCompressOnUpload && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60 text-[11px] text-emerald-800">
                    <div>
                      <span className="font-semibold block mb-0.5">Max Width:</span>
                      <select
                        value={uploadMaxWidth}
                        onChange={(e) => setUploadMaxWidth(Number(e.target.value))}
                        className="w-full bg-white border border-emerald-300 rounded-lg px-2 py-1 text-slate-800 font-mono"
                      >
                        <option value={1200}>1200px (Mobile Fast - Highest LCP)</option>
                        <option value={1600}>1600px (Balanced Retina - Recommended)</option>
                        <option value={1920}>1920px (Full HD 1080p)</option>
                      </select>
                    </div>
                    <div>
                      <span className="font-semibold block mb-0.5">WebP Quality: {uploadQuality}%</span>
                      <input
                        type="range"
                        min="60"
                        max="90"
                        value={uploadQuality}
                        onChange={(e) => setUploadQuality(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Status / Loading */}
              {isCompressingUpload && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-2 text-xs text-amber-900 animate-pulse">
                  <Zap className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Compressing and converting image to WebP (Core Web Vitals optimization)...</span>
                </div>
              )}

              {/* Compressed Stats Banner */}
              {uploadStats && (
                <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-xl space-y-1.5 text-xs text-emerald-950 animate-fadeIn">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>⚡ Core Web Vitals Optimized! ({uploadStats.savingsPercent}% reduction)</span>
                    </span>
                    <span className="bg-emerald-600 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {uploadStats.format} FAST
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 pt-1 border-t border-emerald-200">
                    <div>
                      Original Size: <del className="text-slate-500">{uploadStats.originalSizeFormatted}</del> →{' '}
                      <strong className="text-emerald-900">{uploadStats.compressedSizeFormatted}</strong>
                    </div>
                    <div>
                      Dimensions: <strong className="text-emerald-900">{uploadStats.compressedWidth}×{uploadStats.compressedHeight}</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-700 italic">
                    ✓ {uploadStats.coreWebVitalsImpact.message}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Image from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                />
              </div>

              <div className="text-center text-[10px] text-slate-400 font-mono">— OR ENTER IMAGE URL —</div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Image URL *
                  </label>
                  {newUrl && !uploadStats && (
                    <button
                      type="button"
                      onClick={handleOptimizeUrl}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>Compress URL Image to WebP</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cricket Stadium Celebration Event"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newAltText) setNewAltText(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Image Alt Text (Google SEO) *</span>
                  <span className="text-[10px] text-emerald-600 font-bold">SEO REQUIRED</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Descriptive alt text for Google Image Search ranking..."
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo Credit / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo: Staff Reporter / PTI"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="national">National</option>
                    <option value="politics">Politics</option>
                    <option value="sports">Sports</option>
                    <option value="business">Business</option>
                    <option value="tech">Technology</option>
                    <option value="state">States</option>
                    <option value="advertising">Ad Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asset Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="image">News Photo</option>
                    <option value="banner">Ad Banner</option>
                    <option value="infographic">Infographic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Folder / Custom Category
                </label>
                <select
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  <option value="">(Root / Unorganized)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.path}>
                      {f.path}
                    </option>
                  ))}
                </select>
              </div>

              {newUrl && (
                <div className="h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={newUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* IMAGE COMPRESSOR MODAL (WebP Optimized) */}
      {showCompressorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    High-Speed Image Compressor (WebP Lossless Optimizer)
                  </h3>
                  <p className="text-[11px] text-slate-500">Reduce image file size by up to 75% without visual loss</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompressorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* File Input or URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Upload Image from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!compressTitle) {
                      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                      setCompressTitle(cleanName);
                    }
                    setIsProcessingCompressor(true);
                    try {
                      const res = await compressImage(file, {
                        maxWidth: compressMaxWidth,
                        quality: compressQuality / 100,
                        format: 'image/webp',
                      });
                      setActiveCompressResult(res);
                      setCompressUrl(res.dataUrl);
                    } catch (err) {
                      console.error('Compressor error:', err);
                    } finally {
                      setIsProcessingCompressor(false);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
              </div>

              <div className="text-center text-[10px] text-slate-400 font-mono">— OR ENTER IMAGE URL —</div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Infrastructure Project"
                  value={compressTitle}
                  onChange={(e) => setCompressTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Image URL *
                  </label>
                  {compressUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!compressUrl.trim()) return;
                        setIsProcessingCompressor(true);
                        try {
                          const res = await compressImage(compressUrl, {
                            maxWidth: compressMaxWidth,
                            quality: compressQuality / 100,
                            format: 'image/webp',
                          });
                          setActiveCompressResult(res);
                        } catch (err) {
                          setMediaErrorMsg('Error processing image URL.');
                          setTimeout(() => setMediaErrorMsg(null), 4000);
                        } finally {
                          setIsProcessingCompressor(false);
                        }
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>Re-compress</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={compressUrl}
                  onChange={(e) => {
                    setCompressUrl(e.target.value);
                    setActiveCompressResult(null);
                  }}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Max Width
                  </span>
                  <select
                    value={compressMaxWidth}
                    onChange={(e) => setCompressMaxWidth(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  >
                    <option value={1200}>1200px (Mobile Fast)</option>
                    <option value={1600}>1600px (Desktop Balanced)</option>
                    <option value={1920}>1920px (Full HD)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Quality: {compressQuality}%</span>
                    <span className="text-emerald-700 font-mono text-[10px]">WebP</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Processing Loader */}
              {isProcessingCompressor && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 animate-pulse">
                  <Zap className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Compressing canvas rendering to WebP...</span>
                </div>
              )}

              {/* Compression Ratio & Core Web Vitals Preview */}
              {activeCompressResult ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-950 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>WebP compression successful: {activeCompressResult.savingsPercent}% reduction!</span>
                    </span>
                    <span className="bg-emerald-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                      LCP IMPROVED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900 border-t border-emerald-200/80 pt-1.5 font-mono">
                    <div>
                      Size: <del className="text-slate-500">{activeCompressResult.originalSizeFormatted}</del> →{' '}
                      <strong>{activeCompressResult.compressedSizeFormatted}</strong>
                    </div>
                    <div>
                      Dimensions: <strong>{activeCompressResult.compressedWidth}×{activeCompressResult.compressedHeight}</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-800 italic">
                    ✓ {activeCompressResult.coreWebVitalsImpact.message}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-700 font-bold block">Estimated Savings: ~75-90%</span>
                    <span className="text-slate-500 text-[11px]">Original: ~2.4 MB → Compressed: ~220 KB WebP</span>
                  </div>
                  <span className="bg-emerald-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    CORE WEB VITALS
                  </span>
                </div>
              )}

              {compressSuccess && (
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Compressed WebP image successfully added to library!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompressorModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalUrl = activeCompressResult?.dataUrl || compressUrl.trim();
                    if (!finalUrl || !compressTitle.trim()) {
                      setMediaErrorMsg('Please provide an image title and upload a file or enter a URL.');
                      setTimeout(() => setMediaErrorMsg(null), 4000);
                      return;
                    }
                    onAddMedia({
                      title: `${compressTitle.trim()} (WebP Optimized)`,
                      url: finalUrl,
                      altText: compressTitle.trim(),
                      caption: `${compressTitle.trim()} - WebP Core Web Vitals Photo`,
                      category: 'national',
                      type: 'image',
                      loadingStrategy: 'lazy',
                      fileSize: activeCompressResult ? `${activeCompressResult.compressedSizeFormatted} WebP` : `${Math.round(240 * (compressQuality / 75))} KB WebP`,
                      dimensions: activeCompressResult ? `${activeCompressResult.compressedWidth}x${activeCompressResult.compressedHeight}` : `${compressMaxWidth}x900`,
                      uploadedBy: 'Image Compressor',
                    });
                    setCompressSuccess(true);
                    setTimeout(() => {
                      setCompressSuccess(false);
                      setShowCompressorModal(false);
                      setCompressTitle('');
                      setCompressUrl('');
                      setActiveCompressResult(null);
                    }, 1200);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Compress WebP & Save to Library</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL MEDIA VIDEO EMBED HELPER MODAL */}
      {showVideoEmbedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Responsive Video Embed Helper
                  </h3>
                  <p className="text-[11px] text-slate-500">YouTube, Twitter/X, Instagram, and Facebook videos</p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoEmbedModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Video Platform
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'twitter', label: 'X (Twitter)' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'facebook', label: 'Facebook' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEmbedPlatform(p.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        embedPlatform === p.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Video Link / Share URL *
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or x.com/status/..."
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Generated Responsive Embed Code */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Responsive Embed Code (16:9 Mobile & Desktop):
                </label>
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-200 p-3 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-[140px]">
{`<div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 my-4">
  <iframe
    src="${embedUrl || 'https://www.youtube.com/embed/LIVE_ID'}"
    title="Video Player"
    className="w-full h-full border-0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      const tag = `<div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 my-4"><iframe src="${embedUrl || 'https://www.youtube.com/embed/LIVE_ID'}" title="Video Player" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                      navigator.clipboard.writeText(tag);
                      setEmbedCopied(true);
                      setTimeout(() => setEmbedCopied(false), 2500);
                    }}
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    {embedCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{embedCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowVideoEmbedModal(false)}
                  className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL WITH ARTICLE SAFETY SCAN */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Safe Bulk Media Deletion
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review and verify live article usage before permanent deletion
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const selectedAssets = mediaAssets.filter((m) => selectedIds.includes(m.id));
              const inUseItems = selectedAssets
                .map((asset) => ({
                  asset,
                  articles: getAssetUsage(asset.url),
                }))
                .filter((item) => item.articles.length > 0);

              const hasInUse = inUseItems.length > 0;

              return (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    You have selected{' '}
                    <strong className="text-slate-900 font-bold">
                      {selectedIds.length}
                    </strong>{' '}
                    media asset(s) to permanently remove from the newsroom library.
                  </div>

                  {hasInUse ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                            Live Website Impact Warning
                          </h4>
                          <p className="text-xs text-red-700 mt-0.5">
                            <strong>{inUseItems.length}</strong> of the selected images are
                            actively embedded in{' '}
                            <strong>
                              {inUseItems.reduce(
                                (acc, curr) => acc + curr.articles.length,
                                0
                              )}
                            </strong>{' '}
                            published news articles! Deleting them will cause broken image
                            placeholders for portal readers.
                          </p>
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {inUseItems.map(({ asset, articles: usedArticles }) => (
                          <div
                            key={asset.id}
                            className="bg-white p-2.5 rounded-lg border border-red-200 flex items-center space-x-3 text-xs"
                          >
                            <img
                              src={asset.url}
                              alt={asset.title}
                              className="w-12 h-10 object-cover rounded-md shrink-0 bg-slate-100"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 block truncate">
                                {asset.title}
                              </span>
                              <div className="text-[10px] text-red-600 truncate mt-0.5">
                                Used in:{' '}
                                {usedArticles.map((a) => `"${a.title}"`).join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <label className="flex items-start space-x-2.5 cursor-pointer pt-2 border-t border-red-200/80">
                        <input
                          type="checkbox"
                          checked={acknowledgeInUseDeletion}
                          onChange={(e) => setAcknowledgeInUseDeletion(e.target.checked)}
                          className="mt-0.5 rounded accent-red-600 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-red-900">
                          I understand that deleting these files will remove them from live news
                          articles and confirm permanent deletion.
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Safe to delete: None of the {selectedIds.length} selected assets are
                        currently linked to any published news stories.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowBulkDeleteModal(false)}
                      className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={hasInUse && !acknowledgeInUseDeletion}
                      onClick={handleConfirmBulkDelete}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete ({selectedIds.length})</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SINGLE ASSET DELETE CONFIRMATION MODAL */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Delete Media Asset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const usage = getAssetUsage(assetToDelete.url);
              return (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={assetToDelete.url}
                      alt={assetToDelete.title}
                      className="w-14 h-12 object-cover rounded-lg shrink-0 bg-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 text-xs block truncate">
                        {assetToDelete.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {assetToDelete.folder
                          ? `Folder: ${assetToDelete.folder}`
                          : 'Root / Unorganized'}
                      </span>
                    </div>
                  </div>

                  {usage.length > 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-red-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>Warning: Actively Used in {usage.length} Story</span>
                      </div>
                      <p className="text-[11px] text-red-700 line-clamp-2">
                        Used in: {usage.map((a) => `"${a.title}"`).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Are you sure you want to permanently delete this media asset? This action cannot be undone.
                    </p>
                  )}

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAssetToDelete(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSingleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                    >
                      Delete Asset
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* BULK METADATA UPDATE MODAL */}
      {showBulkMetaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bulk Metadata & Organization Editor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Simultaneously update folders, SEO alt text, categories, credits, and performance attributes for {selectedIds.length} assets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkMetaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Assets Summary Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Target Assets:{' '}
                  <strong className="text-slate-900">
                    {selectedIds.length} items selected
                  </strong>
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold">
                  BATCH EDIT
                </span>
              </div>

              {/* 1. Folder / Organization */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-blue-500" />
                  <span>Folder / Custom Category Policy</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaFolder"
                      checked={bulkMetaFolderOption === 'no-change'}
                      onChange={() => setBulkMetaFolderOption('no-change')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Keep existing folder assignments unchanged
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaFolder"
                      checked={bulkMetaFolderOption === 'set'}
                      onChange={() => setBulkMetaFolderOption('set')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Move all selected assets to folder:
                    </span>
                  </label>

                  {bulkMetaFolderOption === 'set' && (
                    <div className="ml-5 pt-1">
                      <select
                        value={bulkMetaTargetFolder}
                        onChange={(e) => setBulkMetaTargetFolder(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500"
                      >
                        {folders.map((f) => (
                          <option key={f.id} value={f.path}>
                            {f.path}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaFolder"
                      checked={bulkMetaFolderOption === 'clear'}
                      onChange={() => setBulkMetaFolderOption('clear')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Clear folder (Move to Unorganized / Root)
                    </span>
                  </label>
                </div>
              </div>

              {/* 2. Editorial Category */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-red-500" />
                  <span>Editorial Category / News Topic</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaCat"
                      checked={bulkMetaCategoryOption === 'no-change'}
                      onChange={() => setBulkMetaCategoryOption('no-change')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">Keep existing categories</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaCat"
                      checked={bulkMetaCategoryOption === 'set'}
                      onChange={() => setBulkMetaCategoryOption('set')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Set all selected assets to category:
                    </span>
                  </label>

                  {bulkMetaCategoryOption === 'set' && (
                    <div className="ml-5 pt-1">
                      <select
                        value={bulkMetaCategoryValue}
                        onChange={(e) => setBulkMetaCategoryValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 capitalize"
                      >
                        {[
                          'national',
                          'politics',
                          'sports',
                          'business',
                          'tech',
                          'state',
                          'advertising',
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Photo Credit & Caption */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-500" />
                  <span>Photo Credit & Caption Policy</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaCap"
                      checked={bulkMetaCaptionOption === 'no-change'}
                      onChange={() => setBulkMetaCaptionOption('no-change')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Keep existing captions and credits
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaCap"
                      checked={bulkMetaCaptionOption === 'replace'}
                      onChange={() => setBulkMetaCaptionOption('replace')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">Replace all captions with:</span>
                  </label>

                  {bulkMetaCaptionOption === 'replace' && (
                    <div className="ml-5 pt-1">
                      <input
                        type="text"
                        placeholder="e.g. फोटो: ब्यूरो रिपोर्ट / खबरी दोस्त न्यूज़ एजेंसी"
                        value={bulkMetaCaptionValue}
                        onChange={(e) => setBulkMetaCaptionValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                  )}

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaCap"
                      checked={bulkMetaCaptionOption === 'append'}
                      onChange={() => setBulkMetaCaptionOption('append')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Append credit to existing captions:
                    </span>
                  </label>

                  {bulkMetaCaptionOption === 'append' && (
                    <div className="ml-5 pt-1">
                      <input
                        type="text"
                        placeholder="e.g. खबरी दोस्त ब्यूरो"
                        value={bulkMetaCaptionValue}
                        onChange={(e) => setBulkMetaCaptionValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Alt Text Policy (Image SEO) */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Image Alt Text Policy (Google Image Search SEO)</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaAlt"
                      checked={bulkMetaAltOption === 'no-change'}
                      onChange={() => setBulkMetaAltOption('no-change')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">Keep existing Alt text</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaAlt"
                      checked={bulkMetaAltOption === 'auto-seo'}
                      onChange={() => setBulkMetaAltOption('auto-seo')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700 font-medium">
                      ⚡ Auto-Generate SEO Alt Text:{' '}
                      <span className="font-mono text-emerald-700">
                        "{`{Title} • {CATEGORY} | Khabri Dost`}"
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaAlt"
                      checked={bulkMetaAltOption === 'replace'}
                      onChange={() => setBulkMetaAltOption('replace')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">Set custom Alt text for all:</span>
                  </label>

                  {bulkMetaAltOption === 'replace' && (
                    <div className="ml-5 pt-1">
                      <input
                        type="text"
                        placeholder="Enter common descriptive alt text..."
                        value={bulkMetaAltValue}
                        onChange={(e) => setBulkMetaAltValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                  )}

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaAlt"
                      checked={bulkMetaAltOption === 'prefix'}
                      onChange={() => setBulkMetaAltOption('prefix')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">
                      Add prefix to existing Alt text:
                    </span>
                  </label>

                  {bulkMetaAltOption === 'prefix' && (
                    <div className="ml-5 pt-1">
                      <input
                        type="text"
                        placeholder="e.g. विशेष रिपोर्ट: "
                        value={bulkMetaAltValue}
                        onChange={(e) => setBulkMetaAltValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Performance & Loading Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Loading Strategy</span>
                  </label>
                  <select
                    value={bulkMetaLoadingOption}
                    onChange={(e) =>
                      setBulkMetaLoadingOption(e.target.value as any)
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
                  >
                    <option value="no-change">Keep Unchanged</option>
                    <option value="lazy">loading="lazy" (Fast Core Web Vitals)</option>
                    <option value="eager">loading="eager" (Top Hero Banners)</option>
                  </select>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Asset Media Type</span>
                  </label>
                  <select
                    value={bulkMetaTypeOption}
                    onChange={(e) => setBulkMetaTypeOption(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
                  >
                    <option value="no-change">Keep Unchanged</option>
                    <option value="image">News Photo</option>
                    <option value="banner">Ad Banner</option>
                    <option value="infographic">Infographic</option>
                  </select>
                </div>
              </div>

              {/* 6. Tags & Keywords */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-600" />
                  <span>Keywords & Tags</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaTag"
                      checked={bulkMetaTagsOption === 'no-change'}
                      onChange={() => setBulkMetaTagsOption('no-change')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">Keep existing keywords</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkMetaTag"
                      checked={bulkMetaTagsOption === 'append'}
                      onChange={() => setBulkMetaTagsOption('append')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700">Append tag/keyword to all:</span>
                  </label>

                  {bulkMetaTagsOption === 'append' && (
                    <div className="ml-5 pt-1">
                      <input
                        type="text"
                        placeholder="e.g. assembly-elections-2026, breaking"
                        value={bulkMetaTagsValue}
                        onChange={(e) => setBulkMetaTagsValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkMetaModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkMetadata}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Batch Updates ({selectedIds.length} Assets)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER CREATION & EDITING MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingFolder ? 'Edit Media Folder' : 'Create New Folder'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Reports or Events"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent Folder (Optional for Hierarchical Nesting)
                </label>
                <select
                  value={folderParentPath}
                  onChange={(e) => setFolderParentPath(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Top-Level Root Folder)</option>
                  {folders
                    .filter(
                      (f) =>
                        !editingFolder ||
                        (f.id !== editingFolder.id &&
                          !f.path.startsWith(editingFolder.path + '/'))
                    )
                    .map((f) => (
                      <option key={f.id} value={f.path}>
                        {f.path}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Select a parent to nest this folder hierarchically (e.g. Hero/Breaking).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Folder Accent Color
                </label>
                <div className="flex items-center space-x-2 pt-1">
                  {[
                    { color: '#dc2626', name: 'Red' },
                    { color: '#f97316', name: 'Orange' },
                    { color: '#d97706', name: 'Amber' },
                    { color: '#059669', name: 'Emerald' },
                    { color: '#2563eb', name: 'Blue' },
                    { color: '#7c3aed', name: 'Purple' },
                    { color: '#475569', name: 'Slate' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setFolderColor(c.color)}
                      className={`w-6 h-6 rounded-full transition cursor-pointer border-2 ${
                        folderColor === c.color
                          ? 'border-slate-900 scale-110 shadow-xs'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief note about assets stored in this folder..."
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingFolder ? 'Save Changes' : 'Create Folder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
