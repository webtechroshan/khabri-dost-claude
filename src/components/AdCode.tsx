import React, { useEffect, useRef } from 'react';
import { sanitizeArticleHtml } from '../utils/sanitizeHtml';

/**
 * Renders advertiser code safely.
 *
 * - Google AdSense snippets are recognised by their `data-ad-client` / `data-ad-slot` values and
 *   rendered as a proper `<ins class="adsbygoogle">` unit (the AdSense loader script is added once).
 * - Anything else is treated as a static creative (image + link) and sanitised: scripts, event
 *   handlers and unknown iframes are removed. Arbitrary third-party JavaScript is not executed.
 */
export function parseAdSenseSnippet(code: string): { client: string; slot: string; format?: string } | null {
  const client = /data-ad-client\s*=\s*["'](ca-pub-\d{6,20})["']/i.exec(code)?.[1];
  const slot = /data-ad-slot\s*=\s*["'](\d{4,20})["']/i.exec(code)?.[1];
  if (!client || !slot) return null;
  const format = /data-ad-format\s*=\s*["']([a-z,-]{2,30})["']/i.exec(code)?.[1];
  return { client, slot, format };
}

const LOADER_ID = 'kd-adsense-loader';

function ensureAdSenseLoader(client: string) {
  if (document.getElementById(LOADER_ID)) return;
  const s = document.createElement('script');
  s.id = LOADER_ID;
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(s);
}

export const AdSenseUnit: React.FC<{ client: string; slot: string; format?: string; className?: string; style?: React.CSSProperties }> = ({
  client,
  slot,
  format,
  className,
  style,
}) => {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    if (!/^ca-pub-\d+$/.test(client)) return;
    ensureAdSenseLoader(client);
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not ready; it will fill when loaded.
    }
  }, [client, slot]);
  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format || 'auto'}
      data-full-width-responsive="true"
    />
  );
};

export const AdCode: React.FC<{ code: string; className?: string; style?: React.CSSProperties }> = ({ code, className, style }) => {
  const adsense = parseAdSenseSnippet(code || '');
  if (adsense) return <AdSenseUnit {...adsense} className={className} style={style} />;
  const html = sanitizeArticleHtml(code);
  if (!html.trim()) return null;
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};
