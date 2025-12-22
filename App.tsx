
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, SupportLanguage, UI_TRANSLATIONS, UserProfile, CorrectionResponse } from './types';
import { sendMessageToGemini, resetChatSession } from './services/geminiService';
import { auth, subscribeToMessages, saveMessageAndTrackMistakes, clearUserMessages, subscribeToProfile } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import LoginScreen from './components/LoginScreen';
import BrainDashboard from './components/BrainDashboard';
import { Loader2, MessageSquare, Brain } from 'lucide-react';

const STORAGE_KEY_LANGUAGE = 'french_mentor_language';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'practice' | 'brain'>('practice');
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<SupportLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    return (saved as SupportLanguage) || 'English';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setMessages([]);
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubMessages = subscribeToMessages(user.uid, (cloudMessages) => {
        setMessages(cloudMessages);
        scrollToBottom();
      });
      const unsubProfile = subscribeToProfile(user.uid, (p) => {
        setProfile(p);
      });
      return () => {
        unsubMessages();
        unsubProfile();
      };
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
  }, [language]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const newUserMessage: Omit<Message, 'id'> = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    await saveMessageAndTrackMistakes(user.uid, newUserMessage);
    setIsLoading(true);

    try {
      const jsonResponse = await sendMessageToGemini(content, language, messages);
      const parsed: CorrectionResponse = JSON.parse(jsonResponse);
      
      const newAiMessage: Omit<Message, 'id'> = {
        role: 'model',
        content: jsonResponse,
        timestamp: Date.now()
      };
      
      // Save AI response and analyze corrections for the brain
      await saveMessageAndTrackMistakes(user.uid, newAiMessage, parsed.corrections);
      
    } catch (error) {
      console.error(error);
      const errorJson = JSON.stringify({
         correctedFrench: "Error",
         englishTranslation: "Could not process request",
         corrections: [],
         tutorNotes: "Désolé, j'ai rencontré une erreur."
      });
      await saveMessageAndTrackMistakes(user.uid, {
        role: 'model',
        content: errorJson,
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [language, messages, user]);

  const handleReset = useCallback(async () => {
    if (user && window.confirm(t.resetConfirm)) {
      await clearUserMessages(user.uid);
      resetChatSession();
    }
  }, [t, user]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen language={language} onLoginSuccess={() => {}} />;
  }

  return (
    <div className={`flex flex-col h-full bg-slate-50 relative font-sans ${isRtl ? 'font-arabic' : ''}`}>
      <Header onReset={handleReset} language={language} setLanguage={setLanguage} />

      <main className="flex-1 overflow-y-auto">
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
          profile && <BrainDashboard profile={profile} language={language} />
        )}
      </main>

      {/* Navigation & Input */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
        {activeTab === 'practice' && (
          <InputArea onSend={handleSendMessage} isLoading={isLoading} language={language} />
        )}
        
        <nav className="flex justify-around items-center h-16 max-w-2xl mx-auto px-4">
          <button 
            onClick={() => setActiveTab('practice')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'practice' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MessageSquare size={20} fill={activeTab === 'practice' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.tabPractice}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('brain')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'brain' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Brain size={20} fill={activeTab === 'brain' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.tabBrain}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
