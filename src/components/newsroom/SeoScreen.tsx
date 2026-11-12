import React, { useMemo, useState } from 'react';
import { useNewsroom, PageHead, Field } from './context';
import type { ScreenId } from './NewsroomApp';

/** Search: integration IDs (admins), feed links, and articles that need SEO attention. */
export const SeoScreen: React.FC<{ go: (s: ScreenId, arg?: string) => void }> = ({ go }) => {
  const { articles, settings, saveSettings, me, notify } = useNewsroom();
  const g = settings.googleServices || ({} as any);
  const [ga, setGa] = useState(g.googleAnalyticsId || '');
  const [gsc, setGsc] = useState(g.searchConsoleVerification || '');
  const [saving, setSaving] = useState(false);

  const issues = useMemo(
    () =>
      articles
        .filter((a) => a.status === 'published')
        .map((a) => {
          const list: string[] = [];
          const desc = (a.seoDescription || a.summary || '').trim();
          if (!a.imageUrl) list.push('no lead image');
          else if (!a.imageAltText) list.push('image without alt text');
          if (desc.length < 70) list.push('short description');
          if ((a.title || '').length > 110) list.push('long headline');
          if (!(a.tags || []).length) list.push('no tags');
          if (!a.authorName) list.push('no byline');
          return { a, list };
        })
        .filter((x) => x.list.length > 0)
        .slice(0, 100),
    [articles]
  );

  const save = async () => {
    if (ga && !/^G-[A-Z0-9]{4,20}$/.test(ga.trim())) return notify('Analytics ID should look like G-XXXXXXX.', 'error');
    setSaving(true);
    try {
      await saveSettings({ googleServices: { ...g, googleAnalyticsId: ga.trim(), searchConsoleVerification: gsc.trim() } });
      notify('Saved.');
    } catch {
      notify('Could not save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="kd-nr__page">
      <PageHead title="SEO & sitemaps" sub="Search engines read these automatically; submit the sitemaps once in Google Search Console." />
      <section className="kd-panel">
        <h2>Feeds</h2>
        <ul className="kd-checklist">
          {['/sitemap.xml', '/news-sitemap.xml', '/rss.xml', '/robots.txt'].map((p) => (
            <li key={p}>
              <a href={p} target="_blank" rel="noopener noreferrer">
                {p}
              </a>
            </li>
          ))}
        </ul>
        <p className="kd-help" style={{ marginTop: 8 }}>
          Sitemaps list published articles only. The news sitemap covers the last 48 hours.
        </p>
      </section>
      {me.isAdmin && (
        <section className="kd-panel kd-form kd-form--2">
          <h2 className="kd-span">Google</h2>
          <Field label="Google Analytics measurement ID" id="seo-ga" help="Optional, e.g. G-ABC123XYZ.">
            <input id="seo-ga" className="kd-input" value={ga} onChange={(e) => setGa(e.target.value)} />
          </Field>
          <Field label="Search Console verification code" id="seo-gsc" help="The content value of the google-site-verification meta tag.">
            <input id="seo-gsc" className="kd-input" value={gsc} onChange={(e) => setGsc(e.target.value)} />
          </Field>
          <div className="kd-span">
            <button type="button" className="kd-btn kd-btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </section>
      )}
      <section className="kd-panel">
        <h2>Published articles that need attention ({issues.length})</h2>
        {issues.length === 0 ? (
          <p className="kd-help">Nothing to fix.</p>
        ) : (
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th scope="col">Article</th>
                  <th scope="col">Issues</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map(({ a, list }) => (
                  <tr key={a.id}>
                    <td className="kd-table__title">{a.title}</td>
                    <td>{list.join(', ')}</td>
                    <td>
                      <button type="button" className="kd-btn kd-btn--secondary kd-btn--sm" onClick={() => go('editor', a.id)}>
                        Fix
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
