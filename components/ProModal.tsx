
import React from 'react';
import { X, CheckCircle2, Zap, Brain, Volume2, Crown } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface ProModalProps {
  language: SupportLanguage;
  onClose: () => void;
  onUpgrade: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ language, onClose, onUpgrade }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 sm:p-10 text-white text-center relative overflow-hidden">
          <button 
            onClick={onClose}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 hover:bg-white/20 rounded-full transition-colors`}
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-4 rounded-3xl mb-6 shadow-xl backdrop-blur-sm">
              <Crown size={48} className="text-white fill-white/20" />
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">{t.upgradeTitle}</h2>
            <p className="text-white/80 text-sm max-w-[250px] mx-auto leading-relaxed">
              {t.upgradeDesc}
            </p>
          </div>

          {/* Decorative background circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Benefits Section */}
        <div className="p-8 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                 <Zap size={20} fill="currentColor" />
               </div>
               <div>
                 <p className="font-bold text-slate-900 text-sm">{t.upgradeUnlimitedSparks}</p>
                 <p className="text-xs text-slate-500">No more waiting for refills.</p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="bg-violet-100 p-2.5 rounded-xl text-violet-600">
                 <Brain size={20} />
               </div>
               <div>
                 <p className="font-bold text-slate-900 text-sm">{t.upgradeFullBrain}</p>
                 <p className="text-xs text-slate-500">Detailed insights into your common pitfalls.</p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                 <Volume2 size={20} />
               </div>
               <div>
                 <p className="font-bold text-slate-900 text-sm">{t.upgradeAudio}</p>
                 <p className="text-xs text-slate-500">High-quality native French voices.</p>
               </div>
            </div>
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 sm:py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t.upgradeButton}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Cancel anytime • 7-day free trial
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
