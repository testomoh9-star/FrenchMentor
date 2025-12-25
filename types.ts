
export type SupportLanguage = 'English' | 'French' | 'Arabic';
export type SystemLanguage = 'English' | 'French' | 'Arabic' | 'Spanish';

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
  deepDive?: string; 
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

export const UI_TRANSLATIONS: Record<SystemLanguage, any> = {
  English: {
    navPractice: "Practice",
    navBrain: "My Brain",
    newChat: "New Chat",
    recentChats: "Recent Chats",
    deepDiveBtn: "Structural Dive",
    deepDiveTitle: "Grammar Analysis",
    subtitle: "Bonjour ! Ready to learn?",
    description: "Type a phrase in French to get corrections, or type in another language to get a translation.",
    placeholder: "Write a sentence in French (or another language)...",
    button: "Improve",
    notesLabel: "Tutor's Notes",
    lookingGood: "Looking Good!",
    originalLabel: "Original",
    analyzing: "Analyzing your French...",
    statsTitle: "Precision Level",
    statsSubtitle: "Based on your recent linguistic patterns.",
    statsCommon: "Common Pitfalls",
    recentLog: "Recent Log",
    errorsLabel: "errors",
    brainLearning: "Your brain is learning...",
    brainUnlock: "Analyze {n} more sentences to unlock your Dashboard.",
    coachTitle: "New Missions",
    coachTrigger: "Detected a pattern in: {cat}",
    coachButton: "Analyze & Solve",
    archiveTitle: "Knowledge Library",
    proLabel: "PRO",
    upgradeTitle: "Upgrade plan",
    settings: "Settings",
    feedback: "Feedback",
    logout: "Log out",
    aiExplainLang: "AI Explains in...",
    systemLang: "System Language",
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
      "Il faut que je vais partir maintenant",
      "Je visitais ma grand-mère la semaine dernière",
      "Merci pour le aide",
      "C'est un bon idée",
      "Je n'ai pas de l'argent",
      "Je cherche pour mon chat",
      "Je suis fini avec mon travail",
      "Est-ce que tu peux m'aider avec ça?",
      "S'il vous plaît, parlez plus lentement"
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
    description: "Tapez une phrase en français pour obtenir des corrections, ou dans une autre langue pour une traduction.",
    placeholder: "Écrivez une phrase en français (ou une autre langue)...",
    button: "Améliorer",
    notesLabel: "Notes du Tuteur",
    lookingGood: "Très bien !",
    originalLabel: "Original",
    analyzing: "Analyse de votre français...",
    statsTitle: "Niveau de Précision",
    statsSubtitle: "Basé sur vos récents schémas linguistiques.",
    statsCommon: "Erreurs Fréquentes",
    recentLog: "Journal Récent",
    errorsLabel: "erreurs",
    brainLearning: "Votre cerveau apprend...",
    brainUnlock: "Analysez {n} phrases de plus pour débloquer votre tableau de bord.",
    coachTitle: "Nouvelles Missions",
    coachTrigger: "Schéma détecté dans : {cat}",
    coachButton: "Analyser & Résoudre",
    archiveTitle: "Bibliothèque",
    proLabel: "PRO",
    upgradeTitle: "Passer à Pro",
    settings: "Paramètres",
    feedback: "Commentaires",
    logout: "Se déconnecter",
    aiExplainLang: "L'IA explique en...",
    systemLang: "Langue du système",
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
      "Il faut que je vais partir maintenant",
      "Je visitais ma grand-mère la semaine dernière",
      "Merci pour le aide",
      "C'est un bon idée",
      "Je n'ai pas de l'argent",
      "Je cherche pour mon chat",
      "Je suis fini avec mon travail",
      "Est-ce que tu peux m'aider avec ça?",
      "S'il vous plaît, parlez plus lentement"
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
    description: "اكتب جملة بالفرنسية للحصول على تصحيحات، أو بلغة أخرى للحصول على ترجمة.",
    placeholder: "اكتب جملة بالفرنسية (أو بلغة أخرى)...",
    button: "تحسين",
    notesLabel: "ملاحظات المعلم",
    lookingGood: "تبدو جيدة!",
    originalLabel: "الأصل",
    analyzing: "جاري تحليل لغتك الفرنسية...",
    statsTitle: "مستوى الدقة",
    statsSubtitle: "بناءً على أنماطك اللغوية الأخيرة.",
    statsCommon: "الأخطاء الشائعة",
    recentLog: "السجل الأخير",
    errorsLabel: "أخطاء",
    brainLearning: "دماغك يتعلم...",
    brainUnlock: "حلل {n} جمل إضافية لفتح لوحة التحكم الخاصة بك.",
    coachTitle: "مهام جديدة",
    coachTrigger: "تم اكتشاف نمط في: {cat}",
    coachButton: "تحليل وحل",
    archiveTitle: "المكتبة",
    proLabel: "برو",
    upgradeTitle: "ترقية الخطة",
    settings: "الإعدادات",
    feedback: "الملاحظات",
    logout: "تسجيل الخروج",
    aiExplainLang: "الذكاء الاصطناعي يشرح بـ...",
    systemLang: "لغة النظام",
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
      "Il faut que je vais partir maintenant",
      "Je visitais ma grand-mère la semaine dernière",
      "Merci pour le aide",
      "C'est un bon idée",
      "Je n'ai pas de l'argent",
      "Je cherche pour mon chat",
      "Je suis fini avec mon travail",
      "Est-ce que tu peux m'aider avec ça?",
      "S'il vous plaît, parlez plus lentement"
    ]
  },
  Spanish: {
    navPractice: "Práctica",
    navBrain: "Mi Cerebro",
    newChat: "Nuevo Chat",
    recentChats: "Chats Recientes",
    deepDiveBtn: "Análisis Profundo",
    deepDiveTitle: "Análisis de Gramática",
    subtitle: "¡Bonjour! ¿Listo para aprender?",
    description: "Escribe una frase en francés para recibir correcciones, o en otro idioma para una traducción.",
    placeholder: "Escribe una frase en francés (u otro idioma)...",
    button: "Mejorar",
    notesLabel: "Notas del Tutor",
    lookingGood: "¡Se ve bien!",
    originalLabel: "Original",
    analyzing: "Analizando tu francés...",
    statsTitle: "Nivel de Precisión",
    statsSubtitle: "Basado en tus patrones lingüísticos recientes.",
    statsCommon: "Errores Comunes",
    recentLog: "Registro Reciente",
    errorsLabel: "errores",
    brainLearning: "Tu cerebro está aprendiendo...",
    brainUnlock: "Analiza {n} frases más para desbloquear tu panel.",
    coachTitle: "Nuevas Misiones",
    coachTrigger: "Patrón detectado en: {cat}",
    coachButton: "Analizar y Resolver",
    archiveTitle: "Biblioteca",
    proLabel: "PRO",
    upgradeTitle: "Mejorar plan",
    settings: "Ajustes",
    feedback: "Comentarios",
    logout: "Cerrar sesión",
    aiExplainLang: "La IA explica en...",
    systemLang: "Idioma del sistema",
    catMap: {
      Grammar: "Gramática",
      Conjugación: "Conjugación",
      Vocabulario: "Vocabulario",
      Ortografía: "Ortografía",
      Preposiciones: "Preposiciones",
      Género: "Género"
    },
    suggestions: [
      "Je suis très contente de te voir",
      "¿Cómo se dice 'I need to book a table' en francés?",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir ahora",
      "Je visitais ma grand-mère la semaine dernière",
      "Merci pour le aide",
      "C'est un bon idée",
      "Je n'ai pas de l'argent",
      "Je cherche pour mon chat",
      "Je suis fini avec mon travail",
      "Est-ce que tu peux m'aider avec ça?",
      "S'il vous plaît, parlez más lentamente"
    ]
  }
};
