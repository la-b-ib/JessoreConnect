
import React, { useState } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../translations';
import { sanitizeHtml } from '../services/securityService';

interface FeedbackTabProps {
  language: Language;
  user: User | null;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ language, user }) => {
  const t = TRANSLATIONS[language];
  const [type, setType] = useState('suggestion');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API processing delay
    setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
    }, 1500);
  };

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
        <div className="max-w-2xl mx-auto p-4 md:p-10 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-emerald-100 dark:border-emerald-900/50 shadow-xl">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-check text-4xl text-emerald-600"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.feedbackSuccess}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t.feedbackSuccessSub}</p>
                <button 
                    onClick={resetForm}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                    Submit Another
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.feedbackTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.feedbackSubtitle}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Type Selection */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {t.feedbackType}
                </label>
                <div className="relative">
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-100"
                    >
                        <option value="bug">{t.feedbackTypeBug}</option>
                        <option value="suggestion">{t.feedbackTypeSuggestion}</option>
                        <option value="question">{t.feedbackTypeQuestion}</option>
                        <option value="other">{t.feedbackTypeOther}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                    </div>
                </div>
             </div>

             {/* Priority Selection */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {t.feedbackPriority}
                </label>
                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {['low', 'medium', 'high'].map(p => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                priority === p 
                                ? p === 'low' ? 'bg-blue-500 text-white shadow-md' :
                                  p === 'medium' ? 'bg-orange-500 text-white shadow-md' :
                                  'bg-red-500 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {p === 'low' ? t.feedbackPriorityLow : p === 'medium' ? t.feedbackPriorityMedium : t.feedbackPriorityHigh}
                        </button>
                    ))}
                </div>
             </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {t.feedbackSubject}
            </label>
            <input 
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                placeholder="Brief summary..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {t.feedbackDescription}
            </label>
            <textarea 
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 h-40 resize-none"
                placeholder="Tell us more about it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* User Meta (Read Only) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3">
                      <i className="fa-solid fa-info text-[10px] text-slate-500"></i>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Auto-collecting device & app version metadata for diagnostic purposes.</span>
              </div>
              {user && (
                <div className="flex items-center text-xs font-bold text-emerald-600">
                    <i className="fa-solid fa-circle-user mr-1.5"></i> {user.name}
                </div>
              )}
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20 active:scale-[0.98]'}`}
          >
            {isSubmitting ? (
                <>
                   <i className="fa-solid fa-spinner animate-spin"></i>
                   Sending...
                </>
            ) : (
                <>
                   <i className="fa-solid fa-paper-plane"></i>
                   {t.feedbackSubmit}
                </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
             <i className="fa-solid fa-shield-heart text-emerald-500"></i> Encrypted Submission
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Support ID: JC-77X-91</span>
      </div>
    </div>
  );
};
