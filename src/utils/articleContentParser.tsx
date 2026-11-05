import React from 'react';
import {
  Play,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Quote,
  Camera,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { sanitizeArticleHtml } from './sanitizeHtml';

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();
  // Pure 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  // Standard or shortened URL
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = clean.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Renders a single parsed paragraph or rich embed item
 */
export function renderArticleBlock(
  text: string,
  key: React.Key,
  fontSizeClass?: string
): React.ReactNode {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. YOUTUBE VIDEO EMBED: [youtube:URL_OR_ID] or [video:URL_OR_ID]
  const youtubeTagMatch = trimmed.match(/^\[(?:youtube|video):([^\]]+)\]$/i);
  if (youtubeTagMatch) {
    const videoId = extractYouTubeId(youtubeTagMatch[1]);
    if (videoId) {
      return (
        <div key={key} className="my-6 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 font-kd-headline">
                <Play className="w-3.5 h-3.5 text-red-600 fill-current" />
                <span>Video Report • YouTube Embed</span>
              </span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-red-700 flex items-center space-x-1 text-[11px] transition"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative aspect-[16/9] w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  // Standalone YouTube URL
  if (
    trimmed.startsWith('https://www.youtube.com/watch') ||
    trimmed.startsWith('https://youtu.be/')
  ) {
    const videoId = extractYouTubeId(trimmed);
    if (videoId) {
      return (
        <div key={key} className="my-6 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 font-kd-headline">
                <Play className="w-3.5 h-3.5 text-red-600 fill-current" />
                <span>Video Report</span>
              </span>
            </div>
          </div>
          <div className="relative aspect-[16/9] w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  // 2. TWITTER / X POST EMBED: [tweet:URL|Author|Text] or [tweet:URL] or [twitter:URL]
  const tweetTagMatch = trimmed.match(/^\[(?:tweet|twitter):([^\]]+)\]$/i);
  if (tweetTagMatch) {
    const parts = tweetTagMatch[1].split('|').map((s) => s.trim());
    const tweetUrl = parts[0] || 'https://x.com';
    const authorHandle = parts[1] || '@KhabriDost';
    const tweetText = parts[2] || parts[0];

    return (
      <div
        key={key}
        className="my-5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm max-w-xl mx-auto hover:border-slate-300 transition min-w-0"
      >
        <div className="flex items-center justify-between mb-3 min-w-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="font-bold text-slate-900 text-sm truncate">{authorHandle}</span>
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] font-bold shrink-0">
                  ✓
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Official Post via X</span>
            </div>
          </div>
          <svg className="w-5 h-5 fill-slate-900 shrink-0 ml-2" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <p
          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
          className="text-slate-800 text-sm sm:text-base leading-relaxed mb-3 font-kd-body [overflow-wrap:anywhere] [word-break:normal] min-w-0"
        >
          {tweetText}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-mono text-slate-400">Social Media Embed</span>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sky-600 hover:text-sky-700 font-semibold text-xs"
          >
            <span>View post on X</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // 3. INLINE IMAGE WITH CAPTION: [image:URL|Caption|Alt] or ![Alt](URL)
  const imageTagMatch = trimmed.match(/^\[image:([^\]]+)\]$/i);
  if (imageTagMatch) {
    const parts = imageTagMatch[1].split('|').map((s) => s.trim());
    const imageUrl = parts[0]?.trim();
    const caption = parts[1] || '';
    const credit = parts[2] || '';

    if (!imageUrl) return null;

    return (
      <figure key={key} className="my-6 space-y-1.5 min-w-0 max-w-full">
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 max-w-full">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
            alt={caption || 'Article image'}
            className="w-full max-h-[500px] object-cover hover:scale-[1.01] transition duration-300"
            loading="lazy"
          />
        </div>
        {(caption || credit) && (
          <figcaption className="text-xs text-slate-500 flex items-center justify-between px-1 font-kd-meta min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
            <span className="flex items-center space-x-1.5 min-w-0 flex-1">
              <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="[overflow-wrap:anywhere] [word-break:normal]">{caption}</span>
            </span>
            {credit && <span className="text-slate-400 font-semibold shrink-0 ml-2">{credit}</span>}
          </figcaption>
        )}
      </figure>
    );
  }

  // Markdown image syntax: ![Caption](URL)
  const mdImageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (mdImageMatch) {
    const caption = mdImageMatch[1];
    const imageUrl = mdImageMatch[2]?.trim();
    if (!imageUrl) return null;

    return (
      <figure key={key} className="my-6 space-y-1.5 min-w-0 max-w-full">
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 max-w-full">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
            alt={caption || 'Article illustration'}
            className="w-full max-h-[500px] object-cover"
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption className="text-xs text-slate-500 flex items-center space-x-1.5 px-1 font-kd-meta min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
            <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="[overflow-wrap:anywhere] [word-break:normal]">{caption}</span>
          </figcaption>
        )}
      </figure>
    );
  }

  // 4. FACT-CHECK BOX: [factcheck:CLAIM | VERDICT | EXPLANATION]
  const factCheckMatch = trimmed.match(/^\[factcheck:([^\]]+)\]$/i);
  if (factCheckMatch) {
    const parts = factCheckMatch[1].split('|').map((s) => s.trim());
    const claim = parts[0] || 'दावा';
    const verdict = parts[1] || 'तथ्य';
    const detail = parts[2] || '';

    return (
      <div
        key={key}
        className="my-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-5 shadow-sm font-kd-body min-w-0 max-w-full"
      >
        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-2 font-kd-headline min-w-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="uppercase tracking-wider">Fact Check • तथ्य जांच</span>
          <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0">
            VERIFIED
          </span>
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
          <p className="text-slate-900 min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
            <strong className="text-red-700">दावा (Claim):</strong> {claim}
          </p>
          <p className="text-slate-900 min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
            <strong className="text-emerald-700">सच्चाई (Verdict):</strong> {verdict}
          </p>
          {detail && (
            <p className="text-slate-600 pt-1 text-xs min-w-0 [overflow-wrap:anywhere] [word-break:normal]">
              {detail}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 5. CALLOUT / HIGHLIGHT BOX: [callout:TEXT]
  const calloutMatch = trimmed.match(/^\[callout:([^\]]+)\]$/i);
  if (calloutMatch) {
    return (
      <div
        key={key}
        className="my-5 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-l-4 border-amber-500 text-amber-950 shadow-xs flex items-start space-x-3 min-w-0 max-w-full"
      >
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div
          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
          className="text-xs sm:text-sm font-medium leading-relaxed font-kd-body min-w-0 flex-1 [overflow-wrap:anywhere] [word-break:normal]"
        >
          {calloutMatch[1]}
        </div>
      </div>
    );
  }

  // 6. HEADINGS: ## H2 and ### H3
  if (trimmed.startsWith('## ')) {
    return (
      <h2
        key={key}
        style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
        className="text-xl sm:text-2xl font-bold font-kd-headline text-slate-900 mt-7 mb-3 border-l-4 border-red-600 pl-3.5 leading-snug min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
      >
        {trimmed.replace(/^##\s*/, '')}
      </h2>
    );
  }

  if (trimmed.startsWith('### ')) {
    return (
      <h3
        key={key}
        style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
        className="text-lg sm:text-xl font-bold font-kd-headline text-slate-900 mt-6 mb-2 border-l-4 border-slate-700 pl-3 leading-snug min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
      >
        {trimmed.replace(/^###\s*/, '')}
      </h3>
    );
  }

  // 7. BLOCKQUOTE: > quote
  if (trimmed.startsWith('> ')) {
    const quoteText = trimmed.replace(/^>\s*/, '');
    return (
      <blockquote
        key={key}
        style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
        className="border-l-4 border-red-600 pl-4 py-2.5 my-4 italic text-slate-800 bg-red-50/60 rounded-r-2xl font-medium text-sm sm:text-base leading-relaxed min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
      >
        <Quote className="w-4 h-4 text-red-500 inline mr-1 opacity-70 -mt-1 shrink-0" />
        <span className="[overflow-wrap:anywhere] [word-break:normal]">{quoteText}</span>
      </blockquote>
    );
  }

  // 8. CODE BLOCK: ```code```
  if (trimmed.startsWith('```')) {
    const codeContent = trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    return (
      <div key={key} className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 text-slate-800 max-w-full min-w-0">
        <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto max-w-full whitespace-pre">
          <code>{codeContent}</code>
        </pre>
      </div>
    );
  }

  // 9. BULLET LIST: - item
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const items = text.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    return (
      <ul key={key} className="space-y-1.5 my-3 pl-2 text-sm sm:text-base text-slate-800 min-w-0 max-w-full">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start space-x-2 min-w-0 max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-2"></span>
            <span
              style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
              className="[overflow-wrap:anywhere] [word-break:normal] min-w-0 flex-1"
            >
              {it.replace(/^[-*]\s*/, '')}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // 10. SEMANTIC HTML BLOCKS (from WordPress-style editor)
  const isHtml = /<(p|h1|h2|h3|h4|blockquote|ul|ol|table|figure|div|hr|strong|em|a|img)[\s>]/i.test(trimmed);
  if (isHtml) {
    // If block is an HTML heading
    if (/^<h2[\s>]/i.test(trimmed)) {
      const cleanInner = trimmed.replace(/<\/?h2[^>]*>/gi, '');
      return (
        <h2
          key={key}
          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
          className="text-xl sm:text-2xl font-bold font-kd-headline text-slate-900 mt-7 mb-3 border-l-4 border-red-600 pl-3.5 leading-snug min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
          dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(cleanInner) }}
        />
      );
    }
    if (/^<h3[\s>]/i.test(trimmed)) {
      const cleanInner = trimmed.replace(/<\/?h3[^>]*>/gi, '');
      return (
        <h3
          key={key}
          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
          className="text-lg sm:text-xl font-bold font-kd-headline text-slate-900 mt-6 mb-2 border-l-4 border-slate-700 pl-3 leading-snug min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
          dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(cleanInner) }}
        />
      );
    }
    if (/^<h4[\s>]/i.test(trimmed)) {
      const cleanInner = trimmed.replace(/<\/?h4[^>]*>/gi, '');
      return (
        <h4
          key={key}
          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
          className="text-base sm:text-lg font-bold font-kd-headline text-slate-900 mt-5 mb-2 leading-snug min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
          dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(cleanInner) }}
        />
      );
    }
    if (/^<blockquote[\s>]/i.test(trimmed)) {
      const cleanInner = trimmed.replace(/<\/?blockquote[^>]*>/gi, '');
      return (
        <blockquote
          key={key}
          style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
          className="border-l-4 border-red-600 pl-4 py-2.5 my-4 italic text-slate-800 bg-red-50/60 rounded-r-2xl font-medium text-sm sm:text-base leading-relaxed min-w-0 [overflow-wrap:anywhere] [word-break:normal]"
          dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(cleanInner) }}
        />
      );
    }
    if (/^<table[\s>]/i.test(trimmed)) {
      return (
        <div key={key} className="overflow-x-auto my-5 rounded-xl border border-slate-200">
          <div
            className="editorial-table-container text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(trimmed) }}
          />
        </div>
      );
    }
    if (/^<hr[\s>\/]/i.test(trimmed)) {
      return <hr key={key} className="my-6 border-slate-200" />;
    }

    // Default HTML paragraph / figure / block
    return (
      <div
        key={key}
        style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
        className={`leading-relaxed [overflow-wrap:anywhere] [word-break:normal] min-w-0 max-w-full text-slate-800 ${fontSizeClass || ''}`}
        dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(trimmed) }}
      />
    );
  }

  // 11. LEGACY MARKDOWN PARAGRAPH WITH BOLD/ITALIC/LINKS
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\)|\`.*?\`)/g);
  return (
    <p
      key={key}
      style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
      className={`leading-relaxed text-justify [overflow-wrap:anywhere] [word-break:normal] min-w-0 max-w-full ${fontSizeClass || ''}`}
    >
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-slate-950 [overflow-wrap:anywhere] [word-break:normal]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={i} className="italic text-slate-800 [overflow-wrap:anywhere] [word-break:normal]">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[0.9em] border border-slate-200 [overflow-wrap:anywhere] [word-break:normal]">
              {part.slice(1, -1)}
            </code>
          );
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 underline font-semibold [overflow-wrap:anywhere] [word-break:normal]"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return (
          <span key={i} className="[overflow-wrap:anywhere] [word-break:normal]">
            {part}
          </span>
        );
      })}
    </p>
  );
}

/** @deprecated use sanitizeArticleHtml from ./sanitizeHtml (kept as an alias for older imports). */
export const sanitizeEditorialHtml = sanitizeArticleHtml;

/**
 * Splits article content intelligently into renderable blocks.
 * Supports both HTML paragraphs/headings/figures and legacy Markdown paragraphs.
 */
export function splitArticleContent(content: string): string[] {
  if (!content) return [];
  const clean = content.trim();

  // If content contains block HTML tags
  if (/<(p|h1|h2|h3|h4|blockquote|ul|ol|table|figure|hr)[\s>]/i.test(clean)) {
    const separated = clean
      .replace(/<\/(p|h1|h2|h3|h4|blockquote|ul|ol|table|figure)>/gi, '$&\n<!--block_sep-->\n')
      .replace(/<hr\s*\/?>/gi, '$&\n<!--block_sep-->\n');

    const rawBlocks = separated.split(/\n?<!--block_sep-->\n?/);
    const validBlocks: string[] = [];

    for (const b of rawBlocks) {
      const tb = b.trim();
      // Skip empty paragraphs like <p><br></p> or <p></p>
      if (tb && !/^<p>\s*(<br\s*\/?>)?\s*<\/p>$/i.test(tb)) {
        validBlocks.push(tb);
      }
    }
    return validBlocks.length > 0 ? validBlocks : [clean];
  }

  // Legacy Markdown double-newline splitter
  return clean.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

