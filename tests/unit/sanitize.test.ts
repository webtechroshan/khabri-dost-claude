// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { sanitizeArticleHtml, htmlToText } from '../../src/utils/sanitizeHtml';
import { parseAdSenseSnippet } from '../../src/components/AdCode';

describe('sanitizeArticleHtml', () => {
  const attacks = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '<svg/onload=alert(1)>',
    '<a href="javascript:alert(1)">x</a>',
    '<a href="JaVaScRiPt:alert(1)">x</a>',
    '<iframe src="https://evil.example/"></iframe>',
    '<div style="position:fixed;inset:0">overlay</div>',
    '<object data="x"></object><embed src="x">',
    '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
    '<form action="https://evil.example"><input name=p></form>',
    '<p data-x="1" onclick="alert(1)">t</p>',
  ];
  for (const a of attacks) {
    it(`neutralises ${a.slice(0, 40)}`, () => {
      const out = sanitizeArticleHtml(a);
      expect(out).not.toMatch(/<script|onerror|onload|onclick|javascript:|<iframe|style=|<object|<embed|<form|<input|data-x/i);
    });
  }

  it('keeps normal article formatting', () => {
    const html = '<h2>शीर्षक</h2><p><strong>बोल्ड</strong> और <em>इटैलिक</em></p><ul><li>एक</li></ul><blockquote>उद्धरण</blockquote>';
    expect(sanitizeArticleHtml(html)).toBe(html);
  });

  it('allows known video embeds and adds lazy loading', () => {
    const out = sanitizeArticleHtml('<iframe src="https://www.youtube-nocookie.com/embed/abc" allowfullscreen></iframe>');
    expect(out).toContain('src="https://www.youtube-nocookie.com/embed/abc"');
    expect(out).toContain('loading="lazy"');
  });

  it('marks external links nofollow and opens them in a new tab', () => {
    const out = sanitizeArticleHtml('<a href="https://example.org/a">स्रोत</a>');
    expect(out).toContain('rel="noopener noreferrer nofollow ugc"');
    expect(out).toContain('target="_blank"');
  });

  it('keeps internal links in the same tab', () => {
    expect(sanitizeArticleHtml('<a href="/article/x" target="_blank">x</a>')).toBe('<a href="/article/x">x</a>');
  });

  it('gives images alt and lazy loading and drops unsafe sources', () => {
    expect(sanitizeArticleHtml('<img src="https://cdn.example/a.jpg">')).toBe('<img src="https://cdn.example/a.jpg" loading="lazy" alt="">');
    expect(sanitizeArticleHtml('<img src="data:image/svg+xml;base64,AAAA">')).not.toContain('data:image/svg');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeArticleHtml(null)).toBe('');
    expect(sanitizeArticleHtml('')).toBe('');
  });

  it('extracts plain text', () => {
    expect(htmlToText('<p>नमस्ते <b>दुनिया</b> &amp; सब</p>')).toBe('नमस्ते दुनिया & सब');
  });
});

describe('parseAdSenseSnippet', () => {
  it('reads client and slot from a pasted AdSense snippet', () => {
    const code =
      '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"></script>' +
      '<ins class="adsbygoogle" data-ad-client="ca-pub-1234567890123456" data-ad-slot="9876543210" data-ad-format="auto"></ins>';
    expect(parseAdSenseSnippet(code)).toEqual({ client: 'ca-pub-1234567890123456', slot: '9876543210', format: 'auto' });
  });
  it('rejects placeholder or partial snippets', () => {
    expect(parseAdSenseSnippet('<ins data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="1">')).toBeNull();
    expect(parseAdSenseSnippet('<img src="banner.jpg">')).toBeNull();
  });
});
