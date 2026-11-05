import React from 'react';
import type { PortalSettings } from '../../types/news';
import { POLICY_PATHS } from '../../utils/routes';
import { categoryHref } from './format';
import { socialLinksOf, type NavCategory } from './SiteHeader';

interface Props {
  settings: PortalSettings;
  categories: NavCategory[];
}

/** Site footer: about text, sections, newsroom pages, policies, and only the details the owner entered. */
export const SiteFooter: React.FC<Props> = ({ settings, categories }) => {
  const hf = settings.headerFooter;
  const socials = socialLinksOf(settings);
  const year = new Date().getFullYear();
  const about = (hf?.footerAboutText || '').trim();
  return (
    <footer className="kd-foot">
      <div className="kd-container kd-foot__grid">
        <section aria-labelledby="ft-about">
          <h2 id="ft-about" className="kd-foot__title">
            {hf?.siteTitleHindi || 'खबरी दोस्त'}
          </h2>
          {about && <p className="kd-foot__about">{about}</p>}
          {hf?.contactEmail && (
            <p className="kd-foot__about">
              ईमेल: <a href={`mailto:${hf.contactEmail}`}>{hf.contactEmail}</a>
            </p>
          )}
          {hf?.contactPhone && <p className="kd-foot__about">फ़ोन: {hf.contactPhone}</p>}
          {hf?.contactAddress && <p className="kd-foot__about">{hf.contactAddress}</p>}
          {hf?.showRniNumber && hf?.rniNumber && <p className="kd-foot__about">RNI: {hf.rniNumber}</p>}
        </section>
        <nav aria-labelledby="ft-sections">
          <h2 id="ft-sections" className="kd-foot__title">
            श्रेणियाँ
          </h2>
          <ul>
            {categories.slice(0, 9).map((c) => (
              <li key={c.id}>
                <a href={categoryHref(c.id)}>{c.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="ft-more">
          <h2 id="ft-more" className="kd-foot__title">
            खबरी दोस्त
          </h2>
          <ul>
            <li>
              <a href="/about">हमारे बारे में</a>
            </li>
            <li>
              <a href="/contact">संपर्क</a>
            </li>
            <li>
              <a href="/contact">विज्ञापन</a>
            </li>
            <li>
              <a href="/submit-news">ख़बर भेजें</a>
            </li>
            <li>
              <a href="/epaper">ई-पेपर</a>
            </li>
            <li>
              <a href="/archive">संग्रह</a>
            </li>
            <li>
              <a href="/rss.xml">RSS</a>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="ft-policy">
          <h2 id="ft-policy" className="kd-foot__title">
            नीतियाँ
          </h2>
          <ul>
            <li>
              <a href={POLICY_PATHS.ethics}>संपादकीय नीति</a>
            </li>
            <li>
              <a href={POLICY_PATHS.corrections}>सुधार नीति</a>
            </li>
            <li>
              <a href={POLICY_PATHS.factCheck}>तथ्य-जांच नीति</a>
            </li>
            <li>
              <a href={POLICY_PATHS.privacy}>गोपनीयता नीति</a>
            </li>
            <li>
              <a href={POLICY_PATHS.terms}>उपयोग की शर्तें</a>
            </li>
            <li>
              <a href={POLICY_PATHS.cookies}>कुकी नीति</a>
            </li>
            <li>
              <a href={POLICY_PATHS.grievance}>शिकायत निवारण</a>
            </li>
            <li>
              <a href={POLICY_PATHS.disclaimer}>अस्वीकरण</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="kd-foot__bar">
        <div className="kd-container kd-foot__barrow">
          <span>
            © {year} {hf?.footerBottomName || 'खबरी दोस्त'}
          </span>
          {socials.length > 0 && (
            <span className="kd-foot__social">
              {socials.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </span>
          )}
          {hf?.footerBrandingPartnerName && hf?.footerBrandingPartnerUrl && (
            <span>
              तकनीकी सहयोग:{' '}
              <a href={hf.footerBrandingPartnerUrl} target="_blank" rel="noopener noreferrer">
                {hf.footerBrandingPartnerName}
              </a>
            </span>
          )}
        </div>
      </div>
    </footer>
  );
};
