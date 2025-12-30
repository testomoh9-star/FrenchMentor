
import React from 'react';
import { X, Check, Lightbulb, Lock } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface ProModalProps {
  language: SupportLanguage;
  onClose: () => void;
  onUpgrade: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ language, onClose, onUpgrade }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Feature list
  const features = [
    "1000 corrections per month",
    "Perfect AI pronunciation",
    "Deep grammar explanations (Deep Dive)",
    "Full access to \"My Brain\" (patterns & missions)",
    "Save lessons & mistakes to your library"
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-[440px] rounded-[2rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-20"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-[1.75rem] font-black text-slate-900 leading-tight mb-1.5">
              Unlock LexiLift Pro
            </h2>
            <p className="text-slate-500 text-[1rem] font-medium leading-snug max-w-[300px] mx-auto">
              Learn faster. Fix mistakes once. Speak with confidence.
            </p>
          </div>

          {/* Features Card */}
          <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 sm:p-6 mb-6">
            <ul className="space-y-3.5 mb-5">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" strokeWidth={4} />
                  </div>
                  <span className="text-slate-700 text-[0.935rem] font-bold leading-tight">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Value Hint Box */}
            <div className="bg-indigo-50/50 rounded-xl p-3.5 flex gap-3 items-start border border-indigo-100/50">
              <div className="mt-0.5 text-yellow-500 shrink-0">
                <Lightbulb size={18} fill="currentColor" className="opacity-40" />
              </div>
              <p className="text-indigo-900 text-[0.815rem] font-bold leading-snug">
                <span className="text-indigo-600">Pro</span> users improve faster by fixing repeated mistakes automatically.
              </p>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-black text-slate-900">$2.99</span>
              <span className="text-lg font-bold text-slate-500">/ month</span>
            </div>
            <p className="text-slate-400 text-[0.75rem] font-bold mt-0.5 tracking-tight">
              Cancel anytime • No commitment
            </p>
          </div>

          {/* CTA Button */}
          <div className="w-full space-y-3.5">
            <button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Upgrade to Pro
            </button>
            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[0.7rem] uppercase tracking-widest">
              <Lock size={10} fill="currentColor" className="opacity-40" />
              Secure payment
            </div>
          </div>

          {/* Comparison Footer */}
          <div className="mt-8 pt-5 border-t border-slate-100 w-full text-center">
             <p className="text-slate-500 font-bold text-[0.8rem]">
               Free: <span className="text-slate-900">5 corrections/day</span> • <span className="text-indigo-600 font-black">Pro</span>: Practice without limits
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
