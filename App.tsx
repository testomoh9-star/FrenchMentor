import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, SupportLanguage, ModelID } from './types';
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
  const [selectedModel, setSelectedModel] = useState<ModelID>('gemini-flash-lite-latest');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
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
      const jsonResponse = await sendMessageToGemini(content, language, selectedModel);
      
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
         correctedFrench: "Désolé",
         englishTranslation: "Error encountered",
         corrections: [],
         tutorNotes: "I encountered a technical issue. This might be due to a model error or rate limiting. Please try again or switch models."
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
  }, [language, selectedModel]);

  const handleReset = useCallback(() => {
    if (window.confirm("Start a new session? (History will be cleared)")) {
      setMessages([]);
      resetChatSession();
    }
  }, []);

  const handleModelChange = (model: ModelID) => {
    setSelectedModel(model);
    // Silent reset of backend session when model flips
    resetChatSession();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative font-sans">
      <Header 
        onReset={handleReset} 
        language={language} 
        setLanguage={setLanguage} 
        selectedModel={selectedModel}
        setSelectedModel={handleModelChange}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSendMessage} />
          ) : (
            <div className="pb-20">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                <div className="flex justify-center w-full my-8">
                  <div className="bg-white px-6 py-4 rounded-full shadow-sm border border-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span className="text-slate-600 font-medium">
                      {selectedModel.includes('pro') ? 'Expert Analysis...' : 'Improving your French...'}
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <InputArea onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;