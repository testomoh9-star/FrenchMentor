
import React, { useState } from 'react';
import { Message, CorrectionResponse, SupportLanguage, UI_TRANSLATIONS } from '../types';
import { Volume2, AlertCircle, BookOpen, ArrowRight, Loader2, CheckCircle2, Lock, Crown, GraduationCap, Layout, Sparkles } from 'lucide-react';
import { playFrenchTTS } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
  language: SupportLanguage;
  isPro?: boolean;
  onLockClick?: () => void;
  onDeepDive?: (messageId: string, contextText: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language, isPro, onLockClick, onDeepDive }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // --- USER MESSAGE ---
  if (isUser) {
    return (
      <div className={`flex w-full mb-4 sm:mb-6 justify-center`}>
        <div className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl relative ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <p className="text-base sm:text-lg text-slate-800 font-medium">{message.content}</p>
          <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} p-3 hidden sm:block opacity-40`}>
            <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{t.originalLabel}</div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODEL MESSAGE ---
  let data: CorrectionResponse | null = null;
  try {
    data = JSON.parse(message.content);
  } catch (e) {
    return (
      <div className="flex justify-center w-full mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-md border border-red-100 w-full max-w-2xl text-red-600 text-xs">
           Parsing Error.
         </div>
      </div>
    );
  }

  if (!data) return null;
  const isPerfect = !data.corrections || data.corrections.length === 0;

  const handlePlayAudio = async () => {
    if (!isPro) { onLockClick?.(); return; }
    if (!data || isPlaying) return;
    setIsPlaying(true);
    try { await playFrenchTTS(data.correctedFrench); } catch (e) { console.error(e); } finally { setIsPlaying(false); }
  };

  const contextForDive = `Original: ${data.corrections?.[0]?.original || ''}. Correction: ${data.correctedFrench}. Notes: ${data.tutorNotes}`;

  return (
    <div className={`flex justify-center w-full mb-6 sm:mb-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl flex flex-col gap-3 sm:gap-4">
        
        {/* Main Result Card */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
          <div className={`${isPerfect ? 'bg-green-600' : 'bg-blue-600'} p-6 sm:p-8 flex justify-between items-start text-white transition-colors duration-500`}>
            <div dir="ltr" className="text-left flex-1 min-w-0">
              <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                {isPerfect ? t.lookingGood : 'Corrected French'}
              </h3>
              <div className="text-2xl sm:text-4xl font-black leading-tight break-words">
                {data.correctedFrench}
              </div>
              <p className="text-white/80 italic mt-2 text-base sm:text-xl">"{data.englishTranslation}"</p>
            </div>
            <button 
              onClick={handlePlayAudio}
              className={`p-3 rounded-xl transition-all text-white shrink-0 ml-4 relative ${isPlaying ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30 active:scale-95'}`}
            >
              {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
              {!isPro && <div className="absolute -top-1 -right-1 bg-indigo-500 rounded-full p-0.5 border border-white"><Lock size={8} fill="currentColor" /></div>}
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {!isPerfect && (
              <div className="space-y-3">
                {data.corrections.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex flex-wrap items-center gap-2 mb-2" dir="ltr">
                      <span className="text-red-500 font-bold line-through text-xs bg-red-50 px-2 py-0.5 rounded">{item.original}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">{item.corrected}</span>
                    </div>
                    <p className={`text-xs text-slate-600 leading-relaxed font-medium ${isRtl ? 'text-right' : 'text-left'}`}>{item.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100/50 relative">
                <div className={`flex items-center gap-2 mb-2 text-blue-700 font-bold text-xs uppercase tracking-widest ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <BookOpen size={14} />
                  <span>{t.notesLabel}</span>
                </div>
                <p className={`text-sm text-slate-700 leading-relaxed font-medium ${isRtl ? 'text-right' : 'text-left'}`}>{data.tutorNotes}</p>
              </div>

              {/* Deep Dive Button (Pro) */}
              {isPro && !data.deepDive && (
                <button 
                  onClick={() => onDeepDive?.(message.id, contextForDive)}
                  disabled={message.isDeepDiveLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
                >
                  {message.isDeepDiveLoading ? <Loader2 size={16} className="animate-spin" /> : <GraduationCap size={16} className="text-indigo-400" />}
                  {t.deepDiveBtn}
                </button>
              )}
            </div>

            {/* Render Deep Dive Content */}
            {data.deepDive && (
              <div className="mt-8 pt-8 border-t border-slate-100 animate-slide-in">
                <div className={`flex items-center gap-3 mb-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100"><Layout size={20} /></div>
                   <div>
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t.deepDiveTitle}</h4>
                     <p className="text-lg font-black text-slate-900 leading-none">Grammar Mastery</p>
                   </div>
                </div>
                
                <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                   {data.deepDive.split('\n').map((line, i) => {
                     const trimmedLine = line.trim();
                     if (!trimmedLine) return null;
                     if (trimmedLine.startsWith('#') || (i === 0 && !trimmedLine.match(/^\d\./))) {
                       return <h5 key={i} className="text-xl font-black text-slate-900 mb-4">{trimmedLine.replace(/#/g, '').trim()}</h5>;
                     }
                     const match = trimmedLine.match(/^(\d+)\.\s+(.*)/);
                     if (match) {
                       return (
                        <div key={i} className={`flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                            {match[1]}
                          </div>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed pt-1">{match[2]}</p>
                        </div>
                       );
                     }
                     return <p key={i} className="text-sm text-slate-600 leading-relaxed font-medium">{trimmedLine}</p>;
                   })}
                </div>
                
                <div className="mt-8 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Lesson Complete • Concept Mastered</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
