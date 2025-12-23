
import React from 'react';
import { MessageSquarePlus, MapPin } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS, SCENARIOS } from '../types';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  onScenarioClick: (id: string) => void;
  language: SupportLanguage;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick, onScenarioClick, language }) => {
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

      {/* Scenarios / Missions */}
      <div className="w-full max-w-3xl mb-12">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-center gap-2">
           <MapPin size={14} /> {t.missionTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => onScenarioClick(s.id)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-indigo-50 hover:shadow-lg transition-all flex flex-col items-center gap-2 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{s.icon}</span>
              <span className="text-[10px] sm:text-[11px] font-black text-slate-700">{s.label[language]}</span>
            </button>
          ))}
        </div>
      </div>

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
