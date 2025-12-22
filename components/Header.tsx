
import React, { useState } from 'react';
import { Languages, RefreshCw, ChevronDown, LogOut, User } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';
import { auth, logout } from '../services/firebase';

interface HeaderProps {
  onReset: () => void;
  language: SupportLanguage;
  setLanguage: (lang: SupportLanguage) => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, language, setLanguage }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const currentUser = auth.currentUser;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Languages size={24} />
        </div>
        <h1 className="font-bold text-slate-900 text-xl tracking-tight hidden sm:block">FrenchMentor</h1>
      </div>
      
      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Language Selector */}
        <div className="relative group">
          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
            <span className="text-sm font-medium text-slate-700">{language}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          
          <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block`}>
            {(['English', 'French', 'Arabic'] as SupportLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${language === lang ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700'} ${isRtl ? 'text-right' : 'text-left'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title={t.resetConfirm}
        >
          <RefreshCw size={20} />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={18} />
              </div>
            )}
          </button>

          {showProfileMenu && (
            <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1`}>
              <div className="px-4 py-2 border-b border-slate-50">
                <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.displayName || 'User'}</p>
              </div>
              <button
                onClick={() => logout()}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
              >
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
