
import React from 'react';
import { Languages, RefreshCw, ChevronDown, Zap } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface HeaderProps {
  onReset: () => void;
  language: SupportLanguage;
  setLanguage: (lang: SupportLanguage) => void;
  sparks: number;
}

const Header: React.FC<HeaderProps> = ({ onReset, language, setLanguage, sparks }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 z-50 flex items-center justify-between shadow-sm shrink-0">
      {/* Branding */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Languages size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-xl tracking-tight hidden sm:block">FrenchMentor</h1>
          <h1 className="font-bold text-slate-900 text-xl tracking-tight sm:hidden">FM</h1>
        </div>
      </div>
      
      {/* Actions */}
      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Sparks Badge */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 text-orange-600 shadow-sm transition-all animate-pulse">
          <Zap size={16} fill="currentColor" />
          <span className="text-sm font-bold">{sparks}</span>
        </div>

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
      </div>
    </header>
  );
};

export default Header;
