
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, SupportLanguage, SystemLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, CoachLesson, Conversation, GuestInfo } from './types';
import { sendMessageToGemini, resetChatSession, generateDeepDive } from './services/geminiService';
import { supabase } from './lib/supabase';
import { dbService } from './services/dbService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import BrainDashboard from './components/BrainDashboard';
import ProModal from './components/ProModal';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import FeedbackModal from './components/FeedbackModal';
import CoachLessonModal from './components/CoachLessonModal';
import AuthModal from './components/AuthModal';
import { Loader2 } from 'lucide-react';

const STORAGE_KEY_CONVS = 'french_mentor_conversations';
const STORAGE_KEY_CUR_CONV = 'french_mentor_cur_conv';
const STORAGE_KEY_SYSTEM_LANG = 'french_mentor_system_lang';
const STORAGE_KEY_AI_LANG = 'french_mentor_ai_lang';
const STORAGE_KEY_TRANS_LANG = 'french_mentor_trans_lang';
const STORAGE_KEY_STATS = 'french_mentor_stats';
const STORAGE_KEY_IS_PRO = 'french_mentor_is_pro';
const STORAGE_KEY_GUEST = 'lexilift_guest';

const FREE_DAILY_MAX = 8; 
const PRO_MONTHLY_MAX = 1000;
const FREE_COST_PER_MSG = 2;
const PRO_COST_PER_MSG = 1;
const GUEST_MAX_CORRECTIONS = 2;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [showProModal, setShowProModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'limit' | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 1024);
  const [isPro, setIsPro] = useState<boolean>(false);
  
  // Use null for "checking session" state to avoid Guest flicker
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Distinguish between first-time load and background syncing
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GUEST);
    if (saved) return JSON.parse(saved);
    return {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      corrections_used: 0,
      max_corrections: GUEST_MAX_CORRECTIONS,
      created_at: Date.now()
    };
  });

  const [activeLesson, setActiveLesson] = useState<CoachLesson | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [systemLang, setSystemLang] = useState<SystemLanguage>('French');
  const [aiLang, setAiLang] = useState<SupportLanguage>('French');
  const [translationLang, setTranslationLang] = useState<SupportLanguage>('French');
  const [stats, setStats] = useState<BrainStats>({ 
    totalCorrections: 0, 
    categories: {}, 
    history: [], 
    sparks: FREE_DAILY_MAX, 
    lastRefillTimestamp: Date.now(), 
    archivedLessons: [] 
  });
  const [isLoading, setIsLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[systemLang];

  // Logic to determine if there are new missions (moved from BrainDashboard)
  const hasNewMissions = useMemo(() => {
    if (!isPro) return false;
    let found = false;
    Object.entries(stats.categories).forEach(([cat, count]) => {
      const archivedCount = stats.archivedLessons.filter(l => l.category === cat).length;
      const totalAvailable = Math.floor(Number(count) / 3);
      if (totalAvailable > archivedCount) {
        found = true;
      }
    });
    return found;
  }, [stats.categories, stats.archivedLessons, isPro]);

  // --- Auth Session Listener ---
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthState(session);
      setIsInitialLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthState = (session: any) => {
    const isAuth = !!session;
    setIsAuthenticated(isAuth);
    setUserId(session?.user?.id || null);
    setUserEmail(session?.user?.email || null);
    
    if (isAuth) {
      loadUserData(session.user.id, session.user.email);
      // Close any open auth modals on successful login
      setAuthModalMode(null);
    } else {
      loadGuestData();
      setActiveTab('practice');
      setActiveConvId(null);
    }
  };

  const loadGuestData = () => {
    const savedConvs = localStorage.getItem(STORAGE_KEY_CONVS);
    const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
    const savedCurConv = localStorage.getItem(STORAGE_KEY_CUR_CONV);
    const savedSystemLang = localStorage.getItem(STORAGE_KEY_SYSTEM_LANG);
    const savedAiLang = localStorage.getItem(STORAGE_KEY_AI_LANG);
    const savedTransLang = localStorage.getItem(STORAGE_KEY_TRANS_LANG);

    if (savedConvs) setConversations(JSON.parse(savedConvs));
    else setConversations([]);

    if (savedStats) setStats(JSON.parse(savedStats));
    else setStats({ totalCorrections: 0, categories: {}, history: [], sparks: FREE_DAILY_MAX, lastRefillTimestamp: Date.now(), archivedLessons: [] });

    if (savedCurConv) setActiveConvId(savedCurConv);
    else setActiveConvId(null);

    if (savedSystemLang) setSystemLang(savedSystemLang as SystemLanguage);
    if (savedAiLang) setAiLang(savedAiLang as SupportLanguage);
    if (savedTransLang) setTranslationLang(savedTransLang as SupportLanguage);
    setIsPro(localStorage.getItem(STORAGE_KEY_IS_PRO) === 'true');
  };

  const loadUserData = async (uid: string, email?: string) => {
    setIsSyncing(true);
    try {
      const profile = await dbService.getProfile(uid, email);
      const convs = await dbService.getConversations(uid);
      const mistakes = await dbService.getMistakes(uid);
      const library = await dbService.getLessons(uid);

      if (profile) {
        setIsPro(profile.plan === 'pro');
        setStats(prev => ({
          ...prev,
          sparks: profile.sparks,
          lastRefillTimestamp: new Date(profile.last_refill_at).getTime(),
          totalCorrections: mistakes.length,
          categories: mistakes.reduce((acc: any, m) => {
             acc[m.category] = (acc[m.category] || 0) + 1;
             return acc;
          }, {}),
          history: mistakes,
          archivedLessons: library
        }));
        if (profile.settings) {
          setSystemLang(profile.settings.systemLang || 'French');
          setAiLang(profile.settings.aiLang || 'French');
          setTranslationLang(profile.settings.transLang || 'French');
        }
      }

      setConversations(convs);
      if (convs.length > 0 && !activeConvId) setActiveConvId(convs[convs.length - 1].id);
    } catch (e) {
      console.error("DB Load error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentMessages = useMemo(() => {
    if (!activeConvId) return [];
    return conversations.find(c => c.id === activeConvId)?.messages || [];
  }, [activeConvId, conversations]);

  // Refill Logic (Source of truth is Supabase for auth users)
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const now = Date.now();
    const lastRefill = stats.lastRefillTimestamp || 0;
    const msInDay = 24 * 60 * 60 * 1000;
    const msInMonth = 30 * msInDay;

    let shouldRefill = false;
    let newSparkCount = stats.sparks;

    if (isPro) {
      if (now - lastRefill >= msInMonth) {
        newSparkCount = PRO_MONTHLY_MAX;
        shouldRefill = true;
      }
    } else {
      if (now - lastRefill >= msInDay) {
        newSparkCount = FREE_DAILY_MAX;
        shouldRefill = true;
      }
    }

    if (shouldRefill) {
      setStats(prev => ({ ...prev, sparks: newSparkCount, lastRefillTimestamp: now }));
      dbService.updateProfile(userId, { sparks: newSparkCount, last_refill_at: new Date(now).toISOString() });
    }
  }, [isPro, stats.lastRefillTimestamp, isAuthenticated, userId]);

  // Persistent storage hooks (Guest)
  useEffect(() => {
    if (isAuthenticated) return;
    localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(guestInfo));
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    localStorage.setItem(STORAGE_KEY_IS_PRO, String(isPro));
    if(activeConvId) localStorage.setItem(STORAGE_KEY_CUR_CONV, activeConvId);
  }, [guestInfo, conversations, stats, isPro, activeConvId, isAuthenticated]);

  const updateLanguageSettings = (updates: any) => {
    if (userId && isAuthenticated) {
      const newSettings = {
        systemLang: updates.systemLang || systemLang,
        aiLang: updates.aiLang || aiLang,
        transLang: updates.transLang || translationLang
      };
      dbService.updateProfile(userId, { settings: newSettings });
    }
  };

  const handleSetSystemLang = (lang: SystemLanguage) => {
    setSystemLang(lang);
    updateLanguageSettings({ systemLang: lang });
    if (!isAuthenticated) localStorage.setItem(STORAGE_KEY_SYSTEM_LANG, lang);
  };

  const handleSetAiLang = (lang: SupportLanguage) => {
    setAiLang(lang);
    updateLanguageSettings({ aiLang: lang });
    if (!isAuthenticated) localStorage.setItem(STORAGE_KEY_AI_LANG, lang);
  };

  const handleSetTranslationLang = (lang: SupportLanguage) => {
    setTranslationLang(lang);
    updateLanguageSettings({ transLang: lang });
    if (!isAuthenticated) localStorage.setItem(STORAGE_KEY_TRANS_LANG, lang);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!isAuthenticated) {
      if (guestInfo && guestInfo.corrections_used >= guestInfo.max_corrections) {
        setAuthModalMode('limit');
        return;
      }
    }

    const cost = isPro ? PRO_COST_PER_MSG : FREE_COST_PER_MSG;
    if (isAuthenticated && stats.sparks < cost) {
      setShowProModal(true);
      return;
    }

    setIsLoading(true);
    let targetConvId = activeConvId;
    
    if (!targetConvId || (conversations.find(c => c.id === targetConvId)?.messages.length === 0)) {
      const id = Date.now().toString();
      const newConv: Conversation = { id, title: content.slice(0, 30) + "...", messages: [], timestamp: Date.now() };
      
      if (isAuthenticated && userId) {
        const saved = await dbService.saveConversation(userId, newConv);
        targetConvId = saved.id;
        newConv.id = saved.id;
      } else {
        targetConvId = id;
      }
      setConversations(prev => [...prev, newConv]);
      setActiveConvId(targetConvId);
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setConversations(prev => prev.map(c => c.id === targetConvId ? { ...c, messages: [...c.messages, newUserMessage] } : c));
    
    if (isAuthenticated && userId) {
      dbService.saveMessage(targetConvId!, newUserMessage);
    }

    try {
      const jsonResponse = await sendMessageToGemini(content, aiLang, translationLang, currentMessages);
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      
      setConversations(prev => prev.map(c => c.id === targetConvId ? { ...c, messages: [...c.messages, newAiMessage] } : c));
      
      if (isAuthenticated && userId) {
        dbService.saveMessage(targetConvId!, newAiMessage);
      }

      const data: CorrectionResponse = JSON.parse(jsonResponse);
      
      if (!isAuthenticated) {
        setGuestInfo(prev => prev ? { ...prev, corrections_used: prev.corrections_used + 1 } : null);
      }

      // Charge spark for every interaction regardless of mistakes
      setStats(prev => {
        const newSparks = isAuthenticated ? Math.max(0, prev.sparks - cost) : prev.sparks;
        const newCats = { ...prev.categories };
        const newHist = [...prev.history];
        
        if (data.corrections && data.corrections.length > 0) {
          data.corrections.forEach(c => {
            newCats[c.category] = (Number(newCats[c.category]) || 0) + 1;
            const rec = { original: c.original, corrected: c.corrected, category: c.category, timestamp: Date.now() };
            newHist.push(rec);
            if (isAuthenticated && userId) dbService.saveMistake(userId, rec);
          });
        }

        if (isAuthenticated && userId) {
          dbService.updateProfile(userId, { sparks: newSparks });
        }

        return { 
          ...prev, 
          sparks: newSparks, 
          totalCorrections: prev.totalCorrections + (data.corrections?.length || 0), 
          categories: newCats, 
          history: newHist 
        };
      });
      
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [aiLang, translationLang, currentMessages, activeConvId, conversations, stats.sparks, isPro, isAuthenticated, userId, guestInfo]);

  const handleArchiveLesson = useCallback((lesson: CoachLesson) => {
    if (isAuthenticated && userId) {
      dbService.saveLesson(userId, lesson);
    }
    setStats(prev => {
      if (prev.archivedLessons.some(l => l.id === lesson.id)) return prev;
      return { ...prev, archivedLessons: [...prev.archivedLessons, { ...lesson, timestamp: Date.now() }] };
    });
  }, [isAuthenticated, userId]);

  const handleResetBrain = async () => {
    if (userId && isAuthenticated) {
      setIsSyncing(true);
      try {
        await dbService.resetLinguisticHistory(userId);
        setStats(prev => ({
          ...prev,
          totalCorrections: 0,
          categories: {},
          history: [],
          archivedLessons: [],
          // Removed hardcoded sparks: 8 to preserve plan/balance
        }));
      } catch (e) {
        console.error("Reset brain error:", e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (isAuthenticated && userId) {
      await dbService.deleteConversation(id);
    }
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const handleDeleteAllConversations = async () => {
    if (isAuthenticated && userId) {
      await dbService.deleteAllConversations(userId);
    }
    setConversations([]);
    setActiveConvId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpgrade = async () => {
    if (isAuthenticated && userId) {
      await dbService.updateProfile(userId, { plan: 'pro', sparks: 1000 });
      setIsPro(true);
      setStats(prev => ({ ...prev, sparks: 1000 }));
    } else {
      setIsPro(true);
      setStats(prev => ({ ...prev, sparks: 1000 }));
      localStorage.setItem(STORAGE_KEY_IS_PRO, 'true');
    }
    setShowProModal(false);
  };

  // Initial Splash Screen
  if (isInitialLoading || isAuthenticated === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg"></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-slate-900 font-black text-xl tracking-tight">LexiLift AI</p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t.analyzing}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full relative font-sans ${systemLang === 'Arabic' ? 'font-arabic' : ''} bg-slate-50 text-slate-900 overflow-hidden`}>
      {isAuthenticated && (
        <Sidebar 
          language={systemLang}
          userEmail={userEmail}
          conversations={conversations}
          activeConversationId={activeConvId}
          onNewChat={() => { setActiveConvId(null); setActiveTab('practice'); }}
          onSelectChat={(id) => { setActiveConvId(id); setActiveTab('practice'); }}
          onDeleteChat={handleDeleteConversation}
          onRenameChat={(id, title) => { setConversations(prev => prev.map(c => c.id === id ? {...c, title} : c)); }}
          onDeleteAllChats={handleDeleteAllConversations}
          archivedLessons={stats.archivedLessons}
          onSelectLesson={(lesson) => setActiveLesson(lesson)}
          isPro={isPro}
          onUpgradeClick={() => setShowProModal(true)}
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          translateCat={(cat) => (t.catMap as any)[cat] || cat}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onLogout={handleLogout}
        />
      )}

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        <Header 
          language={systemLang} 
          sparks={stats.sparks}
          activeTab={activeTab}
          setActiveTab={(tab) => { if(!isAuthenticated && tab === 'brain') setAuthModalMode('limit'); else setActiveTab(tab); }}
          isPro={isPro}
          hasNotifications={hasNewMissions}
          isSidebarExpanded={isAuthenticated ? isSidebarExpanded : false}
          onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
          isAuthenticated={isAuthenticated}
          onSignupClick={() => setAuthModalMode('signup')}
          onLoginClick={() => setAuthModalMode('login')}
          isSyncing={isSyncing}
        />

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
          {activeTab === 'practice' ? (
            <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col">
              {currentMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <EmptyState onSuggestionClick={handleSendMessage} language={systemLang} />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 pb-2">
                  {currentMessages.map((msg) => (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      language={systemLang} 
                      translationLanguage={translationLang}
                      isPro={isPro} 
                      onLockClick={isAuthenticated ? () => setShowProModal(true) : () => setAuthModalMode('limit')}
                      onDeepDive={() => {}} 
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-center w-full my-4">
                      <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-full shadow-md border border-slate-100 flex items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={18} />
                        <span className="text-slate-600 font-bold text-sm">{t.analyzing}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <BrainDashboard 
              stats={stats} 
              language={systemLang} 
              isPro={isPro} 
              onUpgradeClick={() => setShowProModal(true)} 
              userMessageCount={stats.history.length}
              onArchiveLesson={handleArchiveLesson}
              onOpenLesson={(lesson) => setActiveLesson(lesson)}
            />
          )}
        </main>

        {activeTab === 'practice' && (
          <footer className="shrink-0">
            <InputArea 
              onSend={handleSendMessage} 
              isLoading={isLoading} 
              language={systemLang} 
              sparks={stats.sparks} 
              isPro={isPro} 
              isAuthenticated={isAuthenticated}
              guestInfo={guestInfo}
            />
          </footer>
        )}
      </div>

      {showProModal && <ProModal language={systemLang} onClose={() => setShowProModal(false)} onUpgrade={handleUpgrade} />}
      {authModalMode && <AuthModal mode={authModalMode} language={systemLang} onClose={() => setAuthModalMode(null)} />}
      {showSettingsModal && (
        <SettingsModal 
          language={systemLang} 
          aiLang={aiLang} 
          translationLang={translationLang} 
          onClose={() => setShowSettingsModal(false)} 
          onSetSystemLang={handleSetSystemLang} 
          onSetAiLang={handleSetAiLang} 
          onSetTranslationLang={handleSetTranslationLang}
          onResetBrain={handleResetBrain}
          isAuthenticated={isAuthenticated}
        />
      )}
      {showFeedbackModal && <FeedbackModal language={systemLang} onClose={() => setShowFeedbackModal(false)} />}
      {activeLesson && <CoachLessonModal lesson={activeLesson} language={systemLang} onClose={() => setActiveLesson(null)} />}
    </div>
  );
};

export default App;
