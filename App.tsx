
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, SupportLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, CoachLesson, Conversation } from './types';
import { sendMessageToGemini, resetChatSession, generateDeepDive } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import BrainDashboard from './components/BrainDashboard';
import ProModal from './components/ProModal';
import Sidebar from './components/Sidebar';
import { Loader2, AlertTriangle, PanelLeft } from 'lucide-react';

const STORAGE_KEY_CONVS = 'french_mentor_conversations';
const STORAGE_KEY_CUR_CONV = 'french_mentor_cur_conv';
const STORAGE_KEY_LANGUAGE = 'french_mentor_language';
const STORAGE_KEY_STATS = 'french_mentor_stats';
const STORAGE_KEY_IS_PRO = 'french_mentor_is_pro';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [showProModal, setShowProModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
  const [isPro, setIsPro] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY_IS_PRO) === 'true');
  const [configError, setConfigError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_CUR_CONV);
  });

  const [language, setLanguage] = useState<SupportLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANGUAGE) as SupportLanguage) || 'English';
  });

  const [stats, setStats] = useState<BrainStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    try { 
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || { totalCorrections: 0, categories: {}, history: [], sparks: 10, archivedLessons: [] }; 
    } catch (e) { 
      return { totalCorrections: 0, categories: {}, history: [], sparks: 10, archivedLessons: [] }; 
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const currentMessages = useMemo(() => {
    if (!activeConvId) return [];
    return conversations.find(c => c.id === activeConvId)?.messages || [];
  }, [activeConvId, conversations]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    if (activeTab === 'practice') {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [conversations, activeTab]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_LANGUAGE, language); }, [language]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_IS_PRO, String(isPro)); }, [isPro]);
  useEffect(() => { if(activeConvId) localStorage.setItem(STORAGE_KEY_CUR_CONV, activeConvId); }, [activeConvId]);

  const handleNewChat = useCallback(() => {
    const id = Date.now().toString();
    const newConv: Conversation = { id, title: "New Discussion", messages: [], timestamp: Date.now() };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(id);
    setActiveTab('practice');
    resetChatSession();
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!isPro && stats.sparks < 2) {
      setShowProModal(true);
      return;
    }

    let targetConvId = activeConvId;
    if (!targetConvId) {
      targetConvId = Date.now().toString();
      const newConv: Conversation = { id: targetConvId, title: content.slice(0, 30) + "...", messages: [], timestamp: Date.now() };
      setConversations(prev => [...prev, newConv]);
      setActiveConvId(targetConvId);
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    
    setConversations(prev => prev.map(c => c.id === targetConvId ? { ...c, messages: [...c.messages, newUserMessage], timestamp: Date.now() } : c));
    setIsLoading(true);

    if (!isPro) setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - 2) }));

    try {
      const jsonResponse = await sendMessageToGemini(content, language, currentMessages);
      const data: CorrectionResponse = JSON.parse(jsonResponse);
      
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          const updatedTitle = c.messages.length === 1 ? content.slice(0, 30) + "..." : c.title;
          return { ...c, title: updatedTitle, messages: [...c.messages, newAiMessage] };
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
      if (error.message === "API_KEY_MISSING") setConfigError(t.apiKeyMissing);
      else console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [language, currentMessages, activeConvId, stats.sparks, isPro, t]);

  const handleDeepDive = useCallback(async (messageId: string, contextText: string) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }

    setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
      ...conv,
      messages: conv.messages.map(m => m.id === messageId ? { ...m, isDeepDiveLoading: true } : m)
    } : conv));

    try {
      const deepDiveContent = await generateDeepDive(contextText, language);
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
  }, [activeConvId, language, isPro]);

  const handleArchiveLesson = useCallback((lesson: CoachLesson) => {
    setStats(prev => ({
      ...prev,
      archivedLessons: [...prev.archivedLessons, { ...lesson, timestamp: Date.now() }]
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm(t.resetConfirm)) {
      setConversations([]);
      setActiveConvId(null);
      setStats(prev => ({ ...prev, totalCorrections: 0, categories: {}, history: [], sparks: isPro ? 999 : 10, archivedLessons: [] }));
      resetChatSession();
    }
  }, [t, isPro]);

  const pendingMissionsCount = useMemo(() => {
    return Object.entries(stats.categories).filter(([cat, count]) => {
      const archivedCount = stats.archivedLessons.filter(l => l.category === cat).length;
      return (Math.floor(Number(count) / 3)) > archivedCount;
    }).length;
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
    <div className={`flex h-full bg-slate-50 relative font-sans ${isRtl ? 'font-arabic' : ''}`}>
      {showSidebar && (
        <Sidebar 
          language={language}
          conversations={conversations}
          activeConversationId={activeConvId}
          onNewChat={handleNewChat}
          onSelectChat={(id) => { setActiveConvId(id); setActiveTab('practice'); }}
          archivedLessons={stats.archivedLessons}
          onSelectLesson={(lesson) => { /* Logic to open modal if needed */ }}
          isPro={isPro}
          onUpgradeClick={() => setShowProModal(true)}
          translateCat={(cat) => t.catMap[cat as keyof typeof t.catMap] || cat}
        />
      )}

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Header 
          onReset={handleReset} 
          language={language} 
          setLanguage={setLanguage} 
          sparks={isPro ? 999 : stats.sparks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isPro={isPro}
          hasNotifications={isPro && pendingMissionsCount > 0}
        />

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="absolute top-4 left-4 z-40 p-2 bg-white rounded-lg border shadow-sm hover:bg-slate-50 lg:hidden"
          >
            <PanelLeft size={18} />
          </button>

          {activeTab === 'practice' ? (
            <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col">
              {currentMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <EmptyState 
                    onSuggestionClick={handleSendMessage} 
                    language={language} 
                  />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 pb-2">
                  {currentMessages.map((msg) => (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      language={language} 
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
              language={language} 
              isPro={isPro} 
              onUpgradeClick={() => setShowProModal(true)} 
              userMessageCount={currentMessages.filter(m => m.role === 'user').length}
              onArchiveLesson={handleArchiveLesson}
            />
          )}
        </main>

        {activeTab === 'practice' && (
          <footer className="shrink-0">
            <InputArea onSend={handleSendMessage} isLoading={isLoading} language={language} sparks={isPro ? 999 : stats.sparks} />
          </footer>
        )}
      </div>

      {showProModal && <ProModal language={language} onClose={() => setShowProModal(false)} onUpgrade={() => { setIsPro(true); setShowProModal(false); }} />}
    </div>
  );
};

export default App;
