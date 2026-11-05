import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, X, ExternalLink, LogOut } from 'lucide-react';
import { NewsroomProvider, type NewsroomData } from './context';
import { Dashboard } from './Dashboard';
import { NewsList } from './NewsList';
import { ArticleEditor } from './ArticleEditor';
import { Inbox } from './Inbox';
import { Ads } from './Ads';
import { Users } from './Users';
import { SettingsScreen } from './SettingsScreen';
import { SeoScreen } from './SeoScreen';
import { Audience } from './Audience';
import { LiveScreen, MediaScreen } from './Embedded';
import { ROLE_LABELS } from '../../utils/roles';

export type ScreenId = 'dashboard' | 'news' | 'editor' | 'live' | 'media' | 'inbox' | 'ads' | 'audience' | 'seo' | 'users' | 'settings';

type NavItem = { id: ScreenId; label: string; badge?: number; need?: 'editor' | 'admin' };

interface Props extends Omit<NewsroomData, 'notify'> {
  initialScreen?: string;
  onClose: () => void;
  onSignOut: () => void;
}

/** Map old admin tab ids (links inside older components) to new screens. */
const LEGACY_TABS: Record<string, ScreenId> = {
  articles: 'news',
  new_article: 'editor',
  pipeline_calendar: 'news',
  live: 'live',
  live_feed: 'live',
  media: 'media',
  epaper: 'media',
  monetization: 'ads',
  ads: 'ads',
  sidebar_ads: 'ads',
  users: 'users',
  admins: 'users',
  seo_audit: 'seo',
  subscribers: 'audience',
  header_footer: 'settings',
  settings_header: 'settings',
  settings_footer: 'settings',
  footer: 'settings',
  brand_customizer: 'settings',
};

/**
 * The newsroom: 11 screens in one shell (replaces the old 29-tab panel).
 * English interface; what each person can do follows their role.
 */
export const NewsroomApp: React.FC<Props> = ({ initialScreen, onClose, onSignOut, ...data }) => {
  const [startName, startArg] = (initialScreen || '').split(':');
  const start = (LEGACY_TABS[startName] || (startName as ScreenId)) as ScreenId;
  const [screen, setScreen] = useState<ScreenId>(['dashboard', 'news', 'editor', 'live', 'media', 'inbox', 'ads', 'audience', 'seo', 'users', 'settings'].includes(start) ? start : 'dashboard');
  const [arg, setArg] = useState<string | undefined>(startArg || undefined);
  const [navOpen, setNavOpen] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const notify = useCallback((text: string, tone: 'ok' | 'error' = 'ok') => setNotice({ text, tone }), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.tone === 'error' ? 7000 : 3500);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const go = useCallback((s: ScreenId, a?: string) => {
    setScreen(s);
    setArg(a);
    setNavOpen(false);
    if (s === 'editor') setEditorKey((k) => k + 1);
    document.querySelector('.kd-nr__main')?.scrollTo({ top: 0 });
  }, []);

  const me = data.me;
  const review = data.articles.filter((a) => a.status === 'pending_review').length;
  const newInbox = data.submissions.filter((s) => s.status === 'pending').length + data.inquiries.filter((i) => i.status === 'new').length;

  const groups: Array<{ title: string; items: NavItem[] }> = useMemo(
    () => [
      {
        title: 'Newsroom',
        items: [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'news', label: 'News', badge: review || undefined },
          { id: 'editor', label: 'Write article' },
          { id: 'live', label: 'Live coverage' },
          { id: 'inbox', label: 'Inbox', badge: newInbox || undefined, need: 'editor' },
        ],
      },
      { title: 'Content', items: [{ id: 'media', label: 'Media' }] },
      {
        title: 'Site',
        items: [
          { id: 'ads', label: 'Advertisements', need: 'admin' },
          { id: 'seo', label: 'SEO & sitemaps' },
          { id: 'settings', label: 'Settings', need: 'admin' },
        ],
      },
      {
        title: 'People',
        items: [
          { id: 'audience', label: 'Audience', need: 'admin' },
          { id: 'users', label: 'Users & roles', need: 'admin' },
        ],
      },
    ],
    [review, newInbox]
  );

  const allowed = (n: NavItem) => !n.need || (n.need === 'admin' ? me.isAdmin : me.isEditor);

  const ctx: NewsroomData = { ...data, notify };

  return (
    <NewsroomProvider value={ctx}>
      <div className="kd-nr" lang="en" role="dialog" aria-modal="true" aria-label="Newsroom">
        <header className="kd-nr__top">
          <button type="button" className="kd-iconbtn kd-nr__menu" aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="kd-nr__brand">
            <span className="kd-logo__text" style={{ fontSize: 18 }} lang="hi">
              <i aria-hidden="true" style={{ height: 18, width: 7 }} />
              खबरी दोस्त
            </span>
            <small>Newsroom</small>
          </span>
          <span className="kd-nr__spacer" />
          <span className="kd-nr__who">
            {me.name} · {ROLE_LABELS[me.role as keyof typeof ROLE_LABELS] || me.role}
          </span>
          <button type="button" className="kd-btn kd-btn--ghost kd-btn--sm" onClick={onClose} title="Back to the website">
            <ExternalLink size={16} aria-hidden="true" />
            <span>Site</span>
          </button>
          <button type="button" className="kd-iconbtn" onClick={onSignOut} aria-label="Sign out" title="Sign out">
            <LogOut size={18} />
          </button>
        </header>

        <nav className={`kd-nr__side${navOpen ? ' kd-nr__side--open' : ''}`} aria-label="Newsroom">
          {groups.map((g) => {
            const items = g.items.filter(allowed);
            if (!items.length) return null;
            return (
              <div key={g.title}>
                <div className="kd-nr__group">{g.title}</div>
                {items.map((n) => (
                  <button key={n.id} type="button" className="kd-nr__navbtn" aria-current={screen === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
                    <span>{n.label}</span>
                    {n.badge ? <em aria-label={`${n.badge} waiting`}>{n.badge}</em> : null}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <main className="kd-nr__main" id="newsroom-main">
          {screen === 'dashboard' && <Dashboard go={go} />}
          {screen === 'news' && <NewsList key={arg || 'all'} initialTab={arg} go={go} />}
          {screen === 'editor' && <ArticleEditor key={`${editorKey}-${arg || 'new'}`} articleId={arg} go={go} />}
          {screen === 'live' && <LiveScreen />}
          {screen === 'media' && <MediaScreen />}
          {screen === 'inbox' && <Inbox initialTab={arg} />}
          {screen === 'ads' && <Ads />}
          {screen === 'audience' && <Audience />}
          {screen === 'seo' && <SeoScreen go={go} />}
          {screen === 'users' && <Users />}
          {screen === 'settings' && <SettingsScreen initialSection={arg} />}
        </main>

        {notice && (
          <div className={`kd-notice${notice.tone === 'error' ? ' kd-notice--error' : ''}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
            {notice.text}
          </div>
        )}
      </div>
    </NewsroomProvider>
  );
};

export default NewsroomApp;
