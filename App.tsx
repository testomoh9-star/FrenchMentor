
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, SupportLanguage, SystemLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, CoachLesson, Conversation, User } from './types';
import { sendMessageToGemini, resetChatSession, generateDeepDive } from './services/geminiService';
import { getBrowserFingerprint, supabase, supabaseClient } from './services/supabaseService';
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
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { Loader2, ShieldAlert, CloudRain } from 'lucide-react';

const STORAGE_KEY_SYSTEM_LANG = 'lexilift_system_lang';
const STORAGE_KEY_AI_LANG = 'lexilift_ai_lang';
const STORAGE_KEY_TRANS_LANG = 'lexilift_trans_lang';

const FREE_COST_PER_MSG = 2;
const PRO_COST_PER_MSG = 1;

const App: React.FC = () => {
  // --- CORE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [stats, setStats] = useState<BrainStats>({
    totalCorrections: 0,
    categories: {},
    history: [],
    sparks: 8,
    lastRefillTimestamp: Date.now(),
    archivedLessons: []
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [guestMessages, setGuestMessages] = useState<Message[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [showProModal, setShowProModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 1024);
  const [activeLesson, setActiveLesson] = useState<CoachLesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [systemLang, setSystemLang] = useState<SystemLanguage>(() => (localStorage.getItem(STORAGE_KEY_SYSTEM_LANG) as SystemLanguage) || 'French');
  const [aiLang, setAiLang] = useState<SupportLanguage>(() => (localStorage.getItem(STORAGE_KEY_AI_LANG) as SupportLanguage) || 'French');
  const [translationLang, setTranslationLang] = useState<SupportLanguage>(() => (localStorage.getItem(STORAGE_KEY_TRANS_LANG) as SupportLanguage) || 'French');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[systemLang];
  const isRtl = systemLang === 'Arabic';
  const isPro = user?.is_pro;

  // --- AUTH SESSION MANAGEMENT ---

  const loadUserData = async (userId: string, email: string) => {
    setIsDataLoading(true);
    // Clear potentially stale data immediately
    setConversations([]);
    setGuestMessages([]);
    setActiveConvId(null);

    try {
      const [profile, cloudConvs] = await Promise.all([
        supabase.getProfile(userId),
        supabase.fetchConversations(userId)
      ]);

      if (profile) {
        setUser({
          id: userId,
          email: email,
          full_name: profile.full_name || email.split('@')[0],
          is_pro: profile.is_pro || false
        });
        setStats(prev => ({ ...prev, sparks: profile.sparks ?? 8 }));
        setConversations(cloudConvs || []);
        if (cloudConvs && cloudConvs.length > 0) setActiveConvId(cloudConvs[0].id);
      }
    } catch (e) {
      console.error("Failed to load user data:", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const loadGuestData = async (fId: string) => {
    setIsDataLoading(true);
    try {
      const data = await supabase.getGuestData(fId);
      // Failsafe check to prevent 'Cannot read properties of null'
      const sparks = data ? (data.sparks ?? 8) : 8;
      
      setStats(prev => ({ ...prev, sparks }));
      setConversations([]);
      setGuestMessages([]);
      setActiveConvId(null);
      setUser(null);
    } catch (e) {
      console.error("Failed to load guest data:", e);
      setStats(prev => ({ ...prev, sparks: 8 }));
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const fId = await getBrowserFingerprint();
      setDeviceId(fId);

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email || '');
      } else {
        await loadGuestData(fId);
      }

      // Explicit Auth Change Handling
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          const freshFid = await getBrowserFingerprint();
          await loadGuestData(freshFid);
        }
      });

      return () => subscription.unsubscribe();
    };
    init();
  }, []);

  // --- PERSISTENCE ---

  useEffect(() => {
    // Only sync back to DB if loading is finished to avoid overwriting cloud with defaults
    if (isDataLoading) return;

    if (user) {
      supabase.updateSparks(user.id, stats.sparks, true);
    } else if (deviceId) {
      supabase.updateSparks(deviceId, stats.sparks, false);
    }
  }, [stats.sparks, user, deviceId, isDataLoading]);

  useEffect(() => {
    // Only sync conversations to cloud if logged in and not currently loading profile
    if (user && !isDataLoading) {
      supabase.syncConversations(user.id, conversations);
    }
  }, [conversations, user, isDataLoading]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_SYSTEM_LANG, systemLang); }, [systemLang]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_AI_LANG, aiLang); }, [aiLang]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TRANS_LANG, translationLang); }, [translationLang]);

  // --- ACTIONS ---

  const handleSendMessage = useCallback(async (content: string) => {
    const cost = isPro ? PRO_COST_PER_MSG : FREE_COST_PER_MSG;
    if (stats.sparks < cost) {
      setShowProModal(true);
      return;
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    
    if (!user) {
      setGuestMessages(prev => [...prev, newUserMessage]);
    } else {
      setConversations(prev => {
        const active = prev.find(c => c.id === activeConvId);
        if (!active) {
          const newId = Date.now().toString();
          setActiveConvId(newId);
          return [{ id: newId, title: content.slice(0, 25), messages: [newUserMessage], timestamp: Date.now() }, ...prev];
        }
        return prev.map(c => c.id === activeConvId ? { 
          ...c, 
          messages: [...c.messages, newUserMessage],
          timestamp: Date.now(),
          title: c.messages.length === 0 ? content.slice(0, 25) : c.title
        } : c);
      });
    }

    setIsLoading(true);
    setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - cost) }));

    try {
      const context = !user ? guestMessages : conversations.find(c => c.id === activeConvId)?.messages || [];
      const jsonResponse = await sendMessageToGemini(content, aiLang, translationLang, context);
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      
      if (!user) {
        setGuestMessages(prev => [...prev, newAiMessage]);
      } else {
        setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, newAiMessage] } : c));
      }

      const data: CorrectionResponse = JSON.parse(jsonResponse);
      if (data.corrections?.length > 0) {
        setStats(prev => {
          const newCats = { ...prev.categories };
          const newHist = [...prev.history];
          data.corrections.forEach(c => {
            newCats[c.category] = (Number(newCats[c.category]) || 0) + 1;
            newHist.push({ original: c.original, corrected: c.corrected, category: c.category, timestamp: Date.now() });
          });
          return { ...prev, totalCorrections: prev.totalCorrections + data.corrections.length, categories: newCats, history: newHist };
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [aiLang, translationLang, activeConvId, user, stats.sparks, isPro, conversations, guestMessages]);

  const handleNewChat = () => {
    if (!user) { openAuth('signup'); return; }
    setActiveConvId(null);
    setActiveTab('practice');
    resetChatSession();
  };

  const currentMessages = useMemo(() => {
    if (!user) return guestMessages;
    return conversations.find(c => c.id === activeConvId)?.messages || [];
  }, [user, activeConvId, conversations, guestMessages]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  if (isDataLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-cyan-400" size={48} />
          <CloudRain className="absolute inset-0 m-auto text-indigo-400 opacity-50" size={20} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black tracking-widest uppercase">Initializing Session</h2>
          <p className="text-slate-500 text-xs font-bold">Synchronizing your linguistic profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full relative font-sans ${isRtl ? 'font-arabic' : ''} bg-slate-50 text-slate-900`}>
      {user && (
        <Sidebar 
          language={systemLang}
          conversations={conversations}
          activeConversationId={activeConvId}
          onNewChat={handleNewChat}
          onSelectChat={(id) => { setActiveConvId(id); setActiveTab('practice'); }}
          onDeleteChat={(id) => { setConversations(prev => prev.filter(c => c.id !== id)); if (activeConvId === id) setActiveConvId(null); }}
          onRenameChat={(id, title) => setConversations(prev => prev.map(c => c.id === id ? {...c, title} : c))}
          onDeleteAllChats={() => setShowDeleteModal(true)}
          archivedLessons={stats.archivedLessons}
          onSelectLesson={setActiveLesson}
          isPro={!!isPro}
          onUpgradeClick={() => setShowProModal(true)}
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          translateCat={(cat) => (t.catMap as any)[cat] || cat}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onLogout={() => supabase.auth.signOut()}
          user={user}
        />
      )}

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        <Header 
          language={systemLang} sparks={stats.sparks}
          activeTab={activeTab} setActiveTab={setActiveTab}
          user={user} onOpenAuth={openAuth}
          isSidebarExpanded={isSidebarExpanded} onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
          {!user && activeTab === 'practice' && (
            <div className="bg-orange-50 border-b border-orange-100 p-2 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-orange-700">
               <ShieldAlert size={14} />
               <span>{t.guestModeDesc}</span>
               <button onClick={() => openAuth('signup')} className="underline ml-2">Sign up now</button>
            </div>
          )}

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
                      key={msg.id} message={msg} 
                      language={systemLang} translationLanguage={translationLang}
                      isPro={!!isPro} onLockClick={() => user ? setShowProModal(true) : openAuth('signup')}
                      onDeepDive={generateDeepDive}
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
              stats={stats} language={systemLang} isPro={!!isPro} 
              onUpgradeClick={() => setShowProModal(true)} 
              userMessageCount={stats.totalCorrections}
              onArchiveLesson={(l) => setStats(s => ({ ...s, archivedLessons: [l, ...s.archivedLessons] }))}
              onOpenLesson={setActiveLesson}
            />
          )}
        </main>

        {activeTab === 'practice' && (
          <footer className="shrink-0">
            <InputArea onSend={handleSendMessage} isLoading={isLoading} language={systemLang} sparks={stats.sparks} isPro={!!isPro} />
          </footer>
        )}
      </div>

      {showAuthModal && <AuthModal language={systemLang} initialMode={authModalMode} onClose={() => setShowAuthModal(false)} onLogin={() => {}} />}
      {showProModal && <ProModal language={systemLang} onClose={() => setShowProModal(false)} onUpgrade={() => {}} />}
      {showDeleteModal && <DeleteConfirmModal language={systemLang} onClose={() => setShowDeleteModal(false)} onConfirm={() => { setConversations([]); setShowDeleteModal(false); }} />}
      {showSettingsModal && <SettingsModal language={systemLang} aiLang={aiLang} translationLang={translationLang} onClose={() => setShowSettingsModal(false)} onSetSystemLang={setSystemLang} onSetAiLang={setAiLang} onSetTranslationLang={setTranslationLang} />}
      {showFeedbackModal && <FeedbackModal language={systemLang} onClose={() => setShowFeedbackModal(false)} />}
      {activeLesson && <CoachLessonModal lesson={activeLesson} language={systemLang} onClose={() => setActiveLesson(null)} />}
    </div>
  );
};

export default App;
