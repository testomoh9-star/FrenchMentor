
import React, { useState } from 'react';
import { X, Globe, MessageSquare, Languages, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { SystemLanguage, SupportLanguage, UI_TRANSLATIONS } from '../types';

interface SettingsModalProps {
  language: SystemLanguage;
  aiLang: SupportLanguage;
  translationLang: SupportLanguage;
  onClose: () => void;
  onSetSystemLang: (lang: SystemLanguage) => void;
  onSetAiLang: (lang: SupportLanguage) => void;
  onSetTranslationLang: (lang: SupportLanguage) => void;
  onResetBrain?: () => Promise<void>;
  isAuthenticated?: boolean | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  language, aiLang, translationLang, onClose, onSetSystemLang, onSetAiLang, onSetTranslationLang, onResetBrain, isAuthenticated
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!onResetBrain) return;
    setIsResetting(true);
    await onResetBrain();
    setIsResetting(false);
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900">{t.settings}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
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
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${aiLang === lang ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>

          {/* Translation Language */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Languages size={16} className="text-green-500" />
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Translation Language</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['French', 'English', 'Arabic'] as SupportLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onSetTranslationLang(lang)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${translationLang === lang ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-green-200'}`}
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
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${language === lang ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>

          {/* Reset Brain - Only for Authenticated Users */}
          {isAuthenticated && (
            <section className="pt-6 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-4">
                  <Trash2 size={16} className="text-red-500" />
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Linguistic History</label>
               </div>
               
               {showResetConfirm ? (
                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3 mb-4">
                       <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                       <p className="text-xs font-bold text-red-900 leading-relaxed">
                          Resetting your brain will wipe all recorded linguistic patterns, missions, and archived lessons. This cannot be undone.
                       </p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={handleReset}
                        disabled={isResetting}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                       >
                         {isResetting ? <Loader2 size={14} className="animate-spin" /> : "Reset Forever"}
                       </button>
                       <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl text-xs font-black hover:bg-red-50"
                       >
                         Cancel
                       </button>
                    </div>
                 </div>
               ) : (
                 <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-100 bg-red-50/30 hover:bg-red-50 text-red-600 transition-all group"
                 >
                    <span className="text-xs font-bold">Reset Linguistic Brain</span>
                    <Trash2 size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                 </button>
               )}
            </section>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-slate-200"
          >
            {isRtl ? 'حفظ' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
