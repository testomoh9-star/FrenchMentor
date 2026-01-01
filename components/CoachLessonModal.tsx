import React from 'react';
// Fix: Import SystemLanguage for UI labels.
import { CoachLesson, UI_TRANSLATIONS, SupportLanguage, SystemLanguage } from '../types';
import { X, Zap, Brain, Target, ArrowDown, Lightbulb, Crown, Sparkles } from 'lucide-react';

interface CoachLessonModalProps {
  lesson: CoachLesson;
  // Fix: language prop changed to SystemLanguage to match systemLang state in App.tsx.
  language: SystemLanguage;
  onClose: () => void;
}

const CoachLessonModal: React.FC<CoachLessonModalProps> = ({ lesson, language, onClose }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Map category keys (Grammar, etc.) to translated names
  const translateCat = (catKey: string) => {
    return (t.catMap as any)[catKey] || catKey;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
       <div className={`bg-white w-full max-w-xl sm:max-w-2xl lg:max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-200 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Header with Level Badge */}
          <div className="bg-gradient-to-r from-cyan-600 to-indigo-700 p-6 sm:p-10 text-white relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-20">
               <X size={24} />
            </button>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white/20 p-3 rounded-2xl shrink-0">
                <Zap size={28} className="text-cyan-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">{lesson.title}</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/80 font-bold uppercase tracking-widest text-xs">Topic: {translateCat(lesson.category)}</span>
              <div className="h-4 w-px bg-white/20" />
              <span className="bg-cyan-400 text-indigo-900 px-3 py-1 rounded-lg text-xs font-black">LEVEL {lesson.level || 'A1'}</span>
            </div>
          </div>

          {/* Modular Body */}
          <div className="p-6 sm:p-10 space-y-12 overflow-y-auto flex-1 scrollbar-hide">
            {/* Grid Layout for Desktop sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Left Side: Reasoning & Contrasts */}
              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={18} className="text-slate-400" />
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Why your brain slipped</h5>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-bold italic text-lg sm:text-xl">"{lesson.whyYouMadeIt}"</p>
                </section>

                <section className="space-y-4">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={16} className="text-indigo-500" /> Mistake vs Mastery
                  </h5>
                  <div className="flex flex-col gap-3">
                      <div className="bg-red-50 p-5 rounded-3xl border border-red-100 flex items-center justify-between">
                        <span className="text-red-700 font-bold line-through opacity-60 text-base sm:text-lg">{lesson.contrast?.before}</span>
                        <span className="text-red-400 text-[10px] font-black uppercase">Mistake</span>
                      </div>
                      <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-white rounded-full p-2 shadow-md border border-slate-100">
                          <ArrowDown size={18} className="text-slate-300" />
                        </div>
                      </div>
                      <div className="bg-green-50 p-5 rounded-3xl border border-green-100 flex items-center justify-between">
                        <span className="text-green-700 font-black text-base sm:text-lg">{lesson.contrast?.after}</span>
                        <span className="text-green-500 text-[10px] font-black uppercase">Mastery</span>
                      </div>
                  </div>
                </section>
              </div>

              {/* Right Side: Rule & Tricks */}
              <div className="space-y-10">
                <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">The Blueprint</h5>
                  <p className="text-slate-800 font-bold text-lg leading-relaxed">{lesson.theRule}</p>
                </section>

                <section className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 relative overflow-hidden group">
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Lightbulb size={22} className="text-indigo-600" />
                    <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Master Trick</h5>
                  </div>
                  <p className="text-indigo-900 font-black text-xl sm:text-2xl leading-tight relative z-10">{lesson.mentalTrick}</p>
                  <Crown size={120} className="absolute -bottom-6 -right-6 opacity-[0.05] -rotate-12 transition-transform group-hover:rotate-0" />
                </section>
              </div>
            </div>

            {/* Bottom Row: Full Width Modules */}
            <div className="space-y-10 pt-4">
              {/* Verb Conjugation Pattern - FLEXIBLE TEXT BLOCK */}
              {lesson.conjugation && lesson.conjugation.trim().length > 0 && (
                <section className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Verb Pattern Analysis</h5>
                    <span className="text-[10px] text-slate-400 font-bold">Concept Spotlight</span>
                  </div>
                  <div className="p-8 bg-white">
                    <p className="text-base sm:text-lg font-bold text-indigo-900 whitespace-pre-wrap leading-relaxed">
                      {lesson.conjugation}
                    </p>
                  </div>
                </section>
              )}

              {/* Practice Mission */}
              <section className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-cyan-500" />
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Learning Mission</h5>
                </div>
                <div className="bg-gradient-to-r from-cyan-50/50 to-indigo-50/50 p-8 rounded-[2rem] border-2 border-dashed border-indigo-200/50">
                  <p className="text-indigo-900 font-black text-lg sm:text-xl leading-relaxed text-center italic">
                    "{lesson.mission}"
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 sm:p-8 pt-4 shrink-0 border-t bg-white flex justify-center">
            <button 
              onClick={onClose}
              className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-slate-100 active:scale-95 transition-all hover:bg-slate-800"
            >
              Dossier Reviewed
            </button>
          </div>
       </div>
    </div>
  );
};

export default CoachLessonModal;