
import React from 'react';

export const DeveloperProfile: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 min-h-[80vh] flex flex-col justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-slate-800 to-emerald-900 relative">
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          {/* Avatar - Reduced size by 15% (Original 160px * 0.85 = 136px) */}
          <div className="flex justify-center -mt-16 mb-6">
            <div className="w-[136px] h-[136px] rounded-3xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg overflow-hidden">
               <img 
                 src="https://ui-avatars.com/api/?name=Labib+Bin+Shahed&background=10b981&color=fff&size=256&bold=true" 
                 alt="Labib Bin Shahed" 
                 className="w-full h-full object-cover"
               />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Labib Bin Shahed</h2>
            <div className="flex justify-center gap-2 mb-4">
               <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
                 Developer
               </span>
               <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">
                 Creator
               </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed text-lg">
              "Building digital experiences that connect people with places. Exploring the intersection of AI and modern web technologies."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a 
              href="https://github.com/la-b-ib" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-4 rounded-xl bg-[#24292e] text-white hover:bg-[#2f363d] transition-all hover:-translate-y-1 shadow-md group"
            >
              <i className="fa-brands fa-github text-3xl mr-4 group-hover:rotate-12 transition-transform"></i>
              <div className="text-left">
                  <span className="block text-xs text-slate-400 uppercase font-bold">Follow on</span>
                  <span className="block font-bold text-lg">GitHub</span>
              </div>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/la-b-ib/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-4 rounded-xl bg-[#0077b5] text-white hover:bg-[#006396] transition-all hover:-translate-y-1 shadow-md group"
            >
              <i className="fa-brands fa-linkedin text-3xl mr-4 group-hover:rotate-12 transition-transform"></i>
              <div className="text-left">
                  <span className="block text-xs text-blue-200 uppercase font-bold">Connect on</span>
                  <span className="block font-bold text-lg">LinkedIn</span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-6 text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} Jessore Connect.
      </div>
    </div>
  );
};
