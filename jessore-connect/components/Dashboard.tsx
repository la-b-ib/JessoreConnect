
import React, { useState, useEffect } from 'react';
import { GroundingChunk, Language, AppSettings, WeatherData } from '../types';
import { TRANSLATIONS, toBengaliDigits } from '../translations';

interface DashboardProps {
  text: string | null;
  loading: boolean;
  groundingChunks: GroundingChunk[] | null;
  language: Language;
  settings: AppSettings;
  weatherData?: WeatherData | null;
  isFromCache?: boolean;
}

interface ServiceItem {
    name: string;
    contact: string;
    icon: string;
    color: string;
}

const ESSENTIAL_SERVICES: Record<string, ServiceItem[]> = {
    "Emergency": [
        { name: "National Emergency", contact: "999", icon: "fa-phone-volume", color: "text-red-500" },
        { name: "Police Control Room", contact: "+880-1320-143398", icon: "fa-shield-halved", color: "text-blue-600" },
        { name: "Fire Service", contact: "+880-1730-002237", icon: "fa-fire-extinguisher", color: "text-orange-500" },
        { name: "Ambulance", contact: "+880-1711-296409", icon: "fa-truck-medical", color: "text-red-600" }
    ],
    "Hospitals": [
        { name: "250 Bed General Hospital", contact: "Jashore Sadar", icon: "fa-hospital", color: "text-emerald-600" },
        { name: "Queen's Hospital", contact: "+880-1711-356066", icon: "fa-heart-pulse", color: "text-pink-600" },
        { name: "Ibn Sina Hospital", contact: "+880-1711-136123", icon: "fa-user-doctor", color: "text-emerald-500" }
    ],
    "Utilities": [
        { name: "WZPDCL (Electricity)", contact: "16117", icon: "fa-bolt", color: "text-yellow-500" },
        { name: "Jashore Municipality", contact: "+880-421-68666", icon: "fa-building-columns", color: "text-slate-600" }
    ]
};

const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return 'fa-sun text-yellow-500';
    if (c.includes('cloudy') || c.includes('overcast')) return 'fa-cloud text-slate-400';
    if (c.includes('rain') || c.includes('shower')) return 'fa-cloud-showers-heavy text-blue-500';
    if (c.includes('thunder')) return 'fa-bolt-lightning text-yellow-600';
    if (c.includes('fog') || c.includes('mist')) return 'fa-smog text-slate-300';
    return 'fa-cloud-sun text-orange-400';
};

export const Dashboard: React.FC<DashboardProps> = ({ text, loading, groundingChunks, language, settings, weatherData, isFromCache }) => {
  const [time, setTime] = useState(new Date());
  const t = TRANSLATIONS[language];

  const [aqi, setAqi] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return language === 'bn' ? toBengaliDigits(timeStr) : timeStr;
  };

  const formatDate = (date: Date, locale: string, calendar?: string) => {
    try {
      // @ts-ignore
      const str = date.toLocaleDateString(locale, { calendar, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return language === 'bn' && locale === 'bn-BD' ? toBengaliDigits(str) : str;
    } catch (e) {
      return date.toLocaleDateString();
    }
  };

  const renderFormattedText = (content: string) => {
    return content.split('\n').map((paragraph, idx) => {
        if (!paragraph.trim()) return null;
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300 text-justify">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-emerald-700 dark:text-emerald-400 font-bold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
    });
  };

  // Helper function to calculate AQI status, color and background classes
  const getAqiStatus = (val: number) => {
      if(val < 50) return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500' };
      if(val < 100) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
      return { label: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-500' };
  };

  // Determine status object based on current AQI value
  const aqiStatus = getAqiStatus(aqi);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
      {isFromCache && (
        <div className="mb-6 bg-slate-900 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
           <span className="flex items-center gap-2">
             <i className="fa-solid fa-cloud-arrow-down text-emerald-500"></i> Offline Cache Active
           </span>
           <span>Hourly Refresh Cycle</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
           <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3">Local Time</h3>
           <div className="text-5xl md:text-6xl font-black font-mono tracking-tight text-white mb-2">{formatTime(time)}</div>
           <div className="flex items-center space-x-2 text-slate-400 text-sm font-medium"><i className="fa-solid fa-location-dot text-emerald-500"></i><span>Jashore, Bangladesh</span></div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Bengali Calendar</span>
                <p className="text-lg text-slate-700 dark:text-slate-200 font-bold">{formatDate(time, 'bn-BD', 'bengali')}</p>
             </div>
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Hijri Calendar</span>
                <p className="text-lg text-slate-700 dark:text-slate-200 font-bold">{formatDate(time, 'ar-SA-u-ca-islamic', 'islamic')}</p>
             </div>
             <div className="md:col-span-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
                <span className="text-xs text-blue-100 uppercase tracking-wider mb-1 block">Gregorian Calendar</span>
                <p className="text-xl font-bold">{formatDate(time, 'en-GB')}</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <i className="fa-solid fa-cloud-sun mr-3 text-emerald-500"></i>
                    <span>{t.dailyBriefing}</span>
                </h2>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    {loading ? <div className="animate-pulse space-y-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div></div> : renderFormattedText(text || "")}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <i className="fa-solid fa-phone-volume mr-3 text-emerald-500"></i>
                    <span>{t.emergencyContacts}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(ESSENTIAL_SERVICES).map(([category, items]) => (
                        <div key={category} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">{category}</h3>
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <i className={`fa-solid ${item.icon} ${item.color} w-5`}></i>
                                            <div className="ml-3">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.contact}</p>
                                            </div>
                                        </div>
                                        <a href={`tel:${item.contact}`} className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-2 rounded-lg transition-colors">
                                            <i className="fa-solid fa-phone"></i>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
         </div>

         <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Air Quality (AQI)</span>
                    <i className={`fa-solid fa-wind ${aqiStatus.color}`}></i>
                </div>
                <div className={`text-4xl font-black ${aqiStatus.color} mb-2`}>{language === 'bn' ? toBengaliDigits(aqi) : aqi}</div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${aqiStatus.bg}`} style={{width: `${(aqi/200)*100}%`}}></div>
                </div>
                <p className={`text-sm font-bold mt-2 ${aqiStatus.color}`}>{aqiStatus.label}</p>
            </div>
            {weatherData?.forecast && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xs font-bold uppercase text-emerald-400 mb-4">Forecast</h3>
                    <div className="space-y-4">
                        {weatherData.forecast.slice(0, 3).map(day => (
                            <div key={day.day} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{day.day}</span>
                                <div className="flex items-center gap-4">
                                    <i className={`fa-solid ${getWeatherIcon(day.condition)} text-sm`}></i>
                                    <span className="text-sm font-bold">{day.high}° / {day.low}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
