import React, { createContext, useContext } from 'react';
import type {
  NewsArticle,
  PortalSettings,
  MediaAsset,
  LiveBlogEvent,
  EditorialUser,
  ContactInquiry,
  CitizenNewsSubmission,
} from '../../types/news';

export interface NewsroomData {
  articles: NewsArticle[];
  settings: PortalSettings;
  saveSettings: (patch: Partial<PortalSettings>) => Promise<void>;
  /** Creates when there is no id; resolves to the article id. */
  saveArticle: (a: Partial<NewsArticle>) => Promise<string>;
  deleteArticle: (id: string) => Promise<void>;
  media: MediaAsset[];
  addMedia: (m: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
  updateMedia: (m: Partial<MediaAsset> & { id: string }) => void;
  deleteMedia: (id: string) => void;
  liveBlogs: LiveBlogEvent[];
  addLiveBlog: (b: LiveBlogEvent) => void;
  updateLiveBlog: (b: LiveBlogEvent) => void;
  deleteLiveBlog: (id: string) => void;
  staff: EditorialUser[];
  addStaff: (u: Omit<EditorialUser, 'id' | 'joinedAt'>) => void;
  updateStaff: (u: Partial<EditorialUser> & { id: string }) => void;
  deleteStaff: (id: string) => void;
  inquiries: ContactInquiry[];
  updateInquiry: (id: string, status: ContactInquiry['status']) => void;
  deleteInquiry: (id: string) => void;
  submissions: CitizenNewsSubmission[];
  updateSubmission: (id: string, status: CitizenNewsSubmission['status'], notes?: string) => void;
  deleteSubmission: (id: string) => void;
  /** Signed-in member. */
  me: { uid: string; email: string; name: string; role: string; isEditor: boolean; isAdmin: boolean; isOwner: boolean };
  /** Open a public page (closes the newsroom). */
  viewArticle: (a: NewsArticle) => void;
  notify: (message: string, tone?: 'ok' | 'error') => void;
}

const Ctx = createContext<NewsroomData | null>(null);
export const NewsroomProvider = Ctx.Provider;
export function useNewsroom(): NewsroomData {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNewsroom outside NewsroomProvider');
  return v;
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'In review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

export const StatusPill: React.FC<{ status?: string }> = ({ status }) => (
  <span className={`kd-pill kd-pill--${status || 'none'}`}>{status ? STATUS_LABELS[status] || status : 'No status'}</span>
);

export const PageHead: React.FC<{ title: string; sub?: string; actions?: React.ReactNode }> = ({ title, sub, actions }) => (
  <header className="kd-nr__head">
    <div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {actions && <div className="kd-nr__actions">{actions}</div>}
  </header>
);

export const Field: React.FC<{ label: string; id: string; help?: string; error?: string; span?: boolean; children: React.ReactNode }> = ({
  label,
  id,
  help,
  error,
  span,
  children,
}) => (
  <div className={`kd-field${span ? ' kd-span' : ''}`}>
    <label htmlFor={id}>{label}</label>
    {children}
    {help && (
      <span className="kd-field__help" id={`${id}-help`}>
        {help}
      </span>
    )}
    {error && (
      <span className="kd-field__err" role="alert">
        {error}
      </span>
    )}
  </div>
);

export const Denied: React.FC<{ what: string }> = ({ what }) => (
  <div className="kd-denied" role="note">
    Your role does not allow {what}. Ask an administrator if you need access.
  </div>
);

export const fmtDate = (iso?: string) => {
  const t = Date.parse(iso || '');
  if (Number.isNaN(t)) return '—';
  return new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};
