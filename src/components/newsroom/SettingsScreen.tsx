import React, { useState } from 'react';
import { useNewsroom, PageHead, Field, Denied } from './context';
import { CATEGORY_IDS } from '../../utils/routes';
import { CATEGORY_LABELS } from '../../utils/head';
import type { HeaderFooterSettings, PortalSettings } from '../../types/news';

type Section = 'branding' | 'navigation' | 'contact' | 'social' | 'policies' | 'epaper';
const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: 'branding', label: 'Branding' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'contact', label: 'Contact & legal' },
  { id: 'social', label: 'Social links' },
  { id: 'policies', label: 'Policy pages' },
];

const POLICY_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'editorialEthics', label: 'Editorial policy' },
  { key: 'correctionPolicy', label: 'Corrections policy' },
  { key: 'factCheckPolicy', label: 'Fact-checking policy' },
  { key: 'privacyPolicy', label: 'Privacy policy' },
  { key: 'termsOfService', label: 'Terms of use' },
  { key: 'cookiePolicy', label: 'Cookie policy' },
  { key: 'grievanceRedressal', label: 'Grievance redressal' },
  { key: 'disclaimer', label: 'Disclaimer' },
  { key: 'dmcaNotice', label: 'DMCA / copyright' },
];

const SOCIAL_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'whatsappChannel', label: 'WhatsApp channel' },
  { key: 'telegramChannel', label: 'Telegram' },
  { key: 'facebook', label: 'Facebook page' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'googleNews', label: 'Google News' },
];

/** Site settings that actually change the public site. */
export const SettingsScreen: React.FC<{ initialSection?: string }> = ({ initialSection }) => {
  const { settings, saveSettings, me, notify } = useNewsroom();
  const [section, setSection] = useState<Section>((SECTIONS.find((s) => s.id === initialSection)?.id as Section) || 'branding');
  const [hf, setHf] = useState<HeaderFooterSettings>(() => JSON.parse(JSON.stringify(settings.headerFooter || {})));
  const [policy, setPolicy] = useState('editorialEthics');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  if (!me.isAdmin) return <Denied what="changing site settings" />;

  const set = (patch: Partial<HeaderFooterSettings>) => {
    setHf((h) => ({ ...h, ...patch }));
    setDirty(true);
  };
  const known = CATEGORY_IDS.filter((c) => c !== 'trending') as string[];
  const order: string[] = [...((hf.navCategoryOrder as string[]) || known).filter((c) => known.includes(c)), ...known.filter((c) => !((hf.navCategoryOrder as string[]) || known).includes(c))];
  const disabled = new Set((hf.disabledCategories as string[]) || []);
  const labels = (hf.customCategoryLabels || {}) as Record<string, string>;
  const move = (id: string, dir: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    set({ navCategoryOrder: next as any });
  };

  const urlOk = (u?: string) => !u || /^https?:\/\//.test(u) || u.startsWith('/');
  const save = async () => {
    const links = (hf.socialLinks || {}) as unknown as Record<string, string>;
    const bad = [hf.logoUrl, hf.faviconUrl, ...Object.values(links)].filter((u) => !urlOk(u));
    if (bad.length) {
      notify('Links must start with https:// (or / for files on this site).', 'error');
      return;
    }
    if (hf.primaryBrandColor && !/^#[0-9a-f]{6}$/i.test(hf.primaryBrandColor)) {
      notify('Brand colour must be a 6-digit hex value such as #dc2626.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveSettings({ headerFooter: hf } as Partial<PortalSettings>);
      setDirty(false);
      notify('Settings saved. The public site updates right away.');
    } catch {
      notify('Could not save. Check your connection and role.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const policies = ((hf as any).legalPolicies || {}) as Record<string, string>;

  return (
    <div className="kd-nr__page">
      <PageHead title="Settings" sub="Only settings that change the public site are shown here." />
      <div className="kd-tabs" role="tablist">
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={section === s.id} onClick={() => setSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'branding' && (
        <section className="kd-panel kd-form kd-form--2">
          <Field label="Site name (Hindi)" id="s-name" help="Shown as the wordmark when there is no logo.">
            <input id="s-name" className="kd-input kd-input--hi" value={hf.siteTitleHindi || ''} onChange={(e) => set({ siteTitleHindi: e.target.value })} placeholder="खबरी दोस्त" />
          </Field>
          <Field label="Footer name" id="s-footname" help="Shown after © in the footer.">
            <input id="s-footname" className="kd-input kd-input--hi" value={hf.footerBottomName || ''} onChange={(e) => set({ footerBottomName: e.target.value })} />
          </Field>
          <Field label="Logo image URL" id="s-logo" help="PNG or SVG with a transparent background, about 220×56px.">
            <input id="s-logo" className="kd-input" value={hf.logoUrl || ''} onChange={(e) => set({ logoUrl: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Favicon URL" id="s-fav">
            <input id="s-fav" className="kd-input" value={hf.faviconUrl || ''} onChange={(e) => set({ faviconUrl: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Brand colour" id="s-color" help="Used for links, buttons and section rules. Darker shades are calculated for readable text.">
            <input id="s-color" className="kd-input" value={hf.primaryBrandColor || '#dc2626'} onChange={(e) => set({ primaryBrandColor: e.target.value })} />
          </Field>
          <div className="kd-field">
            <span className="kd-field__label">Preview</span>
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 28, height: 28, borderRadius: 4, background: /^#[0-9a-f]{6}$/i.test(hf.primaryBrandColor || '') ? hf.primaryBrandColor : '#dc2626' }} />
              {hf.logoUrl ? <img src={hf.logoUrl} alt="Logo preview" style={{ height: 32 }} /> : <strong lang="hi">{hf.siteTitleHindi || 'खबरी दोस्त'}</strong>}
            </span>
          </div>
          <Field label="About text in the footer" id="s-about" span>
            <textarea id="s-about" className="kd-textarea kd-textarea--hi" value={hf.footerAboutText || ''} onChange={(e) => set({ footerAboutText: e.target.value })} rows={3} />
          </Field>
          <label className="kd-check kd-span">
            <input type="checkbox" checked={hf.headerShowEPaper !== false} onChange={(e) => set({ headerShowEPaper: e.target.checked })} />
            <span>Show the e-paper link (turn off if you do not publish an e-paper)</span>
          </label>
        </section>
      )}

      {section === 'navigation' && (
        <section className="kd-panel">
          <h2>Categories in the navigation</h2>
          <p className="kd-panel__note">Order, visibility and the label readers see. Category addresses (/category/…) do not change.</p>
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Category</th>
                  <th scope="col">Label</th>
                  <th scope="col">Shown</th>
                </tr>
              </thead>
              <tbody>
                {order.map((id, i) => (
                  <tr key={id}>
                    <td>
                      <div className="kd-table__actions">
                        <button type="button" className="kd-btn kd-btn--ghost kd-btn--sm" onClick={() => move(id, -1)} disabled={i === 0} aria-label={`Move ${id} up`}>
                          ↑
                        </button>
                        <button type="button" className="kd-btn kd-btn--ghost kd-btn--sm" onClick={() => move(id, 1)} disabled={i === order.length - 1} aria-label={`Move ${id} down`}>
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>/{id}</td>
                    <td>
                      <label className="sr-only" htmlFor={`lbl-${id}`}>
                        Label for {id}
                      </label>
                      <input
                        id={`lbl-${id}`}
                        className="kd-input kd-input--hi"
                        value={labels[id] ?? ''}
                        placeholder={CATEGORY_LABELS[id]}
                        onChange={(e) => set({ customCategoryLabels: { ...labels, [id]: e.target.value } as any })}
                      />
                    </td>
                    <td>
                      <label className="kd-check">
                        <input
                          type="checkbox"
                          checked={!disabled.has(id)}
                          onChange={(e) => {
                            const next = new Set(disabled);
                            if (e.target.checked) next.delete(id);
                            else next.add(id);
                            set({ disabledCategories: Array.from(next) as any });
                          }}
                        />
                        <span className="sr-only">Show {id}</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {section === 'contact' && (
        <section className="kd-panel kd-form kd-form--2">
          <p className="kd-panel__note kd-span">Enter only real details. Empty fields are simply not shown on the site.</p>
          <Field label="Public email" id="s-email">
            <input id="s-email" className="kd-input" type="email" value={hf.contactEmail || ''} onChange={(e) => set({ contactEmail: e.target.value })} />
          </Field>
          <Field label="Phone" id="s-phone">
            <input id="s-phone" className="kd-input" value={hf.contactPhone || ''} onChange={(e) => set({ contactPhone: e.target.value })} />
          </Field>
          <Field label="Postal address" id="s-addr" span>
            <textarea id="s-addr" className="kd-textarea kd-textarea--hi" value={hf.contactAddress || ''} onChange={(e) => set({ contactAddress: e.target.value })} rows={2} />
          </Field>
          <Field label="Registration number (RNI or other, if any)" id="s-rni">
            <input id="s-rni" className="kd-input" value={hf.rniNumber || ''} onChange={(e) => set({ rniNumber: e.target.value })} />
          </Field>
          <label className="kd-check" style={{ alignSelf: 'end' }}>
            <input type="checkbox" checked={!!hf.showRniNumber} onChange={(e) => set({ showRniNumber: e.target.checked })} />
            <span>Show the registration number in the footer</span>
          </label>
          <Field label="Technology partner name (optional)" id="s-partner">
            <input id="s-partner" className="kd-input" value={hf.footerBrandingPartnerName || ''} onChange={(e) => set({ footerBrandingPartnerName: e.target.value })} />
          </Field>
          <Field label="Technology partner link" id="s-partnerurl">
            <input id="s-partnerurl" className="kd-input" value={hf.footerBrandingPartnerUrl || ''} onChange={(e) => set({ footerBrandingPartnerUrl: e.target.value })} />
          </Field>
        </section>
      )}

      {section === 'social' && (
        <section className="kd-panel kd-form kd-form--2">
          <p className="kd-panel__note kd-span">Full links to your own accounts. Empty links are hidden.</p>
          {SOCIAL_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} id={`soc-${f.key}`}>
              <input
                id={`soc-${f.key}`}
                className="kd-input"
                type="url"
                value={((hf.socialLinks || {}) as any)[f.key] || ''}
                onChange={(e) => set({ socialLinks: { ...(hf.socialLinks as any), [f.key]: e.target.value } })}
                placeholder="https://…"
              />
            </Field>
          ))}
        </section>
      )}

      {section === 'policies' && (
        <section className="kd-panel kd-form">
          <p className="kd-panel__note">
            These texts appear on the policy pages. Have them reviewed by the publisher; do not claim certifications or memberships you do not hold.
          </p>
          <Field label="Policy" id="s-policy">
            <select id="s-policy" className="kd-select" value={policy} onChange={(e) => setPolicy(e.target.value)}>
              {POLICY_FIELDS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Text" id="s-policytext" help={`${(policies[policy] || '').length} characters`}>
            <textarea
              id="s-policytext"
              className="kd-textarea kd-textarea--hi"
              rows={18}
              value={policies[policy] || ''}
              onChange={(e) => set({ legalPolicies: { ...policies, [policy]: e.target.value } } as any)}
            />
          </Field>
        </section>
      )}

      <div className="kd-savebar">
        {dirty && <span className="kd-help">Unsaved changes</span>}
        <button type="button" className="kd-btn kd-btn--primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
};
