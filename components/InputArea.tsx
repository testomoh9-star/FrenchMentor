import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  language: SupportLanguage;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, language }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-2xl mx-auto relative">
        <form 
          onSubmit={handleSubmit} 
          className={`relative flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            className={`w-full bg-transparent border-0 focus:ring-0 resize-none text-slate-800 placeholder-slate-400 py-3 px-3 max-h-[150px] overflow-y-auto min-h-[50px] ${isRtl ? 'text-right' : 'text-left'}`}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm whitespace-nowrap
              ${isRtl ? 'flex-row-reverse' : 'flex-row'}
              ${text.trim() && !isLoading 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <span>{t.button}</span>
            {!text.trim() && <Sparkles size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;