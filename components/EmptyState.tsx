
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

  // Vibrant, Modern Hero Icon designed to balance with the LexiLift Logo
  const LexiHeroIcon = () => (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-10 group flex items-center justify-center">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-150 group-hover:bg-blue-400/20 transition-all duration-1000 ease-in-out"></div>
      
      <svg 
        viewBox="0 0 160 160" 
        className="relative z-10 w-full h-full drop-shadow-[0_20px_40px_rgba(55,100,200,0.3)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bubble-grad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3377d0"/>
            <stop offset="1" stopColor="#3762cc"/>
          </linearGradient>
          <filter id="inner-glow">
            <feFlood floodColor="white" floodOpacity="0.25" result="color"/>
            <feComposite in="color" in2="SourceGraphic" operator="in" result="glow"/>
            <feGaussianBlur in="glow" stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* The "Vibrant" Message Bubble */}
        <rect 
          x="20" y="20" width="120" height="120" rx="40" 
          fill="url(#bubble-grad)"
          filter="url(#inner-glow)"
        />
        
        {/* Chat Tail - Stylized */}
        <path 
          d="M60 140L40 155V135" 
          fill="#3762cc"
        />

        {/* Modern Plus Sign with depth */}
        <g stroke="white" strokeWidth="12" strokeLinecap="round">
          <line x1="80" y1="55" x2="80" y2="105" />
          <line x1="55" y1="80" x2="105" y2="80" />
        </g>

        {/* Accent Sparkles - Matching the LexiLift 'AI' feel */}
        <circle cx="130" cy="35" r="5" fill="#3296ce" className="animate-pulse" />
        <circle cx="25" cy="110" r="3" fill="#3476d0" />
      </svg>

      {/* Outer Floating Accents */}
      <div className="absolute -top-2 -right-2 bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 animate-bounce delay-150">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3377d0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <LexiHeroIcon />

      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">{t.subtitle}</h2>
      <p className="text-slate-500 max-w-lg mb-10 sm:mb-12 text-base sm:text-xl font-medium leading-relaxed">
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
