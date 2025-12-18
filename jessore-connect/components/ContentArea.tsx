
import React, { useState, useRef, useEffect } from 'react';
import { GroundingChunk, ExternalService, Category, Language, AppSettings } from '../types';
import { TRANSLATIONS } from '../translations';

interface ContentAreaProps {
  title: string;
  text: string | null;
  suggestions: string[] | null;
  groundingChunks: GroundingChunk[] | null;
  externalServices?: ExternalService[] | null;
  loading: boolean;
  onSearch: (query: string, imageBase64?: string) => void;
  language: Language;
  settings: AppSettings;
  isFromCache?: boolean;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ 
  title, text, suggestions, groundingChunks, externalServices, loading, onSearch, language, settings, isFromCache 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  // TTS Setup
  useEffect(() => {
    if (text && settings.enableTTS && !loading) {
        speakText(text);
    }
  }, [text, loading, settings.enableTTS]);

  useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (content: string) => {
    window.speechSynthesis.cancel();
    const cleanText = content.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedImage) {
      const query = searchQuery.trim();
      onSearch(query, selectedImage || undefined);
      setSearchQuery("");
      setSelectedImage(null);
    }
  };

  const handleMapSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapSearchQuery.trim()) {
      onSearch(`Find the exact location and details of: ${mapSearchQuery.trim()} in Jashore, Bangladesh.`);
      setMapSearchQuery("");
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice search not supported in this browser.");
        return;
    }
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        onSearch(transcript);
    };
    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            setSelectedImage(base64Data);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleNearMe = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords;
              onSearch(`What are the interesting places near my location (${latitude}, ${longitude}) in Jashore?`);
          }, () => {
              alert("Location access denied.");
          });
      } else {
          alert("Geolocation is not supported.");
      }
  };

  const copyToClipboard = () => {
      if (text) {
          navigator.clipboard.writeText(text);
          alert("Text copied to clipboard!");
      }
  };

  const getFontSizeClass = () => {
      switch(settings.fontSize) {
          case 'small': return 'text-sm';
          case 'large': return 'text-xl';
          default: return 'text-base';
      }
  };

  const getServiceIcon = (type: ExternalService['type']) => {
    switch(type) {
        case 'bus': return 'fa-bus';
        case 'train': return 'fa-train';
        case 'flight': return 'fa-plane-departure';
        case 'news_local': return 'fa-map-location-dot';
        case 'news_national': return 'fa-flag';
        case 'news_intl': return 'fa-earth-americas';
        default: return 'fa-link';
    }
  };

  const getServiceColor = (type: ExternalService['type']) => {
    switch(type) {
        case 'bus': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
        case 'train': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'flight': return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';
        case 'news_local': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'news_national': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        case 'news_intl': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getServiceLabel = (type: ExternalService['type']) => {
     if (type.startsWith('news_')) {
         return type.replace('news_', '') + ' News';
     }
     return type;
  };

  const renderServices = () => (
    <div className="mb-8 animate-fadeIn">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <i className={`fa-solid ${title === Category.NEWS ? 'fa-newspaper' : 'fa-ticket'} mr-2 text-emerald-500`}></i>
            {title === Category.NEWS ? t.verifiedNewspapers : t.verifiedCounters}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalServices?.map((service, idx) => (
                <a 
                    key={idx}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getServiceColor(service.type)}`}>
                            <i className={`fa-solid ${getServiceIcon(service.type)} text-lg`}></i>
                        </div>
                        <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded uppercase tracking-wider">
                            {getServiceLabel(service.type)}
                        </span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {service.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3 line-clamp-2">
                        {service.description}
                    </p>
                    <div className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center">
                        {title === Category.NEWS ? t.readNow : t.bookNow} <i className="fa-solid fa-arrow-right ml-1 text-xs group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </a>
            ))}
        </div>
    </div>
  );

  const renderMapExplorer = () => (
    <div className="mb-8 bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl animate-fadeIn">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.mapExplorerTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time address finding within Jashore city limits</p>
           </div>
           <form onSubmit={handleMapSearchSubmit} className="relative group flex-1 max-w-md">
              <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                placeholder={t.mapSearchPlaceholder}
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                {t.findOnMap}
              </button>
           </form>
        </div>
        <div className="relative w-full h-80 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden shadow-inner group">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58784.00424681615!2d89.16785642167969!3d23.165219900000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ff108d4b31c90f%3A0x6b834460677536d1!2sJashore!5e0!3m2!1sen!2sbd!4v1709220000000!5m2!1sen!2sbd" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Jashore Interactive Explorer"
                className="grayscale-[30%] group-hover:grayscale-0 dark:grayscale-0 dark:invert-[90%] dark:hue-rotate-180 dark:brightness-95 dark:contrast-110 transition-all duration-700"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full mb-8 opacity-50"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const formattedParagraphs = text?.split('\n').map((paragraph, idx) => {
    if (!paragraph.trim()) return null;
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={idx} className={`mb-4 leading-relaxed text-slate-700 dark:text-slate-300 text-justify ${getFontSizeClass()}`}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-slate-900 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10">
      <div className="mb-8 sticky top-4 z-30">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedImage ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    <i className="fa-solid fa-camera"></i>
                </button>
                <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium px-2" placeholder={selectedImage ? (language === 'bn' ? 'এই ছবি সম্পর্কে প্রশ্ন করুন...' : 'Ask about this image...') : t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button type="button" onClick={handleVoiceSearch} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}><i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i></button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 font-medium transition-colors shadow-sm flex items-center">
                    <i className="fa-solid fa-paper-plane mr-2 md:mr-0"></i>
                    <span className="hidden md:inline">{t.askButton}</span>
                </button>
            </form>
            {selectedImage && (
                <div className="mt-2 mx-2 relative inline-block animate-fadeIn">
                    <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Upload preview" className="h-20 w-auto rounded-lg border border-emerald-200" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"><i className="fa-solid fa-xmark"></i></button>
                </div>
            )}
        </div>
      </div>

      <header className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t[title as Category] || title}</h2>
                {isFromCache && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center h-fit mt-2 border border-slate-200 dark:border-slate-700">
                        <i className="fa-solid fa-cloud-arrow-down mr-1 text-emerald-500"></i> Offline Emergency Fallback
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm bg-emerald-50 dark:bg-emerald-900/30 inline-block px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t.liveFromGoogle}</span>
            </div>
        </div>
        {text && (
            <div className="flex gap-2">
                <button onClick={isSpeaking ? stopSpeaking : () => speakText(text)} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSpeaking ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                   <i className={`fa-solid ${isSpeaking ? 'fa-stop' : 'fa-volume-high'} mr-2`}></i>
                   <span className="hidden md:inline">{isSpeaking ? t.stopReading : t.readAloud}</span>
                </button>
                <button onClick={copyToClipboard} className="flex items-center px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                   <i className="fa-solid fa-copy mr-2"></i>
                   <span className="hidden md:inline">{t.copyText}</span>
                </button>
            </div>
        )}
      </header>
      {title === Category.TRANSIT && renderMapExplorer()}
      {title === Category.TRANSIT && externalServices && externalServices.length > 0 && renderServices()}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 mb-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">{formattedParagraphs}</div>
      </div>
      {title === Category.NEWS && externalServices && externalServices.length > 0 && renderServices()}
      {suggestions && suggestions.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t.suggestedTopics}</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button key={idx} onClick={() => onSearch(suggestion)} className="text-left px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-200">{suggestion}</button>
            ))}
          </div>
        </div>
      )}
      {groundingChunks && groundingChunks.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center"><i className="fa-solid fa-map-marked-alt mr-2 text-emerald-500"></i>{t.locationsSources}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groundingChunks.map((chunk, index) => {
              if (chunk.maps) {
                return (
                  <a key={index} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-3 shrink-0"><i className="fa-solid fa-location-dot text-lg"></i></div>
                      <div className="overflow-hidden">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block truncate">{chunk.maps.title}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center">{t.viewOnMaps} <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i></span>
                  </a>
                );
              }
              if (chunk.web) {
                 return (
                  <a key={index} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                    <div className="flex items-center mb-2">
                       <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 shrink-0"><i className="fa-solid fa-globe text-lg"></i></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">{chunk.web.title}</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-auto flex items-center">{t.readArticle} <i className="fa-solid fa-arrow-right ml-1"></i></span>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
