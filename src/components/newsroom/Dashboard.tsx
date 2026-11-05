import React, { useMemo } from 'react';
import { useNewsroom, PageHead, StatusPill, fmtDate } from './context';
import type { ScreenId } from './NewsroomApp';

/** Real counts only — nothing estimated. */
export const Dashboard: React.FC<{ go: (s: ScreenId, arg?: string) => void }> = ({ go }) => {
  const { articles, submissions, inquiries, me } = useNewsroom();
  const count = (st: string) => articles.filter((a) => (a.status || '') === st).length;
  const recent = useMemo(
    () => [...articles].sort((a, b) => (Date.parse(b.updatedAt || b.createdAt) || 0) - (Date.parse(a.updatedAt || a.createdAt) || 0)).slice(0, 8),
    [articles]
  );
  const noStatus = articles.filter((a) => !a.status).length;
  const newTips = submissions.filter((s) => s.status === 'pending').length;
  const newMail = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="kd-nr__page">
      <PageHead
        title={`Welcome, ${me.name.split(' ')[0] || 'editor'}`}
        sub="What needs attention in the newsroom."
        actions={
          <button type="button" className="kd-btn kd-btn--primary" onClick={() => go('editor')}>
            New article
          </button>
        }
      />
      <div className="kd-stats">
        <button type="button" className="kd-stat" onClick={() => go('news', 'published')}>
          <span>Published</span>
          <strong>{count('published')}</strong>
        </button>
        <button type="button" className="kd-stat" onClick={() => go('news', 'pending_review')}>
          <span>Waiting for review</span>
          <strong>{count('pending_review')}</strong>
        </button>
        <button type="button" className="kd-stat" onClick={() => go('news', 'scheduled')}>
          <span>Scheduled</span>
          <strong>{count('scheduled')}</strong>
        </button>
        <button type="button" className="kd-stat" onClick={() => go('news', 'draft')}>
          <span>Drafts</span>
          <strong>{count('draft')}</strong>
        </button>
      </div>

      {(noStatus > 0 || newTips > 0 || newMail > 0) && (
        <section className="kd-panel" aria-labelledby="todo">
          <h2 id="todo">To do</h2>
          <ul className="kd-checklist">
            {noStatus > 0 && (
              <li>
                <span className="todo">●</span>
                <span>
                  {noStatus} article(s) have no status and are hidden from readers.{' '}
                  <button type="button" className="kd-link" onClick={() => go('news', 'none')}>
                    Review them
                  </button>
                </span>
              </li>
            )}
            {newTips > 0 && me.isEditor && (
              <li>
                <span className="todo">●</span>
                <span>
                  {newTips} new reader news tip(s).{' '}
                  <button type="button" className="kd-link" onClick={() => go('inbox')}>
                    Open inbox
                  </button>
                </span>
              </li>
            )}
            {newMail > 0 && me.isEditor && (
              <li>
                <span className="todo">●</span>
                <span>
                  {newMail} new contact message(s).{' '}
                  <button type="button" className="kd-link" onClick={() => go('inbox', 'contact')}>
                    Open inbox
                  </button>
                </span>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="kd-panel" aria-labelledby="recent">
        <h2 id="recent">Recently changed</h2>
        {recent.length === 0 ? (
          <p className="kd-help">No articles yet. Start with “New article”.</p>
        ) : (
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th scope="col">Article</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td className="kd-table__title">
                      {a.title}
                      <span className="kd-table__sub">{a.authorName || '—'}</span>
                    </td>
                    <td>
                      <StatusPill status={a.status} />
                    </td>
                    <td>{fmtDate(a.updatedAt || a.createdAt)}</td>
                    <td>
                      <button type="button" className="kd-btn kd-btn--secondary kd-btn--sm" onClick={() => go('editor', a.id)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
