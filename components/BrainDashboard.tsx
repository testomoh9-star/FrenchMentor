
import React from 'react';
import { BrainStats, SupportLanguage, UI_TRANSLATIONS } from '../types';
import { Brain, Trophy, BarChart3, Clock, Lock, Crown, ArrowRight, PlayCircle } from 'lucide-react';

interface BrainDashboardProps {
  stats: BrainStats;
  language: SupportLanguage;
  isPro?: boolean;
  onUpgradeClick?: () => void;
  onReviewClick: () => void;
}

const BrainDashboard: React.FC<BrainDashboardProps> = ({ stats, language, isPro, onUpgradeClick, onReviewClick }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const totalCorrectionsNum = Number(stats.totalCorrections || 0);
  const accuracy = Math.max(40, 100 - (totalCorrectionsNum * 2));
  const hasHistory = stats.history && stats.history.length > 0;

  if (totalCorrectionsNum === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-blue-50 p-6 rounded-full mb-6"> <Brain size={48} className="text-blue-500" /> </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t.statsTitle}</h2>
        <p className="text-slate-500">{t.statsNoData}</p>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-8 animate-slide-in pb-24 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Accuracy & Review Hook */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-50/50 flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <Trophy size={20} className="text-yellow-500" />
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.statsAccuracy}</h2>
          </div>
          <p className="text-7xl font-black text-slate-900">{accuracy}%</p>
          
          {hasHistory && (
            <button 
              onClick={onReviewClick}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <PlayCircle size={18} /> {t.startReview}
            </button>
          )}
        </div>
        
        {!isPro && (
          <div className="bg-indigo-600 p-6 rounded-3xl text-white max-w-xs relative overflow-hidden group">
            <div className="relative z-10">
               <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black w-fit mb-3">{t.proLabel}</div>
               <h4 className="font-bold text-lg mb-4">Go Pro for full history.</h4>
               <button onClick={onUpgradeClick} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                 {t.getPro} <ArrowRight size={14} />
               </button>
            </div>
            <Crown size={120} className="absolute -bottom-8 -right-8 opacity-10 rotate-12" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Pitfalls */}
        <div className="relative">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${!isPro ? 'blur-md grayscale' : ''}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" /> {t.statsCommon}
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.categories).slice(0, 5).map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{category}</span>
                    <span className="text-slate-400">{count} errors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${(Number(count) / totalCorrectionsNum) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isPro && <div className="absolute inset-0 flex items-center justify-center z-10 font-bold text-indigo-600 uppercase tracking-widest text-sm bg-white/40 rounded-3xl">Pro Feature</div>}
        </div>

        {/* History */}
        <div className="relative">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${!isPro ? 'blur-md grayscale' : ''}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> Recent Log
            </h3>
            <div className="space-y-3">
              {stats.history.slice(-5).reverse().map((m, idx) => (
                <div key={idx} className="flex gap-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="line-through text-slate-400">{m.original}</span>
                      <span className="text-green-600 font-bold">{m.corrected}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isPro && <div className="absolute inset-0 flex items-center justify-center z-10 font-bold text-indigo-600 uppercase tracking-widest text-sm bg-white/40 rounded-3xl">Pro Feature</div>}
        </div>
      </div>
    </div>
  );
};

export default BrainDashboard;
