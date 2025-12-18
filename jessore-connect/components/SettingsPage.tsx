
import React, { useState, useEffect } from 'react';
import { AppSettings, Language } from '../types';
import { TRANSLATIONS, toBengaliDigits } from '../translations';
import { maskSensitiveData } from '../services/securityService';
import { getRequestStats, RequestStats } from '../services/cacheService';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user?: any;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
    settings, 
    onUpdateSettings, 
    language,
    onLanguageChange,
    user
}) => {
  const t = TRANSLATIONS[language];
  const [stats, setStats] = useState<RequestStats>(getRequestStats());

  useEffect(() => {
    const timer = setInterval(() => {
        setStats(getRequestStats());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleToggle = (key: keyof AppSettings) => {
    // @ts-ignore
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    onUpdateSettings({ ...settings, fontSize: size });
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all app data? This cannot be undone.")) {
        localStorage.removeItem('jashore_community_posts');
        localStorage.removeItem('jashore_app_settings');
        localStorage.removeItem('jashore_secure_v1');
        localStorage.removeItem('jashore_api_usage');
        alert(t.clearCacheDone);
        window.location.reload();
    }
  };

  const remaining = stats.limit - stats.used;
  const percentage = (remaining / stats.limit) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fadeIn">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center">
            <i className="fa-solid fa-gear mr-4 text-emerald-500"></i>
            {t.settings}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure your Smart City experience and privacy</p>
      </div>

      <div className="space-y-6">
        
        {/* API Usage & Quota */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl overflow-hidden relative group">
            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa-solid fa-server text-9xl"></i>
            </div>
            
            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] mb-6 flex items-center">
                <i className="fa-solid fa-microchip mr-2"></i> API Live Quota
            </h3>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex-1">
                    <div className="text-5xl font-black mb-1 flex items-baseline gap-2">
                        {language === 'bn' ? toBengaliDigits(remaining) : remaining}
                        <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">Requests Left</span>
                    </div>
                    <p className="text-slate-400 text-sm">Unique AI requests available for the current hour.</p>
                </div>
                <div className="text-right">
                    <div className="text-emerald-400 font-mono text-xl font-bold">
                        {language === 'bn' ? toBengaliDigits(stats.resetInMinutes) : stats.resetInMinutes}m
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Until Auto-Refresh</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner border border-slate-700">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${percentage < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Used: {language === 'bn' ? toBengaliDigits(stats.used) : stats.used}</span>
                    <span>Limit: {language === 'bn' ? toBengaliDigits(stats.limit) : stats.limit}</span>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-leaf text-xs"></i>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    Caching is active. Requests to the same category are served offline for 60 minutes to save your quota and reduce latency.
                </p>
            </div>
        </div>

        {/* General & Localization */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-6 flex items-center">
                <i className="fa-solid fa-globe mr-2"></i> {t.general}
            </h3>
            
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-5 shrink-0">
                            <i className="fa-solid fa-language text-xl"></i>
                        </div>
                        <div>
                            <span className="block text-slate-900 dark:text-white font-bold text-lg">{t.language}</span>
                            <span className="text-sm text-slate-500">Choose your interface language</span>
                        </div>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => onLanguageChange('en')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                language === 'en' 
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {t.english}
                        </button>
                        <button
                            onClick={() => onLanguageChange('bn')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                language === 'bn' 
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {t.bengali}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-5 shrink-0">
                            <i className="fa-solid fa-location-crosshairs text-xl"></i>
                        </div>
                        <div>
                            <span className="block text-slate-900 dark:text-white font-bold text-lg">{t.locationAccess}</span>
                            <span className="text-sm text-slate-500">Enable location-based alerts and maps</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggle('locationAccess')}
                        className={`w-14 h-8 flex items-center rounded-full p-1.5 transition-colors duration-300 ${settings.locationAccess ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform duration-300 ${settings.locationAccess ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>
            </div>
        </div>

        {/* Appearance & Accessibility */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-6 flex items-center">
                <i className="fa-solid fa-eye mr-2"></i> {t.appearance}
            </h3>
            
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-5 shrink-0">
                            <i className="fa-solid fa-font text-xl"></i>
                        </div>
                        <div>
                            <span className="block text-slate-900 dark:text-white font-bold text-lg">{t.fontSize}</span>
                            <span className="text-sm text-slate-500">Adjust the readability of city guides</span>
                        </div>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        {(['small', 'medium', 'large'] as const).map(size => (
                            <button
                                key={size}
                                onClick={() => handleFontSizeChange(size)}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                                    settings.fontSize === size 
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                {size === 'small' ? 'A' : size === 'medium' ? 'AA' : 'AAA'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-5 shrink-0">
                            <i className="fa-solid fa-ear-listen text-xl"></i>
                        </div>
                        <div>
                            <span className="block text-slate-900 dark:text-white font-bold text-lg">{t.enableTTS}</span>
                            <span className="text-sm text-slate-500">Auto-narrate information content</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggle('enableTTS')}
                        className={`w-14 h-8 flex items-center rounded-full p-1.5 transition-colors duration-300 ${settings.enableTTS ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform duration-300 ${settings.enableTTS ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>
            </div>
        </div>

        {/* Security & Data Management */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-6 flex items-center">
                <i className="fa-solid fa-shield-halved mr-2"></i> {t.data}
            </h3>
            
            <div className="space-y-6">
                {user && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mr-5 shrink-0 shadow-sm">
                            <i className="fa-solid fa-user-shield text-emerald-500 text-xl"></i>
                        </div>
                        <div className="min-w-0">
                            <span className="block text-slate-900 dark:text-white font-bold text-lg leading-tight">Identity Protection</span>
                            <span className="text-sm text-slate-500 truncate block">Logged as: {maskSensitiveData(user.email)}</span>
                        </div>
                    </div>
                    <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 text-[10px] font-black rounded uppercase ml-2">Secure</div>
                  </div>
                )}

                <button 
                    onClick={handleClearCache}
                    className="w-full flex items-center justify-between p-4 rounded-3xl bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-all border border-red-100/50 dark:border-red-900/20 group"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-red-500 flex items-center justify-center mr-5 shadow-sm shrink-0">
                            <i className="fa-solid fa-trash-can text-xl"></i>
                        </div>
                        <div className="text-left">
                            <span className="block text-slate-900 dark:text-white font-bold text-lg leading-tight">{t.clearCache}</span>
                            <span className="text-sm text-slate-500">Remove all local sessions and offline snapshots</span>
                        </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-400 opacity-50 mr-2"></i>
                </button>
            </div>
        </div>
      </div>

      <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full">
              <i className="fa-solid fa-lock text-emerald-500"></i>
              <span>End-to-End Encrypted System</span>
              <span className="mx-2 opacity-30">•</span>
              <span>Build 2.5.9-Stable</span>
          </div>
      </div>
    </div>
  );
};
