
import React, { useState } from 'react';
import { X, Mail, Lock, Chrome, ArrowRight, Loader2, UserPlus, LogIn } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS, User } from '../types';
import { supabase } from '../services/supabaseService';

interface AuthModalProps {
  language: SystemLanguage;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ language, onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = isSignUp 
        ? await supabase.auth.signUp(email, password)
        : await supabase.auth.signInWithPassword(email, password);

      if (error) throw error;

      if (data.user) {
        onLogin({
          id: data.user.id,
          email: data.user.email || email,
          full_name: email.split('@')[0],
          is_pro: false
        });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      alert(err.message || (isSignUp ? "Sign up failed." : "Login failed."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 sm:p-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {isSignUp ? 'Join LexiLift' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isSignUp ? 'Create an account to save progress.' : 'Log in to continue your journey.'}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all font-bold text-slate-700 active:scale-[0.98]">
            <Chrome size={20} className="text-blue-500" />
            Continue with Google
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 px-2 bg-white w-fit mx-auto">Or</div>
        </div>

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
            className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
              <>{isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />} {isSignUp ? 'Sign Up' : 'Log In'}</>
            )}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-slate-500 text-xs font-bold hover:text-blue-600 transition-colors"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up for free"}
        </button>

        <p className="text-center mt-8 text-[10px] text-slate-400 font-medium leading-relaxed">
          By continuing, you agree to LexiLift's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
