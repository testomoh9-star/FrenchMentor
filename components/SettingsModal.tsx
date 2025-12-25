
import React from 'react';
import { X, Globe, MessageSquare } from 'lucide-react';
import { SystemLanguage, SupportLanguage, UI_TRANSLATIONS } from '../types';

interface SettingsModalProps {
  language: SystemLanguage;
  aiLang: SupportLanguage;
  onClose: () => void;
  onSetSystemLang: (lang: SystemLanguage) => void;
  onSetAiLang: (lang: SupportLanguage) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  language, aiLang, onClose, onSetSystemLang, onSetAiLang
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900">{t.settings}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* AI Explanation Language */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-blue-500" />
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.aiExplainLang}</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['French', 'English', 'Arabic'] as SupportLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onSetAiLang(lang)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${aiLang === lang ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>

          {/* System UI Language */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-indigo-500" />
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.systemLang}</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['English', 'French', 'Arabic', 'Spanish'] as SystemLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onSetSystemLang(lang)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${language === lang ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
          >
            {isRtl ? 'حفظ' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
