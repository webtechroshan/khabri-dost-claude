import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useNewsroom, PageHead, Field, StatusPill, fmtDate, STATUS_LABELS } from './context';
import { categoryLabel } from '../site/format';
import { CATEGORY_IDS } from '../../utils/routes';
import { htmlToText } from '../../utils/sanitizeHtml';
import type { NewsArticle, NewsCategory } from '../../types/news';
import type { ScreenId } from './NewsroomApp';
import { authFetch } from '../../utils/authFetch';

const VisualEditor = lazy(() => import('../admin/WordPressVisualEditor').then((m) => ({ default: m.WordPressVisualEditor })));

type Draft = Partial<NewsArticle> & { title: string; content: string; summary: string; category: NewsCategory };

const blank = (name: string): Draft => ({
  title: '',
  subtitle: '',
  summary: '',
  content: '',
  category: 'national' as NewsCategory,
  tags: [],
  location: '',
  imageUrl: '',
  imageAltText: '',
  imageCaption: '',
  imageCredit: '',
  authorName: name,
  authorRole: '',
  authorBio: '',
  highlights: [],
  seoTitle: '',
  seoDescription: '',
  sourceAttribution: '',
  isBreaking: false,
  isTopStory: false,
  status: 'draft',
  corrections: [],
});

const words = (html: string) => htmlToText(html).split(/\s+/).filter(Boolean).length;
const MAX_REVISIONS = 10;

/** The one article editor. Reporters write and submit; editors publish, schedule and archive. */
export const ArticleEditor: React.FC<{ articleId?: string; go: (s: ScreenId, arg?: string) => void }> = ({ articleId, go }) => {
  const { articles, saveArticle, me, media, viewArticle, notify } = useNewsroom();
  const existing = articleId ? articles.find((a) => a.id === articleId) : undefined;
  const [d, setD] = useState<Draft>(() => (existing ? ({ ...blank(me.name), ...existing } as Draft) : blank(me.name)));
  const [id, setId] = useState<string | undefined>(existing?.id);
  const [tagText, setTagText] = useState((existing?.tags || []).join(', '));
  const [pointsText, setPointsText] = useState((existing?.highlights || []).join('\n'));
  const [scheduleAt, setScheduleAt] = useState(existing?.scheduledFor ? existing.scheduledFor.slice(0, 16) : '');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [correction, setCorrection] = useState('');
  const loadedFor = useRef(articleId);
  const [ai, setAi] = useState<{ title?: string; desc?: string; tags?: string[]; source?: string } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  /** Ask the server for SEO suggestions; the editor decides what to use. */
  const suggest = async () => {
    setAiBusy(true);
    try {
      const res = await authFetch('/api/ai/generate-seo-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: d.title, content: htmlToText(d.content).slice(0, 6000), category: d.category }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error || String(res.status));
      setAi({ title: json.data.metaTitle, desc: json.data.metaDescription, tags: json.data.tags, source: json.source });
    } catch (e: any) {
      notify(`AI suggestions are not available: ${e?.message || 'error'}`, 'error');
    } finally {
      setAiBusy(false);
    }
  };

  // If the article arrives after the editor opened (live data), load it once.
  useEffect(() => {
    if (existing && loadedFor.current === articleId && !dirty && d.title === '' && existing.title) {
      setD({ ...blank(me.name), ...existing } as Draft);
      setTagText((existing.tags || []).join(', '));
      setPointsText((existing.highlights || []).join('\n'));
    }
  }, [existing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const mine = !existing || existing.authorUid === me.uid;
  const locked = !me.isEditor && existing && !(mine && (!existing.status || existing.status === 'draft' || existing.status === 'pending_review'));
  const bodyWords = useMemo(() => words(d.content), [d.content]);
  const metaTitle = (d.seoTitle || d.title).trim();
  const metaDesc = (d.seoDescription || d.summary).trim();

  const checks = [
    { ok: d.title.trim().length >= 20 && d.title.trim().length <= 110, text: 'Headline is 20–110 characters' },
    { ok: d.summary.trim().length >= 60, text: 'Summary (deck) of at least 60 characters' },
    { ok: bodyWords >= 150, text: `Body has at least 150 words (now ${bodyWords})` },
    { ok: !!d.imageUrl, text: 'Lead image added' },
    { ok: !d.imageUrl || !!d.imageAltText?.trim(), text: 'Image has alt text' },
    { ok: !d.imageUrl || !!d.imageCredit?.trim(), text: 'Image credit given' },
    { ok: (d.tags || []).length > 0, text: 'At least one tag' },
    { ok: metaDesc.length >= 70 && metaDesc.length <= 160, text: 'Search description 70–160 characters' },
    { ok: !!d.authorName?.trim(), text: 'Byline set' },
  ];
  const ready = checks.filter((c) => c.ok).length;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (d.title.trim().length < 3) e.title = 'Write a headline (at least 3 characters).';
    if (d.title.length > 300) e.title = 'Headline is too long (300 characters max).';
    if (d.summary.length > 2000) e.summary = 'Summary is too long (2000 characters max).';
    if (!d.content.trim()) e.content = 'Write the article body.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (status: NewsArticle['status'], extra: Partial<NewsArticle> = {}) => {
    if (!validate()) {
      notify('Please fix the highlighted fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      const tags = tagText
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean)
        .slice(0, 12);
      const highlights = pointsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);
      const revisions = [...(existing?.revisions || [])];
      if (existing && (existing.content !== d.content || existing.title !== d.title || existing.summary !== d.summary)) {
        revisions.unshift({
          id: `rev_${Date.now()}`,
          savedAt: new Date().toISOString(),
          savedBy: me.name,
          title: existing.title,
          summary: existing.summary,
          content: existing.content,
        });
      }
      const payload: Partial<NewsArticle> = {
        ...d,
        id,
        tags,
        highlights,
        status,
        revisions: revisions.slice(0, MAX_REVISIONS),
        ...(me.isEditor ? {} : { authorName: d.authorName || me.name }),
        ...extra,
      };
      if (status !== 'scheduled') payload.scheduledFor = undefined;
      const newId = await saveArticle(payload);
      setId(newId);
      setD((p) => ({ ...p, status, ...extra }));
      setDirty(false);
      notify(
        status === 'published'
          ? 'Published.'
          : status === 'scheduled'
            ? `Scheduled for ${fmtDate(extra.scheduledFor)}.`
            : status === 'pending_review'
              ? 'Sent to editors for review.'
              : status === 'archived'
                ? 'Unpublished (archived).'
                : 'Draft saved.'
      );
    } catch {
      /* the error was shown by saveArticle */
    } finally {
      setSaving(false);
    }
  };

  const restore = (rev: NonNullable<NewsArticle['revisions']>[number]) => {
    if (!window.confirm(`Replace the current text with the version saved ${fmtDate(rev.savedAt)}? You still need to save afterwards.`)) return;
    setD((p) => ({ ...p, title: rev.title, summary: rev.summary, content: rev.content }));
    setDirty(true);
  };

  const addCorrection = () => {
    const text = correction.trim();
    if (!text) return;
    set('corrections', [...(d.corrections || []), { date: new Date().toISOString(), text }]);
    setCorrection('');
  };

  if (locked) {
    return (
      <div className="kd-nr__page">
        <PageHead title="Edit article" />
        <div className="kd-denied">
          This article is {STATUS_LABELS[existing?.status || ''] || 'locked'}. Only editors can change it now.{' '}
          <button type="button" className="kd-link" onClick={() => go('news')}>
            Back to news
          </button>
        </div>
      </div>
    );
  }

  const imageChoices = media.filter((m) => m.type === 'image' && m.url && !m.url.startsWith('data:')).slice(0, 60);

  return (
    <div className="kd-nr__page">
      <PageHead
        title={id ? 'Edit article' : 'New article'}
        sub={id ? `Status: ${STATUS_LABELS[d.status || ''] || 'No status'}${dirty ? ' · unsaved changes' : ''}` : 'Fill in the story, then save or publish.'}
        actions={
          <>
            <button
              type="button"
              className="kd-btn kd-btn--ghost"
              onClick={() => {
                if (dirty && !window.confirm('Leave without saving your changes?')) return;
                go('news');
              }}
            >
              Back
            </button>
            {id && existing && (
              <button type="button" className="kd-btn kd-btn--secondary" onClick={() => viewArticle({ ...existing, ...d } as NewsArticle)}>
                Preview
              </button>
            )}
          </>
        }
      />

      <div className="kd-editor">
        <div className="kd-form">
          <section className="kd-panel kd-form">
            <Field label="Headline" id="ed-title" error={errors.title} help={`${d.title.trim().length} characters`}>
              <input
                id="ed-title"
                className="kd-input kd-input--hi kd-input--title"
                value={d.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={300}
                lang="hi"
                aria-invalid={!!errors.title}
              />
            </Field>
            <Field label="Deck / summary" id="ed-summary" error={errors.summary} help="One or two sentences shown under the headline and in search results.">
              <textarea id="ed-summary" className="kd-textarea kd-textarea--hi" value={d.summary} onChange={(e) => set('summary', e.target.value)} lang="hi" rows={3} />
            </Field>
            <div className="kd-field">
              <span className="kd-field__label" id="ed-body-label">
                Body
              </span>
              <Suspense fallback={<div className="kd-skel" style={{ height: 320 }} />}>
                <VisualEditor value={d.content} onChange={(v) => set('content', v)} mediaLibrary={media} minHeightPx={360} />
              </Suspense>
              {errors.content && (
                <span className="kd-field__err" role="alert">
                  {errors.content}
                </span>
              )}
              <span className="kd-field__help">{bodyWords} words</span>
            </div>
            <Field label="Key points (one per line, optional, max 5)" id="ed-points">
              <textarea
                id="ed-points"
                className="kd-textarea kd-textarea--hi"
                value={pointsText}
                onChange={(e) => (setPointsText(e.target.value), setDirty(true))}
                rows={4}
                lang="hi"
              />
            </Field>
          </section>

          <section className="kd-panel kd-form kd-form--2" aria-labelledby="ed-image">
            <h2 id="ed-image" className="kd-span">
              Lead image
            </h2>
            <Field label="Image URL" id="ed-img" span help="Use an image at least 1200px wide that the newsroom has the right to publish.">
              <input id="ed-img" className="kd-input" type="url" value={d.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://…" />
            </Field>
            {imageChoices.length > 0 && (
              <Field label="…or pick from the media library" id="ed-imgpick" span>
                <select id="ed-imgpick" className="kd-select" value="" onChange={(e) => e.target.value && set('imageUrl', e.target.value)}>
                  <option value="">Choose an image</option>
                  {imageChoices.map((m) => (
                    <option key={m.id} value={m.url}>
                      {m.title || m.altText || m.url}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Alt text (describe the image)" id="ed-alt">
              <input id="ed-alt" className="kd-input kd-input--hi" value={d.imageAltText || ''} onChange={(e) => set('imageAltText', e.target.value)} lang="hi" />
            </Field>
            <Field label="Credit" id="ed-credit" help="Photographer or agency">
              <input id="ed-credit" className="kd-input kd-input--hi" value={d.imageCredit || ''} onChange={(e) => set('imageCredit', e.target.value)} lang="hi" />
            </Field>
            <Field label="Caption" id="ed-caption" span>
              <input id="ed-caption" className="kd-input kd-input--hi" value={d.imageCaption || ''} onChange={(e) => set('imageCaption', e.target.value)} lang="hi" />
            </Field>
            {d.imageUrl && (
              <img src={d.imageUrl} alt="" className="kd-span" style={{ maxWidth: 360, borderRadius: 6, border: '1px solid var(--kd-line)' }} />
            )}
          </section>

          <section className="kd-panel kd-form kd-form--2" aria-labelledby="ed-byline">
            <h2 id="ed-byline" className="kd-span">
              Byline
            </h2>
            <Field label="Author name" id="ed-author" help={me.isEditor ? 'As readers will see it. Links to the author page.' : 'Your byline.'}>
              <input
                id="ed-author"
                className="kd-input kd-input--hi"
                value={d.authorName || ''}
                onChange={(e) => set('authorName', e.target.value)}
                readOnly={!me.isEditor}
                lang="hi"
              />
            </Field>
            <Field label="Author role (optional)" id="ed-role">
              <input id="ed-role" className="kd-input kd-input--hi" value={d.authorRole || ''} onChange={(e) => set('authorRole', e.target.value)} lang="hi" />
            </Field>
            <Field label="Short author bio (optional, real information only)" id="ed-bio" span>
              <textarea id="ed-bio" className="kd-textarea kd-textarea--hi" value={d.authorBio || ''} onChange={(e) => set('authorBio', e.target.value)} rows={2} lang="hi" />
            </Field>
            <Field label="Location (dateline)" id="ed-loc">
              <input id="ed-loc" className="kd-input kd-input--hi" value={d.location || ''} onChange={(e) => set('location', e.target.value)} lang="hi" />
            </Field>
            <Field label="Source / attribution (optional)" id="ed-src">
              <input id="ed-src" className="kd-input kd-input--hi" value={d.sourceAttribution || ''} onChange={(e) => set('sourceAttribution', e.target.value)} lang="hi" />
            </Field>
          </section>

          <section className="kd-panel kd-form" aria-labelledby="ed-seo">
            <h2 id="ed-seo">Search and sharing</h2>
            <Field label="Search title (optional)" id="ed-seotitle" help={`${metaTitle.length} characters; the headline is used when empty.`}>
              <input id="ed-seotitle" className="kd-input kd-input--hi" value={d.seoTitle || ''} onChange={(e) => set('seoTitle', e.target.value)} lang="hi" />
            </Field>
            <Field label="Search description (optional)" id="ed-seodesc" help={`${metaDesc.length} characters (70–160 recommended); the summary is used when empty.`}>
              <textarea id="ed-seodesc" className="kd-textarea kd-textarea--hi" value={d.seoDescription || ''} onChange={(e) => set('seoDescription', e.target.value)} rows={2} lang="hi" />
            </Field>
            <div>
              <button type="button" className="kd-btn kd-btn--secondary kd-btn--sm" onClick={suggest} disabled={aiBusy || bodyWords < 30}>
                {aiBusy ? 'Thinking…' : 'Suggest with AI'}
              </button>
              <span className="kd-field__help" style={{ marginLeft: 8 }}>
                Suggestions only — check facts and wording before using them.
              </span>
            </div>
            {ai && (
              <div className="kd-panel" style={{ background: 'var(--kd-surface-2)' }} aria-live="polite">
                {ai.source === 'nlp-fallback' && <p className="kd-field__help">AI service not configured; these are simple automatic suggestions.</p>}
                {ai.title && (
                  <p lang="hi" style={{ margin: '0 0 6px' }}>
                    <strong>Title:</strong> {ai.title}{' '}
                    <button type="button" className="kd-link" onClick={() => set('seoTitle', ai.title!)}>
                      Use
                    </button>
                  </p>
                )}
                {ai.desc && (
                  <p lang="hi" style={{ margin: '0 0 6px' }}>
                    <strong>Description:</strong> {ai.desc}{' '}
                    <button type="button" className="kd-link" onClick={() => set('seoDescription', ai.desc!)}>
                      Use
                    </button>
                  </p>
                )}
                {ai.tags && ai.tags.length > 0 && (
                  <p lang="hi" style={{ margin: 0 }}>
                    <strong>Tags:</strong> {ai.tags.join(', ')}{' '}
                    <button type="button" className="kd-link" onClick={() => (setTagText(ai.tags!.join(', ')), setDirty(true))}>
                      Use
                    </button>
                  </p>
                )}
              </div>
            )}
            <div className="kd-serp" aria-label="Search result preview">
              <div className="kd-serp__url">khabridost.com › article › {id || 'new'}</div>
              <div className="kd-serp__title">{(metaTitle || 'Headline').slice(0, 70)} | खबरी दोस्त</div>
              <div className="kd-serp__desc">{metaDesc.slice(0, 160) || 'Summary…'}</div>
            </div>
          </section>

          {id && (
            <section className="kd-panel kd-form" aria-labelledby="ed-corr">
              <h2 id="ed-corr">Corrections</h2>
              <p className="kd-panel__note">Corrections are shown to readers at the end of the article with the date.</p>
              {(d.corrections || []).length > 0 && (
                <ul className="kd-checklist">
                  {d.corrections!.map((c, i) => (
                    <li key={i}>
                      <span>{fmtDate(c.date)}:</span> <span lang="hi">{c.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Field label="Add a correction note" id="ed-corrtext">
                <textarea id="ed-corrtext" className="kd-textarea kd-textarea--hi" value={correction} onChange={(e) => setCorrection(e.target.value)} rows={2} lang="hi" />
              </Field>
              <div>
                <button type="button" className="kd-btn kd-btn--secondary" onClick={addCorrection} disabled={!correction.trim()}>
                  Add correction
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="kd-editor__side" aria-label="Publishing">
          <section className="kd-panel kd-form">
            <h2>Publish</h2>
            <div>
              <StatusPill status={d.status} />
            </div>
            <Field label="Category" id="ed-cat">
              <select id="ed-cat" className="kd-select" value={d.category} onChange={(e) => set('category', e.target.value as NewsCategory)}>
                {CATEGORY_IDS.filter((c) => c !== 'trending').map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)} ({c})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags (comma separated)" id="ed-tags">
              <input id="ed-tags" className="kd-input kd-input--hi" value={tagText} onChange={(e) => (setTagText(e.target.value), setDirty(true))} lang="hi" />
            </Field>
            {me.isEditor && (
              <>
                <label className="kd-check">
                  <input type="checkbox" checked={!!d.isBreaking} onChange={(e) => set('isBreaking', e.target.checked)} />
                  <span>Breaking news (shows the red band for 24 hours)</span>
                </label>
                <label className="kd-check">
                  <input type="checkbox" checked={!!d.isTopStory} onChange={(e) => set('isTopStory', e.target.checked)} />
                  <span>Lead story on the homepage</span>
                </label>
              </>
            )}

            <div className="kd-form" style={{ gap: 8 }}>
              <button type="button" className="kd-btn kd-btn--secondary kd-btn--block" disabled={saving} onClick={() => save(me.isEditor ? (d.status === 'published' ? 'published' : 'draft') : 'draft')}>
                {d.status === 'published' && me.isEditor ? 'Update' : 'Save draft'}
              </button>
              {!me.isEditor && (
                <button type="button" className="kd-btn kd-btn--primary kd-btn--block" disabled={saving} onClick={() => save('pending_review')}>
                  Submit for review
                </button>
              )}
              {me.isEditor && d.status !== 'published' && (
                <button type="button" className="kd-btn kd-btn--primary kd-btn--block" disabled={saving} onClick={() => save('published')}>
                  Publish now
                </button>
              )}
              {me.isEditor && (
                <>
                  <Field label="Schedule for (your local time)" id="ed-sched">
                    <input id="ed-sched" className="kd-input" type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                  </Field>
                  <button
                    type="button"
                    className="kd-btn kd-btn--secondary kd-btn--block"
                    disabled={saving || !scheduleAt || Date.parse(scheduleAt) <= Date.now()}
                    onClick={() => save('scheduled', { scheduledFor: new Date(scheduleAt).toISOString() })}
                  >
                    Schedule
                  </button>
                  <p className="kd-field__help">
                    Scheduled articles go live when an editor has the newsroom open at or after that time (server scheduling is not set up yet).
                  </p>
                  {d.status === 'published' && (
                    <button type="button" className="kd-btn kd-btn--danger kd-btn--block" disabled={saving} onClick={() => save('archived')}>
                      Unpublish
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="kd-panel" aria-labelledby="ed-check">
            <h2 id="ed-check">
              Checklist ({ready}/{checks.length})
            </h2>
            <ul className="kd-checklist">
              {checks.map((c) => (
                <li key={c.text}>
                  <span className={c.ok ? 'ok' : 'todo'} aria-hidden="true">
                    {c.ok ? '✓' : '●'}
                  </span>
                  <span>
                    <span className="sr-only">{c.ok ? 'Done: ' : 'To do: '}</span>
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {(existing?.revisions || []).length > 0 && (
            <section className="kd-panel" aria-labelledby="ed-revs">
              <h2 id="ed-revs">Earlier versions</h2>
              <ul className="kd-checklist">
                {existing!.revisions!.map((r) => (
                  <li key={r.id} style={{ justifyContent: 'space-between' }}>
                    <span>
                      {fmtDate(r.savedAt)} · {r.savedBy}
                    </span>
                    <button type="button" className="kd-link" onClick={() => restore(r)}>
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};
