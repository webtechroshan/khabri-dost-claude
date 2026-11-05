import React, { useState } from 'react';
import { useNewsroom, PageHead, Denied } from './context';
import { LiveNewsManagerTab } from '../admin/LiveNewsManagerTab';
import { MediaLibraryTab } from '../admin/MediaLibraryTab';
import { EPaperSettingsTab } from '../admin/EPaperSettingsTab';
import type { PortalSettings } from '../../types/news';

/** Live coverage: the existing live-blog manager inside the new shell. */
export const LiveScreen: React.FC = () => {
  const { liveBlogs, addLiveBlog, updateLiveBlog, deleteLiveBlog, settings } = useNewsroom();
  return (
    <div className="kd-nr__page">
      <PageHead title="Live coverage" sub="Live blogs appear at /live while they are marked live." />
      <div className="kd-embed">
        <LiveNewsManagerTab
          liveBlogs={liveBlogs}
          onAddLiveBlog={addLiveBlog}
          onUpdateLiveBlog={updateLiveBlog}
          onDeleteLiveBlog={deleteLiveBlog}
          portalSettings={settings}
        />
      </div>
    </div>
  );
};

/** Media: image library and the e-paper edition. */
export const MediaScreen: React.FC = () => {
  const { media, addMedia, updateMedia, deleteMedia, articles, settings, saveSettings, me, notify } = useNewsroom();
  const [tab, setTab] = useState<'library' | 'epaper'>('library');
  return (
    <div className="kd-nr__page">
      <PageHead title="Media" sub="Use only images and PDFs the newsroom has the right to publish." />
      <div className="kd-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'library'} onClick={() => setTab('library')}>
          Image library
        </button>
        <button type="button" role="tab" aria-selected={tab === 'epaper'} onClick={() => setTab('epaper')}>
          E-paper
        </button>
      </div>
      <div className="kd-embed">
        {tab === 'library' && <MediaLibraryTab mediaAssets={media} onAddMedia={addMedia} onUpdateMedia={updateMedia} onDeleteMedia={deleteMedia} articles={articles} />}
        {tab === 'epaper' &&
          (me.isEditor ? (
            <EPaperSettingsTab
              settings={settings}
              onChange={(updated: PortalSettings) =>
                saveSettings({ epaperSettings: updated.epaperSettings }).then(
                  () => notify('E-paper saved.'),
                  () => notify('Could not save the e-paper settings.', 'error')
                )
              }
            />
          ) : (
            <Denied what="changing the e-paper" />
          ))}
      </div>
    </div>
  );
};
