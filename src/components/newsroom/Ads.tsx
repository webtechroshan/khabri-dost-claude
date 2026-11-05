import React, { useState } from 'react';
import { useNewsroom, PageHead, Field, Denied } from './context';
import type { SidebarAdSlotConfig, SidebarAdsConfig } from '../../types/news';

type SlotKey = 'topSlot' | 'middleSlot' | 'bottomSlot';
const SLOTS: Array<{ key: SlotKey; name: string; where: string; size: string }> = [
  { key: 'topSlot', name: 'Sidebar top', where: 'Top of the sidebar on home, category and article pages (desktop).', size: '336×280 (300×250 also fits)' },
  { key: 'middleSlot', name: 'Sidebar sticky', where: 'Lower sidebar; stays in view while scrolling (desktop).', size: '300×600' },
  { key: 'bottomSlot', name: 'In-content', where: 'Between homepage sections (728×90) and inside articles after the 3rd paragraph (336×280).', size: '728×90 / 336×280' },
];

/** All ad placements in one place. Only real ads render; nothing is shown until configured. */
export const Ads: React.FC = () => {
  const { settings, saveSettings, me, notify } = useNewsroom();
  const [cfg, setCfg] = useState<SidebarAdsConfig>(() => ({ ...(settings.sidebarAdsConfig as SidebarAdsConfig) }));
  const [client, setClient] = useState(settings.googleServices?.adsenseClientId || '');
  const [saving, setSaving] = useState(false);
  if (!me.isAdmin) return <Denied what="managing advertisements" />;

  const setSlot = (k: SlotKey, patch: Partial<SidebarAdSlotConfig>) => setCfg((c) => ({ ...c, [k]: { ...(c[k] as SidebarAdSlotConfig), ...patch } }));
  const clientOk = !client || /^ca-pub-\d{10,20}$/.test(client.trim());

  const save = async () => {
    if (!clientOk) {
      notify('The AdSense publisher ID looks wrong (ca-pub- followed by digits).', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveSettings({
        sidebarAdsConfig: cfg,
        googleServices: { ...(settings.googleServices as any), adsenseClientId: client.trim() },
      });
      notify('Advertisements saved.');
    } catch {
      notify('Could not save. Check your connection and role.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="kd-nr__page">
      <PageHead title="Advertisements" sub="Every slot reserves its space and is labelled “विज्ञापन”. Empty or unconfigured slots are not shown." />
      <section className="kd-panel kd-form">
        <h2>Google AdSense</h2>
        <Field label="Publisher ID" id="ad-client" help="From your AdSense account, e.g. ca-pub-1234567890123456. Leave empty if you do not use AdSense." error={clientOk ? undefined : 'Format: ca-pub- followed by 10–20 digits.'}>
          <input id="ad-client" className="kd-input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="ca-pub-…" />
        </Field>
        <p className="kd-help">
          Remember to publish your ads.txt line with your ad provider. Custom 350px-wide creatives are a direct-sale size, not a Google standard size —
          use them only as direct ads.
        </p>
      </section>

      {SLOTS.map((s) => {
        const slot = (cfg[s.key] || {}) as SidebarAdSlotConfig;
        return (
          <section key={s.key} className="kd-panel kd-form kd-form--2" aria-labelledby={`ad-${s.key}`}>
            <h2 id={`ad-${s.key}`} className="kd-span">
              {s.name} <span className="kd-help">· {s.size}</span>
            </h2>
            <p className="kd-panel__note kd-span">{s.where}</p>
            <label className="kd-check kd-span">
              <input type="checkbox" checked={!!slot.enabled} onChange={(e) => setSlot(s.key, { enabled: e.target.checked })} />
              <span>Show this slot</span>
            </label>
            <Field label="Source" id={`ad-${s.key}-type`}>
              <select id={`ad-${s.key}-type`} className="kd-select" value={slot.adType || 'private'} onChange={(e) => setSlot(s.key, { adType: e.target.value as 'private' | 'adsense' })}>
                <option value="private">Direct ad (image + link)</option>
                <option value="adsense">Google AdSense unit</option>
              </select>
            </Field>
            {slot.adType === 'adsense' ? (
              <Field label="AdSense ad unit (slot) ID" id={`ad-${s.key}-slot`} help="Digits only, from the AdSense ad unit.">
                <input id={`ad-${s.key}-slot`} className="kd-input" inputMode="numeric" value={slot.adSlotId || ''} onChange={(e) => setSlot(s.key, { adSlotId: e.target.value.replace(/\D/g, '') })} />
              </Field>
            ) : (
              <>
                <Field label="Creative image URL" id={`ad-${s.key}-img`} help={`Exact size ${s.size.split(' ')[0]}`}>
                  <input id={`ad-${s.key}-img`} className="kd-input" type="url" value={slot.bannerUrl || ''} onChange={(e) => setSlot(s.key, { bannerUrl: e.target.value })} placeholder="https://…" />
                </Field>
                <Field label="Click-through link" id={`ad-${s.key}-link`}>
                  <input id={`ad-${s.key}-link`} className="kd-input" type="url" value={slot.bannerLink || ''} onChange={(e) => setSlot(s.key, { bannerLink: e.target.value })} placeholder="https://…" />
                </Field>
                <Field label="Advertiser / alt text" id={`ad-${s.key}-alt`}>
                  <input id={`ad-${s.key}-alt`} className="kd-input" value={slot.altText || ''} onChange={(e) => setSlot(s.key, { altText: e.target.value, bannerTitle: e.target.value })} />
                </Field>
              </>
            )}
          </section>
        );
      })}
      <div className="kd-savebar">
        <button type="button" className="kd-btn kd-btn--primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save advertisements'}
        </button>
      </div>
    </div>
  );
};
