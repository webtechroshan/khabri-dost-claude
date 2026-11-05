import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  NewsArticle,
  NewsComment,
  NewsBookmark,
  NewsCategory,
  NewsReadLater,
  ReactionType,
  ArticleReactions,
  PortalSettings,
  ContactInquiry,
  MediaAsset,
  LiveBlogEvent,
  CitizenNewsSubmission,
  EditorialUser,
} from '../types/news';
import { staffDocId } from '../utils/roles';
import { INITIAL_NEWS } from '../data/seedNews';
import { DEMO_CONTENT } from '../utils/articleVisibility';
import {
  DEFAULT_PORTAL_SETTINGS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_LIVE_BLOGS,
} from '../data/portalDefaults';

const ARTICLES_COLLECTION = 'articles';
const COMMENTS_COLLECTION = 'comments';
const BOOKMARKS_COLLECTION = 'bookmarks';
const READ_LATERS_COLLECTION = 'read_laters';
const SETTINGS_COLLECTION = 'settings';
const INQUIRIES_COLLECTION = 'inquiries';
const MEDIA_COLLECTION = 'media';
const LIVE_BLOGS_COLLECTION = 'live_blogs';

/**
 * Fetch every article the signed-in user may read (used for staff backups). Throws on permission errors.
 */
export async function fetchArticles(category: NewsCategory = 'all'): Promise<NewsArticle[]> {
  const snap = await getDocs(query(collection(db, ARTICLES_COLLECTION), limit(5000)));
  const items: NewsArticle[] = [];
  snap.forEach((docSnap) => {
    items.push({ ...(docSnap.data() as NewsArticle), id: docSnap.id });
  });
  return sortAndFilterArticles(items, category);
}

function sortAndFilterArticles(items: NewsArticle[], category: NewsCategory): NewsArticle[] {
  let list = items;
  if (category !== 'all') {
    list = list.filter(a => a.category === category);
  }
  // Sort descending by createdAt
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Subscribe to real-time articles updates.
 */
export type ArticleScope = 'public' | 'all' | { authorUid: string };

/**
 * Subscribe to articles. Every query is shaped so Firestore rules can allow it:
 * - 'public': published articles only (what readers see)
 * - 'all': every article (editors and administrators)
 * - { authorUid }: one author's own articles (reporters)
 * Sample articles are used only in demo builds.
 */
export function subscribeToArticles(
  onArticles: (articles: NewsArticle[]) => void,
  scope: ArticleScope = 'public',
  onError?: (error: unknown) => void
) {
  const colRef = collection(db, ARTICLES_COLLECTION);
  const q =
    scope === 'public'
      ? query(colRef, where('status', '==', 'published'), limit(400))
      : scope === 'all'
        ? query(colRef, limit(1000))
        : query(colRef, where('authorUid', '==', scope.authorUid), limit(500));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: NewsArticle[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as NewsArticle), id: docSnap.id });
      });
      onArticles(items.length === 0 && scope === 'public' && DEMO_CONTENT ? INITIAL_NEWS : sortAndFilterArticles(items, 'all'));
    },
    (error) => {
      onArticles(scope === 'public' && DEMO_CONTENT ? INITIAL_NEWS : []);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.LIST, ARTICLES_COLLECTION);
      } catch {
        // logged
      }
    }
  );
}

const withoutUndefined = <T extends Record<string, unknown>>(o: T): T => {
  const copy = { ...o };
  for (const k of Object.keys(copy)) if (copy[k] === undefined) delete copy[k];
  return copy;
};

/**
 * Create a new article. Requires a signed-in newsroom member; the author is always the signed-in user
 * unless an editor sets a byline name. New articles default to `draft`.
 */
export async function publishArticle(data: Omit<NewsArticle, 'id' | 'viewsCount' | 'likesCount' | 'createdAt'>): Promise<NewsArticle> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Please sign in to the newsroom first.');
  const newId = 'art_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const article: NewsArticle = withoutUndefined({
    ...data,
    status: data.status || 'draft',
    id: newId,
    authorUid: currentUser.uid,
    authorEmail: currentUser.email || '',
    authorName: data.authorName || currentUser.displayName || '',
    viewsCount: 0,
    likesCount: 0,
    createdAt: now,
    updatedAt: now,
  } as NewsArticle & Record<string, unknown>);

  try {
    await setDoc(doc(db, ARTICLES_COLLECTION, newId), article);
    return article;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ARTICLES_COLLECTION}/${newId}`);
    throw error;
  }
}

/**
 * Update an existing article.
 */
export async function updateArticle(articleId: string, updates: Partial<NewsArticle>): Promise<void> {
  const { id: _id, viewsCount: _v, likesCount: _l, ...rest } = updates;
  try {
    await updateDoc(doc(db, ARTICLES_COLLECTION, articleId), {
      ...withoutUndefined(rest as Record<string, unknown>),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ARTICLES_COLLECTION}/${articleId}`);
    throw error;
  }
}

/**
 * Delete an article.
 */
export async function deleteArticle(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ARTICLES_COLLECTION}/${articleId}`);
    throw error;
  }
}

/**
 * Increment views count for an article.
 */
export async function incrementArticleViews(articleId: string, currentViews: number = 0): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, { viewsCount: increment(1) });
  } catch (error) {
    // Silently ignore or report error
    console.warn('Could not increment view count', error);
  }
}

/**
 * Increment likes count for an article.
 */
export async function incrementArticleLikes(articleId: string, currentLikes: number): Promise<number> {
  const nextLikes = (currentLikes || 0) + 1;
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, {
      likesCount: nextLikes,
    });
    return nextLikes;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ARTICLES_COLLECTION}/${articleId}`);
    return currentLikes;
  }
}

export const likeArticle = incrementArticleLikes;

/**
 * Increment or toggle emoji reaction for an article (Like, Love, Insightful, Funny).
 */
export async function updateArticleReaction(
  articleId: string,
  reactionType: ReactionType,
  currentReactions?: ArticleReactions,
  previousReaction?: ReactionType | null
): Promise<ArticleReactions> {
  const updated: ArticleReactions = {
    like: currentReactions?.like || 0,
    love: currentReactions?.love || 0,
    funny: currentReactions?.funny || 0,
    surprised: currentReactions?.surprised || 0,
    insightful: currentReactions?.insightful || 0,
  };

  // If user had a different reaction, decrement previous
  if (previousReaction && previousReaction !== reactionType) {
    updated[previousReaction] = Math.max(0, (updated[previousReaction] || 0) - 1);
  }

  // If clicking same reaction again, toggle off
  if (previousReaction === reactionType) {
    updated[reactionType] = Math.max(0, (updated[reactionType] || 0) - 1);
  } else {
    updated[reactionType] = (updated[reactionType] || 0) + 1;
  }

  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, {
      reactions: updated,
      likesCount: updated.like,
    });
  } catch (error) {
    console.warn('Could not persist reaction to Firestore', error);
  }

  return updated;
}

/**
 * Fetch comments for an article once.
 */
export async function fetchComments(articleId: string): Promise<NewsComment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('articleId', '==', articleId)
    );
    const snap = await getDocs(q);
    const items: NewsComment[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as NewsComment);
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return [];
  }
}

/**
 * Subscribe to comments for an article.
 */
export function subscribeToComments(
  articleId: string,
  onComments: (comments: NewsComment[]) => void
) {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('articleId', '==', articleId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: NewsComment[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as NewsComment);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onComments(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COMMENTS_COLLECTION);
    }
  );
}

/**
 * Post a comment to an article.
 */
export async function postComment(
  articleId: string,
  content: string,
  user: { uid: string; name: string; email?: string; photoURL?: string }
): Promise<NewsComment> {
  const newId = 'com_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const comment: NewsComment = {
    id: newId,
    articleId,
    authorUid: user.uid,
    authorName: user.name || 'पाठक',
    authorEmail: user.email || '',
    authorPhoto: user.photoURL || '',
    content: content.trim(),
    likesCount: 0,
    createdAt: now,
  };

  try {
    const docRef = doc(db, COMMENTS_COLLECTION, newId);
    await setDoc(docRef, comment);
    return comment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COMMENTS_COLLECTION}/${newId}`);
    throw error;
  }
}

/**
 * Delete a comment.
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COMMENTS_COLLECTION}/${commentId}`);
    throw error;
  }
}

/**
 * Subscribe to user bookmarks.
 */
export function subscribeToUserBookmarks(
  userId: string,
  onBookmarks: (bookmarks: NewsBookmark[]) => void
) {
  const q = query(
    collection(db, BOOKMARKS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: NewsBookmark[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as NewsBookmark);
      });
      onBookmarks(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, BOOKMARKS_COLLECTION);
    }
  );
}

/**
 * Toggle bookmark for a user.
 */
export async function toggleBookmark(
  userId: string,
  article: NewsArticle,
  isCurrentlyBookmarked: boolean
): Promise<boolean> {
  // Format bookmark ID safely matching regex ^[a-zA-Z0-9_\-]+$
  const safeArticleId = article.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const safeUserId = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const bookmarkId = `bm_${safeUserId.slice(0, 40)}_${safeArticleId.slice(0, 40)}`;

  try {
    const docRef = doc(db, BOOKMARKS_COLLECTION, bookmarkId);
    if (isCurrentlyBookmarked) {
      await deleteDoc(docRef);
      return false;
    } else {
      const bookmark: NewsBookmark = {
        id: bookmarkId,
        userId,
        articleId: article.id,
        articleTitle: article.title,
        articleCategory: article.category,
        articleImageUrl: article.imageUrl,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, bookmark);
      return true;
    }
  } catch (error) {
    const op = isCurrentlyBookmarked ? OperationType.DELETE : OperationType.CREATE;
    handleFirestoreError(error, op, `${BOOKMARKS_COLLECTION}/${bookmarkId}`);
    throw error;
  }
}

/**
 * Subscribe to user Read Later queue (Firestore with local fallback cache).
 */
export function subscribeToUserReadLater(
  userId: string,
  onReadLater: (items: NewsReadLater[]) => void
) {
  // If guest or no userId, return local cache
  if (!userId) {
    try {
      const local = localStorage.getItem('kd_guest_read_later');
      onReadLater(local ? JSON.parse(local) : []);
    } catch {
      onReadLater([]);
    }
    return () => {};
  }

  const q = query(
    collection(db, READ_LATERS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: NewsReadLater[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as NewsReadLater);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      try {
        localStorage.setItem(`kd_read_later_cache_${userId}`, JSON.stringify(items));
      } catch {}
      onReadLater(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, READ_LATERS_COLLECTION);
      // Fallback to local cache if offline
      try {
        const cached = localStorage.getItem(`kd_read_later_cache_${userId}`);
        if (cached) onReadLater(JSON.parse(cached));
      } catch {}
    }
  );
}

/**
 * Toggle Read Later for a user in Firestore & local cache.
 */
export async function toggleReadLater(
  userId: string,
  article: NewsArticle,
  isCurrentlySaved: boolean
): Promise<boolean> {
  const safeArticleId = article.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const safeUserId = (userId || 'guest').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const readLaterId = `rl_${safeUserId.slice(0, 40)}_${safeArticleId.slice(0, 40)}`;

  // Approximate reading time in Hindi (e.g. "3 मिनट पठन")
  const wordCount = (article.content || article.summary || '').trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  const estimatedReadTime = `${minutes} मिनट पठन`;

  if (!userId) {
    // Guest storage
    try {
      const existing: NewsReadLater[] = JSON.parse(localStorage.getItem('kd_guest_read_later') || '[]');
      if (isCurrentlySaved) {
        const filtered = existing.filter((item) => item.articleId !== article.id);
        localStorage.setItem('kd_guest_read_later', JSON.stringify(filtered));
        return false;
      } else {
        const newItem: NewsReadLater = {
          id: readLaterId,
          userId: 'guest',
          articleId: article.id,
          articleTitle: article.title,
          articleCategory: article.category,
          articleImageUrl: article.imageUrl,
          estimatedReadTime,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('kd_guest_read_later', JSON.stringify([newItem, ...existing]));
        return true;
      }
    } catch {
      return !isCurrentlySaved;
    }
  }

  try {
    const docRef = doc(db, READ_LATERS_COLLECTION, readLaterId);
    if (isCurrentlySaved) {
      await deleteDoc(docRef);
      return false;
    } else {
      const item: NewsReadLater = {
        id: readLaterId,
        userId,
        articleId: article.id,
        articleTitle: article.title,
        articleCategory: article.category,
        articleImageUrl: article.imageUrl,
        estimatedReadTime,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, item);
      return true;
    }
  } catch (error) {
    const op = isCurrentlySaved ? OperationType.DELETE : OperationType.CREATE;
    handleFirestoreError(error, op, `${READ_LATERS_COLLECTION}/${readLaterId}`);
    throw error;
  }
}

/**
 * Remove specific item from Read Later.
 */
export async function removeReadLaterItem(
  userId: string,
  articleId: string
): Promise<void> {
  const safeArticleId = articleId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const safeUserId = (userId || 'guest').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const readLaterId = `rl_${safeUserId.slice(0, 40)}_${safeArticleId.slice(0, 40)}`;

  if (!userId) {
    try {
      const existing: NewsReadLater[] = JSON.parse(localStorage.getItem('kd_guest_read_later') || '[]');
      const filtered = existing.filter((item) => item.articleId !== articleId);
      localStorage.setItem('kd_guest_read_later', JSON.stringify(filtered));
    } catch {}
    return;
  }

  try {
    const docRef = doc(db, READ_LATERS_COLLECTION, readLaterId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${READ_LATERS_COLLECTION}/${readLaterId}`);
    throw error;
  }
}

/**
 * Clear all items in Read Later for a user.
 */
export async function clearAllUserReadLater(
  userId: string,
  items: NewsReadLater[]
): Promise<void> {
  if (!userId) {
    localStorage.removeItem('kd_guest_read_later');
    return;
  }
  for (const item of items) {
    try {
      const docRef = doc(db, READ_LATERS_COLLECTION, item.id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Error clearing read later item:', err);
    }
  }
}

/**
 * Fetch portal settings from Firestore with local fallback.
 */
export async function fetchPortalSettings(): Promise<PortalSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'portal_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PortalSettings;
      return {
        ...DEFAULT_PORTAL_SETTINGS,
        ...data,
      };
    }
  } catch (err) {
    console.warn('Could not fetch portal settings from Firestore, using local fallback:', err);
  }

  try {
    const saved = localStorage.getItem('kd_portal_settings');
    if (saved) {
      return {
        ...DEFAULT_PORTAL_SETTINGS,
        ...JSON.parse(saved),
      };
    }
  } catch {}

  return DEFAULT_PORTAL_SETTINGS;
}

/**
 * Real-time listener for portal settings changes across all readers.
 */
export function subscribeToPortalSettings(
  onSettings: (settings: PortalSettings) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'portal_config');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PortalSettings;
        const merged: PortalSettings = {
          ...DEFAULT_PORTAL_SETTINGS,
          ...data,
        };
        try {
          localStorage.setItem('kd_portal_settings', JSON.stringify(merged));
        } catch {}
        onSettings(merged);
      }
    },
    (err) => {
      console.warn('Portal settings subscription error:', err);
    }
  );
}

export async function savePortalSettings(settings: PortalSettings): Promise<void> {
  // Always update local cache first for instant feedback
  try {
    localStorage.setItem('kd_portal_settings', JSON.stringify(settings));
  } catch {}

  try {
    // Sanitize settings: NEVER write raw API keys to the publicly readable Firestore document
    const { apiConfig, ...publicSettings } = settings;
    const safeApiConfig = apiConfig
      ? {
          activeAiProvider: apiConfig.activeAiProvider || 'gemini',
          googleTrendsRegion: apiConfig.googleTrendsRegion || 'IN',
          googleTrendsLanguage: apiConfig.googleTrendsLanguage || 'hi',
          googleTrendsAutoRefresh: apiConfig.googleTrendsAutoRefresh ?? true,
          googleTrendsRefreshIntervalMinutes: apiConfig.googleTrendsRefreshIntervalMinutes || 15,
          // Raw secret keys (geminiApiKey, openaiApiKey, anthropicApiKey) are excluded from public Firestore
        }
      : undefined;

    const sanitizedSettings = {
      ...publicSettings,
      ...(safeApiConfig ? { apiConfig: safeApiConfig } : {}),
    };

    const docRef = doc(db, SETTINGS_COLLECTION, 'portal_config');
    await setDoc(docRef, sanitizedSettings, { merge: true });
  } catch (error) {
    console.warn('Could not save settings to Firestore:', error);
    handleFirestoreError(error, OperationType.UPDATE, `${SETTINGS_COLLECTION}/portal_config`);
  }
}

/**
 * Submit contact inquiry to Firestore.
 */
export async function submitContactInquiry(
  inquiry: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>
): Promise<ContactInquiry> {
  const newId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const item: ContactInquiry = {
    ...inquiry,
    id: newId,
    submittedAt: new Date().toISOString(),
    status: 'new',
  };

  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, newId);
    await setDoc(docRef, item);
  } catch (error) {
    console.warn('Saved inquiry locally:', error);
  }

  // Update local storage for immediate admin view
  try {
    const saved = localStorage.getItem('kd_contact_inquiries');
    const list: ContactInquiry[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem('kd_contact_inquiries', JSON.stringify([item, ...list]));
  } catch {}

  return item;
}

/**
 * Subscribe to contact inquiries for administrators.
 */
export function subscribeToContactInquiries(
  onInquiries: (inquiries: ContactInquiry[]) => void
) {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  const q = query(colRef, orderBy('submittedAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ContactInquiry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ContactInquiry);
      });
      if (items.length > 0) {
        try {
          localStorage.setItem('kd_contact_inquiries', JSON.stringify(items));
        } catch {}
        onInquiries(items);
      }
    },
    (err) => {
      console.warn('Inquiries subscription error (falling back to local):', err);
    }
  );
}

/**
 * Ensure portal settings document exists in Firestore.
 */
export async function seedPortalSettingsIfEmpty(): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'portal_config');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, DEFAULT_PORTAL_SETTINGS);
    }
  } catch (error) {
    // Non-admin or offline, safe to skip
  }
}

/**
 * Update contact inquiry status and optional admin notes.
 */
export async function updateContactInquiryStatus(
  inquiryId: string,
  status: ContactInquiry['status'],
  adminNotes?: string
): Promise<void> {
  const updatePayload: Record<string, any> = { status };
  if (adminNotes !== undefined) {
    updatePayload.adminNotes = adminNotes;
  }

  // Update local storage cache immediately
  try {
    const saved = localStorage.getItem('kd_contact_inquiries');
    if (saved) {
      const list: ContactInquiry[] = JSON.parse(saved);
      const updated = list.map((i) => (i.id === inquiryId ? { ...i, ...updatePayload } : i));
      localStorage.setItem('kd_contact_inquiries', JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    console.warn('Updated inquiry status locally:', err);
  }
}

/**
 * Delete contact inquiry from Firestore and local cache.
 */
export async function deleteContactInquiry(inquiryId: string): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_contact_inquiries');
    if (saved) {
      const list: ContactInquiry[] = JSON.parse(saved);
      const updated = list.filter((i) => i.id !== inquiryId);
      localStorage.setItem('kd_contact_inquiries', JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete inquiry from Firestore:', err);
  }
}

/**
 * -------------------------------------------------------------
 * MEDIA LIBRARY CLOUD PERSISTENCE (ISSUE-03)
 * -------------------------------------------------------------
 */

/**
 * Subscribe to real-time media assets from Firestore /media collection.
 */
export function subscribeMediaAssets(
  callback: (assets: MediaAsset[]) => void
): () => void {
  const colRef = collection(db, MEDIA_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remote = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as MediaAsset),
          id: docSnap.id,
        }));
        // Sort newest first
        remote.sort(
          (a, b) =>
            new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
        );
        try {
          localStorage.setItem('kd_media_assets', JSON.stringify(remote));
        } catch {}
        callback(remote);
      } else {
        // Fall back to local or initial assets
        try {
          const saved = localStorage.getItem('kd_media_assets');
          if (saved) {
            callback(JSON.parse(saved));
            return;
          }
        } catch {}
        callback(INITIAL_MEDIA_ASSETS);
      }
    },
    (err) => {
      console.warn('Media subscription error (falling back to cache):', err);
      try {
        const saved = localStorage.getItem('kd_media_assets');
        if (saved) {
          callback(JSON.parse(saved));
          return;
        }
      } catch {}
      callback(INITIAL_MEDIA_ASSETS);
    }
  );
}

/**
 * Save new media asset to Firestore /media and update local storage.
 */
export async function saveMediaAsset(media: MediaAsset): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_media_assets');
    const list: MediaAsset[] = saved ? JSON.parse(saved) : INITIAL_MEDIA_ASSETS;
    const updated = [media, ...list.filter((m) => m.id !== media.id)];
    localStorage.setItem('kd_media_assets', JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, MEDIA_COLLECTION, media.id);
    await setDoc(docRef, media);
  } catch (err) {
    console.warn('Saved media locally, Firestore sync pending:', err);
  }
}

/**
 * Update media asset metadata (Alt text, SEO title, caption, keywords).
 */
export async function updateMediaAssetRecord(
  mediaUpdate: Partial<MediaAsset> & { id: string }
): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_media_assets');
    if (saved) {
      const list: MediaAsset[] = JSON.parse(saved);
      const updated = list.map((m) =>
        m.id === mediaUpdate.id ? { ...m, ...mediaUpdate } : m
      );
      localStorage.setItem('kd_media_assets', JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, MEDIA_COLLECTION, mediaUpdate.id);
    await updateDoc(docRef, mediaUpdate as any);
  } catch (err) {
    console.warn('Updated media locally, Firestore sync pending:', err);
  }
}

/**
 * Delete media asset from Firestore and local cache.
 */
export async function deleteMediaAssetRecord(mediaId: string): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_media_assets');
    if (saved) {
      const list: MediaAsset[] = JSON.parse(saved);
      const updated = list.filter((m) => m.id !== mediaId);
      localStorage.setItem('kd_media_assets', JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, MEDIA_COLLECTION, mediaId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Deleted media locally, Firestore sync pending:', err);
  }
}

/**
 * -------------------------------------------------------------
 * LIVE BLOGS & BREAKING COVERAGE CLOUD PERSISTENCE
 * -------------------------------------------------------------
 */

/**
 * Subscribe to real-time live blogs from Firestore /live_blogs collection.
 */
export function subscribeLiveBlogs(
  callback: (blogs: LiveBlogEvent[]) => void
): () => void {
  const colRef = collection(db, LIVE_BLOGS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remote = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as LiveBlogEvent),
          id: docSnap.id,
        }));
        remote.sort(
          (a, b) =>
            new Date(b.lastUpdatedAt || b.startedAt || 0).getTime() -
            new Date(a.lastUpdatedAt || a.startedAt || 0).getTime()
        );
        try {
          localStorage.setItem('kd_live_blogs', JSON.stringify(remote));
        } catch {}
        callback(remote);
      } else {
        try {
          const saved = localStorage.getItem('kd_live_blogs');
          if (saved) {
            callback(JSON.parse(saved));
            return;
          }
        } catch {}
        callback(INITIAL_LIVE_BLOGS);
      }
    },
    (err) => {
      console.warn('Live blogs subscription error (falling back to cache):', err);
      try {
        const saved = localStorage.getItem('kd_live_blogs');
        if (saved) {
          callback(JSON.parse(saved));
          return;
        }
      } catch {}
      callback(INITIAL_LIVE_BLOGS);
    }
  );
}

/**
 * Save new live blog event to Firestore.
 */
export async function saveLiveBlogRecord(blog: LiveBlogEvent): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_live_blogs');
    const list: LiveBlogEvent[] = saved ? JSON.parse(saved) : INITIAL_LIVE_BLOGS;
    const updated = [blog, ...list.filter((b) => b.id !== blog.id)];
    localStorage.setItem('kd_live_blogs', JSON.stringify(updated));
  } catch {}

  try {
    const docRef = doc(db, LIVE_BLOGS_COLLECTION, blog.id);
    await setDoc(docRef, blog);
  } catch (err) {
    console.warn('Saved live blog locally, Firestore sync pending:', err);
  }
}

/**
 * Update live blog event (e.g. append updates, toggle isLive).
 */
export async function updateLiveBlogRecord(
  blogUpdate: Partial<LiveBlogEvent> & { id: string }
): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_live_blogs');
    if (saved) {
      const list: LiveBlogEvent[] = JSON.parse(saved);
      const updated = list.map((b) =>
        b.id === blogUpdate.id ? { ...b, ...blogUpdate } : b
      );
      localStorage.setItem('kd_live_blogs', JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, LIVE_BLOGS_COLLECTION, blogUpdate.id);
    await updateDoc(docRef, blogUpdate as any);
  } catch (err) {
    console.warn('Updated live blog locally, Firestore sync pending:', err);
  }
}

/**
 * Delete live blog event from Firestore and local cache.
 */
export async function deleteLiveBlogRecord(blogId: string): Promise<void> {
  try {
    const saved = localStorage.getItem('kd_live_blogs');
    if (saved) {
      const list: LiveBlogEvent[] = JSON.parse(saved);
      const updated = list.filter((b) => b.id !== blogId);
      localStorage.setItem('kd_live_blogs', JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, LIVE_BLOGS_COLLECTION, blogId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Deleted live blog locally, Firestore sync pending:', err);
  }
}

/**
 * -------------------------------------------------------------
 * AUTOMATED SCHEDULED PUBLISHING PROCESSOR
 * -------------------------------------------------------------
 * Promotes articles with status: 'scheduled' to status: 'published'
 * when their scheduled release timestamp arrives.
 */
export async function checkAndPublishScheduledArticles(
  articles: NewsArticle[]
): Promise<{ updatedArticles: NewsArticle[]; publishedCount: number }> {
  const now = Date.now();
  const toPublish = articles.filter(
    (a) =>
      a.status === 'scheduled' &&
      a.scheduledFor &&
      new Date(a.scheduledFor).getTime() <= now
  );

  if (toPublish.length === 0) {
    return { updatedArticles: articles, publishedCount: 0 };
  }

  const updatedArticles = articles.map((a) => {
    if (
      a.status === 'scheduled' &&
      a.scheduledFor &&
      new Date(a.scheduledFor).getTime() <= now
    ) {
      return {
        ...a,
        status: 'published' as const,
        updatedAt: new Date().toISOString(),
      };
    }
    return a;
  });

  // Promote in Firestore in parallel
  await Promise.allSettled(
    toPublish.map(async (article) => {
      try {
        const articleRef = doc(db, ARTICLES_COLLECTION, article.id);
        await updateDoc(articleRef, {
          status: 'published',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn(`Could not promote scheduled article ${article.id}:`, err);
      }
    })
  );

  return { updatedArticles, publishedCount: toPublish.length };
}

/**
 * -------------------------------------------------------------
 * FULL PORTAL SNAPSHOT BACKUP & RESTORE SERVICE (PHASE 9)
 * -------------------------------------------------------------
 */

export interface PortalBackupSnapshot {
  metadata: {
    exportTimestamp: string;
    portalDomain: string;
    schemaVersion: string;
    appName: string;
    environment: string;
    exportedBy?: string;
    counts: {
      articles: number;
      mediaAssets: number;
      liveBlogs: number;
      inquiries: number;
      subscribers: number;
      citizenSubmissions: number;
    };
  };
  settings: PortalSettings;
  articles: NewsArticle[];
  mediaAssets: MediaAsset[];
  liveBlogs: LiveBlogEvent[];
  inquiries: ContactInquiry[];
  subscribers: Array<{ email: string; subscribedAt: string; category?: string }>;
  citizenSubmissions: CitizenNewsSubmission[];
}

/**
 * Generate full JSON database backup snapshot across all entities.
 */
export async function generatePortalBackupData(exportedBy = 'Super Admin'): Promise<PortalBackupSnapshot> {
  // 1. Articles
  let articles: NewsArticle[] = [];
  try {
    articles = await fetchArticles('all');
  } catch {
    articles = [];
  }

  // 2. Settings
  let settings: PortalSettings = DEFAULT_PORTAL_SETTINGS;
  try {
    settings = await fetchPortalSettings();
  } catch {
    settings = DEFAULT_PORTAL_SETTINGS;
  }

  // 3. Media Assets
  let mediaAssets: MediaAsset[] = INITIAL_MEDIA_ASSETS;
  try {
    const savedMedia = localStorage.getItem('kd_media_assets');
    if (savedMedia) {
      mediaAssets = JSON.parse(savedMedia);
    }
  } catch {}

  // 4. Live Blogs
  let liveBlogs: LiveBlogEvent[] = INITIAL_LIVE_BLOGS;
  try {
    const savedBlogs = localStorage.getItem('kd_live_blogs');
    if (savedBlogs) {
      liveBlogs = JSON.parse(savedBlogs);
    }
  } catch {}

  // 5. Inquiries
  let inquiries: ContactInquiry[] = [];
  try {
    const savedInq = localStorage.getItem('kd_contact_inquiries');
    if (savedInq) {
      inquiries = JSON.parse(savedInq);
    }
  } catch {}

  // 6. Newsletter Subscribers
  let subscribers: Array<{ email: string; subscribedAt: string; category?: string }> = [];
  try {
    const savedSubs = localStorage.getItem('kd_newsletter_subscribers');
    if (savedSubs) {
      subscribers = JSON.parse(savedSubs);
    }
  } catch {}

  // 7. Citizen Submissions
  let citizenSubmissions: CitizenNewsSubmission[] = [];
  try {
    const savedCitizen = localStorage.getItem('kd_citizen_submissions');
    if (savedCitizen) {
      citizenSubmissions = JSON.parse(savedCitizen);
    }
  } catch {}

  const snapshot: PortalBackupSnapshot = {
    metadata: {
      exportTimestamp: new Date().toISOString(),
      portalDomain: 'khabridost.com',
      schemaVersion: '2.0.0',
      appName: 'Khabri Dost News CMS',
      environment: 'production',
      exportedBy,
      counts: {
        articles: articles.length,
        mediaAssets: mediaAssets.length,
        liveBlogs: liveBlogs.length,
        inquiries: inquiries.length,
        subscribers: subscribers.length,
        citizenSubmissions: citizenSubmissions.length,
      },
    },
    settings,
    articles,
    mediaAssets,
    liveBlogs,
    inquiries,
    subscribers,
    citizenSubmissions,
  };

  return snapshot;
}

/**
 * Validated restore from JSON backup snapshot.
 */
export async function restorePortalBackupData(
  snapshot: any
): Promise<{
  success: boolean;
  message: string;
  counts: {
    articles: number;
    mediaAssets: number;
    liveBlogs: number;
    inquiries: number;
    subscribers: number;
  };
  restoredSettings: PortalSettings | null;
}> {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('Invalid backup file: file content is not a valid JSON object.');
  }

  // Validate critical structure
  const hasArticles = Array.isArray(snapshot.articles);
  const hasSettings = Boolean(snapshot.settings && typeof snapshot.settings === 'object');

  if (!hasArticles && !hasSettings) {
    throw new Error('Invalid backup format: snapshot contains neither articles nor portal settings.');
  }

  let restoredSettings: PortalSettings | null = null;
  const counts = {
    articles: 0,
    mediaAssets: 0,
    liveBlogs: 0,
    inquiries: 0,
    subscribers: 0,
  };

  // 1. Restore Settings
  if (hasSettings) {
    const validSettings: PortalSettings = {
      ...DEFAULT_PORTAL_SETTINGS,
      ...snapshot.settings,
    };
    restoredSettings = validSettings;
    await savePortalSettings(validSettings);
  }

  // 2. Restore Articles
  if (hasArticles) {
    const articlesList: NewsArticle[] = snapshot.articles;
    counts.articles = articlesList.length;
    // Persist each article to Firestore if authenticated / available
    for (const art of articlesList) {
      try {
        const articleRef = doc(db, ARTICLES_COLLECTION, art.id);
        await setDoc(articleRef, art, { merge: true });
      } catch (err) {
        console.warn(`Could not sync restored article ${art.id} to Firestore:`, err);
      }
    }
  }

  // 3. Restore Media Assets
  if (Array.isArray(snapshot.mediaAssets)) {
    counts.mediaAssets = snapshot.mediaAssets.length;
    try {
      localStorage.setItem('kd_media_assets', JSON.stringify(snapshot.mediaAssets));
      for (const media of snapshot.mediaAssets) {
        try {
          const docRef = doc(db, MEDIA_COLLECTION, media.id);
          await setDoc(docRef, media, { merge: true });
        } catch {}
      }
    } catch (e) {
      console.warn('Could not store restored media assets:', e);
    }
  }

  // 4. Restore Live Blogs
  if (Array.isArray(snapshot.liveBlogs)) {
    counts.liveBlogs = snapshot.liveBlogs.length;
    try {
      localStorage.setItem('kd_live_blogs', JSON.stringify(snapshot.liveBlogs));
      for (const blog of snapshot.liveBlogs) {
        try {
          const docRef = doc(db, LIVE_BLOGS_COLLECTION, blog.id);
          await setDoc(docRef, blog, { merge: true });
        } catch {}
      }
    } catch (e) {
      console.warn('Could not store restored live blogs:', e);
    }
  }

  // 5. Restore Inquiries
  if (Array.isArray(snapshot.inquiries)) {
    counts.inquiries = snapshot.inquiries.length;
    try {
      localStorage.setItem('kd_contact_inquiries', JSON.stringify(snapshot.inquiries));
    } catch {}
  }

  // 6. Restore Newsletter Subscribers
  if (Array.isArray(snapshot.subscribers)) {
    counts.subscribers = snapshot.subscribers.length;
    try {
      localStorage.setItem('kd_newsletter_subscribers', JSON.stringify(snapshot.subscribers));
    } catch {}
  }

  // 7. Restore Citizen Submissions
  if (Array.isArray(snapshot.citizenSubmissions)) {
    try {
      localStorage.setItem('kd_citizen_submissions', JSON.stringify(snapshot.citizenSubmissions));
    } catch {}
  }

  return {
    success: true,
    message: `Restore completed successfully: ${counts.articles} articles, ${counts.mediaAssets} media items, and portal settings synchronized.`,
    counts,
    restoredSettings,
  };
}


/* ------------------------------------------------------------------
 * Newsroom staff (Users & roles). Document id = lower-cased email.
 * Only administrators can list or change these records (firestore.rules).
 * ------------------------------------------------------------------ */
const STAFF_COLLECTION = 'staff';

export function subscribeStaff(onStaff: (users: EditorialUser[]) => void, onError?: (e: unknown) => void) {
  return onSnapshot(
    collection(db, STAFF_COLLECTION),
    (snap) => {
      const items: EditorialUser[] = [];
      snap.forEach((d) => items.push({ ...(d.data() as EditorialUser), id: d.id }));
      onStaff(items.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    },
    (error) => {
      onStaff([]);
      onError?.(error);
    }
  );
}

/** Create or update a staff record. Strips fields that must never be stored (PINs, photos as data URLs). */
export async function saveStaffMember(user: Partial<EditorialUser> & { email: string }): Promise<string> {
  const id = staffDocId(user.email);
  const { accessPin: _pin, id: _id, ...rest } = user as EditorialUser;
  const record: Record<string, unknown> = {
    ...rest,
    email: id,
    updatedAt: new Date().toISOString(),
  };
  if (typeof record.photoURL === 'string' && (record.photoURL as string).startsWith('data:')) delete record.photoURL;
  for (const k of Object.keys(record)) if (record[k] === undefined) delete record[k];
  await setDoc(doc(db, STAFF_COLLECTION, id), record, { merge: true });
  return id;
}

export async function deleteStaffMember(id: string): Promise<void> {
  await deleteDoc(doc(db, STAFF_COLLECTION, id));
}

/* ------------------------------------------------------------------
 * Reader news submissions (public create, validated by rules; editors read).
 * ------------------------------------------------------------------ */
const SUBMISSIONS_COLLECTION = 'submissions';

export async function submitCitizenNews(sub: CitizenNewsSubmission): Promise<void> {
  const record: Record<string, unknown> = { ...sub, status: 'pending' };
  for (const k of Object.keys(record)) if (record[k] === undefined) delete record[k];
  await setDoc(doc(db, SUBMISSIONS_COLLECTION, sub.id), record);
}

export function subscribeSubmissions(onItems: (items: CitizenNewsSubmission[]) => void) {
  return onSnapshot(
    collection(db, SUBMISSIONS_COLLECTION),
    (snap) => {
      const items: CitizenNewsSubmission[] = [];
      snap.forEach((d) => items.push({ ...(d.data() as CitizenNewsSubmission), id: d.id }));
      onItems(items.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')));
    },
    () => onItems([])
  );
}

export async function fetchSubmissions(): Promise<CitizenNewsSubmission[]> {
  const snap = await getDocs(query(collection(db, SUBMISSIONS_COLLECTION), limit(500)));
  const items: CitizenNewsSubmission[] = [];
  snap.forEach((d) => items.push({ ...(d.data() as CitizenNewsSubmission), id: d.id }));
  return items.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
}

export async function updateSubmission(id: string, patch: Partial<CitizenNewsSubmission>): Promise<void> {
  const clean: Record<string, unknown> = { ...patch };
  for (const k of Object.keys(clean)) if (clean[k] === undefined) delete clean[k];
  await updateDoc(doc(db, SUBMISSIONS_COLLECTION, id), clean);
}

export async function deleteSubmission(id: string): Promise<void> {
  await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
}
