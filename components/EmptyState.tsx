
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
    <div className={`flex flex-col items-center justify-center text-center px-6 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-blue-600 p-6 rounded-3xl mb-8 shadow-xl shadow-blue-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
        <MessageSquarePlus size={48} className="text-white" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t.subtitle}</h2>
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed text-lg">
        {t.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {t.suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className={`
              text-sm p-5 rounded-2xl border border-slate-200 bg-white shadow-sm
              hover:border-blue-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
              transition-all text-slate-700 font-medium
              ${isRtl ? 'text-right' : 'text-left'}
            `}
          >
            <span className="opacity-40 block mb-1">Suggest...</span>
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
