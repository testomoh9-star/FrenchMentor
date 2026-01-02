
import React from 'react';
import { X, UserPlus, CheckCircle2, Zap, Brain, Sparkles } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS } from '../types';

interface SignupModalProps {
  language: SystemLanguage;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ language, onClose }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-30"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-8 relative">
             <UserPlus size={40} />
             <div className="absolute -top-1 -right-1 bg-gradient-to-br from-cyan-400 to-indigo-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                <Sparkles size={14} />
             </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-4 leading-tight">
            Unlock the Full Experience
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium text-center mb-8 leading-relaxed">
            Guests have reached their limit. Create a free account to unlock daily sparks, personalized tracking, and native pronunciation.
          </p>

          <div className="w-full space-y-3 mb-10">
            {[
              { icon: <Zap size={16} />, text: "8 Free Daily Sparks" },
              { icon: <Brain size={16} />, text: "Personalized 'My Brain' Dashboard" },
              { icon: <CheckCircle2 size={16} />, text: "Native TTS Pronunciation" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-blue-600">{item.icon}</div>
                <span className="text-slate-700 text-xs sm:text-sm font-bold">{item.text}</span>
              </div>
            ))}
          </div>

          <button 
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all mb-4"
            onClick={() => {
              // This is where real signup logic would go
              console.log("Redirect to signup");
            }}
          >
            {t.signup}
          </button>
          
          <button 
            className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            onClick={() => {
              console.log("Redirect to login");
            }}
          >
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
