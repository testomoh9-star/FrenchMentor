
import React, { useState, useEffect } from 'react';
import { Languages, AlertCircle, Copy, CheckCircle2, ExternalLink, RefreshCcw, Info } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';
import { signInWithGoogle } from '../services/firebase';

interface LoginScreenProps {
  language: SupportLanguage;
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ language, onLoginSuccess }) => {
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const currentDomain = window.location.hostname;

  const handleLogin = async () => {
    setError(null);
    setIsRetrying(true);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error detail:", err);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Failed to sign in'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 sm:p-10 text-center animate-slide-in">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-100 rotate-3">
          <Languages size={40} />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
          FrenchMentor
        </h1>
        
        {error?.code === 'auth/unauthorized-domain' ? (
          <div className="text-left mt-8 space-y-4" dir="ltr">
            <div className="flex items-center gap-3 text-red-600 font-bold px-1">
              <AlertCircle size={28} className="shrink-0" />
              <h2 className="text-xl leading-tight">Domain Authorization Required</h2>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 shadow-inner">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600 mt-0.5">
                  <Info size={18} />
                </div>
                <p className="text-sm text-orange-900 font-medium leading-relaxed">
                  You added the Netlify URL, but you are currently viewing this app from a <strong>different</strong> internal address (the Preview).
                </p>
              </div>

              <div className="bg-white border-2 border-orange-200 p-4 rounded-2xl mb-6 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Address you need to add NOW:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono font-bold text-orange-700 truncate">{currentDomain}</code>
                  <button 
                    onClick={copyDomain}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${copied ? 'bg-green-500 text-white' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                   <p className="text-xs text-orange-800 font-medium">Open Firebase Settings (button below).</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                   <p className="text-xs text-orange-800 font-medium">Find 'Authorized domains' and click 'Add domain'.</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                   <p className="text-xs text-orange-800 font-medium">Paste the address shown above and save.</p>
                </div>
              </div>

              <a 
                href="https://console.firebase.google.com/project/frenchmentor-8dbec/authentication/settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
              >
                Open Firebase Console
                <ExternalLink size={16} />
              </a>
            </div>

            <button 
              onClick={handleLogin}
              disabled={isRetrying}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isRetrying ? <RefreshCcw size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              I've added it, try again
            </button>
            
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
               <p className="text-[10px] text-blue-800 font-bold leading-normal">
                 💡 NOTE: If the site on Netlify still looks "old", wait 2 minutes for the build to finish, then refresh your browser.
               </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              {t.welcome}
            </h2>
            
            <p className="text-slate-500 mb-10 leading-relaxed px-4">
              {t.loginDesc}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3 text-left">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-bold">Error ({error.code})</span>
                  <span className="opacity-80">{error.message}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogin}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 px-6 rounded-[1.25rem] text-slate-700 font-bold hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isRetrying ? (
                <RefreshCcw size={20} className="animate-spin text-blue-600" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              )}
              <span>{isRetrying ? 'Connecting...' : t.loginBtn}</span>
            </button>
          </>
        )}

        <div className="mt-12 pt-6 border-t border-slate-50">
           <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300">AI Language Laboratory</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
