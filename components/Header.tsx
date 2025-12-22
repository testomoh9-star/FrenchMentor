
import React from 'react';
import { Languages, RefreshCw, ChevronDown, Zap, MessageSquare, Brain } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface HeaderProps {
  onReset: () => void;
  language: SupportLanguage;
  setLanguage: (lang: SupportLanguage) => void;
  sparks: number;
  activeTab: 'practice' | 'brain';
  setActiveTab: (tab: 'practice' | 'brain') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onReset, 
  language, 
  setLanguage, 
  sparks, 
  activeTab, 
  setActiveTab 
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 z-50 flex items-center justify-between shadow-sm shrink-0 sticky top-0">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-200 shadow-lg">
          <Languages size={20} />
        </div>
        <h1 className="font-bold text-slate-900 text-lg tracking-tight hidden md:block">FrenchMentor</h1>
        <h1 className="font-bold text-slate-900 text-lg tracking-tight md:hidden">FM</h1>
      </div>
      
      {/* Center: Navigation Tabs (The "Web-First" look) */}
      <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button 
          onClick={() => setActiveTab('practice')}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all
            ${activeTab === 'practice' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline">{t.navPractice}</span>
        </button>
        <button 
          onClick={() => setActiveTab('brain')}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all
            ${activeTab === 'brain' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <Brain size={16} />
          <span className="hidden sm:inline">{t.navBrain}</span>
        </button>
      </nav>

      {/* Right: Actions */}
      <div className={`flex items-center gap-2 sm:gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Sparks Badge */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-2 sm:px-3 py-1.5 rounded-full border border-orange-100 text-orange-600 shadow-sm transition-all group">
          <Zap size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm font-bold">{sparks}</span>
        </div>

        {/* Language Selector */}
        <div className="relative group">
          <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-slate-50 transition-all shadow-sm">
            <span className="text-xs sm:text-sm font-medium text-slate-700">{language}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </div>
          
          <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-1 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2`}>
            {(['English', 'French', 'Arabic'] as SupportLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 transition-colors ${language === lang ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700'} ${isRtl ? 'text-right' : 'text-left'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button 
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title={t.resetConfirm}
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
