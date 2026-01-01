
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, SupportLanguage, SystemLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, CoachLesson, Conversation, User } from './types';
import { sendMessageToGemini, resetChatSession, generateDeepDive } from './services/geminiService';
import { supabase, supabaseClient } from './services/supabaseService';
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
import { Loader2, ShieldAlert, AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY_SETTINGS = 'lexilift_user_settings';
const STORAGE_KEY_GUEST_STATS = 'lexilift_guest_stats';
const STORAGE_KEY_GUEST_CONVS = 'lexilift_guest_conversations';

const FREE_COST_PER_MSG = 2;
const PRO_COST_PER_MSG = 1;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<BrainStats>({
    totalCorrections: 0,
    categories: {},
    history: [],
    sparks: 8,
    lastRefillTimestamp: Date.now(),
    archivedLessons: []
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

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

  const [systemLang, setSystemLang] = useState<SystemLanguage>('English');
  const [aiLang, setAiLang] = useState<SupportLanguage>('English');
  const [translationLang, setTranslationLang] = useState<SupportLanguage>('English');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[systemLang];
  const isRtl = systemLang === 'Arabic';
  const isPro = user?.is_pro;

  const initGuestSession = () => {
    const savedStats = localStorage.getItem(STORAGE_KEY_GUEST_STATS);
    const savedConvs = localStorage.getItem(STORAGE_KEY_GUEST_CONVS);
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedConvs) setConversations(JSON.parse(savedConvs));
    setUser(null);
    setIsDataLoading(false);
  };

  const initUserSession = async (userId: string, email: string) => {
    setIsDataLoading(true);
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
        
        // Merge cloud stats with current stats
        const b = profile.brain_stats || {};
        setStats({
          sparks: profile.sparks ?? 8,
          totalCorrections: b.totalCorrections ?? 0,
          categories: b.categories ?? {},
          history: b.history ?? [],
          archivedLessons: b.archivedLessons ?? [],
          lastRefillTimestamp: Date.now()
        });
      }

      setConversations(cloudConvs || []);
      if (cloudConvs && cloudConvs.length > 0) setActiveConvId(cloudConvs[0].id);
    } catch (e) {
      console.error("Session init failed:", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    const settings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (settings) {
      const s = JSON.parse(settings);
      setSystemLang(s.systemLang || 'English');
      setAiLang(s.aiLang || 'English');
      setTranslationLang(s.translationLang || 'English');
    }

    const setupAuth = async () => {
      if (!supabaseClient) {
        setEnvError("SUPABASE_URL or SUPABASE_ANON_KEY is missing.");
        initGuestSession();
        return;
      }

      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
          await initUserSession(session.user.id, session.user.email || '');
        } else {
          initGuestSession();
        }

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await initUserSession(session.user.id, session.user.email || '');
          } else if (event === 'SIGNED_OUT') {
            setConversations([]);
            setActiveConvId(null);
            initGuestSession();
          }
        });
      } catch (err) {
        initGuestSession();
      }
    };
    setupAuth();
  }, []);

  // --- AUTO-SYNC TO DATABASE ---
  useEffect(() => {
    if (isDataLoading) return;
    const timer = setTimeout(() => {
      if (user) {
        supabase.syncProfile(user.id, stats.sparks, stats);
        supabase.syncConversations(user.id, conversations);
      } else {
        localStorage.setItem(STORAGE_KEY_GUEST_STATS, JSON.stringify(stats));
        localStorage.setItem(STORAGE_KEY_GUEST_CONVS, JSON.stringify(conversations));
      }
    }, 1000); // Debounce sync by 1 second to avoid hitting Supabase rate limits
    return () => clearTimeout(timer);
  }, [stats, conversations, user, isDataLoading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ systemLang, aiLang, translationLang }));
  }, [systemLang, aiLang, translationLang]);

  const handleSendMessage = useCallback(async (content: string) => {
    const cost = isPro ? PRO_COST_PER_MSG : FREE_COST_PER_MSG;
    if (stats.sparks < cost) {
      setShowProModal(true);
      return;
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setConversations(prev => {
      const active = prev.find(c => c.id === activeConvId);
      if (!active) {
        const newId = Date.now().toString();
        setActiveConvId(newId);
        return [{ id: newId, title: content.slice(0, 25), messages: [newUserMessage], timestamp: Date.now() }, ...prev];
      }
      return prev.map(c => c.id === activeConvId ? { 
        ...c, messages: [...c.messages, newUserMessage], timestamp: Date.now(), title: c.messages.length === 0 ? content.slice(0, 25) : c.title
      } : c);
    });

    setIsLoading(true);
    setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - cost) }));

    try {
      const jsonResponse = await sendMessageToGemini(content, aiLang, translationLang, conversations.find(c => c.id === activeConvId)?.messages || []);
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      setConversations(prev => prev.map(c => c.id === (activeConvId || '') ? { ...c, messages: [...c.messages, newAiMessage] } : c));

      const data: CorrectionResponse = JSON.parse(jsonResponse);
      if (data.corrections?.length > 0) {
        setStats(prev => {
          const newCats = { ...prev.categories };
          const newHist = [...prev.history];
          data.corrections.forEach(c => {
            newCats[c.category] = (Number(newCats[c.category]) || 0) + 1;
            newHist.push({ original: c.original, corrected: c.corrected, category: c.category, timestamp: Date.now() });
          });
          return { ...prev, totalCorrections: prev.totalCorrections + data.corrections.length, categories: newCats, history: newHist.slice(-50) };
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [aiLang, translationLang, activeConvId, user, stats.sparks, isPro, conversations]);

  const handleNewChat = () => { setActiveConvId(null); setActiveTab('practice'); resetChatSession(); };
  const currentMessages = useMemo(() => conversations.find(c => c.id === activeConvId)?.messages || [], [activeConvId, conversations]);

  if (isDataLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
        <div className="text-center">
          <h2 className="text-xl font-black uppercase tracking-widest">Initializing</h2>
          <p className="text-slate-500 text-xs font-bold">Synchronizing LexiLift Brain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full relative font-sans ${isRtl ? 'font-arabic' : ''} bg-slate-50 text-slate-900`}>
      {envError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] w-full max-w-md px-4 animate-in slide-in-from-top-4">
          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <AlertTriangle className="shrink-0" />
            <div className="text-xs font-bold">
              <p>Setup Required</p>
              <p className="opacity-80">Please check your Netlify environment variables.</p>
            </div>
            <button onClick={() => setEnvError(null)} className="ml-auto p-1 hover:bg-white/10 rounded"><X size={16} /></button>
          </div>
        </div>
      )}

      {user && (
        <Sidebar 
          language={systemLang} conversations={conversations} activeConversationId={activeConvId}
          onNewChat={handleNewChat} onSelectChat={(id) => { setActiveConvId(id); setActiveTab('practice'); }}
          onDeleteChat={(id) => { setConversations(prev => prev.filter(c => c.id !== id)); if (activeConvId === id) setActiveConvId(null); }}
          onRenameChat={(id, title) => setConversations(prev => prev.map(c => c.id === id ? {...c, title} : c))}
          onDeleteAllChats={() => setShowDeleteModal(true)}
          archivedLessons={stats.archivedLessons} onSelectLesson={setActiveLesson}
          isPro={!!isPro} onUpgradeClick={() => setShowProModal(true)}
          isExpanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          translateCat={(cat) => (t.catMap as any)[cat] || cat}
          onOpenSettings={() => setShowSettingsModal(true)} onOpenFeedback={() => setShowFeedbackModal(true)}
          onLogout={() => supabase.auth.signOut()} user={user}
        />
      )}

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        <Header 
          language={systemLang} sparks={stats.sparks} activeTab={activeTab} setActiveTab={setActiveTab}
          user={user} onOpenAuth={(mode) => { setAuthModalMode(mode); setShowAuthModal(true); }}
          isSidebarExpanded={isSidebarExpanded} onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
          {!user && activeTab === 'practice' && (
            <div className="bg-orange-50 border-b border-orange-100 p-2 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-orange-700">
               <ShieldAlert size={14} /> <span>{t.guestModeDesc}</span>
               <button onClick={() => setShowAuthModal(true)} className="underline ml-2">Sign up</button>
            </div>
          )}

          {activeTab === 'practice' ? (
            <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col">
              {currentMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center"><EmptyState onSuggestionClick={handleSendMessage} language={systemLang} /></div>
              ) : (
                <div className="space-y-4 sm:space-y-6 pb-2">
                  {currentMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} language={systemLang} translationLanguage={translationLang} isPro={!!isPro} onLockClick={() => user ? setShowProModal(true) : setShowAuthModal(true)} onDeepDive={generateDeepDive} />
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
