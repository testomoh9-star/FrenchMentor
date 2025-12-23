
import React from 'react';
import { Languages, RefreshCw, ChevronDown, Zap, MessageSquare, Brain, Crown } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface HeaderProps {
  onReset: () => void;
  language: SupportLanguage;
  setLanguage: (lang: SupportLanguage) => void;
  sparks: number;
  activeTab: 'practice' | 'brain';
  setActiveTab: (tab: 'practice' | 'brain') => void;
  isPro?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onReset, 
  language, 
  setLanguage, 
  sparks, 
  activeTab, 
  setActiveTab,
  isPro
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-3 z-50 flex items-center justify-between shadow-sm shrink-0 sticky top-0 safe-top">
      {/* Left: Branding */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-fit">
        <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white shadow-blue-200 shadow-md">
          <Languages size={18} />
        </div>
        <div className="hidden sm:flex flex-col">
          <h1 className="font-black text-slate-900 text-base leading-tight">FrenchMentor</h1>
          {isPro && (
            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded flex items-center gap-0.5 w-fit">
              <Crown size={8} fill="currentColor" /> {t.proLabel}
            </span>
          )}
        </div>
        <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight sm:hidden">FM</h1>
      </div>
      
      {/* Center: Navigation Tabs */}
      <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mx-1 sm:mx-2">
        <button 
          onClick={() => setActiveTab('practice')}
          className={`
            flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all
            ${activeTab === 'practice' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <MessageSquare size={16} />
          <span className="hidden md:inline">{t.navPractice}</span>
        </button>
        <button 
          onClick={() => setActiveTab('brain')}
          className={`
            flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all relative
            ${activeTab === 'brain' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <Brain size={16} />
          <span className="hidden md:inline">{t.navBrain}</span>
          {!isPro && <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />}
        </button>
      </nav>

      {/* Right: Actions */}
      <div className={`flex items-center gap-1.5 sm:gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Sparks Badge */}
        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full border shadow-sm group ${isPro ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
          <Zap size={12} fill="currentColor" className="group-hover:scale-110 transition-transform sm:w-3.5 sm:h-3.5" />
          <span className="text-[11px] sm:text-sm font-black">{isPro ? '∞' : sparks}</span>
        </div>

        {/* Language Selector */}
        <div className="relative group">
          <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition-all shadow-sm">
            <span className="text-[11px] sm:text-sm font-medium text-slate-700">{language.substring(0, 3)}</span>
            <ChevronDown size={10} className="text-slate-400 sm:w-3 sm:h-3" />
          </div>
          
          <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-1 w-28 sm:w-32 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2`}>
            {(['English', 'French', 'Arabic'] as SupportLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-3 sm:px-4 py-2 text-[11px] sm:text-sm hover:bg-slate-50 transition-colors ${language === lang ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700'} ${isRtl ? 'text-right' : 'text-left'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button 
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
