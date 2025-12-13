import React, { useState } from 'react';
import { Message, CorrectionResponse } from '../types';
import { Volume2, AlertCircle, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { playFrenchTTS } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  // --- USER MESSAGE (Input Card Style) ---
  if (isUser) {
    return (
      <div className="flex justify-center w-full mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl relative">
          <p className="text-lg text-slate-800 font-medium">{message.content}</p>
          <div className="absolute top-0 right-0 p-6 hidden sm:block">
            {/* Visual decoration to match the 'input' feel */}
            <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Original</div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODEL MESSAGE (Result Card Style) ---
  let data: CorrectionResponse | null = null;
  try {
    data = JSON.parse(message.content);
  } catch (e) {
    // Fallback if parsing fails
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
      alert("Could not play audio. Please check your connection.");
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex justify-center w-full mb-10">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Blue Header */}
          <div className="bg-blue-600 p-6 flex justify-between items-start text-white">
            <div>
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
              title="Listen to pronunciation"
            >
              {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Corrections Section */}
            {data.corrections && data.corrections.length > 0 ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                  <AlertCircle size={18} className="text-orange-500" />
                  <span>Corrections Needed</span>
                </div>
                
                <div className="space-y-3">
                  {data.corrections.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-red-500 font-medium line-through decoration-2 decoration-red-500/40 bg-red-50 px-2 py-0.5 rounded">
                          {item.original}
                        </span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                          {item.corrected}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 ml-1">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-full text-green-600">
                   <AlertCircle size={20} />
                 </div>
                 <p className="text-green-800 font-medium">Perfect! No corrections needed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tutor Notes Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold">
            <BookOpen size={18} />
            <span>Tutor's Notes</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {data.tutorNotes}
          </p>
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;
