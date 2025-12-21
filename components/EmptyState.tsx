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
    <div className={`flex flex-col items-center justify-center h-full text-center px-6 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-indigo-50 p-6 rounded-full mb-6 animate-fade-in-up">
        <MessageSquarePlus size={48} className="text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">{t.subtitle}</h2>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        {t.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {t.suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className={`text-sm p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-slate-700 ${isRtl ? 'text-right' : 'text-left'}`}
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;