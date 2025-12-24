
import React, { useState, useMemo } from 'react';
import { BrainStats, SupportLanguage, UI_TRANSLATIONS, CoachLesson } from '../types';
import { Brain, Trophy, BarChart3, Clock, Lock, Crown, ArrowRight, Sparkles, Loader2, X, Lightbulb, BookOpen, ChevronRight } from 'lucide-react';
import { generateCoachLesson } from '../services/geminiService';

interface BrainDashboardProps {
  stats: BrainStats;
  language: SupportLanguage;
  isPro?: boolean;
  onUpgradeClick?: () => void;
  userMessageCount: number;
  onArchiveLesson: (lesson: CoachLesson) => void;
}

const BrainDashboard: React.FC<BrainDashboardProps> = ({ stats, language, isPro, onUpgradeClick, userMessageCount, onArchiveLesson }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [activeLesson, setActiveLesson] = useState<CoachLesson | null>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  const totalCorrectionsNum = Number(stats.totalCorrections || 0);
  const precisionLevel = Math.max(40, 100 - (totalCorrectionsNum * 1.5));
  
  const isUnlocked = userMessageCount >= 3;
  const remainingToUnlock = Math.max(0, 3 - userMessageCount);

  // Logic: 1 mission per 3 unique mistakes in a category.
  // We subtract solved lessons from the total mistake count / 3.
  const pendingMissions = useMemo(() => {
    return Object.entries(stats.categories).filter(([cat, count]) => {
      const archivedCount = stats.archivedLessons.filter(l => l.category === cat).length;
      return (Math.floor(Number(count) / 3)) > archivedCount;
    });
  }, [stats.categories, stats.archivedLessons]);

  const handleOpenCoachLesson = async (category: string) => {
    setIsGeneratingLesson(true);
    try {
      const responseJson = await generateCoachLesson(category, stats.history, language);
      const lessonData: CoachLesson = { 
        ...JSON.parse(responseJson), 
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      setActiveLesson(lessonData);
    } catch (e) {
      console.error("Coach failed:", e);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleGotIt = () => {
    if (activeLesson) {
      // Archive the exact lesson so it moves to Knowledge Library
      if (!stats.archivedLessons.some(l => l.id === activeLesson.id)) {
        onArchiveLesson(activeLesson);
      }
      setActiveLesson(null);
    }
  };

  if (!isUnlocked) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-blue-50 p-8 rounded-[3rem] mb-8 relative">
          <Brain size={64} className="text-blue-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-2 rounded-full shadow-lg">
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
    <div className={`p-6 max-w-4xl mx-auto space-y-8 animate-slide-in pb-24 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Precision Level Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-50/50 flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <Trophy size={20} className="text-yellow-500" />
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.statsTitle}</h2>
          </div>
          <p className="text-7xl font-black text-slate-900">{Math.round(precisionLevel)}%</p>
          <p className="text-slate-400 mt-2 text-sm font-medium">{t.statsSubtitle}</p>
        </div>
        
        {!isPro && (
          <div className="bg-indigo-600 p-6 rounded-3xl text-white max-w-xs relative overflow-hidden group">
            <div className="relative z-10">
               <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black w-fit mb-3">{t.proLabel}</div>
               <h4 className="font-bold text-lg mb-4">Unlock Elite Coach analytics.</h4>
               <button onClick={onUpgradeClick} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                 {t.getPro} <ArrowRight size={14} />
               </button>
            </div>
            <Crown size={120} className="absolute -bottom-8 -right-8 opacity-10 rotate-12" />
          </div>
        )}
      </div>

      {/* New Coaching Missions row */}
      {pendingMissions.length > 0 && (
        <section className="space-y-4">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <Sparkles size={14} className="text-blue-500" /> {t.coachTitle}
           </h3>
           <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
              {pendingMissions.map(([cat]) => (
                <div key={cat} className="min-w-[240px] sm:min-w-[280px] bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-3xl text-white shadow-lg flex flex-col justify-between shrink-0">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{cat}</p>
                    <p className="text-base font-bold leading-tight">
                      {t.coachTrigger.replace("{cat}", cat)}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleOpenCoachLesson(cat)}
                    disabled={isGeneratingLesson}
                    className="bg-white text-indigo-600 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isGeneratingLesson ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
                    {t.coachButton}
                  </button>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Knowledge Library Archive */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} className="text-slate-400" /> {t.archiveTitle}
        </h3>
        {stats.archivedLessons.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-10 text-center">
            <p className="text-slate-400 text-sm font-medium">{t.archiveEmpty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.archivedLessons.slice().reverse().map((lesson) => (
              <button 
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                    <Lightbulb size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs truncate">{lesson.title}</h4>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest truncate">{lesson.category}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Analytics (Stats Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
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

        <div className="relative">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${!isPro ? 'blur-md grayscale' : ''}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> Recent Log
            </h3>
            <div className="space-y-3">
              {stats.history.slice(-5).reverse().map((m, idx) => (
                <div key={idx} className="flex gap-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="line-through text-slate-400 truncate max-w-[150px]">{m.original}</span>
                      <span className="text-green-600 font-bold truncate max-w-[150px]">{m.corrected}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isPro && <div className="absolute inset-0 flex items-center justify-center z-10 font-bold text-indigo-600 uppercase tracking-widest text-sm bg-white/40 rounded-3xl">Pro Feature</div>}
        </div>
      </div>

      {/* Coach Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative shrink-0">
                <button onClick={() => setActiveLesson(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                   <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-xl shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black line-clamp-2">{activeLesson.title}</h3>
                </div>
                <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Topic: {activeLesson.category}</p>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto flex-1">
                <section>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Why you made it</h5>
                  <p className="text-slate-700 leading-relaxed font-medium italic">"{activeLesson.whyYouMadeIt}"</p>
                </section>

                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">The Simple Rule</h5>
                  <p className="text-slate-800 font-bold text-base sm:text-lg leading-snug">{activeLesson.theRule}</p>
                </section>

                {/* Optional Conjugation Table */}
                {activeLesson.conjugationTable && (
                  <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Forms</h5>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
                      {Object.entries(activeLesson.conjugationTable).map(([pronoun, form]) => (
                        <div key={pronoun} className="px-4 py-2.5 flex justify-between items-center bg-white">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{pronoun.replace('_',' ')}</span>
                          <span className="text-sm font-black text-blue-700">{form}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={18} className="text-indigo-600" />
                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Mental Trick</h5>
                  </div>
                  <p className="text-indigo-900 font-black text-lg sm:text-xl leading-tight">{activeLesson.mentalTrick}</p>
                </section>
              </div>

              <div className="p-8 pt-4 shrink-0 border-t bg-slate-50">
                <button 
                  onClick={handleGotIt}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-100 active:scale-95 transition-all"
                >
                  Got it!
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default BrainDashboard;
