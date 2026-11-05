import React, { useState } from 'react';
import {
  Layout,
  DollarSign,
  Image as ImageIcon,
  ExternalLink,
  Check,
  Save,
  Eye,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PortalSettings, SidebarAdsConfig, SidebarAdSlotConfig } from '../../types/news';
import { DEFAULT_SIDEBAR_ADS_CONFIG } from '../../data/portalDefaults';
import { AdBreakpointEditor } from './AdBreakpointEditor';

interface SidebarAdConfigTabProps {
  settings: PortalSettings;
  onUpdateSettings: (settings: PortalSettings) => void;
}

// Stock-photo presets removed: ads must be real creatives uploaded by the owner.
const PRESET_BANNERS: Array<{ name: string; url: string; title: string; link: string }> = [];

export const SidebarAdConfigTab: React.FC<SidebarAdConfigTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [sidebarConfig, setSidebarConfig] = useState<SidebarAdsConfig>({
    ...DEFAULT_SIDEBAR_ADS_CONFIG,
    ...(settings.sidebarAdsConfig || {}),
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateSlot = (
    slotKey: keyof SidebarAdsConfig,
    partial: Partial<SidebarAdSlotConfig>
  ) => {
    setSidebarConfig((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        ...partial,
      },
    }));
  };

  const handleApplyPreset = (slotKey: keyof SidebarAdsConfig, presetIdx: number) => {
    const p = PRESET_BANNERS[presetIdx];
    if (!p) return;
    handleUpdateSlot(slotKey, {
      adType: 'private',
      bannerUrl: p.url,
      bannerTitle: p.title,
      bannerLink: p.link,
      altText: p.title,
    });
  };

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      sidebarAdsConfig: sidebarConfig,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetToDefaults = () => {
    setSidebarConfig(DEFAULT_SIDEBAR_ADS_CONFIG);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-kd-body text-slate-800">
      {/* 1. Header with Save Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <Layout className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-kd-headline">
              Sidebar Ad Configuration (Modular Slots)
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-kd-meta">
              Modular Slots
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-kd-meta mt-1">
            Individually enable or disable the 3 sidebar ad placements (Top, Middle, Bottom) on single article pages and configure custom banner graphics or AdSense slot IDs.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1 cursor-pointer font-kd-meta"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md cursor-pointer font-kd-meta"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Sidebar Ad Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Sequence Guide */}
      <div className="bg-white text-slate-800 p-4 rounded-2xl border border-slate-200 text-xs font-kd-meta shadow-sm">
        <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider block mb-1">
          Sidebar Modular Layout Flow
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
            1. Advertisement (Top Slot)
          </span>
          <span className="text-slate-400">➔</span>
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200">
            2. Trending Stories Feed
          </span>
          <span className="text-slate-400">➔</span>
          <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
            3. Advertisement (Middle Slot)
          </span>
          <span className="text-slate-400">➔</span>
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200">
            4. Opinion Poll
          </span>
          <span className="text-slate-400">➔</span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
            5. Advertisement (Bottom Slot)
          </span>
        </div>
      </div>

      {/* Global Sidebar Ad Breakpoints */}
      <AdBreakpointEditor
        label="Global Sidebar Ads (All 3 Slots)"
        breakpoints={sidebarConfig.globalBreakpoints}
        onChange={(updated) =>
          setSidebarConfig((prev) => ({
            ...prev,
            globalBreakpoints: updated,
            topSlot: { ...prev.topSlot, breakpoints: updated },
            middleSlot: { ...prev.middleSlot, breakpoints: updated },
            bottomSlot: { ...prev.bottomSlot, breakpoints: updated },
          }))
        }
      />

      {/* 3 Modular Slot Configuration Cards */}
      <div className="space-y-6">
        {/* SLOT 1: TOP SIDEBAR AD */}
        <SidebarSlotEditor
          title="Slot 1: Top Sidebar Ad"
          subtitle="Renders prominently right above the Trending Stories feed."
          badgeColor="red"
          slotConfig={sidebarConfig.topSlot}
          onChange={(partial) => handleUpdateSlot('topSlot', partial)}
          onApplyPreset={(idx) => handleApplyPreset('topSlot', idx)}
        />

        {/* SLOT 2: MIDDLE SIDEBAR AD */}
        <SidebarSlotEditor
          title="Slot 2: Middle Sidebar Ad"
          subtitle="Renders between the Trending Stories feed and the Opinion Poll."
          badgeColor="amber"
          slotConfig={sidebarConfig.middleSlot}
          onChange={(partial) => handleUpdateSlot('middleSlot', partial)}
          onApplyPreset={(idx) => handleApplyPreset('middleSlot', idx)}
        />

        {/* SLOT 3: BOTTOM SIDEBAR AD */}
        <SidebarSlotEditor
          title="Slot 3: Bottom Sidebar Ad"
          subtitle="Renders at the end of the sidebar below the Opinion Poll."
          badgeColor="emerald"
          slotConfig={sidebarConfig.bottomSlot}
          onChange={(partial) => handleUpdateSlot('bottomSlot', partial)}
          onApplyPreset={(idx) => handleApplyPreset('bottomSlot', idx)}
        />
      </div>
    </div>
  );
};

interface SidebarSlotEditorProps {
  title: string;
  subtitle: string;
  badgeColor: 'red' | 'amber' | 'emerald';
  slotConfig: SidebarAdSlotConfig;
  onChange: (partial: Partial<SidebarAdSlotConfig>) => void;
  onApplyPreset: (presetIndex: number) => void;
}

const SidebarSlotEditor: React.FC<SidebarSlotEditorProps> = ({
  title,
  subtitle,
  badgeColor,
  slotConfig,
  onChange,
  onApplyPreset,
}) => {
  const isEnabled = slotConfig?.enabled !== false;
  const adType = slotConfig?.adType || 'private';

  const badgeStyles = {
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[badgeColor];

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden ${
        isEnabled ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-80'
      }`}
    >
      {/* Slot Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 font-kd-headline">
              {title}
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyles}`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-kd-meta">{subtitle}</p>
        </div>

        {/* Master Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto shrink-0">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="ml-2.5 text-xs font-bold text-slate-700 font-kd-meta">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {/* Slot Controls (Visible if enabled) */}
      {isEnabled && (
        <div className="p-4 sm:p-5 space-y-4 font-kd-meta">
          {/* Ad Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Advertising Format
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => onChange({ adType: 'private' })}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  adType === 'private'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Custom Sponsor Banner</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ adType: 'adsense' })}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  adType === 'adsense'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>Google AdSense Slot</span>
              </button>
            </div>
          </div>

          {/* If Custom Banner */}
          {adType === 'private' ? (
            <div className="space-y-3.5 pt-1">
              {/* Quick Preset Selector */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">
                  Quick Presets & Sample Banners:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BANNERS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onApplyPreset(idx)}
                      className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Banner Image URL:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or /ads/banner.jpg"
                    value={slotConfig.bannerUrl || ''}
                    onChange={(e) => onChange({ bannerUrl: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Target Link & Title Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Redirect Link:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://client-website.com or #contact"
                      value={slotConfig.bannerLink || ''}
                      onChange={(e) => onChange({ bannerLink: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banner Title & Alt Text:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special Brand Promotion Offer"
                    value={slotConfig.bannerTitle || ''}
                    onChange={(e) =>
                      onChange({ bannerTitle: e.target.value, altText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Live Image Preview */}
              {slotConfig.bannerUrl ? (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>Live Sidebar Preview (300x250 Medium Rectangle):</span>
                  </span>
                  <div className="max-w-xs mx-auto border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-900 relative group">
                    <img
                      src={slotConfig.bannerUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&auto=format&fit=crop&q=80'}
                      alt={slotConfig.bannerTitle || 'Sidebar Ad'}
                      className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-left">
                      <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded w-fit uppercase font-mono">
                        Sponsored
                      </span>
                      <p className="text-white text-xs font-bold mt-1 line-clamp-1">
                        {slotConfig.bannerTitle || 'Sponsored Campaign'}
                      </p>
                      <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-0.5">
                        <span>Learn More</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Enter an image URL or choose a preset above to display this banner.</span>
                </div>
              )}
            </div>
          ) : (
            /* If Google AdSense */
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google AdSense Sidebar Slot ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={slotConfig.adSlotId || ''}
                  onChange={(e) => onChange({ adSlotId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                <span className="text-xs font-bold text-slate-700 block">
                  Google AdSense 300x250 Medium Rectangle Simulator
                </span>
                <p className="text-[11px] text-slate-500">
                  Google AdSense tags automatically deliver responsive units to this placement in production.
                </p>
              </div>
            </div>
          )}

          {/* Slot-Specific Responsive Breakpoint Customizer */}
          <div className="pt-2">
            <AdBreakpointEditor
              label={`${title} Container Breakpoints`}
              breakpoints={slotConfig.breakpoints}
              onChange={(updatedBreakpoints) => onChange({ breakpoints: updatedBreakpoints })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
