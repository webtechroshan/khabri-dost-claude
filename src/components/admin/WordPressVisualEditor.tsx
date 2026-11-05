import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Play,
  CheckCircle2,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Code2,
  Eye,
  Clock,
  FileText,
  Type,
  ExternalLink,
  X,
  Plus,
} from 'lucide-react';
import { MediaAsset } from '../../types/news';
import { sanitizeArticleHtml } from '../../utils/sanitizeHtml';

export interface WordPressVisualEditorProps {
  value: string;
  onChange: (value: string) => void;
  mediaLibrary?: MediaAsset[];
  placeholder?: string;
  minHeightPx?: number;
  maxHeightPx?: number;
}

/**
 * Converts legacy markdown strings (e.g. **bold**, *italic*, ## H2, etc.) to semantic HTML.
 * Ensures backward compatibility with existing Khabri Dost articles.
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  // If it already looks like HTML (contains closing tags or paragraphs), return as-is
  if (/<(p|h1|h2|h3|h4|div|strong|em|ul|ol|blockquote|table)[\s>]/i.test(markdown)) {
    return markdown;
  }

  const lines = markdown.split(/\r?\n/);
  const htmlBlocks: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const flushList = () => {
    if (!currentList) return;
    const tag = currentList.type;
    const inner = currentList.items.map((it) => `<li>${it}</li>`).join('');
    htmlBlocks.push(`<${tag}>${inner}</${tag}>`);
    currentList = null;
  };

  const processInline = (text: string): string => {
    return text
      // Bold + Italic: ***text*** or ___text___
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Strikethrough: ~~text~~
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Underline: <u>text</u> (preserved)
      // Inline Code: `code`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Markdown link: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        htmlBlocks.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Embed tokens pass through directly
    if (/^\[(youtube|video|tweet|twitter|image|factcheck|callout):/i.test(trimmed)) {
      flushList();
      htmlBlocks.push(`<p>${trimmed}</p>`);
      continue;
    }

    // Empty lines separate blocks
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      flushList();
      htmlBlocks.push(`<h4>${processInline(trimmed.replace(/^####\s*/, ''))}</h4>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      htmlBlocks.push(`<h3>${processInline(trimmed.replace(/^###\s*/, ''))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      htmlBlocks.push(`<h2>${processInline(trimmed.replace(/^##\s*/, ''))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      htmlBlocks.push(`<h1>${processInline(trimmed.replace(/^#\s*/, ''))}</h1>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      htmlBlocks.push(`<blockquote><p>${processInline(trimmed.replace(/^>\s*/, ''))}</p></blockquote>`);
      continue;
    }

    // Horizontal rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushList();
      htmlBlocks.push('<hr />');
      continue;
    }

    // Unordered list (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const itemText = processInline(trimmed.replace(/^[-*]\s+/, ''));
      if (currentList && currentList.type === 'ul') {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { type: 'ul', items: [itemText] };
      }
      continue;
    }

    // Ordered list (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = processInline(trimmed.replace(/^\d+\.\s+/, ''));
      if (currentList && currentList.type === 'ol') {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { type: 'ol', items: [itemText] };
      }
      continue;
    }

    // Standard paragraph
    flushList();
    htmlBlocks.push(`<p>${processInline(rawLine)}</p>`);
  }

  flushList();
  if (inCodeBlock && codeBuffer.length > 0) {
    htmlBlocks.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
  }

  return htmlBlocks.join('\n');
}

/**
 * Cleans and sanitizes editable HTML before emitting or storing.
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return '';
  return html
    // Remove extra trailing breaks
    .replace(/(<br\s*\/?>\s*)+$/i, '')
    // Normalize empty paragraphs
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '<p><br></p>')
    .trim();
}

export const WordPressVisualEditor: React.FC<WordPressVisualEditorProps> = ({
  value,
  onChange,
  mediaLibrary = [],
  placeholder = 'Write or paste your article content here...',
  minHeightPx = 320,
  maxHeightPx = 620,
}) => {
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [htmlContent, setHtmlContent] = useState<string>(() => convertMarkdownToHtml(value || ''));
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);

  // Modals & Popovers
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageCredit, setImageCredit] = useState('');

  const [showEmbedModal, setShowEmbedModal] = useState<'youtube' | 'tweet' | 'factcheck' | 'callout' | null>(null);
  const [embedParam1, setEmbedParam1] = useState('');
  const [embedParam2, setEmbedParam2] = useState('');
  const [embedParam3, setEmbedParam3] = useState('');

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activeFormat, setActiveFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    ul: false,
    ol: false,
    blockquote: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });

  // Track selection state to restore after modal dialogs
  const savedSelectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (typeof window === 'undefined' || !savedSelectionRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // Sync external changes to internal state when value changes outside
  useEffect(() => {
    const converted = convertMarkdownToHtml(value || '');
    if (converted !== htmlContent) {
      setHtmlContent(converted);
      if (editorMode === 'visual' && visualEditorRef.current) {
        // Only update if innerHTML actually differs to avoid resetting user's cursor
        if (visualEditorRef.current.innerHTML !== converted) {
          visualEditorRef.current.innerHTML = sanitizeArticleHtml(converted);
        }
      }
    }
  }, [value]);

  // Initial populate of visual editor
  useEffect(() => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== htmlContent) {
        visualEditorRef.current.innerHTML = sanitizeArticleHtml(htmlContent) || '<p><br></p>';
      }
    }
  }, [editorMode]);

  // Query formatting states on caret movement
  const checkActiveFormats = useCallback(() => {
    if (typeof document === 'undefined' || editorMode !== 'visual') return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrike = document.queryCommandState('strikeThrough');
      const isUl = document.queryCommandState('insertUnorderedList');
      const isOl = document.queryCommandState('insertOrderedList');
      const isLeft = document.queryCommandState('justifyLeft');
      const isCenter = document.queryCommandState('justifyCenter');
      const isRight = document.queryCommandState('justifyRight');
      const isJustify = document.queryCommandState('justifyFull');

      const blockVal = (document.queryCommandValue('formatBlock') || '').toLowerCase();

      setActiveFormat({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strike: isStrike,
        h1: blockVal.includes('h1'),
        h2: blockVal.includes('h2'),
        h3: blockVal.includes('h3'),
        h4: blockVal.includes('h4'),
        ul: isUl,
        ol: isOl,
        blockquote: blockVal.includes('blockquote'),
        alignLeft: isLeft,
        alignCenter: isCenter,
        alignRight: isRight,
        alignJustify: isJustify,
      });
    } catch {
      // Ignore queryCommand errors
    }
  }, [editorMode]);

  // Execute formatting command in Visual Mode
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorMode !== 'visual') return;
    visualEditorRef.current?.focus();
    try {
      document.execCommand(command, false, value);
    } catch (e) {
      console.warn('execCommand error:', e);
    }
    handleVisualInput();
    checkActiveFormats();
  };

  // Sync from Visual editor div to state and parent
  const handleVisualInput = () => {
    if (!visualEditorRef.current) return;
    const currentHtml = cleanHtmlContent(visualEditorRef.current.innerHTML);
    setHtmlContent(currentHtml);
    onChange(currentHtml);
    checkActiveFormats();
  };

  // Switch between Visual and Code mode
  const handleModeSwitch = (newMode: 'visual' | 'code') => {
    if (newMode === editorMode) return;
    if (newMode === 'code') {
      // Moving Visual -> Code
      if (visualEditorRef.current) {
        const cleaned = cleanHtmlContent(visualEditorRef.current.innerHTML);
        setHtmlContent(cleaned);
        onChange(cleaned);
      }
    } else {
      // Moving Code -> Visual
      const converted = convertMarkdownToHtml(htmlContent);
      setHtmlContent(converted);
      onChange(converted);
      setTimeout(() => {
        if (visualEditorRef.current) {
          visualEditorRef.current.innerHTML = sanitizeArticleHtml(converted) || '<p><br></p>';
        }
      }, 10);
    }
    setEditorMode(newMode);
  };

  // Insert custom HTML fragment or token at current cursor
  const insertHtmlAtCursor = (htmlSnippet: string) => {
    if (editorMode === 'visual') {
      visualEditorRef.current?.focus();
      restoreSelection();
      try {
        document.execCommand('insertHTML', false, htmlSnippet);
      } catch {
        // Fallback for browsers with strict execCommand
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const el = document.createElement('div');
          el.innerHTML = sanitizeArticleHtml(htmlSnippet);
          const frag = document.createDocumentFragment();
          let node: Node | null;
          let lastNode: Node | null = null;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
      handleVisualInput();
    } else {
      // Code mode insertion into textarea
      const textarea = codeEditorRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = htmlContent.substring(0, start);
      const after = htmlContent.substring(end);
      const updated = before + htmlSnippet + after;
      setHtmlContent(updated);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + htmlSnippet.length, start + htmlSnippet.length);
      }, 10);
    }
  };

  // Format block helper (Heading 1-4, Paragraph, Blockquote)
  const applyBlockFormat = (tag: string) => {
    if (editorMode !== 'visual') {
      insertHtmlAtCursor(`\n<${tag}></${tag}>\n`);
      return;
    }
    visualEditorRef.current?.focus();
    const currentBlock = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    if (currentBlock.includes(tag.toLowerCase())) {
      // Toggle back to normal paragraph
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
    handleVisualInput();
  };

  // Link insertion handler
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';
    setLinkText(selectedText);
    setLinkUrl('https://');
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl || linkUrl.trim() === 'https://' || !linkUrl.trim()) {
      setShowLinkModal(false);
      return;
    }
    const cleanUrl = linkUrl.trim();
    const targetAttr = linkOpenNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const displayText = linkText.trim() || cleanUrl;

    if (editorMode === 'visual') {
      restoreSelection();
      const linkHtml = `<a href="${cleanUrl}"${targetAttr} class="text-red-600 hover:text-red-700 underline font-medium">${displayText}</a>`;
      insertHtmlAtCursor(linkHtml);
    } else {
      insertHtmlAtCursor(`<a href="${cleanUrl}"${targetAttr}>${displayText}</a>`);
    }
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleRemoveLink = () => {
    if (editorMode === 'visual') {
      execCmd('unlink');
    }
  };

  // Image insertion handler
  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      setShowImageModal(false);
      return;
    }
    const cleanUrl = imageUrl.trim();
    const cleanCap = imageCaption.trim();
    const cleanCredit = imageCredit.trim();

    // Standardized Khabri Dost semantic figure
    const imageHtml = `
<figure class="my-6 space-y-1.5 not-prose">
  <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
    <img src="${cleanUrl}" alt="${cleanCap || 'Article illustration'}" class="w-full max-h-[500px] object-cover" loading="lazy" />
  </div>
  ${
    cleanCap || cleanCredit
      ? `<figcaption class="text-xs text-slate-500 flex items-center justify-between px-1 font-sans">
          <span>${cleanCap}</span>
          ${cleanCredit ? `<span class="text-slate-400 font-semibold">${cleanCredit}</span>` : ''}
        </figcaption>`
      : ''
  }
</figure><p><br></p>`;

    insertHtmlAtCursor(imageHtml);
    setShowImageModal(false);
    setImageUrl('');
    setImageCaption('');
    setImageCredit('');
  };

  // Table insertion helper
  const handleInsertTable = (rows: number = 3, cols: number = 3) => {
    let tableHtml = '<table class="w-full border-collapse my-4 text-sm border border-slate-300"><thead><tr class="bg-slate-100">';
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th class="border border-slate-300 p-2 font-bold text-left">Header ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td class="border border-slate-300 p-2">Data ${r + 1},${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    insertHtmlAtCursor(tableHtml);
  };

  // Embed insertion helper (YouTube, Twitter, Fact Check, Callout)
  const handleApplyEmbed = () => {
    if (!showEmbedModal) return;
    let snippet = '';

    if (showEmbedModal === 'youtube') {
      const vid = embedParam1.trim();
      if (vid) snippet = `\n<p>[youtube:${vid}]</p>\n<p><br></p>`;
    } else if (showEmbedModal === 'tweet') {
      const url = embedParam1.trim() || 'https://x.com';
      const author = embedParam2.trim() || '@KhabriDost';
      const text = embedParam3.trim() || '';
      snippet = `\n<p>[tweet:${url}|${author}|${text}]</p>\n<p><br></p>`;
    } else if (showEmbedModal === 'factcheck') {
      const claim = embedParam1.trim() || 'दावा';
      const verdict = embedParam2.trim() || 'सच / तथ्य';
      const detail = embedParam3.trim() || '';
      snippet = `\n<p>[factcheck:${claim}|${verdict}|${detail}]</p>\n<p><br></p>`;
    } else if (showEmbedModal === 'callout') {
      const text = embedParam1.trim();
      if (text) snippet = `\n<p>[callout:${text}]</p>\n<p><br></p>`;
    }

    if (snippet) insertHtmlAtCursor(snippet);

    setShowEmbedModal(null);
    setEmbedParam1('');
    setEmbedParam2('');
    setEmbedParam3('');
  };

  // Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K, Ctrl+Z, Ctrl+Y)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        execCmd('bold');
      } else if (key === 'i') {
        e.preventDefault();
        execCmd('italic');
      } else if (key === 'u') {
        e.preventDefault();
        execCmd('underline');
      } else if (key === 'k') {
        e.preventDefault();
        handleOpenLinkModal();
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        execCmd('undo');
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        execCmd('redo');
      }
    }
  };

  // Text Statistics Calculation
  const stats = React.useMemo(() => {
    // Strip HTML tags for clean text analysis
    const cleanText = htmlContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\[(youtube|video|tweet|twitter|image|factcheck|callout):[^\]]+\]/gi, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanText.length;
    // Count Devanagari characters (Unicode block U+0900 to U+097F)
    const hindiChars = (cleanText.match(/[\u0900-\u097F]/g) || []).length;
    const readMinutes = Math.max(1, Math.ceil(words / 180));

    return { words, chars, hindiChars, readMinutes };
  }, [htmlContent]);

  return (
    <div className="wordpress-visual-editor w-full border border-slate-300 rounded-xl bg-white shadow-2xs overflow-hidden flex flex-col font-sans transition-all">
      {/* 1. TOP HEADER: MODE TABS (VISUAL vs CODE) & TITLE */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span>Editor</span>
          </span>

          {/* WordPress Mode Switcher Buttons */}
          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300">
            <button
              type="button"
              onClick={() => handleModeSwitch('visual')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                editorMode === 'visual'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visual WYSIWYG Mode (What you see is what you get)"
            >
              <Eye className="w-3 h-3 text-red-600" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('code')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                editorMode === 'code'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="HTML Source Code Mode"
            >
              <Code2 className="w-3 h-3 text-amber-400" />
              <span>Code (HTML)</span>
            </button>
          </div>
        </div>

        {/* Quick Hindi Helper & Media Library Shortcut */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => insertHtmlAtCursor('। ')}
            className="px-2 py-1 bg-white hover:bg-red-50 text-red-700 border border-slate-300 rounded text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Insert Hindi Purna Viram (।)"
          >
            पूर्ण विराम (।)
          </button>
          <button
            type="button"
            onClick={() => setShowMediaPicker(!showMediaPicker)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer border ${
              showMediaPicker
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="Browse Media Library"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Media</span>
          </button>
        </div>
      </div>

      {/* 2. MEDIA PICKER DRAWER */}
      {showMediaPicker && (
        <div className="p-3 bg-blue-50/50 border-b border-blue-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Select an image to insert into article:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMediaPicker(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {mediaLibrary && mediaLibrary.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
              {mediaLibrary.slice(0, 16).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const figureHtml = `
<figure class="my-6 space-y-1.5 not-prose">
  <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
    <img src="${item.url}" alt="${item.caption || item.title || 'Article image'}" class="w-full max-h-[500px] object-cover" loading="lazy" />
  </div>
  ${
    item.caption || item.title
      ? `<figcaption class="text-xs text-slate-500 flex items-center justify-between px-1 font-sans">
          <span>${item.caption || item.title}</span>
        </figcaption>`
      : ''
  }
</figure><p><br></p>`;
                    insertHtmlAtCursor(figureHtml);
                    setShowMediaPicker(false);
                  }}
                  className="group relative cursor-pointer rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition aspect-video bg-slate-100 shadow-2xs"
                  title={item.caption || item.title || 'Click to insert'}
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white text-center p-1 transition">
                    + Insert
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No media assets in library. Use "Insert Image by URL" below.</p>
          )}
        </div>
      )}

      {/* 3. TOOLBAR (VISIBLE IN VISUAL MODE) */}
      {editorMode === 'visual' && (
        <div className="p-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-700">
          {/* History Undo / Redo */}
          <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Heading Dropdown / Buttons */}
          <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => applyBlockFormat('p')}
              className="px-2 py-1 text-xs font-semibold rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Normal Paragraph (<p>)"
            >
              ¶ Paragraph
            </button>
            <button
              type="button"
              onClick={() => applyBlockFormat('h2')}
              className={`px-2 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center space-x-0.5 ${
                activeFormat.h2
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Heading 2 (## Section Title)"
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span>H2</span>
            </button>
            <button
              type="button"
              onClick={() => applyBlockFormat('h3')}
              className={`px-2 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center space-x-0.5 ${
                activeFormat.h3
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Heading 3 (### Sub-section)"
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>H3</span>
            </button>
            <button
              type="button"
              onClick={() => applyBlockFormat('h4')}
              className={`px-2 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center space-x-0.5 ${
                activeFormat.h4
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Heading 4 (Minor Subhead)"
            >
              <Heading4 className="w-3.5 h-3.5" />
              <span>H4</span>
            </button>
          </div>

          {/* Text Formatting: Bold, Italic, Underline, Strike */}
          <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.bold
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Bold (Ctrl+B) — Makes text truly bold visually"
            >
              <Bold className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.italic
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Italic (Ctrl+I) — Makes text italic visually"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.underline
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.strike
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="hidden sm:flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => execCmd('justifyLeft')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.alignLeft ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyCenter')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.alignCenter ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyRight')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.alignRight ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyFull')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.alignJustify ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Justify"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.ul ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Bullet List (<ul>)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.ol ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Numbered List (<ol>)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyBlockFormat('blockquote')}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeFormat.blockquote ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Blockquote (<blockquote>)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertHorizontalRule')}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Horizontal Divider Line (<hr>)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Links & Tables & Image */}
          <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Insert Link (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemoveLink}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              title="Remove Link"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Insert Image by URL"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertTable(3, 3)}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Insert Table (3x3)"
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>

          {/* Newsroom Embeds */}
          <div className="flex items-center space-x-1 ml-auto">
            <button
              type="button"
              onClick={() => {
                setShowEmbedModal('youtube');
                setEmbedParam1('');
              }}
              className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
              title="Embed YouTube Video"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">YouTube</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmbedModal('tweet');
                setEmbedParam1('');
                setEmbedParam2('@KhabriDost');
                setEmbedParam3('');
              }}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
              title="Embed Twitter / X Post"
            >
              <span className="font-bold">𝕏</span>
              <span className="hidden sm:inline">Post</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmbedModal('factcheck');
                setEmbedParam1('');
                setEmbedParam2('');
                setEmbedParam3('');
              }}
              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
              title="Insert Fact Check Box"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline">Fact Check</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmbedModal('callout');
                setEmbedParam1('');
              }}
              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
              title="Insert Highlight Callout Box"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Callout</span>
            </button>
          </div>
        </div>
      )}

      {/* CODE MODE QUICK TAG TOOLBAR */}
      {editorMode === 'code' && (
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono text-[11px] mr-1">HTML Quick Tags:</span>
          {['<p>', '</p>', '<strong>', '</strong>', '<em>', '</em>', '<h2>', '</h2>', '<h3>', '</h3>', '<blockquote>', '</blockquote>', '<ul>', '<li>', '</li>', '<hr />'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertHtmlAtCursor(tag)}
              className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 font-mono text-[11px] border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 4. MAIN EDITING CANVAS */}
      <div className="relative flex-1 w-full bg-white">
        {editorMode === 'visual' ? (
          <div
            ref={visualEditorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleVisualInput}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            onKeyDown={handleKeyDown}
            style={{
              minHeight: `${minHeightPx}px`,
              maxHeight: `${maxHeightPx}px`,
              fontFamily: "var(--font-admin-editor, var(--font-noto-devanagari, 'Noto Sans Devanagari', 'Noto Sans', sans-serif))",
            }}
            className="w-full p-4 sm:p-5 overflow-y-auto focus:outline-none text-base text-slate-900 leading-relaxed visual-wysiwyg-content prose max-w-none [overflow-wrap:anywhere] [word-break:normal]"
          />
        ) : (
          <textarea
            ref={codeEditorRef}
            rows={14}
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Edit raw HTML source code here..."
            style={{
              minHeight: `${minHeightPx}px`,
              maxHeight: `${maxHeightPx}px`,
            }}
            className="w-full p-4 sm:p-5 bg-slate-50 text-slate-900 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y border-0 selection:bg-red-100 selection:text-red-900"
          />
        )}
      </div>

      {/* 5. FOOTER STATUS BAR WITH WORD COUNT & METRICS */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-sans">
        <div className="flex items-center space-x-3 sm:space-x-5 flex-wrap">
          <span>
            Words: <strong className="text-slate-800 font-semibold">{stats.words}</strong>
          </span>
          <span>
            Characters: <strong className="text-slate-800 font-semibold">{stats.chars}</strong>
          </span>
          {stats.hindiChars > 0 && (
            <span className="hidden sm:inline">
              Devanagari: <strong className="text-red-700 font-semibold">{stats.hindiChars}</strong>
            </span>
          )}
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Read Time: <strong className="text-slate-800 font-semibold">{stats.readMinutes} min</strong>
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="hidden md:inline">Shortcuts: Ctrl+B Bold • Ctrl+I Italic • Ctrl+K Link</span>
          <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
            {editorMode === 'visual' ? 'Visual Mode' : 'HTML Mode'}
          </span>
        </div>
      </div>

      {/* MODAL: INSERT LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-red-600" />
                <span>Insert Hyperlink</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Link Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Selected or anchor text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkOpenNewTab}
                  onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-slate-700 font-medium">Open link in a new tab (target="_blank")</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSERT IMAGE BY URL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Insert Article Image</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL *</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image Caption</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="घटनास्थल का दृश्य / फोटो विवरण"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Credit</label>
                <input
                  type="text"
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  placeholder="ANI / PTI / सोशल मीडिया"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMBEDS (YouTube, Twitter/X, Fact Check, Callout) */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {showEmbedModal === 'youtube' && <Play className="w-4 h-4 text-red-600 fill-current" />}
                {showEmbedModal === 'tweet' && <span className="font-bold text-slate-900">𝕏</span>}
                {showEmbedModal === 'factcheck' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {showEmbedModal === 'callout' && <Sparkles className="w-4 h-4 text-amber-500" />}
                <span>
                  {showEmbedModal === 'youtube' && 'Embed YouTube Video'}
                  {showEmbedModal === 'tweet' && 'Embed Twitter / X Post'}
                  {showEmbedModal === 'factcheck' && 'Create Fact Check Box'}
                  {showEmbedModal === 'callout' && 'Create Highlight Callout Box'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEmbedModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {showEmbedModal === 'youtube' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">YouTube URL or Video ID *</label>
                  <input
                    type="text"
                    value={embedParam1}
                    onChange={(e) => setEmbedParam1(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Embeds a responsive 16:9 YouTube video player inside the article body.</p>
                </div>
              )}

              {showEmbedModal === 'tweet' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tweet / Post URL *</label>
                    <input
                      type="text"
                      value={embedParam1}
                      onChange={(e) => setEmbedParam1(e.target.value)}
                      placeholder="https://x.com/username/status/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Author Handle</label>
                    <input
                      type="text"
                      value={embedParam2}
                      onChange={(e) => setEmbedParam2(e.target.value)}
                      placeholder="@OfficialHandle"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Post Text / Content</label>
                    <textarea
                      rows={3}
                      value={embedParam3}
                      onChange={(e) => setEmbedParam3(e.target.value)}
                      placeholder="Quote or description of the post..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {showEmbedModal === 'factcheck' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">दावा (Claim) *</label>
                    <input
                      type="text"
                      value={embedParam1}
                      onChange={(e) => setEmbedParam1(e.target.value)}
                      placeholder="सोशल मीडिया पर किया जा रहा दावा..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">सच्चाई / फैसला (Verdict) *</label>
                    <input
                      type="text"
                      value={embedParam2}
                      onChange={(e) => setEmbedParam2(e.target.value)}
                      placeholder="जांच में यह दावा पूरी तरह भ्रामक निकला..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">तथ्यपरक विवरण (Explanation)</label>
                    <textarea
                      rows={2}
                      value={embedParam3}
                      onChange={(e) => setEmbedParam3(e.target.value)}
                      placeholder="पड़ताल के दौरान सामने आए तथ्य..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {showEmbedModal === 'callout' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">मुख्य बिंदु / संदेश (Callout Text) *</label>
                  <textarea
                    rows={4}
                    value={embedParam1}
                    onChange={(e) => setEmbedParam1(e.target.value)}
                    placeholder="ध्यान देने योग्य महत्वपूर्ण जानकारी..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmbedModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyEmbed}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Insert Embed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
