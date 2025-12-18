
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { ContentArea } from './components/ContentArea';
import { CommunityFeed } from './components/CommunityFeed';
import { Dashboard } from './components/Dashboard';
import { DeveloperProfile } from './components/DeveloperProfile';
import { SettingsPage } from './components/SettingsPage';
import { NotificationsPanel } from './components/NotificationsPanel';
import { NotificationToast } from './components/NotificationToast';
import { FeedbackTab } from './components/FeedbackTab';
import { fetchCityData } from './services/geminiService';
import { AppState, Category, User, Language, AppSettings, AppNotification } from './types';
import { encryptData, decryptData } from './services/securityService';
import { TRANSLATIONS } from './translations';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    category: Category.OVERVIEW,
    language: 'en',
    loading: false,
    data: null,
    suggestions: null,
    groundingChunks: null,
    externalServices: null,
    weatherData: null,
    notifications: [],
    error: null,
    user: null,
    isFromCache: false,
    quotaReached: false,
    settings: {
        fontSize: 'medium',
        enableTTS: false,
        highContrast: false,
        locationAccess: false,
        dataSaver: false,
        autoPlayAudio: false
    }
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const loadingLockRef = useRef(false);
  const t = TRANSLATIONS[state.language];

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const secureData = localStorage.getItem('jashore_secure_v1');
    if (secureData) {
        const decrypted = decryptData(secureData);
        if (decrypted) setState(prev => ({ ...prev, ...decrypted }));
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
        settings: state.settings,
        user: state.user,
        language: state.language,
        notifications: state.notifications
    };
    localStorage.setItem('jashore_secure_v1', encryptData(dataToSave));
  }, [state.settings, state.user, state.language, state.notifications]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
    };
    setState(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications].slice(0, 50) }));
    setActiveToast(newNotif);
  }, []);

  const loadData = useCallback(async (
      category: string, 
      customQuery?: string, 
      imageBase64?: string,
      langOverride?: Language
  ) => {
    if (loadingLockRef.current) return;
    const lang = langOverride || state.language;

    const noFetchCategories = [Category.COMMUNITY, Category.DEVELOPER, Category.SETTINGS, Category.NOTIFICATIONS, Category.FEEDBACK];
    if (noFetchCategories.includes(category as Category)) {
        setState(prev => ({ ...prev, category, error: null, language: lang, isFromCache: false, quotaReached: false }));
        return;
    }

    loadingLockRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null, category, language: lang }));
    
    try {
      const result = await fetchCityData(category, lang, customQuery, imageBase64);
      setState(prev => ({
        ...prev,
        loading: false,
        data: result.text,
        suggestions: result.suggestions,
        groundingChunks: result.groundingChunks,
        externalServices: result.externalServices,
        weatherData: result.weatherData,
        isFromCache: result.isFromCache,
        quotaReached: result.quotaReached,
        error: null
      }));
    } catch (err: any) {
      const errString = String(err);
      const isQuota = err.message === "QUOTA_EXHAUSTED" || 
                      errString.includes("QUOTA_EXHAUSTED") || 
                      errString.toLowerCase().includes("quota") ||
                      errString.toLowerCase().includes("exhausted");

      setState(prev => ({
        ...prev,
        loading: false,
        error: isQuota ? "QUOTA_EXHAUSTED" : (err.message || (lang === 'bn' ? "তথ্য লোড করা যাচ্ছে না।" : "Unable to load information."))
      }));
    } finally {
      loadingLockRef.current = false;
    }
  }, [state.language, state.category]);

  useEffect(() => {
    if (!state.data && !state.loading) {
         loadData(state.category);
    }
  }, []);

  const renderContent = () => {
    if (state.error === "QUOTA_EXHAUSTED") {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center animate-fadeIn min-h-[70vh]">
                <img 
                    src="https://raw.githubusercontent.com/la-b-ib/JessoreConnect/main/jessore-connect/assets/squirrel.svg" 
                    className="w-56 h-56 mb-8 opacity-90 drop-shadow-2xl" 
                    alt="Quota Reached" 
                />
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3">
                    {t.quotaReachedTitle}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-bold text-lg leading-relaxed">
                    {t.quotaReachedMessage}
                </p>
                <div className="mt-10">
                    <button 
                        onClick={() => loadData(state.category)} 
                        className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <i className="fa-solid fa-rotate-right"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center animate-fadeIn">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
                    <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        {state.language === 'bn' ? 'সমস্যা হয়েছে' : 'An Error Occurred'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{state.error}</p>
                    <button onClick={() => loadData(state.category)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium">Retry</button>
                </div>
            </div>
        );
    }

    switch (state.category) {
        case Category.COMMUNITY: return <CommunityFeed user={state.user} onLoginRequest={() => {}} language={state.language} onAddNotification={addNotification} />;
        case Category.DEVELOPER: return <DeveloperProfile />;
        case Category.FEEDBACK: return <FeedbackTab language={state.language} user={state.user} />;
        case Category.SETTINGS: return <SettingsPage settings={state.settings} onUpdateSettings={s => setState(p => ({...p, settings: s}))} language={state.language} onLanguageChange={l => setState(p => ({...p, language: l}))} user={state.user} />;
        case Category.NOTIFICATIONS: return <NotificationsPanel notifications={state.notifications} language={state.language} onMarkRead={id => setState(p => ({...p, notifications: p.notifications.map(n => n.id === id ? {...n, isRead: true} : n)}))} onMarkAllRead={() => setState(p => ({...p, notifications: p.notifications.map(n => ({...n, isRead: true}))}))} onClearAll={() => setState(p => ({...p, notifications: []}))} onSelectPost={() => loadData(Category.COMMUNITY)} />;
        case Category.ESSENTIALS: return <Dashboard text={state.data} loading={state.loading} groundingChunks={state.groundingChunks} language={state.language} settings={state.settings} weatherData={state.weatherData} isFromCache={state.isFromCache} />;
        default: return <ContentArea title={state.category} text={state.data} suggestions={state.suggestions} groundingChunks={state.groundingChunks} externalServices={state.externalServices} loading={state.loading} onSearch={(q, img) => loadData(Category.SEARCH, q, img)} language={state.language} settings={state.settings} isFromCache={state.isFromCache} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navigation activeCategory={state.category} onSelectCategory={loadData} user={state.user} onLoginRequest={() => {}} onLogout={() => setState(p => ({...p, user: null}))} theme={theme} onToggleTheme={() => setTheme(p => p === 'light' ? 'dark' : 'light')} language={state.language} onToggleLanguage={() => {}} unreadCount={state.notifications.filter(n => !n.isRead).length} />
      <main className="flex-1 overflow-x-hidden relative">
         <div className="relative z-10">{renderContent()}</div>
         {activeToast && <NotificationToast notification={activeToast} onClose={() => setActiveToast(null)} onClick={() => { loadData(Category.NOTIFICATIONS); setActiveToast(null); }} />}
      </main>
    </div>
  );
};

export default App;
