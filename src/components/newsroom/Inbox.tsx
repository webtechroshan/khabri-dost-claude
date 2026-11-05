import React, { useState } from 'react';
import { useNewsroom, PageHead, Denied, fmtDate } from './context';
import type { CitizenNewsSubmission, ContactInquiry } from '../../types/news';

const TIP_STATUS: Record<CitizenNewsSubmission['status'], string> = { pending: 'New', verified: 'Verified', rejected: 'Rejected', published: 'Used in a story' };
const MAIL_STATUS: Record<ContactInquiry['status'], string> = { new: 'New', in_review: 'In progress', replied: 'Replied', archived: 'Archived' };

/** Reader news tips and contact-form messages (Firestore). */
export const Inbox: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const { submissions, inquiries, updateSubmission, deleteSubmission, updateInquiry, deleteInquiry, me } = useNewsroom();
  const [tab, setTab] = useState(initialTab === 'contact' ? 'contact' : 'tips');
  const [open, setOpen] = useState<string | null>(null);
  if (!me.isEditor) return <Denied what="reading the inbox" />;

  return (
    <div className="kd-nr__page">
      <PageHead title="Inbox" sub="News tips sent by readers and messages from the contact form. Contact details are private." />
      <div className="kd-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'tips'} onClick={() => setTab('tips')}>
          News tips ({submissions.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === 'contact'} onClick={() => setTab('contact')}>
          Contact messages ({inquiries.length})
        </button>
      </div>

      {tab === 'tips' &&
        (submissions.length === 0 ? (
          <p className="kd-denied">No news tips yet.</p>
        ) : (
          <div className="kd-form">
            {submissions.map((s) => (
              <article key={s.id} className="kd-panel">
                <div className="kd-nr__head">
                  <div>
                    <strong lang="hi" style={{ fontFamily: 'var(--kd-font)', fontSize: 16 }}>
                      {s.title}
                    </strong>
                    <p>
                      {s.id} · {fmtDate(s.submittedAt)} · {s.location || '—'} · {TIP_STATUS[s.status] || s.status}
                    </p>
                  </div>
                  <div className="kd-nr__actions">
                    <button type="button" className="kd-btn kd-btn--secondary kd-btn--sm" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>
                      {open === s.id ? 'Hide' : 'Read'}
                    </button>
                    <label className="sr-only" htmlFor={`tip-${s.id}`}>
                      Status
                    </label>
                    <select
                      id={`tip-${s.id}`}
                      className="kd-select"
                      style={{ width: 'auto' }}
                      value={s.status}
                      onChange={(e) => updateSubmission(s.id, e.target.value as CitizenNewsSubmission['status'])}
                    >
                      {Object.entries(TIP_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    {me.isAdmin && (
                      <button
                        type="button"
                        className="kd-btn kd-btn--danger kd-btn--sm"
                        onClick={() => window.confirm('Delete this tip?') && deleteSubmission(s.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {open === s.id && (
                  <div className="kd-form" style={{ marginTop: 12 }}>
                    <p lang="hi" style={{ fontFamily: 'var(--kd-font)', fontSize: 16, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {s.description}
                    </p>
                    {s.images?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {s.images.map((src, i) => (
                          <img key={i} src={src} alt={`Reader photo ${i + 1}`} style={{ width: 160, borderRadius: 6, border: '1px solid var(--kd-line)' }} />
                        ))}
                      </div>
                    )}
                    {s.videoUrl && (
                      <p>
                        Video link:{' '}
                        <a href={s.videoUrl} target="_blank" rel="noopener noreferrer nofollow">
                          {s.videoUrl}
                        </a>
                      </p>
                    )}
                    <p className="kd-help">
                      Sender: {s.isAnonymous ? 'asked to stay anonymous' : s.senderName || '—'}
                      {s.senderPhone ? ` · ${s.senderPhone}` : ''}
                      {s.senderEmail ? ` · ${s.senderEmail}` : ''}
                    </p>
                    <p className="kd-help">Verify every tip independently before reporting it.</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        ))}

      {tab === 'contact' &&
        (inquiries.length === 0 ? (
          <p className="kd-denied">No messages yet.</p>
        ) : (
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th scope="col">From</th>
                  <th scope="col">Message</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.name}
                      <span className="kd-table__sub">
                        <a href={`mailto:${m.email}`}>{m.email}</a>
                        {m.phone ? ` · ${m.phone}` : ''}
                      </span>
                    </td>
                    <td className="kd-table__title">
                      {m.subject || '—'}
                      <span className="kd-table__sub" style={{ whiteSpace: 'pre-wrap' }}>
                        {m.message}
                      </span>
                    </td>
                    <td>{fmtDate(m.submittedAt)}</td>
                    <td>
                      <label className="sr-only" htmlFor={`mail-${m.id}`}>
                        Status
                      </label>
                      <select id={`mail-${m.id}`} className="kd-select" value={m.status} onChange={(e) => updateInquiry(m.id, e.target.value as ContactInquiry['status'])}>
                        {Object.entries(MAIL_STATUS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="kd-btn kd-btn--danger kd-btn--sm" onClick={() => window.confirm('Delete this message?') && deleteInquiry(m.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
};
