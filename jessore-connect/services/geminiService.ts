
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingChunk, ExternalService, Category, Language, WeatherData } from "../types";
import { getCache, setCache, incrementRequestCount, isQuotaReached } from "./cacheService";

export interface FetchResult {
  text: string;
  suggestions: string[];
  groundingChunks: GroundingChunk[] | null;
  externalServices?: ExternalService[] | null;
  weatherData?: WeatherData | null;
  isFromCache?: boolean;
  quotaReached?: boolean;
}

// Maps grounding is only supported in Gemini 2.5 series models.
// Using 'gemini-2.5-flash' as recommended for maps grounding tasks.
const MODEL_NAME = 'gemini-2.5-flash';

const VERIFIED_TRANSPORT_SERVICES: ExternalService[] = [
  { name: "Bangladesh Railway E-Ticket", url: "https://eticket.railway.gov.bd/", type: "train", description: "Official government portal for train ticket booking." },
  { name: "Shohoz", url: "https://www.shohoz.com/bus-tickets", type: "bus", description: "Major online platform for bus tickets across Bangladesh." },
  { name: "BusBD", url: "https://busbd.com.bd/", type: "bus", description: "Reliable online bus ticketing service." },
  { name: "Biman Bangladesh", url: "https://www.biman-airlines.com/", type: "flight", description: "National flag carrier. Flights from Jashore to Dhaka." },
  { name: "US-Bangla Airlines", url: "https://usbair.com/", type: "flight", description: "Private airline with frequent flights from Jashore." },
  { name: "NOVOAIR", url: "https://www.flynovoair.com/", type: "flight", description: "Premium airline service for domestic travel." }
];

const VERIFIED_NEWS_SERVICES: ExternalService[] = [
  { name: "Gramer Kagoj", url: "https://www.gramerkagoj.com", type: "news_local", description: "Top daily newspaper from Jashore." },
  { name: "Daily Spandan", url: "https://www.dailyspandan.com", type: "news_local", description: "Popular local news source." },
  { name: "Prothom Alo", url: "https://www.prothomalo.com", type: "news_national", description: "Largest circulation daily." },
  { name: "The Daily Star", url: "https://www.thedailystar.net", type: "news_national", description: "Leading English daily." },
  { name: "Bdnews24", url: "https://bdnews24.com", type: "news_national", description: "First online newspaper." },
  { name: "BBC News", url: "https://www.bbc.com/news", type: "news_intl", description: "Global breaking news." },
  { name: "Al Jazeera", url: "https://www.aljazeera.com", type: "news_intl", description: "International coverage." }
];

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 2, initialDelay = 1000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = String(error).toLowerCase();
      const messageStr = (error.message || '').toLowerCase();
      
      const isRateLimit = error.status === 429 || 
                          messageStr.includes('429') || 
                          messageStr.includes('quota') || 
                          messageStr.includes('exhausted') || 
                          messageStr.includes('limit') ||
                          errorStr.includes('429') || 
                          errorStr.includes('quota');

      if (isRateLimit && i < maxRetries) {
        const delay = (initialDelay * Math.pow(2, i)) + (Math.random() * 200);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const fetchCityData = async (
  category: string, 
  language: Language, 
  customQuery?: string,
  imageBase64?: string
): Promise<FetchResult> => {
  
  const cacheKey = `${category}_${language}_${customQuery || 'none'}_${imageBase64 ? 'img' : 'noimg'}`;
  
  if (isQuotaReached()) {
      const cached = getCache<FetchResult>(cacheKey, true);
      if (cached) {
          return { ...cached, isFromCache: true, quotaReached: true };
      }
      throw new Error("QUOTA_EXHAUSTED");
  }

  const cachedData = getCache<FetchResult>(cacheKey);
  if (cachedData) return { ...cachedData, isFromCache: true };

  // Always initialize GoogleGenAI with {apiKey: process.env.API_KEY} right before the call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langInstruction = language === 'bn' 
    ? " IMPORTANT: Provide the entire response in Bengali (Bangla)." 
    : " Provide the response in English.";
  
  let parts: any[] = [];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    parts.push({ text: customQuery ? `Analyze this image: ${customQuery}. ${langInstruction}` : `Analyze this image in Jashore context. ${langInstruction}` });
  } else {
    let promptText = "";
    if (customQuery) {
        promptText = `Answer precisely: "${customQuery}". ${langInstruction}`;
    } else {
        switch (category) {
        case Category.ESSENTIALS:
            promptText = `Daily briefing for Jashore. Weather, Prayer, Info. 3-day forecast in JSON <weather_data>. ${langInstruction}`;
            break;
        case Category.NEWS:
            promptText = `News summary for Jashore. Breaking events and alerts. ${langInstruction}`;
            break;
        default:
            promptText = `Info about ${category} in Jashore. ${langInstruction}`;
            break;
        }
    }
    promptText += `\n\n<suggestions>Q1|Q2|Q3</suggestions>.`;
    parts.push({ text: promptText });
  }

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: parts },
      config: {
        // googleMaps tool is only available to gemini-2.5 series.
        // It can be combined with googleSearch.
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
      },
    }));

    incrementRequestCount();
    // Use the direct .text property instead of .text().
    let text = response.text || "Information unavailable.";
    let suggestions: string[] = [];
    let weatherData: WeatherData | null = null;

    const weatherMatch = text.match(/<weather_data>(.*?)<\/weather_data>/s);
    if (weatherMatch?.[1]) {
      try {
        weatherData = JSON.parse(weatherMatch[1].trim());
        text = text.replace(/<weather_data>.*?<\/weather_data>/s, '').trim();
      } catch (e) {}
    }

    const suggestionMatch = text.match(/<suggestions>(.*?)<\/suggestions>/s);
    if (suggestionMatch?.[1]) {
      suggestions = suggestionMatch[1].split('|').map(s => s.trim());
      text = text.replace(/<suggestions>.*?<\/suggestions>/s, '').trim();
    }

    const result = {
      text,
      suggestions,
      // Extracting grounding chunks from groundingMetadata.
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || null,
      externalServices: category === Category.NEWS ? VERIFIED_NEWS_SERVICES : category === Category.TRANSIT ? VERIFIED_TRANSPORT_SERVICES : null,
      weatherData,
      isFromCache: false,
      quotaReached: false
    };

    setCache(cacheKey, result);
    return result;
  } catch (error: any) {
    const errorStr = String(error).toLowerCase();
    const messageStr = (error.message || '').toLowerCase();
    
    const isQuotaError = error.status === 429 || 
                         messageStr.includes('quota') || 
                         messageStr.includes('exhausted') || 
                         messageStr.includes('429') ||
                         errorStr.includes('quota') ||
                         errorStr.includes('limit');

    if (isQuotaError) {
        const cached = getCache<FetchResult>(cacheKey, true);
        if (cached) return { ...cached, isFromCache: true, quotaReached: true };
        throw new Error("QUOTA_EXHAUSTED");
    }
    
    throw new Error(language === 'bn' ? "তথ্য লোড করা সম্ভব হয়নি।" : "Failed to load information.");
  }
};
