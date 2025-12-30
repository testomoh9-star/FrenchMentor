
import React from 'react';
import { X, Check, Lightbulb, Lock, Crown } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface ProModalProps {
  language: SupportLanguage;
  onClose: () => void;
  onUpgrade: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ language, onClose, onUpgrade }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Feature list based on the new proposal
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
        className={`bg-white w-full max-w-[480px] rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10 flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-[2rem] font-black text-slate-900 leading-tight mb-2">
              Unlock LexiLift Pro
            </h2>
            <p className="text-slate-500 text-[1.125rem] font-medium leading-snug max-w-[320px] mx-auto">
              Learn faster. Fix mistakes once. Speak with confidence.
            </p>
          </div>

          {/* Features Card */}
          <div className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8">
            <ul className="space-y-4 mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" strokeWidth={4} />
                  </div>
                  <span className="text-slate-700 text-[1rem] font-bold leading-tight">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Value Hint Box */}
            <div className="bg-blue-50/80 rounded-2xl p-4 flex gap-3 items-start border border-blue-100/50">
              <div className="mt-0.5 text-yellow-500 shrink-0">
                <Lightbulb size={20} fill="currentColor" className="opacity-40" />
              </div>
              <p className="text-blue-900 text-sm font-bold leading-tight">
                <span className="text-blue-600">Pro</span> users improve faster by fixing repeated mistakes automatically.
              </p>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-black text-slate-900">$3</span>
              <span className="text-xl font-bold text-slate-500">/ month</span>
            </div>
            <p className="text-slate-400 text-sm font-bold mt-1 tracking-tight">
              Cancel anytime • No commitment
            </p>
          </div>

          {/* CTA Button */}
          <div className="w-full space-y-4">
            <button 
              onClick={onUpgrade}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Upgrade to Pro
            </button>
            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[0.75rem] uppercase tracking-widest">
              <Lock size={12} fill="currentColor" className="opacity-40" />
              Secure payment
            </div>
          </div>

          {/* Comparison Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 w-full text-center">
             <p className="text-slate-500 font-bold text-[0.875rem]">
               Free: <span className="text-slate-900">5 corrections/day</span> • <span className="text-blue-600 font-black">Pro</span>: Practice without limits
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
