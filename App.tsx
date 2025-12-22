
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, SupportLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse } from './types';
import { sendMessageToGemini, resetChatSession } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import BrainDashboard from './components/BrainDashboard';
import { Loader2 } from 'lucide-react';

const STORAGE_KEY_MESSAGES = 'french_mentor_messages';
const STORAGE_KEY_LANGUAGE = 'french_mentor_language';
const STORAGE_KEY_STATS = 'french_mentor_stats';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');

  // Initialize state from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [language, setLanguage] = useState<SupportLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    return (saved as SupportLanguage) || 'English';
  });

  const [stats, setStats] = useState<BrainStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    try {
      return saved ? JSON.parse(saved) : {
        totalCorrections: 0,
        categories: {},
        history: [],
        sparks: 10
      };
    } catch (e) {
      return { totalCorrections: 0, categories: {}, history: [], sparks: 10 };
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const scrollToBottom = (instant = false) => {
    if (activeTab === 'practice' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: instant ? 'auto' : 'smooth'
      });
    }
  };

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, activeTab]);

  // Persist stats
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  // Persist language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
  }, [language]);

  const updateStatsFromResponse = (responseJson: string) => {
    try {
      const data: CorrectionResponse = JSON.parse(responseJson);
      if (!data.corrections || data.corrections.length === 0) return;

      setStats(prev => {
        const newCategories = { ...prev.categories };
        const newHistory = [...prev.history];

        data.corrections.forEach(c => {
          newCategories[c.category] = (Number(newCategories[c.category]) || 0) + 1;
          newHistory.push({
            original: c.original,
            corrected: c.corrected,
            category: c.category,
            timestamp: Date.now()
          });
        });

        return {
          ...prev,
          totalCorrections: prev.totalCorrections + data.corrections.length,
          categories: newCategories,
          history: newHistory,
        };
      });
    } catch (e) {
      console.error("Failed to update stats", e);
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    // Check sparks
    if (stats.sparks < 2) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Deduct sparks immediately for feedback
    setStats(prev => ({ ...prev, sparks: Math.max(0, prev.sparks - 2) }));

    try {
      const jsonResponse = await sendMessageToGemini(content, language, messages);
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: jsonResponse,
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
      updateStatsFromResponse(jsonResponse);
      
    } catch (error) {
      console.error("Failed to send message", error);
      const errorJson = JSON.stringify({
         correctedFrench: "Error",
         englishTranslation: "Could not process request",
         corrections: [],
         tutorNotes: "Désolé, j'ai rencontré une erreur. Veuillez réessayer."
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          content: errorJson,
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [language, messages, stats.sparks]);

  const handleReset = useCallback(() => {
    if (window.confirm(t.resetConfirm)) {
      setMessages([]);
      setStats({
        totalCorrections: 0,
        categories: {},
        history: [],
        sparks: 10
      });
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_STATS);
      resetChatSession();
    }
  }, [t]);

  return (
    <div className={`flex flex-col h-full bg-slate-50 relative font-sans ${isRtl ? 'font-arabic' : ''}`}>
      <Header 
        onReset={handleReset} 
        language={language} 
        setLanguage={setLanguage} 
        sparks={stats.sparks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth flex flex-col"
      >
        {activeTab === 'practice' ? (
          <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState onSuggestionClick={handleSendMessage} language={language} />
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} language={language} />
                ))}
                
                {isLoading && (
                  <div className={`flex justify-center w-full my-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-full shadow-md border border-slate-100 flex items-center gap-3 animate-pulse">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                      <span className="text-slate-600 font-bold tracking-tight">{t.analyzing}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <BrainDashboard stats={stats} language={language} />
          </div>
        )}
      </main>

      {/* Footer: Only Input Area */}
      {activeTab === 'practice' && (
        <footer className="shrink-0">
          <InputArea 
            onSend={handleSendMessage} 
            isLoading={isLoading} 
            language={language} 
            sparks={stats.sparks}
          />
        </footer>
      )}
    </div>
  );
};

export default App;
