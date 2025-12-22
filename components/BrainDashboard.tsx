
import React from 'react';
import { BrainStats, SupportLanguage, UI_TRANSLATIONS } from '../types';
import { Brain, Trophy, AlertTriangle, Zap, BarChart3, Clock } from 'lucide-react';

interface BrainDashboardProps {
  stats: BrainStats;
  language: SupportLanguage;
}

const BrainDashboard: React.FC<BrainDashboardProps> = ({ stats, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Calculate Accuracy Score
  // Logic: Start at 100. Subtract 2 points for every unique mistake in history, min 40.
  // Fix: Explicitly cast totalCorrections to number to resolve TS arithmetic operation errors on lines 21 and 88.
  const totalCorrectionsNum = Number(stats.totalCorrections || 0);
  const accuracy = Math.max(40, 100 - (totalCorrectionsNum * 2));

  // Sort categories by frequency
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.statsTotal}</p>
            <p className="text-2xl font-bold text-slate-900">{totalCorrectionsNum}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Sparks</p>
            <p className="text-2xl font-bold text-slate-900">{stats.sparks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.statsAccuracy}</p>
            <p className="text-2xl font-bold text-slate-900">{accuracy}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Frequent Mistakes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
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
                    // Fix: Explicitly cast count and totalCorrectionsNum to number for arithmetic operations.
                    style={{ width: `${(Number(count) / totalCorrectionsNum) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mistake History */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
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
      </div>
    </div>
  );
};

export default BrainDashboard;
