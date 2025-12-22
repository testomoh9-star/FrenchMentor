
import React, { useState } from 'react';
import { Languages, AlertCircle, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';
import { signInWithGoogle } from '../services/firebase';

interface LoginScreenProps {
  language: SupportLanguage;
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ language, onLoginSuccess }) => {
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const currentDomain = window.location.hostname;

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Failed to sign in'
      });
    }
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center animate-slide-in">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-blue-200">
          <Languages size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          FrenchMentor
        </h1>
        
        {error?.code === 'auth/unauthorized-domain' ? (
          <div className="text-left" dir="ltr">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-4">
              <AlertCircle size={24} />
              <h2 className="text-lg leading-tight">{t.domainErrorTitle}</h2>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
              <p className="text-sm text-slate-600 mb-4 font-medium">
                {t.domainErrorDesc}
              </p>
              
              <div className="space-y-3 mb-6">
                {t.domainErrorSteps.split('\n').map((step, i) => (
                  <p key={i} className="text-xs text-slate-500 leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-white border-2 border-blue-100 p-3 rounded-xl mb-4 shadow-sm">
                <code className="flex-1 text-xs font-mono font-bold text-blue-700 truncate">{currentDomain}</code>
                <button 
                  onClick={copyDomain}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 font-bold text-[10px] uppercase tracking-wider"
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <a 
                href="https://console.firebase.google.com/project/frenchmentor-8dbec/authentication/settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Open Firebase Console
                <ExternalLink size={14} />
              </a>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full py-4 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors underline decoration-slate-200 underline-offset-4"
            >
              I added it, try logging in again
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              {t.welcome}
            </h2>
            
            <p className="text-slate-500 mb-10 leading-relaxed">
              {t.loginDesc}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error.message}</span>
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 px-6 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>{t.loginBtn}</span>
            </button>
          </>
        )}

        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Powered by Gemini AI
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
