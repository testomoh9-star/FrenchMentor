
import React from 'react';
import { Zap, MessageSquare, Brain, Crown, Menu, Plus } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS } from '../types';

interface HeaderProps {
  language: SystemLanguage;
  sparks: number;
  activeTab: 'practice' | 'brain';
  setActiveTab: (tab: 'practice' | 'brain') => void;
  isPro?: boolean;
  hasNotifications?: boolean;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  language, 
  sparks, 
  activeTab, 
  setActiveTab,
  isPro,
  hasNotifications,
  isSidebarExpanded,
  onToggleSidebar
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // The LexiLift Ascending Steps Logo
  const LexiLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lexiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa' }} />
          <stop offset="100%" style={{ stopColor: '#2563eb' }} />
        </linearGradient>
      </defs>
      {/* Step 1: Bottom left horizontal pill */}
      <rect x="25" y="70" width="25" height="12" rx="6" fill="url(#lexiGrad)" />
      {/* Step 2: Middle L-shape */}
      <path d="M45 45H55C60.5228 45 65 49.4772 65 55V65C65 67.7614 62.7614 70 60 70C57.2386 70 55 67.7614 55 65V55H45C42.2386 55 40 52.7614 40 50C40 47.2386 42.2386 45 45 45Z" fill="url(#lexiGrad)" />
      {/* Step 3: Top right L-shape */}
      <path d="M60 20H75C80.5228 20 85 24.4772 85 30V55C85 57.7614 82.7614 60 80 60C77.2386 60 75 57.7614 75 55V30H60C57.2386 30 55 27.7614 55 25C55 22.2386 57.2386 20 60 20Z" fill="url(#lexiGrad)" />
    </svg>
  );

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 z-50 flex items-center justify-between shadow-sm shrink-0 sticky top-0 safe-top">
      <div className={`flex items-center gap-2 sm:gap-3 min-w-fit ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Responsive Toggle Button */}
        {!isSidebarExpanded && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center justify-center mr-1"
          >
            <Menu size={20} />
          </button>
        )}

        <div className={`flex items-center gap-2 sm:gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="relative flex items-center justify-center">
            {/* The Logo positioned behind the text */}
            <LexiLogo className="absolute -left-1 -top-1 w-10 h-10 opacity-30 transform -rotate-6" />
            <div className="relative z-10 flex flex-col">
              <h1 className="font-black text-slate-900 text-base sm:text-lg leading-tight tracking-tight">LexiLift</h1>
              {isPro && (
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded flex items-center gap-0.5 w-fit">
                  <Crown size={8} fill="currentColor" /> {t.proLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mx-1 sm:mx-2">
        <button 
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare size={16} />
          <span className="hidden md:inline">{t.navPractice}</span>
        </button>
        <button 
          onClick={() => setActiveTab('brain')}
          className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'brain' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Brain size={16} />
          <span className="hidden md:inline">{t.navBrain}</span>
          {hasNotifications && activeTab !== 'brain' && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-slate-100 shadow-sm"></span>
          )}
        </button>
      </nav>

      <div className={`flex items-center gap-1.5 sm:gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="relative group">
           <div className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full border shadow-sm transition-all ${isPro ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              <Zap size={12} fill="currentColor" />
              <span className="text-[11px] sm:text-sm font-black">{sparks}</span>
           </div>
           
           {/* Buy more placeholder icon */}
           <button className="absolute -top-2 -right-1 bg-white border border-slate-200 rounded-full p-0.5 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-90">
             <Plus size={10} strokeWidth={3} />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
