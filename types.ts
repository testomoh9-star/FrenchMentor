export type SupportLanguage = 'English' | 'French' | 'Arabic';

export type ModelID = 'gemini-flash-lite-latest' | 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
}

export interface CorrectionResponse {
  correctedFrench: string;
  englishTranslation: string;
  corrections: CorrectionItem[];
  tutorNotes: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string; // This will be a JSON string for the model
  timestamp: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedModel: ModelID;
}