import React from 'react';
import { ArticleSidebarWidgets } from '../../types/news';

interface GoldRateWidgetProps {
  config?: ArticleSidebarWidgets;
  isAdmin?: boolean;
  onOpenAdminSettings?: () => void;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/**
 * Gold and silver rates entered by the newsroom. Nothing is estimated or fetched: when no rate or
 * date has been entered the widget is hidden from readers (administrators see a short hint).
 */
export const GoldRateWidget: React.FC<GoldRateWidgetProps> = ({ config, isAdmin, onOpenAdminSettings }) => {
  const r24 = Number(config?.goldRate24k) || 0;
  const r22 = Number(config?.goldRate22k) || 0;
  const silver = Number(config?.silverRate1kg) || 0;
  const date = (config?.goldRateUpdateDate || '').trim();
  const hasData = date && (r24 > 0 || r22 > 0 || silver > 0);

  if (!hasData) {
    if (!isAdmin) return null;
    return (
      <section className="kd-widget" lang="en">
        <p className="kd-help">
          Gold rate widget is hidden: enter today's rates and the date in settings.{' '}
          {onOpenAdminSettings && (
            <button type="button" className="kd-link" onClick={onOpenAdminSettings}>
              Open settings
            </button>
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="kd-widget" aria-labelledby="gold-rate-title">
      <h2 id="gold-rate-title" className="kd-widget__title">
        {config?.goldRateWidgetTitle || 'सोने-चांदी का भाव'}
      </h2>
      <dl className="kd-rates">
        {r24 > 0 && (
          <div>
            <dt>सोना 24 कैरेट (10 ग्राम)</dt>
            <dd>{inr(r24)}</dd>
          </div>
        )}
        {r22 > 0 && (
          <div>
            <dt>सोना 22 कैरेट (10 ग्राम)</dt>
            <dd>{inr(r22)}</dd>
          </div>
        )}
        {silver > 0 && (
          <div>
            <dt>चांदी (1 किलो)</dt>
            <dd>{inr(silver)}</dd>
          </div>
        )}
      </dl>
      <p className="kd-meta">
        {config?.goldRateCity ? `${config.goldRateCity} · ` : ''}
        {date} · स्रोत: खबरी दोस्त डेस्क
      </p>
    </section>
  );
};
