
import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, Zap, Brain, Sparkles, LogIn, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS } from '../types';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  mode: 'login' | 'signup' | 'limit';
  language: SystemLanguage;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode: initialMode, language, onClose }) => {
  const [mode, setMode] = useState(initialMode === 'limit' ? 'signup' : initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const content = t.auth[mode === 'signup' && initialMode === 'limit' ? 'limit' : mode];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Success! Check your email for verification link.");
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          // Force close immediately if we have a user
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden ${isRtl ? 'font-arabic' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-30"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6 relative">
             {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
             <div className="absolute -top-1 -right-1 bg-gradient-to-br from-cyan-400 to-indigo-600 text-white p-1 rounded-full shadow-lg border-2 border-white">
                <Sparkles size={12} />
             </div>
          </div>

          <h2 className="text-2xl sm:text-2xl font-black text-slate-900 text-center mb-2 leading-tight">
            {content.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium text-center mb-6 leading-relaxed px-4">
            {content.subtitle}
          </p>

          {error && (
            <div className={`w-full p-4 rounded-2xl mb-6 flex items-start gap-3 ${error.includes('Success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
               {error.includes('Success') ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
               <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="w-full space-y-3 mb-6">
            <div className="relative">
              <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} text-sm font-bold focus:border-blue-500 outline-none transition-all`}
              />
            </div>
            <div className="relative">
              <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} text-sm font-bold focus:border-blue-500 outline-none transition-all`}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : content.cta}
            </button>
          </form>

          <button 
            className="text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors uppercase tracking-widest"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? t.signup : t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
