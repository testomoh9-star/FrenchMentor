
import React, { useState } from 'react';
import { Message, CorrectionResponse, SupportLanguage, UI_TRANSLATIONS } from '../types';
import { Volume2, AlertCircle, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { playFrenchTTS } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
  language: SupportLanguage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language }) => {
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
          <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} p-3 sm:p-6 hidden sm:block`}>
            <div className="text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{t.originalLabel}</div>
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
         <div className="bg-white p-6 rounded-2xl shadow-md border border-red-100 w-full max-w-2xl text-red-600">
           Error parsing response.
         </div>
      </div>
    );
  }

  if (!data) return null;

  const handlePlayAudio = async () => {
    if (!data || isPlaying) return;
    setIsPlaying(true);
    try {
      await playFrenchTTS(data.correctedFrench);
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex justify-center w-full mb-6 sm:mb-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl flex flex-col gap-3 sm:gap-4">
        
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className={`bg-blue-600 p-4 sm:p-6 flex justify-between items-start text-white ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div dir="ltr" className="text-left flex-1 min-w-0">
              <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-1">Corrected French</h3>
              <div className="text-xl sm:text-3xl font-bold leading-tight break-words">
                {data.correctedFrench}
              </div>
              <p className="text-blue-100 italic mt-1 sm:mt-2 text-base sm:text-lg">"{data.englishTranslation}"</p>
            </div>
            <button 
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`p-2 rounded-full transition-colors text-white shrink-0 ml-2 ${isPlaying ? 'bg-white/40 cursor-wait' : 'bg-white/20 hover:bg-white/30'}`}
              title={t.listen}
            >
              {isPlaying ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            {data.corrections && data.corrections.length > 0 ? (
              <div>
                <div className={`flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm sm:text-base ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <AlertCircle size={16} className="text-orange-500" />
                  <span>{t.correctionsLabel}</span>
                </div>
                
                <div className="space-y-2.5 sm:space-y-3">
                  {data.corrections.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
                      <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir="ltr">
                        <span className="text-red-500 font-medium line-through text-xs sm:text-sm bg-red-50 px-1.5 py-0.5 rounded">
                          {item.original}
                        </span>
                        <ArrowRight size={12} className="text-slate-400" />
                        <span className="text-green-600 font-bold text-xs sm:text-sm bg-green-50 px-1.5 py-0.5 rounded">
                          {item.corrected}
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100 flex items-center gap-2 sm:gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                   <AlertCircle size={18} />
                 </div>
                 <p className="text-green-800 font-medium text-sm">{t.perfectLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tutor Notes Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className={`flex items-center gap-2 mb-2 sm:mb-3 text-blue-700 font-semibold text-sm sm:text-base ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <BookOpen size={16} />
            <span>{t.notesLabel}</span>
          </div>
          <p className={`text-xs sm:text-sm text-slate-700 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
            {data.tutorNotes}
          </p>
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;
