
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
  level: string; // A1, A2, B1, etc.
  mistakes: string[];
  whyYouMadeIt: string; // The "Linguistic Pathology"
  theRule: string; // The Blueprint
  contrast: {
    before: string;
    after: string;
  };
  mentalTrick: string; // Master Trick
  mission: string; // Practice Mission
  conjugation?: string; // Flexible text-based organization instead of a table
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
  lastRefillTimestamp: number;
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

export interface GuestInfo {
  id: string;
  corrections_used: number;
  max_corrections: number;
  created_at: number;
}

export const UI_TRANSLATIONS: Record<SystemLanguage, any> = {
  English: {
    navPractice: "Practice",
    navBrain: "My Brain",
    newChat: "New Chat",
    recentChats: "Recent Chats",
    deleteAll: "Delete all",
    deleteConfirmTitle: "Clear your chat history - are you sure?",
    deleteConfirmDesc: "This action will permanently delete all your chat history and linguistic patterns. You won't be able to recover them.",
    confirmDeletion: "Confirm deletion",
    cancel: "Cancel",
    deepDiveBtn: "Structural Dive",
    deepDiveTitle: "Grammar Analysis",
    subtitle: "Bonjour ! Ready to learn?",
    description: "Type a phrase in French to get corrections, or type in another language to get a translation.",
    placeholder: "Write a sentence in French (or another language)...",
    button: "Improve",
    notesLabel: "Tutor's Notes",
    lookingGood: "Looking Good!",
    originalLabel: "Original",
    alternativeLabel: "Alternative",
    translationLabel: "Translation",
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
    archiveEmpty: "Your solved missions will appear here.",
    proLabel: "PRO",
    upgradeTitle: "Upgrade plan",
    settings: "Settings",
    feedback: "Feedback",
    logout: "Log out",
    aiExplainLang: "AI Explains in...",
    systemLang: "System Language",
    login: "Log in",
    signup: "Sign up for free",
    signupCTA: "Create Account",
    loginCTA: "Log In",
    guestMode: "Guest Mode",
    correctionsLeft: "{n} correction(s) remaining",
    proMasterPatterns: "Master your patterns with Elite Coach.",
    proJoin: "Join Pro",
    proMember: "Pro Member",
    acceleratedLearning: "Accelerated Learning",
    resetBrainTitle: "Linguistic History",
    resetBrainBtn: "Reset Linguistic Brain",
    resetBrainDesc: "Resetting your brain will wipe all recorded linguistic patterns, missions, and archived lessons. This cannot be undone.",
    resetForever: "Reset Forever",
    auth: {
      login: {
        title: "Welcome Back",
        subtitle: "Log in to sync your progress across devices and continue your mastery.",
        cta: "Log In"
      },
      signup: {
        title: "Start Your Journey",
        subtitle: "Create a free account to unlock daily sparks and linguistic tracking.",
        cta: "Create Account"
      },
      limit: {
        title: "Unlock the Full Experience",
        subtitle: "Guests have reached their limit. Join LexiLift to keep learning.",
        cta: "Sign up for free"
      }
    },
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
      "Je suis fini with my work",
      "Est-ce que tu peux m'aider with that?",
      "S'il vous plaît, parlez plus lentement"
    ]
  },
  French: {
    navPractice: "Pratique",
    navBrain: "Mon Cerveau",
    newChat: "Nouvelle Discussion",
    recentChats: "Discussions Récentes",
    deleteAll: "Tout supprimer",
    deleteConfirmTitle: "Effacer votre historique - êtes-vous sûr ?",
    deleteConfirmDesc: "Cette action supprimera définitivement tout votre historique de discussion et vos schémas linguistiques. Vous ne pourrez pas les récupérer.",
    confirmDeletion: "Confirmer la suppression",
    cancel: "Annuler",
    deepDiveBtn: "Analyse Profonde",
    deepDiveTitle: "Analyse Structurelle",
    subtitle: "Bonjour ! Prêt à apprendre ?",
    description: "Tapez une phrase en français pour obtenir des corrections, ou dans une autre langue pour une traduction.",
    placeholder: "Écrivez une phrase en français (ou une autre langue)...",
    button: "Améliorer",
    notesLabel: "Notes du Tuteur",
    lookingGood: "Très bien !",
    originalLabel: "Original",
    alternativeLabel: "Alternative",
    translationLabel: "Traduction",
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
    archiveEmpty: "Vos missions résolues apparaîtront ici.",
    proLabel: "PRO",
    upgradeTitle: "Passer à Pro",
    settings: "Paramètres",
    feedback: "Commentaires",
    logout: "Se déconnecter",
    aiExplainLang: "L'IA explique en...",
    systemLang: "Langue du système",
    login: "Se connecter",
    signup: "S'inscrire gratuitement",
    signupCTA: "Créer un compte",
    loginCTA: "Se connecter",
    guestMode: "Mode invité",
    correctionsLeft: "{n} correction(s) restante(s)",
    proMasterPatterns: "Maîtrisez vos schémas avec le Coach Elite.",
    proJoin: "Devenir Pro",
    proMember: "Membre Pro",
    acceleratedLearning: "Apprentissage Accéléré",
    resetBrainTitle: "Historique Linguistique",
    resetBrainBtn: "Réinitialiser le Cerveau",
    resetBrainDesc: "La réinitialisation effacera tous vos schémas linguistiques, missions et leçons archivées. Cette action est irréversible.",
    resetForever: "Réinitialiser pour toujours",
    auth: {
      login: {
        title: "Bon retour !",
        subtitle: "Connectez-vous pour synchroniser vos progrès et continuer votre apprentissage.",
        cta: "Se connecter"
      },
      signup: {
        title: "Commencez l'aventure",
        subtitle: "Créez un compte gratuit pour débloquer les sparks quotidiens et le suivi linguistique.",
        cta: "Créer un compte"
      },
      limit: {
        title: "Débloquez l'expérience complète",
        subtitle: "Les invités ont atteint leur limite. Rejoignez LexiLift pour continuer à apprendre.",
        cta: "S'inscrire gratuitement"
      }
    },
    catMap: {
      Grammar: "Grammaire",
      Conjugaison: "Conjugaison",
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
    deleteAll: "حذف الكل",
    deleteConfirmTitle: "مسح سجل المحادثات - هل أنت متأكد؟",
    deleteConfirmDesc: "سيؤدي هذا الإجراء إلى حذف كل سجل المحادثات والأنماط اللغوية نهائياً. لن تتمكن من استعادتها.",
    confirmDeletion: "تأكيد الحذف",
    cancel: "إلغاء",
    deepDiveBtn: "تعمق",
    deepDiveTitle: "تحليل هيكلي",
    subtitle: "مرحباً! هل أنت مستعد للتعلم؟",
    description: "اكتب جملة بالفرنسية للحصول على تصحيحات، أو بلغة أخرى للحصول على ترجمة.",
    placeholder: "اكتب جملة بالفرنسية (أو بلغة أخرى)...",
    button: "تحسين",
    notesLabel: "ملاحظات المعلم",
    lookingGood: "تبدو جيدة!",
    originalLabel: "الأصل",
    alternativeLabel: "بديل",
    translationLabel: "ترجمة",
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
    archiveEmpty: "ستظهر مهامك المحلولة هنا.",
    proLabel: "برو",
    upgradeTitle: "ترقية الخطة",
    settings: "الإعدادات",
    feedback: "الملاحظات",
    logout: "تسجيل الخروج",
    aiExplainLang: "الذكاء الاصطناعي يشرح بـ...",
    systemLang: "لغة النظام",
    login: "تسجيل الدخول",
    signup: "سجل مجاناً",
    signupCTA: "إنشاء حساب",
    loginCTA: "تسجيل الدخول",
    guestMode: "وضع الزائر",
    correctionsLeft: "{n} تصحيحات متبقية",
    proMasterPatterns: "أتقن أنماطك مع المدرب النخبة.",
    proJoin: "انضم إلى برو",
    proMember: "عضو برو",
    acceleratedLearning: "تعلم متسارع",
    resetBrainTitle: "السجل اللغوي",
    resetBrainBtn: "إعادة ضبط الدماغ",
    resetBrainDesc: "سيؤدي إعادة الضبط إلى مسح جميع الأنماط اللغوية والمهام والدروس المؤرشفة. لا يمكن التراجع عن هذا الإجراء.",
    resetForever: "إعادة ضبط للأبد",
    auth: {
      login: {
        title: "أهلاً بعودتك",
        subtitle: "سجل الدخول لمزامنة تقدمك عبر الأجهزة ومواصلة إتقانك.",
        cta: "تسجيل الدخول"
      },
      signup: {
        title: "ابدأ رحلتك",
        subtitle: "أنشئ حساباً مجانياً لفتح الشرارات اليومية والتتبع اللغوي.",
        cta: "إنشاء حساب"
      },
      limit: {
        title: "افتح التجربة الكاملة",
        subtitle: "وصل الزوار إلى الحد الأقصى. انضم إلى LexiLift لمواصلة التعلم.",
        cta: "سجل مجاناً"
      }
    },
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
      "Je suis fini avec محادثتي",
      "Est-ce que tu peux m'aider مع هذا؟",
      "S'il vous plaît, parlez plus lentement"
    ]
  },
  Spanish: {
    navPractice: "Práctica",
    navBrain: "Mi Cerebro",
    newChat: "Nuevo Chat",
    recentChats: "Chats Recientes",
    deleteAll: "Eliminar todo",
    deleteConfirmTitle: "¿Borrar tu historial de chat? ¿Estás seguro?",
    deleteConfirmDesc: "Esta acción eliminará permanentemente todo tu historial de chats y patrones lingüísticos. No podrás recuperarlos.",
    confirmDeletion: "Confirmar eliminación",
    cancel: "Cancelar",
    deepDiveBtn: "Análisis Profundo",
    deepDiveTitle: "Análisis de Gramática",
    subtitle: "¡Bonjour! ¿Listo para aprender?",
    description: "Escribe una frase en francés para recibir correcciones, o en otro idioma para una traduction.",
    placeholder: "Escribe una frase en francés (u otro idioma)...",
    button: "Mejorar",
    notesLabel: "Notas del Tutor",
    lookingGood: "¡Se ve bien!",
    originalLabel: "Original",
    alternativeLabel: "Alternativa",
    translationLabel: "Traducción",
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
    archiveEmpty: "Tus misiones resueltas aparecerán aquí.",
    proLabel: "PRO",
    upgradeTitle: "Mejorar plan",
    settings: "Ajustes",
    feedback: "Comentarios",
    logout: "Cerrar sesión",
    aiExplainLang: "La IA explica en...",
    systemLang: "Idioma del sistema",
    login: "Iniciar sesión",
    signup: "Regístrate gratis",
    signupCTA: "Crear cuenta",
    loginCTA: "Iniciar sesión",
    guestMode: "Modo invitado",
    correctionsLeft: "{n} corrección(es) restante(s)",
    proMasterPatterns: "Domina tus patrones con el Coach Élite.",
    proJoin: "Ser Pro",
    proMember: "Miembro Pro",
    acceleratedLearning: "Aprendizaje Acelerado",
    resetBrainTitle: "Historial Lingüístico",
    resetBrainBtn: "Reiniciar Cerebro",
    resetBrainDesc: "Reiniciar borrará todos tus patrones lingüísticos, misiones y lecciones archivadas. Esta acción no se puede deshacer.",
    resetForever: "Reiniciar para siempre",
    auth: {
      login: {
        title: "Bienvenido de nuevo",
        subtitle: "Inicia sesión para sincronizar tu progreso y continuar tu maestría.",
        cta: "Iniciar sesión"
      },
      signup: {
        title: "Comienza tu viaje",
        subtitle: "Crea una cuenta gratuita para desbloquear chispas diarias y seguimiento lingüístico.",
        cta: "Crear cuenta"
      },
      limit: {
        title: "Desbloquea la experiencia completa",
        subtitle: "Los invitados han alcanzado su límite. Únete a LexiLift para seguir aprendiendo.",
        cta: "Regístrate gratis"
      }
    },
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
      "Je visitais ma grand-mère la semana dernière",
      "Merci pour le aide",
      "C'est un bon idée",
      "Je n'ai pas de l'argent",
      "Je cherche pour mon chat",
      "Je suis fini avec mon trabajo",
      "Est-ce que tu peux m'aider avec ça?",
      "S'il vous plaît, parlez más lentamente"
    ]
  }
};
