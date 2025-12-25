
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
  deepDive?: string; // Markdown/Structured lesson content
}

export interface MistakeRecord {
  original: string;
  corrected: string;
  category: string;
  timestamp: number;
}

export interface CoachLesson {
  id: string;
  title: string;
  category: string;
  mistakes: string[];
  whyYouMadeIt: string;
  theRule: string;
  mentalTrick: string;
  conjugationTable?: { [key: string]: string };
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface BrainStats {
  totalCorrections: number;
  categories: Record<string, number>;
  history: MistakeRecord[];
  sparks: number;
  archivedLessons: CoachLesson[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string; 
  timestamp: number;
  isError?: boolean;
  isDeepDiveLoading?: boolean;
}

export const UI_TRANSLATIONS = {
  English: {
    navPractice: "Practice",
    navBrain: "My Brain",
    newChat: "New Chat",
    recentChats: "Recent Chats",
    deepDiveBtn: "Structural Dive",
    deepDiveTitle: "Grammar Analysis",
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
    statsTitle: "Precision Level",
    statsSubtitle: "Based on your recent linguistic patterns.",
    statsTotal: "Total Mistakes",
    statsCommon: "Common Pitfalls",
    statsNoData: "Start practicing to see your brain analytics!",
    recentLog: "Recent Log",
    errorsLabel: "errors",
    brainLearning: "Your brain is learning...",
    brainUnlock: "Analyze {n} more sentences to unlock your Precision Dashboard.",
    coachTitle: "New Missions",
    coachTrigger: "Detected a pattern in: {cat}",
    coachButton: "Analyze & Solve",
    archiveTitle: "Knowledge Library",
    archiveEmpty: "Your solved lessons will appear here.",
    proLabel: "PRO",
    upgradeTitle: "Unlock Your Potential",
    upgradeDesc: "Get the full FrenchMentor experience and accelerate your learning.",
    upgradeFullBrain: "Full Brain Analytics",
    upgradeUnlimitedSparks: "Unlimited Sparks",
    upgradeAudio: "Pro Audio Pronunciation",
    upgradeButton: "Upgrade to Pro",
    getPro: "Get Pro",
    apiKeyMissing: "API Key is missing. Please check your environment variables.",
    catMap: {
      Grammar: "Grammar",
      Conjugation: "Conjugation",
      Vocabulary: "Vocabulary",
      Orthographe: "Spelling",
      Prepositions: "Prepositions",
      Gender: "Gender"
    },
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
    newChat: "Nouvelle Discussion",
    recentChats: "Discussions Récentes",
    deepDiveBtn: "Analyse Profonde",
    deepDiveTitle: "Analyse Structurelle",
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
    statsTitle: "Niveau de Précision",
    statsSubtitle: "Basé sur vos récents schémas linguistiques.",
    statsTotal: "Total des Erreurs",
    statsCommon: "Erreurs Fréquentes",
    statsNoData: "Commencez à pratiquer pour voir vos analyses !",
    recentLog: "Journal Récent",
    errorsLabel: "erreurs",
    brainLearning: "Votre cerveau apprend...",
    brainUnlock: "Analysez {n} phrases de plus pour débloquer votre tableau de bord.",
    coachTitle: "Nouvelles Missions",
    coachTrigger: "Schéma détecté dans : {cat}",
    coachButton: "Analyser & Résoudre",
    archiveTitle: "Bibliothèque",
    archiveEmpty: "Vos leçons résolues apparaîtront ici.",
    proLabel: "PRO",
    upgradeTitle: "Libérez votre potentiel",
    upgradeDesc: "Obtenez l'expérience FrenchMentor complète et accélérez votre apprentissage.",
    upgradeFullBrain: "Analyses complètes",
    upgradeUnlimitedSparks: "Étincelles illimitées",
    upgradeAudio: "Prononciation Pro",
    upgradeButton: "Passer à Pro",
    getPro: "Devenir Pro",
    apiKeyMissing: "Clé API manquante. Veuillez vérifier vos variables d'environnement.",
    catMap: {
      Grammar: "Grammaire",
      Conjugation: "Conjugaison",
      Vocabulary: "Vocabulaire",
      Orthographe: "Orthographe",
      Prepositions: "Prépositions",
      Gender: "Genre"
    },
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
    newChat: "محادثة جديدة",
    recentChats: "المحادثات الأخيرة",
    deepDiveBtn: "تعمق",
    deepDiveTitle: "تحليل هيكلي",
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
    statsTitle: "مستوى الدقة",
    statsSubtitle: "بناءً على أنماطك اللغوية الأخيرة.",
    statsTotal: "إجمالي الأخطاء",
    statsCommon: "الأخطاء الشائعة",
    statsNoData: "ابدأ التمرين لرؤية تحليلات دماغك!",
    recentLog: "السجل الأخير",
    errorsLabel: "أخطاء",
    brainLearning: "دماغك يتعلم...",
    brainUnlock: "حلل {n} جمل إضافية لفتح لوحة التحكم الخاصة بك.",
    coachTitle: "مهام جديدة",
    coachTrigger: "تم اكتشاف نمط في: {cat}",
    coachButton: "تحليل وحل",
    archiveTitle: "المكتبة",
    archiveEmpty: "ستظهر دروسك المحلولة هنا.",
    proLabel: "برو",
    upgradeTitle: "أطلق العنان لقدراتك",
    upgradeDesc: "احصل على تجربة FrenchMentor الكاملة وسرع تعلمك.",
    upgradeFullBrain: "تحليلات الدماغ الكاملة",
    upgradeUnlimitedSparks: "شرارات غير محدودة",
    upgradeAudio: "نطق صوتي احترافي",
    upgradeButton: "الترقية إلى برو",
    getPro: "احصل على برو",
    apiKeyMissing: "مفتاح API مفقود. يرجى التحقق من متغيرات البيئة.",
    catMap: {
      Grammar: "قواعد",
      Conjugation: "تصريف الأفعال",
      Vocabulary: "مفردات",
      Orthographe: "إملاء",
      Prepositions: "حروف الجر",
      Gender: "الجنس"
    },
    suggestions: [
      "Je suis très contente de te voir",
      "كيف أقول 'أحتاج لحجز طاولة' بالفرنسية؟",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  }
};
