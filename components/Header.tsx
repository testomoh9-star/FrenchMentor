
import React from 'react';
import { Zap, MessageSquare, Brain, Crown, Menu, LogIn, UserPlus, Lock } from 'lucide-react';
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
  isAuthenticated: boolean;
  onSignupClick: () => void;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  language, 
  sparks, 
  activeTab, 
  setActiveTab,
  isPro,
  hasNotifications,
  isSidebarExpanded,
  onToggleSidebar,
  isAuthenticated,
  onSignupClick,
  onLoginClick
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Official Logo Assets
  const LexiBranding = () => {
    const commonDefs = (
      <defs>
        <linearGradient id="header-linear-gradient" x1="149.72" y1="1.2" x2="209.74" y2="98.31" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3377d0"/>
          <stop offset="1" stopColor="#3762cc"/>
        </linearGradient>
        <linearGradient id="header-linear-gradient-2" x1="83.73" y1="65" x2="141.96" y2="150.33" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3296ce"/>
          <stop offset=".5" stopColor="#3288ce"/>
          <stop offset="1" stopColor="#3476d0"/>
        </linearGradient>
      </defs>
    );

    const textPath = (
      <g id="Text" fill="#0f172a">
        <path d="M276.34,72.87h24.83c6.87,0,10.66,2.95,10.66,8.58s-3.8,8.58-10.66,8.58h-34.91c-5.7,0-9.64-3.71-9.64-8.58V9.73c0-6.15,3.21-9.09,9.64-9.09s10.08,3.2,10.08,9.22v63.01Z"/>
        <path d="M335.79,64.16c1.31,7.17,9.35,11.27,17.53,11.27,4.09,0,8.03-.9,11.54-3.33,2.48-1.54,4.24-2.3,7.3-2.3,4.24,0,8.47,3.2,8.47,7.81,0,3.46-3.07,6.28-6.57,8.32-5.26,3.2-11.69,5.25-21.77,5.25-19.43,0-35.35-13.83-35.35-31.25s15.92-31.25,35.35-31.25c20.6,0,33.45,14.09,33.45,25.74,0,6.15-4.53,9.73-11.98,9.73h-37.98ZM335.64,53.02h31.99c-1.75-6.79-8.33-9.48-15.19-9.48-7.6,0-14.02,2.69-16.8,9.48Z"/>
        <path d="M412.18,85.29c-2.04,3.84-5.26,5.38-8.47,5.38-5.26,0-9.49-3.46-9.49-7.81,0-1.67.44-3.2,1.75-5.12l13.29-19.08-11.54-15.75c-1.31-1.79-1.9-3.59-1.9-5.25,0-4.48,4.24-7.81,8.91-7.81,3.21,0,6.57,1.54,8.91,5.51l6.72,11.65,6.13-11.65c2.04-3.84,5.41-5.51,8.62-5.51,4.67,0,9.35,3.46,9.35,8.07,0,1.54-.58,3.2-1.75,4.87l-11.69,16.52,12.85,18.7c1.17,1.67,1.61,3.2,1.61,4.61,0,4.61-4.67,8.07-9.5,8.07-3.07,0-6.14-1.41-8.18-5l-8.03-14.47-7.6,14.09Z"/>
        <path d="M477.03,14.73c0,6.15-5.55,9.61-10.37,9.61-6.57,0-10.81-3.46-10.81-9.61,0-5.25,4.24-9.22,10.81-9.22,4.82,0,10.37,3.97,10.37,9.22ZM476.16,82.22c0,5.64-2.92,8.33-9.2,8.33s-9.2-2.69-9.2-8.33v-43.54c0-5.89,2.92-8.71,9.06-8.71s9.35,2.82,9.35,8.71v43.54Z"/>
        <path d="M507.12,72.87h24.83c6.87,0,10.66,2.95,10.66,8.58s-3.8,8.58-10.66,8.58h-34.91c-5.7,0-9.64-3.71-9.64-8.58V9.73c0-6.15,3.21-9.09,9.64-9.09s10.08,3.2,10.08,9.22v63.01Z"/>
        <path d="M570.37,14.73c0,6.15-5.55,9.61-10.37,9.61-6.57,0-10.81-3.46-10.81-9.61,0-5.25,4.24-9.22,10.81-9.22,4.82,0,10.37,3.97,10.37,9.22ZM569.49,82.22c0,5.64-2.92,8.33-9.2,8.33s-9.2-2.69-9.2-8.33v-43.54c0-5.89,2.92-8.71,9.06-8.71s9.35,2.82,9.35,8.71v43.54Z"/>
        <path d="M605.27,30.48h6.43c4.97,0,7.45,2.05,7.45,6.27s-2.48,6.15-7.45,6.15h-6.43v39.32c0,5.51-3.07,8.45-9.2,8.45s-9.35-2.95-9.35-8.45v-39.32c-4.53-.13-6.72-2.18-6.72-6.15s2.19-6.02,6.72-6.27v-10.12c0-11.53,9.35-20.36,23.66-20.36,12.56,0,22.2,6.92,22.2,16.52,0,4.74-4.24,7.81-8.47,7.81-2.92,0-5.84-1.41-7.45-4.61-1.02-2.18-2.92-3.84-5.99-3.84s-5.4,1.92-5.4,4.99v9.61Z"/>
        <path d="M658.59,42.9v39.45c0,5.63-3.21,8.32-9.35,8.32s-9.35-2.69-9.35-8.32v-39.45h-4.09c-4.97,0-7.45-2.05-7.45-6.15s2.48-6.27,7.45-6.27h4.09v-9.48c0-5.76,3.21-8.71,9.35-8.71s9.35,2.82,9.35,8.71v9.48h5.26c4.97,0,7.45,2.05,7.45,6.27s-2.48,6.15-7.45,6.15h-5.26Z"/>
      </g>
    );

    return (
      <div className="flex items-center gap-1 sm:gap-2 h-7 sm:h-9">
        <svg viewBox="0 0 671.29 169.23" className="h-full w-auto hidden sm:block">
          {commonDefs}
          <g id="Icon">
            <rect x="0" y="124.54" width="85.39" height="42.37" rx="21.18" ry="21.18" fill="#379cd0"/>
            <path d="M130.44,0h63.84c3.35,0,6.68.61,9.72,1.9s6.06,3.11,8.64,5.99c1.96,2.19,3.18,4.47,3.95,6.48.89,2.31,1.3,4.76,1.3,7.21v81.85c-.28,11.35-8.46,20.62-18.38,22.44-12.25,2.26-26.44-6.98-28.15-21.41-.08-.69-.1-1.38-.1-2.08v-33.98c0-5.1-1.86-10.06-5.36-14-3.3-3.71-7.49-6.96-12.2-9.15-3.22-1.5-6.82-2.19-10.42-2.19h-12.95c-7.04,0-13.84-2.77-18.31-7.81-2.86-3.23-4.94-7.26-5.38-11.91-.22-2.37,0-4.73.6-7.01,2.6-9.72,12.37-16.34,23.2-16.34Z" fill="url(#header-linear-gradient)"/>
            <path d="M65.99,63.11h62.26c3.27,0,6.51.61,9.48,1.89,2.86,1.23,5.91,3.1,8.42,5.96,1.27,1.44,2.21,2.92,2.93,4.34,1.5,2.98,2.19,6.25,2.19,9.53l-.78,61.75c-.27,11.29-8.25,20.51-17.92,22.33-11.93,2.24-25.76-6.93-27.45-21.26-.08-.71-.1-1.43-.1-2.15.06-4.45.12-8.91.18-13.36.07-2.29-.06-8.63-4.62-14.9-.92-1.26-4.86-5.77-11.9-9.1-3.14-1.49-6.65-2.18-10.17-2.18h-12.63c-6.87,0-13.5-2.76-17.85-7.77-2.79-3.21-4.82-7.22-5.25-11.85-.22-2.35,0-4.71.59-6.98,2.53-9.67,12.06-16.26,22.62-16.26Z" fill="url(#header-linear-gradient-2)"/>
          </g>
          {textPath}
        </svg>

        <svg viewBox="250 0 421.29 169.23" className="h-full w-auto block sm:hidden">
          {commonDefs}
          {textPath}
        </svg>

        {isAuthenticated && isPro && (
          <span className="flex-shrink-0 mb-auto text-[7px] sm:text-[8px] font-black text-white bg-gradient-to-r from-cyan-400 to-indigo-500 px-1 sm:px-1.5 py-0.5 rounded shadow-sm">
            <Crown size={6} fill="currentColor" className="inline mr-0.5 sm:mr-1" /> {t.proLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-2 sm:px-4 py-2 sm:py-2.5 z-50 flex items-center justify-between shadow-sm shrink-0 sticky top-0 safe-top">
      <div className={`flex items-center gap-1 sm:gap-3 min-w-0 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {isAuthenticated && !isSidebarExpanded && (
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center justify-center"
          >
            <Menu size={18} className="sm:w-5 sm:h-5" />
          </button>
        )}

        <LexiBranding />
      </div>
      
      <nav className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 mx-1 sm:mx-2 shrink-0">
        <button 
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t.navPractice}</span>
        </button>
        <button 
          onClick={() => setActiveTab('brain')}
          className={`relative flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-sm font-bold transition-all ${activeTab === 'brain' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Brain size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t.navBrain}</span>
          {!isAuthenticated && (
             <div className="absolute -top-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                <Lock size={10} className="text-slate-400" />
             </div>
          )}
          {isAuthenticated && hasNotifications && activeTab !== 'brain' && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500 border-2 border-slate-100 shadow-sm"></span>
          )}
        </button>
      </nav>

      <div className={`flex items-center gap-1.5 sm:gap-3 shrink-0 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {!isAuthenticated ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={onLoginClick}
              className="px-2.5 sm:px-4 py-2 text-[10px] sm:text-sm font-black text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <LogIn size={14} className="hidden sm:inline" /> {t.login}
            </button>
            <button 
              onClick={onSignupClick}
              className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] sm:text-sm font-black hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
            >
              <UserPlus size={14} className="hidden sm:inline" /> {t.signup}
            </button>
          </div>
        ) : (
          <div className="relative group">
            <div className={`flex items-center gap-1 px-1.5 sm:px-3 py-1.5 rounded-full border shadow-sm transition-all ${isPro ? 'bg-cyan-50 border-cyan-100 text-indigo-700' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                <Zap size={10} fill="currentColor" className={`sm:w-3 sm:h-3 ${isPro ? 'text-cyan-500' : 'text-blue-600'}`} />
                <span className="text-[10px] sm:text-sm font-black">{sparks}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
