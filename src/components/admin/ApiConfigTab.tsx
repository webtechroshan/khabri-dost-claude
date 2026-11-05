import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Cpu,
  Save,
  Check,
  ExternalLink,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { ApiConfiguration } from '../../types/news';
import { authFetch } from '../../utils/authFetch';

interface ApiConfigTabProps {
  apiConfig?: ApiConfiguration;
  onSave: (config: ApiConfiguration) => void;
}

interface ValidationStatus {
  testing: boolean;
  status: 'idle' | 'valid' | 'invalid';
  message: string;
  model?: string;
  timestamp?: string;
}

export const ApiConfigTab: React.FC<ApiConfigTabProps> = ({ apiConfig, onSave }) => {
  const [config, setConfig] = useState<ApiConfiguration>(() => ({
    geminiApiKey: apiConfig?.geminiApiKey || '',
    openaiApiKey: apiConfig?.openaiApiKey || '',
    anthropicApiKey: apiConfig?.anthropicApiKey || '',
    googleTrendsApiKey: apiConfig?.googleTrendsApiKey || '',
    activeAiProvider: apiConfig?.activeAiProvider || 'gemini',
    googleTrendsRegion: apiConfig?.googleTrendsRegion || 'IN',
    googleTrendsLanguage: apiConfig?.googleTrendsLanguage || 'hi',
    googleTrendsAutoRefresh: apiConfig?.googleTrendsAutoRefresh ?? true,
    googleTrendsRefreshIntervalMinutes: apiConfig?.googleTrendsRefreshIntervalMinutes || 15,
  }));

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({
    gemini: false,
    openai: false,
    anthropic: false,
    trends: false,
  });

  const [validations, setValidations] = useState<{
    [key: string]: ValidationStatus;
  }>({
    gemini: { testing: false, status: 'idle', message: 'Not yet validated' },
    openai: { testing: false, status: 'idle', message: 'Not yet validated' },
    anthropic: { testing: false, status: 'idle', message: 'Not yet validated' },
    google_trends: { testing: false, status: 'idle', message: 'Not yet validated' },
  });

  const [isSaved, setIsSaved] = useState(false);

  const toggleVisibility = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleValidate = async (provider: 'gemini' | 'openai' | 'anthropic' | 'google_trends') => {
    let keyToTest = '';
    if (provider === 'gemini') keyToTest = config.geminiApiKey || '';
    else if (provider === 'openai') keyToTest = config.openaiApiKey || '';
    else if (provider === 'anthropic') keyToTest = config.anthropicApiKey || '';
    else if (provider === 'google_trends') keyToTest = config.googleTrendsApiKey || '';

    setValidations((prev) => ({
      ...prev,
      [provider]: { testing: true, status: 'idle', message: 'Validating key connectivity...' },
    }));

    try {
      const res = await authFetch('/api/admin/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: keyToTest,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setValidations((prev) => ({
          ...prev,
          [provider]: {
            testing: false,
            status: 'valid',
            message: data.message || 'Key is valid & operational!',
            model: data.model,
            timestamp: new Date().toLocaleTimeString(),
          },
        }));
      } else {
        setValidations((prev) => ({
          ...prev,
          [provider]: {
            testing: false,
            status: 'invalid',
            message: data.message || 'Validation failed. Please check the key.',
          },
        }));
      }
    } catch (err: any) {
      setValidations((prev) => ({
        ...prev,
        [provider]: {
          testing: false,
          status: 'invalid',
          message: err.message || 'Network error during validation.',
        },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Key className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  API Configuration & Integrations Suite
                </h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ENCRYPTED STORAGE
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Securely manage credentials for AI Content & SEO generation (Google Gemini, OpenAI, Anthropic) and real-time Google Trends. Each key is verified on server proxy routes and never exposed to the public browser.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer shrink-0 self-start sm:self-center"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved & Active!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save API Configurations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active AI Engine Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Primary AI Engine for Editorial & SEO Assistant</span>
            </h4>
            <p className="text-xs text-slate-500">
              Select which AI model processes your article drafts, headlines, and SEO meta tags.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'gemini',
              title: 'Google Gemini (Native)',
              model: 'gemini-3.8-flash',
              desc: 'High speed, built-in server proxy, optimal Hindi journalism understanding.',
              badge: 'RECOMMENDED',
              badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            },
            {
              id: 'openai',
              title: 'OpenAI GPT-4o',
              model: 'gpt-4o',
              desc: 'Versatile language generation and editorial proofreading.',
              badge: 'PRO',
              badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
            },
            {
              id: 'anthropic',
              title: 'Anthropic Claude',
              model: 'claude-3-5-sonnet',
              desc: 'Nuanced long-form prose and deep contextual summaries.',
              badge: 'OPTIONAL',
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            },
          ].map((provider) => {
            const isSelected = config.activeAiProvider === provider.id;
            return (
              <div
                key={provider.id}
                onClick={() => setConfig({ ...config, activeAiProvider: provider.id as any })}
                className={`p-4 rounded-xl border cursor-pointer transition relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900">{provider.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${provider.badgeColor}`}>
                    {provider.badge}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-700 font-semibold block mb-1">
                  Model: {provider.model}
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">{provider.desc}</p>
                {isSelected && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Provider</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: AI API KEYS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Provider API Keys</span>
          </h4>
          <p className="text-xs text-slate-500">
            Enter your secret keys for external AI platforms. Click 'Test Key' to verify connectivity.
          </p>
        </div>

        {/* 1. Google Gemini API Key */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">1. Google Gemini API Key</span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                PRIMARY
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
            >
              <span>Get Free Gemini Key (Google AI Studio)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                placeholder="AIzaSy... (Leave blank to use pre-configured system key)"
                value={config.geminiApiKey || ''}
                onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                className="w-full pl-3 pr-10 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('gemini')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKeys.gemini ? 'Hide' : 'Show'}
              >
                {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleValidate('gemini')}
              disabled={validations.gemini.testing}
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {validations.gemini.testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Key</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Feedback Badge */}
          {validations.gemini.status !== 'idle' && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                validations.gemini.status === 'valid'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {validations.gemini.status === 'valid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{validations.gemini.message}</span>
              {validations.gemini.timestamp && (
                <span className="ml-auto text-[10px] text-slate-500 font-mono">
                  Verified at {validations.gemini.timestamp}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 2. OpenAI API Key */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">2. OpenAI API Key</span>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                GPT-4o
              </span>
            </div>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
            >
              <span>Get OpenAI Key (platform.openai.com)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                placeholder="sk-proj-..."
                value={config.openaiApiKey || ''}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                className="w-full pl-3 pr-10 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('openai')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKeys.openai ? 'Hide' : 'Show'}
              >
                {showKeys.openai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleValidate('openai')}
              disabled={validations.openai.testing}
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {validations.openai.testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Key</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Feedback Badge */}
          {validations.openai.status !== 'idle' && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                validations.openai.status === 'valid'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {validations.openai.status === 'valid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{validations.openai.message}</span>
            </div>
          )}
        </div>

        {/* 3. Anthropic Claude API Key */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">3. Anthropic API Key</span>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                CLAUDE 3.5
              </span>
            </div>
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
            >
              <span>Get Claude Key (console.anthropic.com)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys.anthropic ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={config.anthropicApiKey || ''}
                onChange={(e) => setConfig({ ...config, anthropicApiKey: e.target.value })}
                className="w-full pl-3 pr-10 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('anthropic')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKeys.anthropic ? 'Hide' : 'Show'}
              >
                {showKeys.anthropic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleValidate('anthropic')}
              disabled={validations.anthropic.testing}
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {validations.anthropic.testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Key</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Feedback Badge */}
          {validations.anthropic.status !== 'idle' && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                validations.anthropic.status === 'valid'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {validations.anthropic.status === 'valid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{validations.anthropic.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION: GOOGLE TRENDS INTEGRATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Google Trends Integration & Live Keywords Pool</span>
            </h4>
            <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
              INDIA & GLOBAL
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Controls real-time trending topic fetching for the dashboard widget and automated news article generator.
          </p>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              Google Trends API Key (Optional / Custom SerpApi or RapidAPI Proxy)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Default: Built-in 2026 Live India Trending Pool
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKeys.trends ? 'text' : 'password'}
                placeholder="Leave blank to use high-availability Built-in Live India Trends Pool"
                value={config.googleTrendsApiKey || ''}
                onChange={(e) => setConfig({ ...config, googleTrendsApiKey: e.target.value })}
                className="w-full pl-3 pr-10 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('trends')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKeys.trends ? 'Hide' : 'Show'}
              >
                {showKeys.trends ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleValidate('google_trends')}
              disabled={validations.google_trends.testing}
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {validations.google_trends.testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Feedback Badge */}
          {validations.google_trends.status !== 'idle' && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                validations.google_trends.status === 'valid'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {validations.google_trends.status === 'valid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{validations.google_trends.message}</span>
            </div>
          )}
        </div>

        {/* Region & Language Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Target Trending Region (देश/क्षेत्र)
            </label>
            <select
              value={config.googleTrendsRegion || 'IN'}
              onChange={(e) => setConfig({ ...config, googleTrendsRegion: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
            >
              <option value="IN">🇮🇳 India (भारत - National)</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="GLOBAL">🌍 Worldwide / Global</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Primary Language (भाषा प्राथमिकता)
            </label>
            <select
              value={config.googleTrendsLanguage || 'hi'}
              onChange={(e) => setConfig({ ...config, googleTrendsLanguage: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
            >
              <option value="hi">हिन्दी (Hindi - देवनागरी)</option>
              <option value="en">English (India)</option>
              <option value="bilingual">Bilingual (Hindi + English)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Auto-Refresh Rate (ऑटो रिफ्रेश)
            </label>
            <select
              value={config.googleTrendsRefreshIntervalMinutes || 15}
              onChange={(e) =>
                setConfig({ ...config, googleTrendsRefreshIntervalMinutes: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
            >
              <option value={5}>Every 5 minutes (Realtime)</option>
              <option value={15}>Every 15 minutes (Recommended)</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every 1 hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md cursor-pointer"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Configurations Saved & Live!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
