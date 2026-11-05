import { describe, it, expect } from 'vitest';
import { cleanPortalSettings } from '../../src/utils/cleanSettings';
import { DEFAULT_PORTAL_SETTINGS } from '../../src/data/portalDefaults';
import { INITIAL_NEWS, BREAKING_HEADLINES, getAuthorPhoto } from '../../src/data/seedNews';

describe('defaults contain no invented content', () => {
  const json = JSON.stringify(DEFAULT_PORTAL_SETTINGS);
  it.each([
    ['stock photos', /images\.unsplash\.com/],
    ['fake popup story', /गगनयान/],
    ['test ad', /Testing Ad|टेस्टिंग/],
    ['fake Google IDs', /G-KD2026IN|GTM-KD2026X|ca-pub-\d/],
    ['fake phone / RNI', /2345 6789|DELHIN\/2024/],
    ['third-party PDF', /Dainik|Jagran|aistudio/],
    ['invented reach', /5 लाख\+|500,000\+/],
  ])('no %s', (_n, re) => {
    expect(json).not.toMatch(re);
  });
  it('popup, gold widget, poll and ads are off', () => {
    expect(DEFAULT_PORTAL_SETTINGS.popupConfig?.enabled).toBe(false);
    expect(DEFAULT_PORTAL_SETTINGS.sidebarWidgets?.showGoldRate).toBe(false);
    expect(DEFAULT_PORTAL_SETTINGS.footerBannerAd?.enabled).toBe(false);
    expect(DEFAULT_PORTAL_SETTINGS.sidebarAdsConfig?.topSlot?.enabled).toBe(false);
  });
  it('sample articles and headlines are empty outside demo builds', () => {
    expect(INITIAL_NEWS).toEqual([]);
    expect(BREAKING_HEADLINES).toEqual([]);
  });
  it('author avatars are initials, not stock photos', () => {
    const src = getAuthorPhoto('राम कुमार');
    expect(src.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(src)).toContain('>र<');
  });
});

describe('cleanPortalSettings', () => {
  const legacy: any = {
    ...DEFAULT_PORTAL_SETTINGS,
    popupConfig: { enabled: true, type: 'breaking_alert', title: '🔴 बड़ी ख़बर: गगनयान क्रू मॉड्यूल का सफल परीक्षण!', ctaLink: 'news-1' },
    footerBannerAd: { enabled: true, desktopImageUrl: 'https://images.unsplash.com/photo-1?w=1', title: 'Testing Ad Banner' },
    googleServices: { googleAnalyticsId: 'G-KD2026IN', adsenseClientId: 'ca-pub-9840284729482910', googleTagManagerId: 'GTM-REAL123', adsenseAutoAds: true },
    headerFooter: {
      contactPhone: '+91 11 2345 6789',
      rniNumber: 'DELHIN/2024/84920',
      contactEmail: 'real@example.org',
      socialLinks: { facebook: 'https://facebook.com', youtube: 'https://youtube.com/@realchannel', telegramChannel: 'https://t.me/example' },
    },
    trendingTopics: ['#गगनयान_मिशन', '#असली_टैग'],
    epaperSettings: { customPdfUrl: '/assets/aistudio/Dainik_Jagran_National_20261021.pdf', editionsList: [] },
    liveVideoYoutubeId: 'jfKfPfyJRdk',
    liveVideoSectionEnabled: true,
    sidebarWidgets: { showGoldRate: true, goldRate24k: 78450, goldRate22k: 71920 },
    pinnedTrendingArticleIds: ['news-1', 'art_123'],
  };
  const out: any = cleanPortalSettings(legacy);

  it('disables the fake popup and test ad', () => {
    expect(out.popupConfig.enabled).toBe(false);
    expect(out.footerBannerAd.enabled).toBe(false);
  });
  it('removes invented IDs but keeps real ones', () => {
    expect(out.googleServices.googleAnalyticsId).toBe('');
    expect(out.googleServices.adsenseClientId).toBe('');
    expect(out.googleServices.adsenseAutoAds).toBe(false);
    expect(out.googleServices.googleTagManagerId).toBe('GTM-REAL123');
  });
  it('removes invented contact details and placeholder links, keeps real ones', () => {
    expect(out.headerFooter.contactPhone).toBe('');
    expect(out.headerFooter.rniNumber).toBe('');
    expect(out.headerFooter.contactEmail).toBe('real@example.org');
    expect(out.headerFooter.socialLinks.facebook).toBe('');
    expect(out.headerFooter.socialLinks.telegramChannel).toBe('');
    expect(out.headerFooter.socialLinks.youtube).toBe('https://youtube.com/@realchannel');
  });
  it('removes invented hashtags, third-party PDF and stream, fake gold rates, seed pins', () => {
    expect(out.trendingTopics).toEqual(['#असली_टैग']);
    expect(out.epaperSettings.customPdfUrl).toBe('');
    expect(out.liveVideoYoutubeId).toBe('');
    expect(out.liveVideoSectionEnabled).toBe(false);
    expect(out.sidebarWidgets.showGoldRate).toBe(false);
    expect(out.pinnedTrendingArticleIds).toEqual(['art_123']);
  });
  it('leaves clean settings unchanged', () => {
    expect(cleanPortalSettings(DEFAULT_PORTAL_SETTINGS)).toEqual(DEFAULT_PORTAL_SETTINGS);
  });
});
