
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Brain, Trophy } from 'lucide-react';
import { MistakeRecord, SupportLanguage, UI_TRANSLATIONS } from '../types';

interface ReviewSessionProps {
  language: SupportLanguage;
  history: MistakeRecord[];
  onClose: () => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ language, history, onClose }) => {
  const [questions, setQuestions] = useState<MistakeRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  useEffect(() => {
    // Pick 5 random unique mistakes
    const shuffled = [...history].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
  }, [history]);

  const handleSubmit = () => {
    const current = questions[currentIndex];
    // Simple comparison (case insensitive, trimmed)
    if (userInput.trim().toLowerCase() === current.corrected.trim().toLowerCase()) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setUserInput('');
        setFeedback(null);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  if (questions.length === 0) return null;

  const current = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className={`bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-blue-600" />
            <h2 className="font-black text-slate-800">{t.reviewTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="p-8 sm:p-10">
          {!isFinished ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Progress */}
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(((currentIndex) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>

              {/* Challenge */}
              <div className="text-center space-y-4">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">Correct this phrase:</p>
                <p className="text-2xl font-black text-slate-900 line-through decoration-red-400 decoration-4">"{current.original}"</p>
                <div className="flex justify-center items-center gap-4 text-slate-300">
                  <div className="h-px bg-slate-100 flex-1" />
                  <ArrowRight size={16} />
                  <div className="h-px bg-slate-100 flex-1" />
                </div>
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the correct French..."
                  className={`w-full p-5 rounded-2xl bg-slate-50 border-2 text-center text-lg font-bold transition-all outline-none ${feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-700' : feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-100 focus:border-blue-400 focus:bg-white'}`}
                  disabled={feedback !== null}
                  autoFocus
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!userInput.trim() || feedback !== null}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {t.button}
              </button>

              {feedback === 'wrong' && (
                <p className="text-center text-red-500 font-bold text-sm animate-in slide-in-from-top-2">Correct version: "{current.corrected}"</p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
               <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-yellow-600">
                 <Trophy size={40} />
               </div>
               <div>
                 <h3 className="text-3xl font-black text-slate-900">Session Complete!</h3>
                 <p className="text-slate-500">You scored {score} out of {questions.length}</p>
               </div>
               <button 
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100"
               >
                 Keep Practicing
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSession;
