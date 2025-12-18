import React from 'react';
import { AppSettings, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    settings, 
    onUpdateSettings, 
    onClose, 
    language,
    onLanguageChange 
}) => {
  const t = TRANSLATIONS[language];

  const handleToggle = (key: keyof AppSettings) => {
    // @ts-ignore
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    onUpdateSettings({ ...settings, fontSize: size });
  };

  const handleClearCache = () => {
    localStorage.removeItem('jashore_community_posts');
    alert(t.clearCacheDone);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <i className="fa-solid fa-gear mr-3 text-slate-400"></i>
            {t.settings}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-6">
          
          {/* General Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">{t.general}</h3>
            
            {/* Language Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-3">
                       <i className="fa-solid fa-language text-xs"></i>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{t.language}</span>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   <button
                       onClick={() => onLanguageChange('en')}
                       className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                         language === 'en' 
                         ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                         : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                       }`}
                   >
                       {t.english}
                   </button>
                   <button
                       onClick={() => onLanguageChange('bn')}
                       className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                         language === 'bn' 
                         ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                         : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                       }`}
                   >
                       {t.bengali}
                   </button>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3">
                       <i className="fa-solid fa-location-crosshairs text-xs"></i>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{t.locationAccess}</span>
                </div>
                <button 
                  onClick={() => handleToggle('locationAccess')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settings.locationAccess ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${settings.locationAccess ? 'translate-x-5' : ''}`}></div>
                </button>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />
          
          {/* Appearance Section */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">{t.appearance}</h3>
             
             {/* TTS */}
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                       <i className="fa-solid fa-volume-high text-xs"></i>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{t.enableTTS}</span>
                </div>
                <button 
                  onClick={() => handleToggle('enableTTS')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settings.enableTTS ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${settings.enableTTS ? 'translate-x-5' : ''}`}></div>
                </button>
            </div>

             {/* Font Size */}
             <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 dark:text-slate-300 font-medium pl-11">{t.fontSize}</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   {(['small', 'medium', 'large'] as const).map(size => (
                     <button
                       key={size}
                       onClick={() => handleFontSizeChange(size)}
                       className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                         settings.fontSize === size 
                         ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                         : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                       }`}
                     >
                       {size === 'small' ? 'A' : size === 'medium' ? 'AA' : 'AAA'}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Data Section */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">{t.data}</h3>
             
             <button 
               onClick={handleClearCache}
               className="w-full flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
             >
                <span className="font-medium flex items-center">
                    <i className="fa-solid fa-trash-can mr-2"></i> {t.clearCache}
                </span>
                <i className="fa-solid fa-chevron-right text-xs opacity-60"></i>
             </button>
          </div>

        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
           <p className="text-xs text-slate-400">Jessore Connect v2.1 • AI-Powered</p>
        </div>
      </div>
    </div>
  );
};