
import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS } from '../types';

interface FeedbackModalProps {
  language: SystemLanguage;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ language, onClose }) => {
  const [text, setText] = useState('');
  const [isSent, setIsSent] = useState(false);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const handleSend = () => {
    if (!text.trim()) return;
    // Simulate sending feedback
    console.log("Feedback sent:", text);
    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{isRtl ? 'ماذا حدث؟' : 'What happened?'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {isSent ? (
            <div className="text-center py-10 animate-in zoom-in-95 duration-300">
              <div className="bg-green-100 dark:bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{isRtl ? 'شكراً لك!' : 'Thank you!'}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{isRtl ? 'تم إرسال ملاحظاتك بنجاح.' : 'Your feedback has been received.'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={isRtl ? 'أخبرنا عن المشكلة التي واجهتها' : 'Tell us about the issue you encountered'}
                  className="w-full h-48 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none resize-none text-slate-800 dark:text-white font-medium"
                  maxLength={2000}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-400">
                  {text.length} / 2000
                </div>
              </div>

              <button 
                onClick={handleSend}
                disabled={!text.trim()}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={20} />
                {isRtl ? 'إرسال' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
