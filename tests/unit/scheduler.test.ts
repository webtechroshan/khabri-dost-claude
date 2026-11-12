import { describe, it, expect } from 'vitest';
import { dueArticles } from '../../server/scheduler';
import { publishedTime } from '../../src/utils/articleVisibility';

describe('dueArticles', () => {
  const now = Date.parse('2026-11-12T10:00:00Z');
  const docs = [
    { id: 'past', status: 'scheduled', scheduledFor: '2026-11-12T09:59:00Z' },
    { id: 'exact', status: 'scheduled', scheduledFor: '2026-11-12T10:00:00Z' },
    { id: 'future', status: 'scheduled', scheduledFor: '2026-11-12T10:01:00Z' },
    { id: 'draft', status: 'draft', scheduledFor: '2026-11-12T09:00:00Z' },
    { id: 'noTime', status: 'scheduled' },
    { id: 'badTime', status: 'scheduled', scheduledFor: 'tomorrow' },
  ];
  it('publishes only scheduled articles whose time has come', () => {
    expect(dueArticles(docs, now).map((d) => d.id)).toEqual(['past', 'exact']);
  });
});

describe('publishedTime', () => {
  it('prefers the publish time over the creation time', () => {
    expect(publishedTime({ createdAt: '2026-11-01T00:00:00Z', publishedAt: '2026-11-05T00:00:00Z' })).toBe('2026-11-05T00:00:00Z');
    expect(publishedTime({ createdAt: '2026-11-01T00:00:00Z' })).toBe('2026-11-01T00:00:00Z');
  });
});
