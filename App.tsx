
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, SupportLanguage, SystemLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, CoachLesson, Conversation } from './types';
import { sendMessageToGemini, resetChatSession, generateDeepDive } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import BrainDashboard from './components/BrainDashboard';
import ProModal from './components/ProModal';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import FeedbackModal from './components/FeedbackModal';
import { Loader2, AlertTriangle } from 'lucide-react';

const STORAGE_KEY_CONVS = 'french_mentor_conversations';
const STORAGE_KEY_CUR_CONV = 'french_mentor_cur_conv';
const STORAGE_KEY_SYSTEM_LANG = 'french_mentor_system_lang';
const STORAGE_KEY_AI_LANG = 'french_mentor_ai_lang';
const STORAGE_KEY_STATS = 'french_mentor_stats';
const STORAGE_KEY_IS_PRO = 'french_mentor_is_pro';

const FREE_DAILY_MAX = 10;
const PRO_MONTHLY_MAX = 1000;
const FREE_COST_PER_MSG = 2;
const PRO_COST_PER_MSG = 1;
const DEEP_DIVE_COST = 10;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [showProModal, setShowProModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 1024);
  const [isPro, setIsPro] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY_IS_PRO) === 'true');
  const [configError, setConfigError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_CUR_CONV);
  });

  const [systemLang, setSystemLang] = useState<SystemLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_SYSTEM_LANG) as SystemLanguage) || 'English';
  });

  const [aiLang, setAiLang] = useState<SupportLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_AI_LANG) as SupportLanguage) || 'French';
  });

  const [stats, setStats] = useState<BrainStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    try { 
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || { totalCorrections: 0, categories: {}, history: [], sparks: 10, lastRefillTimestamp: Date.now(), archivedLessons: [] }; 
    } catch (e) { 
      return { totalCorrections: 0, categories: {}, history: [], sparks: 10, lastRefillTimestamp: Date.now(), archivedLessons: [] }; 
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[systemLang];
  const isRtl = systemLang === 'Arabic';

  const currentMessages = useMemo(() => {
    if (!activeConvId) return [];
    return conversations.find(c => c.id === activeConvId)?.messages || [];
  }, [activeConvId, conversations]);

  // Refill Logic Engine
  useEffect(() => {
    const now = Date.now();
    const lastRefill = stats.lastRefillTimestamp || 0;
    const msInDay = 24 * 60 * 60 * 1000;
    const msInMonth = 30 * msInDay;

    let shouldRefill = false;
    let newSparkCount = stats.sparks;

    if (isPro) {
      // Pro Monthly Refill
      if (now - lastRefill >= msInMonth) {
        if (stats.sparks < PRO_MONTHLY_MAX) {
          newSparkCount = PRO_MONTHLY_MAX;
          shouldRefill = true;
        }
      } else if (stats.sparks < FREE_DAILY_MAX && lastRefill === 0) {
          // Handle initial Pro migration case
          newSparkCount = PRO_MONTHLY_MAX;
          shouldRefill = true;
      }
    } else {
      // Free Daily Refill
      if (now - lastRefill >= msInDay) {
        if (stats.sparks < FREE_DAILY_MAX) {
          newSparkCount = FREE_DAILY_MAX;
          shouldRefill = true;
        }
      }
    }

    if (shouldRefill) {
      setStats(prev => ({
        ...prev,
        sparks: newSparkCount,
        lastRefillTimestamp: now
      }));
    }
  }, [isPro, stats.lastRefillTimestamp, stats.sparks]);

  const handleUpgradeToPro = useCallback(() => {
    setIsPro(true);
    setStats(prev => ({
      ...prev,
      sparks: Math.max(prev.sparks, PRO_MONTHLY_MAX),
      lastRefillTimestamp: Date.now()
    }));
    setShowProModal(false);
  }, []);

  // Persist Languages
  useEffect(() => { localStorage.setItem(STORAGE_KEY_SYSTEM_LANG, systemLang); }, [systemLang]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_AI_LANG, aiLang); }, [aiLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    if (activeTab === 'practice') {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [conversations, activeTab]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_IS_PRO, String(isPro)); }, [isPro]);
  useEffect(() => { if(activeConvId) localStorage.setItem(STORAGE_KEY_CUR_CONV, activeConvId); }, [activeConvId]);

  const handleNewChat = useCallback(() => {
    const activeConv = conversations.find(c => c.id === activeConvId);
    if (activeConv && activeConv.messages.length === 0) {
      setActiveTab('practice');
      return; 
    }

    const id = Date.now().toString();
    const newConv: Conversation = { id, title: t.newChat, messages: [], timestamp: Date.now() };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(id);
    setActiveTab('practice');
    resetChatSession();
  }, [conversations, activeConvId, t.newChat]);

  const handleDeleteChat = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConvId === id) {
        setActiveConvId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
      }
      return filtered;
    });
  }, [activeConvId]);

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const cost = isPro ? PRO_COST_PER_MSG : FREE_COST_PER_MSG;
    
    if (stats.sparks < cost) {
      setShowProModal(true);
      return;
    }

    let targetConvId = activeConvId;
    const currentConv = conversations.find(c => c.id === activeConvId);
    
    if (!targetConvId || (currentConv && currentConv.messages.length === 0)) {
        if (!targetConvId) {
            targetConvId = Date.now().toString();
            const newConv: Conversation = { id: targetConvId, title: content.slice(0, 30) + "...", messages: [], timestamp: Date.now() };
            setConversations(prev => [...prev, newConv]);
            setActiveConvId(targetConvId);
        } else {
            setConversations(prev => prev.map(c => c.id === targetConvId ? { ...c, title: content.slice(0, 30) + "..." } : c));
        }
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    
    setConversations(prev => prev.map(c => c.id === targetConvId ? { ...c, messages: [...c.messages, newUserMessage], timestamp: Date.now() } : c));
    setIsLoading(true);

    // Deduct Sparks
    setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - cost) }));

    try {
      const jsonResponse = await sendMessageToGemini(content, aiLang, currentMessages);
      const data: CorrectionResponse = JSON.parse(jsonResponse);
      
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          return { ...c, messages: [...c.messages, newAiMessage] };
        }
        return c;
      }));

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
      if (error.message === "API_KEY_MISSING") setConfigError("API Key is missing or invalid.");
      else console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [aiLang, currentMessages, activeConvId, conversations, stats.sparks, isPro]);

  const handleDeepDive = useCallback(async (messageId: string, contextText: string) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }

    if (stats.sparks < DEEP_DIVE_COST) {
       // Placeholder for "Not enough sparks" toast/alert
       return;
    }

    setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
      ...conv,
      messages: conv.messages.map(m => m.id === messageId ? { ...m, isDeepDiveLoading: true } : m)
    } : conv));

    // Deduct Sparks for Pro Deep Dive
    setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - DEEP_DIVE_COST) }));

    try {
      const deepDiveContent = await generateDeepDive(contextText, aiLang);
      setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
        ...conv,
        messages: conv.messages.map(m => {
          if (m.id === messageId) {
            const parsed = JSON.parse(m.content);
            parsed.deepDive = deepDiveContent;
            return { ...m, content: JSON.stringify(parsed), isDeepDiveLoading: false };
          }
          return m;
        })
      } : conv));
    } catch (e) {
      console.error(e);
      setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
        ...conv,
        messages: conv.messages.map(m => m.id === messageId ? { ...m, isDeepDiveLoading: false } : m)
      } : conv));
    }
  }, [activeConvId, aiLang, isPro, stats.sparks]);

  const handleArchiveLesson = useCallback((lesson: CoachLesson) => {
    setStats(prev => {
      if (prev.archivedLessons.some(l => l.id === lesson.id)) return prev;
      return {
        ...prev,
        archivedLessons: [...prev.archivedLessons, { ...lesson, timestamp: Date.now() }]
      };
    });
  }, []);

  const pendingMissionsCount = useMemo(() => {
    let count = 0;
    Object.entries(stats.categories).forEach(([cat, errCount]) => {
      const archivedCount = stats.archivedLessons.filter(l => l.category === cat).length;
      const totalAvailable = Math.floor(Number(errCount) / 3);
      if (totalAvailable > archivedCount) count++;
    });
    return count;
  }, [stats.categories, stats.archivedLessons]);

  if (configError) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-red-100 max-w-sm">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Configuration Error</h2>
          <p className="text-slate-500 mb-6">{configError}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full relative font-sans ${isRtl ? 'font-arabic' : ''} bg-slate-50 text-slate-900`}>
      <Sidebar 
        language={systemLang}
        conversations={conversations}
        activeConversationId={activeConvId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => { setActiveConvId(id); setActiveTab('practice'); if(window.innerWidth < 1024) setIsSidebarExpanded(false); }}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        archivedLessons={stats.archivedLessons}
        onSelectLesson={(lesson) => { /* Logic to open modal if needed */ }}
        isPro={isPro}
        onUpgradeClick={() => setShowProModal(true)}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        translateCat={(cat) => (t.catMap as any)[cat] || cat}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
      />

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        <Header 
          language={systemLang} 
          sparks={stats.sparks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isPro={isPro}
          hasNotifications={isPro && pendingMissionsCount > 0}
          isSidebarExpanded={isSidebarExpanded}
          onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
          {activeTab === 'practice' ? (
            <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col">
              {currentMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <EmptyState 
                    onSuggestionClick={handleSendMessage} 
                    language={systemLang} 
                  />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 pb-2">
                  {currentMessages.map((msg) => (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      language={systemLang} 
                      isPro={isPro} 
                      onLockClick={() => setShowProModal(true)}
                      onDeepDive={handleDeepDive}
                    />
                  ))}
                  {isLoading && (
                    <div className={`flex justify-center w-full my-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
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
              userMessageCount={conversations.reduce((acc, c) => acc + c.messages.filter(m => m.role === 'user').length, 0)}
              onArchiveLesson={handleArchiveLesson}
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
            />
          </footer>
        )}
      </div>

      {showProModal && <ProModal language={systemLang} onClose={() => setShowProModal(false)} onUpgrade={handleUpgradeToPro} />}
      
      {showSettingsModal && (
        <SettingsModal 
          language={systemLang}
          aiLang={aiLang}
          onClose={() => setShowSettingsModal(false)}
          onSetSystemLang={setSystemLang}
          onSetAiLang={setAiLang}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal 
          language={systemLang}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default App;
