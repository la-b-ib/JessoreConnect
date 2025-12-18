
import React, { useEffect } from 'react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification;
  onClose: () => void;
  onClick: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onClick
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = (type: AppNotification['type']) => {
    switch(type) {
        case 'comment': return 'fa-comment text-blue-500';
        case 'update': return 'fa-bolt text-orange-500';
        default: return 'fa-bell text-emerald-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slideIn">
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 flex gap-4 max-w-sm cursor-pointer hover:scale-[1.02] transition-transform"
        >
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <i className={`fa-solid ${getIcon(notification.type)}`}></i>
            </div>
            <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">New Alert</p>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{notification.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{notification.message}</p>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="text-slate-300 hover:text-slate-500"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    </div>
  );
};
