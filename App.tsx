
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, SupportLanguage, UI_TRANSLATIONS, BrainStats, CorrectionResponse, MistakeRecord } from './types';
import { sendMessageToGemini, resetChatSession } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import BrainDashboard from './components/BrainDashboard';
import { Loader2, MessageSquare, Brain } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const scrollToBottom = () => {
    if (activeTab === 'practice') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Persist messages whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, activeTab]);

  // Persist stats whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  // Persist language whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
  }, [language]);

  // Ensure we scroll to bottom when loading starts/ends
  useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  const updateStatsFromResponse = (responseJson: string) => {
    try {
      const data: CorrectionResponse = JSON.parse(responseJson);
      if (!data.corrections || data.corrections.length === 0) return;

      setStats(prev => {
        const newCategories = { ...prev.categories };
        const newHistory = [...prev.history];

        data.corrections.forEach(c => {
          newCategories[c.category] = (newCategories[c.category] || 0) + 1;
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
          // Placeholder for sparks logic later
        };
      });
    } catch (e) {
      console.error("Failed to update stats", e);
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

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
  }, [language, messages]);

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
      <Header onReset={handleReset} language={language} setLanguage={setLanguage} />

      <main className="flex-1 overflow-y-auto scroll-smooth">
        {activeTab === 'practice' ? (
          <div className="max-w-4xl mx-auto h-full px-4 py-6">
            {messages.length === 0 ? (
              <EmptyState onSuggestionClick={handleSendMessage} language={language} />
            ) : (
              <div className="pb-24">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} language={language} />
                ))}
                
                {isLoading && (
                  <div className={`flex justify-center w-full my-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="bg-white px-6 py-4 rounded-full shadow-sm border border-slate-100 flex items-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                      <span className="text-slate-600 font-medium">{t.analyzing}</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        ) : (
          <BrainDashboard stats={stats} language={language} />
        )}
      </main>

      {/* Conditional Footer/Input */}
      {activeTab === 'practice' && (
        <InputArea onSend={handleSendMessage} isLoading={isLoading} language={language} />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'practice' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MessageSquare size={24} fill={activeTab === 'practice' ? 'currentColor' : 'none'} fillOpacity={0.1} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.navPractice}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('brain')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'brain' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Brain size={24} fill={activeTab === 'brain' ? 'currentColor' : 'none'} fillOpacity={0.1} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.navBrain}</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
