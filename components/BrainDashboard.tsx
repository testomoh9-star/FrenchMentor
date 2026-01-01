import React, { useState, useMemo } from 'react';
// Fix: Import SystemLanguage for UI labels.
import { BrainStats, SupportLanguage, SystemLanguage, UI_TRANSLATIONS, CoachLesson } from '../types';
import { Brain, Trophy, BarChart3, Clock, Lock, Crown, ArrowRight, Sparkles, Loader2, Lightbulb, BarChart } from 'lucide-react';
import { generateCoachLesson, parseSafeJson } from '../services/geminiService';

interface BrainDashboardProps {
  stats: BrainStats;
  // Fix: language prop changed to SystemLanguage to match systemLang state in App.tsx.
  language: SystemLanguage;
  isPro?: boolean;
  onUpgradeClick?: () => void;
  userMessageCount: number;
  onArchiveLesson: (lesson: CoachLesson) => void;
  onOpenLesson: (lesson: CoachLesson) => void;
}

const BrainDashboard: React.FC<BrainDashboardProps> = ({ 
  stats, 
  language, 
  isPro, 
  onUpgradeClick, 
  userMessageCount, 
  onArchiveLesson,
  onOpenLesson 
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const totalCorrectionsNum = Number(stats.totalCorrections || 0);
  const precisionLevel = Math.max(40, 100 - (totalCorrectionsNum * 1.5));
  
  const isUnlocked = userMessageCount >= 3;
  const remainingToUnlock = Math.max(0, 3 - userMessageCount);

  // Map category keys (Grammar, etc.) to translated names
  const translateCat = (catKey: string) => {
    return (t.catMap as any)[catKey] || catKey;
  };

  const pendingMissions = useMemo(() => {
    const missions: { cat: string; count: number; missionIndex: number }[] = [];
    Object.entries(stats.categories).forEach(([cat, count]) => {
      const archivedCount = stats.archivedLessons.filter(l => l.category === cat).length;
      const totalAvailable = Math.floor(Number(count) / 3);
      if (totalAvailable > archivedCount) {
        missions.push({ 
          cat, 
          count: Number(count), 
          missionIndex: archivedCount + 1 
        });
      }
    });
    return missions;
  }, [stats.categories, stats.archivedLessons]);

  const handleOpenCoachLesson = async (category: string) => {
    if (!isPro) {
      onUpgradeClick?.();
      return;
    }
    setLoadingCategory(category);
    try {
      // NOTE: We cast 'language' as SupportLanguage here because generateCoachLesson 
      // is constrained to only 3 explanation languages, even if UI supports more.
      const responseJson = await generateCoachLesson(category, stats.history, language as SupportLanguage);
      const parsedData = parseSafeJson(responseJson);
      const lessonData: CoachLesson = { 
        ...parsedData, 
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      onArchiveLesson(lessonData);
      onOpenLesson(lessonData);
    } catch (e) {
      console.error("Coach failed:", e);
    } finally {
      setLoadingCategory(null);
    }
  };

  if (!isUnlocked) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-blue-50 p-8 rounded-[3rem] mb-8 relative">
          <Brain size={64} className="text-blue-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-500 to-indigo-600 text-white p-2 rounded-full shadow-lg">
            <Lock size={20} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">{t.brainLearning}</h2>
        <p className="text-slate-500 max-w-sm leading-relaxed">
          {t.brainUnlock.replace("{n}", remainingToUnlock.toString())}
        </p>
        <div className="mt-10 flex gap-2">
          {[1, 2, 3].map((step) => (
            <div 
              key={step} 
              className={`w-3 h-3 rounded-full transition-all duration-700 ${userMessageCount >= step ? 'bg-blue-600 w-8' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-hide">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-50/50 flex flex-col sm:flex-row items-center gap-8 animate-slide-in">
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Trophy size={20} className="text-yellow-500" />
              <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.statsTitle}</h2>
            </div>
            <p className="text-7xl font-black text-slate-900">{Math.round(precisionLevel)}%</p>
            <p className="text-slate-400 mt-2 text-sm font-medium">{t.statsSubtitle}</p>
          </div>
          {!isPro && (
            <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-6 rounded-3xl text-white max-w-xs relative overflow-hidden group shadow-xl shadow-indigo-100/50">
              <div className="relative z-10">
                 <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black w-fit mb-3">{t.proLabel}</div>
                 <h4 className="font-bold text-lg mb-4">Master your patterns with Elite Coach.</h4>
                 <button onClick={onUpgradeClick} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all">
                   {t.getPro} <ArrowRight size={14} />
                 </button>
              </div>
              <Crown size={120} className="absolute -bottom-8 -right-8 opacity-10 rotate-12" />
            </div>
          )}
        </div>

        {pendingMissions.length > 0 && (
          <section className="space-y-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Sparkles size={14} className="text-cyan-500" /> {t.coachTitle}
             </h3>
             <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                {pendingMissions.map((mission) => (
                  <div key={mission.cat} className="min-w-[240px] sm:min-w-[280px] bg-gradient-to-br from-cyan-500 to-indigo-600 p-5 rounded-3xl text-white shadow-lg flex flex-col justify-between shrink-0 relative group">
                    <div className="absolute top-4 right-4 bg-white/10 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      #{mission.missionIndex}
                    </div>
                    <div className="mb-4 pr-10">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{translateCat(mission.cat)}</p>
                      <p className="text-base font-bold leading-tight line-clamp-2">
                        {t.coachTrigger.replace("{cat}", translateCat(mission.cat))}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleOpenCoachLesson(mission.cat)}
                      disabled={loadingCategory !== null}
                      className="bg-white text-indigo-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {loadingCategory === mission.cat ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
                      {t.coachButton}
                    </button>
                    {!isPro && (
                      <div className="absolute bottom-4 right-4">
                        <Lock size={12} className="text-white/40" />
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" /> {t.statsCommon}
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.categories).slice(0, 5).map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{translateCat(category)}</span>
                    <span className="text-slate-400">{count} {t.errorsLabel}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${(Number(count) / totalCorrectionsNum) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> {t.recentLog}
            </h3>
            <div className="space-y-3">
              {stats.history.slice(-5).reverse().map((m, idx) => (
                <div key={idx} className="flex gap-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="line-through text-slate-400 truncate max-w-[120px]">{m.original}</span>
                      <span className="text-green-600 font-bold truncate max-w-[120px]">{m.corrected}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainDashboard;