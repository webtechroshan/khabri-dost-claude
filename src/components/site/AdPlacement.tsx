import React from 'react';
import type { SidebarAdSlotConfig as SidebarAdSlot } from '../../types/news';
import { AdSenseUnit } from '../AdCode';

export type AdSize = '300x250' | '336x280' | '300x600' | '350x300' | '728x90' | '970x250' | '320x50' | '320x100';

interface Props {
  slot?: Partial<SidebarAdSlot> | null;
  /** AdSense publisher id from settings (ca-pub-…). */
  adsenseClient?: string;
  size: AdSize;
  className?: string;
}

const dims = (size: AdSize) => {
  const [w, h] = size.split('x').map(Number);
  return { w, h };
};

/**
 * One ad placement with a reserved box (no layout shift) and an "विज्ञापन" label.
 * Renders nothing unless a real ad is configured: an uploaded direct creative, or an AdSense
 * unit with a real publisher id and slot id. Note: 350px-wide creatives are a custom
 * direct-sale size, not a Google standard size.
 */
export const AdPlacement: React.FC<Props> = ({ slot, adsenseClient, size, className }) => {
  if (!slot || !slot.enabled) return null;
  const { w, h } = dims(size);
  const isAdSense =
    slot.adType === 'adsense' && /^ca-pub-\d{10,20}$/.test(adsenseClient || '') && /^\d{4,20}$/.test(slot.adSlotId || '');
  const isDirect = slot.adType === 'private' && !!slot.bannerUrl && /^https?:\/\/|^\//.test(slot.bannerUrl);
  if (!isAdSense && !isDirect) return null;

  return (
    <aside className={`kd-ad ${className || ''}`} aria-label="विज्ञापन">
      <span className="kd-ad__label">विज्ञापन</span>
      <div className="kd-ad__slot" style={{ width: w, height: h, maxWidth: '100%' }}>
        {isAdSense ? (
          <AdSenseUnit client={adsenseClient!} slot={slot.adSlotId!} format="rectangle" style={{ width: w, height: h }} />
        ) : (
          <a href={slot.bannerLink || undefined} target="_blank" rel="sponsored noopener noreferrer">
            <img src={slot.bannerUrl} alt={slot.altText || slot.bannerTitle || 'विज्ञापन'} width={w} height={h} loading="lazy" />
          </a>
        )}
      </div>
    </aside>
  );
};
