import React, { useMemo, useState } from 'react';
import type { NewsArticle, PortalSettings } from '../../types/news';
import { StoryCard } from './StoryCard';
import { AdPlacement } from './AdPlacement';
import { articleHref, categoryHref, timeAgo } from './format';
import type { NavCategory } from './SiteHeader';

interface Props {
  /** All published articles (newest first). */
  articles: NewsArticle[];
  /** Articles for the current category or search (already filtered). */
  filtered: NewsArticle[];
  categories: NavCategory[];
  /** 'all' for the homepage, a category id, or 'all' with searchQuery for search. */
  category: string;
  searchQuery: string;
  settings: PortalSettings;
  loading: boolean;
  onOpen: (a: NewsArticle) => void;
}

const STEP = 12;
const byNewest = (a: NewsArticle, b: NewsArticle) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);

const Skeleton: React.FC = () => (
  <div className="kd-container kd-page" aria-busy="true" aria-live="polite">
    <span className="sr-only">ख़बरें लोड हो रही हैं…</span>
    <div className="kd-hero">
      <div className="kd-skel" style={{ aspectRatio: '16 / 9' }} />
      <div className="kd-hero__side">
        <div className="kd-skel" style={{ height: 72 }} />
        <div className="kd-skel" style={{ height: 72 }} />
        <div className="kd-skel" style={{ height: 72 }} />
      </div>
    </div>
  </div>
);

const LatestList: React.FC<{ items: NewsArticle[]; onOpen: (a: NewsArticle) => void }> = ({ items, onOpen }) => (
  <ol className="kd-list">
    {items.map((a) => (
      <li key={a.id}>
        <a
          href={articleHref(a)}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            onOpen(a);
          }}
        >
          {a.title}
        </a>
        <p className="kd-meta">
          <time dateTime={a.createdAt}>{timeAgo(a.createdAt)}</time>
        </p>
      </li>
    ))}
  </ol>
);

const RankedList: React.FC<{ items: NewsArticle[]; onOpen: (a: NewsArticle) => void }> = ({ items, onOpen }) => (
  <ol className="kd-list kd-list--ranked">
    {items.map((a) => (
      <li key={a.id}>
        <a
          href={articleHref(a)}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            onOpen(a);
          }}
        >
          {a.title}
        </a>
      </li>
    ))}
  </ol>
);

/** Homepage, category pages and search results. */
export const HomeView: React.FC<Props> = ({ articles, filtered, categories, category, searchQuery, settings, loading, onOpen }) => {
  const [shown, setShown] = useState(STEP);
  const ads = settings.sidebarAdsConfig;
  const client = settings.googleServices?.adsenseClientId;
  const isSearch = !!searchQuery.trim();
  const isCategory = !isSearch && category !== 'all';

  const sorted = useMemo(() => [...articles].sort(byNewest), [articles]);
  const latest = sorted.slice(0, 8);
  const mostRead = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400_000;
    return sorted
      .filter((a) => (a.viewsCount || 0) > 0 && (Date.parse(a.createdAt) || 0) >= weekAgo)
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      .slice(0, 5);
  }, [sorted]);

  if (loading && articles.length === 0) return <Skeleton />;

  const sidebar = (
    <aside className="kd-aside" aria-label="साइडबार">
      <AdPlacement slot={ads?.topSlot} adsenseClient={client} size="336x280" />
      {!isSearch && (
        <section aria-labelledby="sb-latest">
          <h2 id="sb-latest" className="kd-widget__title">
            ताज़ा ख़बरें
          </h2>
          <LatestList items={latest} onOpen={onOpen} />
        </section>
      )}
      {mostRead.length > 0 && (
        <section aria-labelledby="sb-most">
          <h2 id="sb-most" className="kd-widget__title">
            सबसे ज़्यादा पढ़ी गईं
          </h2>
          <RankedList items={mostRead} onOpen={onOpen} />
        </section>
      )}
      <div className="kd-aside--sticky">
        <AdPlacement slot={ads?.middleSlot} adsenseClient={client} size="300x600" />
      </div>
    </aside>
  );

  // Search results
  if (isSearch) {
    const results = [...filtered].sort(byNewest);
    return (
      <main id="main-content" className="kd-container kd-page">
        <p className="kd-kicker">खोज</p>
        <h1 className="kd-page-title">“{searchQuery}” के परिणाम</h1>
        <p className="kd-meta" role="status">
          {results.length} ख़बरें मिलीं
        </p>
        <div className="kd-layout" style={{ marginTop: 20 }}>
          <div className="kd-main-col">
            {results.length === 0 ? (
              <div className="kd-empty">
                <p className="kd-empty__title">इस खोज से कोई ख़बर नहीं मिली।</p>
                <p className="kd-meta">दूसरे शब्द आज़माएँ, या ताज़ा ख़बरें पढ़ें।</p>
                <a href="/" className="kd-btn kd-btn--secondary">
                  ताज़ा ख़बरें
                </a>
              </div>
            ) : (
              <ul className="kd-grid" role="list">
                {results.slice(0, shown).map((a) => (
                  <li key={a.id} className="kd-rowitem">
                    <StoryCard article={a} variant="row" showSummary onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            )}
            {shown < results.length && (
              <div className="kd-more">
                <button type="button" className="kd-btn kd-btn--secondary" onClick={() => setShown((n) => n + STEP)}>
                  और परिणाम
                </button>
              </div>
            )}
          </div>
          {sidebar}
        </div>
      </main>
    );
  }

  // Category page
  if (isCategory) {
    const label = categories.find((c) => c.id === category)?.label || category;
    const list = [...filtered].sort(byNewest);
    const [lead, ...rest] = list;
    return (
      <main id="main-content" className="kd-container kd-page">
        <nav className="kd-crumbs" aria-label="ब्रेडक्रम्ब">
          <a href="/">होम</a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{label}</span>
        </nav>
        <h1 className="kd-page-title kd-page-title--rule">{label}</h1>
        {list.length === 0 ? (
          <div className="kd-empty" style={{ marginTop: 20 }}>
            <p className="kd-empty__title">इस श्रेणी में अभी कोई ख़बर नहीं है।</p>
            <a href="/" className="kd-btn kd-btn--secondary">
              ताज़ा ख़बरें
            </a>
          </div>
        ) : (
          <div className="kd-layout" style={{ marginTop: 20 }}>
            <div className="kd-main-col">
              <StoryCard article={lead} variant="lead" headingLevel={2} priority showKicker={false} onOpen={onOpen} />
              <ul className="kd-grid kd-grid--3" role="list">
                {rest.slice(0, shown).map((a) => (
                  <li key={a.id}>
                    <StoryCard article={a} showKicker={false} onOpen={onOpen} headingLevel={2} />
                  </li>
                ))}
              </ul>
              {shown < rest.length && (
                <div className="kd-more">
                  <button type="button" className="kd-btn kd-btn--secondary" onClick={() => setShown((n) => n + STEP)}>
                    और ख़बरें दिखाएँ
                  </button>
                </div>
              )}
            </div>
            {sidebar}
          </div>
        )}
      </main>
    );
  }

  // Homepage
  if (sorted.length === 0) {
    return (
      <main id="main-content" className="kd-container kd-page">
        <h1 className="sr-only">खबरी दोस्त — ताज़ा हिंदी ख़बरें</h1>
        <div className="kd-empty">
          <p className="kd-empty__title">अभी कोई ख़बर प्रकाशित नहीं हुई है।</p>
          <p className="kd-meta">संपादक ख़बरें प्रकाशित करते ही वे यहाँ दिखेंगी।</p>
        </div>
      </main>
    );
  }

  const pinned = sorted.filter((a) => a.isPinned || a.isTopStory);
  const lead = pinned[0] || sorted[0];
  const side = sorted.filter((a) => a.id !== lead.id).slice(0, 3);
  const used = new Set([lead.id, ...side.map((a) => a.id)]);
  const top = sorted.filter((a) => !used.has(a.id)).slice(0, 6);
  top.forEach((a) => used.add(a.id));
  const videos = sorted.filter((a) => a.videoUrl).slice(0, 3);
  const blocks = categories
    .map((c) => ({ c, items: sorted.filter((a) => a.category === c.id && !used.has(a.id)).slice(0, 5) }))
    .filter((b) => b.items.length > 0);

  return (
    <main id="main-content" className="kd-container kd-page">
      <h1 className="sr-only">खबरी दोस्त — ताज़ा हिंदी ख़बरें</h1>
      <section className="kd-hero" aria-label="मुख्य ख़बरें">
        <StoryCard article={lead} variant="lead" headingLevel={2} priority onOpen={onOpen} />
        {side.length > 0 && (
          <div className="kd-hero__side">
            {side.map((a) => (
              <StoryCard key={a.id} article={a} variant="row" headingLevel={2} onOpen={onOpen} />
            ))}
          </div>
        )}
      </section>

      <div className="kd-layout" style={{ marginTop: 32 }}>
        <div className="kd-main-col">
          {top.length > 0 && (
            <section aria-labelledby="sec-top">
              <h2 id="sec-top" className="kd-section-title">
                ताज़ा ख़बरें
              </h2>
              <ul className="kd-grid kd-grid--3" role="list">
                {top.map((a) => (
                  <li key={a.id}>
                    <StoryCard article={a} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <AdPlacement slot={ads?.bottomSlot} adsenseClient={client} size="728x90" className="kd-ad--wide" />

          {videos.length > 0 && (
            <section aria-labelledby="sec-video">
              <h2 id="sec-video" className="kd-section-title">
                <a href="/videos">वीडियो</a>
              </h2>
              <ul className="kd-grid kd-grid--3" role="list">
                {videos.map((a) => (
                  <li key={a.id}>
                    <StoryCard article={a} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {blocks.map(({ c, items }) => {
            const [first, ...others] = items;
            return (
              <section key={c.id} aria-labelledby={`sec-${c.id}`}>
                <h2 id={`sec-${c.id}`} className="kd-section-title">
                  <a href={categoryHref(c.id)}>{c.label}</a>
                </h2>
                <div className="kd-split">
                  <StoryCard article={first} showKicker={false} showSummary onOpen={onOpen} />
                  {others.length > 0 && (
                    <ul className="kd-list" role="list">
                      {others.map((a) => (
                        <li key={a.id}>
                          <StoryCard article={a} variant="text" showKicker={false} onOpen={onOpen} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        {sidebar}
      </div>
    </main>
  );
};
