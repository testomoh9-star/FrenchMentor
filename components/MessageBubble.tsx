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

  // Helper to detect Arabic characters for RTL support inside content
  const getTextDirectionProps = (text: string) => {
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    return {
      dir: hasArabic ? 'rtl' : 'ltr',
      className: hasArabic ? 'text-right font-arabic' : 'text-left'
    };
  };

  // --- USER MESSAGE ---
  if (isUser) {
    return (
      <div className={`flex w-full mb-6 ${isRtl ? 'justify-center' : 'justify-center'}`}>
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl relative ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <p className="text-lg text-slate-800 font-medium">{message.content}</p>
          <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} p-6 hidden sm:block`}>
            <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{t.originalLabel}</div>
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
    <div className={`flex justify-center w-full mb-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl flex flex-col gap-4">
        
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Blue Header - Always French so we keep LTR for the large text usually, but allow RTL for UI buttons */}
          <div className={`bg-blue-600 p-6 flex justify-between items-start text-white ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div dir="ltr" className="text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Corrected French</h3>
              <div className="text-2xl sm:text-3xl font-bold leading-tight">
                {data.correctedFrench}
              </div>
              <p className="text-blue-100 italic mt-2 text-lg">"{data.englishTranslation}"</p>
            </div>
            <button 
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`p-2 rounded-full transition-colors text-white ${isPlaying ? 'bg-white/40 cursor-wait' : 'bg-white/20 hover:bg-white/30'}`}
              title={t.listen}
            >
              {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {data.corrections && data.corrections.length > 0 ? (
              <div className="mb-6">
                <div className={`flex items-center gap-2 mb-4 text-slate-800 font-semibold ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <AlertCircle size={18} className="text-orange-500" />
                  <span>{t.correctionsLabel}</span>
                </div>
                
                <div className="space-y-3">
                  {data.corrections.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className={`flex flex-wrap items-center gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir="ltr">
                        <span className="text-red-500 font-medium line-through decoration-2 decoration-red-500/40 bg-red-50 px-2 py-0.5 rounded">
                          {item.original}
                        </span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                          {item.corrected}
                        </span>
                      </div>
                      <p className={`text-sm text-slate-600 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`mb-6 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className="bg-green-100 p-2 rounded-full text-green-600">
                   <AlertCircle size={20} />
                 </div>
                 <p className="text-green-800 font-medium">{t.perfectLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tutor Notes Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className={`flex items-center gap-2 mb-3 text-blue-700 font-semibold ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <BookOpen size={18} />
            <span>{t.notesLabel}</span>
          </div>
          <p className={`text-slate-700 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
            {data.tutorNotes}
          </p>
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;