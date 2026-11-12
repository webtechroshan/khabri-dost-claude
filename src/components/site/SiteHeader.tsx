import React, { useEffect, useRef, useState } from 'react';
import { Menu, Search, X, Home, LayoutGrid, PlaySquare, Newspaper, Radio, User } from 'lucide-react';
import type { NewsArticle, PortalSettings } from '../../types/news';
import { articleHref, categoryHref, categoryLabel } from './format';
import { POLICY_PATHS } from '../../utils/routes';

export interface NavCategory {
  id: string;
  label: string;
}

interface Props {
  settings: PortalSettings;
  categories: NavCategory[];
  /** Active category id, or '' when not on a category page. */
  activeCategory: string;
  isHome: boolean;
  isArticle: boolean;
  searchQuery: string;
  onSearch: (q: string) => void;
  breaking: NewsArticle | null;
  hasLive: boolean;
  isStaff: boolean;
  onOpenNewsroom: () => void;
}

const todayHindi = () =>
  new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

const SOCIAL_LABELS: Record<string, string> = {
  whatsappChannel: 'WhatsApp',
  telegramChannel: 'Telegram',
  facebook: 'Facebook',
  twitter: 'X',
  youtube: 'YouTube',
  instagram: 'Instagram',
  googleNews: 'Google News',
};

export function socialLinksOf(settings: PortalSettings): Array<{ key: string; label: string; url: string }> {
  const links = (settings.headerFooter?.socialLinks || {}) as unknown as Record<string, string>;
  return Object.entries(SOCIAL_LABELS)
    .map(([key, label]) => ({ key, label, url: (links[key] || '').trim() }))
    .filter((l) => /^https?:\/\//.test(l.url));
}

const Wordmark: React.FC<{ settings: PortalSettings; compact?: boolean }> = ({ settings, compact }) => {
  const hf = settings.headerFooter;
  const name = hf?.siteTitleHindi || 'खबरी दोस्त';
  if (hf?.logoUrl) {
    return <img src={hf.logoUrl} alt={name} className="kd-logo__img" style={{ height: compact ? 32 : Math.min(hf.headerLogoHeight || 48, 56) }} />;
  }
  return (
    <span className="kd-logo__text">
      <i aria-hidden="true" />
      {name}
    </span>
  );
};

/**
 * Site header. Desktop: utility strip, masthead and a sticky category bar (the only sticky part).
 * Phones: a 56px sticky top bar and a scrollable category row; the full menu opens as a dialog.
 */
export const SiteHeader: React.FC<Props> = ({
  settings,
  categories,
  activeCategory,
  isHome,
  isArticle,
  searchQuery,
  onSearch,
  breaking,
  hasLive,
  isStaff,
  onOpenNewsroom,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(!!searchQuery);
  const [q, setQ] = useState(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  const showEPaper = settings.headerFooter?.headerShowEPaper !== false;
  const socials = socialLinksOf(settings);

  useEffect(() => setQ(searchQuery), [searchQuery]);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) onSearch(q.trim());
  };

  const navLink = (c: NavCategory) => (
    <li key={c.id}>
      <a href={categoryHref(c.id)} aria-current={activeCategory === c.id ? 'page' : undefined}>
        {c.label}
      </a>
    </li>
  );

  return (
    <>
      <a href="#main-content" className="kd-skip">
        मुख्य सामग्री पर जाएँ
      </a>

      {/* Desktop utility strip */}
      <div className="kd-util">
        <div className="kd-container kd-util__row">
          <span>{todayHindi()}</span>
          <nav aria-label="उपयोगी लिंक">
            {showEPaper && <a href="/epaper">ई-पेपर</a>}
            {hasLive && <a href="/live">लाइव</a>}
            <a href="/submit-news">ख़बर भेजें</a>
            {socials.slice(0, 4).map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
            {isStaff && (
              <button type="button" className="kd-util__btn" onClick={onOpenNewsroom}>
                Newsroom
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Masthead (tablet/desktop) and top bar (phones) */}
      <header className="kd-mast">
        <div className="kd-container kd-mast__row">
          <button type="button" className="kd-iconbtn" aria-label="मेनू खोलें" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <Menu size={22} aria-hidden="true" />
          </button>
          <a href="/" className="kd-logo" aria-label="खबरी दोस्त — होम">
            <Wordmark settings={settings} />
          </a>
          <button
            type="button"
            className="kd-iconbtn"
            aria-label={searchOpen ? 'खोज बंद करें' : 'ख़बर खोजें'}
            aria-expanded={searchOpen}
            aria-controls="kd-search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X size={22} aria-hidden="true" /> : <Search size={22} aria-hidden="true" />}
          </button>
        </div>
        {searchOpen && (
          <div className="kd-container" id="kd-search">
            <form role="search" className="kd-search-row kd-search-row--header" onSubmit={submit}>
              <label htmlFor="kd-q" className="sr-only">
                ख़बर खोजें
              </label>
              <input id="kd-q" ref={searchRef} className="kd-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ख़बर, जगह या विषय खोजें…" />
              <button type="submit" className="kd-btn kd-btn--primary">
                खोजें
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Category navigation: sticky on desktop, scroll row on phones */}
      <nav className="kd-nav" aria-label="श्रेणियाँ">
        <div className="kd-container">
          <ul>
            <li>
              <a href="/" aria-current={isHome && !activeCategory ? 'page' : undefined}>
                होम
              </a>
            </li>
            {categories.map(navLink)}
          </ul>
        </div>
      </nav>

      {breaking && !isArticle && (
        <div className="kd-breaking" role="region" aria-label="ब्रेकिंग न्यूज़">
          <div className="kd-container kd-breaking__row">
            <strong>ब्रेकिंग</strong>
            <a href={articleHref(breaking)}>{breaking.title}</a>
          </div>
        </div>
      )}

      {menuOpen && (
        <MenuDrawer
          categories={categories}
          showEPaper={showEPaper}
          hasLive={hasLive}
          isStaff={isStaff}
          socials={socials}
          onClose={() => setMenuOpen(false)}
          onOpenNewsroom={() => {
            setMenuOpen(false);
            onOpenNewsroom();
          }}
        />
      )}

      {!isArticle && <BottomNav isHome={isHome && !activeCategory} onOpenMenu={() => setMenuOpen(true)} showEPaper={showEPaper} />}
    </>
  );
};

const MenuDrawer: React.FC<{
  categories: NavCategory[];
  showEPaper: boolean;
  hasLive: boolean;
  isStaff: boolean;
  socials: Array<{ key: string; label: string; url: string }>;
  onClose: () => void;
  onOpenNewsroom: () => void;
}> = ({ categories, showEPaper, hasLive, isStaff, socials, onClose, onOpenNewsroom }) => {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>('a, button');
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [onClose]);

  // Any link inside closes the menu (navigation is handled by the app).
  const onClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('a')) onClose();
  };

  return (
    <div className="kd-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className="kd-drawer" role="dialog" aria-modal="true" aria-label="मेनू" onClick={onClick}>
        <div className="kd-drawer__head">
          <span className="kd-logo__text">
            <i aria-hidden="true" />
            खबरी दोस्त
          </span>
          <button type="button" className="kd-iconbtn" aria-label="मेनू बंद करें" onClick={onClose}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="श्रेणियाँ">
          <h2 className="kd-drawer__title">श्रेणियाँ</h2>
          <ul className="kd-drawer__list">
            <li>
              <a href="/">होम</a>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <a href={categoryHref(c.id)}>{c.label}</a>
              </li>
            ))}
          </ul>
          <h2 className="kd-drawer__title">और</h2>
          <ul className="kd-drawer__list">
            {hasLive && (
              <li>
                <a href="/live">लाइव ख़बरें</a>
              </li>
            )}
            <li>
              <a href="/videos">वीडियो</a>
            </li>
            {showEPaper && (
              <li>
                <a href="/epaper">ई-पेपर</a>
              </li>
            )}
            <li>
              <a href="/archive">संग्रह</a>
            </li>
            <li>
              <a href="/submit-news">ख़बर भेजें</a>
            </li>
            <li>
              <a href="/about">हमारे बारे में</a>
            </li>
            <li>
              <a href="/contact">संपर्क</a>
            </li>
            <li>
              <a href={POLICY_PATHS.ethics}>संपादकीय नीति</a>
            </li>
            <li>
              <a href={POLICY_PATHS.corrections}>सुधार नीति</a>
            </li>
          </ul>
          {socials.length > 0 && (
            <>
              <h2 className="kd-drawer__title">हमें फ़ॉलो करें</h2>
              <ul className="kd-drawer__list">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="kd-drawer__foot" lang="en">
            {isStaff ? (
              <button type="button" className="kd-btn kd-btn--secondary kd-btn--block" onClick={onOpenNewsroom}>
                Open newsroom
              </button>
            ) : (
              <a href="/login" className="kd-btn kd-btn--ghost kd-btn--block">
                <User size={16} aria-hidden="true" /> Newsroom sign in
              </a>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

/** Phone bottom navigation (one bar; article pages show a share bar instead). */
const BottomNav: React.FC<{ isHome: boolean; showEPaper: boolean; onOpenMenu: () => void }> = ({ isHome, showEPaper, onOpenMenu }) => (
  <nav className="kd-bnav" aria-label="मुख्य नेविगेशन">
    <a href="/" aria-current={isHome ? 'page' : undefined}>
      <Home size={20} aria-hidden="true" />
      <span>होम</span>
    </a>
    <button type="button" onClick={onOpenMenu}>
      <LayoutGrid size={20} aria-hidden="true" />
      <span>श्रेणियाँ</span>
    </button>
    <a href="/videos">
      <PlaySquare size={20} aria-hidden="true" />
      <span>वीडियो</span>
    </a>
    {showEPaper ? (
      <a href="/epaper">
        <Newspaper size={20} aria-hidden="true" />
        <span>ई-पेपर</span>
      </a>
    ) : (
      <a href="/live">
        <Radio size={20} aria-hidden="true" />
        <span>लाइव</span>
      </a>
    )}
    <button type="button" onClick={onOpenMenu}>
      <Menu size={20} aria-hidden="true" />
      <span>मेनू</span>
    </button>
  </nav>
);

export { categoryLabel };
