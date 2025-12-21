import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, SupportLanguage, UI_TRANSLATIONS } from './types';
import { sendMessageToGemini, resetChatSession } from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<SupportLanguage>('English');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const jsonResponse = await sendMessageToGemini(content, language);
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: jsonResponse,
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
      
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
  }, [language]);

  const handleReset = useCallback(() => {
    if (window.confirm(t.resetConfirm)) {
      setMessages([]);
      resetChatSession();
    }
  }, [t]);

  return (
    <div className={`flex flex-col h-full bg-slate-50 relative font-sans ${isRtl ? 'font-arabic' : ''}`}>
      <Header onReset={handleReset} language={language} setLanguage={setLanguage} />

      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSendMessage} language={language} />
          ) : (
            <div className="pb-20">
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
      </main>

      <InputArea onSend={handleSendMessage} isLoading={isLoading} language={language} />
    </div>
  );
};

export default App;