
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    placeId?: string;
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  type: 'review' | 'blog' | 'discussion';
  rating?: number; // 1-5, only for reviews
  location?: string; // Optional location for reviews
  likes: number;
  comments: Comment[];
  timestamp: string;
  tags?: string[];
}

export interface ExternalService {
  name: string;
  url: string;
  type: 'bus' | 'train' | 'flight' | 'news_local' | 'news_national' | 'news_intl';
  description: string;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export interface WeatherData {
  forecast: ForecastDay[];
}

export interface AppNotification {
  id: string;
  type: 'comment' | 'mention' | 'update' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export type Language = 'en' | 'bn';

export interface AppSettings {
  fontSize: 'small' | 'medium' | 'large';
  enableTTS: boolean;
  highContrast: boolean;
  locationAccess: boolean;
  dataSaver: boolean;
  autoPlayAudio: boolean;
}

export interface AppState {
  category: string;
  language: Language;
  loading: boolean;
  data: string | null;
  suggestions: string[] | null;
  groundingChunks: GroundingChunk[] | null;
  externalServices?: ExternalService[] | null;
  weatherData?: WeatherData | null;
  notifications: AppNotification[];
  error: string | null;
  user: User | null;
  settings: AppSettings;
  isFromCache?: boolean;
  quotaReached?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export enum Category {
  SEARCH = 'Search Results',
  ESSENTIALS = 'Daily Essentials',
  COMMUNITY = 'Community & Forum',
  OVERVIEW = 'Overview',
  HISTORY = 'Historical Places',
  HOTELS = 'Hotels & Stay',
  DINING = 'Food & Dining',
  SHOPPING = 'Shopping & Markets',
  NEWS = 'Local News',
  TRANSIT = 'Transport & Maps',
  DEVELOPER = 'Developer Credit',
  SETTINGS = 'Settings',
  NOTIFICATIONS = 'Notifications',
  FEEDBACK = 'Feedback & Support'
}
