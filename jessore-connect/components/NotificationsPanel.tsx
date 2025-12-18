
import React from 'react';
import { AppNotification, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  language: Language;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectPost: (postId: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  language,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onSelectPost
}) => {
  const t = TRANSLATIONS[language];

  const getNotifIcon = (type: AppNotification['type']) => {
    switch(type) {
        case 'comment': return 'fa-comment text-blue-500 bg-blue-50 dark:bg-blue-900/20';
        case 'mention': return 'fa-at text-purple-500 bg-purple-50 dark:bg-purple-900/20';
        case 'update': return 'fa-bolt text-orange-500 bg-orange-50 dark:bg-orange-900/20';
        default: return 'fa-bell text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.notifications}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Stay updated with local activity</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onMarkAllRead}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
                {t.markAllRead}
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button 
                onClick={onClearAll}
                className="text-xs font-bold text-red-500 hover:underline"
            >
                {t.clearAll}
            </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-regular fa-bell-slash text-3xl text-slate-300"></i>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noNotifications}</p>
            </div>
        ) : (
            notifications.map((notif) => (
                <div 
                    key={notif.id}
                    onClick={() => {
                        onMarkRead(notif.id);
                        if (notif.link) onSelectPost(notif.link);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                        notif.isRead 
                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-75' 
                        : 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900 shadow-sm relative overflow-hidden'
                    }`}
                >
                    {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                    )}
                    
                    <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-lg ${getNotifIcon(notif.type)}`}>
                        <i className={`fa-solid ${getNotifIcon(notif.type).split(' ')[0]}`}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm truncate ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {notif.title}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                                {notif.timestamp}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {notif.message}
                        </p>
                    </div>

                    {!notif.isRead && (
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>

      <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-shield-halved text-emerald-600"></i>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Privacy Tip</h4>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
              Your notifications are stored locally on this device and encrypted. We do not track your activity on external servers.
          </p>
      </div>
    </div>
  );
};
