import React, { useState } from 'react';
import { NewsArticle } from '../types/news';

interface Props {
  latest: NewsArticle[];
  onSelectArticle: (a: NewsArticle) => void;
  onSearch: (q: string) => void;
  onBackToHome: () => void;
}

/** Shown for unknown addresses and unpublished or deleted articles. The server answers HTTP 404. */
export const NotFoundView: React.FC<Props> = ({ latest, onSelectArticle, onSearch, onBackToHome }) => {
  const [q, setQ] = useState('');
  return (
    <main id="main-content" className="kd-container kd-page kd-notfound">
      <p className="kd-kicker">404</p>
      <h1 className="kd-page-title">यह पेज नहीं मिला</h1>
      <p className="kd-notfound__text">हो सकता है पता गलत हो, या ख़बर हटा दी गई हो। ख़बर खोजें या होमपेज पर जाएँ।</p>
      <form
        className="kd-search-row"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) onSearch(q.trim());
        }}
      >
        <label htmlFor="nf-search" className="sr-only">
          ख़बर खोजें
        </label>
        <input id="nf-search" className="kd-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ख़बर खोजें…" />
        <button type="submit" className="kd-btn kd-btn--primary">
          खोजें
        </button>
      </form>
      <button type="button" className="kd-btn kd-btn--secondary" onClick={onBackToHome}>
        होमपेज पर जाएँ
      </button>
      {latest.length > 0 && (
        <section className="kd-notfound__latest" aria-labelledby="nf-latest">
          <h2 id="nf-latest" className="kd-section-title">
            ताज़ा ख़बरें
          </h2>
          <ol className="kd-list">
            {latest.slice(0, 6).map((a) => (
              <li key={a.id}>
                <a
                  href={`/article/${encodeURIComponent(a.id)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectArticle(a);
                  }}
                >
                  {a.title}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
};
