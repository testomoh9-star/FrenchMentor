
import React, { useState } from 'react';
import { UserProfile, SupportLanguage, UI_TRANSLATIONS } from '../types';
import { Brain, Trophy, AlertTriangle, Zap, Lock, BookOpen, Loader2 } from 'lucide-react';
import { generateLessonFromHistory } from '../services/geminiService';
import { getMistakeLogs, upgradeToPro } from '../services/firebase';

interface BrainDashboardProps {
  profile: UserProfile;
  language: SupportLanguage;
}

const BrainDashboard: React.FC<BrainDashboardProps> = ({ profile, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [lesson, setLesson] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  const handleGenerateLesson = async () => {
    if (!profile.isPro) return;
    setLoadingLesson(true);
    try {
      const logs = await getMistakeLogs(profile.uid);
      const content = await generateLessonFromHistory(logs, language);
      setLesson(content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLesson(false);
    }
  };

  // Explicitly cast to number to fix arithmetic operation errors on line 34
  const categories = Object.entries(profile.mistakeCategories)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <div className={`p-4 sm:p-6 max-w-4xl mx-auto space-y-8 animate-slide-in pb-24 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.statsTotal}</p>
            <p className="text-2xl font-bold text-slate-900">{profile.totalCorrections}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Sparks</p>
            <p className="text-2xl font-bold text-slate-900">{profile.sparks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.statsAccuracy}</p>
            <p className="text-2xl font-bold text-slate-900">
              {profile.totalCorrections > 0 ? Math.max(40, 100 - profile.totalCorrections) : 100}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Frequent Mistakes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Brain size={20} className="text-blue-600" />
            {t.statsCommon}
          </h3>
          <div className="space-y-4">
            {categories.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{name}</span>
                  <span className="text-slate-400">{count} errors</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                    // Explicitly cast count to number to fix arithmetic operation error on line 90
                    style={{ width: `${Math.min(100, ((count as number) / (profile.totalCorrections || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Section: Lessons */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl shadow-slate-200 h-full min-h-[300px]">
          <div className="relative z-10 h-full flex flex-col">
             <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                  <BookOpen size={24} />
                </div>
                {!profile.isPro && (
                  <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-400/20">
                    <Zap size={10} fill="currentColor" /> {t.proBadge}
                  </span>
                )}
             </div>

             <h3 className="text-xl font-bold mb-2">Teacher's Insights</h3>
             <p className="text-slate-400 text-sm mb-8">{t.upgradeDesc}</p>

             {profile.isPro ? (
               <div className="flex-1 flex flex-col">
                  {lesson ? (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm overflow-y-auto max-h-[400px] mb-4 prose prose-invert">
                       <div dangerouslySetInnerHTML={{ __html: lesson.replace(/\n/g, '<br/>') }} />
                    </div>
                  ) : null}
                  
                  <button 
                    onClick={handleGenerateLesson}
                    disabled={loadingLesson}
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loadingLesson ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                    {t.generateLesson}
                  </button>
               </div>
             ) : (
               <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                 <div className="p-4 bg-white/5 rounded-full">
                    <Lock className="text-slate-500" size={32} />
                 </div>
                 <button 
                  onClick={() => upgradeToPro(profile.uid)}
                  className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl transition-all hover:bg-slate-100 active:scale-95 shadow-lg shadow-white/10"
                 >
                   {t.upgradeBtn}
                 </button>
               </div>
             )}
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default BrainDashboard;
