import React, { useMemo, useState } from 'react';
import { NewsArticle, PortalSettings } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { getAuthorPhoto } from '../data/seedNews';

export type ListingKind = 'author' | 'tag' | 'videos';

interface Props {
  kind: ListingKind;
  value: string;
  articles: NewsArticle[];
  portalSettings: PortalSettings;
  onSelectArticle: (a: NewsArticle) => void;
  onBackToHome: () => void;
}

const STEP = 12;
const key = (s: string) => s.replace(/^#/, '').trim().toLocaleLowerCase('hi');
const time = (a: NewsArticle) => Date.parse(a.createdAt) || 0;

/**
 * Author pages (/author/:name), tag pages (/tag/:tag) and the video listing (/videos).
 * Only published articles are passed in. Author details come from what the newsroom saved on
 * the author's own articles; nothing is added.
 */
export const ListingPageView: React.FC<Props> = ({ kind, value, articles, portalSettings, onSelectArticle, onBackToHome }) => {
  const [shown, setShown] = useState(STEP);
  const k = key(value);

  const list = useMemo(() => {
    const match =
      kind === 'author'
        ? (a: NewsArticle) => key(a.authorName || '') === k
        : kind === 'tag'
          ? (a: NewsArticle) => (a.tags || []).some((t) => key(t) === k)
          : (a: NewsArticle) => !!a.videoUrl;
    return articles.filter(match).sort((a, b) => time(b) - time(a));
  }, [articles, kind, k]);

  const author = useMemo(() => {
    if (kind !== 'author' || list.length === 0) return null;
    const withBio = list.find((a) => a.authorBio?.trim()) || list[0];
    const photo = withBio.authorPhotoUrl && !/images\.unsplash\.com/.test(withBio.authorPhotoUrl) ? withBio.authorPhotoUrl : getAuthorPhoto(withBio.authorName);
    return { name: withBio.authorName, role: withBio.authorRole?.trim(), bio: withBio.authorBio?.trim(), photo };
  }, [kind, list]);

  const heading = kind === 'author' ? author?.name || value : kind === 'tag' ? `#${value.replace(/^#/, '')}` : 'वीडियो';
  const label = kind === 'author' ? 'लेखक' : kind === 'tag' ? 'टैग' : 'वीडियो ख़बरें';

  return (
    <div className="kd-container kd-page">
      <nav className="kd-crumbs" aria-label="ब्रेडक्रम्ब">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onBackToHome();
          }}
        >
          होम
        </a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{label}</span>
      </nav>

      <header className="kd-listing-head">
        {kind === 'author' && <img src={author?.photo || getAuthorPhoto(value)} alt="" width={80} height={80} className="kd-avatar kd-avatar--lg" />}
        <div>
          <p className="kd-kicker">{label}</p>
          <h1 className="kd-page-title">{heading}</h1>
          {author?.role && <p className="kd-listing-head__role">{author.role}</p>}
          {author?.bio && <p className="kd-listing-head__bio">{author.bio}</p>}
          <p className="kd-meta">{list.length} प्रकाशित ख़बरें</p>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="kd-empty">
          <p className="kd-empty__title">
            {kind === 'author' ? 'इस लेखक की कोई प्रकाशित ख़बर नहीं मिली।' : kind === 'tag' ? 'इस टैग से जुड़ी कोई ख़बर नहीं मिली।' : 'अभी कोई वीडियो ख़बर नहीं है।'}
          </p>
          <button type="button" className="kd-btn kd-btn--primary" onClick={onBackToHome}>
            होमपेज पर जाएँ
          </button>
        </div>
      ) : (
        <>
          <ul className="kd-grid kd-grid--3" role="list">
            {list.slice(0, shown).map((a) => (
              <li key={a.id}>
                <ArticleCard
                  article={a}
                  onSelectArticle={onSelectArticle}
                  displayOptions={portalSettings.displayOptions}
                  headlineStyling={portalSettings.headlineStyling}
                />
              </li>
            ))}
          </ul>
          {shown < list.length && (
            <div className="kd-more">
              <button type="button" className="kd-btn kd-btn--secondary" onClick={() => setShown((n) => n + STEP)}>
                और ख़बरें दिखाएँ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
