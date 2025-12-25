
import React from 'react';
import { Languages, Zap, MessageSquare, Brain, Crown, Menu, PanelLeft, Plus } from 'lucide-react';
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
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white shadow-blue-200 shadow-md hidden md:block">
            <Languages size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-slate-900 text-sm sm:text-base leading-tight">FrenchMentor</h1>
            {isPro && (
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded flex items-center gap-0.5 w-fit">
                <Crown size={8} fill="currentColor" /> {t.proLabel}
              </span>
            )}
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
