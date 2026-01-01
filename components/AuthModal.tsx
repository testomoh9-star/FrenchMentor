
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, UserPlus, LogIn, AlertCircle, CheckCircle2, ChevronLeft, Chrome } from 'lucide-react';
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
  
  const isRtl = language === 'Arabic';

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

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
          setErrorMsg("Account found, but email is not verified. Please check your inbox.");
          setIsVerificationSent(true);
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      // If sign up succeeded but no session, verification is required
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
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className={`bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl p-8 sm:p-10 text-center ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-blue-600 mb-6 border border-blue-100">
            <Mail size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Verification Sent</h2>
          <p className="text-slate-500 font-medium mb-6 leading-relaxed">
            We sent a link to <span className="text-slate-900 font-black">{email}</span>.
          </p>

          <div className="bg-orange-50 p-5 rounded-2xl mb-8 border border-orange-100 text-left">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle size={12} /> Email not arriving?
            </p>
            <ul className="text-[10px] text-orange-700/70 space-y-1 font-bold list-disc list-inside">
              <li>Check your <b>Spam/Junk</b> folder.</li>
              <li>Wait up to 5 minutes (SMTP is busy).</li>
              <li>Try <b>Google Login</b> instead—it's instant.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-slate-100 text-slate-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
            >
              <Chrome size={18} className="text-blue-500" /> Use Google (Instant)
            </button>
            <button 
              onClick={() => setIsVerificationSent(false)}
              className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-xs flex items-center justify-center gap-1"
            >
              <ChevronLeft size={14} /> Back to email login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className={`bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-2xl relative p-8 sm:p-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {isSignUp ? 'Start Learning' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Join 100+ users reaching native-level fluency.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-tight">{errorMsg}</p>
          </div>
        )}

        {/* Social Login Leading */}
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border-2 border-slate-100 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95 mb-6"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Chrome size={18} className="text-blue-500" />}
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-100 flex-1" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or use email</span>
          <div className="h-px bg-slate-100 flex-1" />
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
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
              isSignUp ? 'Create Free Account' : 'Log In'
            )}
          </button>
        </form>

        <button 
          onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
          className="w-full mt-6 text-slate-400 text-xs font-bold hover:text-blue-600 transition-colors"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up free"}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
