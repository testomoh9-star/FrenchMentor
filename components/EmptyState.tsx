
import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  language: SupportLanguage;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 sm:px-6 py-6 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-blue-600 p-5 sm:p-6 rounded-[2rem] mb-6 sm:mb-8 shadow-2xl shadow-blue-100 transform -rotate-2 hover:rotate-0 transition-all">
        <MessageSquarePlus size={40} className="text-white" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{t.subtitle}</h2>
      <p className="text-slate-500 max-w-md mb-8 sm:mb-10 text-base sm:text-lg">
        {t.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {t.suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className={`text-xs sm:text-sm p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-slate-600 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
