
import React, { useMemo } from 'react';
import { SystemLanguage, UI_TRANSLATIONS } from '../types';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  language: SystemLanguage;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Randomly select 4 suggestions from the pool of 12
  const selectedSuggestions = useMemo(() => {
    const pool = [...t.suggestions];
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [language]);

  // Refined "French Identity" Hero Icon
  const LexiHeroIcon = () => (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-10 group flex items-center justify-center">
      {/* Static Background Glow (No animation for snappiness) */}
      <div className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full scale-150"></div>
      
      <svg 
        viewBox="0 0 160 160" 
        className="relative z-10 w-full h-full drop-shadow-[0_15px_30px_rgba(15,23,42,0.15)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="french-bubble-grad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0055A4"/> {/* Official French Blue */}
            <stop offset="1" stopColor="#003d7a"/>
          </linearGradient>
          
          <filter id="glass-shine">
            <feFlood floodColor="white" floodOpacity="0.2" result="light"/>
            <feComposite in="light" in2="SourceGraphic" operator="in"/>
            <feGaussianBlur stdDeviation="2"/>
          </filter>
        </defs>

        {/* Main Chat Bubble */}
        <rect 
          x="25" y="25" width="110" height="110" rx="36" 
          fill="url(#french-bubble-grad)"
        />
        
        {/* Chat Tail */}
        <path 
          d="M60 135L45 150V135" 
          fill="#003d7a"
        />

        {/* Minimal Plus / "Lift" Symbol */}
        <g stroke="white" strokeWidth="10" strokeLinecap="round">
          <line x1="80" y1="55" x2="80" y2="105" />
          <line x1="55" y1="80" x2="105" y2="80" />
        </g>
      </svg>

      {/* Premium French Badge (The Identity Marker) */}
      <div className="absolute top-0 right-0 bg-white p-1.5 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center transform translate-x-1 translate-y--1">
        <div className="flex w-10 h-10 rounded-xl overflow-hidden shadow-inner border border-slate-50">
           <div className="flex-1 bg-[#0055A4]"></div> {/* Blue */}
           <div className="flex-1 bg-white"></div>    {/* White */}
           <div className="flex-1 bg-[#EF4135]"></div> {/* Red */}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <LexiHeroIcon />

      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">{t.subtitle}</h2>
      <p className="text-slate-500 max-w-lg mb-10 sm:mb-12 text-base sm:text-lg font-medium leading-relaxed opacity-80">
        {t.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        {selectedSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className={`group text-xs sm:text-[13px] p-5 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-slate-600 font-bold ${isRtl ? 'text-right' : 'text-left'} flex items-center justify-between`}
          >
            <span className="flex-1">"{suggestion}"</span>
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
