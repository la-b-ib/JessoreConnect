
import React, { useState } from 'react';
import { Category, User, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface NavigationProps {
  activeCategory: string;
  onSelectCategory: (category: Category) => void;
  user: User | null;
  onLoginRequest: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  unreadCount?: number;
}

const CATEGORY_ICONS: Record<Category, string> = {
  [Category.SEARCH]: 'fa-magnifying-glass',
  [Category.ESSENTIALS]: 'fa-clock',
  [Category.COMMUNITY]: 'fa-users',
  [Category.OVERVIEW]: 'fa-city',
  [Category.HISTORY]: 'fa-landmark',
  [Category.HOTELS]: 'fa-bed',
  [Category.DINING]: 'fa-utensils',
  [Category.SHOPPING]: 'fa-bag-shopping',
  [Category.NEWS]: 'fa-newspaper',
  [Category.TRANSIT]: 'fa-map-location-dot',
  [Category.DEVELOPER]: 'fa-code',
  [Category.SETTINGS]: 'fa-gear',
  [Category.NOTIFICATIONS]: 'fa-bell',
  [Category.FEEDBACK]: 'fa-comment-dots',
};

const MENU_CATEGORIES = [
  Category.ESSENTIALS,
  Category.OVERVIEW,
  Category.COMMUNITY,
  Category.HISTORY,
  Category.HOTELS,
  Category.DINING,
  Category.SHOPPING,
  Category.NEWS,
  Category.TRANSIT,
  Category.NOTIFICATIONS,
  Category.SETTINGS,
  Category.FEEDBACK,
  Category.DEVELOPER
];

export const Navigation: React.FC<NavigationProps> = ({ 
  activeCategory, 
  onSelectCategory, 
  user, 
  onLoginRequest, 
  onLogout,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
  unreadCount = 0
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col md:h-screen sticky top-0 z-50 shadow-xl border-b md:border-b-0 md:border-r border-slate-700">
      <div className="p-6 border-b border-slate-700 bg-slate-900 z-10 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => handleCategoryClick(Category.OVERVIEW)}>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center">
            <i className="fa-solid fa-location-dot mr-3 text-emerald-500"></i>
            <span>{t.appTitle}</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 ml-1 uppercase tracking-widest">{t.appSubtitle}</p>
        </div>
        
        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
            <button 
                onClick={() => handleCategoryClick(Category.NOTIFICATIONS)}
                className="text-slate-400 hover:text-white transition-colors relative p-2"
            >
                <i className="fa-solid fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-[8px] font-bold text-white rounded-full w-3.5 h-3.5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>
            <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-400 hover:text-white transition-colors p-2"
            aria-label="Toggle Menu"
            >
             <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 overflow-hidden h-[calc(100vh-89px)] md:h-auto bg-slate-900`}>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-3">{t.menuTitle}</p>
            </div>
            <ul className="space-y-1 px-3">
            {MENU_CATEGORIES.map((cat) => (
                <li key={cat}>
                <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                    activeCategory === cat
                        ? 'bg-emerald-600 text-white shadow-lg translate-x-1'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                    activeCategory === cat ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'
                    }`}>
                        <i className={`fa-solid ${CATEGORY_ICONS[cat]} text-sm`}></i>
                    </div>
                    <span className="font-semibold text-sm text-left">{t[cat] || cat}</span>
                    
                    {cat === Category.NOTIFICATIONS && unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {unreadCount}
                        </span>
                    )}
                    
                    {activeCategory === cat && cat !== Category.NOTIFICATIONS && (
                        <i className="fa-solid fa-chevron-right ml-auto text-[10px] opacity-50"></i>
                    )}
                </button>
                </li>
            ))}
            </ul>
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-2">
            {/* Unified Theme Toggle matching Tab Style */}
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
                <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mr-3 transition-colors">
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-yellow-500' : 'fa-moon text-blue-400'} text-sm`}></i>
                </div>
                <span className="font-semibold text-sm">{theme === 'dark' ? t.lightMode : t.darkMode}</span>
                <div className={`ml-auto w-8 h-4 bg-slate-700 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-emerald-900' : ''}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-slate-300 rounded-full transition-all ${theme === 'dark' ? 'left-4 bg-emerald-400' : 'left-0.5'}`}></div>
                </div>
            </button>

            {user ? (
                <div className="bg-slate-800/80 rounded-2xl p-3 flex items-center border border-slate-700/50">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl border-2 border-emerald-500 mr-3" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <button onClick={onLogout} className="text-[10px] text-slate-400 hover:text-red-400 font-bold uppercase tracking-wider flex items-center mt-1">
                            <i className="fa-solid fa-power-off mr-1.5"></i> {t.signOut}
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={onLoginRequest}
                    className="w-full bg-emerald-600 text-white rounded-xl py-3 px-4 flex items-center justify-center font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                >
                    <i className="fa-brands fa-google mr-2"></i>
                    {t.signIn}
                </button>
            )}
          </div>
      </div>
    </nav>
  );
};
