
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-[420px] lg:max-w-[480px] max-h-[94vh] sm:h-auto rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close Button - Sticky at top */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-30 bg-white/80 backdrop-blur-sm shadow-sm sm:shadow-none"
        >
          <X size={18} />
        </button>

        {/* Scrollable Content Container - Scrollbar is now hidden via global CSS */}
        <div className="overflow-y-auto p-5 sm:p-10 flex flex-col items-center scrollbar-hide">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 pt-2">
            <h2 className="text-2xl sm:text-[2rem] font-black text-slate-900 leading-tight mb-2">
              Unlock LexiLift Pro
            </h2>
            <p className="text-slate-500 text-sm sm:text-[1.1rem] font-medium leading-snug max-w-[280px] sm:max-w-[340px] mx-auto">
              Learn faster. Fix mistakes once. Speak with confidence.
            </p>
          </div>

          {/* Features Card */}
          <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
            <ul className="space-y-4 mb-5 sm:mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
                    <Check size={11} className="text-white" strokeWidth={4} />
                  </div>
                  <span className="text-slate-700 text-xs sm:text-[1rem] font-bold leading-tight">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Value Hint Box */}
            <div className="bg-indigo-50/50 rounded-2xl p-4 flex gap-3 items-start border border-indigo-100/50">
              <div className="mt-0.5 text-yellow-500 shrink-0">
                <Lightbulb size={18} fill="currentColor" className="opacity-40" />
              </div>
              <p className="text-indigo-900 text-[0.8rem] sm:text-[0.875rem] font-bold leading-relaxed">
                <span className="text-indigo-600">Pro</span> users improve faster by fixing repeated mistakes automatically.
              </p>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">$2.99</span>
              <span className="text-lg sm:text-xl font-bold text-slate-500">/ month</span>
            </div>
            <p className="text-slate-400 text-[0.75rem] sm:text-[0.85rem] font-bold mt-1 tracking-tight">
              Cancel anytime • No commitment
            </p>
          </div>

          {/* CTA Button */}
          <div className="w-full space-y-4 mb-8 sm:mb-10">
            <button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Upgrade to Pro
            </button>
            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[0.7rem] sm:text-[0.8rem] uppercase tracking-widest">
              <Lock size={12} fill="currentColor" className="opacity-40" />
              Secure payment
            </div>
          </div>

          {/* Comparison Footer */}
          <div className="mt-auto pt-6 border-t border-slate-100 w-full text-center">
             <p className="text-slate-500 font-bold text-[0.85rem] sm:text-[0.95rem]">
               Free: <span className="text-slate-900">5/day</span> • <span className="text-indigo-600 font-black">Pro</span>: Practice without limits
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
