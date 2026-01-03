
import React from 'react';
import { X, Check, Lightbulb, Lock, Send, Clock, CreditCard } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';

interface ProModalProps {
  language: SupportLanguage;
  onClose: () => void;
  onUpgrade: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ language, onClose }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Feature list
  const features = [
    "1000 corrections par mois",
    "Prononciation AI parfaite",
    "Analyses grammaticales profondes (Deep Dive)",
    "Accès complet au tableau de bord (patterns & missions)",
    "Bibliothèque de leçons et d'erreurs sauvegardée"
  ];

  const handleTelegramRedirect = () => {
    window.open('https://t.me/lexilift_pro_bot', '_blank');
  };

  // BaridiMob Logo representation (Yellow & Blue)
  const BaridiMobLogo = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fefce8] border border-yellow-200 rounded-lg shrink-0">
      <div className="flex flex-col leading-none">
        <span className="text-[#0055A4] font-black text-[10px] tracking-tighter">بريدي</span>
        <span className="text-[#facc15] font-black text-[10px] tracking-tighter -mt-0.5">موب</span>
      </div>
      <div className="w-px h-4 bg-slate-200" />
      <span className="text-slate-500 font-bold text-[8px] uppercase tracking-widest">Algérie Poste</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-[440px] lg:max-w-[500px] max-h-[94vh] sm:h-auto rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-30 bg-white/80 backdrop-blur-sm shadow-sm sm:shadow-none"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto p-5 sm:p-10 flex flex-col items-center scrollbar-hide">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 pt-2">
            <h2 className="text-3xl sm:text-[2.2rem] font-black leading-tight mb-2 bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
              LexiLift Pro
            </h2>
            <p className="text-slate-500 text-sm sm:text-[1rem] font-medium leading-snug max-w-[320px] mx-auto">
              Accédez à la pleine puissance de l'IA avec un paiement simplifié en Algérie.
            </p>
          </div>

          {/* Localized Price Block */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 mb-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">500</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-600">DZD</span>
            </div>
            <p className="text-slate-500 font-bold text-sm tracking-wide">par mois (Abonnement)</p>
          </div>

          {/* Features List */}
          <div className="w-full space-y-4 mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Avantages Inclus</h3>
            <div className="grid grid-cols-1 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-indigo-600" strokeWidth={4} />
                  </div>
                  <span className="text-slate-700 text-[0.85rem] sm:text-[0.95rem] font-bold leading-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BaridiMob Details Card */}
          <div className="w-full bg-indigo-50/30 border border-indigo-100 rounded-3xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Méthode de Paiement</h4>
               <BaridiMobLogo />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                  <CreditCard size={14} />
                </div>
                <p className="text-indigo-900 text-[0.85rem] font-black leading-tight">Paiement via BaridiMob (Algérie Poste)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-1.5 rounded-lg text-white">
                  <Clock size={14} />
                </div>
                <p className="text-indigo-900 text-[0.85rem] font-black leading-tight">Activation sous 24h après confirmation</p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-indigo-100/50 flex gap-3 items-start">
              <div className="mt-0.5 text-indigo-400 shrink-0">
                <Lightbulb size={16} fill="currentColor" className="opacity-20" />
              </div>
              <p className="text-indigo-800 text-[0.75rem] font-bold leading-relaxed opacity-80">
                Une fois le paiement effectué, envoyez votre reçu via Telegram pour une activation immédiate.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full space-y-4">
            <button 
              onClick={handleTelegramRedirect}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg sm:text-xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Continuer sur Telegram
            </button>
            <p className="text-center text-slate-400 font-bold text-[0.7rem] uppercase tracking-widest">
              Redirection sécurisée vers notre bot LexiLift
            </p>
          </div>

          {/* Future proof note */}
          <div className="mt-10 pt-6 border-t border-slate-100 w-full text-center">
             <p className="text-slate-400 font-bold text-[0.8rem] tracking-tight">
               Paiement international disponible prochainement.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
