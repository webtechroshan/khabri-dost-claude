import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { AdResponsiveBreakpoints, AdSlotBreakpointSize } from '../types/news';
import { AdCode } from './AdCode';

export interface AdSlotProps {
  slotId: string;
  slotLabel?: string;
  enabled?: boolean;
  adType?: 'adsense' | 'private' | 'custom_html' | 'script';
  adsenseConfig?: {
    clientId?: string;
    slotId?: string;
    adFormat?: string;
    responsive?: boolean;
    fullWidthResponsive?: boolean;
  };
  customScriptOrHtml?: string;
  privateBanner?: {
    imageUrl?: string;
    linkUrl?: string;
    title?: string;
    altText?: string;
    target?: string;
    advertiserName?: string;
  };
  isTestingMode?: boolean;
  breakpoints?: AdResponsiveBreakpoints;
  onOpenContactPage?: () => void;
  className?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  onLoaded?: () => void;
  onError?: (err?: string) => void;
}

/**
 * Reusable Smart AdSlot Component
 * 
 * Critical Rules:
 * 1. One slot, one active source.
 * 2. When a real advertisement (AdSense / Script / Image) is configured and successfully loaded,
 *    its testing banner, sample image or placeholder disappears automatically.
 * 3. Never display a placeholder and a real advertisement together in the same slot.
 * 4. In production (testingMode=false), unavailable or unconfigured ads collapse cleanly without blank space.
 * 5. Testing banners appear ONLY when explicitly enabled in testing/demo mode.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  slotLabel,
  enabled = true,
  adType = 'adsense',
  adsenseConfig,
  customScriptOrHtml,
  privateBanner,
  isTestingMode = false,
  breakpoints,
  onOpenContactPage,
  className = '',
  minHeight,
  maxHeight,
  onLoaded,
  onError,
}) => {
  // If disabled by administrator, do not render or leave blank space
  if (!enabled) {
    return null;
  }

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  });

  // Real ad loading states
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const [scriptRendered, setScriptRendered] = useState<boolean>(false);
  const [adsenseFilled, setAdsenseFilled] = useState<boolean>(false);
  const [adsenseChecked, setAdsenseChecked] = useState<boolean>(false);

  const adsenseRef = useRef<HTMLModElement>(null);

  // Resize listener for breakpoints
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine active responsive breakpoint
  const activeBreakpoint: AdSlotBreakpointSize | undefined = (() => {
    if (!breakpoints || breakpoints.enableCustomBreakpoints === false) return undefined;
    const mobileMaxWidth = breakpoints.mobile?.maxWidth ?? 640;
    const tabletMaxWidth = breakpoints.tablet?.maxWidth ?? 1024;

    if (windowWidth < mobileMaxWidth) {
      return breakpoints.mobile;
    } else if (windowWidth < tabletMaxWidth) {
      return breakpoints.tablet;
    } else {
      return breakpoints.desktop;
    }
  })();

  // If breakpoint dictates hiding on this device size
  if (activeBreakpoint?.hideOnBreakpoint) {
    return null;
  }

  // Determine if a real image advertisement is configured
  const hasRealImageAd = Boolean(
    adType === 'private' &&
    privateBanner?.imageUrl &&
    privateBanner.imageUrl.trim() !== '' &&
    !imageFailed
  );

  // Determine if custom HTML/script is configured
  const hasCustomCode = Boolean(
    (adType === 'custom_html' || adType === 'script' || customScriptOrHtml) &&
    customScriptOrHtml &&
    customScriptOrHtml.trim() !== ''
  );

  // Determine if valid real AdSense credentials are configured (not dummy XXXXX)
  const isRealAdSenseConfigured = Boolean(
    adType === 'adsense' &&
    adsenseConfig?.clientId &&
    adsenseConfig.clientId.startsWith('ca-pub-') &&
    !adsenseConfig.clientId.includes('XXXXXXXX') &&
    adsenseConfig?.slotId &&
    adsenseConfig.slotId.trim() !== ''
  );

  useEffect(() => {
    if (hasCustomCode) {
      setScriptRendered(true);
      onLoaded?.();
    }
  }, [hasCustomCode, onLoaded]);

  // Observe AdSense status
  useEffect(() => {
    if (!isRealAdSenseConfigured || !adsenseRef.current) return;

    try {
      // Trigger adsbygoogle push if available in window
      if (typeof window !== 'undefined') {
        const w = window as any;
        (w.adsbygoogle = w.adsbygoogle || []).push({});
      }
    } catch {
      // Handled by observer
    }

    const ins = adsenseRef.current;
    const checkFilled = () => {
      const status = ins.getAttribute('data-ad-status');
      const hasIframe = ins.querySelector('iframe') !== null;
      if (status === 'filled' || hasIframe) {
        setAdsenseFilled(true);
        if (onLoaded) onLoaded();
      } else if (status === 'unfilled') {
        setAdsenseFilled(false);
        if (onError) onError('AdSense returned unfilled');
      }
      setAdsenseChecked(true);
    };

    // Quick initial check + mutation observer for AdSense DOM changes
    const timer = setTimeout(checkFilled, 1500);
    const observer = new MutationObserver(() => {
      checkFilled();
    });

    observer.observe(ins, { attributes: true, childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isRealAdSenseConfigured, onLoaded, onError]);

  // Evaluate whether a real advertisement is actively displayed
  const isRealAdActive =
    (hasRealImageAd && imageLoaded) ||
    (hasCustomCode && scriptRendered) ||
    (isRealAdSenseConfigured && adsenseFilled);

  // If NO real ad is configured:
  // - In testing mode: Show sample testing banner.
  // - In production: DO NOT show fake test ad; collapse cleanly without blank space.
  const isConfiguredAtAll = hasRealImageAd || hasCustomCode || isRealAdSenseConfigured;

  if (!isConfiguredAtAll && !isTestingMode) {
    return null;
  }

  // Handle Sponsor Click
  const handleSponsorClick = (e: React.MouseEvent) => {
    const link = privateBanner?.linkUrl || '#contact';
    if (link === '#contact' || link === '/contact') {
      e.preventDefault();
      if (onOpenContactPage) {
        onOpenContactPage();
      } else {
        window.location.hash = 'contact';
      }
    }
  };

  // Dimensions
  const containerStyle: React.CSSProperties = {};
  if (activeBreakpoint?.minHeightPx) containerStyle.minHeight = `${activeBreakpoint.minHeightPx}px`;
  else if (minHeight) containerStyle.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  if (activeBreakpoint?.maxHeightPx) containerStyle.maxHeight = `${activeBreakpoint.maxHeightPx}px`;
  else if (maxHeight) containerStyle.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

  if (activeBreakpoint?.aspectRatio && activeBreakpoint.aspectRatio !== 'auto') {
    containerStyle.aspectRatio = activeBreakpoint.aspectRatio;
  }

  return (
    <div
      className={`relative my-3 w-full bg-slate-50/90 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs text-center transition-all duration-200 ${className}`}
      data-ad-slot={slotId}
      data-ad-loaded={isRealAdActive ? 'true' : 'false'}
    >
      {/* 2. CASE A: REAL UPLOADED / PRIVATE IMAGE ADVERTISEMENT */}
      {hasRealImageAd && privateBanner?.imageUrl && (
        <a
          href={privateBanner?.linkUrl || '#contact'}
          onClick={handleSponsorClick}
          target={privateBanner?.linkUrl?.startsWith('http') ? '_blank' : undefined}
          rel={privateBanner?.linkUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="group block relative overflow-hidden"
        >
          <div
            style={containerStyle}
            className={`relative w-full bg-slate-900 flex items-center justify-center overflow-hidden ${
              !activeBreakpoint
                ? slotId.includes('sidebar')
                  ? 'aspect-[300/220] sm:aspect-[300/200] min-h-[140px] max-h-64'
                  : 'aspect-[320/100] sm:aspect-[728/90] min-h-[75px] sm:min-h-[90px] max-h-40'
                : ''
            }`}
          >
            <img
              src={privateBanner.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'}
              alt={privateBanner.altText || privateBanner.title || 'प्रायोजित विज्ञापन'}
              onLoad={() => {
                setImageLoaded(true);
                setImageFailed(false);
                if (onLoaded) onLoaded();
              }}
              onError={() => {
                setImageLoaded(false);
                setImageFailed(true);
                if (onError) onError('Failed to load private ad image');
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
            {privateBanner.title && (
              <div
                className={`absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent flex ${
                  slotId.includes('sidebar')
                    ? 'flex-col justify-end p-3 text-left'
                    : 'items-center justify-between px-4 sm:px-6 text-left'
                }`}
              >
                <div className={slotId.includes('sidebar') ? 'w-full mb-1' : 'max-w-md'}>
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded uppercase font-mono">
                    {privateBanner.advertiserName || 'विशेष ऑफर'}
                  </span>
                  <p className="text-white text-xs sm:text-sm font-bold mt-1 line-clamp-2">
                    {privateBanner.title}
                  </p>
                </div>
                <span
                  className={`bg-red-600 group-hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs transition shrink-0 ${
                    slotId.includes('sidebar') ? 'self-start mt-1' : ''
                  }`}
                >
                  <span>विस्तार से</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </a>
      )}

      {/* 3. CASE B: CUSTOM HTML OR JAVASCRIPT ADVERTISEMENT */}
      {hasCustomCode && (
        <AdCode
          code={customScriptOrHtml || ''}
          style={containerStyle}
          className="p-3 sm:p-4 bg-white flex items-center justify-center min-h-[90px]"
        />
      )}

      {/* 4. CASE C: REAL GOOGLE ADSENSE NETWORK ADVERTISEMENT */}
      {isRealAdSenseConfigured && (
        <div
          style={containerStyle}
          className="p-2 sm:p-3 bg-white flex items-center justify-center min-h-[90px] overflow-hidden"
        >
          <ins
            ref={adsenseRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={adsenseConfig?.clientId}
            data-ad-slot={adsenseConfig?.slotId}
            data-ad-format={adsenseConfig?.adFormat || 'auto'}
            data-full-width-responsive={adsenseConfig?.fullWidthResponsive !== false ? 'true' : 'false'}
          />
        </div>
      )}

      {/* 5. CASE D: TESTING / DEMO BANNER (ONE SLOT, ONE SOURCE: SHOWN ONLY IF NO REAL AD ACTIVE AND TESTING MODE IS TRUE) */}
      {!isRealAdActive && isTestingMode && (
        <div
          style={containerStyle}
          className="p-4 sm:p-5 flex flex-col items-center justify-center min-h-[95px] bg-gradient-to-b from-slate-100/70 via-white to-slate-100/70"
        >
          <div className="max-w-lg text-center space-y-1.5">
            <div className="flex items-center justify-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 font-sans tracking-wide">
                डेमो / टेस्टिंग विज्ञापन स्लॉट: {slotLabel || slotId.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              एडमिन पैनल में असली Google AdSense कोड या प्रायोजित बैनर सक्रिय करते ही यह टेस्टिंग बॉक्स स्वतः छिप जाएगा।
            </p>
            <div className="pt-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenContactPage) onOpenContactPage();
                  else window.location.hash = 'contact';
                }}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer transition flex items-center space-x-1"
              >
                <span>इस स्लॉट पर विज्ञापन बुक करें</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
