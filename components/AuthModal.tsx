
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS, User } from '../types';
import { supabase } from '../services/supabaseService';

interface AuthModalProps {
  language: SystemLanguage;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ language, initialMode = 'login', onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  // Sync mode if initialMode changes while component is mounted
  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = isSignUp 
        ? await supabase.auth.signUp(email, password)
        : await supabase.auth.signInWithPassword(email, password);

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setErrorMsg("Account found, but email is not verified. Please check your inbox for a confirmation link.");
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (isSignUp && data.user && !data.session) {
        setIsVerificationSent(true);
        setIsLoading(false);
        return;
      }

      if (data.user && data.session) {
        onLogin({
          id: data.user.id,
          email: data.user.email || email,
          full_name: email.split('@')[0],
          is_pro: false
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isSignUp ? "Sign up failed." : "Login failed."));
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className={`bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 sm:p-10 text-center ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-green-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-green-600 mb-6 shadow-sm border border-green-100">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Check your inbox</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            We've sent a verification link to <span className="text-slate-900 font-black">{email}</span>. Please click it to activate your account.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg shadow-indigo-100"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 sm:p-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {isSignUp ? 'Join LexiLift' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isSignUp ? 'Create an account to save progress.' : 'Log in to continue your journey.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-tight">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
              <>{isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />} {isSignUp ? 'Sign Up' : 'Log In'}</>
            )}
          </button>
        </form>

        <button 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
          }}
          className="w-full mt-8 text-slate-500 text-xs font-bold hover:text-blue-600 transition-colors"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up for free"}
        </button>

        <p className="text-center mt-10 text-[10px] text-slate-400 font-medium leading-relaxed">
          By continuing, you agree to LexiLift's <span className="text-blue-500">Terms of Service</span> and <span className="text-blue-500">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
