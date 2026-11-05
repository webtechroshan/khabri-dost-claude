import React, { useEffect, useState } from 'react';
import { PageHead, Denied, fmtDate, useNewsroom } from './context';
import { subscribeSubscribersFirestore } from '../../services/newsService';
import type { SubscriberItem } from '../../types/news';

/** Newsletter subscribers (Firestore). Sending is not connected to a mail service yet. */
export const Audience: React.FC = () => {
  const { me } = useNewsroom();
  const [subs, setSubs] = useState<SubscriberItem[] | null>(null);
  useEffect(() => (me.isAdmin ? subscribeSubscribersFirestore(setSubs) : undefined), [me.isAdmin]);
  if (!me.isAdmin) return <Denied what="viewing subscribers" />;

  const exportCsv = () => {
    const rows = [['email', 'name', 'status', 'source', 'subscribedAt'], ...(subs || []).map((s) => [s.email, s.name || '', s.status, s.source, s.subscribedAt])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="kd-nr__page">
      <PageHead
        title="Audience"
        sub="Newsletter sign-ups. Sending newsletters and push notifications needs a mail/push service, which is not connected yet."
        actions={
          <button type="button" className="kd-btn kd-btn--secondary" onClick={exportCsv} disabled={!subs?.length}>
            Export CSV
          </button>
        }
      />
      {subs === null ? (
        <div className="kd-skel" style={{ height: 120 }} />
      ) : subs.length === 0 ? (
        <p className="kd-denied">No subscribers yet.</p>
      ) : (
        <div className="kd-table-wrap">
          <table className="kd-table">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Source</th>
                <th scope="col">Since</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.email}
                    {s.name && <span className="kd-table__sub">{s.name}</span>}
                  </td>
                  <td>{s.status}</td>
                  <td>{s.source}</td>
                  <td>{fmtDate(s.subscribedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
