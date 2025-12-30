
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
import { Loader2, ShieldAlert } from 'lucide-react';

const STORAGE_KEY_CONVS = 'french_mentor_conversations';
const STORAGE_KEY_CUR_CONV = 'french_mentor_cur_conv';
const STORAGE_KEY_SYSTEM_LANG = 'french_mentor_system_lang';
const STORAGE_KEY_AI_LANG = 'french_mentor_ai_lang';
const STORAGE_KEY_TRANS_LANG = 'french_mentor_trans_lang';
const STORAGE_KEY_STATS = 'french_mentor_stats';

const FREE_DAILY_MAX = 8;
const FREE_COST_PER_MSG = 2;
const PRO_COST_PER_MSG = 1;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [showProModal, setShowProModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 1024);
  const [activeLesson, setActiveLesson] = useState<CoachLesson | null>(null);

  // Initialize Supabase Auth and Profile
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.getProfile(session.user.id).then(profile => {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.email?.split('@')[0],
            is_pro: profile?.is_pro || false
          });
        });
      }
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.getProfile(session.user.id).then(profile => {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.email?.split('@')[0],
            is_pro: profile?.is_pro || false
          });
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [guestMessages, setGuestMessages] = useState<Message[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(localStorage.getItem(STORAGE_KEY_CUR_CONV));

  const [systemLang, setSystemLang] = useState<SystemLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_SYSTEM_LANG) as SystemLanguage) || 'French';
  });

  const [aiLang, setAiLang] = useState<SupportLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_AI_LANG) as SupportLanguage) || 'French';
  });

  const [translationLang, setTranslationLang] = useState<SupportLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_TRANS_LANG) as SupportLanguage) || 'French';
  });

  const [stats, setStats] = useState<BrainStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    try { 
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || { totalCorrections: 0, categories: {}, history: [], sparks: FREE_DAILY_MAX, lastRefillTimestamp: Date.now(), archivedLessons: [] }; 
    } catch (e) { 
      return { totalCorrections: 0, categories: {}, history: [], sparks: FREE_DAILY_MAX, lastRefillTimestamp: Date.now(), archivedLessons: [] }; 
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[systemLang];
  const isRtl = systemLang === 'Arabic';
  const isPro = user?.is_pro;

  useEffect(() => {
    getBrowserFingerprint().then(id => {
      setDeviceId(id);
      if (!user) {
        supabase.getGuestSparks(id).then(sparks => {
          setStats(prev => ({ ...prev, sparks }));
        });
      }
    });
  }, [user]);

  const currentMessages = useMemo(() => {
    if (!user) return guestMessages;
    const conv = conversations.find(c => c.id === activeConvId);
    return conv?.messages || [];
  }, [user, activeConvId, conversations, guestMessages]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setShowAuthModal(false);
    resetChatSession();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setConversations([]);
    setGuestMessages([]);
    setActiveConvId(null);
    localStorage.removeItem(STORAGE_KEY_CUR_CONV);
    resetChatSession();
  };

  useEffect(() => { localStorage.setItem(STORAGE_KEY_SYSTEM_LANG, systemLang); }, [systemLang]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_AI_LANG, aiLang); }, [aiLang]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TRANS_LANG, translationLang); }, [translationLang]);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    if (activeConvId) localStorage.setItem(STORAGE_KEY_CUR_CONV, activeConvId);
    scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversations, guestMessages, activeTab, user, activeConvId]);

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    if (!user && deviceId) {
      supabase.updateGuestSparks(deviceId, stats.sparks);
    }
  }, [stats, user, deviceId]);

  const handleNewChat = useCallback(() => {
    if (!user) { setShowAuthModal(true); return; }
    
    // Check if current view is already empty
    const currentConv = conversations.find(c => c.id === activeConvId);
    if (currentConv && currentConv.messages.length === 0) return;

    // Look for ANY existing empty chat and reuse it
    const existingEmpty = conversations.find(c => c.messages.length === 0);
    if (existingEmpty) {
      setActiveConvId(existingEmpty.id);
      setActiveTab('practice');
      return;
    }

    const id = Date.now().toString();
    const newConv: Conversation = { id, title: t.newChat, messages: [], timestamp: Date.now() };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(id);
    setActiveTab('practice');
    resetChatSession();
  }, [user, t.newChat, conversations, activeConvId]);

  const handleSendMessage = useCallback(async (content: string) => {
    const cost = isPro ? PRO_COST_PER_MSG : FREE_COST_PER_MSG;
    if (stats.sparks < cost) {
      setShowProModal(true);
      return;
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    let finalConvId = activeConvId;

    if (!user) {
      setGuestMessages(prev => [...prev, newUserMessage]);
    } else {
      const activeConv = conversations.find(c => c.id === activeConvId);
      
      if (!activeConv) {
        // Fallback: Use existing empty or create new
        const existingEmpty = conversations.find(c => c.messages.length === 0);
        if (existingEmpty) {
          finalConvId = existingEmpty.id;
          setConversations(prev => prev.map(c => c.id === finalConvId ? { 
            ...c, 
            messages: [newUserMessage], 
            title: content.slice(0, 25), 
            timestamp: Date.now() 
          } : c));
        } else {
          finalConvId = Date.now().toString();
          const newConv: Conversation = { 
            id: finalConvId, 
            title: content.slice(0, 25), 
            messages: [newUserMessage], 
            timestamp: Date.now() 
          };
          setConversations(prev => [...prev.filter(c => c.messages.length > 0), newConv]);
        }
        setActiveConvId(finalConvId);
      } else {
        setConversations(prev => prev.map(c => {
          if (c.id === activeConvId) {
            const isFirstMsg = c.messages.length === 0;
            return { 
              ...c, 
              messages: [...c.messages, newUserMessage], 
              title: isFirstMsg ? (content.length > 25 ? content.slice(0, 25) + "..." : content) : c.title,
              timestamp: Date.now() 
            };
          }
          return c;
        }));
      }
    }

    setIsLoading(true);
    setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - cost) }));

    try {
      const jsonResponse = await sendMessageToGemini(content, aiLang, translationLang, currentMessages);
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      
      if (!user) {
        setGuestMessages(prev => [...prev, newAiMessage]);
      } else {
        setConversations(prev => prev.map(c => c.id === finalConvId ? { ...c, messages: [...c.messages, newAiMessage] } : c));
      }

      const data: CorrectionResponse = JSON.parse(jsonResponse);
      if (data.corrections && data.corrections.length > 0) {
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
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [aiLang, translationLang, currentMessages, activeConvId, user, stats.sparks, isPro, conversations]);

  const archiveLesson = (lesson: CoachLesson) => {
    setStats(prev => ({
      ...prev,
      archivedLessons: [lesson, ...prev.archivedLessons]
    }));
  };

  const handleClearHistory = () => {
    setConversations([]);
    setActiveConvId(null);
    localStorage.removeItem(STORAGE_KEY_CUR_CONV);
    setShowDeleteModal(false);
    resetChatSession();
  };

  const handleDeepDive = async (messageId: string, context: string) => {
    if (!isPro) { setShowProModal(true); return; }
    if (stats.sparks < 10) { setShowProModal(true); return; }

    setStats(prev => ({ ...prev, sparks: prev.sparks - 10 }));
    
    if (user) {
      setConversations(prev => prev.map(c => c.id === activeConvId ? {
        ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, isDeepDiveLoading: true } : m)
      } : c));
    } else {
      setGuestMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeepDiveLoading: true } : m));
    }

    try {
      const diveContent = await generateDeepDive(context, aiLang);
      
      if (user) {
        setConversations(prev => prev.map(c => c.id === activeConvId ? {
          ...c, messages: c.messages.map(m => {
            if (m.id === messageId) {
              const parsed = JSON.parse(m.content);
              parsed.deepDive = diveContent;
              return { ...m, content: JSON.stringify(parsed), isDeepDiveLoading: false };
            }
            return m;
          })
        } : c));
      } else {
        setGuestMessages(prev => prev.map(m => {
          if (m.id === messageId) {
            const parsed = JSON.parse(m.content);
            parsed.deepDive = diveContent;
            return { ...m, content: JSON.stringify(parsed), isDeepDiveLoading: false };
          }
          return m;
        }));
      }
    } catch (e) {
      console.error(e);
      if (user) {
        setConversations(prev => prev.map(c => c.id === activeConvId ? {
          ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, isDeepDiveLoading: false } : m)
        } : c));
      }
    }
  };

  return (
    <div className={`flex h-full relative font-sans ${isRtl ? 'font-arabic' : ''} bg-slate-50 text-slate-900`}>
      {user && (
        <Sidebar 
          language={systemLang}
          conversations={conversations}
          activeConversationId={activeConvId}
          onNewChat={handleNewChat}
          onSelectChat={(id) => { setActiveConvId(id); setActiveTab('practice'); }}
          onDeleteChat={(id) => {
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeConvId === id) setActiveConvId(null);
          }}
          onRenameChat={(id, title) => setConversations(prev => prev.map(c => c.id === id ? {...c, title} : c))}
          onDeleteAllChats={() => setShowDeleteModal(true)}
          archivedLessons={stats.archivedLessons}
          onSelectLesson={(lesson) => setActiveLesson(lesson)}
          isPro={!!isPro}
          onUpgradeClick={() => setShowProModal(true)}
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          translateCat={(cat) => (t.catMap as any)[cat] || cat}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onLogout={handleLogout}
          user={user}
        />
      )}

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        <Header 
          language={systemLang} 
          sparks={stats.sparks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          isSidebarExpanded={isSidebarExpanded}
          onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
          {!user && activeTab === 'practice' && (
            <div className="bg-orange-50 border-b border-orange-100 p-2 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-orange-700">
               <ShieldAlert size={14} />
               <span>{t.guestModeDesc}</span>
               <button onClick={() => setShowAuthModal(true)} className="underline ml-2">Sign up now</button>
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
                      key={msg.id} 
                      message={msg} 
                      language={systemLang} 
                      translationLanguage={translationLang}
                      isPro={!!isPro} 
                      onLockClick={() => user ? setShowProModal(true) : setShowAuthModal(true)}
                      onDeepDive={handleDeepDive}
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
              isPro={!!isPro} 
              onUpgradeClick={() => setShowProModal(true)} 
              userMessageCount={stats.totalCorrections}
              onArchiveLesson={archiveLesson}
              onOpenLesson={(lesson) => setActiveLesson(lesson)}
            />
          )}
        </main>

        {activeTab === 'practice' && (
          <footer className="shrink-0">
            <InputArea onSend={handleSendMessage} isLoading={isLoading} language={systemLang} sparks={stats.sparks} isPro={!!isPro} />
          </footer>
        )}
      </div>

      {showAuthModal && <AuthModal language={systemLang} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
      {showProModal && <ProModal language={systemLang} onClose={() => setShowProModal(false)} onUpgrade={() => {}} />}
      {showDeleteModal && <DeleteConfirmModal language={systemLang} onClose={() => setShowDeleteModal(false)} onConfirm={handleClearHistory} />}
      
      {showSettingsModal && (
        <SettingsModal 
          language={systemLang}
          aiLang={aiLang}
          translationLang={translationLang}
          onClose={() => setShowSettingsModal(false)}
          onSetSystemLang={setSystemLang}
          onSetAiLang={setAiLang}
          onSetTranslationLang={setTranslationLang}
        />
      )}

      {showFeedbackModal && <FeedbackModal language={systemLang} onClose={() => setShowFeedbackModal(false)} />}
      
      {activeLesson && (
        <CoachLessonModal 
          lesson={activeLesson} 
          language={systemLang} 
          onClose={() => setActiveLesson(null)} 
        />
      )}
    </div>
  );
};

export default App;
