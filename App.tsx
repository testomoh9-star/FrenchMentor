
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, SupportLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, SCENARIOS } from './types';
import { sendMessageToGemini, resetChatSession } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import BrainDashboard from './components/BrainDashboard';
import ProModal from './components/ProModal';
import ReviewSession from './components/ReviewSession';
import { Loader2, AlertTriangle } from 'lucide-react';

const STORAGE_KEY_MESSAGES = 'french_mentor_messages';
const STORAGE_KEY_LANGUAGE = 'french_mentor_language';
const STORAGE_KEY_STATS = 'french_mentor_stats';
const STORAGE_KEY_IS_PRO = 'french_mentor_is_pro';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [showProModal, setShowProModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isPro, setIsPro] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY_IS_PRO) === 'true');
  const [configError, setConfigError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [language, setLanguage] = useState<SupportLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANGUAGE) as SupportLanguage) || 'English';
  });

  const [stats, setStats] = useState<BrainStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    try { 
      return saved ? JSON.parse(saved) : {
        totalCorrections: 0,
        categories: {},
        history: [],
        sparks: 10,
        streak: 0
      }; 
    } catch (e) { 
      return { totalCorrections: 0, categories: {}, history: [], sparks: 10, streak: 0 }; 
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    if (activeTab === 'practice') {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_LANGUAGE, language); }, [language]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_IS_PRO, String(isPro)); }, [isPro]);

  // --- STREAK LOGIC ---
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastPracticeDate === today) return;

    setStats(prev => {
      let newStreak = prev.streak;
      const lastDate = prev.lastPracticeDate ? new Date(prev.lastPracticeDate) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (!lastDate) {
        newStreak = 1;
      } else if (prev.lastPracticeDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset if they missed a day
      }

      return { ...prev, streak: newStreak, lastPracticeDate: today };
    });
  }, [stats.lastPracticeDate]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!isPro && stats.sparks < 2) {
      setShowProModal(true);
      return;
    }

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    updateStreak();

    if (!isPro) setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - 2) }));

    try {
      const jsonResponse = await sendMessageToGemini(content, language, messages);
      const data: CorrectionResponse = JSON.parse(jsonResponse);
      
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: jsonResponse, timestamp: Date.now() };
      setMessages(prev => [...prev, newAiMessage]);

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
  }, [language, messages, stats.sparks, isPro, t, updateStreak]);

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) handleSendMessage(scenario.prompt);
  };

  const handleReset = useCallback(() => {
    if (window.confirm(t.resetConfirm)) {
      setMessages([]);
      setStats(prev => ({ ...prev, totalCorrections: 0, categories: {}, history: [], sparks: isPro ? 999 : 10 }));
      resetChatSession();
    }
  }, [t, isPro]);

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
    <div className={`flex flex-col h-full bg-slate-50 relative font-sans ${isRtl ? 'font-arabic' : ''}`}>
      <Header 
        onReset={handleReset} 
        language={language} 
        setLanguage={setLanguage} 
        sparks={isPro ? 999 : stats.sparks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPro={isPro}
        streak={stats.streak}
      />

      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
        {activeTab === 'practice' ? (
          <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <EmptyState 
                  onSuggestionClick={handleSendMessage} 
                  language={language} 
                  onScenarioClick={handleScenarioSelect}
                />
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 pb-2">
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    language={language} 
                    isPro={isPro} 
                    onLockClick={() => setShowProModal(true)}
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
          <BrainDashboard stats={stats} language={language} isPro={isPro} onUpgradeClick={() => setShowProModal(true)} onReviewClick={() => setShowReview(true)} />
        )}
      </main>

      {activeTab === 'practice' && (
        <footer className="shrink-0">
          <InputArea onSend={handleSendMessage} isLoading={isLoading} language={language} sparks={isPro ? 999 : stats.sparks} />
        </footer>
      )}

      {showProModal && <ProModal language={language} onClose={() => setShowProModal(false)} onUpgrade={() => { setIsPro(true); setShowProModal(false); }} />}
      {showReview && <ReviewSession language={language} history={stats.history} onClose={() => setShowReview(false)} />}
    </div>
  );
};

export default App;
