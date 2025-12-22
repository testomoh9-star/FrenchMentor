
export type SupportLanguage = 'English' | 'French' | 'Arabic';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  category: string; // Added for tracking
}

export interface CorrectionResponse {
  correctedFrench: string;
  englishTranslation: string;
  corrections: CorrectionItem[];
  tutorNotes: string;
}

export interface MistakeRecord {
  original: string;
  corrected: string;
  category: string;
  timestamp: number;
}

export interface BrainStats {
  totalCorrections: number;
  categories: Record<string, number>;
  history: MistakeRecord[];
  sparks: number;
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
}

export const UI_TRANSLATIONS = {
  English: {
    navPractice: "Practice",
    navBrain: "My Brain",
    subtitle: "Bonjour ! Ready to learn?",
    description: "Type a phrase in French to get corrections, or type in English to get a translation.",
    placeholder: "Write a sentence in French (or English)...",
    button: "Improve",
    correctionsLabel: "Corrections Needed",
    notesLabel: "Tutor's Notes",
    perfectLabel: "Perfect! No corrections needed.",
    originalLabel: "Original",
    listen: "Listen to pronunciation",
    resetConfirm: "Start a new session?",
    analyzing: "Analyzing your French...",
    statsTitle: "Learning Progress",
    statsAccuracy: "Accuracy Score",
    statsTotal: "Total Mistakes",
    statsCommon: "Common Pitfalls",
    statsNoData: "Start practicing to see your brain analytics!",
    suggestions: [
      "Je suis très contente de te voir",
      "How do you say 'I need to book a table' in French?",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  },
  French: {
    navPractice: "Pratique",
    navBrain: "Mon Cerveau",
    subtitle: "Bonjour ! Prêt à apprendre ?",
    description: "Tapez une phrase en français pour obtenir des corrections, ou en anglais pour une traduction.",
    placeholder: "Écrivez une phrase en français (ou anglais)...",
    button: "Améliorer",
    correctionsLabel: "Corrections Nécessaires",
    notesLabel: "Notes du Tuteur",
    perfectLabel: "Parfait ! Aucune correction nécessaire.",
    originalLabel: "Original",
    listen: "Écouter la prononciation",
    resetConfirm: "Commencer une nouvelle session ?",
    analyzing: "Analyse de votre français...",
    statsTitle: "Progrès de l'apprentissage",
    statsAccuracy: "Score de Précision",
    statsTotal: "Total des Erreurs",
    statsCommon: "Erreurs Fréquentes",
    statsNoData: "Commencez à pratiquer pour voir vos analyses !",
    suggestions: [
      "Je suis très contente de te voir",
      "Comment dit-on 'I need to book a table' en français ?",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  },
  Arabic: {
    navPractice: "تمرين",
    navBrain: "دماغي",
    subtitle: "مرحباً! هل أنت مستعد للتعلم؟",
    description: "اكتب جملة بالفرنسية للحصول على تصحيحات، أو بالإنجليزية للحصول على ترجمة.",
    placeholder: "اكتب جملة بالفرنسية (أو الإنجليزية)...",
    button: "تحسين",
    correctionsLabel: "التصحيحات المطلوبة",
    notesLabel: "ملاحظات المعلم",
    perfectLabel: "ممتاز! لا توجد تصحيحات مطلوبة.",
    originalLabel: "الأصل",
    listen: "استمع إلى النطق",
    resetConfirm: "هل تريد بدء جلسة جديدة؟",
    analyzing: "جاري تحليل لغتك الفرنسية...",
    statsTitle: "تقدم التعلم",
    statsAccuracy: "درجة الدقة",
    statsTotal: "إجمالي الأخطاء",
    statsCommon: "الأخطاء الشائعة",
    statsNoData: "ابدأ التمرين لرؤية تحليلات دماغك!",
    suggestions: [
      "Je suis très contente de te voir",
      "كيف أقول 'أحتاج لحجز طاولة' بالفرنسية؟",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  }
};
