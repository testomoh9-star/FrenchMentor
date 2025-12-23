
import React from 'react';
import { BrainStats, SupportLanguage, UI_TRANSLATIONS } from '../types';
import { Brain, Trophy, AlertTriangle, Zap, BarChart3, Clock, Lock, Crown, ArrowRight } from 'lucide-react';

interface BrainDashboardProps {
  stats: BrainStats;
  language: SupportLanguage;
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

const BrainDashboard: React.FC<BrainDashboardProps> = ({ stats, language, isPro, onUpgradeClick }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const totalCorrectionsNum = Number(stats.totalCorrections || 0);
  const accuracy = Math.max(40, 100 - (totalCorrectionsNum * 2));

  const sortedCategories = Object.entries(stats.categories || {})
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 5);

  if (totalCorrectionsNum === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <Brain size={48} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t.statsTitle}</h2>
        <p className="text-slate-500 max-sm">{t.statsNoData}</p>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-8 animate-slide-in pb-24 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Accuracy Card (Always Visible) */}
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-50/50 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <Trophy size={20} className="text-yellow-500" />
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.statsAccuracy}</h2>
          </div>
          <p className="text-7xl font-black text-slate-900 leading-none">{accuracy}%</p>
          <p className="text-slate-400 mt-4 font-medium text-sm">Based on {totalCorrectionsNum} linguistic points.</p>
        </div>
        
        {/* Upgrade Hook Card */}
        {!isPro && (
          <div className="bg-indigo-600 p-6 rounded-3xl text-white max-w-xs relative overflow-hidden group">
            <div className="relative z-10">
               <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black w-fit mb-3">{t.proLabel}</div>
               <h4 className="font-bold text-lg leading-tight mb-4">Go Pro to see your detailed progress.</h4>
               <button 
                onClick={onUpgradeClick}
                className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
               >
                 {t.getPro} <ArrowRight size={14} />
               </button>
            </div>
            <Crown size={120} className="absolute -bottom-8 -right-8 opacity-10 rotate-12 group-hover:rotate-6 transition-transform" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Most Frequent Mistakes (Blurred for Free) */}
        <div className="relative">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-700 ${!isPro ? 'blur-md grayscale select-none' : ''}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              {t.statsCommon}
            </h3>
            <div className="space-y-4">
              {sortedCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{category}</span>
                    <span className="text-slate-400">{count} errors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(Number(count) / totalCorrectionsNum) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
               <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center text-center">
                  <Lock size={20} className="text-indigo-500 mb-2" />
                  <p className="text-xs font-bold text-slate-800 uppercase mb-1">Locked</p>
                  <p className="text-[10px] text-slate-500">Upgrade to view pitfalls</p>
               </div>
            </div>
          )}
        </div>

        {/* Recent Mistake History (Blurred for Free) */}
        <div className="relative">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-700 ${!isPro ? 'blur-md grayscale select-none' : ''}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Recent Log
            </h3>
            <div className="space-y-3">
              {stats.history.slice(-5).reverse().map((mistake, idx) => (
                <div key={idx} className="flex gap-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="line-through text-slate-400">{mistake.original}</span>
                      <span className="text-green-600 font-bold">{mistake.corrected}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">{mistake.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
               <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center text-center">
                  <Lock size={20} className="text-indigo-500 mb-2" />
                  <p className="text-xs font-bold text-slate-800 uppercase mb-1">Locked</p>
                  <p className="text-[10px] text-slate-500">Upgrade to view log</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainDashboard;
