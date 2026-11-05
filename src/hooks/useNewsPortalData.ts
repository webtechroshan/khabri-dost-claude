import { isArticlePubliclyVisible } from '../utils/articleVisibility';
import { staffDocId } from '../utils/roles';
import { useState, useEffect, useMemo } from 'react';
import {
  NewsArticle,
  NewsBookmark,
  NewsReadLater,
  NewsCategory,
  PortalSettings,
  SubscriberItem,
  PushNotificationItem,
  MediaAsset,
  EditorialUser,
  LiveBlogEvent,
  ContactInquiry,
  CitizenNewsSubmission,
} from '../types/news';
import {
  subscribeToArticles,
  subscribeStaff,
  subscribeSubmissions,
  updateSubmission,
  deleteSubmission,
  saveStaffMember,
  deleteStaffMember,
  subscribeToUserBookmarks,
  toggleBookmark,
  subscribeToUserReadLater,
  toggleReadLater,
  removeReadLaterItem,
  clearAllUserReadLater,
  fetchArticles,
  publishArticle,
  updateArticle,
  deleteArticle,
  subscribeToPortalSettings,
  savePortalSettings,
  seedPortalSettingsIfEmpty,
  submitContactInquiry,
  subscribeToContactInquiries,
  updateContactInquiryStatus,
  deleteContactInquiry,
  subscribeMediaAssets,
  saveMediaAsset,
  updateMediaAssetRecord,
  deleteMediaAssetRecord,
  subscribeLiveBlogs,
  saveLiveBlogRecord,
  updateLiveBlogRecord,
  deleteLiveBlogRecord,
  checkAndPublishScheduledArticles,
} from '../services/newsService';
import {
  DEFAULT_PORTAL_SETTINGS,
  DEFAULT_SPOTLIGHT_LAYOUT,
  DEFAULT_ARTICLE_META_SETTINGS,
  DEFAULT_ARTICLE_PAGE_CONFIG,
  DEFAULT_ARTICLE_SIDEBAR_WIDGETS,
  DEFAULT_MOBILE_STICKY_BAR_CONFIG,
  DEFAULT_FOOTER_BANNER_AD_CONFIG,
  DEFAULT_DESKTOP_STICKY_AD_CONFIG,
  DEFAULT_MOBILE_BOTTOM_NAV_CONFIG,
  DEFAULT_HEADLINE_STYLING_CONFIG,
  DEFAULT_LINK_STYLING_CONFIG,
  DEFAULT_TRENDING_CONFIG,
  INITIAL_SUBSCRIBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_LIVE_BLOGS,
  INITIAL_CONTACT_INQUIRIES,
} from '../data/portalDefaults';

interface UseNewsPortalDataOptions {
  user: any;
  isAdmin: boolean;
  isStaff: boolean;
  /** Editors and administrators see every article in the newsroom. */
  isEditor?: boolean;
  currentCategory: NewsCategory;
}

/**
 * useNewsPortalData
 * Master custom hook for all portal state, real-time Firestore listeners,
 * local storage fallback sync, and editorial mutations.
 */
export function useNewsPortalData({ user, isAdmin, isStaff, isEditor = false, currentCategory }: UseNewsPortalDataOptions) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<NewsBookmark[]>([]);
  const [readLaterItems, setReadLaterItems] = useState<NewsReadLater[]>([]);
  const [activePushToast, setActivePushToast] = useState<PushNotificationItem | null>(null);

  // Portal Settings (Persisted in localStorage with Firestore sync)
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(() => {
    try {
      const saved = localStorage.getItem('kd_portal_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PORTAL_SETTINGS,
          ...parsed,
          typography: {
            ...DEFAULT_PORTAL_SETTINGS.typography,
            ...(parsed.typography || {}),
          },
          displayOptions: {
            ...DEFAULT_PORTAL_SETTINGS.displayOptions,
            ...(parsed.displayOptions || {}),
          },
          sharePlatforms: {
            ...DEFAULT_PORTAL_SETTINGS.sharePlatforms,
            ...(parsed.sharePlatforms || {}),
          },
          adSettings: {
            ...DEFAULT_PORTAL_SETTINGS.adSettings,
            ...(parsed.adSettings || {}),
          },
          sidebarAdsConfig: {
            ...DEFAULT_PORTAL_SETTINGS.sidebarAdsConfig!,
            ...(parsed.sidebarAdsConfig || {}),
          },
          popupConfig: {
            ...DEFAULT_PORTAL_SETTINGS.popupConfig,
            ...(parsed.popupConfig || {}),
          },
          articleMetaSettings: {
            ...DEFAULT_ARTICLE_META_SETTINGS,
            ...(parsed.articleMetaSettings || {}),
            platforms: {
              ...DEFAULT_ARTICLE_META_SETTINGS.platforms,
              ...(parsed.articleMetaSettings?.platforms || {}),
            },
          },
          articlePageConfig: {
            ...DEFAULT_ARTICLE_PAGE_CONFIG,
            ...(parsed.articlePageConfig || {}),
            mobileStickyBar: {
              ...DEFAULT_MOBILE_STICKY_BAR_CONFIG,
              ...(parsed.articlePageConfig?.mobileStickyBar || parsed.mobileStickyBar || {}),
            },
          },
          mobileStickyBar: {
            ...DEFAULT_MOBILE_STICKY_BAR_CONFIG,
            ...(parsed.mobileStickyBar || parsed.articlePageConfig?.mobileStickyBar || {}),
          },
          footerBannerAd: {
            ...DEFAULT_FOOTER_BANNER_AD_CONFIG,
            ...(parsed.footerBannerAd || parsed.headerFooter?.footerBannerAd || {}),
          },
          desktopStickyAd: {
            ...DEFAULT_DESKTOP_STICKY_AD_CONFIG,
            ...(parsed.desktopStickyAd || {}),
          },
          mobileBottomNav: {
            ...DEFAULT_MOBILE_BOTTOM_NAV_CONFIG,
            ...(parsed.mobileBottomNav || {}),
          },
          headlineStyling: {
            ...DEFAULT_HEADLINE_STYLING_CONFIG,
            ...(parsed.headlineStyling || {}),
          },
          linkStyling: {
            ...DEFAULT_LINK_STYLING_CONFIG,
            ...(parsed.linkStyling || {}),
          },
          trendingConfig: {
            ...DEFAULT_TRENDING_CONFIG,
            ...(parsed.trendingConfig || {}),
          },
          sidebarWidgets: {
            ...DEFAULT_ARTICLE_SIDEBAR_WIDGETS,
            ...(parsed.sidebarWidgets || {}),
          },
          spotlightLayout: {
            ...DEFAULT_SPOTLIGHT_LAYOUT,
            ...(parsed.spotlightLayout || {}),
            heroSlider: {
              ...DEFAULT_SPOTLIGHT_LAYOUT.heroSlider,
              ...(parsed.spotlightLayout?.heroSlider || {}),
            },
            secondaryCol: {
              ...DEFAULT_SPOTLIGHT_LAYOUT.secondaryCol,
              ...(parsed.spotlightLayout?.secondaryCol || {}),
            },
            briefTicker: {
              ...DEFAULT_SPOTLIGHT_LAYOUT.briefTicker,
              ...(parsed.spotlightLayout?.briefTicker || {}),
            },
          },
        };
      }
    } catch {}
    return DEFAULT_PORTAL_SETTINGS;
  });

  // Subscribers state
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(() => {
    try {
      const saved = localStorage.getItem('kd_subscribers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SUBSCRIBERS;
  });

  // Notifications history
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('kd_push_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // Media Assets
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem('kd_media_assets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEDIA_ASSETS;
  });

  // Editorial team: Firestore `staff` collection (administrators only).
  const [editorialUsers, setEditorialUsers] = useState<EditorialUser[]>([]);
  useEffect(() => {
    if (!isAdmin) {
      setEditorialUsers([]);
      return;
    }
    return subscribeStaff(setEditorialUsers);
  }, [isAdmin]);

  // Live Blogs
  const [liveBlogs, setLiveBlogs] = useState<LiveBlogEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kd_live_blogs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LIVE_BLOGS;
  });
  const [activeLiveBlog, setActiveLiveBlog] = useState<LiveBlogEvent | null>(null);

  // Contact Desk Inquiries
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('kd_contact_inquiries');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CONTACT_INQUIRIES;
  });

  // Reader news submissions (Firestore; editors only).
  const [citizenSubmissions, setCitizenSubmissions] = useState<CitizenNewsSubmission[]>([]);
  useEffect(() => {
    if (!(isEditor || isAdmin)) {
      setCitizenSubmissions([]);
      return;
    }
    return subscribeSubmissions(setCitizenSubmissions);
  }, [isEditor, isAdmin]);

  // 1. Articles: readers get published articles; staff additionally get the articles their role may edit.
  const [publicArticles, setPublicArticles] = useState<NewsArticle[]>([]);
  const [staffOnlyArticles, setStaffOnlyArticles] = useState<NewsArticle[]>([]);
  useEffect(() => {
    const unsubscribe = subscribeToArticles((loaded) => {
      setPublicArticles(loaded);
      setLoading(false);
    }, 'public');
    return () => unsubscribe();
  }, []);

  const staffUid: string | null = isStaff && user?.uid ? user.uid : null;
  useEffect(() => {
    if (!staffUid) {
      setStaffOnlyArticles([]);
      return;
    }
    const unsubscribe = subscribeToArticles(setStaffOnlyArticles, isEditor || isAdmin ? 'all' : { authorUid: staffUid });
    return () => unsubscribe();
  }, [staffUid, isEditor, isAdmin]);

  useEffect(() => {
    const byId = new Map<string, NewsArticle>();
    for (const a of publicArticles) byId.set(a.id, a);
    for (const a of staffOnlyArticles) byId.set(a.id, a);
    setArticles(
      Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }, [publicArticles, staffOnlyArticles]);

  // 3. Live subscription to global portal settings from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPortalSettings((syncedSettings) => {
      setPortalSettings(syncedSettings);
    });
    return () => unsubscribe();
  }, []);

  // 4. Live subscription to Media Assets
  useEffect(() => {
    const unsubscribe = subscribeMediaAssets((syncedMedia) => {
      setMediaAssets(syncedMedia);
    });
    return () => unsubscribe();
  }, []);

  // 5. Live subscription to Live Blogs
  useEffect(() => {
    const unsubscribe = subscribeLiveBlogs((syncedBlogs) => {
      setLiveBlogs(syncedBlogs);
      setActiveLiveBlog((prev) => {
        if (!prev) return syncedBlogs[0] || null;
        const matching = syncedBlogs.find((b) => b.id === prev.id);
        return matching || syncedBlogs[0] || null;
      });
    });
    return () => unsubscribe();
  }, []);

  // 6. Scheduled publishing while an editor has the site open. Readers never see a scheduled article
  //    before its time (isArticlePubliclyVisible), and the server sitemaps only list published ones.
  useEffect(() => {
    if (!(isEditor || isAdmin)) return;
    const runScheduledCheck = async () => {
      if (articles.length === 0) return;
      const result = await checkAndPublishScheduledArticles(articles);
      if (result.publishedCount > 0) {
        setArticles(result.updatedArticles);
      }
    };
    runScheduledCheck();
    const interval = setInterval(runScheduledCheck, 60000);
    return () => clearInterval(interval);
  }, [articles, isEditor, isAdmin]);

  // 7. Contact inquiries subscription
  useEffect(() => {
    if (!isAdmin && !isEditor) return;
    const unsubscribe = subscribeToContactInquiries((syncedInquiries) => {
      setContactInquiries(syncedInquiries);
    });
    return () => unsubscribe();
  }, [isAdmin, isEditor]);

  // 8. Bookmarks subscription
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    const unsubscribe = subscribeToUserBookmarks(user.uid, (userBookmarks) => {
      setBookmarks(userBookmarks);
    });
    return () => unsubscribe();
  }, [user]);

  // 9. Read Later subscription
  useEffect(() => {
    const unsubscribe = subscribeToUserReadLater(user?.uid || '', (items) => {
      setReadLaterItems(items);
    });
    return () => unsubscribe();
  }, [user]);

  // 10. Seed portal settings if admin
  useEffect(() => {
    if (isAdmin) {
      seedPortalSettingsIfEmpty().catch(() => {});
    }
  }, [isAdmin]);

  // Settings update handler
  const handleUpdateSettings = (newSettings: Partial<PortalSettings>) => {
    setPortalSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        typography: {
          ...prev.typography,
          ...(newSettings.typography || {}),
        },
        displayOptions: {
          ...prev.displayOptions,
          ...(newSettings.displayOptions || {}),
        },
        sharePlatforms: {
          ...prev.sharePlatforms,
          ...(newSettings.sharePlatforms || {}),
        },
        adSettings: {
          ...prev.adSettings,
          ...(newSettings.adSettings || {}),
        },
        sidebarAdsConfig: {
          ...(prev.sidebarAdsConfig || DEFAULT_PORTAL_SETTINGS.sidebarAdsConfig!),
          ...(newSettings.sidebarAdsConfig || {}),
        },
        popupConfig: {
          ...(prev.popupConfig || DEFAULT_PORTAL_SETTINGS.popupConfig!),
          ...(newSettings.popupConfig || {}),
        },
        articlePageConfig: {
          ...(prev.articlePageConfig || DEFAULT_PORTAL_SETTINGS.articlePageConfig || DEFAULT_ARTICLE_PAGE_CONFIG),
          ...(newSettings.articlePageConfig || {}),
        },
        mobileStickyBar: {
          ...(prev.mobileStickyBar || prev.articlePageConfig?.mobileStickyBar || DEFAULT_MOBILE_STICKY_BAR_CONFIG),
          ...(newSettings.mobileStickyBar || newSettings.articlePageConfig?.mobileStickyBar || {}),
        },
        footerBannerAd: {
          ...(prev.footerBannerAd || prev.headerFooter?.footerBannerAd || DEFAULT_FOOTER_BANNER_AD_CONFIG),
          ...(newSettings.footerBannerAd || newSettings.headerFooter?.footerBannerAd || {}),
        },
        sidebarWidgets: {
          ...(prev.sidebarWidgets || DEFAULT_PORTAL_SETTINGS.sidebarWidgets || DEFAULT_ARTICLE_SIDEBAR_WIDGETS),
          ...(newSettings.sidebarWidgets || {}),
        },
        articleMetaSettings: {
          ...(prev.articleMetaSettings || DEFAULT_PORTAL_SETTINGS.articleMetaSettings || DEFAULT_ARTICLE_META_SETTINGS),
          ...(newSettings.articleMetaSettings || {}),
          platforms: {
            ...((prev.articleMetaSettings || DEFAULT_PORTAL_SETTINGS.articleMetaSettings || DEFAULT_ARTICLE_META_SETTINGS).platforms || {}),
            ...(newSettings.articleMetaSettings?.platforms || {}),
          },
        },
      };
      try {
        localStorage.setItem('kd_portal_settings', JSON.stringify(updated));
      } catch {}
      savePortalSettings(updated).catch(() => {});
      return updated;
    });
  };

  // Article CRUD
  /** Save an article. Errors are shown to the editor and re-thrown; nothing is faked locally. */
  const handleSaveArticle = async (artData: Partial<NewsArticle>) => {
    try {
      if (artData.id) await updateArticle(artData.id, artData);
      else await publishArticle(artData as any);
    } catch (e: any) {
      const msg = e?.code === 'permission-denied' ? 'Your role does not allow this change.' : e?.message || 'Unknown error';
      window.alert(`The article could not be saved: ${msg}`);
      throw e;
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
    } catch (e: any) {
      window.alert(
        `The article could not be deleted: ${e?.code === 'permission-denied' ? 'only administrators can delete articles.' : e?.message || 'Unknown error'}`
      );
    }
  };

  // Bookmarks
  const isArticleBookmarked = (articleId: string) => bookmarks.some((b) => b.articleId === articleId);

  const handleToggleBookmark = async (article: NewsArticle) => {
    if (!user) {
      setActivePushToast({
        id: 'toast-' + Date.now(),
        title: 'लॉगिन आवश्यक है',
        message: 'खबरों को बुकमार्क करने के लिए कृपया Google से लॉगिन करें।',
        status: 'sent',
        targetAudience: 'all',
        sentAt: new Date().toISOString(),
        clicksCount: 0,
        reachCount: 1,
      });
      return;
    }
    const isCurrentlyBookmarked = bookmarks.some((b) => b.articleId === article.id);
    try {
      await toggleBookmark(user.uid, article, isCurrentlyBookmarked);
    } catch {
      setActivePushToast({
        id: 'toast-' + Date.now(),
        title: 'बुकमार्क सुरक्षित नहीं हो सका',
        message: 'कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
        status: 'sent',
        targetAudience: 'all',
        sentAt: new Date().toISOString(),
        clicksCount: 0,
        reachCount: 1,
      });
    }
  };

  // Read Later
  const isArticleInReadLater = (articleId: string) => readLaterItems.some((r) => r.articleId === articleId);

  const handleToggleReadLater = async (article: NewsArticle) => {
    const isCurrentlySaved = readLaterItems.some((r) => r.articleId === article.id);
    try {
      const added = await toggleReadLater(user?.uid || '', article, isCurrentlySaved);
      setActivePushToast({
        id: 'toast-' + Date.now(),
        title: added ? 'बाद में पढ़ें (कतार में जोड़ा)' : 'रीड लेटर से हटाया गया',
        message: added
          ? `"${article.title.slice(0, 42)}..." को आपकी निजी पठन कतार में सहेज लिया गया है।`
          : 'लेख आपकी पठन कतार से हटा दिया गया है।',
        status: 'sent',
        targetAudience: 'all',
        sentAt: new Date().toISOString(),
        clicksCount: 0,
        reachCount: 1,
      });
    } catch {
      setActivePushToast({
        id: 'toast-' + Date.now(),
        title: 'त्रुटि',
        message: 'रीड लेटर सूची अपडेट नहीं हो सकी।',
        status: 'sent',
        targetAudience: 'all',
        sentAt: new Date().toISOString(),
        clicksCount: 0,
        reachCount: 1,
      });
    }
  };

  const handleRemoveReadLater = async (articleId: string) => {
    try {
      await removeReadLaterItem(user?.uid || '', articleId);
    } catch (err) {
      console.warn('Error removing read later item:', err);
    }
  };

  const handleClearAllReadLater = async () => {
    try {
      await clearAllUserReadLater(user?.uid || '', readLaterItems);
      setReadLaterItems([]);
    } catch (err) {
      console.warn('Error clearing read later:', err);
    }
  };

  // Media
  const handleAddMedia = (newMedia: Omit<MediaAsset, 'id' | 'uploadedAt'>) => {
    const item: MediaAsset = {
      ...newMedia,
      id: `media-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setMediaAssets((prev) => [item, ...prev]);
    saveMediaAsset(item).catch(() => {});
  };

  const handleDeleteMedia = (id: string) => {
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
    deleteMediaAssetRecord(id).catch(() => {});
  };

  const handleUpdateMedia = (updatedMedia: Partial<MediaAsset> & { id: string }) => {
    setMediaAssets((prev) =>
      prev.map((m) => (m.id === updatedMedia.id ? { ...m, ...updatedMedia } : m))
    );
    updateMediaAssetRecord(updatedMedia).catch(() => {});
  };

  // Editorial Users (Firestore; errors are reported to the console and leave the list unchanged)
  const handleAddEditorialUser = (newUser: Omit<EditorialUser, 'id' | 'joinedAt'>) => {
    saveStaffMember({ ...newUser, joinedAt: new Date().toISOString() }).catch((e) =>
      console.warn('Could not save staff member:', e)
    );
  };

  const handleUpdateEditorialUser = (updatedUser: Partial<EditorialUser> & { id: string }) => {
    const current = editorialUsers.find((u) => u.id === updatedUser.id);
    const email = updatedUser.email || current?.email || updatedUser.id;
    if (current && updatedUser.email && staffDocId(updatedUser.email) !== current.id) {
      // Email changed: move the record to the new id.
      saveStaffMember({ ...current, ...updatedUser, email: updatedUser.email })
        .then(() => deleteStaffMember(current.id))
        .catch((e) => console.warn('Could not update staff member:', e));
      return;
    }
    saveStaffMember({ ...current, ...updatedUser, email }).catch((e) => console.warn('Could not update staff member:', e));
  };

  const handleDeleteEditorialUser = (id: string) => {
    deleteStaffMember(id).catch((e) => console.warn('Could not remove staff member:', e));
  };

  // Live Blogs
  const handleAddLiveBlog = (newBlog: LiveBlogEvent) => {
    setLiveBlogs((prev) => [newBlog, ...prev]);
    saveLiveBlogRecord(newBlog).catch(() => {});
  };

  const handleUpdateLiveBlog = (updatedBlog: LiveBlogEvent) => {
    setLiveBlogs((prev) => prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)));
    updateLiveBlogRecord(updatedBlog).catch(() => {});
  };

  const handleDeleteLiveBlog = (id: string) => {
    setLiveBlogs((prev) => prev.filter((b) => b.id !== id));
    deleteLiveBlogRecord(id).catch(() => {});
  };

  // Inquiries
  const handleAddContactInquiry = async (newInq: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>) => {
    try {
      const created = await submitContactInquiry(newInq);
      setContactInquiries((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
    } catch {
      const item: ContactInquiry = {
        ...newInq,
        id: `inq-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'new',
      };
      setContactInquiries((prev) => {
        const updated = [item, ...prev];
        try {
          localStorage.setItem('kd_contact_inquiries', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleUpdateInquiryStatus = (id: string, status: ContactInquiry['status'], adminNotes?: string) => {
    setContactInquiries((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? { ...i, status, adminNotes: adminNotes !== undefined ? adminNotes : i.adminNotes } : i
      );
      try {
        localStorage.setItem('kd_contact_inquiries', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    updateContactInquiryStatus(id, status, adminNotes).catch(() => {});
  };

  const handleDeleteInquiry = (id: string) => {
    deleteContactInquiry(id).catch(() => {});
    setContactInquiries((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem('kd_contact_inquiries', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Citizen Submissions (the public form writes to Firestore itself; these are editor actions)
  const handleAddCitizenSubmission = (_submission: CitizenNewsSubmission) => {
    // Nothing to do: the submission is already stored and arrives through the subscription.
  };

  const handleUpdateCitizenSubmissionStatus = (
    id: string,
    status: CitizenNewsSubmission['status'],
    editorialNotes?: string
  ) => {
    updateSubmission(id, { status, editorialNotes }).catch((e) => console.warn('Could not update submission:', e));
  };

  const handleDeleteCitizenSubmission = (id: string) => {
    deleteSubmission(id).catch((e) => console.warn('Could not delete submission:', e));
  };

  // Subscribers
  const handleAddSubscriber = (newSub: Omit<SubscriberItem, 'id' | 'subscribedAt'>) => {
    const item: SubscriberItem = {
      ...newSub,
      id: 'sub_' + Date.now(),
      subscribedAt: new Date().toISOString(),
    };
    setSubscribers((prev) => {
      const existingIndex = prev.findIndex((s) => s.email.toLowerCase() === item.email.toLowerCase());
      let updated: SubscriberItem[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...item,
          id: updated[existingIndex].id,
          subscribedAt: updated[existingIndex].subscribedAt,
        };
      } else {
        updated = [item, ...prev];
      }
      try {
        localStorage.setItem('kd_subscribers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteSubscriber = (id: string) => {
    const updated = subscribers.filter((s) => s.id !== id);
    setSubscribers(updated);
    try {
      localStorage.setItem('kd_subscribers', JSON.stringify(updated));
    } catch {}
  };

  // Push Notifications
  const handleSendNotification = (
    notifData: Omit<PushNotificationItem, 'id' | 'sentAt' | 'clicksCount' | 'reachCount'>
  ) => {
    const newNotif: PushNotificationItem = {
      ...notifData,
      id: 'notif_' + Date.now(),
      sentAt: new Date().toISOString(),
      clicksCount: 1,
      reachCount: subscribers.length * 150 + 2400,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    try {
      localStorage.setItem('kd_push_notifications', JSON.stringify(updated));
    } catch {}
    setActivePushToast(newNotif);
    setTimeout(() => {
      setActivePushToast(null);
    }, 8000);
  };

  /** Articles readers may see. Public pages must use this list. */
  const visibleArticles = useMemo(() => articles.filter((a) => isArticlePubliclyVisible(a)), [articles]);

  return {
    /** Published, visible articles (public views). */
    articles: visibleArticles,
    /** Everything the signed-in staff member may work on (admin views). */
    staffArticles: articles,
    setArticles,
    loading,
    bookmarks,
    isArticleBookmarked,
    handleToggleBookmark,
    readLaterItems,
    isArticleInReadLater,
    handleToggleReadLater,
    handleRemoveReadLater,
    handleClearAllReadLater,
    portalSettings,
    setPortalSettings,
    handleUpdateSettings,
    mediaAssets,
    handleAddMedia,
    handleUpdateMedia,
    handleDeleteMedia,
    editorialUsers,
    handleAddEditorialUser,
    handleUpdateEditorialUser,
    handleDeleteEditorialUser,
    liveBlogs,
    activeLiveBlog,
    setActiveLiveBlog,
    handleAddLiveBlog,
    handleUpdateLiveBlog,
    handleDeleteLiveBlog,
    contactInquiries,
    handleAddContactInquiry,
    handleUpdateInquiryStatus,
    handleDeleteInquiry,
    citizenSubmissions,
    handleAddCitizenSubmission,
    handleUpdateCitizenSubmissionStatus,
    handleDeleteCitizenSubmission,
    subscribers,
    handleAddSubscriber,
    handleDeleteSubscriber,
    notifications,
    activePushToast,
    setActivePushToast,
    handleSendNotification,
    handleSaveArticle,
    handleDeleteArticle,
  };
}
