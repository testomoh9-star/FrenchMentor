
export type SupportLanguage = 'English' | 'French' | 'Arabic';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  category: string; 
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
  lastPracticeDate?: string; // ISO date string
  streak: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string; 
  timestamp: number;
  isError?: boolean;
}

export interface Scenario {
  id: string;
  icon: string;
  label: Record<SupportLanguage, string>;
  prompt: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'cafe',
    icon: '☕',
    label: { English: "At the Café", French: "Au Café", Arabic: "في المقهى" },
    prompt: "I am a waiter at a busy Parisian café. You just sat down. I approach you and say: 'Bonjour ! Vous désirez commander quelque chose ?'"
  },
  {
    id: 'hotel',
    icon: '🏨',
    label: { English: "Hotel Check-in", French: "Arrivée à l'Hôtel", Arabic: "تسجيل الوصول في الفندق" },
    prompt: "I am the receptionist at 'Hôtel de la Paix'. You have a reservation. I say: 'Bienvenue ! Avez-vous une réservation pour ce soir ?'"
  },
  {
    id: 'market',
    icon: '🥖',
    label: { English: "The Boulangerie", French: "La Boulangerie", Arabic: "المخبز" },
    prompt: "You are at a local bakery. I am the baker. It's your turn in line. I say: 'Bonjour ! Ce sera tout pour vous ?'"
  },
  {
    id: 'interview',
    icon: '💼',
    label: { English: "Job Interview", French: "Entretien d'embauche", Arabic: "مقابلة عمل" },
    prompt: "We are in a job interview for a marketing position. I am the manager. I say: 'Bonjour, merci d'être venu. Pouvez-vous vous présenter en quelques mots ?'"
  }
];

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
    lookingGood: "Looking Good!",
    originalLabel: "Original",
    listen: "Listen to pronunciation",
    resetConfirm: "Start a new session?",
    analyzing: "Analyzing your French...",
    statsTitle: "Learning Progress",
    statsAccuracy: "Accuracy Score",
    statsTotal: "Total Mistakes",
    statsCommon: "Common Pitfalls",
    statsNoData: "Start practicing to see your brain analytics!",
    proLabel: "PRO",
    upgradeTitle: "Unlock Your Potential",
    upgradeDesc: "Get the full FrenchMentor experience and accelerate your learning.",
    upgradeFullBrain: "Full Brain Analytics",
    upgradeUnlimitedSparks: "Unlimited Sparks",
    upgradeAudio: "Pro Audio Pronunciation",
    upgradeButton: "Upgrade to Pro",
    getPro: "Get Pro",
    reviewTitle: "Knowledge Check",
    reviewSubtitle: "Master the words you missed before.",
    startReview: "Start Review Session",
    missionTitle: "Daily Missions",
    streakLabel: "day streak",
    apiKeyMissing: "API Key is missing. Please check your environment variables.",
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
    lookingGood: "Très bien !",
    originalLabel: "Original",
    listen: "Écouter la prononciation",
    resetConfirm: "Commencer une nouvelle session ?",
    analyzing: "Analyse de votre français...",
    statsTitle: "Progrès de l'apprentissage",
    statsAccuracy: "Score de Précision",
    statsTotal: "Total des Erreurs",
    statsCommon: "Erreurs Fréquentes",
    statsNoData: "Commencez à pratiquer pour voir vos analyses !",
    proLabel: "PRO",
    upgradeTitle: "Libérez votre potentiel",
    upgradeDesc: "Obtenez l'expérience FrenchMentor complète et accélérez votre apprentissage.",
    upgradeFullBrain: "Analyses complètes",
    upgradeUnlimitedSparks: "Étincelles illimitées",
    upgradeAudio: "Prononciation Pro",
    upgradeButton: "Passer à Pro",
    getPro: "Devenir Pro",
    reviewTitle: "Vérification des connaissances",
    reviewSubtitle: "Maîtrisez les mots que vous avez manqués.",
    startReview: "Commencer la révision",
    missionTitle: "Missions Quotidiennes",
    streakLabel: "jours de suite",
    apiKeyMissing: "Clé API manquante. Veuillez vérifier vos variables d'environnement.",
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
    lookingGood: "تبدو جيدة!",
    originalLabel: "الأصل",
    listen: "استمع إلى النطق",
    resetConfirm: "هل تريد بدء جلسة جديدة؟",
    analyzing: "جاري تحليل لغتك الفرنسية...",
    statsTitle: "تقدم التعلم",
    statsAccuracy: "درجة الدقة",
    statsTotal: "إجمالي الأخطاء",
    statsCommon: "الأخطاء الشائعة",
    statsNoData: "ابدأ التمرين لرؤية تحليلات دماغك!",
    proLabel: "برو",
    upgradeTitle: "أطلق العنان لقدراتك",
    upgradeDesc: "احصل على تجربة FrenchMentor الكاملة وسرع تعلمك.",
    upgradeFullBrain: "تحليلات الدماغ الكاملة",
    upgradeUnlimitedSparks: "شرارات غير محدودة",
    upgradeAudio: "نطق صوتي احترافي",
    upgradeButton: "الترقية إلى برو",
    getPro: "احصل على برو",
    reviewTitle: "مراجعة المعرفة",
    reviewSubtitle: "أتقن الكلمات التي أخطأت فيها من قبل.",
    startReview: "ابدأ جلسة المراجعة",
    missionTitle: "المهمات اليومية",
    streakLabel: "أيام متتالية",
    apiKeyMissing: "مفتاح API مفقود. يرجى التحقق من متغيرات البيئة.",
    suggestions: [
      "Je suis très contente de te voir",
      "كيف أقول 'أحتاج لحجز طاولة' بالفرنسية؟",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  }
};
