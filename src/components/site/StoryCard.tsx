import React from 'react';
import type { NewsArticle } from '../../types/news';
import { articleHref, categoryHref, categoryLabel, cardImage, timeAgo } from './format';

export type StoryVariant = 'lead' | 'standard' | 'row' | 'text';

interface Props {
  article: NewsArticle;
  variant?: StoryVariant;
  /** Headline level inside the section (h2 for lead stories, h3 for the rest). */
  headingLevel?: 2 | 3;
  showSummary?: boolean;
  showKicker?: boolean;
  priority?: boolean;
  onOpen: (a: NewsArticle) => void;
}

/**
 * The one story card. Variants: lead (big), standard (image on top), row (image right), text.
 * Every card is a real link to the article URL; clicks are handled in-app.
 */
export const StoryCard: React.FC<Props> = ({
  article: a,
  variant = 'standard',
  headingLevel = 3,
  showSummary = variant === 'lead',
  showKicker = true,
  priority = false,
  onOpen,
}) => {
  const href = articleHref(a);
  const img = variant === 'text' ? '' : cardImage(a);
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const open = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(a);
  };
  return (
    <article className={`kd-card kd-card--${variant}`}>
      {img && (
        <a href={href} onClick={open} className="kd-card__media" tabIndex={-1} aria-hidden="true">
          <img
            src={img}
            alt=""
            width={variant === 'row' ? 140 : 640}
            height={variant === 'row' ? 105 : 360}
            loading={priority ? 'eager' : 'lazy'}
            {...(priority ? { fetchpriority: 'high' } : {})}
            decoding="async"
          />
          {a.videoUrl && <span className="kd-card__badge">वीडियो</span>}
        </a>
      )}
      <div style={{ minWidth: 0, display: 'grid', gap: 6, alignContent: 'start' }}>
        {showKicker && (
          <a href={categoryHref(a.category)} className="kd-kicker">
            {a.isBreaking ? 'ब्रेकिंग · ' : ''}
            {categoryLabel(a.category)}
          </a>
        )}
        <H className="kd-card__title">
          <a href={href} onClick={open}>
            {a.title}
          </a>
        </H>
        {showSummary && a.summary && <p className="kd-card__sum">{a.summary}</p>}
        <p className="kd-card__meta">
          <time dateTime={a.createdAt}>{timeAgo(a.createdAt)}</time>
          {a.location && <span>{a.location}</span>}
        </p>
      </div>
    </article>
  );
};
