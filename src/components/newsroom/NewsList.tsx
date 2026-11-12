import React, { useMemo, useState } from 'react';
import { useNewsroom, PageHead, StatusPill, fmtDate, STATUS_LABELS } from './context';
import { categoryLabel } from '../site/format';
import type { ScreenId } from './NewsroomApp';
import type { NewsArticle } from '../../types/news';

const TABS = ['all', 'draft', 'pending_review', 'scheduled', 'published', 'archived', 'none'] as const;
const PAGE = 50;

export const NewsList: React.FC<{ initialTab?: string; go: (s: ScreenId, arg?: string) => void }> = ({ initialTab, go }) => {
  const { articles, saveArticle, deleteArticle, me, viewArticle, notify } = useNewsroom();
  const [tab, setTab] = useState<string>(TABS.includes(initialTab as any) ? (initialTab as string) : 'all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [shown, setShown] = useState(PAGE);

  const cats = useMemo(() => Array.from(new Set(articles.map((a) => a.category))).sort(), [articles]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return articles
      .filter((a) => (tab === 'all' ? true : tab === 'none' ? !a.status : a.status === tab))
      .filter((a) => cat === 'all' || a.category === cat)
      .filter((a) => !needle || a.title.toLowerCase().includes(needle) || (a.authorName || '').toLowerCase().includes(needle))
      .sort((a, b) => (Date.parse(b.updatedAt || b.createdAt) || 0) - (Date.parse(a.updatedAt || a.createdAt) || 0));
  }, [articles, tab, q, cat]);

  const count = (t: string) => (t === 'all' ? articles.length : articles.filter((a) => (t === 'none' ? !a.status : a.status === t)).length);

  const setStatus = async (a: NewsArticle, status: NewsArticle['status']) => {
    try {
      await saveArticle({ ...a, status, ...(status === 'published' && !a.publishedAt ? { publishedAt: new Date().toISOString() } : {}) });
      notify(`“${a.title.slice(0, 40)}” is now ${STATUS_LABELS[status || ''] || status}.`);
    } catch {
      /* saveArticle already reported the error */
    }
  };
  const remove = async (a: NewsArticle) => {
    if (!window.confirm(`Delete “${a.title}” permanently? This cannot be undone.`)) return;
    await deleteArticle(a.id);
  };

  return (
    <div className="kd-nr__page">
      <PageHead
        title="News"
        sub={me.isEditor ? 'All newsroom articles.' : 'Your articles. Editors publish them after review.'}
        actions={
          <button type="button" className="kd-btn kd-btn--primary" onClick={() => go('editor')}>
            New article
          </button>
        }
      />
      <div className="kd-tabs" role="tablist" aria-label="Filter by status">
        {TABS.filter((t) => t !== 'none' || count('none') > 0).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => (setTab(t), setShown(PAGE))}>
            {t === 'all' ? 'All' : t === 'none' ? 'No status' : STATUS_LABELS[t]} ({count(t)})
          </button>
        ))}
      </div>
      <div className="kd-toolbar">
        <label htmlFor="nl-q" className="sr-only">
          Search
        </label>
        <input id="nl-q" className="kd-input" type="search" placeholder="Search title or author" value={q} onChange={(e) => setQ(e.target.value)} />
        <label htmlFor="nl-cat" className="sr-only">
          Category
        </label>
        <select id="nl-cat" className="kd-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </div>
      {list.length === 0 ? (
        <p className="kd-denied">No articles match.</p>
      ) : (
        <div className="kd-table-wrap">
          <table className="kd-table">
            <thead>
              <tr>
                <th scope="col">Article</th>
                <th scope="col">Status</th>
                <th scope="col">Category</th>
                <th scope="col">Updated</th>
                <th scope="col">Views</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, shown).map((a) => {
                const mine = a.authorUid === me.uid;
                const canEdit = me.isEditor || (mine && (a.status === 'draft' || a.status === 'pending_review' || !a.status));
                return (
                  <tr key={a.id}>
                    <td className="kd-table__title">
                      {a.title}
                      <span className="kd-table__sub">
                        {a.authorName || '—'}
                        {a.status === 'scheduled' && a.scheduledFor ? ` · goes live ${fmtDate(a.scheduledFor)}` : ''}
                      </span>
                    </td>
                    <td>
                      <StatusPill status={a.status} />
                    </td>
                    <td>{categoryLabel(a.category)}</td>
                    <td>{fmtDate(a.updatedAt || a.createdAt)}</td>
                    <td>{a.viewsCount || 0}</td>
                    <td>
                      <div className="kd-table__actions">
                        {canEdit && (
                          <button type="button" className="kd-btn kd-btn--secondary kd-btn--sm" onClick={() => go('editor', a.id)}>
                            Edit
                          </button>
                        )}
                        <button type="button" className="kd-btn kd-btn--ghost kd-btn--sm" onClick={() => viewArticle(a)}>
                          View
                        </button>
                        {me.isEditor && a.status !== 'published' && (
                          <button type="button" className="kd-btn kd-btn--ghost kd-btn--sm" onClick={() => setStatus(a, 'published')}>
                            Publish
                          </button>
                        )}
                        {me.isEditor && a.status === 'published' && (
                          <button type="button" className="kd-btn kd-btn--ghost kd-btn--sm" onClick={() => setStatus(a, 'archived')}>
                            Unpublish
                          </button>
                        )}
                        {me.isAdmin && (
                          <button type="button" className="kd-btn kd-btn--danger kd-btn--sm" onClick={() => remove(a)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {shown < list.length && (
        <div className="kd-more">
          <button type="button" className="kd-btn kd-btn--secondary" onClick={() => setShown((n) => n + PAGE)}>
            Show more ({list.length - shown})
          </button>
        </div>
      )}
    </div>
  );
};
