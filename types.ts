
export type SupportLanguage = 'English' | 'French' | 'Arabic';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  category?: 'Grammar' | 'Spelling' | 'Vocabulary' | 'Conjugation' | 'General';
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
  content: string; 
  timestamp: number;
  isError?: boolean;
}

export interface UserProfile {
  uid: string;
  isPro: boolean;
  sparks: number;
  totalCorrections: number;
  mistakeCategories: Record<string, number>;
}

export const UI_TRANSLATIONS = {
  English: {
    welcome: "Master French with Ease",
    loginDesc: "Sign in to save your progress, track your mistakes, and unlock personalized lessons.",
    loginBtn: "Continue with Google",
    domainErrorTitle: "Action Required: Domain Not Authorized",
    domainErrorDesc: "To allow Google Sign-in, you must add this domain to your Firebase Console settings:",
    domainErrorSteps: "Go to Authentication > Settings > Authorized domains and add the domain above.",
    tabPractice: "Practice",
    tabBrain: "My Brain",
    proBadge: "PRO",
    upgradeBtn: "Unlock Teacher's Brain",
    upgradeDesc: "Get personalized lessons based on your specific mistakes.",
    statsTotal: "Total Errors Caught",
    statsAccuracy: "Accuracy Score",
    statsCommon: "Common Pitfalls",
    generateLesson: "Generate Review Lesson",
    lessonLoading: "Analyzing your past mistakes...",
    subtitle: "Bonjour ! Ready to learn?",
    description: "Type a phrase in French to get corrections, or type in English to get a translation.",
    placeholder: "Write a sentence in French (or English)...",
    button: "Improve",
    correctionsLabel: "Corrections Needed",
    notesLabel: "Tutor's Notes",
    perfectLabel: "Perfect! No corrections needed.",
    originalLabel: "Original",
    listen: "Listen to pronunciation",
    resetConfirm: "Start a new session? This will clear your history.",
    analyzing: "Analyzing your French...",
    logout: "Sign Out",
    suggestions: [
      "Je suis très contente de te voir",
      "How do you say 'I need to book a table' in French?",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  },
  French: {
    welcome: "Maîtrisez le français facilement",
    loginDesc: "Connectez-vous pour enregistrer vos progrès et débloquer des leçons personnalisées.",
    loginBtn: "Continuer avec Google",
    domainErrorTitle: "Action requise : Domaine non autorisé",
    domainErrorDesc: "Pour autoriser la connexion Google, vous devez ajouter ce domaine dans vos paramètres Firebase :",
    domainErrorSteps: "Allez dans Authentification > Paramètres > Domaines autorisés et ajoutez le domaine ci-dessus.",
    tabPractice: "Pratique",
    tabBrain: "Mon Cerveau",
    proBadge: "PRO",
    upgradeBtn: "Débloquer le Cerveau",
    upgradeDesc: "Obtenez des leçons basées sur vos propres erreurs.",
    statsTotal: "Erreurs Corrigées",
    statsAccuracy: "Score de Précision",
    statsCommon: "Erreurs Fréquentes",
    generateLesson: "Générer une leçon de révision",
    lessonLoading: "Analyse de vos erreurs passées...",
    subtitle: "Bonjour ! Prêt à apprendre ?",
    description: "Tapez une phrase en français pour obtenir des corrections, ou en anglais pour une traduction.",
    placeholder: "Écrivez une phrase en français (ou anglais)...",
    button: "Améliorer",
    correctionsLabel: "Corrections Nécessaires",
    notesLabel: "Notes du Tuteur",
    perfectLabel: "Parfait ! Aucune correction nécessaire.",
    originalLabel: "Original",
    listen: "Écouter la prononciation",
    resetConfirm: "Effacer l'historique ?",
    analyzing: "Analyse en cours...",
    logout: "Déconnexion",
    suggestions: [
      "Je suis très contente de te voir",
      "Comment dit-on 'I need to book a table' en français ?",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  },
  Arabic: {
    welcome: "أتقن الفرنسية بسهولة",
    loginDesc: "سجل الدخول لحفظ تقدمك وتتبع أخطائك وفتح دروس مخصصة لك.",
    loginBtn: "المتابعة باستخدام Google",
    domainErrorTitle: "مطلوب إجراء: النطاق غير مصرح به",
    domainErrorDesc: "للسماح بتسجيل الدخول باستخدام Google، يجب إضافة هذا النطاق إلى إعدادات Firebase الخاصة بك:",
    domainErrorSteps: "انتقل إلى Authentication > Settings > Authorized domains وأضف النطاق أعلاه.",
    tabPractice: "ممارسة",
    tabBrain: "ذكائي الآلي",
    proBadge: "نسخة برو",
    upgradeBtn: "فتح ميزات المعلم",
    upgradeDesc: "احصل على دروس مخصصة بناءً على أخطائك الخاصة.",
    statsTotal: "إجمالي الأخطاء",
    statsAccuracy: "مستوى الدقة",
    statsCommon: "أخطاء شائعة",
    generateLesson: "إنشاء درس مراجعة",
    lessonLoading: "جاري تحليل أخطائك السابقة...",
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
    analyzing: "جاري التحليل...",
    logout: "تسجيل الخروج",
    suggestions: [
      "Je suis très contente de te voir",
      "كيف أقول 'أحتاج لحجز طاولة' بالفرنسية؟",
      "J'ai aller au cinema hier",
      "Il faut que je vais partir maintenant"
    ]
  }
};
