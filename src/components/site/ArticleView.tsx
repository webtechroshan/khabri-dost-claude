import React, { useEffect, useMemo, useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import type { NewsArticle, PortalSettings } from '../../types/news';
import { splitArticleContent, renderArticleBlock } from '../../utils/articleContentParser';
import { getAuthorPhoto } from '../../data/seedNews';
import { incrementArticleViews } from '../../services/newsService';
import { isArticlePubliclyVisible } from '../../utils/articleVisibility';
import { StoryCard } from './StoryCard';
import { AdPlacement } from './AdPlacement';
import { articleHref, authorHref, categoryHref, categoryLabel, fullDate, tagHref, timeAgo } from './format';

interface Props {
  article: NewsArticle;
  allArticles: NewsArticle[];
  settings: PortalSettings;
  fontScale: 'normal' | 'large' | 'xlarge';
  onOpen: (a: NewsArticle) => void;
  /** Staff only: open this article in the editor. */
  onEdit?: (a: NewsArticle) => void;
}

const SHARE_TARGETS = [
  { id: 'whatsapp', label: 'WhatsApp', url: (u: string, t: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${t} ${u}`)}` },
  { id: 'facebook', label: 'Facebook', url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { id: 'twitter', label: 'X', url: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: 'telegram', label: 'Telegram', url: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
];

const viewed = new Set<string>();

const ShareButtons: React.FC<{ url: string; title: string; compact?: boolean }> = ({ url, title, compact }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('लिंक कॉपी करें', url);
    }
  };
  const native = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* cancelled */
    }
  };
  return (
    <div className={compact ? 'kd-sharebar__row' : 'kd-share'} aria-label="शेयर करें" role="group">
      {SHARE_TARGETS.map((s) => (
        <a key={s.id} className={`kd-share__btn kd-share__btn--${s.id}`} href={s.url(url, title)} target="_blank" rel="noopener noreferrer">
          {s.label}
        </a>
      ))}
      <button type="button" className="kd-share__btn" onClick={copy} aria-live="polite">
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        <span>{copied ? 'कॉपी हुआ' : 'लिंक'}</span>
      </button>
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button type="button" className="kd-share__btn" onClick={native} aria-label="और विकल्प">
          <Share2 size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

/** Article page: one H1, clear byline and dates, readable body, honest author box, related stories. */
export const ArticleView: React.FC<Props> = ({ article: a, allArticles, settings, fontScale, onOpen, onEdit }) => {
  const isPublic = isArticlePubliclyVisible(a);
  const url = typeof window !== 'undefined' ? `${window.location.origin}${articleHref(a)}` : articleHref(a);
  const label = categoryLabel(a.category);
  const deck = (a.subtitle || a.summary || '').trim();
  const updated = a.updatedAt && a.updatedAt !== a.createdAt && Date.parse(a.updatedAt) - Date.parse(a.createdAt) > 5 * 60_000;
  const ads = settings.sidebarAdsConfig;
  const client = settings.googleServices?.adsenseClientId;
  const highlights = (a.highlights || []).map((h) => (h || '').trim()).filter((h) => h.length > 3).slice(0, 5);
  const authorPhoto = a.authorPhotoUrl && !/images\.unsplash\.com/.test(a.authorPhotoUrl) ? a.authorPhotoUrl : getAuthorPhoto(a.authorName);

  useEffect(() => {
    if (isPublic && !viewed.has(a.id)) {
      viewed.add(a.id);
      incrementArticleViews(a.id, a.viewsCount);
    }
  }, [a.id, isPublic]); // eslint-disable-line react-hooks/exhaustive-deps

  const blocks = useMemo(() => splitArticleContent(a.content || ''), [a.content]);
  const related = useMemo(
    () =>
      allArticles
        .filter((x) => x.id !== a.id && x.category === a.category)
        .sort((x, y) => (Date.parse(y.createdAt) || 0) - (Date.parse(x.createdAt) || 0))
        .slice(0, settings.sidebarWidgets?.relatedArticlesCount || 4),
    [allArticles, a.id, a.category, settings.sidebarWidgets?.relatedArticlesCount]
  );
  const latest = useMemo(
    () => allArticles.filter((x) => x.id !== a.id).sort((x, y) => (Date.parse(y.createdAt) || 0) - (Date.parse(x.createdAt) || 0)).slice(0, 6),
    [allArticles, a.id]
  );

  return (
    <div className={`kd-container kd-page kd-article kd-article--${fontScale}`}>
      {!isPublic && (
        <p className="kd-alert kd-alert--info" lang="en" role="status">
          Preview — this article is <strong>{a.status || 'not published'}</strong> and is not visible to readers.
        </p>
      )}
      <div className="kd-layout">
        <article className="kd-article__main" aria-labelledby="article-title">
          <nav className="kd-crumbs" aria-label="ब्रेडक्रम्ब">
            <a href="/">होम</a>
            <span aria-hidden="true">›</span>
            <a href={categoryHref(a.category)}>{label}</a>
          </nav>
          <a href={categoryHref(a.category)} className="kd-kicker">
            {a.isBreaking ? 'ब्रेकिंग · ' : ''}
            {label}
          </a>
          <h1 id="article-title" className="kd-article__title">
            {a.title}
          </h1>
          {deck && <p className="kd-article__deck">{deck}</p>}

          <div className="kd-byline">
            <img src={authorPhoto} alt="" width={40} height={40} className="kd-avatar kd-avatar--sm" />
            <div className="kd-byline__text">
              {a.authorName && (
                <p className="kd-byline__name">
                  <a href={authorHref(a.authorName)}>{a.authorName}</a>
                  {a.authorRole && <span className="kd-byline__role"> · {a.authorRole}</span>}
                </p>
              )}
              <p className="kd-meta">
                {a.location && <span>{a.location} · </span>}
                <span>
                  प्रकाशित: <time dateTime={a.createdAt}>{fullDate(a.createdAt, true)}</time>
                </span>
                {updated && (
                  <span>
                    {' '}
                    · अपडेट: <time dateTime={a.updatedAt}>{fullDate(a.updatedAt, true)}</time>
                  </span>
                )}
              </p>
            </div>
            {onEdit && (
              <button type="button" className="kd-btn kd-btn--secondary kd-byline__edit" onClick={() => onEdit(a)} lang="en">
                Edit
              </button>
            )}
          </div>

          <ShareButtons url={url} title={a.title} />

          {a.imageUrl && (
            <figure className="kd-figure">
              <img
                src={a.imageUrl}
                alt={a.imageAltText || ''}
                width={1200}
                height={675}
                {...({ fetchpriority: 'high' } as Record<string, string>)}
                decoding="async"
              />
              {(a.imageCaption || a.imageCredit) && (
                <figcaption>
                  {a.imageCaption}
                  {a.imageCredit && <span className="kd-figure__credit"> फ़ोटो: {a.imageCredit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          {highlights.length > 0 && (
            <aside className="kd-keyfacts" aria-labelledby="keyfacts">
              <h2 id="keyfacts">मुख्य बातें</h2>
              <ul>
                {highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </aside>
          )}

          <div className="kd-prose article-content-container">
            {blocks.map((b, i) => (
              <React.Fragment key={i}>
                {renderArticleBlock(b, `b${i}`)}
                {i === 2 && blocks.length > 5 && <AdPlacement slot={ads?.bottomSlot} adsenseClient={client} size="336x280" className="kd-ad--inline" />}
              </React.Fragment>
            ))}
          </div>

          {(a.corrections || []).length > 0 && (
            <aside className="kd-correction" aria-labelledby="corrections">
              <h2 id="corrections">सुधार</h2>
              <ul>
                {a.corrections!.map((c, i) => (
                  <li key={i}>
                    <time dateTime={c.date}>{fullDate(c.date)}</time>: {c.text}
                  </li>
                ))}
              </ul>
              <a href="/corrections-policy">हमारी सुधार नीति</a>
            </aside>
          )}

          {a.sourceAttribution && <p className="kd-meta kd-article__source">स्रोत: {a.sourceAttribution}</p>}

          {(a.tags || []).length > 0 && (
            <ul className="kd-tags" aria-label="टैग">
              {a.tags!.map((t) => (
                <li key={t}>
                  <a href={tagHref(t)}>#{t.replace(/^#/, '')}</a>
                </li>
              ))}
            </ul>
          )}

          {a.authorName && (a.authorBio || a.authorRole) && (
            <section className="kd-authorbox" aria-labelledby="author-box">
              <img src={authorPhoto} alt="" width={64} height={64} className="kd-avatar" style={{ width: 64, height: 64 }} />
              <div>
                <h2 id="author-box" className="kd-authorbox__name">
                  <a href={authorHref(a.authorName)}>{a.authorName}</a>
                </h2>
                {a.authorRole && <p className="kd-meta">{a.authorRole}</p>}
                {a.authorBio && <p className="kd-authorbox__bio">{a.authorBio}</p>}
                <a href={authorHref(a.authorName)} className="kd-link">
                  इनकी सभी ख़बरें
                </a>
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related" className="kd-related">
              <h2 id="related" className="kd-section-title">
                {settings.sidebarWidgets?.relatedHeadingTitle || 'यह भी पढ़ें'}
              </h2>
              <ul className="kd-grid kd-grid--2" role="list">
                {related.map((r) => (
                  <li key={r.id}>
                    <StoryCard article={r} variant="row" showKicker={false} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="kd-aside kd-article__aside" aria-label="साइडबार">
          <AdPlacement slot={ads?.topSlot} adsenseClient={client} size="336x280" />
          {latest.length > 0 && (
            <section aria-labelledby="art-latest">
              <h2 id="art-latest" className="kd-widget__title">
                ताज़ा ख़बरें
              </h2>
              <ol className="kd-list">
                {latest.map((x) => (
                  <li key={x.id}>
                    <a href={articleHref(x)}>{x.title}</a>
                    <p className="kd-meta">
                      <time dateTime={x.createdAt}>{timeAgo(x.createdAt)}</time>
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <div className="kd-aside--sticky">
            <AdPlacement slot={ads?.middleSlot} adsenseClient={client} size="300x600" />
          </div>
        </aside>
      </div>

      {/* Phones: one bottom bar — sharing replaces the navigation bar on articles. */}
      <div className="kd-sharebar">
        <ShareButtons url={url} title={a.title} compact />
      </div>
    </div>
  );
};
