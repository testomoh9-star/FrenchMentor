
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  language: SupportLanguage;
  sparks: number;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, language, sparks }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const hasEnoughSparks = sparks >= 2;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading && hasEnoughSparks) {
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shadow-lg safe-bottom">
      <div className="max-w-2xl mx-auto flex flex-col gap-1.5 sm:gap-2">
        <form 
          onSubmit={handleSubmit} 
          className={`relative flex items-end gap-1.5 sm:gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasEnoughSparks ? t.placeholder : "Out of sparks..."}
            className={`w-full bg-transparent border-0 focus:ring-0 resize-none text-slate-800 placeholder-slate-400 py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base max-h-[120px] overflow-y-auto min-h-[40px] ${isRtl ? 'text-right' : 'text-left'}`}
            rows={1}
            disabled={isLoading || !hasEnoughSparks}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading || !hasEnoughSparks}
            className={`
              flex flex-col items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm whitespace-nowrap min-w-fit
              ${text.trim() && !isLoading && hasEnoughSparks
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base">{t.button}</span>
              {!text.trim() && <Sparkles size={14} className="sm:w-4 sm:h-4" />}
            </div>
            {hasEnoughSparks && (
              <span className="text-[8px] sm:text-[9px] font-bold opacity-80 flex items-center gap-0.5 mt-0.5 hidden sm:flex">
                COST 2 <Zap size={8} fill="currentColor" />
              </span>
            )}
          </button>
        </form>
        {!hasEnoughSparks && (
          <p className="text-center text-[9px] sm:text-[10px] text-orange-500 font-bold uppercase tracking-wider animate-pulse">
            Wait for tomorrow or Upgrade
          </p>
        )}
      </div>
    </div>
  );
};

export default InputArea;
